"use server";

import puppeteerCore from "puppeteer-core";
import puppeteer from "puppeteer";
import chromium from "@sparticuz/chromium";
import { DailyReportPreview } from "../../components/reports/daily-report-preview";
import React from "react";
import { DailyReportData } from "@/lib/interfaces/report-data.interface";
import { WeeklyReportPreview } from "@/components/reports/weekly-report-preview";

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

export async function generateDailyReportPDFAction(
  reportData: DailyReportData
): Promise<Buffer> {
  const { renderToString } = await import("react-dom/server");

  // const cssDir = path.resolve(process.cwd(), ".next/static/css/");
  // const cssFiles = fs
  //   .readdirSync(cssDir)
  //   .filter((file) => file.endsWith(".css"));
  // let css = "";
  // for (const file of cssFiles) {
  //   css += fs.readFileSync(path.join(cssDir, file), "utf8") + "\n";
  // }

  const browser = await getBrowser();

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });

    const html = renderToString(
      React.createElement(DailyReportPreview, {
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

export async function generateWeeklyReportPDFAction(
  reportData: DailyReportData
) {
  const { renderToString } = await import("react-dom/server");

  // const cssDir = path.resolve(process.cwd(), ".next/static/css/");
  // const cssFiles = fs
  //   .readdirSync(cssDir)
  //   .filter((file) => file.endsWith(".css"));
  // let css = "";
  // for (const file of cssFiles) {
  //   css += fs.readFileSync(path.join(cssDir, file), "utf8") + "\n";
  // }

  const browser = await getBrowser();

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });

    const html = renderToString(
      React.createElement(WeeklyReportPreview, {
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
        <title>Reporte Semanal</title>
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
