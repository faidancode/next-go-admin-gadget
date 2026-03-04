import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    getCustomerAddresses,
    getCustomerById,
    getCustomerOrders,
    getCustomers,
    toggleCustomerStatus,
} from "@/lib/api/customer";
import { toast } from "sonner";
import { getErrorMessage, getReadableErrorCode } from "@/lib/api/errors";
import { Address, CustomerDetail, CustomerOrder, CustomerRow } from "@/types/customer";
import { PaginationMeta } from "@/types/api";

export const useCustomers = (
    page: number,
    limit: number,
    search: string,
    sort?: string
) => {
    return useQuery<{ data: CustomerRow[]; meta: PaginationMeta }>({
        queryKey: ["admin-customers", { page, limit, search, sort }],
        queryFn: () => getCustomers(page, limit, search, sort),
        placeholderData: (prev) => prev,
        staleTime: 1000 * 60,
    });
};

export const useCustomerDetail = (id?: string, enabled = true) => {
    return useQuery<CustomerDetail>({
        queryKey: ["admin-customer", id],
        queryFn: () => getCustomerById(id as string),
        enabled: Boolean(id) && enabled,
        staleTime: 1000 * 30,
    });
};

export const useCustomerAddresses = (id: string, page: number, limit: number, sort: string) => {
    return useQuery<{ data: Address[]; meta: PaginationMeta }>({
        queryKey: ["admin-customer-addresses", id, { page, limit, sort }],
        queryFn: () => getCustomerAddresses(id, page, limit, sort),
        placeholderData: (prev) => prev,
        staleTime: 1000 * 60,
    });
};

export const useCustomerOrders = (id: string, page: number, limit: number, sort: string) => {
    return useQuery<{ data: CustomerOrder[]; meta: PaginationMeta }>({
        queryKey: ["admin-customer-orders", id, { page, limit, sort }],
        queryFn: () => getCustomerOrders(id, page, limit, sort),
        placeholderData: (prev) => prev,
        staleTime: 1000 * 60,
    });
};

export const useToggleCustomerStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
            toggleCustomerStatus(id, isActive),
        onSuccess: (_data, { id }) => {
            queryClient.invalidateQueries({ queryKey: ["admin-customers"] });
            queryClient.invalidateQueries({ queryKey: ["admin-customer", id] });
            toast.success("Customer status updated successfully");
        },
        onError: (error) => {
            const code = getReadableErrorCode(error);
            const message = getErrorMessage(error, "Failed to update customer status.");
            toast.error(code, { description: message });
        },
    });
};
