import type { CSSProperties, ReactNode } from "react";

const brand = {
  green: "#84cc16",
  greenDark: "#3f6212",
  ink: "#111827",
  muted: "#64748b",
  soft: "#f7fee7",
  white: "#ffffff",
};

const bodyStyle: CSSProperties = {
  margin: 0,
  backgroundColor: "#f8fafc",
  color: brand.ink,
  fontFamily: "Arial, Helvetica, sans-serif",
};

const containerStyle: CSSProperties = {
  maxWidth: "600px",
  margin: "0 auto",
  padding: "32px 16px",
};

const cardStyle: CSSProperties = {
  backgroundColor: brand.white,
  border: "1px solid #e5e7eb",
  borderRadius: "16px",
  overflow: "hidden",
};

const headerStyle: CSSProperties = {
  backgroundColor: brand.ink,
  color: brand.white,
  padding: "28px",
};

const contentStyle: CSSProperties = {
  padding: "28px",
};

const buttonStyle: CSSProperties = {
  display: "inline-block",
  backgroundColor: brand.green,
  borderRadius: "999px",
  color: brand.ink,
  fontSize: "15px",
  fontWeight: 700,
  padding: "14px 22px",
  textDecoration: "none",
};

export type EmailLayoutProps = {
  children: ReactNode;
  eyebrow?: string;
  preview: string;
  title: string;
};

export function EmailLayout({ children, eyebrow = "Groo Team", preview, title }: EmailLayoutProps) {
  return (
    <html lang="es">
      <head>
        <meta content="text/html; charset=utf-8" httpEquiv="Content-Type" />
        <meta content="width=device-width, initial-scale=1" name="viewport" />
        <title>{title}</title>
        <span style={{ display: "none", opacity: 0 }}>{preview}</span>
      </head>
      <body style={bodyStyle}>
        <main style={containerStyle}>
          <section style={cardStyle}>
            <header style={headerStyle}>
              <p style={{ color: brand.green, fontSize: "13px", fontWeight: 700, margin: 0 }}>
                {eyebrow}
              </p>
              <h1 style={{ fontSize: "28px", lineHeight: "34px", margin: "10px 0 0" }}>
                {title}
              </h1>
            </header>
            <div style={contentStyle}>{children}</div>
          </section>
          <p style={{ color: brand.muted, fontSize: "12px", lineHeight: "18px", textAlign: "center" }}>
            Groo Team. Menus digitales para vender por WhatsApp.
          </p>
        </main>
      </body>
    </html>
  );
}

export function Text({ children }: { children: ReactNode }) {
  return <p style={{ color: brand.muted, fontSize: "15px", lineHeight: "24px", margin: "0 0 18px" }}>{children}</p>;
}

export function Highlight({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        backgroundColor: brand.soft,
        border: `1px solid ${brand.green}`,
        borderRadius: "12px",
        color: brand.greenDark,
        fontSize: "15px",
        fontWeight: 700,
        lineHeight: "22px",
        margin: "22px 0",
        padding: "16px",
      }}
    >
      {children}
    </div>
  );
}

export function ButtonLink({ children, href }: { children: ReactNode; href: string }) {
  return (
    <p style={{ margin: "24px 0" }}>
      <a href={href} style={buttonStyle}>
        {children}
      </a>
    </p>
  );
}
