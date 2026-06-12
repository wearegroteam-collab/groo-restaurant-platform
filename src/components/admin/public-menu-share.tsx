"use client";

import { useEffect, useMemo, useRef } from "react";
import { Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAppUrl } from "@/lib/config/app-url";

const QR_VERSION = 5;
const QR_SIZE = 17 + QR_VERSION * 4;
const DATA_CODEWORDS = 108;
const ECC_CODEWORDS = 26;

type PublicMenuShareProps = {
  onCopied?: (label: string) => void;
  slug: string;
};

function gfMultiply(left: number, right: number) {
  let result = 0;

  while (right > 0) {
    if (right & 1) {
      result ^= left;
    }

    left <<= 1;

    if (left & 0x100) {
      left ^= 0x11d;
    }

    right >>= 1;
  }

  return result;
}

function reedSolomonGenerator(degree: number) {
  let result = [1];

  for (let index = 0; index < degree; index += 1) {
    const next = new Array(result.length + 1).fill(0) as number[];
    const factor = gfPow(2, index);

    result.forEach((coefficient, coefficientIndex) => {
      next[coefficientIndex] ^= gfMultiply(coefficient, factor);
      next[coefficientIndex + 1] ^= coefficient;
    });

    result = next;
  }

  return result;
}

function gfPow(value: number, power: number) {
  let result = 1;

  for (let index = 0; index < power; index += 1) {
    result = gfMultiply(result, value);
  }

  return result;
}

function reedSolomonRemainder(data: number[], degree: number) {
  const generator = reedSolomonGenerator(degree);
  const result = [...data, ...new Array(degree).fill(0)] as number[];

  for (let index = 0; index < data.length; index += 1) {
    const coefficient = result[index];

    if (coefficient === 0) {
      continue;
    }

    for (let generatorIndex = 0; generatorIndex < generator.length; generatorIndex += 1) {
      result[index + generatorIndex] ^= gfMultiply(generator[generatorIndex], coefficient);
    }
  }

  return result.slice(data.length);
}

function appendBits(bits: number[], value: number, length: number) {
  for (let index = length - 1; index >= 0; index -= 1) {
    bits.push((value >>> index) & 1);
  }
}

function toCodewords(value: string) {
  const bytes = Array.from(new TextEncoder().encode(value));
  const bits: number[] = [];

  appendBits(bits, 0b0100, 4);
  appendBits(bits, bytes.length, 8);
  bytes.forEach((byte) => appendBits(bits, byte, 8));
  appendBits(bits, 0, Math.min(4, DATA_CODEWORDS * 8 - bits.length));

  while (bits.length % 8 !== 0) {
    bits.push(0);
  }

  const data = [];

  for (let index = 0; index < bits.length; index += 8) {
    data.push(Number.parseInt(bits.slice(index, index + 8).join(""), 2));
  }

  const pads = [0xec, 0x11];
  let padIndex = 0;

  while (data.length < DATA_CODEWORDS) {
    data.push(pads[padIndex % pads.length]);
    padIndex += 1;
  }

  return data.slice(0, DATA_CODEWORDS);
}

function createMatrix() {
  return {
    modules: Array.from({ length: QR_SIZE }, () => new Array(QR_SIZE).fill(false) as boolean[]),
    reserved: Array.from({ length: QR_SIZE }, () => new Array(QR_SIZE).fill(false) as boolean[]),
  };
}

function setModule(
  matrix: ReturnType<typeof createMatrix>,
  row: number,
  column: number,
  value: boolean,
  reserved = true,
) {
  if (row < 0 || column < 0 || row >= QR_SIZE || column >= QR_SIZE) {
    return;
  }

  matrix.modules[row][column] = value;
  matrix.reserved[row][column] = reserved;
}

function drawFinder(matrix: ReturnType<typeof createMatrix>, row: number, column: number) {
  for (let y = -1; y <= 7; y += 1) {
    for (let x = -1; x <= 7; x += 1) {
      const distance = Math.max(Math.abs(x - 3), Math.abs(y - 3));
      setModule(matrix, row + y, column + x, distance !== 2 && distance !== 4);
    }
  }
}

function drawAlignment(matrix: ReturnType<typeof createMatrix>, row: number, column: number) {
  for (let y = -2; y <= 2; y += 1) {
    for (let x = -2; x <= 2; x += 1) {
      const distance = Math.max(Math.abs(x), Math.abs(y));
      setModule(matrix, row + y, column + x, distance !== 1);
    }
  }
}

function drawFunctionPatterns(matrix: ReturnType<typeof createMatrix>) {
  drawFinder(matrix, 0, 0);
  drawFinder(matrix, 0, QR_SIZE - 7);
  drawFinder(matrix, QR_SIZE - 7, 0);

  for (let index = 0; index < QR_SIZE; index += 1) {
    setModule(matrix, 6, index, index % 2 === 0);
    setModule(matrix, index, 6, index % 2 === 0);
  }

  [6, 30].forEach((row) => {
    [6, 30].forEach((column) => {
      if (!matrix.reserved[row][column]) {
        drawAlignment(matrix, row, column);
      }
    });
  });

  setModule(matrix, QR_SIZE - 8, 8, true);

  for (let index = 0; index < 9; index += 1) {
    if (index !== 6) {
      matrix.reserved[8][index] = true;
      matrix.reserved[index][8] = true;
    }
  }

  for (let index = QR_SIZE - 8; index < QR_SIZE; index += 1) {
    matrix.reserved[8][index] = true;
    matrix.reserved[index][8] = true;
  }
}

function formatBits() {
  let value = 0b01000;
  value <<= 10;

  for (let index = 14; index >= 10; index -= 1) {
    if ((value >>> index) & 1) {
      value ^= 0x537 << (index - 10);
    }
  }

  return (((0b01000 << 10) | value) ^ 0x5412).toString(2).padStart(15, "0");
}

function drawFormatBits(matrix: ReturnType<typeof createMatrix>) {
  const bits = formatBits();
  const first = [
    [8, 0],
    [8, 1],
    [8, 2],
    [8, 3],
    [8, 4],
    [8, 5],
    [8, 7],
    [8, 8],
    [7, 8],
    [5, 8],
    [4, 8],
    [3, 8],
    [2, 8],
    [1, 8],
    [0, 8],
  ];

  const second = [
    [QR_SIZE - 1, 8],
    [QR_SIZE - 2, 8],
    [QR_SIZE - 3, 8],
    [QR_SIZE - 4, 8],
    [QR_SIZE - 5, 8],
    [QR_SIZE - 6, 8],
    [QR_SIZE - 7, 8],
    [8, QR_SIZE - 8],
    [8, QR_SIZE - 7],
    [8, QR_SIZE - 6],
    [8, QR_SIZE - 5],
    [8, QR_SIZE - 4],
    [8, QR_SIZE - 3],
    [8, QR_SIZE - 2],
    [8, QR_SIZE - 1],
  ];

  bits.split("").forEach((bit, index) => {
    const firstPosition = first[index];
    const secondPosition = second[index];
    setModule(matrix, firstPosition[0], firstPosition[1], bit === "1");
    setModule(matrix, secondPosition[0], secondPosition[1], bit === "1");
  });
}

function mask(row: number, column: number) {
  return (row + column) % 2 === 0;
}

function generateQrModules(value: string) {
  const data = toCodewords(value);
  const codewords = [...data, ...reedSolomonRemainder(data, ECC_CODEWORDS)];
  const matrix = createMatrix();
  drawFunctionPatterns(matrix);

  const bits = codewords.flatMap((codeword) =>
    codeword
      .toString(2)
      .padStart(8, "0")
      .split("")
      .map((bit) => bit === "1"),
  );
  let bitIndex = 0;
  let upwards = true;

  for (let column = QR_SIZE - 1; column > 0; column -= 2) {
    if (column === 6) {
      column -= 1;
    }

    for (let step = 0; step < QR_SIZE; step += 1) {
      const row = upwards ? QR_SIZE - 1 - step : step;

      for (let offset = 0; offset < 2; offset += 1) {
        const currentColumn = column - offset;

        if (matrix.reserved[row][currentColumn]) {
          continue;
        }

        const valueBit = bits[bitIndex] ?? false;
        setModule(matrix, row, currentColumn, valueBit !== mask(row, currentColumn), false);
        bitIndex += 1;
      }
    }

    upwards = !upwards;
  }

  drawFormatBits(matrix);
  return matrix.modules;
}

export function PublicMenuShare({ onCopied, slug }: PublicMenuShareProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const baseUrl = getAppUrl();
  const shortUrl = `${baseUrl}/${slug}`;
  const fullUrl = `${baseUrl}/${slug}/menu`;
  const modules = useMemo(() => generateQrModules(shortUrl), [shortUrl]);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const scale = 8;
    const padding = 4;
    const size = (QR_SIZE + padding * 2) * scale;
    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    canvas.width = size;
    canvas.height = size;
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, size, size);
    context.fillStyle = "#172018";

    modules.forEach((row, rowIndex) => {
      row.forEach((isDark, columnIndex) => {
        if (isDark) {
          context.fillRect((columnIndex + padding) * scale, (rowIndex + padding) * scale, scale, scale);
        }
      });
    });
  }, [modules]);

  function copy(value: string, label: string) {
    navigator.clipboard
      .writeText(value)
      .then(() => onCopied?.(label))
      .catch(() => onCopied?.("No se pudo copiar el enlace."));
  }

  function downloadQr() {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const link = document.createElement("a");
    link.download = `${slug}-qr-menu.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
      <div className="grid gap-3">
        <div className="rounded-lg border border-ink/10 bg-brand-50/60 p-4">
          <p className="text-sm font-semibold text-ink/60">Enlace corto</p>
          <p className="mt-1 break-all font-bold">{shortUrl}</p>
        </div>
        <div className="rounded-lg border border-ink/10 bg-white p-4">
          <p className="text-sm font-semibold text-ink/60">Enlace completo</p>
          <p className="mt-1 break-all font-bold">{fullUrl}</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Button onClick={() => copy(shortUrl, "Enlace corto copiado.")} variant="outline">
            Copiar enlace corto
          </Button>
          <Button onClick={() => copy(fullUrl, "Enlace completo copiado.")} variant="outline">
            Copiar enlace completo
          </Button>
          <Button asChild>
            <a href={fullUrl} rel="noopener noreferrer" target="_blank">
              Ver menu <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>

      <div className="grid justify-items-center gap-3 rounded-lg border border-ink/10 bg-white p-5 text-center shadow-sm">
        <p className="text-sm font-bold text-ink/60">QR del menu</p>
        <canvas
          aria-label={`QR para ${shortUrl}`}
          className="h-56 w-56 rounded-md border border-ink/10 bg-white"
          ref={canvasRef}
        />
        <Button onClick={downloadQr} variant="outline">
          <Download className="h-4 w-4" />
          Descargar QR
        </Button>
      </div>
    </div>
  );
}
