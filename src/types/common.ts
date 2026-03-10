export type UserRole = "admin" | "user";

export type MedicalStoreRef = string | { _id: string; name?: string };

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type UserRecord = {
  _id: string;
  name: string;
  medicalName?: string;
  email: string;
  role: UserRole;
  medicalStoreId?: MedicalStoreRef;
  isActive?: boolean;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  pan?: string;
  gstin?: string;
  signatureImg?: any;
  createdAt?: string;
  updatedAt?: string;
};

export type UserListResponse = {
  status: boolean;
  message: string;
  users: UserRecord[];
  pagination: PaginationMeta;
};

export type UserUpsertPayload = {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  medicalStoreId: string;
};

export type MedicalStoreRecord = {
  _id: string;
  name: string;
  taxType?: "SGST_CGST" | "IGST";
  taxPercent?: number;
  gstNumber?: string;
  panNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string | number;
  signatureImg?: any;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type StoreListResponse = {
  status: boolean;
  stores: MedicalStoreRecord[];
  pagination: PaginationMeta;
};

export type StoreFormValues = {
  name: string;
  taxType: "SGST_CGST" | "IGST";
  taxPercent: number | string;
  gstNumber: string;
  panNumber: string;
  city: string;
  state: string;
  pincode: string;
  address: string;
  signatureImg?: any;
  removeSignature?: boolean;
};

export type MedicalStoreStatusTab = "active" | "inactive";

export type CategoryFormValues = {
  name: string;
  userId?: string;
};

export type CategoryStatusTab = "active" | "inactive";

export type CategoryRecord = {
  _id: string;
  name: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  medicalStoreId?: string | { _id?: string; name?: string };
  userId?: {
    _id?: string;
    name?: string;
    email?: string;
  } | string;
};

export type UserCategoryDoc = {
  _id: string;
  name?: string;
  userId?: { _id?: string } | string;
  medicalStoreId?: { _id?: string } | string;
};

export type CategoriesResponse = {
  data?: UserCategoryDoc[];
};

export type CategorySuggestionRow = {
  key: string;
  categoryName: string;
  isDuplicate: boolean;
};
