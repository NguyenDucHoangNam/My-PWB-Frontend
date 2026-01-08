import React, { useState, useEffect } from 'react';
import { FiFileText, FiPlus, FiTrash2, FiArrowLeft } from 'react-icons/fi';
import { Link } from 'react-router-dom';

interface Milestone {
  id: number;
  name: string;
  cost: number;
}

interface ContractData {
  projectName: string;
  partyA: string;
  partyB: string;
  scopeSummary: string;
  totalFee: number;
  paymentType: 'full' | 'milestone';
  milestones: Milestone[];
}

const initialData: ContractData = {
  projectName: 'Starlight Vocal Mix', // Dữ liệu này sẽ được truyền từ trang dự án
  partyA: 'Alex Thorne (Producer)',
  partyB: 'Luna (Client)',
  scopeSummary: '',
  totalFee: 0,
  paymentType: 'milestone',
  milestones: [
    { id: 1, name: 'Sản xuất Beat', cost: 7500000 },
    { id: 2, name: 'Thu âm Vocal', cost: 5000000 },
    { id: 3, name: 'Final Mix & Master', cost: 2500000 },
  ],
};

function CreateContractPage() {
  const [contract, setContract] = useState<ContractData>(initialData);

  useEffect(() => {
    const total = contract.milestones.reduce((sum, m) => sum + m.cost, 0);
    setContract(c => ({ ...c, totalFee: total }));
  }, [contract.milestones]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContract(prev => ({ ...prev, [name]: value }));
  };
  
  const handleMilestoneChange = (index: number, field: keyof Milestone, value: string | number) => {
    const newMilestones = [...contract.milestones];
    const milestoneToUpdate = { ...newMilestones[index], [field]: value };
    newMilestones[index] = milestoneToUpdate;
    setContract(p => ({ ...p, milestones: newMilestones }));
  };
  
  const addMilestone = () => {
    setContract(p => ({
      ...p,
      milestones: [...p.milestones, { id: Date.now(), name: '', cost: 0 }]
    }));
  };

  const removeMilestone = (id: number) => {
    setContract(p => ({
      ...p,
      milestones: p.milestones.filter(m => m.id !== id)
    }));
  };
  
  const handleSubmit = () => {
      console.log("Contract Data:", contract);
      alert("Hợp đồng đã được tạo!");
      window.location.href = "/projectDetail";
  }

  return (
    <div className="bg-white text-gray-900 dark:bg-dark-bg dark:text-text-primary min-h-screen font-inter p-4 sm:p-6 lg:p-8 mt-16">
      <div className="max-w-7xl mx-auto">
        
        {/* Nút quay lại */}
        <div className="mb-6">
          <Link 
            to="/projectDetail" 
            className="inline-flex items-center gap-2 text-gray-300 hover:text-white font-medium transition"
          >
            <FiArrowLeft />
            Quay lại
          </Link>
        </div>

        <h1 className="text-4xl font-bold text-white mb-8">Tạo Hợp đồng Mới</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form bên trái */}
          <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-gray-200 dark:border-border-color space-y-8">
            <div>
                <h2 className="text-xl font-bold text-white mb-4">Phần A: Thông tin Cơ bản</h2>
                <div className="space-y-4">
                    <input type="text" name="partyA" value={contract.partyA} onChange={handleInputChange} placeholder="Bên A" className="w-full bg-white border border-gray-300 text-gray-900 dark:bg-dark-bg dark:border-border-color dark:text-text-primary rounded-lg p-3"/>
                    <input type="text" name="partyB" value={contract.partyB} onChange={handleInputChange} placeholder="Bên B" className="w-full bg-white border border-gray-300 text-gray-900 dark:bg-dark-bg dark:border-border-color dark:text-text-primary rounded-lg p-3"/>
                    <textarea name="scopeSummary" value={contract.scopeSummary} onChange={handleInputChange} rows={3} placeholder="Tóm tắt phạm vi công việc..." className="w-full bg-white border border-gray-300 text-gray-900 dark:bg-dark-bg dark:border-border-color dark:text-text-primary rounded-lg p-3"></textarea>
                </div>
            </div>
            <div>
                <h2 className="text-xl font-bold text-white mb-4">Phần B: Cột mốc & Thanh toán</h2>
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <button onClick={() => setContract(p => ({...p, paymentType: 'full'}))} className={`p-4 rounded-lg border-2 text-left bg-white dark:bg-transparent ${contract.paymentType === 'full' ? 'border-accent bg-accent/10' : 'border-gray-200 dark:border-border-color'}`}><p className="font-bold text-gray-900 dark:text-white">Thanh toán Toàn bộ</p></button>
                    <button onClick={() => setContract(p => ({...p, paymentType: 'milestone'}))} className={`p-4 rounded-lg border-2 text-left bg-white dark:bg-transparent ${contract.paymentType === 'milestone' ? 'border-accent bg-accent/10' : 'border-gray-200 dark:border-border-color'}`}><p className="font-bold text-gray-900 dark:text-white">Thanh toán theo Cột mốc</p></button>
                </div>

                {contract.paymentType === 'full' && (
                     <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-text-secondary block mb-2">Tổng chi phí (VNĐ)</label>
                        <input type="number" value={contract.milestones[0]?.cost || 0} onChange={e => handleMilestoneChange(0, 'cost', parseInt(e.target.value))} className="w-full bg-white border border-gray-300 text-gray-900 dark:bg-dark-bg dark:border-border-color dark:text-text-primary rounded-lg p-3"/>
                    </div>
                )}
                
                {contract.paymentType === 'milestone' && (
                    <div className="space-y-4">
                        {contract.milestones.map((milestone, index) => (
                           <div key={milestone.id} className="flex items-center gap-4">
                                <input type="text" placeholder="Tên cột mốc" value={milestone.name} onChange={e => handleMilestoneChange(index, 'name', e.target.value)} className="flex-grow bg-white border border-gray-300 text-gray-900 dark:bg-dark-bg dark:border-border-color dark:text-text-primary rounded-lg p-2" />
                                <input type="number" placeholder="Chi phí (VNĐ)" value={milestone.cost} onChange={e => handleMilestoneChange(index, 'cost', parseInt(e.target.value))} className="w-40 bg-white border border-gray-300 text-gray-900 dark:bg-dark-bg dark:border-border-color dark:text-text-primary rounded-lg p-2" />
                                <button onClick={() => removeMilestone(milestone.id)} className="text-text-secondary hover:text-red-500 p-2"><FiTrash2 size={18}/></button>
                           </div>
                        ))}
                        <button onClick={addMilestone} className="flex items-center space-x-2 text-accent font-bold py-2 px-3 rounded-lg hover:bg-accent/10 text-sm"><FiPlus/><span>Thêm Cột mốc</span></button>
                    </div>
                )}
            </div>
          </div>
          
          {/* Preview bên phải */}
          <div className="bg-white dark:bg-dark-surface p-8 rounded-2xl border border-gray-200 dark:border-border-color">
              <div className="flex items-center text-xl font-bold text-white mb-6">
                <FiFileText className="mr-3 text-accent"/>
                Xem trước Hợp đồng
              </div>
              <div className="prose max-w-none text-gray-600 dark:prose-invert dark:text-text-secondary space-y-4">
                  <h3 className="text-gray-900 dark:text-white">Hợp đồng Dịch vụ Sản xuất Âm nhạc</h3>
                  <p><strong>Dự án:</strong> {contract.projectName}</p>
                  <p><strong>Bên A (Nhà sản xuất):</strong> {contract.partyA}</p>
                  <p><strong>Bên B (Khách hàng):</strong> {contract.partyB}</p>
                  <hr className="border-gray-200 dark:border-border-color"/>
                  <h4>Phạm vi Công việc</h4>
                  <p>{contract.scopeSummary || "..."}</p>
                  <h4>Chi phí & Cột mốc</h4>
                  {contract.milestones.map(m => (
                      <div key={m.id} className="flex justify-between items-center">
                          <span>{m.name}</span>
                          <span className="font-mono">{new Intl.NumberFormat('vi-VN').format(m.cost)} VNĐ</span>
                      </div>
                  ))}
                   <hr className="border-gray-200 dark:border-border-color"/>
                  <div className="flex justify-between items-center text-lg">
                      <strong className="text-gray-900 dark:text-white">TỔNG CỘNG</strong>
                      <strong className="text-accent">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(contract.totalFee)}</strong>
                  </div>
              </div>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end mt-8">
            <button onClick={handleSubmit} className="bg-green-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-500 transition-colors">
                Lưu Hợp đồng
            </button>
        </div>
      </div>
    </div>
  );
}

export default CreateContractPage;
