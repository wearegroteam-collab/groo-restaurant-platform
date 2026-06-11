import Image from "next/image";
import { MapPin } from "lucide-react";
import type { Restaurant } from "@/types/menu";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";

type RestaurantHeaderProps = {
  restaurant: Restaurant;
};

export function RestaurantHeader({ restaurant }: RestaurantHeaderProps) {
  return (
    <section className="relative z-10 -mt-6">
      <Container>
        <div className="rounded-lg border border-ink/10 bg-white p-3 shadow-soft sm:p-4">
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
                <p className="mt-0.5 line-clamp-1 text-sm leading-5 text-ink/65">
                  {restaurant.description}
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="flex items-start gap-2 text-sm leading-5 text-ink/70">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                  <span className="line-clamp-1">{restaurant.address}</span>
                </p>
                <Button asChild variant="outline">
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
