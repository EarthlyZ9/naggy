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
  try {
    const result = await invoke<Task[]>('get_tasks');
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
