import { useNavigate } from "react-router-dom";
import { ArrowRight, View } from "lucide-react";
import { ROUTES } from "../../../constants/Routes";
import TableEmpty from "../table/TableEmpty";
import { renderNameEmail } from "../../../utils/addedBy";
import {
  dashboardTableCardClass,
  dashboardTableCellClass,
  dashboardTableClass,
  dashboardTableHeadCellClass,
  dashboardTableHeadClass,
  dashboardTableHeaderClass,
  dashboardTablePrimaryCellClass,
  dashboardTableRowClass,
  dashboardTableViewAllButtonClass,
  tableActionButtonClass,
} from "../table/themeClasses";

type Props = {
  bills: any[];
  currentUserRole?: string;
};

const BillRecentTable = ({ bills = [], currentUserRole }: Props) => {
  const navigate = useNavigate();

  const isAdmin = currentUserRole === "admin";

  const recentBills = (bills || [])
    .slice()
    .sort((a: any, b: any) => new Date(b?.createdAt || 0).getTime() - new Date(a?.createdAt || 0).getTime())
    .slice(0, 3);


  return (
    <div className={`${dashboardTableCardClass} my-8`}>
      <div className={dashboardTableHeaderClass}>
        <h2 className="text-lg font-semibold text-[#2d4620]">Bills</h2>

        <button
          onClick={() => navigate(ROUTES.BILL.GET_BILLS)}
          className={dashboardTableViewAllButtonClass}
        >
          View All
          <ArrowRight size={16} />
        </button>
      </div>

      <div className="app-table-scroll overflow-x-auto [touch-action:pan-x]">
        <table className={`${dashboardTableClass} min-w-[1300px]`}>
          <thead className={dashboardTableHeadClass}>
            <tr>
              <th className={dashboardTableHeadCellClass}>SR No</th>
              <th className={dashboardTableHeadCellClass}>Status</th>
              <th className={dashboardTableHeadCellClass}>Bill Number</th>
              <th className={dashboardTableHeadCellClass}>Supplier</th>
              <th className={dashboardTableHeadCellClass}>Company</th>
              <th className={dashboardTableHeadCellClass}>Date</th>
              <th className={dashboardTableHeadCellClass}>Total GST</th>
              <th className={dashboardTableHeadCellClass}>Items</th>
              {isAdmin && <th className={dashboardTableHeadCellClass}>Created By</th>}
              <th className={dashboardTableHeadCellClass}>Sub Total</th>
              <th className={dashboardTableHeadCellClass}>Grand Total</th>
              <th className={`${dashboardTableHeadCellClass} text-center`}>View Invoice</th>
            </tr>
          </thead>

          <tbody>
            {recentBills.length > 0 ? (
              recentBills.map((bill: any, index: number) => (
                <tr key={bill._id} className={dashboardTableRowClass}>
                  <td className={dashboardTableCellClass}>{index + 1}</td>

                  <td className={dashboardTableCellClass}>
                    <span
                      className={`rounded px-2 py-1 text-xs ${
                        bill.billStatus === "Paid"
                          ? "bg-[#ecfdf3] text-[#15803d]"
                          : "bg-[#fff1f2] text-[#dc2626]"
                      }`}
                    >
                      {bill.billStatus}
                    </span>
                  </td>

                  <td className={dashboardTablePrimaryCellClass}>{bill.billNumber}</td>

                  <td className={dashboardTableCellClass}>{bill.items?.[0]?.name || "-"}</td>

                  <td className={dashboardTableCellClass}>{bill.items?.[0]?.company?.name || "-"}</td>

                  <td className={dashboardTableCellClass}>
                    {bill.createdAt ? new Date(bill.createdAt).toLocaleDateString() : "-"}
                  </td>

                  <td className={dashboardTableCellClass}>Rs {bill.totalGST}</td>

                  <td className={dashboardTableCellClass}>{bill.items?.length}</td>

                  {isAdmin && (
                    <td className={`${dashboardTableCellClass} !text-[#6d8060]`}>
                      {renderNameEmail(
                        bill.userId && typeof bill.userId === "object" ? bill.userId.name : undefined,
                        bill.userId && typeof bill.userId === "object" ? bill.userId.email : undefined
                      )}
                    </td>
                  )}
                  <td className={`${dashboardTableCellClass} !font-semibold !text-[#3a592b]`}>Rs {Number(bill.subTotal).toFixed(2)}</td>
                  <td className={`${dashboardTableCellClass} !font-semibold !text-[#3a592b]`}>Rs {Number(bill.grandTotal).toFixed(2)}</td>

                  <td className={`${dashboardTableCellClass} text-center`}>
                    <button
                      className={`${tableActionButtonClass} !mx-auto`}
                      onClick={() => navigate(ROUTES.BILL.VIEW_INVOICE.replace(":id", bill._id))}
                    >
                      <View size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={isAdmin ? 12 : 11} className="py-6">
                  <TableEmpty description="No Recent Bills Found" />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BillRecentTable;
