import { Form } from "antd";
import { keepPreviousData, useMutation, useQuery, useQueryClient, type UseQueryOptions } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAllMedicalStoresByQuery } from "../api/medicalStore";
import { addMedicalStore, deleteMedicalStore, getMedicalStoreById, updateMedicalStore, updateMedicalStoreStatus } from "../api/medicalStore";
import { ROUTES } from "../constants/Routes";
import type { MedicalStoreRecord, MedicalStoreStatusTab, StoreFormValues } from "../types";
import { filterStoresByIds } from "../utils/medicalStoreScope";
import { notify } from "../utils/notify";
import { getSignatureImageUrl } from "../utils/uploadsUrl";

// ============ Active medical stores list ============
export const useMedicalStores = () =>
  useQuery({
    queryKey: ["medicalStores", "productTable"],
    queryFn: () => getAllMedicalStoresByQuery({ isActive: true }),
  });

// ============ Medical store details by id ============
export const useMedicalStoreDetails = (
  id: string,
  options?: Omit<UseQueryOptions<MedicalStoreRecord>, "queryKey" | "queryFn">
) =>
  useQuery({
    queryKey: ["medicalStore", id],
    queryFn: () => getMedicalStoreById(id),
    enabled: Boolean(id) && (options?.enabled ?? true),
    ...options,
  });

// ============ Convert stores into select options ============
export const buildMedicalStoreOptions = (stores: MedicalStoreRecord[], allowedStoreIds: string[]) =>
  filterStoresByIds(stores, allowedStoreIds).map((store) => ({
    value: store._id,
    label: store.name || "Unnamed Medical Store",
  }));

// ============ Resolve store name from row value ============
export const resolveMedicalStoreName = (
  medicalStoreId: string | { _id?: string; name?: string } | undefined,
  medicalStoreNameById: Map<string, string>
) => {
  if (!medicalStoreId) return "-";
  if (typeof medicalStoreId === "string") return medicalStoreNameById.get(medicalStoreId) || "-";

  const id = medicalStoreId._id ? String(medicalStoreId._id) : "";
  return medicalStoreId.name || (id ? medicalStoreNameById.get(id) || "-" : "-");
};

// ============ Fill medical store form in edit mode ============
export const setMedicalStoreFormValues = (
  form: ReturnType<typeof Form.useForm<StoreFormValues>>[0],
  storeData: MedicalStoreRecord | undefined
) => {
  if (!storeData) return;

  form.setFieldsValue({
    name: storeData.name || "",
    taxType: (storeData.taxType as "SGST_CGST" | "IGST") || "SGST_CGST",
    taxPercent: Number(storeData.taxPercent ?? 0),
    gstNumber: (storeData.gstNumber || "").toUpperCase(),
    panNumber: (storeData.panNumber || "").toUpperCase(),
    city: storeData.city || "",
    state: storeData.state || "",
    pincode: String(storeData.pincode || ""),
    address: storeData.address || "",
  });
};

// ============ Medical store add/edit form hook ============
export const useMedicalStoreForm = (form: ReturnType<typeof Form.useForm<StoreFormValues>>[0]) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const taxType = Form.useWatch("taxType", form);
  const [signature, setSignature] = useState<File | null>(null);

  const { data: storeData, isLoading: isLoadingStore } = useMedicalStoreDetails(id as string, {
    enabled: isEdit,
  });

  useEffect(() => {
    setMedicalStoreFormValues(form, storeData);
  }, [form, storeData]);

  const mutation = useMutation({
    mutationFn: (payload: StoreFormValues & { signatureImg?: File | null }) =>
      isEdit && id ? updateMedicalStore(id, payload) : addMedicalStore(payload),
    onSuccess: () => {
      notify.success(isEdit ? "Medical store updated successfully." : "Medical store added successfully.");
      setTimeout(() => navigate(ROUTES.MEDICAL_STORE.GET_MEDICAL_STORES), 900);
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        notify.error(error.response?.data?.message || "Something went wrong");
        return;
      }
      notify.error("Something went wrong");
    },
  });

  const handleSubmit = (values: StoreFormValues) => {
    mutation.mutate({
      name: values.name.trim(),
      taxType: values.taxType,
      taxPercent: Number(values.taxPercent || 0),
      gstNumber: values.gstNumber.trim().toUpperCase(),
      panNumber: values.panNumber.trim().toUpperCase(),
      city: values.city.trim(),
      state: values.state.trim(),
      pincode: values.pincode.trim(),
      address: values.address.trim(),
      ...(signature ? { signatureImg: signature } : {}),
      ...(values.removeSignature ? { removeSignature: true } : {}),
    });
  };

  return {
    goBack: () => navigate(-1),
    isEdit,
    taxType,
    signature,
    setSignature,
    storeData,
    existingSignatureUrl: getSignatureImageUrl(storeData?.signatureImg),
    isLoadingStore,
    mutation,
    handleSubmit,
  };
};

type PendingStatusChange = {
  open: boolean;
  store: MedicalStoreRecord | null;
  nextIsActive: boolean;
  secondsLeft: number;
};

const initialPendingStatus: PendingStatusChange = {
  open: false,
  store: null,
  nextIsActive: false,
  secondsLeft: 10,
};

// ============ Medical store table hook ============
export const useMedicalStoreTable = (isAdmin: boolean) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [statusTab, setStatusTab] = useState<MedicalStoreStatusTab>("active");
  const [searchInput, setSearchInput] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pendingStatus, setPendingStatus] = useState<PendingStatusChange>(initialPendingStatus);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["stores", searchValue, statusTab, page, limit],
    queryFn: () =>
      getAllMedicalStoresByQuery({
        search: searchValue || undefined,
        isActive: statusTab === "active",
        page,
        limit,
      }),
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    setPage(1);
  }, [statusTab, searchValue]);

  // Update the API query term while typing (debounced) so search works as-you-type.
  useEffect(() => {
    const timer = window.setTimeout(() => setSearchValue(searchInput.trim()), 350);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const applySearch = () => {
    setSearchValue(searchInput.trim());
  };


  const refresh = () => queryClient.invalidateQueries({ queryKey: ["stores"] });

  const deleteMutation = useMutation({
    mutationFn: deleteMedicalStore,
    onSuccess: () => {
      notify.success("Medical store deleted successfully.");
      refresh();
    },
    onError: () => notify.error("Failed to delete medical store."),
  });

  const statusMutation = useMutation({
    mutationFn: (payload: { id: string; isActive: boolean }) => updateMedicalStoreStatus(payload.id, payload.isActive),
    onSuccess: () => {
      notify.success("Status updated.");
      refresh();
    },
    onError: () => notify.error("Failed to update status."),
  });

  useEffect(() => {
    if (!pendingStatus.open || pendingStatus.secondsLeft <= 0) return;
    const timer = window.setTimeout(() => {
      setPendingStatus((prev) => ({ ...prev, secondsLeft: Math.max(prev.secondsLeft - 1, 0) }));
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [pendingStatus.open, pendingStatus.secondsLeft]);

  useEffect(() => {
    if (!pendingStatus.open || pendingStatus.secondsLeft !== 0) return;
    if (!pendingStatus.store) return;
    statusMutation.mutate({ id: pendingStatus.store._id, isActive: pendingStatus.nextIsActive });
    setPendingStatus(initialPendingStatus);
  }, [pendingStatus, statusMutation]);

  return {
    navigate,
    isAdmin,
    stores: (data?.stores || []) as MedicalStoreRecord[],
    totalCount: data?.pagination?.total || 0,
    totalPages: data?.pagination?.totalPages || 0,
    isLoading: isLoading || isFetching,
    statusTab,
    setStatusTab,
    searchInput,
    setSearchInput,
    applySearch,
    page,
    setPage,
    limit,
    setLimit,
    pendingStatus,
    openStatusModal: (store: MedicalStoreRecord) =>
      setPendingStatus({
        open: true,
        store,
        nextIsActive: store.isActive === false,
        secondsLeft: 10,
      }),
    closeStatusModal: () => setPendingStatus(initialPendingStatus),
    handleDelete: (id: string) => deleteMutation.mutate(id),
    applyStatusChange: () => {
      if (!pendingStatus.store) return;
      statusMutation.mutate({ id: pendingStatus.store._id, isActive: pendingStatus.nextIsActive });
      setPendingStatus(initialPendingStatus);
    },
    addStoreRoute: ROUTES.MEDICAL_STORE.ADD_MEDICAL_STORE,
    editStoreRoute: ROUTES.MEDICAL_STORE.UPDATE_MEDICAL_STORE,
  };
};
