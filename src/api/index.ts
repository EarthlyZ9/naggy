import { Task } from '@/types';
import { invoke } from '@tauri-apps/api/core';
import { isPermissionGranted, requestPermission } from '@tauri-apps/plugin-notification';

export const checkNotificationPermission = async () => {
  let permissionGranted = await isPermissionGranted();
  console.log('Notification permission granted:', permissionGranted);
  if (!permissionGranted) {
    await requestPermission();
  }
};

export const getTasks = async () => {
  // Get the start of today in the user's local timezone
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Send as ISO string - the backend will convert to UTC
  const todayStr = today.toISOString();
  console.log('Fetching tasks for date:', todayStr);
  try {
    const result = await invoke<Task[]>('get_tasks', { date: todayStr });
    console.log(result); // TODO: remove this log
    return result;
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
  }
};

export const addTask = async (description: string, scheduledAt: Date) => {
  const newTask = await invoke<Task>('add_task', {
    description: description,
    scheduledAt: scheduledAt.toISOString(),
  });

  return newTask;
};

export const resolveTask = async (taskId: number) => {
  await invoke('resolve_task', { id: taskId });
};

export const removeTask = async (taskId: number) => {
  await invoke('remove_task', { id: taskId });
};

export const updateTask = async (
  taskId: number,
  description: string | null,
  scheduledAt: Date | null
) => {
  await invoke('update_task', {
    id: taskId,
    description: description,
    scheduledAt: scheduledAt ? scheduledAt.toISOString() : null,
  });
};
