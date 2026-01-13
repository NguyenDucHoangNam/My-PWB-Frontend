import React, { useState, useEffect } from 'react';
import { FiFileText, FiEye, FiDownload, FiSend, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { useNavigate, useSearchParams } from 'react-router-dom';
import contractService, { type ContractMetadata } from '../../services/contractService';
import projectService from '../../services/projectService';
import { type ProjectPermissionResponse } from '../../types/permission';
import { ROUTER } from '../../routes/router';
import toast from 'react-hot-toast';

const ContractTab: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('id');
  
  const [metadata, setMetadata] = useState<ContractMetadata | null>(null);
  const [permissions, setPermissions] = useState<ProjectPermissionResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadContractData = async () => {
      if (!projectId) return;
      
      try {
        setLoading(true);
        // Load permissions first
        const perms = await projectService.getProjectPermissionByProjectId(projectId);
        setPermissions(perms);
        
        // Load metadata if user can view contract
        if (perms.contract.canViewContract) {
          const meta = await contractService.getContractMetadata(projectId);
          setMetadata(meta);
        }
      } catch (error: any) {
        toast.error(error.message || "Không thể tải thông tin hợp đồng");
      } finally {
        setLoading(false);
      }
    };

    loadContractData();
  }, [projectId]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      DRAFT: { color: 'bg-gray-500/20 text-gray-300 border-gray-500/50', text: 'Nháp' },
      OUT_FOR_SIGNATURE: { color: 'bg-blue-500/20 text-blue-300 border-blue-500/50', text: 'Đang chờ ký' },
      PARTIALLY_SIGNED: { color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50', text: 'Ký một phần' },
      SIGNED: { color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50', text: 'Đã ký' },
      PAID: { color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50', text: 'Đã thanh toán' },
      COMPLETED: { color: 'bg-green-500/20 text-green-300 border-green-500/50', text: 'Hoàn tất' },
      DECLINED: { color: 'bg-red-500/20 text-red-300 border-red-500/50', text: 'Từ chối' },
      VOIDED: { color: 'bg-gray-500/20 text-gray-300 border-gray-500/50', text: 'Hủy bỏ' },
      EXPIRED: { color: 'bg-orange-500/20 text-orange-300 border-orange-500/50', text: 'Hết hạn' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${config.color}`}>
        {config.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="text-center p-16 bg-dark-surface rounded-xl border border-border-color animate-fade-in">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
        <p className="text-text-secondary">Đang tải thông tin hợp đồng...</p>
      </div>
    );
  }

  // Permission check
  if (permissions && !permissions.contract.canViewContract) {
    return (
      <div className="text-center p-16 bg-dark-surface rounded-xl border border-red-500/50 bg-red-500/10 animate-fade-in">
  <FiAlertCircle size={48} className="mx-auto text-red-400 mb-4"/>
        <h2 className="text-2xl font-bold text-red-300 mb-2">Không có quyền truy cập</h2>
        <p className="text-red-200/80">{permissions.reason || "Bạn không có quyền xem hợp đồng của dự án này."}</p>
      </div>
    );
  }

  // No contract exists
  if (!metadata) {
    return (
      <div className="text-center p-16 bg-dark-surface rounded-xl border border-border-color animate-fade-in">
        <FiFileText size={48} className="mx-auto text-text-secondary mb-4"/>
        <h2 className="text-2xl font-bold text-white">Chưa có Hợp đồng</h2>
        <p className="text-text-secondary mt-2 mb-6">Bắt đầu bằng cách tạo một hợp đồng để đảm bảo quyền lợi cho các bên.</p>
        {permissions?.contract.canCreateContract && (
          <button 
            onClick={() => navigate(`${ROUTER.USER.CONTRACTSPACE}?id=${projectId}`)}
            className="bg-accent text-white font-bold py-3 px-6 rounded-lg hover:bg-opacity-80 transition-colors"
          >
            Tạo Hợp đồng Mới
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-dark-surface p-8 rounded-xl border border-border-color animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Chi tiết Hợp đồng</h2>
        <div className="flex items-center gap-3">
          {metadata.signnowStatus && getStatusBadge(metadata.signnowStatus)}
          <span className="text-xs text-text-secondary">Version: {metadata.documentVersion}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-3">
          <div>
            <p className="text-text-secondary text-sm">Trạng thái SignNow</p>
            <p className="text-white font-medium">{metadata.signnowStatus ? getStatusBadge(metadata.signnowStatus) : "N/A"}</p>
          </div>
          <div>
            <p className="text-text-secondary text-sm">Loại tài liệu</p>
            <p className="text-white font-medium">{metadata.documentType === 'FILLED' ? 'Đã điền' : 'Đã ký'}</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <div>
            <p className="text-text-secondary text-sm">ID Hợp đồng</p>
            <p className="text-white font-medium">#{metadata.id}</p>
          </div>
          <div>
            <p className="text-text-secondary text-sm">Phiên bản</p>
            <p className="text-white font-medium">v{metadata.documentVersion}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {metadata.documentUrl && (
          <button 
            onClick={() => window.open(metadata.documentUrl, '_blank')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiEye size={16} />
            Xem trước
          </button>
        )}
        
        <button 
          onClick={async () => {
            try {
              await contractService.getFilledFile(metadata.id);
            } catch (error: any) {
              toast.error(error.message);
            }
          }}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <FiDownload size={16} />
          Tải PDF
        </button>

        {permissions?.contract.canInviteToSign && metadata.signnowStatus && ['DRAFT', 'DECLINED', 'OUT_FOR_SIGNATURE', 'PARTIALLY_SIGNED'].includes(metadata.signnowStatus) && (
          <button 
            onClick={() => navigate(`${ROUTER.USER.CONTRACTSPACE}?id=${projectId}`)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <FiSend size={16} />
            Mời ký
          </button>
        )}

        {permissions?.contract.canCreateContract && metadata.signnowStatus && ['DRAFT', 'DECLINED', 'OUT_FOR_SIGNATURE', 'PARTIALLY_SIGNED'].includes(metadata.signnowStatus) && (
          <button 
            onClick={() => navigate(`${ROUTER.USER.CONTRACTSPACE}?id=${projectId}`)}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-opacity-80 transition-colors"
          >
            <FiFileText size={16} />
            Chỉnh sửa
          </button>
        )}

        {(metadata.signnowStatus === 'SIGNED' || metadata.signnowStatus === 'PAID' || metadata.signnowStatus === 'COMPLETED') && (
          <button 
            onClick={async () => {
              try {
                await contractService.getSignedFile(metadata.id);
              } catch (error: any) {
                toast.error(error.message);
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <FiCheckCircle size={16} />
            Tải bản ký
          </button>
        )}
      </div>
    </div>
  );
};

export default ContractTab;