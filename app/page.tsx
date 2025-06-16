"use client";

import DailyReportScreen from "@/components/reports/daily-report-screen";
import WeeklyReportScreen from "@/components/reports/weekly-report-screen";
import { Button } from "@/components/ui/button";
import {
  DAILY_REPORT_STORAGE_KEY,
  LOCAL_STORAGE_DATA_VERSION_KEY,
  V2_DAILY_REPORT_STORAGE_KEY,
  V2_WEEKLY_REPORT_STORAGE_KEY,
  WEEKLY_REPORT_STORAGE_KEY,
} from "@/lib/constants/localstorage-keys";
import { LOCAL_STORAGE_VERSION } from "@/lib/constants/versions";
import {
  DailyReportLocalStorageData,
  WeeklyReportLocalStorageData,
} from "@/lib/interfaces/report-data.interface";
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
  const version = localStorage.getItem(LOCAL_STORAGE_DATA_VERSION_KEY);

  if (version === LOCAL_STORAGE_VERSION) {
    console.log("Local storage version is up to date");
    return;
  }

  console.log("Migrating local storage data");

  const dailyData = localStorage.getItem(DAILY_REPORT_STORAGE_KEY);
  if (dailyData) {
    const dailyDataObject: PreviousDailyReportLocalStorageData =
      JSON.parse(dailyData);

    // Blocks and observations are now arrays of objects
    // We need to convert them to the new format
    const blocks = dailyDataObject.blocks || [];
    const observations = dailyDataObject.observations || [];

    // We need to convert them to the new format
    const newDailyData: DailyReportLocalStorageData = {
      ...dailyDataObject,
      blocks: blocks.map((block) => ({
        id: Date.now().toString(),
        name: block,
      })),
      observations: observations.map((observation) => ({
        id: Date.now().toString(),
        name: observation,
      })),
    };

    localStorage.setItem(
      V2_DAILY_REPORT_STORAGE_KEY,
      JSON.stringify(newDailyData)
    );
  }

  const weeklyData = localStorage.getItem(WEEKLY_REPORT_STORAGE_KEY);
  if (weeklyData) {
    const weeklyDataObject: PreviousWeeklyReportLocalStorageData =
      JSON.parse(weeklyData);

    const blocks = weeklyDataObject.blocks || [];
    const observations = weeklyDataObject.observations || [];

    const newWeeklyData: WeeklyReportLocalStorageData = {
      ...weeklyDataObject,
      blocks: blocks.map((block) => ({
        id: Date.now().toString(),
        name: block,
      })),
      observations: observations.map((observation) => ({
        id: Date.now().toString(),
        name: observation,
      })),
    };

    localStorage.setItem(
      V2_WEEKLY_REPORT_STORAGE_KEY,
      JSON.stringify(newWeeklyData)
    );
  }

  localStorage.setItem(LOCAL_STORAGE_DATA_VERSION_KEY, LOCAL_STORAGE_VERSION);
};

export default function ReportBuilder() {
  const [reportType, setReportType] = useState<"daily" | "weekly">("daily");

  useEffect(() => {
    migrateLocalStorageData();
  }, []);

  return (
    <div className="relative pb-24">
      <div className={`${reportType === "daily" ? "block" : "hidden"}`}>
        <DailyReportScreen />
      </div>
      <div className={`${reportType === "weekly" ? "block" : "hidden"}`}>
        <WeeklyReportScreen />
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
