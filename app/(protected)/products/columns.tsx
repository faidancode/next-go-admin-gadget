"use client";

import { DataTableRowActions } from "@/components/shared/table/data-table-row-actions";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/types/product";
import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";

const idrFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export const columns = (
  handleDelete: (id: string) => void,
  handleEdit: (product: Product) => void,
): ColumnDef<Product>[] => [
  {
    accessorKey: "name",
    header: "Product",
    enableSorting: true,
  },
  {
    accessorKey: "categoryName",
    header: "Category",
    enableSorting: true,
  },
  {
    accessorKey: "imageUrl",
    header: "Image",
    enableSorting: false,
    cell: ({ row }) => {
      const imageUrl = row.getValue("imageUrl") as string;
      const productName = row.getValue("name") as string;

      return (
        <div className="relative h-10 w-10 overflow-hidden rounded-md border">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={`${productName} image`}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted text-[10px] text-muted-foreground">
              No Image
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "price",
    header: "Price",
    enableSorting: true,
    cell: ({ row }) => {
      const value = Number(row.getValue("price")) || 0;
      return <span>{idrFormatter.format(value)}</span>;
    },
  },
  {
    accessorKey: "stock",
    header: "Stock",
    enableSorting: true,
  },
  {
    accessorKey: "isActive",
    header: "Status",
    enableSorting: true,
    cell: ({ row }) => {
      const isActive = Boolean(row.getValue("isActive"));
      return (
        <Badge variant={isActive ? "default" : "secondary"}>
          {isActive ? "Active" : "Inactive"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DataTableRowActions
        menu="products"
        id={row.original.id}
        entityName={row.original.name}
        onDelete={handleDelete}
        onEdit={() => handleEdit(row.original)}
        showView={false}
      />
    ),
  },
];
