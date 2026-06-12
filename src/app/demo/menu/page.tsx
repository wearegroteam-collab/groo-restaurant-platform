import { PublicMenuExperience } from "@/components/menu/public-menu-experience";
import { demoRestaurants } from "@/features/restaurants/demo-data";

export const metadata = {
  title: "Demo Restaurante | Menu",
  description: "Menu demo publico permanente con carrito y pedido por WhatsApp.",
};

export default function DemoMenuPage() {
  return (
    <PublicMenuExperience
      dataSource="local"
      initialRestaurants={demoRestaurants}
      restaurantSlug="demo"
    />
  );
}
