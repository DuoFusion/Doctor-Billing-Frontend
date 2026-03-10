import { Form } from "antd";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useMemo, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { addProduct, getProductById, updateProduct } from "../api";
import { ROUTES } from "../constants/Routes";
import { notify } from "../utils/notify";
import { resolveUserMedicalStoreId } from "../utils/medicalStoreScope";
import type { ProductFormValues } from "../types";
import { useCompanies, buildCompanyOptions } from "./useCompanies";
import { useCurrentUser, useUsers, buildUserOptions } from "./useUsers";
import { getSelectedMedicalStoreId, setProductFormValues } from "./useProductShared";

// ============ Product form data and submit logic ============
export const useProductForm = (form: ReturnType<typeof Form.useForm<ProductFormValues>>[0]) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const selectedUserId = (Form.useWatch("userId", form) || "").toString().trim();

  const { data: currentUserData, isLoading: isCurrentUserLoading } = useCurrentUser();
  const isAdmin = String(currentUserData?.user?.role || "").toLowerCase() === "admin";
  const currentUserMedicalStoreId = resolveUserMedicalStoreId(currentUserData?.user);

  const { data: usersData, isLoading: isUsersLoading } = useUsers(isAdmin);
  
  const { data: productData, isLoading: isProductLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById(id as string),
    enabled: isEdit,
  });

  const users = usersData?.users || [];
  const selectedMedicalStoreId = useMemo(
    () =>
      getSelectedMedicalStoreId({
        isAdmin,
        isEdit,
        selectedUserId,
        currentUserMedicalStoreId,
        users,
        productData,
      }),
    [currentUserMedicalStoreId, isAdmin, isEdit, productData, selectedUserId, users]
  );

  const previousMedicalStoreIdRef = useRef(selectedMedicalStoreId);
  const {
    data: companiesData,
    isLoading: isCompaniesLoading,
    isFetching: isCompaniesFetching,
  } = useCompanies(selectedMedicalStoreId);

  useEffect(() => {
    if (isEdit && productData) {
      setProductFormValues(form, productData);
    }
  }, [form, isEdit, productData]);

  useEffect(() => {
    if (isEdit) {
      previousMedicalStoreIdRef.current = selectedMedicalStoreId;
      return;
    }

    const previousMedicalStoreId = previousMedicalStoreIdRef.current;
    if (previousMedicalStoreId !== selectedMedicalStoreId) {
      form.setFieldsValue({ company: undefined });
      previousMedicalStoreIdRef.current = selectedMedicalStoreId;
    }
  }, [form, isEdit, selectedMedicalStoreId]);

  const mutation = useMutation({
    mutationFn: (payload: ProductFormValues) => (isEdit && id ? updateProduct(id, payload) : addProduct(payload)),
    onSuccess: () => {
      notify.success(isEdit ? "Product updated successfully." : "Product added successfully.");
      setTimeout(() => navigate(ROUTES.PRODUCTS.GET_PRODUCTS), 900);
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        notify.error(error.response?.data?.message || "Something went wrong");
        return;
      }
      notify.error("Something went wrong");
    },
  });

  const handleSubmit = (values: ProductFormValues) => {
    const ownerId = isAdmin ? (values.userId || "").trim() : (currentUserData?.user?._id || "");

    if (!ownerId) {
      notify.error(isAdmin ? "Please select user" : "Invalid user session. Please sign in again.");
      return;
    }

    if (!selectedMedicalStoreId) {
      notify.error(isAdmin ? "Selected user has no medical store assigned." : "Medical store is not assigned to current user.");
      return;
    }

    mutation.mutate({
      ...values,
      name: values.name.trim(),
      medicalStoreId: selectedMedicalStoreId,
      userId: ownerId,
    });
  };

  return {
    goBack: () => navigate(-1),
    isEdit,
    isAdmin,
    selectedMedicalStoreId,
    isCurrentUserLoading,
    isUsersLoading,
    isProductLoading,
    isCompaniesLoading,
    isCompaniesFetching,
    filteredCompanyOptions: buildCompanyOptions(companiesData?.companies || [], selectedMedicalStoreId),
    userOptions: buildUserOptions(users),
    mutation,
    handleSubmit,
  };
};
