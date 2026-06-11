"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  ExternalLink,
  ImagePlus,
  LogOut,
  Pencil,
  Plus,
  Save,
  Search,
  Trash2,
} from "lucide-react";
import type { AddonGroup, AddonOption, MenuBanner, MenuCategory, MenuItem, Restaurant } from "@/types/menu";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { formatMoney } from "@/features/menus/format-money";
import { logout, useAuth } from "@/features/auth/use-auth";
import { useRestaurantsStore } from "@/features/restaurants/use-restaurant-store";
import { uploadMenuImage } from "@/lib/supabase/storage";
import { extractColombianMobile, isValidColombianMobile } from "@/lib/whatsapp";

type AdminDashboardProps = {
  initialRestaurants: Restaurant[];
};

type RestaurantForm = Pick<
  Restaurant,
  "slug" | "name" | "address" | "googleMapsUrl" | "whatsappUrl" | "logoUrl" | "theme"
>;

type CategoryForm = {
  id?: string;
  name: string;
  description: string;
};

type ProductForm = {
  id?: string;
  categoryId: string;
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  tags: string;
  isAvailable: boolean;
  addonGroupIds: string[];
};

type AddonGroupForm = {
  id?: string;
  name: string;
  required: boolean;
  multiple: boolean;
  minSelect: string;
  maxSelect: string;
};

type AddonOptionForm = {
  groupId: string;
  id?: string;
  name: string;
  price: string;
  available: boolean;
};

type BannerForm = {
  id?: string;
  title: string;
  subtitle: string;
  imageUrl: string;
};

type Toast = {
  id: string;
  message: string;
  type: "success" | "error";
};

type FormErrors<T extends string> = Partial<Record<T, string>>;

const emptyCategoryForm: CategoryForm = {
  name: "",
  description: "",
};

const emptyProductForm: ProductForm = {
  categoryId: "",
  name: "",
  description: "",
  price: "",
  imageUrl: "",
  tags: "",
  isAvailable: true,
  addonGroupIds: [],
};

const emptyAddonGroupForm: AddonGroupForm = {
  name: "",
  required: false,
  multiple: true,
  minSelect: "0",
  maxSelect: "",
};

const emptyAddonOptionForm: AddonOptionForm = {
  groupId: "",
  name: "",
  price: "",
  available: true,
};

const emptyBannerForm: BannerForm = {
  title: "",
  subtitle: "",
  imageUrl: "",
};

const emptyRestaurant: Restaurant = {
  id: "",
  slug: "",
  name: "",
  description: "",
  location: "",
  address: "",
  logoUrl: "",
  googleMapsUrl: "",
  whatsappUrl: "",
  theme: "light",
  banners: [],
  addonGroups: [],
  menu: [],
};

function createId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}_${Date.now()}`;
}

function Field({
  error,
  label,
  required,
  children,
}: {
  error?: string;
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-ink">
      <span>
        {label} {required ? <span className="text-red-600">*</span> : null}
      </span>
      {children}
      {error ? <span className="text-xs font-medium text-red-600">{error}</span> : null}
    </label>
  );
}

const inputClass =
  "min-h-11 w-full rounded-md border border-ink/15 bg-white px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

const textareaClass =
  "min-h-24 w-full rounded-md border border-ink/15 bg-white px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

function delay(ms = 350) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export function AdminDashboard({ initialRestaurants }: AdminDashboardProps) {
  const { session } = useAuth();
  const {
    deleteRestaurant,
    error: restaurantsError,
    isLoading: isLoadingRestaurants,
    restaurants,
    updateRestaurant: updateRestaurantInStore,
    upsertRestaurant,
  } = useRestaurantsStore();
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(initialRestaurants[0]?.id ?? "");
  const [isCreatingRestaurant, setIsCreatingRestaurant] = useState(false);
  const selectedRestaurant = restaurants.find(
    (currentRestaurant) => currentRestaurant.id === selectedRestaurantId,
  );
  const restaurant = isCreatingRestaurant ? emptyRestaurant : (selectedRestaurant ?? emptyRestaurant);
  const isRestaurantCreateMode = isCreatingRestaurant || !selectedRestaurant;
  const [restaurantForm, setRestaurantForm] = useStateFromRestaurant(restaurant);
  const [categoryForm, setCategoryForm] = useState(emptyCategoryForm);
  const [productForm, setProductForm] = useState<ProductForm>({
    ...emptyProductForm,
    categoryId: restaurant.menu[0]?.id ?? "",
  });
  const [addonGroupForm, setAddonGroupForm] = useState(emptyAddonGroupForm);
  const [addonOptionForm, setAddonOptionForm] = useState(emptyAddonOptionForm);
  const [bannerForm, setBannerForm] = useState(emptyBannerForm);
  const [restaurantErrors, setRestaurantErrors] = useState<FormErrors<keyof RestaurantForm>>({});
  const [categoryErrors, setCategoryErrors] = useState<FormErrors<"name">>({});
  const [productErrors, setProductErrors] = useState<FormErrors<"categoryId" | "name" | "price">>(
    {},
  );
  const [bannerErrors, setBannerErrors] = useState<FormErrors<"title" | "imageUrl">>({});
  const [addonGroupErrors, setAddonGroupErrors] =
    useState<FormErrors<"name" | "minSelect" | "maxSelect">>({});
  const [addonOptionErrors, setAddonOptionErrors] =
    useState<FormErrors<"groupId" | "name" | "price">>({});
  const [savingTarget, setSavingTarget] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState("all");
  const [restaurantToDelete, setRestaurantToDelete] = useState<Restaurant | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  function updateRestaurant(updater: (restaurant: Restaurant) => Restaurant) {
    return updateRestaurantInStore(restaurant.id, updater);
  }

  useEffect(() => {
    if (!restaurants.length) {
      setSelectedRestaurantId("");
      setIsCreatingRestaurant(true);
      return;
    }

    if (
      !selectedRestaurantId ||
      !restaurants.some((currentRestaurant) => currentRestaurant.id === selectedRestaurantId)
    ) {
      setSelectedRestaurantId(restaurants[0].id);
      setIsCreatingRestaurant(false);
    }
  }, [restaurants, selectedRestaurantId]);

  const totalProducts = restaurant.menu.reduce((total, category) => total + category.items.length, 0);
  const availableProducts = restaurant.menu.reduce(
    (total, category) => total + category.items.filter((item) => item.isAvailable).length,
    0,
  );
  const filteredMenu = restaurant.menu
    .filter((category) => productCategoryFilter === "all" || category.id === productCategoryFilter)
    .map((category) => ({
      ...category,
      items: category.items.filter((item) => {
        const query = productSearch.trim().toLowerCase();

        if (!query) {
          return true;
        }

        return [item.name, item.description, category.name, ...(item.tags ?? [])]
          .join(" ")
          .toLowerCase()
          .includes(query);
      }),
    }));

  function showToast(message: string, type: Toast["type"] = "success") {
    const id = createId("toast");
    setToasts((currentToasts) => [...currentToasts, { id, message, type }]);

    window.setTimeout(() => {
      setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id));
    }, 3200);
  }

  async function withSaving(
    target: string,
    action: () => void | Promise<unknown>,
    successMessage: string,
  ) {
    setSavingTarget(target);

    try {
      await delay();
      await action();
      showToast(successMessage, "success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "No se pudo guardar. Intentalo de nuevo.", "error");
    } finally {
      setSavingTarget(null);
    }
  }

  useEffect(() => {
    if (!restaurant.menu.length) {
      setProductForm((currentForm) => ({ ...currentForm, categoryId: "" }));
      return;
    }

    if (!restaurant.menu.some((category) => category.id === productForm.categoryId)) {
      setProductForm((currentForm) => ({
        ...currentForm,
        categoryId: restaurant.menu[0]?.id ?? "",
      }));
    }
  }, [productForm.categoryId, restaurant.menu]);

  function saveRestaurantInfo() {
    const errors: FormErrors<keyof RestaurantForm> = {};
    const slug = restaurantForm.slug.trim().toLowerCase();

    if (!slug) {
      errors.slug = "El slug es obligatorio.";
    }

    if (slug && !/^[a-z0-9-]+$/.test(slug)) {
      errors.slug = "Usa solo minusculas, numeros y guiones.";
    }

    if (
      restaurants.some(
        (currentRestaurant) =>
          currentRestaurant.slug === slug &&
          (isRestaurantCreateMode || currentRestaurant.id !== restaurant.id),
      )
    ) {
      errors.slug = "Este slug ya esta en uso.";
    }

    if (!restaurantForm.name.trim()) {
      errors.name = "El nombre es obligatorio.";
    }

    if (!restaurantForm.address.trim()) {
      errors.address = "La direccion es obligatoria.";
    }

    if (!restaurantForm.googleMapsUrl.trim()) {
      errors.googleMapsUrl = "La URL de Google Maps es obligatoria.";
    }

    const whatsappNumber = restaurantForm.whatsappUrl.trim();

    if (!whatsappNumber) {
      errors.whatsappUrl = "El WhatsApp es obligatorio.";
    }

    if (whatsappNumber && !/^\d+$/.test(whatsappNumber)) {
      errors.whatsappUrl = "Ingresa solo numeros. No incluyas +57, espacios ni enlaces.";
    }

    if (whatsappNumber && !isValidColombianMobile(whatsappNumber)) {
      errors.whatsappUrl = "El numero debe tener 10 digitos y empezar por 3.";
    }

    if (!restaurantForm.logoUrl.trim()) {
      errors.logoUrl = "La URL del logo es obligatoria.";
    }

    setRestaurantErrors(errors);

    if (Object.keys(errors).length) {
      showToast("Revisa los campos obligatorios del restaurante.", "error");
      return;
    }

    withSaving(
      "restaurant",
      async () => {
        if (isRestaurantCreateMode) {
          const nextRestaurant: Restaurant = {
            id: "",
            slug,
            name: restaurantForm.name.trim(),
            description: "Menu digital del restaurante.",
            location: restaurantForm.address.trim(),
            address: restaurantForm.address.trim(),
            logoUrl: restaurantForm.logoUrl.trim(),
            googleMapsUrl: restaurantForm.googleMapsUrl.trim(),
            whatsappUrl: whatsappNumber,
            theme: restaurantForm.theme,
            banners: [],
            addonGroups: [],
            menu: [],
          };

          const nextRestaurants = await upsertRestaurant(nextRestaurant);
          const savedRestaurant = nextRestaurants.find(
            (currentRestaurant) => currentRestaurant.slug === nextRestaurant.slug,
          );
          setSelectedRestaurantId(savedRestaurant?.id ?? "");
          setIsCreatingRestaurant(false);
          return;
        }

        return updateRestaurant((currentRestaurant) => ({
          ...currentRestaurant,
          ...restaurantForm,
          slug,
          name: restaurantForm.name.trim(),
          address: restaurantForm.address.trim(),
          location: restaurantForm.address.trim(),
          googleMapsUrl: restaurantForm.googleMapsUrl.trim(),
          whatsappUrl: whatsappNumber,
          logoUrl: restaurantForm.logoUrl.trim(),
          theme: restaurantForm.theme,
        }));
      },
      isRestaurantCreateMode ? "Restaurante creado." : "Cambios guardados.",
    );
  }

  async function confirmDeleteRestaurant() {
    if (!restaurantToDelete || deleteConfirmation !== "BORRAR") {
      return;
    }

    setSavingTarget("delete-restaurant");

    try {
      const nextRestaurants = await deleteRestaurant(restaurantToDelete.id);
      const nextSelectedRestaurant = nextRestaurants.find(
        (currentRestaurant) => currentRestaurant.id !== restaurantToDelete.id,
      );

      setSelectedRestaurantId(nextSelectedRestaurant?.id ?? "");
      setIsCreatingRestaurant(true);
      setRestaurantForm({
        slug: "",
        name: "",
        address: "",
        googleMapsUrl: "",
        whatsappUrl: "",
        logoUrl: "",
        theme: "light",
      });
      setRestaurantToDelete(null);
      setDeleteConfirmation("");
      showToast("Restaurante eliminado.", "success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "No se pudo eliminar el restaurante.", "error");
    } finally {
      setSavingTarget(null);
    }
  }

  function saveCategory() {
    const name = categoryForm.name.trim();
    const errors: FormErrors<"name"> = {};

    if (!name) {
      errors.name = "El nombre de la categoria es obligatorio.";
      setCategoryErrors(errors);
      showToast("Completa el nombre de la categoria.", "error");
      return;
    }

    setCategoryErrors({});

    withSaving(
      "category",
      () => {
        const promise = updateRestaurant((currentRestaurant) => {
          if (categoryForm.id) {
            return {
              ...currentRestaurant,
              menu: currentRestaurant.menu.map((category) =>
                category.id === categoryForm.id
                  ? { ...category, name, description: categoryForm.description.trim() }
                  : category,
              ),
            };
          }

          return {
            ...currentRestaurant,
            menu: [
              ...currentRestaurant.menu,
              {
                id: createId("cat"),
                name,
                description: categoryForm.description.trim(),
                items: [],
              },
            ],
          };
        });

        setCategoryForm(emptyCategoryForm);
        return promise;
      },
      categoryForm.id ? "Categoria actualizada." : "Categoria creada.",
    );
  }

  function editCategory(category: MenuCategory) {
    setCategoryErrors({});
    setCategoryForm({
      id: category.id,
      name: category.name,
      description: category.description ?? "",
    });
  }

  async function deleteCategory(categoryId: string) {
    const category = restaurant.menu.find((currentCategory) => currentCategory.id === categoryId);

    if (!window.confirm(`Eliminar la categoria "${category?.name ?? "seleccionada"}" y sus productos?`)) {
      return;
    }

    try {
      await updateRestaurant((currentRestaurant) => ({
        ...currentRestaurant,
        menu: currentRestaurant.menu.filter((category) => category.id !== categoryId),
      }));

      if (productForm.categoryId === categoryId) {
        const nextCategoryId = restaurant.menu.find((category) => category.id !== categoryId)?.id ?? "";
        setProductForm({ ...productForm, categoryId: nextCategoryId });
      }

      showToast("Categoria eliminada.", "success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "No se pudo eliminar la categoria.", "error");
    }
  }

  function saveProduct() {
    const categoryId = productForm.categoryId || restaurant.menu[0]?.id;
    const errors: FormErrors<"categoryId" | "name" | "price"> = {};

    if (!categoryId) {
      errors.categoryId = "Selecciona una categoria.";
    }

    if (!productForm.name.trim()) {
      errors.name = "El nombre del producto es obligatorio.";
    }

    if (!productForm.price || Number(productForm.price) <= 0) {
      errors.price = "Ingresa un precio mayor a cero.";
    }

    setProductErrors(errors);

    if (Object.keys(errors).length) {
      showToast("Revisa los campos obligatorios del producto.", "error");
      return;
    }

    const nextProduct: MenuItem = {
      id: productForm.id ?? createId("item"),
      name: productForm.name.trim(),
      description: productForm.description.trim(),
      price: {
        amount: Number(productForm.price) || 0,
        currency: "COP",
      },
      imageUrl: productForm.imageUrl.trim(),
      isAvailable: productForm.isAvailable,
      addonGroupIds: productForm.addonGroupIds,
      addonGroups: restaurant.addonGroups.filter((group) => productForm.addonGroupIds.includes(group.id)),
      tags: productForm.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    };

    withSaving(
      "product",
      () => {
        const promise = updateRestaurant((currentRestaurant) => ({
          ...currentRestaurant,
          menu: currentRestaurant.menu.map((category) => {
            const itemsWithoutCurrent = category.items.filter((item) => item.id !== nextProduct.id);

            if (category.id !== categoryId) {
              return {
                ...category,
                items: itemsWithoutCurrent,
              };
            }

            return {
              ...category,
              items: productForm.id
                ? [...itemsWithoutCurrent, nextProduct]
                : [...category.items, nextProduct],
            };
          }),
        }));

        setProductForm({
          ...emptyProductForm,
          categoryId,
        });
        return promise;
      },
      productForm.id ? "Producto actualizado." : "Producto creado.",
    );
  }

  function editProduct(item: MenuItem, categoryId: string) {
    setProductErrors({});
    setProductForm({
      id: item.id,
      categoryId,
      name: item.name,
      description: item.description,
      price: String(item.price.amount),
      imageUrl: item.imageUrl,
      isAvailable: item.isAvailable,
      addonGroupIds: item.addonGroupIds ?? [],
      tags: item.tags?.join(", ") ?? "",
    });
  }

  async function selectProductImage(file: File | undefined) {
    if (!file) {
      return;
    }

    setSavingTarget("product-image");

    try {
      const publicUrl = await uploadMenuImage(file, `${restaurant.slug || "restaurant"}/products`);
      setProductForm((currentForm) => ({
        ...currentForm,
        imageUrl: publicUrl,
      }));
      showToast("Imagen de producto subida.", "success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "No se pudo subir la imagen.", "error");
    } finally {
      setSavingTarget(null);
    }
  }

  async function selectLogoImage(file: File | undefined) {
    if (!file) {
      return;
    }

    setSavingTarget("logo-image");

    try {
      const publicUrl = await uploadMenuImage(
        file,
        `${restaurantForm.slug || restaurant.slug || "restaurant"}/logo`,
      );
      setRestaurantErrors((currentErrors) => ({ ...currentErrors, logoUrl: undefined }));
      setRestaurantForm((currentForm) => ({
        ...currentForm,
        logoUrl: publicUrl,
      }));
      showToast("Logo subido.", "success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "No se pudo subir el logo.", "error");
    } finally {
      setSavingTarget(null);
    }
  }

  async function selectBannerImage(file: File | undefined) {
    if (!file) {
      return;
    }

    setSavingTarget("banner-image");

    try {
      const publicUrl = await uploadMenuImage(file, `${restaurant.slug || "restaurant"}/banners`);
      setBannerErrors((currentErrors) => ({ ...currentErrors, imageUrl: undefined }));
      setBannerForm((currentForm) => ({
        ...currentForm,
        imageUrl: publicUrl,
      }));
      showToast("Imagen de banner subida.", "success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "No se pudo subir el banner.", "error");
    } finally {
      setSavingTarget(null);
    }
  }

  async function deleteProduct(itemId: string) {
    const item = restaurant.menu.flatMap((category) => category.items).find((product) => product.id === itemId);

    if (!window.confirm(`Eliminar el producto "${item?.name ?? "seleccionado"}"?`)) {
      return;
    }

    try {
      await updateRestaurant((currentRestaurant) => ({
        ...currentRestaurant,
        menu: currentRestaurant.menu.map((category) => ({
          ...category,
          items: category.items.filter((item) => item.id !== itemId),
        })),
      }));
      showToast("Producto eliminado.", "success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "No se pudo eliminar el producto.", "error");
    }
  }

  async function toggleAvailability(itemId: string) {
    try {
      await updateRestaurant((currentRestaurant) => ({
        ...currentRestaurant,
        menu: currentRestaurant.menu.map((category) => ({
          ...category,
          items: category.items.map((item) =>
            item.id === itemId ? { ...item, isAvailable: !item.isAvailable } : item,
          ),
        })),
      }));
      showToast("Disponibilidad actualizada.", "success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "No se pudo actualizar el producto.", "error");
    }
  }

  function saveAddonGroup() {
    const errors: FormErrors<"name" | "minSelect" | "maxSelect"> = {};
    const name = addonGroupForm.name.trim();
    const minSelect = Number(addonGroupForm.minSelect || 0);
    const maxSelect = addonGroupForm.maxSelect ? Number(addonGroupForm.maxSelect) : null;

    if (!name) {
      errors.name = "El nombre del grupo es obligatorio.";
    }

    if (Number.isNaN(minSelect) || minSelect < 0) {
      errors.minSelect = "Minimo debe ser cero o mayor.";
    }

    if (maxSelect !== null && (Number.isNaN(maxSelect) || maxSelect < minSelect)) {
      errors.maxSelect = "Maximo debe ser mayor o igual al minimo.";
    }

    setAddonGroupErrors(errors);

    if (Object.keys(errors).length) {
      showToast("Revisa los campos del grupo de adiciones.", "error");
      return;
    }

    const nextGroup: AddonGroup = {
      id: addonGroupForm.id ?? createId("addon-group"),
      name,
      required: addonGroupForm.required,
      multiple: addonGroupForm.multiple,
      minSelect,
      maxSelect,
      options: addonGroupForm.id
        ? restaurant.addonGroups.find((group) => group.id === addonGroupForm.id)?.options ?? []
        : [],
    };

    withSaving(
      "addon-group",
      () => {
        const promise = updateRestaurant((currentRestaurant) => ({
          ...currentRestaurant,
          addonGroups: addonGroupForm.id
            ? currentRestaurant.addonGroups.map((group) =>
                group.id === addonGroupForm.id ? nextGroup : group,
              )
            : [...currentRestaurant.addonGroups, nextGroup],
        }));

        setAddonGroupForm(emptyAddonGroupForm);
        return promise;
      },
      addonGroupForm.id ? "Grupo actualizado." : "Grupo creado.",
    );
  }

  function editAddonGroup(group: AddonGroup) {
    setAddonGroupErrors({});
    setAddonGroupForm({
      id: group.id,
      name: group.name,
      required: group.required,
      multiple: group.multiple,
      minSelect: String(group.minSelect),
      maxSelect: group.maxSelect === null ? "" : String(group.maxSelect),
    });
  }

  async function deleteAddonGroup(groupId: string) {
    const group = restaurant.addonGroups.find((currentGroup) => currentGroup.id === groupId);

    if (!window.confirm(`Eliminar el grupo "${group?.name ?? "seleccionado"}"?`)) {
      return;
    }

    try {
      await updateRestaurant((currentRestaurant) => ({
        ...currentRestaurant,
        addonGroups: currentRestaurant.addonGroups.filter((currentGroup) => currentGroup.id !== groupId),
        menu: currentRestaurant.menu.map((category) => ({
          ...category,
          items: category.items.map((item) => ({
            ...item,
            addonGroupIds: (item.addonGroupIds ?? []).filter((currentGroupId) => currentGroupId !== groupId),
          })),
        })),
      }));
      setProductForm((currentForm) => ({
        ...currentForm,
        addonGroupIds: currentForm.addonGroupIds.filter((currentGroupId) => currentGroupId !== groupId),
      }));
      showToast("Grupo eliminado.", "success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "No se pudo eliminar el grupo.", "error");
    }
  }

  function saveAddonOption() {
    const errors: FormErrors<"groupId" | "name" | "price"> = {};
    const name = addonOptionForm.name.trim();
    const price = Number(addonOptionForm.price || 0);

    if (!addonOptionForm.groupId) {
      errors.groupId = "Selecciona un grupo.";
    }

    if (!name) {
      errors.name = "El nombre de la opcion es obligatorio.";
    }

    if (Number.isNaN(price) || price < 0) {
      errors.price = "El precio debe ser cero o mayor.";
    }

    setAddonOptionErrors(errors);

    if (Object.keys(errors).length) {
      showToast("Revisa los campos de la opcion.", "error");
      return;
    }

    const nextOption: AddonOption = {
      id: addonOptionForm.id ?? createId("addon-option"),
      name,
      price: {
        amount: price,
        currency: "COP",
      },
      available: addonOptionForm.available,
    };

    withSaving(
      "addon-option",
      () => {
        const promise = updateRestaurant((currentRestaurant) => ({
          ...currentRestaurant,
          addonGroups: currentRestaurant.addonGroups.map((group) => {
            if (group.id !== addonOptionForm.groupId) {
              return group;
            }

            return {
              ...group,
              options: addonOptionForm.id
                ? group.options.map((option) =>
                    option.id === addonOptionForm.id ? nextOption : option,
                  )
                : [...group.options, nextOption],
            };
          }),
        }));

        setAddonOptionForm({ ...emptyAddonOptionForm, groupId: addonOptionForm.groupId });
        return promise;
      },
      addonOptionForm.id ? "Opcion actualizada." : "Opcion creada.",
    );
  }

  function editAddonOption(groupId: string, option: AddonOption) {
    setAddonOptionErrors({});
    setAddonOptionForm({
      groupId,
      id: option.id,
      name: option.name,
      price: String(option.price.amount),
      available: option.available,
    });
  }

  async function deleteAddonOption(groupId: string, optionId: string) {
    if (!window.confirm("Eliminar esta opcion de adicion?")) {
      return;
    }

    try {
      await updateRestaurant((currentRestaurant) => ({
        ...currentRestaurant,
        addonGroups: currentRestaurant.addonGroups.map((group) =>
          group.id === groupId
            ? { ...group, options: group.options.filter((option) => option.id !== optionId) }
            : group,
        ),
      }));
      showToast("Opcion eliminada.", "success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "No se pudo eliminar la opcion.", "error");
    }
  }

  function toggleProductAddonGroup(groupId: string) {
    setProductForm((currentForm) => ({
      ...currentForm,
      addonGroupIds: currentForm.addonGroupIds.includes(groupId)
        ? currentForm.addonGroupIds.filter((currentGroupId) => currentGroupId !== groupId)
        : [...currentForm.addonGroupIds, groupId],
    }));
  }

  function saveBanner() {
    const errors: FormErrors<"title" | "imageUrl"> = {};

    if (!bannerForm.title.trim()) {
      errors.title = "El titulo del banner es obligatorio.";
    }

    if (!bannerForm.imageUrl.trim()) {
      errors.imageUrl = "La imagen del banner es obligatoria.";
    }

    setBannerErrors(errors);

    if (Object.keys(errors).length) {
      showToast("Revisa los campos obligatorios del banner.", "error");
      return;
    }

    const nextBanner: MenuBanner = {
      id: bannerForm.id ?? createId("banner"),
      title: bannerForm.title.trim(),
      subtitle: bannerForm.subtitle.trim(),
      imageUrl: bannerForm.imageUrl.trim(),
    };

    withSaving(
      "banner",
      () => {
        const promise = updateRestaurant((currentRestaurant) => ({
          ...currentRestaurant,
          banners: bannerForm.id
            ? currentRestaurant.banners.map((banner) =>
                banner.id === bannerForm.id ? nextBanner : banner,
              )
            : [...currentRestaurant.banners, nextBanner],
        }));

        setBannerForm(emptyBannerForm);
        return promise;
      },
      bannerForm.id ? "Banner actualizado." : "Banner creado.",
    );
  }

  function editBanner(banner: MenuBanner) {
    setBannerErrors({});
    setBannerForm(banner);
  }

  async function deleteBanner(bannerId: string) {
    const banner = restaurant.banners.find((currentBanner) => currentBanner.id === bannerId);

    if (!window.confirm(`Eliminar el banner "${banner?.title ?? "seleccionado"}"?`)) {
      return;
    }

    try {
      await updateRestaurant((currentRestaurant) => ({
        ...currentRestaurant,
        banners: currentRestaurant.banners.filter((banner) => banner.id !== bannerId),
      }));
      showToast("Banner eliminado.", "success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "No se pudo eliminar el banner.", "error");
    }
  }

  async function moveBanner(bannerId: string, direction: -1 | 1) {
    try {
      await updateRestaurant((currentRestaurant) => {
        const currentIndex = currentRestaurant.banners.findIndex((banner) => banner.id === bannerId);
        const nextIndex = currentIndex + direction;

        if (currentIndex < 0 || nextIndex < 0 || nextIndex >= currentRestaurant.banners.length) {
          return currentRestaurant;
        }

        const banners = [...currentRestaurant.banners];
        const [banner] = banners.splice(currentIndex, 1);
        banners.splice(nextIndex, 0, banner);

        return {
          ...currentRestaurant,
          banners,
        };
      });
      showToast("Orden de banners actualizado.", "success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "No se pudo ordenar el banner.", "error");
    }
  }

  return (
    <main className="min-h-screen bg-brand-50">
      <header className="sticky top-0 z-30 border-b border-ink/10 bg-white/95 backdrop-blur">
        <Container className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-600">
              Panel administrativo
            </p>
            <h1 className="text-2xl font-bold">
              {isRestaurantCreateMode ? "Nuevo restaurante" : restaurant.name}
            </h1>
            {session ? <p className="text-sm text-ink/55">{session.email}</p> : null}
          </div>
          <div className="grid gap-2 sm:grid-cols-[220px_auto_auto_auto] sm:items-center">
            <select
              className={inputClass}
              disabled={!restaurants.length}
              value={selectedRestaurantId}
              onChange={(event) => {
                setSelectedRestaurantId(event.target.value);
                setIsCreatingRestaurant(false);
              }}
            >
              {restaurants.map((currentRestaurant) => (
                <option key={currentRestaurant.id} value={currentRestaurant.id}>
                  {currentRestaurant.name}
                </option>
              ))}
            </select>
            <Button asChild variant="outline">
              <Link href={`/${restaurant.slug}/menu`}>
                Ver menu <ExternalLink className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              onClick={() => {
                setRestaurantForm({
                  slug: "",
                  name: "",
                  address: "",
                  googleMapsUrl: "",
                  whatsappUrl: "",
                  logoUrl: "",
                  theme: "light",
                });
                setIsCreatingRestaurant(true);
              }}
              variant="outline"
            >
              <Plus className="h-4 w-4" /> Restaurante
            </Button>
            <Button
              onClick={async () => {
                await logout();
              }}
              variant="outline"
            >
              <LogOut className="h-4 w-4" /> Salir
            </Button>
          </div>
        </Container>
      </header>

      <Container className="grid gap-6 py-6">
        {isLoadingRestaurants ? (
          <section className="rounded-lg border border-ink/10 bg-white p-5 text-sm font-semibold text-ink/60">
            Cargando datos desde Supabase...
          </section>
        ) : null}
        {restaurantsError ? (
          <section className="rounded-lg border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700">
            {restaurantsError}
          </section>
        ) : null}

        <section className="grid gap-3 rounded-lg border border-ink/10 bg-white p-4 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <p className="text-sm font-semibold text-ink/60">Restaurante activo</p>
            <p className="font-bold">/{restaurant.slug}/menu</p>
          </div>
          <Button
            disabled={isRestaurantCreateMode}
            onClick={() => {
              setRestaurantToDelete(restaurant);
              setDeleteConfirmation("");
            }}
            variant="outline"
          >
            <Trash2 className="h-4 w-4" /> Eliminar restaurante
          </Button>
        </section>

        {!isRestaurantCreateMode ? (
          <section className="grid gap-3 sm:grid-cols-3">
            <Metric label="Categorias" value={restaurant.menu.length} />
            <Metric label="Productos" value={totalProducts} />
            <Metric label="Disponibles" value={availableProducts} />
          </section>
        ) : null}

        <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="grid content-start gap-6">
            <Panel
              title={isRestaurantCreateMode ? "Crear restaurante" : "Editar restaurante"}
            >
              <div className="grid gap-4">
                <Field error={restaurantErrors.slug} label="Slug" required>
                  <input
                    className={inputClass}
                    placeholder="hangar"
                    value={restaurantForm.slug}
                    onChange={(event) =>
                      setRestaurantForm({ ...restaurantForm, slug: event.target.value })
                    }
                  />
                </Field>
                <Field error={restaurantErrors.name} label="Nombre" required>
                  <input
                    className={inputClass}
                    value={restaurantForm.name}
                    onChange={(event) =>
                      setRestaurantForm({ ...restaurantForm, name: event.target.value })
                    }
                  />
                </Field>
                <Field error={restaurantErrors.address} label="Direccion" required>
                  <input
                    className={inputClass}
                    value={restaurantForm.address}
                    onChange={(event) =>
                      setRestaurantForm({ ...restaurantForm, address: event.target.value })
                    }
                  />
                </Field>
                <Field error={restaurantErrors.googleMapsUrl} label="Google Maps URL" required>
                  <input
                    className={inputClass}
                    value={restaurantForm.googleMapsUrl}
                    onChange={(event) =>
                      setRestaurantForm({ ...restaurantForm, googleMapsUrl: event.target.value })
                    }
                  />
                </Field>
                <Field error={restaurantErrors.whatsappUrl} label="WhatsApp" required>
                  <input
                    className={inputClass}
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="3001234567"
                    value={restaurantForm.whatsappUrl}
                    onChange={(event) =>
                      setRestaurantForm({
                        ...restaurantForm,
                        whatsappUrl: event.target.value.replace(/\D/g, "").slice(0, 10),
                      })
                    }
                  />
                  <span className="text-xs font-normal leading-5 text-ink/55">
                    Ingresa solo el numero celular colombiano. No incluyas +57, espacios ni enlaces.
                  </span>
                </Field>
                <Field label="Estilo del menu">
                  <select
                    className={inputClass}
                    value={restaurantForm.theme}
                    onChange={(event) =>
                      setRestaurantForm({
                        ...restaurantForm,
                        theme: event.target.value === "dark" ? "dark" : "light",
                      })
                    }
                  >
                    <option value="light">Claro</option>
                    <option value="dark">Oscuro</option>
                  </select>
                </Field>
                <Field error={restaurantErrors.logoUrl} label="Logo URL" required>
                  <input
                    className={inputClass}
                    value={restaurantForm.logoUrl}
                    onChange={(event) =>
                      setRestaurantForm({ ...restaurantForm, logoUrl: event.target.value })
                    }
                  />
                  <label className="flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-ink/20 bg-white px-3 py-2 text-sm transition hover:border-brand-500 hover:bg-brand-50">
                    <ImagePlus className="h-4 w-4 text-brand-600" />
                    {savingTarget === "logo-image" ? "Subiendo logo..." : "Subir logo"}
                    <input
                      accept="image/*"
                      className="sr-only"
                      onChange={(event) => selectLogoImage(event.target.files?.[0])}
                      type="file"
                    />
                  </label>
                </Field>
                <Button disabled={savingTarget === "restaurant"} onClick={saveRestaurantInfo}>
                  <Save className="h-4 w-4" />
                  {savingTarget === "restaurant"
                    ? "Guardando..."
                    : isRestaurantCreateMode
                      ? "Crear restaurante"
                      : "Guardar cambios"}
                </Button>
              </div>
            </Panel>

            {!isRestaurantCreateMode ? (
              <Panel title={categoryForm.id ? "Editar categoria" : "Crear categoria"}>
              <div className="grid gap-4">
                <Field error={categoryErrors.name} label="Nombre" required>
                  <input
                    className={inputClass}
                    value={categoryForm.name}
                    onChange={(event) =>
                      setCategoryForm({ ...categoryForm, name: event.target.value })
                    }
                  />
                </Field>
                <Field label="Descripcion">
                  <textarea
                    className={textareaClass}
                    value={categoryForm.description}
                    onChange={(event) =>
                      setCategoryForm({ ...categoryForm, description: event.target.value })
                    }
                  />
                </Field>
                <div className="flex gap-2">
                  <Button disabled={savingTarget === "category"} onClick={saveCategory}>
                    <Plus className="h-4 w-4" />
                    {savingTarget === "category"
                      ? "Guardando..."
                      : categoryForm.id
                        ? "Guardar"
                        : "Crear"}
                  </Button>
                  {categoryForm.id ? (
                    <Button onClick={() => setCategoryForm(emptyCategoryForm)} variant="outline">
                      Cancelar
                    </Button>
                  ) : null}
                </div>
              </div>
              </Panel>
            ) : null}
          </div>

          {!isRestaurantCreateMode ? (
            <div className="grid content-start gap-6">
            <Panel title={productForm.id ? "Editar producto" : "Crear producto"}>
              <div className="grid gap-4 md:grid-cols-2">
                <Field error={productErrors.categoryId} label="Categoria" required>
                  <select
                    className={inputClass}
                    value={productForm.categoryId}
                    onChange={(event) =>
                      setProductForm({ ...productForm, categoryId: event.target.value })
                    }
                  >
                    {restaurant.menu.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field error={productErrors.name} label="Nombre" required>
                  <input
                    className={inputClass}
                    value={productForm.name}
                    onChange={(event) =>
                      setProductForm({ ...productForm, name: event.target.value })
                    }
                  />
                </Field>
                <Field error={productErrors.price} label="Precio COP" required>
                  <input
                    className={inputClass}
                    min="0"
                    type="number"
                    value={productForm.price}
                    onChange={(event) =>
                      setProductForm({ ...productForm, price: event.target.value })
                    }
                  />
                </Field>
                <Field label="Tags separados por coma">
                  <input
                    className={inputClass}
                    value={productForm.tags}
                    onChange={(event) =>
                      setProductForm({ ...productForm, tags: event.target.value })
                    }
                  />
                </Field>
                <div className="grid gap-2 text-sm font-semibold text-ink">
                  <span>
                    Imagen del producto
                  </span>
                  <label className="flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-ink/20 bg-white px-3 py-2 text-sm transition hover:border-brand-500 hover:bg-brand-50">
                    <ImagePlus className="h-4 w-4 text-brand-600" />
                    {savingTarget === "product-image" ? "Subiendo imagen..." : "Seleccionar imagen"}
                    <input
                      accept="image/*"
                      className="sr-only"
                      onChange={(event) => selectProductImage(event.target.files?.[0])}
                      type="file"
                    />
                  </label>
                  {productForm.imageUrl ? (
                    <div className="overflow-hidden rounded-lg border border-ink/10 bg-ink/5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        alt="Previsualizacion del producto"
                        className="aspect-square w-full object-cover md:aspect-video"
                        src={productForm.imageUrl}
                      />
                    </div>
                  ) : (
                    <p className="rounded-md border border-dashed border-ink/15 p-3 text-xs font-normal leading-5 text-ink/55">
                      Puedes guardar el producto sin imagen. El menu mostrara un placeholder.
                    </p>
                  )}
                </div>
                <label className="flex items-center gap-3 self-end rounded-md border border-ink/10 bg-white px-3 py-3 text-sm font-semibold">
                  <input
                    checked={productForm.isAvailable}
                    onChange={(event) =>
                      setProductForm({ ...productForm, isAvailable: event.target.checked })
                    }
                    type="checkbox"
                  />
                  Disponible
                </label>
                <Field label="Descripcion">
                  <textarea
                    className={textareaClass}
                    value={productForm.description}
                    onChange={(event) =>
                      setProductForm({ ...productForm, description: event.target.value })
                    }
                  />
                </Field>
                <div className="grid gap-2 text-sm font-semibold text-ink md:col-span-2">
                  <span>Grupos de adiciones</span>
                  {restaurant.addonGroups.length ? (
                    <div className="grid gap-2 rounded-md border border-ink/10 bg-white p-3 sm:grid-cols-2">
                      {restaurant.addonGroups.map((group) => (
                        <label className="flex items-center gap-2 text-sm font-semibold" key={group.id}>
                          <input
                            checked={productForm.addonGroupIds.includes(group.id)}
                            onChange={() => toggleProductAddonGroup(group.id)}
                            type="checkbox"
                          />
                          {group.name}
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p className="rounded-md border border-dashed border-ink/15 p-3 text-xs font-normal leading-5 text-ink/55">
                      Crea grupos en la seccion Adiciones para asignarlos a productos.
                    </p>
                  )}
                </div>
                <div className="flex items-end gap-2">
                  <Button disabled={savingTarget === "product"} onClick={saveProduct}>
                    <Plus className="h-4 w-4" />
                    {savingTarget === "product"
                      ? "Guardando..."
                      : productForm.id
                        ? "Guardar"
                        : "Crear"}
                  </Button>
                  {productForm.id ? (
                    <Button
                      onClick={() =>
                        setProductForm({
                          ...emptyProductForm,
                          categoryId: restaurant.menu[0]?.id ?? "",
                        })
                      }
                      variant="outline"
                    >
                      Cancelar
                    </Button>
                  ) : null}
                </div>
              </div>
            </Panel>

            <Panel title="Adiciones">
              <div className="grid gap-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field error={addonGroupErrors.name} label="Nombre del grupo" required>
                    <input
                      className={inputClass}
                      placeholder="Salsas, extras, terminos"
                      value={addonGroupForm.name}
                      onChange={(event) =>
                        setAddonGroupForm({ ...addonGroupForm, name: event.target.value })
                      }
                    />
                  </Field>
                  <Field error={addonGroupErrors.minSelect} label="Minimo">
                    <input
                      className={inputClass}
                      min="0"
                      type="number"
                      value={addonGroupForm.minSelect}
                      onChange={(event) =>
                        setAddonGroupForm({ ...addonGroupForm, minSelect: event.target.value })
                      }
                    />
                  </Field>
                  <Field error={addonGroupErrors.maxSelect} label="Maximo">
                    <input
                      className={inputClass}
                      min="0"
                      placeholder="Sin limite"
                      type="number"
                      value={addonGroupForm.maxSelect}
                      onChange={(event) =>
                        setAddonGroupForm({ ...addonGroupForm, maxSelect: event.target.value })
                      }
                    />
                  </Field>
                  <div className="grid gap-2 text-sm font-semibold">
                    <label className="flex items-center gap-2 rounded-md border border-ink/10 bg-white px-3 py-3">
                      <input
                        checked={addonGroupForm.multiple}
                        onChange={(event) =>
                          setAddonGroupForm({ ...addonGroupForm, multiple: event.target.checked })
                        }
                        type="checkbox"
                      />
                      Permite seleccion multiple
                    </label>
                    <label className="flex items-center gap-2 rounded-md border border-ink/10 bg-white px-3 py-3">
                      <input
                        checked={addonGroupForm.required}
                        onChange={(event) =>
                          setAddonGroupForm({ ...addonGroupForm, required: event.target.checked })
                        }
                        type="checkbox"
                      />
                      Obligatorio
                    </label>
                  </div>
                  <div className="flex gap-2 md:col-span-2">
                    <Button disabled={savingTarget === "addon-group"} onClick={saveAddonGroup}>
                      <Plus className="h-4 w-4" />
                      {savingTarget === "addon-group"
                        ? "Guardando..."
                        : addonGroupForm.id
                          ? "Guardar grupo"
                          : "Crear grupo"}
                    </Button>
                    {addonGroupForm.id ? (
                      <Button onClick={() => setAddonGroupForm(emptyAddonGroupForm)} variant="outline">
                        Cancelar
                      </Button>
                    ) : null}
                  </div>
                </div>

                <div className="grid gap-4 rounded-lg border border-ink/10 bg-brand-50/60 p-4">
                  <h3 className="font-bold">Opciones del grupo</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field error={addonOptionErrors.groupId} label="Grupo" required>
                      <select
                        className={inputClass}
                        value={addonOptionForm.groupId}
                        onChange={(event) =>
                          setAddonOptionForm({ ...emptyAddonOptionForm, groupId: event.target.value })
                        }
                      >
                        <option value="">Selecciona un grupo</option>
                        {restaurant.addonGroups.map((group) => (
                          <option key={group.id} value={group.id}>
                            {group.name}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field error={addonOptionErrors.name} label="Nombre opcion" required>
                      <input
                        className={inputClass}
                        value={addonOptionForm.name}
                        onChange={(event) =>
                          setAddonOptionForm({ ...addonOptionForm, name: event.target.value })
                        }
                      />
                    </Field>
                    <Field error={addonOptionErrors.price} label="Precio COP">
                      <input
                        className={inputClass}
                        min="0"
                        type="number"
                        value={addonOptionForm.price}
                        onChange={(event) =>
                          setAddonOptionForm({ ...addonOptionForm, price: event.target.value })
                        }
                      />
                    </Field>
                    <label className="flex items-center gap-2 self-end rounded-md border border-ink/10 bg-white px-3 py-3 text-sm font-semibold">
                      <input
                        checked={addonOptionForm.available}
                        onChange={(event) =>
                          setAddonOptionForm({ ...addonOptionForm, available: event.target.checked })
                        }
                        type="checkbox"
                      />
                      Disponible
                    </label>
                    <div className="flex gap-2 md:col-span-2">
                      <Button disabled={savingTarget === "addon-option"} onClick={saveAddonOption}>
                        <Plus className="h-4 w-4" />
                        {savingTarget === "addon-option"
                          ? "Guardando..."
                          : addonOptionForm.id
                            ? "Guardar opcion"
                            : "Crear opcion"}
                      </Button>
                      {addonOptionForm.id ? (
                        <Button
                          onClick={() =>
                            setAddonOptionForm({
                              ...emptyAddonOptionForm,
                              groupId: addonOptionForm.groupId,
                            })
                          }
                          variant="outline"
                        >
                          Cancelar
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="grid gap-3">
                  {restaurant.addonGroups.map((group) => (
                    <div className="rounded-md border border-ink/10 bg-white p-4" key={group.id}>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="font-bold">{group.name}</p>
                          <p className="text-sm text-ink/60">
                            {group.required ? "Obligatorio" : "Opcional"} ·{" "}
                            {group.multiple ? "Multiple" : "Unica seleccion"}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={() => editAddonGroup(group)} variant="outline">
                            <Pencil className="h-4 w-4" /> Editar
                          </Button>
                          <Button onClick={() => deleteAddonGroup(group.id)} variant="outline">
                            <Trash2 className="h-4 w-4" /> Eliminar
                          </Button>
                        </div>
                      </div>
                      <div className="mt-3 grid gap-2">
                        {group.options.map((option) => (
                          <Row key={option.id}>
                            <div>
                              <p className="font-semibold">{option.name}</p>
                              <p className="text-sm text-ink/60">
                                {formatMoney(option.price)} · {option.available ? "Disponible" : "No disponible"}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button onClick={() => editAddonOption(group.id, option)} variant="outline">
                                <Pencil className="h-4 w-4" /> Editar
                              </Button>
                              <Button onClick={() => deleteAddonOption(group.id, option.id)} variant="outline">
                                <Trash2 className="h-4 w-4" /> Eliminar
                              </Button>
                            </div>
                          </Row>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Panel>

            <Panel title={bannerForm.id ? "Editar banner" : "Gestion de banners"}>
              <div className="grid gap-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field error={bannerErrors.title} label="Titulo" required>
                    <input
                      className={inputClass}
                      value={bannerForm.title}
                      onChange={(event) =>
                        setBannerForm({ ...bannerForm, title: event.target.value })
                      }
                    />
                  </Field>
                  <Field error={bannerErrors.imageUrl} label="Imagen URL" required>
                    <input
                      className={inputClass}
                      value={bannerForm.imageUrl}
                      onChange={(event) =>
                        setBannerForm({ ...bannerForm, imageUrl: event.target.value })
                      }
                    />
                    <label className="flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-ink/20 bg-white px-3 py-2 text-sm transition hover:border-brand-500 hover:bg-brand-50">
                      <ImagePlus className="h-4 w-4 text-brand-600" />
                      {savingTarget === "banner-image" ? "Subiendo banner..." : "Subir banner"}
                      <input
                        accept="image/*"
                        className="sr-only"
                        onChange={(event) => selectBannerImage(event.target.files?.[0])}
                        type="file"
                      />
                    </label>
                  </Field>
                  <Field label="Subtitulo">
                    <textarea
                      className={textareaClass}
                      value={bannerForm.subtitle}
                      onChange={(event) =>
                        setBannerForm({ ...bannerForm, subtitle: event.target.value })
                      }
                    />
                  </Field>
                  <div className="flex items-end gap-2">
                    <Button disabled={savingTarget === "banner"} onClick={saveBanner}>
                      <Plus className="h-4 w-4" />
                      {savingTarget === "banner"
                        ? "Guardando..."
                        : bannerForm.id
                          ? "Guardar"
                          : "Crear"}
                    </Button>
                    {bannerForm.id ? (
                      <Button onClick={() => setBannerForm(emptyBannerForm)} variant="outline">
                        Cancelar
                      </Button>
                    ) : null}
                  </div>
                </div>

                <div className="grid gap-3">
                  {restaurant.banners.map((banner, index) => (
                    <Row key={banner.id}>
                      <div className="min-w-0">
                        <p className="font-bold">{banner.title}</p>
                        <p className="line-clamp-1 text-sm text-ink/60">{banner.subtitle}</p>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <IconButton
                          disabled={index === 0}
                          label="Subir"
                          onClick={() => moveBanner(banner.id, -1)}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </IconButton>
                        <IconButton
                          disabled={index === restaurant.banners.length - 1}
                          label="Bajar"
                          onClick={() => moveBanner(banner.id, 1)}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </IconButton>
                        <IconButton label="Editar" onClick={() => editBanner(banner)}>
                          <Pencil className="h-4 w-4" />
                        </IconButton>
                        <IconButton label="Eliminar" onClick={() => deleteBanner(banner.id)}>
                          <Trash2 className="h-4 w-4" />
                        </IconButton>
                      </div>
                    </Row>
                  ))}
                </div>
              </div>
            </Panel>
            </div>
          ) : (
            <Panel title="Guarda el restaurante para continuar">
              <p className="text-sm leading-6 text-ink/65">
                Despues de crear el restaurante podras agregar banners, categorias y productos.
              </p>
            </Panel>
          )}
        </section>

        {!isRestaurantCreateMode ? (
          <Panel title="Categorias y productos">
          <div className="grid gap-4">
            <div className="grid gap-3 rounded-lg border border-ink/10 bg-brand-50/60 p-4 md:grid-cols-[1fr_240px]">
              <label className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/45" />
                <input
                  className={`${inputClass} pl-9`}
                  placeholder="Buscar producto por nombre, descripcion o tag"
                  value={productSearch}
                  onChange={(event) => setProductSearch(event.target.value)}
                />
              </label>
              <select
                className={inputClass}
                value={productCategoryFilter}
                onChange={(event) => setProductCategoryFilter(event.target.value)}
              >
                <option value="all">Todas las categorias</option>
                {restaurant.menu.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {filteredMenu.map((category) => (
              <div className="rounded-lg border border-ink/10 bg-brand-50/60 p-4" key={category.id}>
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-lg font-bold">{category.name}</h3>
                    <p className="text-sm text-ink/60">{category.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => editCategory(category)} variant="outline">
                      <Pencil className="h-4 w-4" /> Editar
                    </Button>
                    <Button onClick={() => deleteCategory(category.id)} variant="outline">
                      <Trash2 className="h-4 w-4" /> Eliminar
                    </Button>
                  </div>
                </div>

                <div className="grid gap-3">
                  {category.items.map((item) => (
                    <Row key={item.id}>
                      <div className="min-w-0">
                        <p className="font-bold">{item.name}</p>
                        <p className="line-clamp-1 text-sm text-ink/60">{item.description}</p>
                        <p className="text-sm font-semibold">{formatMoney(item.price)}</p>
                      </div>
                      <div className="flex shrink-0 flex-wrap justify-end gap-2">
                        <Button onClick={() => toggleAvailability(item.id)} variant="outline">
                          {item.isAvailable ? "Pausar" : "Activar"}
                        </Button>
                        <Button onClick={() => editProduct(item, category.id)} variant="outline">
                          <Pencil className="h-4 w-4" /> Editar
                        </Button>
                        <Button onClick={() => deleteProduct(item.id)} variant="outline">
                          <Trash2 className="h-4 w-4" /> Eliminar
                        </Button>
                      </div>
                    </Row>
                  ))}
                  {!category.items.length ? (
                    <p className="rounded-md border border-dashed border-ink/15 p-4 text-sm text-ink/60">
                      No hay productos que coincidan con esta busqueda.
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
            {!filteredMenu.some((category) => category.items.length) ? (
              <p className="rounded-lg border border-dashed border-ink/15 bg-white p-5 text-sm text-ink/60">
                No encontramos productos con los filtros actuales.
              </p>
            ) : null}
          </div>
          </Panel>
        ) : null}
      </Container>
      {restaurantToDelete ? (
        <div className="fixed inset-0 z-40 grid place-items-center bg-ink/55 p-4">
          <section className="w-full max-w-md rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
            <div className="space-y-2">
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-red-600">
                Confirmar eliminacion
              </p>
              <h2 className="text-xl font-bold">Eliminar {restaurantToDelete.name}</h2>
              <p className="text-sm leading-6 text-ink/65">
                Esta accion eliminara el restaurante y todos sus banners, categorias y productos.
                Escribe <span className="font-bold text-ink">BORRAR</span> para continuar.
              </p>
            </div>

            <input
              className={`${inputClass} mt-4`}
              placeholder="BORRAR"
              value={deleteConfirmation}
              onChange={(event) => setDeleteConfirmation(event.target.value)}
            />

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                disabled={savingTarget === "delete-restaurant"}
                onClick={() => {
                  setRestaurantToDelete(null);
                  setDeleteConfirmation("");
                }}
                variant="outline"
              >
                Cancelar
              </Button>
              <Button
                disabled={
                  deleteConfirmation !== "BORRAR" || savingTarget === "delete-restaurant"
                }
                onClick={confirmDeleteRestaurant}
              >
                <Trash2 className="h-4 w-4" />
                {savingTarget === "delete-restaurant" ? "Eliminando..." : "Eliminar definitivamente"}
              </Button>
            </div>
          </section>
        </div>
      ) : null}
      <ToastStack toasts={toasts} />
    </main>
  );
}

function useStateFromRestaurant(restaurant: Restaurant) {
  const [form, setForm] = useState<RestaurantForm>({
    slug: restaurant.slug,
    name: restaurant.name,
    address: restaurant.address,
    googleMapsUrl: restaurant.googleMapsUrl,
    whatsappUrl: extractColombianMobile(restaurant.whatsappUrl),
    logoUrl: restaurant.logoUrl,
    theme: restaurant.theme,
  });

  useEffect(() => {
    setForm({
      slug: restaurant.slug,
      name: restaurant.name,
      address: restaurant.address,
      googleMapsUrl: restaurant.googleMapsUrl,
      whatsappUrl: extractColombianMobile(restaurant.whatsappUrl),
      logoUrl: restaurant.logoUrl,
      theme: restaurant.theme,
    });
  }, [
    restaurant.address,
    restaurant.googleMapsUrl,
    restaurant.id,
    restaurant.logoUrl,
    restaurant.name,
    restaurant.slug,
    restaurant.theme,
    restaurant.whatsappUrl,
  ]);

  return [form, setForm] as const;
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-lg border border-ink/10 bg-white p-4">
      <p className="text-sm font-semibold text-ink/60">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </article>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-xl font-bold">{title}</h2>
      {children}
    </section>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 rounded-md border border-ink/10 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
      {children}
    </div>
  );
}

function IconButton({
  children,
  disabled,
  label,
  onClick,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={label}
      className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-ink/10 bg-white text-ink transition hover:bg-ink/5 disabled:cursor-not-allowed disabled:opacity-40"
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function ToastStack({ toasts }: { toasts: Toast[] }) {
  if (!toasts.length) {
    return null;
  }

  return (
    <div className="fixed right-4 top-4 z-50 grid w-[calc(100%-2rem)] max-w-sm gap-2">
      {toasts.map((toast) => (
        <div
          className="flex items-start gap-3 rounded-lg border border-ink/10 bg-white p-4 text-sm shadow-soft"
          key={toast.id}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
          ) : (
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          )}
          <p className="font-semibold text-ink">{toast.message}</p>
        </div>
      ))}
    </div>
  );
}
