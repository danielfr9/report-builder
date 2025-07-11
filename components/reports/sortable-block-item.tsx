import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Block } from "@/lib/interfaces/block.interface";
import { createBlockSchema } from "@/lib/schemas/block,schema";
import { z } from "zod";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CheckIcon,
  GripVerticalIcon,
  PencilIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Label } from "../ui/label";

// Sortable Block Item Component
interface SortableBlockItemProps {
  block: Block;
  updateBlock: (id: string, value: Block) => void;
  removeBlock: (id: string) => void;
}

const SortableBlockItem = ({
  block,
  updateBlock,
  removeBlock,
}: SortableBlockItemProps) => {
  const form = useForm<z.infer<typeof createBlockSchema>>({
    resolver: zodResolver(createBlockSchema),
    defaultValues: {
      description: block.name,
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
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleSubmit = (data: z.infer<typeof createBlockSchema>) => {
    updateBlock(block.id, { ...block, name: data.description });
    setIsEditing(false);
    form.reset({
      description: block.name || "",
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    form.reset({
      description: block.name || "",
    });
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
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex flex-col !mt-0 md:flex-row gap-3 w-full"
          >
            <div className="flex flex-1 flex-col gap-3">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea
                        className="text-sm md:text-base"
                        placeholder="Describe un bloqueo o dificultad encontrada"
                        value={field.value}
                        onChange={field.onChange}
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
      className={`border rounded-lg p-4 space-y-3 bg-background  hover:bg-muted/50 ${
        isDragging ? "z-50 shadow-lg" : ""
      }`}
    >
      <div className="flex flex-col md:flex-row items-start gap-3">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className="cursor-grab active:cursor-grabbing touch-none h-8 w-full md:w-8 p-0"
            {...attributes}
            {...listeners}
          >
            <GripVerticalIcon className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex-1">
          <Label className="text-xs text-muted-foreground">Descripción</Label>
          <p className="text-sm font-medium break-words line-clamp-2 overflow-hidden text-ellipsis">
            {block.name || "Sin descripción"}
          </p>
        </div>
        <div className="flex flex-row gap-2 max-md:w-full md:flex-col max-md:justify-end">
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
            onClick={() => removeBlock(block.id)}
          >
            <Trash2Icon className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SortableBlockItem;
