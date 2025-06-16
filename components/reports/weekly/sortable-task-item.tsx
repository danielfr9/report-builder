import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { WeeklyTask } from "@/lib/interfaces/report-data.interface";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  CalendarIcon,
  CheckIcon,
  GripVerticalIcon,
  Trash2Icon,
} from "lucide-react";
import { useState } from "react";
import { PencilIcon } from "lucide-react";

// Sortable Task Item Component (moved outside main component)
interface SortableTaskItemProps {
  task: WeeklyTask;
  updateTask: (id: string, field: keyof WeeklyTask, value: any) => void;
  removeTask: (id: string) => void;
}

const SortableTaskItem = ({
  task,
  updateTask,
  removeTask,
}: SortableTaskItemProps) => {
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
            <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
              <div className="col-span-3">
                <Label>Tarea</Label>
                <Input
                  placeholder="Descripción de la tarea"
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
              <div>
                <Label>Estado</Label>
                <Select
                  value={task.status}
                  onValueChange={(value) =>
                    updateTask(task.id, "status", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Completado">Completado</SelectItem>
                    <SelectItem value="En Proceso">En Proceso</SelectItem>
                    <SelectItem value="Pendiente">Pendiente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Fecha de Finalización</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "h-10 w-full justify-start pr-10 text-left font-normal",
                        !task.finishDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                      {task.finishDate
                        ? format(task.finishDate, "dd/MM/yyyy")
                        : "Seleccionar"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={task.finishDate || undefined}
                      locale={es}
                      onSelect={(date) => {
                        updateTask(task.id, "finishDate", date || null);
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div>
              <Label>Comentarios / PR</Label>
              <Textarea
                placeholder="Comentarios adicionales o enlaces a PR"
                value={task.comments}
                onChange={(e) =>
                  updateTask(task.id, "comments", e.target.value)
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
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
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
            <div>
              <Label className="text-xs text-muted-foreground">Estado</Label>
              <p className="text-sm">{task.status}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">
                Fecha de Finalización
              </Label>
              <p className="text-sm">
                {task.finishDate
                  ? format(task.finishDate, "dd/MM/yyyy")
                  : "No especificada"}
              </p>
            </div>
          </div>
          {task.comments && (
            <div>
              <Label className="text-xs text-muted-foreground">
                Comentarios / PR
              </Label>
              <p className="text-sm text-muted-foreground">{task.comments}</p>
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

export default SortableTaskItem;
