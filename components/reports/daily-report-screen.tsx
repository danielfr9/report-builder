"use client";

import { useState, useTransition, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PlusIcon,
  Trash2Icon,
  EyeIcon,
  Loader2Icon,
  DownloadIcon,
  CalendarIcon,
  CheckIcon,
  PencilIcon,
} from "lucide-react";
import { DailyReportPreview } from "@/components/reports/daily-report-preview";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { es } from "date-fns/locale";
import { format, parse } from "date-fns";
import { generatePDFAction } from "@/lib/actions/generate-pdf";
import { DateRange } from "react-day-picker";
import {
  PendingTask,
  DailyReportData,
  Task,
  DailyReportLocalStorageData,
} from "@/lib/interfaces/report-data.interface";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVerticalIcon } from "lucide-react";
import {
  SHARED_HEADER_KEY,
  DAILY_REPORT_STORAGE_KEY,
} from "@/lib/constants/localstorage-keys";

// Add Task Form Component
interface AddTaskFormProps {
  onAdd: (task: Omit<Task, "id">) => void;
}

const AddTaskForm = ({ onAdd }: AddTaskFormProps) => {
  const [formData, setFormData] = useState<Omit<Task, "id">>({
    name: "",
    storyPoints: 1,
    status: "Completado" as const,
    comments: "",
  });

  const handleSubmit = () => {
    if (formData.name.trim()) {
      onAdd(formData);
      setFormData({
        name: "",
        storyPoints: 1,
        status: "Completado" as const,
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="col-span-3">
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
                value: "Completado" | "En Proceso" | "Pendiente"
              ) => setFormData((prev) => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Completado">Completado</SelectItem>
                <SelectItem value="En Proceso">En Proceso</SelectItem>
                <SelectItem value="Pendiente">Pendiente</SelectItem>
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
        <div className="flex gap-2">
          <Button onClick={handleSubmit} disabled={!formData.name.trim()}>
            Agregar Tarea
          </Button>
        </div>
      </div>
    </div>
  );
};

// Add Pending Task Form Component
interface AddPendingTaskFormProps {
  onAdd: (task: Omit<PendingTask, "id">) => void;
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
          <div className="col-span-3">
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

// Add Observation Form Component
interface AddObservationFormProps {
  onAdd: (observation: string) => void;
}

const AddObservationForm = ({ onAdd }: AddObservationFormProps) => {
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
        <h3 className="font-medium">Agregar Nueva Observación/Sugerencia</h3>
      </div>
      <div className="space-y-3">
        <div>
          <Label>Descripción</Label>
          <Textarea
            placeholder="Observación o sugerencia adicional"
            value={formData}
            onChange={(e) => setFormData(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSubmit} disabled={!formData.trim()}>
            Agregar Observación
          </Button>
        </div>
      </div>
    </div>
  );
};

// Sortable Task Item Component (moved outside main component)
interface SortableTaskItemProps {
  task: Task;
  updateTask: (id: string, field: keyof Task, value: any) => void;
  removeTask: (id: string) => void;
}

const SortableTaskItem = ({
  task,
  updateTask,
  removeTask,
}: SortableTaskItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

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
        className={`border rounded-lg p-4 space-y-3 bg-background border-primary ${
          isDragging ? "z-50 shadow-lg" : ""
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="flex items-center">
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
          <div className="flex-1 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <div className="col-span-3">
                <Label>Tarea</Label>
                <Input
                  placeholder="Descripción de la tarea"
                  value={task.name}
                  onChange={(e) => updateTask(task.id, "name", e.target.value)}
                />
              </div>
              <div>
                <Label>Story Points</Label>
                <Input
                  type="number"
                  min="1"
                  value={task.storyPoints}
                  onChange={(e) =>
                    updateTask(
                      task.id,
                      "storyPoints",
                      Number.parseInt(e.target.value) || 1
                    )
                  }
                />
              </div>
              <div>
                <Label>Estado</Label>
                <Select
                  value={task.status}
                  onValueChange={(value) =>
                    updateTask(task.id, "status", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Completado">Completado</SelectItem>
                    <SelectItem value="En Proceso">En Proceso</SelectItem>
                    <SelectItem value="Pendiente">Pendiente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Comentarios / PR</Label>
              <Textarea
                placeholder="Comentarios adicionales o enlaces a PR"
                value={task.comments}
                onChange={(e) =>
                  updateTask(task.id, "comments", e.target.value)
                }
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(false)}
            >
              <CheckIcon className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeTask(task.id)}
            >
              <Trash2Icon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border rounded-lg p-4 space-y-3 bg-background hover:bg-muted/50 ${
        isDragging ? "z-50 shadow-lg" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex items-center">
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
        <div className="flex-1 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <div className="col-span-3">
              <Label className="text-xs text-muted-foreground">Tarea</Label>
              <p className="text-sm font-medium">
                {task.name || "Sin descripción"}
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">
                Story Points
              </Label>
              <p className="text-sm font-semibold">{task.storyPoints} pts</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Estado</Label>
              <p className="text-sm">{task.status}</p>
            </div>
          </div>
          {task.comments && (
            <div>
              <Label className="text-xs text-muted-foreground">
                Comentarios / PR
              </Label>
              <p className="text-sm text-muted-foreground">{task.comments}</p>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
            <PencilIcon className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => removeTask(task.id)}>
            <Trash2Icon className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

// Sortable Pending Task Item Component (moved outside main component)
interface SortablePendingTaskItemProps {
  task: PendingTask;
  updateTask: (id: string, field: keyof PendingTask, value: any) => void;
  removeTask: (id: string) => void;
}

const SortablePendingTaskItem = ({
  task,
  updateTask,
  removeTask,
}: SortablePendingTaskItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

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
        className={`border rounded-lg p-4 space-y-3 bg-background border-primary ${
          isDragging ? "z-50 shadow-lg" : ""
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="flex items-center">
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
          <div className="flex-1 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="col-span-3">
                <Label>Tarea</Label>
                <Input
                  placeholder="Descripción de la tarea pendiente"
                  value={task.name}
                  onChange={(e) => updateTask(task.id, "name", e.target.value)}
                />
              </div>
              <div>
                <Label>Story Points</Label>
                <Input
                  type="number"
                  min="1"
                  value={task.storyPoints}
                  onChange={(e) =>
                    updateTask(
                      task.id,
                      "storyPoints",
                      Number.parseInt(e.target.value) || 1
                    )
                  }
                />
              </div>
            </div>
            <div>
              <Label>Plan de Acción</Label>
              <Textarea
                placeholder="¿Qué harás para completar esta tarea?"
                value={task.actionPlan}
                onChange={(e) =>
                  updateTask(task.id, "actionPlan", e.target.value)
                }
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(false)}
            >
              <CheckIcon className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeTask(task.id)}
            >
              <Trash2Icon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border rounded-lg p-4 space-y-3 bg-background hover:bg-muted/50 ${
        isDragging ? "z-50 shadow-lg" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex items-center">
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
        <div className="flex-1 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="col-span-3">
              <Label className="text-xs text-muted-foreground">Tarea</Label>
              <p className="text-sm font-medium">
                {task.name || "Sin descripción"}
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">
                Story Points
              </Label>
              <p className="text-sm font-semibold">{task.storyPoints} pts</p>
            </div>
          </div>
          {task.actionPlan && (
            <div>
              <Label className="text-xs text-muted-foreground">
                Plan de Acción
              </Label>
              <p className="text-sm text-muted-foreground">{task.actionPlan}</p>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
            <PencilIcon className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => removeTask(task.id)}>
            <Trash2Icon className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

// Sortable Block Item Component
interface SortableBlockItemProps {
  block: string;
  index: number;
  updateBlock: (index: number, value: string) => void;
  removeBlock: (index: number) => void;
}

const SortableBlockItem = ({
  block,
  index,
  updateBlock,
  removeBlock,
}: SortableBlockItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `block-${index}` });

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
          placeholder="Describe un bloqueo o dificultad encontrada"
          value={block}
          onChange={(e) => updateBlock(index, e.target.value)}
          className="flex-1"
        />
        <div className="flex flex-col gap-2 ml-2">
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
            <CheckIcon className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => removeBlock(index)}>
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
          {block || "Sin descripción"}
        </p>
      </div>
      <div className="flex flex-col gap-2 ml-2">
        <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
          <PencilIcon className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => removeBlock(index)}>
          <Trash2Icon className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

// Sortable Observation Item Component
interface SortableObservationItemProps {
  observation: string;
  index: number;
  updateObservation: (index: number, value: string) => void;
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
          value={observation}
          onChange={(e) => updateObservation(index, e.target.value)}
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
          {observation || "Sin descripción"}
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

export default function DailyReportScreen() {
  const [reportData, setReportData] = useState<DailyReportData>({
    date: new Date(),
    name: "",
    project: "",
    sprint: {
      from: null,
      to: null,
    },
    completedTasks: [],
    pendingTasks: [],
    blocks: [],
    observations: [],
    hoursWorked: 8,
    additionalNotes: "",
  });

  const [activeTab, setActiveTab] = useState("builder");

  const [isGenerating, startGenerating] = useTransition();

  // DnD Kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end for completed tasks
  const handleCompletedTasksDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setReportData((prev) => {
        const oldIndex = prev.completedTasks.findIndex(
          (task) => task.id === active.id
        );
        const newIndex = prev.completedTasks.findIndex(
          (task) => task.id === over?.id
        );

        return {
          ...prev,
          completedTasks: arrayMove(prev.completedTasks, oldIndex, newIndex),
        };
      });
    }
  };

  // Handle drag end for pending tasks
  const handlePendingTasksDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setReportData((prev) => {
        const oldIndex = prev.pendingTasks.findIndex(
          (task) => task.id === active.id
        );
        const newIndex = prev.pendingTasks.findIndex(
          (task) => task.id === over?.id
        );

        return {
          ...prev,
          pendingTasks: arrayMove(prev.pendingTasks, oldIndex, newIndex),
        };
      });
    }
  };

  // Handle drag end for blocks
  const handleBlocksDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setReportData((prev) => {
        const activeIndex = parseInt(
          active.id.toString().replace("block-", "")
        );
        const overIndex = parseInt(
          over?.id.toString().replace("block-", "") || "0"
        );

        return {
          ...prev,
          blocks: arrayMove(prev.blocks, activeIndex, overIndex),
        };
      });
    }
  };

  // Handle drag end for observations
  const handleObservationsDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setReportData((prev) => {
        const activeIndex = parseInt(
          active.id.toString().replace("observation-", "")
        );
        const overIndex = parseInt(
          over?.id.toString().replace("observation-", "") || "0"
        );

        return {
          ...prev,
          observations: arrayMove(prev.observations, activeIndex, overIndex),
        };
      });
    }
  };

  // Save shared header data to localStorage
  const saveSharedHeader = (data: DailyReportData) => {
    const sharedHeader = {
      name: data.name,
      project: data.project,
      sprint: {
        from: data.sprint.from ? format(data.sprint.from, "dd/MM/yyyy") : null,
        to: data.sprint.to ? format(data.sprint.to, "dd/MM/yyyy") : null,
      },
    };

    try {
      localStorage.setItem(SHARED_HEADER_KEY, JSON.stringify(sharedHeader));
    } catch (error) {
      console.error("Error saving shared header to localStorage:", error);
    }
  };

  // Save daily-specific data to localStorage
  const saveData = (data: DailyReportData) => {
    const dataToSave: DailyReportLocalStorageData = {
      name: data.name,
      project: data.project,
      sprint: {
        from: data.sprint.from ? format(data.sprint.from, "dd/MM/yyyy") : null,
        to: data.sprint.to ? format(data.sprint.to, "dd/MM/yyyy") : null,
      },
      completedTasks: data.completedTasks,
      pendingTasks: data.pendingTasks,
      blocks: data.blocks,
      observations: data.observations,
      hoursWorked: data.hoursWorked,
      additionalNotes: data.additionalNotes,
    };

    try {
      localStorage.setItem(
        DAILY_REPORT_STORAGE_KEY,
        JSON.stringify(dataToSave)
      );
      // Also save shared header
      saveSharedHeader(data);
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  };

  // Load shared header data from localStorage
  const loadSharedHeader = () => {
    try {
      const savedHeader = localStorage.getItem(SHARED_HEADER_KEY);
      if (savedHeader) {
        const headerData = JSON.parse(savedHeader);
        return {
          name: headerData.name || "",
          project: headerData.project || "",
          sprint: {
            from: headerData.sprint?.from
              ? parse(headerData.sprint?.from, "dd/MM/yyyy", new Date())
              : null,
            to: headerData.sprint?.to
              ? parse(headerData.sprint?.to, "dd/MM/yyyy", new Date())
              : null,
          },
        };
      }
    } catch (error) {
      console.error("Error loading shared header from localStorage:", error);
    }
    return {
      name: "",
      project: "",
      sprint: { from: null, to: null },
    };
  };

  // Load data from localStorage
  const loadData = () => {
    try {
      const sharedHeader = loadSharedHeader();
      const saved = localStorage.getItem(DAILY_REPORT_STORAGE_KEY);

      if (saved) {
        const savedData: DailyReportLocalStorageData = JSON.parse(saved);

        setReportData((prev) => ({
          ...prev,
          date: new Date(),
          name: sharedHeader.name,
          project: sharedHeader.project,
          sprint: sharedHeader.sprint,
          completedTasks: savedData.completedTasks || [],
          pendingTasks: savedData.pendingTasks || [],
          blocks: savedData.blocks || [],
          observations: savedData.observations || [],
          hoursWorked: savedData.hoursWorked || 8,
          additionalNotes: savedData.additionalNotes || "",
        }));
      } else {
        // If no saved data, at least load the shared header
        setReportData((prev) => ({
          ...prev,
          date: new Date(),
          name: sharedHeader.name,
          project: sharedHeader.project,
          sprint: sharedHeader.sprint,
        }));
      }
    } catch (error) {
      console.error("Error loading from localStorage:", error);
    }
  };

  // Load data when component mounts
  useEffect(() => {
    loadData();
  }, []);

  // Debounced save function to prevent excessive localStorage writes
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      saveData(reportData);
    }, 500); // Wait 500ms after the last change before saving

    return () => {
      clearTimeout(debounceTimer);
    };
  }, [
    reportData.date,
    reportData.name,
    reportData.project,
    reportData.sprint,
    reportData.completedTasks,
    reportData.pendingTasks,
    reportData.blocks,
    reportData.observations,
    reportData.hoursWorked,
    reportData.additionalNotes,
  ]);

  // Clear saved data
  const clearSavedInfo = () => {
    try {
      localStorage.removeItem(DAILY_REPORT_STORAGE_KEY);
      setReportData((prev) => ({
        ...prev,
        date: null,
        name: "",
        project: "",
        sprint: {
          from: null,
          to: null,
        },
        completedTasks: [],
        pendingTasks: [],
        blocks: [],
        observations: [],
        hoursWorked: 8,
        additionalNotes: "",
      }));
      toast.success("Datos borrados del navegador");
    } catch (error) {
      console.error("Error clearing localStorage:", error);
      toast.error("Error al borrar los datos");
    }
  };

  const addCompletedTask = () => {
    const newTask: Task = {
      id: Date.now().toString(),
      name: "",
      storyPoints: 1,
      status: "Completado",
      comments: "",
    };
    setReportData((prev) => ({
      ...prev,
      completedTasks: [...prev.completedTasks, newTask],
    }));
  };

  const updateCompletedTask = (id: string, field: keyof Task, value: any) => {
    setReportData((prev) => ({
      ...prev,
      completedTasks: prev.completedTasks.map((task) =>
        task.id === id ? { ...task, [field]: value } : task
      ),
    }));
  };

  const removeCompletedTask = (id: string) => {
    setReportData((prev) => ({
      ...prev,
      completedTasks: prev.completedTasks.filter((task) => task.id !== id),
    }));
  };

  const addPendingTask = () => {
    const newTask: PendingTask = {
      id: Date.now().toString(),
      name: "",
      storyPoints: 1,
      actionPlan: "",
    };
    setReportData((prev) => ({
      ...prev,
      pendingTasks: [...prev.pendingTasks, newTask],
    }));
  };

  const updatePendingTask = (
    id: string,
    field: keyof PendingTask,
    value: any
  ) => {
    setReportData((prev) => ({
      ...prev,
      pendingTasks: prev.pendingTasks.map((task) =>
        task.id === id ? { ...task, [field]: value } : task
      ),
    }));
  };

  const removePendingTask = (id: string) => {
    setReportData((prev) => ({
      ...prev,
      pendingTasks: prev.pendingTasks.filter((task) => task.id !== id),
    }));
  };

  const addBlock = () => {
    setReportData((prev) => ({
      ...prev,
      blocks: [...prev.blocks, ""],
    }));
  };

  const updateBlock = (index: number, value: string) => {
    setReportData((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block, i) => (i === index ? value : block)),
    }));
  };

  const removeBlock = (index: number) => {
    setReportData((prev) => ({
      ...prev,
      blocks: prev.blocks.filter((_, i) => i !== index),
    }));
  };

  const addObservation = () => {
    setReportData((prev) => ({
      ...prev,
      observations: [...prev.observations, ""],
    }));
  };

  const updateObservation = (index: number, value: string) => {
    setReportData((prev) => ({
      ...prev,
      observations: prev.observations.map((observation, i) =>
        i === index ? value : observation
      ),
    }));
  };

  const removeObservation = (index: number) => {
    setReportData((prev) => ({
      ...prev,
      observations: prev.observations.filter((_, i) => i !== index),
    }));
  };

  const toSentenceCase = (str: string) => {
    // daniel alejandro fernandez ramos => Daniel Alejandro Fernández Ramos
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const generatePDF = () => {
    startGenerating(async () => {
      const toastId = toast.loading("Generando PDF...");
      try {
        const currentDate = new Date();
        const name =
          reportData.name !== ""
            ? toSentenceCase(reportData.name.trim())
            : // .replace(/\s+/g, "-")
              "reporte-diario";

        const formattedDate = format(currentDate, "yyyy-MM-dd");

        const res = await generatePDFAction({
          ...reportData,
          date: reportData.date,
        });

        const blob = new Blob([res], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${name} ${formattedDate.replace(/\//g, "-")}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.dismiss(toastId);
        toast.success("PDF generado correctamente", {
          duration: 2000,
        });
      } catch (error) {
        toast.dismiss(toastId);
        toast.error("Error al generar el PDF", {
          description: "Por favor, inténtalo de nuevo.",
        });
      }
    });
  };

  const totalCompletedPoints = reportData.completedTasks
    .filter((task) => task.status === "Completado")
    .reduce((sum, task) => sum + task.storyPoints, 0);

  const totalInProgressPoints = reportData.completedTasks
    .filter((task) => task.status === "En Proceso")
    .reduce((sum, task) => sum + task.storyPoints, 0);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 relative">
          <div className="absolute top-0 right-0">
            <ThemeToggle />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Generador de Reportes Diarios
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Crea reportes profesionales de programación con Story Points
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="builder" className="flex items-center gap-2">
              <PlusIcon className="w-4 h-4" />
              Constructor
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <EyeIcon className="w-4 h-4" />
              Vista Previa
            </TabsTrigger>
          </TabsList>

          <TabsContent value="builder" className="space-y-6">
            {/* Header Information */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Información General</CardTitle>
                    <CardDescription>Datos básicos del reporte</CardDescription>
                  </div>
                  <Button
                    onClick={clearSavedInfo}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    Limpiar Datos
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Fecha</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "h-10 w-full justify-start pr-10 text-left font-normal",
                          !reportData.date && "text-muted-foreground"
                        )}
                        id="calendar-input"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                        {reportData.date
                          ? format(reportData.date, "dd/MM/yyyy")
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
                          reportData.date
                            ? new Date(reportData.date)
                            : undefined
                        }
                        locale={es}
                        onSelect={(date) => {
                          if (date) {
                            setReportData((prev) => ({
                              ...prev,
                              date: date,
                            }));
                          }
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                  {/* <Input
                    id="date"
                    type="date"
                    value={reportData.date}
                    onChange={(e) =>
                      setReportData((prev) => ({
                        ...prev,
                        date: e.target.value,
                      }))
                    }
                  /> */}
                </div>
                <div>
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    placeholder="Tu nombre completo"
                    value={reportData.name}
                    onChange={(e) =>
                      setReportData((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="project">Proyecto</Label>
                  <Input
                    id="project"
                    placeholder="Nombre del proyecto"
                    value={reportData.project}
                    onChange={(e) =>
                      setReportData((prev) => ({
                        ...prev,
                        project: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="sprint">Sprint</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="sprint-input"
                        variant="outline"
                        className={cn(
                          "h-10 w-full justify-start pr-10 text-left font-normal",
                          !reportData.sprint && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                        {reportData.sprint.from ? (
                          reportData.sprint.to ? (
                            <>
                              {format(reportData.sprint.from, "LLL dd, y")} -{" "}
                              {format(reportData.sprint.to, "LLL dd, y")}
                            </>
                          ) : (
                            format(reportData.sprint.from, "LLL dd, y")
                          )
                        ) : (
                          <span>Selecciona un rango de fechas</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        autoFocus
                        mode="range"
                        defaultMonth={reportData.sprint.from || undefined}
                        selected={reportData.sprint as DateRange}
                        onSelect={(date: DateRange | undefined) => {
                          if (date) {
                            setReportData((prev) => ({
                              ...prev,
                              sprint: {
                                from: date.from || null,
                                to: date.to || null,
                              },
                            }));
                          }
                        }}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                  {/* <Input
                    id="sprint"
                    placeholder="Ej: 09 Junio - 13 Junio"
                    value={reportData.sprint}
                    onChange={(e) =>
                      setReportData((prev) => ({
                        ...prev,
                        sprint: e.target.value,
                      }))
                    }
                  /> */}
                </div>
                <small className="col-span-2 text-xs text-gray-500 inline-block ml-auto">
                  *Todos los datos del reporte se guardan automáticamente en tu
                  navegador.
                </small>
              </CardContent>
            </Card>

            {/* Completed Tasks */}
            <Card>
              <CardHeader>
                <CardTitle>Actividades Realizadas (Hoy)</CardTitle>
                <CardDescription>
                  Tareas completadas y en progreso • Arrastra para reordenar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Always visible add task form */}
                <AddTaskForm
                  onAdd={(taskData) => {
                    const newTask: Task = {
                      ...taskData,
                      id: Date.now().toString(),
                    };
                    setReportData((prev) => ({
                      ...prev,
                      completedTasks: [...prev.completedTasks, newTask],
                    }));
                  }}
                />

                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleCompletedTasksDragEnd}
                >
                  <SortableContext
                    items={reportData.completedTasks.map((task) => task.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {reportData.completedTasks.map((task) => (
                      <SortableTaskItem
                        key={task.id}
                        task={task}
                        updateTask={updateCompletedTask}
                        removeTask={removeCompletedTask}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
                {reportData.completedTasks.length === 0 && (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    No hay tareas agregadas aún.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pending Tasks */}
            <Card>
              <CardHeader>
                <CardTitle>Pendientes por Continuar</CardTitle>
                <CardDescription>
                  Tareas que continuarás mañana • Arrastra para reordenar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Always visible add pending task form */}
                <AddPendingTaskForm
                  onAdd={(taskData) => {
                    const newTask: PendingTask = {
                      ...taskData,
                      id: Date.now().toString(),
                    };
                    setReportData((prev) => ({
                      ...prev,
                      pendingTasks: [...prev.pendingTasks, newTask],
                    }));
                  }}
                />

                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handlePendingTasksDragEnd}
                >
                  <SortableContext
                    items={reportData.pendingTasks.map((task) => task.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {reportData.pendingTasks.map((task) => (
                      <SortablePendingTaskItem
                        key={task.id}
                        task={task}
                        updateTask={updatePendingTask}
                        removeTask={removePendingTask}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
                {reportData.pendingTasks.length === 0 && (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    No hay tareas pendientes aún.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card>
              <CardHeader>
                <CardTitle>Información Adicional</CardTitle>
                <CardDescription>
                  Bloqueos, observaciones y horas trabajadas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="blocks">Bloqueos / Dificultades</Label>
                  <div className="space-y-4 mt-2">
                    {/* Always visible add block form */}
                    <AddBlockForm
                      onAdd={(blockData) => {
                        setReportData((prev) => ({
                          ...prev,
                          blocks: [...prev.blocks, blockData],
                        }));
                      }}
                    />

                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleBlocksDragEnd}
                    >
                      <SortableContext
                        items={reportData.blocks.map(
                          (_, index) => `block-${index}`
                        )}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-2">
                          {reportData.blocks.map((block, index) => (
                            <SortableBlockItem
                              key={`block-${index}`}
                              block={block}
                              index={index}
                              updateBlock={updateBlock}
                              removeBlock={removeBlock}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                    {reportData.blocks.length === 0 && (
                      <div className="text-center py-4 text-gray-500 text-sm">
                        No hay bloqueos/dificultades aún.
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="observations">
                    Observaciones / Sugerencias
                  </Label>
                  <div className="space-y-4 mt-2">
                    {/* Always visible add observation form */}
                    <AddObservationForm
                      onAdd={(observationData) => {
                        setReportData((prev) => ({
                          ...prev,
                          observations: [...prev.observations, observationData],
                        }));
                      }}
                    />

                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleObservationsDragEnd}
                    >
                      <SortableContext
                        items={reportData.observations.map(
                          (_, index) => `observation-${index}`
                        )}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-2">
                          {reportData.observations.map((observation, index) => (
                            <SortableObservationItem
                              key={`observation-${index}`}
                              observation={observation}
                              index={index}
                              updateObservation={updateObservation}
                              removeObservation={removeObservation}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                    {reportData.observations.length === 0 && (
                      <div className="text-center py-4 text-gray-500 text-sm">
                        No hay observaciones/sugerencias aún.
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="hours">Horas Trabajadas</Label>
                  <Input
                    id="hours"
                    type="number"
                    className="max-w-32"
                    min="1"
                    max="24"
                    value={reportData.hoursWorked}
                    onChange={(e) =>
                      setReportData((prev) => ({
                        ...prev,
                        hoursWorked: Number.parseInt(e.target.value) || 8,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Notas Adicionales (Opcional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Cualquier información adicional que consideres relevante"
                    value={reportData.additionalNotes}
                    onChange={(e) =>
                      setReportData((prev) => ({
                        ...prev,
                        additionalNotes: e.target.value,
                      }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Resumen del Día</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {totalCompletedPoints}
                    </div>
                    <div className="text-sm text-gray-600">
                      Story Points Completados
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {totalInProgressPoints}
                    </div>
                    <div className="text-sm text-gray-600">
                      Story Points En Progreso
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {reportData.hoursWorked}
                    </div>
                    <div className="text-sm text-gray-600">
                      Horas Trabajadas
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview">
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button
                  onClick={generatePDF}
                  disabled={isGenerating}
                  className="flex items-center gap-2 fixed bottom-4 right-4"
                >
                  <>
                    {isGenerating ? (
                      <Loader2Icon className="w-4 h-4 animate-spin" />
                    ) : (
                      <DownloadIcon className="w-4 h-4" />
                    )}
                    Descargar PDF
                  </>
                </Button>
              </div>
              <DailyReportPreview data={reportData} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
