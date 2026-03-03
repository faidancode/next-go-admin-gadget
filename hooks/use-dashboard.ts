import { useQuery } from "@tanstack/react-query";
import { getDashboardData } from "@/lib/api/dashboard";
import { DashboardResponse } from "@/types/dashboard";

export const useDashboard = () => {
    return useQuery<DashboardResponse>({
        queryKey: ["admin-dashboard"],
        queryFn: getDashboardData,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};
