import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getAllArchivedReports } from "@/lib/dexie/dao/reports";
import { TaskDto } from "@/lib/schemas/tasks.schema";
import { useLiveQuery } from "dexie-react-hooks";
import ArchivedReportsTable from "./archived-reports-table";
import { useState } from "react";

interface ModalImportTasksProps {
  onImportTasks: (tasks: TaskDto[]) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function ModalImportTasks({
  onImportTasks,
  open,
  setOpen,
}: ModalImportTasksProps) {
  const reports = useLiveQuery(async () => {
    return await getAllArchivedReports();
  });

  const [selectedTasks, setSelectedTasks] = useState<TaskDto[]>([]);

  const handleSelectTasks = (tasks: TaskDto[]) => {
    setSelectedTasks((prev) => {
      const tFiltered = tasks.filter((t) => !prev.some((st) => st.id === t.id));

      return [...prev, ...tFiltered];
    });
  };

  const handleUnSelectTasks = (tasks: TaskDto[]) => {
    setSelectedTasks((prev) => {
      const updatedTasks = prev.filter(
        (t) => !tasks.some((st) => st.id === t.id)
      );

      return [...updatedTasks];
    });
  };

  const handleImportTasks = () => {
    onImportTasks(selectedTasks);
    resetTasks(false);
  };

  const resetTasks = (open: boolean) => {
    setOpen(open);
    setSelectedTasks([]);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={resetTasks}>
        <DialogContent className="flex flex-col gap-0 p-0 sm:max-h-[min(640px,80vh)] sm:max-w-6xl [&>button:last-child]:top-3.5">
          <DialogHeader className="contents space-y-0 text-left">
            <DialogTitle className="border-b px-6 py-4 text-base">
              Importar tareas de reportes archivados {selectedTasks.length}
            </DialogTitle>
            <div className="overflow-y-auto">
              <DialogDescription asChild>
                <div className="px-6 py-4">
                  <div className="[&_strong]:text-foreground space-y-4 [&_strong]:font-semibold">
                    <ArchivedReportsTable
                      reports={reports || []}
                      selectedTasks={selectedTasks}
                      onSelectTasks={handleSelectTasks}
                      onUnSelectTasks={handleUnSelectTasks}
                    />
                  </div>
                </div>
              </DialogDescription>
            </div>
          </DialogHeader>
          <DialogFooter className="border-t px-6 py-4 sm:items-center">
            <DialogClose asChild>
              <Button
                className="ml-auto"
                type="button"
                onClick={handleImportTasks}
              >
                Importar
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
