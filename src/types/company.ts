import type { MedicalStoreRef, PaginationMeta } from "./common";

export type CompanyUser = {
  _id: string;
  name?: string;
  email?: string;
  role?: string;
};

export type CompanyFormValues = {
  name: string;
  gstNumber: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  pincode: string;
  address: string;
  userId?: string;
  medicalStoreId?: string;
};

export type CompanyStatusTab = "active" | "inactive";

export type CompanyRecord = {
  _id: string;
  name: string;
  gstNumber: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string | number;
  logoImage?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  user?: CompanyUser | string;
  userId?: CompanyUser | string;
  medicalStoreId?: MedicalStoreRef;
  addedByName?: string;
  addedByEmail?: string;
};

export type CompanyListResponse = {
  status: boolean;
  companies: CompanyRecord[];
  pagination: PaginationMeta;
};

export type CompanyListApiResponse = {
  status: boolean;
  companies?: CompanyRecord[];
  data?: CompanyRecord[];
  pagination?: PaginationMeta;
  message?: string;
};
