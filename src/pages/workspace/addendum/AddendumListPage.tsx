import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FileText, CheckCircle, Clock, AlertCircle, Loader2, Calendar, DollarSign, Plus } from 'lucide-react';
import { ROUTER } from '../../../routes/router';
import contractService, { type AddendumItem } from '../../../services/contractService';
import projectService from '../../../services/projectService';
import { type ProjectPermissionResponse } from '../../../types/permission';
import { usePermissions } from '../../../component/hooks/usePermissions';
import AnimatedBackground from '@/component/background/AnimatedBackground';
import { useCosmicToast } from '../../../component/toast/CosmicToastProvider';

export default function AddendumListPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { showToast } = useCosmicToast();

    // Lấy projectId từ URL params
    const projectIdParam = searchParams.get('id') || searchParams.get('projectId');
    const projectId = projectIdParam ? parseInt(projectIdParam) : null;

    const [addendums, setAddendums] = useState<AddendumItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [contractId, setContractId] = useState<number | null>(null);
    const [permissions, setPermissions] = useState<ProjectPermissionResponse | null>(null);

    // Load permissions
    useEffect(() => {
        const loadPermissions = async () => {
            if (!projectId) return;
            try {
                const perms = await projectService.getProjectPermissionByProjectId(projectId);
                setPermissions(perms);
            } catch (err: any) {
                console.error('Error loading permissions:', err);
            }
        };
        loadPermissions();
    }, [projectId]);

    // Load contract metadata để lấy contractId
    useEffect(() => {
        const loadContractId = async () => {
            if (!projectId) {
                setError('Không tìm thấy project ID');
                setLoading(false);
                return;
            }

            try {
                const metadata = await contractService.getContractMetadata(projectId);
                if (metadata) {
                    setContractId(metadata.id);
                } else {
                    setError('Không tìm thấy hợp đồng cho dự án này');
                    setLoading(false);
                }
            } catch (err: any) {
                setError(err.message || 'Không thể tải thông tin hợp đồng');
                setLoading(false);
            }
        };

        loadContractId();
    }, [projectId]);

    // Load addendums khi có contractId
    useEffect(() => {
        const loadAddendums = async () => {
            if (!contractId) return;

            try {
                setLoading(true);
                setError(null);
                const data = await contractService.getAllAddendums(contractId);
                setAddendums(data);
            } catch (err: any) {
                setError(err.message || 'Không thể tải danh sách phụ lục');
                showToast({
                    message: err.message || 'Không thể tải danh sách phụ lục',
                    type: 'error'
                });
            } finally {
                setLoading(false);
            }
        };

        loadAddendums();
    }, [contractId, showToast]);

    // Extract permissions
    const perms = usePermissions(permissions);
    const canCreateAddendumBase = perms.addendum.canCreateAddendum;

    // Only allow creating a new addendum from list page when:
    // - There is no addendum yet, OR
    // - All existing addendums are already paid (tính từ status).
    const canCreateAddendum = useMemo(() => {
        if (!canCreateAddendumBase) return false;
        if (addendums.length === 0) return true;
        // Kiểm tra đã thanh toán: PAID hoặc COMPLETED (vì COMPLETED đã bao gồm PAID)
        return addendums.every(a => a.signnowStatus === "PAID" || a.signnowStatus === "COMPLETED");
    }, [canCreateAddendumBase, addendums]);

    const handleCreateAddendum = () => {
        if (projectId && contractId) {
            navigate(`${ROUTER.USER.CREATE_ADDENDUM}?id=${projectId}&contractId=${contractId}`);
        } else {
            showToast({
                message: 'Không tìm thấy thông tin hợp đồng',
                type: 'error'
            });
        }
    };

    const getStatusConfig = (status: string) => {
        // Map trạng thái sang tiếng Việt
        const statusMap: Record<string, string> = {
            'DRAFT': 'Nháp',
            'OUT_FOR_SIGNATURE': 'Chờ ký',
            'PARTIALLY_SIGNED': 'Đang ký',
            'SIGNED': 'Đã ký',
            'PAID': 'Đã thanh toán',
            'COMPLETED': 'Hoàn tất',
            'DECLINED': 'Từ chối',
            'CANCELLED': 'Hủy',
            'VOIDED': 'Hủy hiệu lực',
            'EXPIRED': 'Hết hạn',
            'PENDING': 'Đang xử lý',
            'FILLED': 'Đã điền',
        };

        const statusText = statusMap[status] || status;

        switch (status) {
            case 'PAID':
                return {
                    icon: <CheckCircle size={16} className="text-emerald-400" />,
                    text: statusText,
                    bgClass: 'bg-emerald-500/20 border-emerald-400/50',
                    textClass: 'text-emerald-300',
                };
            case 'COMPLETED':
                return {
                    icon: <CheckCircle size={16} className="text-green-400" />,
                    text: statusText,
                    bgClass: 'bg-green-500/20 border-green-400/50',
                    textClass: 'text-green-300',
                };
            case 'SIGNED':
                return {
                    icon: <CheckCircle size={16} className="text-cyan-400" />,
                    text: statusText,
                    bgClass: 'bg-cyan-500/20 border-cyan-400/50',
                    textClass: 'text-cyan-300',
                };
            case 'PARTIALLY_SIGNED':
                return {
                    icon: <Clock size={16} className="text-yellow-400" />,
                    text: statusText,
                    bgClass: 'bg-yellow-500/20 border-yellow-400/50',
                    textClass: 'text-yellow-300',
                };
            case 'OUT_FOR_SIGNATURE':
                return {
                    icon: <Clock size={16} className="text-blue-400" />,
                    text: statusText,
                    bgClass: 'bg-blue-500/20 border-blue-400/50',
                    textClass: 'text-blue-300',
                };
            case 'DECLINED':
                return {
                    icon: <AlertCircle size={16} className="text-red-400" />,
                    text: statusText,
                    bgClass: 'bg-red-500/20 border-red-400/50',
                    textClass: 'text-red-300',
                };
            case 'DRAFT':
                return {
                    icon: <FileText size={16} className="text-gray-400" />,
                    text: statusText,
                    bgClass: 'bg-gray-500/20 border-gray-400/50',
                    textClass: 'text-gray-300',
                };
            case 'CANCELLED':
            case 'VOIDED':
                return {
                    icon: <AlertCircle size={16} className="text-orange-400" />,
                    text: statusText,
                    bgClass: 'bg-orange-500/20 border-orange-400/50',
                    textClass: 'text-orange-300',
                };
            case 'EXPIRED':
                return {
                    icon: <Clock size={16} className="text-red-400" />,
                    text: statusText,
                    bgClass: 'bg-red-500/20 border-red-400/50',
                    textClass: 'text-red-300',
                };
            case 'PENDING':
                return {
                    icon: <Clock size={16} className="text-yellow-400" />,
                    text: statusText,
                    bgClass: 'bg-yellow-500/20 border-yellow-400/50',
                    textClass: 'text-yellow-300',
                };
            case 'FILLED':
                return {
                    icon: <FileText size={16} className="text-blue-400" />,
                    text: statusText,
                    bgClass: 'bg-blue-500/20 border-blue-400/50',
                    textClass: 'text-blue-300',
                };
            default:
                return {
                    icon: <Clock size={16} className="text-gray-400" />,
                    text: statusText,
                    bgClass: 'bg-gray-500/20 border-gray-400/50',
                    textClass: 'text-gray-300',
                };
        }
    };

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        } catch {
            return dateString;
        }
    };

    return (
        <div
            className="min-h-screen w-full mt-[73px]"
            style={{
                fontFamily: "'Space Grotesk', sans-serif",
                background: 'radial-gradient(circle at top, #242446, #151526 70%)',
            }}
        >
            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap');

                    /* Slow spin for orbital rings */
                    @keyframes spin-slow {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                    .animate-spin-slow {
                        animation: spin-slow 8s linear infinite;
                    }

                    /* Pulsing ring animation */
                    @keyframes pulse-ring {
                        0% { 
                            transform: scale(1);
                            opacity: 0.6;
                        }
                        50% { 
                            transform: scale(1.15);
                            opacity: 0.3;
                        }
                        100% { 
                            transform: scale(1);
                            opacity: 0.6;
                        }
                    }
                    .animate-pulse-ring {
                        animation: pulse-ring 2s ease-in-out infinite;
                    }
                `}
            </style>

            <AnimatedBackground />

            <main className="max-w-7xl mx-auto p-6 md:p-10 relative z-10">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <FileText className="text-cyan-400" size={32} />
                        <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-purple-300">
                            Phụ Lục Hợp Đồng
                        </h1>
                    </div>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <p className="text-gray-400 text-lg">
                            Danh sách tất cả phụ lục của hợp đồng
                        </p>
                        {canCreateAddendum && (
                            <button
                                onClick={handleCreateAddendum}
                                className="group relative flex items-center gap-2 px-5 py-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 border-2 border-emerald-500/60 hover:border-emerald-400 rounded-lg text-emerald-300 hover:text-emerald-200 transition-all duration-300 font-semibold shadow-lg hover:shadow-[0_0_20px_rgba(16,185,129,0.5)]"
                                title="Tạo Phụ lục Mới"
                            >
                                <Plus size={20} className="group-hover:scale-110 transition-transform drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                                <span>Tạo Phụ lục</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
                            <p className="text-gray-400">Đang tải danh sách phụ lục...</p>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {!loading && error && (
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="flex flex-col items-center gap-4 text-center p-6">
                            <AlertCircle className="w-12 h-12 text-red-400" />
                            <p className="text-red-400 text-lg">{error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors"
                            >
                                Thử lại
                            </button>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && addendums.length === 0 && (
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="flex flex-col items-center gap-4 text-center p-6">
                            <FileText className="w-16 h-16 text-gray-600" />
                            <p className="text-gray-400 text-lg">Chưa có phụ lục nào</p>
                        </div>
                    </div>
                )}

                {/* Addendum List */}
                {!loading && !error && addendums.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {addendums.map((addendum) => {
                            const statusConfig = getStatusConfig(addendum.signnowStatus);
                            
                            return (
                                <div
                                    key={addendum.id}
                                    onClick={() => {
                                        if (projectId && contractId) {
                                            navigate(
                                                `${ROUTER.USER.ADDENDUM_SPACE}?id=${projectId}` +
                                                `&contractId=${contractId}` +
                                                `&addendumNumber=${addendum.addendumNumber}`
                                            );
                                        }
                                    }}
                                    className="relative bg-[#0B0E1E]/90 backdrop-blur-md border border-purple-500/40 rounded-lg overflow-hidden shadow-2xl transition-all duration-300 hover:border-purple-400/60 hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] cursor-pointer"
                                >
                                    {/* Glass Shine Animation */}
                                    <div className="absolute inset-0 glass-shine pointer-events-none"></div>

                                    {/* Left Gradient Border */}
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 via-cyan-500 to-purple-500"></div>

                                    {/* Content */}
                                    <div className="p-6 relative z-10">
                                        {/* Header */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <h3 className="text-xl font-bold text-white mb-2">
                                                    {addendum.title}
                                                </h3>
                                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                                    <span>Phụ lục số {addendum.addendumNumber}</span>
                                                    <span>•</span>
                                                    <span>Version {addendum.version}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Status Badge */}
                                        <div className="mb-4">
                                            <div
                                                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border ${statusConfig.bgClass} ${statusConfig.textClass} backdrop-blur-sm`}
                                            >
                                                {statusConfig.icon}
                                                <span>{statusConfig.text}</span>
                                            </div>
                                        </div>

                                        {/* Details */}
                                        <div className="space-y-3">
                                            {/* Effective Date */}
                                            <div className="flex items-center gap-2 text-sm">
                                                <Calendar size={16} className="text-cyan-400 flex-shrink-0" />
                                                <span className="text-gray-300">
                                                    <span className="text-gray-500">Ngày hiệu lực: </span>
                                                    {formatDate(addendum.effectiveDate)}
                                                </span>
                                            </div>

                                            {/* Payment Status */}
                                            {(() => {
                                                const isPaidValue = addendum.signnowStatus === "PAID" || addendum.signnowStatus === "COMPLETED";
                                                return (
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <DollarSign size={16} className={`${isPaidValue ? "text-green-400" : "text-yellow-400"} flex-shrink-0`} />
                                                        <span className="text-gray-300">
                                                            <span className="text-gray-500">Thanh toán: </span>
                                                            <span className={isPaidValue ? "text-green-400" : "text-yellow-400"}>
                                                                {isPaidValue ? 'Đã thanh toán' : 'Chưa thanh toán'}
                                                            </span>
                                                        </span>
                                                    </div>
                                                );
                                            })()}

                                            {/* Document Type */}
                                            <div className="flex items-center gap-2 text-sm">
                                                <FileText size={16} className="text-purple-400 flex-shrink-0" />
                                                <span className="text-gray-300">
                                                    <span className="text-gray-500">Loại tài liệu: </span>
                                                    {addendum.documentType === 'SIGNED' ? 'Đã ký' : 'Đã điền'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* View Document Button */}
                                        {addendum.documentUrl && (
                                            <div className="mt-4 pt-4 border-t border-gray-700">
                                                <a
                                                    href={addendum.documentUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="block w-full text-center px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/50 rounded-lg text-purple-300 hover:text-purple-200 transition-colors text-sm font-semibold"
                                                >
                                                    Xem tài liệu
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Fixed Create Addendum Button - Bottom Right Corner (if has permission) */}
                {canCreateAddendum && (
                    <div className="fixed bottom-6 right-6 z-50">
                        <button
                            onClick={handleCreateAddendum}
                            className="group relative flex items-center justify-center transition-all duration-300"
                            title="Tạo Phụ lục Mới"
                        >
                            {/* Orbital Rotating Ring */}
                            <div className="absolute -inset-2 rounded-2xl border border-dashed border-emerald-400/40 animate-spin-slow group-hover:animate-spin group-hover:border-emerald-400/70"></div>
                            
                            {/* Pulsing Ring Animation */}
                            <div className="absolute inset-0 rounded-2xl border-2 border-emerald-400/40 animate-pulse-ring"></div>
                            
                            {/* Tech Frame - Hexagonal Squircle */}
                            <div className="relative w-16 h-16 rounded-2xl border-2 border-emerald-500/60 bg-emerald-900/40 backdrop-blur-xl group-hover:border-emerald-400 group-hover:bg-emerald-800/50 transition-all duration-300 group-hover:shadow-[0_0_30px_rgba(16,185,129,0.8)] shadow-2xl">
                                {/* Inner Glow */}
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20"></div>
                                {/* Icon */}
                                <div className="relative w-full h-full flex items-center justify-center">
                                    <Plus 
                                        size={28} 
                                        className="text-emerald-300 group-hover:text-emerald-100 transition-all duration-300 group-hover:scale-110 drop-shadow-[0_0_15px_rgba(16,185,129,0.9)]" 
                                    />
                                </div>
                            </div>
                            <span className="sr-only">Tạo Phụ lục Mới</span>
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}

