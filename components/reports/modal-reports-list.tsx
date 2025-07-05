"use client";

import { deleteReports, getReports } from "@/lib/dexie/dao/reports";
import React, { useState } from "react";
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
import {
  CircleAlertIcon,
  HouseIcon,
  ListIcon,
  PanelsTopLeftIcon,
} from "lucide-react";
import { Report } from "@/lib/schemas/report.schema";
import { toast } from "sonner";
import ReportsTable from "./reports-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { Badge } from "../ui/badge";
import { Sprint } from "@/lib/schemas/sprint.schema";
import { deleteSprints, getSprints } from "@/lib/dexie/dao/sprint";
import SprintsTable from "./sprints-table";

interface ModalReportsListProps {
  onReportClick?: (report: Report) => void;
  onDeleteReports?: (reports: Report[]) => void;
}

const ModalReportsList = ({
  onReportClick,
  onDeleteReports,
}: ModalReportsListProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Reports
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  // Sprints
  const [sprints, setSprints] = useState<Sprint[]>([]);

  const handleLoadReport = (report: Report) => {
    setSelectedReport(null);
    setIsOpen(false);
    onReportClick?.(report);
    toast.success("Reporte cargado correctamente");
  };

  const handleOpenModal = async () => {
    setIsLoading(true);
    try {
      const [reports, sprints] = await Promise.allSettled([
        getReports(),
        getSprints(),
      ]);

      setReports(reports.status === "fulfilled" ? reports.value : []);
      setSprints(sprints.status === "fulfilled" ? sprints.value : []);
      setIsOpen(true);
    } catch (error) {
      toast.error("Error al cargar los reportes");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteReports = async (reportsDeleted: Report[]) => {
    const ids = reportsDeleted.map((r) => r.id);
    await deleteReports(ids);

    setReports(reports.filter((r) => !ids.includes(r.id)));

    onDeleteReports?.(reportsDeleted);
    toast.success(
      `${reportsDeleted.length} ${
        reportsDeleted.length > 1 ? "reportes eliminados" : "reporte eliminado"
      } correctamente`
    );
  };

  const handleDeleteSprints = async (sprintsDeleted: Sprint[]) => {
    const ids = sprintsDeleted.map((s) => s.id);
    await deleteSprints(ids);
    setSprints(sprints.filter((s) => !ids.includes(s.id)));

    toast.success(
      `${sprintsDeleted.length} ${
        sprintsDeleted.length > 1 ? "sprints eliminados" : "sprint eliminado"
      } correctamente`
    );
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
            <span className="hidden md:block">Historial</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="flex flex-col gap-0 p-0 max-h-[min(640px,80vh)] sm:max-w-5xl [&>button:last-child]:top-3.5">
          <DialogHeader className="contents space-y-0 text-left">
            <DialogTitle className="border-b px-6 py-4 text-base">
              Historial
            </DialogTitle>
            <DialogDescription asChild>
              <Tabs defaultValue="tab-1" className="overflow-y-auto relative">
                <div className="sticky top-0 z-10 w-full bg-transparent">
                  <ScrollArea className="w-full">
                    <TabsList className="text-foreground mb-3 h-auto gap-2 rounded-none border-b px-0 py-1 w-full bg-background">
                      <TabsTrigger
                        value="tab-1"
                        className="hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                      >
                        <HouseIcon
                          className="-ms-0.5 me-1.5 opacity-60"
                          size={16}
                          aria-hidden="true"
                        />
                        Reportes
                        <Badge
                          className="bg-primary/15 ms-1.5 min-w-5 px-1"
                          variant="secondary"
                        >
                          {reports.length}
                        </Badge>
                      </TabsTrigger>
                      <TabsTrigger
                        value="tab-2"
                        className="hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                      >
                        <PanelsTopLeftIcon
                          className="-ms-0.5 me-1.5 opacity-60"
                          size={16}
                          aria-hidden="true"
                        />
                        Sprints
                        <Badge
                          className="bg-primary/15 ms-1.5 min-w-5 px-1"
                          variant="secondary"
                        >
                          {sprints.length}
                        </Badge>
                      </TabsTrigger>
                    </TabsList>
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>
                </div>
                <TabsContent value="tab-1" className="px-6 pb-4 relative">
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
                </TabsContent>
                <TabsContent value="tab-2" className="px-6 pb-4 relative">
                  <SprintsTable
                    sprints={sprints}
                    onDelete={handleDeleteSprints}
                  />
                </TabsContent>
              </Tabs>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ModalReportsList;
