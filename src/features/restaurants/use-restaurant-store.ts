"use client";

import { useCallback, useEffect, useState } from "react";
import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import type { AddonGroup, MenuBanner, MenuCategory, MenuItem, Restaurant, RestaurantPopup } from "@/types/menu";
import { createClient } from "@/lib/supabase/client";
import {
  ensureTrialSubscription,
  getLatestSubscription,
  isSubscriptionValid,
  isSubscriptionWritable,
  type Subscription,
} from "@/features/subscriptions/subscriptions";

const DEFAULT_IMAGE_URL =
  "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80";

type RestaurantRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  address: string;
  whatsapp_url: string;
  google_maps_url: string;
  theme: "light" | "dark" | null;
  is_active: boolean | null;
  user_id: string | null;
};

type CategoryRow = {
  id: string;
  restaurant_id: string;
  name: string;
  description: string | null;
  sort_order: number;
};

type ProductRow = {
  id: string;
  restaurant_id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number;
  currency: "COP" | "USD";
  image_url: string | null;
  tags: string[];
  is_available: boolean;
  is_featured: boolean | null;
  sort_order: number;
};

type BannerRow = {
  id: string;
  restaurant_id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  sort_order: number;
};

type AddonGroupRow = {
  id: string;
  restaurant_id: string;
  name: string;
  required: boolean;
  multiple: boolean;
  min_select: number;
  max_select: number | null;
};

type AddonOptionRow = {
  id: string;
  group_id: string;
  name: string;
  price: number;
  available: boolean;
  sort_order: number;
};

type ProductAddonGroupRow = {
  product_id: string;
  addon_group_id: string;
};

type RestaurantPopupRow = {
  id: string;
  restaurant_id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  button_text: string | null;
  button_url: string | null;
  is_active: boolean;
};

type SubscriptionRow = Subscription;

function toRestaurant(
  restaurant: RestaurantRow,
  categories: CategoryRow[],
  products: ProductRow[],
  banners: BannerRow[],
  addonGroups: AddonGroupRow[],
  addonOptions: AddonOptionRow[],
  productAddonGroups: ProductAddonGroupRow[],
  popups: RestaurantPopupRow[],
  subscriptions: SubscriptionRow[],
): Restaurant {
  const ownerSubscription = subscriptions.find(
    (subscription) => subscription.user_id === restaurant.user_id,
  );
  const restaurantAddonGroups: AddonGroup[] = addonGroups
    .filter((group) => group.restaurant_id === restaurant.id)
    .map((group) => ({
      id: group.id,
      name: group.name,
      required: group.required,
      multiple: group.multiple,
      minSelect: group.min_select,
      maxSelect: group.max_select,
      options: addonOptions
        .filter((option) => option.group_id === group.id)
        .sort((first, second) => first.sort_order - second.sort_order)
        .map((option) => ({
          id: option.id,
          name: option.name,
          price: {
            amount: option.price,
            currency: "COP",
          },
          available: option.available,
        })),
    }));

  const menu: MenuCategory[] = categories
    .filter((category) => category.restaurant_id === restaurant.id)
    .sort((first, second) => first.sort_order - second.sort_order)
    .map((category) => ({
      id: category.id,
      name: category.name,
      description: category.description ?? "",
      items: products
        .filter((product) => product.category_id === category.id)
        .sort((first, second) => first.sort_order - second.sort_order)
        .map((product): MenuItem => {
          const addonGroupIds = productAddonGroups
            .filter((assignment) => assignment.product_id === product.id)
            .map((assignment) => assignment.addon_group_id);

          return {
            id: product.id,
            name: product.name,
            description: product.description ?? "",
            price: {
              amount: product.price,
              currency: product.currency,
            },
            imageUrl: product.image_url ?? "",
            isAvailable: product.is_available,
            isFeatured: product.is_featured ?? false,
            addonGroupIds,
            addonGroups: restaurantAddonGroups.filter((group) => addonGroupIds.includes(group.id)),
            tags: product.tags,
          };
        }),
    }));

  return {
    id: restaurant.id,
    slug: restaurant.slug,
    name: restaurant.name,
    description: restaurant.description ?? "Menu digital del restaurante.",
    location: restaurant.address,
    address: restaurant.address,
    logoUrl: restaurant.logo_url ?? DEFAULT_IMAGE_URL,
    googleMapsUrl: restaurant.google_maps_url,
    whatsappUrl: restaurant.whatsapp_url,
    theme: restaurant.theme ?? "light",
    isActive: restaurant.is_active ?? true,
    canShowPublicMenu:
      (restaurant.is_active ?? true) && isSubscriptionValid(ownerSubscription ?? null),
    addonGroups: restaurantAddonGroups,
    banners: banners
      .filter((banner) => banner.restaurant_id === restaurant.id)
      .sort((first, second) => first.sort_order - second.sort_order)
      .map((banner): MenuBanner => ({
        id: banner.id,
        title: banner.title,
        subtitle: banner.subtitle ?? "",
        imageUrl: banner.image_url,
      })),
    popup: toRestaurantPopup(popups.find((popup) => popup.restaurant_id === restaurant.id) ?? null),
    menu,
  };
}

function toRestaurantPopup(popup: RestaurantPopupRow | null): RestaurantPopup | null {
  if (!popup) {
    return null;
  }

  return {
    id: popup.id,
    title: popup.title,
    description: popup.description ?? "",
    imageUrl: popup.image_url ?? "",
    buttonText: popup.button_text ?? "",
    buttonUrl: popup.button_url ?? "",
    isActive: popup.is_active,
  };
}

function toRestaurantInsert(restaurant: Restaurant) {
  return {
    slug: restaurant.slug,
    name: restaurant.name,
    description: restaurant.description,
    logo_url: restaurant.logoUrl,
    address: restaurant.address,
    whatsapp_url: restaurant.whatsappUrl,
    google_maps_url: restaurant.googleMapsUrl,
    theme: restaurant.theme,
    is_active: restaurant.isActive ?? true,
  };
}

function toRestaurantUpdate(restaurant: Restaurant) {
  return {
    slug: restaurant.slug,
    name: restaurant.name,
    description: restaurant.description,
    logo_url: restaurant.logoUrl,
    address: restaurant.address,
    whatsapp_url: restaurant.whatsappUrl,
    google_maps_url: restaurant.googleMapsUrl,
    theme: restaurant.theme,
    is_active: restaurant.isActive ?? true,
  };
}

function normalizeSupabaseError(error: PostgrestError | null) {
  if (error) {
    throw new Error(error.message);
  }
}

async function fetchRestaurantsFromSupabase(userId?: string) {
  const supabase = createClient() as unknown as SupabaseClient;

  let restaurantsQuery = supabase.from("restaurants").select("*").order("name", { ascending: true });

  if (userId) {
    restaurantsQuery = restaurantsQuery.eq("user_id", userId);
  }

  const [
    restaurantsResult,
    categoriesResult,
    productsResult,
    bannersResult,
    addonGroupsResult,
    addonOptionsResult,
    productAddonGroupsResult,
    popupsResult,
    subscriptionsResult,
  ] = await Promise.all([
    restaurantsQuery,
    supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    supabase.from("products").select("*").order("sort_order", { ascending: true }),
    supabase
      .from("banners")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    supabase.from("addon_groups").select("*").order("name", { ascending: true }),
    supabase.from("addon_options").select("*").order("sort_order", { ascending: true }),
    supabase.from("product_addon_groups").select("*"),
    supabase.from("restaurant_popups").select("*").order("is_active", { ascending: false }),
    supabase.from("subscriptions").select("*"),
  ]);

  normalizeSupabaseError(restaurantsResult.error);
  normalizeSupabaseError(categoriesResult.error);
  normalizeSupabaseError(productsResult.error);
  normalizeSupabaseError(bannersResult.error);
  normalizeSupabaseError(addonGroupsResult.error);
  normalizeSupabaseError(addonOptionsResult.error);
  normalizeSupabaseError(productAddonGroupsResult.error);
  normalizeSupabaseError(popupsResult.error);
  normalizeSupabaseError(subscriptionsResult.error);

  const restaurants = (restaurantsResult.data ?? []) as RestaurantRow[];
  const categories = (categoriesResult.data ?? []) as CategoryRow[];
  const products = (productsResult.data ?? []) as ProductRow[];
  const banners = (bannersResult.data ?? []) as BannerRow[];
  const addonGroups = (addonGroupsResult.data ?? []) as AddonGroupRow[];
  const addonOptions = (addonOptionsResult.data ?? []) as AddonOptionRow[];
  const productAddonGroups = (productAddonGroupsResult.data ?? []) as ProductAddonGroupRow[];
  const popups = (popupsResult.data ?? []) as RestaurantPopupRow[];
  const subscriptions = (subscriptionsResult.data ?? []) as SubscriptionRow[];

  return restaurants.map((restaurant) =>
    toRestaurant(
      restaurant,
      categories,
      products,
      banners,
      addonGroups,
      addonOptions,
      productAddonGroups,
      popups,
      subscriptions,
    ),
  );
}

async function replaceRestaurantGraph(restaurant: Restaurant, userId?: string) {
  const supabase = createClient() as unknown as SupabaseClient;
  const isExistingRestaurant = Boolean(restaurant.id);

  const restaurantResult = isExistingRestaurant
    ? await supabase
        .from("restaurants")
        .update(toRestaurantUpdate(restaurant))
        .eq("id", restaurant.id)
        .select("id")
        .single()
    : await supabase
        .from("restaurants")
        .insert({ ...toRestaurantInsert(restaurant), user_id: userId })
        .select("id")
        .single();

  normalizeSupabaseError(restaurantResult.error);

  if (!restaurantResult.data) {
    throw new Error("Supabase no devolvio el restaurante guardado.");
  }

  const restaurantId = restaurantResult.data.id;

  await Promise.all([
    supabase.from("product_addon_groups").delete().eq("restaurant_id", restaurantId),
    supabase.from("addon_options").delete().eq("restaurant_id", restaurantId),
    supabase.from("addon_groups").delete().eq("restaurant_id", restaurantId),
    supabase.from("banners").delete().eq("restaurant_id", restaurantId),
    supabase.from("restaurant_popups").delete().eq("restaurant_id", restaurantId),
    supabase.from("products").delete().eq("restaurant_id", restaurantId),
    supabase.from("categories").delete().eq("restaurant_id", restaurantId),
  ]);

  const addonGroupIdMap = new Map<string, string>();

  for (const group of restaurant.addonGroups) {
    const groupResult = await supabase
      .from("addon_groups")
      .insert({
        restaurant_id: restaurantId,
        name: group.name,
        required: group.required,
        multiple: group.multiple,
        min_select: group.minSelect,
        max_select: group.maxSelect,
      })
      .select("id")
      .single();

    normalizeSupabaseError(groupResult.error);

    if (!groupResult.data) {
      throw new Error("Supabase no devolvio el grupo de adiciones guardado.");
    }

    addonGroupIdMap.set(group.id, groupResult.data.id);

    if (group.options.length) {
      const optionsResult = await supabase.from("addon_options").insert(
        group.options.map((option, optionIndex) => ({
          restaurant_id: restaurantId,
          group_id: groupResult.data.id,
          name: option.name,
          price: option.price.amount,
          available: option.available,
          sort_order: optionIndex,
        })),
      );
      normalizeSupabaseError(optionsResult.error);
    }
  }

  if (restaurant.banners.length) {
    const bannersResult = await supabase.from("banners").insert(
      restaurant.banners.map((banner, index) => ({
        restaurant_id: restaurantId,
        title: banner.title,
        subtitle: banner.subtitle,
        image_url: banner.imageUrl,
        sort_order: index,
        is_active: true,
      })),
    );
    normalizeSupabaseError(bannersResult.error);
  }

  if (restaurant.popup) {
    const popupResult = await supabase.from("restaurant_popups").insert({
      restaurant_id: restaurantId,
      title: restaurant.popup.title,
      description: restaurant.popup.description || null,
      image_url: restaurant.popup.imageUrl || null,
      button_text: restaurant.popup.buttonText || null,
      button_url: restaurant.popup.buttonUrl || null,
      is_active: restaurant.popup.isActive,
    });
    normalizeSupabaseError(popupResult.error);
  }

  for (const [categoryIndex, category] of restaurant.menu.entries()) {
    const categoryResult = await supabase
      .from("categories")
      .insert({
        restaurant_id: restaurantId,
        name: category.name,
        description: category.description ?? "",
        sort_order: categoryIndex,
        is_active: true,
      })
      .select("id")
      .single();

    normalizeSupabaseError(categoryResult.error);

    if (!categoryResult.data) {
      throw new Error("Supabase no devolvio la categoria guardada.");
    }

    for (const [productIndex, item] of category.items.entries()) {
      const productResult = await supabase
        .from("products")
        .insert({
          restaurant_id: restaurantId,
          category_id: categoryResult.data.id,
          name: item.name,
          description: item.description,
          price: item.price.amount,
          currency: item.price.currency,
          image_url: item.imageUrl.trim() || null,
          tags: item.tags ?? [],
          is_available: item.isAvailable,
          is_featured: item.isFeatured ?? false,
          sort_order: productIndex,
        })
        .select("id")
        .single();

      normalizeSupabaseError(productResult.error);

      if (!productResult.data) {
        throw new Error("Supabase no devolvio el producto guardado.");
      }

      const mappedAddonGroupIds = (item.addonGroupIds ?? [])
        .map((groupId) => addonGroupIdMap.get(groupId) ?? groupId)
        .filter(Boolean);

      if (mappedAddonGroupIds.length) {
        const assignmentResult = await supabase.from("product_addon_groups").insert(
          mappedAddonGroupIds.map((groupId) => ({
            restaurant_id: restaurantId,
            product_id: productResult.data.id,
            addon_group_id: groupId,
          })),
        );
        normalizeSupabaseError(assignmentResult.error);
      }
    }
  }
}

async function assertBranchLimit(userId: string) {
  const supabase = createClient() as unknown as SupabaseClient;
  const subscription = await ensureTrialSubscription(userId);
  if (!isSubscriptionWritable(subscription)) {
    throw new Error("Tu periodo de prueba expiro. Activa un plan para crear o editar restaurantes.");
  }

  const { count, error } = await supabase
    .from("restaurants")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  normalizeSupabaseError(error);

  if ((count ?? 0) >= subscription.branch_limit) {
    throw new Error(
      `Tu plan actual permite ${subscription.branch_limit} restaurante${
        subscription.branch_limit === 1 ? "" : "s"
      }. Actualiza tu plan para crear mas sucursales.`,
    );
  }
}

async function assertWritableSubscription(userId: string) {
  const subscription = await getLatestSubscription(userId);

  if (!isSubscriptionWritable(subscription)) {
    throw new Error("Tu periodo de prueba expiro. Activa un plan para crear o editar restaurantes.");
  }
}

export function useRestaurantsStore() {
  const [restaurants, setRestaurantsState] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshRestaurants = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const nextRestaurants = user ? await fetchRestaurantsFromSupabase(user.id) : [];
      setRestaurantsState(nextRestaurants);
      return nextRestaurants;
    } catch (currentError) {
      const message =
        currentError instanceof Error ? currentError.message : "No se pudieron cargar los restaurantes.";
      setError(message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshRestaurants();
  }, [refreshRestaurants]);

  async function setRestaurants(nextRestaurants: Restaurant[]) {
    const supabase = createClient() as unknown as SupabaseClient;
    const authClient = createClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();

    if (!user) {
      throw new Error("Debes iniciar sesion.");
    }

    await assertWritableSubscription(user.id);

    const restaurantsResult = await supabase.from("restaurants").select("id");
    normalizeSupabaseError(restaurantsResult.error);

    await Promise.all(
      ((restaurantsResult.data ?? []) as Array<{ id: string }>).map((restaurant) =>
        supabase.from("restaurants").delete().eq("id", restaurant.id).eq("user_id", user.id),
      ),
    );

    for (const restaurant of nextRestaurants) {
      await replaceRestaurantGraph({ ...restaurant, id: "" }, user.id);
    }

    return refreshRestaurants();
  }

  async function upsertRestaurant(nextRestaurant: Restaurant) {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Debes iniciar sesion.");
    }

    if (!nextRestaurant.id) {
      await assertBranchLimit(user.id);
    }

    await replaceRestaurantGraph(nextRestaurant, user.id);
    return refreshRestaurants();
  }

  async function updateRestaurant(
    restaurantId: string,
    updater: (restaurant: Restaurant) => Restaurant,
  ) {
    const currentRestaurant = restaurants.find((restaurant) => restaurant.id === restaurantId);

    if (!currentRestaurant) {
      throw new Error("Restaurante no encontrado.");
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Debes iniciar sesion.");
    }

    await assertWritableSubscription(user.id);
    await replaceRestaurantGraph(updater(currentRestaurant));
    return refreshRestaurants();
  }

  async function deleteRestaurant(restaurantId: string) {
    const supabase = createClient() as unknown as SupabaseClient;
    const authClient = createClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();

    if (!user) {
      throw new Error("Debes iniciar sesion.");
    }

    await assertWritableSubscription(user.id);
    const result = await supabase.from("restaurants").delete().eq("id", restaurantId);
    normalizeSupabaseError(result.error);
    return refreshRestaurants();
  }

  return {
    deleteRestaurant,
    error,
    isLoading,
    refreshRestaurants,
    restaurants,
    setRestaurants,
    upsertRestaurant,
    updateRestaurant,
  };
}

export function useRestaurantBySlug(
  initialRestaurants: Restaurant[],
  slug: string,
  options?: { source?: "local" | "supabase" },
) {
  const isLocalSource = options?.source === "local";
  const [restaurants, setRestaurants] = useState<Restaurant[]>(
    isLocalSource ? initialRestaurants : [],
  );
  const [isLoading, setIsLoading] = useState(!isLocalSource);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLocalSource) {
      setRestaurants(initialRestaurants);
      setIsLoading(false);
      setError(null);
      return;
    }

    async function loadRestaurants() {
      setIsLoading(true);
      setError(null);

      try {
        setRestaurants(await fetchRestaurantsFromSupabase());
      } catch (currentError) {
        setError(
          currentError instanceof Error ? currentError.message : "No se pudo cargar el restaurante.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadRestaurants();
  }, [initialRestaurants, isLocalSource]);

  return {
    error,
    isLoading,
    restaurant: restaurants.find((restaurant) => restaurant.slug === slug) ?? null,
    restaurants,
  };
}
