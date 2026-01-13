import { type TabButtonProps } from '../../../types/projectWorkspaceDetail';

const TabButton = ({ label, icon: Icon, isActive, onClick }: TabButtonProps) => (
    <button
        onClick={onClick}
        className={`group relative flex items-center gap-2 md:gap-3 px-4 md:px-6 py-3 md:py-3.5 rounded-t-xl font-semibold transition-all duration-300 overflow-hidden ${
            isActive 
                ? 'text-white' 
                : 'text-gray-400 hover:text-gray-200'
        }`}
    >
        {/* Active Background Glow */}
        {isActive && (
            <>
                <div className="absolute inset-0 bg-gradient-to-b from-purple-500/30 via-purple-600/20 to-transparent rounded-t-xl"></div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-cyan-500/10 rounded-t-xl"></div>
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 via-cyan-500/20 to-purple-500/20 rounded-t-xl blur-sm opacity-50"></div>
            </>
        )}
        
        {/* Hover Effect */}
        {!isActive && (
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        )}
        
        {/* Icon with glow effect */}
        <div className={`relative z-10 transition-all duration-300 ${
            isActive 
                ? 'text-purple-300 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]' 
                : 'text-gray-400 group-hover:text-purple-300 group-hover:drop-shadow-[0_0_6px_rgba(168,85,247,0.5)]'
        }`}>
            <Icon size={18} className="transition-transform duration-300 group-hover:scale-110" />
        </div>
        
        {/* Label */}
        <span className={`relative z-10 hidden md:inline transition-all duration-300 ${
            isActive 
                ? 'text-white font-bold' 
                : 'text-gray-400 group-hover:text-white'
        }`}>
            {label}
        </span>
        
        {/* Active Indicator Dot */}
        {isActive && (
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,211,238,1)]"></div>
        )}
    </button>
);

export default TabButton;

