import React from 'react';
import { FiPlus, FiMoreVertical } from 'react-icons/fi';
import type { Project } from '../../types/types';
interface ProjectHeaderProps {
  project: Project;
}

const ProjectHeader: React.FC<ProjectHeaderProps> = ({ project }) => {
  return (
    <header className="bg-dark-surface p-6 rounded-2xl border border-border-color mb-8">
        <div className="flex flex-col sm:flex-row items-start gap-6">
            <img src={project.imageUrl} alt={project.name} className="w-full sm:w-32 h-32 object-cover rounded-lg"/>
            <div className="w-full">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm text-text-secondary">Dự án Hợp tác</p>
                        <h1 className="text-3xl font-bold text-white mt-1">{project.name}</h1>
                        <p className="text-accent font-medium mt-1">Khách hàng: {project.client}</p>
                    </div>
                    <div className="flex space-x-2">
                         <button className="bg-accent text-white font-bold py-2 px-4 rounded-lg flex items-center space-x-2 hover:bg-opacity-80 transition-colors text-sm"><FiPlus /><span>Tải File</span></button>
                        <button className="p-2 bg-dark-bg rounded-lg border border-border-color text-text-secondary hover:text-white"><FiMoreVertical/></button>
                    </div>
                </div>
                <div className="mt-4">
                    <div className="flex justify-between items-center mb-1"><span className="text-sm text-text-secondary">Tiến độ</span><span className="text-sm font-bold text-white">{project.progress}%</span></div>
                    <div className="w-full bg-dark-bg rounded-full h-2.5"><div className="bg-accent h-2.5 rounded-full" style={{width: `${project.progress}%`}}></div></div>
                </div>
            </div>
        </div>
    </header>
  );
};

export default ProjectHeader;