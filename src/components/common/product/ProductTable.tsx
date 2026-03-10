import { CheckCircleOutlined, DeleteOutlined, EditOutlined, PlusOutlined, PoweroffOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Card, Input, Select, Space, Table, Tabs, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { ROUTES } from "../../../constants/Routes";
import ConfirmActiveStatusModal from "../confirm/ConfirmActiveStatusModal";
import ServerPaginationControls from "../table/ServerPaginationControls";
import TableEmpty from "../table/TableEmpty";
import TableLoader from "../table/TableLoader";
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
import { formatCreatedAndUpdatedAt } from "../../../utils/createdAndUpdatedDate";
import { renderNameEmail } from "../../../utils/addedBy";
import { getAddedByEmail, getAddedByName, type ProductRow, type ProductStatusTab, useProductTable } from "../../../hooks";

const productStatusTabs = [
  { key: "active", label: "Active Products" },
  { key: "inactive", label: "Inactive Products" },
] satisfies Array<{ key: ProductStatusTab; label: string }>;

const renderActionButtons = (
  record: ProductRow,
  navigate: (path: string) => void,
  openStatusModal: (product: ProductRow) => void,
  handleDeleteProduct: (id: string) => void
) => {
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
        onClick={() => navigate(`/update-product/${record._id}`)}
        className={tableActionButtonClass}
      />

      <Button
        type="text"
        danger
        icon={<DeleteOutlined />}
        onClick={() => handleDeleteProduct(record._id)}
        className={`${tableActionButtonClass} hover:!border-[#f7caca] hover:!bg-red-50`}
      />
    </Space>
  );
};

const ProductTable = () => {
  const {
    navigate,
    isAdmin,
    statusTab,
    setStatusTab,
    searchInput,
    setSearchInput,
    selectedMedicalStore,
    setSelectedMedicalStore,
    selectedCategory,
    setSelectedCategory,
    page,
    setPage,
    limit,
    setLimit,
    pendingStatus,
    medicalStoreOptions,
    categoryOptions,
    products,
    total,
    totalPages,
    isLoading,
    isStoresLoading,
    isError,
    error,
    isFetching,
    statusMutation,
    resolveMedicalStoreName,
    handleDeleteProduct,
    closeStatusModal,
    openStatusModal,
    applyStatusChange,
  } = useProductTable();

  const columns: ColumnsType<ProductRow> = [
    {
      title: "Sr. No",
      key: "sr_no",
      width: 90,
      render: (_, __, index) => ((page - 1) * limit) + index + 1,
    },
    {
      title: "Product",
      dataIndex: "name",
      key: "name",
      render: (value: string) => <Typography.Text strong>{value || "-"}</Typography.Text>,
    },
    ...(isAdmin
      ? [
          {
            title: "Medical Store Name",
            key: "medicalStoreName",
            render: (_: unknown, record: ProductRow) => (
              <Typography.Text>{resolveMedicalStoreName(record.medicalStoreId)}</Typography.Text>
            ),
          },
        ]
      : []),
    {
      title: "Company",
      dataIndex: ["company", "name"],
      key: "company",
      render: (_, record) => <Typography.Text>{record.company?.name || "-"}</Typography.Text>,
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (value: string) => <Typography.Text>{value || "-"}</Typography.Text>,
    },
    ...(isAdmin
      ? [{
          title: "Added By",
          key: "addedBy",
          render: (_: unknown, record: ProductRow) =>
            renderNameEmail(getAddedByName(record), getAddedByEmail(record)),
        }]
      : []),
    {
      title: "Created / Updated At",
      key: "createdUpdated",
      render: (_, record) => formatCreatedAndUpdatedAt(record.createdAt, record.updatedAt),
    },
    {
      title: "Action",
      key: "actions",
      width: 180,
      render: (_, record) => renderActionButtons(record, navigate, openStatusModal, handleDeleteProduct),
    },
  ];

  if (isLoading || isStoresLoading) return <TableLoader tip="Loading products..." />;

  if (isError) {
    return (
      <Typography.Text type="danger" className="p-6">
        {(error as Error).message}
      </Typography.Text>
    );
  }

  return (
    <Card className={tableCardClass}>
      <div className={tableHeaderClass}>
        <div className={tableToolbarLayoutClass}>
          <div className={tableToolbarFiltersClass}>
            <Input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              allowClear
              prefix={<SearchOutlined className="text-[#6d8060]" />}
              placeholder="Search by product or company"
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
                className={`${tableSelectClass} !w-full sm:!w-[250px]`}
              />
            )}

            <Select
              value={selectedCategory || undefined}
              onChange={(value) => setSelectedCategory(value || "")}
              options={categoryOptions}
              allowClear
              placeholder="All categories"
              className={`${tableSelectClass} !w-full sm:!w-[210px]`}
            />
          </div>

          <div className={tableToolbarActionWrapClass}>
            <Button
              type="text"
              icon={<PlusOutlined />}
              onClick={() => navigate(ROUTES.PRODUCTS.ADD_PRODUCT)}
              className={tablePrimaryButtonClass}
            >
              Add Product
            </Button>
          </div>
        </div>
      </div>

      <Tabs
        activeKey={statusTab}
        onChange={(key) => setStatusTab(key as ProductStatusTab)}
        items={productStatusTabs}
        className={tableTabClass}
      />

      <Table<ProductRow>
        className={tableSurfaceClass}
        rowKey="_id"
        columns={columns}
        dataSource={products}
        loading={isFetching && !isLoading}
        pagination={false}
        locale={{ emptyText: <TableEmpty description="No products found" /> }}
        scroll={{ x: "max-content" }}
      />

      <ServerPaginationControls
        page={page}
        limit={limit}
        total={total}
        totalPages={totalPages}
        currentCount={products.length}
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
        subjectName={pendingStatus.product?.name}
        entityLabel="Product"
        onCancel={closeStatusModal}
        onConfirm={applyStatusChange}
        confirmLoading={statusMutation.isPending}
      />
    </Card>
  );
};

export default ProductTable;
