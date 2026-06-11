import Image from "next/image";
import { MapPin } from "lucide-react";
import type { MenuTheme, Restaurant } from "@/types/menu";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { cn } from "@/lib/utils/cn";

type RestaurantHeaderProps = {
  restaurant: Restaurant;
  theme?: MenuTheme;
};

export function RestaurantHeader({ restaurant, theme = "light" }: RestaurantHeaderProps) {
  const isDark = theme === "dark";

  return (
    <section className="relative z-10 -mt-6">
      <Container>
        <div
          className={cn(
            "rounded-lg border p-3 shadow-soft sm:p-4",
            isDark ? "border-white/10 bg-[#111a15] text-white" : "border-ink/10 bg-white",
          )}
        >
          <div className="flex gap-3">
            <Image
              alt={restaurant.name}
              className="h-16 w-16 shrink-0 rounded-lg object-cover ring-4 ring-brand-50 sm:h-20 sm:w-20"
              height={80}
              src={restaurant.logoUrl}
              width={80}
            />
            <div className="min-w-0 flex-1 space-y-2">
              <div>
                <h1 className="text-xl font-bold leading-tight sm:text-2xl">{restaurant.name}</h1>
                <p className={cn("mt-0.5 line-clamp-1 text-sm leading-5", isDark ? "text-white/62" : "text-ink/65")}>
                  {restaurant.description}
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className={cn("flex items-start gap-2 text-sm leading-5", isDark ? "text-white/70" : "text-ink/70")}>
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                  <span className="line-clamp-1">{restaurant.address}</span>
                </p>
                <Button
                  asChild
                  className={isDark ? "border-brand-500/45 text-brand-100 hover:bg-brand-500/10" : undefined}
                  variant="outline"
                >
                  <a href={restaurant.googleMapsUrl} rel="noreferrer" target="_blank">
                    Google Maps
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
