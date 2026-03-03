import { DashboardResponse } from "@/types/dashboard";
import { apiRequest, unwrapEnvelope } from "./fetcher";

export async function getDashboardData(): Promise<DashboardResponse> {
    const envelope = await apiRequest<DashboardResponse>("/admin/dashboard");
    return unwrapEnvelope(envelope, "Failed to fetch dashboard data");
}
