import { Observation } from "./observation.interface";
import {
  ReportHeader,
  ReportHeaderLocalStorage,
} from "./report-data.interface";
import { Task } from "./task.inteface";

type DailyTaskLocalStorage = Omit<Task, "finishDate"> & {
  finishDate: string | null;
};

export interface DailyReportData {
  header: ReportHeader;
  tasks: Task[];
  observations: Observation[];
  hoursWorked: number;
  additionalNotes: string;
}

export interface DailyReportLocalStorageData {
  header?: ReportHeaderLocalStorage;
  tasks?: DailyTaskLocalStorage[];
  observations?: Observation[];
  hoursWorked?: number;
  additionalNotes?: string;
}
