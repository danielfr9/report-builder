"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { CalendarIcon, PlusIcon } from "lucide-react";
import { createSprintSchema, SprintDto } from "@/lib/schemas/sprint.schema";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel } from "../ui/form";
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "@/lib/utils";
import { es } from "date-fns/locale";
import { format } from "date-fns";
import { Calendar } from "../ui/calendar";
import { toast } from "sonner";
import { DateRange } from "react-day-picker";
import { createSprintAction } from "@/lib/actions/sprints.action";

interface ModalCreateSprintProps {
  onSprintCreated: (sprint: SprintDto) => void;
}

const ModalCreateSprint = ({ onSprintCreated }: ModalCreateSprintProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<z.infer<typeof createSprintSchema>>({
    resolver: zodResolver(createSprintSchema),
    defaultValues: {
      name: "",
      startDate: new Date(),
      endDate: new Date(),
    },
  });

  const handleOpenModal = () => {
    setIsOpen(true);
  };

  const onSubmit = async (data: z.infer<typeof createSprintSchema>) => {
    setIsLoading(true);
    try {
      const response = await createSprintAction(data);
      if (response.success) {
        toast.success("Sprint creado correctamente");
        onSprintCreated(response.data);
        setIsOpen(false);
        form.reset();
        return;
      }

      toast.error(response.error);
    } catch (error) {
      console.error(error);
    }
    setIsLoading(false);
  };

  const startDate = form.watch("startDate");
  const endDate = form.watch("endDate");

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={handleOpenModal}
        >
          <PlusIcon className="w-4 h-4" />
          <span className="hidden md:block">Crear Sprint</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="flex flex-col gap-0 p-0 sm:max-h-[min(640px,80vh)] sm:max-w-xl [&>button:last-child]:top-3.5">
        <DialogHeader className="contents space-y-0 text-left">
          <DialogTitle className="border-b px-6 py-4 text-base">
            Crear Sprint
          </DialogTitle>
          <div className="overflow-y-auto">
            <DialogDescription asChild>
              <div className="px-6 py-4">
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-8"
                  >
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="sprint-input"
                          variant="outline"
                          className={cn(
                            "h-10 w-full justify-start pr-10 text-left font-normal text-sm md:text-base",
                            !startDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                          {startDate ? (
                            endDate ? (
                              <>
                                {format(startDate, "LLL dd, y", { locale: es })}{" "}
                                - {format(endDate, "LLL dd, y", { locale: es })}
                              </>
                            ) : (
                              format(startDate, "LLL dd, y", { locale: es })
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
                          locale={es}
                          defaultMonth={startDate || undefined}
                          selected={
                            startDate && endDate
                              ? {
                                  from: startDate,
                                  to: endDate,
                                }
                              : undefined
                          }
                          onSelect={(dateRange: DateRange | undefined) => {
                            const startDate =
                              dateRange?.from || form.getValues("startDate");
                            const endDate =
                              dateRange?.to || form.getValues("endDate");

                            form.setValue("startDate", startDate);
                            form.setValue("endDate", endDate);
                          }}
                          numberOfMonths={2}
                        />
                      </PopoverContent>
                    </Popover>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? "Creando..." : "Crear Sprint"}
                    </Button>
                  </form>
                </Form>
              </div>
            </DialogDescription>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default ModalCreateSprint;
