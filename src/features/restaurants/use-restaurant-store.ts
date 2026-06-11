"use client";

import { useCallback, useEffect, useState } from "react";
import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import type { MenuBanner, MenuCategory, MenuItem, Restaurant } from "@/types/menu";
import { createClient } from "@/lib/supabase/client";

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

function toRestaurant(
  restaurant: RestaurantRow,
  categories: CategoryRow[],
  products: ProductRow[],
  banners: BannerRow[],
): Restaurant {
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
        .map((product): MenuItem => ({
          id: product.id,
          name: product.name,
          description: product.description ?? "",
          price: {
            amount: product.price,
            currency: product.currency,
          },
          imageUrl: product.image_url ?? "",
          isAvailable: product.is_available,
          tags: product.tags,
        })),
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
    banners: banners
      .filter((banner) => banner.restaurant_id === restaurant.id)
      .sort((first, second) => first.sort_order - second.sort_order)
      .map((banner): MenuBanner => ({
        id: banner.id,
        title: banner.title,
        subtitle: banner.subtitle ?? "",
        imageUrl: banner.image_url,
      })),
    menu,
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

  const [restaurantsResult, categoriesResult, productsResult, bannersResult] = await Promise.all([
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
  ]);

  normalizeSupabaseError(restaurantsResult.error);
  normalizeSupabaseError(categoriesResult.error);
  normalizeSupabaseError(productsResult.error);
  normalizeSupabaseError(bannersResult.error);

  const restaurants = (restaurantsResult.data ?? []) as RestaurantRow[];
  const categories = (categoriesResult.data ?? []) as CategoryRow[];
  const products = (productsResult.data ?? []) as ProductRow[];
  const banners = (bannersResult.data ?? []) as BannerRow[];

  return restaurants.map((restaurant) => toRestaurant(restaurant, categories, products, banners));
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
    supabase.from("banners").delete().eq("restaurant_id", restaurantId),
    supabase.from("products").delete().eq("restaurant_id", restaurantId),
    supabase.from("categories").delete().eq("restaurant_id", restaurantId),
  ]);

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

    if (category.items.length) {
      const productsResult = await supabase.from("products").insert(
        category.items.map((item, productIndex) => ({
          restaurant_id: restaurantId,
          category_id: categoryResult.data.id,
          name: item.name,
          description: item.description,
          price: item.price.amount,
          currency: item.price.currency,
          image_url: item.imageUrl.trim() || null,
          tags: item.tags ?? [],
          is_available: item.isAvailable,
          sort_order: productIndex,
        })),
      );
      normalizeSupabaseError(productsResult.error);
    }
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

    await replaceRestaurantGraph(updater(currentRestaurant));
    return refreshRestaurants();
  }

  async function deleteRestaurant(restaurantId: string) {
    const supabase = createClient() as unknown as SupabaseClient;
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

export function useRestaurantBySlug(_initialRestaurants: Restaurant[], slug: string) {
  void _initialRestaurants;
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
  }, []);

  return {
    error,
    isLoading,
    restaurant: restaurants.find((restaurant) => restaurant.slug === slug) ?? null,
    restaurants,
  };
}
