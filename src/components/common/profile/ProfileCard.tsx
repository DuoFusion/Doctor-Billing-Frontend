import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../constants/Routes";
import { useConfirm } from "../confirm/ConfirmProvider";
import { Avatar, Button, Card, Divider, Space, Tag, Typography } from "antd";
import { CheckCircleFilled, LogoutOutlined, MailOutlined, PhoneOutlined, SafetyOutlined, UserOutlined, } from "@ant-design/icons";
import { getCurrentUserRecord, useCurrentUser, useMedicalStoreDetails, useSignoutUser } from "../../../hooks";
import { resolveUserMedicalStoreId } from "../../../utils/medicalStoreScope";

const buildProfileStrengthFields = (
  role: string,
  values: Array<string | number | undefined>
) =>
  (role === "admin" ? values.slice(0, 3) : values).filter((value) => String(value ?? "").trim().length > 0).length;

const ProfileCard = () => {
  const navigate = useNavigate();
  const confirm = useConfirm();

  const { data, isLoading } = useCurrentUser({
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });

  const signoutMutation = useSignoutUser();

  const user = getCurrentUserRecord(data);
  const name = user?.name || "";
  const email = user?.email || "";
  const role = user?.role || "";
  const phone = user?.phone || "";
  const medicalStoreId = resolveUserMedicalStoreId(user);

  const { data: medicalStore } = useMedicalStoreDetails(medicalStoreId, {
    enabled: role === "user" && Boolean(medicalStoreId),
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });

  const initial = name ? name.charAt(0).toUpperCase() : "?";
  const profileStrengthValues = [
    name,
    email,
    phone,
    medicalStore?.name,
    medicalStore?.gstNumber,
    medicalStore?.panNumber,
    medicalStore?.address,
    medicalStore?.city,
    medicalStore?.state,
    medicalStore?.pincode,
    medicalStore?.defaultCompanyAddress,
    medicalStore?.defaultCompanyCity,
    medicalStore?.defaultCompanyState,
    medicalStore?.defaultCompanyPincode,
    medicalStore?.signatureImg?.filename || medicalStore?.signatureImg?.path,
  ];
  const profileFieldCount = role === "admin" ? 3 : profileStrengthValues.length;
  const filledFields = buildProfileStrengthFields(role, profileStrengthValues);
  const profileStrength = profileFieldCount ? Math.round((filledFields / profileFieldCount) * 100) : 0;

  const profileSubTitle = role === "user" ? medicalStore?.name || "No Medical Store Linked" : "Administrator";

  const handleLogout = async () => {
    if (signoutMutation.isPending) return;
    const shouldLogout = await confirm({
      title: "Logout",
      message: "Are you sure you want to logout?",
      confirmText: "Logout",
      cancelText: "Cancel",
      intent: "danger",
    });
    if (!shouldLogout) return;
    signoutMutation.mutate(undefined, {
      onSuccess: () => {
        setTimeout(() => navigate(ROUTES.AUTH.SIGNIN), 700);
      },
    });
  };

  return (
    <div className="space-y-4">
      <Card className="!overflow-hidden !rounded-xl !border-[#d9e7c8] !bg-[#fefffc]" style={{ boxShadow: "none", textShadow: "none" }} styles={{ body: { padding: 0 } }}>
        <div className="h-24 bg-[linear-gradient(130deg,#6f9554_0%,#5a7e40_55%,#81ab63_100%)]" />
        <div className="-mt-11 px-5 pb-5">
          <div className="flex items-start justify-between gap-3">
            <Avatar size={86} src={null} icon={<UserOutlined />} className="!border-4 !border-white !bg-[#6f9554] !text-3xl !font-semibold !text-white" >{!isLoading ? initial : ""}</Avatar>
            <Tag className="!mt-2 !rounded-full !border-[#d9e7c8] !bg-[#ebffd8] !px-3 !py-[2px] !text-[11px] !font-semibold !uppercase !tracking-[0.08em] !text-[#3a592b]" style={{ boxShadow: "none", textShadow: "none" }}>
              <Space size={4}>
                <SafetyOutlined />
                {isLoading ? "loading" : role || "user"}
              </Space>
            </Tag>
          </div>

          <div className="mt-3">
            <Typography.Title level={4} className="!mb-0 !text-[#2d4620]"> {isLoading ? "Loading..." : name || "Unknown User"}</Typography.Title>
            <Typography.Text className="!text-[13px] !text-[#6d8060]"> {isLoading ? "-" : profileSubTitle}</Typography.Text>
          </div>

          <Divider className="!my-4 !border-[#e3edd9]" />

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <Space size={8} className="!text-[#607257]">
                <MailOutlined />
                <Typography.Text className="!text-[#607257]">Email</Typography.Text>
              </Space>
              <Typography.Text className="max-w-[60%] !truncate !text-right !text-[#3d564a]"> {isLoading ? "-" : email || "-"} </Typography.Text>
            </div>
            <div className="flex items-center justify-between gap-3">
              <Space size={8} className="!text-[#607257]">
                <PhoneOutlined />
                <Typography.Text className="!text-[#607257]">Phone</Typography.Text>
              </Space>
              <Typography.Text className="!text-[#3d564a]">
                {isLoading ? "-" : phone || "Not Added"}
              </Typography.Text>
            </div>
            <div className="flex items-center justify-between gap-3">
              <Space size={8} className="!text-[#607257]">
                <CheckCircleFilled />
                <Typography.Text className="!text-[#607257]">Profile Strength</Typography.Text>
              </Space>
              <Typography.Text className="!font-semibold !text-[#3a592b]">
                {profileStrength}%
              </Typography.Text>
            </div>
          </div>

          <Button
            block
            onClick={handleLogout}
            disabled={signoutMutation.isPending}
            className="!mt-5 !h-10 !rounded-lg !border-[#cfe4b7] !bg-[#f7fde8] !text-[#3a592b] hover:!border-[#b8d69a] hover:!bg-[#ebffd8]"
            icon={<LogoutOutlined />}
            style={{ boxShadow: "none" }}
          >
            {signoutMutation.isPending ? "Signing out..." : "Log Out"}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ProfileCard;
