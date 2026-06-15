import type { ReactElement } from "react";

type SendEmailInput = {
  html: ReactElement;
  subject: string;
  to: string;
};

type ResendPayload = {
  from: string;
  html: string;
  subject: string;
  to: string[];
};

const DEFAULT_FROM_EMAIL = "Groo Team <no-reply@grooteam.com>";

export async function sendTransactionalEmail({ html, subject, to }: SendEmailInput) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn("RESEND_API_KEY no esta configurado. Correo omitido:", subject);
    return { skipped: true };
  }

  const { renderToStaticMarkup } = await import("react-dom/server");
  const payload: ResendPayload = {
    from: process.env.RESEND_FROM_EMAIL || DEFAULT_FROM_EMAIL,
    html: `<!doctype html>${renderToStaticMarkup(html)}`,
    subject,
    to: [to],
  };

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Resend no pudo enviar el correo: ${details}`);
  }

  return response.json();
}
