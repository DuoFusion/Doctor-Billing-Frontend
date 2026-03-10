import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { signinUser } from "../../api";
import { ROUTES } from "../../constants/Routes";
import { Button, Card, Form, Input, Typography } from "antd";
import { LockOutlined, MedicineBoxOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import { VALIDATION_MESSAGES } from "../../constants/validation";
import { notify } from "../../utils/notify";

interface SigninValues {
  email: string;
  password: string;
}

const SigninForm = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm<SigninValues>();

  const mutation = useMutation({
    mutationFn: signinUser,
    onSuccess: (_, vars) => {
      localStorage.setItem("email", vars.email);
      notify.success(`OTP sent successfully to ${vars.email}`);
      setTimeout(() => navigate(ROUTES.AUTH.VERIFY_OTP), 700);
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        notify.error(error.response?.data?.message || "Something went wrong");
      } else {
        notify.error("Something went wrong");
      }
    },
  });

  const handleSignin = (values: SigninValues) => {
    mutation.mutate({
      email: (values.email || "").trim(),
      password: values.password,
    });
  };

  return (
    <div className="auth-premium-page flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
      <div className="auth-premium-shell w-full max-w-6xl overflow-hidden rounded-3xl border border-[#d9e7c8]">
        <div className="grid min-h-[620px] lg:grid-cols-[1.05fr_0.95fr]">
          <div className="auth-premium-hero hidden flex-col justify-between p-10 lg:flex">
            <div>
              <span className="auth-hero-chip">Medico Billing Suite</span>
              <h2 className="mt-5 text-4xl font-semibold leading-tight text-white">
                Secure medical billing, simplified.
              </h2>
              <p className="mt-4 max-w-md text-sm text-[#e6f2dd]">
                A modern workspace for products, billing, companies, and category management in one secure portal.
              </p>
            </div>

            <div className="space-y-4 text-sm text-[#eef6e9]">
              <div className="auth-hero-point">
                <SafetyCertificateOutlined />
                Role-based access with verified sessions
              </div>
              <div className="auth-hero-point">
                <MedicineBoxOutlined />
                Built for pharmacies and medical stores
              </div>
              <div className="auth-hero-point">
                <LockOutlined />
                OTP-protected sign-in workflow
              </div>
            </div>
          </div>

          <div className="auth-premium-panel flex items-center justify-center p-6 sm:p-8">
            <Card className="auth-premium-card app-form-card !w-full !max-w-md !rounded-2xl !border-[#d9e7c8] !bg-[#fefffc]" style={{ boxShadow: "none" }}>
              <Typography.Title level={3} className="!mb-1 !text-center !text-[#2d4620]">
                Welcome Back
              </Typography.Title>
              <Typography.Text className="!mb-6 !block !text-center !text-[#6d8060]">
                Sign in to continue to your dashboard
              </Typography.Text>

              <Form<SigninValues>
                form={form}
                layout="vertical"
                requiredMark={false}
                onFinish={handleSignin}
                className="app-form"
              >
                <Form.Item
                  label="Email Address"
                  name="email"
                  rules={[{ required: true, message: "Please enter email" }, { type: "email", message: "Please enter valid email" }]}
                >
                  <Input placeholder="Email Address" />
                </Form.Item>

                <Form.Item
                  label="Password"
                  name="password"
                  rules={[
                    { required: true, message: "Please enter password" },
                    { min: 5, message: VALIDATION_MESSAGES.passwordMin5 },
                  ]}
                >
                  <Input.Password placeholder="Password" />
                </Form.Item>

                <div className="mb-3 flex justify-end">
                  <button
                    type="button"
                    className="text-sm text-[#4f6841] hover:text-[#3a592b]"
                    onClick={() => navigate(ROUTES.AUTH.FORGET_PASSWORD)}
                  >
                    Forget Password?
                  </button>
                </div>

                <Button block type="primary" htmlType="submit" loading={mutation.isPending} style={{ boxShadow: "none" }}>
                  Sign In
                </Button>
              </Form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SigninForm;
