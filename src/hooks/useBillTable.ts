import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs, { type Dayjs } from "dayjs";
import { deleteBill, getAllBillsByQuery, updateBillStatus } from "../api";
import type { BillRecord, BillStatusTab, MedicalStoreRecord } from "../types";
import { notify } from "../utils/notify";
import { filterStoresByIds, resolveUserMedicalStoreIds } from "../utils/medicalStoreScope";
import { useConfirm } from "../components/common/confirm/ConfirmProvider";
import { useCurrentUser } from "./useUsers";
import { useMedicalStores } from "./useMedicalStores";

type PendingStatusChange = {
  open: boolean;
  bill: BillRecord | null;
  nextIsActive: boolean;
  secondsLeft: number;
};

const initialPendingStatus: PendingStatusChange = {
  open: false,
  bill: null,
  nextIsActive: false,
  secondsLeft: 10,
};

// ============ Quick date presets for bill table ============
export const billDateRangePresets: Array<{ label: string; value: [Dayjs, Dayjs] }> = [
  { label: "Today", value: [dayjs().startOf("day"), dayjs().endOf("day")] },
  { label: "Yesterday", value: [dayjs().subtract(1, "day").startOf("day"), dayjs().subtract(1, "day").endOf("day")] },
  { label: "This Week", value: [dayjs().startOf("week").startOf("day"), dayjs().endOf("week").endOf("day")] },
  { label: "Last Week", value: [dayjs().subtract(1, "week").startOf("week").startOf("day"), dayjs().subtract(1, "week").endOf("week").endOf("day")] },
  { label: "This Month", value: [dayjs().startOf("month").startOf("day"), dayjs().endOf("month").endOf("day")] },
  { label: "Last Month", value: [dayjs().subtract(1, "month").startOf("month").startOf("day"), dayjs().subtract(1, "month").endOf("month").endOf("day")] },
];

// ============ Bill table query and mutation logic ============
export const useBillTable = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const [statusTab, setStatusTab] = useState<BillStatusTab>("active");
  const [searchInput, setSearchInput] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [selectedMedicalStore, setSelectedMedicalStore] = useState("");
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
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

  useEffect(() => {
    if (!isAdmin && !selectedMedicalStore && medicalStoreOptions.length > 0) {
      setSelectedMedicalStore(medicalStoreOptions[0].value);
    }
  }, [isAdmin, medicalStoreOptions, selectedMedicalStore]);

  const fromDate = dateRange?.[0]?.format("YYYY-MM-DD");
  const toDate = dateRange?.[1]?.format("YYYY-MM-DD");

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ["bills", searchValue, fromDate, toDate, selectedMedicalStore, statusTab, page, limit],
    queryFn: () =>
      getAllBillsByQuery({
        search: searchValue || undefined,
        fromDate,
        toDate,
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
  }, [statusTab, searchValue, fromDate, toDate, selectedMedicalStore]);

  const refreshBills = () => queryClient.invalidateQueries({ queryKey: ["bills"] });

  const deleteMutation = useMutation({
    mutationFn: deleteBill,
    onSuccess: () => {
      notify.success("Bill deleted successfully.");
      refreshBills();
    },
    onError: () => notify.error("Failed to delete bill."),
  });

  const statusMutation = useMutation({
    mutationFn: (payload: { id: string; isActive: boolean }) => updateBillStatus(payload.id, payload.isActive),
    onSuccess: (_, payload) => {
      notify.success(payload.isActive ? "Bill activated successfully." : "Bill deactivated successfully.");
      refreshBills();
    },
    onError: () => notify.error("Failed to update bill status."),
  });

  const handleDeleteBill = async (id: string) => {
    const shouldDelete = await confirm({
      title: "Delete Bill",
      message: "Are you sure you want to permanently remove this bill?",
      confirmText: "Delete",
      cancelText: "Cancel",
      intent: "danger",
    });

    if (shouldDelete) deleteMutation.mutate(id);
  };

  const openStatusModal = (bill: BillRecord) => {
    setPendingStatus({
      open: true,
      bill,
      nextIsActive: bill.isActive === false,
      secondsLeft: 10,
    });
  };

  const closeStatusModal = () => {
    if (!statusMutation.isPending) setPendingStatus(initialPendingStatus);
  };

  const applyStatusChange = () => {
    if (!pendingStatus.bill) return;
    statusMutation.mutate({ id: pendingStatus.bill._id, isActive: pendingStatus.nextIsActive });
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
    if (pendingStatus.open && pendingStatus.secondsLeft === 0 && !statusMutation.isPending) {
      applyStatusChange();
    }
  }, [pendingStatus.open, pendingStatus.secondsLeft, statusMutation.isPending]);

  const onRangeChange = (values: null | [Dayjs | null, Dayjs | null]) => {
    if (!values?.[0] || !values?.[1]) {
      setDateRange(null);
      return;
    }

    setDateRange([values[0].startOf("day"), values[1].endOf("day")]);
  };

  return {
    navigate,
    isAdmin,
    statusTab,
    setStatusTab,
    searchInput,
    setSearchInput,
    selectedMedicalStore,
    setSelectedMedicalStore,
    dateRange,
    onRangeChange,
    page,
    setPage,
    limit,
    setLimit,
    pendingStatus,
    medicalStoreOptions,
    bills: (data?.bills || []) as BillRecord[],
    total: data?.pagination?.total || 0,
    totalPages: data?.pagination?.totalPages || 0,
    isLoading,
    isStoresLoading,
    isError,
    error,
    isFetching,
    statusMutation,
    resolveMedicalStoreName: (medicalStoreId: BillRecord["medicalStoreId"]) => {
      if (!medicalStoreId) return "-";
      if (typeof medicalStoreId === "string") return medicalStoreNameById.get(medicalStoreId) || "-";
      const id = medicalStoreId._id ? String(medicalStoreId._id) : "";
      return medicalStoreId.name || (id ? medicalStoreNameById.get(id) || "-" : "-");
    },
    handleDeleteBill,
    closeStatusModal,
    openStatusModal,
    applyStatusChange,
  };
};
