import { ApiEnvelope, PaginationMeta } from "@/types/api";
import {
    apiRequest,
    buildQueryString,
    unwrapEnvelope,
} from "./fetcher";
import { Address, CustomerDetail, CustomerOrder, CustomerRow } from "@/types/customer";

export async function getCustomers(
    page = 1,
    limit = 10,
    search = "",
    sort = "createdAt:desc"
): Promise<{ data: CustomerRow[]; meta: PaginationMeta }> {
    const query = buildQueryString({ page, limit, search, sort });
    const path = query ? `/admin/customers?${query}` : "/admin/customers";
    const envelope = await apiRequest<CustomerRow[]>(path);
    const data = unwrapEnvelope(envelope, "Failed to fetch customers");

    return {
        data,
        meta: envelope.meta as PaginationMeta,
    };
}

export async function getCustomerById(id: string): Promise<CustomerDetail> {
    const envelope = await apiRequest<CustomerDetail>(`/admin/customers/${id}`);
    return unwrapEnvelope(envelope, "Failed to fetch customer detail");
}

export async function getCustomerAddresses(
    id: string,
    page = 1,
    limit = 10,
    sort = "createdAt:desc"
): Promise<{ data: Address[]; meta: PaginationMeta }> {
    const query = buildQueryString({ page, limit, sort });
    const envelope = await apiRequest<Address[]>(`/admin/customers/${id}/addresses?${query}`);
    const data = unwrapEnvelope(envelope, "Failed to fetch customer addresses");

    return {
        data,
        meta: envelope.meta as PaginationMeta,
    };
}

export async function getCustomerOrders(
    id: string,
    page = 1,
    limit = 10,
    sort = "createdAt:desc"
): Promise<{ data: CustomerOrder[]; meta: PaginationMeta }> {
    const query = buildQueryString({ page, limit, sort });
    const envelope = await apiRequest<CustomerOrder[]>(`/admin/customers/${id}/orders?${query}`);
    const data = unwrapEnvelope(envelope, "Failed to fetch customer orders");

    return {
        data,
        meta: envelope.meta as PaginationMeta,
    };
}

export async function toggleCustomerStatus(
    id: string,
    isActive: boolean
): Promise<ApiEnvelope<CustomerRow>> {
    return await apiRequest<CustomerRow>(
        `/admin/customers/${id}/status`,
        { is_active: isActive },
        { method: "PATCH" }
    );
}
