"use client";

import { useState, useTransition, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  PlusIcon,
  EyeIcon,
  Loader2Icon,
  DownloadIcon,
  CalendarIcon,
} from "lucide-react";
import { DailyReportPreview } from "@/components/reports/daily-report-preview";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { es } from "date-fns/locale";
import { format, parse } from "date-fns";
import { generateDailyReportPDFAction } from "@/lib/actions/generate-pdf";
import { DateRange } from "react-day-picker";
import {
  DailyPendingTask,
  DailyReportData,
  DailyTask,
  DailyReportLocalStorageData,
  DailyBlock,
  DailyObservation,
} from "@/lib/interfaces/report-data.interface";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  SHARED_HEADER_KEY,
  V2_DAILY_REPORT_STORAGE_KEY,
} from "@/lib/constants/localstorage-keys";
import AddTaskForm from "./daily/add-task-form";
import AddPendingTaskForm from "./daily/add-pending-task-form";
import AddBlockForm from "./daily/add-block-form";
import AddObservationForm from "./daily/add-observation-form";
import SortableTaskItem from "./daily/sortable-task-item";
import SortablePendingTaskItem from "./daily/sortable-pending-task-item";
import SortableBlockItem from "./daily/sortable-block-item";
import SortableObservationItem from "./daily/sortable-observation-item";

export default function DailyReportScreen() {
  const [reportData, setReportData] = useState<DailyReportData>({
    date: new Date(),
    name: "",
    project: "",
    sprint: {
      from: null,
      to: null,
    },
    completedTasks: [],
    pendingTasks: [],
    blocks: [],
    observations: [],
    hoursWorked: 8,
    additionalNotes: "",
  });

  const [isGenerating, startGenerating] = useTransition();
  const [activeTab, setActiveTab] = useState("builder");

  // DnD Kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end for completed tasks
  const handleCompletedTasksDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setReportData((prev) => {
        const oldIndex = prev.completedTasks.findIndex(
          (task) => task.id === active.id
        );
        const newIndex = prev.completedTasks.findIndex(
          (task) => task.id === over?.id
        );

        return {
          ...prev,
          completedTasks: arrayMove(prev.completedTasks, oldIndex, newIndex),
        };
      });
    }
  };

  // Handle drag end for pending tasks
  const handlePendingTasksDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setReportData((prev) => {
        const oldIndex = prev.pendingTasks.findIndex(
          (task) => task.id === active.id
        );
        const newIndex = prev.pendingTasks.findIndex(
          (task) => task.id === over?.id
        );

        return {
          ...prev,
          pendingTasks: arrayMove(prev.pendingTasks, oldIndex, newIndex),
        };
      });
    }
  };

  // Handle drag end for blocks
  const handleBlocksDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setReportData((prev) => {
        const oldIndex = prev.blocks.findIndex(
          (block) => block.id === active.id
        );
        const newIndex = prev.blocks.findIndex(
          (block) => block.id === over?.id
        );

        return {
          ...prev,
          blocks: arrayMove(prev.blocks, oldIndex, newIndex),
        };
      });
    }
  };

  // Handle drag end for observations
  const handleObservationsDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setReportData((prev) => {
        const oldIndex = prev.observations.findIndex(
          (observation) => observation.id === active.id
        );
        const newIndex = prev.observations.findIndex(
          (observation) => observation.id === over?.id
        );

        return {
          ...prev,
          observations: arrayMove(prev.observations, oldIndex, newIndex),
        };
      });
    }
  };

  // Save shared header data to localStorage
  const saveSharedHeader = (data: DailyReportData) => {
    const sharedHeader = {
      name: data.name,
      project: data.project,
      sprint: {
        from: data.sprint.from ? format(data.sprint.from, "dd/MM/yyyy") : null,
        to: data.sprint.to ? format(data.sprint.to, "dd/MM/yyyy") : null,
      },
    };

    try {
      localStorage.setItem(SHARED_HEADER_KEY, JSON.stringify(sharedHeader));
    } catch (error) {
      console.error("Error saving shared header to localStorage:", error);
    }
  };

  // Save daily-specific data to localStorage
  const saveData = (data: DailyReportData) => {
    const dataToSave: DailyReportLocalStorageData = {
      name: data.name,
      project: data.project,
      sprint: {
        from: data.sprint.from ? format(data.sprint.from, "dd/MM/yyyy") : null,
        to: data.sprint.to ? format(data.sprint.to, "dd/MM/yyyy") : null,
      },
      completedTasks: data.completedTasks,
      pendingTasks: data.pendingTasks,
      blocks: data.blocks,
      observations: data.observations,
      hoursWorked: data.hoursWorked,
      additionalNotes: data.additionalNotes,
    };

    try {
      localStorage.setItem(
        V2_DAILY_REPORT_STORAGE_KEY,
        JSON.stringify(dataToSave)
      );
      // Also save shared header
      saveSharedHeader(data);
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  };

  // Load shared header data from localStorage
  const loadSharedHeader = () => {
    try {
      const savedHeader = localStorage.getItem(SHARED_HEADER_KEY);
      if (savedHeader) {
        const headerData = JSON.parse(savedHeader);
        return {
          name: headerData.name || "",
          project: headerData.project || "",
          sprint: {
            from: headerData.sprint?.from
              ? parse(headerData.sprint?.from, "dd/MM/yyyy", new Date())
              : null,
            to: headerData.sprint?.to
              ? parse(headerData.sprint?.to, "dd/MM/yyyy", new Date())
              : null,
          },
        };
      }
    } catch (error) {
      console.error("Error loading shared header from localStorage:", error);
    }
    return {
      name: "",
      project: "",
      sprint: { from: null, to: null },
    };
  };

  // Load data from localStorage
  const loadData = () => {
    try {
      const sharedHeader = loadSharedHeader();
      const saved = localStorage.getItem(V2_DAILY_REPORT_STORAGE_KEY);

      if (saved) {
        const savedData: DailyReportLocalStorageData = JSON.parse(saved);

        setReportData((prev) => ({
          ...prev,
          date: new Date(),
          name: sharedHeader.name,
          project: sharedHeader.project,
          sprint: sharedHeader.sprint,
          completedTasks: savedData.completedTasks || [],
          pendingTasks: savedData.pendingTasks || [],
          blocks: savedData.blocks || [],
          observations: savedData.observations || [],
          hoursWorked: savedData.hoursWorked || 8,
          additionalNotes: savedData.additionalNotes || "",
        }));
      } else {
        // If no saved data, at least load the shared header
        setReportData((prev) => ({
          ...prev,
          date: new Date(),
          name: sharedHeader.name,
          project: sharedHeader.project,
          sprint: sharedHeader.sprint,
        }));
      }
    } catch (error) {
      console.error("Error loading from localStorage:", error);
    }
  };

  // Load data when component mounts
  useEffect(() => {
    loadData();
  }, []);

  // Debounced save function to prevent excessive localStorage writes
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      saveData(reportData);
    }, 500); // Wait 500ms after the last change before saving

    return () => {
      clearTimeout(debounceTimer);
    };
  }, [
    reportData.date,
    reportData.name,
    reportData.project,
    reportData.sprint,
    reportData.completedTasks,
    reportData.pendingTasks,
    reportData.blocks,
    reportData.observations,
    reportData.hoursWorked,
    reportData.additionalNotes,
  ]);

  // Clear saved data
  const clearSavedInfo = () => {
    try {
      localStorage.removeItem(V2_DAILY_REPORT_STORAGE_KEY);
      setReportData((prev) => ({
        ...prev,
        date: null,
        name: "",
        project: "",
        sprint: {
          from: null,
          to: null,
        },
        completedTasks: [],
        pendingTasks: [],
        blocks: [],
        observations: [],
        hoursWorked: 8,
        additionalNotes: "",
      }));
      toast.success("Datos borrados del navegador");
    } catch (error) {
      console.error("Error clearing localStorage:", error);
      toast.error("Error al borrar los datos");
    }
  };

  const updateCompletedTask = (
    id: string,
    field: keyof DailyTask,
    value: any
  ) => {
    setReportData((prev) => ({
      ...prev,
      completedTasks: prev.completedTasks.map((task) =>
        task.id === id ? { ...task, [field]: value } : task
      ),
    }));
  };

  const removeCompletedTask = (id: string) => {
    setReportData((prev) => ({
      ...prev,
      completedTasks: prev.completedTasks.filter((task) => task.id !== id),
    }));
  };

  const updatePendingTask = (
    id: string,
    field: keyof DailyPendingTask,
    value: any
  ) => {
    setReportData((prev) => ({
      ...prev,
      pendingTasks: prev.pendingTasks.map((task) =>
        task.id === id ? { ...task, [field]: value } : task
      ),
    }));
  };

  const removePendingTask = (id: string) => {
    setReportData((prev) => ({
      ...prev,
      pendingTasks: prev.pendingTasks.filter((task) => task.id !== id),
    }));
  };

  const updateBlock = (id: string, value: DailyBlock) => {
    setReportData((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block) => (block.id === id ? value : block)), // TODO: fix this
    }));
  };

  const removeBlock = (id: string) => {
    setReportData((prev) => ({
      ...prev,
      blocks: prev.blocks.filter((block) => block.id !== id),
    }));
  };

  const updateObservation = (id: string, value: DailyObservation) => {
    setReportData((prev) => ({
      ...prev,
      observations: prev.observations.map((observation) =>
        observation.id === id ? value : observation
      ),
    }));
  };

  const removeObservation = (id: string) => {
    setReportData((prev) => ({
      ...prev,
      observations: prev.observations.filter(
        (observation) => observation.id !== id
      ),
    }));
  };

  const toSentenceCase = (str: string) => {
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const generatePDF = () => {
    startGenerating(async () => {
      const toastId = toast.loading("Generando PDF...");
      try {
        const currentDate = new Date();
        const name =
          reportData.name !== ""
            ? toSentenceCase(reportData.name.trim())
            : "reporte-diario";

        const formattedDate = format(currentDate, "yyyy-MM-dd");

        const res = await generateDailyReportPDFAction({
          ...reportData,
          date: reportData.date,
        });

        const blob = new Blob([res], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${name} ${formattedDate.replace(/\//g, "-")}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.dismiss(toastId);
        toast.success("PDF generado correctamente", {
          duration: 2000,
        });
      } catch (error) {
        toast.dismiss(toastId);
        toast.error("Error al generar el PDF", {
          description: "Por favor, inténtalo de nuevo.",
        });
      }
    });
  };

  const totalCompletedPoints = useMemo(() => {
    return reportData.completedTasks.reduce(
      (sum, task) => sum + task.storyPoints,
      0
    );
  }, [reportData.completedTasks]);

  const totalInProgressPoints = useMemo(() => {
    return reportData.pendingTasks.reduce(
      (sum, task) => sum + task.storyPoints,
      0
    );
  }, [reportData.completedTasks]);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 relative">
          <div className="absolute top-0 right-0">
            <ThemeToggle />
          </div>
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Generador de reportes diarios
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Crea reportes profesionales de programación con Story Points
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="builder" className="flex items-center gap-2">
              <PlusIcon className="w-4 h-4" />
              Constructor
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <EyeIcon className="w-4 h-4" />
              Vista Previa
            </TabsTrigger>
          </TabsList>

          <TabsContent value="builder" className="space-y-6">
            {/* Header Information */}
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row gap-2 justify-between items-center">
                  <div>
                    <CardTitle>Información general</CardTitle>
                    <CardDescription>Datos básicos del reporte</CardDescription>
                  </div>
                  <Button
                    onClick={clearSavedInfo}
                    variant="outline"
                    size="sm"
                    className="text-xs max-md:ml-auto"
                  >
                    Limpiar Datos
                  </Button>
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
                          "h-10 w-full justify-start pr-10 text-left font-normal",
                          !reportData.date && "text-muted-foreground"
                        )}
                        id="calendar-input"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                        {reportData.date
                          ? format(reportData.date, "dd/MM/yyyy")
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
                          reportData.date
                            ? new Date(reportData.date)
                            : undefined
                        }
                        locale={es}
                        onSelect={(date) => {
                          if (date) {
                            setReportData((prev) => ({
                              ...prev,
                              date: date,
                            }));
                          }
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    placeholder="Tu nombre completo"
                    value={reportData.name}
                    onChange={(e) =>
                      setReportData((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="project">Proyecto</Label>
                  <Input
                    id="project"
                    placeholder="Nombre del proyecto"
                    value={reportData.project}
                    onChange={(e) =>
                      setReportData((prev) => ({
                        ...prev,
                        project: e.target.value,
                      }))
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
                          "h-10 w-full justify-start pr-10 text-left font-normal",
                          !reportData.sprint && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                        {reportData.sprint.from ? (
                          reportData.sprint.to ? (
                            <>
                              {format(reportData.sprint.from, "LLL dd, y")} -{" "}
                              {format(reportData.sprint.to, "LLL dd, y")}
                            </>
                          ) : (
                            format(reportData.sprint.from, "LLL dd, y")
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
                        defaultMonth={reportData.sprint.from || undefined}
                        selected={reportData.sprint as DateRange}
                        onSelect={(date: DateRange | undefined) => {
                          if (date) {
                            setReportData((prev) => ({
                              ...prev,
                              sprint: {
                                from: date.from || null,
                                to: date.to || null,
                              },
                            }));
                          }
                        }}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                  {/* <Input
                    id="sprint"
                    placeholder="Ej: 09 Junio - 13 Junio"
                    value={reportData.sprint}
                    onChange={(e) =>
                      setReportData((prev) => ({
                        ...prev,
                        sprint: e.target.value,
                      }))
                    }
                  /> */}
                </div>
                <small className="col-span-1 md:col-span-2 text-xs text-gray-500 inline-block ml-auto">
                  *Todos los datos del reporte se guardan automáticamente en tu
                  navegador.
                </small>
              </CardContent>
            </Card>

            {/* Completed Tasks */}
            <Card>
              <CardHeader>
                <CardTitle>Actividades realizadas</CardTitle>
                <CardDescription>
                  Tareas completadas y en progreso • Arrastra para reordenar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Always visible add task form */}
                <AddTaskForm
                  onAdd={(taskData) => {
                    const newTask: DailyTask = {
                      ...taskData,
                      id: Date.now().toString(),
                    };
                    setReportData((prev) => ({
                      ...prev,
                      completedTasks: [...prev.completedTasks, newTask],
                    }));
                  }}
                />

                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleCompletedTasksDragEnd}
                >
                  <SortableContext
                    items={reportData.completedTasks.map((task) => task.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {reportData.completedTasks.map((task) => (
                      <SortableTaskItem
                        key={task.id}
                        task={task}
                        updateTask={updateCompletedTask}
                        removeTask={removeCompletedTask}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
                {reportData.completedTasks.length === 0 && (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    No hay tareas agregadas aún.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pending Tasks */}
            <Card>
              <CardHeader>
                <CardTitle>Pendientes por Continuar</CardTitle>
                <CardDescription>
                  Tareas que continuarás mañana • Arrastra para reordenar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Always visible add pending task form */}
                <AddPendingTaskForm
                  onAdd={(taskData) => {
                    const newTask: DailyPendingTask = {
                      ...taskData,
                      id: Date.now().toString(),
                    };
                    setReportData((prev) => ({
                      ...prev,
                      pendingTasks: [...prev.pendingTasks, newTask],
                    }));
                  }}
                />

                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handlePendingTasksDragEnd}
                >
                  <SortableContext
                    items={reportData.pendingTasks.map((task) => task.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {reportData.pendingTasks.map((task) => (
                      <SortablePendingTaskItem
                        key={task.id}
                        task={task}
                        updateTask={updatePendingTask}
                        removeTask={removePendingTask}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
                {reportData.pendingTasks.length === 0 && (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    No hay tareas pendientes aún.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card>
              <CardHeader>
                <CardTitle>Información Adicional</CardTitle>
                <CardDescription>
                  Bloqueos, observaciones y horas trabajadas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="blocks">Bloqueos / Dificultades</Label>
                  <div className="space-y-4 mt-2">
                    {/* Always visible add block form */}
                    <AddBlockForm
                      onAdd={(blockData) => {
                        const newBlock: DailyBlock = {
                          ...blockData,
                          id: Date.now().toString(),
                        };
                        setReportData((prev) => ({
                          ...prev,
                          blocks: [...prev.blocks, newBlock],
                        }));
                      }}
                    />

                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleBlocksDragEnd}
                    >
                      <SortableContext
                        items={reportData.blocks
                          .filter(Boolean)
                          .map((block) => block.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-2">
                          {reportData.blocks.filter(Boolean).map((block) => (
                            <SortableBlockItem
                              key={block.id}
                              block={block}
                              updateBlock={updateBlock}
                              removeBlock={removeBlock}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                    {reportData.blocks.length === 0 && (
                      <div className="text-center py-4 text-gray-500 text-sm">
                        No hay bloqueos/dificultades aún.
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="observations">
                    Observaciones / Sugerencias
                  </Label>
                  <div className="space-y-4 mt-2">
                    {/* Always visible add observation form */}
                    <AddObservationForm
                      onAdd={(observationData) => {
                        const newObservation: DailyObservation = {
                          ...observationData,
                          id: Date.now().toString(),
                        };
                        setReportData((prev) => ({
                          ...prev,
                          observations: [...prev.observations, newObservation],
                        }));
                      }}
                    />

                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleObservationsDragEnd}
                    >
                      <SortableContext
                        items={reportData.observations
                          .filter(Boolean)
                          .map((observation) => observation.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-2">
                          {reportData.observations
                            .filter(Boolean)
                            .map((observation) => (
                              <SortableObservationItem
                                key={observation.id}
                                observation={observation}
                                updateObservation={updateObservation}
                                removeObservation={removeObservation}
                              />
                            ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                    {reportData.observations.length === 0 && (
                      <div className="text-center py-4 text-gray-500 text-sm">
                        No hay observaciones/sugerencias aún.
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="hours">Horas Trabajadas</Label>
                  <Input
                    id="hours"
                    type="number"
                    className="max-w-32"
                    min="1"
                    max="24"
                    value={reportData.hoursWorked}
                    onChange={(e) =>
                      setReportData((prev) => ({
                        ...prev,
                        hoursWorked: Number.parseInt(e.target.value) || 8,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Notas Adicionales (Opcional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Cualquier información adicional que consideres relevante"
                    value={reportData.additionalNotes}
                    onChange={(e) =>
                      setReportData((prev) => ({
                        ...prev,
                        additionalNotes: e.target.value,
                      }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Resumen del día</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {totalCompletedPoints}
                    </div>
                    <div className="text-sm text-gray-600">
                      Story Points completados
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {totalInProgressPoints}
                    </div>
                    <div className="text-sm text-gray-600">
                      Story Points en progreso
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {reportData.hoursWorked}
                    </div>
                    <div className="text-sm text-gray-600">
                      Horas trabajadas
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview">
            <div className="space-y-4">
              <Button
                onClick={generatePDF}
                disabled={isGenerating}
                className="flex items-center gap-2 ml-auto w-fit"
              >
                <>
                  {isGenerating ? (
                    <Loader2Icon className="w-4 h-4 animate-spin" />
                  ) : (
                    <DownloadIcon className="w-4 h-4" />
                  )}
                  <span className="hidden md:block">Descargar PDF</span>
                </>
              </Button>
              <DailyReportPreview data={reportData} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
