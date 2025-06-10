"use server";

import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

interface Task {
  id: string;
  name: string;
  storyPoints: number;
  status: "Completado" | "En Proceso" | "Pendiente";
  comments: string;
}

interface PendingTask {
  id: string;
  name: string;
  storyPoints: number;
  actionPlan: string;
}

interface ReportData {
  date: string;
  name: string;
  project: string;
  sprint: string;
  completedTasks: Task[];
  pendingTasks: PendingTask[];
  blocks: string[];
  observations: string[];
  hoursWorked: number;
  additionalNotes: string;
}

function generateReportHTML(data: ReportData): string {
  const totalCompletedPoints = data.completedTasks
    .filter((task) => task.status === "Completado")
    .reduce((sum, task) => sum + task.storyPoints, 0);

  const totalInProgressPoints = data.completedTasks
    .filter((task) => task.status === "En Proceso")
    .reduce((sum, task) => sum + task.storyPoints, 0);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completado":
        return "✅";
      case "En Proceso":
        return "🔄";
      case "Pendiente":
        return "⏳";
      default:
        return "";
    }
  };

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reporte Diario</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
                line-height: 1.6;
                color: #374151;
                background: white;
                padding: 32px;
            }
            
            .container {
                max-width: 800px;
                margin: 0 auto;
                background: white;
            }
            
            .header {
                text-align: center;
                border-bottom: 2px solid #e5e7eb;
                padding-bottom: 24px;
                margin-bottom: 32px;
            }
            
            .header h1 {
                font-size: 24px;
                font-weight: bold;
                color: #111827;
                margin-bottom: 16px;
            }
            
            .header-info {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 16px;
                font-size: 14px;
            }
            
            .section {
                margin-bottom: 32px;
            }
            
            .section h2 {
                font-size: 18px;
                font-weight: 600;
                margin-bottom: 16px;
                color: #111827;
            }
            
            table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 16px;
            }
            
            th, td {
                border: 1px solid #d1d5db;
                padding: 12px;
                text-align: left;
            }
            
            th {
                background-color: #f9fafb;
                font-weight: 600;
            }
            
            .text-center {
                text-align: center;
            }
            
            .font-semibold {
                font-weight: 600;
            }
            
            ul {
                list-style-type: disc;
                padding-left: 20px;
            }
            
            li {
                margin-bottom: 4px;
            }
            
            .italic {
                font-style: italic;
                color: #6b7280;
            }
            
            .status-icon {
                display: inline-block;
                margin-right: 8px;
            }
            
            .whitespace-pre-wrap {
                white-space: pre-wrap;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Reporte Diario de Programador con Story Points ☕</h1>
                <div class="header-info">
                    <div><span class="font-semibold">Fecha:</span> ${
                      data.date
                    }</div>
                    <div><span class="font-semibold">👨‍💻 Nombre:</span> ${
                      data.name
                    }</div>
                    <div><span class="font-semibold">Proyecto:</span> ${
                      data.project
                    }</div>
                    <div><span class="font-semibold">Sprint:</span> ${
                      data.sprint
                    }</div>
                </div>
            </div>

            <div class="section">
                <h2>1. Actividades realizadas (Hoy) ✅</h2>
                ${
                  data.completedTasks.length > 0
                    ? `
                    <table>
                        <thead>
                            <tr>
                                <th>Tarea</th>
                                <th class="text-center">Story Points</th>
                                <th class="text-center">Estado</th>
                                <th>Comentarios / PR</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.completedTasks
                              .map(
                                (task) => `
                                <tr>
                                    <td>${task.name}</td>
                                    <td class="text-center font-semibold">${
                                      task.storyPoints
                                    } pts</td>
                                    <td class="text-center">
                                        <span class="status-icon">${getStatusIcon(
                                          task.status
                                        )}</span>${task.status}
                                    </td>
                                    <td>${task.comments}</td>
                                </tr>
                            `
                              )
                              .join("")}
                        </tbody>
                    </table>
                `
                    : '<p class="italic">No hay actividades registradas.</p>'
                }
            </div>

            <div class="section">
                <h2>2. Pendientes por continuar</h2>
                ${
                  data.pendingTasks.length > 0
                    ? `
                    <table>
                        <thead>
                            <tr>
                                <th>Tarea</th>
                                <th class="text-center">Story Points</th>
                                <th>Plan de acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.pendingTasks
                              .map(
                                (task) => `
                                <tr>
                                    <td>${task.name}</td>
                                    <td class="text-center font-semibold">${task.storyPoints} pts</td>
                                    <td>${task.actionPlan}</td>
                                </tr>
                            `
                              )
                              .join("")}
                        </tbody>
                    </table>
                `
                    : '<p class="italic">No hay tareas pendientes.</p>'
                }
            </div>

            <div class="section">
                <h2>3. Bloqueos / Dificultades ⚠️</h2>
                ${
                  data.blocks.length > 0
                    ? `
                    <ul>
                        ${data.blocks
                          .map((block) => `<li>${block}</li>`)
                          .join("")}
                    </ul>
                `
                    : '<p class="italic">No hay bloqueos registrados.</p>'
                }
            </div>

            <div class="section">
                <h2>4. Observaciones / Sugerencias</h2>
                ${
                  data.observations.length > 0
                    ? `
                    <ul>
                        ${data.observations
                          .map((observation) => `<li>${observation}</li>`)
                          .join("")}
                    </ul>
                `
                    : '<p class="italic">No hay observaciones registradas.</p>'
                }
            </div>

            <div class="section">
                <h2>5. Horas trabajadas</h2>
                <p>• ${data.hoursWorked} horas</p>
            </div>

            <div class="section">
                <h2>6. Total Story Points del día</h2>
                <p>• ✅ Completados: ${totalCompletedPoints} pts</p>
                ${
                  totalInProgressPoints > 0
                    ? `<p>• 🔄 En progreso: ${totalInProgressPoints} pts</p>`
                    : ""
                }
            </div>

            ${
              data.additionalNotes
                ? `
                <div class="section">
                    <h2>Notas adicionales (opcional)</h2>
                    <div style="border-top: 1px solid #d1d5db; padding-top: 8px;">
                        <p class="whitespace-pre-wrap">${data.additionalNotes}</p>
                    </div>
                </div>
            `
                : ""
            }
        </div>
    </body>
    </html>
  `;
}

export async function generatePDF(reportData: ReportData): Promise<Buffer> {
  const browser = await puppeteer.launch({
    args: [
      ...chromium.args,
      // "--no-sandbox",
      // "--disable-setuid-sandbox",
      // "--disable-dev-shm-usage",
      // "--disable-accelerated-2d-canvas",
      // "--no-first-run",
      // "--no-zygote",
      // "--single-process",
      // "--disable-gpu",
    ],
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });

    const html = generateReportHTML(reportData);
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20px",
        right: "20px",
        bottom: "20px",
        left: "20px",
      },
    });

    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
