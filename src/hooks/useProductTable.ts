import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteProduct, getAllProductsByQuery, updateProductStatus } from "../api";
import { notify } from "../utils/notify";
import { useConfirm } from "../components/common/confirm/ConfirmProvider";
import { resolveUserMedicalStoreIds } from "../utils/medicalStoreScope";
import type { ProductRow, ProductStatusTab } from "../types";
import { useCurrentUser } from "./useUsers";
import { buildMedicalStoreOptions, resolveMedicalStoreName as getMedicalStoreName, useMedicalStores } from "./useMedicalStores";
import { buildCategoryOptions, useCategories } from "./useCategories";

type PendingStatusChange = {
  open: boolean;
  product: ProductRow | null;
  nextIsActive: boolean;
  secondsLeft: number;
};

const initialPendingStatus: PendingStatusChange = {
  open: false,
  product: null,
  nextIsActive: false,
  secondsLeft: 10,
};

// ============ Product table data, filters and actions ============
export const useProductTable = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const confirm = useConfirm();

  const [statusTab, setStatusTab] = useState<ProductStatusTab>("active");
  const [searchInput, setSearchInput] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedMedicalStore, setSelectedMedicalStore] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pendingStatus, setPendingStatus] = useState<PendingStatusChange>(initialPendingStatus);

  const { data: currentUserData } = useCurrentUser();
  const isAdmin = currentUserData?.user?.role === "admin";

  // ============ Medical stores query ============
  const { data: storesData, isLoading: isStoresLoading } = useMedicalStores();
  const stores = storesData?.stores || [];
  const allowedStoreIds = isAdmin ? stores.map((store) => store._id) : resolveUserMedicalStoreIds(currentUserData?.user);
  const medicalStoreOptions = buildMedicalStoreOptions(stores, allowedStoreIds);

  const medicalStoreNameById = useMemo(
    () => new Map<string, string>(stores.map((store) => [String(store._id), store.name || "Unnamed Medical Store"])),
    [stores]
  );

  useEffect(() => {
    if (!isAdmin && !selectedMedicalStore && medicalStoreOptions.length > 0) {
      setSelectedMedicalStore(medicalStoreOptions[0].value);
    }
  }, [isAdmin, medicalStoreOptions, selectedMedicalStore]);

  useEffect(() => {
    setSelectedCategory("");
  }, [selectedMedicalStore]);

  // ============ Categories query ============
  const { data: categoriesData } = useCategories(selectedMedicalStore, !!currentUserData?.user, isAdmin);
  const categoryOptions = buildCategoryOptions(categoriesData?.data || []);

  // ============ Products query (filters, sorting, pagination) ============
  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ["products", searchValue, sortOrder, selectedCategory, selectedMedicalStore, statusTab, page, limit],
    queryFn: () =>
      getAllProductsByQuery({
        search: searchValue || undefined,
        sortBy: "sellingPrice",
        order: sortOrder,
        category: selectedCategory || undefined,
        medicalStoreId: isAdmin ? selectedMedicalStore || undefined : undefined,
        isActive: statusTab === "active",
        page,
        limit,
      }),
    enabled: !!currentUserData?.user,
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    const timer = window.setTimeout(() => setSearchValue(searchInput.trim()), 350);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [statusTab, searchValue, selectedCategory, sortOrder, selectedMedicalStore]);

  const refreshProducts = () => {
    queryClient.invalidateQueries({ queryKey: ["products"] });
  };

  // ============ Delete product mutation ============
  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      notify.success("Product deleted successfully.");
      refreshProducts();
    },
    onError: () => notify.error("Failed to delete product."),
  });

  // ============ Update product status mutation ============
  const statusMutation = useMutation({
    mutationFn: (payload: { id: string; isActive: boolean }) => updateProductStatus(payload.id, payload.isActive),
    onSuccess: (_, payload) => {
      notify.success(payload.isActive ? "Product activated successfully." : "Product deactivated successfully.");
      refreshProducts();
    },
    onError: () => notify.error("Failed to update product status."),
  });

  // ============ Handle product deletion ============
  const handleDeleteProduct = async (id: string) => {
    const shouldDelete = await confirm({
      title: "Delete Product",
      message: "Are you sure you want to permanently remove this product?",
      confirmText: "Delete",
      cancelText: "Cancel",
      intent: "danger",
    });

    if (shouldDelete) {
      deleteMutation.mutate(id);
    }
  };

  const openStatusModal = (product: ProductRow) => {
    setPendingStatus({
      open: true,
      product,
      nextIsActive: product.isActive === false,
      secondsLeft: 10,
    });
  };

  const closeStatusModal = () => {
    if (!statusMutation.isPending) {
      setPendingStatus(initialPendingStatus);
    }
  };

  const applyStatusChange = () => {
    if (!pendingStatus.product) return;
    statusMutation.mutate({ id: pendingStatus.product._id, isActive: pendingStatus.nextIsActive });
    setPendingStatus(initialPendingStatus);
  };

  useEffect(() => {
    if (!pendingStatus.open || pendingStatus.secondsLeft <= 0) return;

    const timer = window.setTimeout(() => {
      setPendingStatus((prev) => ({ ...prev, secondsLeft: Math.max(prev.secondsLeft - 1, 0) }));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [pendingStatus.open, pendingStatus.secondsLeft]);

  useEffect(() => {
    if (pendingStatus.open && pendingStatus.secondsLeft === 0 && !statusMutation.isPending) {
      applyStatusChange();
    }
  }, [pendingStatus.open, pendingStatus.secondsLeft, statusMutation.isPending]);

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
    selectedCategory,
    setSelectedCategory,
    page,
    setPage,
    limit,
    setLimit,
    pendingStatus,
    medicalStoreOptions,
    categoryOptions,
    products: (data?.products || []) as ProductRow[],
    total: data?.pagination?.total || 0,
    totalPages: data?.pagination?.totalPages || 0,
    isLoading,
    isStoresLoading,
    isError,
    error,
    isFetching,
    statusMutation,
    resolveMedicalStoreName: (medicalStoreId: ProductRow["medicalStoreId"]) =>
      getMedicalStoreName(medicalStoreId, medicalStoreNameById),
    handleDeleteProduct,
    closeStatusModal,
    openStatusModal,
    applyStatusChange,
  };
};