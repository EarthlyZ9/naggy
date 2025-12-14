import { Task } from '@/types';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import React, { useMemo, useState } from 'react';
import { updateTask } from '@/api';
import { Input } from './ui/input';
import { TimeInput } from './TimeInput';

function TaskCard({
  task,
  onResolved,
  onRemove,
  onUpdate,
}: {
  task: Task;
  onResolved: (taskId: number) => Promise<void>;
  onRemove: (taskId: number) => Promise<void>;
  onUpdate?: () => Promise<void>;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingTime, setIsEditingTime] = useState(false);

  const formatDateTime = (dtStr: string) => {
    const localTime = new Date(dtStr);
    return localTime.getHours().toString() + ':' + localTime.getMinutes().toString();
  };

  const getBadgeStyle = (scheduledAt: string) => {
    const now = new Date();
    const scheduled = new Date(scheduledAt);
    return now > scheduled ? 'bg-red-400' : '';
  };

  const handleDoubleClick = (e: React.MouseEvent<HTMLInputElement>) => {
    setIsEditing(true);
    e.currentTarget.focus();
  };

  const handleBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    setIsEditing(false);
    const newDescription = e.currentTarget.value.trim();
    if (newDescription !== task.description && newDescription !== '') {
      await updateTask(task.id, newDescription, null);
      if (onUpdate) {
        await onUpdate();
      }
    } else {
      e.currentTarget.value = task.description;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    } else if (e.key === 'Escape') {
      e.currentTarget.value = task.description;
      setIsEditing(false);
      e.currentTarget.blur();
    }
  };

  const handleTimeDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsEditingTime(true);
    e.currentTarget.focus();
  };

  const handleTimeBlur = async (newTime: string) => {
    setIsEditingTime(false);
    if (newTime && newTime.includes(':')) {
      const [hours, minutes] = newTime.split(':').map(Number);
      const newScheduledAt = new Date(task.scheduledAt);
      newScheduledAt.setHours(hours, minutes, 0, 0);

      if (newScheduledAt.toISOString() !== task.scheduledAt) {
        await updateTask(task.id, null, newScheduledAt);
        if (onUpdate) {
          await onUpdate();
        }
      }
    }
  };

  const handleTimeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    } else if (e.key === 'Escape') {
      setIsEditingTime(false);
    }
  };

  const badgeStyle = useMemo(() => getBadgeStyle(task.scheduledAt), [task.scheduledAt]);

  return (
    <Card className="gap-2 px-1 py-[2px] my-1">
      <CardContent className="flex flex-row items-center justify-between px-2">
        {isEditingTime ? (
          <TimeInput
            initialTime={task.scheduledAt}
            onBlur={handleTimeBlur}
            onKeyDown={handleTimeKeyDown}
            className="w-[70px] h-6 p-1"
            autoFocus
          />
        ) : (
          <Badge
            className={`w-[50px] ${badgeStyle}`}
            variant="outline"
            asChild={true}
            onDoubleClick={handleTimeDoubleClick}
          >
            <p className="text-black text-sm cursor-default">{formatDateTime(task.scheduledAt)}</p>
          </Badge>
        )}
        <div className="flex justify-start w-[400px] px-4">
          <Input
            type="text"
            defaultValue={task.description}
            onDoubleClick={(e) => handleDoubleClick(e)}
            onMouseDown={(e) => !isEditing && e.preventDefault()}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            readOnly={!isEditing}
            className="cursor-default read-only:cursor-default border-0 p-2"
          />
        </div>
        <Button variant="ghost" onClick={() => onResolved(task.id)}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            className="size-4"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </Button>
        <Button variant="ghost" onClick={() => onRemove(task.id)}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            className="size-4"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
            />
          </svg>
        </Button>
      </CardContent>
    </Card>
  );
}

export default TaskCard;
