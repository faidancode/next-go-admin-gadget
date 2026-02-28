"use client";

import { Alert } from "@/components/shared/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { useBrands } from "@/hooks/use-brand";
import { useCategories } from "@/hooks/use-category";
import { useCreateProduct, useUpdateProduct } from "@/hooks/use-product";
import { useProductSheet } from "@/hooks/use-product-sheet";
import { resolveFormError } from "@/lib/api/form-error";
import { cn } from "@/lib/utils";
import {
  productSchema,
  type ProductFormValues,
} from "@/lib/validations/product-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChangeEvent, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

export function ProductSheet() {
  const { open, mode, defaultValues, editingId, close } = useProductSheet();
  const isEditMode = mode === "edit";

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data: categoriesData } = useCategories(1, 1000, "", "createdAt:desc");
  const { data: brandsData } = useBrands(1, 1000, "", "createdAt:desc");
  const categories = categoriesData?.data ?? [];
  const brands = brandsData?.data ?? [];
  console.log({ brands });

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      categoryId: "",
      brandId: "",
      name: "",
      description: "",
      price: 0,
      stock: 0,
      sku: "",
      imageUrl: "",
      isActive: true,
    },
  });

  const {
    formState: { errors },
    setError,
    reset,
    setValue,
    watch,
  } = form;

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const selectedCategoryId = watch("categoryId");
  const selectedBrandId = watch("brandId");
  const activeValue = watch("isActive");

  useEffect(() => {
    if (open) {
      setSubmitError(null);
      reset({
        categoryId: defaultValues.categoryId ?? "",
        brandId: defaultValues.brandId ?? "",
        name: defaultValues.name ?? "",
        description: defaultValues.description ?? "",
        price: Number(defaultValues.price ?? 0),
        stock: Number(defaultValues.stock ?? 0),
        sku: defaultValues.sku ?? "",
        imageUrl: defaultValues.imageUrl ?? "",
        isActive:
          typeof defaultValues.isActive === "boolean"
            ? defaultValues.isActive
            : true,
      });

      setImagePreview(defaultValues.imageUrl ?? "");
      setImageFile(null);
    }
  }, [open, defaultValues, reset]);

  useEffect(() => {
    if (!imageFile) return;
    const objectUrl = URL.createObjectURL(imageFile);
    setImagePreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile]);

  const handleClose = () => {
    reset();
    setImageFile(null);
    setImagePreview("");
    setSubmitError(null);
    close();
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) {
      setImageFile(null);
      setImagePreview(defaultValues.imageUrl ?? "");
      return;
    }
    setImageFile(file);
  };

  const onSubmit = async (values: ProductFormValues) => {
    setSubmitError(null);

    const payload = {
      ...values,
      imageFile,
    };

    try {
      if (mode === "create") {
        await createMutation.mutateAsync(payload);
      } else if (mode === "edit" && editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          data: payload,
        });
      }
      handleClose();
    } catch (error) {
      const { message, fieldErrors } = resolveFormError(
        error,
        mode === "create"
          ? "Failed to create product"
          : "Failed to update product",
      );

      setSubmitError(message);

      if (fieldErrors) {
        Object.entries(fieldErrors).forEach(([field, value]) => {
          setError(field as keyof ProductFormValues, {
            type: "server",
            message: Array.isArray(value)
              ? value.join(", ")
              : (value as string),
          });
        });
      }
    }
  };

  return (
    <Sheet open={open} onOpenChange={(state) => !state && handleClose()}>
      <SheetContent className="w-full sm:max-w-md p-4 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {mode === "create" ? "Add Product" : "Edit Product"}
          </SheetTitle>
        </SheetHeader>

        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            void form.handleSubmit(onSubmit)(e);
          }}
        >
          {submitError && <Alert variant="error">{submitError}</Alert>}

          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={selectedCategoryId || undefined}
              onValueChange={(value) =>
                setValue("categoryId", value, { shouldValidate: true })
              }
              disabled={isSubmitting}
            >
              <SelectTrigger
                className={cn("w-full", errors.categoryId && "border-red-600")}
              >
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.categoryId && (
              <p className="text-sm text-red-600">
                {errors.categoryId.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Brand</Label>
            <Select
              value={selectedBrandId || undefined}
              onValueChange={(value) =>
                setValue("brandId", value, { shouldValidate: true })
              }
              disabled={isSubmitting}
            >
              <SelectTrigger
                className={cn("w-full", errors.brandId && "border-red-600")}
              >
                <SelectValue placeholder="Select brand" />
              </SelectTrigger>
              <SelectContent>
                {brands.map((brand) => (
                  <SelectItem key={brand.id} value={brand.id}>
                    {brand.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.brandId && (
              <p className="text-sm text-red-600">{errors.brandId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Product name"
              {...form.register("name")}
              className={cn(errors.name && "border-red-600")}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Product description"
              {...form.register("description")}
              className={cn(errors.description && "border-red-600")}
            />
            {errors.description && (
              <p className="text-sm text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                min={1}
                placeholder="0"
                {...form.register("price", { valueAsNumber: true })}
                className={cn(errors.price && "border-red-600")}
              />
              {errors.price && (
                <p className="text-sm text-red-600">{errors.price.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                type="number"
                min={0}
                placeholder="0"
                {...form.register("stock", { valueAsNumber: true })}
                className={cn(errors.stock && "border-red-600")}
              />
              {errors.stock && (
                <p className="text-sm text-red-600">{errors.stock.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sku">SKU</Label>
            <Input
              id="sku"
              placeholder="SKU"
              {...form.register("sku")}
              className={cn(errors.sku && "border-red-600")}
            />
            {errors.sku && (
              <p className="text-sm text-red-600">{errors.sku.message}</p>
            )}
          </div>

          {isEditMode && (
            <div className="flex items-center justify-between rounded-md border p-3">
              <Label htmlFor="is-active-switch">Active</Label>
              <Switch
                id="is-active-switch"
                checked={Boolean(activeValue)}
                onCheckedChange={(checked) =>
                  setValue("isActive", checked, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
                disabled={isSubmitting}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Product Image</Label>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded border border-dashed bg-muted/50">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-center text-xs text-muted-foreground">
                    No image
                  </span>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={isSubmitting}
                />
                <p className="text-xs text-muted-foreground">
                  {isEditMode
                    ? "Upload new image to replace current one."
                    : "Upload product image."}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting
                ? "Saving..."
                : isEditMode
                  ? "Update Product"
                  : "Create Product"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

export default ProductSheet;
