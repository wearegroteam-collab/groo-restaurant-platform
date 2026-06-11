import type { Money } from "@/types/menu";

export function formatMoney({ amount, currency }: Money) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
