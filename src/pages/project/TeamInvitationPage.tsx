import { useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import {
  UserPlus,
  Mail,
  Users,
  Trash2,
  AlertCircle,
  Loader,
  Shield,
  Eye,
  EyeOff,
} from "lucide-react";
import { useTeamInvitation } from "../../component/hooks/useTeamInvitation";
import {
  getRoleLabel,
  getRoleBadgeColor,
  formatDate,
} from "../../utils/teamInvitation.helpers";
import AnimatedBackground from "../../component/background/AnimatedBackground";
import BackToProjectButton from "@/component/buttons/BackToProjectButton";
import { useCosmicToast } from "../../component/toast/CosmicToastProvider";

export default function TeamInvitationPage() {
  const [searchParams] = useSearchParams();
  const projectId = parseInt(searchParams.get("id") || "0");

  const {
    // States
    activeTab,
    setActiveTab,
    loading,
    error,
    setError,
    success,
    setSuccess,

    // Invite form
    email,
    setEmail,
    role,
    setRole,
    anonymous,
    setAnonymous,

    // Suggestions
    suggestions,
    loadingSuggestions,
    showSuggestions,
    suggestionsError,
    handleEmailFocus,
    handleEmailBlur,
    handleSelectSuggestion,

    // Data lists
    pendingInvitations,
    members,
    anonymousCount,
    isOwner,
    canRemoveMembers,

    // Modal
    showCancelModal,
    showRemoveModal,
    memberToRemove,

    // Loading states
    removingMemberId,

    // Handlers
    handleInvite,
    handleCancelInvitation,
    confirmCancelInvitation,
    cancelCancelInvitation,
    handleRemoveMember,
    confirmRemoveMember,
    cancelRemoveMember,
  } = useTeamInvitation({ projectId });

  const { showToast } = useCosmicToast();

  // Show toast notifications for error and success
  useEffect(() => {
    if (error) {
      showToast(error, "error");
      setError(null); // Clear error after showing toast
    }
  }, [error, showToast, setError]);

  useEffect(() => {
    if (success) {
      showToast(success, "success");
      setSuccess(null); // Clear success after showing toast
    }
  }, [success, showToast, setSuccess]);

  if (!projectId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A061D] via-[#100C2E] to-[#16124A] flex items-center justify-center">
        <div className="text-center text-white">
          <AlertCircle size={64} className="mx-auto mb-4 text-red-400" />
          <h2 className="text-2xl font-bold">Không tìm thấy dự án</h2>
          <p className="text-gray-400 mt-2">Vui lòng chọn dự án hợp lệ</p>
        </div>
      </div>
    );
  }

  // Loading state khi đang check quyền
  if (isOwner === null && loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A061D] via-[#100C2E] to-[#16124A] flex items-center justify-center">
        <div className="text-center text-white">
          <Loader
            className="animate-spin mx-auto mb-4 text-purple-400"
            size={64}
          />
          <h2 className="text-2xl font-bold">Đang tải...</h2>
          <p className="text-gray-400 mt-2">Vui lòng chờ giây lát</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A061D] via-[#100C2E] to-[#16124A] text-white font-sans px-4 pt-20 pb-6">
      {/* Background effects */}
      <AnimatedBackground />
      <div className="max-w-6xl mx-auto relative z-10 h-full flex flex-col justify-start min-h-0">
        {/* Header */}
        <div className="mb-6 mr-5">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">
              🧑‍🚀
              <span className=" font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 mb-2">
                Phi Hành Đoàn của bạn
              </span>
            </h1>
            <BackToProjectButton projectId={projectId.toString()} />
          </div>
          <p className="text-gray-300 mt-2 text-base md:text-lg">
            {isOwner === true
              ? "Mời và quản lý các thành viên tham gia dự án của bạn"
              : "Theo dõi và quản lý những đồng đội đang cùng bạn bay qua dải ngân hà sáng tạo"}
          </p>
        </div>

        {/* Info banner cho non-owner */}
        {isOwner === false && (
          <div className="mb-3 bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 flex items-start gap-3">
            <AlertCircle
              size={20}
              className="text-blue-400 flex-shrink-0 mt-0.5"
            />
            <p className="text-blue-300">
              🪩 Chỉ Chỉ huy tàu (chủ dự án) mới có quyền mời thêm phi hành gia
              mới.
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-4 bg-gray-900/40 p-1.5 rounded-2xl backdrop-blur-md border border-gray-700/60 shadow-lg shadow-purple-500/5">
          {isOwner === true && (
            <button
              onClick={() => setActiveTab("invite")}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 relative overflow-hidden group ${
                activeTab === "invite"
                  ? "bg-gradient-to-r from-purple-600 via-purple-500 to-blue-600 text-white shadow-lg shadow-purple-500/50 scale-105"
                  : "text-gray-400 hover:text-white hover:bg-gray-800/60 hover:scale-102"
              }`}
            >
              <span className="relative z-10 flex items-center justify-center">
                <UserPlus size={18} className="mr-2" />
                Tuyển Đồng Hành
              </span>
              {activeTab === "invite" && (
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-blue-400/20 animate-pulse" />
              )}
            </button>
          )}
          {isOwner === true && (
            <button
              onClick={() => setActiveTab("pending")}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 relative overflow-hidden group ${
                activeTab === "pending"
                  ? "bg-gradient-to-r from-purple-600 via-purple-500 to-blue-600 text-white shadow-lg shadow-purple-500/50 scale-105"
                  : "text-gray-400 hover:text-white hover:bg-gray-800/60 hover:scale-102"
              }`}
            >
              <span className="relative z-10 flex items-center justify-center">
                <Mail size={18} className="mr-2" />
                Tín Hiệu Đang Chờ
              </span>
              {activeTab === "pending" && (
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-blue-400/20 animate-pulse" />
              )}
            </button>
          )}
          <button
            onClick={() => setActiveTab("members")}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 relative overflow-hidden group ${
              activeTab === "members"
                ? "bg-gradient-to-r from-purple-600 via-purple-500 to-blue-600 text-white shadow-lg shadow-purple-500/50 scale-105"
                : "text-gray-400 hover:text-white hover:bg-gray-800/60 hover:scale-102"
            }`}
          >
            <span className="relative z-10 flex items-center justify-center">
              <Users size={18} className="mr-2" />
              Đội Ngũ Hiện Tại
            </span>
            {activeTab === "members" && (
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-blue-400/20 animate-pulse" />
            )}
          </button>
        </div>

        {/* Content */}
        <div className="bg-gradient-to-br from-gray-900/40 via-gray-900/30 to-gray-800/40 backdrop-blur-xl border border-gray-700/60 rounded-2xl p-6 flex-1 overflow-auto max-h-[calc(100vh-8rem)] shadow-2xl shadow-purple-500/10">
          {/* Invite Tab - Chỉ owner */}
          {activeTab === "invite" && isOwner === true && (
            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-3">
                <UserPlus className="text-purple-400" />
                Mời thành viên mới
              </h2>

              <form onSubmit={handleInvite} className="space-y-6">
                {/* Email */}
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                    <Mail size={16} className="text-purple-400" />
                    Email <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={handleEmailFocus}
                    onBlur={handleEmailBlur}
                    placeholder="example@email.com"
                    required
                    className="w-full bg-gray-800/60 border-2 border-gray-600/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-300 hover:border-gray-500 shadow-lg"
                  />

                  {/* Suggestions Dropdown */}
                  {showSuggestions && (
                    <div className="absolute z-50 w-full mt-2 bg-gray-800/95 backdrop-blur-xl border-2 border-purple-500/30 rounded-xl shadow-2xl shadow-purple-500/20 max-h-80 overflow-y-auto custom-scrollbar">
                      {loadingSuggestions ? (
                        <div className="p-4 text-center text-gray-400">
                          <Loader
                            className="animate-spin mx-auto mb-2"
                            size={20}
                          />
                          <p className="text-sm">Đang tải gợi ý...</p>
                        </div>
                      ) : suggestionsError ? (
                        <div className="p-4 text-center text-red-400 text-sm">
                          <AlertCircle size={16} className="mx-auto mb-2" />
                          {suggestionsError}
                        </div>
                      ) : suggestions.length === 0 ? (
                        <div className="p-4 text-center text-gray-400 text-sm">
                          Không có gợi ý nào
                        </div>
                      ) : (
                        <div className="py-2">
                          {suggestions.map((suggestion) => (
                            <button
                              key={suggestion.id}
                              type="button"
                              onClick={() => handleSelectSuggestion(suggestion)}
                              className="w-full px-4 py-3 hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-blue-500/20 transition-all duration-200 flex items-center gap-3 text-left rounded-lg group"
                            >
                              {suggestion.avatarUrl ? (
                                <img
                                  src={suggestion.avatarUrl}
                                  alt={suggestion.fullName}
                                  className="w-10 h-10 rounded-full border border-gray-600"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold">
                                  {suggestion.firstName?.[0]?.toUpperCase() ||
                                    suggestion.fullName?.[0]?.toUpperCase() ||
                                    "?"}
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-white truncate">
                                  {suggestion.fullName}
                                </div>
                                <div className="text-sm text-gray-400 truncate">
                                  {suggestion.email}
                                </div>
                              </div>
                              <UserPlus
                                size={18}
                                className="text-purple-400 flex-shrink-0"
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                    <Shield size={16} className="text-purple-400" />
                    Vai trò <span className="text-red-400">*</span>
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      type="button"
                      onClick={() => setRole("CLIENT")}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                        role === "CLIENT"
                          ? "border-blue-500 bg-gradient-to-br from-blue-500/30 to-blue-600/20 shadow-lg shadow-blue-500/30 scale-105"
                          : "border-gray-600/50 bg-gray-800/40 hover:border-blue-500/50 hover:bg-blue-500/10"
                      }`}
                    >
                      <div className="text-center">
                        <Shield
                          size={24}
                          className="mx-auto mb-2 text-blue-400"
                        />
                        <div className="font-semibold">Khách hàng</div>
                        <div className="text-xs text-gray-400 mt-1">
                          Quyền cao
                        </div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole("COLLABORATOR")}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                        role === "COLLABORATOR"
                          ? "border-green-500 bg-gradient-to-br from-green-500/30 to-green-600/20 shadow-lg shadow-green-500/30 scale-105"
                          : "border-gray-600/50 bg-gray-800/40 hover:border-green-500/50 hover:bg-green-500/10"
                      }`}
                    >
                      <div className="text-center">
                        <Users
                          size={24}
                          className="mx-auto mb-2 text-green-400"
                        />
                        <div className="font-semibold">Cộng tác viên</div>
                        <div className="text-xs text-gray-400 mt-1">
                          Làm việc chung
                        </div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole("OBSERVER")}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                        role === "OBSERVER"
                          ? "border-gray-400 bg-gradient-to-br from-gray-400/30 to-gray-500/20 shadow-lg shadow-gray-400/30 scale-105"
                          : "border-gray-600/50 bg-gray-800/40 hover:border-gray-400/50 hover:bg-gray-400/10"
                      }`}
                    >
                      <div className="text-center">
                        <Eye size={24} className="mx-auto mb-2 text-gray-400" />
                        <div className="font-semibold">Quan sát viên</div>
                        <div className="text-xs text-gray-400 mt-1">
                          Chỉ xem
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Anonymous - Chỉ hiển thị khi chọn Cộng tác viên */}
                {role === "COLLABORATOR" && (
                  <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-4 border-2 border-gray-700/50 hover:border-purple-500/30 transition-all duration-300 shadow-lg">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={anonymous}
                        onChange={(e) => setAnonymous(e.target.checked)}
                        className="w-5 h-5 rounded bg-gray-700 border-2 border-gray-600 text-purple-600 focus:ring-2 focus:ring-purple-500/50 transition-all duration-200 group-hover:border-purple-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <EyeOff
                            size={18}
                            className="text-gray-400 group-hover:text-purple-400 transition-colors"
                          />
                          <span className="font-semibold text-gray-200 group-hover:text-white transition-colors">
                            Ẩn danh
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          Thành viên khác không thấy thông tin chi tiết của
                          người này
                        </p>
                      </div>
                    </label>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 via-purple-500 to-blue-600 text-white font-bold py-4 px-6 rounded-xl hover:from-purple-700 hover:via-purple-600 hover:to-blue-700 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/50 shadow-xl shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-xl flex items-center justify-center gap-2 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  {loading ? (
                    <>
                      <Loader className="animate-spin" size={20} />
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <UserPlus size={20} />
                      Gửi Tín Hiệu Triệu Tập
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Pending Invitations Tab - Chỉ owner */}
          {activeTab === "pending" && isOwner === true && (
            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-3">
                <Mail className="text-purple-400" />
                Lời mời đang chờ phản hồi
              </h2>

              {loading ? (
                <div className="text-center py-6">
                  <Loader
                    className="animate-spin mx-auto mb-4 text-purple-400"
                    size={48}
                  />
                  <p className="text-gray-400">Đang tải...</p>
                </div>
              ) : pendingInvitations.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-2 border-purple-500/30 flex items-center justify-center">
                    <Mail size={48} className="text-purple-400" />
                  </div>
                  <p className="text-gray-400 text-lg">
                    Chưa có lời mời nào đang chờ
                  </p>
                  <p className="text-gray-500 text-sm mt-2">
                    Các lời mời đang chờ sẽ hiển thị ở đây
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingInvitations.map((invitation) => (
                    <div
                      key={invitation.invitationId}
                      className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 border-2 border-gray-700/50 rounded-xl p-5 hover:border-purple-500/60 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 transform hover:scale-[1.02] group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform duration-300">
                              <Mail size={20} className="text-white" />
                            </div>
                            <div>
                              <div className="font-semibold">
                                {invitation.invitedEmail ||
                                  invitation.inviteeEmail}
                              </div>
                              <div className="text-sm text-gray-400">
                                Hết hạn: {formatDate(invitation.expiresAt)}
                              </div>
                            </div>
                          </div>
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeColor(
                              invitation.invitedRole || invitation.role || ""
                            )}`}
                          >
                            {getRoleLabel(
                              invitation.invitedRole || invitation.role || ""
                            )}
                          </span>
                        </div>
                        <button
                          onClick={() =>
                            handleCancelInvitation(invitation.invitationId)
                          }
                          className="p-2.5 text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-lg transition-all duration-200 hover:scale-110 border border-transparent hover:border-red-500/30"
                          title="Hủy lời mời"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Members Tab */}
          {activeTab === "members" && (
            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-3">
                <Users className="text-purple-400" />
                Danh sách thành viên
              </h2>

              {anonymousCount > 0 && (
                <div className="mb-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-sm text-yellow-300">
                  <AlertCircle size={16} className="inline mr-2" />
                  Có {anonymousCount} cộng tác viên ẩn danh trong dự án
                </div>
              )}

              {loading ? (
                <div className="text-center py-6">
                  <Loader
                    className="animate-spin mx-auto mb-4 text-purple-400"
                    size={48}
                  />
                  <p className="text-gray-400">Đang tải...</p>
                </div>
              ) : members.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-2 border-purple-500/30 flex items-center justify-center">
                    <Users size={48} className="text-purple-400" />
                  </div>
                  <p className="text-gray-300 text-lg font-semibold mb-2">
                    🌑 Tàu của bạn hiện chưa có phi hành đoàn
                  </p>
                  <p className="text-gray-500 text-sm">
                    Hãy mời các thành viên để bắt đầu hành trình
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {members.map((member, index) => (
                    <div
                      key={member.userId || index}
                      className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 border-2 border-gray-700/50 rounded-xl p-5 hover:border-purple-500/60 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 transform hover:scale-[1.02] group"
                    >
                      <div className="flex items-center gap-4">
                        {member.fullName ? (
                          <div className="relative">
                            <img
                              src={
                                member.avatarUrl ||
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                  member.fullName
                                )}&background=6366f1&color=fff`
                              }
                              alt={member.fullName}
                              className="w-14 h-14 rounded-full border-2 border-gray-600 group-hover:border-purple-500/50 transition-all duration-300 shadow-lg"
                            />
                            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/0 to-blue-500/0 group-hover:from-purple-500/20 group-hover:to-blue-500/20 transition-all duration-300" />
                          </div>
                        ) : (
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center border-2 border-gray-600 group-hover:border-purple-500/50 transition-all duration-300 shadow-lg">
                            <EyeOff size={24} className="text-gray-500" />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="font-semibold flex items-center gap-2">
                            {member.fullName || "[Ẩn danh]"}
                            {member.anonymous && (
                              <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded-full border border-yellow-500/30">
                                Ẩn danh
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-400">
                            {member.email || "Thông tin được bảo mật"}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 ml-auto">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeColor(
                              member.role
                            )}`}
                          >
                            {getRoleLabel(member.role)}
                          </span>
                          {canRemoveMembers && member.role !== "OWNER" && (
                            <button
                              onClick={() => handleRemoveMember(member)}
                              disabled={removingMemberId === member.userId}
                              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-300 bg-gradient-to-r from-red-900/40 to-red-800/30 border-2 border-red-700/50 rounded-lg hover:bg-red-800/60 hover:border-red-600/70 hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg"
                            >
                              {removingMemberId === member.userId ? (
                                <>
                                  <Loader className="w-4 h-4 animate-spin" />
                                  Đang xóa...
                                </>
                              ) : (
                                <>
                                  <Trash2 className="w-4 h-4" />
                                  Xóa
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Custom Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 border-2 border-red-500/30 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl shadow-red-500/20">
            {/* Modal Header */}
            <div className="text-center mb-5">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500/30 to-red-600/20 flex items-center justify-center mx-auto mb-3 border-2 border-red-500/50 shadow-lg shadow-red-500/30">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                Xác nhận hủy lời mời
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Bạn có chắc chắn muốn hủy lời mời này? Hành động này không thể
                hoàn tác.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-2">
              <button
                onClick={cancelCancelInvitation}
                className="flex-1 bg-gray-700/60 hover:bg-gray-600/70 text-gray-300 hover:text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-300 border-2 border-gray-600/50 hover:border-gray-500/70 text-sm"
              >
                Hủy bỏ
              </button>
              <button
                onClick={confirmCancelInvitation}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-red-600 via-red-500 to-red-600 hover:from-red-700 hover:via-red-600 hover:to-red-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
              >
                {loading ? (
                  <>
                    <Loader className="animate-spin w-4 h-4" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Xác nhận hủy
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Member Confirmation Modal */}
      {showRemoveModal && memberToRemove && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 border-2 border-red-500/30 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl shadow-red-500/20">
            {/* Modal Header */}
            <div className="text-center mb-5">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500/30 to-red-600/20 flex items-center justify-center mx-auto mb-3 border-2 border-red-500/50 shadow-lg shadow-red-500/30">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                Xác nhận xóa thành viên
              </h3>
              <div className="mb-3 p-3 bg-gray-800/50 rounded-xl border border-gray-700/50">
                {memberToRemove.avatarUrl ? (
                  <img
                    src={memberToRemove.avatarUrl}
                    alt={memberToRemove.fullName || "Thành viên"}
                    className="w-12 h-12 rounded-full mx-auto mb-2 border-2 border-gray-600"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mx-auto mb-2 border-2 border-gray-600 text-white font-bold text-lg">
                    {memberToRemove.fullName?.[0]?.toUpperCase() || "?"}
                  </div>
                )}
                <p className="text-white font-semibold text-base">
                  {memberToRemove.fullName || "[Ẩn danh]"}
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  {memberToRemove.email || "Thông tin được bảo mật"}
                </p>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                Bạn có chắc chắn muốn xóa{" "}
                <span className="font-semibold text-white">
                  {memberToRemove.fullName || "thành viên này"}
                </span>{" "}
                khỏi dự án? Hành động này không thể hoàn tác.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-2">
              <button
                onClick={cancelRemoveMember}
                className="flex-1 bg-gray-700/60 hover:bg-gray-600/70 text-gray-300 hover:text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-300 border-2 border-gray-600/50 hover:border-gray-500/70 text-sm"
              >
                Huỷ
              </button>
              <button
                onClick={confirmRemoveMember}
                disabled={removingMemberId === memberToRemove.userId}
                className="flex-1 bg-gradient-to-r from-red-600 via-red-500 to-red-600 hover:from-red-700 hover:via-red-600 hover:to-red-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
              >
                {removingMemberId === memberToRemove.userId ? (
                  <>
                    <Loader className="animate-spin w-4 h-4" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    OK
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite cubic-bezier(0.4, 0, 0.2, 1);
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(55, 65, 81, 0.3);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, rgba(147, 51, 234, 0.5), rgba(59, 130, 246, 0.5));
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, rgba(147, 51, 234, 0.7), rgba(59, 130, 246, 0.7));
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(147, 51, 234, 0.5) rgba(55, 65, 81, 0.3);
        }
      `}</style>
    </div>
  );
}
