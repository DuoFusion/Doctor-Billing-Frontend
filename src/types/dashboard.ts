export type DashboardStats = {
  bills: number;
  products: number;
  companies: number;
  categories: number;
  users: number;
};

export type DashboardStatsResponse = {
  status: boolean;
  message: string;
  stats: DashboardStats;
};
