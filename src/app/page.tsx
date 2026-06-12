import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  Check,
  Clock,
  LayoutDashboard,
  MessageCircle,
  Moon,
  Plus,
  QrCode,
  ShoppingBag,
  Smartphone,
  Store,
  Utensils,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";

const proofPoints = [
  "Sin comisiones por venta",
  "Desde $30.000/mes",
  "Ideal para restaurantes en Colombia",
];

const problems = [
  "Clientes preguntando precios por WhatsApp",
  "Menus en PDF dificiles de actualizar",
  "Pedidos incompletos o desordenados",
  "Promociones que no se ven a tiempo",
];

const solutions = [
  "Productos organizados por categorias",
  "Carrito con pedido automatico a WhatsApp",
  "Adiciones y extras para aumentar el ticket",
  "Banners para destacar promociones",
  "Temas claro y oscuro",
  "Panel facil de usar",
];

const steps = [
  "Crea tu cuenta",
  "Configura tu restaurante",
  "Agrega productos y precios",
  "Comparte tu enlace o QR",
  "Recibe pedidos por WhatsApp",
];

const plans = [
  {
    name: "Plan 1 sucursal",
    price: "$30.000 COP",
    description: "Para empezar con un menu digital completo.",
    features: [
      "1 menu digital",
      "Productos y categorias",
      "Carrito por WhatsApp",
      "Adiciones y extras",
      "Tema claro/oscuro",
    ],
  },
  {
    name: "Plan 2 sucursales",
    price: "$60.000 COP",
    description: "Incluye todo lo anterior para 2 sucursales.",
    features: [
      "2 menus digitales",
      "Gestion por restaurante",
      "Pedidos por WhatsApp",
      "Promociones y banners",
      "Panel administrativo",
    ],
  },
  {
    name: "Plan 3 sucursales",
    price: "$80.000 COP",
    description: "Ideal para negocios con varias sedes.",
    features: [
      "3 menus digitales",
      "Varias sedes",
      "Productos por sucursal",
      "Adiciones y extras",
      "Temas visuales",
    ],
  },
];

const idealFor = [
  "Restaurantes",
  "Hamburgueserias",
  "Pizzerias",
  "Comidas rapidas",
  "Cafeterias",
  "Food trucks",
];

const faqs = [
  {
    question: "Necesito pagina web?",
    answer: "No. La plataforma crea un enlace de menu digital que puedes compartir por WhatsApp, redes sociales o QR.",
  },
  {
    question: "Cobran comision por pedido?",
    answer: "No. Pagas tu plan mensual y los pedidos llegan directo a tu WhatsApp sin comision por venta.",
  },
  {
    question: "Puedo cambiar precios cuando quiera?",
    answer: "Si. Desde el panel puedes editar productos, precios, disponibilidad, banners y adiciones.",
  },
  {
    question: "Los pedidos llegan directo a WhatsApp?",
    answer: "Si. El cliente arma el pedido y la plataforma genera el mensaje listo para enviar a tu WhatsApp.",
  },
  {
    question: "Puedo usarlo para varias sucursales?",
    answer: "Si. Hay planes para 1, 2 y 3 sucursales, cada una con su propio menu.",
  },
];

export default function HomePage() {
  return (
    <main className="bg-[#f8faf3] text-ink">
      <section className="relative overflow-hidden bg-ink text-white">
        <div className="absolute inset-x-0 top-0 h-1 bg-brand-500" />
        <Container className="relative grid min-h-screen content-center gap-10 py-16 lg:grid-cols-[1fr_0.88fr] lg:items-center">
          <div className="space-y-7">
            <p className="inline-flex rounded-full border border-brand-100/25 bg-white/8 px-3 py-1 text-sm font-semibold text-brand-100">
              Menus digitales que convierten chats en pedidos
            </p>
            <div className="space-y-4">
              <h1 className="max-w-4xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
                Recibe pedidos por WhatsApp con tu propio menu digital
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-white/76">
                Crea tu menu en minutos, actualiza precios cuando quieras y permite que tus
                clientes hagan pedidos desde su celular sin llamadas ni confusiones.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild>
                <Link href="/signup">
                  Probar gratis 14 dias <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/demo/menu">Ver ejemplo</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/login">Ingresar</Link>
              </Button>
            </div>
            <div className="grid gap-2 text-sm font-semibold text-white/80 sm:grid-cols-3">
              {proofPoints.map((point) => (
                <div className="flex items-center gap-2" key={point}>
                  <Check className="h-4 w-4 text-brand-100" />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>

          <HeroMockup />
        </Container>
      </section>

      <section className="py-16">
        <Container className="grid gap-8">
          <SectionIntro
            eyebrow="Problema"
            title="Deja de perder pedidos por tener un menu desactualizado"
          />
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {problems.map((problem) => (
              <article className="rounded-lg border border-red-100 bg-white p-5 shadow-sm" key={problem}>
                <AlertCircle className="mb-4 h-6 w-6 text-red-500" />
                <h3 className="font-bold">{problem}</h3>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-white py-16">
        <Container className="grid gap-8">
          <SectionIntro eyebrow="Solucion" title="Todo tu menu listo para vender" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {solutions.map((solution) => (
              <article className="rounded-lg border border-ink/10 bg-[#f8faf3] p-5" key={solution}>
                <BadgeCheck className="mb-4 h-6 w-6 text-brand-600" />
                <h3 className="font-bold">{solution}</h3>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-16">
        <Container className="grid gap-8">
          <SectionIntro
            eyebrow="Mockups"
            title="Una experiencia pensada para vender desde el celular"
          />
          <div className="grid gap-5 lg:grid-cols-3">
            <PhoneMenuMockup />
            <CartMockup />
            <AdminMockup />
          </div>
        </Container>
      </section>

      <section className="bg-ink py-16 text-white">
        <Container className="grid gap-8">
          <SectionIntro
            eyebrow="Como funciona"
            title="Empieza a recibir pedidos en 5 pasos"
            inverse
          />
          <div className="grid gap-4 lg:grid-cols-5">
            {steps.map((step, index) => (
              <article className="rounded-lg border border-white/10 bg-white/8 p-5" key={step}>
                <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-500 text-sm font-black text-ink">
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
          <SectionIntro
            eyebrow="Planes"
            title="Planes simples para restaurantes en Colombia"
          />
          <p className="rounded-lg border border-brand-100 bg-brand-50 p-4 text-sm font-bold text-brand-900">
            Empieza con 14 dias gratis para tu primera sucursal.
          </p>
          <div className="grid gap-5 lg:grid-cols-3">
            {plans.map((plan, index) => (
              <article
                className={`rounded-lg border bg-white p-6 shadow-sm ${
                  index === 0 ? "border-brand-500" : "border-ink/10"
                }`}
                key={plan.name}
              >
                <p className="text-sm font-bold text-brand-700">{plan.name}</p>
                <h3 className="mt-2 text-3xl font-black">{plan.price}</h3>
                <p className="mt-1 text-sm font-semibold text-ink/60">/ mes</p>
                <p className="mt-4 min-h-12 text-sm leading-6 text-ink/65">{plan.description}</p>
                <div className="mt-5 grid gap-3">
                  {plan.features.map((feature) => (
                    <div className="flex items-start gap-2 text-sm" key={feature}>
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                      <span className="font-semibold">{feature}</span>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
          <div>
            <Button asChild>
              <Link href="/signup">
                Comenzar prueba gratis <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </Container>
      </section>

      <section className="bg-white py-16">
        <Container className="grid gap-8">
          <SectionIntro
            eyebrow="Para quien es"
            title="Ideal para negocios que venden por WhatsApp"
          />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {idealFor.map((business) => (
              <article className="flex items-center gap-3 rounded-lg border border-ink/10 bg-[#f8faf3] p-5" key={business}>
                <Utensils className="h-5 w-5 text-brand-600" />
                <span className="font-bold">{business}</span>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-16">
        <Container className="grid gap-8">
          <SectionIntro eyebrow="FAQ" title="Preguntas frecuentes" />
          <div className="grid gap-3 lg:grid-cols-2">
            {faqs.map((faq) => (
              <article className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm" key={faq.question}>
                <h3 className="font-bold">{faq.question}</h3>
                <p className="mt-2 text-sm leading-6 text-ink/65">{faq.answer}</p>
              </article>
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
                  Listo para vender
                </p>
                <h2 className="text-3xl font-black sm:text-4xl">
                  Convierte tu menu en una herramienta de ventas
                </h2>
                <p className="mt-3 max-w-2xl leading-7 text-white/72">
                  Crea tu menu digital, compartelo con tus clientes y empieza a recibir pedidos
                  por WhatsApp con una prueba gratis de 14 dias.
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

function SectionIntro({
  eyebrow,
  title,
  inverse = false,
}: {
  eyebrow: string;
  title: string;
  inverse?: boolean;
}) {
  return (
    <div className="max-w-3xl">
      <p className={`text-sm font-black uppercase tracking-[0.16em] ${inverse ? "text-brand-100" : "text-brand-600"}`}>
        {eyebrow}
      </p>
      <h2 className="mt-2 text-3xl font-black leading-tight sm:text-4xl">{title}</h2>
    </div>
  );
}

function HeroMockup() {
  return (
    <div className="mx-auto w-full max-w-sm rounded-[2rem] border border-white/14 bg-white/10 p-3 shadow-soft">
      <div className="rounded-[1.5rem] bg-[#f8faf3] p-4 text-ink">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-ink text-white">
            <Store className="h-6 w-6" />
          </div>
          <div>
            <p className="font-black">Rush Burger</p>
            <p className="text-xs font-semibold text-ink/55">Abierto para pedidos</p>
          </div>
        </div>
        <div className="mt-4 rounded-lg bg-ink p-4 text-white">
          <p className="text-xs font-bold text-brand-100">Promo destacada</p>
          <h3 className="mt-1 text-2xl font-black">Combo doble + papas</h3>
          <p className="mt-2 text-sm text-white/70">$38.000 COP</p>
        </div>
        <div className="mt-4 flex gap-2 overflow-hidden">
          {["Burgers", "Bebidas", "Extras"].map((category, index) => (
            <span
              className={`rounded-full px-3 py-2 text-xs font-black ${
                index === 0 ? "bg-brand-500 text-ink" : "bg-ink/5 text-ink/60"
              }`}
              key={category}
            >
              {category}
            </span>
          ))}
        </div>
        <div className="mt-4 grid gap-3">
          {[
            ["Hamburguesa clasica", "$25.000"],
            ["Queso extra", "+ $3.000"],
          ].map(([name, price]) => (
            <div className="flex items-center gap-3 rounded-lg border border-ink/10 bg-white p-3" key={name}>
              <div className="grid h-14 w-14 place-items-center rounded-md bg-brand-50">
                <Utensils className="h-6 w-6 text-brand-700" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold">{name}</p>
                <p className="text-xs text-ink/55">Disponible</p>
              </div>
              <p className="text-sm font-black">{price}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-lg bg-brand-500 p-3 text-center text-sm font-black">
          Ordenar por WhatsApp
        </div>
      </div>
    </div>
  );
}

function PhoneMenuMockup() {
  return (
    <article className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Smartphone className="h-5 w-5 text-brand-600" />
        <h3 className="font-black">Menu publico en celular</h3>
      </div>
      <div className="rounded-[1.5rem] border border-ink/10 bg-[#f8faf3] p-3">
        <div className="h-24 rounded-lg bg-ink p-3 text-white">
          <p className="text-xs font-bold text-brand-100">Especial de hoy</p>
          <p className="mt-1 text-lg font-black">2x1 en pizzas</p>
        </div>
        <div className="mt-3 flex gap-2">
          {["Pizzas", "Bebidas", "Postres"].map((item, index) => (
            <span
              className={`rounded-full px-3 py-2 text-xs font-bold ${
                index === 0 ? "bg-ink text-white" : "bg-white text-ink/60"
              }`}
              key={item}
            >
              {item}
            </span>
          ))}
        </div>
        <div className="mt-3 grid gap-2">
          {[1, 2, 3].map((item) => (
            <div className="flex items-center gap-2 rounded-md bg-white p-2" key={item}>
              <div className="h-12 w-12 rounded-md bg-brand-100" />
              <div className="flex-1">
                <div className="h-3 w-24 rounded bg-ink/15" />
                <div className="mt-2 h-2 w-16 rounded bg-ink/10" />
              </div>
              <Plus className="h-4 w-4 text-brand-600" />
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

function CartMockup() {
  return (
    <article className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <ShoppingBag className="h-5 w-5 text-brand-600" />
        <h3 className="font-black">Carrito con WhatsApp</h3>
      </div>
      <div className="rounded-lg border border-ink/10 bg-[#f8faf3] p-4">
        <div className="flex items-center justify-between">
          <p className="font-black">Tu pedido</p>
          <span className="rounded-full bg-brand-500 px-3 py-1 text-xs font-black">3 items</span>
        </div>
        <div className="mt-4 grid gap-3 text-sm">
          <div>
            <p className="font-bold">2 x Hamburguesa clasica</p>
            <p className="text-ink/55">Adiciones: queso extra</p>
          </div>
          <div>
            <p className="font-bold">1 x Coca Cola</p>
            <p className="text-ink/55">Sin adiciones</p>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-ink/10 pt-4">
          <span className="font-bold">Total estimado</span>
          <span className="text-xl font-black">$55.000</span>
        </div>
        <div className="mt-4 rounded-lg bg-brand-500 p-3 text-center text-sm font-black">
          Enviar pedido por WhatsApp
        </div>
      </div>
    </article>
  );
}

function AdminMockup() {
  return (
    <article className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <LayoutDashboard className="h-5 w-5 text-brand-600" />
        <h3 className="font-black">Panel administrativo</h3>
      </div>
      <div className="rounded-lg border border-ink/10 bg-ink p-4 text-white">
        <div className="flex gap-2">
          {["Productos", "Banners", "Plan"].map((tab, index) => (
            <span
              className={`rounded-md px-3 py-2 text-xs font-bold ${
                index === 0 ? "bg-brand-500 text-ink" : "bg-white/10 text-white/70"
              }`}
              key={tab}
            >
              {tab}
            </span>
          ))}
        </div>
        <div className="mt-4 grid gap-3">
          <div className="rounded-md bg-white/10 p-3">
            <div className="flex items-center justify-between">
              <span className="font-bold">Hamburguesa doble</span>
              <span className="text-brand-100">$32.000</span>
            </div>
          </div>
          <div className="rounded-md bg-white/10 p-3">
            <div className="flex items-center justify-between">
              <span className="font-bold">Banner promocion</span>
              <Clock className="h-4 w-4 text-brand-100" />
            </div>
          </div>
          <div className="rounded-md bg-white/10 p-3">
            <div className="flex items-center justify-between">
              <span className="font-bold">Tema oscuro</span>
              <Moon className="h-4 w-4 text-brand-100" />
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2 rounded-lg bg-brand-50 p-3 text-sm font-bold text-brand-900">
        <QrCode className="h-4 w-4" />
        Listo para compartir por QR o enlace
      </div>
    </article>
  );
}
