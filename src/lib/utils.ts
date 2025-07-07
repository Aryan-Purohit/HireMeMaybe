import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
// ────────────────────────────────────────────────────────────────
// utils.ts  → add (or replace) this block
// ────────────────────────────────────────────────────────────────

/**
 * Copy text to the clipboard.  Shows a console message on success/failure;
 * you can wire in your own toast system here if desired.
 */
export async function copyToClipboard(
  text: string,
  label: string = 'Text'
) {
  try {
    await navigator.clipboard.writeText(text);
    console.info(`${label} copied to clipboard ✔︎`);
    // If you’re using a toast library, trigger success toast here.
  } catch (err) {
    console.error('Failed to copy:', err);
    // Optionally show a toast error to the user.
  }
}
