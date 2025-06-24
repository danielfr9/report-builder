"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { themeOptions } from "@/lib/themes/theme-options";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const handleThemeChange = (
    e: React.MouseEvent<HTMLDivElement>,
    theme: string
  ) => {
    e.preventDefault();
    setTheme(theme);
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="max-h-[var(--radix-dropdown-menu-content-available-height)] overflow-auto"
      >
        {themeOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            className={cn(
              "cursor-pointer",
              option.value === theme
                ? "bg-primary text-background hover:!bg-primary hover:!text-background"
                : ""
            )}
            onClick={(e) => handleThemeChange(e, option.value)}
          >
            {option.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
