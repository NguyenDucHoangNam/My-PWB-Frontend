import { useMemo } from 'react';
import { Radio, Battery, Hourglass } from 'lucide-react';
import { type StaticInfoPanelProps } from '../../../types/projectWorkspaceDetail';

const StaticInfoPanel = ({ milestone }: StaticInfoPanelProps) => {
    const formattedBudget = new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(milestone.budget);
    
    const formattedDeadline = new Date(milestone.deadline).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
    
    const statusConfig = useMemo(() => {
                switch (milestone.status) {
            case 'Chờ Khách hàng duyệt':
                return {
                    icon: <Radio size={20} className="text-amber-300" />,
                    textClass: 'text-white',
                    badgeClass: '',
                };
            case 'Đang Vận Hành':
                return {
                    icon: <Radio size={20} className="text-sky-300" />,
                    textClass: 'text-white',
                    badgeClass: '',
                };
            case 'Nhiệm Vụ Hoàn Thành':
                return {
                    icon: <Radio size={20} className="text-emerald-300" />,
                    textClass: 'text-white',
                    badgeClass: 'bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full',
                };
            default:
                return {
                    icon: <Radio size={20} className="text-slate-400" />,
                    textClass: 'text-white',
                    badgeClass: '',
                };
        }
    }, [milestone.status]);

    return (
        <div className="relative w-full">
            {/* Atmospheric Depth - Nebula Glow Backdrop */}
            <div className="absolute -inset-20 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-gradient-radial from-purple-500/30 via-cyan-500/20 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
                <div className="absolute top-1/3 right-1/4 w-[600px] h-[500px] bg-gradient-radial from-cyan-400/25 via-blue-500/15 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />
            </div>

            {/* Section 1: The Header (Identity) */}
            <div className="flex flex-col items-center gap-4 mb-8 relative z-10">
                {/* Title - Centered, Large and Beautiful */}
                <h1 className="text-5xl font-bold tracking-tight text-center bg-gradient-to-r from-purple-300 via-blue-300 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(168,85,247,0.8)]">
                    {milestone.title}
                </h1>
                
                {/* Description - Right below title, with scanlines */}
                <div className="relative max-w-3xl w-full">
                    {/* Scanline Overlay */}
                    <div 
                        className="absolute inset-0 pointer-events-none opacity-[0.03] z-10"
                        style={{
                            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(255,255,255,0.1) 1px, rgba(255,255,255,0.1) 2px)',
                        }}
                    />
                    {/* Laser Line at top */}
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                    
                    <p className="text-base text-slate-300/90 leading-relaxed whitespace-pre-wrap text-center relative z-0">
                        {milestone.description}
                    </p>
                </div>
            </div>

            {/* Section 2: The Telemetry Deck (3 Big Cards) - Living Nebula Glass */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                {/* Card 1: Signal/Status with Ripple Effect */}
                <div className="relative group">
                    {/* Living Nebula Glass Panel */}
                    <div className="relative rounded-xl p-4 bg-[#0B0E1E]/90 backdrop-blur-md border border-purple-500/40 transition-all duration-300 group-hover:border-purple-400/60 group-hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] overflow-hidden shadow-2xl">
                        {/* Vinyl Groove Pattern Background */}
                        <div 
                            className="absolute inset-0 opacity-[0.05] pointer-events-none"
                            style={{
                                background: `
                                    repeating-conic-gradient(
                                        from 0deg at 50% 50%,
                                        transparent 0deg,
                                        rgba(168, 85, 247, 0.08) 0.5deg,
                                        transparent 1deg,
                                        transparent 2deg
                                    ),
                                    repeating-radial-gradient(
                                        circle at center,
                                        transparent 0px,
                                        transparent 2px,
                                        rgba(34, 211, 238, 0.06) 2px,
                                        rgba(34, 211, 238, 0.06) 3px,
                                        transparent 3px,
                                        transparent 5px
                                    )
                                `,
                                backgroundSize: '100% 100%',
                                backgroundPosition: 'center',
                            }}
                        />

                        {/* Glass Shine Animation */}
                        <div className="absolute inset-0 glass-shine pointer-events-none"></div>

                        {/* Left Gradient Border */}
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 via-cyan-500 to-purple-500 group-hover:from-purple-400 group-hover:via-cyan-400 group-hover:to-purple-400 transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.8),0_0_40px_rgba(34,211,238,0.6)] group-hover:w-1.5"></div>
                        <div className="flex flex-col items-center justify-center gap-3 text-center h-full relative z-10">
                            {/* Icon with Ripple Effect */}
                            <div className="relative w-12 h-12 flex items-center justify-center">
                                {/* Ripple Rings */}
                                <div className="absolute inset-0 rounded-full border border-cyan-400/30 animate-ripple" />
                                <div className="absolute inset-0 rounded-full border border-cyan-400/20 animate-ripple" style={{ animationDelay: '1s' }} />
                                <div className="relative z-10 animate-pulse-slow">
                                    {statusConfig.icon}
                                </div>
                            </div>
                            <div className="flex flex-col gap-1 items-center">
                                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                                    TRẠM TÍN HIỆU
                                </span>
                                {statusConfig.badgeClass ? (
                                    <span className={`text-xs font-semibold ${statusConfig.badgeClass}`}>
                                        {milestone.status}
                                    </span>
                                ) : (
                                    <span className={`text-sm font-bold ${statusConfig.textClass} drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]`}>
                                        {milestone.status}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Card 2: Power/Budget with Flowing Energy */}
                <div className="relative group">
                    {/* Living Nebula Glass Panel */}
                    <div className="relative rounded-xl p-4 bg-[#0B0E1E]/90 backdrop-blur-md border border-purple-500/40 transition-all duration-300 group-hover:border-purple-400/60 group-hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] overflow-hidden shadow-2xl">
                        {/* Vinyl Groove Pattern Background */}
                        <div 
                            className="absolute inset-0 opacity-[0.05] pointer-events-none"
                            style={{
                                background: `
                                    repeating-conic-gradient(
                                        from 0deg at 50% 50%,
                                        transparent 0deg,
                                        rgba(168, 85, 247, 0.08) 0.5deg,
                                        transparent 1deg,
                                        transparent 2deg
                                    ),
                                    repeating-radial-gradient(
                                        circle at center,
                                        transparent 0px,
                                        transparent 2px,
                                        rgba(34, 211, 238, 0.06) 2px,
                                        rgba(34, 211, 238, 0.06) 3px,
                                        transparent 3px,
                                        transparent 5px
                                    )
                                `,
                                backgroundSize: '100% 100%',
                                backgroundPosition: 'center',
                            }}
                        />

                        {/* Glass Shine Animation */}
                        <div className="absolute inset-0 glass-shine pointer-events-none"></div>

                        {/* Left Gradient Border */}
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 via-cyan-500 to-purple-500 group-hover:from-purple-400 group-hover:via-cyan-400 group-hover:to-purple-400 transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.8),0_0_40px_rgba(34,211,238,0.6)] group-hover:w-1.5"></div>

                        {/* Flowing Energy Shine - Always Active */}
                        <div className="absolute inset-0 opacity-30">
                            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-amber-300/20 to-transparent animate-energy-flow" />
                        </div>
                        
                        <div className="flex flex-col items-center justify-center gap-3 text-center h-full relative z-10">
                            {/* Icon */}
                            <div className="w-12 h-12 flex items-center justify-center">
                                <Battery size={20} className="text-amber-300" />
                            </div>
                            <div className="flex flex-col gap-1 items-center">
                                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                                    NGUỒN CẤP
                                </span>
                                <span className="text-sm font-bold font-mono text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
                                    {formattedBudget}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Card 3: Time/Deadline with Breathing Effect */}
                <div className="relative group">
                    {/* Living Nebula Glass Panel */}
                    <div className="relative rounded-xl p-4 bg-[#0B0E1E]/90 backdrop-blur-md border border-purple-500/40 transition-all duration-300 group-hover:border-purple-400/60 group-hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] overflow-hidden shadow-2xl">
                        {/* Vinyl Groove Pattern Background */}
                        <div 
                            className="absolute inset-0 opacity-[0.05] pointer-events-none"
                            style={{
                                background: `
                                    repeating-conic-gradient(
                                        from 0deg at 50% 50%,
                                        transparent 0deg,
                                        rgba(168, 85, 247, 0.08) 0.5deg,
                                        transparent 1deg,
                                        transparent 2deg
                                    ),
                                    repeating-radial-gradient(
                                        circle at center,
                                        transparent 0px,
                                        transparent 2px,
                                        rgba(34, 211, 238, 0.06) 2px,
                                        rgba(34, 211, 238, 0.06) 3px,
                                        transparent 3px,
                                        transparent 5px
                                    )
                                `,
                                backgroundSize: '100% 100%',
                                backgroundPosition: 'center',
                            }}
                        />

                        {/* Glass Shine Animation */}
                        <div className="absolute inset-0 glass-shine pointer-events-none"></div>

                        {/* Left Gradient Border */}
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 via-cyan-500 to-purple-500 group-hover:from-purple-400 group-hover:via-cyan-400 group-hover:to-purple-400 transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.8),0_0_40px_rgba(34,211,238,0.6)] group-hover:w-1.5"></div>
                        <div className="flex flex-col items-center justify-center gap-3 text-center h-full relative z-10">
                            {/* Icon with Breathing Animation */}
                            <div className="relative w-12 h-12 flex items-center justify-center">
                                {/* Glow Pulse Effect */}
                                <div className="absolute inset-0 rounded-full bg-cyan-400/20 animate-pulse-glow" />
                                <div className="relative z-10 animate-breathing">
                                    <Hourglass size={20} className="text-slate-300" />
                                </div>
                            </div>
                            <div className="flex flex-col gap-1 items-center">
                                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                                    ĐẾM NGƯỢC
                                </span>
                                <span className="text-sm font-bold font-mono text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
                                    {formattedDeadline}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Animations */}
            <style>{`
                @keyframes glass-shine {
                    0% {
                        transform: translateX(-100%) translateY(-100%) skewX(-12deg);
                        opacity: 0;
                    }
                    10% {
                        opacity: 0.6;
                    }
                    20% {
                        opacity: 0.8;
                    }
                    30% {
                        opacity: 0.6;
                    }
                    100% {
                        transform: translateX(200%) translateY(200%) skewX(-12deg);
                        opacity: 0;
                    }
                }
                .glass-shine {
                    background: linear-gradient(
                        135deg,
                        transparent 0%,
                        transparent 40%,
                        rgba(255, 255, 255, 0.1) 50%,
                        transparent 60%,
                        transparent 100%
                    );
                    animation: glass-shine 5s ease-in-out infinite;
                }
                
                @keyframes ripple {
                    0% {
                        transform: scale(0.8);
                        opacity: 0.6;
                    }
                    100% {
                        transform: scale(1.5);
                        opacity: 0;
                    }
                }
                .animate-ripple {
                    animation: ripple 3s ease-out infinite;
                }
                
                @keyframes energy-flow {
                    0% {
                        transform: translateX(-100%) translateY(-100%) rotate(45deg);
                    }
                    100% {
                        transform: translateX(100%) translateY(100%) rotate(45deg);
                    }
                }
                .animate-energy-flow {
                    animation: energy-flow 4s ease-in-out infinite;
                }
                
                @keyframes breathing {
                    0%, 100% {
                        transform: translateY(0);
                        opacity: 1;
                    }
                    50% {
                        transform: translateY(-4px);
                        opacity: 0.8;
                    }
                }
                .animate-breathing {
                    animation: breathing 3s ease-in-out infinite;
                }
                
                @keyframes pulse-glow {
                    0%, 100% {
                        transform: scale(1);
                        opacity: 0.3;
                    }
                    50% {
                        transform: scale(1.2);
                        opacity: 0.1;
                    }
                }
                .animate-pulse-glow {
                    animation: pulse-glow 2s ease-in-out infinite;
                }
                
                @keyframes pulse-slow {
                    0%, 100% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.7;
                    }
                }
                .animate-pulse-slow {
                    animation: pulse-slow 2s ease-in-out infinite;
                }
            `}</style>

        </div>
    );
};

export default StaticInfoPanel;

