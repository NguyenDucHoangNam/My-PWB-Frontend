"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { X, Upload, Users, Image as ImageIcon } from "lucide-react";
import milestoneService, {
  MilestoneDetailResponse,
  AvailableProjectMemberResponse,
} from "../../services/milestoneService";
import toast from "react-hot-toast";

// Add spin-slow animation style
const spinSlowStyle = `
    @keyframes spin-slow {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    .animate-spin-slow {
        animation: spin-slow 8s linear infinite;
    }
`;

const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

interface CreateMilestoneGroupChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number | string;
  milestoneId: number | string;
  milestoneDetail: MilestoneDetailResponse | null;
  onGroupChatCreated?: () => void;
  filterType?: "INTERNAL" | "CLIENT"; // INTERNAL: loại bỏ CLIENT, CLIENT: tất cả members
}

export const CreateMilestoneGroupChatModal: React.FC<
  CreateMilestoneGroupChatModalProps
> = ({
  isOpen,
  onClose,
  projectId,
  milestoneId,
  milestoneDetail,
  onGroupChatCreated,
  filterType,
}) => {
  const [groupName, setGroupName] = useState("");
  const [selectedMemberIds, setSelectedMemberIds] = useState<number[]>([]);
  const [groupAvatar, setGroupAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<
    AvailableProjectMemberResponse[]
  >([]);
  const [isSearching, setIsSearching] = useState(false);
  const [errors, setErrors] = useState<{
    groupName?: string;
    participants?: string;
    avatar?: string;
  }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Search users when search query changes
  const searchUsers = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const results = await milestoneService.searchUsersForMilestoneChat(
          projectId,
          milestoneId,
          query.trim()
        );
        setSearchResults(results);
      } catch (error) {
        setSearchResults([]);
        console.error("Error searching users:", error);
      } finally {
        setIsSearching(false);
      }
    },
    [projectId, milestoneId]
  );

  useEffect(() => {
    searchUsers(debouncedSearchQuery);
  }, [debouncedSearchQuery, searchUsers]);

  // Get current user email from JWT token
  const getCurrentUserEmail = (): string | null => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return null;
      const parts = token.split(".");
      if (parts.length < 2) return null;
      const decoded = JSON.parse(
        atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"))
      );
      const email = decoded?.email || decoded?.sub || null;
      return email ? String(email) : null;
    } catch (error) {
      console.warn("Failed to decode current user email from token", error);
      return null;
    }
  };

  // Get current user ID by matching email with members
  const currentUserEmail = getCurrentUserEmail();
  const currentUserMember = currentUserEmail
    ? (milestoneDetail?.members || []).find(
        (member) => member.userEmail === currentUserEmail
      )
    : null;
  const currentUserId = currentUserMember?.userId || null;

  // Filter members based on filterType
  const filterMembers = useCallback(
    (members: Array<{ userId: number; role?: string }>) => {
      if (filterType === "INTERNAL") {
        // Loại bỏ CLIENT
        return members.filter((member) => member.role !== "CLIENT");
      } else {
        // CLIENT or undefined: tất cả members
        return members;
      }
    },
    [filterType]
  );

  // Get available members - use search results if searching, otherwise use milestone detail members
  const availableMembers = useMemo(() => {
    if (searchQuery.trim() && searchResults.length > 0) {
      // Filter search results based on filterType
      let filtered: AvailableProjectMemberResponse[];
      if (filterType === "INTERNAL") {
        // Loại bỏ CLIENT từ search results
        filtered = searchResults.filter(
          (user) => user.projectRole !== "CLIENT"
        );
      } else {
        // CLIENT or undefined: tất cả search results
        filtered = searchResults;
      }

      // Filter out current user
      return filtered.filter(
        (user) => !currentUserId || user.userId !== currentUserId
      );
    }
    // Use milestone detail members when not searching
    const filtered = filterMembers(milestoneDetail?.members || []);
    return filtered.filter(
      (member) => !currentUserId || member.userId !== currentUserId
    );
  }, [
    searchQuery,
    searchResults,
    milestoneDetail,
    currentUserId,
    filterMembers,
    filterType,
  ]);

  // Handle avatar selection
  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({ ...prev, avatar: "Vui lòng chọn file ảnh" }));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        avatar: "Kích thước ảnh không được vượt quá 5MB",
      }));
      return;
    }

    setGroupAvatar(file);
    setErrors((prev) => ({ ...prev, avatar: undefined }));

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle member toggle
  const toggleMember = (userId: number) => {
    setSelectedMemberIds((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
    setErrors((prev) => ({ ...prev, participants: undefined }));
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Reset errors
    setErrors({});

    // Validate group name
    if (!groupName.trim()) {
      setErrors((prev) => ({
        ...prev,
        groupName: "Tên group chat không được để trống",
      }));
      return;
    }

    if (groupName.trim().length > 100) {
      setErrors((prev) => ({
        ...prev,
        groupName: "Tên group chat không được vượt quá 100 ký tự",
      }));
      return;
    }

    // Validate participants
    if (selectedMemberIds.length === 0) {
      setErrors((prev) => ({
        ...prev,
        participants: "Vui lòng chọn ít nhất một thành viên",
      }));
      return;
    }

    setIsCreating(true);
    try {
      // Automatically include current user (OWNER) in participantIds
      const finalParticipantIds = currentUserId
        ? [...new Set([currentUserId, ...selectedMemberIds])] // Ensure no duplicates
        : selectedMemberIds;

      await milestoneService.createGroupChatForMilestone(
        projectId,
        milestoneId,
        {
          participantIds: finalParticipantIds,
          conversationName: groupName.trim(),
        },
        groupAvatar || undefined
      );

      toast.success("Tạo group chat thành công!");
      if (onGroupChatCreated) {
        onGroupChatCreated();
      }
      onClose();
    } catch (error: any) {
      const errorMessage = error.message || "Không thể tạo group chat";
      toast.error(errorMessage);
      console.error("Error creating group chat:", error);
    } finally {
      setIsCreating(false);
    }
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setGroupName("");
      setSelectedMemberIds([]);
      setGroupAvatar(null);
      setAvatarPreview("");
      setSearchQuery("");
      setSearchResults([]);
      setErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <style>{spinSlowStyle}</style>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[10000] p-4">
        <div className="relative bg-gradient-to-br from-gray-900/95 via-purple-900/95 to-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden border border-purple-500/30">
          {/* Cosmic Orbital Ring Effect */}
          <div className="absolute -inset-1 rounded-2xl border border-dashed border-purple-400/20 animate-spin-slow pointer-events-none"></div>

          {/* Header */}
          <div className="relative flex items-center justify-center p-4 border-b border-purple-500/20">
            <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-cyan-300 to-purple-300">
              Tạo Group Chat cho Cột mốc
            </h2>
            <button
              onClick={onClose}
              className="absolute right-4 w-8 h-8 bg-purple-900/40 hover:bg-purple-800/60 rounded-full flex items-center justify-center transition-all text-purple-300 hover:text-purple-100 border border-purple-500/30 hover:border-purple-400/50 hover:shadow-[0_0_15px_rgba(168,85,247,0.5)]"
              disabled={isCreating}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Avatar Selection */}
            <div>
              <label className="block text-xs font-semibold text-purple-300 mb-2">
                Avatar Group <span className="text-gray-400">(Tùy chọn)</span>
              </label>
              <div className="flex items-center gap-3">
                <div className="relative">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar preview"
                      className="w-16 h-16 rounded-full object-cover border-2 border-purple-400/60 shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/80 to-indigo-600/80 flex items-center justify-center border-2 border-purple-400/60 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                      <ImageIcon className="w-7 h-7 text-purple-200" />
                    </div>
                  )}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-0.5 -right-0.5 w-6 h-6 bg-purple-600 hover:bg-purple-500 rounded-full flex items-center justify-center text-white transition-all shadow-lg hover:shadow-[0_0_10px_rgba(168,85,247,0.6)]"
                    disabled={isCreating}
                  >
                    <Upload className="w-3 h-3" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarSelect}
                    className="hidden"
                    disabled={isCreating}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-300">
                    Chọn ảnh đại diện cho group chat
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    JPG, PNG. Tối đa 5MB
                  </p>
                  {errors.avatar && (
                    <p className="text-xs text-red-400 mt-1">{errors.avatar}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Group Name */}
            <div>
              <label className="block text-xs font-semibold text-purple-300 mb-2">
                Tên Group Chat <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => {
                  setGroupName(e.target.value);
                  setErrors((prev) => ({ ...prev, groupName: undefined }));
                }}
                placeholder="Nhập tên group chat..."
                maxLength={100}
                className="w-full px-3 py-2.5 border border-purple-500/30 rounded-lg bg-gray-900/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400/60 transition-all backdrop-blur-sm"
                disabled={isCreating}
              />
              <div className="flex justify-between items-center mt-1">
                {errors.groupName && (
                  <p className="text-xs text-red-400">{errors.groupName}</p>
                )}
                <p className="text-xs text-gray-500 ml-auto">
                  {groupName.length}/100
                </p>
              </div>
            </div>

            {/* Member Selection */}
            <div>
              <label className="block text-xs font-semibold text-purple-300 mb-2">
                Chọn Thành viên <span className="text-red-400">*</span>
              </label>
              {errors.participants && (
                <p className="text-xs text-red-400 mb-2">
                  {errors.participants}
                </p>
              )}

              {/* Search Input */}
              <div className="relative mb-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm thành viên..."
                  className="w-full pl-9 pr-4 py-2 border border-purple-500/30 rounded-lg bg-gray-900/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400/60 transition-all backdrop-blur-sm"
                  disabled={isCreating}
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                {isSearching && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <div className="w-3.5 h-3.5 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                  </div>
                )}
              </div>

              {isSearching && searchQuery.trim() ? (
                <div className="text-center py-6 bg-gray-900/30 rounded-lg border border-purple-500/20">
                  <div className="w-6 h-6 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-xs text-gray-400">Đang tìm kiếm...</p>
                </div>
              ) : availableMembers.length === 0 ? (
                <div className="text-center py-6 bg-gray-900/30 rounded-lg border border-purple-500/20">
                  <Users className="w-10 h-10 text-gray-500 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">
                    {searchQuery.trim()
                      ? `Không tìm thấy thành viên với từ khóa "${searchQuery}"`
                      : "Không có thành viên nào trong cột mốc"}
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {availableMembers.map((member) => {
                    // Handle both MilestoneDetailResponse.members and AvailableProjectMemberResponse
                    const memberId = "id" in member ? member.id : member.userId;
                    const userId = member.userId;
                    const userName =
                      "userName" in member ? member.userName : `User ${userId}`;
                    const userEmail =
                      "userEmail" in member ? member.userEmail : "";
                    const isAnonymous =
                      "isAnonymous" in member ? member.isAnonymous : false;
                    const role =
                      "role" in member
                        ? member.role
                        : "projectRole" in member
                        ? member.projectRole
                        : "Thành viên";

                    const isSelected = selectedMemberIds.includes(userId);
                    return (
                      <button
                        key={String(memberId)}
                        onClick={() => toggleMember(userId)}
                        disabled={isCreating}
                        className={`w-full flex items-center gap-2.5 p-2 rounded-lg border transition-all text-left ${
                          isSelected
                            ? "bg-purple-500/20 border-purple-400/60 shadow-[0_0_10px_rgba(168,85,247,0.3)]"
                            : "bg-gray-900/30 border-purple-500/20 hover:bg-purple-500/10 hover:border-purple-400/40"
                        }`}
                      >
                        {isAnonymous ? (
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-500 to-gray-700 flex items-center justify-center text-white font-medium text-xs flex-shrink-0">
                            ?
                          </div>
                        ) : (
                          <img
                            src={
                              userEmail
                                ? `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                    userName || userEmail
                                  )}&background=6366f1&color=fff`
                                : "https://placehold.co/36x36"
                            }
                            alt={userName}
                            className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-200 truncate">
                            {isAnonymous
                              ? userName || "Thành viên ẩn danh"
                              : userName}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {role || "Thành viên"}
                          </p>
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                            isSelected
                              ? "bg-purple-500 border-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.5)]"
                              : "border-gray-500"
                          }`}
                        >
                          {isSelected && (
                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {selectedMemberIds.length > 0 && (
                <div className="mt-2 p-2 bg-purple-500/10 rounded-lg border border-purple-400/30">
                  <p className="text-xs font-medium text-purple-300">
                    Đã chọn {selectedMemberIds.length} thành viên
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-gray-900/50 backdrop-blur-xl border-t border-purple-500/20">
            <div className="flex gap-2.5">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-purple-500/30 text-gray-300 rounded-lg hover:bg-gray-800/50 hover:border-purple-400/50 transition-all text-sm font-medium"
                disabled={isCreating}
              >
                Hủy
              </button>
              <button
                onClick={handleSubmit}
                disabled={
                  isCreating ||
                  !groupName.trim() ||
                  selectedMemberIds.length === 0
                }
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium flex items-center justify-center gap-2 shadow-lg hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] disabled:shadow-none"
              >
                {isCreating ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <Users className="w-3.5 h-3.5" />
                    Tạo Group Chat
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
