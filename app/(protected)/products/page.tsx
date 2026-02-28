
"use client";

import AppHeader from "@/components/shared/app-header";
import { DataTable } from "@/components/shared/table/data-table";
import SkeletonTable from "@/components/shared/table/skeleton-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDeleteProduct, useProducts } from "@/hooks/use-product";
import { useProductSheet } from "@/hooks/use-product-sheet";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { useDebounce } from "use-debounce";
import { columns } from "./columns";
import ProductSheet from "./sheet";

function ProductPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 300);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sort, setSort] = useState("createdAt:desc");

  const { data, isLoading, error } = useProducts(
    page,
    pageSize,
    debouncedSearch,
    sort,
  );

  const tableData = data?.data ?? [];
  const totalPages = data?.meta?.totalPages ?? 1;

  const deleteMutation = useDeleteProduct();
  const { openCreate, openEdit } = useProductSheet();

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  if (error) return <p>Error: {error.message}</p>;

  return (
    <>
      <AppHeader title="Products" />
      <div className="container pt-2">
        <div className="flex justify-between items-center mb-4 mt-6">
          <Input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-white p-2 border rounded-lg w-40"
          />
          <Button onClick={openCreate}>
            <PlusCircle /> Add Product
          </Button>
        </div>

        {isLoading ? (
          <SkeletonTable />
        ) : (
          <DataTable
            key={`${page}-${pageSize}`}
            columns={columns(handleDelete, (product) => {
              openEdit({
                id: product.id,
                categoryId: product.categoryId,
                brandId: product.brandId ?? "",
                name: product.name,
                description: product.description ?? "",
                price: Number(product.price) || 0,
                stock: Number(product.stock) || 0,
                sku: product.sku ?? "",
                imageUrl: product.imageUrl ?? "",
                isActive: product.isActive,
              });
            })}
            data={tableData}
            page={page}
            setPage={setPage}
            pageSize={pageSize}
            setPageSize={setPageSize}
            totalPages={totalPages}
            sort={sort}
            setSort={setSort}
          />
        )}
        <ProductSheet />
      </div>
    </>
  );
}

export default ProductPage;
