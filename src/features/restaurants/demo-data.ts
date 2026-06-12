import type { Restaurant } from "@/types/menu";

const logo =
  "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=256&q=80";
const bannerOne =
  "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1400&q=85";
const bannerTwo =
  "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1400&q=85";

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
    theme: "light",
    isActive: true,
    canShowPublicMenu: true,
    addonGroups,
    banners: [
      {
        id: "demo_banner_one",
        title: "Combo del dia listo para pedir",
        subtitle: "Hamburguesa clasica, papas loaded y limonada natural.",
        imageUrl: bannerOne,
      },
      {
        id: "demo_banner_two",
        title: "Pizzas y promociones visibles",
        subtitle: "Banners, categorias y productos listos para vender desde el celular.",
        imageUrl: bannerTwo,
      },
    ],
    menu: [
      {
        id: "demo_cat_burgers",
        name: "Combos",
        description: "Favoritas para pedir por WhatsApp.",
        items: [
          {
            id: "demo_item_combo",
            name: "Combo del dia",
            description: "Hamburguesa clasica, papas loaded y limonada natural.",
            price: { amount: 42000, currency: "COP" },
            imageUrl:
              "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=800&q=85",
            isAvailable: true,
            addonGroupIds: ["demo_addon_salsas", "demo_addon_extras"],
            addonGroups,
            tags: ["Promo"],
          },
          {
            id: "demo_item_clasica",
            name: "Hamburguesa clasica",
            description: "Carne artesanal, queso, vegetales frescos y salsa de la casa.",
            price: { amount: 25000, currency: "COP" },
            imageUrl:
              "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=85",
            isAvailable: true,
            addonGroupIds: ["demo_addon_salsas", "demo_addon_extras"],
            addonGroups,
            tags: ["Mas vendida"],
          },
          {
            id: "demo_item_papas_loaded",
            name: "Papas loaded",
            description: "Papas crocantes con queso, tocineta, cebollin y salsa de la casa.",
            price: { amount: 22000, currency: "COP" },
            imageUrl:
              "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?auto=format&fit=crop&w=800&q=85",
            isAvailable: true,
            addonGroupIds: ["demo_addon_salsas"],
            addonGroups: addonGroups.filter((group) => group.id === "demo_addon_salsas"),
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
            name: "Pizza personal",
            description: "Masa delgada, queso mozzarella, pepperoni y oregano.",
            price: { amount: 28000, currency: "COP" },
            imageUrl:
              "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=85",
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
            name: "Limonada natural",
            description: "Preparada al momento.",
            price: { amount: 8000, currency: "COP" },
            imageUrl:
              "https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&w=800&q=85",
            isAvailable: true,
          },
        ],
      },
    ],
  },
];
