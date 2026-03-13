import { Button, Col, Form, Input, Row, Select, Tabs, Typography, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import type { TabsProps, UploadFile } from "antd";
import type { MedicalStoreRecord } from "../../../types";

type Props = {
  selectedMedicalStoreId: string;
  isMedicalStoreLoading: boolean;
  medicalStore?: MedicalStoreRecord;
  taxType: "SGST_CGST" | "IGST";
  existingSignatureUrl?: string;
  signatureFileList: UploadFile[];
  onUppercaseChange: (field: "gstNumber" | "panNumber") => (event: {
    target?: { value?: string };
  }) => void;
  onSignatureChange: (info: { fileList: UploadFile[] }) => void;
  onSignatureUpload: (file: File) => false | typeof Upload.LIST_IGNORE;
  onRemoveSignature: () => void;
};

const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

const ProfileDetailsUserFormFields = ({ selectedMedicalStoreId, isMedicalStoreLoading, medicalStore, taxType, existingSignatureUrl, signatureFileList, onUppercaseChange, onSignatureChange, onSignatureUpload, onRemoveSignature,}: Props) => {
  const personalInfoTab = (
    <div className="px-4 pb-5 pt-1 sm:px-6 sm:pb-6">
      <Row gutter={[16, 0]}>
        <Col xs={24} md={12}>
          <Form.Item label="Name" name="name"
            rules={[
              { required: true, whitespace: true, message: "Please enter name" },
              {
                validator: (_, value) => {
                  const nextValue = String(value || "").trim();
                  if (!nextValue || nextValue.length >= 3) return Promise.resolve();
                  return Promise.reject(new Error("Name must be at least 3 characters"));
                },
              },
            ]}
          >
            <Input placeholder="Full name" />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item label="Email Address" name="email"
            rules={[
              { required: true, message: "Please enter email address" },
              { type: "email", message: "Enter a valid email address" },
            ]}
          >
            <Input placeholder="name@example.com" />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item label="Phone Number" name="phone"
            rules={[{ required: true, message: "Please enter phone number" }]}
          >
            <Input type="number" inputMode="numeric" placeholder="Enter 10 digit phone number" />
          </Form.Item>
        </Col>
      </Row>
    </div>
  );

  const medicalStoreInfoTab = (
    <div className="px-4 pb-5 pt-1 sm:px-6 sm:pb-6">
      {!selectedMedicalStoreId && (
        <Typography.Text className="!mb-4 !block !text-[13px] !text-[#9a4e34]"> No medical store is linked to this user. </Typography.Text>
      )}

      {isMedicalStoreLoading && (
        <Typography.Text className="!mb-4 !block !text-[13px] !text-[#6d8060]"> Loading medical store information...</Typography.Text>
      )}

      <Row gutter={[16, 0]}>
        <Col xs={24} md={12}>
          <Form.Item label="Name" name="storeName"
            rules={
              selectedMedicalStoreId
                ? [
                    {
                      validator: (_, value) => {
                        const nextValue = String(value || "").trim();
                        if (!nextValue || nextValue.length >= 2) return Promise.resolve();
                        return Promise.reject(
                          new Error("Medical store name must be at least 2 characters")
                        );
                      },
                    },
                  ]
                : []
            }
          >
            <Input placeholder="Medical store name" disabled={!selectedMedicalStoreId} />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item label="Tax Type" name="taxType"
            rules={selectedMedicalStoreId ? [{ required: true, message: "Please select tax type" }] : []}
          >
            <Select placeholder="Select tax type" disabled={!selectedMedicalStoreId} showSearch optionFilterProp="label"
              options={[
                { value: "SGST_CGST", label: "SGST + CGST" },
                { value: "IGST", label: "IGST" },
              ]}
            />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item label={taxType === "IGST" ? "IGST (%)" : "GST (%)"} name="taxPercent"
            rules={
              selectedMedicalStoreId
                ? [
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
                  ]
                : []
            }
          >
            <Input type="number" min={0} max={100} placeholder={taxType === "IGST" ? "Enter IGST %" : "Enter GST %"} disabled={!selectedMedicalStoreId}/>
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item label="GST Number" name="gstNumber"
            rules={
              selectedMedicalStoreId
                ? [
                    {
                      validator: (_, value) => {
                        const nextValue = String(value || "").trim().toUpperCase();
                        if (!nextValue || gstRegex.test(nextValue)) return Promise.resolve();
                        return Promise.reject(
                          new Error("GST number must be in format: 22ABCDE1234F1Z5")
                        );
                      },
                    },
                  ]
                : []
            }
          >
            <Input  placeholder="GST Number"  disabled={!selectedMedicalStoreId}  maxLength={15}  onChange={onUppercaseChange("gstNumber")} />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item label="PAN Number" name="panNumber"
            rules={
              selectedMedicalStoreId
                ? [
                    {
                      validator: (_, value) => {
                        const nextValue = String(value || "").trim().toUpperCase();
                        if (!nextValue || panRegex.test(nextValue)) return Promise.resolve();
                        return Promise.reject(
                          new Error("PAN number must be in format: ABCDE1234F")
                        );
                      },
                    },
                  ]
                : []
            }
          >
            <Input placeholder="PAN Number" disabled={!selectedMedicalStoreId} maxLength={10} onChange={onUppercaseChange("panNumber")} />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item label="City" name="city">
            <Input placeholder="City" disabled={!selectedMedicalStoreId} />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item label="State" name="state">
            <Input placeholder="State" disabled={!selectedMedicalStoreId} />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item label="Pincode" name="pincode">
            <Input placeholder="Pincode" disabled={!selectedMedicalStoreId} />
          </Form.Item>
        </Col>

        <Col xs={24}>
          <Form.Item label="Address" name="address">
            <Input.TextArea placeholder="Address" rows={3} disabled={!selectedMedicalStoreId} />
          </Form.Item>
        </Col>
      </Row>
    </div>
  );

  const additionalCompanyInfoTab = (
    <div className="px-4 pb-5 pt-1 sm:px-6 sm:pb-6">
      {!selectedMedicalStoreId && (
        <Typography.Text className="!mb-4 !block !text-[13px] !text-[#9a4e34]"> No medical store is linked to this user .</Typography.Text>
      )}

      {isMedicalStoreLoading && (
        <Typography.Text className="!mb-4 !block !text-[13px] !text-[#6d8060]"> Loading default company information...</Typography.Text>
      )}

      <Row gutter={[16, 0]}>
        <Col xs={24} md={12}>
          <Form.Item label="Default Company City" name="defaultCompanyCity">
            <Input placeholder="Default Company City" disabled={!selectedMedicalStoreId} />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item label="Default Company State" name="defaultCompanyState">
            <Input placeholder="Default Company State" disabled={!selectedMedicalStoreId} />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item label="Default Company Pincode" name="defaultCompanyPincode">
            <Input type="number" inputMode="numeric" placeholder="Default Company Pincode" disabled={!selectedMedicalStoreId}/>
          </Form.Item>
        </Col>

        <Col xs={24}>
          <Form.Item label="Default Company Address" name="defaultCompanyAddress" rules={[{ min: 5, message: "Default company address must be at least 5 characters" }]}>
            <Input.TextArea placeholder="Default Company Address" rows={3} disabled={!selectedMedicalStoreId} />
          </Form.Item>
        </Col>
      </Row>
    </div>
  );

  const documentsTab = (
    <div className="px-4 pb-5 pt-1 sm:px-6 sm:pb-6">
      <Form.Item label="Signature Image" name="signatureImg">
        <Upload className="profile-doc-upload" listType="picture" fileList={signatureFileList} onChange={onSignatureChange} beforeUpload={onSignatureUpload} maxCount={1} accept="image/jpeg, image/png">
          <Button icon={<UploadOutlined />}>Upload Signature</Button>
        </Upload>

        <Typography.Text className="!mt-2 block !text-[12px] !text-[#6d8060]"> Max file size: 5MB. Allowed formats: JPG, JPEG, PNG </Typography.Text>

        {signatureFileList.length > 0 && (
          <Button type="link" className="!mt-1 !px-0" onClick={onRemoveSignature}>Remove Signature</Button>
        )}
      </Form.Item>

      {existingSignatureUrl && (
        <div className="profile-signature-meta mt-4 rounded-lg bg-[#f5f5f5] p-3">
          <Typography.Text className="!font-semibold !text-[#2d4620]">  Current Signature File: </Typography.Text>
          <div className="mt-2 flex flex-col gap-1">
            <Typography.Text className="!text-[13px]">
              <strong>Filename:</strong>{" "}
              {medicalStore?.signatureImg?.originalName || medicalStore?.signatureImg?.filename || "-"}
            </Typography.Text>
            <Typography.Text className="!text-[13px]">
              <strong>Size:</strong>{" "}
              {medicalStore?.signatureImg?.size ? `${(medicalStore.signatureImg.size / 1024).toFixed(2)} KB` : "-"}
            </Typography.Text>
          </div>
        </div>
      )}
    </div>
  );

  const tabItems: TabsProps["items"] = [
    {
      key: "personal",
      label: <span className="profile-tab-label">Personal Information</span>,
      children: personalInfoTab,
    },
    {
      key: "medical-store",
      label: <span className="profile-tab-label">Medical Store Information</span>,
      children: medicalStoreInfoTab,
    },
    {
      key: "additional-company",
      label: <span className="profile-tab-label">Additional Company Information</span>,
      children: additionalCompanyInfoTab,
    },
    {
      key: "documents",
      label: <span className="profile-tab-label">Documents</span>,
      children: documentsTab,
    },
  ];

  return (
    <Tabs defaultActiveKey="personal" className="profile-settings-tabs" items={tabItems} animated={{ inkBar: true, tabPane: false }} />
  );
};

export default ProfileDetailsUserFormFields;
