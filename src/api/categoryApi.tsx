import { URL_KEYS } from "../constants/Url";
import { createApiClient } from "./client";

const API = createApiClient();

// ============ Get Categories ============
export const getCategories = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  order?: "asc" | "desc";
  addedBy?: string;
  medicalStoreId?: string;
  isActive?: boolean;
}) => {
  const response = await API.get(URL_KEYS.CATEGORY.GET_CATEGORIES, { params });
  return response.data;
};

// ============ Get Categories By Query ============
export const getCategoriesByQuery = async (params: {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  order?: "asc" | "desc";
  addedBy?: string;
  medicalStoreId?: string;
  isActive?: boolean;
}) => {
  const response = await API.get(URL_KEYS.CATEGORY.GET_CATEGORIES, { params });
  return response.data;
};

// ============ Add Category ============
export const addCategory = async (data: { name: string; userId?: string; medicalStoreId: string }) => {
  const response = await API.post(URL_KEYS.CATEGORY.ADD_CATEGORY, data);
  return response.data;
};

// ============ Update Category ============
export const updateCategory = async (data: { id: string; name: string; medicalStoreId?: string }) => {
  const { id, ...payload } = data;
  const response = await API.put(URL_KEYS.CATEGORY.UPDATE_CATEGORY.replace(":id", id),payload
  );
  return response.data;
};

// ============ Get Category By ID ============
export const getCategoryById = async (id: string) => {
  const response = await API.get(URL_KEYS.CATEGORY.GET_CATEGORY_BY_ID.replace(":id", id));
  return response.data;
};

// ============ Delete Category ============
export const deleteCategory = async (data: { id: string }) => {
  const response = await API.delete(URL_KEYS.CATEGORY.DELETE_CATEGORY.replace(":id", data.id)
  );
  return response.data;
};

// ============ Update Category Status ============
export const updateCategoryStatus = async (id: string, isActive: boolean) => {
  const response = await API.patch(URL_KEYS.CATEGORY.UPDATE_CATEGORY_STATUS.replace(":id", id),{ isActive });
  return response.data;
};
