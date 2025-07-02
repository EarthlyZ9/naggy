import { Task } from "@/types";
import TaskCard from "./TaskCard";

function TaskList({tasks, taskResolver, taskRemover}: { tasks: Task[], taskResolver: (taskId: number) => Promise<void>, taskRemover: (taskId: number) => Promise<void> }) {
  // remove task from the list
  const handleResolve = async (taskId: number) => {
      await taskResolver(taskId);
  };

  const handleRemove = async (taskId: number) => {
    await taskRemover(taskId);
  };

  return (
    <div>
      {tasks.map((t) => (
        <TaskCard task={t} onResolved={handleResolve} onRemove={handleRemove} key={t.id} />
      ))}
    </div>
  );
}

export default TaskList;