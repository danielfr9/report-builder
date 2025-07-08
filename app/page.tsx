"use client";

import DailyReportScreen from "@/components/reports/daily-report-screen";
import ModalReportsList from "@/components/reports/modal-reports-list";
import WeeklyReportScreen from "@/components/reports/weekly-report-screen";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { createReportAction } from "@/lib/actions/reports";
import {
  V3_DAILY_REPORT_STORAGE_KEY,
  V3_WEEKLY_REPORT_STORAGE_KEY,
  V3_SHARED_HEADER_KEY,
  CURRENT_DAILY_REPORT_KEY,
  CURRENT_WEEKLY_REPORT_KEY,
} from "@/lib/constants/localstorage-keys";
import { REPORT_STATUS } from "@/lib/constants/report-status";
import { REPORT_TYPE } from "@/lib/constants/report-type";
import {
  LocalStorageDailyReport,
  LocalStorageWeeklyReport,
} from "@/lib/interfaces/localstorage.interface";
import {
  formatDailyReport,
  formatWeeklyReport,
} from "@/lib/localstorage/parsers";
import {
  DraftDailyReport,
  ReportDto,
  ReportDtoSchema,
  DraftWeeklyReport,
  DailyReport,
  WeeklyReport,
  CreateReport,
} from "@/lib/schemas/report.schema";

import { parseISO } from "date-fns";
import { CalendarIcon, ClockIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ReportBuilder() {
  const [reportType, setReportType] = useState<"daily" | "weekly">("daily");
  const [dailyData, setDailyData] = useState<DailyReport | null>(null);
  const [weeklyData, setWeeklyData] = useState<WeeklyReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Handle daily data changes
  const handleDailyDataChange = (data: DailyReport) => {
    if (data.status === REPORT_STATUS.ARCHIVED) {
      return;
    }

    const dataToSave = formatDailyReport(data as DraftDailyReport);

    try {
      localStorage.setItem(
        CURRENT_DAILY_REPORT_KEY,
        JSON.stringify(dataToSave)
      );
      setDailyData(data);
    } catch (error) {
      console.error("Error saving daily data to localStorage:", error);
    }
  };

  const handleWeeklyDataChange = (data: WeeklyReport) => {
    if (data.status === REPORT_STATUS.ARCHIVED) {
      return;
    }

    const dataToSave = formatWeeklyReport(data as DraftWeeklyReport);

    try {
      localStorage.setItem(
        CURRENT_WEEKLY_REPORT_KEY,
        JSON.stringify(dataToSave)
      );
      setWeeklyData(data);
    } catch (error) {
      console.error("Error saving weekly data to localStorage:", error);
    }
  };

  const loadDailyReport = async () => {
    const currentDailyReport = localStorage.getItem(CURRENT_DAILY_REPORT_KEY);
    if (currentDailyReport) {
      // Parse the current report to an object
      const rawReport = JSON.parse(
        currentDailyReport
      ) as LocalStorageDailyReport;

      // Validate the report
      const validReport = ReportDtoSchema.omit({
        id: true,
        date: true,
      }).safeParse(rawReport);

      // If the report is valid, load the report
      if (validReport.success) {
        const report: ReportDto = {
          ...validReport.data,
          date: parseISO(rawReport.date),
          id: "",
        };

        // Set the daily data
        setDailyData({
          ...report,
          type: REPORT_TYPE.DAILY,
        });
      }
    } else {
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
      } else {
        toast.error(response.error);
      }
    }
  };

  const loadWeeklyReport = async () => {
    const currentWeeklyReport = localStorage.getItem(CURRENT_WEEKLY_REPORT_KEY);
    if (currentWeeklyReport) {
      const rawReport = JSON.parse(
        currentWeeklyReport
      ) as LocalStorageWeeklyReport;
      const validReport = ReportDtoSchema.omit({
        id: true,
        date: true,
      }).safeParse(rawReport);
      if (validReport.success) {
        const report: ReportDto = {
          ...validReport.data,
          date: parseISO(rawReport.date),
          id: "",
        };
        setWeeklyData({
          ...report,
          type: REPORT_TYPE.WEEKLY,
        });
      }
    } else {
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
      } else {
        toast.error(response.error);
      }
    }
  };

  const loadData = async () => {
    setIsLoading(true);

    // Get the current draft reports
    await loadDailyReport();
    await loadWeeklyReport();

    setIsLoading(false);
  };

  const handleViewReport = (report: ReportDto) => {
    console.log("report", report);
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

  const handleDeleteReport = (reports: ReportDto[]) => {
    // Check if the current report is in the reports deleted
    const ids = reports.map((r) => r.id);

    if (ids.some((id) => id === dailyData?.id)) {
      setDailyData(null);
    }
    if (ids.some((id) => id === weeklyData?.id)) {
      setWeeklyData(null);
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
        />
      </div>
      <div className={`${reportType === "weekly" ? "block" : "hidden"}`}>
        <WeeklyReportScreen
          key={weeklyData?.id ?? "new-weekly"}
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
          <Separator orientation="vertical" className="h-10" />
          <ThemeToggle />
          <ModalReportsList
            onReportClick={handleViewReport}
            onDeleteReports={handleDeleteReport}
          />
        </div>
      </div>
    </div>
  );
}
