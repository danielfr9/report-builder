import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Block } from "@/lib/interfaces/block.interface";
import { useState } from "react";

// Add Block Form Component
interface AddBlockFormProps {
  onAdd: (block: Omit<Block, "id">) => void;
}

const AddBlockForm = ({ onAdd }: AddBlockFormProps) => {
  const [formData, setFormData] = useState<Omit<Block, "id">>({
    name: "",
  });

  const handleSubmit = () => {
    if (formData.name.trim()) {
      onAdd({
        name: formData.name,
      });
      setFormData({
        name: "",
      });
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
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSubmit} disabled={!formData.name.trim()}>
            Agregar Bloqueo
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddBlockForm;
