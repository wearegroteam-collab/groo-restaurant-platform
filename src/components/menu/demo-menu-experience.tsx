"use client";

import { useMemo, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { PublicMenuExperience } from "@/components/menu/public-menu-experience";
import { demoRestaurants } from "@/features/restaurants/demo-data";
import type { MenuTheme } from "@/types/menu";

export function DemoMenuExperience() {
  const [theme, setTheme] = useState<MenuTheme>("light");
  const restaurants = useMemo(
    () =>
      demoRestaurants.map((restaurant) => ({
        ...restaurant,
        theme,
      })),
    [theme],
  );
  const isDark = theme === "dark";

  return (
    <>
      <div className="fixed right-4 top-4 z-50">
        <button
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-ink/10 bg-white px-4 py-2 text-sm font-bold text-ink shadow-soft transition hover:-translate-y-0.5"
          onClick={() => setTheme(isDark ? "light" : "dark")}
          type="button"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {isDark ? "Claro" : "Oscuro"}
        </button>
      </div>
      <PublicMenuExperience
        dataSource="local"
        initialRestaurants={restaurants}
        restaurantSlug="demo"
      />
    </>
  );
}
