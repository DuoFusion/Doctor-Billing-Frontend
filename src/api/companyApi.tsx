import { URL_KEYS } from "../constants/Url";
import type { CompanyListApiResponse, CompanyListResponse, CompanyRecord } from "../types";
import { createApiClient } from "./client";
import { uploadFile } from "./uploadApi";

export type { CompanyUser, CompanyRecord, CompanyListResponse, CompanyListApiResponse } from "../types";

const API = createApiClient();

// ============ Normalize Company List Response ============
const normalizeCompanyListResponse = (payload: CompanyListApiResponse): CompanyListResponse => {
  const companies = Array.isArray(payload.companies) ? payload.companies : Array.isArray(payload.data) ? payload.data : [];

  const total = companies.length;

  return {
    status: payload.status,
    companies,
    pagination: payload.pagination || {
      page: 1,
      limit: total || 1,
      total,
      totalPages: total > 0 ? 1 : 0,
    },
  };
};

// ============ Get All Companies ============
export const getAllCompanies = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  addedBy?: string;
  sortBy?: string;
  order?: "asc" | "desc";
  medicalStoreId?: string;
  isActive?: boolean;
  all?: boolean;
}) => {
  const response = await API.get<CompanyListApiResponse>(URL_KEYS.COMPANY.GET_COMPANY, {
    params: { all: true, ...params },
  });
  return normalizeCompanyListResponse(response.data);
};

// ============ Get All Companies By Query ============
export const getAllCompaniesByQuery = async (params: {
  page?: number;
  limit?: number;
  search?: string;
  addedBy?: string;
  sortBy?: string;
  order?: "asc" | "desc";
  medicalStoreId?: string;
  isActive?: boolean;
  all?: boolean;
}) => {
  const response = await API.get<CompanyListApiResponse>(URL_KEYS.COMPANY.GET_COMPANY, {
    params,
  });
  return normalizeCompanyListResponse(response.data);
};

// ============ Delete Company ============
export const deleteCompany = async (id: string) => {
  const response = await API.delete(URL_KEYS.COMPANY.DELETE_COMPANY.replace(":id", id));
  return response.data;
};

// ============ Add Company ============
export const addCompany = async (data: any) => {
  const payload: any = { ...data };
  if (payload.logo instanceof File) {
    const { fileUrl } = await uploadFile(payload.logo);
    payload.logoImage = fileUrl;
    delete payload.logo;
  }
  const response = await API.post(URL_KEYS.COMPANY.ADD_COMPANY, payload);
  return response.data;
};

// ============ Get Company By ID ============
export const getCompanyById = async (id: string, medicalStoreId?: string) => {
  const response = await API.get(URL_KEYS.COMPANY.GET_COMPANY_BY_ID.replace(":id", id), {
    params: medicalStoreId ? { medicalStoreId } : undefined,
  });
  return response.data as CompanyRecord;
};

// ============ Update Company ============
export const updateCompany = async (id: string, data: any) => {
  const payload: any = { ...data };
  if (payload.logo instanceof File) {
    const { fileUrl } = await uploadFile(payload.logo);payload.logoImage = fileUrl; delete payload.logo;
  }
  const response = await API.put(URL_KEYS.COMPANY.UPDATE_COMPANY.replace(":id", id), payload);
  return response.data;
};

// ============ Update Company Status ============
export const updateCompanyStatus = async (id: string, isActive: boolean) => {
  const response = await API.patch(URL_KEYS.COMPANY.UPDATE_COMPANY_STATUS.replace(":id", id),{ isActive }
  );
  return response.data;
};
