"use client";

import DailyReportScreen from "@/components/reports/daily-report-screen";
import WeeklyReportScreen from "@/components/reports/weekly-report-screen";
import { Button } from "@/components/ui/button";
import {
  DailyReportData,
  WeeklyReportData,
} from "@/lib/interfaces/report-data.interface";
import {
  DailyReportService,
  WeeklyReportService,
  MigrationService,
} from "@/lib/db/services/report-service";
import { CalendarIcon, ClockIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ReportBuilder() {
  const [reportType, setReportType] = useState<"daily" | "weekly">("daily");
  const [dailyData, setDailyData] = useState<DailyReportData | null>(null);
  const [weeklyData, setWeeklyData] = useState<WeeklyReportData | null>(null);
  const [currentDailyReportId, setCurrentDailyReportId] = useState<
    number | null
  >(null);
  const [currentWeeklyReportId, setCurrentWeeklyReportId] = useState<
    number | null
  >(null);

  // Handle daily data changes
  const handleDailyDataChange = async (data: DailyReportData) => {
    try {
      let reportId: number;

      if (currentDailyReportId) {
        // Update existing report
        await DailyReportService.update(currentDailyReportId, data);
        reportId = currentDailyReportId;
      } else {
        // Create new report
        reportId = await DailyReportService.save(data);
        setCurrentDailyReportId(reportId);
      }

      setDailyData(data);
    } catch (error) {
      console.error("Error saving daily data to IndexedDB:", error);
      toast.error("Error al guardar el reporte diario");
    }
  };

  // Handle weekly data changes
  const handleWeeklyDataChange = async (data: WeeklyReportData) => {
    try {
      let reportId: number;

      if (currentWeeklyReportId) {
        // Update existing report
        await WeeklyReportService.update(currentWeeklyReportId, data);
        reportId = currentWeeklyReportId;
      } else {
        // Create new report
        reportId = await WeeklyReportService.save(data);
        setCurrentWeeklyReportId(reportId);
      }

      setWeeklyData(data);
    } catch (error) {
      console.error("Error saving weekly data to IndexedDB:", error);
      toast.error("Error al guardar el reporte semanal");
    }
  };

  // Load data from IndexedDB
  const loadData = async () => {
    try {
      // Run migration first
      await MigrationService.migrateFromLocalStorage();

      // Load latest reports
      const [latestDaily, latestWeekly] = await Promise.all([
        DailyReportService.getLatest(),
        WeeklyReportService.getLatest(),
      ]);

      // Set daily data
      if (latestDaily) {
        setDailyData(latestDaily);
        // Get the report ID from the latest report metadata
        const dailyMeta = await DailyReportService.getAllMeta();
        if (dailyMeta.length > 0) {
          setCurrentDailyReportId(dailyMeta[0].id || null);
        }
      } else {
        // Create empty daily data
        const emptyDailyData: DailyReportData = {
          header: {
            date: new Date(),
            name: "",
            project: "",
            sprint: { from: null, to: null },
          },
          completedTasks: [],
          pendingTasks: [],
          blocks: [],
          observations: [],
          hoursWorked: 8,
          additionalNotes: "",
        };
        setDailyData(emptyDailyData);
      }

      // Set weekly data
      if (latestWeekly) {
        setWeeklyData(latestWeekly);
        // Get the report ID from the latest report metadata
        const weeklyMeta = await WeeklyReportService.getAllMeta();
        if (weeklyMeta.length > 0) {
          setCurrentWeeklyReportId(weeklyMeta[0].id || null);
        }
      } else {
        // Create empty weekly data
        const emptyWeeklyData: WeeklyReportData = {
          header: {
            date: new Date(),
            name: "",
            project: "",
            sprint: { from: null, to: null },
          },
          completedTasks: [],
          pendingTasks: [],
          blocks: [],
          observations: [],
          hoursWorked: 40,
          additionalNotes: "",
        };
        setWeeklyData(emptyWeeklyData);
      }
    } catch (error) {
      console.error("Error loading from IndexedDB:", error);
      toast.error("Error al cargar los datos");
    }
  };

  // Clear all data
  const clearAllData = async () => {
    try {
      await MigrationService.clearAll();

      // Reset state to empty data
      const emptyDailyData: DailyReportData = {
        header: {
          date: new Date(),
          name: "",
          project: "",
          sprint: { from: null, to: null },
        },
        completedTasks: [],
        pendingTasks: [],
        blocks: [],
        observations: [],
        hoursWorked: 8,
        additionalNotes: "",
      };

      const emptyWeeklyData: WeeklyReportData = {
        header: {
          date: new Date(),
          name: "",
          project: "",
          sprint: { from: null, to: null },
        },
        completedTasks: [],
        pendingTasks: [],
        blocks: [],
        observations: [],
        hoursWorked: 40,
        additionalNotes: "",
      };

      setDailyData(emptyDailyData);
      setWeeklyData(emptyWeeklyData);
      setCurrentDailyReportId(null);
      setCurrentWeeklyReportId(null);

      toast.success("Todos los datos han sido borrados");
    } catch (error) {
      console.error("Error clearing IndexedDB:", error);
      toast.error("Error al borrar los datos");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Show loading state while data is being loaded
  if (!dailyData || !weeklyData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative pb-24">
      <div className={`${reportType === "daily" ? "block" : "hidden"}`}>
        <DailyReportScreen
          initialData={dailyData}
          onDataChange={handleDailyDataChange}
        />
      </div>
      <div className={`${reportType === "weekly" ? "block" : "hidden"}`}>
        <WeeklyReportScreen
          initialData={weeklyData}
          onDataChange={handleWeeklyDataChange}
        />
      </div>

      {/* Pill-like menu/navigation at the bottom of the screen */}
      <div className="fixed bottom-4 left-0 right-0 bg-background border border-foreground/10 rounded-full p-4 shadow-lg w-fit px-10 mx-auto">
        <div className="flex justify-center gap-4">
          <Button
            variant={reportType === "daily" ? "default" : "outline"}
            className="shadow-sm border border-foreground/15 transition-all duration-300"
            onClick={() => setReportType("daily")}
          >
            <ClockIcon className="w-4 h-4 md:mr-2" />
            <span className="hidden md:block">Reporte Diario</span>
          </Button>
          <Button
            variant={reportType === "weekly" ? "default" : "outline"}
            className="shadow-sm border border-foreground/15 transition-all duration-300"
            onClick={() => setReportType("weekly")}
          >
            <CalendarIcon className="w-4 h-4 md:mr-2" />
            <span className="hidden md:block">Reporte Semanal</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
