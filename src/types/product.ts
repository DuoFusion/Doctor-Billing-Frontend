export type ProductFormValues = {
  name: string;
  category: string;
  company: string;
  userId?: string;
  medicalStoreId?: string;
};

export type ProductStatusTab = "active" | "inactive";

export type ProductRow = {
  _id: string;
  name: string;
  category?: string;
  company?: { _id: string; name: string };
  user?: { _id: string; name: string; email: string; role: string };
  userId?: { _id: string; name: string; email: string; role: string } | string;
  medicalStoreId?: string | { _id?: string; name?: string };
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
};
