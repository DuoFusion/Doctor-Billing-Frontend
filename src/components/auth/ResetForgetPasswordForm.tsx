import { useMutation } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  resetForgotPassword,
  sendForgotPasswordOtp,
  verifyOtpUser,
} from "../../api";
import { ROUTES } from "../../constants/Routes";
import { Button, Card, Form, Input, Typography } from "antd";
import { KeyOutlined, MedicineBoxOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import { VALIDATION_MESSAGES, VALIDATION_REGEX } from "../../constants/validation";
import { getApiErrorMessage, notify } from "../../utils/notify";

const ResetForgetPasswordForm = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const sendOtpMutation = useMutation({
    mutationFn: sendForgotPasswordOtp,
    onSuccess: (data) => {
      notify.success(data?.message || "OTP sent successfully");
      setStep(2);
    },
    onError: (error) => {
      notify.error(getApiErrorMessage(error, "Failed to send OTP"));
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: verifyOtpUser,
    onSuccess: (data) => {
      notify.success(data?.message || "OTP verified successfully");
      setStep(3);
    },
    onError: (error) => {
      notify.error(getApiErrorMessage(error, "Failed to verify OTP"));
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: resetForgotPassword,
    onSuccess: (data) => {
      notify.success(data?.message || "Password reset successfully");
      setStep(4);
      setTimeout(() => navigate(ROUTES.AUTH.SIGNIN), 1500);
    },
    onError: (error) => {
      notify.error(getApiErrorMessage(error, "Failed to reset password"));
    },
  });

  const isSubmitting = useMemo(
    () => sendOtpMutation.isPending || verifyOtpMutation.isPending || resetPasswordMutation.isPending,
    [sendOtpMutation.isPending, verifyOtpMutation.isPending, resetPasswordMutation.isPending]
  );

  const handleSendOtp = () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      notify.warning("Please enter email address");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      notify.warning("Please enter valid email");
      return;
    }

    sendOtpMutation.mutate({ email: trimmedEmail });
  };

  const handleVerifyOtp = () => {
    if (!otp.trim()) {
      notify.warning("OTP is required");
      return;
    }

    if (!VALIDATION_REGEX.otp6.test(otp.trim())) {
      notify.warning(VALIDATION_MESSAGES.otp6);
      return;
    }

    verifyOtpMutation.mutate({ email: email.trim(), otp: otp.trim(), purpose: "reset" });
  };

  const handleResetPassword = () => {
    if (!newPassword || !confirmPassword) {
      notify.warning("New password and confirm password are required");
      return;
    }

    if (newPassword.length < 5) {
      notify.warning(VALIDATION_MESSAGES.passwordMin5);
      return;
    }

    if (newPassword !== confirmPassword) {
      notify.warning("New password and confirm password must match");
      return;
    }

    resetPasswordMutation.mutate({
      email: email.trim(),
      otp: otp.trim(),
      newPassword,
      confirmPassword,
    });
  };

  return (
    <div className="auth-premium-page flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
      <div className="auth-premium-shell w-full max-w-6xl overflow-hidden rounded-3xl border border-[#d9e7c8]">
        <div className="grid min-h-[620px] lg:grid-cols-[1.05fr_0.95fr]">
          <div className="auth-premium-hero hidden flex-col justify-between p-10 lg:flex">
            <div>
              <span className="auth-hero-chip">Account Recovery</span>
              <h2 className="mt-5 text-4xl font-semibold leading-tight text-white">
                Reset access with secure OTP verification.
              </h2>
              <p className="mt-4 max-w-md text-sm text-[#e6f2dd]">
                Recover your account in a few protected steps without losing billing history or profile data.
              </p>
            </div>

            <div className="space-y-4 text-sm text-[#eef6e9]">
              <div className="auth-hero-point">
                <SafetyCertificateOutlined />
                Verified OTP before password update
              </div>
              <div className="auth-hero-point">
                <KeyOutlined />
                Multi-step recovery with clear progress
              </div>
              <div className="auth-hero-point">
                <MedicineBoxOutlined />
                Built for secure medical operations
              </div>
            </div>
          </div>

          <div className="auth-premium-panel flex items-center justify-center p-6 sm:p-8">
            <Card className="auth-premium-card app-form-card !w-full !max-w-md !rounded-2xl !border-[#d9e7c8] !bg-[#fefffc]" style={{ boxShadow: "none" }}>
              <Typography.Title level={3} className="!mb-1 !text-center !text-[#2d4620]">
                Forgot Password
              </Typography.Title>
              <Typography.Text className="!block !text-center !text-[#6d8060]">
                {step === 1 && "Enter your email to receive OTP"}
                {step === 2 && "Enter OTP sent to your email"}
                {step === 3 && "Set your new password"}
                {step === 4 && "Password reset completed"}
              </Typography.Text>

              <div className="mb-4 mt-3 grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((value) => (
                  <span
                    key={value}
                    className={`inline-flex items-center justify-center rounded-lg border py-1 text-xs font-semibold ${
                      step >= value
                        ? "border-[#b8d69a] bg-[#ebffd8] text-[#3a592b]"
                        : "border-[#d9e7c8] bg-[#f7fde8] text-[#7f936f]"
                    }`}
                  >
                    {value}
                  </span>
                ))}
              </div>

              {step === 1 && (
                <Form layout="vertical" requiredMark={false} className="app-form" onFinish={handleSendOtp}>
                  <Form.Item
                    label="Email Address"
                    name="email"
                    rules={[
                      { required: true, message: "Please enter email address" },
                      { type: "email", message: "Please enter valid email" },
                    ]}
                  >
                    <Input
                      type="email"
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </Form.Item>
                  <Button block type="primary" htmlType="submit" loading={isSubmitting} style={{ boxShadow: "none" }}>
                    Send OTP
                  </Button>
                </Form>
              )}

              {step === 2 && (
                <Form layout="vertical" requiredMark={false} className="app-form" onFinish={handleVerifyOtp}>
                  <Form.Item
                    label="OTP"
                    name="otp"
                    rules={[
                      { required: true, message: "Please enter OTP" },
                      { pattern: VALIDATION_REGEX.otp6, message: VALIDATION_MESSAGES.otp6 },
                    ]}
                  >
                    <Input
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength={6}
                    />
                  </Form.Item>
                  <div className="flex gap-3">
                    <Button block onClick={() => setStep(1)} style={{ boxShadow: "none" }}>
                      Back
                    </Button>
                    <Button block type="primary" htmlType="submit" loading={isSubmitting} style={{ boxShadow: "none" }}>
                      Verify OTP
                    </Button>
                  </div>
                </Form>
              )}

              {step === 3 && (
                <Form layout="vertical" requiredMark={false} className="app-form" onFinish={handleResetPassword}>
                  <Form.Item
                    label="New Password"
                    name="newPassword"
                    rules={[
                      { required: true, message: "Please enter new password" },
                      { min: 5, message: VALIDATION_MESSAGES.passwordMin5 },
                    ]}
                  >
                    <Input.Password
                      placeholder="New Password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
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
                    <Input.Password
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </Form.Item>
                  <div className="flex gap-3">
                    <Button block onClick={() => setStep(2)} style={{ boxShadow: "none" }}>
                      Back
                    </Button>
                    <Button block type="primary" htmlType="submit" loading={isSubmitting} style={{ boxShadow: "none" }}>
                      Reset Password
                    </Button>
                  </div>
                </Form>
              )}

              {step === 4 && (
                <div className="mt-3 space-y-4 text-center">
                  <p className="text-sm text-[#4f6841]">Your password has been reset successfully.</p>
                  <Button type="primary" block onClick={() => navigate(ROUTES.AUTH.SIGNIN)} style={{ boxShadow: "none" }}>
                    Go to Sign In
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetForgetPasswordForm;
