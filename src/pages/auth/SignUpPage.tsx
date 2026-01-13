import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import type { RegisterRequest } from "../../services/authService";
import AnimatedBackground from "../../component/background/AnimatedBackground";
import { EyeOffIcon } from "lucide-react";
import { useCosmicToast } from "../../component/toast/CosmicToastProvider";

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

type FormErrors = {
  firstName?: string;
  lastName?: string;
  email?: string;
  passwordHash?: string;
  dateOfBirth?: string;
};

function SignUpPage() {
  const { register, sendOtpForRegister, isLoading } = useAuth();
  const [step, setStep] = useState<"form" | "otp">("form");
  const [otpCode, setOtpCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const datePattern = /^\d{4}\/\d{2}\/\d{2}$/;
  const { showToast } = useCosmicToast();

  const [formData, setFormData] = useState<RegisterRequest & { agreed: boolean }>({
    email: "",
    passwordHash: "",
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    agreed: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // --- Validate riêng từng field ---
  const validateField = (field: keyof FormErrors) => {
    switch (field) {
      case "firstName":
        return formData.firstName ? "" : "Vui lòng nhập họ!";
      case "lastName":
        return formData.lastName ? "" : "Vui lòng nhập tên!";
      case "email":
        if (!formData.email) return "Vui lòng nhập Email!";
        if (!emailRegex.test(formData.email)) return "Email không đúng định dạng!";
        return "";
      case "passwordHash":
        if (!formData.passwordHash) return "Vui lòng nhập mật khẩu!";
        if (formData.passwordHash.length < 6) return "Mật khẩu phải có ít nhất 6 ký tự!";
        return "";
      case "dateOfBirth": {
      // if (!formData.dateOfBirth) return "Vui lòng nhập ngày sinh!";
      const parts = formData.dateOfBirth.split('/');
      if(parts.length<3)
        return "Vui lòng nhập đầy đủ tháng ngày năm"
      if (!datePattern.test(formData.dateOfBirth))
        return "Ngày sinh phải có định dạng yyyy/MM/dd";
      // Kiểm tra hợp lệ ngày, tháng, năm
      const [yearStr, monthStr, dayStr] = formData.dateOfBirth.split("/");
      const year = parseInt(yearStr, 10);
      const month = parseInt(monthStr, 10);
      const day = parseInt(dayStr, 10);

      // Tháng hợp lệ 1-12
      if (month < 1 || month > 12) return "Tháng không hợp lệ (1-12)";
      
      // Ngày hợp lệ theo tháng và năm (đầy đủ cho tháng 2 nhuận)
      const daysInMonth = new Date(year, month, 0).getDate();
      if (day < 1 || day > daysInMonth) return `Ngày không hợp lệ cho tháng ${month}`;

      return "";
      }
      default:
        return "";
    }
  };

  // --- Blur handler ---
  const handleBlur = (field: keyof FormErrors) => {
    setErrors((prev) => ({
      ...prev,
      [field]: validateField(field),
    }));
  };

  // --- Validate toàn form ---
  const validateAll = () => {
    const newErrors: FormErrors = {};
    (["firstName", "lastName", "email", "passwordHash", "dateOfBirth"] as (keyof FormErrors)[])
      .forEach((field) => {
        const error = validateField(field);
        if (error) newErrors[field] = error;
      });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- Gửi OTP ---
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAll()) return;

    const result = await sendOtpForRegister(formData.email);
    console.log(formData)
    if (result.success) {
      setStep("otp");
      showToast("Gửi mã otp đến email thành công!", "success")
    }
    else {
      // toast hoặc message cho lỗi từ backend
      showToast(result.message || "❌ Lỗi khi gửi mã OTP. Vui lòng thử lại!", "error");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // --- Đăng ký với OTP ---
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    const { ...registerData } = formData;
    const result = await register(registerData, otpCode);

    if (result.success) {
      showToast("Đăng ký tài khoản thành công!", "success")
      setFormData({ email: "", passwordHash: "", firstName: "", lastName: "", dateOfBirth: "", agreed: false });
      setOtpCode("");
      setStep("form");
      navigate("/login");
    }
    else{
      showToast(result.message || "Mã OTP không hợp lệ", "error")
    }
  };


  return (
    // Áp dụng font Inter và màu nền chính
    <div className="min-h-screen bg-dark-bg flex items-center justify-center font-inter p-4">
      <AnimatedBackground />
      {/* Áp dụng màu nền thẻ và hiệu ứng animation */}
      <div className="w-full max-w-md bg-dark-surface rounded-2xl p-8 shadow-lg">
        <div className="flex items-center mb-3 justify-center">
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
        <h2 className="text-3xl font-bold text-white mb-2 ml-8">
          Tạo tài khoản của bạn
        </h2>
        {step === "form" ? (
          <form onSubmit={handleSendOtp} noValidate>
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
                    onBlur={() => handleBlur("firstName")}
                    value={formData.firstName}
                    required
                  />
                   {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
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
                    onBlur={() => handleBlur("lastName")}
                    value={formData.lastName}
                    required
                  />
                   {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
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
                  onBlur={() => handleBlur("email")}
                  value={formData.email}
                  required
                />
                 {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
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
                    type={showPassword ? "text" : "password"}
                    id="passwordHash"
                    name="passwordHash"
                    className="w-full bg-[#2c2d3c] border border-border-color text-text-primary rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-accent pr-10"
                    placeholder="Tạo mật khẩu mạnh (tối thiểu 6 ký tự)"
                    onChange={handleInputChange}
                    onBlur={() => handleBlur("passwordHash")}
                    value={formData.passwordHash}
                    minLength={6}
                    required
                  />
                  {errors.passwordHash && <p className="text-red-500 text-sm mt-1">{errors.passwordHash}</p>}
                  <span
                    className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </span>
                </div>
              </div>
              <div>
                <label
                  className="text-sm font-medium text-text-secondary block mb-2"
                  htmlFor="dateOfBirth"
                >
                  Ngày sinh
                </label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  className="w-full bg-[#2c2d3c] border border-border-color text-text-primary rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-accent"
                  // Khi chọn ngày → lưu dạng yyyy/MM/dd
                  onChange={(e) => {
                    const formattedDate = e.target.value.replaceAll("-", "/");
                    setFormData((prev) => ({
                      ...prev,
                      dateOfBirth: formattedDate,
                    }));
                  }}
                  // Khi mất focus → validate định dạng
                  onBlur={() => handleBlur("dateOfBirth")}
                  // Hiển thị đúng cho input date
                  value={formData.dateOfBirth.replaceAll("/", "-")}
                  min="1900-01-01"
                  max={new Date().toISOString().split("T")[0]}
                  required
                />
                {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>}
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
                <h3 className="text-xl font-bold text-white mb-2">
                  Xác minh địa chỉ email của bạn
                </h3>
                <p className="text-text-secondary">
                  Chúng tôi đã gửi mã xác minh (OTP) đến <br />
                  <span className="text-accent font-medium">
                    {formData.email}
                  </span>
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
                onClick={() => setStep("form")}
                className="w-full bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-500 transition-colors"
              >
                Quay lại biểu mẫu
              </button>
            </div>
          </form>
        )}

        <div className="mt-8 text-center">
          <p className="text-sm text-text-secondary">
            Bạn đã có tài khoản?{" "}
            <Link className="font-bold text-accent hover:underline" to="/login">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignUpPage;
