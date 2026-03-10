import type { UserRecord } from "./common";

export type ProfileAsset = {
  path?: string;
  filename?: string;
  originalName?: string;
  size?: number;
};

export type ProfileMedicalStoreRef = string | { _id?: string; name?: string };

export type CurrentUserProfile = Omit<UserRecord, "medicalStoreId" | "signatureImg"> & {
  medicalStoreId?: ProfileMedicalStoreRef;
  medicalStoreIds?: ProfileMedicalStoreRef[];
  signatureImg?: ProfileAsset;
};

export type CurrentUserResponse = {
  status?: boolean;
  message?: string;
  token?: string;
  user?: CurrentUserProfile;
};

export type ProfileUpdateResponse = CurrentUserResponse;

export type ProfileFormValues = {
  name: string;
  email: string;
  phone: string;
};

export type ProfileMedicalFormValues = ProfileFormValues & {
  storeName?: string;
  taxType?: "SGST_CGST" | "IGST";
  taxPercent?: number | string;
  gstNumber?: string;
  panNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
};
