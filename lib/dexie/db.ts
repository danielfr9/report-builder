import Dexie, { type EntityTable } from "dexie";
import { Report } from "../schemas/report.schema";
import { Task } from "../schemas/tasks.schema";
import { Sprint } from "../schemas/sprint.schema";
import { Block } from "../schemas/block.schema";
import { Observation } from "../schemas/observation.schema";

const db = new Dexie("ReportsDatabase") as Dexie & {
  tasks: EntityTable<
    Task,
    "id" // primary key "id" (for the typings only)
  >;
  reports: EntityTable<
    Report,
    "id" // primary key "id" (for the typings only)
  >;
  sprints: EntityTable<
    Sprint,
    "id" // primary key "id" (for the typings only)
  >;
  observations: EntityTable<
    Observation,
    "id" // primary key "id" (for the typings only)
  >;
  blocks: EntityTable<
    Block,
    "id" // primary key "id" (for the typings only)
  >;
};

// Schema declaration:
db.version(1).stores({
  tasks: "++id, name, storyPoints, status, actionPlan, finishDate",
  reports: "++id, date, owner, name, hoursWorked, additionalNotes, type",
  sprints: "++id, startDate, endDate, name",
  observations: "++id, description",
  blocks: "++id, description",
});

export { db };
