import { ConversationCreationResponse } from "@/types/chat";
import { Loader2 } from "lucide-react";

interface ConversationsListProps {
    conversations: ConversationCreationResponse[];
    selectedConversationId: string | null;
    onConversationSelect: (conversationId: string) => void;
    loading?: boolean;
}

export const ConversationsList: React.FC<ConversationsListProps> = ({
    conversations,
    selectedConversationId,
    onConversationSelect,
    loading = false
}) => {
    const getConversationDisplayName = (conversation: ConversationCreationResponse): string => {
        if (conversation.conversationName) {
            return conversation.conversationName;
        }
        // If no name, use first participant's username
        if (conversation.participantInfo && conversation.participantInfo.length > 0) {
            return conversation.participantInfo[0].username || "Unknown";
        }
        return "Chat";
    };

    const getConversationAvatar = (conversation: ConversationCreationResponse): string | null => {
        if (conversation.conversationAvatar) {
            return conversation.conversationAvatar;
        }
        // If no avatar, use first participant's avatar
        if (conversation.participantInfo && conversation.participantInfo.length > 0) {
            return conversation.participantInfo[0].avatar;
        }
        return null;
    };

    const getInitials = (name: string): string => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
            </div>
        );
    }

    if (conversations.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <p className="text-sm">Chưa có cuộc trò chuyện nào</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto">
                {conversations.map((conversation) => {
                    const displayName = getConversationDisplayName(conversation);
                    const avatar = getConversationAvatar(conversation);
                    const isSelected = conversation.id === selectedConversationId;

                    return (
                        <button
                            key={conversation.id}
                            onClick={() => onConversationSelect(conversation.id)}
                            className={`w-full flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-dark-bg/60 transition-colors ${isSelected ? 'bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500' : ''
                                }`}
                        >
                            {/* Avatar */}
                            <div className="relative flex-shrink-0">
                                {avatar ? (
                                    <img
                                        src={avatar}
                                        alt={displayName}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
                                        {getInitials(displayName)}
                                    </div>
                                )}
                            </div>

                            {/* Conversation Info */}
                            <div className="flex-1 min-w-0 text-left">
                                <p className={`text-sm font-semibold truncate ${isSelected
                                        ? 'text-purple-600 dark:text-purple-400'
                                        : 'text-gray-900 dark:text-text-primary'
                                    }`}>
                                    {displayName}
                                </p>
                                {conversation.conversationType === 'GROUP' && (
                                    <p className="text-xs text-gray-500 dark:text-text-secondary">
                                        Nhóm • {conversation.participantInfo?.length || 0} thành viên
                                    </p>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

