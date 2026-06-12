"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { MenuBanner } from "@/types/menu";
import { cn } from "@/lib/utils/cn";

type BannerSliderProps = {
  banners: MenuBanner[];
};

export function BannerSlider({ banners }: BannerSliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) {
      return;
    }

    const interval = window.setInterval(() => {
      const nextIndex = (activeIndex + 1) % banners.length;
      const slider = scrollRef.current;

      if (slider) {
        slider.scrollTo({
          left: slider.clientWidth * nextIndex,
          behavior: "smooth",
        });
      }

      setActiveIndex(nextIndex);
    }, 4500);

    return () => window.clearInterval(interval);
  }, [activeIndex, banners.length]);

  function handleScroll() {
    const slider = scrollRef.current;

    if (!slider) {
      return;
    }

    const index = Math.round(slider.scrollLeft / slider.clientWidth);
    setActiveIndex(index);
  }

  return (
    <section className="relative overflow-hidden bg-ink">
      <div
        className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        onScroll={handleScroll}
        ref={scrollRef}
      >
        {banners.map((banner, index) => (
          <article className="relative h-[290px] min-w-full snap-center sm:h-[380px]" key={banner.id}>
            <Image
              alt={banner.title}
              className="h-full w-full object-cover"
              fill
              priority={index === 0}
              sizes="100vw"
              src={banner.imageUrl}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/45 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-6xl px-4 pb-8 sm:px-6 lg:px-8">
              <div className="max-w-xl space-y-2 text-white">
                <h2 className="text-3xl font-bold leading-tight sm:text-5xl">{banner.title}</h2>
                <p className="text-sm leading-6 text-white/78 sm:text-base">{banner.subtitle}</p>
              </div>
            </div>
          </article>
        ))}
      </div>

      {banners.length > 1 ? (
        <div className="absolute bottom-4 right-4 flex gap-1.5">
          {banners.map((banner, index) => (
            <button
              aria-label={`Ver banner ${index + 1}`}
              className={cn(
                "h-2 rounded-full bg-white/45 transition-all",
                activeIndex === index ? "w-7 bg-white" : "w-2",
              )}
              key={banner.id}
              onClick={() => {
                scrollRef.current?.scrollTo({
                  left: scrollRef.current.clientWidth * index,
                  behavior: "smooth",
                });
                setActiveIndex(index);
              }}
              type="button"
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
