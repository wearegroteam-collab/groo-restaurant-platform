import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  LayoutDashboard,
  MessageCircle,
  Moon,
  ShoppingBag,
  Smartphone,
  Utensils,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";

const benefits = [
  "Menu digital personalizable",
  "Panel facil de usar",
  "Carrito con pedido por WhatsApp",
  "Adiciones y extras",
  "Temas claro y oscuro",
  "Sin comisiones por venta",
];

const steps = [
  "Crea tu cuenta",
  "Configura tu restaurante",
  "Agrega productos",
  "Comparte tu enlace",
  "Recibe pedidos por WhatsApp",
];

const idealFor = [
  "Restaurantes",
  "Hamburgueserias",
  "Comidas rapidas",
  "Pizzerias",
  "Cafeterias",
  "Food trucks",
];

const includedFeatures = [
  "Productos",
  "Categorias",
  "Banners",
  "Adiciones",
  "Carrito",
  "WhatsApp automatico",
  "Temas visuales",
  "Panel administrativo",
];

const mockups = [
  {
    icon: Smartphone,
    title: "Menu publico",
    description: "Carta responsive con categorias, banners y productos listos para compartir.",
  },
  {
    icon: LayoutDashboard,
    title: "Panel admin",
    description: "Gestion por secciones para editar restaurante, productos, extras y banners.",
  },
  {
    icon: ShoppingBag,
    title: "Carrito",
    description: "Pedido con cantidades, adiciones y mensaje automatico para WhatsApp.",
  },
  {
    icon: Moon,
    title: "Tema oscuro",
    description: "Experiencia premium para restaurantes que quieren una carta mas elegante.",
  },
];

export default function HomePage() {
  return (
    <main className="bg-[#f8faf3] text-ink">
      <section className="relative overflow-hidden bg-ink text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(132,204,22,0.28),transparent_34%),radial-gradient(circle_at_85%_10%,rgba(236,252,203,0.14),transparent_30%)]" />
        <Container className="relative grid min-h-screen content-center gap-10 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="space-y-7">
            <p className="inline-flex rounded-full border border-brand-100/20 bg-white/8 px-3 py-1 text-sm font-semibold text-brand-100">
              SaaS de menus digitales para restaurantes
            </p>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
                Crea el menu digital de tu restaurante en minutos
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-white/75">
                Actualiza productos, precios, promociones y recibe pedidos por WhatsApp desde
                una sola plataforma.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild>
                <Link href="/signup">
                  Crear mi menu <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/hangar/menu">Ver demo</Link>
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/8 p-3 shadow-soft backdrop-blur">
            <div className="rounded-lg bg-[#f8faf3] p-4 text-ink">
              <div className="mb-4 overflow-hidden rounded-lg bg-ink text-white">
                <div className="h-32 bg-[radial-gradient(circle_at_25%_20%,rgba(132,204,22,0.45),transparent_35%),linear-gradient(135deg,#172018,#2b3b2c)]" />
                <div className="p-4">
                  <p className="text-sm font-semibold text-brand-100">Promocion destacada</p>
                  <h2 className="text-2xl font-bold">Combo del dia</h2>
                </div>
              </div>
              <div className="mb-4 flex gap-2 overflow-hidden">
                {["Burgers", "Bebidas", "Extras"].map((category, index) => (
                  <span
                    className={`rounded-full px-4 py-2 text-sm font-bold ${
                      index === 0 ? "bg-ink text-white" : "bg-ink/5 text-ink/65"
                    }`}
                    key={category}
                  >
                    {category}
                  </span>
                ))}
              </div>
              <div className="grid gap-3">
                {[
                  ["Hamburguesa clasica", "$25.000"],
                  ["Queso extra", "+ $3.000"],
                  ["Pedido por WhatsApp", "Listo"],
                ].map(([name, price]) => (
                  <div
                    className="flex items-center justify-between rounded-lg border border-ink/10 bg-white p-3"
                    key={name}
                  >
                    <div>
                      <p className="font-bold">{name}</p>
                      <p className="text-sm text-ink/55">Disponible ahora</p>
                    </div>
                    <span className="text-sm font-bold text-brand-600">{price}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16">
        <Container className="grid gap-8">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand-600">
              Beneficios
            </p>
            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
              Todo lo que necesitas para vender mejor desde tu menu
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit) => (
              <article className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm" key={benefit}>
                <Check className="mb-4 h-6 w-6 text-brand-600" />
                <h3 className="font-bold">{benefit}</h3>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-white py-16">
        <Container className="grid gap-8">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand-600">
              Como funciona
            </p>
            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">De cero a recibir pedidos</h2>
          </div>
          <div className="grid gap-4 lg:grid-cols-5">
            {steps.map((step, index) => (
              <article className="rounded-lg border border-ink/10 bg-[#f8faf3] p-5" key={step}>
                <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-500 text-sm font-bold text-ink">
                  {index + 1}
                </span>
                <h3 className="mt-4 font-bold">{step}</h3>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-16">
        <Container className="grid gap-8">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand-600">
              Vista de la plataforma
            </p>
            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
              Una experiencia lista para restaurante y cliente
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {mockups.map((mockup) => (
              <article className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm" key={mockup.title}>
                <div className="mb-5 grid h-14 w-14 place-items-center rounded-lg bg-brand-100 text-brand-900">
                  <mockup.icon className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-bold">{mockup.title}</h3>
                <p className="mt-2 text-sm leading-6 text-ink/65">{mockup.description}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-ink py-16 text-white">
        <Container className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand-100">
              Ideal para
            </p>
            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
              Negocios que quieren vender sin friccion
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {idealFor.map((business) => (
              <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/8 p-4" key={business}>
                <Utensils className="h-5 w-5 text-brand-100" />
                <span className="font-bold">{business}</span>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-16">
        <Container className="grid gap-8">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand-600">
              Incluido
            </p>
            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Funciones para operar tu menu</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {includedFeatures.map((feature) => (
              <div className="flex items-center gap-3 rounded-lg border border-ink/10 bg-white p-4" key={feature}>
                <BadgeCheck className="h-5 w-5 text-brand-600" />
                <span className="font-bold">{feature}</span>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="pb-16">
        <Container>
          <div className="overflow-hidden rounded-lg bg-ink p-8 text-white shadow-soft sm:p-10">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-brand-100">
                  <MessageCircle className="h-4 w-4" />
                  Empieza hoy mismo
                </p>
                <h2 className="text-3xl font-bold sm:text-4xl">Empieza hoy mismo</h2>
                <p className="mt-3 max-w-2xl leading-7 text-white/72">
                  Crea tu menu digital y recibe pedidos por WhatsApp sin pagar comisiones por venta.
                </p>
              </div>
              <Button asChild>
                <Link href="/signup">
                  Crear mi menu gratis <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
