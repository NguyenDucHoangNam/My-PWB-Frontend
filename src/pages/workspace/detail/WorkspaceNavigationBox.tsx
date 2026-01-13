import { ArrowRight } from 'lucide-react';
import { type WorkspaceNavigationBoxProps } from '../../../types/projectWorkspaceDetail';

const WorkspaceNavigationBox = ({ 
    title, 
    description, 
    icon: Icon, 
    borderColor: _borderColor, 
    textColor, 
    hasPermission: _hasPermission, 
    onNavigate,
    animationType 
}: WorkspaceNavigationBoxProps) => {
    const isSignalStation = animationType === 'signal-station';
    const isApprovalBay = animationType === 'approval-bay';

    return (
        <>
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

                /* Cosmic Twinkling Stars */
                @keyframes cosmic-twinkle {
                    0%, 100% {
                        opacity: 0.3;
                        transform: scale(1);
                    }
                    50% {
                        opacity: 1;
                        transform: scale(1.3);
                    }
                }
                .animate-cosmic-twinkle {
                    animation: cosmic-twinkle 3s ease-in-out infinite;
                }

                /* Floating Cosmic Particles */
                @keyframes cosmic-float {
                    0% {
                        transform: translateY(0) translateX(0);
                        opacity: 0;
                    }
                    10% {
                        opacity: 0.6;
                    }
                    90% {
                        opacity: 0.6;
                    }
                    100% {
                        transform: translateY(-120%) translateX(20px);
                        opacity: 0;
                    }
                }
                .animate-cosmic-float {
                    animation: cosmic-float 8s ease-in-out infinite;
                }

                /* Nebula Pulse Effect */
                @keyframes nebula-pulse {
                    0%, 100% {
                        transform: scale(1);
                        opacity: 0.2;
                    }
                    50% {
                        transform: scale(1.3);
                        opacity: 0.4;
                    }
                }
                .animate-nebula-pulse {
                    animation: nebula-pulse 4s ease-in-out infinite;
                }

                /* Signal Station: Pulsing Signal Rings */
                @keyframes signal-pulse {
                    0% {
                        transform: translate(-50%, -50%) scale(0.8);
                        opacity: 0.6;
                    }
                    50% {
                        opacity: 0.3;
                    }
                    100% {
                        transform: translate(-50%, -50%) scale(1.5);
                        opacity: 0;
                    }
                }
                .animate-signal-pulse {
                    animation: signal-pulse 3s ease-out infinite;
                }

                /* Approval Bay: Orbital Rotation */
                @keyframes orbit-slow {
                    0% {
                        transform: translate(-50%, -50%) rotate(0deg);
                    }
                    100% {
                        transform: translate(-50%, -50%) rotate(360deg);
                    }
                }
                .animate-orbit-slow {
                    animation: orbit-slow 15s linear infinite;
                }

                @keyframes orbit-slow-reverse {
                    0% {
                        transform: translate(-50%, -50%) rotate(0deg);
                    }
                    100% {
                        transform: translate(-50%, -50%) rotate(-360deg);
                    }
                }
                .animate-orbit-slow-reverse {
                    animation: orbit-slow-reverse 18s linear infinite;
                }

                /* Energy Orbital Particles */
                @keyframes energy-orbit {
                    0% {
                        transform: translate(-50%, -50%) rotate(0deg) translateX(70px) rotate(0deg);
                    }
                    100% {
                        transform: translate(-50%, -50%) rotate(360deg) translateX(70px) rotate(-360deg);
                    }
                }
                .animate-energy-orbit {
                    animation: energy-orbit 10s linear infinite;
                }

                /* Pulsing Glow for Center Core */
                @keyframes pulse-glow {
                    0%, 100% {
                        opacity: 0.8;
                        transform: scale(1);
                    }
                    50% {
                        opacity: 1;
                        transform: scale(1.3);
                    }
                }
                .animate-pulse-glow {
                    animation: pulse-glow 2s ease-in-out infinite;
                }
            `}</style>
            <button 
                onClick={onNavigate}
                className="relative w-full h-64 flex flex-col justify-end p-6 bg-[#0B0E1E]/90 backdrop-blur-md border border-purple-500/40 rounded-xl transition-all duration-300 transform overflow-hidden hover:scale-[1.02] hover:border-purple-400/60 hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] group cursor-pointer shadow-2xl"
            >
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

            {/* Cosmic Background Effects - Always Visible */}
            {/* Twinkling Stars */}
            <div className="absolute inset-0 pointer-events-none">
                {[...Array(15)].map((_, i) => {
                    const size = Math.random() * 2 + 1;
                    const left = Math.random() * 100;
                    const top = Math.random() * 100;
                    const delay = Math.random() * 3;
                    const duration = 2 + Math.random() * 2;
                    const opacity = 0.3 + Math.random() * 0.4;
                    return (
                        <div
                            key={`star-${i}`}
                            className="absolute rounded-full bg-white animate-cosmic-twinkle"
                            style={{
                                width: `${size}px`,
                                height: `${size}px`,
                                left: `${left}%`,
                                top: `${top}%`,
                                animationDelay: `${delay}s`,
                                animationDuration: `${duration}s`,
                                opacity: opacity,
                                boxShadow: `0 0 ${size * 2}px rgba(255, 255, 255, 0.5)`,
                            }}
                        />
                    );
                })}
            </div>

            {/* Floating Cosmic Particles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(8)].map((_, i) => {
                    const left = Math.random() * 100;
                    const delay = Math.random() * 5;
                    const duration = 8 + Math.random() * 4;
                    const size = Math.random() * 3 + 1;
                    const color = i % 2 === 0 ? 'rgba(34, 211, 238, 0.4)' : 'rgba(168, 85, 247, 0.4)';
                    return (
                        <div
                            key={`particle-${i}`}
                            className="absolute rounded-full animate-cosmic-float"
                            style={{
                                width: `${size}px`,
                                height: `${size}px`,
                                left: `${left}%`,
                                bottom: '-10px',
                                backgroundColor: color,
                                animationDelay: `${delay}s`,
                                animationDuration: `${duration}s`,
                                boxShadow: `0 0 ${size * 3}px ${color}`,
                            }}
                        />
                    );
                })}
            </div>

            {/* Nebula Glow Effect - Always Active */}
            <div className="absolute inset-0 pointer-events-none opacity-30">
                <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl animate-nebula-pulse" style={{ animationDelay: '0s', animationDuration: '4s' }}></div>
                <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-cyan-500/15 rounded-full blur-3xl animate-nebula-pulse" style={{ animationDelay: '2s', animationDuration: '5s' }}></div>
                <div className="absolute top-1/2 right-1/3 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl animate-nebula-pulse" style={{ animationDelay: '1s', animationDuration: '3.5s' }}></div>
            </div>

            {/* Signal Station: Cosmic Signal Waves - Always Active */}
            {isSignalStation && (
                <>
                    {/* Pulsing Signal Rings - Always Visible */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-cyan-400/30 rounded-full animate-signal-pulse" style={{ animationDelay: '0s' }}></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 border border-cyan-400/20 rounded-full animate-signal-pulse" style={{ animationDelay: '0.5s' }}></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-cyan-400/10 rounded-full animate-signal-pulse" style={{ animationDelay: '1s' }}></div>
                    </div>

                    {/* Scanning Beam - On Hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/60 via-blue-500/30 to-transparent animate-beam-scan"></div>
                    </div>
                    
                    {/* Data Particles - On Hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        {[...Array(12)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-particle-rise"
                                style={{
                                    left: `${10 + (i * 7)}%`,
                                    bottom: '10%',
                                    animationDelay: `${i * 0.15}s`,
                                    animationDuration: `${1.5 + (i % 3) * 0.3}s`
                                }}
                            />
                        ))}
                    </div>
                </>
            )}

            {/* Approval Bay: Orbital Rings & Cosmic Energy - Always Active */}
            {isApprovalBay && (
                <>
                    {/* Orbital Rings - Always Visible - More Prominent */}
                    <div className="absolute inset-0 pointer-events-none z-10">
                        <div className="absolute top-1/2 left-1/2 w-36 h-36 border-2 border-emerald-400/50 rounded-full animate-orbit-slow" style={{ animationDelay: '0s', boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)' }}></div>
                        <div className="absolute top-1/2 left-1/2 w-44 h-44 border-2 border-emerald-400/40 rounded-full animate-orbit-slow-reverse" style={{ animationDelay: '1s', boxShadow: '0 0 25px rgba(16, 185, 129, 0.25)' }}></div>
                        <div className="absolute top-1/2 left-1/2 w-28 h-28 border-2 border-green-400/60 rounded-full animate-orbit-slow" style={{ animationDelay: '0.5s', boxShadow: '0 0 15px rgba(34, 197, 94, 0.4)' }}></div>
                    </div>

                    {/* Energy Flow Particles - Always Visible - Larger and More Visible */}
                    <div className="absolute inset-0 pointer-events-none z-10">
                        {[...Array(6)].map((_, i) => {
                            return (
                                <div
                                    key={`energy-${i}`}
                                    className="absolute top-1/2 left-1/2 w-3 h-3 bg-emerald-400 rounded-full animate-energy-orbit"
                                    style={{
                                        transformOrigin: 'center',
                                        animationDelay: `${i * 0.5}s`,
                                        boxShadow: '0 0 12px rgba(16, 185, 129, 1), 0 0 24px rgba(16, 185, 129, 0.6)',
                                    }}
                                />
                            );
                        })}
                    </div>

                    {/* Pulsing Center Core */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-emerald-400 rounded-full animate-pulse-glow z-10 pointer-events-none" style={{ boxShadow: '0 0 20px rgba(16, 185, 129, 0.8)' }}></div>

                    {/* Speed Lines - On Hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        {[...Array(8)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute h-0.5 bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent animate-warp-speed"
                                style={{
                                    left: `${5 + (i * 12)}%`,
                                    top: `${20 + (i % 4) * 20}%`,
                                    width: '30%',
                                    animationDelay: `${i * 0.1}s`,
                                    animationDuration: '0.8s'
                                }}
                            />
                        ))}
                        
                        {/* Star Warp Background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-green-500/10 animate-warp-stretch"></div>
                    </div>
                </>
            )}

            {/* Holographic HUD Corners - Top Left */}
            <svg className="absolute top-0 left-0 w-16 h-16 text-cyan-400/60 group-hover:text-cyan-400/90 transition-colors pointer-events-none z-20" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 0 L0 20 L20 0 Z" stroke="currentColor" strokeWidth="1.5" fill="none" className="drop-shadow-[0_0_4px_currentColor]" />
                <path d="M8 0 L0 0 L0 8" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.6" />
            </svg>

            {/* Holographic HUD Corners - Bottom Right */}
            <svg className="absolute bottom-0 right-0 w-16 h-16 text-purple-400/60 group-hover:text-purple-400/90 transition-colors pointer-events-none z-20" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M64 64 L64 44 L44 64 Z" stroke="currentColor" strokeWidth="1.5" fill="none" className="drop-shadow-[0_0_4px_currentColor]" />
                <path d="M56 64 L64 64 L64 56" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.6" />
            </svg>

            {/* Content */}
            <div className="z-10 text-left relative">
                {/* Icon Container */}
                <div className={`mb-3 inline-block ${isSignalStation ? 'animate-icon-levitate' : isApprovalBay ? 'animate-icon-bank' : ''} ${isApprovalBay ? 'group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:animate-icon-shake' : ''}`}>
                    <Icon size={40} style={{ color: textColor }} />
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                {description && <p className="text-sm text-gray-400 mb-4">{description}</p>}
                <div className="flex items-center text-purple-300 font-semibold group-hover:text-white transition-colors">
                    Mở không gian 
                    <ArrowRight size={16} className="ml-2 transition-transform group-hover:translate-x-2" />
                </div>
            </div>
        </button>
        </>
    );
};

export default WorkspaceNavigationBox;

