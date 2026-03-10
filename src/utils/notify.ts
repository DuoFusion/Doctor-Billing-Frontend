import { AxiosError } from "axios";
import { message } from "antd";

message.config({
  top: 84,
  duration: 2.6,
  maxCount: 3,
});

const open = (type: "success" | "error" | "warning" | "info", content: string, duration?: number) => {
  message.open({
    type,
    content,
    duration,
    className: `app-notify app-notify-${type}`,
  });
};

export const notify = {
  success: (content: string) => open("success", content),
  error: (content: string) => open("error", content, 3.2),
  warning: (content: string) => open("warning", content, 3),
  info: (content: string) => open("info", content),
};

export const getApiErrorMessage = (error: unknown, fallback: string) => {
  if ((error as AxiosError)?.isAxiosError) {
    const axiosError = error as AxiosError;
    const responseData = axiosError.response?.data as { message?: string } | undefined;
    return responseData?.message || fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
};
