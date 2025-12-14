import { Task } from '@/types';
import TaskCard from './TaskCard';

function TaskList({
  tasks,
  taskResolver,
  taskRemover,
  taskUpdater,
}: {
  tasks: Task[];
  taskResolver: (taskId: number) => Promise<void>;
  taskRemover: (taskId: number) => Promise<void>;
  taskUpdater?: () => Promise<void>;
}) {
  return (
    <div>
      {tasks.map((t) => (
        <TaskCard
          task={t}
          onResolved={taskResolver}
          onRemove={taskRemover}
          onUpdate={taskUpdater}
          key={t.id}
        />
      ))}
    </div>
  );
}

export default TaskList;
