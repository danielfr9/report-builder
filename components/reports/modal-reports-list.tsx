"use client";

import { getReports } from "@/lib/dexie/dao/reports";
import React, { useEffect, useState } from "react";
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
import { CircleAlertIcon, ListIcon } from "lucide-react";
import { Report } from "@/lib/schemas/report.schema";
import { Label } from "../ui/label";
import { toast } from "sonner";

interface ModalReportsListProps {
  onReportClick?: (report: Report) => void;
}

const ModalReportsList = ({ onReportClick }: ModalReportsListProps) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleLoadReport = (report: Report) => {
    setSelectedReport(null);
    setIsOpen(false);
    onReportClick?.(report);
    toast.success("Reporte cargado correctamente");
  };

  useEffect(() => {
    if (isOpen) {
      const fetchReports = async () => {
        const reports = await getReports();
        setReports(reports);
      };
      fetchReports();
    }
  }, [isOpen]);
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
          <Button variant="outline" className="flex items-center gap-2">
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
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead>Fecha</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Sprint</TableHead>
                        <TableHead className="text-right">Tareas</TableHead>
                        <TableHead className="text-right">
                          Observaciones
                        </TableHead>
                        <TableHead className="text-right">Bloques</TableHead>
                        <TableHead className="text-right">
                          Horas trabajadas
                        </TableHead>
                        <TableHead className="text-right">
                          Notas adicionales
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reports.map((item) => (
                        <TableRow
                          key={item.id}
                          onClick={() => setSelectedReport(item)}
                          className="cursor-pointer hover:bg-secondary"
                        >
                          <TableCell className="font-medium">
                            {format(item.date, "dd/MM/yyyy")}
                          </TableCell>
                          <TableCell>{item.type.toUpperCase()}</TableCell>
                          <TableCell>{item.sprint?.name}</TableCell>
                          <TableCell className="text-right">
                            {item.tasks.length}
                          </TableCell>
                          <TableCell className="text-right">
                            {item.observations.length}
                          </TableCell>
                          <TableCell className="text-right">
                            {item.blocks.length}
                          </TableCell>
                          <TableCell className="text-right">
                            {item.hoursWorked}
                          </TableCell>
                          <TableCell className="text-right">
                            {item.additionalNotes}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <TableFooter className="bg-transparent">
                      <TableRow className="bg-secondary">
                        <TableCell>Total</TableCell>
                        <TableCell className="text-right">
                          {reports.length}{" "}
                          {reports.length === 1 ? "reporte" : "reportes"}
                        </TableCell>
                        <TableCell
                          colSpan={7}
                          className="text-right"
                        ></TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                </div>
              </DialogDescription>
              <DialogFooter className="px-6 pb-6 sm:justify-start">
                <DialogClose asChild>
                  <Button type="button">Okay</Button>
                </DialogClose>
              </DialogFooter>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ModalReportsList;
