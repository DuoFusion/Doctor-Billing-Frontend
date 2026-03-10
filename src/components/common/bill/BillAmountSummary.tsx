import { Typography } from "antd";
import { formatBillPercent } from "../../../hooks";

type BillAmountSummaryProps = {
  subtotal: number;
  taxType: string;
  taxPercent: number;
  sgstAmount: number;
  cgstAmount: number;
  igstAmount: number;
  sgstPercent: number;
  cgstPercent: number;
  discount: number | "";
  grandTotal: number;
};

const BillAmountSummary = ({
  subtotal,
  taxType,
  taxPercent,
  sgstAmount,
  cgstAmount,
  igstAmount,
  sgstPercent,
  cgstPercent,
  discount,
  grandTotal,
}: BillAmountSummaryProps) => (
  <div className="mt-5 rounded-lg border border-[#d9e7c8] bg-[#f7fde8] p-4">
    <Typography.Text className="!mb-3 !block !text-[#607257]">Summary</Typography.Text>
    <div className="flex justify-between text-sm">
      <span>Subtotal</span>
      <span>Rs {subtotal.toFixed(2)}</span>
    </div>

    {taxType === "IGST" ? (
      <div className="mt-2 flex justify-between text-sm">
        <span>IGST ({formatBillPercent(taxPercent)}%)</span>
        <span>Rs {igstAmount.toFixed(2)}</span>
      </div>
    ) : (
      <>
        <div className="mt-2 flex justify-between text-sm">
          <span>SGST ({formatBillPercent(sgstPercent)}%)</span>
          <span>Rs {sgstAmount.toFixed(2)}</span>
        </div>
        <div className="mt-2 flex justify-between text-sm">
          <span>CGST ({formatBillPercent(cgstPercent)}%)</span>
          <span>Rs {cgstAmount.toFixed(2)}</span>
        </div>
      </>
    )}

    <div className="mt-2 flex justify-between text-sm">
      <span>Discount</span>
      <span>Rs {(Number(discount) || 0).toFixed(2)}</span>
    </div>
    <div className="mt-4 flex items-center justify-between border-t border-[#d9e7c8] pt-3">
      <span className="text-sm text-[#607257]">Grand Total</span>
      <span className="text-lg font-semibold text-[#2d4620]">Rs {grandTotal.toFixed(2)}</span>
    </div>
  </div>
);

export default BillAmountSummary;
