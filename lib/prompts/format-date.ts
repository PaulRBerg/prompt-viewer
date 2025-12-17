import { DateTime } from "effect";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

/**
 * Safely formats a date string using Effect DateTime.
 * Falls back to raw date string if parsing fails.
 */
export function formatDate(date: string): string {
  try {
    return DateTime.formatIntl(DateTime.unsafeMake(date), dateFormatter);
  } catch {
    return date;
  }
}
