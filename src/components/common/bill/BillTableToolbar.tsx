import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, DatePicker, Input, Select } from "antd";
import type { Dayjs } from "dayjs";
import { billDateRangePresets } from "../../../hooks";
import { tableHeaderClass, tableInputClass, tablePrimaryButtonClass, tableSelectClass, tableToolbarActionWrapClass, tableToolbarFiltersClass, tableToolbarLayoutClass,} from "../table/themeClasses";

const { RangePicker } = DatePicker;

type BillTableToolbarProps = {
  isAdmin: boolean;
  searchInput: string;
  setSearchInput: (value: string) => void;
  selectedMedicalStore: string;
  setSelectedMedicalStore: (value: string) => void;
  selectedCompany: string;
  setSelectedCompany: (value: string) => void;
  medicalStoreOptions: Array<{ value: string; label: string }>;
  companyOptions: Array<{ value: string; label: string }>;
  isCompaniesLoading: boolean;
  dateRange: [Dayjs, Dayjs] | null;
  onRangeChange: (values: null | [Dayjs | null, Dayjs | null]) => void;
  onGenerate: () => void;
};

const BillTableToolbar = ({
  isAdmin,
  searchInput,
  setSearchInput,
  selectedMedicalStore,
  setSelectedMedicalStore,
  selectedCompany,
  setSelectedCompany,
  medicalStoreOptions,
  companyOptions,
  isCompaniesLoading,
  dateRange,
  onRangeChange,
  onGenerate,
}: BillTableToolbarProps) => (
  <div className={tableHeaderClass}>
    <div className={tableToolbarLayoutClass}>
      <div className={tableToolbarFiltersClass}>
        <Input
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          allowClear
          prefix={<SearchOutlined className="text-[#6d8060]" />}
          placeholder="Search by bill number"
          className={`${tableInputClass} !w-full sm:!w-[280px]`}
        />

        {isAdmin && (
          <Select
            value={selectedMedicalStore || undefined}
            onChange={(value) => setSelectedMedicalStore(value || "")}
            options={medicalStoreOptions}
            allowClear
            showSearch
            optionFilterProp="label"
            placeholder="Select medical store"
            className={`${tableSelectClass} !w-full sm:!w-[280px]`}
          />
        )}

        <Select
          value={selectedCompany || undefined}
          onChange={(value) => setSelectedCompany(value || "")}
          options={companyOptions}
          allowClear
          showSearch
          optionFilterProp="label"
          placeholder="Select company"
          loading={isCompaniesLoading}
          disabled={!companyOptions.length && isCompaniesLoading}
          className={`${tableSelectClass} !w-full sm:!w-[260px]`}
        />

        <RangePicker
          value={dateRange}
          onChange={onRangeChange}
          presets={billDateRangePresets}
          allowEmpty={[true, true]}
          className="!h-11 !w-full sm:!w-[290px] !rounded-xl !border-[#cfe4b7] !bg-[#fefffc] hover:!border-[#b8d69a]"
        />
      </div>

      <div className={tableToolbarActionWrapClass}>
        <Button type="text" icon={<PlusOutlined />} onClick={onGenerate} className={tablePrimaryButtonClass}>
          Generate Bill
        </Button>
      </div>
    </div>
  </div>
);

export default BillTableToolbar;
