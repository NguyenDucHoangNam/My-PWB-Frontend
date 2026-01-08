import React from 'react';
import { FiPaperclip, FiMessageSquare } from 'react-icons/fi';
import type { Project } from '../../types/types';
interface FilesTabProps {
  project: Project;
}

const FilesTab: React.FC<FilesTabProps> = ({ project }) => {
  return (
    <div className="bg-dark-surface p-6 rounded-xl border border-border-color animate-fade-in">
        <h3 className="font-bold text-white text-lg mb-4">Files & Phản hồi</h3>
         <div className="grid grid-cols-1 divide-y divide-border-color">
           {project.files.map(file => (
               <div key={file.id} className="flex justify-between items-center py-4 px-2 hover:bg-dark-bg rounded-lg cursor-pointer">
                   <div className="flex items-center space-x-4">
                       <FiPaperclip className="text-text-secondary"/>
                       <div>
                           <p className="font-medium text-text-primary">{file.name}</p>
                           <p className="text-xs text-text-secondary">Version: {file.version} - Uploaded: {file.uploadedAt}</p>
                       </div>
                   </div>
                   <div className="text-sm text-text-secondary flex items-center">
                       <FiMessageSquare className="mr-2"/>
                       {file.commentCount} comments
                   </div>
               </div>
           ))}
         </div>
    </div>
  );
};

export default FilesTab;