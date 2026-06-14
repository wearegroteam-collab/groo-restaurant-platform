"use client";

import { useState } from "react";
import { Copy, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import type { MenuTheme, Restaurant } from "@/types/menu";
import { getLineUnitAmount, type CartCustomer, type CartLine } from "@/features/cart/use-cart";
import { formatMoney } from "@/features/menus/format-money";
import { cn } from "@/lib/utils/cn";
import { buildColombianWhatsAppUrl } from "@/lib/whatsapp";

type CartPanelProps = {
  isOpen: boolean;
  lines: CartLine[];
  customer: CartCustomer;
  onCustomerChange: (field: keyof CartCustomer, value: string) => void;
  onAdd: (line: CartLine) => void;
  onCheckoutSuccess: () => void;
  onClose: () => void;
  onDecrease: (lineId: string) => void;
  onRemove: (lineId: string) => void;
  restaurant: Restaurant;
  theme?: MenuTheme;
  totalAmount: number;
};

type DeliveryType = "delivery" | "pickup" | "";
type PaymentMethod = "cash" | "transfer" | "";

function getDeliveryLabel(deliveryType: DeliveryType) {
  return deliveryType === "delivery" ? "Domicilio" : "Retiro en local";
}

function getPaymentLabel(paymentMethod: PaymentMethod) {
  return paymentMethod === "transfer" ? "Transferencia" : "Efectivo";
}

function buildOrderMessage({
  customer,
  deliveryFee,
  lines,
  productsTotal,
  totalAmount,
}: {
  customer: CartCustomer;
  deliveryFee: number;
  lines: CartLine[];
  productsTotal: number;
  totalAmount: number;
}) {
  const currency = lines[0]?.item.price.currency ?? "COP";
  const orderLines = lines
    .map((line) => {
      const subtotal = getLineUnitAmount(line) * line.quantity;
      const addons = line.selectedAddons.length
        ? `\n  Adiciones: ${line.selectedAddons.map((addon) => addon.name).join(", ")}`
        : "";

      return `- ${line.quantity} x ${line.item.name} - ${formatMoney({
        amount: subtotal,
        currency,
      })}${addons}`;
    })
    .join("\n\n");

  return [
    "Hola, quiero hacer este pedido:",
    "",
    `Tipo de entrega: ${getDeliveryLabel(customer.deliveryType)}`,
    `Metodo de pago: ${getPaymentLabel(customer.paymentMethod)}`,
    `Nombre: ${customer.name.trim()}`,
    `Telefono: ${customer.phone.trim()}`,
    customer.deliveryType === "delivery" ? `Direccion: ${customer.address.trim()}` : "",
    "",
    orderLines,
    "",
    `Subtotal productos: ${formatMoney({ amount: productsTotal, currency })}`,
    `Valor domicilio: ${formatMoney({ amount: deliveryFee, currency })}`,
    `Total estimado: ${formatMoney({ amount: totalAmount, currency })}`,
    customer.paymentMethod === "transfer"
      ? "\nEnviare el comprobante de transferencia por este WhatsApp."
      : "",
  ]
    .filter((line) => line !== "")
    .join("\n");
}

function buildWhatsAppHref({
  customer,
  deliveryFee,
  lines,
  productsTotal,
  restaurant,
  totalAmount,
}: {
  customer: CartCustomer;
  deliveryFee: number;
  lines: CartLine[];
  productsTotal: number;
  restaurant: Restaurant;
  totalAmount: number;
}) {
  return buildColombianWhatsAppUrl(
    restaurant.whatsappUrl,
    buildOrderMessage({ customer, deliveryFee, lines, productsTotal, totalAmount }),
  );
}

function getBankDetailsText(restaurant: Restaurant) {
  return [
    restaurant.bankName ? `Banco: ${restaurant.bankName}` : "",
    restaurant.bankAccountType ? `Tipo de cuenta: ${restaurant.bankAccountType}` : "",
    restaurant.bankAccountNumber ? `Numero de cuenta: ${restaurant.bankAccountNumber}` : "",
    restaurant.bankAccountHolder ? `Titular: ${restaurant.bankAccountHolder}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export function CartPanel({
  customer,
  isOpen,
  lines,
  onAdd,
  onCheckoutSuccess,
  onClose,
  onCustomerChange,
  onDecrease,
  onRemove,
  restaurant,
  theme = "light",
  totalAmount,
}: CartPanelProps) {
  const isDark = theme === "dark";
  const currency = lines[0]?.item.price.currency ?? "COP";
  const [errors, setErrors] = useState<Partial<Record<keyof CartCustomer | "cart", string>>>({});
  const productsTotal = totalAmount;
  const deliveryFee = customer.deliveryType === "delivery" ? restaurant.deliveryFee : 0;
  const finalTotal = productsTotal + deliveryFee;
  const bankDetailsText = getBankDetailsText(restaurant);

  if (!isOpen) {
    return null;
  }

  function updateCustomer(field: keyof CartCustomer, value: string) {
    onCustomerChange(field, value);
    setErrors((currentErrors) => ({ ...currentErrors, [field]: undefined }));
  }

  function validateOrder() {
    const nextErrors: Partial<Record<keyof CartCustomer | "cart", string>> = {};

    if (!lines.length) {
      nextErrors.cart = "Agrega al menos un producto al pedido.";
    }

    if (!customer.deliveryType) {
      nextErrors.deliveryType = "Selecciona el tipo de entrega.";
    }

    if (!customer.paymentMethod) {
      nextErrors.paymentMethod = "Selecciona el metodo de pago.";
    }

    if (!customer.name.trim()) {
      nextErrors.name = "Ingresa tu nombre.";
    }

    if (!customer.phone.trim()) {
      nextErrors.phone = "Ingresa tu telefono.";
    }

    if (customer.deliveryType === "delivery" && !customer.address.trim()) {
      nextErrors.address = "Ingresa la direccion para el domicilio.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function sendOrder() {
    if (!validateOrder()) {
      return;
    }

    const href = buildWhatsAppHref({
      customer,
      deliveryFee,
      lines,
      productsTotal,
      restaurant,
      totalAmount: finalTotal,
    });

    if (!href) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        cart: "El WhatsApp del restaurante no esta configurado correctamente.",
      }));
      return;
    }

    window.open(href, "_blank", "noopener,noreferrer");
    onCheckoutSuccess();
    onClose();
    setErrors({});
  }

  async function copyBankDetails() {
    if (!bankDetailsText) {
      return;
    }

    await navigator.clipboard.writeText(bankDetailsText);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-ink/55 p-0 sm:items-center sm:justify-center sm:p-4">
      <section
        className={cn(
          "flex max-h-[100dvh] w-full flex-col overflow-hidden rounded-t-2xl border shadow-soft sm:max-h-[88dvh] sm:max-w-lg sm:rounded-2xl",
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

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3">
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
                                + {addon.name} - {formatMoney(addon.price)}
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

              <section className="grid gap-3 pt-2">
                <FormField error={errors.deliveryType} isDark={isDark} label="Tipo de entrega">
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "Domicilio", value: "delivery" },
                      { label: "Retiro en local", value: "pickup" },
                    ].map((option) => (
                      <button
                        className={cn(
                          "rounded-full border px-3 py-2 text-sm font-bold transition",
                          customer.deliveryType === option.value
                            ? "border-brand-500 bg-brand-500 text-ink"
                            : isDark
                              ? "border-white/10 bg-white/5 text-white/75"
                              : "border-ink/10 bg-white text-ink/70",
                        )}
                        key={option.value}
                        onClick={() => updateCustomer("deliveryType", option.value)}
                        type="button"
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </FormField>

                <FormField error={errors.paymentMethod} isDark={isDark} label="Metodo de pago">
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "Efectivo", value: "cash" },
                      { label: "Transferencia", value: "transfer" },
                    ].map((option) => (
                      <button
                        className={cn(
                          "rounded-full border px-3 py-2 text-sm font-bold transition",
                          customer.paymentMethod === option.value
                            ? "border-brand-500 bg-brand-500 text-ink"
                            : isDark
                              ? "border-white/10 bg-white/5 text-white/75"
                              : "border-ink/10 bg-white text-ink/70",
                        )}
                        key={option.value}
                        onClick={() => updateCustomer("paymentMethod", option.value)}
                        type="button"
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </FormField>

                {customer.paymentMethod === "transfer" ? (
                  <div
                    className={cn(
                      "grid gap-3 rounded-lg border p-3 text-sm",
                      isDark ? "border-white/10 bg-white/5" : "border-brand-100 bg-brand-50",
                    )}
                  >
                    <div className="grid gap-1">
                      <p className="font-bold">Datos para transferencia</p>
                      <BankDetail label="Banco" value={restaurant.bankName} />
                      <BankDetail label="Tipo de cuenta" value={restaurant.bankAccountType} />
                      <BankDetail label="Numero de cuenta" value={restaurant.bankAccountNumber} />
                      <BankDetail label="Titular" value={restaurant.bankAccountHolder} />
                    </div>
                    <button
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-brand-500 px-4 py-2 text-sm font-bold text-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={!bankDetailsText}
                      onClick={copyBankDetails}
                      type="button"
                    >
                      <Copy className="h-4 w-4" />
                      Copiar datos
                    </button>
                    <p className={cn("text-xs", isDark ? "text-white/60" : "text-ink/60")}>
                      Realiza la transferencia y envia el comprobante por WhatsApp junto con tu pedido.
                    </p>
                  </div>
                ) : null}

                <div className="grid gap-3 sm:grid-cols-2">
                  <FormField error={errors.name} isDark={isDark} label="Nombre">
                    <input
                      className={fieldClass(isDark)}
                      value={customer.name}
                      onChange={(event) => updateCustomer("name", event.target.value)}
                    />
                  </FormField>
                  <FormField error={errors.phone} isDark={isDark} label="Telefono">
                    <input
                      className={fieldClass(isDark)}
                      inputMode="tel"
                      value={customer.phone}
                      onChange={(event) => updateCustomer("phone", event.target.value)}
                    />
                  </FormField>
                </div>

                {customer.deliveryType === "delivery" ? (
                  <FormField error={errors.address} isDark={isDark} label="Direccion">
                    <textarea
                      className={cn(fieldClass(isDark), "min-h-20 resize-none")}
                      value={customer.address}
                      onChange={(event) => updateCustomer("address", event.target.value)}
                    />
                  </FormField>
                ) : null}
              </section>
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
            "shrink-0 border-t px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4",
            isDark ? "border-white/10 bg-[#0c120f]" : "border-ink/10 bg-white",
          )}
        >
          <div className="mb-3 grid gap-1 text-sm">
            <SummaryRow
              isDark={isDark}
              label="Subtotal productos"
              value={formatMoney({ amount: productsTotal, currency })}
            />
            <SummaryRow
              isDark={isDark}
              label="Valor domicilio"
              value={formatMoney({ amount: deliveryFee, currency })}
            />
            <div className="flex items-center justify-between pt-1">
              <span className={cn("font-semibold", isDark ? "text-white/70" : "text-ink/65")}>
                Total estimado
              </span>
              <span className="text-xl font-bold">
                {formatMoney({ amount: finalTotal, currency })}
              </span>
            </div>
          </div>
          {errors.cart ? <p className="mb-3 text-sm font-semibold text-red-500">{errors.cart}</p> : null}
          <button
            className={cn(
              "inline-flex min-h-12 w-full items-center justify-center rounded-full px-5 py-3 text-sm font-bold shadow-soft transition",
              lines.length
                ? "bg-[#25d366] text-white hover:scale-[1.01]"
                : "pointer-events-none bg-ink/10 text-ink/35",
            )}
            onClick={sendOrder}
            type="button"
          >
            Enviar pedido por WhatsApp
          </button>
        </div>
      </section>
    </div>
  );
}

function fieldClass(isDark: boolean) {
  return cn(
    "min-h-11 w-full rounded-md border px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100",
    isDark ? "border-white/10 bg-white/5 text-white" : "border-ink/10 bg-white text-ink",
  );
}

function FormField({
  children,
  error,
  isDark,
  label,
}: {
  children: React.ReactNode;
  error?: string;
  isDark: boolean;
  label: string;
}) {
  return (
    <label className="grid gap-1 text-xs font-bold">
      <span className={isDark ? "text-white/60" : "text-ink/60"}>{label}</span>
      {children}
      {error ? <span className="text-xs font-semibold text-red-500">{error}</span> : null}
    </label>
  );
}

function BankDetail({ label, value }: { label: string; value: string }) {
  return (
    <p>
      <span className="font-semibold">{label}:</span> {value || "No configurado"}
    </p>
  );
}

function SummaryRow({ isDark, label, value }: { isDark: boolean; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className={isDark ? "text-white/60" : "text-ink/60"}>{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
