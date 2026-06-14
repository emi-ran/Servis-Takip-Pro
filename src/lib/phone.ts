export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10 && !digits.startsWith("0")) {
    return "0" + digits;
  }
  if (digits.length === 11 && digits.startsWith("0")) {
    return digits;
  }
  return digits;
}

export function isValidPhone(phone: string): boolean {
  return /^05\d{9}$/.test(phone);
}

export function formatPhone(raw: string): string {
  const normalized = normalizePhone(raw);
  if (normalized.length !== 11) return raw;

  return `${normalized.slice(0, 4)} ${normalized.slice(4, 7)} ${normalized.slice(7, 9)} ${normalized.slice(9, 11)}`;
}

export function formatPhoneInput(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  const localDigits = digits.startsWith("0") ? digits.slice(1, 11) : digits.slice(0, 10);
  const normalized = `0${localDigits}`;
  const groups = [normalized.slice(0, 4), normalized.slice(4, 7), normalized.slice(7, 9), normalized.slice(9, 11)];

  return groups.filter(Boolean).join(" ");
}
