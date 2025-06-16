import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DailyPendingTask } from "@/lib/interfaces/report-data.interface";
import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  CheckIcon,
  GripVerticalIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react";

// Sortable Pending Task Item Component (moved outside main component)
interface SortablePendingTaskItemProps {
  task: DailyPendingTask;
  updateTask: (id: string, field: keyof DailyPendingTask, value: any) => void;
  removeTask: (id: string) => void;
}

const SortablePendingTaskItem = ({
  task,
  updateTask,
  removeTask,
}: SortablePendingTaskItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  if (isEditing) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`border rounded-lg p-4 space-y-3 bg-background border-primary ${
          isDragging ? "z-50 shadow-lg" : ""
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className="cursor-grab active:cursor-grabbing touch-none h-8 w-8 p-0"
              {...attributes}
              {...listeners}
            >
              <GripVerticalIcon className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex-1 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="col-span-3">
                <Label>Tarea</Label>
                <Input
                  placeholder="Descripción de la tarea pendiente"
                  value={task.name}
                  onChange={(e) => updateTask(task.id, "name", e.target.value)}
                />
              </div>
              <div>
                <Label>Story Points</Label>
                <Input
                  type="number"
                  min="1"
                  value={task.storyPoints}
                  onChange={(e) =>
                    updateTask(
                      task.id,
                      "storyPoints",
                      Number.parseInt(e.target.value) || 1
                    )
                  }
                />
              </div>
            </div>
            <div>
              <Label>Plan de Acción</Label>
              <Textarea
                placeholder="¿Qué harás para completar esta tarea?"
                value={task.actionPlan}
                onChange={(e) =>
                  updateTask(task.id, "actionPlan", e.target.value)
                }
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(false)}
            >
              <CheckIcon className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeTask(task.id)}
            >
              <Trash2Icon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border rounded-lg p-4 space-y-3 bg-background hover:bg-muted/50 ${
        isDragging ? "z-50 shadow-lg" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className="cursor-grab active:cursor-grabbing touch-none h-8 w-8 p-0"
            {...attributes}
            {...listeners}
          >
            <GripVerticalIcon className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex-1 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="col-span-3">
              <Label className="text-xs text-muted-foreground">Tarea</Label>
              <p className="text-sm font-medium">
                {task.name || "Sin descripción"}
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">
                Story Points
              </Label>
              <p className="text-sm font-semibold">{task.storyPoints} pts</p>
            </div>
          </div>
          {task.actionPlan && (
            <div>
              <Label className="text-xs text-muted-foreground">
                Plan de Acción
              </Label>
              <p className="text-sm text-muted-foreground">{task.actionPlan}</p>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
            <PencilIcon className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => removeTask(task.id)}>
            <Trash2Icon className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SortablePendingTaskItem;
