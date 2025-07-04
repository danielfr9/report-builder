import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createBlock } from "@/lib/dexie/dao/blocks";
import { Block, createBlockSchema } from "@/lib/schemas/block.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  FormLabel,
} from "../ui/form";

// Add Block Form Component
interface AddBlockFormProps {
  onAdd: (block: Block) => void;
}

const AddBlockForm = ({ onAdd }: AddBlockFormProps) => {
  const form = useForm<z.infer<typeof createBlockSchema>>({
    resolver: zodResolver(createBlockSchema),
    defaultValues: {
      description: "",
    },
  });

  const handleSubmit = async (data: z.infer<typeof createBlockSchema>) => {
    const newBlock = await createBlock(data);
    if (newBlock) {
      onAdd(newBlock);
      form.reset();
    } else {
      toast.error("Error al crear el bloqueo");
    }
  };

  return (
    <div className="border-2 border-dashed border-primary/50 rounded-lg p-4 space-y-3 bg-primary/5">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3">
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
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Agregar Bloqueo</Button>
        </form>
      </Form>
    </div>
  );
};

export default AddBlockForm;
