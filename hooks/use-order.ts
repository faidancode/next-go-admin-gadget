import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getOrderById,
  getOrders,
  type OrderDetail,
  type OrderListResponse,
  type UpdateOrderPayload,
  markOrderDelivered,
  updateOrder,
} from "@/lib/api/order";
import { toast } from "sonner";
import { getErrorMessage, getReadableErrorCode } from "@/lib/api/errors";

export const useOrders = (
  status: string,
  page: number,
  limit: number,
  search: string,
  sort?: string
) => {
  return useQuery<OrderListResponse>({
    queryKey: ["admin-orders", { status, page, limit, search, sort }],
    queryFn: () => getOrders(status, page, limit, search, sort),
    placeholderData: (prev) => prev,
    staleTime: 1000 * 60,
  });
};

export const useOrderDetail = (id?: string, enabled = true) => {
  return useQuery<OrderDetail>({
    queryKey: ["admin-order", id],
    queryFn: () => getOrderById(id as string),
    enabled: Boolean(id) && enabled,
    staleTime: 1000 * 30,
  });
};

export const useUpdateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrderPayload }) =>
      updateOrder(id, data),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-order", id] });
      toast.success("Order updated successfully");
    },
    onError: (error) => {
      const code = getReadableErrorCode(error);
      const message = getErrorMessage(error, "Failed to update order.");
      toast.error(code, { description: message });
    },
  });
};

export const useMarkOrderDelivered = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => markOrderDelivered(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-order", id] });
      toast.success("Order marked as delivered");
    },
    onError: (error) => {
      const code = getReadableErrorCode(error);
      const message = getErrorMessage(error, "Failed to mark order as delivered.");
      toast.error(code, { description: message });
    },
  });
};
