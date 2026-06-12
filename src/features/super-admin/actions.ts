"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getSuperAdminPlan,
  isSuperAdmin,
  toggleRestaurantActiveAsSuperAdmin,
  updateSubscriptionAsSuperAdmin,
  type SubscriptionProvider,
} from "@/features/super-admin/super-admin";
import type { SubscriptionStatus } from "@/features/subscriptions/subscriptions";

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
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export async function updateSubscriptionAction(formData: FormData) {
  await requireSuperAdmin();

  const plan = getSuperAdminPlan(String(formData.get("planName") ?? ""));
  const manualBranchLimit = parseNumber(formData.get("manualBranchLimit"));
  const manualAmount = parseNumber(formData.get("manualAmount"));
  const currentPeriodEnd = String(formData.get("currentPeriodEnd") ?? "").trim();
  const trialEnd = String(formData.get("trialEnd") ?? "").trim();

  await updateSubscriptionAsSuperAdmin({
    subscriptionId: String(formData.get("subscriptionId") ?? ""),
    status: String(formData.get("status") ?? "") as SubscriptionStatus,
    planName: plan?.label ?? String(formData.get("planName") ?? ""),
    branchLimit: manualBranchLimit ?? plan?.branchLimit,
    amount: manualAmount ?? plan?.amount,
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

  const plan = getSuperAdminPlan(String(formData.get("planName") ?? "1_sucursal"));

  await updateSubscriptionAsSuperAdmin({
    subscriptionId: String(formData.get("subscriptionId") ?? ""),
    status: "active",
    planName: plan?.label ?? "Acceso manual",
    branchLimit: plan?.branchLimit ?? 1,
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
