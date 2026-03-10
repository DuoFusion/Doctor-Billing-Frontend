import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircleOutlined, DeleteOutlined, EditOutlined, PlusOutlined, PoweroffOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Card, Input, Space, Table, Tabs, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteUser, getAllUsersByQuery, type UserRecord, updateUserStatus } from "../../api";
import { ROUTES } from "../../constants/Routes";
import { notify } from "../../utils/notify";
import { useConfirm } from "../common/confirm/ConfirmProvider";
import ConfirmActiveStatusModal from "../common/confirm/ConfirmActiveStatusModal";
import ServerPaginationControls from "../common/table/ServerPaginationControls";
import TableEmpty from "../common/table/TableEmpty";
import TableLoader from "../common/table/TableLoader";
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
} from "../common/table/themeClasses";
import { formatCreatedAndUpdatedAt } from "../../utils/createdAndUpdatedDate";

type UserStatusTab = "active" | "inactive";

type PendingStatusChange = {
  open: boolean;
  user: UserRecord | null;
  nextIsActive: boolean;
  secondsLeft: number;
};

const initialPendingStatus: PendingStatusChange = {
  open: false,
  user: null,
  nextIsActive: false,
  secondsLeft: 10,
};

const ManageUsersTable = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const confirm = useConfirm();

  const [statusTab, setStatusTab] = useState<UserStatusTab>("active");
  const [searchInput, setSearchInput] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pendingStatus, setPendingStatus] = useState<PendingStatusChange>(initialPendingStatus);

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ["users", searchValue, statusTab, page, limit],
    queryFn: () =>
      getAllUsersByQuery({
        search: searchValue || undefined,
        isActive: statusTab === "active",
        page,
        limit,
      }),
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearchValue(searchInput.trim());
    }, 350);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [statusTab, searchValue]);

  const users = data?.users || [];
  const total = data?.pagination?.total || 0;
  const totalPages = data?.pagination?.totalPages || 0;

  const refreshUsers = () => {
    queryClient.invalidateQueries({ queryKey: ["users"] });
  };

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      notify.success("User deleted successfully.");
      refreshUsers();
    },
    onError: () => {
      notify.error("Failed to delete user.");
    },
  });

  const statusMutation = useMutation({
    mutationFn: (payload: { id: string; isActive: boolean }) =>
      updateUserStatus(payload.id, payload.isActive),
    onSuccess: (_, variables) => {
      notify.success(variables.isActive ? "User activated successfully." : "User deactivated successfully.");
      refreshUsers();
    },
    onError: () => {
      notify.error("Failed to update user status.");
    },
  });

  const handleDeleteUser = async (id: string) => {
    const shouldDelete = await confirm({
      title: "Delete User",
      message: "Are you sure you want to permanently remove this user?",
      confirmText: "Delete",
      cancelText: "Cancel",
      intent: "danger",
    });

    if (shouldDelete) {
      deleteMutation.mutate(id);
    }
  };

  const closeStatusModal = () => {
    if (statusMutation.isPending) return;
    setPendingStatus(initialPendingStatus);
  };

  const openStatusModal = (user: UserRecord) => {
    setPendingStatus({
      open: true,
      user,
      nextIsActive: user.isActive === false,
      secondsLeft: 10,
    });
  };

  const applyStatusChange = () => {
    if (!pendingStatus.user) return;
    const payload = {
      id: pendingStatus.user._id,
      isActive: pendingStatus.nextIsActive,
    };
    setPendingStatus(initialPendingStatus);
    statusMutation.mutate(payload);
  };

  useEffect(() => {
    if (!pendingStatus.open || pendingStatus.secondsLeft <= 0) return;
    const timer = window.setTimeout(() => {
      setPendingStatus((previous) => ({
        ...previous,
        secondsLeft: Math.max(previous.secondsLeft - 1, 0),
      }));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [pendingStatus.open, pendingStatus.secondsLeft]);

  useEffect(() => {
    if (!pendingStatus.open) return;
    if (pendingStatus.secondsLeft !== 0) return;
    if (statusMutation.isPending) return;
    applyStatusChange();
  }, [pendingStatus, statusMutation.isPending]);

  const columns: ColumnsType<UserRecord> = [
    {
      title: "Sr. No",
      key: "sr_no",
      width: 90,
      render: (_, __, index) => ((page - 1) * limit) + index + 1,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (name: string) => <Typography.Text strong>{name || "-"}</Typography.Text>,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (email: string) => <Typography.Text>{email || "-"}</Typography.Text>,
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      render: (phone: string) => <Typography.Text>{phone || "-"}</Typography.Text>,
    },
    {
      title: "Created / Updated At",
      key: "createdUpdated",
      render: (_, user) => formatCreatedAndUpdatedAt(user.createdAt, user.updatedAt),
    },
    {
      title: "Actions",
      key: "actions",
      width: 180,
      render: (_, user) => {
        const active = user.isActive !== false;
        return (
          <Space size={10}>
            <Button
              type="text"
              icon={active ? <PoweroffOutlined className="text-orange-600" /> : <CheckCircleOutlined className="text-emerald-600" />}
              onClick={() => openStatusModal(user)}
              className={tableActionButtonClass}
            />

            <Button
              type="text"
              icon={<EditOutlined className="text-[#4f6841]" />}
              onClick={() => navigate(`/update-user/${user._id}`)}
              className={tableActionButtonClass}
            />

            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteUser(user._id)}
              className={`${tableActionButtonClass} hover:!border-[#f7caca] hover:!bg-red-50`}
            />
          </Space>
        );
      },
    },
  ];

  if (isLoading) return <TableLoader tip="Loading users..." />;

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
              placeholder="Search by name or email"
              className={`${tableInputClass} !w-full sm:!w-[300px]`}
            />
          </div>
          <div className={tableToolbarActionWrapClass}>
            <Button
              type="text"
              icon={<PlusOutlined />}
              onClick={() => navigate(ROUTES.ADMIN.ADD_USERS)}
              className={tablePrimaryButtonClass}
            >
              Add User
            </Button>
          </div>
        </div>
      </div>

      <Tabs
        activeKey={statusTab}
        onChange={(key) => setStatusTab(key as UserStatusTab)}
        items={[
          { key: "active", label: "Active Users" },
          { key: "inactive", label: "Inactive Users" },
        ]}
        className={tableTabClass}
      />

      <Table<UserRecord>
        className={tableSurfaceClass}
        rowKey="_id"
        columns={columns}
        dataSource={users}
        loading={isFetching && !isLoading}
        pagination={false}
        locale={{ emptyText: <TableEmpty description="No users found" /> }}
        scroll={{ x: "max-content" }}
      />

      <ServerPaginationControls
        page={page}
        limit={limit}
        total={total}
        totalPages={totalPages}
        currentCount={users.length}
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
        subjectName={pendingStatus.user?.name}
        entityLabel="User"
        onCancel={closeStatusModal}
        onConfirm={applyStatusChange}
        confirmLoading={statusMutation.isPending}
      />
    </Card>
  );
};

export default ManageUsersTable;
