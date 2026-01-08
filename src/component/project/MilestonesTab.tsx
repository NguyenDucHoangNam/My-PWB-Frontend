import React from 'react';
import { FiMoreVertical } from 'react-icons/fi';
import type { Project } from '../../types/types';
interface MilestonesTabProps {
  project: Project;
}

const MilestonesTab: React.FC<MilestonesTabProps> = ({ project }) => {
  const getMemberById = (id: number) => project.members.find(m => m.id === id);

  const milestoneStatusColors: { [key: string]: string } = {
    'Chưa bắt đầu': 'bg-gray-500/20 text-gray-400',
    'Đang làm': 'bg-blue-500/20 text-blue-400',
    'Chờ duyệt': 'bg-yellow-500/20 text-yellow-400',
    'Đã hoàn thành': 'bg-green-500/20 text-green-400',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
        {project.milestones.map(m => (
            <div key={m.id} className="bg-dark-surface p-5 rounded-xl border border-border-color">
                 <div className={`text-xs font-semibold px-3 py-1 rounded-full inline-block mb-3 ${milestoneStatusColors[m.status]}`}>{m.status}</div>
                 <h3 className="font-bold text-white text-lg">{m.name}</h3>
                 <p className="text-sm text-text-secondary mt-2">Deadline: {m.deadline}</p>
                 <p className="text-sm text-accent font-bold mt-1">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(m.cost)}</p>
                 <div className="flex items-center justify-between mt-4 pt-4 border-t border-border-color">
                     <div className="flex items-center space-x-2">
                         <img src={getMemberById(m.assigneeId)?.avatarUrl} className="w-8 h-8 rounded-full" alt={getMemberById(m.assigneeId)?.name} />
                         <span className="text-sm text-text-secondary">{getMemberById(m.assigneeId)?.name}</span>
                     </div>
                     <button className="p-2 rounded-lg hover:bg-dark-bg text-text-secondary hover:text-white"><FiMoreVertical/></button>
                 </div>
            </div>
        ))}
    </div>
  );
};

export default MilestonesTab;