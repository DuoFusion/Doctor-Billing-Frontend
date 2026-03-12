import { ShopOutlined } from "@ant-design/icons";
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

  return (
    <>
      <div className="invoice-page" ref={invoiceRef}>
        <div className="invoice-wrapper">
          <div className="invoice-accent-bar" />

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
              <p>Bill No: {billRecord.billNumber || "-"}</p>
              <p> Date: {billRecord.purchaseDate ? new Date(billRecord.purchaseDate).toLocaleDateString() : "-"}</p>
            </div>

            <div className="info-card">
              <h4>Invoice From</h4>
              <p>{[company?.address, companyLocation].filter(Boolean).join(", ") || ""}</p>
              <p>Phone: {company?.phone || "-"}</p>
              {company?.email  ? <p>Email: {company?.email || ""}</p> : null}
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
          </div>

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
                {items.map((item, index) => (
                  <tr key={`${item.name || "item"}-${index}`}>
                    <td>
                      <span className="invoice-cell-content">{index + 1}</span>
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
                      <span className="invoice-cell-content invoice-cell-content-right">
                        {toCurrency(item.mrp || 0)}
                      </span>
                    </td>
                    <td>
                      <span className="invoice-cell-content invoice-cell-content-right">
                        {toCurrency(item.rate || 0)}
                      </span>
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
                <span>{billRecord.paymentMethod || "-"}</span>
              </div>
              <div className="summary-row">
                <span>Bill Status</span>
                <span>{billRecord.billStatus || "-"}</span>
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
                <span>{toCurrency(billRecord.discount)}</span>
              </div>
              <div className="summary-row summary-total">
                <span>Grand Total</span>
                <span>{toCurrency(billRecord.grandTotal)}</span>
              </div>
            </div>
          </div>

          <div className="footer">Thank you for your business.</div>
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
