"use client";

import { DataTableRowActions } from "@/components/shared/table/data-table-row-actions";
import { Category } from "@/types/category";
import { ColumnDef } from "@tanstack/react-table";

export const columns = (
  handleDelete: (id: string) => void,
  handleEdit: (category: Category) => void,
): ColumnDef<Category>[] => [
  {
    accessorKey: "name",
    header: "Category",
    enableSorting: true,
  },
  {
    accessorKey: "imageUrl",
    header: "Image",
    enableSorting: false,
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
