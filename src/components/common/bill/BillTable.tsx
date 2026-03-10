import { CheckCircleOutlined, DeleteOutlined, EditOutlined, EyeOutlined, PoweroffOutlined } from "@ant-design/icons";
import { Button, Card, Space, Table, Tabs, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import {
  getBillAddedByEmail,
  getBillAddedByName,
  toCurrency,
  type BillRecord,
  type BillStatusTab,
  useBillTable,
} from "../../../hooks";
import { ROUTES } from "../../../constants/Routes";
import { formatCreatedAndUpdatedAt } from "../../../utils/createdAndUpdatedDate";
import { renderNameEmail } from "../../../utils/addedBy";
import BillTableToolbar from "./BillTableToolbar";
import ConfirmActiveStatusModal from "../confirm/ConfirmActiveStatusModal";
import ServerPaginationControls from "../table/ServerPaginationControls";
import TableEmpty from "../table/TableEmpty";
import TableLoader from "../table/TableLoader";
import { tableActionButtonClass, tableCardClass, tableSurfaceClass, tableTabClass } from "../table/themeClasses";

const billStatusTabs = [
  { key: "active", label: "Active Bills" },
  { key: "inactive", label: "Inactive Bills" },
] satisfies Array<{ key: BillStatusTab; label: string }>;

const BillTable = () => {
  const {
    navigate,
    isAdmin,
    statusTab,
    setStatusTab,
    searchInput,
    setSearchInput,
    selectedMedicalStore,
    setSelectedMedicalStore,
    dateRange,
    onRangeChange,
    page,
    setPage,
    limit,
    setLimit,
    pendingStatus,
    medicalStoreOptions,
    bills,
    total,
    totalPages,
    isLoading,
    isStoresLoading,
    isError,
    error,
    isFetching,
    statusMutation,
    resolveMedicalStoreName,
    handleDeleteBill,
    closeStatusModal,
    openStatusModal,
    applyStatusChange,
  } = useBillTable();

  const columns: ColumnsType<BillRecord> = [
    {
      title: "SR No",
      key: "sr_no",
      width: 88,
      render: (_, __, index) => (page - 1) * limit + index + 1,
    },
    {
      title: "Status",
      key: "status",
      render: (_, bill) => (
        <Tag color={bill.billStatus === "Paid" ? "green" : bill.billStatus === "Unpaid" ? "red" : "gold"}>
          {bill.billStatus || "-"}
        </Tag>
      ),
    },
    {
      title: "Bill Number",
      dataIndex: "billNumber",
      key: "billNumber",
      render: (value: string) => <Typography.Text strong>{value || "-"}</Typography.Text>,
    },
    ...(isAdmin
      ? [
          {
            title: "Medical Store Name",
            key: "medicalStoreName",
            render: (_: unknown, bill: BillRecord) => (
              <Typography.Text>{resolveMedicalStoreName(bill.medicalStoreId)}</Typography.Text>
            ),
          },
        ]
      : []),
    {
      title: "Products",
      key: "products",
      width: 230,
      render: (_, bill) => bill.items?.map((item) => item.name).filter(Boolean).join(", ") || "-",
    },
    {
      title: "Company",
      key: "company",
      render: (_, bill) => {
        const company = bill.company || bill.items?.[0]?.company;
        return <Typography.Text>{typeof company === "object" ? company.name || "-" : "-"}</Typography.Text>;
      },
    },
    {
      title: "Date",
      key: "date",
      render: (_, bill) => (bill.createdAt ? dayjs(bill.createdAt).format("MM/DD/YYYY") : "-"),
    },
    {
      title: "Created / Updated At",
      key: "createdUpdated",
      render: (_, bill) => formatCreatedAndUpdatedAt(bill.createdAt, bill.updatedAt),
    },
    {
      title: "Total GST",
      key: "totalGST",
      render: (_, bill) => toCurrency(bill.totalGST),
    },
    {
      title: "Items",
      key: "items",
      render: (_, bill) => bill.items?.length || 0,
    },
    ...(isAdmin
      ? [
          {
            title: "Added By",
            key: "addedBy",
            render: (_: unknown, bill: BillRecord) => renderNameEmail(getBillAddedByName(bill), getBillAddedByEmail(bill)),
          },
        ]
      : []),
    {
      title: "Sub Total",
      key: "subTotal",
      render: (_, bill) => (
        <Typography.Text strong className="text-[#4f6841]">
          {toCurrency(bill.subTotal)}
        </Typography.Text>
      ),
    },
    {
      title: "Grand Total",
      key: "grandTotal",
      render: (_, bill) => (
        <Typography.Text strong className="text-emerald-700">
          {toCurrency(bill.grandTotal)}
        </Typography.Text>
      ),
    },
    {
      title: "View Invoice",
      key: "viewInvoice",
      align: "center",
      width: 110,
      render: (_, bill) => (
        <Button
          type="text"
          icon={<EyeOutlined className="text-[#4f6841]" />}
          onClick={() => navigate(ROUTES.BILL.VIEW_INVOICE.replace(":id", bill._id))}
          className={tableActionButtonClass}
        />
      ),
    },
    {
      title: "Actions",
      key: "actions",
      align: "center",
      width: 180,
      render: (_, bill) => {
        const active = bill.isActive !== false;

        return (
          <Space size={10}>
            <Button
              type="text"
              icon={active ? <PoweroffOutlined className="text-orange-600" /> : <CheckCircleOutlined className="text-emerald-600" />}
              onClick={() => openStatusModal(bill)}
              className={tableActionButtonClass}
            />
            <Button
              type="text"
              icon={<EditOutlined className="text-[#4f6841]" />}
              onClick={() => navigate(ROUTES.BILL.UPDATE_BILL.replace(":id", bill._id))}
              className={tableActionButtonClass}
            />
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteBill(bill._id)}
              className={`${tableActionButtonClass} hover:!border-[#f7caca] hover:!bg-red-50`}
            />
          </Space>
        );
      },
    },
  ];

  if (isLoading || isStoresLoading) return <TableLoader tip="Loading bills..." />;

  if (isError) {
    return (
      <Typography.Text type="danger" className="p-6">
        {(error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Something went wrong"}
      </Typography.Text>
    );
  }

  return (
    <Card className={tableCardClass}>
      <BillTableToolbar
        isAdmin={isAdmin}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        selectedMedicalStore={selectedMedicalStore}
        setSelectedMedicalStore={setSelectedMedicalStore}
        medicalStoreOptions={medicalStoreOptions}
        dateRange={dateRange}
        onRangeChange={onRangeChange}
        onGenerate={() => navigate(ROUTES.BILL.GENERATE_BILL)}
      />

      <Tabs activeKey={statusTab} onChange={(key) => setStatusTab(key as BillStatusTab)} items={billStatusTabs} className={tableTabClass} />

      <Table<BillRecord>
        className={tableSurfaceClass}
        rowKey="_id"
        columns={columns}
        dataSource={bills}
        loading={isFetching && !isLoading}
        pagination={false}
        locale={{ emptyText: <TableEmpty description="No Bills Found" /> }}
        scroll={{ x: "max-content" }}
      />

      <ServerPaginationControls
        page={page}
        limit={limit}
        total={total}
        totalPages={totalPages}
        currentCount={bills.length}
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
        subjectName={pendingStatus.bill?.billNumber}
        entityLabel="Bill"
        onCancel={closeStatusModal}
        onConfirm={applyStatusChange}
        confirmLoading={statusMutation.isPending}
      />
    </Card>
  );
};

export default BillTable;
