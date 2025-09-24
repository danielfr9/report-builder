"use client";

import DailyReportScreen from "@/components/reports/daily-report-screen";
import WeeklyReportScreen from "@/components/reports/weekly-report-screen";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  V3_DAILY_REPORT_STORAGE_KEY,
  V3_WEEKLY_REPORT_STORAGE_KEY,
  V3_SHARED_HEADER_KEY,
  V2_SHARED_HEADER_KEY,
  V2_DAILY_REPORT_STORAGE_KEY,
  V2_WEEKLY_REPORT_STORAGE_KEY,
} from "@/lib/constants/localstorage-keys";
import {
  DailyReport,
  DailyReportLocalStorage,
} from "@/lib/interfaces/daily.interface";
import {
  ReportHeaderLocalStorage,
  ReportHeader,
} from "@/lib/interfaces/report-data.interface";
import {
  WeeklyReport,
  WeeklyReportLocalStorage,
} from "@/lib/interfaces/weekly.interface";
import { isToday, parseISO } from "date-fns";
import { CalendarIcon, ClockIcon } from "lucide-react";
import { useEffect, useState } from "react";

// interface PreviousDailyReportLocalStorageData
//   extends Omit<DailyReportLocalStorageData, "blocks" | "observations"> {
//   blocks: string[];
//   observations: string[];
// }

// interface PreviousWeeklyReportLocalStorageData
//   extends Omit<WeeklyReportLocalStorageData, "blocks" | "observations"> {
//   blocks: string[];
//   observations: string[];
// }

// const migrateLocalStorageData = () => {
//   const v2DailyData = localStorage.getItem(V3_DAILY_REPORT_STORAGE_KEY);
//   const v2WeeklyData = localStorage.getItem(V3_WEEKLY_REPORT_STORAGE_KEY);

//   const dailyData = localStorage.getItem(V1_DAILY_REPORT_STORAGE_KEY);
//   if (dailyData && !v2DailyData) {
//     const dailyDataObject: PreviousDailyReportLocalStorageData =
//       JSON.parse(dailyData);

//     // Blocks and observations are now arrays of objects
//     // We need to convert them to the new format
//     const blocks = dailyDataObject.blocks || [];
//     const observations = dailyDataObject.observations || [];

//     // We need to convert them to the new format
//     let timestamp = Date.now();
//     const newDailyData: DailyReportLocalStorageData = {
//       ...dailyDataObject,
//       blocks: blocks.map((block) => {
//         return {
//           id: (timestamp++).toString(),
//           name: block,
//         };
//       }),
//       observations: observations.map((observation) => ({
//         id: (timestamp++).toString(),
//         name: observation,
//       })),
//     };

//     try {
//       localStorage.setItem(
//         V3_DAILY_REPORT_STORAGE_KEY,
//         JSON.stringify(newDailyData)
//       );
//     } catch (error) {
//       console.error("Error saving daily data:", error);
//     }
//   }

//   const weeklyData = localStorage.getItem(V1_WEEKLY_REPORT_STORAGE_KEY);
//   if (weeklyData && !v2WeeklyData) {
//     const weeklyDataObject: PreviousWeeklyReportLocalStorageData =
//       JSON.parse(weeklyData);

//     const blocks = weeklyDataObject.blocks || [];
//     const observations = weeklyDataObject.observations || [];

//     let timestamp = Date.now();
//     const newWeeklyData: WeeklyReportLocalStorageData = {
//       ...weeklyDataObject,
//       blocks: blocks.map((block) => {
//         return {
//           id: (timestamp++).toString(),
//           name: block,
//         };
//       }),
//       observations: observations.map((observation) => ({
//         id: (timestamp++).toString(),
//         name: observation,
//       })),
//     };

//     try {
//       localStorage.setItem(
//         V3_WEEKLY_REPORT_STORAGE_KEY,
//         JSON.stringify(newWeeklyData)
//       );
//     } catch (error) {
//       console.error("Error saving weekly data:", error);
//     }
//   }
// };

export default function ReportBuilder() {
  const [reportType, setReportType] = useState<"daily" | "weekly">("daily");
  const [dailyData, setDailyData] = useState<DailyReport | null>(null);
  const [weeklyData, setWeeklyData] = useState<WeeklyReport | null>(null);

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
      const savedHeader = localStorage.getItem(V3_SHARED_HEADER_KEY);
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
      localStorage.setItem(V3_SHARED_HEADER_KEY, JSON.stringify(sharedHeader));
    } catch (error) {
      console.error("Error saving shared header to localStorage:", error);
    }
  };

  // Handle daily data changes
  const handleDailyDataChange = (data: DailyReport) => {
    const dataToSave: DailyReportLocalStorage = {
      header: formatHeaderData(data.header),
      tasks: data.tasks.map((task) => ({
        ...task,
        finishDate: task.finishDate?.toISOString() ?? null,
      })),
      blocks: data.blocks,
      observations: data.observations,
      hoursWorked: data.hoursWorked,
      additionalNotes: data.additionalNotes,
    };

    try {
      localStorage.setItem(
        V3_DAILY_REPORT_STORAGE_KEY,
        JSON.stringify(dataToSave)
      );
      saveSharedHeader(data.header);
      setDailyData(data);
    } catch (error) {
      console.error("Error saving daily data to localStorage:", error);
    }
  };

  // Handle weekly data changes
  const handleWeeklyDataChange = (data: WeeklyReport) => {
    const dataToSave: WeeklyReportLocalStorage = {
      header: formatHeaderData(data.header),
      tasks: data.tasks.map((task) => ({
        ...task,
        finishDate: task.finishDate?.toISOString() ?? null,
      })),
      blocks: data.blocks,
      observations: data.observations,
      hoursWorked: data.hoursWorked,
      additionalNotes: data.additionalNotes,
    };

    try {
      localStorage.setItem(
        V3_WEEKLY_REPORT_STORAGE_KEY,
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
      const savedDaily = localStorage.getItem(V3_DAILY_REPORT_STORAGE_KEY);
      if (savedDaily) {
        const dailyDataParsed: DailyReportLocalStorage = JSON.parse(savedDaily);
        const parsedHeader = parseHeaderData(dailyDataParsed.header);

        setDailyData({
          header: sharedHeader ?? parsedHeader,
          tasks:
            dailyDataParsed.tasks?.map((task) => ({
              ...task,
              finishDate: task.finishDate
                ? parseISO(task.finishDate)
                : new Date(),
            })) || [],
          blocks: dailyDataParsed.blocks || [],
          observations: dailyDataParsed.observations || [],
          hoursWorked: dailyDataParsed.hoursWorked || 8,
          additionalNotes: dailyDataParsed.additionalNotes || "",
        });
      } else {
        setDailyData({
          header: sharedHeader,
          tasks: [],
          blocks: [],
          observations: [],
          hoursWorked: 8,
          additionalNotes: "",
        });
      }

      // Load weekly data
      const savedWeekly = localStorage.getItem(V3_WEEKLY_REPORT_STORAGE_KEY);
      if (savedWeekly) {
        const weeklyDataParsed: WeeklyReportLocalStorage =
          JSON.parse(savedWeekly);
        const parsedHeader = parseHeaderData(weeklyDataParsed.header);

        setWeeklyData({
          header: sharedHeader ?? parsedHeader,
          tasks:
            weeklyDataParsed.tasks?.map((task) => ({
              ...task,
              finishDate: task.finishDate
                ? parseISO(task.finishDate)
                : new Date(),
            })) || [],
          blocks: weeklyDataParsed.blocks || [],
          observations: weeklyDataParsed.observations || [],
          hoursWorked: weeklyDataParsed.hoursWorked || 40,
          additionalNotes: weeklyDataParsed.additionalNotes || "",
        });
      } else {
        setWeeklyData({
          header: sharedHeader,
          tasks: [],
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
      localStorage.removeItem(V3_DAILY_REPORT_STORAGE_KEY);
      localStorage.removeItem(V3_WEEKLY_REPORT_STORAGE_KEY);
      localStorage.removeItem(V3_SHARED_HEADER_KEY);

      // Reset state to empty data
      const emptyDailyData: DailyReport = {
        header: {
          date: null,
          name: "",
          project: "",
          sprint: { from: null, to: null },
        },
        tasks: [],
        blocks: [],
        observations: [],
        hoursWorked: 8,
        additionalNotes: "",
      };

      const emptyWeeklyData: WeeklyReport = {
        header: {
          date: null,
          name: "",
          project: "",
          sprint: { from: null, to: null },
        },
        tasks: [],
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
    localStorage.removeItem(V2_SHARED_HEADER_KEY);
    localStorage.removeItem(V2_DAILY_REPORT_STORAGE_KEY);
    localStorage.removeItem(V2_WEEKLY_REPORT_STORAGE_KEY);
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
      <div className="flex justify-end items-center">
        <Button variant="outline" size="icon" className="rounded-full">
          <a
            href="https://github.com/danielfr9/report-builder"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2"
            aria-label="GitHub Repository"
          >
            <svg
              className="w-4 h-4"
              role="img"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <title>GitHub</title>
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
          </a>
        </Button>
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
      <div className="my-3 bg-background border border-foreground/10 rounded-full p-4 shadow-md w-fit px-10 mx-auto">
        <span className="text-sm text-muted-foreground">
          Made with ❤️ by{" "}
          <a
            href="https://github.com/danielfr9"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary"
          >
            danielfr9
          </a>
        </span>
      </div>
      <div className="my-3 p-2 w-fit mx-auto">
        <span className="text-sm text-muted-foreground">
          <a
            href="https://ko-fi.com/Y8Y61LS3U4"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              height="36"
              className="h-9 border-none"
              src="https://storage.ko-fi.com/cdn/kofi3.png?v=6"
              alt="Buy Me a Coffee at ko-fi.com"
            />
          </a>
        </span>
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
          <Separator orientation="vertical" className="h-10" />
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
