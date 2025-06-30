import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { DailyReport } from "@/lib/interfaces/daily.interface";
import { TASK_STATUS } from "@/lib/constants/task-status";

interface DailyReportPreviewProps {
  data: DailyReport;
}

export function DailyReportPreview({ data }: DailyReportPreviewProps) {
  // WARNING: Can't use useMemo here because it doesn't work with Puppeteer
  const totalCompletedPoints = data.tasks
    .filter((task) => task.status === TASK_STATUS.COMPLETED)
    .reduce((sum, task) => sum + task.storyPoints, 0);

  const totalInProgressPoints = data.tasks
    .filter((task) => task.status === TASK_STATUS.IN_PROGRESS)
    .reduce((sum, task) => sum + task.storyPoints, 0);

  const totalPendingPoints = data.tasks
    .filter((task) => task.status === TASK_STATUS.PENDING)
    .reduce((sum, task) => sum + task.storyPoints, 0);

  const totalBlockedPoints = data.tasks
    .filter((task) => task.status === TASK_STATUS.BLOCKED)
    .reduce((sum, task) => sum + task.storyPoints, 0);

  const completedTasks = data.tasks.filter(
    (task) => task.status === TASK_STATUS.COMPLETED
  );

  const inProgressTasks = data.tasks.filter(
    (task) => task.status === TASK_STATUS.IN_PROGRESS
  );

  const pendingTasks = data.tasks.filter(
    (task) => task.status === TASK_STATUS.PENDING
  );

  const blockedTasks = data.tasks.filter(
    (task) => task.status === TASK_STATUS.BLOCKED
  );

  const workedOnTasks = [...completedTasks, ...inProgressTasks];
  const notDoneTasks = [...pendingTasks, ...blockedTasks];

  const getStatusIcon = (
    status: (typeof TASK_STATUS)[keyof typeof TASK_STATUS]
  ) => {
    switch (status) {
      case TASK_STATUS.COMPLETED:
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case TASK_STATUS.IN_PROGRESS:
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case TASK_STATUS.BLOCKED:
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case TASK_STATUS.PENDING:
        return <Clock className="w-4 h-4 text-blue-600" />;
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
                1. Tareas realizadas o en progreso
              </h2>
              {workedOnTasks.length > 0 ? (
                <div className="overflow-x-auto text-xs">
                  <table className="w-full border-collapse border border-foreground/10">
                    <thead>
                      <tr className="bg-background">
                        <th className="border border-foreground/10 px-4 py-2 text-left min-w-[200px]">
                          Tarea
                        </th>
                        <th className="border border-foreground/10 px-4 py-2 text-center">
                          Story Points
                        </th>
                        <th className="border border-foreground/10 px-4 py-2 text-center">
                          Estado
                        </th>
                        <th className="border border-foreground/10 px-4 py-2 text-left min-w-[200px]">
                          Comentarios / PR
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-background/50">
                      {workedOnTasks.map((task) => (
                        <tr key={task.id}>
                          <td className="border border-foreground/10 px-4 py-2 break-words">
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
                          <td className="border border-foreground/10 px-4 py-2 break-words">
                            {task.comments}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted-foreground italic text-xs">
                  No hay tareas realizadas.
                </p>
              )}
            </div>

            {/* Pending Tasks */}
            <div>
              <h2 className="text-lg print:text-base font-semibold mb-4">
                2. Tareas pendientes por completar o con bloqueos
              </h2>
              {notDoneTasks.length > 0 ? (
                <div className="overflow-x-auto text-xs">
                  <table className="w-full border-collapse border border-foreground/10">
                    <thead>
                      <tr className="bg-background">
                        <th className="border border-foreground/10 px-4 py-2 text-left min-w-[200px]">
                          Tarea
                        </th>
                        <th className="border border-foreground/10 px-4 py-2 text-center">
                          Story Points
                        </th>
                        <th className="border border-foreground/10 px-4 py-2 text-center">
                          Estado
                        </th>
                        <th className="border border-foreground/10 px-4 py-2 text-center min-w-[200px]">
                          Comentarios / PR
                        </th>
                        <th className="border border-foreground/10 px-4 py-2 text-left min-w-[200px]">
                          Plan de acción
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-background/50">
                      {notDoneTasks.map((task) => (
                        <tr key={task.id}>
                          <td className="border border-foreground/10 px-4 py-2 break-words">
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
                          <td className="border border-foreground/10 px-4 py-2 break-words">
                            {task.comments}
                          </td>
                          <td className="border border-foreground/10 px-4 py-2 break-words">
                            {task.actionPlan}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted-foreground italic text-xs">
                  No hay tareas pendientes por completar o con bloqueos.
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
                6. Story points del día
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
                <p className="text-muted-foreground flex items-center gap-2">
                  <span>Pendientes:</span>
                  <span className="font-semibold">
                    {totalPendingPoints} pts
                  </span>
                </p>
                <p className="text-muted-foreground flex items-center gap-2">
                  <span>Bloqueados:</span>
                  <span className="font-semibold">
                    {totalBlockedPoints} pts
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
                  <p className="text-muted-foreground whitespace-pre-wrap text-xs">
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
