import { useState, useEffect, useCallback } from 'react';
import milestoneService, { MilestoneDetailResponse } from '../../services/milestoneService';
import { ConversationCreationResponse } from '../../types/chat';
import toast from 'react-hot-toast';

interface UseMilestoneChatProps {
    projectId: number | string | null;
    milestoneId: number | string | null;
    chatType: 'INTERNAL' | 'CLIENT';
}

export const useMilestoneChat = ({ projectId, milestoneId, chatType }: UseMilestoneChatProps) => {
    const [groupChats, setGroupChats] = useState<ConversationCreationResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [milestoneDetail, setMilestoneDetail] = useState<MilestoneDetailResponse | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Load group chats for milestone
    const loadGroupChats = useCallback(async () => {
        if (!projectId || !milestoneId) return;

        setLoading(true);
        try {
            const chats = await milestoneService.getGroupChatsForMilestone(
                projectId,
                milestoneId,
                chatType
            );
            setGroupChats(chats);
        } catch (error: any) {
            console.error('Error loading group chats:', error);
            toast.error('Không thể tải danh sách group chat');
        } finally {
            setLoading(false);
        }
    }, [projectId, milestoneId, chatType]);

    // Load milestone detail
    const loadMilestoneDetail = useCallback(async () => {
        if (!projectId || !milestoneId) return;

        try {
            const detail = await milestoneService.getMilestoneDetail(projectId, milestoneId);
            setMilestoneDetail(detail);
        } catch (error: any) {
            console.error('Error loading milestone detail:', error);
        }
    }, [projectId, milestoneId]);

    // Load data on mount
    useEffect(() => {
        loadGroupChats();
        loadMilestoneDetail();
    }, [loadGroupChats, loadMilestoneDetail]);

    // Handle chat button click
    const handleChatClick = useCallback(() => {
        if (groupChats.length > 0) {
            // Open existing chat
            const chat = groupChats[0];
            // Dispatch event to open chat with conversation ID
            window.dispatchEvent(new CustomEvent('openGlobalChatWithConversation', {
                detail: { conversationId: chat.id }
            }));
        } else {
            // Show create modal
            setShowCreateModal(true);
        }
    }, [groupChats]);

    // Handle group chat created
    const handleGroupChatCreated = useCallback(() => {
        loadGroupChats();
        setShowCreateModal(false);
    }, [loadGroupChats]);

    return {
        groupChats,
        loading,
        milestoneDetail,
        showCreateModal,
        setShowCreateModal,
        handleChatClick,
        handleGroupChatCreated,
        reloadGroupChats: loadGroupChats,
    };
};

