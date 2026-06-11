import { Suspense } from "react";
import { Container } from "@/components/layout/container";
import { LoginForm } from "@/features/auth/login-form";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-brand-50">
      <Container className="grid min-h-screen place-items-center py-10">
        <section className="w-full max-w-md rounded-lg border border-ink/10 bg-white p-6 shadow-soft">
          <div className="mb-6 space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-600">
              Acceso administrativo
            </p>
            <h1 className="text-3xl font-bold">Iniciar sesion</h1>
            <p className="text-sm leading-6 text-ink/60">
              Entra para administrar restaurantes, banners, categorias y productos.
            </p>
          </div>
          <Suspense>
            <LoginForm />
          </Suspense>
        </section>
      </Container>
    </main>
  );
}
