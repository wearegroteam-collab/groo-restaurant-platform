"use client";

import { ShoppingBag } from "lucide-react";
import type { MenuTheme } from "@/types/menu";
import { formatMoney } from "@/features/menus/format-money";
import { cn } from "@/lib/utils/cn";

type CartButtonProps = {
  currency?: "COP" | "USD";
  onClick: () => void;
  theme?: MenuTheme;
  totalAmount: number;
  totalQuantity: number;
};

export function CartButton({
  currency = "COP",
  onClick,
  theme = "light",
  totalAmount,
  totalQuantity,
}: CartButtonProps) {
  const isDark = theme === "dark";

  if (!totalQuantity) {
    return null;
  }

  return (
    <button
      className={cn(
        "fixed inset-x-4 bottom-5 z-40 mx-auto flex max-w-md items-center justify-between gap-4 rounded-full px-5 py-3 text-left shadow-soft transition hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2",
        isDark ? "bg-brand-500 text-ink ring-offset-[#0c120f]" : "bg-ink text-white",
      )}
      onClick={onClick}
      type="button"
    >
      <span className="flex items-center gap-3">
        <span className={cn("relative grid h-10 w-10 place-items-center rounded-full", isDark ? "bg-ink/10" : "bg-white/12")}>
          <ShoppingBag className="h-5 w-5" />
          <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#25d366] px-1 text-xs font-bold text-white">
            {totalQuantity}
          </span>
        </span>
        <span>
          <span className="block text-xs font-semibold opacity-70">Ver pedido</span>
          <span className="block text-sm font-bold">{totalQuantity} productos</span>
        </span>
      </span>
      <span className="text-sm font-bold">{formatMoney({ amount: totalAmount, currency })}</span>
    </button>
  );
}
