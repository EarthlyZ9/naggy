import { Task } from "@/types";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { useMemo } from "react";

function TaskCard({
  task,
  onResolved,
}: {
  task: Task;
  onResolved: (taskId: number) => void;
}) {
  const resolveTask = (taskId: number) => {
    console.log(`Resolving task with ID: ${taskId}`);
    onResolved(taskId);
    // TODO: Call the backend to resolve the task
    // await invoke("resolve_task", { id: taskId });
  };

  const formatDateTime = (dtStr: string) => {
    const localTime = new Date(dtStr);
    return (
      localTime.getHours().toString() + ":" + localTime.getMinutes().toString()
    );
  };

  const getBadgeStyle = (scheduledAt: string) => {
    const now = new Date();
    const scheduled = new Date(scheduledAt);
    const diffMinutes = (now.getTime() - scheduled.getTime()) / 60000;
    if (diffMinutes >= 10) return "bg-red-400";
    if (diffMinutes >= 0) return "bg-yellow-300";
    return "";
  };

  const badgeStyle = useMemo(() => getBadgeStyle(task.scheduledAt), [task.scheduledAt]);

  return (
    <Card className="gap-2 p-1">
      <CardContent className="flex flex-row items-center justify-between">
        <Badge className={`text-black w-[50px] ${badgeStyle}`} variant="outline">
          {formatDateTime(task.scheduledAt)}
        </Badge>
        <div className="flex justify-start w-[400px] px-4">
          <p>{task.description}</p>
        </div>
        <Button variant="ghost" onClick={() => resolveTask(task.id)}>
          ✅
        </Button>
      </CardContent>
    </Card>
  );
}

export default TaskCard;
