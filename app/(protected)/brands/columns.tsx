"use client";

import { DataTableRowActions } from "@/components/shared/table/data-table-row-actions";
import { Brand } from "@/types/brand";
import { ColumnDef } from "@tanstack/react-table";

export const columns = (
  handleDelete: (id: string) => void,
  handleEdit: (brand: Brand) => void,
): ColumnDef<Brand>[] => [
  {
    accessorKey: "name",
    header: "Brand",
    enableSorting: true,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DataTableRowActions
        menu="brands"
        id={row.original.id}
        entityName={row.original.name}
        onDelete={handleDelete}
        onEdit={() => handleEdit(row.original)}
        showView={false}
      />
    ),
  },
];
