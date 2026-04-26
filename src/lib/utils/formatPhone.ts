export function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "");
}

export function isKoreanMobilePhone(phone: string) {
  const normalized = normalizePhone(phone);
  return /^01[016789]\d{7,8}$/.test(normalized);
}

export function formatPhone(phone: string) {
  const normalized = normalizePhone(phone);

  if (normalized.length === 10) {
    return `${normalized.slice(0, 3)}-${normalized.slice(3, 6)}-${normalized.slice(6)}`;
  }

  if (normalized.length === 11) {
    return `${normalized.slice(0, 3)}-${normalized.slice(3, 7)}-${normalized.slice(7)}`;
  }

  return phone;
}
