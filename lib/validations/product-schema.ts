import { z } from "zod";

export const productSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  brandId: z.string().min(1, "Brand is required"),
  name: z
    .string()
    .min(3, "Name required")
    .max(255, "Name cannot exceed 255 characters"),
  description: z.string().optional().or(z.literal("")),
  price: z.number().gt(0, "Price must be greater than 0"),
  stock: z.number().int().min(0, "Stock cannot be negative"),
  sku: z.string().max(100, "SKU cannot exceed 100 characters").optional().or(z.literal("")),
  imageUrl: z.url("Image must be a valid URL").optional().or(z.literal("")),
  isActive: z.boolean().optional(),
});

export type ProductFormValues = z.infer<typeof productSchema>;
