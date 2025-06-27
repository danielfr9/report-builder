import { Observation } from "./observation.interface";
import {
  ReportHeader,
  ReportHeaderLocalStorage,
} from "./report-data.interface";
import { Task } from "./task.inteface";

type WeeklyTaskLocalStorage = Omit<Task, "finishDate"> & {
  finishDate: string | null;
};

export interface WeeklyReportData {
  header: ReportHeader;
  tasks: Task[];
  observations: Observation[];
  hoursWorked: number;
  additionalNotes: string;
}

export interface WeeklyReportLocalStorageData {
  header?: ReportHeaderLocalStorage;
  tasks?: WeeklyTaskLocalStorage[];
  observations?: Observation[];
  hoursWorked?: number;
  additionalNotes?: string;
}
