import { URL_KEYS } from "../constants/Url";
import { createApiClient } from "./client";

const API = createApiClient();

export type DashboardStatsResponse = {
  status: boolean;
  message: string;
  stats: {
    bills: number;
    products: number;
    companies: number;
    categories: number;
    users: number;
  };
};

export const getDashboardStats = async (medicalStoreId?: string) => {
  const response = await API.get<DashboardStatsResponse>(URL_KEYS.DASHBOARD.GET_STATS, {
    params: {
      ...(medicalStoreId ? { medicalStoreId } : {}),
    },
  });
  return response.data;
};
