import React, { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Edit,
  Save,
  XCircle,
  Upload,
  Shield,
  CheckCircle,
  AlertCircle,
  UserCheck,
  Key,
  Rocket,
  AlertTriangle,
  CreditCard,
  Plus,
  Trash2,
  Building2,
  Clock,
  Loader2,
  Search,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import AnimatedBackground from "../../component/background/AnimatedBackground";
import { Lock } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import userService, {
  UserProfileResponse,
  UpdatePersonalProfileRequest,
} from "../../services/userService";
import userBankService, {
  UserBankResponse,
  SendBankAccountOtpRequest,
  AddBankAccountRequest,
} from "../../services/userBankService";
import withdrawalService, { BankResponse } from "../../services/withdrawalService";
import { useDebounce } from "../../component/hooks/useDebounce";
import { ROUTER } from "../../routes/router";
import { useCosmicToast } from "@/component/toast/CosmicToastProvider";

const UserProfile: React.FC = () => {
  const [isChangePassOpen, setIsChangePassOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changePasswordOtp, setChangePasswordOtp] = useState("");
  const [changePassOtpCountdown, setChangePassOtpCountdown] = useState(0);
  const [isSendingChangePassOtp, setIsSendingChangePassOtp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<UpdatePersonalProfileRequest>({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    dateOfBirth: "",
    location: "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Bank account states
  const [bankAccounts, setBankAccounts] = useState<UserBankResponse[]>([]);
  const [isLoadingBanks, setIsLoadingBanks] = useState(false);
  const [isAddBankModalOpen, setIsAddBankModalOpen] = useState(false);
  const [isDeleteBankModalOpen, setIsDeleteBankModalOpen] = useState(false);
  const [bankToDelete, setBankToDelete] = useState<number | null>(null);
  const [banks, setBanks] = useState<BankResponse[]>([]);
  const [isLoadingBankList, setIsLoadingBankList] = useState(false);
  const [bankSearchQuery, setBankSearchQuery] = useState("");
  const [showBankDropdown, setShowBankDropdown] = useState(false);
  const [selectedBank, setSelectedBank] = useState<BankResponse | null>(null);
  const [bankFormData, setBankFormData] = useState({
    accountNumber: "",
    accountHolderName: "",
    otp: "",
  });
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isSubmittingBank, setIsSubmittingBank] = useState(false);
  const bankDropdownRef = useRef<HTMLDivElement>(null);

  const debouncedBankSearch = useDebounce(bankSearchQuery, 300);

  const { changePassword, sendOtpChangePassword } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useCosmicToast();

  // Fetch profile data on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoadingProfile(true);
        const profileData = await userService.getPersonalProfile();
        setProfile(profileData);
        // Initialize form data
        setFormData({
          firstName: profileData.firstName || "",
          lastName: profileData.lastName || "",
          phoneNumber: profileData.phoneNumber || "",
          dateOfBirth: profileData.dateOfBirth
            ? profileData.dateOfBirth.split("T")[0]
            : "",
          location: profileData.location || "",
        });
      } catch (error: any) {
        console.error("Error fetching profile:", error);
        showToast(error.message || "Không thể tải thông tin profile", "error");
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfile();
  }, []);

  // Refresh profile after returning from verification
  useEffect(() => {
    const handleFocus = () => {
      const fetchProfile = async () => {
        try {
          const profileData = await userService.getPersonalProfile();
          setProfile(profileData);
        } catch (error: any) {
          console.error("Error refreshing profile:", error);
        }
      };
      fetchProfile();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  // Fetch bank accounts
  useEffect(() => {
    const fetchBankAccounts = async () => {
      try {
        setIsLoadingBanks(true);
        const accounts = await userBankService.getUserBanks();
        setBankAccounts(accounts);
      } catch (error: any) {
        console.error("Error fetching bank accounts:", error);
        showToast(error.message || "Không thể tải danh sách ngân hàng", "error");
      } finally {
        setIsLoadingBanks(false);
      }
    };

    fetchBankAccounts();
  }, []);

  // Fetch banks
  const fetchBanks = useCallback(async (keyword?: string) => {
    try {
      setIsLoadingBankList(true);
      const bankList = await withdrawalService.getAllBanks(keyword);
      setBanks(bankList);
    } catch (error: any) {
      console.error("Error fetching banks:", error);
      showToast(error.message || "Không thể tải danh sách ngân hàng", "error");
    } finally {
      setIsLoadingBankList(false);
    }
  }, []);

  // Load banks when modal opens
  useEffect(() => {
    if (isAddBankModalOpen) {
      fetchBanks();
    }
  }, [isAddBankModalOpen, fetchBanks]);

  // Search banks when search query changes (debounced)
  useEffect(() => {
    if (isAddBankModalOpen) {
      fetchBanks(debouncedBankSearch || undefined);
    }
  }, [debouncedBankSearch, isAddBankModalOpen, fetchBanks]);

  // Close bank dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        bankDropdownRef.current &&
        !bankDropdownRef.current.contains(event.target as Node)
      ) {
        setShowBankDropdown(false);
      }
    };

    if (showBankDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showBankDropdown]);

  // OTP countdown timer
  useEffect(() => {
    if (otpCountdown > 0) {
      const timer = setTimeout(() => {
        setOtpCountdown(otpCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [otpCountdown]);

  useEffect(() => {
    if (changePassOtpCountdown > 0) {
      const timer = setTimeout(() => {
        setChangePassOtpCountdown(changePassOtpCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [changePassOtpCountdown]);

  // Handle edit mode toggle
  const handleEditToggle = () => {
    if (isEditMode) {
      // Cancel edit - reset form data
      if (profile) {
        setFormData({
          firstName: profile.firstName || "",
          lastName: profile.lastName || "",
          phoneNumber: profile.phoneNumber || "",
          dateOfBirth: profile.dateOfBirth
            ? profile.dateOfBirth.split("T")[0]
            : "",
          location: profile.location || "",
        });
      }
      setAvatarFile(null);
      setAvatarPreview(null);
    }
    setIsEditMode(!isEditMode);
  };

  // Handle avatar file selection
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        showToast("Vui lòng chọn file ảnh", "error");
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showToast("Kích thước file không được vượt quá 5MB", "error");
        return;
      }
      setAvatarFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form input change
  const handleInputChange = (
    field: keyof UpdatePersonalProfileRequest,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Handle save profile
  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);

      // Prepare update request
      const updateRequest: UpdatePersonalProfileRequest = {
        firstName: formData.firstName || undefined,
        lastName: formData.lastName || undefined,
        phoneNumber: formData.phoneNumber || undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
        location: formData.location || undefined,
      };

      // Call API
      const updatedProfile = await userService.updatePersonalProfile(
        updateRequest,
        avatarFile || undefined
      );

      // Update state
      setProfile(updatedProfile);
      setIsEditMode(false);
      setAvatarFile(null);
      setAvatarPreview(null);

      showToast("Cập nhật profile thành công!", "success");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      showToast(error.message || "Không thể cập nhật profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordBlur = () => {
    if (!currentPassword && !newPassword) {
      showToast("Vui lòng nhập mật khẩu!", "error");
    } else if (currentPassword.length < 6 && newPassword.length < 6) {
      showToast("Mật khẩu phải có ít nhất 6 ký tự!", "error");
    }
  };

  const handleCloseMotion = () => {
    setConfirmPassword("");
    setCurrentPassword("");
    setNewPassword("");
    setChangePasswordOtp("");
    setChangePassOtpCountdown(0);
    setIsChangePassOpen(false);
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword || !changePasswordOtp) {
      showToast("Vui lòng nhập đầy đủ thông tin", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("Xác nhận mật khẩu không khớp", "error");
      return;
    }
    if (newPassword.length < 6) {
      showToast("Mật khẩu mới phải có ít nhất 6 ký tự", "error");
      return;
    }

    setIsLoading(true);
    try {
      const res = await changePassword(
        currentPassword,
        newPassword,
        confirmPassword,
        changePasswordOtp
      );

      console.log("Change password result:", res);

      if (res.success) {
        const successMessage = res.message || "Đổi mật khẩu thành công!";
        console.log("Showing success message:", successMessage);
        showToast(successMessage);
        setIsChangePassOpen(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setChangePasswordOtp("");
      } else {
        showToast(res.message || "Đổi mật khẩu thất bại", "error");
      }
    } catch (error: any) {
      console.error("Error changing password:", error);
      showToast(error.message || "Có lỗi xảy ra khi đổi mật khẩu", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Bank account handlers
  const handleBankSelect = (bank: BankResponse) => {
    setSelectedBank(bank);
    setShowBankDropdown(false);
    setBankSearchQuery(bank.name);
  };

  const handleSendOtp = async () => {
    if (!selectedBank) {
      showToast("Vui lòng chọn ngân hàng", "error");
      return;
    }
    if (!bankFormData.accountNumber || !bankFormData.accountHolderName) {
      showToast("Vui lòng nhập đầy đủ thông tin tài khoản", "error");
      return;
    }

    setIsSendingOtp(true);
    try {
      const request: SendBankAccountOtpRequest = {
        bankId: selectedBank.id,
        accountNumber: bankFormData.accountNumber,
        accountHolderName: bankFormData.accountHolderName,
      };
      await userBankService.sendBankAccountOtp(request);
      showToast("Mã OTP đã được gửi thành công tới email", "success");
      setOtpCountdown(30);
    } catch (error: any) {
      console.error("Error sending OTP:", error);
      showToast(error.response?.data?.message || "Không thể gửi mã OTP", "error");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleAddBankAccount = async () => {
    if (!selectedBank) {
      showToast("Vui lòng chọn ngân hàng", "error");
      return;
    }
    if (!bankFormData.accountNumber || !bankFormData.accountHolderName || !bankFormData.otp) {
      showToast("Vui lòng nhập đầy đủ thông tin", "error");
      return;
    }

    setIsSubmittingBank(true);
    try {
      const request: AddBankAccountRequest = {
        bankId: selectedBank.id,
        accountNumber: bankFormData.accountNumber,
        accountHolderName: bankFormData.accountHolderName,
        otp: bankFormData.otp,
      };
      await userBankService.addBankAccount(request);
      showToast("Thêm thông tin ngân hàng thành công", "success");
      setIsAddBankModalOpen(false);
      setBankFormData({
        accountNumber: "",
        accountHolderName: "",
        otp: "",
      });
      setSelectedBank(null);
      setBankSearchQuery("");
      // Refresh bank accounts list
      const accounts = await userBankService.getUserBanks();
      setBankAccounts(accounts);
    } catch (error: any) {
      console.error("Error adding bank account:", error);
      showToast(error.response?.data?.message || "Không thể thêm thông tin ngân hàng", "error");
    } finally {
      setIsSubmittingBank(false);
    }
  };

  const handleSendChangePassOtp = async () => {
    setIsSendingChangePassOtp(true);
    try {
      const res = await sendOtpChangePassword();
      if (res.success) {
        showToast(res.message || "Mã OTP đã được gửi tới email", "success");
        setChangePassOtpCountdown(30);
      } else {
        showToast(res.message || "Không thể gửi OTP", "error");
      }
    } catch (error: any) {
      console.error("Error sending change password OTP:", error);
      showToast(error.message || "Không thể gửi OTP", "error");
    } finally {
      setIsSendingChangePassOtp(false);
    }
  };

  const handleDeleteBankAccount = async () => {
    if (!bankToDelete) return;

    try {
      await userBankService.deleteUserBank(bankToDelete);
      showToast("Xóa thông tin ngân hàng thành công", "success");
      setIsDeleteBankModalOpen(false);
      setBankToDelete(null);
      // Refresh bank accounts list
      const accounts = await userBankService.getUserBanks();
      setBankAccounts(accounts);
    } catch (error: any) {
      console.error("Error deleting bank account:", error);
      showToast(error.response?.data?.message || "Không thể xóa thông tin ngân hàng", "error");
    }
  };

  const openDeleteModal = (bankAccountId: number) => {
    setBankToDelete(bankAccountId);
    setIsDeleteBankModalOpen(true);
  };

  const closeAddBankModal = () => {
    setIsAddBankModalOpen(false);
    setBankFormData({
      accountNumber: "",
      accountHolderName: "",
      otp: "",
    });
    setSelectedBank(null);
    setBankSearchQuery("");
    setShowBankDropdown(false);
    setOtpCountdown(0);
  };

  return (
    <div className="relative min-h-screen overflow-hidden text-white font-sans bg-gradient-to-br from-[#030014] via-[#0a0026] to-[#15002e]">
      {/* 🌌 Animated stars background */}
      <AnimatedBackground />

      {/* ✨ Cosmic particle overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 40 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-gradient-to-r from-purple-500/30 to-pink-500/30 opacity-40 blur-sm"
            initial={{
              top: Math.random() * 100 + "%",
              left: Math.random() * 100 + "%",
              scale: Math.random() * 0.4 + 0.2,
            }}
            animate={{
              y: [0, -8, 0],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: Math.random() * 6 + 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              width: Math.random() * 4 + 2,
              height: Math.random() * 4 + 2,
            }}
          />
        ))}
      </div>

      {/* 🧑‍🚀 MAIN CONTENT */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12 bg-transparent">
        {/* HEADER */}
        <motion.div
          className="relative overflow-hidden mt-7 flex flex-col md:flex-row justify-between items-start md:items-center mb-8 md:mb-10 gap-4 p-4 md:p-6 rounded-xl border border-blue-700/30 bg-[#0D0A1A] shadow-lg shadow-purple-900/20"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <AnimatedBackground />
          <div
            className="absolute top-0 left-0 w-1/4 h-full bg-gradient-to-r 
               from-transparent via-white/10 to-transparent 
               pointer-events-none z-0 
               animate-shimmer-sweep"
            style={{ mixBlendMode: "screen" }}
          ></div>
          <div className="flex-1 z-10">
            {/* TIÊU ĐỀ - MỘT TINH VÂN ÁNH SÁNG */}
            <h1
              className="text-4xl lg:text-5xl font-extrabold 
                 bg-gradient-to-r from-[#8B5CF6] via-[#EC4899] to-[#3B82F6] 
                 bg-clip-text text-transparent 
                 animate-gradient-x 
                 drop-shadow-[0_0_15px_rgba(236,72,153,0.3)]"
            >
              <span className="mr-3 text-white inline-block transform rotate-12">
                <svg
                  className="w-8 h-8 md:w-10 md:h-10 text-yellow-300"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  {/* Custom icon Hành tinh/Vòng tròn âm nhạc (Tùy chọn) */}
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-4-8c0-2.21 1.79-4 4-4s4 1.79 4 4-1.79 4-4 4-4-1.79-4-4zM12 8l4 4-4 4-4-4 4-4z" />
                </svg>
              </span>
              HỒ SƠ PHI HÀNH GIA
            </h1>
            {/* MÔ TẢ - BẢNG ĐIỀU KHIỂN PHỤ */}
            <p className="text-blue-300 mt-2 text-sm md:text-base font-light">
              Quản lý thông tin và xác thực danh tính để kích hoạt **Hệ thống
              Phát sóng PRO**
            </p>
          </div>

          {/* KHỐI NÚT LỆNH - COMMAND MODULE */}
          <div className="flex flex-wrap gap-3 md:gap-4 z-10">
            <button
              onClick={handleEditToggle}
              className={`px-5 py-2.5 rounded-lg transition-all flex items-center gap-2 text-sm font-semibold 
        border ${isEditMode
                  ? "border-red-500 text-red-400 hover:bg-red-500/10" // Màu Cảnh báo/Hủy
                  : "border-blue-500 text-blue-300 hover:bg-blue-500/10" // Màu Lệnh
                }
        shadow-md shadow-black/30 transform hover:scale-[1.02] active:scale-[0.98]
      `}
            >
              {isEditMode ? (
                <>
                  <XCircle className="w-4 h-4 text-red-400" />
                  HỦY BỎ LỆNH
                </>
              ) : (
                <>
                  <Edit className="w-4 h-4 text-blue-300" />
                  CHỈNH SỬA HỆ THỐNG
                </>
              )}
            </button>

            {/* NÚT LƯU (SUBMIT BUTTON) */}
            {isEditMode && (
              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className={`px-6 py-2.5 rounded-lg flex items-center gap-2 text-sm font-bold transition-all 
          shadow-lg shadow-purple-500/30 transform hover:scale-[1.02] active:scale-[0.98]
          ${isSaving
                    ? "bg-purple-800/70 text-gray-400 cursor-not-allowed" // Loading/Disabled
                    : "bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 text-white" // Ready to Save
                  }`}
              >
                <Save className="w-4 h-4" />
                {isSaving ? "ĐANG LƯU DỮ LIỆU..." : "LƯU TRỮ VÀ XÁC NHẬN"}
              </button>
            )}
          </div>
        </motion.div>

        {/* PROFILE CARD - THẺ NHẬN DẠNG PHI HÀNH GIA */}
        <motion.div
          className="relative bg-gradient-to-br from-[#0B0517] via-[#100720] to-[#0D001C] 
             border border-[#6B21A8]/60 rounded-2xl shadow-[0_0_20px_rgba(109,40,217,0.3)] 
             p-6 md:p-8 backdrop-blur-md overflow-hidden text-white"
        >
          <AnimatedBackground />
          {/* Hiệu ứng tia sáng hoặc họa tiết công nghệ mờ ở nền */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            {/* Thêm họa tiết mạch điện/lưới mờ (Ví dụ: dùng CSS hoặc ảnh base64 mờ) */}
            {/* Để đơn giản, tôi sẽ thay thế bg-[url('data:image/svg+xml;base64,...')] bằng một lớp gradient mờ khác */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-[#8B5CF6]/5 to-[#EC4899]/5"></div>
          </div>

          <div className="relative flex flex-col md:flex-row items-center gap-6 z-10">
            <div className="relative w-28 h-28 md:w-32 md:h-32 group flex-shrink-0">
              {/* AVATAR - CỬA SỔ PHI THUYỀN (ĐÃ ÁP DỤNG HIỆU ỨNG MỚI) */}
              <img
                src={
                  avatarPreview ||
                  profile?.avatarUrl ||
                  "https://i.pravatar.cc/150"
                }
                // Border: Dùng ring-glow mạnh mẽ hơn
                className="rounded-full border-4 border-[#3B82F6] shadow-xl 
                   group-hover:border-[#60A5FA] transition-all duration-300 
                   w-28 h-28 md:w-32 md:h-32 object-cover 
                   ring-4 ring-offset-4 ring-offset-[#100720] ring-[#6B21A8]/50
                   animate-hologram-glitch transform group-hover:scale-[1.03]" // <-- Đã thay đổi animation
                alt="avatar"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://i.pravatar.cc/150";
                }}
              />

              {/* HIỆU ỨNG CHỈNH SỬA - KHAY NẠP DỮ LIỆU */}
              {isEditMode && (
                <>
                  <div className="absolute inset-0 flex items-center justify-center bg-purple-900/70 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    <Upload className="w-6 h-6 text-pink-300 shadow-text-glow-pink" />
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                  />
                </>
              )}

              {/* HUY HIỆU XÁC THỰC - BIỂU TƯỢNG VỆ TINH (ĐÃ BỔ SUNG HIỆU ỨNG) */}
              {profile?.isVerified && (
                <span
                  className="absolute bottom-[-4px] right-[-4px] w-7 h-7 md:w-8 md:h-8 
                     bg-green-500 rounded-full 
                     border-4 border-[#100720] z-30 
                     flex items-center justify-center shadow-lg shadow-green-500/50
                     animate-badge-pulse" // <-- BỔ SUNG: Animation cho huy hiệu
                  title="Đã xác thực danh tính"
                >
                  <CheckCircle className="w-4 h-4 text-white" />
                </span>
              )}
            </div>

            {/* KHU VỰC THÔNG TIN */}
            <div className="flex-1 w-full text-center md:text-left">
              {isLoadingProfile ? (
                <div className="space-y-3">
                  {/* Tên */}
                  <div className="h-7 bg-[#2A1D42] rounded-lg animate-pulse w-3/5 shadow-inner shadow-black/50" />
                  {/* Email */}
                  <div className="h-5 bg-[#2A1D42] rounded-lg animate-pulse w-4/5 shadow-inner shadow-black/50" />
                  {/* Badges */}
                  <div className="flex gap-3 mt-4 justify-center md:justify-start">
                    <div className="h-5 bg-[#2A1D42] rounded-full animate-pulse w-24" />
                    <div className="h-5 bg-[#2A1D42] rounded-full animate-pulse w-32" />
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    {/* Tên - MÃ ĐỊNH DANH PHI HÀNH GIA */}
                    <h2
                      className="text-3xl font-extrabold mb-1 text-transparent 
                     bg-clip-text bg-gradient-to-r from-white to-purple-300 
                     drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]" // <-- BỔ SUNG: Hiệu ứng phát sáng nhẹ cho tên
                    >
                      {profile
                        ? `${profile.firstName} ${profile.lastName}`
                        : "Đang tải mã định danh..."}
                    </h2>

                    {/* Email - TẦN SỐ LIÊN LẠC */}
                    <p className="text-blue-400 text-sm mb-3 font-mono opacity-90">
                      {" "}
                      {/* <-- Sửa màu/opacity để dễ đọc hơn */}
                      {profile?.email || "Chưa cập nhật tần số liên lạc"}
                    </p>

                    {/* BADGES - PHÂN LOẠI NHIỆM VỤ */}
                    <div className="flex flex-wrap gap-3 mt-4 justify-center md:justify-start">
                      {profile?.role && (
                        <span
                          className="px-3.5 py-1.5 text-xs font-semibold rounded-full 
                          bg-pink-500/20 text-pink-300 border border-pink-500/50 
                          shadow-lg shadow-pink-500/30 uppercase tracking-widest" // <-- Sửa shadow mạnh hơn
                        >
                          {profile.role === "PRODUCER"
                            ? "KỸ SƯ ÂM THANH"
                            : profile.role}
                        </span>
                      )}

                      {profile?.isVerified ? (
                        <span
                          className="px-3.5 py-1.5 text-xs font-semibold rounded-full 
                          bg-green-600/20 text-green-300 border border-green-600/50 
                          flex items-center gap-1.5 shadow-lg shadow-green-600/30" // <-- Sửa shadow mạnh hơn
                        >
                          <CheckCircle className="w-4 h-4" />
                          HỆ THỐNG XÁC THỰC OK
                        </span>
                      ) : (
                        <span
                          className="px-3.5 py-1.5 text-xs font-semibold rounded-full 
                          bg-yellow-600/20 text-yellow-300 border border-yellow-600/50 
                          flex items-center gap-1.5 shadow-lg shadow-yellow-600/30" // <-- Sửa shadow mạnh hơn
                        >
                          <AlertCircle className="w-4 h-4" />
                          CHỜ XÁC THỰC HỆ THỐNG
                        </span>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* GRID SECTION */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-8 mt-8 md:mt-10">
          {/* LEFT SECTION */}
          <div className="md:col-span-2 space-y-8">
            {/* THÔNG TIN CÁ NHÂN */}
            <motion.div
              // Container: Màu tối sâu hơn, border neon, hover scale/shadow mạnh mẽ hơn
              className="p-6 rounded-xl relative 
               bg-[#0F081C]/80 border border-purple-600/50 
               shadow-lg shadow-purple-900/20 
               hover:border-purple-500/80 hover:shadow-purple-700/30 
               transition-all duration-500 transform hover:scale-[1.01]"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <AnimatedBackground />
              {/* TIÊU ĐỀ - HIỂN THỊ DỮ LIỆU */}
              <h3
                className="text-pink-400 font-bold text-xl mb-6 flex items-center gap-3 
                   drop-shadow-[0_0_8px_rgba(236,72,153,0.3)]"
              >
                {" "}
                {/* Neon glow cho tiêu đề */}
                <UserCheck className="w-6 h-6 text-blue-400" />{" "}
                {/* Thay đổi màu icon */}
                Xác thực Dữ liệu cá nhân
              </h3>

              {/* LOADER - DATA SCANNING EFFECT */}
              {isLoadingProfile ? (
                <div className="space-y-4">
                  <div className="h-5 bg-purple-900/40 rounded animate-pulse w-full" />
                  <div className="h-5 bg-purple-900/40 rounded animate-pulse w-5/6" />
                  <div className="h-5 bg-purple-900/40 rounded animate-pulse w-full" />
                </div>
              ) : (
                /* HIỂN THỊ DỮ LIỆU */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  {/* Field 1: Email (Tần số) */}
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    className="pb-2 border-b border-blue-500/30" // Hiệu ứng border dưới làm data display
                  >
                    <p className="text-blue-400 text-xs font-semibold mb-1 uppercase tracking-widest">
                      Email (Tần số liên lạc)
                    </p>
                    <p className="text-white font-mono text-base">
                      {profile?.email || "Cần nhập tần số"}
                    </p>
                  </motion.div>

                  {/* Field 2: Số điện thoại (Mã tuyến đường) */}
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                    className="pb-2 border-b border-pink-500/30"
                  >
                    <p className="text-pink-400 text-xs font-semibold mb-1 uppercase tracking-widest">
                      Số điện thoại (Mã tuyến đường)
                    </p>
                    <p className="text-white font-mono text-base">
                      {profile?.phoneNumber || "Cần nhập mã"}
                    </p>
                  </motion.div>

                  {/* Field 3: Ngày sinh (Thời gian kích hoạt) */}
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.5 }}
                    className="pb-2 border-b border-purple-500/30"
                  >
                    <p className="text-purple-400 text-xs font-semibold mb-1 uppercase tracking-widest">
                      Ngày sinh (Thời gian kích hoạt)
                    </p>
                    <p className="text-white font-mono text-base">
                      {profile?.dateOfBirth
                        ? new Date(profile.dateOfBirth).toLocaleDateString(
                          "vi-VN"
                        )
                        : "Cần xác định thời gian"}
                    </p>
                  </motion.div>

                  {/* Field 4: Địa điểm (Tọa độ hiện tại) */}
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.6 }}
                    className="pb-2 border-b border-cyan-500/30"
                  >
                    <p className="text-cyan-400 text-xs font-semibold mb-1 uppercase tracking-widest">
                      Địa điểm (Tọa độ hiện tại)
                    </p>
                    <p className="text-white font-mono text-base">
                      {profile?.location || "Tọa độ chưa xác định"}
                    </p>
                  </motion.div>
                </div>
              )}
            </motion.div>

            {/* THÔNG TIN CCCD - MODULE XÁC THỰC DANH TÍNH */}
            <motion.div
              // Container: Màu tối sâu hơn, border neon, hover scale/shadow mạnh mẽ hơn
              className="p-6 rounded-xl relative 
               bg-[#0F081C]/80 border border-purple-600/50 
               shadow-lg shadow-purple-900/20 
               hover:border-purple-500/80 hover:shadow-purple-700/30 
               transition-all duration-500 transform hover:scale-[1.01]"
              initial={{ opacity: 0, x: -20 }} // Hiệu ứng trượt từ trái vào
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <AnimatedBackground />
              {/* TIÊU ĐỀ - MÀN HÌNH BẢO MẬT */}
              <h3
                className="text-pink-400 font-bold text-xl mb-6 flex items-center gap-3 
                   drop-shadow-[0_0_8px_rgba(236,72,153,0.3)]"
              >
                <Shield className="w-6 h-6 text-yellow-400" />{" "}
                {/* Icon Bảo vệ/Bảo mật */}
                Mã ID Căn cước (Lớp Bảo mật Cấp 1)
              </h3>

              {/* LOADER - DATA SCANNING EFFECT */}
              {isLoadingProfile ? (
                <div className="space-y-4">
                  <div className="h-5 bg-purple-900/40 rounded animate-pulse w-full" />
                  <div className="h-5 bg-purple-900/40 rounded animate-pulse w-5/6" />
                </div>
              ) : (
                <>
                  {profile?.isVerified ? (
                    /* TRẠNG THÁI: ĐÃ XÁC THỰC (APPROVED) */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                      {/* Field 1: Số CCCD (Mã Định danh) */}
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.4 }}
                        className="pb-2 border-b border-green-500/30" // Màu xanh lá cây cho trạng thái approved
                      >
                        <p className="text-green-400 text-xs font-semibold mb-1 uppercase tracking-widest">
                          Mã Định danh (CCCD)
                        </p>
                        {/* Dữ liệu số nên dùng font-mono để trông giống mã số */}
                        <p className="text-white font-mono text-base">
                          {profile?.cccdNumber || "ID NOT FOUND"}
                        </p>
                      </motion.div>

                      {/* Field 2: Ngày cấp (Thời gian phê duyệt) */}
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.5 }}
                        className="pb-2 border-b border-green-500/30"
                      >
                        <p className="text-green-400 text-xs font-semibold mb-1 uppercase tracking-widest">
                          Thời gian Phê duyệt (Ngày cấp)
                        </p>
                        <p className="text-white font-medium text-base">
                          {profile?.cccdIssueDate || "N/A - Lỗi dữ liệu"}
                        </p>
                      </motion.div>

                      {/* Field 3: Nơi cấp (Trung tâm đăng ký) */}
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.6 }}
                        className="md:col-span-2 pb-2 border-b border-green-500/30"
                      >
                        <p className="text-green-400 text-xs font-semibold mb-1 uppercase tracking-widest">
                          Trung tâm Đăng ký (Nơi cấp)
                        </p>
                        <p className="text-white font-medium text-base">
                          {profile?.cccdIssuePlace || "N/A - Lỗi dữ liệu"}
                        </p>
                      </motion.div>

                      {/* MESSAGE XÁC THỰC THÀNH CÔNG */}
                      <div className="md:col-span-2 mt-4 flex items-center justify-center text-center p-3 rounded-lg bg-green-900/40 border border-green-600/50 shadow-md shadow-green-500/20">
                        <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                        <p className="text-green-300 text-sm font-medium uppercase tracking-wider">
                          TRẠNG THÁI: ĐÃ KÍCH HOẠT VÀ XÁC THỰC HOÀN TOÀN
                        </p>
                      </div>
                    </div>
                  ) : (
                    /* TRẠNG THÁI: CHƯA XÁC THỰC (PENDING/DENIED) */
                    <div className="text-center py-8 p-4 rounded-xl border-2 border-yellow-500/50 bg-yellow-900/10 shadow-lg shadow-yellow-900/20">
                      <AlertTriangle className="w-12 h-12 text-yellow-400/80 mx-auto mb-4 animate-pulse" />{" "}
                      {/* Dùng AlertTriangle và thêm pulse */}
                      <p className="text-yellow-300 text-base font-semibold mb-2">
                        CẢNH BÁO: CHƯA XÁC THỰC LỚP BẢO MẬT
                      </p>
                      <p className="text-gray-400 text-sm">
                        Thông tin CCCD chưa được cung cấp hoặc đang chờ phê
                        duyệt từ Hệ thống. Vui lòng xác thực để nâng cấp quyền
                        truy cập.
                      </p>
                    </div>
                  )}
                </>
              )}
            </motion.div>

            {/* THÔNG TIN NGÂN HÀNG */}
            <motion.div
              className="p-6 rounded-xl relative 
               bg-[#0F081C]/80 border border-purple-600/50 
               shadow-lg shadow-purple-900/20 
               hover:border-purple-500/80 hover:shadow-purple-700/30 
               transition-all duration-500 transform hover:scale-[1.01]"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <AnimatedBackground />
              <div className="flex items-center justify-between mb-6">
                <h3
                  className="text-pink-400 font-bold text-xl flex items-center gap-3 
                     drop-shadow-[0_0_8px_rgba(236,72,153,0.3)]"
                >
                  <CreditCard className="w-6 h-6 text-blue-400" />
                  Thông tin Ngân hàng
                </h3>
                <button
                  onClick={() => setIsAddBankModalOpen(true)}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 
                     hover:from-blue-500 hover:to-cyan-500 transition-all text-sm font-medium 
                     shadow-lg shadow-blue-500/20 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Thêm ngân hàng
                </button>
              </div>

              {isLoadingBanks ? (
                <div className="space-y-4">
                  <div className="h-20 bg-purple-900/40 rounded animate-pulse w-full" />
                  <div className="h-20 bg-purple-900/40 rounded animate-pulse w-full" />
                </div>
              ) : bankAccounts.length === 0 ? (
                <div className="text-center py-8 p-4 rounded-xl border-2 border-blue-500/50 bg-blue-900/10">
                  <CreditCard className="w-12 h-12 text-blue-400/80 mx-auto mb-4" />
                  <p className="text-blue-300 text-base font-semibold mb-2">
                    Chưa có thông tin ngân hàng
                  </p>
                  <p className="text-gray-400 text-sm">
                    Thêm thông tin ngân hàng để thuận tiện cho việc rút tiền
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bankAccounts.map((account) => (
                    <motion.div
                      key={account.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-lg border border-purple-500/30 bg-[#1A0D33]/50 
                         hover:border-purple-400/50 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {account.bank.logoUrl ? (
                              <img
                                src={account.bank.logoUrl}
                                alt={account.bank.name}
                                className="w-8 h-8 rounded object-contain"
                              />
                            ) : (
                              <Building2 className="w-8 h-8 text-purple-400" />
                            )}
                            <div>
                              <p className="text-white font-semibold text-base">
                                {account.bank.name}
                              </p>
                              <p className="text-gray-400 text-xs">
                                {account.bank.code}
                              </p>
                            </div>
                          </div>
                          <div className="mt-3 space-y-1">
                            <p className="text-gray-300 text-sm">
                              <span className="text-purple-400">Số tài khoản:</span>{" "}
                              {account.accountNumber}
                            </p>
                            <p className="text-gray-300 text-sm">
                              <span className="text-purple-400">Chủ tài khoản:</span>{" "}
                              {account.accountHolderName}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              {account.isVerified ? (
                                <span className="px-2 py-1 text-xs rounded-full bg-green-600/20 text-green-300 border border-green-600/50 flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3" />
                                  Đã xác thực
                                </span>
                              ) : (
                                <span className="px-2 py-1 text-xs rounded-full bg-yellow-600/20 text-yellow-300 border border-yellow-600/50 flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" />
                                  Chưa xác thực
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => openDeleteModal(account.id)}
                          className="ml-4 p-2 rounded-lg text-red-400 hover:bg-red-500/10 
                             hover:text-red-300 transition-all"
                          title="Xóa ngân hàng"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="space-y-8">
            {/* CÀI ĐẶT */}
            {/* CÀI ĐẶT HỒ SƠ - BẢNG ĐIỀU KHIỂN NHẬP LIỆU */}
            <motion.div
              // Container: Giống các module trước, thêm animation
              className="p-6 rounded-xl relative 
               bg-[#0F081C]/80 border border-purple-600/50 
               shadow-lg shadow-purple-900/20 
               hover:border-purple-500/80 hover:shadow-purple-700/30 
               transition-all duration-500 transform hover:scale-[1.01]"
              initial={{ opacity: 0, y: 20 }} // Trượt nhẹ từ dưới lên
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <AnimatedBackground />
              {/* TIÊU ĐỀ - MÀN HÌNH CHỈNH SỬA DỮ LIỆU */}
              <h3
                className="text-pink-400 font-bold text-xl mb-6 flex items-center gap-3 
                   drop-shadow-[0_0_8px_rgba(236,72,153,0.3)]"
              >
                <Edit className="w-6 h-6 text-blue-400" />
                Hiệu chỉnh Mã Định danh Chiến dịch
              </h3>

              <div className="space-y-4">
                {" "}
                {/* Tăng khoảng cách giữa các trường */}
                {/* Trường Họ (FIRST NAME) */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <label className="block text-xs text-blue-400/90 mb-1.5 font-semibold uppercase tracking-widest">
                    Mã Dữ liệu: Họ
                  </label>
                  <input
                    type="text"
                    placeholder="Họ của bạn"
                    value={formData.firstName || ""}
                    onChange={(e) =>
                      handleInputChange("firstName", e.target.value)
                    }
                    disabled={!isEditMode}
                    // Styling mới: Nền tối, font mono, hiệu ứng focus neon
                    className="w-full bg-[#1A0D33] px-4 py-2.5 rounded-lg border border-purple-700/50 
                           focus:border-blue-400 focus:ring-2 focus:ring-blue-500/50 
                           transition text-sm text-white font-mono 
                           disabled:opacity-40 disabled:cursor-not-allowed disabled:border-gray-700"
                  />
                </motion.div>
                {/* Trường Tên (LAST NAME) */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <label className="block text-xs text-blue-400/90 mb-1.5 font-semibold uppercase tracking-widest">
                    Mã Dữ liệu: Tên
                  </label>
                  <input
                    type="text"
                    placeholder="Tên của bạn"
                    value={formData.lastName || ""}
                    onChange={(e) =>
                      handleInputChange("lastName", e.target.value)
                    }
                    disabled={!isEditMode}
                    className="w-full bg-[#1A0D33] px-4 py-2.5 rounded-lg border border-purple-700/50 
                           focus:border-blue-400 focus:ring-2 focus:ring-blue-500/50 
                           transition text-sm text-white font-mono 
                           disabled:opacity-40 disabled:cursor-not-allowed disabled:border-gray-700"
                  />
                </motion.div>
                {/* Trường Số điện thoại (CONTACT FREQUENCY) */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  <label className="block text-xs text-pink-400/90 mb-1.5 font-semibold uppercase tracking-widest">
                    Tần số Liên lạc
                  </label>
                  <input
                    type="text"
                    placeholder="Mã số liên lạc ưu tiên"
                    value={formData.phoneNumber || ""}
                    onChange={(e) =>
                      handleInputChange("phoneNumber", e.target.value)
                    }
                    disabled={!isEditMode}
                    className="w-full bg-[#1A0D33] px-4 py-2.5 rounded-lg border border-purple-700/50 
                           focus:border-pink-400 focus:ring-2 focus:ring-pink-500/50 
                           transition text-sm text-white font-mono 
                           disabled:opacity-40 disabled:cursor-not-allowed disabled:border-gray-700"
                  />
                </motion.div>
                {/* Trường Ngày sinh (ACTIVATION DATE) */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <label className="block text-xs text-pink-400/90 mb-1.5 font-semibold uppercase tracking-widest">
                    Ngày Kích hoạt
                  </label>
                  <input
                    type="date"
                    value={formData.dateOfBirth || ""}
                    onChange={(e) =>
                      handleInputChange("dateOfBirth", e.target.value)
                    }
                    disabled={!isEditMode}
                    // Dùng màu nền tím sâu hơn cho input date để phân biệt
                    className="w-full bg-[#1A0D33] px-4 py-2.5 rounded-lg border border-purple-700/50 
                           focus:border-pink-400 focus:ring-2 focus:ring-pink-500/50 
                           transition text-sm text-white font-mono 
                           disabled:opacity-40 disabled:cursor-not-allowed disabled:border-gray-700"
                  />
                </motion.div>
                {/* Trường Địa điểm (CURRENT COORDINATE) */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                >
                  <label className="block text-xs text-cyan-400/90 mb-1.5 font-semibold uppercase tracking-widest">
                    Tọa độ Hiện tại
                  </label>
                  <input
                    type="text"
                    placeholder="Tọa độ không gian"
                    value={formData.location || ""}
                    onChange={(e) =>
                      handleInputChange("location", e.target.value)
                    }
                    disabled={!isEditMode}
                    className="w-full bg-[#1A0D33] px-4 py-2.5 rounded-lg border border-purple-700/50 
                           focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/50 
                           transition text-sm text-white font-mono 
                           disabled:opacity-40 disabled:cursor-not-allowed disabled:border-gray-700"
                  />
                </motion.div>
                {/* Trường Email (READ-ONLY) */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.0 }}
                >
                  <label className="block text-xs text-gray-500 mb-1.5 font-semibold uppercase tracking-widest">
                    Kênh ID Gốc (Email)
                  </label>
                  <input
                    type="text"
                    placeholder="Email"
                    value={profile?.email || "ID Không khả dụng"}
                    disabled
                    className="w-full bg-[#1A0D33] px-4 py-2.5 rounded-lg border border-gray-700/50 
                           transition text-sm opacity-50 cursor-not-allowed text-gray-400 font-mono"
                  />
                </motion.div>
              </div>
            </motion.div>

            {/* BẢO MẬT */}
            {/* BẢO MẬT & TÀI KHOẢN - MODULE KÍCH HOẠT BẢO MẬT */}
            <motion.div
              // Container: Giống các module trước, thêm animation
              className="p-6 rounded-xl relative 
               bg-[#0F081C]/80 border border-purple-600/50 
               shadow-lg shadow-purple-900/20 
               hover:border-purple-500/80 hover:shadow-purple-700/30 
               transition-all duration-500 transform hover:scale-[1.01]"
              initial={{ opacity: 0, scale: 0.9 }} // Hiệu ứng xuất hiện từ từ và phóng to
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <AnimatedBackground />
              {/* TIÊU ĐỀ - BẢNG ĐIỀU KHIỂN BẢO MẬT CẤP CAO */}
              <h3
                className="text-pink-400 font-bold text-xl mb-4 flex items-center gap-3 
                   drop-shadow-[0_0_8px_rgba(236,72,153,0.3)]"
              >
                <Shield className="w-6 h-6 text-pink-400" />
                Bảo mật Cấp Cao
              </h3>

              {/* MÔ TẢ - HƯỚNG DẪN VẬN HÀNH */}
              <p className="text-sm text-gray-300 mb-6 leading-normal border-l-2 border-pink-500/50 pl-3">
                Đổi mật khẩu để giữ an toàn cho tài khoản của bạn.
              </p>

              {/* NÚT KÍCH HOẠT QUAN TRỌNG */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsChangePassOpen(true)}
                // Styling Nút: Gradient mạnh, shadow neon, hiệu ứng hover
                className="w-full px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 
                   hover:from-cyan-400 hover:to-blue-500 transition-all 
                   text-base font-extrabold text-white 
                   shadow-[0_0_15px_rgba(56,189,248,0.5)] 
                   hover:shadow-[0_0_20px_rgba(56,189,248,0.7)] uppercase tracking-wider"
              >
                THAY ĐỔI MẬT KHẨU
              </motion.button>
            </motion.div>

            {/* TRẠNG THÁI XÁC THỰC */}
            <motion.div className="p-6 rounded-xl bg-[#141026]/70 border border-purple-800/50 hover:border-purple-700/70 transition-all">
              <AnimatedBackground />
              <h3 className="text-purple-300 font-semibold mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Trạng thái xác thực
              </h3>
              {isLoadingProfile ? (
                <div className="h-20 bg-gray-700/50 rounded-lg animate-pulse" />
              ) : (
                <>
                  {profile?.isVerified ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-green-400">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-semibold text-sm">
                          Đã xác thực
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        Tài khoản của bạn đã được xác thực thành công. Bạn có
                        thể xác thực lại nếu đã cập nhật CCCD mới.
                      </p>
                      <button
                        onClick={() => navigate(ROUTER.USER.VERIFY_CCCD)}
                        className="w-full px-4 py-2.5 rounded-lg border border-purple-500/50 hover:bg-purple-500/10 hover:border-purple-400 transition-all text-sm font-medium"
                      >
                        Xác thực lại
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-yellow-400">
                        <AlertCircle className="w-5 h-5" />
                        <span className="font-semibold text-sm">
                          Chưa xác thực
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        Vui lòng xác thực thông tin căn cước công dân để sử dụng
                        đầy đủ các tính năng của hệ thống.
                      </p>
                      <button
                        onClick={() => navigate(ROUTER.USER.VERIFY_CCCD)}
                        className="w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 transition-all text-sm font-medium shadow-lg shadow-blue-500/20"
                      >
                        Xác thực ngay
                      </button>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </div>
        </div>
      </main>

      {/* 🔐 MODAL ĐỔI MẬT KHẨU */}
      <AnimatePresence>
        {isChangePassOpen && (
          <motion.div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm p-4">
            <motion.div
              // Điều chỉnh background, border, shadow cho modal chính
              className="bg-gradient-to-br from-[#0A0F1A] to-[#1A0A2E] p-8 rounded-2xl w-full max-w-lg border border-[#3C076D] shadow-2xl shadow-[#1A0A2E]/70 text-gray-100 relative overflow-hidden"
            >
              {/* Hiệu ứng sao lấp lánh nhẹ nhàng ở góc (hoặc có thể dùng pseudo-elements) */}
              <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
                <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full animate-pulse-slow"></div>
                <div className="absolute bottom-1/3 right-1/3 w-1.5 h-1.5 bg-yellow-300 rounded-full animate-pulse-medium"></div>
                <div className="absolute top-1/2 right-1/5 w-0.5 h-0.5 bg-blue-300 rounded-full animate-pulse-fast"></div>
              </div>

              <div className="flex justify-between items-start mb-6 z-10 relative">
                {/* Tiêu đề chính của modal */}
                <div className="flex items-center space-x-3">
                  <Lock className="w-8 h-8 text-[#FFD700] shadow-text-glow-yellow" />{" "}
                  {/* Icon khóa vũ trụ */}
                  <h3 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-[#E0B0FF] tracking-wide leading-tight">
                    BẢO MẬT VŨ TRỤ
                  </h3>
                </div>
                <button
                  onClick={handleCloseMotion}
                  className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#E0B0FF]"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <p className="text-sm text-gray-400 mb-6 z-10 relative">
                Đảm bảo phi thuyền của bạn an toàn trong hành trình khám phá âm
                nhạc không giới hạn.
              </p>

              <div className="space-y-5 z-10 relative">
                <div>
                  <label className="block text-xs text-gray-300 mb-1.5 font-medium flex items-center">
                    <Key className="w-4 h-4 mr-2 text-[#9333EA]" /> Mật khẩu
                    Hiện tại
                  </label>
                  <input
                    type="password"
                    placeholder="Nhập mật khẩu hiện tại"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    onBlur={handlePasswordBlur}
                    // Điều chỉnh input field
                    className="w-full bg-[#1A0A2E] px-4 py-2.5 rounded-lg border border-[#4A0E7E] focus:border-[#E0B0FF] focus:ring-2 focus:ring-[#E0B0FF]/40 transition duration-200 text-base text-gray-200 placeholder-gray-500 shadow-inner shadow-black/20"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-300 mb-1.5 font-medium flex items-center">
                    <Rocket className="w-4 h-4 mr-2 text-[#8B5CF6]" /> Mật khẩu
                    Mới (Khởi hành đến galaxy mới)
                  </label>
                  <input
                    type="password"
                    placeholder="Nhập mật khẩu mới"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    onBlur={handlePasswordBlur}
                    className="w-full bg-[#1A0A2E] px-4 py-2.5 rounded-lg border border-[#4A0E7E] focus:border-[#E0B0FF] focus:ring-2 focus:ring-[#E0B0FF]/40 transition duration-200 text-base text-gray-200 placeholder-gray-500 shadow-inner shadow-black/20"
                  />
                  <p className="text-xs text-gray-500 mt-1.5">
                    Tối thiểu 8 ký tự, bao gồm chữ hoa, chữ thường và số.
                  </p>
                </div>
                <div>
                  <label className="block text-xs text-gray-300 mb-1.5 font-medium flex items-center">
                    <Lock className="w-4 h-4 mr-2 text-[#3B82F6]" /> Xác nhận
                    Mật khẩu Mới
                  </label>
                  <input
                    type="password"
                    placeholder="Nhập lại mật khẩu mới"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onBlur={handlePasswordBlur}
                    className="w-full bg-[#1A0A2E] px-4 py-2.5 rounded-lg border border-[#4A0E7E] focus:border-[#E0B0FF] focus:ring-2 focus:ring-[#E0B0FF]/40 transition duration-200 text-base text-gray-200 placeholder-gray-500 shadow-inner shadow-black/20"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-300 mb-1.5 font-medium flex items-center">
                    <Shield className="w-4 h-4 mr-2 text-[#10B981]" /> Mã OTP
                    đổi mật khẩu
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Nhập mã OTP"
                      value={changePasswordOtp}
                      onChange={(e) => setChangePasswordOtp(e.target.value)}
                      className="flex-1 bg-[#1A0A2E] px-4 py-2.5 rounded-lg border border-[#4A0E7E] focus:border-[#E0B0FF] focus:ring-2 focus:ring-[#E0B0FF]/40 transition duration-200 text-base text-gray-200 placeholder-gray-500 shadow-inner shadow-black/20"
                    />
                    <button
                      type="button"
                      onClick={handleSendChangePassOtp}
                      disabled={isSendingChangePassOtp || changePassOtpCountdown > 0}
                      className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center space-x-2 ${
                        isSendingChangePassOtp || changePassOtpCountdown > 0
                          ? "bg-slate-700 text-gray-300 cursor-not-allowed"
                          : "bg-gradient-to-r from-[#0EA5E9] to-[#6366F1] hover:from-[#38BDF8] hover:to-[#818CF8] text-white shadow-lg shadow-[#0EA5E9]/30"
                      }`}
                    >
                      {isSendingChangePassOtp ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Shield className="w-4 h-4" />
                      )}
                      <span>
                        {changePassOtpCountdown > 0
                          ? `Gửi lại (${changePassOtpCountdown}s)`
                          : "Gửi OTP"}
                      </span>
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1.5">
                    Mã OTP sẽ được gửi tới email đăng ký của bạn.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8 z-10 relative">
                <button
                  onClick={handleCloseMotion}
                  className="px-5 py-2.5 bg-[#2A1A3E] rounded-lg hover:bg-[#3A2A4E] transition-all text-sm font-medium border border-[#4A0E7E] text-gray-300 shadow-sm hover:shadow-md"
                >
                  Hủy (Rời Trạm Phóng)
                </button>
                <button
                  onClick={handleChangePassword}
                  disabled={isLoading}
                  // Điều chỉnh nút "Lưu"
                  className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center space-x-2 
                                    ${isLoading
                      ? "bg-gradient-to-r from-purple-800/60 to-indigo-800/60 text-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-[#9333EA] to-[#6366F1] hover:from-[#A755F2] hover:to-[#7B83F3] text-white shadow-lg shadow-[#9333EA]/30 hover:shadow-[#A755F2]/40 transform hover:scale-105 active:scale-95 btn-astro-pulse"
                    }`}
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span>Đang Khởi Hành...</span>
                    </>
                  ) : (
                    <>
                      <Rocket className="w-5 h-5" />
                      <span>Khởi Hành (Lưu Mật khẩu)</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL THÊM NGÂN HÀNG */}
      <AnimatePresence>
        {isAddBankModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-[#0A0F1A] to-[#1A0A2E] p-8 rounded-2xl w-full max-w-lg border border-[#3C076D] shadow-2xl shadow-[#1A0A2E]/70 text-gray-100 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
                <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full animate-pulse"></div>
                <div className="absolute bottom-1/3 right-1/3 w-1.5 h-1.5 bg-yellow-300 rounded-full animate-pulse"></div>
              </div>

              <div className="flex justify-between items-start mb-6 z-10 relative">
                <div className="flex items-center space-x-3">
                  <CreditCard className="w-8 h-8 text-[#FFD700]" />
                  <h3 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-[#E0B0FF] tracking-wide">
                    THÊM NGÂN HÀNG
                  </h3>
                </div>
                <button
                  onClick={closeAddBankModal}
                  className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-5 z-10 relative">
                {/* Bank Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Ngân hàng <span className="text-red-400">*</span>
                  </label>
                  <div className="relative" ref={bankDropdownRef}>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={bankSearchQuery}
                        onChange={(e) => {
                          setBankSearchQuery(e.target.value);
                          setShowBankDropdown(true);
                        }}
                        onFocus={() => setShowBankDropdown(true)}
                        placeholder="Tìm kiếm ngân hàng..."
                        className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
                      />
                    </div>

                    {/* Bank Dropdown */}
                    <AnimatePresence>
                      {showBankDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute z-10 w-full mt-2 bg-slate-800 border border-purple-500/30 rounded-lg shadow-xl max-h-60 overflow-y-auto"
                        >
                          {isLoadingBankList ? (
                            <div className="p-4 text-center">
                              <Loader2 className="w-5 h-5 text-purple-400 animate-spin mx-auto" />
                            </div>
                          ) : banks.length === 0 ? (
                            <div className="p-4 text-center text-gray-400">
                              Không tìm thấy ngân hàng
                            </div>
                          ) : (
                            banks.map((bank) => (
                              <button
                                key={bank.id}
                                type="button"
                                onClick={() => handleBankSelect(bank)}
                                className="w-full px-4 py-3 text-left hover:bg-purple-500/20 transition-colors flex items-center gap-3 border-b border-purple-500/10 last:border-b-0"
                              >
                                {bank.logoUrl ? (
                                  <img
                                    src={bank.logoUrl}
                                    alt={bank.name}
                                    className="w-8 h-8 rounded object-contain flex-shrink-0"
                                  />
                                ) : (
                                  <Building2 className="w-8 h-8 text-purple-400 flex-shrink-0" />
                                )}
                                <div>
                                  <div className="text-white font-medium">
                                    {bank.name}
                                  </div>
                                  {bank.shortName && (
                                    <div className="text-sm text-gray-400">
                                      {bank.shortName}
                                    </div>
                                  )}
                                </div>
                              </button>
                            ))
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Account Number */}
                <div>
                  <label className="block text-xs text-gray-300 mb-1.5 font-medium">
                    Số tài khoản
                  </label>
                  <input
                    type="text"
                    placeholder="Nhập số tài khoản"
                    value={bankFormData.accountNumber}
                    onChange={(e) =>
                      setBankFormData({ ...bankFormData, accountNumber: e.target.value })
                    }
                    className="w-full bg-[#1A0A2E] px-4 py-2.5 rounded-lg border border-[#4A0E7E] 
                       focus:border-[#E0B0FF] focus:ring-2 focus:ring-[#E0B0FF]/40 
                       transition text-base text-gray-200 placeholder-gray-500"
                  />
                </div>

                {/* Account Holder Name */}
                <div>
                  <label className="block text-xs text-gray-300 mb-1.5 font-medium">
                    Tên chủ tài khoản
                  </label>
                  <input
                    type="text"
                    placeholder="Nhập tên chủ tài khoản"
                    value={bankFormData.accountHolderName}
                    onChange={(e) =>
                      setBankFormData({ ...bankFormData, accountHolderName: e.target.value })
                    }
                    className="w-full bg-[#1A0A2E] px-4 py-2.5 rounded-lg border border-[#4A0E7E] 
                       focus:border-[#E0B0FF] focus:ring-2 focus:ring-[#E0B0FF]/40 
                       transition text-base text-gray-200 placeholder-gray-500"
                  />
                </div>

                {/* Send OTP Button */}
                <div>
                  <button
                    onClick={handleSendOtp}
                    disabled={!selectedBank || !bankFormData.accountNumber || !bankFormData.accountHolderName || otpCountdown > 0 || isSendingOtp}
                    className={`w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2
                      ${otpCountdown > 0 || isSendingOtp || !selectedBank || !bankFormData.accountNumber || !bankFormData.accountHolderName
                        ? "bg-gray-700/50 text-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-lg shadow-blue-500/20"
                      }`}
                  >
                    {isSendingOtp ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Đang gửi...
                      </>
                    ) : otpCountdown > 0 ? (
                      <>
                        <Clock className="w-4 h-4" />
                        Gửi lại sau {otpCountdown}s
                      </>
                    ) : (
                      <>
                        <Rocket className="w-4 h-4" />
                        Gửi mã OTP
                      </>
                    )}
                  </button>
                </div>

                {/* OTP Input */}
                <div>
                  <label className="block text-xs text-gray-300 mb-1.5 font-medium flex items-center">
                    <Key className="w-4 h-4 mr-2 text-[#9333EA]" /> Mã OTP
                  </label>
                  <input
                    type="text"
                    placeholder="Nhập mã OTP từ email"
                    value={bankFormData.otp}
                    onChange={(e) =>
                      setBankFormData({ ...bankFormData, otp: e.target.value })
                    }
                    className="w-full bg-[#1A0A2E] px-4 py-2.5 rounded-lg border border-[#4A0E7E] 
                       focus:border-[#E0B0FF] focus:ring-2 focus:ring-[#E0B0FF]/40 
                       transition text-base text-gray-200 placeholder-gray-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8 z-10 relative">
                <button
                  onClick={closeAddBankModal}
                  className="px-5 py-2.5 bg-[#2A1A3E] rounded-lg hover:bg-[#3A2A4E] 
                     transition-all text-sm font-medium border border-[#4A0E7E] text-gray-300"
                >
                  Hủy
                </button>
                <button
                  onClick={handleAddBankAccount}
                  disabled={isSubmittingBank || !selectedBank || !bankFormData.accountNumber || !bankFormData.accountHolderName || !bankFormData.otp}
                  className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2
                    ${isSubmittingBank || !selectedBank || !bankFormData.accountNumber || !bankFormData.accountHolderName || !bankFormData.otp
                      ? "bg-purple-800/60 text-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-[#9333EA] to-[#6366F1] hover:from-[#A755F2] hover:to-[#7B83F3] text-white shadow-lg shadow-[#9333EA]/30"
                    }`}
                >
                  {isSubmittingBank ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Lưu
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL XÁC NHẬN XÓA NGÂN HÀNG */}
      <AnimatePresence>
        {isDeleteBankModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-[#0A0F1A] to-[#1A0A2E] p-8 rounded-2xl w-full max-w-md border border-red-500/50 shadow-2xl shadow-red-500/20 text-gray-100 relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-6 z-10 relative">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                  <h3 className="text-2xl font-extrabold text-red-400 tracking-wide">
                    Xác nhận xóa
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setIsDeleteBankModalOpen(false);
                    setBankToDelete(null);
                  }}
                  className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <p className="text-gray-300 mb-6 z-10 relative">
                Bạn có chắc chắn muốn xóa thông tin ngân hàng này? Hành động này không thể hoàn tác.
              </p>

              <div className="flex justify-end gap-3 z-10 relative">
                <button
                  onClick={() => {
                    setIsDeleteBankModalOpen(false);
                    setBankToDelete(null);
                  }}
                  className="px-5 py-2.5 bg-[#2A1A3E] rounded-lg hover:bg-[#3A2A4E] 
                     transition-all text-sm font-medium border border-[#4A0E7E] text-gray-300"
                >
                  Hủy
                </button>
                <button
                  onClick={handleDeleteBankAccount}
                  className="px-6 py-2.5 rounded-lg text-sm font-bold transition-all 
                     bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 
                     text-white shadow-lg shadow-red-500/30 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Xóa
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserProfile;
