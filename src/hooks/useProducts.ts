import { useQuery } from "@tanstack/react-query";
import { getAllProducts } from "../api";

// ============ Products by medical store ============
export const useProducts = (medicalStoreId: string, enabled = true) =>
  useQuery({
    queryKey: ["products", "dashboard", medicalStoreId],
    queryFn: () => getAllProducts({ medicalStoreId: medicalStoreId || undefined }),
    enabled,
  });
