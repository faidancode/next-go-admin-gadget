"use client";

import { Alert } from "@/components/shared/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
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
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

export function CategorySheet() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const { open, mode, defaultValues, editingId, close } = useCategorySheet();

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
  } = form;

  const errorInputClass =
    "border-red-600 focus-visible:border-red-600 focus-visible:ring-destructive/50";

  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (open) {
      setSubmitError(null);
      form.reset({
        name: defaultValues.name ?? "",
        imageUrl: defaultValues.imageUrl ?? "",
      });
    }
  }, [open, defaultValues, form]);

  useEffect(() => {
    if (!imageFile) return;
    const objectUrl = URL.createObjectURL(imageFile);
    setImagePreview(objectUrl);
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [imageFile]);

  const handleClose = () => {
    setImageFile(null);
    setImagePreview("");
    close();
  };
  const getExistingImage = () => defaultValues.imageUrl ?? "";

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      const fallback = getExistingImage();
      setImageFile(null);
      setImagePreview(fallback);
      form.setValue("imageUrl", fallback);
      return;
    }
    setImageFile(file);
    form.setValue("imageUrl", "");
  };

  const onSubmit = async (values: CategoryFormValues) => {
    setSubmitError(null);

    try {
      if (mode === "create") {
        await createMutation.mutateAsync(values);
      } else if (mode === "edit" && editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          data: values,
        });
      }

      close();
    } catch (error) {
      const { message, fieldErrors } = resolveFormError(
        error,
        mode === "create"
          ? "Failed to create category"
          : "Failed to update category",
      );

      setSubmitError(message);

      if (fieldErrors) {
        for (const [field, value] of Object.entries(fieldErrors)) {
          setError(field as keyof CategoryFormValues, {
            type: "server",
            message: Array.isArray(value) ? value.join(", ") : value,
          });
        }
      }
    }
  };

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    void form.handleSubmit(onSubmit, () =>
      setSubmitError("Validation failed. Please check your input."),
    )(event);
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && close()}>
      <SheetContent className="w-full sm:max-w-md p-4">
        <SheetHeader>
          <SheetTitle>
            {mode === "create" ? "Add Category" : "Edit Category"}
          </SheetTitle>
        </SheetHeader>
        <form className="mt-6 space-y-4" onSubmit={handleFormSubmit}>
          {submitError && <Alert variant="error">{submitError}</Alert>}
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Category name"
              {...form.register("name")}
              aria-invalid={!!errors.name}
              className={cn(errors.name && errorInputClass)}
            />
            {errors.name && (
              <p className="text-sm text-red-600" role="alert">
                {errors.name.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="imageUrl">Logo</Label>
            <Input
              type="file"
              id="imageUrl"
              placeholder="imageUrl name"
              {...form.register("imageUrl")}
              aria-invalid={!!errors.imageUrl}
              className={cn(errors.imageUrl && errorInputClass)}
            />
            {errors.imageUrl && (
              <p className="text-sm text-red-600" role="alert">
                {errors.imageUrl.message}
              </p>
            )}
          </div>
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={close}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {mode === "create" ? "Create" : "Update"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

export default CategorySheet;
