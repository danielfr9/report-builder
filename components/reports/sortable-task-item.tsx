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
import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  CheckIcon,
  GripVerticalIcon,
  PencilIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import { TASK_STATUS } from "@/lib/constants/task-status";
import { TaskDto } from "@/lib/schemas/tasks.schema";
import { updateTaskSchema } from "@/lib/schemas/tasks.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Popover, PopoverContent } from "../ui/popover";
import { PopoverTrigger } from "../ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "../ui/calendar";
import { toast } from "sonner";
import { updateTaskAction } from "@/lib/actions/tasks.action";

interface SortableTaskItemProps {
  task: TaskDto;
  updateTask: (id: string, value: TaskDto) => void;
  removeTask: (id: string) => void;
  readOnly?: boolean;
}

const SortableTaskItem = ({
  task,
  updateTask,
  removeTask,
  readOnly = false,
}: SortableTaskItemProps) => {
  const form = useForm<z.infer<typeof updateTaskSchema>>({
    resolver: zodResolver(updateTaskSchema),
    defaultValues: {
      id: task.id,
      name: task.name,
      storyPoints: task.storyPoints,
      status: task.status,
      comments: task.comments,
      actionPlan: task.actionPlan,
      finishDate: task.finishDate || new Date(),
    },
  });

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

  const handleSubmit = async (data: z.infer<typeof updateTaskSchema>) => {
    try {
      const response = await updateTaskAction(data);
      if (response.success) {
        updateTask(data.id, data);
        setIsEditing(false);
        form.reset({
          id: task.id,
          name: task.name,
          storyPoints: task.storyPoints,
          status: task.status,
          comments: task.comments,
          actionPlan: task.actionPlan,
          finishDate: task.finishDate,
        });
        toast.success("Tarea actualizada correctamente");
        return;
      }
      toast.error(response.error);
    } catch (error) {
      console.error(error);
      toast.error("Error al actualizar la tarea");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    form.reset();
  };

  if (isEditing) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`flex md:flex-row gap-2 flex-col md:items-start border rounded-lg p-4 space-y-3 bg-background border-primary ${
          isDragging ? "z-50 shadow-lg" : ""
        }`}
      >
        <div className="flex items-center">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="cursor-grab active:cursor-grabbing touch-none h-8 w-8 p-0"
            {...attributes}
            {...listeners}
          >
            <GripVerticalIcon className="w-4 h-4" />
          </Button>
        </div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex flex-col !mt-0 md:flex-row gap-3 w-full"
          >
            <div className="flex flex-1 flex-col gap-3">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm text-muted-foreground">
                      Tarea
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="text-sm md:text-base"
                        placeholder="Descripción de la tarea"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <FormField
                  control={form.control}
                  name="finishDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm text-muted-foreground">
                        Fecha de Finalización
                      </FormLabel>
                      <FormControl>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "h-10 w-full justify-start pr-10 text-left font-normal text-sm md:text-base",
                                !field.value && "text-muted-foreground"
                              )}
                              id="calendar-input"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                              {field.value
                                ? format(field.value, "dd/MM/yyyy")
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
                                field.value ? new Date(field.value) : undefined
                              }
                              locale={es}
                              onSelect={(selectedDate) => {
                                field.onChange(selectedDate || null);
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="storyPoints"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm text-muted-foreground">
                        Story Points
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="text-sm md:text-base"
                          type="number"
                          min="1"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm text-muted-foreground">
                        Estado
                      </FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="text-sm md:text-base">
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
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="comments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm text-muted-foreground">
                      Comentarios / PR
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        className="text-sm md:text-base"
                        placeholder="Comentarios adicionales o enlaces a PR"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="actionPlan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm text-muted-foreground">
                      Plan de acción
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        className="text-sm md:text-base"
                        placeholder="Plan de acción"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex flex-row max-md:w-full md:flex-col max-md:justify-between gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCancel}
              >
                <XIcon className="w-4 h-4" />
                <span className="text-sm max-md:block hidden">Cancelar</span>
              </Button>
              <Button type="submit" variant="ghost" size="sm">
                <CheckIcon className="w-4 h-4" />
                <span className="text-sm max-md:block hidden">Guardar</span>
              </Button>
            </div>
          </form>
        </Form>
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
      <div className="flex flex-col md:flex-row items-start gap-3">
        <div className="flex items-center">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="cursor-grab active:cursor-grabbing touch-none h-8 w-full md:w-8 p-0"
            {...attributes}
            {...listeners}
          >
            <GripVerticalIcon className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex-1 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
            <div className="md:col-span-3">
              <Label className="text-xs text-muted-foreground">Tarea</Label>
              <p className="text-sm font-medium break-words line-clamp-2 overflow-hidden text-ellipsis">
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
            <div>
              <Label className="text-xs text-muted-foreground">
                Fecha de Finalización
              </Label>
              <p className="text-sm">
                {task.finishDate
                  ? format(task.finishDate, "dd/MM/yyyy")
                  : "Sin fecha"}
              </p>
            </div>
          </div>
          {task.comments && (
            <div>
              <Label className="text-xs text-muted-foreground">
                Comentarios / PR
              </Label>
              <p className="text-sm break-all line-clamp-2 overflow-hidden text-ellipsis">
                {task.comments}
              </p>
            </div>
          )}
          {task.actionPlan && (
            <div>
              <Label className="text-xs text-muted-foreground">
                Plan de acción
              </Label>
              <p className="text-sm break-all line-clamp-2 overflow-hidden text-ellipsis">
                {task.actionPlan}
              </p>
            </div>
          )}
        </div>
        <div className="flex flex-row gap-2 max-md:w-full md:flex-col max-md:justify-end">
          {!readOnly && (
            <>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <PencilIcon className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeTask(task.id)}
              >
                <Trash2Icon className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SortableTaskItem;
