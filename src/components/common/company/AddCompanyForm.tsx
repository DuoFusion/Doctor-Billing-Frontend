import { Button, Card, Col, Form, Image, Input, Row, Select, Typography, Upload } from "antd";
import { UploadOutlined, ShopOutlined } from "@ant-design/icons";
import { VALIDATION_MESSAGES, VALIDATION_REGEX } from "../../../constants/validation";
import { getCompanyLogoUrl } from "../../../utils/uploadsUrl";
import { type CompanyFormValues, useCompanyForm } from "../../../hooks";

const requiredLabel = (label: string, isRequired = true) => (
  <span className="font-medium text-[#607257]">{label} {isRequired && <span className="ml-1 text-red-500">*</span>}</span>
);

const inputClass = "!h-11 !rounded-lg";
const selectClass = "!w-full [&_.ant-select-selector]:!h-11 [&_.ant-select-selector]:!rounded-lg [&_.ant-select-selection-item]:!leading-[42px] [&_.ant-select-selection-placeholder]:!leading-[42px]";
const formClassName = "app-form [&_.ant-form-item]:!mb-6 [&_.ant-form-item-explain-error]:!mt-1.5 [&_.ant-form-item-label>label]:!text-[13px]";
const secondaryButtonClass =  "!h-11 !rounded-lg !border-[#cfe4b7] !bg-[#f7fde8] !px-6 !text-[#4f6841] hover:!border-[#b8d69a] hover:!bg-[#ebffd8] hover:!text-[#3a592b]";

const AddCompanyForm = () => {
  const [form] = Form.useForm<CompanyFormValues>();
  const {
    goBack,
    isEdit,
    isAdmin,
    isCurrentUserLoading,
    isUsersLoading,
    isCompanyLoading,
    companyData,
    userOptions,
    logo,
    setLogo,
    mutation,
    handleSubmit,
  } = useCompanyForm(form);

  const existingLogoUrl = getCompanyLogoUrl(companyData?.logoImage);

  if (isCompanyLoading || isCurrentUserLoading || (isAdmin && isUsersLoading)) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Typography.Text>Loading...</Typography.Text>
      </div>
    );
  }

  return (
    <div className="app-form-layout">
      <Card className="app-form-card rounded-2xl">
        <div className="mb-7 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <Typography.Title level={3} className="mb-1 bg-gradient-to-r from-[#5a7e40] to-[#81ab63] bg-clip-text text-transparent"> {isEdit ? "Update Company" : "Add Company"} </Typography.Title>
            <Typography.Text className="text-[#6d8060]"> Maintain complete company profile details for billing and management.</Typography.Text>
          </div>
          <Button onClick={goBack} className={secondaryButtonClass}>Back</Button>
        </div>

        <Form<CompanyFormValues> form={form} layout="vertical" requiredMark={false} onFinish={handleSubmit} className={formClassName}>
          <Row gutter={[18, 4]}>
            {isAdmin && (
              <Col xs={24} md={12}>
                <Form.Item label={requiredLabel("Assign User")} name="userId" rules={[{ required: true, message: "Please select user" }]}>
                  <Select showSearch optionFilterProp="label" placeholder="Select User" options={userOptions} className={selectClass} loading={isUsersLoading} />
                </Form.Item>
              </Col>
            )}

            <Col xs={24} md={12}>
              <Form.Item
                label={requiredLabel("Company Name")}
                name="name"
                rules={[
                  { required: true, message: "Please enter company name" },
                  { min: 3, message: "Company name must be at least 3 characters" },
                ]}
              >
                <Input placeholder="Company Name" className={inputClass} />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label={requiredLabel("GST Number")}
                name="gstNumber"
                rules={[
                  { required: true, message: "Please enter GST number" },
                  {
                    pattern: VALIDATION_REGEX.gst15,
                    message: VALIDATION_MESSAGES.gst15,
                  },
                ]}
              >
                <Input placeholder="GST Number" maxLength={15} className={inputClass} />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item label={requiredLabel("Phone Number")} name="phone" rules={[{ required: true, message: "Please enter phone number" }]}>
                <Input type="number" inputMode="numeric" placeholder="Phone Number" maxLength={10} className={inputClass} />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label={requiredLabel("Email", false)}
                name="email"
                rules={[
                  { type: "email", message: "Please enter valid email" },
                ]}
              >
                <Input placeholder="Email" className={inputClass} />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item label={requiredLabel("City", false)} name="city">
                <Input placeholder="City" className={inputClass} />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item label={requiredLabel("State", false)} name="state" >
                <Input placeholder="State" className={inputClass} />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item label={requiredLabel("Pincode", false)} name="pincode">
                <Input type="number" inputMode="numeric" placeholder="Pincode" maxLength={6} className={inputClass} />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label={requiredLabel("Address", false)}
                name="address"
                rules={[
                  { min: 5, message: "Address must be at least 5 characters" },
                ]}
              >
                <Input placeholder="Address" className={inputClass} />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item label="Company Logo">
                <div className="flex flex-wrap items-center gap-4">
                  <Upload
                    beforeUpload={(file) => {
                      setLogo(file);
                      return false;
                    }}
                    maxCount={1}
                    showUploadList={{ showRemoveIcon: true }}
                  >
                    <Button icon={<UploadOutlined />} className={secondaryButtonClass}>Select Logo</Button>
                  </Upload>

                  {logo ? (
                    <Typography.Text className="text-[#6d8060]">{logo.name}</Typography.Text>
                  ) : existingLogoUrl ? (
                    <Image src={existingLogoUrl} alt="Company logo" width={44} height={44} className="rounded-lg border border-[#d9e7c8] object-cover" />
                  ) : (
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-[#d9e7c8] bg-[#f4faec] text-[#6d8060]">
                      <ShopOutlined />
                    </span>
                  )}
                </div>
              </Form.Item>
            </Col>
          </Row>

          <div className="flex flex-wrap justify-end gap-3 pt-2">
            <Button onClick={goBack} className={secondaryButtonClass} > Cancel</Button>
            <Button type="primary" htmlType="submit" loading={mutation.isPending} className="!h-12 !rounded-lg !px-9 !font-semibold"> {isEdit ? "Update Company" : "Add Company"} </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default AddCompanyForm;
