import { UploadCloud, Send } from 'lucide-react';
import { useCosmicToast } from '../../../component/toast/CosmicToastProvider';
import { useAuth } from '@/contexts/AuthContext';
import { type WorkspaceTabProps } from '../../../types/projectWorkspaceDetail';
import WorkspaceNavigationBox from './WorkspaceNavigationBox';

const WorkspaceTab = ({ onNavigateToInternalStudio, onNavigateToClientRoom, canEnterInternalRoom, canEnterCustomerRoom, projectRole, contractStatus, allMoneySplitsApproved }: WorkspaceTabProps) => {
    const { showToast } = useCosmicToast();
    const { userRole } = useAuth();
    const isAdmin = userRole === "ADMIN";

    // Xác định phòng nào được hiển thị dựa trên role
    const showInternalRoom = isAdmin || projectRole === 'OWNER' || projectRole === 'COLLABORATOR';
    const showClientRoom = isAdmin || projectRole === 'OWNER' || projectRole === 'CLIENT' || projectRole === 'OBSERVER';

    const handleNavigateToInternalStudio = () => {
        // Kiểm tra quyền cơ bản
        if (!canEnterInternalRoom) {
            showToast({
                type: 'error',
                message: 'Bạn không đủ quyền truy cập vào Phòng Nội bộ (Internal Studio).'
            });
            return;
        }
        
        // ADMIN hoặc OWNER luôn được vào, không cần kiểm tra điều kiện gì
        if (isAdmin || projectRole === 'OWNER') {
            onNavigateToInternalStudio();
            return;
        }
        
        // Các role khác (COLLABORATOR): Kiểm tra tất cả phân chia tiền phải được duyệt
        if (!allMoneySplitsApproved) {
            showToast({
                type: 'error',
                title: '🔒 Không thể truy cập',
                message: 'Phòng Nội bộ chỉ mở khi TẤT CẢ các phân chia tiền đã được duyệt (APPROVED).'
            });
            return;
        }
        
        onNavigateToInternalStudio();
    };

    const handleNavigateToClientRoom = () => {
        // Kiểm tra quyền cơ bản
        if (!canEnterCustomerRoom) {
            showToast({
                type: 'error',
                message: 'Bạn không đủ quyền truy cập vào Phòng khách hàng (Client Room).'
            });
            return;
        }
        
        // ADMIN hoặc OWNER luôn được vào, không cần kiểm tra điều kiện gì
        if (isAdmin || projectRole === 'OWNER') {
            onNavigateToClientRoom();
            return;
        }
        
        // Kiểm tra: Nếu là CLIENT thì phải có contractStatus = PAID hoặc COMPLETED
        if (projectRole === 'CLIENT' && contractStatus !== 'PAID' && contractStatus !== 'COMPLETED') {
            showToast({
                type: 'error',
                title: '🔒 Không thể truy cập',
                message: 'Phòng Khách hàng chỉ mở khi dự án đã được thanh toán (contractStatus = PAID hoặc COMPLETED).'
            });
            return;
        }
        
        onNavigateToClientRoom();
    };

    const gridClassName = showInternalRoom && showClientRoom
        ? 'grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in'
        : 'grid grid-cols-1 gap-6 animate-fade-in';

    return (
        <div className={gridClassName}>
            {showInternalRoom && (
                <WorkspaceNavigationBox 
                    title="Trạm Tín Hiệu Nội Bộ"
                    icon={UploadCloud}
                    borderColor="#3b82f6"
                    textColor="#60a5fa"
                    hasPermission={canEnterInternalRoom}
                    onNavigate={handleNavigateToInternalStudio}
                    animationType="signal-station"
                />
            )}
            
            {showClientRoom && (
                <WorkspaceNavigationBox 
                    title="Khoang Phê Duyệt"
                    icon={Send}
                    borderColor="#22c55e"
                    textColor="#4ade80"
                    hasPermission={canEnterCustomerRoom}
                    onNavigate={handleNavigateToClientRoom}
                    animationType="approval-bay"
                />
            )}
        </div>
    );
};

export default WorkspaceTab;

