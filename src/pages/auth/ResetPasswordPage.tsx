import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import AnimatedBackground from "../../component/background/AnimatedBackground";

function ResetPasswordPage() {
  const [email, setEmail] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const [step, setStep] = useState<"email" | "otp" | "reset">("email");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  const { sendOtpForgotPassword, verifyOtp, resetPassword, isLoading } = useAuth();

  const handlePasswordBlur = () => {
    if(!newPassword){
      setMessage("Vui lòng nhập mật khẩu mới");
      setMessageType("error")
    }else if(newPassword.length < 6){
      setMessage("Mật khẩu phải có ít nhất 6 ký tự")
      setMessageType("error")
    }else(
      setMessage("")
    )
  }
  // Gửi OTP
  const handleSendOtp = async (e: any) => {
    e.preventDefault();
    if (!email) {
      setMessage("Vui lòng nhập email.");
      setMessageType("error");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage("Vui lòng nhập đúng định dạng email.");
      setMessageType("error");
      return;
    }
    const result = await sendOtpForgotPassword(email);
    if (result.success) {
      setMessage("Đã gửi OTP đến email của bạn.");
      setMessageType("success");
      setStep("otp");
    } else {
      setMessage(result.message || "Có lỗi xảy ra. Vui lòng thử lại.");
      setMessageType("error");
    }
  };

  // Xác minh OTP
  const handleVerifyOtp = async (e: any) => {
    e.preventDefault();
    if (!otp) {
      setMessage("Vui lòng nhập mã OTP.");
      setMessageType("error");
      return;
    }
    const result = await verifyOtp(email, otp);
    if (result.success) {
      setMessage("OTP hợp lệ. Hãy nhập mật khẩu mới.");
      setMessageType("success");
      setStep("reset");
    } else {
      setMessage(result.message || "OTP không hợp lệ.");
      setMessageType("error");
    }
  };

  // Reset mật khẩu
  const handleResetPassword = async (e: any) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setMessage("Vui lòng nhập đầy đủ mật khẩu.");
      setMessageType("error");
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage("Mật khẩu xác nhận không khớp.");
      setMessageType("error");
      return;
    }
    if (newPassword.length < 6) {
      setMessage("Mật khẩu phải có ít nhất 6 ký tự.");
      setMessageType("error");
      return;
    }

    const result = await resetPassword(email, otp, newPassword);
    if (result.success) {
      setMessage("Đặt lại mật khẩu thành công. Hãy đăng nhập lại.");
      setMessageType("success");
      window.location.href = "/login";
    } else {
      setMessage(result.message || "Không thể đặt lại mật khẩu.");
      setMessageType("error");
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center font-inter p-4 text-text-primary">
      <AnimatedBackground/>
      <main className="flex flex-col items-center w-full animate-fade-in">
        {/* Logo */}
        <div className="flex items-center mb-8">
          <div className="bg-accent p-3 rounded-xl mr-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="white"
              className="w-7 h-7"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold">Producer Workbench</h1>
        </div>

        {/* Form Card */}
        <div className="w-full max-w-md bg-dark-surface rounded-2xl p-8 shadow-lg">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-3">
              Đặt lại mật khẩu
            </h2>
          </div>

          {/* Step 1: Nhập email */}
          {step === "email" && (
            <form onSubmit={handleSendOtp} noValidate>
              <div className="space-y-6">
                <div>
                  <label  
                    className="text-sm font-medium text-text-secondary block mb-2"
                    htmlFor="email"
                  >
                    Email
                  </label>
                  <input
                    type="text"
                    id="email"
                    className="w-full bg-[#2c2d3c] border border-border-color text-text-primary rounded-lg p-3"
                    placeholder="Nhập địa chỉ email của bạn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              {message && (
                <div
                  className={`mt-4 p-3 rounded-lg text-sm ${
                    messageType === "success"
                      ? "bg-green-900/20 text-green-400 border border-green-400/20"
                      : "bg-red-900/20 text-red-400 border border-red-400/20"
                  }`}
                >
                  {message}
                </div>
              )}
              <button
                type="submit"
                className="w-full bg-accent text-white font-bold py-3 rounded-lg mt-8 hover:bg-opacity-90 transition-colors"
              >
                Gửi OTP
              </button>
            </form>
          )}

          {/* Step 2: Nhập OTP */}
          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} noValidate>
              <div className="space-y-6">
                <div>
                  <label
                    className="text-sm font-medium text-text-secondary block mb-2"
                    htmlFor="otp"
                  >
                    Mã xác minh (OTP)
                  </label>
                  <input
                    type="email"
                    id="otp"
                    name="otp"
                    className="w-full bg-[#2c2d3c] border border-border-color text-text-primary rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-accent text-center text-2xl tracking-widest"
                    placeholder="000000"
                    onChange={(e) => setOtp(e.target.value)}
                    value={otp}
                    maxLength={6}
                    required
                  />
                </div>
              </div>
              {message && (
                <div
                  className={`mt-4 p-3 rounded-lg text-sm ${
                    messageType === "success"
                      ? "bg-green-900/20 text-green-400 border border-green-400/20"
                      : "bg-red-900/20 text-red-400 border border-red-400/20"
                  }`}
                >
                  {message}
                </div>
              )}
              <button
                type="submit"
                className="w-full bg-accent text-white font-bold py-3 rounded-lg mt-8 hover:bg-opacity-90 transition-colors disabled:opacity-50"
                disabled={isLoading || !otp}
              >
                {isLoading ? "Đang xác minh..." : "Xác minh OTP"}
              </button>
              <button
                type="button"
                onClick={() => setStep("email")}
                className="w-full bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-500 transition-colors mt-6"
              >
                Quay lại biểu mẫu
              </button>
            </form>
          )}

          {/* Step 3: Reset mật khẩu */}
          {step === "reset" && (
            <form onSubmit={handleResetPassword} noValidate>
              <div className="space-y-6">
                <div>
                  <label
                    className="text-sm font-medium text-text-secondary block mb-2"
                    htmlFor="newPassword"
                  >
                    Mật khẩu mới
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    className="w-full bg-[#2c2d3c] border border-border-color text-text-primary rounded-lg p-3"
                    placeholder="Nhập mật khẩu mới"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    onBlur={handlePasswordBlur}
                    required
                  />
                </div>
                <div>
                  <label
                    className="text-sm font-medium text-text-secondary block mb-2"
                    htmlFor="confirmPassword"
                  >
                    Xác nhận mật khẩu mới
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    className="w-full bg-[#2c2d3c] border border-border-color text-text-primary rounded-lg p-3"
                    placeholder="Nhập lại mật khẩu mới"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              {message && (
                <div
                  className={`mt-4 p-3 rounded-lg text-sm ${
                    messageType === "success"
                      ? "bg-green-900/20 text-green-400 border border-green-400/20"
                      : "bg-red-900/20 text-red-400 border border-red-400/20"
                  }`}
                >
                  {message}
                </div>
              )}
              <button
                type="submit"
                className="w-full bg-accent text-white font-bold py-3 rounded-lg mt-8 hover:bg-opacity-90 transition-colors disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}

export default ResetPasswordPage;
