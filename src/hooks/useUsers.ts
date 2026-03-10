import { useMutation, useQuery, useQueryClient, type QueryClient, type UseQueryOptions } from "@tanstack/react-query";
import { getAllUsers, getCurrentUser, setAuthToken, signout } from "../api";
import type { CurrentUserProfile, CurrentUserResponse, ProfileUpdateResponse, UserRecord } from "../types";
import { getApiErrorMessage, notify } from "../utils/notify";

// ============ Current logged-in user ============
export const useCurrentUser = (
  options?: Omit<UseQueryOptions<CurrentUserResponse>, "queryKey" | "queryFn">
) =>
  useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
    ...options,
  });

// ============ Get normalized current user record ============
export const getCurrentUserRecord = (data?: CurrentUserResponse) =>
  data?.user as CurrentUserProfile | undefined;

// ============ Sync current user cache after profile update ============
export const syncCurrentUserCache = (
  queryClient: QueryClient,
  data?: ProfileUpdateResponse
) => {
  if (data?.token) {
    setAuthToken(data.token);
  }

  queryClient.setQueryData<CurrentUserResponse | undefined>(["currentUser"], (prev) => ({
    ...(prev || {}),
    user: data?.user
      ? {
          ...(prev?.user || {}),
          ...data.user,
        }
      : prev?.user,
  }));
};

// ============ All non-admin/users list data ============
export const useUsers = (enabled = true) =>
  useQuery({
    queryKey: ["users"],
    queryFn: getAllUsers,
    enabled,
  });

// ============ Sign out current user and clear scoped caches ============
export const useSignoutUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signout,
    onSuccess: () => {
      queryClient.cancelQueries({ queryKey: ["currentUser"] });

      queryClient.setQueryData(["currentUser"], null);
      queryClient.setQueryData(["bills"], { bills: [] });
      queryClient.setQueryData(["products"], { products: [] });
      queryClient.setQueryData(["companies"], { companies: [] });
      queryClient.setQueryData(["users"], { users: [] });

      notify.success("Signed out successfully");
    },
    onError: (error: unknown) => {
      notify.error(getApiErrorMessage(error, "Sign out failed"));
    },
  });
};

// ============ Convert users into select options ============
export const buildUserOptions = (users: UserRecord[] = []) =>
  users
    .filter((user) => user.role !== "admin")
    .map((user) => ({
      value: user._id,
      label: `${user.name} (${user.email})`,
    }));
