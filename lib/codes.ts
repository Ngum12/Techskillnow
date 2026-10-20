// No 0/O/1/I to avoid confusion when codes are read aloud or typed.
export const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const CODE_PATTERN = /^[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/;

/** Uppercases, strips spaces/dashes and re-inserts the dash. Returns null if it can't be a valid code. */
export function normalizeCode(input: string): string | null {
  const raw = input.toUpperCase().replace(/[\s-]/g, "");
  if (raw.length !== 8) return null;
  const code = `${raw.slice(0, 4)}-${raw.slice(4)}`;
  return CODE_PATTERN.test(code) ? code : null;
}

export function generateCode(): string {
  const bytes = new Uint32Array(8);
  crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < 8; i++) {
    if (i === 4) out += "-";
    out += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  }
  return out;
}

/** Digits only, adding Cameroon's 237 prefix to 9-digit local numbers. */
export function phoneForWhatsApp(phone: string): string {
  const digits = phone.replace(/\D/g, "").replace(/^00/, "");
  return digits.length === 9 ? `237${digits}` : digits;
}

export function lastDigits(phone: string, n = 4): string {
  return phone.replace(/\D/g, "").slice(-n);
}
