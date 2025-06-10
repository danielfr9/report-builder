import { Badge } from "@/components/ui/badge"
;('import { Badge } from "@/components/ui/badge')
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, Clock, AlertCircle } from "lucide-react"

interface Task {
  id: string
  name: string
  storyPoints: number
  status: "Completado" | "En Proceso" | "Pendiente"
  comments: string
}

interface PendingTask {
  id: string
  name: string
  storyPoints: number
  actionPlan: string
}

// Update the ReportData interface
interface ReportData {
  date: string
  name: string
  project: string
  sprint: string
  completedTasks: Task[]
  pendingTasks: PendingTask[]
  blocks: string[] // Changed from string to string[]
  observations: string[] // Changed from string to string[]
  hoursWorked: number
  additionalNotes: string
}

interface ReportPreviewProps {
  data: ReportData
}

export function ReportPreview({ data }: ReportPreviewProps) {
  const totalCompletedPoints = data.completedTasks
    .filter((task) => task.status === "Completado")
    .reduce((sum, task) => sum + task.storyPoints, 0)

  const totalInProgressPoints = data.completedTasks
    .filter((task) => task.status === "En Proceso")
    .reduce((sum, task) => sum + task.storyPoints, 0)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completado":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "En Proceso":
        return <Clock className="w-4 h-4 text-yellow-600" />
      case "Pendiente":
        return <AlertCircle className="w-4 h-4 text-red-600" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      Completado: "default",
      "En Proceso": "secondary",
      Pendiente: "destructive",
    } as const

    return <Badge variant={variants[status as keyof typeof variants] || "default"}>{status}</Badge>
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardContent className="p-8" id="report-preview">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center border-b pb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Reporte Diario de Programador con Story Points ☕</h1>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
              <div>
                <span className="font-semibold">Fecha:</span> {data.date}
              </div>
              <div>
                <span className="font-semibold">👨‍💻 Nombre:</span> {data.name}
              </div>
              <div>
                <span className="font-semibold">Proyecto:</span> {data.project}
              </div>
              <div>
                <span className="font-semibold">Sprint:</span> {data.sprint}
              </div>
            </div>
          </div>

          {/* Completed Activities */}
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">1. Actividades realizadas (Hoy) ✅</h2>
            {data.completedTasks.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-2 text-left">Tarea</th>
                      <th className="border border-gray-300 px-4 py-2 text-center">Story Points</th>
                      <th className="border border-gray-300 px-4 py-2 text-center">Estado</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Comentarios / PR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.completedTasks.map((task) => (
                      <tr key={task.id}>
                        <td className="border border-gray-300 px-4 py-2">{task.name}</td>
                        <td className="border border-gray-300 px-4 py-2 text-center font-semibold">
                          {task.storyPoints} pts
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {getStatusIcon(task.status)}
                            {task.status}
                          </div>
                        </td>
                        <td className="border border-gray-300 px-4 py-2">{task.comments}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 italic">No hay actividades registradas.</p>
            )}
          </div>

          {/* Pending Tasks */}
          <div>
            <h2 className="text-lg font-semibold mb-4">2. Pendientes por continuar</h2>
            {data.pendingTasks.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-2 text-left">Tarea</th>
                      <th className="border border-gray-300 px-4 py-2 text-center">Story Points</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Plan de acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.pendingTasks.map((task) => (
                      <tr key={task.id}>
                        <td className="border border-gray-300 px-4 py-2">{task.name}</td>
                        <td className="border border-gray-300 px-4 py-2 text-center font-semibold">
                          {task.storyPoints} pts
                        </td>
                        <td className="border border-gray-300 px-4 py-2">{task.actionPlan}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 italic">No hay tareas pendientes.</p>
            )}
          </div>

          {/* Blocks */}
          <div>
            <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">3. Bloqueos / Dificultades ⚠️</h2>
            {data.blocks.length > 0 ? (
              <ul className="list-disc pl-5 space-y-1">
                {data.blocks.map((block, index) => (
                  <li key={`block-${index}`} className="text-gray-700">
                    {block}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">No hay bloqueos registrados.</p>
            )}
          </div>

          {/* Observations */}
          <div>
            <h2 className="text-lg font-semibold mb-2">4. Observaciones / Sugerencias</h2>
            {data.observations.length > 0 ? (
              <ul className="list-disc pl-5 space-y-1">
                {data.observations.map((observation, index) => (
                  <li key={`observation-${index}`} className="text-gray-700">
                    {observation}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">No hay observaciones registradas.</p>
            )}
          </div>

          {/* Hours Worked */}
          <div>
            <h2 className="text-lg font-semibold mb-2">5. Horas trabajadas</h2>
            <p className="text-gray-700">• {data.hoursWorked} horas</p>
          </div>

          {/* Story Points Summary */}
          <div>
            <h2 className="text-lg font-semibold mb-2">6. Total Story Points del día</h2>
            <div className="space-y-1">
              <p className="text-gray-700">• ✅ Completados: {totalCompletedPoints} pts</p>
              {totalInProgressPoints > 0 && (
                <p className="text-gray-700">• 🔄 En progreso: {totalInProgressPoints} pts</p>
              )}
            </div>
          </div>

          {/* Additional Notes */}
          {data.additionalNotes && (
            <div>
              <h2 className="text-lg font-semibold mb-2">Notas adicionales (opcional)</h2>
              <div className="border-t border-gray-300 pt-2">
                <p className="text-gray-700 whitespace-pre-wrap">{data.additionalNotes}</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
