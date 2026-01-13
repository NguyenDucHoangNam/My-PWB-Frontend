import { useState, useEffect, useCallback, useMemo } from "react";
import projectService from "../../services/projectService";
import type {
  Invitation,
  ProjectMember,
  CreateInvitationPayload,
  ProjectPermissionResponse,
  InvitationSuggestion,
  TeamInvitationTab,
  InvitationRole,
} from "../../types/teamInvitation";

interface UseTeamInvitationProps {
  projectId: number;
}

/**
 * Hook để quản lý toàn bộ logic của TeamInvitationPage
 */
export const useTeamInvitation = ({ projectId }: UseTeamInvitationProps) => {
  // States
  const [activeTab, setActiveTab] = useState<TeamInvitationTab>("members");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Invite form
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<InvitationRole>("COLLABORATOR");
  const [anonymous, setAnonymous] = useState(false);

  // Suggestions
  const [suggestions, setSuggestions] = useState<InvitationSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionsError, setSuggestionsError] = useState<string | null>(null);

  // Data lists
  const [pendingInvitations, setPendingInvitations] = useState<Invitation[]>([]);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [membersPage] = useState(0);
  const [anonymousCount, setAnonymousCount] = useState(0);
  const [isOwner, setIsOwner] = useState<boolean | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [invitationToCancel, setInvitationToCancel] = useState<number | null>(null);
  const [permissions, setPermissions] = useState<ProjectPermissionResponse | null>(null);
  const [removingMemberId, setRemovingMemberId] = useState<number | null>(null);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<ProjectMember | null>(null);

  // Computed values
  const canRemoveMembers = useMemo(
    () => permissions?.project?.canRemoveMembers ?? isOwner === true,
    [permissions, isOwner]
  );

  // Helper function to parse members response
  const parseMembersResponse = useCallback((data: any): ProjectMember[] => {
    if (data.members && data.members.content) {
      return data.members.content;
    } else if (Array.isArray(data.members)) {
      return data.members;
    }
    return [];
  }, []);

  // Load pending invitations
  const loadPendingInvitations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await projectService.getPendingInvitations(projectId);
      setPendingInvitations(data || []);
      setError(null);
    } catch (err: any) {
      console.error("Error loading invitations:", err);
      if (err.message.includes("401") || err.message.includes("Unauthorized")) {
        setError("Bạn cần đăng nhập để xem danh sách lời mời.");
      } else if (
        err.message.includes("403") ||
        err.message.includes("Forbidden")
      ) {
        setError("Bạn không có quyền xem lời mời của dự án này.");
      } else {
        setError(err.message || "Không thể tải danh sách lời mời.");
      }
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // Load members
  const loadMembers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await projectService.getProjectMembers(projectId, {
        page: membersPage,
        size: 10,
      });

      const membersList = parseMembersResponse(data);
      setMembers(membersList);
      setAnonymousCount(data.anonymousCollaboratorCount || 0);
      setError(null);
    } catch (err: any) {
      console.error("Error loading members:", err);
      if (err.message.includes("401") || err.message.includes("Unauthorized")) {
        setError("Bạn cần đăng nhập để xem danh sách thành viên.");
      } else if (
        err.message.includes("403") ||
        err.message.includes("Forbidden")
      ) {
        setError("Bạn không có quyền xem danh sách thành viên của dự án này.");
      } else {
        setError(err.message || "Không thể tải danh sách thành viên.");
      }
    } finally {
      setLoading(false);
    }
  }, [projectId, membersPage, parseMembersResponse]);

  // Check owner permission and load initial data
  useEffect(() => {
    const checkOwnerPermission = async () => {
      if (!projectId) return;

      setLoading(true);

      try {
        let permissionData: ProjectPermissionResponse | null = null;
        try {
          permissionData = await projectService.getProjectPermissionByProjectId(
            projectId
          );
          setPermissions(permissionData);
        } catch (permErr) {
          console.error("Error fetching project permissions:", permErr);
        }

        if (permissionData && permissionData.role.projectRole !== "OWNER") {
          setIsOwner(false);
          setActiveTab("members");

          try {
            const membersData = await projectService.getProjectMembers(
              projectId,
              {
                page: 0,
                size: 10,
              }
            );

            const membersList = parseMembersResponse(membersData);
            setMembers(membersList);
            setAnonymousCount(membersData.anonymousCollaboratorCount || 0);
          } catch (membersErr) {
            console.error("Error loading members for non-owner:", membersErr);
          }

          return;
        }

        const invitations = await projectService.getPendingInvitations(
          projectId
        );

        setIsOwner(true);
        setActiveTab("invite");
        setPendingInvitations(invitations || []);

        const membersData = await projectService.getProjectMembers(projectId, {
          page: 0,
          size: 10,
        });

        const membersList = parseMembersResponse(membersData);
        setMembers(membersList);
        setAnonymousCount(membersData.anonymousCollaboratorCount || 0);
      } catch (err: any) {
        const errorMsg = err.message || "";
        console.log("Permission check result:", errorMsg);

        if (
          errorMsg.includes("401") ||
          errorMsg.includes("Unauthorized") ||
          errorMsg.includes("đăng nhập")
        ) {
          setIsOwner(null);
          setActiveTab("members");
          setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          return;
        }

        if (errorMsg.includes("403") || errorMsg.includes("Forbidden")) {
          setIsOwner(false);
          setActiveTab("members");

          try {
            const membersData = await projectService.getProjectMembers(
              projectId,
              {
                page: 0,
                size: 10,
              }
            );

            const membersList = parseMembersResponse(membersData);
            setMembers(membersList);
            setAnonymousCount(membersData.anonymousCollaboratorCount || 0);
          } catch (membersErr) {
            console.error("Error loading members for non-owner:", membersErr);
          }
          return;
        }

        setIsOwner(false);
        setActiveTab("members");

        try {
          const membersData = await projectService.getProjectMembers(
            projectId,
            {
              page: 0,
              size: 10,
            }
          );

          const membersList = parseMembersResponse(membersData);
          setMembers(membersList);
          setAnonymousCount(membersData.anonymousCollaboratorCount || 0);
        } catch (membersErr) {
          console.error("Error loading members:", membersErr);
        }
      } finally {
        setLoading(false);
      }
    };

    checkOwnerPermission();
  }, [projectId, parseMembersResponse]);

  // Load data on tab change
  useEffect(() => {
    if (!projectId || isOwner === null) return;

    setError(null);

    if (activeTab === "pending" && isOwner === true) {
      if (pendingInvitations.length === 0) {
        loadPendingInvitations();
      }
    } else if (activeTab === "members") {
      loadMembers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, projectId, isOwner]);

  // Lắng nghe event khi có lời mời được chấp nhận/từ chối từ MyInvitationsPage
  useEffect(() => {
    if (!projectId || isOwner !== true) return;

    // Handler cho custom event (hoạt động trong cùng tab)
    const handleInvitationAccepted = (event: Event) => {
      const customEvent = event as CustomEvent<{ invitationId: number; projectId: number; timestamp: number }>;
      if (customEvent.detail && customEvent.detail.projectId === projectId) {
        console.log('Nhận được thông báo lời mời đã được chấp nhận:', customEvent.detail);
        // Reload danh sách pending invitations sau một chút delay
        setTimeout(() => {
          loadPendingInvitations();
          // Cũng reload members vì có thể có thành viên mới
          loadMembers();
        }, 1000);
      }
    };

    const handleInvitationDeclined = (event: Event) => {
      const customEvent = event as CustomEvent<{ invitationId: number; projectId: number; timestamp: number }>;
      if (customEvent.detail && customEvent.detail.projectId === projectId) {
        console.log('Nhận được thông báo lời mời đã bị từ chối:', customEvent.detail);
        // Reload danh sách pending invitations sau một chút delay
        setTimeout(() => {
          loadPendingInvitations();
        }, 1000);
      }
    };

    // Handler cho storage event (hoạt động giữa các tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'invitationAccepted' && e.newValue) {
        try {
          const data = JSON.parse(e.newValue);
          if (data.projectId === projectId) {
            console.log('Nhận được thông báo lời mời đã được chấp nhận từ tab khác:', data);
            setTimeout(() => {
              loadPendingInvitations();
              loadMembers();
            }, 1000);
          }
        } catch (err) {
          console.error('Error parsing invitationAccepted data:', err);
        }
      } else if (e.key === 'invitationDeclined' && e.newValue) {
        try {
          const data = JSON.parse(e.newValue);
          if (data.projectId === projectId) {
            console.log('Nhận được thông báo lời mời đã bị từ chối từ tab khác:', data);
            setTimeout(() => {
              loadPendingInvitations();
            }, 1000);
          }
        } catch (err) {
          console.error('Error parsing invitationDeclined data:', err);
        }
      }
    };

    // Đăng ký listeners
    window.addEventListener('invitationAccepted', handleInvitationAccepted);
    window.addEventListener('invitationDeclined', handleInvitationDeclined);
    window.addEventListener('storage', handleStorageChange);

    // Cleanup
    return () => {
      window.removeEventListener('invitationAccepted', handleInvitationAccepted);
      window.removeEventListener('invitationDeclined', handleInvitationDeclined);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [projectId, isOwner, loadPendingInvitations, loadMembers]);

  // Auto-hide success message after 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Reset anonymous when role changes
  useEffect(() => {
    if (role !== "COLLABORATOR" && anonymous) {
      setAnonymous(false);
    }
  }, [role, anonymous]);

  // Load suggestions
  const loadSuggestions = useCallback(async () => {
    if (!projectId || !isOwner) return;

    setLoadingSuggestions(true);
    setSuggestionsError(null);

    try {
      const data = await projectService.getInvitationSuggestions(projectId, {
        page: 0,
        size: 20,
      });
      setSuggestions(data.content || []);
    } catch (err: any) {
      console.error("Error loading suggestions:", err);
      setSuggestionsError(err.message);
      setSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  }, [projectId, isOwner]);

  // Handle email focus
  const handleEmailFocus = useCallback(() => {
    setShowSuggestions(true);
    if (suggestions.length === 0 && !loadingSuggestions) {
      loadSuggestions();
    }
  }, [suggestions.length, loadingSuggestions, loadSuggestions]);

  // Handle email blur
  const handleEmailBlur = useCallback(() => {
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  }, []);

  // Handle select suggestion
  const handleSelectSuggestion = useCallback((suggestion: InvitationSuggestion) => {
    setEmail(suggestion.email);
    setShowSuggestions(false);
  }, []);

  // Handle invite
  const handleInvite = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError(null);
      setSuccess(null);

      try {
        const payload: CreateInvitationPayload = { email, role, anonymous };
        await projectService.createInvitation(projectId, payload);

        setSuccess(`Đã gửi lời mời đến ${email}!`);
        setEmail("");
        setShowSuggestions(false);

        // Luôn reload danh sách pending invitations sau khi gửi thành công
        // để đảm bảo danh sách được cập nhật khi chuyển sang tab "pending"
        setTimeout(() => loadPendingInvitations(), 500);

        // Thông báo cho MyInvitationsPage để tự động reload
        // Sử dụng cả custom event và localStorage để đảm bảo hoạt động giữa các tab
        const event = new CustomEvent('invitationCreated', {
          detail: { projectId, email, timestamp: Date.now() }
        });
        window.dispatchEvent(event);
        
        // Lưu vào localStorage để trigger storage event (hoạt động giữa các tab)
        localStorage.setItem('invitationCreated', JSON.stringify({
          projectId,
          email,
          timestamp: Date.now()
        }));
        // Xóa ngay sau để lần sau vẫn trigger được
        setTimeout(() => {
          localStorage.removeItem('invitationCreated');
        }, 100);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [email, role, anonymous, projectId, activeTab, loadPendingInvitations]
  );

  // Handle cancel invitation
  const handleCancelInvitation = useCallback((invitationId: number) => {
    setInvitationToCancel(invitationId);
    setShowCancelModal(true);
  }, []);

  // Confirm cancel invitation
  const confirmCancelInvitation = useCallback(async () => {
    if (!invitationToCancel) return;

    setLoading(true);
    setError(null);
    setShowCancelModal(false);

    try {
      await projectService.cancelInvitation(projectId, invitationToCancel);
      setSuccess("Đã hủy lời mời");
      loadPendingInvitations();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setInvitationToCancel(null);
    }
  }, [projectId, invitationToCancel, loadPendingInvitations]);

  // Cancel cancel invitation modal
  const cancelCancelInvitation = useCallback(() => {
    setShowCancelModal(false);
    setInvitationToCancel(null);
  }, []);

  // Handle remove member - show modal
  const handleRemoveMember = useCallback((member: ProjectMember) => {
    if (!member?.userId) {
      setError("Không xác định được thành viên để xóa.");
      return;
    }

    if (member.role === "OWNER") {
      setError("Không thể xóa chủ dự án.");
      return;
    }

    setMemberToRemove(member);
    setShowRemoveModal(true);
  }, []);

  // Confirm remove member
  const confirmRemoveMember = useCallback(async () => {
    if (!memberToRemove?.userId) return;

    setRemovingMemberId(memberToRemove.userId);
    setError(null);
    setSuccess(null);
    setShowRemoveModal(false);

    try {
      await projectService.removeProjectMember(projectId, memberToRemove.userId);
      setSuccess("Xóa thành viên khỏi dự án thành công");
      setMembers((prev) => prev.filter((m) => m.userId !== memberToRemove.userId));
      if (memberToRemove.anonymous) {
        setAnonymousCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err: any) {
      const message =
        err?.message || "Không thể xóa thành viên khỏi dự án.";
      setError(message);
    } finally {
      setRemovingMemberId(null);
      setMemberToRemove(null);
    }
  }, [projectId, memberToRemove]);

  // Cancel remove member modal
  const cancelRemoveMember = useCallback(() => {
    setShowRemoveModal(false);
    setMemberToRemove(null);
  }, []);

  return {
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
    permissions,
    canRemoveMembers,

    // Modal
    showCancelModal,
    invitationToCancel,
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
    loadPendingInvitations,
    loadMembers,
  };
};

