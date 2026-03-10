import { Form } from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useMemo } from "react";
import { addCategory, getCategories, getCategoryById, updateCategory } from "../api";
import type { CategoriesResponse, CategoryFormValues, CategorySuggestionRow, UserCategoryDoc, UserRecord } from "../types";
import { notify } from "../utils/notify";
import { resolveObjectId, resolveUserMedicalStoreId } from "../utils/medicalStoreScope";
import { buildUserOptions, useCurrentUser, useUsers } from "./useUsers";

// ============ Categories list by selected medical store ============
export const useCategories = (medicalStoreId: string, enabled: boolean, isAdmin: boolean) =>
  useQuery({
    queryKey: ["categories", medicalStoreId],
    queryFn: () => getCategories(isAdmin && medicalStoreId ? { medicalStoreId } : undefined),
    enabled,
  });

// ============ Convert categories into select options ============
export const buildCategoryOptions = (categories: any[] = []) =>
  Array.from(new Set(categories.map((item: any) => item?.name).filter(Boolean))).map((name) => ({
    value: name,
    label: name,
  }));

// ============ Category form hook ============
export const useCategoryForm = (
  form: ReturnType<typeof Form.useForm<CategoryFormValues>>[0],
  {
    initialName,
    categoryId,
    onClose,
  }: { initialName?: string; categoryId?: string; onClose?: () => void }
) => {
  const queryClient = useQueryClient();
  const isEdit = Boolean(categoryId);

  const { data: categoriesData } = useQuery<CategoriesResponse>({
    queryKey: ["categories"],
    queryFn: () => getCategories(),
  });

  const { data: categoryData } = useQuery({
    queryKey: ["category", categoryId],
    queryFn: () => getCategoryById(categoryId!),
    enabled: isEdit && Boolean(categoryId),
  });

  const categoryRecord = (categoryData as any)?.category || (categoryData as any)?.data || categoryData;
  const { data: currentUser } = useCurrentUser();
  const isAdmin = currentUser?.user?.role === "admin";
  const currentUserMedicalStoreId = resolveUserMedicalStoreId(currentUser?.user);
  const { data: usersData, isLoading: isUsersLoading } = useUsers(isAdmin);

  const selectedUserId = (Form.useWatch("userId", form) || "").toString().trim();
  const typedName = (Form.useWatch("name", form) || "").toString();
  const normalizedTypedName = typedName.trim().toLowerCase();
  const users = (usersData?.users || []) as UserRecord[];
  const allCategories = (Array.isArray(categoriesData?.data) ? categoriesData.data : []) as UserCategoryDoc[];
  const editDoc = useMemo(() => allCategories.find((doc) => doc._id === categoryId), [allCategories, categoryId]);

  const selectedMedicalStoreId = useMemo(() => {
    if (isAdmin) {
      if (isEdit) {
        const ownerId = resolveObjectId(editDoc?.userId);
        const ownerUser = users.find((user) => user._id === ownerId);
        return resolveUserMedicalStoreId(ownerUser) || resolveObjectId(editDoc?.medicalStoreId);
      }
      if (!selectedUserId) return "";
      const selectedUser = users.find((user) => user._id === selectedUserId);
      return resolveUserMedicalStoreId(selectedUser);
    }
    return currentUserMedicalStoreId;
  }, [currentUserMedicalStoreId, editDoc?.medicalStoreId, editDoc?.userId, isAdmin, isEdit, selectedUserId, users]);

  useEffect(() => {
    form.setFieldsValue({
      name: isEdit ? (categoryRecord as any)?.name || initialName || "" : initialName || "",
    });
  }, [categoryRecord, form, initialName, isEdit]);

  const targetStoreId = selectedMedicalStoreId || resolveObjectId(editDoc?.medicalStoreId);
  const scopedCategoryNames = targetStoreId
    ? allCategories
        .filter((doc) => resolveObjectId(doc.medicalStoreId) === targetStoreId)
        .map((doc) => doc.name)
        .filter((name): name is string => Boolean(name))
        .map((name) => name.trim())
    : [];

  const normalizedCategoryNames = new Set(scopedCategoryNames.map((item) => item.toLowerCase()));
  const initialNormalizedName = (initialName || "").trim().toLowerCase();

  const suggestionRows = useMemo<CategorySuggestionRow[]>(() => {
    const uniqueCategories = Array.from(new Set(scopedCategoryNames)).sort((a, b) => a.localeCompare(b));
    return uniqueCategories
      .filter((categoryName) => categoryName.toLowerCase().includes(normalizedTypedName))
      .slice(0, 10)
      .map((categoryName) => ({
        key: categoryName,
        categoryName,
        isDuplicate:
          categoryName.toLowerCase() === normalizedTypedName &&
          (!isEdit || normalizedTypedName !== initialNormalizedName),
      }));
  }, [initialNormalizedName, isEdit, normalizedTypedName, scopedCategoryNames]);

  const addMut = useMutation({
    mutationFn: (payload: { name: string; userId?: string; medicalStoreId: string }) => addCategory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      notify.success("Category added successfully.");
      setTimeout(() => {
        form.resetFields();
        onClose?.();
      }, 700);
    },
    onError: (error) => {
      notify.error(axios.isAxiosError(error) ? error.response?.data?.message || "Failed to add category" : "Failed to add category");
    },
  });

  const updateMut = useMutation({
    mutationFn: (payload: { id: string; name: string; medicalStoreId?: string }) => updateCategory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      notify.success("Category updated successfully.");
      setTimeout(() => {
        form.resetFields();
        onClose?.();
      }, 700);
    },
    onError: (error) => {
      notify.error(axios.isAxiosError(error) ? error.response?.data?.message || "Failed to update category" : "Failed to update category");
    },
  });

  const handleSubmit = (values: CategoryFormValues) => {
    const normalizedName = values.name.trim();
    const selectedOwnerId = isAdmin ? (values.userId || "").trim() : (currentUser?.user?._id || "");
    const selectedStoreId = selectedMedicalStoreId || (isEdit ? resolveObjectId(editDoc?.medicalStoreId) : "");

    if (!selectedStoreId) {
      notify.error(isAdmin ? "Selected user has no medical store assigned." : "Medical store is not assigned to current user.");
      return;
    }

    if (isEdit) {
      updateMut.mutate({ id: categoryId!, name: normalizedName, medicalStoreId: selectedStoreId });
      return;
    }

    if (isAdmin && !selectedOwnerId) {
      notify.error("Please select user");
      return;
    }

    addMut.mutate({
      name: normalizedName,
      userId: selectedOwnerId || undefined,
      medicalStoreId: selectedStoreId,
    });
  };

  return {
    isEdit,
    isAdmin,
    isUsersLoading,
    isSubmitting: isEdit ? updateMut.isPending : addMut.isPending,
    userOptions: buildUserOptions(users),
    showSuggestionPanel: normalizedTypedName.length > 0,
    suggestionRows,
    normalizedCategoryNames,
    initialNormalizedName,
    handleSubmit,
    handleCancel: () => {
      form.resetFields();
      onClose?.();
    },
  };
};
