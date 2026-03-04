import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// utils/date.ts
export const formatDate = (value?: Date | string | null) => {
  if (!value) return "-";

  const date = value instanceof Date ? value : new Date(value);

  if (isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat('id-ID').format(date);
};