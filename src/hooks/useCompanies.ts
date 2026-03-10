import { Form } from "antd";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAllCompaniesByQuery } from "../api";
import { deleteCompany, getCompanyById, updateCompanyStatus } from "../api/companyApi";
import { ROUTES } from "../constants/Routes";
import type { CompanyFormValues, CompanyRecord, UserRecord } from "../types";
import { formatDate } from "../utils/createdAndUpdatedDate";
import { resolveObjectId, resolveUserMedicalStoreId } from "../utils/medicalStoreScope";
import { notify } from "../utils/notify";
import { getCompanyLogoUrl } from "../utils/uploadsUrl";
import { useConfirm } from "../components/common/confirm/ConfirmProvider";

// ============ Companies by medical store ============
export const useCompanies = (medicalStoreId: string, enabled = Boolean(medicalStoreId)) =>
  useQuery({
    queryKey: ["companies", medicalStoreId],
    queryFn: () => getAllCompaniesByQuery({ medicalStoreId: medicalStoreId || undefined }),
    enabled,
    placeholderData: keepPreviousData,
  });

// ============ Convert companies into select options ============
export const buildCompanyOptions = (companies: any[] = [], medicalStoreId: string) =>
  companies
    .filter((company) => resolveObjectId(company?.medicalStoreId) === medicalStoreId)
    .map((company) => ({
      value: company._id,
      label: company.name,
    }));

// ============ Added by name for company rows/details ============
export const getCompanyAddedByName = (company: CompanyRecord) => {
  const owner = company.user || company.userId;
  if (owner && typeof owner === "object") return owner.name || "";
  return company.addedByName || "";
};

// ============ Added by email for company rows/details ============
export const getCompanyAddedByEmail = (company: CompanyRecord) => {
  const owner = company.user || company.userId;
  if (owner && typeof owner === "object") return owner.email || "";
  return company.addedByEmail || "";
};

// ============ Fill company form in edit mode ============
export const setCompanyFormValues = (
  form: ReturnType<typeof Form.useForm<CompanyFormValues>>[0],
  companyData: CompanyRecord | undefined
) => {
  if (!companyData) return;

  form.setFieldsValue({
    name: companyData.name || "",
    gstNumber: companyData.gstNumber || "",
    phone: companyData.phone || "",
    email: companyData.email || "",
    city: companyData.city || "",
    state: companyData.state || "",
    pincode: String(companyData.pincode || ""),
    address: companyData.address || "",
  });
};

// ============ Resolve company owner and store ============
export const getCompanyScope = ({
  isAdmin,
  isEdit,
  selectedUserId,
  currentUserMedicalStoreId,
  currentUserId,
  users,
  companyData,
}: {
  isAdmin: boolean;
  isEdit: boolean;
  selectedUserId: string;
  currentUserMedicalStoreId: string;
  currentUserId: string;
  users: UserRecord[];
  companyData: CompanyRecord | undefined;
}) => {
  const ownerUserId = isAdmin
    ? isEdit
      ? resolveObjectId(companyData?.userId || companyData?.user)
      : selectedUserId
    : currentUserId;

  const ownerUser = users.find((user) => user._id === ownerUserId);
  const medicalStoreId = isAdmin
    ? resolveUserMedicalStoreId(ownerUser) || (isEdit ? resolveObjectId(companyData?.medicalStoreId) : "")
    : currentUserMedicalStoreId;

  return { ownerUserId, medicalStoreId };
};

type PendingStatusChange = {
  open: boolean;
  nextIsActive: boolean;
  secondsLeft: number;
};

const initialPendingStatus: PendingStatusChange = {
  open: false,
  nextIsActive: false,
  secondsLeft: 10,
};

// ============ Company details query and actions ============
export const useCompanyDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const [pendingStatus, setPendingStatus] = useState<PendingStatusChange>(initialPendingStatus);

  const { data: company, isLoading, isError, refetch } = useQuery({
    queryKey: ["company", id],
    queryFn: () => getCompanyById(id as string),
    enabled: Boolean(id),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCompany,
    onSuccess: () => {
      notify.success("Company deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      navigate(ROUTES.COMPANY.GET_COMPANY);
    },
    onError: () => notify.error("Failed to delete company."),
  });

  const statusMutation = useMutation({
    mutationFn: (payload: { id: string; isActive: boolean }) => updateCompanyStatus(payload.id, payload.isActive),
    onSuccess: (_, variables) => {
      notify.success(variables.isActive ? "Company activated successfully." : "Company deactivated successfully.");
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      refetch();
    },
    onError: () => notify.error("Failed to update company status."),
  });

  const isActive = company?.isActive !== false;
  const logoUrl = getCompanyLogoUrl(company?.logoImage);
  const addedByName = useMemo(() => (company ? getCompanyAddedByName(company) || "-" : "-"), [company]);
  const addedByEmail = useMemo(() => (company ? getCompanyAddedByEmail(company) || "-" : "-"), [company]);

  const handleDelete = async () => {
    if (!company?._id) return;

    const shouldDelete = await confirm({
      title: "Delete Company",
      message: "Are you sure you want to permanently remove this company?",
      confirmText: "Delete",
      cancelText: "Cancel",
      intent: "danger",
    });

    if (shouldDelete) {
      deleteMutation.mutate(company._id);
    }
  };

  const openStatusModal = () => {
    setPendingStatus({
      open: true,
      nextIsActive: !isActive,
      secondsLeft: 10,
    });
  };

  const closeStatusModal = () => {
    if (!statusMutation.isPending) {
      setPendingStatus(initialPendingStatus);
    }
  };

  const applyStatusChange = () => {
    if (!company?._id) return;

    statusMutation.mutate({
      id: company._id,
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
    company,
    isLoading,
    isError,
    isActive,
    logoUrl,
    addedByName,
    addedByEmail,
    pendingStatus,
    deleteMutation,
    statusMutation,
    handleDelete,
    openStatusModal,
    closeStatusModal,
    applyStatusChange,
    formatDate,
  };
};
