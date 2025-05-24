interface Task {
    id: number;
    description: string;
    scheduled_at: string;
    resolved: boolean;
  }

export type { Task };