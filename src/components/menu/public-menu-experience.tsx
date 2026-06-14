"use client";

import type { MenuItem, Restaurant } from "@/types/menu";
import type { CartAddon } from "@/features/cart/use-cart";
import { AddonSelectorModal } from "@/components/menu/addon-selector-modal";
import { Container } from "@/components/layout/container";
import { BannerSlider } from "@/components/menu/banner-slider";
import { CartButton } from "@/components/menu/cart-button";
import { CartPanel } from "@/components/menu/cart-panel";
import { CategoryNav } from "@/components/menu/category-nav";
import { FeaturedPromotions } from "@/components/menu/featured-promotions";
import { MenuCategory } from "@/components/menu/menu-category";
import { PromotionalPopup } from "@/components/menu/promotional-popup";
import { RestaurantHeader } from "@/components/menu/restaurant-header";
import { WhatsAppFab } from "@/components/menu/whatsapp-fab";
import { useCart } from "@/features/cart/use-cart";
import { useRestaurantBySlug } from "@/features/restaurants/use-restaurant-store";
import { cn } from "@/lib/utils/cn";
import { useState } from "react";

type PublicMenuExperienceProps = {
  initialRestaurants: Restaurant[];
  dataSource?: "local" | "supabase";
  restaurantSlug: string;
};

export function PublicMenuExperience({
  dataSource = "supabase",
  initialRestaurants,
  restaurantSlug,
}: PublicMenuExperienceProps) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isPopupClosed, setIsPopupClosed] = useState(false);
  const [itemToCustomize, setItemToCustomize] = useState<MenuItem | null>(null);
  const {
    error,
    isLoading,
    restaurant: currentRestaurant,
  } = useRestaurantBySlug(initialRestaurants, restaurantSlug, { source: dataSource });
  const cart = useCart(currentRestaurant, restaurantSlug);

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

  if (!currentRestaurant.canShowPublicMenu) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f8faf3] px-4 text-center">
        <div className="max-w-md space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-600">
            Menu temporalmente inactivo
          </p>
          <h1 className="text-3xl font-bold">Este menu no esta disponible temporalmente.</h1>
          <p className="text-ink/65">
            El restaurante debe activar o renovar su plan para volver a mostrar el menu.
          </p>
        </div>
      </main>
    );
  }

  const isDark = currentRestaurant.theme === "dark";
  const currency =
    cart.lines[0]?.item.price.currency ??
    currentRestaurant.menu.flatMap((category) => category.items)[0]?.price.currency ??
    "COP";
  function addMenuItem(item: MenuItem) {
    if (item.addonGroups?.length) {
      setItemToCustomize(item);
      return;
    }

    cart.addItem(item);
  }

  function addCustomizedItem(item: MenuItem, addons: CartAddon[]) {
    cart.addItem(item, addons);
  }

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
          <MenuCategory
            category={category}
            key={category.id}
            onAddItem={addMenuItem}
            theme={currentRestaurant.theme}
          />
        ))}
      </Container>

      {cart.totalQuantity ? (
        <>
          <CartButton
            currency={currency}
            onClick={() => setIsCartOpen(true)}
            theme={currentRestaurant.theme}
            totalAmount={cart.totalAmount}
            totalQuantity={cart.totalQuantity}
          />
          <CartPanel
            customer={cart.customer}
            isOpen={isCartOpen}
            lines={cart.lines}
            onAdd={(line) => cart.addItem(line.item, line.selectedAddons)}
            onCheckoutSuccess={cart.clearCart}
            onClose={() => setIsCartOpen(false)}
            onCustomerChange={cart.updateCustomer}
            onDecrease={cart.decreaseLine}
            onRemove={cart.removeLine}
            restaurant={currentRestaurant}
            theme={currentRestaurant.theme}
            totalAmount={cart.totalAmount}
          />
        </>
      ) : (
        <WhatsAppFab href={currentRestaurant.whatsappUrl} />
      )}
      <AddonSelectorModal
        item={itemToCustomize}
        onAdd={addCustomizedItem}
        onClose={() => setItemToCustomize(null)}
        theme={currentRestaurant.theme}
      />
      {currentRestaurant.popup?.isActive && !isPopupClosed ? (
        <PromotionalPopup
          onClose={() => setIsPopupClosed(true)}
          popup={currentRestaurant.popup}
          theme={currentRestaurant.theme}
        />
      ) : null}
    </main>
  );
}
