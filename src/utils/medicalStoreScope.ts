//================ Resolve single ObjectId from different formats =============
export const resolveObjectId = (value: unknown): string => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && "_id" in (value as Record<string, unknown>)) {
    return String((value as { _id?: string })._id || "");
  }
  return "";
};

//================ Resolve list of ObjectIds from array ======================
export const resolveObjectIdList = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value.map((entry) => resolveObjectId(entry)).filter(Boolean);
};

//================ Get single medical store ID from user record ==============
export const resolveUserMedicalStoreId = (userRecord: any): string => {
  const directStoreId = resolveObjectId(userRecord?.medicalStoreId);
  if (directStoreId) return directStoreId;

  const legacyStoreIds = resolveObjectIdList(userRecord?.medicalStoreIds);
  return legacyStoreIds[0] || "";
};

//================ Get all medical store IDs for a user ======================
export const resolveUserMedicalStoreIds = (userRecord: any): string[] => {
  const storeId = resolveUserMedicalStoreId(userRecord);
  return storeId ? [storeId] : [];
};

//================ Resolve owner user ID from different record formats =======
export const resolveOwnerUserId = (record: any): string =>
  resolveObjectId(record?.userId || record?.user);

//================ Filter stores based on allowed store IDs ==================
export const filterStoresByIds = <T extends { _id: string }>(
  stores: T[],
  allowedStoreIds: string[]
) => {
  if (!allowedStoreIds.length) return [];
  const allowed = new Set(allowedStoreIds.map((id) => String(id)));
  return stores.filter((store) => allowed.has(String(store._id)));
};