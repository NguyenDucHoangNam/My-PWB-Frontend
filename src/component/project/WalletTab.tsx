import React from 'react';
import type { Project } from '../../types/types';
interface WalletTabProps {
  project: Project;
}

const WalletTab: React.FC<WalletTabProps> = ({ project }) => {
  return (
    <div className="bg-dark-surface p-6 rounded-xl border border-border-color animate-fade-in">
        <h3 className="font-bold text-white text-lg mb-6">Ví tiền Dự án</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-center">
            <div className="bg-dark-bg p-4 rounded-lg">
                <p className="text-sm text-text-secondary">Tổng kinh phí</p>
                <p className="text-2xl font-bold text-white mt-1">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(project.totalFee)}</p>
            </div>
            <div className="bg-dark-bg p-4 rounded-lg">
                <p className="text-sm text-text-secondary">Đã thanh toán</p>
                <p className="text-2xl font-bold text-green-400 mt-1">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(project.balance)}</p>
            </div>
            <div className="bg-dark-bg p-4 rounded-lg">
                <p className="text-sm text-text-secondary">Còn lại</p>
                <p className="text-2xl font-bold text-yellow-400 mt-1">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(project.totalFee - project.balance)}</p>
            </div>
        </div>
         <h4 className="font-bold text-white text-md mb-4">Lịch sử Giao dịch</h4>
         <div className="space-y-2">
            {project.transactions.map(t => (
                <div key={t.id} className="flex justify-between items-center p-3 rounded-lg hover:bg-dark-bg">
                    <div>
                        <p className="font-medium text-text-primary">{t.description}</p>
                        <p className="text-xs text-text-secondary">{t.date}</p>
                    </div>
                    <p className={`font-bold ${t.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {t.amount > 0 ? '+' : ''}{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(t.amount)}
                    </p>
                </div>
            ))}
         </div>
    </div>
  );
};

export default WalletTab;