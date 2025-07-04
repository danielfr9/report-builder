"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { CalendarIcon, PlusIcon } from "lucide-react";
import { CreateSprintSchema, Sprint } from "@/lib/schemas/sprint.schema";
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
import { createSprint } from "@/lib/dexie/dao/sprint";
import { toast } from "sonner";

interface ModalCreateSprintProps {
  onSprintCreated: (sprint: Sprint) => void;
}

const ModalCreateSprint = ({ onSprintCreated }: ModalCreateSprintProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<z.infer<typeof CreateSprintSchema>>({
    resolver: zodResolver(CreateSprintSchema),
    defaultValues: {
      name: "",
      startDate: new Date(),
      endDate: new Date(),
    },
  });

  const handleOpenModal = () => {
    setIsOpen(true);
  };

  const onSubmit = async (data: z.infer<typeof CreateSprintSchema>) => {
    setIsLoading(true);
    try {
      const response = await createSprint(data);
      if (response) {
        toast.success("Sprint creado correctamente");
        setIsOpen(false);
        form.reset();
        onSprintCreated(response);
      }
    } catch (error) {
      console.error(error);
    }
    setIsLoading(false);
  };

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
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fecha de inicio</FormLabel>
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
                                    field.value
                                      ? new Date(field.value)
                                      : undefined
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
                      name="endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fecha de fin</FormLabel>
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
                                    field.value
                                      ? new Date(field.value)
                                      : undefined
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
