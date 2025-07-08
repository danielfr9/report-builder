"use client";

import DailyReportScreen from "@/components/reports/daily-report-screen";
import ModalReportsList from "@/components/reports/modal-reports-list";
import WeeklyReportScreen from "@/components/reports/weekly-report-screen";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import {
  createReportAction,
  updateReportAction,
} from "@/lib/actions/reports.action";
import {
  V3_DAILY_REPORT_STORAGE_KEY,
  V3_WEEKLY_REPORT_STORAGE_KEY,
  V3_SHARED_HEADER_KEY,
  CURRENT_DAILY_REPORT_KEY,
  CURRENT_WEEKLY_REPORT_KEY,
} from "@/lib/constants/localstorage-keys";
import { REPORT_STATUS } from "@/lib/constants/report-status";
import { REPORT_TYPE } from "@/lib/constants/report-type";
import { getReportById } from "@/lib/dexie/dao/reports";
import {
  formatDailyReport,
  formatWeeklyReport,
} from "@/lib/localstorage/format-parsers";
import {
  getCurrentDailyReport,
  getCurrentWeeklyReport,
  removeCurrentDailyReport,
  removeCurrentWeeklyReport,
} from "@/lib/localstorage/manager";
import {
  DraftDailyReport,
  ReportDto,
  DraftWeeklyReport,
  DailyReport,
  WeeklyReport,
  CreateReport,
} from "@/lib/schemas/report.schema";

import { CalendarIcon, ClockIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ReportBuilder() {
  const [reportType, setReportType] = useState<"daily" | "weekly">("daily");
  const [dailyData, setDailyData] = useState<DailyReport | null>(null);
  const [weeklyData, setWeeklyData] = useState<WeeklyReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Scroll to the top of the page
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Handle daily data changes
  const handleDailyDataChange = useDebouncedCallback((data: DailyReport) => {
    if (data.status === REPORT_STATUS.ARCHIVED) {
      return;
    }

    const dataToSave = formatDailyReport(data as DraftDailyReport);

    try {
      localStorage.setItem(
        CURRENT_DAILY_REPORT_KEY,
        JSON.stringify(dataToSave)
      );
      updateReportAction(data);
      setDailyData(data);
    } catch (error) {
      console.error("Error saving daily data to localStorage:", error);
    }
  }, 500);

  // Handle weekly data changes
  const handleWeeklyDataChange = useDebouncedCallback((data: WeeklyReport) => {
    if (data.status === REPORT_STATUS.ARCHIVED) {
      return;
    }

    const dataToSave = formatWeeklyReport(data as DraftWeeklyReport);

    try {
      localStorage.setItem(
        CURRENT_WEEKLY_REPORT_KEY,
        JSON.stringify(dataToSave)
      );
      updateReportAction(data);
      setWeeklyData(data);
    } catch (error) {
      console.error("Error saving weekly data to localStorage:", error);
    }
  }, 500);

  const createNewDailyReport = async () => {
    // Create a new report and set it as the current report
    const newReport: CreateReport = {
      type: REPORT_TYPE.DAILY,
      owner: "",
      name: "",
      additionalNotes: "",
      date: new Date(),
      hoursWorked: 8,
      status: REPORT_STATUS.DRAFT,
      sprintId: null,
      tasks: [],
      observations: [],
      blocks: [],
    };
    const response = await createReportAction(newReport);
    if (response.success) {
      setDailyData(response.data as DailyReport);

      const formattedReport = formatDailyReport(
        response.data as DraftDailyReport
      );

      localStorage.setItem(
        CURRENT_DAILY_REPORT_KEY,
        JSON.stringify(formattedReport)
      );
    } else {
      toast.error(response.error);
    }
  };

  const createNewWeeklyReport = async () => {
    // Create a new report and set it as the current report
    const newReport: CreateReport = {
      type: REPORT_TYPE.WEEKLY,
      owner: "",
      name: "",
      additionalNotes: "",
      date: new Date(),
      hoursWorked: 8,
      status: REPORT_STATUS.DRAFT,
      sprintId: null,
      tasks: [],
      observations: [],
      blocks: [],
    };
    const response = await createReportAction(newReport);
    if (response.success) {
      setWeeklyData(response.data as WeeklyReport);

      const formattedReport = formatWeeklyReport(
        response.data as DraftWeeklyReport
      );
      localStorage.setItem(
        CURRENT_WEEKLY_REPORT_KEY,
        JSON.stringify(formattedReport)
      );
    } else {
      toast.error(response.error);
    }
  };

  // Load the current daily report
  const loadDailyReport = async () => {
    const currentDailyReport = getCurrentDailyReport();

    if (currentDailyReport) {
      const item = await getReportById(currentDailyReport.id);

      if (!item) {
        removeCurrentDailyReport();
        await createNewDailyReport();
        return;
      }

      setDailyData(currentDailyReport);
      return;
    }

    await createNewDailyReport();
  };

  // Load the current weekly report
  const loadWeeklyReport = async () => {
    const currentWeeklyReport = getCurrentWeeklyReport();
    if (currentWeeklyReport) {
      const item = await getReportById(currentWeeklyReport.id);
      if (!item) {
        removeCurrentWeeklyReport();
        await createNewWeeklyReport();
        return;
      }

      setWeeklyData(currentWeeklyReport);
      return;
    }

    await createNewWeeklyReport();
  };

  // Load the current draft reports
  const loadData = async () => {
    setIsLoading(true);

    // Get the current draft reports
    await loadDailyReport();
    await loadWeeklyReport();

    setIsLoading(false);
  };

  // When a report is selected on the reports list, set the current report to it
  const handleViewReport = (report: ReportDto) => {
    if (report.type === "daily") {
      setDailyData({
        ...report,
        type: "daily",
      });
      setReportType("daily");
      scrollToTop();
    } else {
      setWeeklyData({
        ...report,
        type: "weekly",
      });
      setReportType("weekly");
      scrollToTop();
    }
  };

  // When a report is deleted, update the current report to null (if applicable)
  const onReportDeleted = (reports: ReportDto[]) => {
    // Check if the current report is in the reports deleted
    const ids = reports.map((r) => r.id);

    if (ids.some((id) => id === dailyData?.id)) {
      removeCurrentDailyReport();

      setDailyData(null);
      createNewDailyReport();
    }
    if (ids.some((id) => id === weeklyData?.id)) {
      removeCurrentWeeklyReport();
      setWeeklyData(null);
      createNewWeeklyReport();
    }
  };

  const handleArchiveReport = async (data: DailyReport | WeeklyReport) => {
    if (data.type === REPORT_TYPE.DAILY) {
      setDailyData(null);
      await createNewDailyReport();
    } else {
      setWeeklyData(null);
      await createNewWeeklyReport();
    }
  };

  const handleNewReport = () => {
    if (reportType === "daily") {
      loadDailyReport();
    } else {
      loadWeeklyReport();
    }
  };

  useEffect(() => {
    localStorage.removeItem(V3_SHARED_HEADER_KEY);
    localStorage.removeItem(V3_DAILY_REPORT_STORAGE_KEY);
    localStorage.removeItem(V3_WEEKLY_REPORT_STORAGE_KEY);
    loadData();
  }, []);

  // Show loading state while data is being loaded
  if (isLoading) {
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
      <div className={`${reportType === "daily" ? "block" : "hidden"}`}>
        <DailyReportScreen
          key={dailyData?.id ?? "new-daily"}
          initialData={dailyData}
          onDataChange={handleDailyDataChange}
          onArchiveReport={handleArchiveReport}
          onNewReport={handleNewReport}
        />
      </div>
      <div className={`${reportType === "weekly" ? "block" : "hidden"}`}>
        <WeeklyReportScreen
          key={weeklyData?.id ?? "new-weekly"}
          initialData={weeklyData}
          onDataChange={handleWeeklyDataChange}
          onArchiveReport={handleArchiveReport}
          onNewReport={handleNewReport}
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
          <Separator orientation="vertical" className="h-10" />
          <ThemeToggle />
          <ModalReportsList
            onReportClick={handleViewReport}
            onDeleteReports={onReportDeleted}
          />
        </div>
      </div>
    </div>
  );
}
