import { MessageCircle } from "lucide-react";
import { buildColombianWhatsAppUrl } from "@/lib/whatsapp";

type WhatsAppFabProps = {
  href: string;
};

export function WhatsAppFab({ href }: WhatsAppFabProps) {
  const whatsappHref = buildColombianWhatsAppUrl(href);

  return (
    <a
      aria-label="Ordenar por WhatsApp"
      className="fixed inset-x-4 bottom-5 z-40 mx-auto inline-flex max-w-md items-center justify-center gap-2 rounded-full bg-[#25d366] px-6 py-4 text-sm font-bold text-white shadow-soft transition hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#25d366] focus:ring-offset-2"
      href={whatsappHref || "#"}
      rel="noreferrer"
      target="_blank"
    >
      <MessageCircle className="h-5 w-5" />
      Ordenar por WhatsApp
    </a>
  );
}
