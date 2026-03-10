import { URL_KEYS } from "../constants/Url";
import { clearAuthToken, createApiClient } from "./client";
import { uploadFile } from "./uploadApi";

const API = createApiClient();

// ============ Interfaces ============

// ============ Signin Payload ============
export interface SigninPayload {
  email: string;
  password: string;
}

// ============ Verify OTP Payload ============
export interface VerifyOtpPayload {
  email: string;
  otp: string;
  purpose?: "signin" | "reset";
}

// ============ Update Profile Payload ============
export interface UpdateProfilePayload {
  name?: string;
  medicalName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  pan?: string;
  gstin?: string;
  removeSignature?: boolean;
}

// ============ Change Password Payload ============
export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// ============ Forgot Password Send OTP Payload ============
export interface ForgotPasswordSendOtpPayload {
  email: string;
}

// ============ Forgot Password Reset Payload ============
export interface ForgotPasswordResetPayload {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}


// ============ Sign In User ============
export const signinUser = async (data: SigninPayload) => {
  const response = await API.post(URL_KEYS.AUTH.SIGNIN, data);
  return response.data;
};

// ============ Verify OTP User ============
export const verifyOtpUser = async (data: VerifyOtpPayload) => {
  const response = await API.post(URL_KEYS.AUTH.OTP_VERIFICATION, data);
  return response.data;
};

// ============ Get Current User ============
export const getCurrentUser = async () => {
  const response = await API.get(URL_KEYS.AUTH.GET_CURRENT_USER);
  return response.data;
};

// ============ Sign Out User ============
export const signout = async () => {
  try {
    const response = await API.post(URL_KEYS.AUTH.SIGNOUT, {});
    return response.data;
  } finally {
    clearAuthToken();
  }
};

// ============ Update User Profile ============
export const updateUserProfile = async (data: FormData | UpdateProfilePayload) => {
  let payload: any;

  if (data instanceof FormData) {
    payload = Object.fromEntries(data.entries());
  } else {
    payload = { ...data };
  }

  if (payload.signatureImg instanceof File) {
    const { fileUrl } = await uploadFile(payload.signatureImg);
    payload.signatureImg = fileUrl;
  }

  const response = await API.put(URL_KEYS.AUTH.UPDATE_PROFILE, payload);
  return response.data;
};

// ============ Change User Password ============
export const changeUserPassword = async (data: ChangePasswordPayload) => {
  const response = await API.put(URL_KEYS.AUTH.CHANGE_PASSWORD, data);
  return response.data;
};

// ============ Send Forgot Password OTP ============
export const sendForgotPasswordOtp = async (data: ForgotPasswordSendOtpPayload) => {
  const response = await API.post(URL_KEYS.AUTH.FORGOT_PASSWORD_SEND_OTP, data);
  return response.data;
};

// ============ Reset Forgot Password ============
export const resetForgotPassword = async (data: ForgotPasswordResetPayload) => {
  const response = await API.put(URL_KEYS.AUTH.FORGOT_PASSWORD_RESET, data);
  return response.data;
};