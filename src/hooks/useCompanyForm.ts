import { Form } from "antd";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { addCompany, getCompanyById, updateCompany } from "../api";
import { ROUTES } from "../constants/Routes";
import { notify } from "../utils/notify";
import { resolveUserMedicalStoreId } from "../utils/medicalStoreScope";
import type { CompanyFormValues, CompanyRecord } from "../types";
import { useCurrentUser, useUsers, buildUserOptions } from "./useUsers";
import { getCompanyScope, setCompanyFormValues } from "./useCompanies";

// ============ Company form query and mutation logic ============
export const useCompanyForm = (form: ReturnType<typeof Form.useForm<CompanyFormValues>>[0]) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const [logo, setLogo] = useState<File | null>(null);
  const selectedUserId = (Form.useWatch("userId", form) || "").toString().trim();

  const { data: currentUserData, isLoading: isCurrentUserLoading } = useCurrentUser();
  const isAdmin = currentUserData?.user?.role === "admin";
  const currentUserId = currentUserData?.user?._id || "";
  const currentUserMedicalStoreId = resolveUserMedicalStoreId(currentUserData?.user);

  const { data: usersData, isLoading: isUsersLoading } = useUsers(isAdmin);
  const users = usersData?.users || [];

  const { data: companyData, isLoading: isCompanyLoading } = useQuery({
    queryKey: ["company", id],
    queryFn: () => getCompanyById(id as string),
    enabled: isEdit,
  });

  useEffect(() => {
    setCompanyFormValues(form, companyData as CompanyRecord | undefined);
  }, [companyData, form]);

  const { ownerUserId, medicalStoreId } = useMemo(
    () =>
      getCompanyScope({
        isAdmin,
        isEdit,
        selectedUserId,
        currentUserMedicalStoreId,
        currentUserId,
        users,
        companyData,
      }),
    [companyData, currentUserId, currentUserMedicalStoreId, isAdmin, isEdit, selectedUserId, users]
  );

  const mutation = useMutation({
    mutationFn: (payload: CompanyFormValues & { logo?: File | null; userId?: string }) =>
      isEdit && id ? updateCompany(id, payload) : addCompany(payload),
    onSuccess: () => {
      notify.success(isEdit ? "Company updated successfully." : "Company added successfully.");
      setTimeout(() => navigate(ROUTES.COMPANY.GET_COMPANY), 900);
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        const apiError = error.response?.data?.error;
        const fallbackError =
          typeof apiError === "string"
            ? apiError
            : typeof apiError?.message === "string"
              ? apiError.message
              : "";

        notify.error(error.response?.data?.message || fallbackError || "Something went wrong");
        return;
      }

      notify.error("Something went wrong");
    },
  });

  const handleSubmit = (values: CompanyFormValues) => {
    if (!isEdit && !ownerUserId) {
      notify.error(isAdmin ? "Please select user" : "Invalid user session. Please sign in again.");
      return;
    }

    if (!medicalStoreId) {
      notify.error(isAdmin ? "Selected user has no medical store assigned." : "Medical store is not assigned to current user.");
      return;
    }

    mutation.mutate({
      name: values.name.trim(),
      gstNumber: values.gstNumber.trim().toUpperCase(),
      phone: values.phone.trim(),
      email: values.email.trim(),
      city: values.city.trim(),
      state: values.state.trim(),
      pincode: values.pincode.trim(),
      address: values.address.trim(),
      medicalStoreId,
      logo,
      ...(isEdit ? {} : { userId: ownerUserId }),
    });
  };

  return {
    goBack: () => navigate(-1),
    isEdit,
    isAdmin,
    isCurrentUserLoading,
    isUsersLoading,
    isCompanyLoading,
    companyData: companyData as CompanyRecord | undefined,
    userOptions: buildUserOptions(users),
    logo,
    setLogo,
    mutation,
    handleSubmit,
  };
};
