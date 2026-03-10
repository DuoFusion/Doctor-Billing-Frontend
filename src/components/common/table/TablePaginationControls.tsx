import type { Table } from "@tanstack/react-table";
import { Pagination, Select, Space, Typography } from "antd";

const ALL_PAGE_SIZE = 2147483647;
const PAGE_SIZE_OPTIONS = [10, 30, 50, 100];

type TablePaginationControlsProps<TData> = {
  table: Table<TData>;
};

const TablePaginationControls = <TData,>({ table }: TablePaginationControlsProps<TData>) => {
  const totalRows = table.getPrePaginationRowModel().rows.length;
  const currentPage = table.getState().pagination.pageIndex + 1;
  const totalPages = table.getPageCount();
  const pageSize = table.getState().pagination.pageSize;
  const selectValue = pageSize === ALL_PAGE_SIZE ? "all" : pageSize;

  return (
    <div className="app-pagination-wrap flex flex-col gap-3 border-t border-[#e3edd9] px-4 py-4 md:flex-row md:items-center md:justify-between sm:px-6">
      <Typography.Text className="!text-[13px] !text-[#6d8060]">
        Showing {totalRows === 0 ? 0 : table.getRowModel().rows.length}/{totalRows} results
      </Typography.Text>

      <Space size={10} wrap className="!w-full !justify-between md:!w-auto md:!justify-end">
        <Space size={8}>
          <Typography.Text className="!text-[13px] !text-[#6d8060]">Rows</Typography.Text>
          <Select
            value={selectValue}
            onChange={(value) => {
              if (value === "all") {
                table.setPageSize(ALL_PAGE_SIZE);
                return;
              }
              table.setPageSize(Number(value));
            }}
            options={[
              ...PAGE_SIZE_OPTIONS.map((size) => ({ value: size, label: size })),
              { value: "all", label: "All" },
            ]}
            className="!h-10 !w-[96px] [&_.ant-select-selector]:!h-10 [&_.ant-select-selector]:!rounded-lg [&_.ant-select-selector]:!border-[#cfe4b7] [&_.ant-select-selector]:!bg-[#fefffc] [&_.ant-select-selection-item]:!leading-[38px]"
          />
        </Space>

        <Pagination
          current={totalPages === 0 ? 1 : currentPage}
          total={totalRows}
          pageSize={pageSize}
          showSizeChanger={false}
          size="small"
          responsive
          onChange={(nextPage) => table.setPageIndex(nextPage - 1)}
          className="app-pagination !m-0"
        />
      </Space>
    </div>
  );
};

export default TablePaginationControls;
