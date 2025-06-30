"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { es } from "date-fns/locale";
import { format } from "date-fns";
import { CalendarIcon, Trash2Icon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { ReportHeader } from "@/lib/interfaces/report-data.interface";
import {
  AlertDialog,
  AlertDialogHeader,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogCancel,
  AlertDialogFooter,
  AlertDialogAction,
} from "../ui/alert-dialog";

interface ReportHeaderFormProps {
  header: ReportHeader;
  onHeaderChange: (header: ReportHeader) => void;
  onClearData: () => void;
}

export default function ReportHeaderForm({
  header,
  onHeaderChange,
  onClearData,
}: ReportHeaderFormProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row gap-2 justify-between items-center">
          <div className="mb-4">
            <CardTitle>Información general</CardTitle>
            <CardDescription className="max-md:text-center">
              Datos básicos del reporte
            </CardDescription>
          </div>
          <AlertDialog>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={onClearData}>
                  Continuar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-xs max-md:ml-auto"
              >
                <Trash2Icon className="mr-2 h-4 w-4 opacity-50" />
                Limpiar Datos
              </Button>
            </AlertDialogTrigger>
          </AlertDialog>
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
                  "h-10 w-full justify-start pr-10 text-left font-normal text-sm md:text-base",
                  !header.date && "text-muted-foreground"
                )}
                id="calendar-input"
              >
                <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                {header.date
                  ? format(header.date, "dd/MM/yyyy")
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
                selected={header.date ? new Date(header.date) : undefined}
                locale={es}
                onSelect={(selectedDate) => {
                  onHeaderChange({ ...header, date: selectedDate || null });
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div>
          <Label htmlFor="name">Nombre</Label>
          <Input
            id="name"
            className="text-sm md:text-base"
            placeholder="Tu nombre"
            value={header.name}
            onChange={(e) =>
              onHeaderChange({ ...header, name: e.target.value })
            }
          />
        </div>
        <div>
          <Label htmlFor="project">Proyecto</Label>
          <Input
            id="project"
            className="text-sm md:text-base"
            placeholder="Nombre del proyecto"
            value={header.project}
            onChange={(e) =>
              onHeaderChange({ ...header, project: e.target.value })
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
                  "h-10 w-full justify-start pr-10 text-left font-normal text-sm md:text-base",
                  !header.sprint.from && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                {header.sprint.from ? (
                  header.sprint.to ? (
                    <>
                      {format(header.sprint.from, "LLL dd, y")} -{" "}
                      {format(header.sprint.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(header.sprint.from, "LLL dd, y")
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
                defaultMonth={header.sprint.from || undefined}
                selected={header.sprint as DateRange}
                onSelect={(dateRange: DateRange | undefined) => {
                  if (dateRange) {
                    onHeaderChange({
                      ...header,
                      sprint: {
                        from: dateRange.from || null,
                        to: dateRange.to || null,
                      },
                    });
                  }
                }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
        <small className="col-span-1 md:col-span-2 text-xs text-gray-500 inline-block ml-auto">
          *Todos los datos del reporte se guardan automáticamente en tu
          navegador.
        </small>
      </CardContent>
    </Card>
  );
}
