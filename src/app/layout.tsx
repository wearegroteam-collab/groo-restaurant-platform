import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Menu SaaS para restaurantes",
  description: "Menus digitales, administracion y operaciones para restaurantes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
