"use client";

import { useEffect, useState } from "react";
import type { MenuCategory } from "@/types/menu";
import { cn } from "@/lib/utils/cn";

type CategoryNavProps = {
  categories: MenuCategory[];
};

export function CategoryNav({ categories }: CategoryNavProps) {
  const [activeCategoryId, setActiveCategoryId] = useState(categories[0]?.id);

  useEffect(() => {
    const observers = categories.map((category) => {
      const element = document.getElementById(`category-${category.id}`);

      if (!element) {
        return null;
      }

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveCategoryId(category.id);
          }
        },
        {
          rootMargin: "-42% 0px -50% 0px",
          threshold: 0,
        },
      );

      observer.observe(element);
      return observer;
    });

    return () => {
      observers.forEach((observer) => observer?.disconnect());
    };
  }, [categories]);

  return (
    <nav className="sticky top-0 z-30 border-y border-ink/10 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl gap-2 overflow-x-auto px-4 py-3 sm:px-6 lg:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {categories.map((category) => (
          <a
            className={cn(
              "whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition",
              activeCategoryId === category.id
                ? "bg-ink text-white"
                : "bg-ink/5 text-ink/70 hover:bg-ink/10 hover:text-ink",
            )}
            href={`#category-${category.id}`}
            key={category.id}
            onClick={(event) => {
              event.preventDefault();
              setActiveCategoryId(category.id);
              document
                .getElementById(`category-${category.id}`)
                ?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
          >
            {category.name}
          </a>
        ))}
      </div>
    </nav>
  );
}
