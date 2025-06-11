"use server";

import puppeteerCore from "puppeteer-core";
import puppeteer from "puppeteer";
import chromium from "@sparticuz/chromium";
import { ReportPreview } from "../report-preview";
import React from "react";

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
  // date: string;
  date: Date | null;
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

async function getBrowser() {
  if (process.env.VERCEL_ENV === "production") {
    const executablePath = await chromium.executablePath();
    const browser = await puppeteerCore.launch({
      args: [...chromium.args],
      defaultViewport: chromium.defaultViewport,
      executablePath,
      headless: chromium.headless,
    });
    return browser;
  } else {
    const browser = await puppeteer.launch();
    return browser;
  }
}

export async function generatePDFAction(
  reportData: ReportData
): Promise<Buffer> {
  const { renderToString } = await import("react-dom/server");

  const browser = await getBrowser();

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });

    const html = renderToString(
      React.createElement(ReportPreview, {
        data: reportData,
      })
    );

    const finalHtml = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://cdn.tailwindcss.com"></script>
        <title>Reporte Diario</title>
      </head>
      <body>
        ${html}
      </body>
    </html>
    `;

    await page.setContent(finalHtml, { waitUntil: "networkidle0" });
    const pdf = await page.pdf({
      format: "letter",
      printBackground: true,
      margin: { top: "0.5in", right: "0.5in", bottom: "0.5in", left: "0.5in" },
    });

    return Buffer.from(pdf);
  } finally {
    if (browser) await browser.close();
  }
}
