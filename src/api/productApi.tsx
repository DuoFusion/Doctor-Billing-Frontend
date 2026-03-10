import { URL_KEYS } from "../constants/Url";
import { createApiClient } from "./client";

const API = createApiClient();

// ============ Get All Products ============
export const getAllProducts = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  sortBy?: string;
  order?: "asc" | "desc";
  billable?: boolean;
  medicalStoreId?: string;
  isActive?: boolean;
}) => {
  const response = await API.get(URL_KEYS.PRODUCT.GET_PRODUCT, { params });
  return response.data;
};

// ============ Get All Products By Query ============
export const getAllProductsByQuery = async (params: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  sortBy?: string;
  order?: "asc" | "desc";
  billable?: boolean;
  medicalStoreId?: string;
  isActive?: boolean;
}) => {
  const response = await API.get(URL_KEYS.PRODUCT.GET_PRODUCT, { params });
  return response.data;
};

// ============ Get Billable Products ============
export const getBillableProducts = async (medicalStoreId?: string) => {
  const response = await API.get(URL_KEYS.PRODUCT.GET_PRODUCT, {
    params: {
      billable: true,
      ...(medicalStoreId ? { medicalStoreId } : {}),
    },
  });
  return response.data;
};

// ============ Add Product ============
export const addProduct = async (data: any) => {
  const response = await API.post(URL_KEYS.PRODUCT.ADD_PRODUCT,data);
  return response.data;
};

// ============ Get Product By ID ============
export const getProductById = async (id: string, medicalStoreId?: string) => {
  const response = await API.get(URL_KEYS.PRODUCT.GET_PRODUCT_BY_ID.replace(":id", id), {
    params: medicalStoreId ? { medicalStoreId } : undefined,
  });
  return response.data;
};

// ============ Update Product ============
export const updateProduct = async (id: string, data: any) => {
  const response = await API.put(URL_KEYS.PRODUCT.UPDATE_PRODUCT.replace(":id", id), data);
  return response.data;
};

// ============ Update Product Status ============
export const updateProductStatus = async (id: string, isActive: boolean) => {
  const response = await API.patch(URL_KEYS.PRODUCT.UPDATE_PRODUCT_STATUS.replace(":id", id), { isActive });
  return response.data;
};

// ============ Delete Product ============
export const deleteProduct = async (id: string) => {
  const response = await API.delete(
    URL_KEYS.PRODUCT.DELETE_PRODUCT.replace(":id", id)
  );
  return response.data;
};
