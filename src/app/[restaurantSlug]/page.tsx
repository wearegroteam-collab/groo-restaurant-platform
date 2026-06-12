import type { Route } from "next";
import { redirect } from "next/navigation";

type RestaurantShortLinkPageProps = {
  params: Promise<{
    restaurantSlug: string;
  }>;
};

export default async function RestaurantShortLinkPage({
  params,
}: RestaurantShortLinkPageProps) {
  const { restaurantSlug } = await params;
  redirect(`/${restaurantSlug}/menu` as Route);
}
