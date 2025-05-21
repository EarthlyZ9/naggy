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

  // 태스크를 메모리에서 제거하는 함수
    const handleResolve = (taskId: number) => {
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
        // 필요하다면 여기서 비동기로 DB에도 완료 처리 요청
        // await invoke("resolve_task", { id: taskId });
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