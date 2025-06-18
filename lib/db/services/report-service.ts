import { db } from "..";
import {
  DailyReportData,
  WeeklyReportData,
  ReportHeader,
  DailyTask,
  DailyObservation,
  WeeklyTask,
  WeeklyObservation,
} from "@/lib/interfaces/report-data.interface";
import { DailyReportMeta } from "../models/daily";
import { WeeklyReportMeta } from "../models/weekly";
import { format, parseISO } from "date-fns";

/**
 * Service layer that bridges between UI interfaces and Dexie.js database
 * Handles date conversions and data transformations
 */

// Helper functions for date conversion
const dateToString = (date: Date | null): string => {
  return date ? format(date, "yyyy-MM-dd") : "";
};

const stringToDate = (dateStr: string | null): Date | null => {
  return dateStr ? parseISO(dateStr) : null;
};

// Convert UI ReportHeader to DB format
const headerToDb = (header: ReportHeader) => ({
  date: dateToString(header.date),
  name: header.name,
  project: header.project,
  sprint: {
    from: dateToString(header.sprint.from),
    to: dateToString(header.sprint.to),
  },
  sprintFrom: dateToString(header.sprint.from),
  sprintTo: dateToString(header.sprint.to),
});

// Convert DB format to UI ReportHeader
const headerFromDb = (dbData: {
  date: string;
  name: string;
  project: string;
  sprint: { from: string; to: string };
}): ReportHeader => ({
  date: stringToDate(dbData.date),
  name: dbData.name,
  project: dbData.project,
  sprint: {
    from: stringToDate(dbData.sprint.from),
    to: stringToDate(dbData.sprint.to),
  },
});

/**
 * Daily Report Service
 */
export class DailyReportService {
  /**
   * Save daily report to IndexedDB
   */
  static async save(data: DailyReportData): Promise<number> {
    const headerDb = headerToDb(data.header);

    const reportId = await db.dailyReports.add({
      ...headerDb,
      hoursWorked: data.hoursWorked,
      additionalNotes: data.additionalNotes,
      lastModified: new Date().toISOString(),
    });

    if (!reportId) throw new Error("Failed to save daily report");

    // Save related data with reportId
    await Promise.all([
      db.dailyCompletedTasks.bulkAdd(
        data.completedTasks.map((task) => ({
          ...task,
          reportId,
        }))
      ),
      db.dailyPendingTasks.bulkAdd(
        data.pendingTasks.map((task) => ({
          ...task,
          reportId,
        }))
      ),
      db.blocks.bulkAdd(
        data.blocks.map((block) => ({
          ...block,
          reportId,
        }))
      ),
      db.observations.bulkAdd(
        data.observations.map((obs) => ({
          id: obs.id,
          name: obs.name,
          reportId,
        }))
      ),
    ]);

    return reportId;
  }

  /**
   * Load daily report by ID
   */
  static async load(reportId: number): Promise<DailyReportData | null> {
    const report = await db.dailyReports.get(reportId);
    if (!report) return null;

    const [completedTasks, pendingTasks, blocks, observations] =
      await Promise.all([
        db.dailyCompletedTasks.where("reportId").equals(reportId).toArray(),
        db.dailyPendingTasks.where("reportId").equals(reportId).toArray(),
        db.blocks.where("reportId").equals(reportId).toArray(),
        db.observations.where("reportId").equals(reportId).toArray(),
      ]);

    return {
      header: headerFromDb(report),
      completedTasks: completedTasks.map(
        (task): DailyTask => ({
          id: task.id,
          name: task.name,
          storyPoints: task.storyPoints,
          status: task.status as DailyTask["status"],
          comments: task.comments,
        })
      ),
      pendingTasks,
      blocks,
      observations: observations.map(
        (obs): DailyObservation => ({
          id: obs.id || "",
          name: obs.name || "",
        })
      ),
      hoursWorked: report.hoursWorked,
      additionalNotes: report.additionalNotes,
    };
  }

  /**
   * Update existing daily report
   */
  static async update(reportId: number, data: DailyReportData): Promise<void> {
    const headerDb = headerToDb(data.header);

    // Update main report
    await db.dailyReports.update(reportId, {
      ...headerDb,
      hoursWorked: data.hoursWorked,
      additionalNotes: data.additionalNotes,
      lastModified: new Date().toISOString(),
    });

    // Delete existing related data
    await Promise.all([
      db.dailyCompletedTasks.where("reportId").equals(reportId).delete(),
      db.dailyPendingTasks.where("reportId").equals(reportId).delete(),
      db.blocks.where("reportId").equals(reportId).delete(),
      db.observations.where("reportId").equals(reportId).delete(),
    ]);

    // Insert updated related data
    await Promise.all([
      db.dailyCompletedTasks.bulkAdd(
        data.completedTasks.map((task) => ({ ...task, reportId }))
      ),
      db.dailyPendingTasks.bulkAdd(
        data.pendingTasks.map((task) => ({ ...task, reportId }))
      ),
      db.blocks.bulkAdd(data.blocks.map((block) => ({ ...block, reportId }))),
      db.observations.bulkAdd(
        data.observations.map((obs) => ({ ...obs, reportId }))
      ),
    ]);
  }

  /**
   * Delete daily report
   */
  static async delete(reportId: number): Promise<void> {
    await Promise.all([
      db.dailyReports.delete(reportId),
      db.dailyCompletedTasks.where("reportId").equals(reportId).delete(),
      db.dailyPendingTasks.where("reportId").equals(reportId).delete(),
      db.blocks.where("reportId").equals(reportId).delete(),
      db.observations.where("reportId").equals(reportId).delete(),
    ]);
  }

  /**
   * Get all daily reports metadata
   */
  static async getAllMeta(): Promise<DailyReportMeta[]> {
    return await db.dailyReports.orderBy("lastModified").reverse().toArray();
  }

  /**
   * Get latest daily report (most recently modified)
   */
  static async getLatest(): Promise<DailyReportData | null> {
    const latest = await db.dailyReports
      .orderBy("lastModified")
      .reverse()
      .first();

    if (!latest?.id) return null;
    return this.load(latest.id);
  }
}

/**
 * Weekly Report Service
 */
export class WeeklyReportService {
  /**
   * Save weekly report to IndexedDB
   */
  static async save(data: WeeklyReportData): Promise<number> {
    const headerDb = headerToDb(data.header);

    const reportId = await db.weeklyReports.add({
      ...headerDb,
      hoursWorked: data.hoursWorked,
      additionalNotes: data.additionalNotes,
      lastModified: new Date().toISOString(),
    });

    if (!reportId) throw new Error("Failed to save weekly report");

    // Save related data with reportId
    await Promise.all([
      db.weeklyCompletedTasks.bulkAdd(
        data.completedTasks.map((task) => ({
          ...task,
          finishDate: task.finishDate ? task.finishDate.toISOString() : null,
          reportId,
        }))
      ),
      db.weeklyPendingTasks.bulkAdd(
        data.pendingTasks.map((task) => ({
          ...task,
          reportId,
        }))
      ),
      db.blocks.bulkAdd(
        data.blocks.map((block) => ({
          ...block,
          reportId,
        }))
      ),
      db.observations.bulkAdd(
        data.observations.map((obs) => ({
          id: obs.id,
          name: obs.name,
          reportId,
        }))
      ),
    ]);

    return reportId;
  }

  /**
   * Load weekly report by ID
   */
  static async load(reportId: number): Promise<WeeklyReportData | null> {
    const report = await db.weeklyReports.get(reportId);
    if (!report) return null;

    const [completedTasks, pendingTasks, blocks, observations] =
      await Promise.all([
        db.weeklyCompletedTasks.where("reportId").equals(reportId).toArray(),
        db.weeklyPendingTasks.where("reportId").equals(reportId).toArray(),
        db.blocks.where("reportId").equals(reportId).toArray(),
        db.observations.where("reportId").equals(reportId).toArray(),
      ]);

    return {
      header: headerFromDb(report),
      completedTasks: completedTasks.map(
        (task): WeeklyTask => ({
          id: task.id,
          name: task.name,
          storyPoints: task.storyPoints,
          status: task.status as WeeklyTask["status"],
          comments: task.comments,
          finishDate: task.finishDate ? parseISO(task.finishDate) : null,
        })
      ),
      pendingTasks,
      blocks,
      observations: observations.map(
        (obs): WeeklyObservation => ({
          id: obs.id || "",
          name: obs.name || "",
        })
      ),
      hoursWorked: report.hoursWorked,
      additionalNotes: report.additionalNotes,
    };
  }

  /**
   * Update existing weekly report
   */
  static async update(reportId: number, data: WeeklyReportData): Promise<void> {
    const headerDb = headerToDb(data.header);

    // Update main report
    await db.weeklyReports.update(reportId, {
      ...headerDb,
      hoursWorked: data.hoursWorked,
      additionalNotes: data.additionalNotes,
      lastModified: new Date().toISOString(),
    });

    // Delete existing related data
    await Promise.all([
      db.weeklyCompletedTasks.where("reportId").equals(reportId).delete(),
      db.weeklyPendingTasks.where("reportId").equals(reportId).delete(),
      db.blocks.where("reportId").equals(reportId).delete(),
      db.observations.where("reportId").equals(reportId).delete(),
    ]);

    // Insert updated related data
    await Promise.all([
      db.weeklyCompletedTasks.bulkAdd(
        data.completedTasks.map((task) => ({
          ...task,
          finishDate: task.finishDate ? task.finishDate.toISOString() : null,
          reportId,
        }))
      ),
      db.weeklyPendingTasks.bulkAdd(
        data.pendingTasks.map((task) => ({ ...task, reportId }))
      ),
      db.blocks.bulkAdd(data.blocks.map((block) => ({ ...block, reportId }))),
      db.observations.bulkAdd(
        data.observations.map((obs) => ({ ...obs, reportId }))
      ),
    ]);
  }

  /**
   * Delete weekly report
   */
  static async delete(reportId: number): Promise<void> {
    await Promise.all([
      db.weeklyReports.delete(reportId),
      db.weeklyCompletedTasks.where("reportId").equals(reportId).delete(),
      db.weeklyPendingTasks.where("reportId").equals(reportId).delete(),
      db.blocks.where("reportId").equals(reportId).delete(),
      db.observations.where("reportId").equals(reportId).delete(),
    ]);
  }

  /**
   * Get all weekly reports metadata
   */
  static async getAllMeta(): Promise<WeeklyReportMeta[]> {
    return await db.weeklyReports.orderBy("lastModified").reverse().toArray();
  }

  /**
   * Get latest weekly report (most recently modified)
   */
  static async getLatest(): Promise<WeeklyReportData | null> {
    const latest = await db.weeklyReports
      .orderBy("lastModified")
      .reverse()
      .first();

    if (!latest?.id) return null;
    return this.load(latest.id);
  }
}

/**
 * Migration utilities
 */
export class MigrationService {
  /**
   * Migrate data from localStorage to IndexedDB
   */
  static async migrateFromLocalStorage(): Promise<void> {
    try {
      // Check if migration already done
      const existingDaily = await db.dailyReports.count();
      const existingWeekly = await db.weeklyReports.count();

      if (existingDaily > 0 || existingWeekly > 0) {
        console.log("IndexedDB already contains data, skipping migration");
        return;
      }

      // Migrate daily report if exists
      const dailyData = localStorage.getItem("V2_DAILY_REPORT_STORAGE_KEY");
      if (dailyData) {
        const parsed = JSON.parse(dailyData);
        // Convert localStorage format to UI format
        const dailyReportData: DailyReportData = {
          header: {
            date: parsed.header?.date
              ? parseISO(parsed.header.date)
              : new Date(),
            name: parsed.header?.name || "",
            project: parsed.header?.project || "",
            sprint: {
              from: parsed.header?.sprint?.from
                ? parseISO(parsed.header.sprint.from)
                : null,
              to: parsed.header?.sprint?.to
                ? parseISO(parsed.header.sprint.to)
                : null,
            },
          },
          completedTasks: parsed.completedTasks || [],
          pendingTasks: parsed.pendingTasks || [],
          blocks: parsed.blocks || [],
          observations: parsed.observations || [],
          hoursWorked: parsed.hoursWorked || 8,
          additionalNotes: parsed.additionalNotes || "",
        };

        await DailyReportService.save(dailyReportData);
        console.log("Daily report migrated to IndexedDB");
      }

      // Migrate weekly report if exists
      const weeklyData = localStorage.getItem("V2_WEEKLY_REPORT_STORAGE_KEY");
      if (weeklyData) {
        const parsed = JSON.parse(weeklyData);
        // Convert localStorage format to UI format
        const weeklyReportData: WeeklyReportData = {
          header: {
            date: parsed.header?.date
              ? parseISO(parsed.header.date)
              : new Date(),
            name: parsed.header?.name || "",
            project: parsed.header?.project || "",
            sprint: {
              from: parsed.header?.sprint?.from
                ? parseISO(parsed.header.sprint.from)
                : null,
              to: parsed.header?.sprint?.to
                ? parseISO(parsed.header.sprint.to)
                : null,
            },
          },
          completedTasks: (parsed.completedTasks || []).map((task: any) => ({
            ...task,
            finishDate: task.finishDate ? parseISO(task.finishDate) : null,
          })),
          pendingTasks: parsed.pendingTasks || [],
          blocks: parsed.blocks || [],
          observations: parsed.observations || [],
          hoursWorked: parsed.hoursWorked || 40,
          additionalNotes: parsed.additionalNotes || "",
        };

        await WeeklyReportService.save(weeklyReportData);
        console.log("Weekly report migrated to IndexedDB");
      }

      console.log("Migration from localStorage to IndexedDB completed");
    } catch (error) {
      console.error("Error during migration:", error);
    }
  }

  /**
   * Clear all data from IndexedDB
   */
  static async clearAll(): Promise<void> {
    await Promise.all([
      db.dailyReports.clear(),
      db.dailyCompletedTasks.clear(),
      db.dailyPendingTasks.clear(),
      db.weeklyReports.clear(),
      db.weeklyCompletedTasks.clear(),
      db.weeklyPendingTasks.clear(),
      db.blocks.clear(),
      db.observations.clear(),
    ]);
  }
}
