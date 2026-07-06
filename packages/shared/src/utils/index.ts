export function isValidIranPhone(phone: string): boolean {
  return /^09\d{9}$/.test(phone);
}

export function toSlug(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9آ-ی\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function formatPersianDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('fa-IR');
}

export function formatPersianTimestamp(date: Date | string | number): string {
  const d = new Date(date);
  const persianDate = d.toLocaleDateString('fa-IR-u-ca-persian', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const time = d.toLocaleTimeString('fa-IR', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${persianDate} ${time}`;
}

export function formatPrice(price: number): string {
  return price.toLocaleString('fa-IR') + ' ریال';
}
