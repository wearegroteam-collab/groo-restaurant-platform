"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { Plan } from "@/features/subscriptions/plans";

export type SubscriptionStatus = "trialing" | "active" | "expired" | "cancelled" | "past_due";

export type Subscription = {
  id: string;
  user_id: string;
  plan_name: string;
  branch_limit: number;
  amount: number;
  status: SubscriptionStatus;
  trial_start: string;
  trial_end: string;
  current_period_start: string;
  current_period_end: string;
  created_at: string;
  updated_at: string;
};

const TRIAL_PLAN = {
  plan_name: "1 sucursal",
  branch_limit: 1,
  amount: 30000,
  status: "trialing" as const,
};

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

export async function ensureTrialSubscription(userId: string) {
  const supabase = createClient() as unknown as SupabaseClient;
  const existingSubscription = await getLatestSubscription(userId);

  if (existingSubscription) {
    return existingSubscription;
  }

  const now = new Date();
  const trialEnd = addDays(now, 14);
  const { data, error } = await supabase
    .from("subscriptions")
    .insert({
      user_id: userId,
      ...TRIAL_PLAN,
      trial_start: now.toISOString(),
      trial_end: trialEnd.toISOString(),
      current_period_start: now.toISOString(),
      current_period_end: trialEnd.toISOString(),
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Subscription;
}

export async function getLatestSubscription(userId: string) {
  const supabase = createClient() as unknown as SupabaseClient;
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as Subscription | null) ?? null;
}

export async function getActiveSubscription(userId: string) {
  const supabase = createClient() as unknown as SupabaseClient;
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .in("status", ["trialing", "active"])
    .gte("current_period_end", now)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as Subscription | null) ?? null;
}

export function isSubscriptionWritable(subscription: Subscription | null) {
  if (!subscription) {
    return false;
  }

  return (
    ["trialing", "active"].includes(subscription.status) &&
    new Date(subscription.current_period_end).getTime() >= Date.now()
  );
}

export function getTrialDaysRemaining(subscription: Subscription | null) {
  if (!subscription || subscription.status !== "trialing") {
    return 0;
  }

  const remainingMs = new Date(subscription.trial_end).getTime() - Date.now();
  return Math.max(0, Math.ceil(remainingMs / 86400000));
}

export async function activatePlan(userId: string, plan: Plan) {
  const supabase = createClient() as unknown as SupabaseClient;
  const subscription = await ensureTrialSubscription(userId);
  const now = new Date();
  const nextPeriodEnd = addDays(now, 30);
  const { data, error } = await supabase
    .from("subscriptions")
    .update({
      plan_name: plan.name,
      branch_limit: plan.branchLimit,
      amount: plan.amount,
      status: "active",
      current_period_start: now.toISOString(),
      current_period_end: nextPeriodEnd.toISOString(),
    })
    .eq("id", subscription.id)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Subscription;
}
