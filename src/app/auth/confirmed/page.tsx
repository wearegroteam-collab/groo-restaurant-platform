import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";

export const metadata = {
  title: "Correo confirmado | Menu SaaS",
  description: "Tu correo fue confirmado correctamente.",
};

export default function AuthConfirmedPage() {
  return (
    <main className="min-h-screen bg-brand-50 text-ink">
      <Container className="grid min-h-screen place-items-center py-10">
        <section className="w-full max-w-md rounded-lg border border-ink/10 bg-white p-6 text-center shadow-sm">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand-100 text-brand-900">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="mt-5 text-2xl font-bold">Correo confirmado correctamente</h1>
          <p className="mt-3 text-sm leading-6 text-ink/65">
            Ya puedes iniciar sesion para crear tu menu digital.
          </p>
          <Button asChild className="mt-6 w-full">
            <Link href="/login">Iniciar sesion</Link>
          </Button>
        </section>
      </Container>
    </main>
  );
}
