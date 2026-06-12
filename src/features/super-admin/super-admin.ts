import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Subscription, SubscriptionStatus } from "@/features/subscriptions/subscriptions";

export type ProfileRole = "user" | "super_admin";
export type SubscriptionProvider = "mercadopago" | "manual";

export type Profile = {
  id: string;
  email: string;
  role: ProfileRole;
  created_at: string;
  updated_at: string;
};

export type SuperAdminUser = {
  id: string;
  email: string;
  role: ProfileRole;
  createdAt: string;
  subscription: Subscription | null;
  restaurantCount: number;
};

export type SuperAdminRestaurant = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  userId: string | null;
  ownerEmail: string;
  ownerSubscriptionStatus: SubscriptionStatus | "Sin plan";
  menuUrl: string;
};

export type UpdateSubscriptionInput = {
  subscriptionId: string;
  status?: SubscriptionStatus;
  planName?: string;
  branchLimit?: number;
  amount?: number;
  trialEnd?: string;
  currentPeriodEnd?: string | null;
  provider?: SubscriptionProvider | null;
};

type RestaurantRow = {
  id: string;
  name: string;
  slug: string;
  is_active: boolean | null;
  user_id: string | null;
};

export const superAdminPlans = [
  { value: "1_sucursal", label: "1 sucursal", branchLimit: 1, amount: 30000 },
  { value: "2_sucursales", label: "2 sucursales", branchLimit: 2, amount: 60000 },
  { value: "3_sucursales", label: "3 sucursales", branchLimit: 3, amount: 80000 },
] as const;

export function getSuperAdminPlan(value: string) {
  return superAdminPlans.find((plan) => plan.value === value || plan.label === value) ?? null;
}

function adminClient() {
  return createAdminClient() as unknown as SupabaseClient;
}

export async function isSuperAdmin(userId: string) {
  const supabase = adminClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data?.role === "super_admin";
}

export async function getAllUsersWithSubscriptions() {
  const supabase = adminClient();
  const [profilesResult, subscriptionsResult, restaurantsResult] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    supabase.from("subscriptions").select("*"),
    supabase.from("restaurants").select("id,user_id"),
  ]);

  if (profilesResult.error) {
    throw new Error(profilesResult.error.message);
  }

  if (subscriptionsResult.error) {
    throw new Error(subscriptionsResult.error.message);
  }

  if (restaurantsResult.error) {
    throw new Error(restaurantsResult.error.message);
  }

  const profiles = (profilesResult.data ?? []) as Profile[];
  const subscriptions = (subscriptionsResult.data ?? []) as Subscription[];
  const restaurants = (restaurantsResult.data ?? []) as Array<{ id: string; user_id: string | null }>;

  return profiles.map((profile): SuperAdminUser => ({
    id: profile.id,
    email: profile.email,
    role: profile.role,
    createdAt: profile.created_at,
    subscription: subscriptions.find((subscription) => subscription.user_id === profile.id) ?? null,
    restaurantCount: restaurants.filter((restaurant) => restaurant.user_id === profile.id).length,
  }));
}

export async function getAllRestaurantsWithOwners() {
  const supabase = adminClient();
  const [restaurantsResult, profilesResult, subscriptionsResult] = await Promise.all([
    supabase.from("restaurants").select("id,name,slug,is_active,user_id").order("name", { ascending: true }),
    supabase.from("profiles").select("*"),
    supabase.from("subscriptions").select("*"),
  ]);

  if (restaurantsResult.error) {
    throw new Error(restaurantsResult.error.message);
  }

  if (profilesResult.error) {
    throw new Error(profilesResult.error.message);
  }

  if (subscriptionsResult.error) {
    throw new Error(subscriptionsResult.error.message);
  }

  const restaurants = (restaurantsResult.data ?? []) as RestaurantRow[];
  const profiles = (profilesResult.data ?? []) as Profile[];
  const subscriptions = (subscriptionsResult.data ?? []) as Subscription[];

  return restaurants.map((restaurant): SuperAdminRestaurant => {
    const owner = profiles.find((profile) => profile.id === restaurant.user_id);
    const ownerSubscription = subscriptions.find(
      (subscription) => subscription.user_id === restaurant.user_id,
    );

    return {
      id: restaurant.id,
      name: restaurant.name,
      slug: restaurant.slug,
      isActive: restaurant.is_active ?? true,
      userId: restaurant.user_id,
      ownerEmail: owner?.email ?? "Sin dueño",
      ownerSubscriptionStatus: ownerSubscription?.status ?? "Sin plan",
      menuUrl: `/${restaurant.slug}/menu`,
    };
  });
}

export async function updateSubscriptionAsSuperAdmin(input: UpdateSubscriptionInput) {
  const supabase = adminClient();
  const payload: Record<string, string | number | null> = {};

  if (input.status) {
    payload.status = input.status;
    payload.cancelled_at = input.status === "cancelled" ? new Date().toISOString() : null;
  }

  if (input.planName) {
    payload.plan_name = input.planName;
  }

  if (typeof input.branchLimit === "number") {
    payload.branch_limit = input.branchLimit;
  }

  if (typeof input.amount === "number") {
    payload.amount = input.amount;
  }

  if (input.trialEnd) {
    payload.trial_end = input.trialEnd;
  }

  if (input.currentPeriodEnd !== undefined) {
    payload.current_period_end = input.currentPeriodEnd;
  }

  if (input.provider !== undefined) {
    payload.provider = input.provider;
  }

  const { data, error } = await supabase
    .from("subscriptions")
    .update(payload)
    .eq("id", input.subscriptionId)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Subscription;
}

export async function toggleRestaurantActiveAsSuperAdmin(restaurantId: string, isActive: boolean) {
  const supabase = adminClient();
  const { error } = await supabase
    .from("restaurants")
    .update({ is_active: isActive })
    .eq("id", restaurantId);

  if (error) {
    throw new Error(error.message);
  }
}
