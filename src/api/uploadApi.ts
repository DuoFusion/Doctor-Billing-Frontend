import { createApiClient } from "./client";
import { URL_KEYS } from "../constants/Url";

const API = createApiClient();

// ============ Upload Response Interface ============
export interface UploadResponse {
  filename: string;
  fileUrl: string;
}

// ============ Upload File ============
export const uploadFile = async (file: File) => {
  const form = new FormData();
  form.append("file", file);
  const response = await API.post<{ status: boolean; filename: string; fileUrl: string }>(
    URL_KEYS.UPLOAD.ADD,
    form
  );
  return response.data as UploadResponse;
};

// ============ Update File ============
export const updateFile = async (file: File, oldFileUrl?: string) => {
  const form = new FormData();
  form.append("file", file);
  if (oldFileUrl) form.append("oldFileUrl", oldFileUrl);
  const response = await API.put<{ status: boolean; filename: string; fileUrl: string }>(URL_KEYS.UPLOAD.UPDATE, form);
  return response.data as UploadResponse;
};

// ============ Delete File ============
export const deleteFile = async (fileUrl: string) => {
  const response = await API.delete(URL_KEYS.UPLOAD.DELETE, { data: { fileUrl } });
  return response.data;
};