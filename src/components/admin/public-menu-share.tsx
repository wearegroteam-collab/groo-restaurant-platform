"use client";

import { useEffect, useMemo } from "react";
import Image from "next/image";
import { Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAppUrl } from "@/lib/config/app-url";

type PublicMenuShareProps = {
  onCopied?: (label: string) => void;
  slug: string;
};

function buildQrImageUrl(shortMenuUrl: string) {
  const params = new URLSearchParams({
    bgcolor: "FFFFFF",
    color: "000000",
    data: shortMenuUrl,
    ecc: "H",
    format: "png",
    qzone: "4",
    size: "320x320",
  });

  return `https://api.qrserver.com/v1/create-qr-code/?${params.toString()}`;
}

export function PublicMenuShare({ onCopied, slug }: PublicMenuShareProps) {
  const baseUrl = getAppUrl();
  const shortMenuUrl = `${baseUrl}/${slug}`;
  const fullMenuUrl = `${baseUrl}/${slug}/menu`;
  const qrImageUrl = useMemo(() => buildQrImageUrl(shortMenuUrl), [shortMenuUrl]);

  useEffect(() => {
    console.log("QR URL:", shortMenuUrl);
  }, [shortMenuUrl]);

  function copy(value: string, label: string) {
    navigator.clipboard
      .writeText(value)
      .then(() => onCopied?.(label))
      .catch(() => onCopied?.("No se pudo copiar el enlace."));
  }

  async function downloadQr() {
    try {
      const response = await fetch(qrImageUrl);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `${slug}-qr-menu.png`;
      link.href = objectUrl;
      link.click();
      URL.revokeObjectURL(objectUrl);
    } catch {
      const link = document.createElement("a");
      link.download = `${slug}-qr-menu.png`;
      link.href = qrImageUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.click();
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
      <div className="grid gap-3">
        <div className="rounded-lg border border-ink/10 bg-brand-50/60 p-4">
          <p className="text-sm font-semibold text-ink/60">Enlace corto</p>
          <p className="mt-1 break-all font-bold">{shortMenuUrl}</p>
        </div>
        <div className="rounded-lg border border-ink/10 bg-white p-4">
          <p className="text-sm font-semibold text-ink/60">Enlace completo</p>
          <p className="mt-1 break-all font-bold">{fullMenuUrl}</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Button onClick={() => copy(shortMenuUrl, "Enlace corto copiado.")} variant="outline">
            Copiar enlace corto
          </Button>
          <Button onClick={() => copy(fullMenuUrl, "Enlace completo copiado.")} variant="outline">
            Copiar enlace completo
          </Button>
          <Button asChild>
            <a href={fullMenuUrl} rel="noopener noreferrer" target="_blank">
              Ver menu <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>

      <div className="grid justify-items-center gap-3 rounded-lg border border-ink/10 bg-white p-5 text-center shadow-sm">
        <p className="text-sm font-bold text-ink/60">QR del menu</p>
        <Image
          alt={`QR para ${shortMenuUrl}`}
          className="h-60 w-60 rounded-md border border-ink/10 bg-white p-2"
          height={240}
          src={qrImageUrl}
          width={240}
        />
        <p className="max-w-xs break-all text-xs font-semibold leading-5 text-ink/55">
          Este QR abre: {shortMenuUrl}
        </p>
        <Button onClick={downloadQr} variant="outline">
          <Download className="h-4 w-4" />
          Descargar QR
        </Button>
      </div>
    </div>
  );
}
