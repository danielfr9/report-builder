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
import { TASK_STATUS } from "@/lib/constants/task-status";
import { DailyTask } from "@/lib/interfaces/report-data.interface";
import { useState } from "react";

// Add Task Form Component
interface AddTaskFormProps {
  onAdd: (task: Omit<DailyTask, "id">) => void;
}

const AddTaskForm = ({ onAdd }: AddTaskFormProps) => {
  const [formData, setFormData] = useState<Omit<DailyTask, "id">>({
    name: "",
    storyPoints: 1,
    status: TASK_STATUS.COMPLETED,
    comments: "",
  });

  const handleSubmit = () => {
    if (formData.name.trim()) {
      onAdd(formData);
      setFormData({
        name: "",
        storyPoints: 1,
        status: TASK_STATUS.COMPLETED,
        comments: "",
      });
    }
  };

  return (
    <div className="border-2 border-dashed border-primary/50 rounded-lg p-4 space-y-3 bg-primary/5">
      <div className="flex items-center">
        <h3 className="font-medium">Agregar Nueva Tarea</h3>
      </div>
      <div className="space-y-3">
        <div className="flex flex-col gap-3">
          <div className="">
            <Label>Tarea</Label>
            <Textarea
              placeholder="Descripción de la tarea"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
