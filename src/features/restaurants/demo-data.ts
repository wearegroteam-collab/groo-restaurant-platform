import type { Restaurant } from "@/types/menu";

function svgDataUri(svg: string) {
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

const logo = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
  <rect width="256" height="256" rx="56" fill="#172018"/>
  <circle cx="128" cy="108" r="54" fill="#84cc16"/>
  <path d="M72 168h112v18H72z" fill="#ecfccb"/>
  <path d="M90 108c10-25 66-25 76 0 5 14-4 34-38 34s-43-20-38-34z" fill="#172018"/>
</svg>`);

const bannerOne = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="600" viewBox="0 0 1200 600">
  <defs>
    <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
      <stop stop-color="#172018"/>
      <stop offset="1" stop-color="#365314"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="600" fill="url(#g)"/>
  <circle cx="880" cy="160" r="210" fill="#84cc16" opacity=".42"/>
  <circle cx="980" cy="360" r="120" fill="#ecfccb" opacity=".28"/>
  <rect x="90" y="120" width="390" height="250" rx="42" fill="#f8faf3" opacity=".12"/>
  <text x="90" y="455" fill="#ecfccb" font-family="Arial" font-size="58" font-weight="800">Combos listos para pedir</text>
</svg>`);

const bannerTwo = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="600" viewBox="0 0 1200 600">
  <rect width="1200" height="600" fill="#0c120f"/>
  <rect x="90" y="90" width="1020" height="420" rx="52" fill="#111a15"/>
  <circle cx="250" cy="300" r="120" fill="#84cc16"/>
  <circle cx="620" cy="300" r="120" fill="#f8faf3" opacity=".22"/>
  <circle cx="990" cy="300" r="120" fill="#65a30d" opacity=".82"/>
  <text x="90" y="560" fill="#ecfccb" font-family="Arial" font-size="52" font-weight="800">Promociones destacadas</text>
</svg>`);

const addonGroups = [
  {
    id: "demo_addon_salsas",
    name: "Salsas",
    required: false,
    multiple: true,
    minSelect: 0,
    maxSelect: 3,
    options: [
      {
        id: "demo_salsa_ajo",
        name: "Ajo cremoso",
        price: { amount: 2000, currency: "COP" as const },
        available: true,
      },
      {
        id: "demo_salsa_bbq",
        name: "BBQ ahumada",
        price: { amount: 2500, currency: "COP" as const },
        available: true,
      },
    ],
  },
  {
    id: "demo_addon_extras",
    name: "Extras",
    required: false,
    multiple: true,
    minSelect: 0,
    maxSelect: 4,
    options: [
      {
        id: "demo_extra_queso",
        name: "Queso extra",
        price: { amount: 3500, currency: "COP" as const },
        available: true,
      },
      {
        id: "demo_extra_tocineta",
        name: "Tocineta",
        price: { amount: 5000, currency: "COP" as const },
        available: true,
      },
    ],
  },
];

export const demoRestaurants: Restaurant[] = [
  {
    id: "demo_restaurant",
    slug: "demo",
    name: "Demo Restaurante",
    description: "Menu de ejemplo para probar pedidos, adiciones y carrito.",
    location: "Colombia",
    address: "Calle 123 #45-67, Colombia",
    logoUrl: logo,
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=restaurante+demo",
    whatsappUrl: "3001234567",
    theme: "dark",
    isActive: true,
    canShowPublicMenu: true,
    addonGroups,
    banners: [
      {
        id: "demo_banner_one",
        title: "Pide sin llamadas ni confusiones",
        subtitle: "Tus clientes agregan productos, extras y envian el pedido por WhatsApp.",
        imageUrl: bannerOne,
      },
      {
        id: "demo_banner_two",
        title: "Destaca tus promociones",
        subtitle: "Banners, categorias y productos listos para vender desde el celular.",
        imageUrl: bannerTwo,
      },
    ],
    menu: [
      {
        id: "demo_cat_burgers",
        name: "Hamburguesas",
        description: "Favoritas para pedir por WhatsApp.",
        items: [
          {
            id: "demo_item_clasica",
            name: "Hamburguesa Clasica",
            description: "Carne artesanal, queso, vegetales frescos y salsa de la casa.",
            price: { amount: 25000, currency: "COP" },
            imageUrl: "",
            isAvailable: true,
            addonGroupIds: ["demo_addon_salsas", "demo_addon_extras"],
            addonGroups,
            tags: ["Mas vendida"],
          },
          {
            id: "demo_item_doble",
            name: "Hamburguesa Doble",
            description: "Doble carne, doble queso, cebolla caramelizada y papas.",
            price: { amount: 34000, currency: "COP" },
            imageUrl: "",
            isAvailable: true,
            addonGroupIds: ["demo_addon_extras"],
            addonGroups: addonGroups.filter((group) => group.id === "demo_addon_extras"),
            tags: ["Recomendada"],
          },
        ],
      },
      {
        id: "demo_cat_pizzas",
        name: "Pizzas",
        description: "Porciones y pizzas personales.",
        items: [
          {
            id: "demo_item_pepperoni",
            name: "Pizza Pepperoni",
            description: "Masa delgada, queso mozzarella y pepperoni crocante.",
            price: { amount: 28000, currency: "COP" },
            imageUrl: "",
            isAvailable: true,
            addonGroupIds: ["demo_addon_extras"],
            addonGroups: addonGroups.filter((group) => group.id === "demo_addon_extras"),
          },
          {
            id: "demo_item_hawaiana",
            name: "Pizza Hawaiana",
            description: "Queso mozzarella, jamon y pina.",
            price: { amount: 26000, currency: "COP" },
            imageUrl: "",
            isAvailable: false,
          },
        ],
      },
      {
        id: "demo_cat_bebidas",
        name: "Bebidas",
        description: "Bebidas frias para completar el pedido.",
        items: [
          {
            id: "demo_item_cola",
            name: "Coca Cola",
            description: "Bebida fria 400 ml.",
            price: { amount: 5500, currency: "COP" },
            imageUrl: "",
            isAvailable: true,
          },
          {
            id: "demo_item_limonada",
            name: "Limonada Natural",
            description: "Preparada al momento.",
            price: { amount: 8000, currency: "COP" },
            imageUrl: "",
            isAvailable: true,
          },
        ],
      },
    ],
  },
];
