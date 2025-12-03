import {
  isPermissionGranted,
  requestPermission,
  Schedule,
  sendNotification,
} from '@tauri-apps/plugin-notification';

export const checkNotificationPermission = async () => {
  let permissionGranted = await isPermissionGranted();
  console.log('Notification permission granted:', permissionGranted);
  if (!permissionGranted) {
    await requestPermission();
  }
};

type NotificationExtra = Record<string, any>;

export const scheduleNotification = (id: number, body: string, scheduleDt: Date) => {
  const title = 'Nagging...';
  const extra: NotificationExtra = { taskId: id };
  sendNotification({ title, body, schedule: Schedule.at(scheduleDt), extra });
  console.log('Notification scheduled:', { title, body, scheduleDt, extra });
};
