"use client";

import { Fragment, useMemo, useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ReportDto } from "@/lib/schemas/report.schema";
import { TaskDto } from "@/lib/schemas/tasks.schema";
import { format } from "date-fns";

const getColumns = (): ColumnDef<ReportDto>[] => {
  return [
    {
      id: "expander",
      header: () => null,
      cell: ({ row }) => {
        return row.getCanExpand() ? (
          <Button
            {...{
              className: "size-7 shadow-none text-muted-foreground",
              onClick: row.getToggleExpandedHandler(),
              "aria-expanded": row.getIsExpanded(),
              "aria-label": row.getIsExpanded()
                ? `Collapse details for ${row.original.name}`
                : `Expand details for ${row.original.name}`,
              size: "icon",
              variant: "ghost",
            }}
          >
            {row.getIsExpanded() ? (
              <ChevronUpIcon
                className="opacity-60"
                size={16}
                aria-hidden="true"
              />
            ) : (
              <ChevronDownIcon
                className="opacity-60"
                size={16}
                aria-hidden="true"
              />
            )}
          </Button>
        ) : undefined;
      },
    },
    {
      header: "Reporte",
      accessorKey: "name",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("name")}</div>
      ),
    },
    {
      header: "Dueño",
      accessorKey: "owner",
    },
    {
      header: "Proyecto",
      accessorKey: "project",
    },
    {
      header: "Fecha",
      accessorKey: "date",
      cell: ({ row }) => {
        return <span>{format(row.original.date, "dd/MM/yyyy")}</span>;
      },
    },
    {
      header: "Tipo",
      accessorKey: "type",
      cell: ({ row }) => <Badge>{row.original.type}</Badge>,
    },
    {
      header: "# de tareas",
      accessorKey: "tasks",
      cell: ({ row }) => <Badge>{row.original.tasks.length}</Badge>,
    },
  ];
};

export default function ArchivedReportsTable({
  reports,
  selectedTasks,
  onSelectTasks,
  onUnSelectTasks,
}: {
  reports: ReportDto[];
  selectedTasks: TaskDto[];
  onSelectTasks: (tasks: TaskDto[]) => void;
  onUnSelectTasks: (tasks: TaskDto[]) => void;
}) {
  const table = useReactTable({
    data: reports,
    columns: getColumns(),
    getRowCanExpand: (row) => row.original.tasks.length > 0,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });

  const handleSelectTasks = (tasks: TaskDto[]) => {
    onSelectTasks(tasks);
  };

  const handleUnSelectTasks = (tasks: TaskDto[]) => {
    onUnSelectTasks(tasks);
  };

  return (
    <div>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <Fragment key={row.id}>
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="whitespace-nowrap [&:has([aria-expanded])]:w-px [&:has([aria-expanded])]:py-0 [&:has([aria-expanded])]:pr-0"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
                {row.getIsExpanded() && (
                  <TableRow className="bg-muted/50">
                    <TableCell colSpan={row.getVisibleCells().length}>
                      <TasksSubTable
                        tasks={row.original.tasks}
                        onSelect={(tasks) => handleSelectTasks(tasks)}
                        onUnSelect={(tasks) => handleUnSelectTasks(tasks)}
                      />
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={table.getHeaderGroups().length}
                className="h-24 text-center"
              >
                No hay reportes.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function TasksSubTable({
  tasks,
  onSelect,
  onUnSelect,
}: {
  tasks: TaskDto[];
  onSelect: (tasks: TaskDto[]) => void;
  onUnSelect: (tasks: TaskDto[]) => void;
}) {
  const [data] = useState<TaskDto[]>(tasks);

  const columns = useMemo((): ColumnDef<TaskDto>[] => {
    return [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => {
              table.toggleAllPageRowsSelected(!!value);

              if (value) {
                onSelect(table.getRowModel().rows.map((row) => row.original));
              } else {
                onUnSelect(table.getRowModel().rows.map((row) => row.original));
              }
            }}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => {
              row.toggleSelected(!!value);

              if (value) {
                onSelect([row.original]);
              } else {
                onUnSelect([row.original]);
              }
            }}
            aria-label="Select row"
          />
        ),
      },
      {
        header: "Nombre",
        accessorKey: "name",
      },
      {
        header: "Plan de acción",
        accessorKey: "actionPlan",
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue("actionPlan")}</div>
        ),
      },
      {
        header: "Estado",
        accessorKey: "status",
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue("status")}</div>
        ),
      },
      {
        header: "Story Points",
        accessorKey: "storyPoints",
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue("storyPoints")}</div>
        ),
      },
    ];
  }, []);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id} className="hover:bg-transparent">
            {headerGroup.headers.map((header) => {
              return (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              );
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => (
            <Fragment key={row.id}>
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className="whitespace-nowrap [&:has([aria-expanded])]:w-px [&:has([aria-expanded])]:py-0 [&:has([aria-expanded])]:pr-0"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            </Fragment>
          ))
        ) : (
          <TableRow>
            <TableCell
              colSpan={table.getHeaderGroups().length}
              className="h-24 text-center"
            >
              No hay reportes.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
