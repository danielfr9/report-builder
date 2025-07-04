"use client";

import { deleteReports, getReports } from "@/lib/dexie/dao/reports";
import React, { useState } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  TableFooter,
} from "../ui/table";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { CircleAlertIcon, EyeIcon, ListIcon, Trash2Icon } from "lucide-react";
import { Report } from "@/lib/schemas/report.schema";
import { Label } from "../ui/label";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import ReportsTable from "./reports-table";

interface ModalReportsListProps {
  onReportClick?: (report: Report) => void;
  onDeleteReports?: (reports: Report[]) => void;
}

const ModalReportsList = ({
  onReportClick,
  onDeleteReports,
}: ModalReportsListProps) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLoadReport = (report: Report) => {
    setSelectedReport(null);
    setIsOpen(false);
    onReportClick?.(report);
    toast.success("Reporte cargado correctamente");
  };

  const handleDeleteReports = async (reports: Report[]) => {
    const ids = reports.map((r) => r.id);
    await deleteReports(ids);
    setReports(reports.filter((r) => !ids.includes(r.id)));
    onDeleteReports?.(reports);
    toast.success(`${reports.length} reportes eliminados correctamente`);
  };

  const handleOpenModal = async () => {
    setIsLoading(true);
    try {
      const fetchedReports = await getReports();
      setReports(fetchedReports);
      setIsOpen(true);
    } catch (error) {
      toast.error("Error al cargar los reportes");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {selectedReport && (
        <Dialog
          open={!!selectedReport}
          onOpenChange={() => setSelectedReport(null)}
        >
          <DialogContent>
            <div className="flex flex-col items-center gap-2">
              <div
                className="flex size-9 shrink-0 items-center justify-center rounded-full border"
                aria-hidden="true"
              >
                <CircleAlertIcon className="opacity-80" size={16} />
              </div>
              <DialogHeader>
                <DialogTitle className="sm:text-center">
                  Cargar reporte
                </DialogTitle>
                <DialogDescription className="sm:text-center">
                  Desea cargar el reporte {selectedReport.name}?
                </DialogDescription>
              </DialogHeader>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" className="flex-1">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="button"
                className="flex-1"
                onClick={() => handleLoadReport(selectedReport)}
              >
                Cargar reporte
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={handleOpenModal}
            disabled={isLoading}
          >
            <ListIcon className="w-4 h-4" />
            <span className="hidden md:block">Reportes</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="flex flex-col gap-0 p-0 sm:max-h-[min(640px,80vh)] sm:max-w-5xl [&>button:last-child]:top-3.5">
          <DialogHeader className="contents space-y-0 text-left">
            <DialogTitle className="border-b px-6 py-4 text-base">
              Reportes
            </DialogTitle>
            <div className="overflow-y-auto">
              <DialogDescription asChild>
                <div className="px-6 py-4">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">
                          Cargando reportes...
                        </p>
                      </div>
                    </div>
                  ) : (
                    <ReportsTable
                      reports={reports}
                      onDelete={handleDeleteReports}
                      onView={handleLoadReport}
                    />
                  )}
                </div>
              </DialogDescription>
              <DialogFooter className="px-6 pb-6 sm:justify-start">
                <DialogClose asChild>
                  <Button type="button" className="ml-auto">
                    Okay
                  </Button>
                </DialogClose>
              </DialogFooter>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
};

const BtnDeleteReport = ({
  report,
  onDelete,
}: {
  report: Report;
  onDelete: (report: Report) => void;
}) => {
  const handleDeleteReport = async () => {
    onDelete(report);
  };

  return (
    <>
      <AlertDialog>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Estás seguro de querer eliminar este reporte?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Los datos del reporte se perderán permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteReport}>
              Archivar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
        <AlertDialogTrigger asChild>
          <Button
            variant="destructive"
            size="icon"
            className="text-xs max-md:ml-auto"
          >
            <Trash2Icon className="h-4 w-4 opacity-50" />
          </Button>
        </AlertDialogTrigger>
      </AlertDialog>
    </>
  );
};

export default ModalReportsList;
