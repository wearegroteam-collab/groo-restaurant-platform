import type { Restaurant } from "@/types/menu";
import { formatMoney } from "@/features/menus/format-money";
import { Container } from "@/components/layout/container";
import { ProductImage } from "@/components/menu/product-image";

type FeaturedPromotionsProps = {
  restaurant: Restaurant;
};

export function FeaturedPromotions({ restaurant }: FeaturedPromotionsProps) {
  const promotions = restaurant.menu
    .flatMap((category) =>
      category.items.map((item) => ({
        ...item,
        categoryName: category.name,
      })),
    )
    .filter((item) => item.isAvailable)
    .sort((first, second) => Number(Boolean(second.tags?.length)) - Number(Boolean(first.tags?.length)))
    .slice(0, 3);

  if (!promotions.length) {
    return null;
  }

  return (
    <section className="bg-[#f8faf3] py-4">
      <Container className="space-y-3">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-600">
              Promociones
            </p>
            <h2 className="text-xl font-bold">Destacados de hoy</h2>
          </div>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {promotions.map((item) => (
            <article
              className="relative min-w-[240px] overflow-hidden rounded-lg bg-ink text-white shadow-soft"
              key={item.id}
            >
              <div className="relative h-32">
                <ProductImage
                  alt={item.name}
                  className="h-full w-full object-cover"
                  fill
                  sizes="240px"
                  src={item.imageUrl}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/35 to-transparent" />
              </div>
              <div className="space-y-1 p-4 pt-3">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-100">
                  {item.categoryName}
                </p>
                <h3 className="line-clamp-1 font-bold">{item.name}</h3>
                <p className="text-sm font-bold text-brand-100">{formatMoney(item.price)}</p>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
