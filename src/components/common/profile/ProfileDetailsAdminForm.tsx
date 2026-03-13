import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUserProfile } from "../../../api";
import { Button, Card, Col, Form, Input, Row, Tabs, Typography } from "antd";
import type { TabsProps } from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../constants/Routes";
import { getCurrentUserRecord, syncCurrentUserCache, useCurrentUser } from "../../../hooks";
import type { CurrentUserProfile, ProfileFormValues, ProfileUpdateResponse } from "../../../types";
import { notify } from "../../../utils/notify";

const resolveTextValue = (nextValue: string | undefined, existingValue: string | undefined) =>(nextValue ?? existingValue ?? "").trim();

const syncProfileForm = ( form: ReturnType<typeof Form.useForm<ProfileFormValues>>[0],user?: CurrentUserProfile ) => {
  form.setFieldsValue({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });
};
// ================== Personal Information tab ==================
const personalInfoTab: TabsProps["items"] = [
  {
    key: "personal",
    label: <span className="profile-tab-label">Personal Information</span>,
    children: (
      <div className="px-4 pb-5 pt-1 sm:px-6 sm:pb-6">
        <Row gutter={[16, 0]}>
          <Col xs={24} md={12}>
            <Form.Item label="Name" name="name"
              rules={[
                { required: true, message: "Please enter name" },
                { min: 3, message: "Name must be at least 3 characters" },
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
    ),
  },
];

const ProfileDetailsAdminForm = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form] = Form.useForm<ProfileFormValues>();

  const { data: userData, isLoading } = useCurrentUser();
  const user = getCurrentUserRecord(userData);

  useEffect(() => {
    if (!user) return;
    syncProfileForm(form, user);
  }, [user, form]);

  const mutation = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: (data) => {
      notify.success("Profile updated successfully.");
      syncCurrentUserCache(queryClient, data as ProfileUpdateResponse);
      syncProfileForm(form, getCurrentUserRecord(data as ProfileUpdateResponse));
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        notify.error(error.response?.data?.message || "Failed to update profile");
      } else {
        notify.error("An unexpected error occurred");
      }
    },
  });

  const handleFinish = (values: ProfileFormValues) => {
    const resolvedName = resolveTextValue(values.name, user?.name);
    const resolvedEmail = resolveTextValue(values.email, user?.email);
    const resolvedPhone = resolveTextValue(values.phone, user?.phone);

    if (!resolvedName || resolvedName.length < 3) {
      notify.warning("Name must be at least 3 characters");
      return;
    }

    mutation.mutate({
      name: resolvedName,
      email: resolvedEmail,
      phone: resolvedPhone,
    });
  };

  return (
    <Card className="!rounded-xl !border-[#d9e7c8] !bg-[#fefffc]" style={{ boxShadow: "none", textShadow: "none" }} styles={{ body: { padding: 0 } }} loading={isLoading}>
      <div className="border-b border-[#e3edd9] px-4 py-4 sm:px-6">
        <Typography.Title level={5} className="!mb-1 !text-[#2d4620]">Profile Settings</Typography.Title>
        <Typography.Text className="!text-[13px] !text-[#6d8060]"> Keep your account information up to date.</Typography.Text>
      </div>

      <Form<ProfileFormValues> form={form} layout="vertical" onFinish={handleFinish} requiredMark={false} className="profile-settings-form">
        <Tabs defaultActiveKey="personal" className="profile-settings-tabs" items={personalInfoTab} animated={{ inkBar: true, tabPane: false }}/>

        <div className="flex flex-wrap gap-3 border-t border-[#e3edd9] px-4 pb-5 pt-1 sm:px-6 sm:pb-6">
          <Button type="primary" htmlType="submit" loading={mutation.isPending} className="!h-10 !rounded-lg !px-7 !font-semibold" style={{ boxShadow: "none" }}> Update Profile</Button>
          <Button type="default" onClick={() => navigate(ROUTES.AUTH.CHANGE_PASSWORD)} className="!h-10 !rounded-lg !px-5 !font-semibold" style={{ boxShadow: "none" }}>Change Password</Button>
        </div>
      </Form>
    </Card>
  );
};

export default ProfileDetailsAdminForm;
