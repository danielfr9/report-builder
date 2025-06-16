import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { WeeklyObservation } from "@/lib/interfaces/report-data.interface";
import { useState } from "react";

// Add Observation Form Component
interface AddObservationFormProps {
  onAdd: (observation: WeeklyObservation) => void;
}

const AddObservationForm = ({ onAdd }: AddObservationFormProps) => {
  const [formData, setFormData] = useState<WeeklyObservation>({
    id: "",
    name: "",
  });

  const handleSubmit = () => {
    if (formData.name.trim()) {
      onAdd(formData);
      setFormData({
        id: "",
        name: "",
      });
    }
  };

  return (
    <div className="border-2 border-dashed border-primary/50 rounded-lg p-4 space-y-3 bg-primary/5">
      <div className="flex items-center">
        <h3 className="font-medium">Agregar Nuevo Logro/Mejora</h3>
      </div>
      <div className="space-y-3">
        <div>
          <Label>Descripción</Label>
          <Textarea
            placeholder="Describe un logro, mejora o sugerencia"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSubmit} disabled={!formData.name.trim()}>
            Agregar Logro/Mejora
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddObservationForm;
