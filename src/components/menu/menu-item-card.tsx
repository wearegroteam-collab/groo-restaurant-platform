import type { MenuItem, MenuTheme } from "@/types/menu";
import { formatMoney } from "@/features/menus/format-money";
import { cn } from "@/lib/utils/cn";
import { ProductImage } from "@/components/menu/product-image";
import { Plus } from "lucide-react";

type MenuItemCardProps = {
  item: MenuItem;
  index?: number;
  onAdd?: (item: MenuItem) => void;
  theme?: MenuTheme;
};

export function MenuItemCard({ item, index = 0, onAdd, theme = "light" }: MenuItemCardProps) {
  const isDark = theme === "dark";

  return (
    <article
      className={cn(
        "animate-menu-item-enter flex overflow-hidden rounded-lg border shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft",
        isDark ? "border-white/10 bg-[#111a15] text-white" : "border-ink/10 bg-white",
        !item.isAvailable && (isDark ? "bg-[#111a15]/75" : "bg-white/75"),
      )}
      style={{ animationDelay: `${Math.min(index * 70, 420)}ms` }}
    >
      <div className={cn("relative h-auto min-h-32 w-32 shrink-0 sm:w-40", isDark ? "bg-white/5" : "bg-ink/5")}>
        <ProductImage
          alt={item.name}
          className={cn("h-full w-full object-cover", !item.isAvailable && "grayscale")}
          fill
          sizes="(min-width: 640px) 160px, 128px"
          src={item.imageUrl}
          theme={theme}
        />
        <span
          className={cn(
            "absolute left-2 top-2 rounded-full px-2.5 py-1 text-[11px] font-bold shadow-sm",
            item.isAvailable
              ? "bg-brand-100 text-brand-900"
              : isDark
                ? "bg-white/10 text-white/70"
                : "bg-white text-ink/65",
          )}
        >
          {item.isAvailable ? "Disponible" : "No disponible"}
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 p-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-bold leading-tight sm:text-lg">{item.name}</h3>
            {item.tags?.map((tag) => (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-semibold",
                  isDark ? "bg-white/10 text-white/65" : "bg-ink/5 text-ink/65",
                )}
                key={tag}
              >
                {tag}
              </span>
            ))}
          </div>
          <p className={cn("line-clamp-2 text-sm leading-5", isDark ? "text-white/65" : "text-ink/65")}>
            {item.description}
          </p>
        </div>
        <div className="flex items-center justify-between gap-3">
          <p className={cn("text-lg font-bold", isDark ? "text-brand-100" : "text-ink")}>
            {formatMoney(item.price)}
          </p>
          {item.isAvailable ? (
            <button
              className={cn(
                "inline-flex min-h-9 items-center gap-1 rounded-full px-3 py-2 text-xs font-bold transition",
                isDark
                  ? "bg-brand-500 text-ink hover:bg-brand-100"
                  : "bg-ink/5 text-ink hover:bg-brand-100",
              )}
              onClick={() => onAdd?.(item)}
              type="button"
            >
              <Plus className="h-4 w-4" />
              Agregar
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
