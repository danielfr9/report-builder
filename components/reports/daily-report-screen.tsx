"use client";

import {
  useState,
  useTransition,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
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

import { PlusIcon, EyeIcon, Loader2Icon, DownloadIcon } from "lucide-react";
import { DailyReportPreview } from "@/components/reports/daily-report-preview";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { debounce, toSentenceCase } from "@/lib/utils";
import { format, parse } from "date-fns";
import { generateDailyReportPDFAction } from "@/lib/actions/generate-pdf";
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

import AddTaskForm from "./daily/add-task-form";
import AddPendingTaskForm from "./daily/add-pending-task-form";
import AddBlockForm from "./daily/add-block-form";
import AddObservationForm from "./daily/add-observation-form";
import SortableTaskItem from "./daily/sortable-task-item";
import SortablePendingTaskItem from "./daily/sortable-pending-task-item";
import SortableBlockItem from "./daily/sortable-block-item";
import SortableObservationItem from "./daily/sortable-observation-item";
import ReportHeaderForm from "./report-header-form";

interface DailyReportScreenProps {
  initialData: DailyReportData;
  onDataChange: (data: DailyReportData) => void;
}

export default function DailyReportScreen({
  initialData,
  onDataChange,
}: DailyReportScreenProps) {
  const [reportData, setReportData] = useState<DailyReportData>({
    header: {
      date: initialData.header?.date || new Date(),
      name: initialData.header?.name || "",
      project: initialData.header?.project || "",
      sprint: {
        from: initialData.header?.sprint?.from ?? null,
        to: initialData.header?.sprint?.to ?? null,
      },
    },
    completedTasks: initialData.completedTasks || [],
    pendingTasks: initialData.pendingTasks || [],
    blocks: initialData.blocks || [],
    observations: initialData.observations || [],
    hoursWorked: initialData.hoursWorked || 8,
    additionalNotes: initialData.additionalNotes || "",
  });

  const [isGenerating, startGenerating] = useTransition();
  const [activeTab, setActiveTab] = useState("builder");
  const isInitialLoad = useRef(true);

  // Only create the debounced function once
  const debouncedOnChange = useCallback(
    debounce((data) => {
      onDataChange(data);
    }, 1000),
    [onDataChange]
  );

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

  // Set flag to false after initial load is complete
  useEffect(() => {
    const timer = setTimeout(() => (isInitialLoad.current = false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Debounced function to notify parent of data changes
  useEffect(() => {
    // Don't notify during initial load to prevent overwriting migrated data
    if (isInitialLoad.current) return;

    debouncedOnChange(reportData); // Wait 1000ms after the last change before notifying parent
  }, [
    reportData.header.date,
    reportData.header.name,
    reportData.header.project,
    reportData.header.sprint,
    reportData.completedTasks,
    reportData.pendingTasks,
    reportData.blocks,
    reportData.observations,
    reportData.hoursWorked,
    reportData.additionalNotes,
  ]);

  // Clear saved data
  const clearSavedInfo = () => {
    const clearedData = {
      header: {
        date: new Date(),
        name: "",
        project: "",
        sprint: {
          from: null,
          to: null,
        },
      },
      completedTasks: [],
      pendingTasks: [],
      blocks: [],
      observations: [],
      hoursWorked: 8,
      additionalNotes: "",
    };

    setReportData(clearedData);
    onDataChange(clearedData);
    toast.success("Datos borrados del navegador");
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
      blocks: prev.blocks.map((block) => (block.id === id ? value : block)),
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

  const generatePDF = () => {
    startGenerating(async () => {
      const toastId = toast.loading("Generando PDF...");
      try {
        const currentDate = new Date();
        const name =
          reportData.header.name !== ""
            ? toSentenceCase(reportData.header.name.trim())
            : "reporte-diario";

        const formattedDate = format(currentDate, "yyyy-MM-dd");

        const res = await generateDailyReportPDFAction({
          ...reportData,
          header: reportData.header,
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
  }, [reportData.pendingTasks]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8 relative">
        <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-2">
          Generador de reportes diarios
        </h1>
        <p className="text-muted-foreground">
          Crea reportes profesionales de programación con Story Points
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 sticky top-0 z-40">
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
          <ReportHeaderForm
            header={reportData.header}
            onHeaderChange={(header) =>
              setReportData((prev) => ({ ...prev, header }))
            }
            onClearData={clearSavedInfo}
          />

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
                <div className="text-center py-4 text-muted-foreground text-sm">
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
                <div className="text-center py-4 text-muted-foreground text-sm">
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
                    <div className="text-center py-4 text-muted-foreground text-sm">
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
                    <div className="text-center py-4 text-muted-foreground text-sm">
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
                  <div className="text-sm text-muted-foreground">
                    Story Points completados
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {totalInProgressPoints}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Story Points en progreso
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {reportData.hoursWorked}
                  </div>
                  <div className="text-sm text-muted-foreground">
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
  );
}
