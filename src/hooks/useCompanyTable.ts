import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteCompany, getAllCompaniesByQuery, updateCompanyStatus } from "../api";
import { ROUTES } from "../constants/Routes";
import { notify } from "../utils/notify";
import { useConfirm } from "../components/common/confirm/ConfirmProvider";
import { resolveUserMedicalStoreIds } from "../utils/medicalStoreScope";
import type { CompanyRecord, CompanyStatusTab } from "../types";
import { useCurrentUser } from "./useUsers";
import { buildMedicalStoreOptions, resolveMedicalStoreName as getMedicalStoreName, useMedicalStores } from "./useMedicalStores";

type PendingStatusChange = {
  open: boolean;
  company: CompanyRecord | null;
  nextIsActive: boolean;
  secondsLeft: number;
};

const initialPendingStatus: PendingStatusChange = {
  open: false,
  company: null,
  nextIsActive: false,
  secondsLeft: 10,
};

// ============ Company table query and mutation logic ============
export const useCompanyTable = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const confirm = useConfirm();

  const [statusTab, setStatusTab] = useState<CompanyStatusTab>("active");
  const [searchInput, setSearchInput] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedMedicalStore, setSelectedMedicalStore] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pendingStatus, setPendingStatus] = useState<PendingStatusChange>(initialPendingStatus);

  const { data: currentUserData } = useCurrentUser();
  const isAdmin = currentUserData?.user?.role === "admin";

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

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ["companies", searchValue, sortOrder, selectedMedicalStore, statusTab, page, limit],
    queryFn: () =>
      getAllCompaniesByQuery({
        search: searchValue || undefined,
        sortBy: "addedBy",
        order: sortOrder,
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
  }, [statusTab, searchValue, sortOrder, selectedMedicalStore]);

  const refreshCompanies = () => {
    queryClient.invalidateQueries({ queryKey: ["companies"] });
  };

  const deleteMutation = useMutation({
    mutationFn: deleteCompany,
    onSuccess: () => {
      notify.success("Company deleted successfully.");
      refreshCompanies();
    },
    onError: () => notify.error("Failed to delete company."),
  });

  const statusMutation = useMutation({
    mutationFn: (payload: { id: string; isActive: boolean }) => updateCompanyStatus(payload.id, payload.isActive),
    onSuccess: (_, payload) => {
      notify.success(payload.isActive ? "Company activated successfully." : "Company deactivated successfully.");
      refreshCompanies();
    },
    onError: () => notify.error("Failed to update company status."),
  });

  const handleDeleteCompany = async (id: string) => {
    const shouldDelete = await confirm({
      title: "Delete Company",
      message: "Are you sure you want to permanently remove this company?",
      confirmText: "Delete",
      cancelText: "Cancel",
      intent: "danger",
    });

    if (shouldDelete) {
      deleteMutation.mutate(id);
    }
  };

  const openStatusModal = (company: CompanyRecord) => {
    setPendingStatus({
      open: true,
      company,
      nextIsActive: company.isActive === false,
      secondsLeft: 10,
    });
  };

  const closeStatusModal = () => {
    if (!statusMutation.isPending) {
      setPendingStatus(initialPendingStatus);
    }
  };

  const applyStatusChange = () => {
    if (!pendingStatus.company) return;

    statusMutation.mutate({
      id: pendingStatus.company._id,
      isActive: pendingStatus.nextIsActive,
    });
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
    page,
    setPage,
    limit,
    setLimit,
    pendingStatus,
    medicalStoreOptions,
    companies: (data?.companies || []) as CompanyRecord[],
    total: data?.pagination?.total || 0,
    totalPages: data?.pagination?.totalPages || 0,
    isLoading,
    isStoresLoading,
    isError,
    error,
    isFetching,
    statusMutation,
    resolveMedicalStoreName: (medicalStoreId: CompanyRecord["medicalStoreId"]) =>
      getMedicalStoreName(medicalStoreId, medicalStoreNameById),
    handleDeleteCompany,
    closeStatusModal,
    openStatusModal,
    applyStatusChange,
    addCompanyRoute: ROUTES.COMPANY.ADD_COMPANY,
  };
};
