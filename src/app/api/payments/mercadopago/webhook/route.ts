import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import type { SubscriptionStatus } from "@/features/subscriptions/subscriptions";

type MercadoPagoWebhookBody = {
  action?: string;
  type?: string;
  data?: {
    id?: string;
  };
};

type MercadoPagoPayment = {
  id: number;
  status: string;
  external_reference?: string | null;
  metadata?: {
    subscription_id?: string;
    plan_name?: string;
    branch_limit?: number;
    amount?: number;
  };
};

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function mapPaymentStatus(status: string): SubscriptionStatus {
  if (status === "approved") {
    return "active";
  }

  if (["cancelled", "rejected", "refunded", "charged_back"].includes(status)) {
    return "cancelled";
  }

  return "past_due";
}

function getPaymentId(request: Request, body: MercadoPagoWebhookBody) {
  const url = new URL(request.url);
  return body.data?.id ?? url.searchParams.get("id") ?? url.searchParams.get("data.id");
}

export async function POST(request: Request) {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

  if (!accessToken) {
    return NextResponse.json({ received: true, skipped: "Mercado Pago no configurado." });
  }

  const body = (await request.json().catch(() => ({}))) as MercadoPagoWebhookBody;
  const paymentId = getPaymentId(request, body);
  const notificationType = body.type ?? new URL(request.url).searchParams.get("topic");

  if (!paymentId || notificationType !== "payment") {
    return NextResponse.json({ received: true });
  }

  const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!paymentResponse.ok) {
    return NextResponse.json(
      { error: "No se pudo consultar el pago en Mercado Pago." },
      { status: paymentResponse.status },
    );
  }

  const payment = (await paymentResponse.json()) as MercadoPagoPayment;
  const subscriptionId = payment.metadata?.subscription_id ?? payment.external_reference;

  if (!subscriptionId) {
    return NextResponse.json({ received: true, skipped: "Pago sin subscription_id." });
  }

  const now = new Date();
  const nextPeriodEnd = addDays(now, 30);
  const status = mapPaymentStatus(payment.status);
  const supabase = createAdminClient() as unknown as SupabaseClient;
  const updatePayload: Record<string, string | number | null> = {
    status,
    current_period_start: now.toISOString(),
    current_period_end: nextPeriodEnd.toISOString(),
  };

  if (status === "active") {
    updatePayload.cancelled_at = null;
  }

  if (payment.metadata?.plan_name) {
    updatePayload.plan_name = payment.metadata.plan_name;
  }

  if (payment.metadata?.branch_limit) {
    updatePayload.branch_limit = payment.metadata.branch_limit;
  }

  if (payment.metadata?.amount) {
    updatePayload.amount = payment.metadata.amount;
  }

  const { error } = await supabase
    .from("subscriptions")
    .update(updatePayload)
    .eq("id", subscriptionId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
