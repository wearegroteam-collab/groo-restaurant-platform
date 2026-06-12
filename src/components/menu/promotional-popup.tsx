"use client";

import Image from "next/image";
import { X } from "lucide-react";
import type { MenuTheme, RestaurantPopup } from "@/types/menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

type PromotionalPopupProps = {
  onClose: () => void;
  popup: RestaurantPopup;
  theme?: MenuTheme;
};

export function PromotionalPopup({ onClose, popup, theme = "light" }: PromotionalPopupProps) {
  const isDark = theme === "dark";

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/65 p-4">
      <section
        className={cn(
          "relative w-full max-w-md overflow-hidden rounded-lg border shadow-soft",
          isDark ? "border-white/10 bg-[#111a15] text-white" : "border-ink/10 bg-white text-ink",
        )}
      >
        <button
          aria-label="Cerrar promocion"
          className={cn(
            "absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full border backdrop-blur",
            isDark ? "border-white/10 bg-ink/70 text-white" : "border-ink/10 bg-white/85 text-ink",
          )}
          onClick={onClose}
          type="button"
        >
          <X className="h-5 w-5" />
        </button>

        {popup.imageUrl ? (
          <div className="relative h-56">
            <Image
              alt={popup.title}
              className="object-cover"
              fill
              sizes="(max-width: 640px) 100vw, 448px"
              src={popup.imageUrl}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/55 to-transparent" />
          </div>
        ) : null}

        <div className="grid gap-3 p-5">
          <h2 className="text-2xl font-bold">{popup.title}</h2>
          {popup.description ? (
            <p className={cn("text-sm leading-6", isDark ? "text-white/70" : "text-ink/65")}>
              {popup.description}
            </p>
          ) : null}
          {popup.buttonText && popup.buttonUrl ? (
            <Button asChild className="mt-2">
              <a href={popup.buttonUrl} rel="noopener noreferrer" target="_blank">
                {popup.buttonText}
              </a>
            </Button>
          ) : null}
        </div>
      </section>
    </div>
  );
}
