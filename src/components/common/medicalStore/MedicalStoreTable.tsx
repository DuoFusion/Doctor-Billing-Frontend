import { CheckCircleOutlined, DeleteOutlined, EditOutlined, PlusOutlined, PoweroffOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Card, Input, Space, Table, Tabs, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { MedicalStoreRecord, MedicalStoreStatusTab } from "../../../types";
import { useCurrentUser, useMedicalStoreTable } from "../../../hooks";
import ConfirmActiveStatusModal from "../confirm/ConfirmActiveStatusModal";
import { useConfirm } from "../confirm/ConfirmProvider";
import ServerPaginationControls from "../table/ServerPaginationControls";
import TableEmpty from "../table/TableEmpty";
import TableLoader from "../table/TableLoader";
import {
  tableActionButtonClass,
  tableCardClass,
  tableHeaderClass,
  tableInputClass,
  tablePrimaryButtonClass,
  tableSurfaceClass,
  tableTabClass,
  tableToolbarActionWrapClass,
  tableToolbarFiltersClass,
  tableToolbarLayoutClass,
} from "../table/themeClasses";
import { formatCreatedAndUpdatedAt } from "../../../utils/createdAndUpdatedDate";

const storeStatusTabs = [
  { key: "active", label: "Active Stores" },
  { key: "inactive", label: "Inactive Stores" },
] satisfies Array<{ key: MedicalStoreStatusTab; label: string }>;

const isStoreActive = (store: MedicalStoreRecord) => store.isActive !== false;

const MedicalStoreTable = () => {
  const confirm = useConfirm();
  const { data: currentUserData } = useCurrentUser();
  const isAdmin = currentUserData?.user?.role === "admin";
  const {
    navigate,
    stores,
    totalCount,
    totalPages,
    isLoading,
    statusTab,
    setStatusTab,
    searchInput,
    setSearchInput,
    applySearch,
    page,
    setPage,
    limit,
    setLimit,
    pendingStatus,
    openStatusModal,
    closeStatusModal,
    handleDelete,
    applyStatusChange,
    addStoreRoute,
    editStoreRoute,
  } = useMedicalStoreTable(isAdmin);

  const handleDeleteConfirm = async (id: string) => {
    const ok = await confirm({
      title: "Delete Medical Store",
      message: "Are you sure you want to delete this medical store?",
      confirmText: "Delete",
      cancelText: "Cancel",
      intent: "danger",
    });

    if (ok) {
      handleDelete(id);
    }
  };

  const columns: ColumnsType<MedicalStoreRecord> = [
    {
      title: "Sr. No",
      key: "sr_no",
      width: 90,
      render: (_, __, index) => (page - 1) * limit + index + 1,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (value) => <Typography.Text strong>{value || "-"}</Typography.Text>,
    },
    {
      title: "GST Number",
      dataIndex: "gstNumber",
      key: "gstNumber",
      render: (value) => <Typography.Text>{value || "-"}</Typography.Text>,
    },
    {
      title: "PAN Number",
      dataIndex: "panNumber",
      key: "panNumber",
      render: (value) => <Typography.Text>{value || "-"}</Typography.Text>,
    },
    {
      title: "Created / Updated At",
      key: "createdUpdated",
      render: (_, record) => formatCreatedAndUpdatedAt(record.createdAt, record.updatedAt),
    },
    {
      title: "Location",
      key: "location",
      render: (_, record) => (
        <Typography.Text>
          {record.pincode || ""}
          {record.address ? `, ${record.address}` : ""}
          {record.state ? `, ${record.state}` : ""}
        </Typography.Text>
      ),
    },
    {
      title: "Action",
      key: "actions",
      width: 230,
      render: (_, record) => {
        const active = isStoreActive(record);
        return (
          <Space size={10}>
            {isAdmin && (
              <Button
                type="text"
                icon={active ? <PoweroffOutlined className="text-orange-600" /> : <CheckCircleOutlined className="text-emerald-600" />}
                onClick={() => openStatusModal(record)}
                className={tableActionButtonClass}
              />
            )}

            {isAdmin && (
              <>
                <Button
                  type="text"
                  icon={<EditOutlined className="text-[#4f6841]" />}
                  onClick={() => navigate(editStoreRoute.replace(":id", record._id))}
                  className={tableActionButtonClass}
                />

                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleDeleteConfirm(record._id)}
                  className={`${tableActionButtonClass} hover:!border-[#f7caca] hover:!bg-red-50`}
                />
              </>
            )}
          </Space>
        );
      },
    },
  ];

  if (isLoading && !stores.length) return <TableLoader />;

  return (
    <Card className={tableCardClass}>
      <div className={tableHeaderClass}>
        <div className={tableToolbarLayoutClass}>
          <div className={tableToolbarFiltersClass}>
            <Input
              placeholder="Search by name"
              prefix={<SearchOutlined className="text-[#6d8060]" />}
              suffix={<SearchOutlined className="text-[#6d8060] cursor-pointer" onClick={applySearch} />}
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  applySearch();
                }
              }}
              className={`${tableInputClass} !w-full sm:!w-[280px] lg:!w-[320px]`}
            />
          </div>

          {isAdmin && (
            <div className={tableToolbarActionWrapClass}>
              <Button type="text" icon={<PlusOutlined />} className={tablePrimaryButtonClass} onClick={() => navigate(addStoreRoute)}>
                Add Store
              </Button>
            </div>
          )}
        </div>
      </div>

      <Tabs
        activeKey={statusTab}
        onChange={(key) => setStatusTab(key as MedicalStoreStatusTab)}
        className={tableTabClass}
        items={storeStatusTabs}
      />

      <Table<MedicalStoreRecord>
        dataSource={stores}
        columns={columns}
        rowKey="_id"
        pagination={false}
        locale={{ emptyText: <TableEmpty description="No medical stores found" /> }}
        className={tableSurfaceClass}
        scroll={{ x: "max-content" }}
      />

      <ServerPaginationControls
        page={page}
        limit={limit}
        total={totalCount}
        totalPages={totalPages}
        currentCount={stores.length}
        onPageChange={setPage}
        onLimitChange={setLimit}
      />

      <ConfirmActiveStatusModal
        open={pendingStatus.open}
        nextIsActive={pendingStatus.nextIsActive}
        countdown={pendingStatus.secondsLeft}
        onConfirm={applyStatusChange}
        onCancel={closeStatusModal}
      />
    </Card>
  );
};

export default MedicalStoreTable;
