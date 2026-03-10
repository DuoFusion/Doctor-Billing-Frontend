import { Button, Card, Col, Form, Input, Row, Select, Spin, Typography } from "antd";
import { type ProductFormValues, useProductForm } from "../../../hooks";
import CategorySelector from "../category/CategorySelector";

const formClassName =
  "app-form [&_.ant-form-item]:!mb-6 [&_.ant-form-item-explain-error]:!mt-1.5 [&_.ant-form-item-label>label]:!text-[13px]";
const requiredLabel = (label: string) => (
  <span className="font-medium text-[#607257]">
    {label}
    <span className="ml-1 text-red-500">*</span>
  </span>
);

const inputClass = "!h-11 !rounded-lg";
const selectClass = "!w-full [&_.ant-select-selector]:!h-11 [&_.ant-select-selector]:!rounded-lg [&_.ant-select-selection-item]:!leading-[42px] [&_.ant-select-selection-placeholder]:!leading-[42px]";
const secondaryButtonClass =
  "!h-11 !rounded-lg !border-[#cfe4b7] !bg-[#f7fde8] !px-7 !text-[#4f6841] hover:!border-[#b8d69a] hover:!bg-[#ebffd8] hover:!text-[#3a592b]";

const AddProductForm = () => {
  const [form] = Form.useForm<ProductFormValues>();
  const selectedCategory = Form.useWatch("category", form) || "";
  const {
    goBack,
    isEdit,
    isAdmin,
    selectedMedicalStoreId,
    isCurrentUserLoading,
    isUsersLoading,
    isProductLoading,
    isCompaniesLoading,
    isCompaniesFetching,
    filteredCompanyOptions,
    userOptions,
    mutation,
    handleSubmit,
  } = useProductForm(form);

  const isPageLoading = isProductLoading || isCurrentUserLoading || (isAdmin && isUsersLoading);
  const submitLabel = isEdit ? "Update Product" : "Add Product";

  if (isPageLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="app-form-layout">
      <Card className="app-form-card rounded-2xl">
        <div className="mb-7 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <Typography.Title level={3} className="mb-1 bg-gradient-to-r from-[#5a7e40] to-[#81ab63] bg-clip-text text-transparent">
              {isEdit ? "Update Product" : "Add Product"}
            </Typography.Title>
            <Typography.Text className="text-[#6d8060]">
              Add product with only the required fields.
            </Typography.Text>
          </div>
          <Button
            onClick={goBack}
            className={secondaryButtonClass}
          >
            Back
          </Button>
        </div>

        <Form<ProductFormValues>
          form={form}
          layout="vertical"
          requiredMark={false}
          onFinish={handleSubmit}
          className={formClassName}
        >
          <Row gutter={[18, 4]}>
            {isAdmin && (
              <Col xs={24} md={12}>
                <Form.Item
                  label={requiredLabel("Assign User")}
                  name="userId"
                  rules={[{ required: true, message: "Please select user" }]}
                >
                  <Select
                    showSearch
                    loading={isUsersLoading}
                    optionFilterProp="label"
                    placeholder="Select User"
                    options={userOptions}
                    className={selectClass}
                  />
                </Form.Item>
              </Col>
            )}

            <Col xs={24} md={12}>
              <Form.Item
                label={requiredLabel("Product Name")}
                name="name"
                rules={[
                  { required: true, message: "Please enter product name" },
                  { min: 2, message: "Product name must be at least 2 characters" },
                ]}
              >
                <Input placeholder="Product Name" className={inputClass} />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label={requiredLabel("Company")}
                name="company"
                rules={[{ required: true, message: "Please select company" }]}
              >
                <Select
                  options={filteredCompanyOptions}
                  placeholder="Select Company"
                  className={selectClass}
                  disabled={!selectedMedicalStoreId}
                  loading={Boolean(selectedMedicalStoreId) && (isCompaniesLoading || isCompaniesFetching)}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label={requiredLabel("Category")}
                name="category"
                rules={[{ required: true, message: "Please select category" }]}
              >
                <CategorySelector
                  value={selectedCategory}
                  onChange={(value) => form.setFieldValue("category", value)}
                  filterMedicalStoreId={selectedMedicalStoreId}
                  className={selectClass}
                />
              </Form.Item>
            </Col>


          </Row>

          <div className="flex flex-wrap justify-end gap-3 pt-2">
            <Button onClick={goBack} className={secondaryButtonClass}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={mutation.isPending} className="!h-12 !rounded-lg !px-9 !font-semibold">
              {submitLabel}
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default AddProductForm;
