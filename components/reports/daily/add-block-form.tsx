import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

// Add Block Form Component
interface AddBlockFormProps {
  onAdd: (block: string) => void;
}

const AddBlockForm = ({ onAdd }: AddBlockFormProps) => {
  const [formData, setFormData] = useState("");

  const handleSubmit = () => {
    if (formData.trim()) {
      onAdd(formData);
      setFormData("");
    }
  };

  return (
    <div className="border-2 border-dashed border-primary/50 rounded-lg p-4 space-y-3 bg-primary/5">
      <div className="flex items-center">
        <h3 className="font-medium">Agregar Nuevo Bloqueo/Dificultad</h3>
      </div>
      <div className="space-y-3">
        <div>
          <Label>Descripción</Label>
          <Textarea
            placeholder="Describe un bloqueo o dificultad encontrada"
            value={formData}
            onChange={(e) => setFormData(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSubmit} disabled={!formData.trim()}>
            Agregar Bloqueo
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddBlockForm;
