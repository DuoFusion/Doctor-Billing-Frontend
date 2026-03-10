import {
  CloseOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ShopOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Avatar, Button, Grid, Menu, Typography } from "antd";
import type { MenuProps } from "antd";
import {
  LayoutDashboard,
  Package,
  Building2,
  LogIn,
  UserPlus,
  FileText,
  Tags,
} from "lucide-react";
import { useMemo, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getCurrentUser } from "../api/authApi";
import { getAuthToken } from "../api/client";
import { ROUTES } from "../constants/Routes";

interface SideBarProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

type SidebarMenuItem = {
  id: number;
  text: string;
  path: string;
  icon: ReactNode;
};

const SideBar: React.FC<SideBarProps> = ({
  open,
  setOpen,
  collapsed,
  setCollapsed,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const screens = Grid.useBreakpoint();
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

  const role = data?.user?.role || null;

  const adminMenu: SidebarMenuItem[] = [
    { id: 1, text: "Dashboard", path: ROUTES.ADMIN.DASHBOARD, icon: <LayoutDashboard size={18} /> },
    { id: 2, text: "Medical Stores", path: ROUTES.MEDICAL_STORE.GET_MEDICAL_STORES, icon: <ShopOutlined size={18} /> },
    { id: 3, text: "Users", path: ROUTES.ADMIN.MANAGE_USERS, icon: <UserPlus size={18} /> },
    { id: 4, text: "Products", path: ROUTES.PRODUCTS.GET_PRODUCTS, icon: <Package size={18} /> },
    { id: 5, text: "Category", path: ROUTES.CATEGORY.GET_CATEGORIES, icon: <Tags size={18} /> },
    { id: 6, text: "Company", path: ROUTES.COMPANY.GET_COMPANY, icon: <Building2 size={18} /> },
    { id: 7, text: "Bills", path: ROUTES.BILL.GET_BILLS, icon: <FileText size={18} /> },
  ];

  const userMenu: SidebarMenuItem[] = [
    { id: 8, text: "Dashboard", path: ROUTES.USER.DASHBOARD, icon: <LayoutDashboard size={18} /> },
    { id: 9, text: "Products", path: ROUTES.PRODUCTS.GET_PRODUCTS, icon: <Package size={18} /> },
    { id: 10, text: "Category", path: ROUTES.CATEGORY.GET_CATEGORIES, icon: <Tags size={18} /> },
    { id: 11, text: "Company", path: ROUTES.COMPANY.GET_COMPANY, icon: <Building2 size={18} /> },
    { id: 12, text: "Bills", path: ROUTES.BILL.GET_BILLS, icon: <FileText size={18} /> },
  ];

  const guestMenu: SidebarMenuItem[] = [
    { id: 13, text: "Sign In", path: ROUTES.AUTH.SIGNIN, icon: <LogIn size={18} /> },
  ];

  const menu = role === "admin" ? adminMenu : role === "user" ? userMenu : guestMenu;
  const userName = data?.user?.name || "Profile";
  const profileInitial = userName.charAt(0).toUpperCase();

  const selectedKey = useMemo(
    () =>
      menu.find(
        (item) =>
          location.pathname === item.path ||
          location.pathname.startsWith(`${item.path}/`)
      )?.path,
    [location.pathname, menu]
  );

  const menuItems: MenuProps["items"] = useMemo(
    () =>
      menu.map((item) => ({
        key: item.path,
        icon: <span className="inline-flex items-center justify-center">{item.icon}</span>,
        label: item.text,
      })),
    [menu]
  );

  const isProfileActive = location.pathname === ROUTES.USER.PROFILE;

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-[#0f172a]/40 backdrop-blur-[1px] md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[86vw] max-w-[280px] flex-col overflow-x-hidden border-r border-[#d9e7c8] bg-[#fefffc] text-[#2d4620] shadow-lg shadow-[#6d8a57]/10 transition-[width,transform] duration-500 ease-in-out md:w-64 md:max-w-none md:shadow-none ${
          collapsed ? "lg:w-20" : "lg:w-64"
        } ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <div className={`border-b border-[#d9e7c8] px-4 py-4 ${collapsed ? "lg:px-2 lg:py-3" : ""}`}>
          <div className={`flex items-center justify-between gap-2 ${collapsed ? "lg:flex-col lg:justify-center" : ""}`}>
            <div className={`flex items-center gap-3 ${collapsed ? "lg:justify-center" : ""}`}>
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#6f9554] text-base font-semibold text-white">
                M
              </div>
              <div className={`min-w-0 ${collapsed ? "lg:hidden" : ""}`}>
                <Typography.Title level={5} className="!m-0 !text-base !font-semibold !text-[#2d4620]">
                  Medico
                </Typography.Title>
                <Typography.Text className="!text-[11px] !font-medium !uppercase !tracking-[0.08em] !text-[#6d8060]">
                  Billing Panel
                </Typography.Text>
              </div>
            </div>

            <div className={`flex items-center gap-2 ${collapsed ? "lg:w-full lg:justify-center" : ""}`}>
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed((prev) => !prev)}
                className="!hidden lg:!inline-flex !h-8 !w-8 !items-center !justify-center !rounded-lg !border !border-[#cfe4b7] !bg-[#fefffc] !text-[#4f6841] hover:!border-[#b8d69a] hover:!bg-[#ebffd8] hover:!text-[#3a592b]"
                title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              />

              <Button
                type="text"
                icon={<CloseOutlined />}
                onClick={() => setOpen(false)}
                className="!inline-flex md:!hidden !h-8 !w-8 !items-center !justify-center !rounded-lg !border !border-[#cfe4b7] !bg-[#fefffc] !text-[#4f6841] hover:!border-[#b8d69a] hover:!bg-[#ebffd8] hover:!text-[#3a592b]"
                aria-label="Close sidebar"
              />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-x-hidden overflow-y-auto px-3 py-4">
          <Menu
            mode="inline"
            inlineCollapsed={Boolean(screens.lg && collapsed)}
            selectedKeys={selectedKey ? [selectedKey] : []}
            items={menuItems}
            onClick={({ key }) => {
              navigate(String(key));
              setOpen(false);
            }}
            className={`!border-none !bg-transparent [&_.ant-menu-item]:!mx-0 [&_.ant-menu-item]:!my-1 [&_.ant-menu-item]:!h-11 [&_.ant-menu-item]:!rounded-xl [&_.ant-menu-item]:!text-sm [&_.ant-menu-item]:!font-medium [&_.ant-menu-item]:!text-[#607257] [&_.ant-menu-item-selected]:!bg-[#ebffd8] [&_.ant-menu-item-selected]:!text-[#3a592b] [&_.ant-menu-item:hover]:!bg-[#edf9e0] [&_.ant-menu-item:hover]:!text-[#3a592b] [&_.ant-menu-title-content]:!truncate ${
              collapsed
                ? "[&_.ant-menu-item]:!px-2"
                : "[&_.ant-menu-item]:!px-3"
            }`}
          />
        </div>

        {role && (
          <div className="border-t border-[#d9e7c8] p-3">
            <Button
              type="text"
              onClick={() => {
                navigate(ROUTES.USER.PROFILE);
                setOpen(false);
              }}
              className={`!h-auto !w-full !rounded-xl !border !px-2.5 !py-2.5 ${
                isProfileActive
                  ? "!border-[#c5dda8] !bg-[#ebffd8]"
                  : "!border-transparent hover:!bg-[#edf9e0]"
              }`}
            >
              <div
                className={`flex w-full items-center ${
                  collapsed ? "lg:justify-center" : "gap-3"
                }`}
              >
                <Avatar
                  size={32}
                  className="!bg-[#6f9554] !text-sm !font-semibold !text-white"
                >
                  {profileInitial}
                </Avatar>
                <div className={`min-w-0 text-left ${collapsed ? "lg:hidden" : ""}`}>
                  <Typography.Text className="!block !truncate !text-sm !font-semibold !text-[#2d4620]">
                    {userName}
                  </Typography.Text>
                  <Typography.Text className="!block !text-[11px] !font-medium !uppercase !tracking-[0.08em] !text-[#6d8060]">
                    View Profile
                  </Typography.Text>
                </div>
              </div>
            </Button>
          </div>
        )}
      </aside>
    </>
  );
};

export default SideBar;
