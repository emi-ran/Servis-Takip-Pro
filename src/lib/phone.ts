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
