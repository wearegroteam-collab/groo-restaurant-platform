import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAppUrl } from "@/lib/config/app-url";
import { sendConfirmationEmail } from "@/lib/email/transactional";

type SignupBody = {
  email?: string;
  password?: string;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as SignupBody;
  const email = body.email?.trim().toLowerCase();
  const password = body.password ?? "";

  if (!email || !password) {
    return NextResponse.json({ error: "Email y password son obligatorios." }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "La contrasena debe tener al menos 6 caracteres." },
      { status: 400 },
    );
  }

  const supabase = createAdminClient();
  const redirectTo = `${getAppUrl()}/auth/callback?next=/auth/confirmed`;
  const { data, error } = await supabase.auth.admin.generateLink({
    email,
    password,
    type: "signup",
    options: {
      redirectTo,
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const confirmationUrl = data.properties?.action_link;

  if (!confirmationUrl) {
    return NextResponse.json(
      { error: "No se pudo generar el enlace de confirmacion." },
      { status: 500 },
    );
  }

  await sendConfirmationEmail(email, confirmationUrl);

  return NextResponse.json({ ok: true });
}
