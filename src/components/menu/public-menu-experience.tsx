"use client";

import type { Restaurant } from "@/types/menu";
import { Container } from "@/components/layout/container";
import { BannerSlider } from "@/components/menu/banner-slider";
import { CategoryNav } from "@/components/menu/category-nav";
import { FeaturedPromotions } from "@/components/menu/featured-promotions";
import { MenuCategory } from "@/components/menu/menu-category";
import { RestaurantHeader } from "@/components/menu/restaurant-header";
import { WhatsAppFab } from "@/components/menu/whatsapp-fab";
import { useRestaurantBySlug } from "@/features/restaurants/use-restaurant-store";
import { cn } from "@/lib/utils/cn";

type PublicMenuExperienceProps = {
  initialRestaurants: Restaurant[];
  restaurantSlug: string;
};

export function PublicMenuExperience({
  initialRestaurants,
  restaurantSlug,
}: PublicMenuExperienceProps) {
  const {
    error,
    isLoading,
    restaurant: currentRestaurant,
  } = useRestaurantBySlug(initialRestaurants, restaurantSlug);

  if (isLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f8faf3] px-4 text-center">
        <div className="max-w-md space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-600">
            Cargando menu
          </p>
          <h1 className="text-3xl font-bold">Preparando restaurante...</h1>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f8faf3] px-4 text-center">
        <div className="max-w-md space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-red-600">
            Error de Supabase
          </p>
          <h1 className="text-3xl font-bold">No se pudo cargar el menu</h1>
          <p className="text-ink/65">{error}</p>
        </div>
      </main>
    );
  }

  if (!currentRestaurant) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f8faf3] px-4 text-center">
        <div className="max-w-md space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-600">
            Menu no encontrado
          </p>
          <h1 className="text-3xl font-bold">Este restaurante no existe</h1>
          <p className="text-ink/65">
            Revisa el slug del restaurante o crealo desde el panel administrativo.
          </p>
        </div>
      </main>
    );
  }

  const isDark = currentRestaurant.theme === "dark";

  return (
    <main
      className={cn(
        "min-h-screen pb-24",
        isDark ? "bg-[#0c120f] text-white" : "bg-[#f8faf3] text-ink",
      )}
    >
      <BannerSlider banners={currentRestaurant.banners} />
      <FeaturedPromotions restaurant={currentRestaurant} theme={currentRestaurant.theme} />
      <RestaurantHeader restaurant={currentRestaurant} theme={currentRestaurant.theme} />
      <CategoryNav categories={currentRestaurant.menu} theme={currentRestaurant.theme} />

      <Container className="grid gap-9 py-6">
        {currentRestaurant.menu.map((category) => (
          <MenuCategory category={category} key={category.id} theme={currentRestaurant.theme} />
        ))}
      </Container>

      <WhatsAppFab href={currentRestaurant.whatsappUrl} />
    </main>
  );
}
