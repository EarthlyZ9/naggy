interface Task {
    id: number;
    description: string;
    scheduledAt: string;  // ISO string format for date
    resolved: boolean;
  }

export type { Task };