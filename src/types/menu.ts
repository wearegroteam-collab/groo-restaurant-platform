export type Money = {
  amount: number;
  currency: "COP" | "USD";
};

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: Money;
  imageUrl: string;
  isAvailable: boolean;
  tags?: string[];
};

export type MenuBanner = {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
};

export type MenuCategory = {
  id: string;
  name: string;
  description?: string;
  items: MenuItem[];
};

export type Restaurant = {
  id: string;
  slug: string;
  name: string;
  description: string;
  location: string;
  address: string;
  logoUrl: string;
  googleMapsUrl: string;
  whatsappUrl: string;
  banners: MenuBanner[];
  menu: MenuCategory[];
};
