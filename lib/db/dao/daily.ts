import { db } from "..";
import { DailyReport } from "../models/daily";

/**
 * Guarda un daily report con sprint y campos indexables
 */
async function save(data: DailyReport): Promise<number | undefined> {
  const { from, to } = data.header.sprint;

  const reportId = await db.dailyReports.add({
    date: data.header.date,
    name: data.header.name,
    project: data.header.project,
    sprint: data.header.sprint,
    sprintFrom: from,
    sprintTo: to,
    hoursWorked: data.hoursWorked,
    additionalNotes: data.additionalNotes,
  });

  await db.dailyCompletedTasks.bulkAdd(
    data.completedTasks.map((t) => ({ ...t, reportId }))
  );
  await db.dailyPendingTasks.bulkAdd(
    data.pendingTasks.map((t) => ({ ...t, reportId }))
  );
  await db.blocks.bulkAdd(data.blocks.map((b) => ({ ...b, reportId })));
  await db.observations.bulkAdd(
    data.observations.map((o) => ({ ...o, reportId }))
  );

  return reportId;
}

/**
 * Recupera un daily report completo por ID
 */
async function get(reportId: number): Promise<DailyReport> {
  const report = await db.dailyReports.get(reportId);
  if (!report) throw new Error("No se encontró el daily report");

  const [completedTasks, pendingTasks, blocks, observations] =
    await Promise.all([
      db.dailyCompletedTasks.where("reportId").equals(reportId).toArray(),
      db.dailyPendingTasks.where("reportId").equals(reportId).toArray(),
      db.blocks.where("reportId").equals(reportId).toArray(),
      db.observations.where("reportId").equals(reportId).toArray(),
    ]);

  return {
    header: {
      date: report.date,
      name: report.name,
      project: report.project,
      sprint: report.sprint,
    },
    completedTasks,
    pendingTasks,
    blocks,
    observations,
    hoursWorked: report.hoursWorked,
    additionalNotes: report.additionalNotes,
  };
}

/**
 * Recupera todos los daily reports que coincidan con un rango de sprint
 */
async function getBySprint(from: string, to: string): Promise<DailyReport[]> {
  const metas = await db.dailyReports
    .where("[sprintFrom+sprintTo]")
    .equals([from, to])
    .toArray();

  return Promise.all(
    metas.map(async (meta) => {
      const [completedTasks, pendingTasks, blocks, observations] =
        await Promise.all([
          db.dailyCompletedTasks.where("reportId").equals(meta.id!).toArray(),
          db.dailyPendingTasks.where("reportId").equals(meta.id!).toArray(),
          db.blocks.where("reportId").equals(meta.id!).toArray(),
          db.observations.where("reportId").equals(meta.id!).toArray(),
        ]);

      return {
        header: {
          date: meta.date,
          name: meta.name,
          project: meta.project,
          sprint: meta.sprint,
        },
        completedTasks,
        pendingTasks,
        blocks,
        observations,
        hoursWorked: meta.hoursWorked,
        additionalNotes: meta.additionalNotes,
      };
    })
  );
}

export async function update(
  reportId: number,
  updated: Partial<DailyReport>
): Promise<void> {
  const changes: any = {};

  if (updated.header) {
    changes.date = updated.header.date;
    changes.name = updated.header.name;
    changes.project = updated.header.project;
    changes.sprint = updated.header.sprint;
    if (updated.header.sprint) {
      changes.sprintFrom = updated.header.sprint.from;
      changes.sprintTo = updated.header.sprint.to;
    }
  }

  if (updated.hoursWorked !== undefined) {
    changes.hoursWorked = updated.hoursWorked;
  }

  if (updated.additionalNotes !== undefined) {
    changes.additionalNotes = updated.additionalNotes;
  }

  await db.dailyReports.update(reportId, changes);
}

async function deleteReport(reportId: number): Promise<void> {
  await db.dailyReports.delete(reportId);
  await Promise.all([
    db.dailyCompletedTasks.where("reportId").equals(reportId).delete(),
    db.dailyPendingTasks.where("reportId").equals(reportId).delete(),
    db.blocks.where("reportId").equals(reportId).delete(),
    db.observations.where("reportId").equals(reportId).delete(),
  ]);
}

const dailyDao = {
  save,
  get,
  getBySprint,
  delete: deleteReport,
  update,
};

export default dailyDao;
