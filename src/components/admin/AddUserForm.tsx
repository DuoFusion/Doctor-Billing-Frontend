import { useEffect, useMemo } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, Card, Col, Form, Input, Row, Select, Typography } from "antd";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { addUser, getUserById, updateUser } from "../../api";
import { getAllMedicalStoresByQuery, type MedicalStoreRecord } from "../../api/medicalStore";
import { ROUTES } from "../../constants/Routes";
import { VALIDATION_REGEX } from "../../constants/validation";
import { notify } from "../../utils/notify";

//=========== Form Values Interface ============
interface UserFormValues {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  medicalStoreId: string;
}

//=========== Required Label UI ============
const requiredLabel = (label: string) => (
  <span className="font-medium text-[#607257']">
    {label}
    <span className="ml-1 text-red-500">*</span>
  </span>
);

//=========== Input Styling ============
const inputClass = "!h-11 !rounded-lg";

//=========== Select Styling ============
const selectClass =
  "!w-full !h-11 [&_.ant-select-selector]:!h-11 [&_.ant-select-selector]:!rounded-lg [&_.ant-select-selector]:!flex [&_.ant-select-selector]:items-center [&_.ant-select-selection-wrap]:!py-1";

//=========== Convert Store Object to Store ID ============
const resolveStoreId = (entry: unknown) => {
  if (!entry) return "";
  if (typeof entry === "string") return entry;
  if (typeof entry === "object" && "_id" in (entry as Record<string, unknown>)) {
    return String((entry as { _id?: string })._id || "");
  }
  return "";
};

//=========== Add / Edit User Form Component ============
const AddUserForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const [form] = Form.useForm<UserFormValues>();

  //=========== Fetch User Data (Edit Mode) ============
  const { data, isLoading } = useQuery({
    queryKey: ["user", id],
    queryFn: () => getUserById(id as string),
    enabled: isEdit,
  });

  //=========== Fetch Medical Stores List ============
  const { data: storesData, isLoading: isStoresLoading } = useQuery({
    queryKey: ["medicalStores", "userForm"],
    queryFn: () => getAllMedicalStoresByQuery({ isActive: true }),
  });

  //=========== Set Form Values when Editing User ============
  useEffect(() => {
    if (!data || !isEdit) return;

    const user = (data as any).user || data;

    const selectedStoreId =
      resolveStoreId((user as any).medicalStoreId) ||
      (Array.isArray((user as any).medicalStoreIds)
        ? resolveStoreId((user as any).medicalStoreIds[0])
        : "");

    form.setFieldsValue({
      name: (user as any).name || "",
      email: (user as any).email || "",
      phone: (user as any).phone || "",
      medicalStoreId: selectedStoreId,
    });
  }, [data, form, isEdit]);

  //=========== Convert Stores to Select Options ============
  const storeOptions = useMemo(
    () =>
      ((storesData?.stores || []) as MedicalStoreRecord[]).map((store) => ({
        value: store._id,
        label: store.name || "Unnamed Medical Store",
      })),
    [storesData?.stores]
  );

  //=========== Add User Mutation ============
  const addMutation = useMutation({
    mutationFn: addUser,
    onSuccess: () => {
      notify.success("User created successfully.");
      setTimeout(() => navigate(ROUTES.ADMIN.MANAGE_USERS), 900);
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        notify.error(error.response?.data?.message || "Failed to create user");
      } else {
        notify.error("Something went wrong");
      }
    },
  });

  //=========== Update User Mutation ============
  const updateMutation = useMutation({
    mutationFn: (payload: any) => updateUser(id as string, payload),
    onSuccess: () => {
      notify.success("User updated successfully.");
      setTimeout(() => navigate(ROUTES.ADMIN.MANAGE_USERS), 900);
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        notify.error(error.response?.data?.message || "Failed to update user");
      } else {
        notify.error("Something went wrong");
      }
    },
  });

  //=========== Form Submit Handler ============
  const handleSubmit = (values: UserFormValues) => {
    const payload: any = {
      name: (values.name || "").trim(),
      email: (values.email || "").trim(),
      phone: (values.phone || "").trim(),
      medicalStoreId: String(values.medicalStoreId || "").trim(),
    };

    if (isEdit && id) {
      updateMutation.mutate(payload);
      return;
    }

    payload.password = (values.password || "").trim();
    addMutation.mutate(payload);
  };

  //=========== Decide Which Mutation to Use ============
  const mutation = isEdit ? updateMutation : addMutation;

  //=========== Loading UI for Edit Mode ============
  if (isEdit && isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Typography.Text>Loading user details...</Typography.Text>
      </div>
    );
  }

  //=========== Main UI ============
  return (
    <div className="app-form-layout">
      <Card className="app-form-card rounded-2xl">

        {/* =========== Header Section =========== */}
        <div className="mb-7 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <Typography.Title level={3} className="mb-1 bg-gradient-to-r from-[#5a7e40] to-[#81ab63] bg-clip-text text-transparent">
              {isEdit ? "Edit User Profile" : "Add New User"}
            </Typography.Title>

            <Typography.Text className="text-[#6d8060]">
              {isEdit
                ? "Update user details and assigned medical store."
                : "Create a user and assign one medical store."}
            </Typography.Text>
          </div>

          {/* =========== Back Button =========== */}
          <Button
            onClick={() => navigate(ROUTES.ADMIN.MANAGE_USERS)}
            className="!h-11 !rounded-lg !border-[#cfe4b7] !bg-[#f7fde8] !px-6 !text-[#4f6841]"
          >
            Back
          </Button>
        </div>

        {/* =========== Form Section =========== */}
        <Form<UserFormValues>
          form={form}
          layout="vertical"
          requiredMark={false}
          onFinish={handleSubmit}
          initialValues={{ medicalStoreId: "" }}
        >
          <Row gutter={[18, 4]}>

            {/* =========== Name Field =========== */}
            <Col xs={24} md={12}>
              <Form.Item
                label={requiredLabel("Name")}
                name="name"
                rules={[
                  { required: true, message: "Please enter name" },
                  { min: 3, message: "Name should be at least 3 characters" },
                ]}
              >
                <Input placeholder="Full Name" className={inputClass} />
              </Form.Item>
            </Col>

            {/* =========== Email Field =========== */}
            <Col xs={24} md={12}>
              <Form.Item
                label={requiredLabel("Email Address")}
                name="email"
                rules={[
                  { required: true, message: "Please enter email" },
                  { type: "email", message: "Please enter valid email" },
                ]}
              >
                <Input placeholder="Email Address" className={inputClass} />
              </Form.Item>
            </Col>

            {/* =========== Medical Store Select =========== */}
            <Col xs={24}>
              <Form.Item
                label={requiredLabel("Medical Store")}
                name="medicalStoreId"
                rules={[{ required: true, message: "Please select medical store" }]}
              >
                <Select
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  placeholder="Select medical store"
                  options={storeOptions}
                  loading={isStoresLoading}
                  className={selectClass}
                />
              </Form.Item>
            </Col>

            {/* =========== Phone Field =========== */}
            <Col xs={24} md={12}>
              <Form.Item
                label="Phone Number"
                name="phone"
                rules={[
                  {
                    validator: (_, value: string) => {
                      const next = (value || "").trim();
                      if (!next) return Promise.resolve();
                      if (VALIDATION_REGEX.phone10.test(next)) return Promise.resolve();
                      return Promise.reject(new Error("Phone number must be exactly 10 digits"));
                    },
                  },
                ]}
              >
                <Input placeholder="Phone Number (Optional)" className={inputClass} />
              </Form.Item>
            </Col>

            {/* =========== Password Field (Only Add Mode) =========== */}
            {!isEdit && (
              <Col xs={24} md={12}>
                <Form.Item
                  label={requiredLabel("Password")}
                  name="password"
                  rules={[
                    { required: true, message: "Please enter password" },
                    { min: 5, message: "Password must be at least 5 characters" },
                  ]}
                >
                  <Input.Password placeholder="Password" className={inputClass} />
                </Form.Item>
              </Col>
            )}
          </Row>

          {/* =========== Submit Button =========== */}
          <Button
            type="primary"
            htmlType="submit"
            loading={mutation.isPending}
            className="!h-12 !rounded-lg !px-9 !font-semibold"
          >
            {isEdit ? "Update User" : "Add User"}
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default AddUserForm;
