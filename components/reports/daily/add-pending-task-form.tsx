import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DailyPendingTask } from "@/lib/interfaces/report-data.interface";
import { useState } from "react";
import { Button } from "@/components/ui/button";

// Add Pending Task Form Component
interface AddPendingTaskFormProps {
  onAdd: (task: Omit<DailyPendingTask, "id">) => void;
}

const AddPendingTaskForm = ({ onAdd }: AddPendingTaskFormProps) => {
  const [formData, setFormData] = useState<{
    name: string;
    storyPoints: number;
    actionPlan: string;
  }>({
    name: "",
    storyPoints: 1,
    actionPlan: "",
  });

  const handleSubmit = () => {
    if (formData.name.trim()) {
      onAdd({
        name: formData.name,
        storyPoints: formData.storyPoints,
        actionPlan: formData.actionPlan,
      });
      setFormData({
        name: "",
        storyPoints: 1,
        actionPlan: "",
      });
    }
  };

  return (
    <div className="border-2 border-dashed border-primary/50 rounded-lg p-4 space-y-3 bg-primary/5">
      <div className="flex items-center">
        <h3 className="font-medium">Agregar Nueva Tarea Pendiente</h3>
      </div>
      <div className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-3">
            <Label>Tarea</Label>
            <Input
              placeholder="Descripción de la tarea pendiente"
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
