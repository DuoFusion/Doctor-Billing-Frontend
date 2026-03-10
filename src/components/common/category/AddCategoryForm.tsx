import { Button, Card, Form, Input, Select, Typography } from "antd";
import { type CategoryFormValues, type CategorySuggestionRow, useCategoryForm } from "../../../hooks";

interface Props {
  onClose?: () => void;
  initialName?: string;
  categoryId?: string;
}

const AddCategoryForm = ({ onClose, initialName, categoryId }: Props) => {
  const [form] = Form.useForm<CategoryFormValues>();
  const {
    isEdit,
    isAdmin,
    isUsersLoading,
    isSubmitting,
    userOptions,
    showSuggestionPanel,
    suggestionRows,
    normalizedCategoryNames,
    initialNormalizedName,
    handleSubmit,
    handleCancel,
  } = useCategoryForm(form, { initialName, categoryId, onClose });

  return (
    <Card className="app-form-card !rounded-xl !border-[#d9e7c8] !bg-[#fefffc]" style={{ boxShadow: "none" }}>
      <Typography.Title level={5} className="!mb-4 !text-[#2d4620]">
        {isEdit ? "Update Category" : "Add Category"}
      </Typography.Title>

      <Form<CategoryFormValues> form={form} onFinish={handleSubmit} layout="vertical" requiredMark={false} className="app-form">
        {isAdmin && !isEdit && (
          <Form.Item label="Assign User" name="userId" rules={[{ required: true, message: "Please select user" }]}>
            <Select
              showSearch
              optionFilterProp="label"
              placeholder="Select User"
              options={userOptions}
              className="!h-11 [&_.ant-select-selector]:!h-11 [&_.ant-select-selector]:!rounded-lg [&_.ant-select-selection-item]:!leading-[42px] [&_.ant-select-selection-placeholder]:!leading-[42px]"
              loading={isUsersLoading}
            />
          </Form.Item>
        )}

        <Form.Item
          label="Category Name"
          name="name"
          rules={[
            { required: true, message: "Please enter category name" },
            { min: 2, message: "Category name must be at least 2 characters" },
            { max: 100, message: "Category name can be maximum 100 characters" },
            {
              validator: (_, value: string) => {
                const normalizedName = (value || "").trim().toLowerCase();
                if (!normalizedName) return Promise.resolve();

                const duplicateExists =
                  normalizedCategoryNames.has(normalizedName) &&
                  (!isEdit || normalizedName !== initialNormalizedName);

                return duplicateExists ? Promise.reject(new Error("Category already exists.")) : Promise.resolve();
              },
            },
          ]}
        >
          <div>
            <Input placeholder="Enter category" maxLength={100} className="!h-11" />

            {showSuggestionPanel && (
              <div className="mt-2 w-full overflow-hidden rounded-lg border border-[#d9e7c8] bg-[#fefffc] shadow-sm sm:w-1/2">
                <div className="border-b border-[#d9e7c8] bg-[#f4faec] px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[#6d8060]">
                  Category
                </div>

                <div className="max-h-40 overflow-y-auto">
                  {suggestionRows.length > 0 ? (
                    suggestionRows.map((row: CategorySuggestionRow) => (
                      <button
                        key={row.key}
                        type="button"
                        className={`w-full border-b border-[#edf4e3] px-3 py-2 text-left text-sm transition-colors hover:bg-[#f7fde8] last:border-b-0 ${
                          row.isDuplicate ? "bg-red-50 font-semibold text-red-700" : "font-medium text-[#4f6841]"
                        }`}
                        onClick={() => form.setFieldsValue({ name: row.categoryName })}
                      >
                        <span className="truncate">{row.categoryName}</span>
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-sm text-[#6d8060]">No matching categories</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </Form.Item>

        <div className="flex justify-end gap-2">
          <Button onClick={handleCancel} style={{ boxShadow: "none" }}>
            Cancel
          </Button>

          <Button type="primary" htmlType="submit" loading={isSubmitting} style={{ boxShadow: "none" }}>
            {isEdit ? "Update" : "Add Category"}
          </Button>
        </div>
      </Form>
    </Card>
  );
};

export default AddCategoryForm;
