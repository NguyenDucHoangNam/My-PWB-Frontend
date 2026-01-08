import React from 'react';
import { FiPlus } from 'react-icons/fi';
import type { Project } from '../../types/types';

interface MembersAndSplitsTabProps {
  project: Project;
}

const MembersAndSplitsTab: React.FC<MembersAndSplitsTabProps> = ({ project }) => {
  const getMemberById = (id: number) => project.members.find(m => m.id === id);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
        <div className="bg-dark-surface p-6 rounded-xl border border-border-color">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-white text-lg">Quản lý Thành viên</h3>
                <button className="text-sm bg-accent/10 text-accent font-semibold py-1.5 px-3 rounded-md hover:bg-accent/20 transition-colors flex items-center space-x-2">
                   <FiPlus size={16}/><span>Thêm Thành viên</span>
                </button>
            </div>
            <div className="space-y-4">
                {project.members.map(mem => (
                    <div key={mem.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <img src={mem.avatarUrl} alt={mem.name} className="w-10 h-10 rounded-full"/>
                            <div>
                                <p className="font-bold text-text-primary">{mem.name}</p>
                                <p className="text-sm text-text-secondary">{mem.role}</p>
                            </div>
                        </div>
                        <p className="text-sm bg-dark-bg px-3 py-1 rounded-full border border-border-color">{mem.permission}</p>
                    </div>
                ))}
            </div>
        </div>
        <div className="bg-dark-surface p-6 rounded-xl border border-border-color">
            <h3 className="font-bold text-white text-lg mb-4">Bảng Phân chia (Split Sheet)</h3>
            <div className="space-y-2">
               {project.splits.map(split => (
                   <div key={split.memberId} className="flex items-center justify-between p-3 rounded-lg hover:bg-dark-bg">
                       <div>
                           <p className="font-medium text-text-primary">{getMemberById(split.memberId)?.name}</p>
                           <p className="text-xs text-text-secondary">{split.job}</p>
                       </div>
                       <p className="font-bold text-accent text-lg">{split.percentage}%</p>
                   </div>
               ))}
               <div className="flex items-center justify-between p-3 border-t border-border-color mt-2">
                   <p className="font-bold text-text-primary">Tổng</p>
                   <p className="font-bold text-white text-lg">100%</p>
               </div>
            </div>
        </div>
    </div>
  );
};

export default MembersAndSplitsTab;