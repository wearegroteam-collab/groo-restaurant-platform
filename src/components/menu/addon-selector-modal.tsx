"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import type { MenuItem, MenuTheme } from "@/types/menu";
import type { CartAddon } from "@/features/cart/use-cart";
import { formatMoney } from "@/features/menus/format-money";
import { cn } from "@/lib/utils/cn";

type AddonSelectorModalProps = {
  item: MenuItem | null;
  onAdd: (item: MenuItem, addons: CartAddon[]) => void;
  onClose: () => void;
  theme?: MenuTheme;
};

export function AddonSelectorModal({
  item,
  onAdd,
  onClose,
  theme = "light",
}: AddonSelectorModalProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const isDark = theme === "dark";

  useEffect(() => {
    setSelectedIds([]);
  }, [item?.id]);

  const selectedAddons = useMemo(() => {
    if (!item) {
      return [];
    }

    return (item.addonGroups ?? []).flatMap((group) =>
      group.options
        .filter((option) => selectedIds.includes(option.id))
        .map((option) => ({ ...option, groupId: group.id, groupName: group.name })),
    );
  }, [item, selectedIds]);

  const totalAmount =
    (item?.price.amount ?? 0) + selectedAddons.reduce((total, addon) => total + addon.price.amount, 0);

  if (!item) {
    return null;
  }

  function toggleOption(groupId: string, optionId: string) {
    const group = item?.addonGroups?.find((currentGroup) => currentGroup.id === groupId);

    if (!group) {
      return;
    }

    setSelectedIds((currentIds) => {
      const groupOptionIds = group.options.map((option) => option.id);
      const isSelected = currentIds.includes(optionId);

      if (!group.multiple) {
        return isSelected
          ? currentIds.filter((id) => id !== optionId)
          : [...currentIds.filter((id) => !groupOptionIds.includes(id)), optionId];
      }

      if (isSelected) {
        return currentIds.filter((id) => id !== optionId);
      }

      const selectedInGroup = currentIds.filter((id) => groupOptionIds.includes(id));

      if (group.maxSelect !== null && selectedInGroup.length >= group.maxSelect) {
        return currentIds;
      }

      return [...currentIds, optionId];
    });
  }

  const missingRequiredGroup = (item.addonGroups ?? []).some((group) => {
    const selectedCount = group.options.filter((option) => selectedIds.includes(option.id)).length;
    const minimum = group.required ? Math.max(group.minSelect, 1) : group.minSelect;

    return selectedCount < minimum;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-ink/55 p-0 sm:items-center sm:justify-center sm:p-4">
      <section
        className={cn(
          "max-h-[88vh] w-full overflow-hidden rounded-t-2xl border shadow-soft sm:max-w-lg sm:rounded-2xl",
          isDark ? "border-white/10 bg-[#111a15] text-white" : "border-ink/10 bg-white text-ink",
        )}
      >
        <div className={cn("flex items-start justify-between border-b p-4", isDark ? "border-white/10" : "border-ink/10")}>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-600">Personaliza</p>
            <h2 className="text-xl font-bold">{item.name}</h2>
            <p className={cn("mt-1 text-sm", isDark ? "text-white/65" : "text-ink/65")}>
              Base {formatMoney(item.price)}
            </p>
          </div>
          <button
            aria-label="Cerrar adiciones"
            className={cn(
              "inline-flex h-10 w-10 items-center justify-center rounded-full border",
              isDark ? "border-white/10 bg-white/5" : "border-ink/10 bg-ink/5",
            )}
            onClick={onClose}
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[56vh] overflow-y-auto p-4">
          <div className="grid gap-4">
            {(item.addonGroups ?? []).map((group) => (
              <div className={cn("rounded-lg border p-3", isDark ? "border-white/10 bg-white/5" : "border-ink/10 bg-ink/5")} key={group.id}>
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold">{group.name}</h3>
                    <p className={cn("text-xs", isDark ? "text-white/55" : "text-ink/55")}>
                      {group.required ? "Obligatorio" : "Opcional"} ·{" "}
                      {group.multiple ? "Puedes elegir varias" : "Elige una"}
                    </p>
                  </div>
                </div>
                <div className="grid gap-2">
                  {group.options
                    .filter((option) => option.available)
                    .map((option) => (
                      <label
                        className={cn(
                          "flex items-center justify-between gap-3 rounded-md border px-3 py-3 text-sm font-semibold",
                          isDark ? "border-white/10 bg-[#0c120f]" : "border-ink/10 bg-white",
                        )}
                        key={option.id}
                      >
                        <span className="flex items-center gap-2">
                          <input
                            checked={selectedIds.includes(option.id)}
                            onChange={() => toggleOption(group.id, option.id)}
                            type={group.multiple ? "checkbox" : "radio"}
                          />
                          {option.name}
                        </span>
                        <span>{option.price.amount ? formatMoney(option.price) : "Incluido"}</span>
                      </label>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={cn("border-t p-4", isDark ? "border-white/10 bg-[#0c120f]" : "border-ink/10 bg-white")}>
          <button
            className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-brand-500 px-5 py-3 text-sm font-bold text-ink shadow-soft transition disabled:cursor-not-allowed disabled:opacity-50"
            disabled={missingRequiredGroup}
            onClick={() => {
              onAdd(item, selectedAddons);
              onClose();
            }}
            type="button"
          >
            Agregar · {formatMoney({ amount: totalAmount, currency: item.price.currency })}
          </button>
        </div>
      </section>
    </div>
  );
}
