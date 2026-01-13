import { useState } from 'react';
import { UserPlus, X, Save, Trash2, EyeOff } from 'lucide-react';
import milestoneService from '../../../services/milestoneService';
import { useCosmicToast } from '../../../component/toast/CosmicToastProvider';
import { type MembersTabProps } from '../../../types/projectWorkspaceDetail';
import { getRoleBadge, generateAvatarUrl } from '../../../utils/projectWorkspaceDetail.helpers';
import { type Collaborator } from '../../../types/projectWorkspaceDetail';

const MembersTab = ({ assigned, projectId, milestoneId, onAssignmentChange, permission }: MembersTabProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [availableMembers, setAvailableMembers] = useState<Collaborator[]>([]);
    const [loadingAvailableMembers, setLoadingAvailableMembers] = useState(false);
    const [errorAvailableMembers, setErrorAvailableMembers] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [selectedMembers, setSelectedMembers] = useState<Map<number, string>>(new Map());

    const { showToast } = useCosmicToast();
    const canRemoveMemberFromMilestone = permission?.milestone?.canRemoveMembersFromMilestone !== undefined
        ? permission.milestone.canRemoveMembersFromMilestone
        : true;

    const handleOpenModal = async () => {
        setIsModalOpen(true);
        setLoadingAvailableMembers(true);
        setErrorAvailableMembers(null);
        setSelectedMembers(new Map());
        
        try {
            const members = await milestoneService.getAvailableMembers(projectId, milestoneId);
            const convertedMembers: Collaborator[] = members.map(m => {
                const displayName = m.userName || m.userEmail || 'Thành viên';
                // Cast to any to access all possible avatar field naming conventions from API
                const memberData = m as any;
                const avatarUrl = 
                    memberData.avatarUrl || 
                    memberData.userAvatarUrl || 
                    memberData.avatar || 
                    memberData.avatar_url || 
                    memberData.profileImageUrl || 
                    memberData.imageUrl;
                return {
                    id: String(m.userId),
                    name: displayName,
                    avatar: avatarUrl || generateAvatarUrl(displayName, 40),
                    role: m.projectRole === 'COLLABORATOR' ? 'COLLABORATOR' : m.projectRole === 'OBSERVER' ? 'OBSERVER' : undefined,
                };
            });
            setAvailableMembers(convertedMembers);
        } catch (err: any) {
            console.error('Error loading available members:', err);
            setErrorAvailableMembers(err.message || 'Không thể tải danh sách thành viên có thể thêm.');
        } finally {
            setLoadingAvailableMembers(false);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setErrorAvailableMembers(null);
    };

    const handleToggleMember = (userId: number) => {
        setSelectedMembers((prev: Map<number, string>) => {
            const newMap = new Map(prev);
            if (newMap.has(userId)) {
                newMap.delete(userId);
            } else {
                newMap.set(userId, '');
            }
            return newMap;
        });
    };

    const handleDescriptionChange = (userId: number, description: string) => {
        setSelectedMembers((prev: Map<number, string>) => {
            const newMap = new Map(prev);
            newMap.set(userId, description);
            return newMap;
        });
    };

    const handleSaveAssignments = async () => {
        if (selectedMembers.size === 0) {
            handleCloseModal();
            return;
        }

        setSaving(true);
        try {
            const members = Array.from(selectedMembers.entries()).map(([userId, description]) => ({
                userId: userId,
                description: description.trim() || undefined,
            }));
            
            const result = await milestoneService.addMembersToMilestone(projectId, milestoneId, {
                members: members
            });
            
            if (result.members) {
                const updatedMembers: Collaborator[] = result.members.map(m => {
                    const displayName = m.userName || m.userEmail || 'Thành viên';
                    // Cast to any to access all possible avatar field naming conventions from API
                    const memberData = m as any;
                    const avatarUrl = 
                        memberData.avatarUrl || 
                        memberData.userAvatarUrl || 
                        memberData.avatar || 
                        memberData.avatar_url || 
                        memberData.profileImageUrl || 
                        memberData.imageUrl;
                    return {
                        id: String(m.userId),
                        name: displayName,
                        avatar: avatarUrl || generateAvatarUrl(displayName, 40),
                        role: m.role,
                        description: m.description,
                    };
                });
                onAssignmentChange(updatedMembers);
            }
            handleCloseModal();
        } catch (err: any) {
            console.error('Error adding members:', err);
            setErrorAvailableMembers(err.message || 'Không thể thêm thành viên vào cột mốc.');
        } finally {
            setSaving(false);
        }
    };

    const handleRemoveMember = async (memberId: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa thành viên này khỏi cột mốc?')) {
            return;
        }

        setSaving(true);
        try {
            const result = await milestoneService.removeMemberFromMilestone(projectId, milestoneId, memberId);
            setErrorAvailableMembers(null);
            
            if (result.members) {
                const updatedMembers: Collaborator[] = result.members.map(m => {
                    const displayName = m.userName || m.userEmail || 'Thành viên';
                    // Cast to any to access all possible avatar field naming conventions from API
                    const memberData = m as any;
                    const avatarUrl = 
                        memberData.avatarUrl || 
                        memberData.userAvatarUrl || 
                        memberData.avatar || 
                        memberData.avatar_url || 
                        memberData.profileImageUrl || 
                        memberData.imageUrl;
                    return {
                        id: String(m.userId),
                        name: displayName,
                        avatar: avatarUrl || generateAvatarUrl(displayName, 40),
                        role: m.role,
                        description: m.description,
                        isAnonymous: m.isAnonymous || false,
                    };
                });
                onAssignmentChange(updatedMembers);
            }

            showToast({
                type: 'success',
                title: '✅ Xóa thành công',
                message: 'Xóa thành viên khỏi cột mốc thành công'
            });
        } catch (err: any) {
            console.error('Error removing member:', err);
            const errorMessage = err.message || 'Không thể xóa thành viên khỏi cột mốc.';
            setErrorAvailableMembers(errorMessage);
            showToast({
                type: 'error',
                title: '❌ Lỗi',
                message: errorMessage
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <div className="relative bg-[#0B0E1E]/60 backdrop-blur-xl border border-purple-500/30 rounded-xl shadow-[0_0_30px_rgba(168,85,247,0.1)] p-4 md:p-5 animate-fade-in overflow-hidden">
                {/* Background Glow */}
                <div className="absolute -top-1/2 -right-1/2 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-1/2 -left-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl"></div>
                
                <div className="relative z-10">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-400/30">
                                <UserPlus size={18} className="text-purple-300" />
                            </div>
                            <h3 className="text-lg md:text-xl font-extrabold bg-gradient-to-r from-purple-300 via-cyan-300 to-purple-300 bg-clip-text text-transparent">
                                Chỉ định Phi Hành Đoàn
                            </h3>
                        </div>
                        {permission?.milestone?.canAddMembersToMilestone && (
                            <button 
                                onClick={handleOpenModal}
                                className="group relative flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-1.5 px-3 text-sm rounded-lg shadow-lg shadow-purple-500/30 transition-all duration-300 transform hover:scale-105 hover:shadow-purple-500/50 overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                                <UserPlus size={14} className="relative z-10 group-hover:rotate-90 transition-transform duration-300" />
                                <span className="relative z-10 hidden md:inline">Điều Chỉnh Đội Ngũ</span>
                            </button>
                        )}
                    </div>
                    
                    <div className="flex flex-col gap-2">
                        {assigned.length > 0 ? assigned.map((member, index) => (
                            <div 
                                key={member.id} 
                                className="group relative flex items-center justify-between p-3 bg-gradient-to-r from-[#0B0E1E]/80 to-[#1a1a2e]/80 backdrop-blur-sm rounded-lg border border-purple-500/20 hover:border-purple-400/40 transition-all duration-300 hover:shadow-[0_0_20px_rgba(168,85,247,0.2)]"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                {/* Hover Glow Effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-cyan-500/5 to-purple-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                
                                <div className="relative z-10 flex items-center gap-3 flex-1">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-purple-400/30 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        <img 
                                            src={member.avatar} 
                                            alt={member.name} 
                                            className="relative w-10 h-10 rounded-full border-2 border-purple-400/50 group-hover:border-purple-300 transition-all duration-300 shadow-[0_0_15px_rgba(168,85,247,0.3)]" 
                                        />
                                        {member.isAnonymous && (
                                            <div className="absolute -top-0.5 -right-0.5 bg-gradient-to-br from-orange-500 to-red-500 rounded-full p-0.5 shadow-[0_0_10px_rgba(251,146,60,0.6)]" title="Thành viên ẩn danh">
                                                <EyeOff size={8} className="text-white" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-1 flex-1">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            <span className="text-white font-semibold text-sm group-hover:text-purple-200 transition-colors duration-300">
                                                {member.name}
                                            </span>
                                            {member.isAnonymous && (
                                                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 text-xs bg-gradient-to-r from-orange-900/60 to-red-900/60 border border-orange-500/50 text-orange-300 rounded-full shadow-[0_0_10px_rgba(251,146,60,0.3)]">
                                                    <EyeOff size={10} />
                                                    Ẩn danh
                                                </span>
                                            )}
                                            {getRoleBadge(member.role)}
                                        </div>
                                        {member.description && (
                                            <span className="text-xs text-gray-300 italic pl-1 border-l-2 border-purple-500/30">
                                                "{member.description}"
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {canRemoveMemberFromMilestone && member.role !== 'OWNER' && member.role !== 'CLIENT' && (
                                    <button 
                                        onClick={() => handleRemoveMember(member.id)}
                                        disabled={saving}
                                        className="relative z-10 p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group/delete"
                                        title="Xóa thành viên"
                                    >
                                        <Trash2 size={14} className="group-hover/delete:scale-110 transition-transform duration-300" />
                                    </button>
                                )}
                            </div>
                        )) : (
                            <div className="relative p-8 text-center rounded-lg border border-purple-500/20 bg-gradient-to-br from-[#0B0E1E]/40 to-[#1a1a2e]/40 backdrop-blur-sm">
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-cyan-500/5 to-purple-500/5 rounded-lg"></div>
                                <div className="relative z-10">
                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-500/20 border border-purple-400/30 mb-3">
                                        <UserPlus size={24} className="text-purple-300/50" />
                                    </div>
                                    <p className="text-gray-400 italic text-sm">Chưa có ai được phân công cho cột mốc này.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal moved outside the card - renders as a portal-like popup */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
                    <div className="relative bg-[#0B0E1E]/95 backdrop-blur-xl border-2 border-purple-500/40 rounded-xl shadow-[0_0_50px_rgba(168,85,247,0.3)] w-full max-w-md max-h-[90vh] z-[10000] overflow-hidden flex flex-col">
                        {/* Background Glow */}
                        <div className="absolute -top-1/2 -right-1/2 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"></div>
                        <div className="absolute -bottom-1/2 -left-1/2 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl"></div>
                        
                        <div className="relative z-10 flex flex-col h-full">
                            <div className="flex justify-between items-center p-4 border-b border-purple-500/30 bg-gradient-to-r from-purple-900/20 via-transparent to-cyan-900/20 flex-shrink-0">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-400/30">
                                        <UserPlus size={16} className="text-purple-300" />
                                    </div>
                                    <h4 className="text-base font-extrabold bg-gradient-to-r from-purple-300 to-cyan-300 bg-clip-text text-transparent">
                                        Thêm/Bớt Thành viên
                                    </h4>
                                </div>
                                <button 
                                    onClick={handleCloseModal} 
                                    className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                            <div className="p-4 overflow-y-auto flex-1 min-h-0">
                                {loadingAvailableMembers ? (
                                    <div className="text-center py-8">
                                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-500/20 border border-purple-400/30 mb-3">
                                            <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                        <p className="text-gray-300 text-sm">Đang tải danh sách thành viên...</p>
                                    </div>
                                ) : errorAvailableMembers ? (
                                    <div className="text-center py-8">
                                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-500/20 border border-red-400/30 mb-3">
                                            <X size={20} className="text-red-400" />
                                        </div>
                                        <p className="text-red-400 mb-3 text-sm">{errorAvailableMembers}</p>
                                        <button
                                            onClick={handleOpenModal}
                                            className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-sm rounded-lg hover:from-purple-500 hover:to-pink-500 transition-all duration-300"
                                        >
                                            Thử lại
                                        </button>
                                    </div>
                                ) : availableMembers.length === 0 ? (
                                    <div className="text-center py-8">
                                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-500/20 border border-purple-400/30 mb-3">
                                            <UserPlus size={24} className="text-purple-300/50" />
                                        </div>
                                        <p className="text-gray-400 italic text-sm">Không có thành viên nào có thể thêm vào cột mốc này.</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        {availableMembers.map(member => {
                                            const userId = Number(member.id);
                                            const isSelected = selectedMembers.has(userId);
                                            const description = selectedMembers.get(userId) || '';
                                            return (
                                                <div 
                                                    key={member.id} 
                                                    className={`group relative p-3 rounded-lg border transition-all duration-300 ${
                                                        isSelected 
                                                            ? 'bg-gradient-to-r from-purple-500/20 via-cyan-500/10 to-purple-500/20 border-purple-400/50 shadow-[0_0_20px_rgba(168,85,247,0.2)]' 
                                                            : 'bg-[#0B0E1E]/40 border-purple-500/20 hover:border-purple-400/40 hover:bg-[#0B0E1E]/60'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2 mb-1.5">
                                                        <input 
                                                            type="checkbox"
                                                            className="form-checkbox h-4 w-4 bg-gray-900 border-purple-500/50 text-purple-600 focus:ring-purple-500 cursor-pointer checked:bg-purple-600 checked:border-purple-600"
                                                            checked={isSelected}
                                                            onChange={() => handleToggleMember(userId)}
                                                        />
                                                        <div className="relative">
                                                            <div className={`absolute inset-0 rounded-full blur-md transition-opacity duration-300 ${isSelected ? 'bg-purple-400/30 opacity-100' : 'bg-purple-400/20 opacity-0 group-hover:opacity-100'}`}></div>
                                                            <img 
                                                                src={member.avatar} 
                                                                alt={member.name} 
                                                                className="relative w-8 h-8 rounded-full border-2 border-purple-400/50 group-hover:border-purple-300 transition-all duration-300" 
                                                            />
                                                        </div>
                                                        <div className="flex items-center gap-1.5 flex-1 flex-wrap">
                                                            <span className={`font-semibold text-sm transition-colors duration-300 ${isSelected ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                                                                {member.name}
                                                            </span>
                                                            {getRoleBadge(member.role)}
                                                        </div>
                                                    </div>
                                                    {isSelected && (
                                                        <div className="mt-2 ml-6 pl-3 border-l-2 border-purple-400/30">
                                                            <label className="block text-xs text-gray-300 mb-1.5 font-medium">
                                                                Mô tả vai trò (tùy chọn):
                                                            </label>
                                                            <input
                                                                type="text"
                                                                placeholder="Ví dụ: Nghệ sĩ Guitar, Producer, Sound Engineer..."
                                                                value={description}
                                                                onChange={(e) => handleDescriptionChange(userId, e.target.value)}
                                                                className="w-full bg-[#0B0E1E]/60 border border-purple-500/30 text-white text-sm rounded-lg p-2 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400 placeholder-gray-500 transition-all duration-300"
                                                                onClick={(e) => e.stopPropagation()}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                            <div className="p-4 border-t border-purple-500/30 bg-gradient-to-r from-purple-900/10 via-transparent to-cyan-900/10 flex justify-between items-center flex-shrink-0">
                                <div className="text-xs text-gray-300">
                                    {selectedMembers.size > 0 && (
                                        <span className="flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse"></span>
                                            Đã chọn <span className="font-bold text-purple-300">{selectedMembers.size}</span> thành viên
                                        </span>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={handleCloseModal}
                                        disabled={saving}
                                        className="flex items-center justify-center gap-1.5 bg-gray-700/50 hover:bg-gray-600/50 text-white font-semibold py-1.5 px-3 text-sm rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-600/50"
                                    >
                                        Hủy
                                    </button>
                                    <button 
                                        onClick={handleSaveAssignments}
                                        disabled={saving || loadingAvailableMembers || selectedMembers.size === 0 || errorAvailableMembers !== null}
                                        className="group relative flex items-center justify-center gap-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-1.5 px-3 text-sm rounded-lg shadow-lg shadow-purple-500/30 transition-all duration-300 transform hover:scale-105 hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                                        {saving ? (
                                            <>
                                                <div className="relative z-10 w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                <span className="relative z-10">Đang lưu...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Save size={14} className="relative z-10" />
                                                <span className="relative z-10">Lưu Thay đổi</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default MembersTab;

