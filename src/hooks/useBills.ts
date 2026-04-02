import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { jsPDF } from "jspdf";
import { getBillById } from "../api";
import { getCompanyLogoUrl, getSignatureImageUrl } from "../utils/uploadsUrl";
import type { BillItemRecord, BillRecord, CompanyRecord, MedicalStoreRecord, UserRecord } from "../types";

// ============ Normalize bill API response ============
export const unwrapBillRecord = (value: unknown): BillRecord | null => {
  if (!value || typeof value !== "object") return value as BillRecord | null;

  if ("_doc" in value && value._doc && typeof value._doc === "object") {
    return {
      ...value._doc,
      ...("items" in value && value.items ? { items: value.items } : {}),
      ...("userId" in value && value.userId ? { userId: value.userId } : {}),
      ...("medicalStoreId" in value && value.medicalStoreId ? { medicalStoreId: value.medicalStoreId } : {}),
    } as BillRecord;
  }

  return value as BillRecord;
};

// ============ Bill table added-by name ============
export const getBillAddedByName = (bill: BillRecord) => {
  const owner = bill.user || bill.userId;
  return owner && typeof owner === "object" ? owner.name || "-" : "-";
};

// ============ Bill table added-by email ============
export const getBillAddedByEmail = (bill: BillRecord) => {
  const owner = bill.user || bill.userId;
  return owner && typeof owner === "object" ? owner.email || "-" : "-";
};

// ============ Currency formatter for bills ============
export const toCurrency = (value?: number | string) => `Rs ${(Number(value) || 0).toFixed(2)}`;

// ============ Percent formatter for bill summary ============
export const formatBillPercent = (value: number) => Number(value.toFixed(2)).toString();

// ============ Date formatter for invoice bill ============
export const formatBillDate = (value?: string) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-CA");
};

// ============ Bill invoice/detail hook ============
export const useBillDetails = () => {
  const { id } = useParams();
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [isSignatureLoadFailed, setIsSignatureLoadFailed] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["singleBill", id],
    queryFn: () => getBillById(id as string),
    enabled: !!id,
  });

  const billRecord = useMemo(
    () => unwrapBillRecord((data as { bill?: BillRecord; data?: BillRecord })?.bill || (data as { data?: BillRecord })?.data || data),
    [data]
  );
  const company =
    (billRecord?.company && typeof billRecord.company === "object" ? billRecord.company : null) ||
    (billRecord?.items?.[0]?.company && typeof billRecord.items[0].company === "object" ? billRecord.items[0].company : null) ||
    ({} as Partial<CompanyRecord>);
  const user =
    (billRecord?.user && typeof billRecord.user === "object" ? billRecord.user : null) ||
    (billRecord?.userId && typeof billRecord.userId === "object" ? billRecord.userId : null) ||
    ({} as Partial<UserRecord>);
  const medicalStore = ((billRecord?.medicalStore && typeof billRecord.medicalStore === "object"
    ? billRecord.medicalStore
    : null) ||
    (billRecord?.medicalStoreId && typeof billRecord.medicalStoreId === "object" ? billRecord.medicalStoreId : null) ||
    {}) as Partial<MedicalStoreRecord>;

  const companyLogoUrl = getCompanyLogoUrl(company?.logoImage);
  const signatureImageUrl = getSignatureImageUrl(medicalStore?.signatureImg || user?.signatureImg);
  const hasSignatureImage = Boolean(signatureImageUrl) && !isSignatureLoadFailed;

  const items = (billRecord?.items || []) as BillItemRecord[];
  const companyLocation = [company?.city, company?.state, company?.pincode].filter(Boolean).join(", ");
  const invoiceToAddress = [medicalStore?.address || user?.address, medicalStore?.pincode || user?.pincode, medicalStore?.state || user?.state]
    .filter(Boolean)
    .join(", ");
  const invoiceMedicalName = medicalStore?.name || user?.medicalName || user?.name || "-";
  const invoicePan = medicalStore?.panNumber || user?.pan || "-";
  const invoiceGst = medicalStore?.gstNumber || user?.gstin || "-";
  const totalSGSTByItem = items.reduce((sum, item) => sum + (Number(item?.sgst) || 0), 0);
  const totalCGSTByItem = items.reduce((sum, item) => sum + (Number(item?.cgst) || 0), 0);
  const totalIGSTByItem = items.reduce((sum, item) => sum + (Number(item?.igst) || 0), 0);

  const billSubTotal = Number(billRecord?.subTotal || 0);
  const billDiscount = Number(billRecord?.discount || 0);
  const discountedSubTotal = Math.max(billSubTotal - billDiscount, 0);

  const billTotalGST = Number(billRecord?.totalGST || 0);
  const totalGST = billTotalGST || totalSGSTByItem + totalCGSTByItem + totalIGSTByItem;

  // Determine tax type (prefer bill-level GST info; fall back to item-level GST presence)
  const hasIGST = totalIGSTByItem > 0 && totalSGSTByItem === 0 && totalCGSTByItem === 0;
  const hasSGST = totalSGSTByItem > 0 || totalCGSTByItem > 0;

  const totalIGST = hasIGST ? totalGST : 0;
  const totalSGST = hasSGST ? totalGST / 2 : 0;
  const totalCGST = hasSGST ? totalGST / 2 : 0;

  const sgstPercent = discountedSubTotal > 0 ? (totalSGST * 100) / discountedSubTotal : 0;
  const cgstPercent = discountedSubTotal > 0 ? (totalCGST * 100) / discountedSubTotal : 0;
  const igstPercent = discountedSubTotal > 0 ? (totalIGST * 100) / discountedSubTotal : 0;

  useEffect(() => {
    setIsSignatureLoadFailed(false);
  }, [signatureImageUrl]);

  const handlePrint = () => window.print();

  const handleDownload = async () => {
    if (!invoiceRef.current || !billRecord) return;

    const invoiceElement = invoiceRef.current;
    invoiceElement.classList.add("invoice-export-desktop");

    try {
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      });

      const { default: html2canvas } = await import("html2canvas");
      const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const pages = Array.from(invoiceElement.querySelectorAll<HTMLElement>(".invoice-print-page"));
      const targetPages = pages.length ? pages : Array.from(invoiceElement.querySelectorAll<HTMLElement>(".invoice-page"));

      for (let i = 0; i < targetPages.length; i += 1) {
        const pageElement = targetPages[i];
        const canvas = await html2canvas(pageElement, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
          scrollX: 0,
          scrollY: 0,
          windowWidth: 1440,
        });
        const imgData = canvas.toDataURL("image/jpeg", 1);
        const imgWidth = pdfWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, Math.min(imgHeight, pdfHeight));
        if (i < targetPages.length - 1) {
          pdf.addPage();
        }
      }

      pdf.save(`Invoice-${billRecord.billNumber}.pdf`);
    } finally {
      invoiceElement.classList.remove("invoice-export-desktop");
    }
  };

  return {
    invoiceRef,
    billRecord,
    items,
    company,
    user,
    medicalStore,
    companyLocation,
    invoiceToAddress,
    invoiceMedicalName,
    invoicePan,
    invoiceGst,
    discountedSubTotal,
    totalSGST,
    totalCGST,
    totalIGST,
    sgstPercent,
    cgstPercent,
    igstPercent,
    companyLogoUrl,
    signatureImageUrl,
    hasSignatureImage,
    setIsSignatureLoadFailed,
    isLoading,
    isError,
    handlePrint,
    handleDownload,
  };
};
