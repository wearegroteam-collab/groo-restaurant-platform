export function extractColombianMobile(value: string) {
  const trimmedValue = value.trim();

  if (/^3\d{9}$/.test(trimmedValue)) {
    return trimmedValue;
  }

  if (/^\+?57(3\d{9})$/.test(trimmedValue)) {
    return trimmedValue.replace(/^\+?57/, "");
  }

  try {
    const url = new URL(trimmedValue);
    const phone = url.hostname === "wa.me" ? url.pathname.replace(/\D/g, "") : url.searchParams.get("phone") ?? "";

    if (/^57(3\d{9})$/.test(phone)) {
      return phone.slice(2);
    }

    if (/^3\d{9}$/.test(phone)) {
      return phone;
    }
  } catch {
    return "";
  }

  return "";
}

export function isValidColombianMobile(value: string) {
  return /^3\d{9}$/.test(value);
}

export function buildColombianWhatsAppUrl(value: string, message?: string) {
  const mobile = extractColombianMobile(value);

  if (!mobile) {
    return "";
  }

  const baseUrl = `https://wa.me/57${mobile}`;

  if (!message) {
    return baseUrl;
  }

  return `${baseUrl}?text=${encodeURIComponent(message)}`;
}
