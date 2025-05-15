import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod"
import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import { z } from "zod"
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

// Define the Task type
interface Task {
  id: number;
  description: string;
  scheduled_at: string;
  resolved: boolean;
}

const formSchema = z.object({
  description: z.string().min(1).max(100),
})

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

  useEffect(() => {
    fetchTasks(); // Fetch tasks when the component mounts
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values)
  }

  return (
    <main className="container">
      <h1>Task List</h1>
      <button onClick={fetchTasks}>Reload</button> {/* Reload button */}
      <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => {
        if (data.description.length < 1) {
          return;
        }
        onSubmit(data);
          form.reset(); // 입력 필드 초기화
        })} 
      className="space-y-8">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="what should i nag about?" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
      <ul>
        {tasks.map((t) => (
          <li key={t.id}>
            <strong>{t.description}</strong> - {t.scheduled_at} -{" "}
            {t.resolved ? "Resolved" : "Pending"}
          </li>
        ))}
      </ul>
    </main>
  );
}

export default App;