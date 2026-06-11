import type { Restaurant } from "@/types/menu";

export const restaurants: Restaurant[] = [
  {
    id: "rest_hangar",
    slug: "hangar",
    name: "Hangar Gastrobar",
    description: "Comida casual, cocteles de autor y platos para compartir.",
    location: "San Andres, Colombia",
    address: "Av. Colombia, zona comercial, San Andres",
    logoUrl:
      "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=256&q=80",
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Hangar+Gastrobar+San+Andres",
    whatsappUrl: "https://wa.me/573001112233",
    banners: [
      {
        id: "banner_burger",
        title: "Sabores de pista completa",
        subtitle: "Burgers, cocteles y platos para compartir.",
        imageUrl:
          "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1200&q=80",
      },
      {
        id: "banner_cocteles",
        title: "Cocteles al atardecer",
        subtitle: "La casa recomienda frescos, frutales y con mucho caracter.",
        imageUrl:
          "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=1200&q=80",
      },
      {
        id: "banner_compartir",
        title: "Mesa para compartir",
        subtitle: "Entradas calientes y platos fuertes para llegar con hambre.",
        imageUrl:
          "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80",
      },
    ],
    menu: [
      {
        id: "cat_entradas",
        name: "Entradas",
        description: "Para abrir mesa y compartir.",
        items: [
          {
            id: "item_alitas",
            name: "Alitas Hangar",
            description: "Alitas crocantes con salsa de la casa y dip cremoso.",
            price: { amount: 32000, currency: "COP" },
            imageUrl:
              "https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&w=600&q=80",
            isAvailable: true,
            tags: ["Picante suave"],
          },
          {
            id: "item_patacones",
            name: "Patacones mixtos",
            description: "Patacones con carne desmechada, pico de gallo y queso.",
            price: { amount: 28000, currency: "COP" },
            imageUrl:
              "https://images.unsplash.com/photo-1625944525533-473f1a3d54e7?auto=format&fit=crop&w=600&q=80",
            isAvailable: true,
          },
        ],
      },
      {
        id: "cat_fuertes",
        name: "Platos fuertes",
        description: "Favoritos de la casa.",
        items: [
          {
            id: "item_burger",
            name: "Hamburguesa Hangar",
            description: "Carne artesanal, queso, cebolla caramelizada y papas.",
            price: { amount: 39000, currency: "COP" },
            imageUrl:
              "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80",
            isAvailable: true,
            tags: ["Recomendado"],
          },
          {
            id: "item_tacos",
            name: "Tacos de birria",
            description: "Tortillas suaves, birria jugosa, cilantro y consome.",
            price: { amount: 36000, currency: "COP" },
            imageUrl:
              "https://images.unsplash.com/photo-1613514785940-daed07799d9b?auto=format&fit=crop&w=600&q=80",
            isAvailable: false,
          },
        ],
      },
      {
        id: "cat_bebidas",
        name: "Bebidas",
        description: "Cocteles, jugos y bebidas sin alcohol.",
        items: [
          {
            id: "item_coctel",
            name: "Coctel de la casa",
            description: "Frutal, fresco y servido con garnish tropical.",
            price: { amount: 30000, currency: "COP" },
            imageUrl:
              "https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&w=600&q=80",
            isAvailable: true,
          },
        ],
      },
    ],
  },
  {
    id: "rest_origen",
    slug: "origen",
    name: "Origen Cocina Local",
    description: "Recetas frescas, ingredientes locales y cocina de temporada.",
    location: "San Andres, Colombia",
    address: "Calle 3, centro, San Andres",
    logoUrl:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=256&q=80",
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Origen+Cocina+Local+San+Andres",
    whatsappUrl: "https://wa.me/573009998877",
    banners: [
      {
        id: "banner_origen_1",
        title: "Cocina local con alma",
        subtitle: "Platos frescos para probar el sabor de la isla.",
        imageUrl:
          "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
      },
      {
        id: "banner_origen_2",
        title: "Especiales del dia",
        subtitle: "Ingredientes de temporada y recetas ligeras.",
        imageUrl:
          "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=1200&q=80",
      },
    ],
    menu: [
      {
        id: "cat_origen_fuertes",
        name: "Platos principales",
        description: "Cocina fresca para almorzar o cenar.",
        items: [
          {
            id: "item_origen_pescado",
            name: "Pescado isleño",
            description: "Filete fresco con arroz de coco y ensalada.",
            price: { amount: 46000, currency: "COP" },
            imageUrl:
              "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80",
            isAvailable: true,
            tags: ["Fresco"],
          },
          {
            id: "item_origen_bowl",
            name: "Bowl tropical",
            description: "Vegetales, aguacate, fruta fresca y proteina del dia.",
            price: { amount: 34000, currency: "COP" },
            imageUrl:
              "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80",
            isAvailable: true,
          },
        ],
      },
      {
        id: "cat_origen_bebidas",
        name: "Bebidas naturales",
        description: "Jugos, sodas y bebidas sin alcohol.",
        items: [
          {
            id: "item_origen_jugo",
            name: "Jugo tropical",
            description: "Fruta natural preparada al momento.",
            price: { amount: 14000, currency: "COP" },
            imageUrl:
              "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?auto=format&fit=crop&w=600&q=80",
            isAvailable: true,
          },
        ],
      },
    ],
  },
  {
    id: "rest_cocobar",
    slug: "cocobar",
    name: "Cocobar",
    description: "Bar tropical con snacks, cocteles y ambiente frente al mar.",
    location: "San Andres, Colombia",
    address: "Avenida Newball, sector playa, San Andres",
    logoUrl:
      "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=256&q=80",
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Cocobar+San+Andres",
    whatsappUrl: "https://wa.me/573005554433",
    banners: [
      {
        id: "banner_cocobar_1",
        title: "Cocteles frente al mar",
        subtitle: "Bebidas frias, snacks y musica para cerrar el dia.",
        imageUrl:
          "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=1200&q=80",
      },
      {
        id: "banner_cocobar_2",
        title: "Hora de compartir",
        subtitle: "Picadas y platos rapidos para la mesa.",
        imageUrl:
          "https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=1200&q=80",
      },
    ],
    menu: [
      {
        id: "cat_cocobar_snacks",
        name: "Snacks",
        description: "Para compartir con bebidas.",
        items: [
          {
            id: "item_cocobar_nachos",
            name: "Nachos playeros",
            description: "Nachos con queso, pico de gallo y salsa de la casa.",
            price: { amount: 30000, currency: "COP" },
            imageUrl:
              "https://images.unsplash.com/photo-1513456852971-30b0c0f920cd?auto=format&fit=crop&w=600&q=80",
            isAvailable: true,
            tags: ["Para compartir"],
          },
          {
            id: "item_cocobar_camarones",
            name: "Camarones crispy",
            description: "Camarones apanados con salsa cítrica.",
            price: { amount: 42000, currency: "COP" },
            imageUrl:
              "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=600&q=80",
            isAvailable: true,
          },
        ],
      },
      {
        id: "cat_cocobar_cocteles",
        name: "Cocteles",
        description: "Clasicos y tropicales.",
        items: [
          {
            id: "item_cocobar_mojito",
            name: "Mojito coco",
            description: "Ron, hierbabuena, limon y toque de coco.",
            price: { amount: 28000, currency: "COP" },
            imageUrl:
              "https://images.unsplash.com/photo-1587223962930-cb7f31384c19?auto=format&fit=crop&w=600&q=80",
            isAvailable: true,
          },
        ],
      },
    ],
  },
];

export function getRestaurantBySlug(slug: string) {
  return restaurants.find((restaurant) => restaurant.slug === slug);
}
