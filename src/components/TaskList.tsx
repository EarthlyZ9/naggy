import { Task } from "@/types";
import TaskCard from "./TaskCard";

function TaskList({tasks, taskResolver}: { tasks: Task[], taskResolver: (taskId: number) => Promise<void>;  }) {
  // remove task from the list
  const handleResolve = async (taskId: number) => {
      await taskResolver(taskId);
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