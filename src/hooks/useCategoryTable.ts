import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteCategory, getCategoriesByQuery, updateCategoryStatus } from "../api";
import type { CategoryRecord, CategoryStatusTab, MedicalStoreRecord } from "../types";
import { notify } from "../utils/notify";
import { filterStoresByIds, resolveUserMedicalStoreIds } from "../utils/medicalStoreScope";
import { useConfirm } from "../components/common/confirm/ConfirmProvider";
import { useCurrentUser } from "./useUsers";
import { useMedicalStores } from "./useMedicalStores";

type PendingStatusChange = {
  open: boolean;
  category: CategoryRecord | null;
  nextIsActive: boolean;
  secondsLeft: number;
};

const initialPendingStatus: PendingStatusChange = {
  open: false,
  category: null,
  nextIsActive: false,
  secondsLeft: 10,
};

export const getCategoryAddedByName = (category: CategoryRecord) =>
  !category.userId || typeof category.userId === "string" ? "-" : category.userId.name || "-";

export const getCategoryAddedByEmail = (category: CategoryRecord) =>
  !category.userId || typeof category.userId === "string" ? "-" : category.userId.email || "-";

// ============ Category table query and mutation logic ============
export const useCategoryTable = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const [statusTab, setStatusTab] = useState<CategoryStatusTab>("active");
  const [searchInput, setSearchInput] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedMedicalStore, setSelectedMedicalStore] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pendingStatus, setPendingStatus] = useState<PendingStatusChange>(initialPendingStatus);

  const { data: currentUser } = useCurrentUser();
  const isAdmin = currentUser?.user?.role === "admin";
  const { data: storesData, isLoading: isStoresLoading } = useMedicalStores();
  const stores = (storesData?.stores || []) as MedicalStoreRecord[];
  const allowedStoreIds = isAdmin ? stores.map((store) => store._id) : resolveUserMedicalStoreIds(currentUser?.user);
  const medicalStoreOptions = filterStoresByIds(stores, allowedStoreIds).map((store) => ({
    value: store._id,
    label: store.name || "Unnamed Medical Store",
  }));

  const medicalStoreNameById = useMemo(
    () => new Map<string, string>(stores.map((store) => [String(store._id), store.name || "Unnamed Medical Store"])),
    [stores]
  );

  const resolveMedicalStoreName = (medicalStoreId: CategoryRecord["medicalStoreId"]) => {
    if (!medicalStoreId) return "-";
    if (typeof medicalStoreId === "string") return medicalStoreNameById.get(medicalStoreId) || "-";
    const id = medicalStoreId._id ? String(medicalStoreId._id) : "";
    return medicalStoreId.name || (id ? medicalStoreNameById.get(id) || "-" : "-");
  };

  useEffect(() => {
    if (!isAdmin && !selectedMedicalStore && medicalStoreOptions.length > 0) {
      setSelectedMedicalStore(medicalStoreOptions[0].value);
    }
  }, [isAdmin, medicalStoreOptions, selectedMedicalStore]);

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ["categories", searchValue, sortOrder, selectedMedicalStore, statusTab, page, limit],
    queryFn: () =>
      getCategoriesByQuery({
        search: searchValue || undefined,
        sortBy: isAdmin ? "addedBy" : "createdAt",
        order: isAdmin ? sortOrder : "desc",
        medicalStoreId: isAdmin ? selectedMedicalStore || undefined : undefined,
        isActive: statusTab === "active",
        page,
        limit,
      }),
    enabled: !!currentUser?.user,
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    const timer = window.setTimeout(() => setSearchValue(searchInput.trim()), 350);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [statusTab, searchValue, sortOrder, selectedMedicalStore]);

  const refreshCategories = () => queryClient.invalidateQueries({ queryKey: ["categories"] });

  const deleteMutation = useMutation({
    mutationFn: (payload: { id: string }) => deleteCategory(payload),
    onSuccess: () => {
      notify.success("Category deleted successfully.");
      refreshCategories();
    },
    onError: () => notify.error("Failed to delete category."),
  });

  const statusMutation = useMutation({
    mutationFn: (payload: { id: string; isActive: boolean }) => updateCategoryStatus(payload.id, payload.isActive),
    onSuccess: (_, variables) => {
      notify.success(variables.isActive ? "Category activated successfully." : "Category deactivated successfully.");
      refreshCategories();
    },
    onError: () => notify.error("Failed to update category status."),
  });

  const handleDeleteCategory = async (id: string) => {
    const shouldDelete = await confirm({
      title: "Delete Category",
      message: "Are you sure you want to permanently remove this category?",
      confirmText: "Delete",
      cancelText: "Cancel",
      intent: "danger",
    });

    if (shouldDelete) {
      deleteMutation.mutate({ id });
    }
  };

  const openStatusModal = (category: CategoryRecord) => {
    setPendingStatus({
      open: true,
      category,
      nextIsActive: category.isActive === false,
      secondsLeft: 10,
    });
  };

  const closeStatusModal = () => setPendingStatus(initialPendingStatus);

  const applyStatusChange = () => {
    if (!pendingStatus.category) return;
    statusMutation.mutate({ id: pendingStatus.category._id, isActive: pendingStatus.nextIsActive });
    setPendingStatus(initialPendingStatus);
  };

  useEffect(() => {
    if (!pendingStatus.open || pendingStatus.secondsLeft <= 0) return;
    const timer = window.setTimeout(() => {
      setPendingStatus((previous) => ({ ...previous, secondsLeft: Math.max(previous.secondsLeft - 1, 0) }));
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [pendingStatus.open, pendingStatus.secondsLeft]);

  useEffect(() => {
    if (!pendingStatus.open || pendingStatus.secondsLeft !== 0 || statusMutation.isPending) return;
    applyStatusChange();
  }, [pendingStatus, statusMutation.isPending]);

  return {
    navigate,
    isAdmin,
    statusTab,
    setStatusTab,
    searchInput,
    setSearchInput,
    sortOrder,
    setSortOrder,
    selectedMedicalStore,
    setSelectedMedicalStore,
    page,
    setPage,
    limit,
    setLimit,
    pendingStatus,
    medicalStoreOptions,
    categories: (data?.data || []) as CategoryRecord[],
    total: data?.pagination?.total || 0,
    totalPages: data?.pagination?.totalPages || 0,
    isLoading,
    isStoresLoading,
    isError,
    error,
    isFetching,
    statusMutation,
    resolveMedicalStoreName,
    handleDeleteCategory,
    closeStatusModal,
    openStatusModal,
    applyStatusChange,
  };
};
