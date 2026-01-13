import { useEffect, useState } from "react";
import { useTheme } from "../../component/useTheme";
import { User, ShieldAlert, Lock, X, Unlock } from "lucide-react";
import {
  adminUserService,
  UserListItemResponse,
} from "@/services/adminService";

const UserManagement = () => {
  const { isDark } = useTheme();
  const [users, setUsers] = useState<UserListItemResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserListItemResponse | null>(
    null
  );
  const [page, setPage] = useState(0);
  const [size] = useState(5);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [detailLoading, setDetailLoading] = useState(false);
  const [loadingUserId, setLoadingUserId] = useState<number | null>(null);

  // 🪐 Lấy danh sách người dùng
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const result = await adminUserService.getUsers({
          page,
          size,
          sortBy: "id",
          direction: "asc",
        });
        setUsers(result.content);
        setTotalPages(result.totalPages);
        setTotalElements(result.totalElements);
      } catch (error) {
        console.error("❌ Lỗi khi lấy danh sách người dùng:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [page, size]);

  // 🌟 Lấy chi tiết user theo ID
  const handleSelectUser = async (id: number) => {
    setDetailLoading(true);
    try {
      const detail = await adminUserService.getUserDetail(id);
      setSelectedUser(detail);
    } catch (error) {
      console.error("❌ Lỗi khi lấy chi tiết người dùng:", error);
    } finally {
      setDetailLoading(false);
    }
  };
  const handleDeactivate = async (userId: number) => {
    try {
      setLoadingUserId(userId);
      const updatedUser = await adminUserService.deactivateUser(userId);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, status: updatedUser.status } : u
        )
      );

      // Nếu đang mở modal chi tiết cùng user đó → cập nhật luôn
      if (selectedUser?.id === userId) {
        setSelectedUser((prev) =>
          prev ? { ...prev, status: updatedUser.status } : prev
        );
      }

      console.log("✅ Khóa người dùng thành công!");
    } catch (error) {
      console.error("❌ Lỗi khi khóa người dùng:", error);
    } finally {
      setLoadingUserId(null);
    }
  };

  const handleActivate = async (userId: number) => {
    try {
      setLoadingUserId(userId);
      const updatedUser = await adminUserService.activateUser(userId);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, status: updatedUser.status } : u
        )
      );

      if (selectedUser?.id === userId) {
        setSelectedUser((prev) =>
          prev ? { ...prev, status: updatedUser.status } : prev
        );
      }

      console.log("✅ Mở khóa người dùng thành công!");
    } catch (error) {
      console.error("❌ Lỗi khi mở khóa người dùng:", error);
    } finally {
      setLoadingUserId(null);
    }
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-purple-300 border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-lg font-medium text-gray-300">Đang tải dữ liệu...</p>
      </div>
    );

  return (
    <div
      className={`min-h-screen transition-colors duration-700 p-6 ${
        isDark ? "text-gray-100" : "text-gray-900"
      }`}
    >
      {/* 🌌 Tiêu đề */}
      <div className="mb-8 text-center">
        <h2
          className={`text-3xl font-bold bg-clip-text text-transparent ${
            isDark
              ? "bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400"
              : "bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500"
          }`}
        >
          👨‍🚀 Phi Hành Gia Âm Nhạc – Quản Lý Người Dùng
        </h2>
      </div>

      {/* 💫 Bảng người dùng */}
      <div
        className={`relative rounded-2xl shadow-[0_0_30px_rgba(128,0,255,0.15)] border ${
          isDark
            ? "bg-gradient-to-br from-[#0a001a]/80 to-[#18003d]/70 border-purple-800"
            : "bg-gradient-to-br from-[#faf5ff] to-[#ede2ff] border-purple-200"
        } transition-all duration-700`}
      >
        <table className="w-full table-auto">
          <thead
            className={`text-left text-sm ${
              isDark
                ? "bg-gray-800/80 text-gray-300"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            <tr>
              <th className="p-4 font-semibold">Người dùng</th>
              <th className="p-4 font-semibold">Email</th>
              <th className="p-4 font-semibold">Số dư</th>
              <th className="p-4 font-semibold">Vai trò</th>
              <th className="p-4 font-semibold">Trạng thái</th>
              <th className="p-4 font-semibold text-right">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr
                key={u.id}
                className={`border-t cursor-pointer transition-all duration-300 ${
                  isDark
                    ? "border-gray-800 hover:bg-gray-800/70"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
                onClick={() => handleSelectUser(u.id)}
              >
                <td className="p-4 flex items-center gap-3">
                  <User
                    className={`${
                      isDark ? "text-purple-400" : "text-purple-600"
                    }`}
                    size={20}
                  />
                  <span className="font-medium">{u.fullName}</span>
                </td>
                <td className="p-4 text-sm opacity-80">{u.email}</td>
                <td className="p-4">{u.balance?.toLocaleString()} ₫</td>
                <td className="p-4">{u.role}</td>
                <td className="p-4">
                  {u.status === "ACTIVE" && (
                    <span className="text-green-400 font-medium">
                      Hoạt động
                    </span>
                  )}
                  {u.status === "SUSPENDED" && (
                    <span className="text-red-400 font-medium">Bị khóa</span>
                  )}
                </td>
                <td className="p-4 text-right">
                  {u.status === "SUSPENDED" ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleActivate(u.id);
                      }}
                      disabled={loadingUserId === u.id}
                      className={`px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-1 transition ${
                        isDark
                          ? "bg-green-600/30 hover:bg-green-600/50 text-green-300"
                          : "bg-green-100 hover:bg-green-200 text-green-700"
                      }`}
                    >
                      {loadingUserId === u.id ? (
                        <>
                          <span
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                            aria-label="loading"
                          ></span>
                          Đang mở...
                        </>
                      ) : (
                        <>
                          <Lock size={16} /> Mở Khóa
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeactivate(u.id);
                      }}
                      disabled={loadingUserId === u.id}
                      className={`px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-1 transition ${
                        isDark
                          ? "bg-red-600/30 hover:bg-red-600/50 text-red-300"
                          : "bg-red-100 hover:bg-red-200 text-red-700"
                      }`}
                    >
                      {loadingUserId === u.id ? (
                        <>
                          <span
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                            aria-label="loading"
                          ></span>
                          Đang khóa...
                        </>
                      ) : (
                        <>
                          <Lock size={16} /> Khóa
                        </>
                      )}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* 🌌 Thanh phân trang */}
        <div className="flex justify-between items-center mt-6 px-2">
          <div className="text-sm opacity-70">
            Hiển thị {page * size + 1}–
            {Math.min((page + 1) * size, totalElements)} trên {totalElements}{" "}
            người dùng
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 0))}
              disabled={page === 0}
              className={`px-4 py-2 rounded-full font-medium text-sm shadow-md transition-all
        ${
          isDark
            ? "bg-purple-900/50 text-purple-300 hover:bg-purple-800/70"
            : "bg-purple-100 text-purple-700 hover:bg-purple-200"
        } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              ← Trước
            </button>

            <span className="font-semibold text-lg bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
              Trang {page + 1} / {totalPages || 1}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
              disabled={page + 1 >= totalPages}
              className={`px-4 py-2 rounded-full font-medium text-sm shadow-md transition-all
        ${
          isDark
            ? "bg-purple-900/50 text-purple-300 hover:bg-purple-800/70"
            : "bg-purple-100 text-purple-700 hover:bg-purple-200"
        } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              Sau →
            </button>
          </div>
        </div>
      </div>

      {/* ⚠️ Cảnh báo */}
      <div
        className={`mt-6 flex items-center gap-3 text-sm rounded-lg p-4 ${
          isDark
            ? "bg-yellow-900/30 text-yellow-300"
            : "bg-yellow-50 text-yellow-700"
        }`}
      >
        <ShieldAlert size={18} />
        <span>
          Hãy cẩn trọng khi khóa tài khoản — hành động này ảnh hưởng trực tiếp
          đến người dùng.
        </span>
      </div>

      {/* 🌙 Modal Chi tiết người dùng */}
      {selectedUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[8px] ml-64 mt-14"
          onClick={() => setSelectedUser(null)}
        >
          <div
            className={`relative rounded-3xl p-10 w-[90%] max-w-2xl overflow-hidden border backdrop-blur-sm shadow-[0_0_50px_rgba(128,0,255,0.3)] ${
              isDark
                ? "bg-gradient-to-br from-[#090014] via-[#140036] to-[#290064] border-purple-800 text-gray-100"
                : "bg-gradient-to-br from-[#f9f7ff] via-[#f2e9ff] to-[#e5d4ff] border-purple-300 text-gray-900"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Nút đóng */}
            <button
              className="absolute top-5 right-5 text-gray-400 hover:text-white transition"
              onClick={() => setSelectedUser(null)}
            >
              <X size={22} />
            </button>

            {/* Header */}
            <div className="flex flex-col items-center mb-8 z-10 relative">
              <img
                src={
                  selectedUser.avatarUrl ||
                  "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                }
                alt="avatar"
                className="w-28 h-28 rounded-full border-4 border-purple-400 shadow-[0_0_40px_rgba(187,0,255,0.6)] mb-4"
              />
              <h3 className="text-3xl font-bold text-center relative">
                <span className="bg-gradient-to-r from-fuchsia-400 via-blue-400 to-purple-500 bg-clip-text text-transparent">
                  {selectedUser.fullName}
                </span>
              </h3>
              <p className="text-sm opacity-80">{selectedUser.email}</p>
            </div>

            {/* Thông tin chi tiết */}
            {detailLoading ? (
              <p className="text-center text-sm opacity-70">Đang tải chi tiết...</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                {/* Cột trái */}
                <div className="space-y-3">
                  <p>
                    <span className="font-semibold text-fuchsia-400">
                      📱 Số điện thoại:
                    </span>{" "}
                    {selectedUser.phoneNumber || "Chưa có"}
                  </p>
                  <p>
                    <span className="font-semibold text-blue-400">🎂 Ngày sinh:</span>{" "}
                    {selectedUser.dateOfBirth || "Không rõ"}
                  </p>
                  <p>
                    <span className="font-semibold text-pink-400">📍 Địa điểm:</span>{" "}
                    {selectedUser.location || "Không rõ"}
                  </p>
                </div>

                {/* Cột phải */}
                <div className="space-y-3">
                  <p>
                    <span className="font-semibold text-purple-400">🪐 Vai trò:</span>{" "}
                    {selectedUser.role}
                  </p>
                  <p>
                    <span className="font-semibold text-cyan-400">💰 Số dư:</span>{" "}
                    {selectedUser.balance?.toLocaleString() || 0} ₫
                  </p>
                  <p>
                    <span className="font-semibold text-indigo-400">⚙️ Trạng thái:</span>{" "}
                    {selectedUser.status === "ACTIVE" ? (
                      <span className="text-green-400 font-medium">Hoạt động</span>
                    ) : (
                      <span className="text-red-400 font-medium">Bị khóa</span>
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* Nút hành động */}
            <div className="flex justify-center mt-8">
              {selectedUser.status === "ACTIVE" ? (
                <button
                  onClick={() => handleDeactivate(selectedUser.id)}
                  disabled={loadingUserId === selectedUser.id}
                  className="px-6 py-3 rounded-full font-semibold text-sm flex items-center gap-2 
                bg-gradient-to-r from-red-500 via-pink-500 to-purple-600 text-white shadow-lg hover:shadow-red-500/50 
                transition-all duration-300"
                >
                  {loadingUserId === selectedUser.id ? (
                    <>
                      <span
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                        aria-label="loading"
                      ></span>
                      Đang khóa...
                    </>
                  ) : (
                    <>
                      <Lock size={16} /> Khóa tài khoản
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={() => handleActivate(selectedUser.id)}
                  disabled={loadingUserId === selectedUser.id}
                  className="px-6 py-3 rounded-full font-semibold text-sm flex items-center gap-2 
                bg-gradient-to-r from-green-400 via-teal-400 to-cyan-500 text-white shadow-lg hover:shadow-cyan-500/50 
                transition-all duration-300"
                >
                  {loadingUserId === selectedUser.id ? (
                    <>
                      <span
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                        aria-label="loading"
                      ></span>
                      Đang mở...
                    </>
                  ) : (
                    <>
                      <Unlock size={16} /> Mở khóa tài khoản
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
