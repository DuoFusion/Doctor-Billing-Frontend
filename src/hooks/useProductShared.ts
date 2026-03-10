import { Form } from "antd";
import type { ProductFormValues, ProductRow, UserRecord } from "../types";
import { resolveOwnerUserId } from "../utils/medicalStoreScope";
import { resolveObjectId, resolveUserMedicalStoreId } from "../utils/medicalStoreScope";

// ============ Build today's date for input ============
export const getTodayDateInputValue = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// ============ Strict YYYY-MM-DD parser ============
export const parseStrictDateInput = (value: string) => {
  const text = String(value || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return null;

  const [year, month, day] = text.split("-").map(Number);
  const parsed = new Date(year, month - 1, day);
  if (parsed.getFullYear() !== year || parsed.getMonth() !== month - 1 || parsed.getDate() !== day) return null;

  parsed.setHours(0, 0, 0, 0);
  return parsed;
};

// ============ Added by name ============
export const getAddedByName = (product: ProductRow) => {
  const owner = product.user || product.userId;
  return owner && typeof owner === "object" ? owner.name || "-" : "-";
};

// ============ Added by email ============
export const getAddedByEmail = (product: ProductRow) => {
  const owner = product.user || product.userId;
  return owner && typeof owner === "object" ? owner.email || "-" : "-";
};

// ============ Resolve selected medical store for form ============
export const getSelectedMedicalStoreId = ({
  isAdmin,
  isEdit,
  selectedUserId,
  currentUserMedicalStoreId,
  users,
  productData,
}: {
  isAdmin: boolean;
  isEdit: boolean;
  selectedUserId: string;
  currentUserMedicalStoreId: string;
  users: UserRecord[];
  productData: any;
}) => {
  if (!isAdmin) return currentUserMedicalStoreId;

  if (isEdit) {
    const ownerId = resolveOwnerUserId(productData);
    const ownerUser = users.find((user) => user._id === ownerId);
    return resolveUserMedicalStoreId(ownerUser) || resolveObjectId(productData?.medicalStoreId);
  }

  if (!selectedUserId) return "";
  const selectedUser = users.find((user) => user._id === selectedUserId);
  return resolveUserMedicalStoreId(selectedUser);
};

// ============ Fill edit form data ============
export const setProductFormValues = (
  form: ReturnType<typeof Form.useForm<ProductFormValues>>[0],
  productData: any
) => {
  form.setFieldsValue({
    name: productData?.name || "",
    category: productData?.category || "",
    company: productData?.company?._id || "",
    userId: resolveOwnerUserId(productData),
  });
};
