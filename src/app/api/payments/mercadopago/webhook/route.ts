import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPlanByValue, type Plan } from "@/features/subscriptions/plans";
import type { Subscription, SubscriptionStatus } from "@/features/subscriptions/subscriptions";
import {
  sendCancellationEmail,
  sendPaymentFailedEmail,
  sendRenewalSuccessEmail,
  sendSubscriptionActivatedEmail,
} from "@/lib/email/transactional";

type MercadoPagoWebhookBody = {
  action?: string;
  type?: string;
  data?: {
    id?: string;
  };
};

type MercadoPagoPreapproval = {
  id: string;
  status: string;
  external_reference?: string | null;
};

function addMonths(date: Date, months: number) {
  const nextDate = new Date(date);
  nextDate.setMonth(nextDate.getMonth() + months);
  return nextDate;
}

function getWebhookResourceId(request: Request, body: MercadoPagoWebhookBody) {
  const url = new URL(request.url);
  return (
    body.data?.id ??
    url.searchParams.get("id") ??
    url.searchParams.get("data.id") ??
    url.searchParams.get("preapproval_id")
  );
}

function isPreapprovalEvent(request: Request, body: MercadoPagoWebhookBody) {
  const url = new URL(request.url);
  const topic = url.searchParams.get("topic") ?? url.searchParams.get("type");
  const eventType = body.type ?? topic ?? "";

  return ["preapproval", "subscription_preapproval"].includes(eventType);
}

function mapPreapprovalStatus(status: string): SubscriptionStatus {
  if (status === "authorized") {
    return "active";
  }

  if (status === "pending") {
    return "pending";
  }

  if (["cancelled", "paused"].includes(status)) {
    return "cancelled";
  }

  return "past_due";
}

function parseExternalReference(externalReference?: string | null) {
  const [userId, planValue] = (externalReference ?? "").split("|");

  if (!userId || !planValue) {
    return null;
  }

  return {
    plan: getPlanByValue(planValue),
    userId,
  };
}

function buildUpdatePayload(status: SubscriptionStatus, plan: Plan, preapprovalId: string) {
  const now = new Date();
  const nextPeriodEnd = addMonths(now, 1);
  const payload: Record<string, string | number | null> = {
    status,
    provider: "mercadopago",
    mercadopago_preapproval_id: preapprovalId,
    plan_name: plan.name,
    branch_limit: plan.branchLimit,
    amount: plan.amount,
  };

  if (status === "active") {
    payload.cancelled_at = null;
    payload.current_period_start = now.toISOString();
    payload.current_period_end = nextPeriodEnd.toISOString();
  }

  if (status === "cancelled") {
    payload.cancelled_at = now.toISOString();
  }

  if (status === "past_due") {
    payload.current_period_end = now.toISOString();
  }

  return payload;
}

function preserveValidStatusForPending(
  status: SubscriptionStatus,
  subscription: Subscription | null,
): SubscriptionStatus {
  if (status !== "pending") {
    return status;
  }

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

async function getProfileEmail(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", userId)
    .maybeSingle();

  return typeof data?.email === "string" ? data.email : null;
}

async function sendSubscriptionEventEmail({
  email,
  previousStatus,
  status,
  planName,
}: {
  email: string | null;
  previousStatus?: SubscriptionStatus;
  status: SubscriptionStatus;
  planName: string;
}) {
  if (!email) {
    return;
  }

  if (status === "active" && previousStatus === "active") {
    await sendRenewalSuccessEmail(email, planName);
    return;
  }

  if (status === "active") {
    await sendSubscriptionActivatedEmail(email, planName);
    return;
  }

  if (status === "cancelled") {
    await sendCancellationEmail(email);
    return;
  }

  if (status === "past_due") {
    await sendPaymentFailedEmail(email);
  }
}

export async function POST(request: Request) {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

  if (!accessToken) {
    return NextResponse.json({ received: true, skipped: "Mercado Pago no configurado." });
  }

  const body = (await request.json().catch(() => ({}))) as MercadoPagoWebhookBody;

  if (!isPreapprovalEvent(request, body)) {
    return NextResponse.json({ received: true, skipped: "Evento no relacionado con preapproval." });
  }

  const preapprovalId = getWebhookResourceId(request, body);

  if (!preapprovalId) {
    return NextResponse.json({ received: true, skipped: "Evento sin preapproval id." });
  }

  const preapprovalResponse = await fetch(`https://api.mercadopago.com/preapproval/${preapprovalId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!preapprovalResponse.ok) {
    return NextResponse.json(
      { error: "No se pudo consultar la suscripcion en Mercado Pago." },
      { status: preapprovalResponse.status },
    );
  }

  const preapproval = (await preapprovalResponse.json()) as MercadoPagoPreapproval;
  const reference = parseExternalReference(preapproval.external_reference);

  if (!reference?.plan) {
    return NextResponse.json({
      received: true,
      skipped: "Suscripcion sin external_reference valido.",
    });
  }

  const supabase = createAdminClient() as unknown as SupabaseClient;
  const { data: currentSubscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", reference.userId)
    .maybeSingle();
  const status = preserveValidStatusForPending(
    mapPreapprovalStatus(preapproval.status),
    (currentSubscription as Subscription | null) ?? null,
  );
  const previousStatus = (currentSubscription as Subscription | null)?.status;
  const { error } = await supabase
    .from("subscriptions")
    .upsert(
      {
        user_id: reference.userId,
        ...buildUpdatePayload(status, reference.plan, preapproval.id),
      },
      { onConflict: "user_id" },
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  try {
    await sendSubscriptionEventEmail({
      email: await getProfileEmail(supabase, reference.userId),
      planName: reference.plan.name,
      previousStatus,
      status,
    });
  } catch (error) {
    console.error("No se pudo enviar el correo transaccional de suscripcion.", error);
  }

  return NextResponse.json({ received: true, status });
}
