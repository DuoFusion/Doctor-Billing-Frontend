import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "../api/dashboardApi";
import type { DashboardStatsResponse } from "../types";

export const useDashboardStats = (medicalStoreId: string, enabled = true) =>
  useQuery<DashboardStatsResponse>({
    queryKey: ["dashboardStats", medicalStoreId],
    queryFn: () => getDashboardStats(medicalStoreId || undefined),
    enabled,
  });
