/**
 * Generator unikalnych kodów voucherów
 * Format: GP-XXXX-XXXX (GP = Glass Project)
 * Używany przy tworzeniu Stripe Payment Link (w metadata)
 */

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
// Celowo pomijamy: I, O, 0, 1 — łatwo pomylić wizualnie

export function generateVoucherCode(): string {
  const segment = (len: number) =>
    Array.from(
      { length: len },
      () => CHARS[Math.floor(Math.random() * CHARS.length)],
    ).join('');

  return `GP-${segment(4)}-${segment(4)}`;
}

/**
 * Walidacja kodu — przydatna przy realizacji vouchera
 */
export function isValidVoucherCode(code: string): boolean {
  return /^GP-[A-Z2-9]{4}-[A-Z2-9]{4}$/.test(code);
}
