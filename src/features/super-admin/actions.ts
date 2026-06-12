"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getSuperAdminPlan,
  getSubscriptionByIdAsSuperAdmin,
  isSuperAdmin,
  toggleRestaurantActiveAsSuperAdmin,
  updateProfileRoleAsSuperAdmin,
  updateSubscriptionAsSuperAdmin,
  type ProfileRole,
  type SubscriptionProvider,
} from "@/features/super-admin/super-admin";
import type { SubscriptionStatus } from "@/features/subscriptions/subscriptions";

const BRANCH_LIMIT_ERROR = "El límite de sucursales debe ser 1, 2 o 3.";
const BRANCH_LIMITS = [1, 2, 3] as const;

async function requireSuperAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/super-admin");
  }

  if (!(await isSuperAdmin(user.id))) {
    redirect("/admin");
  }
}

function parseNumber(value: FormDataEntryValue | null) {
  const rawValue = String(value ?? "").trim();

  if (!rawValue) {
    return undefined;
  }

  if (!/^\d+$/.test(rawValue)) {
    return undefined;
  }

  const parsed = Number(rawValue);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function isValidBranchLimit(value: number | undefined): value is 1 | 2 | 3 {
  return BRANCH_LIMITS.includes(value as 1 | 2 | 3);
}

function resolveBranchLimit({
  currentValue,
  manualValue,
  planValue,
}: {
  currentValue?: number;
  manualValue?: number;
  planValue?: number;
}) {
  if (manualValue !== undefined) {
    return isValidBranchLimit(manualValue) ? manualValue : null;
  }

  if (isValidBranchLimit(planValue)) {
    return planValue;
  }

  if (isValidBranchLimit(currentValue)) {
    return currentValue;
  }

  return 1;
}

function redirectWithBranchLimitError(): never {
  redirect(`/super-admin?error=${encodeURIComponent(BRANCH_LIMIT_ERROR)}`);
}

export async function updateSubscriptionAction(formData: FormData) {
  await requireSuperAdmin();

  const subscriptionId = String(formData.get("subscriptionId") ?? "");
  const currentSubscription = await getSubscriptionByIdAsSuperAdmin(subscriptionId);
  const plan = getSuperAdminPlan(String(formData.get("planName") ?? ""));
  const manualBranchLimit = parseNumber(formData.get("manualBranchLimit"));
  const manualAmount = parseNumber(formData.get("manualAmount"));
  const currentPeriodEnd = String(formData.get("currentPeriodEnd") ?? "").trim();
  const trialEnd = String(formData.get("trialEnd") ?? "").trim();
  const branchLimit = resolveBranchLimit({
    currentValue: currentSubscription?.branch_limit,
    manualValue: manualBranchLimit,
    planValue: plan?.branchLimit,
  });

  if (!branchLimit) {
    redirectWithBranchLimitError();
  }

  await updateSubscriptionAsSuperAdmin({
    subscriptionId,
    status: String(formData.get("status") ?? "") as SubscriptionStatus,
    planName:
      plan?.label ?? currentSubscription?.plan_name ?? String(formData.get("planName") ?? ""),
    branchLimit,
    amount: manualAmount ?? plan?.amount ?? currentSubscription?.amount,
    trialEnd: trialEnd || undefined,
    currentPeriodEnd: currentPeriodEnd || undefined,
    provider: String(formData.get("provider") ?? "mercadopago") as SubscriptionProvider,
  });

  revalidatePath("/super-admin");
}

export async function extendTrialAction(formData: FormData) {
  await requireSuperAdmin();

  const days = parseNumber(formData.get("days")) ?? 7;
  const currentTrialEnd = String(formData.get("currentTrialEnd") ?? "");
  const baseDate = new Date(currentTrialEnd);
  const safeBaseDate = Number.isNaN(baseDate.getTime()) || baseDate.getTime() < Date.now()
    ? new Date()
    : baseDate;
  safeBaseDate.setDate(safeBaseDate.getDate() + days);

  await updateSubscriptionAsSuperAdmin({
    subscriptionId: String(formData.get("subscriptionId") ?? ""),
    status: "trialing",
    trialEnd: safeBaseDate.toISOString(),
    currentPeriodEnd: safeBaseDate.toISOString(),
  });

  revalidatePath("/super-admin");
}

export async function manualAccessAction(formData: FormData) {
  await requireSuperAdmin();

  const subscriptionId = String(formData.get("subscriptionId") ?? "");
  const currentSubscription = await getSubscriptionByIdAsSuperAdmin(subscriptionId);
  const branchLimit = resolveBranchLimit({
    currentValue: currentSubscription?.branch_limit,
  });

  if (!branchLimit) {
    redirectWithBranchLimitError();
  }

  await updateSubscriptionAsSuperAdmin({
    subscriptionId,
    status: "active",
    planName: currentSubscription?.plan_name ?? "Acceso manual",
    branchLimit,
    amount: 0,
    provider: "manual",
    currentPeriodEnd: null,
  });

  revalidatePath("/super-admin");
}

export async function reactivateSubscriptionAction(formData: FormData) {
  await requireSuperAdmin();

  await updateSubscriptionAsSuperAdmin({
    subscriptionId: String(formData.get("subscriptionId") ?? ""),
    status: "active",
    currentPeriodEnd: null,
  });

  revalidatePath("/super-admin");
}

export async function cancelAccessAction(formData: FormData) {
  await requireSuperAdmin();

  await updateSubscriptionAsSuperAdmin({
    subscriptionId: String(formData.get("subscriptionId") ?? ""),
    status: "cancelled",
  });

  revalidatePath("/super-admin");
}

export async function toggleRestaurantActiveAction(formData: FormData) {
  await requireSuperAdmin();

  await toggleRestaurantActiveAsSuperAdmin(
    String(formData.get("restaurantId") ?? ""),
    String(formData.get("isActive") ?? "") === "true",
  );

  revalidatePath("/super-admin");
}

export async function updateProfileRoleAction(formData: FormData) {
  await requireSuperAdmin();

  await updateProfileRoleAsSuperAdmin({
    userId: String(formData.get("userId") ?? ""),
    role: String(formData.get("role") ?? "user") as ProfileRole,
  });

  revalidatePath("/super-admin");
}
