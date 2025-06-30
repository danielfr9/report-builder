import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Observation } from "@/lib/interfaces/observation.interface";
import { createObservationSchema } from "@/lib/schemas/observation.schema";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";

// Add Observation Form Component
interface AddObservationFormProps {
  onAdd: (observation: Omit<Observation, "id">) => void;
}

const AddObservationForm = ({ onAdd }: AddObservationFormProps) => {
  const form = useForm<z.infer<typeof createObservationSchema>>({
    resolver: zodResolver(createObservationSchema),
    defaultValues: {
      description: "",
    },
  });

  const handleSubmit = (data: z.infer<typeof createObservationSchema>) => {
    onAdd({
      name: data.description,
    });
    form.reset({
      description: "",
    });
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
                    placeholder="Describe una observación o sugerencia adicional"
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-2">
            <Button type="submit" disabled={!form.formState.isValid}>
              Agregar Observación
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AddObservationForm;
