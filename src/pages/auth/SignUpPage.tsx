import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import type { RegisterRequest } from "../../services/authService";
import { toast } from "react-hot-toast";

// SVG Icons (giữ nguyên)
const EyeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-5 h-5 text-text-secondary"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.036 12.322a1.012 1.012 0 010-.639l4.418-4.418a1.012 1.012 0 011.414 0l4.418 4.418a1.012 1.012 0 010 .639l-4.418 4.418a1.012 1.012 0 01-1.414 0l-4.418-4.418z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

function SignUpPage() {
  const { register, sendOtpForRegister, isLoading } = useAuth();
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [otpCode, setOtpCode] = useState("");
  
  const [formData, setFormData] = useState<RegisterRequest & { agreed: boolean }>({
    email: "",
    passwordHash: "",
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    agreed: false,
  });

  const handleInputChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Gửi OTP
  const handleSendOtp = async (e: any) => {
    e.preventDefault();
    if (!formData.email) {
      setMessage("Vui lòng nhập email trước khi gửi OTP");
      setMessageType("error");
      return;
    }

    // Validate form data before sending OTP
    if (!formData.firstName || !formData.lastName || !formData.passwordHash || !formData.dateOfBirth) {
      setMessage("Vui lòng nhập đầy đủ thông tin");
      setMessageType("error");
      return;
    }

    // Validate date format
    const datePattern = /^\d{4}\/\d{2}\/\d{2}$/;
    if (!datePattern.test(formData.dateOfBirth)) {
      setMessage("Ngày sinh phải có định dạng yyyy/MM/dd (ví dụ: 1990/01/01)");
      setMessageType("error");
      return;
    }

    // Validate password length
    if (formData.passwordHash.length < 6) {
      setMessage("Mật khẩu phải có ít nhất 6 ký tự");
      setMessageType("error");
      return;
    }

    const result = await sendOtpForRegister(formData.email);
    setMessage(result.message || '');
    setMessageType(result.success ? 'success' : 'error');
    
    if (result.success) {
      setStep('otp');
    }
  };

  // Đăng ký với OTP
  const handleRegister = async (e: any) => {
    e.preventDefault();
    if (!otpCode) {
      setMessage("Vui lòng nhập mã OTP");
      setMessageType("error");
      return;
    }

    const { agreed, ...registerData } = formData;
    
    // Debug: Log the data being sent
    console.log('Registering with data:', { ...registerData, passwordHash: '[HIDDEN]', otp: otpCode });
    
   const result = await register(registerData, otpCode);

setMessage(result.message || '');
setMessageType(result.success ? 'success' : 'error');

    
    if (result.success) {
      toast.success("🎉 Đăng ký thành công! Chào mừng bạn trở lại 👋", {
      style: {
        borderRadius: "12px",
        background: "#1E1E2F",
        color: "#fff",
        padding: "12px 16px",
      },
      iconTheme: {
        primary: "#8b5cf6",
        secondary: "#fff",
      },
    });
      // Reset form sau khi đăng ký thành công
      setFormData({
        email: "",
        passwordHash: "",
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        agreed: false,
      });
      setOtpCode("");
      setStep('form');
      
    }
  };

  return (
    // Áp dụng font Inter và màu nền chính
      <div className="min-h-screen bg-dark-bg flex items-center justify-center font-inter p-4">
        {/* Áp dụng màu nền thẻ và hiệu ứng animation */}
        <div className="w-full max-w-md bg-dark-surface rounded-2xl p-8 shadow-lg animate-fade-in">
        <div className="flex items-center mb-3">
          <div className="bg-accent p-2 rounded-lg mr-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="white"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-text-primary">
            Producer Workbench
          </h1>
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">
          Tạo tài khoản của bạn
        </h2>
        {step === 'form' ? (
          <form onSubmit={handleSendOtp}>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className="text-sm font-medium text-text-secondary block mb-2"
                    htmlFor="firstName"
                  >
                    Họ
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    className="w-full bg-[#2c2d3c] border border-border-color text-text-primary rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="ví dụ: Hồ.."
                    onChange={handleInputChange}
                    value={formData.firstName}
                    required
                  />
                </div>
                <div>
                  <label
                    className="text-sm font-medium text-text-secondary block mb-2"
                    htmlFor="lastName"
                  >
                    Tên
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    className="w-full bg-[#2c2d3c] border border-border-color text-text-primary rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="ví dụ: Minh"
                    onChange={handleInputChange}
                    value={formData.lastName}
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  className="text-sm font-medium text-text-secondary block mb-2"
                  htmlFor="email"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full bg-[#2c2d3c] border border-border-color text-text-primary rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="Nhập email của bạn"
                  onChange={handleInputChange}
                  value={formData.email}
                  required
                />
              </div>

              <div>
                <label
                  className="text-sm font-medium text-text-secondary block mb-2"
                  htmlFor="passwordHash"
                >
                  Mật khẩu
                </label>
                <div className="relative">
                  <input
                    type="password"
                    id="passwordHash"
                    name="passwordHash"
                    className="w-full bg-[#2c2d3c] border border-border-color text-text-primary rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-accent pr-10"
                    placeholder="Tạo mật khẩu mạnh (tối thiểu 6 ký tự)"
                    onChange={handleInputChange}
                    value={formData.passwordHash}
                    minLength={6}
                    required
                  />
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer">
                    <EyeIcon />
                  </span>
                </div>
              </div>

              <div>
                <label
                  className="text-sm font-medium text-text-secondary block mb-2"
                  htmlFor="dateOfBirth"
                >
                  Date of Birth
                </label>
                <input
                  type="text"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  className="w-full bg-[#2c2d3c] border border-border-color text-text-primary rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="Năm/tháng/ngày (ví dụ: 1990/01/01)"
                  onChange={handleInputChange}
                  value={formData.dateOfBirth}
                  pattern="\d{4}/\d{2}/\d{2}"
                  required
                />
              </div>

              <div className="flex items-center mt-6">
                <input
                  id="agreed"
                  name="agreed"
                  type="checkbox"
                  className="w-4 h-4 text-accent bg-gray-700 border-gray-600 rounded focus:ring-accent"
                  onChange={handleInputChange}
                  checked={formData.agreed}
                  required
                />
                <label
                  htmlFor="agreed"
                  className="ml-2 text-sm text-text-secondary"
                >
                  Tôi đồng ý với{" "}
                  <a href="#" className="text-accent hover:underline">
                    Điều khoản dịch vụ
                  </a>{" "}
                  và{" "}
                  <a href="#" className="text-accent hover:underline">
                    Chính sách bảo mật
                  </a>
                </label>
              </div>
              <button
                type="submit"
                className="w-full bg-accent text-white font-bold py-3 rounded-lg mt-8 hover:bg-opacity-90 transition-colors disabled:opacity-50"
                disabled={isLoading || !formData.agreed}
              >
                {isLoading ? "Đang gửi OTP..." : "Gửi OTP"}
              </button>
            </div>
          </form>
        ) : (
          // OTP Form
          <form onSubmit={handleRegister}>
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-white mb-2">Xác minh địa chỉ email của bạn</h3>
                <p className="text-text-secondary">
                  Chúng tôi đã gửi mã xác minh (OTP) đến <br />
                  <span className="text-accent font-medium">{formData.email}</span>
                </p>
              </div>

              <div>
                <label
                  className="text-sm font-medium text-text-secondary block mb-2"
                  htmlFor="otp"
                >
                  Mã xác minh (OTP)
                </label>
                <input
                  type="text"
                  id="otp"
                  name="otp"
                  className="w-full bg-[#2c2d3c] border border-border-color text-text-primary rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-accent text-center text-2xl tracking-widest"
                  placeholder="000000"
                  onChange={(e) => setOtpCode(e.target.value)}
                  value={otpCode}
                  maxLength={6}
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-accent text-white font-bold py-3 rounded-lg mt-8 hover:bg-opacity-90 transition-colors disabled:opacity-50"
                disabled={isLoading || !otpCode}
              >
                {isLoading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
              </button>

              <button
                type="button"
                onClick={() => setStep('form')}
                className="w-full bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-500 transition-colors"
              >
                Quay lại biểu mẫu
              </button>
            </div>
          </form>
        )}

        {/* Message Display */}
        {message && (
          <div className={`mt-4 p-3 rounded-lg text-sm ${
            messageType === 'success' 
              ? 'bg-green-900/20 text-green-400 border border-green-400/20' 
              : 'bg-red-900/20 text-red-400 border border-red-400/20'
          }`}>
            {message}
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-sm text-text-secondary">
            Bạn đã có tài khoản?{" "}
              <Link className="font-bold text-accent hover:underline" to="/login">Đăng nhập</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignUpPage;
