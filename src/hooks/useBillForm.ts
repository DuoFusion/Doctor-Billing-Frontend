import { useEffect, useMemo, useState } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { addBill, getAllProductsByQuery, getBillById, updateBill } from "../api";
import { getMedicalStoreById } from "../api/medicalStore";
import { ROUTES } from "../constants/Routes";
import { VALIDATION_REGEX } from "../constants/validation";
import { notify } from "../utils/notify";
import { resolveObjectId, resolveOwnerUserId, resolveUserMedicalStoreId } from "../utils/medicalStoreScope";
import { useCompanies } from "./useCompanies";
import { unwrapBillRecord } from "./useBills";
import { buildUserOptions, useCurrentUser, useUsers } from "./useUsers";
import type { BillFormItem, BillRecord, UserRecord } from "../types";

type ItemErrors = {
  product?: string;
  qty?: string;
  freeQty?: string;
  mrp?: string;
  rate?: string;
};

type FormErrors = {
  user?: string;
  company?: string;
  items?: string;
  paymentMethod?: string;
};

const emptyItemErrors: ItemErrors = {};
const emptyFormErrors: FormErrors = {};
const allowedPaymentMethods = new Set(["Cash", "Credit"]);

// ============ Resolve bill edit record ============
const getEditBillRecord = (data: unknown) => {
  const response = data as { bill?: BillRecord; data?: BillRecord | { bill?: BillRecord } };

  if (response?.bill) return unwrapBillRecord(response.bill);
  if (response?.data && typeof response.data === "object" && "bill" in response.data) {
    return unwrapBillRecord(response.data.bill);
  }

  return unwrapBillRecord(response?.data || data);
};

// ============ Fill bill edit values into state ============
const mapBillItems = (bill: BillRecord | null): BillFormItem[] =>
  (bill?.items || []).map((item) => {
    const product = item.product || {};

    return {
      product: typeof product === "object" ? product._id || "" : String(product || ""),
      name: (typeof product === "object" ? product.name : "") || item.name || "",
      qty: Number(item.qty || 0),
      freeQty: Number(item.freeQty || 0),
      category: item.category || "",
      mrp: Number(item.mrp || 0),
      rate: Number(item.rate || 0),
    };
  });

// ============ Build company dropdown options for bill form ============
const buildBillCompanyOptions = (companies: any[] = [], billRecord: BillRecord | null) => {
  const activeCompanies = companies.filter((company) => company?.isActive !== false);
  const billCompanyId =
    (billRecord?.company && typeof billRecord.company === "object" ? billRecord.company._id : billRecord?.company) ||
    (billRecord?.items?.[0]?.company && typeof billRecord.items[0].company === "object"
      ? billRecord.items[0].company._id
      : billRecord?.items?.[0]?.company);

  if (!billCompanyId || activeCompanies.some((company) => company._id === billCompanyId)) {
    return activeCompanies;
  }

  return [
    ...activeCompanies,
    {
      _id: billCompanyId,
      name:
        (billRecord?.company && typeof billRecord.company === "object" ? billRecord.company.name : "") ||
        (billRecord?.items?.[0]?.company && typeof billRecord.items[0].company === "object"
          ? billRecord.items[0].company.name
          : "") ||
        billRecord?.companyName ||
        "Selected Company",
    },
  ];
};

// ============ Bill form query and mutation logic ============
export const useBillForm = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const { data: currentUserData, isLoading: isCurrentUserLoading } = useCurrentUser();
  const isAdmin = String(currentUserData?.user?.role || "").toLowerCase() === "admin";
  const currentUserMedicalStoreId = resolveUserMedicalStoreId(currentUserData?.user);

  const { data: usersData, isLoading: isUsersLoading } = useUsers(isAdmin);
  const users = (usersData?.users || []) as UserRecord[];

  const [selectedBillUserId, setSelectedBillUserId] = useState("");
  const [selectedMedicalStoreId, setSelectedMedicalStoreId] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [qty, setQty] = useState<number | "">(1);
  const [freeQty, setFreeQty] = useState<number | "">(0);
  const [mrp, setMrp] = useState<string>("0");
  const [rate, setRate] = useState<string>("0");
  const [items, setItems] = useState<BillFormItem[]>([]);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [billDiscount, setBillDiscount] = useState<number | "">(0);
  const [itemErrors, setItemErrors] = useState<ItemErrors>(emptyItemErrors);
  const [formErrors, setFormErrors] = useState<FormErrors>(emptyFormErrors);

  const selectedUserMedicalStoreId = useMemo(() => {
    if (!isAdmin || !selectedBillUserId) return "";
    return resolveUserMedicalStoreId(users.find((user) => user._id === selectedBillUserId));
  }, [isAdmin, selectedBillUserId, users]);

  useEffect(() => {
    if (!isAdmin && currentUserData?.user?._id) {
      setSelectedBillUserId(currentUserData.user._id);
    }
  }, [currentUserData, isAdmin]);

  useEffect(() => {
    if (!isAdmin && !isEdit) {
      setSelectedMedicalStoreId(currentUserMedicalStoreId || "");
    }
  }, [currentUserMedicalStoreId, isAdmin, isEdit]);

  useEffect(() => {
    if (isAdmin && selectedUserMedicalStoreId) {
      setSelectedMedicalStoreId(selectedUserMedicalStoreId);
    }
  }, [isAdmin, selectedUserMedicalStoreId]);

  //company data
  const { data: companiesData, isLoading: isCompaniesLoading } = useCompanies(selectedMedicalStoreId);

  // product data
  const { data: productsData, isLoading: isProductsLoading, isFetching: isProductsFetching,} = useQuery({
    queryKey: ["billableProducts", selectedMedicalStoreId],
    queryFn: () =>
      getAllProductsByQuery({
        billable: true,
        medicalStoreId: selectedMedicalStoreId || undefined,
        isActive: true,
      }),
    enabled: !!selectedMedicalStoreId,
    placeholderData: keepPreviousData,
  });

  // medical store
  const { data: selectedStoreData } = useQuery({
    queryKey: ["medicalStore", selectedMedicalStoreId],
    queryFn: () => getMedicalStoreById(selectedMedicalStoreId),
    enabled: !!selectedMedicalStoreId,
  });

  //bill data
  const { data: billData, isLoading: isBillLoading, isError: isBillError, error: billError } = useQuery({
    queryKey: ["bill", id],
    queryFn: () => getBillById(id as string),
    enabled: isEdit,
    retry: false,
  });

  const billRecord = useMemo(() => getEditBillRecord(billData), [billData]);

  useEffect(() => {
    if (!isBillError) return;
    notify.error(axios.isAxiosError(billError) ? billError.response?.data?.message || "Failed to load bill details" : "Failed to load bill details");
  }, [billError, isBillError]);

  const resetItemEditor = () => {
    setSelectedProduct("");
    setQty(1);
    setFreeQty(0);
    setMrp("0");
    setRate("0");
    setEditingItemIndex(null);
    setItemErrors(emptyItemErrors);
  };

  useEffect(() => {
    if (isEdit) return;
    setSelectedCompany("");
    setItems([]);
    resetItemEditor();
  }, [isEdit, selectedMedicalStoreId]);

  useEffect(() => {
    if (!billRecord) return;

    setSelectedBillUserId(resolveOwnerUserId(billRecord));
    setSelectedMedicalStoreId(resolveObjectId(billRecord.medicalStoreId));
    setSelectedCompany(
      String(
        (billRecord.company && typeof billRecord.company === "object" ? billRecord.company._id : billRecord.company) ||
          (billRecord.items?.[0]?.company && typeof billRecord.items[0].company === "object"
            ? billRecord.items[0].company._id
            : billRecord.items?.[0]?.company) ||
          ""
      )
    );
    setPaymentMethod(allowedPaymentMethods.has(String(billRecord.paymentMethod || "")) ? String(billRecord.paymentMethod) : "Cash");
    setBillDiscount(billRecord.discount ?? 0);
    setItems(mapBillItems(billRecord));
  }, [billRecord]);

  const productsForCompany = (productsData?.products || []).filter(
    (product: any) => resolveObjectId(product.company) === selectedCompany
  );

  const companySelectOptions = buildBillCompanyOptions(companiesData?.companies || [], billRecord).map((company) => ({
    value: company._id,
    searchLabel: company.name || "",
    label: company.name,
  }));

  const subtotal = items.reduce((sum, item) => sum + item.qty * item.rate, 0);
  const taxType = selectedStoreData?.taxType || "SGST_CGST";
  const taxPercent = Math.max(Number(selectedStoreData?.taxPercent) || 0, 0);
  const gstTotal = (subtotal * taxPercent) / 100;
  const sgstAmount = taxType === "SGST_CGST" ? gstTotal / 2 : 0;
  const cgstAmount = taxType === "SGST_CGST" ? gstTotal / 2 : 0;
  const igstAmount = taxType === "IGST" ? gstTotal : 0;
  const sgstPercent = taxPercent / 2;
  const cgstPercent = taxPercent / 2;
  const grandTotal = subtotal + gstTotal - (Number(billDiscount) || 0);

  const addItemToList = () => {
    const nextItemErrors: ItemErrors = {};

    if (!selectedCompany) nextItemErrors.product = "Select a company first";
    if (!selectedProduct) nextItemErrors.product = "Please select a product";
    if (qty === "" || Number(qty) < 1) nextItemErrors.qty = "Quantity must be at least 1";
    if (freeQty !== "" && Number(freeQty) < 0) nextItemErrors.freeQty = "Free qty cannot be negative";
    if (mrp === "" || Number(mrp) < 0) nextItemErrors.mrp = "MRP must be a valid number";
    if (rate === "" || Number(rate) <= 0) nextItemErrors.rate = "Purchase price must be greater than 0";

    setItemErrors(nextItemErrors);
    if (Object.keys(nextItemErrors).length > 0) return;

    const product = productsForCompany.find((row: any) => row._id === selectedProduct);
    if (!product) {
      setItemErrors({ product: "Selected product not found" });
      return;
    }

    const nextItem: BillFormItem = {
      product: product._id,
      name: product.name,
      qty: Number(qty) || 0,
      freeQty: Number(freeQty) || 0,
      category: "",
      mrp: Number(mrp) || 0,
      rate: Number(rate) || 0,
    };

    setItems((previous) =>
      editingItemIndex !== null
        ? previous.map((item, index) => (index === editingItemIndex ? nextItem : item))
        : [...previous, nextItem]
    );
    resetItemEditor();
  };

  const editItem = (index: number) => {
    const item = items[index];
    if (!item) return;

    setSelectedProduct(String(item.product));
    setQty(Number(item.qty) || 1);
    setFreeQty(Number(item.freeQty) || 0);
    setMrp(String(item.mrp || "0"));
    setRate(String(item.rate || "0"));
    setEditingItemIndex(index);
    setItemErrors(emptyItemErrors);
  };

  const removeItem = (index: number) => {
    setItems((previous) => previous.filter((_, itemIndex) => itemIndex !== index));

    if (editingItemIndex === index) {
      resetItemEditor();
      return;
    }

    if (editingItemIndex !== null && editingItemIndex > index) {
      setEditingItemIndex(editingItemIndex - 1);
    }
  };

  const clearItems = () => {
    setItems([]);
    setFormErrors((previous) => ({ ...previous, items: undefined }));
  };

  //update bill
  const mutation = useMutation({
    mutationFn: (payload: any) => (isEdit && id ? updateBill(id, payload) : addBill(payload)),
    onSuccess: () => {
      notify.success(isEdit ? "Bill updated successfully." : "Bill generated successfully.");
      queryClient.invalidateQueries({ queryKey: ["bills"] });
      setTimeout(() => navigate(ROUTES.BILL.GET_BILLS), 900);
    },
    onError: (error) => {
      notify.error(axios.isAxiosError(error) ? error.response?.data?.message || "Something went wrong" : "Something went wrong");
    },
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const billOwnerUserId = isAdmin ? selectedBillUserId : currentUserData?.user?._id;
    const billMedicalStoreId = isAdmin ? selectedMedicalStoreId : currentUserMedicalStoreId;
    const nextFormErrors: FormErrors = {};

    if (!billOwnerUserId || !VALIDATION_REGEX.objectId24.test(String(billOwnerUserId))) {
      if (isAdmin) nextFormErrors.user = "Please select a valid user";
      else {
        notify.error("Invalid user session. Please sign in again.");
        return;
      }
    }

    if (!billMedicalStoreId || !VALIDATION_REGEX.objectId24.test(billMedicalStoreId)) {
      if (isAdmin) nextFormErrors.user = "Selected user has no medical store assigned";
      else {
        notify.error("Medical store is not assigned to current user.");
        return;
      }
    }

    if (!selectedCompany) nextFormErrors.company = "Please select a company";
    if (selectedCompany && !VALIDATION_REGEX.objectId24.test(selectedCompany)) {
      nextFormErrors.company = "Please select a valid company";
    }
    if (items.length === 0) nextFormErrors.items = "Add at least one item to generate bill";
    if (!paymentMethod || !allowedPaymentMethods.has(paymentMethod)) nextFormErrors.paymentMethod = "Select a valid payment method";
    if (Number(billDiscount) < 0) nextFormErrors.items = "Bill discount cannot be negative";

    const hasInvalidItem = items.some(
      (item) =>
        !VALIDATION_REGEX.objectId24.test(String(item.product)) ||
        Number(item.qty) < 1 ||
        Number(item.freeQty || 0) < 0
    );
    if (hasInvalidItem) {
      nextFormErrors.items = "Please keep valid items: quantity must be at least 1 and free qty cannot be negative";
    }

    setFormErrors(nextFormErrors);
    if (Object.keys(nextFormErrors).length > 0) return;

    mutation.mutate({
      userId: String(billOwnerUserId),
      medicalStoreId: billMedicalStoreId,
      company: selectedCompany,
      items: items.map((item) => ({
        product: item.product,
        qty: item.qty,
        freeQty: Number(item.freeQty) || 0,
        mrp: item.mrp,
        rate: item.rate,
      })),
      paymentMethod,
      discount: Number(billDiscount) || 0,
    });
  };

  return {
    isEdit,
    isAdmin,
    goBack: () => navigate(-1),
    isPageLoading: isCurrentUserLoading || isBillLoading || (isAdmin && isUsersLoading),
    isCompaniesLoading,
    isProductsLoading,
    isProductsFetching,
    isBillError,
    billRecord,
    selectedMedicalStoreId,
    selectedBillUserId,
    setSelectedBillUserId,
    selectedCompany,
    setSelectedCompany,
    selectedProduct,
    setSelectedProduct,
    qty,
    setQty,
    freeQty,
    setFreeQty,
    mrp,
    setMrp,
    rate,
    setRate,
    items,
    editingItemIndex,
    paymentMethod,
    setPaymentMethod,
    billDiscount,
    setBillDiscount,
    itemErrors,
    formErrors,
    userSelectOptions: buildUserOptions(users),
    companySelectOptions,
    productsForCompany,
    subtotal,
    taxType,
    taxPercent,
    sgstAmount,
    cgstAmount,
    igstAmount,
    sgstPercent,
    cgstPercent,
    grandTotal,
    mutation,
    resetItemEditor,
    clearItems,
    addItemToList,
    editItem,
    removeItem,
    handleSubmit,
  };
};
