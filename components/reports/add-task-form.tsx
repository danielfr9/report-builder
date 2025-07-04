import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { TASK_STATUS } from "@/lib/constants/task-status";
import { Task } from "@/lib/schemas/tasks.schema";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormItem,
  FormField,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CreateTaskSchema } from "@/lib/schemas/tasks.schema";
import { createTask } from "@/lib/dexie/dao/tasks";
import { toast } from "sonner";

// Add Task Form Component
interface AddTaskFormProps {
  onAdd: (task: Task) => void;
}

const AddTaskForm = ({ onAdd }: AddTaskFormProps) => {
  const form = useForm<z.infer<typeof CreateTaskSchema>>({
    resolver: zodResolver(CreateTaskSchema),
    defaultValues: {
      name: "",
      storyPoints: 1,
      status: TASK_STATUS.COMPLETED,
      comments: "",
      actionPlan: "",
      finishDate: new Date(),
    },
  });

  const handleSubmit = async (data: z.infer<typeof CreateTaskSchema>) => {
    const newTask = await createTask(data);
    if (newTask) {
      onAdd(newTask);
      form.reset();
    } else {
      toast.error("Error al crear la tarea");
    }
  };

  return (
    <div className="border-2 border-dashed border-primary/50 rounded-lg p-4 space-y-3 bg-primary/5">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tarea</FormLabel>
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
                  <FormLabel>Fecha de Finalización</FormLabel>
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
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="storyPoints"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Story Points</FormLabel>
                  <FormControl>
                    <Input
                      className="text-sm md:text-base"
                      type="number"
                      min={1}
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
                  <FormLabel>Estado</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
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
                <FormLabel>Comentarios / PR</FormLabel>
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
                <FormLabel>Plan de acción</FormLabel>
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
          <div className="flex gap-2">
            <Button type="submit" disabled={!form.formState.isValid}>
              Agregar Tarea
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AddTaskForm;
