import { Task } from "@/types";
import TaskCard from "./TaskCard";
import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

function TaskList() {
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

  // remove task from the list
  const handleResolve = (taskId: number) => {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  return (
    <div>
      {tasks.map((t) => (
        <TaskCard task={t} onResolved={handleResolve} key={t.id} />
      ))}
    </div>
  );
}

export default TaskList;