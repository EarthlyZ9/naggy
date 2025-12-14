import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import TaskList from './components/TaskList';
import { Separator } from './components/ui/separator';
import { Task, TIME_PRESETS, TimePreset } from './types';
import { useEffect, useState } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { invoke } from '@tauri-apps/api/core';
import Navbar from './components/Navbar';
import { checkNotificationPermission, getTasks, removeTask, resolveTask } from './api';
import { TimeDropdownLikeSelect } from './components/TimeDropdownLikeSelect';
import { timePresetToDate } from './lib/utils';

const formSchema = z.object({
  time: z.string().min(1),
  description: z.string().min(1).max(100),
});

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      time: '',
      description: '',
    },
  });
  const { setFocus } = form;

  useEffect(() => {
    const initialize = async () => {
      // Fetch tasks
      const fetchedTasks = await getTasks();
      setTasks(fetchedTasks || []);

      // Request notification permission
      await checkNotificationPermission();

      // Setup window focus listener
      const unlisten = await getCurrentWindow().listen('tauri://focus', () => {
        setFocus('time');
      });

      return unlisten;
    };

    let cleanup: (() => void) | undefined;

    initialize().then((unlisten) => {
      cleanup = unlisten;
    });

    return () => {
      cleanup?.();
    };
  }, [setFocus]);

  /**
   * Parse time string from TimeDropdownLikeSelect and calculate scheduled date
   * Handles formats: '10min', '30min', '1hour', '3hour', or 'HH:MM'
   * @param timeString - The time string from the form
   * @returns Date object representing the scheduled time
   * @throws Error if timeString is not a valid format
   */
  const parseTimeToScheduledDate = (timeString: string): Date => {
    const now = new Date();

    // Check if timeString is a valid TimePreset
    const presetValues = Object.values(TIME_PRESETS);
    if (presetValues.includes(timeString as TimePreset)) {
      return timePresetToDate(timeString as TimePreset, now);
    }

    // Handle HH:MM format
    if (timeString.includes(':')) {
      const [hours, minutes] = timeString.split(':').map((s) => parseInt(s, 10));
      const scheduledDate = new Date(now);
      scheduledDate.setHours(hours, minutes, 0, 0);

      // If the time has already passed today, schedule for tomorrow
      if (scheduledDate <= now) {
        scheduledDate.setDate(scheduledDate.getDate() + 1);
      }

      return scheduledDate;
    }

    throw new Error(`Invalid time string: ${timeString}`);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const scheduledAt = parseTimeToScheduledDate(values.time);

    const newTask = await invoke<Task>('add_task', {
      description: values.description,
      scheduledAt: scheduledAt.toISOString(),
    });
    setTasks((prevTasks) => {
      const updated = [...prevTasks, newTask];
      updated.sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
      return updated;
    });
  }

  async function onTaskResolve(taskId: number) {
    await resolveTask(taskId);
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
  }

  async function onTaskRemove(taskId: number) {
    await removeTask(taskId);
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
  }

  async function onTaskUpdate() {
    const fetchedTasks = await getTasks();
    setTasks(fetchedTasks || []);
  }

  return (
    <main className="container">
      <Navbar />
      <div className="p-2">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(async (data) => {
              if (data.description.length < 1) {
                return;
              }
              await onSubmit(data);
              form.reset();
            })}
            className="flex flex-row items-center w-full gap-2"
          >
            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem className="basis-1/4">
                  <FormControl>
                    <TimeDropdownLikeSelect field={field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="basis-3/4">
                  <FormControl>
                    <Input placeholder="what should i nag about?" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </form>
        </Form>
        <Separator className="m-3" />
        <TaskList
          tasks={tasks}
          taskResolver={onTaskResolve}
          taskRemover={onTaskRemove}
          taskUpdater={onTaskUpdate}
        />
      </div>
    </main>
  );
}

export default App;
