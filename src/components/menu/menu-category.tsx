import type { MenuCategory as MenuCategoryType } from "@/types/menu";
import { MenuItemCard } from "@/components/menu/menu-item-card";

type MenuCategoryProps = {
  category: MenuCategoryType;
};

export function MenuCategory({ category }: MenuCategoryProps) {
  return (
    <section
      className="scroll-mt-28 space-y-4"
      aria-labelledby={`${category.id}-title`}
      id={`category-${category.id}`}
    >
      <div>
        <h2 className="text-2xl font-bold" id={`${category.id}-title`}>
          {category.name}
        </h2>
        {category.description ? (
          <p className="mt-1 text-sm leading-6 text-ink/65">{category.description}</p>
        ) : null}
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        {category.items.map((item, index) => (
          <MenuItemCard index={index} item={item} key={item.id} />
        ))}
      </div>
    </section>
  );
}
