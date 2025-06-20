import { WeeklyPendingTask } from "@/lib/interfaces/report-data.interface";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TASK_STATUS } from "@/lib/constants/task-status";

// Add Pending Task Form Component
interface AddPendingTaskFormProps {
  onAdd: (task: Omit<WeeklyPendingTask, "id">) => void;
}

const AddPendingTaskForm = ({ onAdd }: AddPendingTaskFormProps) => {
  const [formData, setFormData] = useState<{
    name: string;
    storyPoints: number;
    currentStatus: string;
    nextStep: string;
  }>({
    name: "",
    storyPoints: 1,
    currentStatus: TASK_STATUS.IN_PROGRESS,
    nextStep: "",
  });

  const handleSubmit = () => {
    if (formData.name.trim()) {
      onAdd({
        name: formData.name,
        storyPoints: formData.storyPoints,
        actionPlan: `${formData.currentStatus}|${formData.nextStep}`,
      });
      setFormData({
        name: "",
        storyPoints: 1,
        currentStatus: TASK_STATUS.IN_PROGRESS,
        nextStep: "",
      });
    }
  };

  return (
    <div className="border-2 border-dashed border-primary/50 rounded-lg p-4 space-y-3 bg-primary/5">
      <div className="flex items-center">
        <h3 className="font-medium">Agregar Nueva Tarea en Progreso</h3>
      </div>
      <div className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="md:col-span-3">
            <Label>Tarea</Label>
            <Input
              placeholder="Descripción de la tarea en progreso"
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
            <Label>Estado Actual</Label>
            <Input
              placeholder="En desarrollo, bloqueado, etc."
              value={formData.currentStatus}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  currentStatus: e.target.value,
                }))
              }
            />
          </div>
        </div>
        <div>
          <Label>Próximo Paso</Label>
          <Textarea
            placeholder="¿Cuál es el siguiente paso para completar esta tarea?"
            value={formData.nextStep}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, nextStep: e.target.value }))
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

export default AddPendingTaskForm;
