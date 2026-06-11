import Image from "next/image";
import { Utensils } from "lucide-react";
import type { MenuTheme } from "@/types/menu";
import { cn } from "@/lib/utils/cn";

type ProductImageProps = {
  alt: string;
  className?: string;
  fill?: boolean;
  height?: number;
  sizes?: string;
  src: string;
  theme?: MenuTheme;
  width?: number;
};

export function ProductImage({
  alt,
  className,
  fill,
  height,
  sizes,
  src,
  theme = "light",
  width,
}: ProductImageProps) {
  if (!src) {
    return (
      <div
        aria-label={alt}
        className={cn(
          fill && "absolute inset-0",
          "flex h-full w-full items-center justify-center",
          theme === "dark"
            ? "bg-[radial-gradient(circle_at_30%_20%,rgba(34,197,94,0.26),transparent_34%),linear-gradient(135deg,#18231d,#0f1713)]"
            : "bg-[radial-gradient(circle_at_30%_20%,rgba(249,205,61,0.34),transparent_32%),linear-gradient(135deg,#fff7d8,#f3ead2)]",
          className,
        )}
        role="img"
      >
        <div
          className={cn(
            "flex h-14 w-14 items-center justify-center rounded-full border shadow-sm backdrop-blur",
            theme === "dark"
              ? "border-white/10 bg-white/10 text-brand-100"
              : "border-white/75 bg-white/70 text-brand-700",
          )}
        >
          <Utensils className="h-7 w-7" />
        </div>
      </div>
    );
  }

  if (src.startsWith("data:")) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt={alt} className={className} src={src} />;
  }

  return (
    <Image
      alt={alt}
      className={className}
      fill={fill}
      height={height}
      sizes={sizes}
      src={src}
      width={width}
    />
  );
}
