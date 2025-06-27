import { WeeklyPendingTask } from "@/lib/interfaces/report-data.interface";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TASK_STATUS } from "@/lib/constants/task-status";
import { Task } from "@/lib/interfaces/task.inteface";

// Add Pending Task Form Component
interface AddPendingTaskFormProps {
  onAdd: (task: Omit<Task, "id">) => void;
}

const AddPendingTaskForm = ({ onAdd }: AddPendingTaskFormProps) => {
  const [formData, setFormData] = useState<Omit<Task, "id">>({
    name: "",
    storyPoints: 1,
    status: TASK_STATUS.IN_PROGRESS,
    actionPlan: "",
    comments: "",
    finishDate: null,
  });

  const handleSubmit = () => {
    if (formData.name.trim()) {
      onAdd({
        name: formData.name,
        storyPoints: formData.storyPoints,
        status: TASK_STATUS.IN_PROGRESS,
        actionPlan: formData.actionPlan,
        comments: formData.comments,
        finishDate: formData.finishDate,
      });
      setFormData({
        name: "",
        storyPoints: 1,
        status: TASK_STATUS.IN_PROGRESS,
        actionPlan: "",
        comments: "",
        finishDate: null,
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
        </div>
        <div>
          <Label>Plan de Acción</Label>
          <Textarea
            placeholder="¿Qué harás para completar esta tarea?"
            value={formData.actionPlan}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, actionPlan: e.target.value }))
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
