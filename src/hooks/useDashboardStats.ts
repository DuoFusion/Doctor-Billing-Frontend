import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "../api/dashboardApi";
import type { DashboardStatsResponse } from "../types";

export const useDashboardStats = ( medicalStoreId: string, fromDate?: string, toDate?: string, enabled = true, companyId?: string) =>
  useQuery<DashboardStatsResponse>({
    queryKey: ["dashboardStats", medicalStoreId, fromDate, toDate, companyId],
    queryFn: () =>
      getDashboardStats({
        ...(medicalStoreId ? { medicalStoreId } : {}),
        ...(fromDate ? { fromDate } : {}),
        ...(toDate ? { toDate } : {}),
        ...(companyId ? { companyId } : {}),
      }),
    enabled,
  });
