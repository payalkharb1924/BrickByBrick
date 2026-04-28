import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges class names using clsx and tailwind-merge.
 * Resolves Tailwind CSS class conflicts intelligently.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
