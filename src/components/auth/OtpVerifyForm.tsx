import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { verifyOtpUser, setAuthToken } from "../../api";
import { ROUTES } from "../../constants/Routes";
import { Button, Card, Form, Input, Typography } from "antd";
import { LockOutlined, MedicineBoxOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import { notify } from "../../utils/notify";

interface OtpValues {
  otp: string;
}

const OtpVerifyForm = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm<OtpValues>();
  const [email, setEmail] = useState("");

  useEffect(() => {
    const storedEmail = localStorage.getItem("email");
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      notify.warning("Email not found. Please sign in again.");
      navigate(ROUTES.AUTH.SIGNIN);
    }
  }, [navigate]);

  const mutation = useMutation({
    mutationFn: verifyOtpUser,
    onSuccess: (data) => {
      if (!data?.token || !data?.user) {
        notify.error("Invalid login response. Please try again.");
        return;
      }
      setAuthToken(data.token);
      localStorage.removeItem("email");
      notify.success("OTP verified successfully.");

      setTimeout(() => {
        if (data.user.role === "admin") {
          navigate(ROUTES.ADMIN.DASHBOARD);
        } else if (data.user.role === "user") {
          navigate(ROUTES.USER.DASHBOARD);
        } else {
          navigate("/");
        }
        window.location.reload();
      }, 700);
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        notify.error(error.response?.data?.message || "Something went wrong");
      } else {
        notify.error("Something went wrong");
      }
    },
  });

  const handleVerify = (values: OtpValues) => {
    mutation.mutate({ email: email.trim(), otp: values.otp.trim() });
  };

  return (
    <div className="auth-premium-page flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
      <div className="auth-premium-shell w-full max-w-6xl overflow-hidden rounded-3xl border border-[#d9e7c8]">
        <div className="grid min-h-[620px] lg:grid-cols-[1.05fr_0.95fr]">
          <div className="auth-premium-hero hidden flex-col justify-between p-10 lg:flex">
            <div>
              <span className="auth-hero-chip">Medico Billing Suite</span>
              <h2 className="mt-5 text-4xl font-semibold leading-tight text-white">
                OTP verification for secure access.
              </h2>
              <p className="mt-4 max-w-md text-sm text-[#e6f2dd]">
                Verify your one-time password to continue to your billing dashboard safely.
              </p>
            </div>

            <div className="space-y-4 text-sm text-[#eef6e9]">
              <div className="auth-hero-point">
                <SafetyCertificateOutlined />
                Verified login with role-based redirection
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
                Verify OTP
              </Typography.Title>
              <Typography.Text className="!mb-2 !block !text-center !text-[#6d8060]">
                Enter the verification code sent to your email
              </Typography.Text>
              <Typography.Text className="!mb-6 !block !text-center !text-[#4f6841]">
                {email || "-"}
              </Typography.Text>

              <Form<OtpValues> form={form} layout="vertical" requiredMark={false} onFinish={handleVerify} className="app-form">
                <Form.Item
                  label="OTP"
                  name="otp"
                  rules={[
                    { required: true, message: "Please enter OTP" },
                  ]}
                >
                  <Input type="number" inputMode="numeric" placeholder="Enter OTP" maxLength={6} />
                </Form.Item>

                <Button block type="primary" htmlType="submit" loading={mutation.isPending} style={{ boxShadow: "none" }}>
                  Verify OTP
                </Button>
              </Form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OtpVerifyForm;
