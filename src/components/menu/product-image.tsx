import Image from "next/image";

type ProductImageProps = {
  alt: string;
  className?: string;
  fill?: boolean;
  height?: number;
  sizes?: string;
  src: string;
  width?: number;
};

export function ProductImage({
  alt,
  className,
  fill,
  height,
  sizes,
  src,
  width,
}: ProductImageProps) {
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
