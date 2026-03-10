import { Pagination, Select, Space, Typography } from "antd";

const ALL_PAGE_SIZE = 2147483647;
const PAGE_SIZE_OPTIONS = [10, 30, 50, 100];

type ServerPaginationControlsProps = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  currentCount: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
};

const ServerPaginationControls = ({
  page,
  limit,
  total,
  totalPages,
  currentCount,
  onPageChange,
  onLimitChange,
}: ServerPaginationControlsProps) => {
  const selectValue = limit === ALL_PAGE_SIZE ? "all" : limit;

  return (
    <div className="app-pagination-wrap flex flex-col gap-3 border-t border-[#e3edd9] px-4 py-4 md:flex-row md:items-center md:justify-between">
      <Typography.Text className="!text-[13px] !text-[#6d8060]">
        Showing {currentCount}/{total} results
      </Typography.Text>

      <Space size={10} wrap className="!w-full !justify-between md:!w-auto md:!justify-end">
        <Space size={8}>
          <Typography.Text className="!text-[13px] !text-[#6d8060]">Rows</Typography.Text>
          <Select
            value={selectValue}
            onChange={(value) => {
              if (value === "all") {
                onLimitChange(ALL_PAGE_SIZE);
                return;
              }
              onLimitChange(Number(value));
            }}
            options={[
              ...PAGE_SIZE_OPTIONS.map((size) => ({ value: size, label: size })),
              { value: "all", label: "All" },
            ]}
            className="!h-10 !w-[100px] [&_.ant-select-selector]:!h-10 [&_.ant-select-selector]:!rounded-lg [&_.ant-select-selector]:!border-[#cfe4b7] [&_.ant-select-selector]:!bg-[#fefffc] [&_.ant-select-selection-item]:!leading-[38px]"
          />
        </Space>

        <Pagination
          current={totalPages === 0 ? 1 : page}
          total={total}
          pageSize={limit}
          showSizeChanger={false}
          size="small"
          responsive
          onChange={(nextPage) => onPageChange(nextPage)}
          className="app-pagination !m-0"
        />
      </Space>
    </div>
  );
};

export default ServerPaginationControls;
