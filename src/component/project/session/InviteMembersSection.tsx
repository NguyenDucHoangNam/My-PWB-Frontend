import React, { useState, useEffect } from "react";
import {
  Users,
  UserCheck,
  Crown,
  Briefcase,
  User as UserIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import projectService from "../../../services/projectService";

interface ProjectMember {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  userAvatarUrl?: string;
  role: "OWNER" | "COLLABORATOR" | "CLIENT";
  joinedAt: string;
}

interface InviteMembersSectionProps {
  projectId: number;
  selectedMemberIds: number[];
  selectedRoles: ("OWNER" | "COLLABORATOR" | "CLIENT")[];
  onMemberIdsChange: (ids: number[]) => void;
  onRolesChange: (roles: ("OWNER" | "COLLABORATOR" | "CLIENT")[]) => void;
}

const InviteMembersSection: React.FC<InviteMembersSectionProps> = ({
  projectId,
  selectedMemberIds,
  selectedRoles,
  onMemberIdsChange,
  onRolesChange,
}) => {
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteMode, setInviteMode] = useState<"specific" | "roles" | "none">(
    "none"
  );

  useEffect(() => {
    loadProjectMembers();
  }, [projectId]);

  const loadProjectMembers = async () => {
    try {
      setLoading(true);
      const response = await projectService.getProjectMembers(projectId, {
        page: 0,
        size: 100, // Load all members for selection
      });

      // Map API response to our interface and filter out anonymous members
      const mappedMembers: ProjectMember[] = response.members.content
        .filter((member) => !member.anonymous) // Filter out anonymous members
        .map((member) => ({
          id: member.userId, // Use userId as id
          userId: member.userId,
          userName: member.fullName,
          userEmail: member.email,
          userAvatarUrl: member.avatarUrl || undefined,
          role: member.role as "OWNER" | "COLLABORATOR" | "CLIENT",
          joinedAt: new Date().toISOString(), // API doesn't return joinedAt
        }));

      setMembers(mappedMembers);
    } catch (error) {
      console.error("Failed to load project members:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleMember = (userId: number) => {
    if (selectedMemberIds.includes(userId)) {
      onMemberIdsChange(selectedMemberIds.filter((id) => id !== userId));
    } else {
      onMemberIdsChange([...selectedMemberIds, userId]);
    }
  };

  const toggleRole = (role: "OWNER" | "COLLABORATOR" | "CLIENT") => {
    if (selectedRoles.includes(role)) {
      onRolesChange(selectedRoles.filter((r) => r !== role));
    } else {
      onRolesChange([...selectedRoles, role]);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "OWNER":
        return <Crown size={14} className="text-yellow-400" />;
      case "COLLABORATOR":
        return <Briefcase size={14} className="text-blue-400" />;
      case "CLIENT":
        return <UserIcon size={14} className="text-purple-400" />;
      default:
        return <Users size={14} />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "OWNER":
        return "Chủ dự án";
      case "COLLABORATOR":
        return "Cộng tác viên";
      case "CLIENT":
        return "Khách hàng";
      default:
        return role;
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-gray-300 mb-2 font-medium">
          <Users className="inline mr-2" size={16} />
          Mời thành viên (Tùy chọn)
        </label>
        <p className="text-sm text-gray-400 mb-3">
          Gửi email mời đến các thành viên được chọn. Họ sẽ tham gia trực tiếp
          mà không cần chờ duyệt.
        </p>

        {/* Invite Mode Selection */}
        <div className="flex gap-2 mb-3">
          <button
            type="button"
            onClick={() => {
              setInviteMode("none");
              onMemberIdsChange([]);
              onRolesChange([]);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              inviteMode === "none"
                ? "bg-purple-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Không mời ai
          </button>
          <button
            type="button"
            onClick={() => {
              setInviteMode("specific");
              onRolesChange([]);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              inviteMode === "specific"
                ? "bg-purple-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Chọn thành viên cụ thể
          </button>
          <button
            type="button"
            onClick={() => {
              setInviteMode("roles");
              onMemberIdsChange([]);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              inviteMode === "roles"
                ? "bg-purple-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Mời theo vai trò
          </button>
        </div>

        <AnimatePresence mode="wait">
          {/* Specific Members Selection */}
          {/* Specific Members Selection */}
          {inviteMode === "specific" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2 max-h-64 overflow-y-auto bg-gray-700/50 rounded-lg p-3"
            >
              {loading ? (
                <div className="text-center text-gray-400 py-4">
                  Đang tải...
                </div>
              ) : members.filter((m) => m.role !== "OWNER").length === 0 ? (
                <div className="text-center text-gray-400 py-4">
                  Không có thành viên nào để chọn
                </div>
              ) : (
                members
                  .filter((member) => member.role !== "OWNER") // <--- ẩn OWNER
                  .map((member) => (
                    <label
                      key={member.userId}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                        selectedMemberIds.includes(member.userId)
                          ? "bg-purple-600/30 border border-purple-500"
                          : "bg-gray-800 hover:bg-gray-700 border border-gray-600"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedMemberIds.includes(member.userId)}
                        onChange={() => toggleMember(member.userId)}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                      />

                      {member.userAvatarUrl ? (
                        <img
                          src={member.userAvatarUrl}
                          alt={member.userName}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                          {member.userName.charAt(0).toUpperCase()}
                        </div>
                      )}

                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">
                            {member.userName}
                          </span>
                          <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-gray-700">
                            {getRoleIcon(member.role)}
                            {getRoleLabel(member.role)}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400">
                          {member.userEmail}
                        </span>
                      </div>

                      {selectedMemberIds.includes(member.userId) && (
                        <UserCheck size={20} className="text-green-400" />
                      )}
                    </label>
                  ))
              )}
            </motion.div>
          )}

          {/* Role-based Selection */}
          {inviteMode === "roles" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2 bg-gray-700/50 rounded-lg p-3"
            >
              <p className="text-sm text-gray-400 mb-2">
                Chọn các vai trò để mời tất cả thành viên có vai trò đó:
              </p>

              {(['OWNER', 'COLLABORATOR', 'CLIENT'] as const)
  .filter(role => role !== 'OWNER') // Ẩn OWNER
  .map((role) => (
    <label
      key={role}
      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
        selectedRoles.includes(role)
          ? 'bg-purple-600/30 border border-purple-500'
          : 'bg-gray-800 hover:bg-gray-700 border border-gray-600'
      }`}
    >
      <input
        type="checkbox"
        checked={selectedRoles.includes(role)}
        onChange={() => toggleRole(role)}
        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
      />
      
      <div className="flex items-center gap-2 flex-1">
        {getRoleIcon(role)}
        <span className="text-white font-medium">{getRoleLabel(role)}</span>
      </div>

      <span className="text-xs text-gray-400">
        {members.filter(m => m.role === role).length} người
      </span>

      {selectedRoles.includes(role) && (
        <UserCheck size={20} className="text-green-400" />
      )}
    </label>
))}

            </motion.div>
          )}

          {/* No Invitation */}
          {inviteMode === "none" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center text-gray-400 py-4 bg-gray-700/30 rounded-lg"
            >
              Không gửi email mời. Thành viên có thể request join sau.
            </motion.div>
          )}
        </AnimatePresence>

        {/* Summary */}
        {(selectedMemberIds.length > 0 || selectedRoles.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 p-3 bg-purple-600/20 border border-purple-500/30 rounded-lg"
          >
            <p className="text-sm text-purple-200">
              <UserCheck className="inline mr-1" size={14} />
              {selectedMemberIds.length > 0 && (
                <span>Sẽ mời {selectedMemberIds.length} thành viên cụ thể</span>
              )}
              {selectedRoles.length > 0 && (
                <span>
                  {selectedMemberIds.length > 0 && " và "}
                  Sẽ mời tất cả{" "}
                  {selectedRoles.map((r) => getRoleLabel(r)).join(", ")}
                </span>
              )}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default InviteMembersSection;