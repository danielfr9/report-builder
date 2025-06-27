import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { TASK_STATUS } from "@/lib/constants/task-status";
import { Task } from "@/lib/interfaces/task.inteface";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";

// Add Task Form Component
interface AddTaskFormProps {
  onAdd: (task: Omit<Task, "id">) => void;
}

const AddTaskForm = ({ onAdd }: AddTaskFormProps) => {
  const [formData, setFormData] = useState<Omit<Task, "id">>({
    name: "",
    storyPoints: 1,
    status: TASK_STATUS.COMPLETED,
    comments: "",
    actionPlan: "",
    finishDate: null,
  });

  const handleSubmit = () => {
    if (formData.name.trim()) {
      onAdd(formData);
      setFormData({
        name: "",
        storyPoints: 1,
        status: TASK_STATUS.COMPLETED,
        comments: "",
        actionPlan: "",
        finishDate: null,
      });
    }
  };

  return (
    <div className="border-2 border-dashed border-primary/50 rounded-lg p-4 space-y-3 bg-primary/5">
      <div className="flex items-center">
        <h3 className="font-medium">Agregar Nueva Tarea</h3>
      </div>
      <div className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="md:col-span-3">
            <Label>Tarea</Label>
            <Input
              placeholder="Descripción de la tarea"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          </div>
          <div>
            <Label>Story Points</Label>
            <Input
              type="number"
              min="1"
              value={formData.storyPoints}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  storyPoints: Number.parseInt(e.target.value) || 1,
                }))
              }
            />
          </div>
          <div>
            <Label>Estado</Label>
            <Select
              value={formData.status}
              onValueChange={(
                value: (typeof TASK_STATUS)[keyof typeof TASK_STATUS]
              ) => setFormData((prev) => ({ ...prev, status: value }))}
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
            value={formData.comments}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, comments: e.target.value }))
            }
          />
        </div>
        <div>
          <Label>Plan de acción</Label>
          <Textarea
            placeholder="Plan de acción"
            value={formData.actionPlan}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, actionPlan: e.target.value }))
            }
          />
        </div>
        <div>
          <Label htmlFor="date">Fecha Finalizacion</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "h-10 w-full justify-start pr-10 text-left font-normal",
                  !formData.finishDate && "text-muted-foreground"
                )}
                id="calendar-input"
              >
                <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                {formData.finishDate
                  ? format(formData.finishDate, "dd/MM/yyyy")
                  : "Selecciona una fecha"}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-[--radix-popover-trigger-width] p-0"
              align="start"
            >
              <Calendar
                className="!w-[var(--radix-popover-trigger-width)]"
                mode="single"
                selected={
                  formData.finishDate
                    ? new Date(formData.finishDate)
                    : undefined
                }
                locale={es}
                onSelect={(selectedDate) => {
                  setFormData((prev) => ({
                    ...prev,
                    finishDate: selectedDate || null,
                  }));
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSubmit} disabled={!formData.name.trim()}>
            Agregar Tarea
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddTaskForm;
