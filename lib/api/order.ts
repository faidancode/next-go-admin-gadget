import { ApiEnvelope, PaginationMeta } from "@/types/api";
import {
    ApiError,
    apiRequest,
    buildQueryString,
    unwrapEnvelope,
} from "./fetcher";
import { OrderDetail, OrderListResponse, OrderRow, UpdateOrderPayload } from "@/types/order";

export type OrderStatus =
    | "PENDING"
    | "PAID"
    | "PROCESSING"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED";


const toDate = (value?: Date | string | null) =>
    value ? new Date(value as string) : value ?? null;

export async function getOrders(
    status = "PAID",
    page = 1,
    limit = 10,
    search = "",
    sort = "placedAt:desc"
): Promise<OrderListResponse> {
    const query = buildQueryString({ status, page, limit, search, sort });
    const path = query ? `/admin/orders?${query}` : "/admin/orders";
    const envelope = await apiRequest<OrderRow[]>(path);
    const data = unwrapEnvelope(envelope, "Failed to fetch orders");

    return {
        data,
        meta: envelope.meta as PaginationMeta,
    };
}

export async function getOrderById(id: string): Promise<OrderDetail> {
    const envelope = await apiRequest<OrderDetail>(`/admin/orders/${id}`);
    const data = unwrapEnvelope(envelope, "Failed to fetch order detail");

    return {
        ...data,
        customer: data.customer ?? null,
        createdAt: toDate(data.placedAt),
        updatedAt: toDate(data.updatedAt),
    };
}

export async function updateOrder(
    id: string,
    payload: UpdateOrderPayload
): Promise<ApiEnvelope<OrderDetail>> {
    if (!payload.nextStatus && !payload.receiptNo) {
        throw new ApiError(400, "Nothing to update");
    }

    const envelope = await apiRequest<OrderDetail>(
        `/admin/orders/${id}/status`,
        payload,
        { method: "PATCH" }
    );
    console.log({ envelope })

    return {
        ...envelope,
        // We must update the 'data' field specifically
        data: {
            ...envelope.data,
            createdAt: toDate(envelope.data.placedAt),
            updatedAt: toDate(envelope.data.updatedAt),
        },
    };
}

export async function markOrderDelivered(id: string) {
    const envelope = await apiRequest<OrderDetail>(
        `/admin/orders/${id}/status`,
        { nextStatus: "DELIVERED" },
        { method: "PATCH" }
    );

    return {
        ...envelope,
        // We must update the 'data' field specifically
        data: {
            ...envelope.data,
            createdAt: toDate(envelope.data.createdAt),
            updatedAt: toDate(envelope.data.updatedAt),
        },
    };
}
