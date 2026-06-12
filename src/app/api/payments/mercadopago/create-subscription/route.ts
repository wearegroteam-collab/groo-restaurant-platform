import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { getAppUrl } from "@/lib/config/app-url";
import { getPlanByBranchLimit } from "@/features/subscriptions/plans";

type CreateSubscriptionBody = {
  branchLimit?: number;
};

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
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
  const plan = getPlanByBranchLimit(Number(body.branchLimit ?? 1));

  if (!plan) {
    return NextResponse.json({ error: "Plan invalido." }, { status: 400 });
  }

  const now = new Date();
  const nextPeriodEnd = addDays(now, 30);
  const { data: subscription, error: subscriptionError } = await supabase
    .from("subscriptions")
    .upsert(
      {
        user_id: user.id,
        plan_name: plan.name,
        branch_limit: plan.branchLimit,
        amount: plan.amount,
        status: "past_due",
        current_period_start: now.toISOString(),
        current_period_end: nextPeriodEnd.toISOString(),
      },
      { onConflict: "user_id" },
    )
    .select("*")
    .single();

  if (subscriptionError || !subscription) {
    return NextResponse.json(
      { error: subscriptionError?.message ?? "No se pudo preparar la suscripcion." },
      { status: 500 },
    );
  }

  const mercadoPagoResponse = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      items: [
        {
          title: `GrooTeam Menu - ${plan.name}`,
          quantity: 1,
          currency_id: "COP",
          unit_price: plan.amount,
        },
      ],
      back_urls: {
        success: `${appUrl}/admin?payment=success`,
        pending: `${appUrl}/admin?payment=pending`,
        failure: `${appUrl}/admin?payment=failure`,
      },
      notification_url: `${appUrl}/api/payments/mercadopago/webhook`,
      external_reference: subscription.id,
      metadata: {
        user_id: user.id,
        subscription_id: subscription.id,
        plan_name: plan.name,
        branch_limit: plan.branchLimit,
        amount: plan.amount,
      },
    }),
  });

  const mercadoPagoData = await mercadoPagoResponse.json();

  if (!mercadoPagoResponse.ok) {
    return NextResponse.json(
      {
        error: "Mercado Pago no pudo crear el pago.",
        details: mercadoPagoData,
      },
      { status: mercadoPagoResponse.status },
    );
  }

  return NextResponse.json({
    id: mercadoPagoData.id,
    initPoint: mercadoPagoData.init_point,
    sandboxInitPoint: mercadoPagoData.sandbox_init_point,
  });
}
