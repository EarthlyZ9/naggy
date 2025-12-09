interface Task {
  id: number;
  description: string;
  scheduledAt: string; // ISO string format for date
  resolved: boolean;
}

// Time preset constants for task scheduling
export const TIME_PRESETS = {
  TEN_MIN: '10min',
  THIRTY_MIN: '30min',
  ONE_HOUR: '1hour',
  THREE_HOUR: '3hour',
} as const;

export type TimePreset = (typeof TIME_PRESETS)[keyof typeof TIME_PRESETS];

export type { Task };
