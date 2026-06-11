"use client";

import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import type { MenuTheme, Restaurant } from "@/types/menu";
import { getLineUnitAmount, type CartLine } from "@/features/cart/use-cart";
import { formatMoney } from "@/features/menus/format-money";
import { cn } from "@/lib/utils/cn";

type CartPanelProps = {
  isOpen: boolean;
  lines: CartLine[];
  onAdd: (line: CartLine) => void;
  onClose: () => void;
  onDecrease: (lineId: string) => void;
  onRemove: (lineId: string) => void;
  restaurant: Restaurant;
  theme?: MenuTheme;
  totalAmount: number;
};

function buildOrderMessage(lines: CartLine[], totalAmount: number) {
  const currency = lines[0]?.item.price.currency ?? "COP";
  const orderLines = lines
    .map((line) => {
      const subtotal = getLineUnitAmount(line) * line.quantity;
      const addons = line.selectedAddons.length
        ? `\n  Adiciones: ${line.selectedAddons.map((addon) => addon.name).join(", ")}`
        : "";

      return `- ${line.quantity} x ${line.item.name} — ${formatMoney({
        amount: subtotal,
        currency,
      })}${addons}`;
    })
    .join("\n\n");

  return [
    "Hola, quiero hacer este pedido:",
    "",
    orderLines,
    "",
    `Total estimado: ${formatMoney({ amount: totalAmount, currency })}`,
    "",
    "Nombre:",
    "Dirección:",
    "Método de pago:",
  ].join("\n");
}

function buildWhatsAppHref(restaurant: Restaurant, lines: CartLine[], totalAmount: number) {
  const whatsappUrl = restaurant.whatsappUrl.trim();
  const separator = whatsappUrl.includes("?")
    ? whatsappUrl.endsWith("?") || whatsappUrl.endsWith("&")
      ? ""
      : "&"
    : "?";

  return `${whatsappUrl}${separator}text=${encodeURIComponent(
    buildOrderMessage(lines, totalAmount),
  )}`;
}

export function CartPanel({
  isOpen,
  lines,
  onAdd,
  onClose,
  onDecrease,
  onRemove,
  restaurant,
  theme = "light",
  totalAmount,
}: CartPanelProps) {
  const isDark = theme === "dark";
  const currency = lines[0]?.item.price.currency ?? "COP";

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-ink/55 p-0 sm:items-center sm:justify-center sm:p-4">
      <section
        className={cn(
          "max-h-[88vh] w-full overflow-hidden rounded-t-2xl border shadow-soft sm:max-w-lg sm:rounded-2xl",
          isDark ? "border-white/10 bg-[#111a15] text-white" : "border-ink/10 bg-white text-ink",
        )}
      >
        <div
          className={cn(
            "flex items-center justify-between border-b px-4 py-4",
            isDark ? "border-white/10" : "border-ink/10",
          )}
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-600">Pedido</p>
            <h2 className="text-xl font-bold">Tu carrito</h2>
          </div>
          <button
            aria-label="Cerrar carrito"
            className={cn(
              "inline-flex h-10 w-10 items-center justify-center rounded-full border transition",
              isDark
                ? "border-white/10 bg-white/5 hover:bg-white/10"
                : "border-ink/10 bg-ink/5 hover:bg-ink/10",
            )}
            onClick={onClose}
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[52vh] overflow-y-auto px-4 py-3">
          {lines.length ? (
            <div className="grid gap-3">
              {lines.map((line) => {
                const unitAmount = getLineUnitAmount(line);
                const subtotal = unitAmount * line.quantity;

                return (
                  <article
                    className={cn(
                      "rounded-lg border p-3",
                      isDark ? "border-white/10 bg-white/5" : "border-ink/10 bg-ink/5",
                    )}
                    key={line.id}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-bold leading-tight">{line.item.name}</h3>
                        <p className={cn("mt-1 text-sm", isDark ? "text-white/62" : "text-ink/62")}>
                          {formatMoney({ amount: unitAmount, currency: line.item.price.currency })} c/u
                        </p>
                        {line.selectedAddons.length ? (
                          <div
                            className={cn(
                              "mt-2 grid gap-1 text-xs",
                              isDark ? "text-white/55" : "text-ink/55",
                            )}
                          >
                            {line.selectedAddons.map((addon) => (
                              <p key={addon.id}>
                                + {addon.name} — {formatMoney(addon.price)}
                              </p>
                            ))}
                          </div>
                        ) : null}
                      </div>
                      <p className="shrink-0 font-bold">
                        {formatMoney({ amount: subtotal, currency: line.item.price.currency })}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          aria-label={`Disminuir ${line.item.name}`}
                          className={cn(
                            "inline-flex h-9 w-9 items-center justify-center rounded-full border",
                            isDark ? "border-white/10 bg-[#0c120f]" : "border-ink/10 bg-white",
                          )}
                          onClick={() => onDecrease(line.id)}
                          type="button"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="min-w-6 text-center font-bold">{line.quantity}</span>
                        <button
                          aria-label={`Aumentar ${line.item.name}`}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-ink"
                          onClick={() => onAdd(line)}
                          type="button"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <button
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-3 py-2 text-xs font-bold",
                          isDark ? "text-white/65 hover:bg-white/10" : "text-ink/60 hover:bg-ink/10",
                        )}
                        onClick={() => onRemove(line.id)}
                        type="button"
                      >
                        <Trash2 className="h-4 w-4" />
                        Eliminar
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="grid place-items-center gap-3 py-12 text-center">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-brand-100 text-brand-900">
                <ShoppingBag className="h-7 w-7" />
              </div>
              <p className={cn("text-sm", isDark ? "text-white/65" : "text-ink/65")}>
                Agrega productos disponibles para armar tu pedido.
              </p>
            </div>
          )}
        </div>

        <div
          className={cn(
            "border-t px-4 py-4",
            isDark ? "border-white/10 bg-[#0c120f]" : "border-ink/10 bg-white",
          )}
        >
          <div className="mb-3 flex items-center justify-between">
            <span className={cn("text-sm font-semibold", isDark ? "text-white/70" : "text-ink/65")}>
              Total estimado
            </span>
            <span className="text-xl font-bold">{formatMoney({ amount: totalAmount, currency })}</span>
          </div>
          <a
            className={cn(
              "inline-flex min-h-12 w-full items-center justify-center rounded-full px-5 py-3 text-sm font-bold shadow-soft transition",
              lines.length
                ? "bg-[#25d366] text-white hover:scale-[1.01]"
                : "pointer-events-none bg-ink/10 text-ink/35",
            )}
            href={lines.length ? buildWhatsAppHref(restaurant, lines, totalAmount) : undefined}
            rel="noreferrer"
            target="_blank"
          >
            Enviar pedido por WhatsApp
          </a>
        </div>
      </section>
    </div>
  );
}
