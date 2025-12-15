import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { TimePreset, TIME_PRESETS } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date string to HH:MM format
 * @param dateStr - ISO date string or Date object
 * @returns Time in HH:MM format with zero-padding
 */
export function formatTimeHHMM(dateStr: string | Date): string {
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Convert a TimePreset to a Date object
 * @param preset - The time preset ('10min', '30min', '1hour', '3hour')
 * @param baseDate - The base date to calculate from (defaults to now)
 * @returns Date object representing the scheduled time
 * @throws Error if preset is not a valid TimePreset value
 */
export function timePresetToDate(preset: TimePreset, baseDate: Date = new Date()): Date {
  switch (preset) {
    case TIME_PRESETS.TEN_MIN:
      return new Date(baseDate.getTime() + 10 * 60000);
    case TIME_PRESETS.THIRTY_MIN:
      return new Date(baseDate.getTime() + 30 * 60000);
    case TIME_PRESETS.ONE_HOUR:
      return new Date(baseDate.getTime() + 60 * 60000);
    case TIME_PRESETS.THREE_HOUR:
      return new Date(baseDate.getTime() + 3 * 60 * 60000);
    default:
      throw new Error(`Invalid TimePreset: ${preset}`);
  }
}
