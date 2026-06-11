import { PublicMenuExperience } from "@/components/menu/public-menu-experience";
import { getRestaurantBySlug, restaurants } from "@/features/restaurants/mock-data";

type RestaurantMenuPageProps = {
  params: Promise<{
    restaurantSlug: string;
  }>;
};

export function generateStaticParams() {
  return restaurants.map((restaurant) => ({
    restaurantSlug: restaurant.slug,
  }));
}

export async function generateMetadata({ params }: RestaurantMenuPageProps) {
  const { restaurantSlug } = await params;
  const restaurant = getRestaurantBySlug(restaurantSlug);

  return {
    title: restaurant ? `${restaurant.name} | Menu` : "Menu",
    description: restaurant?.description,
  };
}

export default async function RestaurantMenuPage({ params }: RestaurantMenuPageProps) {
  const { restaurantSlug } = await params;

  return <PublicMenuExperience initialRestaurants={restaurants} restaurantSlug={restaurantSlug} />;
}
