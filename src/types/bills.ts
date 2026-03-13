import type { CompanyRecord } from "./company";
import type { MedicalStoreRecord, MedicalStoreRef, PaginationMeta, UserRecord } from "./common";

export type BillStatusTab = "active" | "inactive";

export type BillFormItem = {
  product: string;
  name: string;
  qty: number;
  freeQty: number;
  category?: string;
  mrp?: number;
  rate: number;
};

export type BillProductRef = {
  _id?: string;
  name?: string;
  category?: string;
  expiry?: string;
  mrp?: number;
  sellingPrice?: number;
};

export type BillItemRecord = {
  product?: BillProductRef | string;
  company?: Pick<CompanyRecord, "_id" | "name" | "logoImage" | "address" | "city" | "state" | "pincode" | "phone" | "email" | "gstNumber"> | string;
  name?: string;
  qty?: number;
  freeQty?: number;
  category?: string;
  mrp?: number;
  rate?: number;
  total?: number;
  sellingPrice?: number;
  expiry?: string;
  sgst?: number;
  cgst?: number;
  igst?: number;
};

export type BillRecord = {
  _id: string;
  billStatus: string;
  billNumber: string;
  purchaseDate?: string;
  company?: Pick<CompanyRecord, "_id" | "name" | "logoImage" | "address" | "city" | "state" | "pincode" | "phone" | "email" | "gstNumber"> | string;
  companyName?: string;
  medicalStore?: MedicalStoreRecord | string;
  medicalStoreId?: MedicalStoreRef;
  items: BillItemRecord[];
  totalGST?: number;
  subTotal?: number;
  grandTotal?: number;
  gstEnabled?: boolean;
  createdAt?: string;
  updatedAt?: string;
  user?: UserRecord | string;
  userId?: UserRecord | string;
  isActive?: boolean;
  paymentMethod?: string;
  discount?: number;
};

export type BillListResponse = {
  status: boolean;
  bills: BillRecord[];
  pagination: PaginationMeta;
  message?: string;
};

export type BillLike = Pick<
  BillRecord,
  "_id" | "billStatus" | "billNumber" | "items" | "company" | "purchaseDate" | "totalGST" | "subTotal" | "grandTotal" | "userId"
>;
