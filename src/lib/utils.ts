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
