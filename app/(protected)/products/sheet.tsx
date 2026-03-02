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
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
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
import { AlertCircle, Edit3, ImagePlus, Loader2, Plus } from "lucide-react";
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
      {/* Menggunakan max-w-xl agar lebih luas untuk input grid */}
      <SheetContent className="w-full sm:max-w-xl p-0 overflow-hidden flex flex-col border-l border-slate-100">
        <SheetHeader className="p-8 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center text-primary shadow-inner">
              {isEditMode ? <Edit3 size={24} /> : <Plus size={24} />}
            </div>
            <div>
              <SheetTitle className="text-xl font-black tracking-tight uppercase">
                {isEditMode ? "Edit Product" : "New Product"}
              </SheetTitle>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                {isEditMode ? `ID: ${editingId}` : "Fill in the details to list a new item"}
              </p>
            </div>
          </div>
        </SheetHeader>

        <form
          className="flex-1 overflow-y-auto"
          onSubmit={(e) => {
            void form.handleSubmit(onSubmit)(e);
          }}
        >
          <div className="p-8 space-y-8">
            {submitError && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-[11px] font-bold flex items-center gap-3 animate-in fade-in zoom-in-95">
                <AlertCircle size={18} /> {submitError}
              </div>
            )}

            {/* SECTION: BASIC INFO */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 pb-2">
                Identity & Classification
              </h3>

              <div className="space-y-2">
                <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Product Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. iPhone 15 Pro Max"
                  {...form.register("name")}
                  className={cn(
                    "h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all",
                    errors.name && "border-red-500 focus:ring-red-100"
                  )}
                />
                {errors.name && <p className="text-[10px] font-bold text-red-500 ml-1 italic">{errors.name.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 text-left">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Category</Label>
                  <Select
                    value={selectedCategoryId || undefined}
                    onValueChange={(value) => setValue("categoryId", value, { shouldValidate: true })}
                  >
                    <SelectTrigger className={cn("h-12 rounded-xl border-slate-200 bg-slate-50/50", errors.categoryId && "border-red-500")}>
                      <SelectValue placeholder="Pick Category" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id} className="rounded-lg">{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 text-left">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Brand</Label>
                  <Select
                    value={selectedBrandId || undefined}
                    onValueChange={(value) => setValue("brandId", value, { shouldValidate: true })}
                  >
                    <SelectTrigger className={cn("h-12 rounded-xl border-slate-200 bg-slate-50/50", errors.brandId && "border-red-500")}>
                      <SelectValue placeholder="Pick Brand" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                      {brands.map((b) => (
                        <SelectItem key={b.id} value={b.id} className="rounded-lg">{b.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* SECTION: PRICING & INVENTORY */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 pb-2">
                Pricing & Inventory
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Retail Price (IDR)</Label>
                  <Input
                    id="price"
                    type="number"
                    {...form.register("price", { valueAsNumber: true })}
                    className="h-12 rounded-xl border-slate-200 bg-slate-50/50 font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Available Stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    {...form.register("stock", { valueAsNumber: true })}
                    className="h-12 rounded-xl border-slate-200 bg-slate-50/50 font-bold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sku" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Stock Keeping Unit (SKU)</Label>
                <Input
                  id="sku"
                  placeholder="GG-PH-15PM-BLK"
                  {...form.register("sku")}
                  className="h-12 rounded-xl border-slate-200 bg-slate-50/50 font-mono text-xs"
                />
              </div>
            </div>

            {/* SECTION: ASSETS */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 pb-2">
                Product Visuals
              </h3>

              <div className="flex flex-col gap-6 p-6 rounded-[2rem] border-2 border-dashed border-slate-200/80 bg-slate-50/30">
                <div className="flex justify-center">
                  <div className="relative h-40 w-40 rounded-3xl overflow-hidden bg-white shadow-xl border border-slate-100 group">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="h-full w-full object-cover transition-transform group-hover:scale-110 duration-500" />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-slate-400">
                        <ImagePlus size={32} />
                        <span className="text-[9px] font-black uppercase mt-2">No Image</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={isSubmitting}
                    className="rounded-xl border-slate-200 bg-white file:bg-slate-900 file:text-white file:rounded-lg file:text-[10px] file:font-black file:uppercase file:px-4 file:mr-4 file:border-0 hover:file:bg-primary cursor-pointer h-11 flex items-center"
                  />
                  <p className="text-center text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    Recommended: Square aspect ratio, max 2MB
                  </p>
                </div>
              </div>
            </div>

            {/* SECTION: DESCRIPTION */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Full Description</Label>
              <Textarea
                id="description"
                placeholder="Write detailed specifications..."
                {...form.register("description")}
                className="min-h-[120px] rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all resize-none p-4"
              />
            </div>

            {isEditMode && (
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900 text-white shadow-lg">
                <div className="flex items-center gap-3">
                  <div className={cn("h-2 w-2 rounded-full animate-pulse", activeValue ? "bg-emerald-400" : "bg-slate-500")} />
                  <Label htmlFor="is-active" className="text-[10px] font-black uppercase tracking-widest">Visibility Status</Label>
                </div>
                <Switch
                  id="is-active"
                  checked={Boolean(activeValue)}
                  onCheckedChange={(checked) => setValue("isActive", checked, { shouldDirty: true })}
                  className="data-[state=checked]:bg-primary"
                />
              </div>
            )}
          </div>
        </form>

        <SheetFooter className="p-8 border-t border-slate-200 bg-white">
          <div className="flex gap-3 w-full">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 h-12 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900"
            >
              Cancel
            </Button>
            <Button
              onClick={form.handleSubmit(onSubmit)}
              disabled={isSubmitting}
              className="flex-2 h-12 rounded-xl bg-slate-900 hover:bg-primary text-white font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl shadow-slate-200"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin mr-2" size={16} />
              ) : isEditMode ? (
                "Update Product"
              ) : (
                "Create Product"
              )}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export default ProductSheet;
