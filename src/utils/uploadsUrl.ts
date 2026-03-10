import { URL_KEYS } from "../constants/Url";

const resolveUploadAssetName = (assetPath: string) => {
  const normalizedPath = assetPath.replace(/\\/g, "/");
  const parts = normalizedPath.split("/").filter(Boolean);
  return parts.length > 0 ? parts[parts.length - 1] : "";
};

const buildUploadAssetUrl = (assetPath?: string | null) => {
  if (!assetPath) return "";
  if (assetPath.startsWith("http")) return assetPath;

  const assetName = resolveUploadAssetName(assetPath);
  if (!assetName) return "";

  const baseUrl = (import.meta.env.VITE_BACKEND_BASE_URL || "").replace(/\/+$/, "");
  return `${baseUrl}${URL_KEYS.UPLOAD.GET_IMAGE}/${encodeURIComponent(assetName)}`;
};

export const getCompanyLogoUrl = (logoImage?: string | null) => {
  return buildUploadAssetUrl(logoImage);
};

export const getSignatureImageUrl = (
  signature?: string | { path?: string; filename?: string } | null
) => {
  if (typeof signature === "string") {
    return buildUploadAssetUrl(signature);
  }
  return buildUploadAssetUrl(signature?.filename || signature?.path || "");
};

