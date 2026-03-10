import { URL_KEYS } from "../constants/Url";
import type { MedicalStoreRecord, StoreListResponse } from "../types";
import { createApiClient } from "./client";
import { uploadFile } from "./uploadApi";

export type { MedicalStoreRecord, StoreListResponse } from "../types";

const API = createApiClient();

// ============ Normalize Store List ============
const normalizeStoreList = (payload: any): StoreListResponse => {
  const stores: MedicalStoreRecord[] = Array.isArray(payload.stores)
    ? payload.stores
    : Array.isArray(payload.data)
    ? payload.data
    : [];
  const total = payload.pagination?.total || stores.length;
  return {
    status: payload.status,
    stores,
    pagination: payload.pagination || {
      page: 1,
      limit: total || 1,
      total,
      totalPages: total > 0 ? 1 : 0,
    },
  };
};

// ============ Get All Medical Stores ============
export const getAllMedicalStores = async () => {
  const response = await API.get(URL_KEYS.MEDICAL_STORE.GET_STORES);
  return normalizeStoreList(response.data);
};

// ============ Get All Medical Stores By Query ============
export const getAllMedicalStoresByQuery = async (params: { page?: number; limit?: number; search?: string; isActive?: boolean; }) => {
  const response = await API.get(URL_KEYS.MEDICAL_STORE.GET_STORES, { params });
  return normalizeStoreList(response.data);
};

// ============ Get Medical Store By ID ============
export const getMedicalStoreById = async (id: string) => {
  const response = await API.get(URL_KEYS.MEDICAL_STORE.GET_STORE_BY_ID.replace(":id", id));
  return response.data as MedicalStoreRecord;
};

// ============ Add Medical Store ============
export const addMedicalStore = async (data: any) => {
  const payload: any = { ...data };
  if (payload.signatureImg instanceof File) {
    const { fileUrl } = await uploadFile(payload.signatureImg);
    payload.signatureImg = fileUrl;
  }
  const response = await API.post(URL_KEYS.MEDICAL_STORE.ADD_STORE, payload);
  return response.data;
};

// ============ Update Medical Store ============
export const updateMedicalStore = async (_id: string, data: any) => {
  const payload: any = { ...data };
  if (payload.signatureImg instanceof File) {
    const { fileUrl } = await uploadFile(payload.signatureImg);
    payload.signatureImg = fileUrl;
  }
  const response = await API.put(
    URL_KEYS.MEDICAL_STORE.UPDATE_STORE.replace(":id", _id),
    payload
  );
  return response.data;
};

// ============ Update Medical Store Status ============
export const updateMedicalStoreStatus = async (id: string, isActive: boolean) => {
  const response = await API.patch( URL_KEYS.MEDICAL_STORE.UPDATE_STORE_STATUS.replace(":id", id), { isActive });
  return response.data;
};

// ============ Delete Medical Store ============
export const deleteMedicalStore = async (id: string) => {
  const response = await API.delete( URL_KEYS.MEDICAL_STORE.DELETE_STORE.replace(":id", id));
  return response.data;
};
