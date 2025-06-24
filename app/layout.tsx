import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

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
          value={{
            light: "light",
            dark: "dark",
            caffeine: "caffeine",
            "caffeine-dark": "caffeine-dark",
            tangenrine: "tangenrine",
            "tangenrine-dark": "tangenrine-dark",
            twitter: "twitter",
            "twitter-dark": "twitter-dark",
            supabase: "supabase",
            "supabase-dark": "supabase-dark",
            ayu: "ayu",
            "ayu-dark": "ayu-dark",
            "one-dark": "one-dark",
            dracula: "dracula",
          }}
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
