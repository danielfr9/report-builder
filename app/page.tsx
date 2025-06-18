"use client";

import DailyReportScreen from "@/components/reports/daily-report-screen";
import WeeklyReportScreen from "@/components/reports/weekly-report-screen";
import { Button } from "@/components/ui/button";
import {
  DAILY_REPORT_STORAGE_KEY,
  V2_DAILY_REPORT_STORAGE_KEY,
  V2_WEEKLY_REPORT_STORAGE_KEY,
  WEEKLY_REPORT_STORAGE_KEY,
} from "@/lib/constants/localstorage-keys";
import {
  DailyReportLocalStorageData,
  WeeklyReportLocalStorageData,
  DailyReportData,
  WeeklyReportData,
} from "@/lib/interfaces/report-data.interface";
import { format } from "date-fns";
import { CalendarIcon, ClockIcon } from "lucide-react";
import { useEffect, useState } from "react";

interface PreviousDailyReportLocalStorageData
  extends Omit<DailyReportLocalStorageData, "blocks" | "observations"> {
  blocks: string[];
  observations: string[];
}

interface PreviousWeeklyReportLocalStorageData
  extends Omit<WeeklyReportLocalStorageData, "blocks" | "observations"> {
  blocks: string[];
  observations: string[];
}

const migrateLocalStorageData = () => {
  const v2DailyData = localStorage.getItem(V2_DAILY_REPORT_STORAGE_KEY);
  const v2WeeklyData = localStorage.getItem(V2_WEEKLY_REPORT_STORAGE_KEY);

  const dailyData = localStorage.getItem(DAILY_REPORT_STORAGE_KEY);
  if (dailyData && !v2DailyData) {
    const dailyDataObject: PreviousDailyReportLocalStorageData =
      JSON.parse(dailyData);

    // Blocks and observations are now arrays of objects
    // We need to convert them to the new format
    const blocks = dailyDataObject.blocks || [];
    const observations = dailyDataObject.observations || [];

    // We need to convert them to the new format
    let timestamp = Date.now();
    const newDailyData: DailyReportLocalStorageData = {
      ...dailyDataObject,
      blocks: blocks.map((block) => {
        return {
          id: (timestamp++).toString(),
          name: block,
        };
      }),
      observations: observations.map((observation) => ({
        id: (timestamp++).toString(),
        name: observation,
      })),
    };

    try {
      localStorage.setItem(
        V2_DAILY_REPORT_STORAGE_KEY,
        JSON.stringify(newDailyData)
      );
    } catch (error) {
      console.error("Error saving daily data:", error);
    }
  }

  const weeklyData = localStorage.getItem(WEEKLY_REPORT_STORAGE_KEY);
  if (weeklyData && !v2WeeklyData) {
    const weeklyDataObject: PreviousWeeklyReportLocalStorageData =
      JSON.parse(weeklyData);

    const blocks = weeklyDataObject.blocks || [];
    const observations = weeklyDataObject.observations || [];

    let timestamp = Date.now();
    const newWeeklyData: WeeklyReportLocalStorageData = {
      ...weeklyDataObject,
      blocks: blocks.map((block) => {
        return {
          id: (timestamp++).toString(),
          name: block,
        };
      }),
      observations: observations.map((observation) => ({
        id: (timestamp++).toString(),
        name: observation,
      })),
    };

    try {
      localStorage.setItem(
        V2_WEEKLY_REPORT_STORAGE_KEY,
        JSON.stringify(newWeeklyData)
      );
    } catch (error) {
      console.error("Error saving weekly data:", error);
    }
  }
};

export default function ReportBuilder() {
  const [reportType, setReportType] = useState<"daily" | "weekly">("daily");
  const [dailyData, setDailyData] =
    useState<DailyReportLocalStorageData | null>(null);
  const [weeklyData, setWeeklyData] =
    useState<WeeklyReportLocalStorageData | null>(null);

  // Save shared header data to localStorage
  const saveSharedHeader = (
    name: string,
    project: string,
    sprint: { from: Date | null; to: Date | null }
  ) => {
    const sharedHeader = {
      name,
      project,
      sprint: {
        from: sprint.from ? format(sprint.from, "dd/MM/yyyy") : null,
        to: sprint.to ? format(sprint.to, "dd/MM/yyyy") : null,
      },
    };

    try {
      localStorage.setItem("shared-header", JSON.stringify(sharedHeader));
    } catch (error) {
      console.error("Error saving shared header to localStorage:", error);
    }
  };

  // Handle daily data changes
  const handleDailyDataChange = (data: DailyReportData) => {
    const dataToSave: DailyReportLocalStorageData = {
      name: data.name,
      project: data.project,
      sprint: {
        from: data.sprint.from ? format(data.sprint.from, "dd/MM/yyyy") : null,
        to: data.sprint.to ? format(data.sprint.to, "dd/MM/yyyy") : null,
      },
      completedTasks: data.completedTasks,
      pendingTasks: data.pendingTasks,
      blocks: data.blocks,
      observations: data.observations,
      hoursWorked: data.hoursWorked,
      additionalNotes: data.additionalNotes,
    };

    try {
      localStorage.setItem(
        V2_DAILY_REPORT_STORAGE_KEY,
        JSON.stringify(dataToSave)
      );
      saveSharedHeader(data.name, data.project, data.sprint);
      setDailyData(dataToSave);
    } catch (error) {
      console.error("Error saving daily data to localStorage:", error);
    }
  };

  // Handle weekly data changes
  const handleWeeklyDataChange = (data: WeeklyReportData) => {
    const dataToSave: WeeklyReportLocalStorageData = {
      name: data.name,
      project: data.project,
      sprint: {
        from: data.sprint.from ? format(data.sprint.from, "dd/MM/yyyy") : null,
        to: data.sprint.to ? format(data.sprint.to, "dd/MM/yyyy") : null,
      },
      completedTasks: data.completedTasks,
      pendingTasks: data.pendingTasks,
      blocks: data.blocks,
      observations: data.observations,
      hoursWorked: data.hoursWorked,
      additionalNotes: data.additionalNotes,
    };

    try {
      localStorage.setItem(
        V2_WEEKLY_REPORT_STORAGE_KEY,
        JSON.stringify(dataToSave)
      );
      saveSharedHeader(data.name, data.project, data.sprint);
      setWeeklyData(dataToSave);
    } catch (error) {
      console.error("Error saving weekly data to localStorage:", error);
    }
  };

  // Load shared header data from localStorage
  const loadSharedHeader = () => {
    try {
      const savedHeader = localStorage.getItem("shared-header");
      if (savedHeader) {
        const headerData = JSON.parse(savedHeader);
        return {
          name: headerData.name || "",
          project: headerData.project || "",
          sprint: {
            from: headerData.sprint?.from || null,
            to: headerData.sprint?.to || null,
          },
        };
      }
    } catch (error) {
      console.error("Error loading shared header from localStorage:", error);
    }
    return {
      name: "",
      project: "",
      sprint: { from: null, to: null },
    };
  };

  // Load data from localStorage
  const loadData = () => {
    try {
      const sharedHeader = loadSharedHeader();

      // Load daily data
      const savedDaily = localStorage.getItem(V2_DAILY_REPORT_STORAGE_KEY);
      if (savedDaily) {
        const dailyDataParsed: DailyReportLocalStorageData =
          JSON.parse(savedDaily);
        setDailyData({
          ...sharedHeader,
          ...dailyDataParsed,
          sprint: sharedHeader.sprint,
        });
      } else {
        setDailyData({
          ...sharedHeader,
          completedTasks: [],
          pendingTasks: [],
          blocks: [],
          observations: [],
          hoursWorked: 8,
          additionalNotes: "",
        });
      }

      // Load weekly data
      const savedWeekly = localStorage.getItem(V2_WEEKLY_REPORT_STORAGE_KEY);
      if (savedWeekly) {
        const weeklyDataParsed: WeeklyReportLocalStorageData =
          JSON.parse(savedWeekly);
        setWeeklyData({
          ...sharedHeader,
          ...weeklyDataParsed,
          sprint: sharedHeader.sprint,
        });
      } else {
        setWeeklyData({
          ...sharedHeader,
          completedTasks: [],
          pendingTasks: [],
          blocks: [],
          observations: [],
          hoursWorked: 40,
          additionalNotes: "",
        });
      }
    } catch (error) {
      console.error("Error loading from localStorage:", error);
    }
  };

  // Clear all data
  const clearAllData = () => {
    try {
      localStorage.removeItem(V2_DAILY_REPORT_STORAGE_KEY);
      localStorage.removeItem(V2_WEEKLY_REPORT_STORAGE_KEY);
      localStorage.removeItem("shared-header");

      // Reset state to empty data
      const emptyDailyData: DailyReportLocalStorageData = {
        name: "",
        project: "",
        sprint: { from: null, to: null },
        completedTasks: [],
        pendingTasks: [],
        blocks: [],
        observations: [],
        hoursWorked: 8,
        additionalNotes: "",
      };

      const emptyWeeklyData: WeeklyReportLocalStorageData = {
        name: "",
        project: "",
        sprint: { from: null, to: null },
        completedTasks: [],
        pendingTasks: [],
        blocks: [],
        observations: [],
        hoursWorked: 40,
        additionalNotes: "",
      };

      setDailyData(emptyDailyData);
      setWeeklyData(emptyWeeklyData);
    } catch (error) {
      console.error("Error clearing localStorage:", error);
    }
  };

  useEffect(() => {
    migrateLocalStorageData();
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
