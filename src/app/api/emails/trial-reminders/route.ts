import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendTrialExpiringEmail } from "@/lib/email/transactional";

type TrialSubscriptionRow = {
  trial_end: string;
  user_id: string;
};

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function formatTrialEnd(value: string) {
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "long",
  }).format(new Date(value));
}

async function getProfileEmails(supabase: SupabaseClient, userIds: string[]) {
  const { data, error } = await supabase.from("profiles").select("id,email").in("id", userIds);

  if (error) {
    throw new Error(error.message);
  }

  return new Map(
    (data ?? []).map((profile: { id: string; email: string }) => [profile.id, profile.email]),
  );
}

export async function POST(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");

  if (cronSecret && authorization !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const now = new Date();
  const from = addDays(now, 3);
  const to = addDays(now, 4);
  const supabase = createAdminClient() as unknown as SupabaseClient;
  const { data, error } = await supabase
    .from("subscriptions")
    .select("user_id,trial_end")
    .eq("status", "trialing")
    .gte("trial_end", from.toISOString())
    .lt("trial_end", to.toISOString());

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const subscriptions = (data ?? []) as TrialSubscriptionRow[];
  const emailsByUser = await getProfileEmails(
    supabase,
    subscriptions.map((subscription) => subscription.user_id),
  );

  let sent = 0;

  for (const subscription of subscriptions) {
    const email = emailsByUser.get(subscription.user_id);

    if (!email) {
      continue;
    }

    try {
      await sendTrialExpiringEmail(email, formatTrialEnd(subscription.trial_end));
      sent += 1;
    } catch (error) {
      console.error("No se pudo enviar recordatorio de trial.", error);
    }
  }

  return NextResponse.json({ sent });
}
