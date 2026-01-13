import React, { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, BookOpen, Lightbulb, ArrowRight, HelpCircle, ChevronRight, Loader2 } from 'lucide-react';
import { aiContextService, RelevantGuide } from '@/services/aiContextService';

interface ContextualSidePanelProps {
    isOpen: boolean;
    onClose: () => void;
}

const ContextualSidePanel: React.FC<ContextualSidePanelProps> = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState<'guide' | 'insights'>('guide');
    const [guides, setGuides] = useState<RelevantGuide[]>([]);
    const [pageInsight, setPageInsight] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(window.location.pathname);

    // Load page-specific help when sidebar opens (only if not cached)
    useEffect(() => {
        if (isOpen && guides.length === 0) {
            loadPageHelp();
        }
    }, [isOpen, currentPage]);

    // Track page changes
    useEffect(() => {
        const handleLocationChange = () => {
            setCurrentPage(window.location.pathname);
        };
        window.addEventListener('popstate', handleLocationChange);
        return () => window.removeEventListener('popstate', handleLocationChange);
    }, []);

    const loadPageHelp = async () => {
        setIsLoading(true);
        try {
            // Convert page path to readable query
            const pageName = currentPage.split('/').filter(Boolean).join(' ') || 'home';
            const query = `Tips and guides for ${pageName} page`;

            const response = await aiContextService.getQuickHelp(query);

            if (response.result) {
                setGuides(response.result.relevantGuides || []);
                setPageInsight(response.result.answer || '');
            }
        } catch (error) {
            console.warn('Failed to load page help:', error);
            // Fallback to empty state
            setGuides([]);
            setPageInsight('Loading contextual help...');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Transition.Root show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-500"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-500"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-hidden">
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                            <Transition.Child
                                as={Fragment}
                                enter="transform transition ease-in-out duration-500 sm:duration-700"
                                enterFrom="translate-x-full"
                                enterTo="translate-x-0"
                                leave="transform transition ease-in-out duration-500 sm:duration-700"
                                leaveFrom="translate-x-0"
                                leaveTo="translate-x-full"
                            >
                                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                                    <div className="flex h-full flex-col overflow-y-scroll bg-[#0f1016] border-l border-purple-500/20 shadow-[0_0_50px_rgba(160,50,255,0.15)] relative">
                                        {/* Background Gradient */}
                                        <div className="absolute inset-0 bg-gradient-to-b from-[#130028] via-[#0f1016] to-[#240046] pointer-events-none" />

                                        {/* Header */}
                                        <div className="relative z-10 px-4 py-6 sm:px-6 border-b border-white/5 bg-white/5 backdrop-blur-md">
                                            <div className="flex items-start justify-between">
                                                <Dialog.Title className="text-xl font-bold leading-6 text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-200 flex items-center gap-2">
                                                    <HelpCircle className="w-6 h-6 text-pink-500" />
                                                    Contextual Guide
                                                </Dialog.Title>
                                                <div className="ml-3 flex h-7 items-center">
                                                    <button
                                                        type="button"
                                                        className="relative rounded-full p-1 text-purple-300 hover:text-white hover:bg-white/10 transition-colors focus:outline-none"
                                                        onClick={onClose}
                                                    >
                                                        <span className="absolute -inset-2.5" />
                                                        <span className="sr-only">Close panel</span>
                                                        <X className="h-6 w-6" aria-hidden="true" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="mt-6 flex gap-4 border-b border-white/5">
                                                <button
                                                    onClick={() => setActiveTab('guide')}
                                                    className={`pb-3 text-sm font-medium transition-all relative px-2 ${activeTab === 'guide' ? 'text-white' : 'text-gray-400 hover:text-purple-200'
                                                        }`}
                                                >
                                                    Guides
                                                    {activeTab === 'guide' && (
                                                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full shadow-[0_0_10px_rgba(236,72,153,0.5)]" />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => setActiveTab('insights')}
                                                    className={`pb-3 text-sm font-medium transition-all relative px-2 ${activeTab === 'insights' ? 'text-white' : 'text-gray-400 hover:text-purple-200'
                                                        }`}
                                                >
                                                    Page Insights
                                                    {activeTab === 'insights' && (
                                                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="relative z-10 mt-6 flex-1 px-4 sm:px-6 pb-6">
                                            {isLoading ? (
                                                <div className="flex items-center justify-center py-12">
                                                    <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
                                                </div>
                                            ) : activeTab === 'guide' ? (
                                                <div className="space-y-6">
                                                    {guides.length > 0 ? guides.map((guide) => (
                                                        <div key={guide.id} className="group relative overflow-hidden bg-white/5 rounded-2xl p-5 border border-white/5 hover:border-purple-500/30 transition-all duration-300 hover:shadow-[0_0_20px_rgba(160,50,255,0.1)] cursor-pointer">
                                                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                                            <div className="relative z-10 flex items-start gap-4 mb-4">
                                                                <div className="p-3 rounded-xl bg-gradient-to-br from-white/10 to-white/5 group-hover:from-purple-500/20 group-hover:to-pink-500/20 transition-colors border border-white/5">
                                                                    <BookOpen className="w-6 h-6 text-purple-300 group-hover:text-pink-300 transition-colors" />
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-lg font-semibold text-white group-hover:text-purple-100 transition-colors">{guide.title}</h4>
                                                                    <p className="text-sm text-gray-400 mt-1 leading-relaxed">{guide.shortDescription}</p>
                                                                </div>
                                                            </div>
                                                            {guide.steps && guide.steps.length > 0 && (
                                                                <div className="relative z-10 space-y-3 pl-14">
                                                                    {guide.steps.slice(0, 3).map((step) => (
                                                                        <div key={step.stepOrder} className="flex items-center gap-3 text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                                                                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500/50 group-hover:bg-pink-500 group-hover:shadow-[0_0_5px_rgba(236,72,153,0.5)] transition-all" />
                                                                            {step.title}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                            <div className="relative z-10 mt-5 pl-14 flex items-center gap-2 text-pink-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0">
                                                                View Guide <ArrowRight className="w-4 h-4" />
                                                            </div>
                                                        </div>
                                                    )) : (
                                                        <div className="text-center py-12 text-gray-400">
                                                            <Lightbulb className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                                            <p>No specific guides found for this page.</p>
                                                            <p className="text-sm mt-2">Try asking AI Assistant!</p>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="space-y-6">
                                                    {pageInsight ? (
                                                        <div className="relative overflow-hidden rounded-2xl p-6 border border-purple-500/30 bg-gradient-to-br from-purple-900/40 to-indigo-900/40 shadow-[0_0_30px_rgba(160,50,255,0.15)]">
                                                            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-pink-500/20 rounded-full blur-2xl" />
                                                            <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-purple-500/20 rounded-full blur-2xl" />

                                                            <h4 className="relative z-10 text-white font-semibold mb-3 flex items-center gap-2 text-lg">
                                                                <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
                                                                AI Analysis
                                                            </h4>
                                                            <div className="relative z-10 text-sm text-purple-100 leading-relaxed prose prose-sm prose-invert max-w-none">
                                                                {pageInsight.split('\n').map((line, idx) => (
                                                                    <p key={idx} className="mb-2">{line}</p>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="text-center py-12 text-gray-400">
                                                            <Lightbulb className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                                            <p>No page-specific insights available.</p>
                                                        </div>
                                                    )}

                                                    <div>
                                                        <h5 className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-4 ml-1">Quick Actions</h5>
                                                        <div className="space-y-3">
                                                            {['Summarize this page', 'Explain terminology', 'Find related content'].map((action) => (
                                                                <button key={action} className="w-full text-left px-5 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-purple-500/30 text-sm text-gray-300 hover:text-white transition-all flex items-center justify-between group relative overflow-hidden">
                                                                    <span className="relative z-10">{action}</span>
                                                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                                                                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all transform -translate-x-2 group-hover:translate-x-0 text-purple-400" />
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
};

// Helper component for the sparkle icon if not imported
function Sparkles(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
        </svg>
    )
}

export default ContextualSidePanel;
