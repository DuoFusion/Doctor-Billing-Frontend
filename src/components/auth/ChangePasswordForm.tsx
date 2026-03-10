import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { changeUserPassword } from "../../api";
import { ROUTES } from "../../constants/Routes";
import { Button, Card, Form, Input, Typography } from "antd";
import { VALIDATION_MESSAGES } from "../../constants/validation";
import { getApiErrorMessage, notify } from "../../utils/notify";

interface PasswordFormValues {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ChangePasswordForm = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm<PasswordFormValues>();

  const mutation = useMutation({
    mutationFn: changeUserPassword,
    onSuccess: (data) => {
      notify.success(data?.message || "Password changed successfully");
      form.resetFields();

      setTimeout(() => {
        navigate(ROUTES.USER.PROFILE);
      }, 1200);
    },
    onError: (error: unknown) => {
      notify.error(getApiErrorMessage(error, "Failed to change password"));
    },
  });

  const handleSubmit = (values: PasswordFormValues) => {
    const oldPassword = (values.oldPassword || "").trim();
    const newPassword = (values.newPassword || "").trim();
    const confirmPassword = (values.confirmPassword || "").trim();

    if (newPassword.length < 5) {
      notify.error(VALIDATION_MESSAGES.passwordMin5);
      return;
    }

    if (newPassword !== confirmPassword) {
      notify.error("New password and confirm password must match");
      return;
    }

    mutation.mutate({ oldPassword, newPassword, confirmPassword });
  };

  return (
    <div className="app-form-page px-4 py-8">
      <Card className="app-form-card !mx-auto !max-w-lg !rounded-2xl !border-[#d9e7c8] !bg-[#fefffc]" style={{ boxShadow: "none" }}>
        <Typography.Title level={4} className="!mb-1 !text-center !text-[#2d4620]">
          Change Password
        </Typography.Title>
        <Typography.Text className="!mb-5 !block !text-center !text-[#6d8060]">
          Update your account password securely
        </Typography.Text>

        <Form<PasswordFormValues>
          form={form}
          layout="vertical"
          requiredMark={false}
          className="app-form"
          onFinish={handleSubmit}
        >
          <Form.Item
            label="Old Password"
            name="oldPassword"
            rules={[
              { required: true, message: "Please enter old password" },
              { min: 5, message: VALIDATION_MESSAGES.passwordMin5 },
            ]}
          >
            <Input.Password placeholder="Enter old password" />
          </Form.Item>

          <Form.Item
            label="New Password"
            name="newPassword"
            rules={[
              { required: true, message: "Please enter new password" },
              { min: 5, message: VALIDATION_MESSAGES.passwordMin5 },
            ]}
          >
            <Input.Password placeholder="Enter new password" />
          </Form.Item>

          <Form.Item
            label="Confirm Password"
            name="confirmPassword"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "Please confirm password" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("New password and confirm password must match"));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Re-enter new password" />
          </Form.Item>

          <div className="flex gap-3 pt-2">
            <Button block onClick={() => navigate(ROUTES.USER.PROFILE)} style={{ boxShadow: "none" }}>
              Cancel
            </Button>
            <Button block type="primary" htmlType="submit" loading={mutation.isPending} style={{ boxShadow: "none" }}>
              Change Password
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default ChangePasswordForm;
