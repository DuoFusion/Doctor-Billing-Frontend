import { ShopOutlined } from "@ant-design/icons";
import { useMemo } from "react";
import AppLoader from "../../../components/common/loader/AppLoader";
import { formatBillPercent, toCurrency, useBillDetails } from "../../../hooks";

const InvoiceBill = () => {
  const {
    invoiceRef,
    billRecord,
    items,
    company,
    companyLocation,
    user,
    medicalStore,
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
  } = useBillDetails();

  const hasGst = totalIGST > 0 || totalSGST > 0 || totalCGST > 0;
  const ITEMS_PER_PAGE = 23;

  const pagedItems = useMemo(() => {
    if (!items.length) return [[]];
    const pages: Array<typeof items> = [];
    for (let i = 0; i < items.length; i += ITEMS_PER_PAGE) {
      pages.push(items.slice(i, i + ITEMS_PER_PAGE));
    }
    return pages;
  }, [items]);

  const SUMMARY_MIN_ROWS = 8;
  const remainder = items.length % ITEMS_PER_PAGE;
  const remainingRows = items.length === 0 ? ITEMS_PER_PAGE : remainder === 0 ? 0 : ITEMS_PER_PAGE - remainder;
  const shouldSplitSummary = items.length > 0 && remainingRows < SUMMARY_MIN_ROWS;


  const renderHeader = (safeBill: NonNullable<typeof billRecord>, options?: { showParties?: boolean }) => (
    <div className="invoice-header">
      <div className="company-brand">
        {companyLogoUrl ? (
          <img crossOrigin="anonymous" src={companyLogoUrl} alt={company?.name || "logo"} />
        ) : (
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-[#f4faec] text-[#6d8060]">
            <ShopOutlined />
          </span>
        )}
        <div>
          <h2>{company?.name || "-"}</h2>
          <p className="company-subtitle">Medical Billing Invoice</p>
        </div>
      </div>

      <div className="invoice-meta">
        <h1>INVOICE</h1>
        <p>Bill No: {safeBill.billNumber || "-"}</p>
        <p> Date: {safeBill.purchaseDate ? new Date(safeBill.purchaseDate).toLocaleDateString("en-GB") : "-"}</p>
      </div>

      {options?.showParties !== false ? (
        <>
          <div className="info-card">
            <h4>Invoice From</h4>
            <p>{[company?.address, companyLocation].filter(Boolean).join(", ") || ""}</p>
            <p>Phone: {company?.phone || "-"}</p>
            {company?.email ? <p>Email: {company?.email || ""}</p> : null}
            <p>GST: {company?.gstNumber?.toUpperCase?.() || "-"}</p>
          </div>

          <div className="info-card">
            <h4>Invoice To</h4>
            <p>
              Medical Name: <span className="invoice-to-name">{invoiceMedicalName}</span>
            </p>
            <p>Address: {invoiceToAddress || "-"}</p>
            <p>PAN Number: {invoicePan}</p>
            <p>GST Number: {invoiceGst}</p>
          </div>
        </>
      ) : null}
    </div>
  );

  const renderTable = (pageItems: typeof items, startIndex: number) => (
    <div className="invoice-table-wrap">
      <table className="invoice-table">
        <thead>
          <tr>
            <th>SR</th>
            <th>Product</th>
            <th>Category</th>
            <th>QTY</th>
            <th>FREE QTY</th>
            <th>MRP</th>
            <th>RATE</th>
            <th>TOTAL</th>
          </tr>
        </thead>
        <tbody>
          {pageItems.map((item, index) => (
            <tr key={`${item.name || "item"}-${startIndex + index}`}>
              <td>
                <span className="invoice-cell-content">{startIndex + index + 1}</span>
              </td>
              <td>
                <span className="invoice-cell-content invoice-cell-content-left">{item.name || "-"}</span>
              </td>
              <td>
                <span className="invoice-cell-content invoice-cell-content-left">
                  {item.category || (typeof item.product === "object" ? item.product.category || "-" : "-")}
                </span>
              </td>
              <td>
                <span className="invoice-cell-content">{item.qty || 0}</span>
              </td>
              <td>
                <span className="invoice-cell-content">{item.freeQty || 0}</span>
              </td>
              <td>
                <span className="invoice-cell-content invoice-cell-content-right">{toCurrency(item.mrp || 0)}</span>
              </td>
              <td>
                <span className="invoice-cell-content invoice-cell-content-right">{toCurrency(item.rate || 0)}</span>
              </td>
              <td className="amount-cell">
                <span className="invoice-cell-content invoice-cell-content-right">
                  {toCurrency(item.total || Number(item.qty || 0) * Number(item.rate || 0))}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderSummary = (safeBill: NonNullable<typeof billRecord>) => (
    <div className="invoice-lower">
      <div className="invoice-signature-panel">
        <p className="invoice-signature-title">Authorized Signature</p>
        {hasSignatureImage ? (
          <img
            className="invoice-summary-signature"
            crossOrigin="anonymous"
            src={signatureImageUrl}
            alt={(medicalStore?.name || user?.name || "Medical store") + " signature"}
            onError={() => setIsSignatureLoadFailed(true)}
          />
        ) : (
          <div className="invoice-signature-placeholder">Signature</div>
        )}
      </div>

      <div className="summary">
        <div className="summary-row">
          <span>Payment Method</span>
          <span>{safeBill.paymentMethod || "-"}</span>
        </div>
        <div className="summary-row">
          <span>Bill Status</span>
          <span>{safeBill.billStatus || "-"}</span>
        </div>
        <div className="summary-row">
          <span>Sub Total</span>
          <span>{toCurrency(discountedSubTotal)}</span>
        </div>

        {hasGst &&
          (totalIGST > 0 ? (
            <div className="summary-row">
              <span>IGST ({formatBillPercent(igstPercent)}%)</span>
              <span>{toCurrency(totalIGST)}</span>
            </div>
          ) : (
            <>
              <div className="summary-row">
                <span>SGST ({formatBillPercent(sgstPercent)}%)</span>
                <span>{toCurrency(totalSGST)}</span>
              </div>
              <div className="summary-row">
                <span>CGST ({formatBillPercent(cgstPercent)}%)</span>
                <span>{toCurrency(totalCGST)}</span>
              </div>
            </>
          ))}

        <div className="summary-row">
          <span>Discount</span>
          <span>{toCurrency(safeBill.discount)}</span>
        </div>
        <div className="summary-row summary-total">
          <span>Grand Total</span>
          <span>{toCurrency(safeBill.grandTotal)}</span>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return <AppLoader tip="Preparing invoice..." fullScreen={false} className="invoice-inline-loader" />;
  }

  if (isError || !billRecord) {
    return (
      <div className="app-loader-shell app-loader-shell-inline invoice-inline-loader">
        <p className="app-loader-error">Bill not found.</p>
      </div>
    );
  }

  const safeBill = billRecord!;

  return (
    <>
      <div className="invoice-export-shell" ref={invoiceRef}>
        <div className="invoice-page invoice-screen-only">
          <div className="invoice-wrapper">
            <div className="invoice-accent-bar" />
            {renderHeader(safeBill)}
            {renderTable(items, 0)}
            {renderSummary(safeBill)}
            <div className="footer">Thank you for your business.</div>
          </div>
        </div>

        <div className="invoice-print-only">
          {pagedItems.map((pageItems, pageIndex) => {
            const isLastPage = pageIndex === pagedItems.length - 1;
            return (
              <div className="invoice-page invoice-print-page" key={`invoice-page-${pageIndex}`}>
                <div className="invoice-wrapper invoice-print-wrapper">
                  <div className="invoice-accent-bar" />
                  {pageIndex === 0 ? renderHeader(safeBill, { showParties: true }) : null}
                  {renderTable(pageItems, pageIndex * ITEMS_PER_PAGE)}
                  {isLastPage && !shouldSplitSummary ? (
                    <>
                      {renderSummary(safeBill)}
                      <div className="footer">Thank you for your business.</div>
                    </>
                  ) : null}
                  <div className="invoice-accent-bar invoice-accent-bar-bottom" />
                </div>
              </div>
            );
          })}

          {shouldSplitSummary ? (
            <div className="invoice-page invoice-print-page" key="invoice-summary-page">
              <div className="invoice-wrapper invoice-print-wrapper">
                <div className="invoice-accent-bar" />
                {renderSummary(safeBill)}
                <div className="footer">Thank you for your business.</div>
                <div className="invoice-accent-bar invoice-accent-bar-bottom" />
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="button-wrapper">
        <button className="btn btn-print" onClick={handlePrint}>
          Print PDF
        </button>
        <button className="btn btn-download" onClick={handleDownload}>
          Download PDF
        </button>
      </div>
    </>
  );
};

export default InvoiceBill;
