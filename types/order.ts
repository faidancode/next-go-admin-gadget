import { PaginationMeta } from "./api";

// Sesuai dengan type OrderItemResponse di Go
export type OrderItem = {
    id: string;
    productId: string;
    productImageUrl: string;
    productSlug: string;
    nameSnapshot: string;
    unitPrice: number;
    quantity: number;
    subtotal: number;
};

// Sesuai dengan type OrderResponse di Go (digunakan di List)
export type OrderRow = {
    id: string;
    orderNumber: string;
    status: string;
    paymentStatus: string;
    subtotalPrice: number;
    shippingPrice: number;
    totalPrice: number;
    placedAt: string; // ISO String dari time.Time
    receiptNo?: string | null;
    snapToken?: string | null;
    snapRedirectUrl?: string | null;
    items?: OrderItem[]; // Optional karena di Go pakai omitempty
};

// Sesuai dengan type OrderDetailResponse di Go
export type OrderDetail = {
    id: string;
    orderNumber: string;
    userId: string;
    status: string;
    totalPrice: number;
    note: string;
    receiptNo?: string;
    placedAt: string;
    createdAt?: string | Date | undefined | null;
    updatedAt?: string | Date | undefined | null;
    customer: CustomerOrderResponse;
    items: OrderItem[];
};

// Sesuai dengan type ListOrderResponse di Go
export type OrderListResponse = {
    data: OrderRow[];
    meta: PaginationMeta;
};

// Sesuai dengan type UpdateStatusAdminRequest di Go
export type UpdateOrderPayload = {
    nextStatus: string;
    receiptNo?: string | null;
};

export type CustomerOrderResponse = {
    email: string;
    firstName: string;
    lastName: string;
}