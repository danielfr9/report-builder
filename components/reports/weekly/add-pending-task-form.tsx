import { WeeklyPendingTask } from "@/lib/interfaces/report-data.interface";
import { Button } from "@/components/ui/button";
import { useState, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageIcon, XIcon } from "lucide-react";

// Add Pending Task Form Component
interface AddPendingTaskFormProps {
  onAdd: (task: Omit<WeeklyPendingTask, "id">) => void;
}

const AddPendingTaskForm = ({ onAdd }: AddPendingTaskFormProps) => {
  const [formData, setFormData] = useState<Omit<WeeklyPendingTask, "id">>({
    name: "",
    storyPoints: 1,
    actionPlan: "",
    image: undefined,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        setFormData((prev) => ({ ...prev, image: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, image: undefined }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = () => {
    if (formData.name.trim()) {
      onAdd(formData);
      setFormData({
        name: "",
        storyPoints: 1,
        actionPlan: "",
        image: undefined,
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="border-2 border-dashed border-primary/50 rounded-lg p-4 space-y-3 bg-primary/5">
      <div className="flex items-center">
        <h3 className="font-medium">Agregar Tarea en Progreso</h3>
      </div>
      <div className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2">
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
          <Label>Estado Actual | Próximo Paso</Label>
          <Textarea
            placeholder="Estado actual | ¿Qué harás la próxima semana para avanzar?"
            value={formData.actionPlan}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                actionPlan: e.target.value,
              }))
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
                Seleccionar imagen
              </Button>
              {formData.image && (
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
              aria-label="Seleccionar imagen para la tarea en progreso"
            />
            {formData.image && (
              <div className="mt-2">
                <img
                  src={formData.image}
                  alt="Vista previa"
                  className="max-w-full max-h-32 object-contain rounded border"
                />
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSubmit} disabled={!formData.name.trim()}>
            Agregar Tarea en Progreso
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddPendingTaskForm;
