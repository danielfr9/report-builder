"use client";

import { useState, useTransition, useEffect } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PlusIcon,
  Trash2Icon,
  EyeIcon,
  Loader2Icon,
  DownloadIcon,
} from "lucide-react";
import { ReportPreview } from "./report-preview";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface Task {
  id: string;
  name: string;
  storyPoints: number;
  status: "Completado" | "En Proceso" | "Pendiente";
  comments: string;
}

interface PendingTask {
  id: string;
  name: string;
  storyPoints: number;
  actionPlan: string;
}

interface ReportData {
  date: string;
  name: string;
  project: string;
  sprint: string;
  completedTasks: Task[];
  pendingTasks: PendingTask[];
  blocks: string[];
  observations: string[];
  hoursWorked: number;
  additionalNotes: string;
}

export default function ReportBuilder() {
  const [reportData, setReportData] = useState<ReportData>({
    date: "",
    name: "",
    project: "",
    sprint: "",
    completedTasks: [],
    pendingTasks: [],
    blocks: ["Ninguno"],
    observations: ["Ninguno"],
    hoursWorked: 8,
    additionalNotes: "",
  });

  const [activeTab, setActiveTab] = useState("builder");

  const [isGenerating, startGenerating] = useTransition();

  // Keys for localStorage
  const STORAGE_KEY = "report-builder-general-info";

  // Save general information to localStorage
  const saveGeneralInfo = (data: ReportData) => {
    const generalInfo = {
      date: data.date,
      name: data.name,
      project: data.project,
      sprint: data.sprint,
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(generalInfo));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  };

  // Load general information from localStorage
  const loadGeneralInfo = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const generalInfo = JSON.parse(saved);
        setReportData((prev) => ({
          ...prev,
          date: generalInfo.date || new Date().toISOString().split("T")[0],
          name: generalInfo.name || "",
          project: generalInfo.project || "",
          sprint: generalInfo.sprint || "",
        }));
      }
    } catch (error) {
      console.error("Error loading from localStorage:", error);
    }
  };

  // Load data when component mounts
  useEffect(() => {
    loadGeneralInfo();
  }, []);

  // Save general info whenever it changes
  useEffect(() => {
    saveGeneralInfo(reportData);
  }, [reportData.date, reportData.name, reportData.project, reportData.sprint]);

  // Clear saved general information
  const clearSavedInfo = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setReportData((prev) => ({
        ...prev,
        date: new Date().toISOString().split("T")[0],
        name: "",
        project: "",
        sprint: "",
      }));
      toast.success("Información general borrada");
    } catch (error) {
      console.error("Error clearing localStorage:", error);
      toast.error("Error al borrar la información");
    }
  };

  const addCompletedTask = () => {
    const newTask: Task = {
      id: Date.now().toString(),
      name: "",
      storyPoints: 1,
      status: "Completado",
      comments: "",
    };
    setReportData((prev) => ({
      ...prev,
      completedTasks: [...prev.completedTasks, newTask],
    }));
  };

  const updateCompletedTask = (id: string, field: keyof Task, value: any) => {
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

  const addPendingTask = () => {
    const newTask: PendingTask = {
      id: Date.now().toString(),
      name: "",
      storyPoints: 1,
      actionPlan: "",
    };
    setReportData((prev) => ({
      ...prev,
      pendingTasks: [...prev.pendingTasks, newTask],
    }));
  };

  const updatePendingTask = (
    id: string,
    field: keyof PendingTask,
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

  const addBlock = () => {
    setReportData((prev) => ({
      ...prev,
      blocks: [...prev.blocks, ""],
    }));
  };

  const updateBlock = (index: number, value: string) => {
    setReportData((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block, i) => (i === index ? value : block)),
    }));
  };

  const removeBlock = (index: number) => {
    setReportData((prev) => ({
      ...prev,
      blocks: prev.blocks.filter((_, i) => i !== index),
    }));
  };

  const addObservation = () => {
    setReportData((prev) => ({
      ...prev,
      observations: [...prev.observations, ""],
    }));
  };

  const updateObservation = (index: number, value: string) => {
    setReportData((prev) => ({
      ...prev,
      observations: prev.observations.map((observation, i) =>
        i === index ? value : observation
      ),
    }));
  };

  const removeObservation = (index: number) => {
    setReportData((prev) => ({
      ...prev,
      observations: prev.observations.filter((_, i) => i !== index),
    }));
  };

  const generatePDF = () => {
    startGenerating(async () => {
      const pdfPromise = async () => {
        try {
          const currentDate = new Date();
          const formattedDate = currentDate.toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });

          const res = await fetch("/api/generate-pdf", {
            method: "POST",
            body: JSON.stringify(reportData),
            headers: { "Content-Type": "application/json" },
          });

          if (!res.ok) {
            throw new Error("Failed to generate PDF");
          }

          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `reporte-diario-${formattedDate.replace(
            /\//g,
            "-"
          )}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        } catch (error) {
          toast.error("Error al generar el PDF", {
            description: "Por favor, inténtalo de nuevo.",
          });
        }
      };

      const re = toast.promise(pdfPromise, {
        loading: "Generando PDF...",
        success: "PDF generado correctamente",
        error: "Error al generar el PDF",
      });

      await re.unwrap();
    });
  };

  const totalCompletedPoints = reportData.completedTasks
    .filter((task) => task.status === "Completado")
    .reduce((sum, task) => sum + task.storyPoints, 0);

  const totalInProgressPoints = reportData.completedTasks
    .filter((task) => task.status === "En Proceso")
    .reduce((sum, task) => sum + task.storyPoints, 0);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 relative">
          <div className="absolute top-0 right-0">
            <ThemeToggle />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Generador de Reportes Diarios
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
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Información General</CardTitle>
                    <CardDescription>Datos básicos del reporte</CardDescription>
                  </div>
                  <Button
                    onClick={clearSavedInfo}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    Limpiar
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Fecha</Label>
                  <Input
                    id="date"
                    type="date"
                    value={reportData.date}
                    onChange={(e) =>
                      setReportData((prev) => ({
                        ...prev,
                        date: e.target.value,
                      }))
                    }
                  />
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
                  <Input
                    id="sprint"
                    placeholder="Ej: 09 Junio - 13 Junio"
                    value={reportData.sprint}
                    onChange={(e) =>
                      setReportData((prev) => ({
                        ...prev,
                        sprint: e.target.value,
                      }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Completed Tasks */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Actividades Realizadas (Hoy)</CardTitle>
                    <CardDescription>
                      Tareas completadas y en progreso
                    </CardDescription>
                  </div>
                  <Button onClick={addCompletedTask} size="sm">
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Agregar Tarea
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {reportData.completedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-1">
                        <div>
                          <Label>Tarea</Label>
                          <Input
                            placeholder="Descripción de la tarea"
                            value={task.name}
                            onChange={(e) =>
                              updateCompletedTask(
                                task.id,
                                "name",
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div>
                          <Label>Story Points</Label>
                          <Input
                            type="number"
                            min="1"
                            max="13"
                            value={task.storyPoints}
                            onChange={(e) =>
                              updateCompletedTask(
                                task.id,
                                "storyPoints",
                                Number.parseInt(e.target.value) || 1
                              )
                            }
                          />
                        </div>
                        <div>
                          <Label>Estado</Label>
                          <Select
                            value={task.status}
                            onValueChange={(value) =>
                              updateCompletedTask(task.id, "status", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Completado">
                                Completado
                              </SelectItem>
                              <SelectItem value="En Proceso">
                                En Proceso
                              </SelectItem>
                              <SelectItem value="Pendiente">
                                Pendiente
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCompletedTask(task.id)}
                        className="ml-2"
                      >
                        <Trash2Icon className="w-4 h-4" />
                      </Button>
                    </div>
                    <div>
                      <Label>Comentarios / PR</Label>
                      <Textarea
                        placeholder="Comentarios adicionales o enlaces a PR"
                        value={task.comments}
                        onChange={(e) =>
                          updateCompletedTask(
                            task.id,
                            "comments",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                ))}
                {reportData.completedTasks.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No hay tareas agregadas. Haz clic en "Agregar Tarea" para
                    comenzar.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pending Tasks */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Pendientes por Continuar</CardTitle>
                    <CardDescription>
                      Tareas que continuarás mañana
                    </CardDescription>
                  </div>
                  <Button onClick={addPendingTask} size="sm">
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Agregar Pendiente
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {reportData.pendingTasks.map((task) => (
                  <div
                    key={task.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1">
                        <div>
                          <Label>Tarea</Label>
                          <Input
                            placeholder="Descripción de la tarea pendiente"
                            value={task.name}
                            onChange={(e) =>
                              updatePendingTask(task.id, "name", e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <Label>Story Points</Label>
                          <Input
                            type="number"
                            min="1"
                            max="13"
                            value={task.storyPoints}
                            onChange={(e) =>
                              updatePendingTask(
                                task.id,
                                "storyPoints",
                                Number.parseInt(e.target.value) || 1
                              )
                            }
                          />
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removePendingTask(task.id)}
                        className="ml-2"
                      >
                        <Trash2Icon className="w-4 h-4" />
                      </Button>
                    </div>
                    <div>
                      <Label>Plan de Acción</Label>
                      <Textarea
                        placeholder="¿Qué harás para completar esta tarea?"
                        value={task.actionPlan}
                        onChange={(e) =>
                          updatePendingTask(
                            task.id,
                            "actionPlan",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                ))}
                {reportData.pendingTasks.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No hay tareas pendientes agregadas.
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
                  <div className="flex justify-between items-center mb-2">
                    <Label htmlFor="blocks">Bloqueos / Dificultades</Label>
                    <Button onClick={addBlock} size="sm" variant="outline">
                      <PlusIcon className="w-4 h-4 mr-2" />
                      Agregar Bloqueo
                    </Button>
                  </div>
                  {reportData.blocks.map((block, index) => (
                    <div
                      key={`block-${index}`}
                      className="flex items-start mb-2"
                    >
                      <Textarea
                        placeholder="Describe un bloqueo o dificultad encontrada"
                        value={block}
                        onChange={(e) => updateBlock(index, e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeBlock(index)}
                        className="ml-2"
                      >
                        <Trash2Icon className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label htmlFor="observations">
                      Observaciones / Sugerencias
                    </Label>
                    <Button
                      onClick={addObservation}
                      size="sm"
                      variant="outline"
                    >
                      <PlusIcon className="w-4 h-4 mr-2" />
                      Agregar Observación
                    </Button>
                  </div>
                  {reportData.observations.map((observation, index) => (
                    <div
                      key={`observation-${index}`}
                      className="flex items-start mb-2"
                    >
                      <Textarea
                        placeholder="Observación o sugerencia adicional"
                        value={observation}
                        onChange={(e) =>
                          updateObservation(index, e.target.value)
                        }
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeObservation(index)}
                        className="ml-2"
                      >
                        <Trash2Icon className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div>
                  <Label htmlFor="hours">Horas Trabajadas</Label>
                  <Input
                    id="hours"
                    type="number"
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
                <CardTitle>Resumen del Día</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {totalCompletedPoints}
                    </div>
                    <div className="text-sm text-gray-600">
                      Story Points Completados
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {totalInProgressPoints}
                    </div>
                    <div className="text-sm text-gray-600">
                      Story Points En Progreso
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {reportData.hoursWorked}
                    </div>
                    <div className="text-sm text-gray-600">
                      Horas Trabajadas
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview">
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button
                  onClick={generatePDF}
                  disabled={isGenerating}
                  className="flex items-center gap-2"
                >
                  <>
                    {isGenerating ? (
                      <Loader2Icon className="w-4 h-4 animate-spin" />
                    ) : (
                      <DownloadIcon className="w-4 h-4" />
                    )}
                    Descargar PDF
                  </>
                </Button>
              </div>
              <ReportPreview data={reportData} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
