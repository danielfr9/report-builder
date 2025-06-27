import { Block } from "./block.interface";
import { Observation } from "./observation.interface";
import {
  ReportHeader,
  ReportHeaderLocalStorage,
} from "./report-data.interface";
import { Task } from "./task.inteface";

type DailyTaskLocalStorage = Omit<Task, "finishDate"> & {
  finishDate: string | null;
};

export interface DailyReport {
  header: ReportHeader;
  tasks: Task[];
  blocks: Block[];
  observations: Observation[];
  hoursWorked: number;
  additionalNotes: string;
}

export interface DailyReportLocalStorage {
  header?: ReportHeaderLocalStorage;
  tasks?: DailyTaskLocalStorage[];
  blocks?: Block[];
  observations?: Observation[];
  hoursWorked?: number;
  additionalNotes?: string;
}
