import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { WeeklyReportData } from "@/lib/interfaces/report-data.interface";

interface WeeklyReportPreviewProps {
  data: WeeklyReportData;
}

export function WeeklyReportPreview({ data }: WeeklyReportPreviewProps) {
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
              Reporte semanal de programador
            </h1>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm print:text-xs print:grid-cols-4">
              <div className="flex flex-col gap-1">
                <span className="font-semibold">Nombre:</span>{" "}
                <span className="text-gray-700 dark:text-gray-300">
                  {data.header.name}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-semibold">Fecha:</span>{" "}
                <span className="text-gray-700 dark:text-gray-300">
                  {data.header.date
                    ? format(data.header.date, "dd/MM/yyyy")
                    : "No hay fecha"}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-semibold">Proyecto:</span>{" "}
                <span className="text-gray-700 dark:text-gray-300">
                  {data.header.project}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-semibold">Sprint:</span>{" "}
                <span className="text-gray-700 dark:text-gray-300">
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

          {/* Completed Tasks */}
          <div>
            <h2 className="text-lg print:text-base font-semibold mb-4">
              1. Tareas completadas esta semana
            </h2>
            {data.completedTasks.filter((task) => task.status === "Completado")
              .length > 0 ? (
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
                        Fecha de finalización
                      </th>
                      <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">
                        Comentarios / PR
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.completedTasks
                      .filter((task) => task.status === "Completado")
                      .map((task, index) => (
                        <tr key={task.id}>
                          <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                            {task.name}
                          </td>
                          <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center font-semibold">
                            {task.storyPoints} pts
                          </td>
                          <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center">
                            {task.finishDate
                              ? format(task.finishDate, "dd/MM/yyyy")
                              : "No especificada"}
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
                No hay tareas completadas.
              </p>
            )}
          </div>

          {/* Tasks in Progress */}
          <div>
            <h2 className="text-lg print:text-base font-semibold mb-4">
              2. Tareas en progreso
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
                      <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center">
                        Estado actual
                      </th>
                      <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">
                        Próximo paso
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
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center">
                          {task.actionPlan?.split("|")[0] || "En desarrollo"}
                        </td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                          {task.actionPlan?.split("|")[1] ||
                            "Continuar desarrollo"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 italic text-sm">
                No hay tareas en progreso.
              </p>
            )}
          </div>

          {/* Blocks/Difficulties */}
          <div>
            <h2 className="text-lg print:text-base font-semibold mb-2">
              3. Bloqueos / Dificultades
            </h2>
            {data.blocks.length > 0 ? (
              <ul className="space-y-1 text-xs">
                {data.blocks.map((block, index) => (
                  <li
                    key={`block-${index}`}
                    className="text-gray-700 dark:text-gray-300 flex items-start gap-2"
                  >
                    <span>•</span>
                    <span>{block.name}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 italic text-sm">
                No hay bloqueos / dificultades.
              </p>
            )}
          </div>

          {/* Achievements and Improvements */}
          <div>
            <h2 className="text-lg print:text-base font-semibold mb-2">
              4. Logros y mejoras
            </h2>
            {data.observations.length > 0 ? (
              <ul className="space-y-1 text-xs">
                {data.observations.map((observation, index) => (
                  <li
                    key={`observation-${index}`}
                    className="text-gray-700 dark:text-gray-300 flex items-start gap-2"
                  >
                    <span>•</span>
                    <span>{observation.name}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 italic text-sm">
                No hay logros y mejoras.
              </p>
            )}
          </div>

          {/* Hours Worked */}
          <div>
            <h2 className="text-lg print:text-base font-semibold mb-2">
              5. Horas trabajadas esta semana
            </h2>
            <div className="space-y-1 text-xs">
              <p className="text-gray-700 dark:text-gray-300">
                {data.hoursWorked} horas
              </p>
            </div>
          </div>

          {/* Story Points Summary */}
          <div>
            <h2 className="text-lg print:text-base font-semibold mb-2 ">
              6. Story points totales de la semana
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

          {/* Plan for Next Week */}
          <div>
            <h2 className="text-lg print:text-base font-semibold mb-2">
              7. Plan para la próxima semana
            </h2>
            {data.additionalNotes ? (
              <div className="text-xs">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {data.additionalNotes}
                </p>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 italic text-sm">
                No hay plan para la próxima semana.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
