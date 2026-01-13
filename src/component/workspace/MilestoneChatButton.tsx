import { MessageCircle } from 'lucide-react';

interface MilestoneChatButtonProps {
    onClick: () => void;
    hasUnread?: boolean;
    className?: string;
}

export const MilestoneChatButton: React.FC<MilestoneChatButtonProps> = ({ onClick, hasUnread, className }) => {
    const defaultClassName = "fixed bottom-24 right-6 z-[51] w-14 h-14 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center group";
    const finalClassName = className || defaultClassName;
    
    return (
        <button
            onClick={onClick}
            className={finalClassName}
            aria-label="Mở chat"
            title="Chat với nhóm"
        >
            <MessageCircle size={24} className="group-hover:scale-110 transition-transform" />
            {hasUnread && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse" />
            )}
        </button>
    );
};

