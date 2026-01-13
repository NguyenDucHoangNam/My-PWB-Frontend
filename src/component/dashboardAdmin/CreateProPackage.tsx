import { ProPackageRequest, proPackageService, ProPackageType } from "@/services/adminPackage";
import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";


// Định nghĩa form data (giống ProPackageRequest)
type FormInputs = ProPackageRequest;

const CreateProPackage: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormInputs>();

  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Xử lý gửi form
  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    setMessage(null);
    try {
      // Chuyển price từ string (input) sang number
      const payload = {
        ...data,
        price: Number(data.price),
      };

      const result = await proPackageService.create(payload);
      setMessage({
        type: "success",
        text: `Gói '${result.name}' đã được tạo thành công! ID: ${result.id}`,
      });
      reset({ isActive: false, name: "", price: 0, packageType: ProPackageType.MONTHLY, description: "" });
    } catch (error) {
      console.error("Lỗi tạo gói:", error);
      setMessage({
        type: "error",
        text: "Lỗi! Không thể tạo gói. Vui lòng kiểm tra console.",
      });
    }
  };
return (
    <div
        className="min-h-screen text-white p-4 sm:p-8 relative overflow-hidden"
    >
        <div className="absolute inset-0 opacity-10 grid-background"></div>
        {/* Container chính của Form */}
        <main className="relative z-10 max-w-xl mx-auto bg-gray-900/90 p-8 sm:p-10 rounded-3xl shadow-2xl border border-purple-500/40 backdrop-blur-sm">
            <h2 className="text-3xl font-extrabold mb-8 text-cyan-400 text-center tracking-wide border-b border-cyan-500/30 pb-3">
                Đăng Ký Gói Khám Phá Mới
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
                {/* Tên Gói */}
                <div className="relative">
                    <label htmlFor="name" className="block text-sm font-bold text-purple-300 mb-1">
                        Tên Gói (Mã Định Danh Ngân Hà)
                    </label>
                    <input
                        id="name"
                        type="text"
                        {...register("name", { required: "Tên gói là bắt buộc" })}
                        className={`mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800 text-white placeholder-gray-500 focus:ring-pink-500 focus:border-pink-500 shadow-input-glow transition duration-200 ease-in-out p-3.5 text-lg ${
                            errors.name ? "border-red-500 ring-1 ring-red-500" : ""
                        }`}
                        placeholder="Ví dụ: Tinh Vân Orion V2.0"
                    />
                    {errors.name && (
                        <p className="mt-1 text-sm text-red-400 absolute bottom-[-20px] right-0">
                            🚨 {errors.name.message}
                        </p>
                    )}
                </div>

                {/* Mô tả */}
                <div>
                    <label htmlFor="description" className="block text-sm font-bold text-purple-300 mb-1">
                        Mô Tả (Chi Tiết Nhiệm Vụ)
                    </label>
                    <textarea
                        id="description"
                        {...register("description")}
                        rows={3}
                        className="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800 text-white placeholder-gray-500 focus:ring-pink-500 focus:border-pink-500 shadow-input-glow p-3.5"
                        placeholder="Mô tả các đặc quyền và thông số kỹ thuật của gói..."
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    {/* Giá */}
                    <div className="relative">
                        <label htmlFor="price" className="block text-sm font-bold text-purple-300 mb-1">
                            Giá (Đơn Vị Năng Lượng)
                        </label>
                        <div className="relative">
                            <input
                                id="price"
                                type="number"
                                step="any"
                                {...register("price", {
                                    required: "Giá là bắt buộc",
                                    min: { value: 0, message: "Giá phải >= 0" },
                                })}
                                className={`mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800 text-white focus:ring-pink-500 focus:border-pink-500 shadow-input-glow p-3.5 text-lg pl-10 ${
                                    errors.price ? "border-red-500 ring-1 ring-red-500" : ""
                                }`}
                                placeholder="0.00"
                            />
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-400 font-bold">$</span>
                        </div>
                        
                        {errors.price && (
                            <p className="mt-1 text-sm text-red-400 absolute bottom-[-20px] right-0">
                                🚨 {errors.price.message}
                            </p>
                        )}
                    </div>

                    {/* Loại Gói */}
                    <div>
                        <label htmlFor="packageType" className="block text-sm font-bold text-purple-300 mb-1">
                            Chu Kỳ (Quỹ Đạo Phóng)
                        </label>
                        <select
                            id="packageType"
                            {...register("packageType", { required: true })}
                            className="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800 text-cyan-400 focus:ring-pink-500 focus:border-pink-500 shadow-input-glow p-3.5 text-lg appearance-none cursor-pointer"
                        >
                            <option value={ProPackageType.MONTHLY}>MONTHLY 🌑 (Quỹ Đạo Ngắn)</option>
                            <option value={ProPackageType.YEARLY}>YEARLY 🪐 (Quỹ Đạo Dài)</option>
                        </select>
                    </div>
                </div>

                {/* Trạng thái Kích hoạt */}
                <div className="flex items-center space-x-3 pt-4">
                    <input
                        id="isActive"
                        type="checkbox"
                        {...register("isActive")}
                        className="h-6 w-6 text-pink-500 border-gray-600 rounded focus:ring-pink-500 bg-gray-700 checked:bg-pink-500 transition duration-150 transform scale-110"
                    />
                    <label htmlFor="isActive" className="text-base font-medium text-gray-300">
                        Trạng thái Hoạt Động (Đã Kích Hoạt Lõi)
                    </label>
                </div>

                {/* Thông báo */}
                {message && (
                    <div
                        className={`p-4 rounded-xl text-base font-medium transition duration-300 ${
                            message.type === "success"
                                ? "bg-green-600/30 text-green-300 border border-green-500 shadow-md shadow-green-500/20"
                                : "bg-red-600/30 text-red-300 border border-red-500 shadow-md shadow-red-500/20"
                        }`}
                    >
                        {message.type === "success" ? "✅ Tín hiệu Gửi thành công: " : "❌ Lỗi Truyền Dữ Liệu: "}
                        {message.text}
                    </div>
                )}

                {/* Nút Gửi */}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 mt-6 text-xl font-bold rounded-xl text-white bg-gradient-to-r from-purple-700 to-pink-600 hover:from-purple-800 hover:to-pink-700 transition duration-300 ease-in-out shadow-neon-pink disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 uppercase tracking-wider border border-pink-500/50"
                >
                    {isSubmitting ? (
                        <>
                            <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Đang Khởi Động Tàu Vũ Trụ...</span>
                        </>
                    ) : (
                        <>
                            <span role="img" aria-label="Rocket">
                                🛰️
                            </span>
                            <span>Gửi Tọa Độ & Khởi Hành</span>
                        </>
                    )}
                </button>
            </form>
        </main>

        {/* Trang trí: Các ngôi sao lấp lánh (Tăng cường hiệu ứng) */}
        <div className="absolute top-10 left-10 w-2 h-2 bg-yellow-400 rounded-full animate-pulse z-0 shadow-neon-yellow"></div>
        <div className="absolute bottom-20 right-20 w-3 h-3 bg-cyan-300 rounded-full animate-pulse delay-100 z-0 shadow-neon-cyan"></div>
        <div className="absolute top-1/2 right-10 w-1 h-1 bg-white rounded-full animate-pulse delay-300 z-0"></div>
        <div className="absolute bottom-5 left-1/4 w-4 h-4 bg-pink-400 rounded-full animate-pulse delay-500 z-0 shadow-neon-pink"></div>
    </div>
);
};

export default CreateProPackage;