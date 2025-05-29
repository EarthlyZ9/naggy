import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
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
import { formatDateTime } from "./lib/utils";

const formSchema = z.object({
  time: z.string().min(1),
  description: z.string().min(1).max(100),
})

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  // Fetch tasks from the database
  async function fetchTasks() {
    // try {
    //   const result = await invoke<Task[]>("get_tasks");
    //   console.log(result);
    //   setTasks(result); // Update state with fetched tasks
    // } catch (error) {
    //   console.error("Failed to fetch tasks:", error);
    // }
    // Mock data for demonstration purposes
    const mockTasks: Task[] = [
      { id: 1, description: "Task 1", scheduled_at: "2025-05-29 10:00:00", resolved: false },
      { id: 2, description: "Task 2", scheduled_at: "2025-05-29 11:00:00", resolved: false },
      { id: 3, description: "Task 3", scheduled_at: "2025-05-29 12:00:00", resolved: false },
    ];
    setTasks(mockTasks); // Update state with mock tasks
  }




  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      time: "",
      description: "",
    },
  })
  const { setFocus } = form;

  useEffect(() => {
    fetchTasks(); // Fetch tasks when the component mounts

    // 윈도우 포커스 이벤트 리스너 추가
    const unlisten = getCurrentWindow().listen("tauri://focus", () => {
      console.log("Window focused by js");
      setFocus("time"); // 첫 번째 FormField 포커스
    });

    return () => {
      unlisten.then((dispose) => dispose()); // 이벤트 리스너 제거
    };
  }, []);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values)
    const now = new Date();
    const scheduledAt = new Date(now.getTime() + parseInt(values.time) * 60000) 

    // values -> Task
    const newTask: Task = {
      id: 100, // Simple ID generation for demonstration
      description: values.description,
      scheduled_at: formatDateTime(scheduledAt), // Convert to string format
      resolved: false,
    };
    setTasks((prevTasks) => [...prevTasks, newTask]); // Update tasks state
    // await invoke<void>("add_task");
  }

  async function resolveTask(taskId: number) {
    console.log("Resolving task with ID:", taskId);
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
                        <SelectValue placeholder="When" defaultValue={field.value} />
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
        <TaskList tasks={tasks} taskResolver={resolveTask} />
      </div>

    </main>
  );
}

export default App;