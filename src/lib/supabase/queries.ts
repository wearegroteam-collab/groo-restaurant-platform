import type { Database } from "@/types/database";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function getRestaurantBySlug(
  supabase: SupabaseClient<Database>,
  slug: string,
) {
  return supabase.from("restaurants").select("*").eq("slug", slug).single();
}

export async function getMenuCategories(
  supabase: SupabaseClient<Database>,
  restaurantId: string,
) {
  return supabase
    .from("categories")
    .select("*, products(*)")
    .eq("restaurant_id", restaurantId)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
}

export async function getBanners(
  supabase: SupabaseClient<Database>,
  restaurantId: string,
) {
  return supabase
    .from("banners")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
}
