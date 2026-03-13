import { URL_KEYS } from "../constants/Url";
import { createApiClient } from "./client";

const API = createApiClient();

export type DashboardStatsResponse = {
  status: boolean;
  message: string;
  stats: { bills: number; paidBills: number; dueBills: number; paidAmount: number; dueAmount: number; products: number; companies: number; categories: number; users: number; };
};

export const getDashboardStats = async (params?: { medicalStoreId?: string; fromDate?: string; toDate?: string; companyId?: string }) => {
  const response = await API.get<DashboardStatsResponse>(URL_KEYS.DASHBOARD.GET_STATS, {
    params,
  });
  return response.data;
};
