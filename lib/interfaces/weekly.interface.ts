import { Block } from "./block.interface";
import { Observation } from "./observation.interface";
import {
  ReportHeader,
  ReportHeaderLocalStorage,
} from "./report-data.interface";
import { Task } from "./task.inteface";

type WeeklyTaskLocalStorage = Omit<Task, "finishDate"> & {
  finishDate: string | null;
};

export interface WeeklyReport {
  header: ReportHeader;
  tasks: Task[];
  blocks: Block[];
  observations: Observation[];
  hoursWorked: number;
  additionalNotes: string;
}

export interface WeeklyReportLocalStorage {
  header?: ReportHeaderLocalStorage;
  tasks?: WeeklyTaskLocalStorage[];
  blocks?: Block[];
  observations?: Observation[];
  hoursWorked?: number;
  additionalNotes?: string;
}
