// File: src/components/ProPackageList.tsx hoặc tương tự

import React, { useEffect, useState, useCallback } from "react";
import {
  proPackageService,
  ProPackageResponse,
  ProPackageRequest,
  ProPackageType,
  Page,
} from "@/services/adminPackage";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
interface FetchState {
  data: ProPackageResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
}
const initialFetchState: FetchState = {
  data: [],
  page: 0,
  size: 5,
  totalElements: 0,
  totalPages: 0,
  loading: true,
  error: null,
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

interface PackageDetailModalProps {
  packageDetail: ProPackageResponse | null;
  onClose: () => void;
}

const PackageDetailModal: React.FC<PackageDetailModalProps> = ({
  packageDetail,
  onClose,
}) => {
  if (!packageDetail) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 transition-opacity duration-300"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-cyan-500/50 transform transition-all duration-300 scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-cyan-600/70 p-4 flex justify-between items-center">
          <h3 className="text-xl font-bold text-white">
            🚀 Chi Tiết Gói: {packageDetail.name}
          </h3>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition"
          >
            ...
          </button>
        </div>
        <div className="p-6 space-y-4 text-gray-200">
          <p>
            <span className="font-semibold text-cyan-300">ID:</span>{" "}
            {packageDetail.id}
          </p>
          <p>
            <span className="font-semibold text-cyan-300">Mô tả:</span>{" "}
            {packageDetail.description || "*Không có mô tả*"}
          </p>
          <div className="grid grid-cols-2 gap-4">
            <p>
              <span className="font-semibold text-cyan-300">Giá:</span>{" "}
              <span className="text-yellow-400 font-bold">
                {formatPrice(packageDetail.price)}
              </span>
            </p>
            <p>
              <span className="font-semibold text-cyan-300">Chu kỳ:</span>{" "}
              {packageDetail.packageType === ProPackageType.MONTHLY
                ? "Hàng Tháng 🌙"
                : "Hàng Năm ☀️"}
            </p>
            <p>
              <span className="font-semibold text-cyan-300">Trạng thái:</span>
              <span
                className={`ml-2 px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${packageDetail.isActive
                    ? "bg-green-100/20 text-green-400"
                    : "bg-red-100/20 text-red-400"
                  }`}
              >
                {packageDetail.isActive ? "HOẠT ĐỘNG ✅" : "TẠM DỪNG ⛔"}
              </span>
            </p>
          </div>
          <div className="border-t border-gray-700 pt-4 text-sm space-y-1">
            <p>
              <span className="font-semibold text-gray-400">
                Cập nhật cuối:
              </span>{" "}
              {formatDate(packageDetail.updatedAt)}
            </p>
          </div>
        </div>
        <div className="bg-gray-700/50 p-3 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

interface PackageEditModalProps {
  packageDetail: ProPackageResponse;
  onClose: () => void;
  onUpdate: (id: number, data: ProPackageRequest) => Promise<void>;
}

const PackageEditModal: React.FC<PackageEditModalProps> = ({
  packageDetail,
  onClose,
  onUpdate,
}) => {
  const [formData, setFormData] = useState<ProPackageRequest>({
    name: packageDetail.name,
    description: packageDetail.description || "",
    price: packageDetail.price,
    packageType: packageDetail.packageType,
    isActive: packageDetail.isActive,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "number"
          ? parseFloat(value)
          : type === "checkbox"
            ? (e.target as HTMLInputElement).checked
            : value,
    }));
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, "");
    setFormData((prev) => ({
      ...prev,
      price: parseFloat(value) || 0,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const updateData: ProPackageRequest = {
      name: formData.name,
      description: formData.description,
      price: formData.price,
      packageType: formData.packageType,
      isActive: formData.isActive,
    };

    try {
      await onUpdate(packageDetail.id, updateData);
      onClose(); // Đóng modal sau khi cập nhật thành công
    } catch (err) {
      console.error("Lỗi khi cập nhật gói:", err);
      // Hiển thị lỗi từ server hoặc lỗi chung
      setError(
        "Cập nhật gói thất bại. Vui lòng kiểm tra lại thông tin và kết nối."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border border-purple-500/50 transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-purple-600/70 p-4 flex justify-between items-center">
          <h3 className="text-xl font-bold text-white">
            ✏️ Chỉnh Sửa Gói: {packageDetail.name}
          </h3>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition"
          >
            ...
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 text-gray-200">
          {error && (
            <div className="bg-red-900/50 p-3 rounded text-red-300 border border-red-500">
              {error}
            </div>
          )}

          {/* Input Tên Gói */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-purple-300 mb-1"
            >
              Tên Gói <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full rounded-md bg-gray-700 border-gray-600 text-white focus:ring-purple-500 focus:border-purple-500 p-2"
            />
          </div>

          {/* Input Mô Tả */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-purple-300 mb-1"
            >
              Mô Tả
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={2}
              className="w-full rounded-md bg-gray-700 border-gray-600 text-white focus:ring-purple-500 focus:border-purple-500 p-2"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Input Giá */}
            <div>
              <label
                htmlFor="price"
                className="block text-sm font-medium text-purple-300 mb-1"
              >
                Giá (VND) <span className="text-red-500">*</span>
              </label>
              <input
                id="price"
                type="text"
                name="price"
                value={formData.price.toLocaleString("vi-VN")}
                onChange={handlePriceChange}
                required
                min="0"
                className="w-full rounded-md bg-gray-700 border-gray-600 text-white focus:ring-purple-500 focus:border-purple-500 p-2"
              />
            </div>

            {/* Input Chu Kỳ */}
            <div>
              <label
                htmlFor="packageType"
                className="block text-sm font-medium text-purple-300 mb-1"
              >
                Chu Kỳ <span className="text-red-500">*</span>
              </label>
              <select
                id="packageType"
                name="packageType"
                value={formData.packageType}
                onChange={handleChange}
                required
                className="w-full rounded-md bg-gray-700 border-gray-600 text-white focus:ring-purple-500 focus:border-purple-500 p-2 cursor-pointer"
              >
                <option value={ProPackageType.MONTHLY}>Hàng Tháng 🌙</option>
                <option value={ProPackageType.YEARLY}>Hàng Năm ☀️</option>
              </select>
            </div>

            {/* Trạng Thái */}
            <div className="flex items-center pt-6">
              <input
                id="isActive"
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    isActive: e.target.checked,
                  }))
                }
                className="h-4 w-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 cursor-pointer"
              />
              <label
                htmlFor="isActive"
                className="ml-2 text-sm font-medium text-purple-300"
              >
                Hoạt Động (Active)
              </label>
            </div>
          </div>

          {/* Footer - Nút Cập Nhật */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition"
              disabled={isLoading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition disabled:opacity-50 flex items-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <svg
                  className="animate-spin h-5 w-5 mr-3 text-white"
                  viewBox="0 0 24 24"
                >
                  ...
                </svg>
              ) : (
                "Cập Nhật Gói"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ProPackageList: React.FC = () => {
  const [fetchState, setFetchState] = useState<FetchState>(initialFetchState);
  const [nameFilter, setNameFilter] = useState<string>("");
  const [debouncedName, setDebouncedName] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<ProPackageType | "ALL">("ALL");
  const [activeFilter, setActiveFilter] = useState<
    "ALL" | "ACTIVE" | "INACTIVE"
  >("ALL");
  const [isFetchingData, setIsFetchingData] = useState<boolean>(true);

  // --- STATE CHO MODAL VÀ CHI TIẾT GÓI (Giữ nguyên) ---
  const [selectedPackage, setSelectedPackage] =
    useState<ProPackageResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isDetailLoading, setIsDetailLoading] = useState<boolean>(false);

  // 💡 STATE MỚI CHO CHỨC NĂNG CHỈNH SỬA
  const [packageToEdit, setPackageToEdit] = useState<ProPackageResponse | null>(
    null
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [packageToDeleteId, setPackageToDeleteId] = useState<number | null>(
    null
  );
  // --- LOGIC DEBOUNCE & FETCH DATA (Đã cập nhật để nhận size) ---

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedName(nameFilter);
    }, 500);
    return () => {
      clearTimeout(handler);
    };
  }, [nameFilter]);

  const fetchData = useCallback(
    async (
      name: string,
      type: ProPackageType | "ALL",
      active: "ALL" | "ACTIVE" | "INACTIVE",
      page: number,
      size: number // Truyền size vào
    ) => {
      setIsFetchingData(true);
      setFetchState((prev) => ({ ...prev, error: null }));

      const filters = {
        name: name || undefined,
        packageType: type === "ALL" ? undefined : type,
        isActive:
          active === "ALL" ? undefined : active === "ACTIVE" ? true : false,

        page: page,
        size: size,
        sortBy: "id",
        sortDir: "desc",
      };

      try {
        const pageResult: Page<ProPackageResponse> =
          await proPackageService.search(filters);

        setFetchState((prev) => ({
          ...prev,
          data: pageResult.content,
          page: pageResult.number,
          size: pageResult.size ?? size,
          totalElements: pageResult.totalElements,
          totalPages: pageResult.totalPages,
          loading: false,
        }));
      } catch (err) {
        console.error(`Lỗi khi fetch danh sách gói:`, err);
        setFetchState((prev) => ({
          ...prev,
          loading: false,
          error: "Không thể kết nối với hệ thống ngân hà. Vui lòng thử lại.",
        }));
      } finally {
        setIsFetchingData(false);
      }
    },
    []
  );

  useEffect(() => {
    // Luôn reset về trang 0 khi các filter thay đổi
    fetchData(debouncedName, typeFilter, activeFilter, 0, 5);
  }, [fetchData, debouncedName, typeFilter, activeFilter]);

  // --- HANDLER VIEW DETAILS (Giữ nguyên) ---

  const handleViewDetails = useCallback(async (id: number) => {
    setIsDetailLoading(true);
    setSelectedPackage(null);
    setIsModalOpen(true);

    try {
      const detail = await proPackageService.findById(id);
      setSelectedPackage(detail);
    } catch (err) {
      console.error(`Lỗi khi fetch chi tiết gói ID ${id}:`, err);
      alert(`Lỗi: Không thể tải chi tiết gói ID ${id}.`);
      setIsModalOpen(false);
    } finally {
      setIsDetailLoading(false);
    }
  }, []);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPackage(null);
  };

  // --- 💡 HANDLER CHỈNH SỬA (MỚI) ---

  const handleEditPackage = useCallback(async (id: number) => {
    setIsDetailLoading(true); // Dùng lại state loading
    setPackageToEdit(null); // Reset dữ liệu gói cũ
    setIsEditModalOpen(true); // Mở modal chỉnh sửa

    try {
      const detail = await proPackageService.findById(id);
      setPackageToEdit(detail);
    } catch (err) {
      console.error(`Lỗi khi fetch chi tiết gói ID ${id} để sửa:`, err);
      alert(`Lỗi: Không thể tải chi tiết gói ID ${id} để chỉnh sửa.`);
      setIsEditModalOpen(false);
    } finally {
      setIsDetailLoading(false);
    }
  }, []);

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setPackageToEdit(null);
  };

  // 💡 HÀM GỌI API UPDATE VÀ TẢI LẠI DỮ LIỆU
  const handleUpdatePackage = useCallback(
    async (id: number, data: ProPackageRequest) => {
      try {
        // 1. GỌI API UPDATE
        await proPackageService.update(id, data);

        // 2. Tải lại dữ liệu trang hiện tại
        await fetchData(
          debouncedName,
          typeFilter,
          activeFilter,
          fetchState.page,
          fetchState.size
        );

        // 3. Thông báo (Tùy chọn: dùng toast notification sẽ tốt hơn alert)
        alert(`Cập nhật gói ID ${id} thành công!`);
      } catch (err) {
        console.error("Lỗi cập nhật gói:", err);
        // Re-throw để modal có thể bắt và hiển thị lỗi
        throw new Error(
          "Không thể cập nhật gói. Vui lòng kiểm tra lại kết nối."
        );
      }
    },
    [
      fetchData,
      debouncedName,
      typeFilter,
      activeFilter,
      fetchState.page,
      fetchState.size,
    ]
  );

  // --- HANDLERS KHÁC (Đã cập nhật) ---

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < fetchState.totalPages) {
      fetchData(
        debouncedName,
        typeFilter,
        activeFilter,
        newPage,
        fetchState.size
      );
    }
  };

  // ... (Giữ nguyên các hàm tiện ích và UI Loading/Error) ...
  const handleTypeFilterChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setTypeFilter(event.target.value as ProPackageType | "ALL");
  };

  const handleActiveFilterChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setActiveFilter(event.target.value as "ALL" | "ACTIVE" | "INACTIVE");
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNameFilter(event.target.value);
  };

  const getPackageTypeLabel = (type: ProPackageType) => {
    return type === ProPackageType.MONTHLY ? "Hàng Tháng 🌙" : "Hàng Năm ☀️";
  };
  // ... (Hết các hàm tiện ích và UI Loading/Error) ...

  // Hàm xử lý khi click nút xóa
  const handleDeleteClick = (id: number) => {
    setPackageToDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  // Hàm đóng Modal Xóa
  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setPackageToDeleteId(null);
  };

  // Hàm gọi API xóa và xử lý thành công/thất bại
  const handleConfirmDelete = async () => {
    if (packageToDeleteId === null) return;

    // Đóng modal ngay lập tức để tránh double click
    handleCloseDeleteModal();

    try {
      // 💡 GỌI API DELETE TẠI ĐÂY
      await proPackageService.delete(packageToDeleteId);

      // Hiển thị thông báo thành công (ví dụ: dùng toast/alert)
      console.log(`Gói ID: ${packageToDeleteId} đã được xóa thành công!`);

      fetchData(
        debouncedName, // Tên tìm kiếm
        typeFilter, // Lọc theo Chu kỳ
        activeFilter, // Lọc theo Trạng thái
        fetchState.page, // Trang hiện tại
        fetchState.size // Kích thước trang
      );
    } catch (error) {
      console.error("Lỗi khi xóa gói:", error);
      // Hiển thị thông báo lỗi
      alert("Xóa gói thất bại. Vui lòng thử lại.");
    } finally {
      setPackageToDeleteId(null);
    }
  };

  if (fetchState.error) {
    return (
      <div className="bg-red-900/50 p-10 rounded-2xl shadow-2xl border border-red-500 text-center min-h-[400px]">
        <h3 className="text-2xl font-bold text-red-400 mb-4">
          ⚠️ Lỗi Kết Nối Vũ Trụ
        </h3>
        <p className="text-red-300">{fetchState.error}</p>
      </div>
    );
  }

  if (fetchState.data.length === 0 && isFetchingData) {
    return (
      <div className="bg-gray-800/90 p-10 rounded-2xl shadow-2xl border border-cyan-500/50 text-center flex justify-center items-center min-h-[400px]">
        <svg
          className="animate-spin h-8 w-8 text-cyan-400"
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
        <p className="ml-3 text-xl text-cyan-400">
          Đang tải dữ liệu từ trung tâm điều khiển...
        </p>
      </div>
    );
  }

  // --- Bảng Hiển Thị Dữ Liệu CHÍNH ---
  return (
    <div className="bg-gray-900/95 p-6 sm:p-8 rounded-3xl shadow-3xl border border-cyan-400/50 relative backdrop-blur-sm">
      {/* Overlay khi đang loading (Giữ nguyên) */}
      {isFetchingData && fetchState.data.length > 0 && (
        <div className="absolute inset-0 z-10 bg-gray-900/70 flex items-center justify-center rounded-3xl">
          <svg
            className="animate-spin h-12 w-12 text-cyan-400"
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
        </div>
      )}

      <h2 className="text-2xl md:text-3xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 text-center">
        🛠️ Quản lý Gói Dịch Vụ ({fetchState.totalElements} gói)
      </h2>

      {/* --- Thanh Bộ Lọc & Tìm Kiếm --- */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4 bg-[#0f0825]/80 p-4 rounded-xl border border-purple-500/30">
        {/* Input Tìm kiếm */}
        <div className="md:col-span-2">
          <label htmlFor="nameFilter" className="block text-xs font-medium text-purple-300 mb-1">
            Tìm theo tên
          </label>
          <input
            id="nameFilter"
            type="text"
            value={nameFilter}
            onChange={handleSearchChange}
            placeholder="Nhập tên gói..."
            className="w-full rounded-lg bg-gray-800 border border-purple-500/30 text-white placeholder-gray-500 focus:ring-cyan-500 focus:border-cyan-500 p-2.5 text-sm"
          />
        </div>

        {/* Select Lọc Chu Kỳ */}
        <div>
          <label htmlFor="packageTypeFilter" className="block text-xs font-medium text-purple-300 mb-1">
            Chu kỳ
          </label>
          <select
            id="packageTypeFilter"
            value={typeFilter}
            onChange={handleTypeFilterChange}
            className="w-full rounded-lg bg-gray-800 border border-purple-500/30 text-cyan-300 focus:ring-cyan-500 focus:border-cyan-500 p-2.5 text-sm cursor-pointer"
          >
            <option value="ALL">Tất cả</option>
            <option value={ProPackageType.MONTHLY}>Hàng Tháng 🌙</option>
            <option value={ProPackageType.YEARLY}>Hàng Năm ☀️</option>
          </select>
        </div>

        {/* Select Lọc Trạng Thái */}
        <div>
          <label htmlFor="activeFilter" className="block text-xs font-medium text-purple-300 mb-1">
            Trạng thái
          </label>
          <select
            id="activeFilter"
            value={activeFilter}
            onChange={handleActiveFilterChange}
            className="w-full rounded-lg bg-gray-800 border border-purple-500/30 text-cyan-300 focus:ring-cyan-500 focus:border-cyan-500 p-2.5 text-sm cursor-pointer"
          >
            <option value="ALL">Tất cả</option>
            <option value="ACTIVE">Hoạt động ✅</option>
            <option value="INACTIVE">Tạm dừng ⛔</option>
          </select>
        </div>
      </div>

      {/* --- Danh sách gói (Bảng dữ liệu không gian) --- */}
      {fetchState.data.length === 0 ? (
        <div className="p-8 text-center bg-gray-800/80 rounded-xl border border-purple-500/30">
          <p className="text-xl text-cyan-400 font-medium">
            🌌 Không tìm thấy chòm sao (gói) nào phù hợp với tín hiệu dò tìm
            hiện tại.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-cyan-500/20 rounded-xl shadow-xl">
          <table className="min-w-full divide-y divide-purple-500/30">
            <thead className="bg-gray-800/90 sticky top-0 border-b border-cyan-500/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-cyan-300 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-cyan-300 uppercase tracking-wider">
                  TÊN GÓI & MÔ TẢ
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-cyan-300 uppercase tracking-wider">
                  GIÁ TIỀN
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-cyan-300 uppercase tracking-wider">
                  CHU KỲ
                </th>
                <th className="px-4 py-3 text-center text-xs font-bold text-cyan-300 uppercase tracking-wider">
                  TRẠNG THÁI
                </th>
                <th className="px-4 py-3 text-center text-xs font-bold text-cyan-300 uppercase tracking-wider">
                  THAO TÁC
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-500/20">
              {fetchState.data.map((pkg) => (
                <tr
                  key={pkg.id}
                  className="group hover:bg-purple-900/30 transition-all duration-200"
                >
                  <td className="px-4 py-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600/40 to-pink-600/40 flex items-center justify-center text-white font-bold text-sm border border-purple-500/30">
                      {pkg.id}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-white font-medium group-hover:text-cyan-300 transition-colors">
                      {pkg.name}
                    </div>
                    {pkg.description && (
                      <p className="text-xs text-gray-400 truncate max-w-xs mt-1">
                        {pkg.description}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                      {formatPrice(pkg.price)}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full border ${pkg.packageType === ProPackageType.MONTHLY
                        ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                        : "bg-orange-500/20 text-orange-300 border-orange-500/30"
                      }`}>
                      {getPackageTypeLabel(pkg.packageType)}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-lg ${pkg.isActive
                          ? "bg-green-600/20 text-green-400 border border-green-500/50"
                          : "bg-red-600/20 text-red-400 border border-red-500/50"
                        }`}
                    >
                      {pkg.isActive ? "Hoạt động" : "Tạm dừng"}
                    </span>
                  </td>
                  {/* CỘT THAO TÁC (Tàu điều khiển) */}
                  <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <div className="flex justify-center space-x-2">
                      {/* Nút Xem Chi Tiết */}
                      <button
                        onClick={() => handleViewDetails(pkg.id)}
                        className="text-cyan-400 hover:text-cyan-200 p-2 rounded-full hover:bg-cyan-700/50 transition duration-150"
                        title="Xem Chi Tiết"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          ></path>
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          ></path>
                        </svg>
                      </button>

                      {/* NÚT CHỈNH SỬA */}
                      <button
                        onClick={() => handleEditPackage(pkg.id)}
                        className="text-purple-400 hover:text-purple-200 p-2 rounded-full hover:bg-purple-700/50 transition duration-150"
                        title="Sửa"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          ></path>
                        </svg>
                      </button>

                      {/* Nút Xóa */}
                      <button
                        onClick={() => handleDeleteClick(pkg.id)}
                        className="text-red-400 hover:text-red-200 p-2 rounded-full hover:bg-red-700/50 transition duration-150"
                        title="Xóa"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          ></path>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* --- Pagination (Bảng điều khiển) --- */}
      {fetchState.totalPages > 0 && (
        <nav className="mt-10 flex items-center justify-between bg-gray-800/80 p-4 rounded-xl border border-purple-500/30">
          <div className="text-sm text-cyan-400 font-semibold">
            Dữ liệu Vệ tinh: Trang {fetchState.page + 1} /{" "}
            {fetchState.totalPages} (Tổng: {fetchState.totalElements} mục)
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => handlePageChange(fetchState.page - 1)}
              disabled={fetchState.page === 0 || isFetchingData}
              className="px-5 py-2 text-sm font-bold rounded-lg text-purple-300 bg-gray-700/50 hover:bg-purple-600 hover:text-white disabled:opacity-30 transition duration-150 border border-purple-500/50 hover:border-transparent"
            >
              ← Tín hiệu Trước
            </button>
            <button
              onClick={() => handlePageChange(fetchState.page + 1)}
              disabled={
                fetchState.page === fetchState.totalPages - 1 || isFetchingData
              }
              className="px-5 py-2 text-sm font-bold rounded-lg text-purple-300 bg-gray-700/50 hover:bg-purple-600 hover:text-white disabled:opacity-30 transition duration-150 border border-purple-500/50 hover:border-transparent"
            >
              Tín hiệu Sau →
            </button>
          </div>
        </nav>
      )}

      {/* --- GỌI MODAL CHI TIẾT (Giữ nguyên) --- */}
      {isModalOpen &&
        (isDetailLoading ? (
          // Loading Modal Chi Tiết
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="bg-gray-800 p-8 rounded-xl flex items-center shadow-2xl border border-cyan-500/50">
              <svg
                className="animate-spin h-8 w-8 text-cyan-400"
                viewBox="0 0 24 24"
              >
                ...
              </svg>
              <p className="ml-4 text-xl text-cyan-400">
                Đang tải chi tiết hành tinh...
              </p>
            </div>
          </div>
        ) : (
          <PackageDetailModal
            packageDetail={selectedPackage}
            onClose={handleCloseModal}
          />
        ))}

      {/* 💡 GỌI MODAL CHỈNH SỬA (MỚI) */}
      {isEditModalOpen &&
        (isDetailLoading ? (
          // Loading Modal Chỉnh Sửa
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="bg-gray-800 p-8 rounded-xl flex items-center shadow-2xl border border-purple-500/50">
              <svg
                className="animate-spin h-6 w-6 text-purple-400"
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
              <p className="ml-3 text-lg text-purple-400">
                Đang tải dữ liệu để chỉnh sửa bản đồ sao...
              </p>
            </div>
          </div>
        ) : (
          packageToEdit && (
            <PackageEditModal
              packageDetail={packageToEdit}
              onClose={handleCloseEditModal}
              onUpdate={handleUpdatePackage}
            />
          )
        ))}
      {/* 💡 GỌI MODAL XÁC NHẬN XÓA (MỚI) */}
      {isDeleteModalOpen && packageToDeleteId !== null && (
        <DeleteConfirmationModal
          packageId={packageToDeleteId}
          onClose={handleCloseDeleteModal}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
};

export default ProPackageList;
