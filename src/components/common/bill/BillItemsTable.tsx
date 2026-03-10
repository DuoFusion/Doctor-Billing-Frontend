import { Button } from "antd";
import type { BillFormItem } from "../../../hooks";

type BillItemsTableProps = {
  items: BillFormItem[];
  onEdit: (index: number) => void;
  onRemove: (index: number) => void;
};

const BillItemsTable = ({ items, onEdit, onRemove }: BillItemsTableProps) => {
  if (items.length === 0) return null;

  return (
    <div className="app-table-scroll mt-4 overflow-x-auto rounded-lg border border-[#d9e7c8]">
      <table className="app-data-table min-w-[760px] w-full text-left text-sm text-[#3d564a]">
        <thead>
          <tr>
            <th className="px-3 py-2">Product</th>
            <th className="px-3 py-2">MRP</th>
            <th className="px-3 py-2">Purchase Price</th>
            <th className="px-3 py-2">Qty</th>
            <th className="px-3 py-2">Free Qty</th>
            <th className="px-3 py-2">Total Amount</th>
            <th className="px-3 py-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={`${item.product}-${index}`}>
              <td className="px-3 py-2">{item.name}</td>
              <td className="px-3 py-2">Rs {Number(item.mrp || 0).toFixed(2)}</td>
              <td className="px-3 py-2">Rs {Number(item.rate || 0).toFixed(2)}</td>
              <td className="px-3 py-2">{item.qty}</td>
              <td className="px-3 py-2">{item.freeQty || 0}</td>
              <td className="px-3 py-2">Rs {(item.qty * (item.rate || 0)).toFixed(2)}</td>
              <td className="px-3 py-2 text-center">
                <div className="flex items-center justify-center gap-2">
                  <Button onClick={() => onEdit(index)} className="!h-9 !rounded-lg">
                    Edit
                  </Button>
                  <Button danger onClick={() => onRemove(index)} className="!h-9 !rounded-lg">
                    Remove
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BillItemsTable;
