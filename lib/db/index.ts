// db.ts
import Dexie, { type EntityTable } from "dexie";
import type {
  DailyReportMeta,
  DailyTask,
  DailyPendingTask,
} from "./models/daily";
import type { Block, Observation } from "./models/common";
import {
  WeeklyPendingTask,
  WeeklyReportMeta,
  WeeklyTask,
} from "./models/weekly";

const db = new Dexie("ProjectDB") as Dexie & {
  // Daily report stores
  dailyReports: EntityTable<DailyReportMeta, "id">;
  dailyCompletedTasks: EntityTable<DailyTask, "id">;
  dailyPendingTasks: EntityTable<DailyPendingTask, "id">;

  // Weekly report stores
  weeklyReports: EntityTable<WeeklyReportMeta, "id">;
  weeklyCompletedTasks: EntityTable<WeeklyTask, "id">;
  weeklyPendingTasks: EntityTable<WeeklyPendingTask, "id">;

  // Shared
  blocks: EntityTable<Block, "id">;
  observations: EntityTable<Observation, "id">;
};

// Esquema de tablas
db.version(1).stores({
  dailyReports: "++id, date, name, project",
  dailyCompletedTasks: "++id, reportId",
  dailyPendingTasks: "++id, reportId",
  blocks: "++id, reportId",
  observations: "++id, reportId",
});

export { db };
