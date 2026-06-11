"use client";

import { useMemo, useState } from "react";
import type { AddonOption, MenuItem } from "@/types/menu";

export type CartAddon = AddonOption & {
  groupId: string;
  groupName: string;
};

export type CartLine = {
  id: string;
  item: MenuItem;
  quantity: number;
  selectedAddons: CartAddon[];
};

function createLineId(item: MenuItem, selectedAddons: CartAddon[]) {
  const addonKey = selectedAddons
    .map((addon) => addon.id)
    .sort()
    .join(".");

  return `${item.id}:${addonKey}`;
}

export function getLineUnitAmount(line: CartLine) {
  return (
    line.item.price.amount +
    line.selectedAddons.reduce((total, addon) => total + addon.price.amount, 0)
  );
}

export function useCart() {
  const [lines, setLines] = useState<CartLine[]>([]);

  function addItem(item: MenuItem, selectedAddons: CartAddon[] = []) {
    const lineId = createLineId(item, selectedAddons);

    setLines((currentLines) => {
      const existingLine = currentLines.find((line) => line.id === lineId);

      if (existingLine) {
        return currentLines.map((line) =>
          line.id === lineId ? { ...line, quantity: line.quantity + 1 } : line,
        );
      }

      return [...currentLines, { id: lineId, item, quantity: 1, selectedAddons }];
    });
  }

  function decreaseLine(lineId: string) {
    setLines((currentLines) =>
      currentLines
        .map((line) =>
          line.id === lineId ? { ...line, quantity: Math.max(line.quantity - 1, 0) } : line,
        )
        .filter((line) => line.quantity > 0),
    );
  }

  function removeLine(lineId: string) {
    setLines((currentLines) => currentLines.filter((line) => line.id !== lineId));
  }

  const totals = useMemo(() => {
    return lines.reduce(
      (summary, line) => ({
        amount: summary.amount + getLineUnitAmount(line) * line.quantity,
        quantity: summary.quantity + line.quantity,
      }),
      { amount: 0, quantity: 0 },
    );
  }, [lines]);

  return {
    addItem,
    decreaseLine,
    lines,
    removeLine,
    totalAmount: totals.amount,
    totalQuantity: totals.quantity,
  };
}
