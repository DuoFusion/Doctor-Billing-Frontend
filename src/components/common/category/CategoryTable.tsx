import { CheckCircleOutlined, DeleteOutlined, EditOutlined, PlusOutlined, PoweroffOutlined, SearchOutlined, SortAscendingOutlined,} from "@ant-design/icons";
import { Button, Card, Input, Select, Space, Table, Tabs, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useRef } from "react";
import { getCategoryAddedByEmail, getCategoryAddedByName, type CategoryRecord, type CategoryStatusTab, useCategoryTable,} from "../../../hooks";
import { ROUTES } from "../../../constants/Routes";
import ConfirmActiveStatusModal from "../confirm/ConfirmActiveStatusModal";
import ServerPaginationControls from "../table/ServerPaginationControls";
import TableEmpty from "../table/TableEmpty";
import TableLoader from "../table/TableLoader";
import { formatCreatedAndUpdatedAt } from "../../../utils/createdAndUpdatedDate";
import { renderNameEmail } from "../../../utils/addedBy";
import {
  tableActionButtonClass,
  tableCardClass,
  tableHeaderClass,
  tableInputClass,
  tablePrimaryButtonClass,
  tableSelectClass,
  tableSurfaceClass,
  tableTabClass,
  tableToolbarActionWrapClass,
  tableToolbarFiltersClass,
  tableToolbarLayoutClass,
} from "../table/themeClasses";

const categoryStatusTabs = [
  { key: "active", label: "Active Categories" },
  { key: "inactive", label: "Inactive Categories" },
] satisfies Array<{ key: CategoryStatusTab; label: string }>;

const categorySortOptions = [
  { value: "asc", label: "Added By: A to Z" },
  { value: "desc", label: "Added By: Z to A" },
];

const CategoryTable = () => {
  const formSectionRef = useRef<HTMLDivElement>(null);
  const {
    navigate,
    isAdmin,
    statusTab,
    setStatusTab,
    searchInput,
    setSearchInput,
    sortOrder,
    setSortOrder,
    selectedMedicalStore,
    setSelectedMedicalStore,
    page,
    setPage,
    limit,
    setLimit,
    pendingStatus,
    medicalStoreOptions,
    categories,
    total,
    totalPages,
    isLoading,
    isStoresLoading,
    isError,
    error,
    isFetching,
    statusMutation,
    resolveMedicalStoreName,
    handleDeleteCategory,
    closeStatusModal,
    openStatusModal,
    applyStatusChange,
  } = useCategoryTable();

  const columns: ColumnsType<CategoryRecord> = [
    {
      title: "Sr. No",
      key: "sr_no",
      width: 90,
      render: (_, __, index) => (page - 1) * limit + index + 1,
    },
    {
      title: "Category",
      dataIndex: "name",
      key: "name",
      render: (value: string) => <Typography.Text strong>{value || "-"}</Typography.Text>,
    },
    ...(isAdmin
      ? [
          {
            title: "Medical Store Name",
            key: "medicalStoreName",
            render: (_: unknown, record: CategoryRecord) => (
              <Typography.Text>{resolveMedicalStoreName(record.medicalStoreId)}</Typography.Text>
            ),
          },
        ]
      : []),
    ...(isAdmin
      ? [
          {
            title: "Added By",
            key: "addedBy",
            render: (_: unknown, record: CategoryRecord) =>
              renderNameEmail(getCategoryAddedByName(record), getCategoryAddedByEmail(record)),
          },
        ]
      : []),
    {
      title: "Created / Updated At",
      key: "createdUpdated",
      render: (_, record) => formatCreatedAndUpdatedAt(record.createdAt, record.updatedAt),
    },
    {
      title: "Actions",
      key: "actions",
      align: "center",
      width: 170,
      render: (_, record) => {
        const active = record.isActive !== false;
        return (
          <Space size={10}>
            <Button
              type="text"
              icon={active ? <PoweroffOutlined className="text-orange-600" /> : <CheckCircleOutlined className="text-emerald-600" />}
              onClick={() => openStatusModal(record)}
              className={tableActionButtonClass}
            />

            <Button
              type="text"
              icon={<EditOutlined className="text-[#4f6841]" />}
              onClick={() => navigate(ROUTES.CATEGORY.ADD_CATEGORY, { state: { id: record._id, name: record.name } })}
              className={tableActionButtonClass}
            />

            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteCategory(record._id)}
              className={`${tableActionButtonClass} hover:!border-[#f7caca] hover:!bg-red-50`}
            />
          </Space>
        );
      },
    },
  ];

  if (isLoading || isStoresLoading) return <TableLoader tip="Loading categories..." />;

  if (isError) {
    const knownError = error as { response?: { data?: { message?: string } }; message?: string };
    const errorMessage = knownError?.response?.data?.message || knownError?.message || "Something went wrong";

    return (
      <Typography.Text type="danger" className="p-6">
        {errorMessage}
      </Typography.Text>
    );
  }

  return (
    <div className="space-y-4">
      <div ref={formSectionRef} />

      <Card className={tableCardClass}>
        <div className={tableHeaderClass}>
          <div className={tableToolbarLayoutClass}>
            <div className={tableToolbarFiltersClass}>
              <Input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                allowClear
                prefix={<SearchOutlined className="text-[#6d8060]" />}
                placeholder="Search by category name"
                className={`${tableInputClass} !w-full sm:!w-[280px] lg:!w-[320px]`}
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
                  className={`${tableSelectClass} !w-full sm:!w-[260px]`}
                />
              )}

              {isAdmin && (
                <Select
                  value={sortOrder}
                  onChange={(value) => setSortOrder(value)}
                  options={categorySortOptions}
                  suffixIcon={<SortAscendingOutlined />}
                  className={`${tableSelectClass} !w-full sm:!w-[210px]`}
                />
              )}
            </div>

            <div className={tableToolbarActionWrapClass}>
              <Button type="text" icon={<PlusOutlined />} onClick={() => navigate(ROUTES.CATEGORY.ADD_CATEGORY)} className={tablePrimaryButtonClass}>
                Add Category
              </Button>
            </div>
          </div>
        </div>

        <Tabs activeKey={statusTab} onChange={(key) => setStatusTab(key as CategoryStatusTab)} items={categoryStatusTabs} className={tableTabClass} />

        <Table<CategoryRecord>
          className={tableSurfaceClass}
          rowKey="_id"
          columns={columns}
          dataSource={categories}
          loading={isFetching && !isLoading}
          pagination={false}
          locale={{ emptyText: <TableEmpty description="No Categories Found" /> }}
          scroll={{ x: "max-content" }}
        />

        <ServerPaginationControls
          page={page}
          limit={limit}
          total={total}
          totalPages={totalPages}
          currentCount={categories.length}
          onPageChange={setPage}
          onLimitChange={(nextLimit) => {
            setLimit(nextLimit);
            setPage(1);
          }}
        />

        <ConfirmActiveStatusModal
          open={pendingStatus.open}
          nextIsActive={pendingStatus.nextIsActive}
          countdown={pendingStatus.secondsLeft}
          subjectName={pendingStatus.category?.name}
          entityLabel="Category"
          onCancel={closeStatusModal}
          onConfirm={applyStatusChange}
          confirmLoading={statusMutation.isPending}
        />
      </Card>
    </div>
  );
};

export default CategoryTable;
