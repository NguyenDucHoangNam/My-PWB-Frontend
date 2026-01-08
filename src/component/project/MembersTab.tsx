import React from 'react';
import type { Project } from '../../types/types';
interface MembersTabProps {
  project: Project;
}

const MembersTab: React.FC<MembersTabProps> = ({ project }) => {
  const getMemberById = (id: number) => project.members.find(m => m.id === id);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
        <div className="bg-dark-surface p-6 rounded-xl border border-border-color">
            <h3 className="font-bold text-white text-lg mb-4">Quản lý Thành viên</h3>
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

export default MembersTab;