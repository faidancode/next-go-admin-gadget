import { PaginationMeta } from "./api";

export interface Address {
    id: string;
    addressName: string;
    receiverName: string;
    phone: string;
    fullAddress: string;
    isMain: boolean;
}

export interface CustomerOrder {
    id: string;
    orderNumber: string;
    totalAmount: number;
    status: string;
    createdAt: string;
}

export interface CustomerRow {
    id: string;
    name: string;
    email: string;
    phone: string;
    isActive: boolean;
    createdAt: string;
}

export interface CustomerDetail {
    id: string;
    name: string;
    email: string;
    phone: string;
    isActive: boolean;
    createdAt: string;
}

export interface CustomerListResponse {
    data: CustomerRow[];
    meta: PaginationMeta;
}
