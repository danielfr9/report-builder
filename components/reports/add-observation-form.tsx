import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ObservationDto } from "@/lib/schemas/observation.schema";
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
import { toast } from "sonner";
import { createObservationAction } from "@/lib/actions/observation.action";

interface AddObservationFormProps {
  onAdd: (observation: ObservationDto) => void;
}

const AddObservationForm = ({ onAdd }: AddObservationFormProps) => {
  const form = useForm<z.infer<typeof createObservationSchema>>({
    resolver: zodResolver(createObservationSchema),
    defaultValues: {
      description: "",
    },
  });

  const handleSubmit = async (
    data: z.infer<typeof createObservationSchema>
  ) => {
    const response = await createObservationAction(data);
    if (response.success) {
      onAdd(response.data);
      form.reset();
      toast.success("Observación creada correctamente");
      return;
    }
    toast.error(response.error);
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
                    {...field}
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
