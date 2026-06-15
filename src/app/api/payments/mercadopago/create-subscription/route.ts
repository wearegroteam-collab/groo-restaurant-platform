import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { getAppUrl } from "@/lib/config/app-url";
import { getPlanByBranchLimit, getPlanByValue } from "@/features/subscriptions/plans";
import type { Subscription } from "@/features/subscriptions/subscriptions";

type CreateSubscriptionBody = {
  branchLimit?: number;
  email?: string;
  plan_name?: string;
  user_id?: string;
};

type MercadoPagoPreapprovalResponse = {
  id?: string;
  init_point?: string;
  sandbox_init_point?: string;
  status?: string;
};

function addMonths(date: Date, months: number) {
  const nextDate = new Date(date);
  nextDate.setMonth(nextDate.getMonth() + months);
  return nextDate;
}

function getPendingSubscriptionStatus(subscription: Subscription | null) {
  if (
    subscription?.status === "trialing" &&
    new Date(subscription.trial_end).getTime() > Date.now()
  ) {
    return "trialing";
  }

  if (
    subscription?.status === "active" &&
    (!subscription.current_period_end ||
      new Date(subscription.current_period_end).getTime() > Date.now())
  ) {
    return "active";
  }

  return "pending";
}

export async function POST(request: Request) {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  const appUrl = getAppUrl();

  if (!accessToken) {
    return NextResponse.json(
      {
        error: "Mercado Pago no esta configurado. Define MERCADOPAGO_ACCESS_TOKEN.",
      },
      { status: 503 },
    );
  }

  const supabase = (await createClient()) as unknown as SupabaseClient;
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as CreateSubscriptionBody;
  const plan =
    getPlanByValue(String(body.plan_name ?? "")) ??
    getPlanByBranchLimit(Number(body.branchLimit ?? 1));

  if (!plan) {
    return NextResponse.json({ error: "Plan invalido." }, { status: 400 });
  }

  if (body.user_id && body.user_id !== user.id) {
    return NextResponse.json({ error: "No puedes crear pagos para otro usuario." }, { status: 403 });
  }

  const payerEmail = body.email || user.email;

  if (!payerEmail) {
    return NextResponse.json({ error: "El usuario no tiene email para Mercado Pago." }, { status: 400 });
  }

  const { data: currentSubscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();
  const externalReference = `${user.id}|${plan.value}`;

  const mercadoPagoResponse = await fetch("https://api.mercadopago.com/preapproval", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      reason: `Groo Menu - ${plan.name}`,
      external_reference: externalReference,
      payer_email: payerEmail,
      back_url: `${appUrl}/admin?payment=success`,
      notification_url: `${appUrl}/api/payments/mercadopago/webhook`,
      status: "pending",
      auto_recurring: {
        frequency: 1,
        frequency_type: "months",
        transaction_amount: plan.amount,
        currency_id: "COP",
      },
    }),
  });

  const mercadoPagoData = (await mercadoPagoResponse.json()) as MercadoPagoPreapprovalResponse;

  if (!mercadoPagoResponse.ok || !mercadoPagoData.id) {
    return NextResponse.json(
      {
        error: "Mercado Pago no pudo crear la suscripcion.",
        details: mercadoPagoData,
      },
      { status: mercadoPagoResponse.status || 500 },
    );
  }

  const now = new Date();
  const currentPeriodEnd = addMonths(now, 1);
  const nextStatus = getPendingSubscriptionStatus(
    (currentSubscription as Subscription | null) ?? null,
  );
  const { error: subscriptionError } = await supabase
    .from("subscriptions")
    .upsert(
      {
        user_id: user.id,
        plan_name: plan.name,
        branch_limit: plan.branchLimit,
        amount: plan.amount,
        status: nextStatus,
        provider: "mercadopago",
        mercadopago_preapproval_id: mercadoPagoData.id,
        current_period_start: now.toISOString(),
        current_period_end: currentPeriodEnd.toISOString(),
        cancelled_at: null,
      },
      { onConflict: "user_id" },
    );

  if (subscriptionError) {
    return NextResponse.json(
      { error: subscriptionError.message ?? "No se pudo preparar la suscripcion." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    id: mercadoPagoData.id,
    initPoint: mercadoPagoData.init_point,
    sandboxInitPoint: mercadoPagoData.sandbox_init_point,
    status: mercadoPagoData.status,
  });
}
