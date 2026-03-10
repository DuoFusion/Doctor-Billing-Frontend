import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  DownOutlined,
  LogoutOutlined,
  MenuOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Dropdown, Space, Typography } from "antd";
import type { MenuProps } from "antd";
import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getCurrentUser, signout } from "../api/authApi";
import { getMedicalStoreById } from "../api/medicalStore";
import { getAuthToken } from "../api/client";
import { routes } from "../routers/RouteConfig";
import { ROUTES } from "../constants/Routes";
import { useConfirm } from "../components/common/confirm/ConfirmProvider";
import { getApiErrorMessage, notify } from "../utils/notify";

interface NavbarProps {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  collapsed: boolean;
}

const resolveObjectId = (value: unknown): string => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && "_id" in (value as Record<string, unknown>)) {
    return String((value as { _id?: string })._id || "");
  }
  return "";
};

const Navbar: React.FC<NavbarProps> = ({ setOpen, collapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const [profileOpen, setProfileOpen] = useState(false);

  const currentRoute = useMemo(
    () =>
      routes.find(
        (route) =>
          route.path === location.pathname ||
          location.pathname.startsWith(`${route.path}/`)
      ),
    [location.pathname]
  );
  const title = currentRoute?.title || "Page";
  const hasToken = Boolean(getAuthToken());

  const { data } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
    enabled: hasToken,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });

  const userRole = data?.user?.role || "user";
  const isUserProfilePage = userRole === "user" && location.pathname === ROUTES.USER.PROFILE;
  const medicalStoreId = resolveObjectId(data?.user?.medicalStoreId);

  const { data: profileMedicalStore } = useQuery({
    queryKey: ["navbarMedicalStore", medicalStoreId],
    queryFn: () => getMedicalStoreById(medicalStoreId),
    enabled: hasToken && isUserProfilePage && Boolean(medicalStoreId),
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });

  const pageTitle = isUserProfilePage
    ? (profileMedicalStore?.name || "Medical Store")
    : title;

  const { mutate: signoutUser, isPending } = useMutation({
    mutationFn: signout,
    onSuccess: () => {
      queryClient.cancelQueries({ queryKey: ["currentUser"] });
      queryClient.setQueryData(["currentUser"], null);
      queryClient.setQueryData(["bills"], { bills: [] });
      queryClient.setQueryData(["products"], { products: [] });
      queryClient.setQueryData(["companies"], { companies: [] });
      queryClient.setQueryData(["users"], { users: [] });
      notify.success("Signed out successfully");
      navigate(ROUTES.AUTH.SIGNIN);
    },
    onError: (err: unknown) => {
      notify.error(getApiErrorMessage(err, "Sign out failed"));
    },
  });

  const userName = data?.user?.name || "Profile";
  const initial = userName?.charAt(0)?.toUpperCase() || "U";
  const isAuthenticated = Boolean(data?.user?._id || data?.user?.email);

  const handleLogout = async () => {
    if (isPending) return;
    const shouldLogout = await confirm({
      title: "Logout",
      message: "Are you sure you want to logout?",
      confirmText: "Logout",
      cancelText: "Cancel",
      intent: "danger",
    });
    if (!shouldLogout) return;
    setProfileOpen(false);
    signoutUser();
  };

  const profileMenuItems: MenuProps["items"] = useMemo(
    () => [
      {
        key: "profile",
        icon: <UserOutlined />,
        label: "Profile",
      },
      {
        type: "divider",
      },
      {
        key: "logout",
        icon: <LogoutOutlined />,
        danger: true,
        disabled: isPending,
        label: isPending ? "Logging out..." : "Logout",
      },
    ],
    [isPending]
  );

  const handleProfileMenuClick: MenuProps["onClick"] = ({ key }) => {
    if (key === "profile") {
      setProfileOpen(false);
      navigate(ROUTES.USER.PROFILE);
      return;
    }

    if (key === "logout") {
      void handleLogout();
    }
  };

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-40 border-b border-[#d9e7c8] bg-[#fefffc]/95 backdrop-blur-xl transition-[left] duration-500 ease-in-out md:left-64 ${
        collapsed ? "lg:left-20" : "lg:left-64"
      }`}
    >
      <div className="flex h-[72px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            type="text"
            icon={<MenuOutlined className="text-base" />}
            className="!inline-flex !h-10 !w-10 !items-center !justify-center !rounded-xl !border !border-[#cfe4b7] !bg-[#fefffc] !text-[#4f6841] hover:!border-[#b8d69a] hover:!bg-[#ebffd8] hover:!text-[#3a592b] md:!hidden"
            onClick={() => setOpen(true)}
          />

          <div className="min-w-0">
            <Typography.Text className="!mb-0 !block !truncate !text-[11px] !font-semibold !uppercase !tracking-[0.08em] !text-[#6d8060]">
              Medico Billing
            </Typography.Text>
            <Typography.Title level={5} className="!m-0 !truncate !text-base !font-semibold !text-[#2d4620] sm:!text-lg">
              {pageTitle}
            </Typography.Title>
          </div>
        </div>

        {isAuthenticated && (
          <div className="flex items-center gap-2 sm:gap-3">
            <Dropdown
              menu={{ items: profileMenuItems, onClick: handleProfileMenuClick }}
              trigger={["click"]}
              open={profileOpen}
              onOpenChange={setProfileOpen}
              placement="bottomRight"
              arrow
              overlayClassName="[&_.ant-dropdown-menu]:!rounded-xl [&_.ant-dropdown-menu]:!border [&_.ant-dropdown-menu]:!border-[#d9e7c8] [&_.ant-dropdown-menu]:!bg-[#fbfff6] [&_.ant-dropdown-menu]:!p-1.5 [&_.ant-dropdown-menu-item]:!rounded-lg [&_.ant-dropdown-menu-item]:!py-2 [&_.ant-dropdown-menu-item]:!text-sm [&_.ant-dropdown-menu-item]:!text-[#3f5532] [&_.ant-dropdown-menu-item:hover]:!bg-[#ebffd8] [&_.ant-dropdown-menu-item-danger]:!text-[#dc2626] [&_.ant-dropdown-menu-item-danger:hover]:!bg-[#fef2f2]"
            >
              <Button
                type="text"
                className="!h-11 !rounded-2xl !border !border-[#cfe4b7] !bg-[#fefffc] !px-2.5 !text-[#2d4620] hover:!border-[#b8d69a] hover:!bg-[#ebffd8] sm:!px-3"
              >
                <Space size={10} className="!items-center">
                  <Avatar
                    size={34}
                    className="!bg-[#6f9554] !text-sm !font-semibold !text-white"
                  >
                    {initial}
                  </Avatar>
                  <div className="hidden min-w-0 text-left sm:block">
                    <Typography.Text className="!block !max-w-[130px] !truncate !text-sm !font-semibold !text-[#2d4620]">
                      {userName}
                    </Typography.Text>
                    <Typography.Text className="!block !text-[11px] !font-medium !uppercase !tracking-[0.08em] !text-[#6d8060]">
                      {userRole}
                    </Typography.Text>
                  </div>
                  <DownOutlined
                    className={`text-[11px] text-[#6d8060] transition-transform duration-200 ${
                      profileOpen ? "rotate-180" : ""
                    }`}
                  />
                </Space>
              </Button>
            </Dropdown>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
