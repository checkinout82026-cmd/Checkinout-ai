import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a phone string into (XXX) - XXX- XXXX without requiring manual dashes or parentheses
 */
export function formatPhoneNumber(input: string): string {
  if (!input) return '';
  const digits = input.replace(/\D/g, '');
  if (!digits) return '';

  if (digits.length <= 3) {
    return `(${digits}`;
  }
  if (digits.length <= 6) {
    return `(${digits.slice(0, 3)}) - ${digits.slice(3)}`;
  }
  if (digits.length <= 10) {
    return `(${digits.slice(0, 3)}) - ${digits.slice(3, 6)}- ${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 3)}) - ${digits.slice(3, 6)}- ${digits.slice(6, 10)}`;
}

/**
 * Sanitizes CSV cell values to prevent CSV Formula Injection (CWE-1236)
 */
export function sanitizeCsvCell(val: unknown): string {
  if (val === null || val === undefined) return '""';
  let str = String(val);
  // Neutralize formula trigger characters (=, +, -, @, tab, carriage return)
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  return `"${str.replace(/"/g, '""')}"`;
}

