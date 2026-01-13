import React, { useState } from 'react';
import FloatingAssistant from '../component/ai-demo/FloatingAssistant';
import ContextualSidePanel from '../component/ai-demo/ContextualSidePanel';
import { Layout, Sidebar, MessageSquare, HelpCircle } from 'lucide-react';

const AIDemoPage: React.FC = () => {
    const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
    const [activeDemo, setActiveDemo] = useState<'floating' | 'panel'>('floating');

    return (
        <div className="min-h-screen bg-[#0b0c12] text-white p-8 relative overflow-hidden font-sans selection:bg-purple-500/30">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-900/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-900/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
                <div className="absolute top-[20%] right-[20%] w-[300px] h-[300px] bg-pink-900/10 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '4s' }} />
            </div>

            <div className="max-w-5xl mx-auto relative z-10">
                <div className="mb-16 text-center">
                    <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                        <span className="text-xs font-medium text-purple-300 tracking-wider uppercase flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.5)]" />
                            System Online
                        </span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-indigo-200 tracking-tight">
                        AI Interface Demos
                    </h1>
                    <p className="text-xl text-purple-200/60 max-w-2xl mx-auto leading-relaxed">
                        Explore the next generation of intelligent interactions. Designed for the Music Universe.
                    </p>
                </div>

                {/* Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                    <button
                        onClick={() => setActiveDemo('floating')}
                        className={`p-8 rounded-3xl border transition-all duration-500 text-left group relative overflow-hidden ${activeDemo === 'floating'
                            ? 'bg-[#1a1b26]/80 border-purple-500/50 shadow-[0_0_40px_rgba(168,85,247,0.15)]'
                            : 'bg-[#1a1b26]/40 border-white/5 hover:border-purple-500/30 hover:bg-[#1a1b26]/60'
                            }`}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="relative z-10">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110 ${activeDemo === 'floating'
                                ? 'bg-gradient-to-br from-pink-500 to-purple-600 shadow-[0_0_20px_rgba(236,72,153,0.3)]'
                                : 'bg-white/5 border border-white/10'
                                }`}>
                                <MessageSquare className={`w-8 h-8 ${activeDemo === 'floating' ? 'text-white' : 'text-purple-300'}`} />
                            </div>
                            <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-purple-100 transition-colors">Floating Assistant</h3>
                            <p className="text-gray-400 text-sm leading-relaxed mb-6">
                                Always-accessible chat interface. Best for general Q&A and quick tasks.
                            </p>
                            <div className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase">
                                <span className={`w-2 h-2 rounded-full ${activeDemo === 'floating' ? 'bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]' : 'bg-gray-600'}`} />
                                {activeDemo === 'floating' ? <span className="text-green-400">Active</span> : <span className="text-gray-500 group-hover:text-purple-400 transition-colors">Click to Activate</span>}
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => {
                            setActiveDemo('panel');
                            setIsSidePanelOpen(true);
                        }}
                        className={`p-8 rounded-3xl border transition-all duration-500 text-left group relative overflow-hidden ${activeDemo === 'panel'
                            ? 'bg-[#1a1b26]/80 border-indigo-500/50 shadow-[0_0_40px_rgba(99,102,241,0.15)]'
                            : 'bg-[#1a1b26]/40 border-white/5 hover:border-indigo-500/30 hover:bg-[#1a1b26]/60'
                            }`}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="relative z-10">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110 ${activeDemo === 'panel'
                                ? 'bg-gradient-to-br from-indigo-500 to-cyan-500 shadow-[0_0_20px_rgba(99,102,241,0.3)]'
                                : 'bg-white/5 border border-white/10'
                                }`}>
                                <Layout className={`w-8 h-8 ${activeDemo === 'panel' ? 'text-white' : 'text-indigo-300'}`} />
                            </div>
                            <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-indigo-100 transition-colors">Contextual Side Panel</h3>
                            <p className="text-gray-400 text-sm leading-relaxed mb-6">
                                Slide-out guide for deep dives. Best for tutorials, page insights, and complex workflows.
                            </p>
                            <div className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase">
                                <span className={`w-2 h-2 rounded-full ${activeDemo === 'panel' ? 'bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]' : 'bg-gray-600'}`} />
                                {activeDemo === 'panel' ? <span className="text-green-400">Active</span> : <span className="text-gray-500 group-hover:text-indigo-400 transition-colors">Click to Activate</span>}
                            </div>
                        </div>
                    </button>
                </div>

                {/* Demo Area Placeholder */}
                <div className="bg-[#13141c]/80 backdrop-blur-md border border-white/5 rounded-[2rem] p-12 min-h-[500px] flex items-center justify-center relative overflow-hidden shadow-2xl">
                    {/* Grid Pattern */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)] pointer-events-none" />

                    <div className="text-center max-w-lg relative z-10">
                        <div className="w-24 h-24 bg-gradient-to-br from-white/10 to-white/5 rounded-full flex items-center justify-center mx-auto mb-8 border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-xl">
                            {activeDemo === 'floating' ? (
                                <MessageSquare className="w-10 h-10 text-purple-400" />
                            ) : (
                                <Sidebar className="w-10 h-10 text-indigo-400" />
                            )}
                        </div>
                        <h2 className="text-3xl font-bold mb-4 text-white">
                            {activeDemo === 'floating' ? 'Floating Assistant Demo' : 'Side Panel Demo'}
                        </h2>
                        <p className="text-gray-400 text-lg leading-relaxed mb-8">
                            {activeDemo === 'floating'
                                ? 'Look at the bottom right corner! The assistant is ready to help.'
                                : 'Click the button below or the card above to open the side panel.'}
                        </p>

                        {activeDemo === 'panel' && (
                            <button
                                onClick={() => setIsSidePanelOpen(true)}
                                className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:scale-105 text-white rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)] flex items-center gap-3 mx-auto group"
                            >
                                <HelpCircle className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                Open Contextual Guide
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* The Actual Components */}
            {activeDemo === 'floating' && <FloatingAssistant />}
            <ContextualSidePanel isOpen={isSidePanelOpen} onClose={() => setIsSidePanelOpen(false)} />
        </div>
    );
};

export default AIDemoPage;
