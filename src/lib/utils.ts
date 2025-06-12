import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDateTime(dt: Date): string {
  const year = dt.getFullYear();
  const month = String(dt.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1
  const day = String(dt.getDate()).padStart(2, '0');
  const hours = String(dt.getHours()).padStart(2, '0');
  const minutes = String(dt.getMinutes()).padStart(2, '0');
  const seconds = String(dt.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export function utcStringToLocalDate(utcString: string): Date {
  const date = new Date(utcString);
  // UTC 문자열을 로컬 시간대로 변환
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000);
}