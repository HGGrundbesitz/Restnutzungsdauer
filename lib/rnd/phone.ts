export function normalizeGermanPhone(value?: string) {
  const trimmed = value?.trim() ?? '';
  if (!trimmed) return '';

  const digits = trimmed.replace(/\D/g, '');
  let nationalNumber = digits;

  if (digits.startsWith('0049')) nationalNumber = digits.slice(4);
  else if (digits.startsWith('49')) nationalNumber = digits.slice(2);
  else if (digits.startsWith('0')) nationalNumber = digits.slice(1);

  return nationalNumber ? `+49${nationalNumber}` : '';
}

export function getGermanNationalNumber(value?: string) {
  const normalized = normalizeGermanPhone(value);
  return normalized.startsWith('+49') ? normalized.slice(3) : '';
}

export function isValidGermanPhone(value?: string) {
  const normalized = normalizeGermanPhone(value);
  return !normalized || /^\+49\d{6,13}$/.test(normalized);
}
