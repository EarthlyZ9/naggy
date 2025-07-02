import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { set, useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import TaskList from "./components/TaskList";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "./components/ui/separator";
import { Task } from "./types";
import { useEffect, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { invoke } from "@tauri-apps/api/core";

const formSchema = z.object({
  time: z.string().min(1),
  description: z.string().min(1).max(100),
});

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  // Fetch tasks from the database
  async function fetchTasks() {
    try {
      const result = await invoke<Task[]>("get_tasks");
      console.log(result);
      setTasks(result); // Update state with fetched tasks
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    }
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      time: "",
      description: "",
    },
  });
  const { setFocus } = form;

  useEffect(() => {
    fetchTasks(); // Fetch tasks when the component mounts

    // 윈도우 포커스 시 첫번째 form input 에 포커스 설정
    const unlisten = getCurrentWindow().listen("tauri://focus", () => {
      setFocus("time");
    });
    return () => {
      unlisten.then((dispose) => dispose()); // 이벤트 리스너 제거
    };
  }, []);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const now = new Date();
    const scheduledAt = new Date(now.getTime() + parseInt(values.time) * 60000);

    const newTask = await invoke<Task>("add_task", {
      description: values.description,
      scheduledAt: scheduledAt.toISOString(),
    });
    setTasks((prevTasks) => {
      const updated = [...prevTasks, newTask];
      updated.sort(
        (a, b) =>
          new Date(a.scheduledAt).getTime() -
          new Date(b.scheduledAt).getTime()
      );
      return updated;
    });
  }

  async function resolveTask(taskId: number) {
    await invoke("resolve_task", { id: taskId });
    setTasks((prevTasks) =>
      prevTasks.filter((task) => task.id !== taskId)
    );
  }

  async function removeTask(taskId: number) {
    await invoke("remove_task", { id: taskId });
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
  }

  return (
    <main className="container">
      <div className="flex flex-row h-[40px] w-full justify-between bg-gray-700">
        <p>Naggy~</p>
      </div>
      <div className="p-2">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(async (data) => {
              if (data.description.length < 1) {
                return;
              }
              // option value to time format
              await onSubmit(data);
              form.reset(); // 입력 필드 초기화
            })}
            className="flex flex-row items-center w-full gap-2"
          >
            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem className="basis-1/4">
                  <FormControl>
                    {/* <TimeDropdownLikeSelect field={field} /> */}
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue
                          placeholder="When"
                          defaultValue={field.value}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10min</SelectItem>
                        <SelectItem value="30">30min</SelectItem>
                        <SelectItem value="60">1hour</SelectItem>
                        <SelectItem value="180">3hour</SelectItem>
                      </SelectContent>
                    </Select>
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
        <TaskList tasks={tasks} taskResolver={resolveTask} taskRemover={removeTask}/>
      </div>
    </main>
  );
}

export default App;
