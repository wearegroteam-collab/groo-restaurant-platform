import { redirect } from "next/navigation";
import type { Route } from "next";
import { createClient } from "@/lib/supabase/server";
import { sendWelcomeEmail } from "@/lib/email/transactional";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/auth/confirmed";

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user?.email) {
      try {
        await sendWelcomeEmail(user.email);
      } catch (error) {
        console.error("No se pudo enviar el correo de bienvenida.", error);
      }
    }
  }

  redirect(next as Route);
}
