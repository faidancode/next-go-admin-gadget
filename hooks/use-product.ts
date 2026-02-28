import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct,
} from "@/lib/api/product";
import { ProductFormValues } from "@/lib/validations/product-schema";
import { toast } from "sonner";
import { getErrorMessage, getReadableErrorCode } from "@/lib/api/errors";

type ProductPayload = ProductFormValues & {
  imageFile?: File | Blob | FileList | null;
};

export const useProducts = (
  page: number,
  pageSize: number,
  search: string,
  sort: string,
) => {
  return useQuery({
    queryKey: ["products", page, pageSize, search, sort],
    queryFn: () => getProducts(page, pageSize, search, sort),
    staleTime: 1000 * 60,
  });
};

export const useProductById = (id: string) => {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById(id),
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ProductPayload) => {
      return createProduct(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product created successfully");
    },
    onError: (error) => {
      const code = getReadableErrorCode(error);
      const message = getErrorMessage(error, "Failed to create product.");
      toast.error(code, { description: message });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: ProductPayload;
    }) => {
      return updateProduct(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product updated successfully");
    },
    onError: (error) => {
      const code = getReadableErrorCode(error);
      const message = getErrorMessage(error, "Failed to update product.");
      toast.error(code, { description: message });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product deleted successfully");
    },
    onError: (error) => {
      const code = getReadableErrorCode(error);
      const message = getErrorMessage(error, "Failed to delete product.");
      toast.error(code, { description: message });
    },
  });
};
