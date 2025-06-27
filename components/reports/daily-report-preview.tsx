import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { DailyReport } from "@/lib/interfaces/daily.interface";
import { TASK_STATUS } from "@/lib/constants/task-status";

interface DailyReportPreviewProps {
  data: DailyReport;
}

export function DailyReportPreview({ data }: DailyReportPreviewProps) {
  const totalCompletedPoints = data.tasks
    .filter((task) => task.status === TASK_STATUS.COMPLETED)
    .reduce((sum, task) => sum + task.storyPoints, 0);

  const totalInProgressPoints = data.tasks
    .filter((task) => task.status === TASK_STATUS.IN_PROGRESS)
    .reduce((sum, task) => sum + task.storyPoints, 0);

  const completedTasks = data.tasks.filter(
    (task) => task.status === TASK_STATUS.COMPLETED
  );
  const pendingTasks = data.tasks.filter(
    (task) => task.status === TASK_STATUS.PENDING
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completado":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "En Proceso":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case "Pendiente":
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <>
      <Card className="max-w-4xl w-full mx-auto print:max-w-full print:border-none print:shadow-none">
        <CardContent className="p-8 print:p-0" id="report-preview">
          <div className="space-y-6">
            {/* Header */}
            <div className="border-b border-foreground/10 pb-6">
              <h1 className="text-center text-2xl font-bold text-foreground mb-2">
                Reporte diario de programador
              </h1>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm print:text-xs print:grid-cols-4">
                <div className="flex flex-col gap-1">
                  <span className="font-semibold">Nombre:</span>{" "}
                  <span className="text-muted-foreground">
                    {data.header.name}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-semibold">Fecha:</span>{" "}
                  <span className="text-muted-foreground">
                    {data.header.date
                      ? format(data.header.date, "dd/MM/yyyy")
                      : "No hay fecha"}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-semibold">Proyecto:</span>{" "}
                  <span className="text-muted-foreground">
                    {data.header.project}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-semibold">Sprint:</span>{" "}
                  <span className="text-muted-foreground">
                    {data.header.sprint.from
                      ? format(data.header.sprint.from, "dd/MM/yyyy")
                      : "No hay fecha"}
                    -{" "}
                    {data.header.sprint.to
                      ? format(data.header.sprint.to, "dd/MM/yyyy")
                      : "No hay fecha"}
                  </span>
                </div>
              </div>
            </div>

            {/* Completed Activities */}
            <div>
              <h2 className="text-lg print:text-base font-semibold mb-4">
                1. Actividades realizadas (Hoy)
              </h2>
              {completedTasks.length > 0 ? (
                <div className="overflow-x-auto text-xs">
                  <table className="w-full border-collapse border border-foreground/10">
                    <thead>
                      <tr className="bg-background">
                        <th className="border border-foreground/10 px-4 py-2 text-left">
                          Tarea
                        </th>
                        <th className="border border-foreground/10 px-4 py-2 text-center">
                          Story Points
                        </th>
                        <th className="border border-foreground/10 px-4 py-2 text-center">
                          Estado
                        </th>
                        <th className="border border-foreground/10 px-4 py-2 text-left">
                          Comentarios / PR
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-background/50">
                      {completedTasks.map((task) => (
                        <tr key={task.id}>
                          <td className="border border-foreground/10 px-4 py-2">
                            {task.name}
                          </td>
                          <td className="border border-foreground/10 px-4 py-2 text-center font-semibold">
                            {task.storyPoints} pts
                          </td>
                          <td className="border border-foreground/10 px-4 py-2 text-center">
                            <div className="flex items-center justify-center gap-2">
                              {getStatusIcon(task.status)}
                              {task.status}
                            </div>
                          </td>
                          <td className="border border-foreground/10 px-4 py-2">
                            {task.comments}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted-foreground italic text-xs">
                  No hay actividades realizadas.
                </p>
              )}
            </div>

            {/* Pending Tasks */}
            <div>
              <h2 className="text-lg print:text-base font-semibold mb-4">
                2. Pendientes por continuar
              </h2>
              {pendingTasks.length > 0 ? (
                <div className="overflow-x-auto text-xs">
                  <table className="w-full border-collapse border border-foreground/10">
                    <thead>
                      <tr className="bg-background">
                        <th className="border border-foreground/10 px-4 py-2 text-left">
                          Tarea
                        </th>
                        <th className="border border-foreground/10 px-4 py-2 text-center">
                          Story Points
                        </th>
                        <th className="border border-foreground/10 px-4 py-2 text-left">
                          Plan de acción
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-background/50">
                      {pendingTasks.map((task) => (
                        <tr key={task.id}>
                          <td className="border border-foreground/10 px-4 py-2">
                            {task.name}
                          </td>
                          <td className="border border-foreground/10 px-4 py-2 text-center font-semibold">
                            {task.storyPoints} pts
                          </td>
                          <td className="border border-foreground/10 px-4 py-2">
                            {task.actionPlan}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted-foreground italic text-xs">
                  No hay tareas pendientes.
                </p>
              )}
            </div>

            {/* Blocks */}
            <div>
              <h2 className="text-lg print:text-base font-semibold mb-2">
                3. Bloqueos / Dificultades
              </h2>
              {data.blocks.length > 0 ? (
                <ul className="list-disc pl-5 space-y-1 text-xs">
                  {data.blocks.map((block, index) => (
                    <li
                      key={`block-${index}`}
                      className="text-muted-foreground"
                    >
                      {block.name}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground italic text-xs">
                  No hay bloqueos o dificultades.
                </p>
              )}
            </div>

            {/* Observations */}
            <div>
              <h2 className="text-lg print:text-base font-semibold mb-2">
                4. Observaciones / Sugerencias
              </h2>
              {data.observations.length > 0 ? (
                <ul className="list-disc pl-5 space-y-1 text-xs">
                  {data.observations.map((observation, index) => (
                    <li
                      key={`observation-${index}`}
                      className="text-muted-foreground"
                    >
                      {observation.name}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground italic text-xs">
                  No hay observaciones o sugerencias.
                </p>
              )}
            </div>

            {/* Hours Worked */}
            <div>
              <h2 className="text-lg print:text-base font-semibold mb-2">
                5. Horas trabajadas
              </h2>
              <p className="text-muted-foreground text-xs">
                {data.hoursWorked} horas
              </p>
            </div>

            {/* Story Points Summary */}
            <div>
              <h2 className="text-lg print:text-base font-semibold mb-2">
                6. Total Story Points del día
              </h2>
              <div className="space-y-1 text-xs">
                <p className="text-muted-foreground flex items-center gap-2">
                  <span>Completados:</span>
                  <span className="font-semibold">
                    {totalCompletedPoints} pts
                  </span>
                </p>
                <p className="text-muted-foreground flex items-center gap-2">
                  <span>En progreso:</span>
                  <span className="font-semibold">
                    {totalInProgressPoints} pts
                  </span>
                </p>
              </div>
            </div>

            {/* Additional Notes */}
            {data.additionalNotes && (
              <div>
                <h2 className="text-lg print:text-base font-semibold mb-2">
                  Notas adicionales (opcional)
                </h2>
                <div className="border-t border-foreground/10 pt-2">
                  <p className="text-muted-foreground whitespace-pre-wrap text-sm">
                    {data.additionalNotes}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
