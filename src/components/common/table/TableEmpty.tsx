import { Database } from "lucide-react";

const TableEmpty = ({ description = "No data found" }: { description?: string }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-4 text-center">
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-[#d9e7c8] bg-gradient-to-br from-[#fefffc] to-[#edf9e0] text-[#5f7e4f]">
        <Database size={26} strokeWidth={1.8} />
      </span>
      <div className="space-y-1">
        <p className="text-sm font-semibold tracking-wide text-[#2d4620]">{description}</p>
        <p className="text-xs text-[#6d8060]">No records available right now. Try changing filters or adding a new entry.</p>
      </div>
    </div>
  );
};

export default TableEmpty;
