import { URL_KEYS } from "../constants/Url";
import type { UserListResponse, UserUpsertPayload } from "../types";
import { createApiClient } from "./client";
import { uploadFile } from "./uploadApi";

export type { UserRole, UserRecord, UserListResponse, UserUpsertPayload } from "../types";

const API = createApiClient();

// ============ Normalize User Payload ============
const normalizeUserPayload = (data: FormData | UserUpsertPayload | any) => {
  if (!(data instanceof FormData)) return { ...data };

  const payload: any = Object.fromEntries(data.entries());
  const selectedStoreId = String(data.get("medicalStoreId") || "").trim();
  if (selectedStoreId) payload.medicalStoreId = selectedStoreId;

  return payload;
};

// ============ Add User ============
export const addUser = async (data: FormData | any) => {
  const payload = normalizeUserPayload(data);
  if (payload.signatureImg instanceof File) {
    const { fileUrl } = await uploadFile(payload.signatureImg);
    payload.signatureImg = fileUrl;
  }
  const response = await API.post(URL_KEYS.USER.ADD_USER, payload);
  return response.data;
};

// ============ Get All Users ============
export const getAllUsers = async () => {
  const response = await API.get<UserListResponse>(URL_KEYS.USER.GET_USERS);
  return response.data;
};

// ============ Get All Users By Query ============
export const getAllUsersByQuery = async (params: { page?: number; limit?: number; search?: string; isActive?: boolean; }) => {
  const response = await API.get<UserListResponse>(URL_KEYS.USER.GET_USERS, { params });
  return response.data;
};

// ============ Get User By ID ============
export const getUserById = async (id: string) => {
  const response = await API.get(URL_KEYS.USER.GET_USER_BY_ID.replace(":id", id));
  return response.data;
};

// ============ Update User ============
export const updateUser = async (id: string, data: FormData | any) => {
  const payload = normalizeUserPayload(data);
  if (payload.signatureImg instanceof File) {
    const { fileUrl } = await uploadFile(payload.signatureImg);
    payload.signatureImg = fileUrl;
  }
  const response = await API.put(URL_KEYS.USER.UPDATE_USER.replace(":id", id), payload);
  return response.data;
};

// ============ Update User Status ============
export const updateUserStatus = async (id: string, isActive: boolean) => {
  const response = await API.patch(URL_KEYS.USER.UPDATE_USER_STATUS.replace(":id", id), { isActive });
  return response.data;
};

// ============ Delete User ============
export const deleteUser = async (id: string) => {
  const response = await API.delete(URL_KEYS.USER.DELETE_USER.replace(":id", id));
  return response.data;
};
