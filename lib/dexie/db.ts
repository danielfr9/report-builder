import Dexie, { type EntityTable } from "dexie";
import { ReportModel } from "./models/report";
import { TaskModel } from "./models/task";
import { SprintModel } from "./models/sprint";
import { BlockModel } from "./models/block";
import { ObservationModel } from "./models/observation";

const db = new Dexie("ReportsDatabase") as Dexie & {
  tasks: EntityTable<
    TaskModel,
    "id" // primary key "id" (for the typings only)
  >;
  reports: EntityTable<
    ReportModel,
    "id" // primary key "id" (for the typings only)
  >;
  sprints: EntityTable<
    SprintModel,
    "id" // primary key "id" (for the typings only)
  >;
  observations: EntityTable<
    ObservationModel,
    "id" // primary key "id" (for the typings only)
  >;
  blocks: EntityTable<
    BlockModel,
    "id" // primary key "id" (for the typings only)
  >;
};

// Schema declaration:
db.version(1).stores({
  tasks: "++id, reportId, name, storyPoints, status, actionPlan, finishDate",
  reports: "++id, date, owner, name, additionalNotes, type, sprintId, status",
  sprints: "++id, startDate, endDate, name",
  observations: "++id, reportId, description",
  blocks: "++id, reportId, description",
});

export { db };
