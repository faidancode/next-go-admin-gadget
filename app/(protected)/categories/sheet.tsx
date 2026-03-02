"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCreateCategory, useUpdateCategory } from "@/hooks/use-category";
import { useCategorySheet } from "@/hooks/use-category-sheet";
import { resolveFormError } from "@/lib/api/form-error";
import { cn } from "@/lib/utils";
import {
  categorySchema,
  type CategoryFormValues,
} from "@/lib/validations/category-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { FolderPlus, LayoutGrid, Loader2, ShieldAlert } from "lucide-react";
import { ChangeEvent, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

export function CategorySheet() {
  const { open, mode, defaultValues, editingId, close } = useCategorySheet();
  const isEditMode = mode === "edit";

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      imageUrl: "",
    },
  });

  const {
    formState: { errors },
    setError,
    reset,
  } = form;

  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (open) {
      setSubmitError(null);
      const initialName = defaultValues.name ?? "";
      const initialUrl = defaultValues.imageUrl ?? "";

      reset({
        name: initialName,
        imageUrl: initialUrl,
      });
      setImagePreview(initialUrl);
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

  const onSubmit = async (values: CategoryFormValues) => {
    setSubmitError(null);

    const payload = {
      ...values,
      imageFile: imageFile,
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
          ? "Failed to create category"
          : "Failed to update category",
      );

      setSubmitError(message);

      if (fieldErrors) {
        Object.entries(fieldErrors).forEach(([field, value]) => {
          setError(field as keyof CategoryFormValues, {
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
      <SheetContent className="w-full sm:max-w-md p-0 overflow-hidden flex flex-col border-l border-slate-100">
        <SheetHeader className="p-8 border-b border-slate-50 bg-white">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center text-primary shadow-inner">
              <LayoutGrid size={24} />
            </div>
            <div>
              <SheetTitle className="text-xl font-black tracking-tight uppercase">
                {isEditMode ? "Edit Category" : "New Category"}
              </SheetTitle>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                {isEditMode ? "Modify product grouping" : "Organize products into new group"}
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
                <ShieldAlert size={18} /> {submitError}
              </div>
            )}

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Category Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Smartphone, Laptop, Audio"
                  {...form.register("name")}
                  className={cn(
                    "h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all",
                    errors.name && "border-red-500 focus:ring-red-100"
                  )}
                />
                {errors.name && <p className="text-[10px] font-bold text-red-500 ml-1 italic">{errors.name.message}</p>}
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Thumbnail / Icon</Label>
                <div className="flex flex-col gap-4 p-6 rounded-[2rem] border-2 border-dashed border-slate-200/80 bg-slate-50/30">
                  <div className="flex justify-center">
                    <div className="relative h-32 w-32 rounded-3xl overflow-hidden bg-white shadow-lg border border-slate-100 flex items-center justify-center">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-slate-300">
                          <FolderPlus size={28} />
                          <span className="text-[8px] font-black uppercase mt-2">No Image</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 text-center">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={isSubmitting}
                      className="rounded-xl border-slate-200 bg-white file:bg-slate-900 file:text-white file:rounded-lg file:text-[10px] file:font-black file:uppercase file:px-4 file:mr-4 file:border-0 hover:file:bg-primary cursor-pointer h-10 flex items-center"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>

        <SheetFooter className="p-8 border-t border-slate-100 bg-white">
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
              {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : isEditMode ? "Update Category" : "Create Category"}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export default CategorySheet;
