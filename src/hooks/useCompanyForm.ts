import { Form } from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { addCompany, getCompanyById, updateCompany } from "../api";
import { ROUTES } from "../constants/Routes";
import { notify } from "../utils/notify";
import { resolveUserMedicalStoreId } from "../utils/medicalStoreScope";
import type { CompanyFormValues, CompanyRecord } from "../types";
import { useCurrentUser, useUsers, buildUserOptions } from "./useUsers";
import { getCompanyScope, setCompanyFormValues } from "./useCompanies";
import { useMedicalStoreDetails } from "./useMedicalStores";

// ============ Company form query and mutation logic ============
export const useCompanyForm = (form: ReturnType<typeof Form.useForm<CompanyFormValues>>[0]) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
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

  const { data: medicalStoreDefaults } = useMedicalStoreDetails(medicalStoreId, {enabled: !isEdit && Boolean(medicalStoreId),});

  const lastAppliedDefaultsRef = useRef({
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  useEffect(() => {
    if (isEdit || !medicalStoreDefaults) return;

    const currentValues = form.getFieldsValue(["address", "city", "state", "pincode"]);
    const lastApplied = lastAppliedDefaultsRef.current;
    const nextDefaults = {
      address: medicalStoreDefaults.defaultCompanyAddress || "",
      city: medicalStoreDefaults.defaultCompanyCity || "",
      state: medicalStoreDefaults.defaultCompanyState || "",
      pincode: String(medicalStoreDefaults.defaultCompanyPincode || ""),
    };
    const nextValues: Partial<CompanyFormValues> = {};

    const canReplace = (current: string | undefined, previous: string) =>
      !current || String(current) === String(previous);

    if (canReplace(currentValues.address, lastApplied.address)) nextValues.address = nextDefaults.address;
    if (canReplace(currentValues.city, lastApplied.city)) nextValues.city = nextDefaults.city;
    if (canReplace(currentValues.state, lastApplied.state)) nextValues.state = nextDefaults.state;
    if (canReplace(currentValues.pincode, lastApplied.pincode)) nextValues.pincode = nextDefaults.pincode;

    if (Object.keys(nextValues).length > 0) {
      form.setFieldsValue(nextValues);
    }

    lastAppliedDefaultsRef.current = nextDefaults;
  }, [form, isEdit, medicalStoreDefaults]);

  const mutation = useMutation({
    mutationFn: (payload: CompanyFormValues & { logo?: File | null; userId?: string }) =>
      isEdit && id ? updateCompany(id, payload) : addCompany(payload),
    onSuccess: () => {
      notify.success(isEdit ? "Company updated successfully." : "Company added successfully.");
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      queryClient.refetchQueries({ queryKey: ["companies"] });
      if (id) {
        queryClient.invalidateQueries({ queryKey: ["company", id] });
        queryClient.refetchQueries({ queryKey: ["company", id] });
      }

      setTimeout(() => navigate(ROUTES.COMPANY.GET_COMPANY), 900);
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        const apiError = error.response?.data?.error;
        const fallbackError =
          typeof apiError === "string" ? apiError : typeof apiError?.message === "string" ? apiError.message  : "";

        notify.error(error.response?.data?.message || fallbackError || "Something went wrong");
        return;
      }

      notify.error("Something went wrong");
    },
  });

  const handleSubmit = (values: CompanyFormValues) => {
    const normalize = (value?: string) => (value || "").trim();
    const normalizedName = normalize(values.name);
    const normalizedGst = normalize(values.gstNumber);
    const normalizedPhone = normalize(values.phone);
    const normalizedEmail = normalize(values.email);
    const normalizedCity = normalize(values.city);
    const normalizedState = normalize(values.state);
    const normalizedPincode = normalize(values.pincode);
    const normalizedAddress = normalize(values.address);

    if (!isEdit && !ownerUserId) {
      notify.error(isAdmin ? "Please select user" : "Invalid user session. Please sign in again.");
      return;
    }

    if (!medicalStoreId) {
      notify.error(isAdmin ? "Selected user has no medical store assigned." : "Medical store is not assigned to current user.");
      return;
    }

    const shouldSendUserId = isAdmin ? Boolean(ownerUserId) : !isEdit;

    const payload: CompanyFormValues & { logo?: File | null; userId?: string } = {
      name: normalizedName,
      gstNumber: normalizedGst ? normalizedGst.toUpperCase() : "",
      phone: normalizedPhone,
      email: normalizedEmail,
      medicalStoreId,
      logo,
      ...(shouldSendUserId ? { userId: ownerUserId } : {}),
    };

    if (normalizedCity) payload.city = normalizedCity;
    if (normalizedState) payload.state = normalizedState;
    if (normalizedPincode) payload.pincode = normalizedPincode;
    if (normalizedAddress) payload.address = normalizedAddress;

    mutation.mutate(payload);
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
