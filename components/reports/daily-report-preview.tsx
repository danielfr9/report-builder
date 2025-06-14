import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { DailyReportData } from "@/lib/interfaces/report-data.interface";

interface DailyReportPreviewProps {
  data: DailyReportData;
}

export function DailyReportPreview({ data }: DailyReportPreviewProps) {
  const totalCompletedPoints = data.completedTasks.reduce(
    (sum, task) => sum + task.storyPoints,
    0
  );

  const totalInProgressPoints = data.pendingTasks.reduce(
    (sum, task) => sum + task.storyPoints,
    0
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
    <Card className="max-w-4xl w-full mx-auto print:max-w-full print:border-none print:shadow-none">
      <CardContent className="p-8 print:p-0" id="report-preview">
        <div className="space-y-6">
          {/* Header */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h1 className="text-center text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Reporte Diario de Programador
            </h1>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm print:text-xs print:grid-cols-4">
              <div className="flex flex-col gap-1">
                <span className="font-semibold">Nombre:</span>{" "}
                <span className="text-gray-700 dark:text-gray-300">
                  {data.name}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-semibold">Fecha:</span>{" "}
                <span className="text-gray-700 dark:text-gray-300">
                  {data.date ? format(data.date, "dd/MM/yyyy") : "No hay fecha"}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-semibold">Proyecto:</span>{" "}
                <span className="text-gray-700 dark:text-gray-300">
                  {data.project}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-semibold">Sprint:</span>{" "}
                <span className="text-gray-700 dark:text-gray-300">
                  {data.sprint.from
                    ? format(data.sprint.from, "dd/MM/yyyy")
                    : "No hay fecha"}
                  -{" "}
                  {data.sprint.to
                    ? format(data.sprint.to, "dd/MM/yyyy")
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
            {data.completedTasks.length > 0 ? (
              <div className="overflow-x-auto text-xs">
                <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800">
                      <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">
                        Tarea
                      </th>
                      <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center">
                        Story Points
                      </th>
                      <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center">
                        Estado
                      </th>
                      <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">
                        Comentarios / PR
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.completedTasks.map((task) => (
                      <tr key={task.id}>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                          {task.name}
                        </td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center font-semibold">
                          {task.storyPoints} pts
                        </td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {getStatusIcon(task.status)}
                            {task.status}
                          </div>
                        </td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                          {task.comments}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 italic text-sm">
                No hay actividades realizadas.
              </p>
            )}
          </div>

          {/* Pending Tasks */}
          <div>
            <h2 className="text-lg print:text-base font-semibold mb-4">
              2. Pendientes por continuar
            </h2>
            {data.pendingTasks.length > 0 ? (
              <div className="overflow-x-auto text-xs">
                <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800">
                      <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">
                        Tarea
                      </th>
                      <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center">
                        Story Points
                      </th>
                      <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">
                        Plan de acción
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.pendingTasks.map((task) => (
                      <tr key={task.id}>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                          {task.name}
                        </td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center font-semibold">
                          {task.storyPoints} pts
                        </td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                          {task.actionPlan}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 italic text-sm">
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
                    className="text-gray-700 dark:text-gray-300"
                  >
                    {block}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 italic text-sm">
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
                    className="text-gray-700 dark:text-gray-300"
                  >
                    {observation}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 italic text-sm">
                No hay observaciones o sugerencias.
              </p>
            )}
          </div>

          {/* Hours Worked */}
          <div>
            <h2 className="text-lg print:text-base font-semibold mb-2">
              5. Horas trabajadas
            </h2>
            <p className="text-gray-700 dark:text-gray-300 text-sm">
              {data.hoursWorked} horas
            </p>
          </div>

          {/* Story Points Summary */}
          <div>
            <h2 className="text-lg print:text-base font-semibold mb-2">
              6. Total Story Points del día
            </h2>
            <div className="space-y-1 text-xs">
              <p className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <span>Completados:</span>
                <span className="font-semibold">
                  {totalCompletedPoints} pts
                </span>
              </p>
              <p className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
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
              <div className="border-t border-gray-300 dark:border-gray-600 pt-2">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-xs">
                  {data.additionalNotes}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
