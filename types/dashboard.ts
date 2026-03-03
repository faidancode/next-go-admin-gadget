export interface DashboardStats {
    totalProducts: number;
    totalBrands: number;
    totalCategories: number;
    totalCustomers: number;
    totalOrders: number;
    totalRevenue: number;
}

export interface RecentOrder {
    id: string;
    orderNumber: string;
    totalAmount: number;
    status: string;
    customer: string;
    date: string;
}

export interface CategoryDistribution {
    categoryName: string;
    count: number;
}

export interface DashboardResponse {
    stats: DashboardStats;
    recentOrders: RecentOrder[];
    categoryDistribution: CategoryDistribution[];
}
