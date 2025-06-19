import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DailyTask } from "@/lib/interfaces/report-data.interface";
import { useState, useRef } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  CheckIcon,
  GripVerticalIcon,
  PencilIcon,
  Trash2Icon,
  ImageIcon,
  XIcon,
} from "lucide-react";
import { TASK_STATUS } from "@/lib/constants/task-status";

// Sortable Task Item Component (moved outside main component)
interface SortableTaskItemProps {
  task: DailyTask;
  updateTask: (id: string, field: keyof DailyTask, value: any) => void;
  removeTask: (id: string) => void;
}

const SortableTaskItem = ({
  task,
  updateTask,
  removeTask,
}: SortableTaskItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Por favor selecciona un archivo de imagen válido");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("La imagen debe ser menor a 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        updateTask(task.id, "image", base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    updateTask(task.id, "image", undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
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
                    {Object.values(TASK_STATUS).map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
            <div>
              <Label>Imagen adjunta (opcional)</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2"
                  >
                    <ImageIcon className="w-4 h-4" />
                    {task.image ? "Cambiar imagen" : "Seleccionar imagen"}
                  </Button>
                  {task.image && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={removeImage}
                      className="text-red-500 hover:text-red-700"
                    >
                      <XIcon className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  aria-label="Seleccionar imagen para la tarea"
                />
                {task.image && (
                  <div className="mt-2">
                    <img
                      src={task.image}
                      alt="Imagen de la tarea"
                      className="max-w-full max-h-32 object-contain rounded border"
                    />
                  </div>
                )}
              </div>
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
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
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
          </div>
          {task.comments && (
            <div>
              <Label className="text-xs text-muted-foreground">
                Comentarios / PR
              </Label>
              <p className="text-sm text-muted-foreground">{task.comments}</p>
            </div>
          )}
          {task.image && (
            <div>
              <Label className="text-xs text-muted-foreground">
                Imagen adjunta
              </Label>
              <div className="mt-1">
                <img
                  src={task.image}
                  alt="Imagen de la tarea"
                  className="max-w-full max-h-40 object-contain rounded border"
                />
              </div>
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
