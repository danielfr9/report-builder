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
import {
  ArchiveIcon,
  ArrowLeftIcon,
  CalendarIcon,
  CheckIcon,
  ChevronsUpDown,
  PlusIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
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
import { SprintDto } from "@/lib/schemas/sprint.schema";
import { useEffect, useState } from "react";
import { getAllSprints } from "@/lib/dexie/dao/sprint";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "../ui/command";
import { REPORT_STATUS } from "@/lib/constants/report-status";
import ModalCreateSprint from "./modal-create-sprint";
import { useLiveQuery } from "dexie-react-hooks";
import { REPORT_TYPE } from "@/lib/constants/report-type";

interface Header {
  date: Date;
  owner: string;
  name: string;
  sprint?: SprintDto | null;
  status: (typeof REPORT_STATUS)[keyof typeof REPORT_STATUS];
  reportType: (typeof REPORT_TYPE)[keyof typeof REPORT_TYPE];
}

interface ReportHeaderFormProps {
  header: Header;
  onHeaderChange: (header: Header) => void;
  onArchiveReport: () => void;
  onClearData: () => void;
  onReloadCurrentReport: () => void;
  onImportTasks?: () => void;
  readOnly?: boolean;
}

export default function ReportHeaderForm({
  header,
  onHeaderChange,
  onArchiveReport,
  onClearData,
  onReloadCurrentReport,
  onImportTasks,
  readOnly = false,
}: ReportHeaderFormProps) {
  const [open, setOpen] = useState(false);

  const sprints = useLiveQuery(() => getAllSprints());

  useEffect(() => {
    if (header.sprint) {
      const exist = sprints?.find((sprint) => sprint.id === header.sprint?.id);
      if (!exist) {
        onHeaderChange({ ...header, sprint: null });
      }
    }
  }, [sprints, header.sprint]);

  const handleSprintCreated = (sprint: SprintDto) => {
    onHeaderChange({ ...header, sprint });
  };

  const handleReloadCurrentReport = () => {
    onReloadCurrentReport();
  };

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
          <div className="flex gap-2 flex-wrap">
            {!readOnly && header.reportType === REPORT_TYPE.WEEKLY && (
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={onImportTasks}
              >
                <PlusIcon className="mr-2 h-4 w-4 opacity-50" />
                Importar tareas
              </Button>
            )}

            {header.status === REPORT_STATUS.ARCHIVED && (
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={handleReloadCurrentReport}
              >
                <ArrowLeftIcon className="mr-2 h-4 w-4 opacity-50" />
                Volver a reporte actual
              </Button>
            )}

            {!readOnly && header.status === REPORT_STATUS.DRAFT && (
              <>
                <AlertDialog>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        ¿Estás seguro de querer limpiar los datos?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Si el reporte ha sido completado, lo mejor es archivarlo
                        en vez de limpiar los datos. Si no, los datos se
                        perderán y no podrás recuperarlos.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={onClearData}>
                        Limpiar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-xs">
                      <Trash2Icon className="mr-2 h-4 w-4 opacity-50" />
                      Limpiar Datos
                    </Button>
                  </AlertDialogTrigger>
                </AlertDialog>
                <AlertDialog>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        ¿Estás seguro de querer archivar este reporte?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Los datos del reporte se guardarán en el historial de
                        reportes.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={onArchiveReport}>
                        Archivar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-xs">
                      <ArchiveIcon className="mr-2 h-4 w-4 opacity-50" />
                      Archivar reporte
                    </Button>
                  </AlertDialogTrigger>
                </AlertDialog>
              </>
            )}
          </div>
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
                disabled={readOnly}
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
                  onHeaderChange({
                    ...header,
                    date: selectedDate || new Date(),
                  });
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div>
          <Label htmlFor="owner">Nombre</Label>
          <Input
            id="owner"
            className="text-sm md:text-base"
            placeholder="Tu nombre"
            value={header.owner}
            disabled={readOnly}
            onChange={(e) =>
              onHeaderChange({ ...header, owner: e.target.value })
            }
          />
        </div>
        <div>
          <Label htmlFor="name">Proyecto</Label>
          <Input
            id="name"
            className="text-sm md:text-base"
            placeholder="Nombre del proyecto"
            value={header.name}
            disabled={readOnly}
            onChange={(e) =>
              onHeaderChange({ ...header, name: e.target.value })
            }
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="sprint">Sprint</Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between"
                disabled={readOnly}
              >
                <div className="flex items-center justify-between w-full">
                  {header.sprint ? header.sprint.name : "Selecciona un sprint"}
                  <div className="flex items-center justify-between w-fit gap-4">
                    {header.sprint && (
                      <div
                        className="h-4 w-4"
                        onClick={(e) => {
                          e.stopPropagation();
                          onHeaderChange({ ...header, sprint: null });
                        }}
                      >
                        <XIcon className="h-4 w-4" />
                        <span className="sr-only">Clear selection</span>
                      </div>
                    )}
                    <ChevronsUpDown className="opacity-50" />
                  </div>
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
              <Command>
                <CommandInput placeholder="Buscar sprint..." className="h-9" />
                <CommandList>
                  <CommandEmpty className="flex flex-col items-center justify-center gap-2 py-4">
                    No se encontraron sprints.
                    <ModalCreateSprint onSprintCreated={handleSprintCreated} />
                  </CommandEmpty>
                  <CommandGroup>
                    {sprints && sprints.length > 0 && (
                      <div className="py-3">
                        <ModalCreateSprint
                          onSprintCreated={handleSprintCreated}
                        />
                      </div>
                    )}
                    {sprints &&
                      sprints.map((sprint) => (
                        <CommandItem
                          key={sprint.id}
                          value={sprint.id}
                          onSelect={(currentValue) => {
                            const sprint = sprints.find(
                              (sprint) => sprint.id === currentValue
                            );

                            if (sprint) {
                              onHeaderChange({ ...header, sprint });
                            }
                            setOpen(false);
                          }}
                        >
                          {sprint.name}
                          <CheckIcon
                            className={cn(
                              "ml-auto",
                              header.sprint?.id === sprint.id
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        {!readOnly && (
          <small className="col-span-1 md:col-span-2 text-xs text-gray-500 inline-block ml-auto">
            *Todos los datos del reporte se guardan automáticamente en tu
            navegador.
          </small>
        )}
      </CardContent>
    </Card>
  );
}
