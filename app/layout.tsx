import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { themeMap } from "@/lib/themes/theme-options";

export const metadata: Metadata = {
  title: "Reporte de Programación",
  description: "Generador de reportes de programación",
  generator: "Reporte de Programación",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-lt-installed="true">
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          value={themeMap}
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
