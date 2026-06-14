"use client";

import { useEffect, useMemo, useState } from "react";
import type { AddonOption, MenuItem, Restaurant } from "@/types/menu";

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

export type DeliveryType = "delivery" | "pickup" | "";
export type PaymentMethod = "cash" | "transfer" | "";

export type CartCustomer = {
  deliveryType: DeliveryType;
  paymentMethod: PaymentMethod;
  name: string;
  phone: string;
  address: string;
};

type StoredAddon = {
  id?: string;
  groupId?: string;
};

type StoredLine = {
  itemId?: string;
  quantity?: number;
  selectedAddons?: StoredAddon[];
};

type StoredCart = {
  customer?: Partial<CartCustomer>;
  lines?: StoredLine[];
};

export const emptyCartCustomer: CartCustomer = {
  deliveryType: "",
  paymentMethod: "",
  name: "",
  phone: "",
  address: "",
};

function createLineId(item: MenuItem, selectedAddons: CartAddon[]) {
  const addonKey = selectedAddons
    .map((addon) => addon.id)
    .sort()
    .join(".");

  return `${item.id}:${addonKey}`;
}

function getCartStorageKey(restaurant: Restaurant | null | undefined, fallbackSlug: string) {
  return `groo-cart-${restaurant?.slug || fallbackSlug}`;
}

function isDeliveryType(value: unknown): value is DeliveryType {
  return value === "delivery" || value === "pickup" || value === "";
}

function isPaymentMethod(value: unknown): value is PaymentMethod {
  return value === "cash" || value === "transfer" || value === "";
}

function normalizeCustomer(customer?: Partial<CartCustomer>): CartCustomer {
  return {
    deliveryType: isDeliveryType(customer?.deliveryType) ? customer.deliveryType : "",
    paymentMethod: isPaymentMethod(customer?.paymentMethod) ? customer.paymentMethod : "",
    name: typeof customer?.name === "string" ? customer.name : "",
    phone: typeof customer?.phone === "string" ? customer.phone : "",
    address: typeof customer?.address === "string" ? customer.address : "",
  };
}

function getAvailableProducts(restaurant: Restaurant) {
  return restaurant.menu.flatMap((category) => category.items).filter((item) => item.isAvailable);
}

function restoreAddons(item: MenuItem, storedAddons?: StoredAddon[]) {
  if (!storedAddons?.length) {
    return [];
  }

  return storedAddons
    .map((storedAddon) => {
      const group = item.addonGroups?.find((currentGroup) => currentGroup.id === storedAddon.groupId);
      const option = group?.options.find(
        (currentOption) => currentOption.id === storedAddon.id && currentOption.available,
      );

      if (!group || !option) {
        return null;
      }

      return {
        ...option,
        groupId: group.id,
        groupName: group.name,
      };
    })
    .filter((addon): addon is CartAddon => addon !== null);
}

function restoreLines(storedCart: StoredCart, restaurant: Restaurant) {
  const products = getAvailableProducts(restaurant);
  const lines = new Map<string, CartLine>();

  for (const storedLine of storedCart.lines ?? []) {
    const item = products.find((product) => product.id === storedLine.itemId);
    const quantity = Number(storedLine.quantity);

    if (!item || !Number.isInteger(quantity) || quantity <= 0) {
      continue;
    }

    const selectedAddons = restoreAddons(item, storedLine.selectedAddons);
    const lineId = createLineId(item, selectedAddons);
    const existingLine = lines.get(lineId);

    lines.set(lineId, {
      id: lineId,
      item,
      quantity: (existingLine?.quantity ?? 0) + quantity,
      selectedAddons,
    });
  }

  return Array.from(lines.values());
}

function toStoredCart(lines: CartLine[], customer: CartCustomer): StoredCart {
  return {
    customer,
    lines: lines.map((line) => ({
      itemId: line.item.id,
      quantity: line.quantity,
      selectedAddons: line.selectedAddons.map((addon) => ({
        id: addon.id,
        groupId: addon.groupId,
      })),
    })),
  };
}

export function getLineUnitAmount(line: CartLine) {
  return (
    line.item.price.amount +
    line.selectedAddons.reduce((total, addon) => total + addon.price.amount, 0)
  );
}

export function useCart(restaurant: Restaurant | null | undefined, fallbackSlug: string) {
  const [customer, setCustomer] = useState<CartCustomer>(emptyCartCustomer);
  const [lines, setLines] = useState<CartLine[]>([]);
  const [restoredStorageKey, setRestoredStorageKey] = useState<string | null>(null);
  const storageKey = getCartStorageKey(restaurant, fallbackSlug);

  useEffect(() => {
    if (!restaurant || typeof window === "undefined") {
      return;
    }

    try {
      const storedValue = window.localStorage.getItem(storageKey);

      if (!storedValue) {
        setLines([]);
        setCustomer(emptyCartCustomer);
        setRestoredStorageKey(storageKey);
        return;
      }

      const storedCart = JSON.parse(storedValue) as StoredCart;
      setLines(restoreLines(storedCart, restaurant));
      setCustomer(normalizeCustomer(storedCart.customer));
    } catch {
      window.localStorage.removeItem(storageKey);
      setLines([]);
      setCustomer(emptyCartCustomer);
    } finally {
      setRestoredStorageKey(storageKey);
    }
  }, [restaurant, storageKey]);

  useEffect(() => {
    if (restoredStorageKey !== storageKey || typeof window === "undefined") {
      return;
    }

    if (!lines.length) {
      window.localStorage.removeItem(storageKey);
      return;
    }

    window.localStorage.setItem(storageKey, JSON.stringify(toStoredCart(lines, customer)));
  }, [customer, lines, restoredStorageKey, storageKey]);

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

  function clearCart() {
    setLines([]);
    setCustomer(emptyCartCustomer);

    if (typeof window !== "undefined") {
      window.localStorage.removeItem(storageKey);
    }
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

  function updateCustomer(field: keyof CartCustomer, value: string) {
    setCustomer((currentCustomer) => ({
      ...currentCustomer,
      [field]: value,
      ...(field === "deliveryType" && value === "pickup" ? { address: "" } : {}),
    }));
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
    clearCart,
    customer,
    decreaseLine,
    lines,
    removeLine,
    totalAmount: totals.amount,
    totalQuantity: totals.quantity,
    updateCustomer,
  };
}
