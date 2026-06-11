import type { MenuCategory as MenuCategoryType, MenuTheme } from "@/types/menu";
import { MenuItemCard } from "@/components/menu/menu-item-card";
import { cn } from "@/lib/utils/cn";

type MenuCategoryProps = {
  category: MenuCategoryType;
  onAddItem?: (item: MenuCategoryType["items"][number]) => void;
  theme?: MenuTheme;
};

export function MenuCategory({ category, onAddItem, theme = "light" }: MenuCategoryProps) {
  const isDark = theme === "dark";

  return (
    <section
      className="scroll-mt-28 space-y-4"
      aria-labelledby={`${category.id}-title`}
      id={`category-${category.id}`}
    >
      <div>
        <h2 className={cn("text-2xl font-bold", isDark && "text-white")} id={`${category.id}-title`}>
          {category.name}
        </h2>
        {category.description ? (
          <p className={cn("mt-1 text-sm leading-6", isDark ? "text-white/62" : "text-ink/65")}>
            {category.description}
          </p>
        ) : null}
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        {category.items.map((item, index) => (
          <MenuItemCard index={index} item={item} key={item.id} onAdd={onAddItem} theme={theme} />
        ))}
      </div>
    </section>
  );
}
