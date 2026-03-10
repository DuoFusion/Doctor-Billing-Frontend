import { Button, Card, Col, Form, Image, Input, Row, Select, Upload, Typography } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { type StoreFormValues, useMedicalStoreForm } from "../../../hooks";

const requiredLabel = (label: string) => (
  <span className="font-medium text-[#607257]">
    {label}
    <span className="ml-1 text-red-500">*</span>
  </span>
);

const inputClass = "!h-11 !rounded-lg";
const selectClass =
  "!w-full [&_.ant-select-selector]:!h-11 [&_.ant-select-selector]:!rounded-lg [&_.ant-select-selection-item]:!leading-[42px] [&_.ant-select-selection-placeholder]:!leading-[42px]";
const formClassName =
  "app-form [&_.ant-form-item]:!mb-6 [&_.ant-form-item-explain-error]:!mt-1.5 [&_.ant-form-item-label>label]:!text-[13px]";
const secondaryButtonClass =
  "!h-11 !rounded-lg !border-[#cfe4b7] !bg-[#f7fde8] !px-7 !text-[#4f6841] hover:!border-[#b8d69a] hover:!bg-[#ebffd8] hover:!text-[#3a592b]";

const AddMedicalStoreForm = () => {
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
  const [form] = Form.useForm<StoreFormValues>();
  const {
    goBack,
    isEdit,
    taxType,
    signature,
    setSignature,
    existingSignatureUrl,
    isLoadingStore,
    mutation,
    handleSubmit,
  } = useMedicalStoreForm(form);

  const handleUppercaseChange = (field: "gstNumber" | "panNumber") => (event: React.ChangeEvent<HTMLInputElement>) => {
    form.setFieldValue(field, String(event.target.value || "").toUpperCase());
  };

  if (isLoadingStore) {
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
            <Typography.Title level={3} className="mb-1 bg-gradient-to-r from-[#5a7e40] to-[#81ab63] bg-clip-text text-transparent">
              {isEdit ? "Update Medical Store" : "Add Medical Store"}
            </Typography.Title>
            <Typography.Text className="text-[#6d8060]">
              Maintain medical store profile information including signature for invoices.
            </Typography.Text>
          </div>
          <Button onClick={goBack} className={secondaryButtonClass}>
            Back
          </Button>
        </div>

        <Form<StoreFormValues>
          form={form}
          initialValues={{ taxType: "SGST_CGST", taxPercent: 0 }}
          layout="vertical"
          requiredMark={false}
          onFinish={handleSubmit}
          className={formClassName}
        >
          <Row gutter={[18, 4]}>
            <Col xs={24} md={12}>
              <Form.Item
                label={requiredLabel("Name")}
                name="name"
                rules={[{ required: true, message: "Please enter name" }, { min: 3, message: "Must be at least 3 characters" }]}
              >
                <Input placeholder="Name" className={inputClass} />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label={requiredLabel("Tax Type")}
                name="taxType"
                rules={[{ required: true, message: "Please select tax type" }]}
              >
                <Select
                  className={selectClass}
                  placeholder="Select tax type"
                  options={[
                    { value: "SGST_CGST", label: "SGST + CGST" },
                    { value: "IGST", label: "IGST" },
                  ]}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label={requiredLabel(taxType === "IGST" ? "IGST (%)" : "GST (%)")}
                name="taxPercent"
                rules={[
                  { required: true, message: "Please enter tax percent" },
                  {
                    validator: (_, value) => {
                      const num = Number(value);
                      if (!Number.isFinite(num) || num < 0 || num > 100) {
                        return Promise.reject(new Error("Tax percent must be between 0 and 100"));
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input
                  type="number"
                  min={0}
                  max={100}
                  placeholder={taxType === "IGST" ? "Enter IGST %" : "Enter GST %"}
                  className={inputClass}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label={requiredLabel("GST Number")}
                name="gstNumber"
                rules={[
                  { required: true, message: "Please enter GST Number" },
                  {
                    validator: (_, value) => {
                      const nextValue = String(value || "").trim().toUpperCase();
                      if (!nextValue || gstRegex.test(nextValue)) return Promise.resolve();
                      return Promise.reject(new Error("GST number must be in format: 22ABCDE1234F1Z5"));
                    },
                  },
                ]}
              >
                <Input placeholder="GST Number" maxLength={15} className={inputClass} onChange={handleUppercaseChange("gstNumber")} />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label={requiredLabel("PAN Number")}
                name="panNumber"
                rules={[
                  { required: true, message: "Please enter PAN Number" },
                  {
                    validator: (_, value) => {
                      const nextValue = String(value || "").trim().toUpperCase();
                      if (!nextValue || panRegex.test(nextValue)) return Promise.resolve();
                      return Promise.reject(new Error("PAN number must be in format: ABCDE1234F"));
                    },
                  },
                ]}
              >
                <Input placeholder="PAN Number" maxLength={10} className={inputClass} onChange={handleUppercaseChange("panNumber")} />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item label={requiredLabel("City")} name="city" rules={[{ required: true, message: "Please enter city" }]}>
                <Input placeholder="City" className={inputClass} />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item label={requiredLabel("State")} name="state" rules={[{ required: true, message: "Please enter state" }]}>
                <Input placeholder="State" className={inputClass} />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item label={requiredLabel("Pincode")} name="pincode" rules={[{ required: true, message: "Please enter pincode" }]}>
                <Input type="number" inputMode="numeric" placeholder="Pincode" maxLength={6} className={inputClass} />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item
                label={requiredLabel("Address")}
                name="address"
                rules={[{ required: true, message: "Please enter address" }, { min: 5, message: "Must be at least 5 characters" }]}
              >
                <Input placeholder="Address" className={inputClass} />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item label="Signature Image" name="signatureImg">
                <div className="flex flex-wrap items-center gap-4">
                  <Upload
                    beforeUpload={(file) => {
                      setSignature(file);
                      return false;
                    }}
                    maxCount={1}
                    showUploadList={{ showRemoveIcon: true }}
                  >
                    <Button icon={<UploadOutlined />} className={secondaryButtonClass}>
                      Select Image
                    </Button>
                  </Upload>

                  {signature ? (
                    <Typography.Text className="text-[#6d8060]">{signature.name}</Typography.Text>
                  ) : existingSignatureUrl ? (
                    <Image src={existingSignatureUrl} alt="signature" width={44} height={44} className="rounded-lg border border-[#d9e7c8] object-cover" />
                  ) : (
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-[#d9e7c8] bg-[#f4faec] text-[#6d8060]">
                      <UploadOutlined />
                    </span>
                  )}
                </div>

                {isEdit && existingSignatureUrl && (
                  <Form.Item name="removeSignature" valuePropName="checked" noStyle>
                    <Button type="link" onClick={() => form.setFieldsValue({ removeSignature: true })}>
                      Remove signature
                    </Button>
                  </Form.Item>
                )}
              </Form.Item>
            </Col>
          </Row>

          <div className="flex flex-wrap justify-end gap-3 pt-2">
            <Button onClick={goBack} className={secondaryButtonClass}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={mutation.isPending} className="!h-12 !rounded-lg !px-9 !font-semibold">
              {isEdit ? "Update Store" : "Add Store"}
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default AddMedicalStoreForm;
