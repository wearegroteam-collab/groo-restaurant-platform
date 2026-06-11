import Link from "next/link";
import { ArrowRight, BarChart3, Building2, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";

const features = [
  {
    icon: Smartphone,
    title: "Menus publicos",
    description: "Cartas rapidas, responsive y listas para QR por restaurante.",
  },
  {
    icon: Building2,
    title: "Multi-restaurante",
    description: "Estructura por tenant para operar varias marcas o sucursales.",
  },
  {
    icon: BarChart3,
    title: "Panel operativo",
    description: "Base inicial para productos, categorias, disponibilidad y reportes.",
  },
];

export default function HomePage() {
  return (
    <main>
      <section className="bg-ink text-white">
        <Container className="grid min-h-screen content-center gap-10 py-16 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div className="space-y-7">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-100">
              Plataforma SaaS para restaurantes
            </p>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
                Menus digitales y administracion en una sola base escalable.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-white/75">
                Una aplicacion preparada para menus publicos, panel administrativo,
                Supabase y crecimiento multi-restaurante desde el primer dia.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild>
                <Link href="/hangar/menu">
                  Ver menu demo <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/admin">Abrir panel</Link>
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/8 p-4 shadow-soft">
            <div className="rounded-md bg-white p-4 text-ink">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-ink/60">Menu activo</p>
                  <h2 className="text-xl font-bold">Hangar Gastrobar</h2>
                </div>
                <span className="rounded-full bg-brand-100 px-3 py-1 text-sm font-semibold text-brand-900">
                  Online
                </span>
              </div>
              <div className="grid gap-3">
                {["Hamburguesa Hangar", "Tacos de birria", "Coctel de la casa"].map(
                  (item) => (
                    <div
                      className="flex items-center justify-between rounded-md border border-ink/10 p-3"
                      key={item}
                    >
                      <span className="font-medium">{item}</span>
                      <span className="text-sm text-ink/60">Disponible</span>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16">
        <Container className="grid gap-4 md:grid-cols-3">
          {features.map((feature) => (
            <article className="rounded-lg border border-ink/10 bg-white p-6" key={feature.title}>
              <feature.icon className="mb-4 h-7 w-7 text-brand-600" />
              <h2 className="mb-2 text-xl font-bold">{feature.title}</h2>
              <p className="leading-7 text-ink/70">{feature.description}</p>
            </article>
          ))}
        </Container>
      </section>
    </main>
  );
}
