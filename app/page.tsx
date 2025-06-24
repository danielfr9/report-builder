"use client";

import DailyReportScreen from "@/components/reports/daily-report-screen";
import WeeklyReportScreen from "@/components/reports/weekly-report-screen";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  V1_DAILY_REPORT_STORAGE_KEY,
  V2_DAILY_REPORT_STORAGE_KEY,
  V2_WEEKLY_REPORT_STORAGE_KEY,
  V1_WEEKLY_REPORT_STORAGE_KEY,
  V2_SHARED_HEADER_KEY,
  V1_SHARED_HEADER_KEY,
} from "@/lib/constants/localstorage-keys";
import {
  DailyReportLocalStorageData,
  WeeklyReportLocalStorageData,
  DailyReportData,
  WeeklyReportData,
  ReportHeaderLocalStorage,
  ReportHeader,
} from "@/lib/interfaces/report-data.interface";
import { isToday, parseISO } from "date-fns";
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

  const dailyData = localStorage.getItem(V1_DAILY_REPORT_STORAGE_KEY);
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

  const weeklyData = localStorage.getItem(V1_WEEKLY_REPORT_STORAGE_KEY);
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
  const [dailyData, setDailyData] = useState<DailyReportData | null>(null);
  const [weeklyData, setWeeklyData] = useState<WeeklyReportData | null>(null);

  // Helper function to parse header data with proper date conversion
  const parseHeaderData = (
    headerData: ReportHeaderLocalStorage | null | undefined
  ): ReportHeader => {
    if (!headerData)
      return {
        date: null,
        name: "",
        project: "",
        sprint: { from: null, to: null },
      };

    console.log("headerData", headerData);

    return {
      date: headerData.date ? parseISO(headerData.date) : null,
      name: headerData.name || "",
      project: headerData.project || "",
      sprint: {
        from: headerData.sprint?.from ? parseISO(headerData.sprint.from) : null,
        to: headerData.sprint?.to ? parseISO(headerData.sprint.to) : null,
      },
    };
  };

  // Format header data to be saved to localStorage
  const formatHeaderData = (
    headerData: ReportHeader
  ): ReportHeaderLocalStorage => {
    return {
      date: headerData.date?.toISOString() ?? null,
      name: headerData.name,
      project: headerData.project,
      sprint: {
        from: headerData.sprint?.from?.toISOString() ?? null,
        to: headerData.sprint?.to?.toISOString() ?? null,
      },
    };
  };

  // Load shared header data from localStorage
  const loadSharedHeader = (): ReportHeader => {
    try {
      const savedHeader = localStorage.getItem(V2_SHARED_HEADER_KEY);
      console.log("savedHeaderRAW", savedHeader);
      if (savedHeader) {
        return parseHeaderData(JSON.parse(savedHeader));
      }
    } catch (error) {
      console.error("Error loading shared header from localStorage:", error);
    }
    return {
      date: new Date(),
      name: "",
      project: "",
      sprint: { from: null, to: null },
    };
  };

  // Save shared header data to localStorage
  const saveSharedHeader = (header: ReportHeader) => {
    try {
      const sharedHeader = formatHeaderData(header);
      localStorage.setItem(V2_SHARED_HEADER_KEY, JSON.stringify(sharedHeader));
    } catch (error) {
      console.error("Error saving shared header to localStorage:", error);
    }
  };

  // Handle daily data changes
  const handleDailyDataChange = (data: DailyReportData) => {
    const dataToSave: DailyReportLocalStorageData = {
      header: formatHeaderData(data.header),
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
      saveSharedHeader(data.header);
      setDailyData(data);
    } catch (error) {
      console.error("Error saving daily data to localStorage:", error);
    }
  };

  // Handle weekly data changes
  const handleWeeklyDataChange = (data: WeeklyReportData) => {
    const dataToSave: WeeklyReportLocalStorageData = {
      header: formatHeaderData(data.header),
      completedTasks: data.completedTasks.map((task) => ({
        ...task,
        finishDate: task.finishDate?.toISOString() ?? null,
      })),
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
      saveSharedHeader(data.header);
      setWeeklyData(data);
    } catch (error) {
      console.error("Error saving weekly data to localStorage:", error);
    }
  };

  // Load data from localStorage
  const loadData = () => {
    try {
      const sharedHeader = loadSharedHeader();

      // Check if saved date is from older than today
      if (sharedHeader.date && !isToday(sharedHeader.date)) {
        // If so, set the date to today
        sharedHeader.date = new Date();
      }

      // Load daily data
      const savedDaily = localStorage.getItem(V2_DAILY_REPORT_STORAGE_KEY);
      if (savedDaily) {
        const dailyDataParsed: DailyReportLocalStorageData =
          JSON.parse(savedDaily);
        const parsedHeader = parseHeaderData(dailyDataParsed.header);

        setDailyData({
          header: sharedHeader ?? parsedHeader,
          completedTasks: dailyDataParsed.completedTasks || [],
          pendingTasks: dailyDataParsed.pendingTasks || [],
          blocks: dailyDataParsed.blocks || [],
          observations: dailyDataParsed.observations || [],
          hoursWorked: dailyDataParsed.hoursWorked || 8,
          additionalNotes: dailyDataParsed.additionalNotes || "",
        });
      } else {
        setDailyData({
          header: sharedHeader,
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
        const parsedHeader = parseHeaderData(weeklyDataParsed.header);

        setWeeklyData({
          header: sharedHeader ?? parsedHeader,
          completedTasks:
            weeklyDataParsed.completedTasks?.map((task) => ({
              ...task,
              finishDate: task.finishDate ? parseISO(task.finishDate) : null,
            })) || [],
          pendingTasks: weeklyDataParsed.pendingTasks || [],
          blocks: weeklyDataParsed.blocks || [],
          observations: weeklyDataParsed.observations || [],
          hoursWorked: weeklyDataParsed.hoursWorked || 40,
          additionalNotes: weeklyDataParsed.additionalNotes || "",
        });
      } else {
        setWeeklyData({
          header: sharedHeader,
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
      localStorage.removeItem(V2_SHARED_HEADER_KEY);

      // Reset state to empty data
      const emptyDailyData: DailyReportData = {
        header: {
          date: null,
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
          date: null,
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
    } catch (error) {
      console.error("Error clearing localStorage:", error);
    }
  };

  useEffect(() => {
    // migrateLocalStorageData();
    localStorage.removeItem(V1_SHARED_HEADER_KEY);
    localStorage.removeItem(V1_DAILY_REPORT_STORAGE_KEY);
    localStorage.removeItem(V1_WEEKLY_REPORT_STORAGE_KEY);
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
    <div className="relative p-4 pb-24 min-h-screen bg-background">
      <div className="fixed top-4 right-4 z-10">
        <ThemeToggle />
      </div>
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
