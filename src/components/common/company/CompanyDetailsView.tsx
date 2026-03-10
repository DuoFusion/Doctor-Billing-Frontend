import { ArrowLeftOutlined, DeleteOutlined, EditOutlined, MailOutlined, PhoneOutlined, ShopOutlined, EnvironmentOutlined, IdcardOutlined,} from "@ant-design/icons";
import { Avatar, Button, Card, Col, Divider, Row, Space, Spin, Tag, Typography } from "antd";
import { ROUTES } from "../../../constants/Routes";
import ConfirmActiveStatusModal from "../confirm/ConfirmActiveStatusModal";
import { useCompanyDetails } from "../../../hooks";

const CompanyDetailsView = () => {
  const {
    navigate,
    company,
    isLoading,
    isError,
    isActive,
    logoUrl,
    addedByName,
    addedByEmail,
    pendingStatus,
    deleteMutation,
    statusMutation,
    handleDelete,
    openStatusModal,
    closeStatusModal,
    applyStatusChange,
    formatDate,
  } = useCompanyDetails();

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (isError || !company) {
    return (
      <Card className="rounded-2xl border border-[#d9e7c8]">
        <Typography.Text type="danger">Company details not found.</Typography.Text>
      </Card>
    );
  }

  return (
    <div className="px-4 py-8 md:px-6">
      <Card className="mx-auto w-full max-w-6xl overflow-hidden rounded-2xl border border-[#d9e7c8] bg-[#fefffc] shadow-sm">
        <div className="rounded-xl bg-gradient-to-r from-[#5a7e40] via-[#6f9554] to-[#81ab63] p-5 text-white">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div className="flex items-center gap-4">
              {logoUrl ? (
                <Avatar size={64} src={logoUrl} />
              ) : (
                <Avatar size={64} icon={<ShopOutlined />} className="bg-white/20 text-white" />
              )}
              <div>
                <Typography.Title level={3} className="!mb-1 !text-white">
                  {company.name}
                </Typography.Title>
                <Space size={8}>
                  <Tag color={isActive ? "green" : "red"}>{isActive ? "Active" : "Inactive"}</Tag>
                  <Typography.Text className="!text-white/90">
                    Created: {formatDate(company.createdAt)}
                  </Typography.Text>
                </Space>
              </div>
            </div>

            <Space wrap>
              <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} className="!h-11 !rounded-lg !border-white/50 !bg-white/10 !px-5 !text-white hover:!border-white hover:!bg-white/20 hover:!text-white">
                Back
              </Button>
              <Button onClick={openStatusModal} className="!h-11 !rounded-lg !border-white/50 !bg-white/10 !px-5 !text-white hover:!border-white hover:!bg-white/20 hover:!text-white">
                {isActive ? "Set Inactive" : "Set Active"}
              </Button>
              <Button icon={<EditOutlined />} onClick={() => navigate(ROUTES.COMPANY.UPDATE_COMPANY.replace(":id", company._id))} className="!h-11 !rounded-lg !border-white/50 !bg-white/10 !px-5 !text-white hover:!border-white hover:!bg-white/20 hover:!text-white">
                Edit
              </Button>
              <Button danger icon={<DeleteOutlined />} loading={deleteMutation.isPending} onClick={handleDelete} className="!h-11 !rounded-lg !px-5">
                Delete
              </Button>
            </Space>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card className="rounded-xl border border-[#d9e7c8] bg-[#fefffc] shadow-none">
            <Typography.Title level={5} className="!mb-4 !text-[#2d4620]">
              Company Information
            </Typography.Title>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <IdcardOutlined className="mt-0.5 text-[#6d8060]" />
                <div>
                  <p className="font-medium text-[#4f6841]">GST Number</p>
                  <p className="text-[#607257]">{company.gstNumber || "-"}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <PhoneOutlined className="mt-0.5 text-[#6d8060]" />
                <div>
                  <p className="font-medium text-[#4f6841]">Phone</p>
                  <p className="text-[#607257]">{company.phone || "-"}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MailOutlined className="mt-0.5 text-[#6d8060]" />
                <div>
                  <p className="font-medium text-[#4f6841]">Email</p>
                  <p className="text-[#607257]">{company.email || "-"}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="rounded-xl border border-[#d9e7c8] bg-[#fefffc] shadow-none">
            <Typography.Title level={5} className="!mb-4 !text-[#2d4620]">
              Address Information
            </Typography.Title>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <EnvironmentOutlined className="mt-0.5 text-[#6d8060]" />
                <div>
                  <p className="font-medium text-[#4f6841]">Address</p>
                  <p className="text-[#607257]">{company.address || "-"}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <p className="font-medium text-[#4f6841]">City</p>
                  <p className="text-[#607257]">{company.city || "-"}</p>
                </div>
                <div>
                  <p className="font-medium text-[#4f6841]">State</p>
                  <p className="text-[#607257]">{company.state || "-"}</p>
                </div>
                <div>
                  <p className="font-medium text-[#4f6841]">Pincode</p>
                  <p className="text-[#607257]">{company.pincode || "-"}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <Card className="mt-4 rounded-xl border border-[#d9e7c8] bg-[#fefffc] shadow-none">
          <Typography.Title level={5} className="!mb-3 !text-[#2d4620]">
            Audit Details
          </Typography.Title>
          <Divider className="!my-3" />
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <p className="text-xs font-medium uppercase tracking-wide text-[#6d8060]">Added By</p>
              <p className="mt-1 text-base font-semibold text-[#2d4620]">{addedByName || "-"}</p>
            </Col>
            <Col xs={24} md={8}>
              <p className="text-xs font-medium uppercase tracking-wide text-[#6d8060]">Added By Email</p>
              <p className="mt-1 text-base font-semibold text-[#2d4620]">{addedByEmail || "-"}</p>
            </Col>
            <Col xs={24} md={8}>
              <p className="text-xs font-medium uppercase tracking-wide text-[#6d8060]">Created At</p>
              <p className="mt-1 text-base font-semibold text-[#2d4620]">{formatDate(company.createdAt)}</p>
            </Col>
            <Col xs={24} md={8}>
              <p className="text-xs font-medium uppercase tracking-wide text-[#6d8060]">Updated At</p>
              <p className="mt-1 text-base font-semibold text-[#2d4620]">{formatDate(company.updatedAt)}</p>
            </Col>
          </Row>
        </Card>
      </Card>

      <ConfirmActiveStatusModal
        open={pendingStatus.open}
        nextIsActive={pendingStatus.nextIsActive}
        countdown={pendingStatus.secondsLeft}
        subjectName={company.name}
        entityLabel="Company"
        onCancel={closeStatusModal}
        onConfirm={applyStatusChange}
        confirmLoading={statusMutation.isPending}
      />
    </div>
  );
};

export default CompanyDetailsView;
