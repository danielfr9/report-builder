// db.ts
import Dexie, { type EntityTable } from "dexie";

import type {
  DailyReportMeta,
  DailyTask,
  DailyPendingTask,
} from "./models/daily";

import type {
  WeeklyReportMeta,
  WeeklyTask,
  WeeklyPendingTask,
} from "./models/weekly";

import type { Block, Observation } from "./models/common";

// Declaración con tipado moderno
const db = new Dexie("ProjectDB") as Dexie & {
  // Daily
  dailyReports: EntityTable<DailyReportMeta, "id">;
  dailyCompletedTasks: EntityTable<DailyTask, "id">;
  dailyPendingTasks: EntityTable<DailyPendingTask, "id">;

  // Weekly
  weeklyReports: EntityTable<WeeklyReportMeta, "id">;
  weeklyCompletedTasks: EntityTable<WeeklyTask, "id">;
  weeklyPendingTasks: EntityTable<WeeklyPendingTask, "id">;

  // Shared
  blocks: EntityTable<Block, "id">;
  observations: EntityTable<Observation, "id">;
};

// Definición de índices (runtime)
db.version(1).stores({
  // Daily
  dailyReports:
    "++id, date, name, project, sprintFrom, sprintTo, [sprintFrom+sprintTo], lastModified",
  dailyCompletedTasks: "++id, reportId",
  dailyPendingTasks: "++id, reportId",

  // Weekly
  weeklyReports:
    "++id, date, name, project, sprintFrom, sprintTo, [sprintFrom+sprintTo], lastModified",
  weeklyCompletedTasks: "++id, reportId",
  weeklyPendingTasks: "++id, reportId",

  // Compartidos
  blocks: "++id, reportId",
  observations: "++id, reportId",
});

export { db };
