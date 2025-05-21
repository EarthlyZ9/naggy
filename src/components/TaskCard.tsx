import { Task } from "@/types";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";

function TaskCard({ task, onResolved }: { task: Task; onResolved: (taskId: number) => void }) {

    const resolveTask = (taskId: number) => {
        console.log(`Resolving task with ID: ${taskId}`);
        onResolved(taskId);
        // TODO: Call the backend to resolve the task
        // await invoke("resolve_task", { id: taskId });
    }

    const extractTimeString = (dateString: string) => {
        const time = dateString.split(" ")[1];
        const timeWithoutSeconds = time.split(":").slice(0, 2).join(":");
        return timeWithoutSeconds;
    }

    return (
        <Card className="gap-2 p-1">
            <CardContent className="flex flex-row items-center justify-between">
                <Badge variant="outline">{extractTimeString(task.scheduled_at)}</Badge>
                <div className="flex justify-start w-[400px] px-4">
                    <p>{task.description}</p>
                </div>
                <Button onClick={() => resolveTask(task.id)}>✅</Button>
            </CardContent>
        </Card>
    );
}

export default TaskCard; 