import React from 'react';
import { FiFileText } from 'react-icons/fi';
import type { Project } from '../../types/types';

interface ContractTabProps {
  project: Project;
}

const ContractTab: React.FC<ContractTabProps> = ({ project }) => {
  if (!project.contract) {
    return (
        <div className="text-center p-16 bg-dark-surface rounded-xl border border-border-color animate-fade-in">
            <FiFileText size={48} className="mx-auto text-text-secondary mb-4"/>
            <h2 className="text-2xl font-bold text-white">Chưa có Hợp đồng</h2>
            <p className="text-text-secondary mt-2 mb-6">Bắt đầu bằng cách tạo một hợp đồng để đảm bảo quyền lợi cho các bên.</p>
            <button className="bg-accent text-white font-bold py-3 px-6 rounded-lg hover:bg-opacity-80 transition-colors">
                Tạo Hợp đồng Mới
            </button>
        </div>
    );
  }

  return (
    <div className="bg-dark-surface p-8 rounded-xl border border-border-color animate-fade-in">
        <h2 className="text-2xl font-bold text-white mb-6">Chi tiết Hợp đồng</h2>
        <div className="prose prose-invert max-w-none text-text-secondary">
            <p><strong>Bên A:</strong> {project.contract.partyA}</p>
            <p><strong>Bên B:</strong> {project.contract.partyB}</p>
            <p><strong>Phạm vi công việc:</strong> {project.contract.scopeSummary}</p>
            <p><strong>Tổng chi phí:</strong> <span className="text-accent font-bold">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(project.contract.totalFee)}</span></p>
            <p><strong>Hình thức thanh toán:</strong> {project.contract.paymentType === 'full' ? 'Thanh toán Toàn bộ' : 'Thanh toán theo Cột mốc'}</p>
        </div>
    </div>
  );
};

export default ContractTab;