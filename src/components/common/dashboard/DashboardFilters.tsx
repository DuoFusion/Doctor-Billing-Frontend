import { DatePicker, Select } from "antd";
import type { Dayjs } from "dayjs";
import { billDateRangePresets } from "../../../hooks";

const dashboardSelectClass = "!h-11 !w-full sm:!w-[260px] [&_.ant-select-selector]:!h-11 [&_.ant-select-selector]:!rounded-lg [&_.ant-select-selector]:!border-[#cfe4b7] [&_.ant-select-selector]:!bg-[#fefffc] [&_.ant-select-selection-item]:!leading-[42px] [&_.ant-select-selection-placeholder]:!leading-[42px]";
const dashboardRangeClass = "!h-11 !w-full sm:!w-[300px] !rounded-xl !border-[#cfe4b7] !bg-[#fefffc] hover:!border-[#b8d69a]";

const { RangePicker } = DatePicker;

type Option = { value: string; label: string };

type DashboardFiltersProps = {
  isAdmin: boolean;
  selectedMedicalStore: string;
  onMedicalStoreChange: (value: string) => void;
  medicalStoreOptions: Option[];
  selectedCompany: string;
  onCompanyChange: (value: string) => void;
  companyOptions: Option[];
  dateRange: [Dayjs, Dayjs] | null;
  onDateRangeChange: (value: [Dayjs, Dayjs] | null) => void;
};

const DashboardFilters = ({
  isAdmin,
  selectedMedicalStore,
  onMedicalStoreChange,
  medicalStoreOptions,
  selectedCompany,
  onCompanyChange,
  companyOptions,
  dateRange,
  onDateRangeChange,
}: DashboardFiltersProps) => (
  <div className="flex flex-col gap-3 rounded-2xl border border-[#d9e7c8] bg-[#f7ffef] p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6b7f5e]">Filters</p>
      <h2 className="mt-0 text-lg font-semibold text-[#2d4620]">Report Filters</h2>
    </div>

    <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
      {isAdmin && (
        <Select
          value={selectedMedicalStore || undefined}
          onChange={(value) => onMedicalStoreChange(value || "")}
          options={medicalStoreOptions}
          allowClear
          showSearch
          optionFilterProp="label"
          placeholder="Select Medical Store"
          className={dashboardSelectClass}
        />
      )}

      <Select
        value={selectedCompany || undefined}
        onChange={(value) => onCompanyChange(value || "")}
        options={companyOptions}
        allowClear
        showSearch
        optionFilterProp="label"
        placeholder="Select Company"
        className={dashboardSelectClass}
      />

      <RangePicker
        value={dateRange}
        onChange={(values) => {
          if (!values?.[0] || !values?.[1]) {
            onDateRangeChange(null);
            return;
          }
          onDateRangeChange([values[0].startOf("day"), values[1].endOf("day")]);
        }}
        presets={billDateRangePresets}
        allowEmpty={[true, true]}
        className={dashboardRangeClass}
      />
    </div>
  </div>
);

export default DashboardFilters;
