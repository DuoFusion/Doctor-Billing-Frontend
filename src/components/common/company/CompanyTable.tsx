import { CheckCircleOutlined, DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined, PoweroffOutlined, SearchOutlined, ShopOutlined, SortAscendingOutlined,} from "@ant-design/icons";
import { Avatar, Button, Card, Input, Select, Space, Table, Tabs, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { ROUTES } from "../../../constants/Routes";
import { getCompanyLogoUrl } from "../../../utils/uploadsUrl";
import ConfirmActiveStatusModal from "../confirm/ConfirmActiveStatusModal";
import ServerPaginationControls from "../table/ServerPaginationControls";
import TableEmpty from "../table/TableEmpty";
import TableLoader from "../table/TableLoader";
import { tableActionButtonClass, tableCardClass, tableHeaderClass, tableInputClass, tablePrimaryButtonClass, tableSelectClass, tableSurfaceClass, tableTabClass, tableToolbarActionWrapClass, tableToolbarFiltersClass, tableToolbarLayoutClass,} from "../table/themeClasses";
import { formatCreatedAndUpdatedAt } from "../../../utils/createdAndUpdatedDate";
import { renderNameEmail } from "../../../utils/addedBy";
import { getCompanyAddedByEmail, getCompanyAddedByName, type CompanyRecord, type CompanyStatusTab, useCompanyTable } from "../../../hooks";

const companyStatusTabs = [
  { key: "active", label: "Active Companies" },
  { key: "inactive", label: "Inactive Companies" },
] satisfies Array<{ key: CompanyStatusTab; label: string }>;

const sortOptions = [
  { value: "asc", label: "Added By: A to Z" },
  { value: "desc", label: "Added By: Z to A" },
];

const CompanyTable = () => {
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
    companies,
    total,
    totalPages,
    isLoading,
    isStoresLoading,
    isError,
    error,
    isFetching,
    statusMutation,
    resolveMedicalStoreName,
    handleDeleteCompany,
    closeStatusModal,
    openStatusModal,
    applyStatusChange,
    addCompanyRoute,
  } = useCompanyTable();

  const columns: ColumnsType<CompanyRecord> = [
    {
      title: "Sr. No",
      key: "sr_no",
      width: 90,
      render: (_, __, index) => ((page - 1) * limit) + index + 1,
    },
    {
      title: "Company",
      key: "name",
      render: (_, record) => {
        const logoUrl = getCompanyLogoUrl(record.logoImage);
        return (
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <Avatar size={38} src={logoUrl} />
            ) : (
              <Avatar size={38} icon={<ShopOutlined />} className="bg-[#edf4e3] text-[#6d8060]" />
            )}
            <Typography.Text strong>{record.name || "-"}</Typography.Text>
          </div>
        );
      },
    },
    ...(isAdmin
      ? [
          {
            title: "Medical Store Name",
            key: "medicalStoreName",
            render: (_: unknown, record: CompanyRecord) => (
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
            sorter: false,
            render: (_: unknown, record: CompanyRecord) =>
              renderNameEmail(getCompanyAddedByName(record), getCompanyAddedByEmail(record)),
          },
        ]
      : []),
    {
      title: "GST",
      dataIndex: "gstNumber",
      key: "gstNumber",
      render: (value: string) => <Typography.Text>{value || "-"}</Typography.Text>,
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      render: (value: string) => <Typography.Text>{value || "-"}</Typography.Text>,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (value: string) => <Typography.Text>{value || "-"}</Typography.Text>,
    },
    {
      title: "Created / Updated At",
      key: "createdUpdated",
      render: (_, record) => formatCreatedAndUpdatedAt(record.createdAt, record.updatedAt),
    },
    {
      title: "Action",
      key: "actions",
      width: 230,
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
              onClick={() => navigate(ROUTES.COMPANY.UPDATE_COMPANY.replace(":id", record._id))}
              className={tableActionButtonClass}
            />

            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteCompany(record._id)}
              className={`${tableActionButtonClass} hover:!border-[#f7caca] hover:!bg-red-50`}
            />

            <Button
              type="text"
              icon={<EyeOutlined className="text-[#4f6841]" />}
              onClick={() => navigate(ROUTES.COMPANY.VIEW_COMPANY.replace(":id", record._id))}
              className={tableActionButtonClass}
            />
          </Space>
        );
      },
    },
  ];

  if (isLoading || isStoresLoading) return <TableLoader tip="Loading companies..." />;

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
              placeholder={isAdmin ? "Search by company or added by" : "Search by company"}
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
                options={sortOptions}
                  suffixIcon={<SortAscendingOutlined />}
                  className={`${tableSelectClass} !w-full sm:!w-[210px]`}
              />
            )}
          </div>

          <div className={tableToolbarActionWrapClass}>
            <Button
              type="text"
              icon={<PlusOutlined />}
              onClick={() => navigate(addCompanyRoute)}
              className={tablePrimaryButtonClass}
            >
              Add Company
            </Button>
          </div>
        </div>
      </div>

      <Tabs
        activeKey={statusTab}
        onChange={(key) => setStatusTab(key as CompanyStatusTab)}
        items={companyStatusTabs}
        className={tableTabClass}
      />

      <Table<CompanyRecord>
        className={tableSurfaceClass}
        rowKey="_id"
        columns={columns}
        dataSource={companies}
        loading={isFetching && !isLoading}
        pagination={false}
        locale={{ emptyText: <TableEmpty description="No companies found" /> }}
        scroll={{ x: "max-content" }}
      />

      <ServerPaginationControls
        page={page}
        limit={limit}
        total={total}
        totalPages={totalPages}
        currentCount={companies.length}
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
        subjectName={pendingStatus.company?.name}
        entityLabel="Company"
        onCancel={closeStatusModal}
        onConfirm={applyStatusChange}
        confirmLoading={statusMutation.isPending}
      />
    </Card>
  );
};

export default CompanyTable;
