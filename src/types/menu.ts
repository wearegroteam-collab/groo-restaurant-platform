export type Money = {
  amount: number;
  currency: "COP" | "USD";
};

export type AddonOption = {
  id: string;
  name: string;
  price: Money;
  available: boolean;
};

export type AddonGroup = {
  id: string;
  name: string;
  required: boolean;
  multiple: boolean;
  minSelect: number;
  maxSelect: number | null;
  options: AddonOption[];
};

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: Money;
  imageUrl: string;
  isAvailable: boolean;
  isFeatured?: boolean;
  addonGroupIds?: string[];
  addonGroups?: AddonGroup[];
  tags?: string[];
};

export type MenuBanner = {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
};

export type MenuTheme = "light" | "dark";

export type RestaurantPopup = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  buttonText: string;
  buttonUrl: string;
  isActive: boolean;
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
  theme: MenuTheme;
  isActive?: boolean;
  canShowPublicMenu?: boolean;
  popup?: RestaurantPopup | null;
  banners: MenuBanner[];
  addonGroups: AddonGroup[];
  menu: MenuCategory[];
};
