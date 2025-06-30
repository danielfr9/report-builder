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
import { WeeklyReportPreview } from "@/components/reports/weekly-report-preview";
import { toast } from "sonner";
import { debounce, toSentenceCase } from "@/lib/utils";
import { format } from "date-fns";
import { generateWeeklyReportPDFAction } from "@/lib/actions/generate-pdf";

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

import ReportHeaderForm from "./report-header-form";
import { WeeklyReport } from "@/lib/interfaces/weekly.interface";
import { TASK_STATUS } from "@/lib/constants/task-status";
import { Task } from "@/lib/interfaces/task.inteface";
import { Block } from "@/lib/interfaces/block.interface";
import { Observation } from "@/lib/interfaces/observation.interface";
import SortableTaskItem from "./sortable-task-item";
import AddTaskForm from "./add-task-form";
import AddBlockForm from "./add-block-form";
import SortableBlockItem from "./sortable-block-item";
import AddObservationForm from "./add-observation-form";
import SortableObservationItem from "./sortable-observation-item";

interface WeeklyReportScreenProps {
  initialData: WeeklyReport;
  onDataChange: (data: WeeklyReport) => void;
}

export default function WeeklyReportScreen({
  initialData,
  onDataChange,
}: WeeklyReportScreenProps) {
  const [reportData, setReportData] = useState<WeeklyReport>({
    header: {
      date: initialData.header?.date || new Date(),
      name: initialData.header?.name || "",
      project: initialData.header?.project || "",
      sprint: {
        from: initialData.header?.sprint?.from ?? null,
        to: initialData.header?.sprint?.to ?? null,
      },
    },
    tasks: initialData.tasks || [],
    blocks: initialData.blocks || [],
    observations: initialData.observations || [],
    hoursWorked: initialData.hoursWorked || 44,
    additionalNotes: initialData.additionalNotes || "",
  });

  const [isGenerating, startGenerating] = useTransition();
  const [activeTab, setActiveTab] = useState("builder");
  const isInitialLoad = useRef(true);
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
  const handleTasksDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setReportData((prev) => {
        const oldIndex = prev.tasks.findIndex((task) => task.id === active.id);
        const newIndex = prev.tasks.findIndex((task) => task.id === over?.id);

        return {
          ...prev,
          tasks: arrayMove(prev.tasks, oldIndex, newIndex),
        };
      });
    }
  };

  // Handle drag end for blocks
  const handleBlocksDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setReportData((prev) => {
        const activeIndex = parseInt(
          active.id.toString().replace("block-", "")
        );
        const overIndex = parseInt(
          over?.id.toString().replace("block-", "") || "0"
        );

        return {
          ...prev,
          blocks: arrayMove(prev.blocks, activeIndex, overIndex),
        };
      });
    }
  };

  // Handle drag end for observations
  const handleObservationsDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setReportData((prev) => {
        const activeIndex = parseInt(
          active.id.toString().replace("observation-", "")
        );
        const overIndex = parseInt(
          over?.id.toString().replace("observation-", "") || "0"
        );

        return {
          ...prev,
          observations: arrayMove(prev.observations, activeIndex, overIndex),
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
    reportData.tasks,
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
      tasks: [],
      blocks: [],
      observations: [],
      hoursWorked: 40,
      additionalNotes: "",
    };

    setReportData(clearedData);
    onDataChange(clearedData);
    toast.success("Datos borrados del navegador");
  };

  const updateTask = (id: string, value: Task) => {
    setReportData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) => (task.id === id ? value : task)),
    }));
  };

  const removeTask = (id: string) => {
    setReportData((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((task) => task.id !== id),
    }));
  };

  const updateBlock = (id: string, value: Block) => {
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

  const updateObservation = (id: string, value: Observation) => {
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
            : "";

        const fechaInicioSprint = reportData?.header.sprint.from
          ? format(reportData.header.sprint.from, "yyyy-MM-dd")
          : "";
        const fechaFinSprint = reportData?.header.sprint.to
          ? format(reportData.header.sprint.to, "yyyy-MM-dd")
          : format(currentDate, "yyyy-MM-dd");

        const res = await generateWeeklyReportPDFAction({
          ...reportData,
          header: reportData.header,
        });

        const blob = new Blob([res], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = ` Reporte Semanal ${name} ${
          fechaInicioSprint ? `- ${fechaInicioSprint}` : ""
        } ${fechaFinSprint ? `al ${fechaFinSprint}` : ""}.pdf`;
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
    return reportData.tasks
      .filter((task) => task.status === TASK_STATUS.COMPLETED)
      .reduce((sum, task) => sum + task.storyPoints, 0);
  }, [reportData.tasks]);

  const totalInProgressPoints = useMemo(() => {
    return reportData.tasks
      .filter((task) => task.status === TASK_STATUS.IN_PROGRESS)
      .reduce((sum, task) => sum + task.storyPoints, 0);
  }, [reportData.tasks]);

  const completedTasks = useMemo(() => {
    return reportData.tasks.filter(
      (task) => task.status === TASK_STATUS.COMPLETED
    );
  }, [reportData.tasks]);

  const inProgressTasks = useMemo(() => {
    return reportData.tasks.filter(
      (task) => task.status === TASK_STATUS.IN_PROGRESS
    );
  }, [reportData.tasks]);

  const pendingTasks = useMemo(() => {
    return reportData.tasks.filter(
      (task) => task.status === TASK_STATUS.PENDING
    );
  }, [reportData.tasks]);

  const blockedTasks = useMemo(() => {
    return reportData.tasks.filter(
      (task) => task.status === TASK_STATUS.BLOCKED
    );
  }, [reportData.tasks]);

  return (
    <div className="max-w-6xl mx-auto">
      {/* <div className="text-center mb-8 relative">
        <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-2">
          Generador de reportes semanales
        </h1>
        <p className="text-muted-foreground">
          Crea reportes profesionales de programación con Story Points
        </p>
      </div> */}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 sticky top-0 z-40 ">
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
              <CardTitle className="text-xl md:text-2xl">
                Registro de Tareas
              </CardTitle>
              <CardDescription>
                Registra las tareas relacionadas al sprint actual o proyectos en
                curso.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Always visible add task form */}
              <AddTaskForm
                onAdd={(taskData) => {
                  const newTask: Task = {
                    ...taskData,
                    id: Date.now().toString(),
                  };
                  setReportData((prev) => ({
                    ...prev,
                    tasks: [...prev.tasks, newTask],
                  }));
                }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl md:text-2xl">
                Tareas completadas
              </CardTitle>
              <CardDescription>
                Tareas completadas durante la semana • Arrastra para reordenar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleTasksDragEnd}
              >
                <SortableContext
                  items={completedTasks.map((task) => task.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {completedTasks.map((task) => (
                    <SortableTaskItem
                      key={task.id}
                      task={task}
                      updateTask={updateTask}
                      removeTask={removeTask}
                    />
                  ))}
                </SortableContext>
              </DndContext>
              {completedTasks.length === 0 && (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No hay tareas completadas aún.
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl md:text-2xl">
                Tareas en progreso
              </CardTitle>
              <CardDescription>
                Tareas que continúan la próxima semana • Arrastra para reordenar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleTasksDragEnd}
              >
                <SortableContext
                  items={inProgressTasks.map((task) => task.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {inProgressTasks.map((task) => (
                    <SortableTaskItem
                      key={task.id}
                      task={task}
                      updateTask={updateTask}
                      removeTask={removeTask}
                    />
                  ))}
                </SortableContext>
              </DndContext>
              {inProgressTasks.length === 0 && (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No hay tareas en progreso aún.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pending Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl md:text-2xl">
                Tareas pendientes
              </CardTitle>
              <CardDescription>
                Tareas que no se han iniciado • Arrastra para reordenar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleTasksDragEnd}
              >
                <SortableContext
                  items={pendingTasks.map((task) => task.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {pendingTasks.map((task) => (
                    <SortableTaskItem
                      key={task.id}
                      task={task}
                      updateTask={updateTask}
                      removeTask={removeTask}
                    />
                  ))}
                </SortableContext>
              </DndContext>
              {pendingTasks.length === 0 && (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No hay tareas pendientes aún.
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl md:text-2xl">
                Tareas bloqueadas
              </CardTitle>
              <CardDescription>
                Tareas que no puedes continuar debido a un bloqueo o dificultad
                • Arrastra para reordenar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleTasksDragEnd}
              >
                <SortableContext
                  items={blockedTasks.map((task) => task.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {blockedTasks.map((task) => (
                    <SortableTaskItem
                      key={task.id}
                      task={task}
                      updateTask={updateTask}
                      removeTask={removeTask}
                    />
                  ))}
                </SortableContext>
              </DndContext>
              {blockedTasks.length === 0 && (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No hay tareas bloqueadas aún.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl md:text-2xl">
                Información adicional
              </CardTitle>
              <CardDescription>
                Bloqueos, logros y mejoras, horas trabajadas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="blocks">Bloqueos / Dificultades</Label>
                <div className="space-y-4 mt-2">
                  {/* Always visible add block form */}
                  <AddBlockForm
                    onAdd={(blockData) => {
                      setReportData((prev) => ({
                        ...prev,
                        blocks: [
                          ...prev.blocks,
                          { ...blockData, id: Date.now().toString() },
                        ],
                      }));
                    }}
                  />

                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleBlocksDragEnd}
                  >
                    <SortableContext
                      items={reportData.blocks.map((block) => block.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-2">
                        {reportData.blocks.map((block, index) => (
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
                <Label htmlFor="observations">Logros y Mejoras</Label>
                <div className="space-y-4 mt-2">
                  {/* Always visible add observation form */}
                  <AddObservationForm
                    onAdd={(observationData) => {
                      setReportData((prev) => ({
                        ...prev,
                        observations: [
                          ...prev.observations,
                          { ...observationData, id: Date.now().toString() },
                        ],
                      }));
                    }}
                  />

                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleObservationsDragEnd}
                  >
                    <SortableContext
                      items={reportData.observations.map(
                        (observation) => observation.id
                      )}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-2">
                        {reportData.observations.map((observation) => (
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
                      No hay logros/mejoras aún.
                    </div>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="hours">Horas trabajadas esta semana</Label>
                <Input
                  id="hours"
                  type="number"
                  className="max-w-full md:max-w-32 text-sm md:text-base"
                  min="1"
                  max="168"
                  value={reportData.hoursWorked}
                  onChange={(e) =>
                    setReportData((prev) => ({
                      ...prev,
                      hoursWorked: Number.parseInt(e.target.value) || 40,
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl md:text-2xl max-md:text-center">
                Resumen de la semana
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-xl md:text-2xl font-bold text-green-600">
                    {totalCompletedPoints}
                  </div>
                  <div className="text-sm text-gray-600">
                    Story Points completados
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xl md:text-2xl font-bold text-yellow-600">
                    {totalInProgressPoints}
                  </div>
                  <div className="text-sm text-gray-600">
                    Story Points en progreso
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xl md:text-2xl font-bold text-blue-600">
                    {reportData.hoursWorked}
                  </div>
                  <div className="text-sm text-gray-600">Horas trabajadas</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Plan for Next Week */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl md:text-2xl">
                Plan para la próxima semana
              </CardTitle>
              <CardDescription>
                Tareas planificadas para la siguiente semana
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <Label htmlFor="notes">
                  Plan de trabajo{" "}
                  <span className="text-xs text-muted-foreground">
                    &#40;Opcional&#41;
                  </span>
                </Label>
                <Textarea
                  id="notes"
                  className="text-sm md:text-base"
                  placeholder="Describe las tareas o objetivos planificados para la próxima semana..."
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
            <WeeklyReportPreview data={reportData} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
