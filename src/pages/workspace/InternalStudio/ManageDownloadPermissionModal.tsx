import { useState, useEffect } from 'react';
import { X, Download, User, Loader } from 'lucide-react';
import milestoneService, { type MilestoneDetailResponse } from '../../../services/milestoneService';
import trackService, { type TrackDownloadPermissionUser } from '../../../services/trackService';
import { useCosmicToast } from '../../../component/toast/CosmicToastProvider';
import { type TrackDetailResponse } from '../../../services/trackService';

interface ManageDownloadPermissionModalProps {
    show: boolean;
    onClose: () => void;
    projectId: string | null;
    milestoneId: string | null;
    track: TrackDetailResponse | null;
}

export const ManageDownloadPermissionModal: React.FC<ManageDownloadPermissionModalProps> = ({
    show,
    onClose,
    projectId,
    milestoneId,
    track,
}) => {
    const [milestoneDetail, setMilestoneDetail] = useState<MilestoneDetailResponse | null>(null);
    const [usersWithPermission, setUsersWithPermission] = useState<TrackDownloadPermissionUser[]>([]);
    const [loading, setLoading] = useState(false);
    const [processingUserId, setProcessingUserId] = useState<number | null>(null);
    // const [_saving, setSaving] = useState(false);
    const { showToast } = useCosmicToast();

    // Load data khi modal mở
    useEffect(() => {
        if (show && projectId && milestoneId && track) {
            loadData();
        }
    }, [show, projectId, milestoneId, track]);

    const loadData = async () => {
        if (!projectId || !milestoneId || !track) return;

        setLoading(true);
        try {
            // Load milestone detail và download permissions song song
            const [detail, permissions] = await Promise.all([
                milestoneService.getMilestoneDetail(Number(projectId), Number(milestoneId)),
                trackService.getTrackDownloadPermissions(track.id),
            ]);

            setMilestoneDetail(detail);
            setUsersWithPermission(permissions.users || []);
        } catch (error: any) {
            console.error('Error loading data:', error);
            showToast({
                type: 'error',
                title: '❌ Lỗi',
                message: error.response?.data?.message || error.message || 'Không thể tải thông tin',
            });
        } finally {
            setLoading(false);
        }
    };

    // Toggle quyền download cho user
    const handleTogglePermission = async (userId: number, hasPermission: boolean) => {
        if (!track) return;

        setProcessingUserId(userId);
        try {
            if (hasPermission) {
                // Hủy quyền
                await trackService.revokeTrackDownloadPermission(track.id, userId);
                showToast({
                    type: 'success',
                    title: '✅ Hủy quyền thành công',
                    message: 'Đã hủy quyền download cho thành viên',
                });
            } else {
                // Cấp quyền
                await trackService.grantTrackDownloadPermissions(track.id, [userId]);
                showToast({
                    type: 'success',
                    title: '✅ Cấp quyền thành công',
                    message: 'Đã cấp quyền download cho thành viên',
                });
            }

            // Reload data
            await loadData();
        } catch (error: any) {
            console.error('Error toggling permission:', error);
            showToast({
                type: 'error',
                title: '❌ Lỗi',
                message: error.response?.data?.message || error.message || `Không thể ${hasPermission ? 'hủy' : 'cấp'} quyền download`,
            });
        } finally {
            setProcessingUserId(null);
        }
    };

    // Thay thế toàn bộ danh sách quyền
    // const _handleReplaceAll = async (userIds: number[]) => {
    //     if (!track) return;

    //     setSaving(true);
    //     try {
    //         await trackService.updateTrackDownloadPermissions(track.id, userIds);

    //         showToast({
    //             type: 'success',
    //             title: '✅ Cập nhật thành công',
    //             message: `Đã cập nhật quyền download cho track "${track.name}"`,
    //         });

    //         // Reload data
    //         await loadData();
    //     } catch (error: any) {
    //         console.error('Error replacing permissions:', error);
    //         showToast({
    //             type: 'error',
    //             title: '❌ Lỗi',
    //             message: error.response?.data?.message || error.message || 'Không thể cập nhật quyền download',
    //         });
    //     } finally {
    //         setSaving(false);
    //     }
    // };

    if (!show) return null;

    const members = milestoneDetail?.members || [];
    const nonOwnerMembers = members.filter((m) => m.role !== 'OWNER');
    const usersWithPermissionIds = new Set(usersWithPermission.map(u => u.userId));

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 border border-purple-500/30 rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-[0_0_25px_rgba(147,51,234,0.3)] max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-purple-500/20 border border-purple-500/50">
                            <Download size={28} className="text-purple-400" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-white">
                                Quản Lý Quyền Download
                            </h3>
                            <p className="text-sm text-gray-400 mt-1">
                                Cấp quyền tải xuống cho track: <span className="text-purple-300 font-semibold">{track?.name || 'N/A'}</span>
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={processingUserId !== null}
                        className="p-2 rounded-lg hover:bg-gray-800/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <X size={20} className="text-gray-400" />
                    </button>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <Loader size={40} className="animate-spin text-purple-400 mb-4" />
                        <p className="text-gray-400">Đang tải danh sách thành viên...</p>
                    </div>
                ) : nonOwnerMembers.length === 0 ? (
                    <div className="text-center py-12">
                        <User size={48} className="mx-auto mb-4 text-gray-600" />
                        <p className="text-gray-400">
                            Chưa có thành viên nào trong cột mốc này
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                            (Chủ dự án luôn có quyền download)
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="mb-6">
                            {/* Danh sách thành viên với toggle switch */}
                            {nonOwnerMembers.length > 0 ? (
                                <div className="space-y-2">
                                    {nonOwnerMembers.map((member) => {
                                        const hasPermission = usersWithPermissionIds.has(member.userId);
                                        const permissionInfo = usersWithPermission.find(u => u.userId === member.userId);
                                        const isProcessing = processingUserId === member.userId;

                                        return (
                                            <div
                                                key={member.userId}
                                                className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${hasPermission
                                                        ? 'bg-green-900/20 border-green-500/30'
                                                        : 'bg-black/30 border-gray-700/50'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3 flex-1">
                                                    <div
                                                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${hasPermission
                                                                ? 'bg-gradient-to-br from-green-500 to-emerald-500'
                                                                : 'bg-gradient-to-br from-gray-500 to-gray-600'
                                                            }`}
                                                    >
                                                        {member.userName?.charAt(0)?.toUpperCase() || '?'}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="font-semibold text-white">
                                                            {member.userName || member.userEmail || 'Thành viên'}
                                                        </div>
                                                        <div className="text-xs text-gray-400">
                                                            {member.userEmail}
                                                        </div>
                                                        {hasPermission && permissionInfo && (
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                Cấp bởi: {permissionInfo.grantedByUserName} • {new Date(permissionInfo.grantedAt).toLocaleDateString('vi-VN')}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    {isProcessing ? (
                                                        <Loader size={20} className="animate-spin text-purple-400" />
                                                    ) : (
                                                        <>
                                                            <span
                                                                className={`text-sm font-medium ${hasPermission ? 'text-green-400' : 'text-gray-500'
                                                                    }`}
                                                            >
                                                                {hasPermission ? '✓ Có quyền' : 'Không có quyền'}
                                                            </span>
                                                            <label className="relative inline-flex items-center cursor-pointer">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={hasPermission}
                                                                    onChange={() => handleTogglePermission(member.userId, hasPermission)}
                                                                    disabled={isProcessing}
                                                                    className="sr-only peer"
                                                                />
                                                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"></div>
                                                            </label>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <User size={48} className="mx-auto mb-4 text-gray-600" />
                                    <p className="text-gray-400">
                                        Không có thành viên nào (ngoài chủ dự án) trong cột mốc này
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex gap-3 pt-4 border-t border-gray-700/50">
                            <button
                                onClick={onClose}
                                disabled={processingUserId !== null}
                                className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Đóng
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

