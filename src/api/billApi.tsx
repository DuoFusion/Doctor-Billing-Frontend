import { URL_KEYS } from "../constants/Url";
import { createApiClient } from "./client";

const API = createApiClient();

// ============ Get All Bills (With Query Filters) ============
export const getAllBillsByQuery = async (params: {
  page?: number;
  limit?: number;
  search?: string;
  fromDate?: string;
  toDate?: string;
  quickDate?: "today" | "yesterday" | "tomorrow";
  medicalStoreId?: string;
  companyId?: string;
  isActive?: boolean;
}) => {
  const response = await API.get(URL_KEYS.BILL.GET_BILLS, { params });
  return response.data;
};

// ============ Get Bill By ID ============
export const getBillById = async (id: string, medicalStoreId?: string) => {
  const response = await API.get(
    URL_KEYS.BILL.GET_BILL_BY_ID.replace(":id", id),
    { params: medicalStoreId ? { medicalStoreId } : undefined }
  );
  return response.data;
};

// ============ Add Bill ============
export const addBill = async (data: {
  billNumber: string;
  purchaseDate: string;
  userId: string;
  medicalStoreId?: string;
  company?: string;
  gstEnabled?: boolean;
  items: {
    product: string;
    qty: number;
    freeQty?: number;
  }[];
  paymentMethod: string;
  discount?: number;
}) => {
  const response = await API.post( URL_KEYS.BILL.ADD_BILL, data );
  return response.data;
};

// ============ Update Bill ============
export const updateBill = async (
  id: string,
  data: {
    billNumber: string;
    purchaseDate: string;
    userId: string;
    medicalStoreId?: string;
    company?: string;
    gstEnabled?: boolean;
    items: {
      product: string;
      qty: number;
      freeQty?: number;
    }[];
    paymentMethod: string;
    discount?: number;
  }
) => {
  const response = await API.put( URL_KEYS.BILL.UPDATE_BILL.replace(":id", id),data);
  return response.data;
};

// ============ Delete Bill ============
export const deleteBill = async (id: string) => {
  const response = await API.delete(URL_KEYS.BILL.DELETE_BILL.replace(":id", id));
  return response.data;
};

// ============ Update Bill Status ============
export const updateBillStatus = async (id: string, isActive: boolean) => {
  const response = await API.patch(URL_KEYS.BILL.UPDATE_BILL_STATUS.replace(":id", id), { isActive });
  return response.data;
};
