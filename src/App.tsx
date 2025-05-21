import { zodResolver } from "@hookform/resolvers/zod"
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
import TaskList from "./components/TaskList";
import { Button } from "./components/ui/button";

const formSchema = z.object({
  description: z.string().min(1).max(100),
})

function App() {
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
      <div className="flex flex-row h-[40px] width-full justify-between bg-gray-700">
        <p>Naggy~</p>
        <Button>Reload</Button>
      </div>
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
    <TaskList />
    </main>
  );
}

export default App;