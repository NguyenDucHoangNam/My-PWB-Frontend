import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Users, 
    DollarSign, 
    FileText,
    ExternalLink,
    ArrowRight,
    Info
} from 'lucide-react';

// Import types và helpers từ các file riêng
import { sanitizeNumericParam } from '../../../utils/projectWorkspaceDetail.helpers';

// Import components
import StaticInfoPanel from './StaticInfoPanel';
import TabButton from './TabButton';
import WorkspaceTab from './WorkspaceTab';
import MembersTab from './MembersTab';
import FinanceTab from './FinanceTab';
import AnimatedBackground from '@/component/background/AnimatedBackground';

// Import custom hooks
import { useProjectWorkspaceDetail } from '../../../component/hooks/userProjectWorkspaceDetail/useProjectWorkspaceDetail';
import { useProjectWorkspaceDetailPermission } from '../../../component/hooks/userProjectWorkspaceDetail/useProjectWorkspaceDetailPermission';
import { useProjectWorkspaceDetailNavigation } from '../../../component/hooks/userProjectWorkspaceDetail/useProjectWorkspaceDetailNavigation';
import { useProjectWorkspaceDetailPermissions } from '../../../component/hooks/userProjectWorkspaceDetail/useProjectWorkspaceDetailPermissions';
import { useWorkspaceContract } from '../../../component/hooks/useWorkspace/useWorkspaceContract';

export default function ProjectWorkspaceDetailPage() {
    const [searchParams] = useSearchParams();
    const sanitizedMilestoneId = useMemo(
        () => sanitizeNumericParam(searchParams.get('milestoneId')),
        [searchParams]
    );
    const sanitizedProjectId = useMemo(() => {
        const rawProjectId =
            searchParams.get('projectId') ||
            searchParams.get('id') ||
            sessionStorage.getItem('currentProjectId') ||
            undefined;
        return sanitizeNumericParam(rawProjectId);
    }, [searchParams]);
    const projectIdNumber = sanitizedProjectId ? Number(sanitizedProjectId) : undefined;
    const milestoneIdNumber = sanitizedMilestoneId ? Number(sanitizedMilestoneId) : undefined;
    const hasValidIds = projectIdNumber !== undefined && !Number.isNaN(projectIdNumber) && milestoneIdNumber !== undefined && !Number.isNaN(milestoneIdNumber);
    
    const [activeTab, setActiveTab] = useState('workspace');

    // Custom hooks
    const {
        detail,
        assignedMembers,
        setAssignedMembers,
        loading,
        error,
        hasContract,
        allMoneySplitsApproved,
        refreshMoneySplitStatus,
    } = useProjectWorkspaceDetail(projectIdNumber, milestoneIdNumber, hasValidIds);

    const { permission, refreshPermission } = useProjectWorkspaceDetailPermission(projectIdNumber);
    
    // Lấy contract status để kiểm tra thanh toán
    const { contractStatus } = useWorkspaceContract(projectIdNumber ?? null);

    const {
        handleBackToOverview: _handleBackToOverview,
        handleNavigateToInternalStudio,
        handleNavigateToClientRoom,
        handleNavigateToCreateContract,
    } = useProjectWorkspaceDetailNavigation(sanitizedProjectId, sanitizedMilestoneId, detail);

    const {
        derivedCanEnterInternalRoom,
        derivedCanEnterCustomerRoom,
    } = useProjectWorkspaceDetailPermissions(permission);

    const projectRole = permission?.role?.projectRole || 'OBSERVER';

    const handleAssignmentChange = (updatedMembers: any[]) => {
        setAssignedMembers(updatedMembers);
    };

    if (loading) {
        return (
            <div className="bg-black/30 backdrop-blur-md border border-purple-800/50 rounded-xl p-6 text-gray-300">Đang tải chi tiết cột mốc...</div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-900/20 border border-red-700 text-red-300 rounded-xl p-6">{error}</div>
        );
    }

    if (!hasValidIds) {
        return (
            <div className="bg-red-900/20 border border-red-700 text-red-300 rounded-xl p-6">
                Không tìm thấy projectId hoặc milestoneId hợp lệ.
            </div>
        );
    }

    const renderTabContent = () => {
        switch (activeTab) {
            case 'workspace':
                return <WorkspaceTab 
                    onNavigateToInternalStudio={handleNavigateToInternalStudio}
                    onNavigateToClientRoom={handleNavigateToClientRoom}
                    canEnterInternalRoom={derivedCanEnterInternalRoom}
                    canEnterCustomerRoom={derivedCanEnterCustomerRoom}
                    projectRole={projectRole}
                    contractStatus={contractStatus}
                    allMoneySplitsApproved={allMoneySplitsApproved}
                />;
            case 'members':
                return <MembersTab 
                            assigned={assignedMembers}
                            projectId={sanitizedProjectId || ''}
                            milestoneId={sanitizedMilestoneId || String(detail.id)}
                            onAssignmentChange={handleAssignmentChange}
                            permission={permission}
                       />;
            case 'finance':
                return <FinanceTab 
                            assignedMembers={assignedMembers}
                            totalBudget={detail.budget}
                            projectId={sanitizedProjectId || ''}
                            milestoneId={sanitizedMilestoneId || String(detail.id)}
                            permission={permission}
                            onMoneySplitStatusChange={async () => {
                                // Refresh cả money split status và permission
                                await refreshMoneySplitStatus();
                                await refreshPermission();
                            }}
                       />;
            default:
                return null;
        }
    };

    return (
        <div 
            className="relative min-h-screen w-full" 
            style={{
                fontFamily: "'Space Grotesk', sans-serif",
                background: 'radial-gradient(circle at top, #242446, #151526 70%)',
            }}
        >
            <AnimatedBackground />
            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap');
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(10px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    .animate-fade-in {
                        animation: fadeIn 0.4s ease-out forwards;
                    }
                    ::-webkit-scrollbar {
                        width: 8px;
                    }
                    ::-webkit-scrollbar-track {
                        background: #110f27; 
                    }
                    ::-webkit-scrollbar-thumb {
                        background: #4a3d7a;
                        border-radius: 4px;
                    }
                    ::-webkit-scrollbar-thumb:hover {
                        background: #5f4b9b;
                    }
                    .form-checkbox {
                        appearance: none;
                        background-color: #1a1a2e;
                        border: 1px solid #4a3d7a;
                        padding: 0;
                        display: inline-block;
                        vertical-align: middle;
                        width: 1.25em;
                        height: 1.25em;
                        border-radius: 4px;
                        cursor: pointer;
                    }
                    .form-checkbox:checked {
                        background-color: #7c3aed;
                        border-color: #7c3aed;
                        background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e");
                    }
                `}
            </style>
            
            <main className="relative z-10 max-w-7xl mx-auto p-6 md:p-10 pt-20 md:pt-24 text-white">
                {!hasContract ? (
                    <div className="relative bg-gradient-to-br from-black/40 via-purple-900/20 to-black/40 backdrop-blur-md border border-purple-500/30 rounded-2xl shadow-2xl shadow-purple-900/20 p-12 text-center animate-fade-in overflow-hidden">
                        <div className="absolute -top-1/2 -right-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
                        <div className="absolute -bottom-1/2 -left-1/2 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"></div>
                        
                        <div className="relative z-10 flex flex-col items-center justify-center gap-8">
                            <div className="relative">
                                <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl animate-pulse"></div>
                                <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-purple-500/30 to-orange-500/30 border-2 border-purple-400/50 flex items-center justify-center backdrop-blur-sm">
                                    <FileText size={48} className="text-purple-300 animate-bounce" style={{ animationDuration: '2s' }} />
                                </div>
                            </div>
                            
                            <div className="flex flex-col gap-3 max-w-md">
                                <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-orange-300 bg-clip-text text-transparent">
                                    Chưa có hợp đồng
                                </h2>
                                <p className="text-gray-300 text-lg leading-relaxed">
                                    Dự án này chưa có hợp đồng. Vui lòng tạo hợp đồng trước khi tiếp tục làm việc với cột mốc.
                                </p>
                            </div>
                            
                            <div className="bg-black/30 border border-purple-500/20 rounded-xl p-6 w-full max-w-md backdrop-blur-sm">
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                                        <Info size={20} className="text-purple-300" />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <h3 className="text-white font-semibold mb-2">Tại sao cần hợp đồng?</h3>
                                        <p className="text-gray-400 text-sm leading-relaxed">
                                            Hợp đồng giúp xác định các điều khoản, ngân sách và cột mốc của dự án. Bạn cần tạo hợp đồng trước khi có thể quản lý cột mốc và phân chia tài chính.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <button
                                onClick={handleNavigateToCreateContract}
                                className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl shadow-lg shadow-purple-500/30 transition-all duration-300 transform hover:scale-105 hover:shadow-purple-500/50 flex items-center gap-3 overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                                
                                <span className="relative z-10 flex items-center gap-3">
                                    <FileText size={20} className="group-hover:rotate-12 transition-transform duration-300" />
                                    <span>Tạo hợp đồng ngay</span>
                                    <ExternalLink size={18} className="group-hover:translate-x-1 transition-transform duration-300" />
                                </span>
                            </button>
                            
                            <button
                                onClick={handleNavigateToCreateContract}
                                className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors duration-200 flex items-center gap-2 group"
                            >
                                <span>Hoặc xem trang quản lý hợp đồng</span>
                                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-200" />
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        {loading ? (
                            <div className="bg-black/30 backdrop-blur-md border border-purple-800/50 rounded-xl p-6 text-gray-300">Đang tải chi tiết cột mốc...</div>
                        ) : error ? (
                            <div className="bg-red-900/20 border border-red-700 text-red-300 rounded-xl p-6">{error}</div>
                        ) : (
                            <StaticInfoPanel milestone={detail} />
                        )}

                        <div className="mt-8">
                            {/* Enhanced Tab Navigation with Space Theme */}
                            <div className="relative mb-8">
                                {/* Background Container with Glow */}
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-900/10 via-cyan-900/10 to-purple-900/10 rounded-2xl blur-xl"></div>
                                
                                {/* Border Container */}
                                <div className="relative bg-[#0B0E1E]/60 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-2 shadow-[0_0_30px_rgba(168,85,247,0.1)]">
                                    {/* Inner Glow Line */}
                                    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-400/50 to-transparent"></div>
                                    
                                    {/* Tab Buttons Container */}
                                    <div className="flex items-center gap-1 md:gap-2">
                                        <TabButton 
                                            label="Khoang Điều Khiển" 
                                            icon={LayoutDashboard}
                                            isActive={activeTab === 'workspace'}
                                            onClick={() => setActiveTab('workspace')}
                                        />
                                        <TabButton 
                                            label="Phi Hành Đoàn & Nhiệm Vụ" 
                                            icon={Users}
                                            isActive={activeTab === 'members'}
                                            onClick={() => setActiveTab('members')}
                                        />
                                        <TabButton 
                                            label="Kho Bạc & Phân Phối" 
                                            icon={DollarSign}
                                            isActive={activeTab === 'finance'}
                                            onClick={() => setActiveTab('finance')}
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="tab-content">
                                {renderTabContent()}
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}

