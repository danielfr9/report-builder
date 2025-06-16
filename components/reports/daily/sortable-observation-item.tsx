import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DailyObservation } from "@/lib/interfaces/report-data.interface";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  CheckIcon,
  GripVerticalIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react";
import { useState } from "react";

// Sortable Observation Item Component
interface SortableObservationItemProps {
  observation: DailyObservation;
  index: number;
  updateObservation: (index: number, value: DailyObservation) => void;
  removeObservation: (index: number) => void;
}

const SortableObservationItem = ({
  observation,
  index,
  updateObservation,
  removeObservation,
}: SortableObservationItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `observation-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  if (isEditing) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`flex items-start bg-background border border-primary rounded-lg p-3 ${
          isDragging ? "z-50 shadow-lg" : ""
        }`}
      >
        <div className="flex items-center gap-2 mr-2">
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
        <Textarea
          placeholder="Observación o sugerencia adicional"
          value={observation.name}
          onChange={(e) =>
            updateObservation(index, { ...observation, name: e.target.value })
          }
          className="flex-1"
        />
        <div className="flex flex-col gap-2 ml-2">
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
            <CheckIcon className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeObservation(index)}
          >
            <Trash2Icon className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-start bg-background border rounded-lg p-3 hover:bg-muted/50 ${
        isDragging ? "z-50 shadow-lg" : ""
      }`}
    >
      <div className="flex items-center gap-2 mr-2">
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
      <div className="flex-1">
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
          {observation.name || "Sin descripción"}
        </p>
      </div>
      <div className="flex flex-col gap-2 ml-2">
        <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
          <PencilIcon className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => removeObservation(index)}
        >
          <Trash2Icon className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default SortableObservationItem;
