import React, { useState } from "react";
import {
  FiDollarSign,
  FiPlus,
  FiChevronDown,
  FiPieChart,
  FiCheckCircle,
  FiArrowLeft,
} from "react-icons/fi";
import type { Project, Milestone } from "../../types/types";
import { Link } from "react-router-dom";

const projectData: Project = {
  id: 1,
  name: "Starlight Vocal Mix",
  client: "Luna",
  imageUrl:
    "https://images.unsplash.com/photo-1516269613936-48c93545d4f3?w=400",
  status: "Đang thực hiện",
  progress: 60,
  contract: {
    partyA: "Alex Thorne (Producer)",
    partyB: "Luna (Client)",
    scopeSummary: "Full production for one single.",
    totalFee: 15000000,
    paymentType: "milestone",
    status: "Đã ký",
  },
  members: [
    {
      id: 1,
      name: "Alex Thorne",
      avatarUrl: "https://i.pravatar.cc/150?img=1",
      role: "Producer",
      permission: "Collaborator",
    },
    {
      id: 2,
      name: "Luna",
      avatarUrl: "https://i.pravatar.cc/150?img=2",
      role: "Vocalist",
      permission: "Client",
    },
    {
      id: 3,
      name: "Kai",
      avatarUrl: "https://i.pravatar.cc/150?img=3",
      role: "Guitarist",
      permission: "Collaborator",
    },
  ],
  milestones: [
    {
      id: 1,
      name: "Sản xuất Beat",
      status: "Đã hoàn thành",
      assigneeId: 1,
      deadline: "2025-08-10",
      cost: 7500000,
    },
    {
      id: 2,
      name: "Thu âm Vocal",
      status: "Đang làm",
      assigneeId: 2,
      deadline: "2025-08-20",
      cost: 5000000,
    },
    {
      id: 3,
      name: "Final Mix & Master",
      status: "Chưa bắt đầu",
      assigneeId: 1,
      deadline: "2025-08-30",
      cost: 2500000,
    },
  ],
  splits: [
    // Cột mốc 1: Sản xuất Beat (Tổng 7,500,000)
    { memberId: 1, job: "Sản xuất Beat", amount: 4000000, milestoneId: 1 },
    {
      memberId: 3,
      job: "Thuê ngoài (Guitarist)",
      amount: 500000,
      milestoneId: 1,
    },
    // Cột mốc 2: Thu âm Vocal (Tổng 5,000,000)
    { memberId: 2, job: "Session Vocalist", amount: 4000000, milestoneId: 2 },
    { memberId: 1, job: "Recording Engineer", amount: 1000000, milestoneId: 2 },
  ],
  transactions: [],
  files: [],
};

const AccordionMilestone = ({
  milestone,
  project,
}: {
  milestone: Milestone;
  project: Project;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const milestoneSplits = project.splits.filter(
    (s) => s.milestoneId === milestone.id
  );
  const totalSplitAmount = milestoneSplits.reduce(
    (sum, s) => sum + s.amount,
    0
  );

  return (
    <div className="bg-white dark:bg-dark-bg border border-gray-200 dark:border-border-color rounded-lg">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-4"
      >
        <div className="text-left">
          <p className="font-bold text-gray-900 dark:text-white">{milestone.name}</p>
          <p className="text-sm text-gray-500 dark:text-text-secondary">
            {new Intl.NumberFormat("vi-VN").format(milestone.cost)} VNĐ
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <p
            className={`text-sm font-medium ${
              totalSplitAmount === milestone.cost
                ? "text-green-400"
                : "text-yellow-400"
            }`}
          >
            Đã chia: {new Intl.NumberFormat("vi-VN").format(totalSplitAmount)}{" "}
            VNĐ
          </p>
          <FiChevronDown
            className={`transform transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>
      {isOpen && (
        <div className="p-4 border-t border-gray-200 dark:border-border-color">
          <div className="space-y-3">
            {milestoneSplits.map((split, index) => {
              const member = project.members.find(
                (m) => m.id === split.memberId
              );
              return (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-50 dark:bg-dark-surface p-3 rounded-md"
                >
                  <p className="text-sm text-gray-900 dark:text-text-primary">
                    {member?.name} ({split.job})
                  </p>
                  <p className="text-sm font-bold text-accent">
                    {new Intl.NumberFormat("vi-VN").format(split.amount)} VNĐ
                  </p>
                </div>
              );
            })}
          </div>
          <div className="text-right text-sm text-gray-500 dark:text-text-secondary mt-2">
            Còn dư:{" "}
            {new Intl.NumberFormat("vi-VN").format(
              milestone.cost - totalSplitAmount
            )}{" "}
            VNĐ
          </div>
          <button className="text-sm text-accent font-semibold mt-4 flex items-center space-x-2 hover:bg-accent/10 p-2 rounded-md">
            <FiPlus />
            <span>Thêm phân chia</span>
          </button>
        </div>
      )}
    </div>
  );
};

function SplitSheetPage() {
  const [project, setProject] = useState<Project>(projectData);
  const totalSplitAmount = project.splits.reduce((sum, s) => sum + s.amount, 0);

  if (!project.contract) {
    return <div>Dự án này chưa có hợp đồng.</div>;
  }
  const handleSubmit = () => {
    alert("Phân chia danh thu thành công!");
    window.location.href = "/projectDetail";
  };
  return (
    <div className="bg-white text-gray-900 dark:bg-dark-bg dark:text-text-primary min-h-screen font-inter p-4 sm:p-6 lg:p-8 mt-16">
      <div className="mb-6">
        <Link
          to="/projectDetail"
          className="inline-flex items-center gap-2 text-gray-300 hover:text-white font-medium transition"
        >
          <FiArrowLeft />
          Quay lại
        </Link>
      </div>
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Phân chia Doanh thu & Thanh toán
          </h1>
          <p className="text-gray-500 dark:text-text-secondary mt-2">
            Quản lý quyền lợi tài chính cho các thành viên trong dự án.
          </p>
        </header>

        <section className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-gray-200 dark:border-border-color mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="bg-gray-100 dark:bg-dark-bg p-4 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-text-secondary flex items-center justify-center space-x-2">
                <FiPieChart />
                <span>Ngân sách Tổng</span>
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {new Intl.NumberFormat("vi-VN").format(
                  project.contract.totalFee
                )}{" "}
                VNĐ
              </p>
            </div>
            <div className="bg-gray-100 dark:bg-dark-bg p-4 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-text-secondary flex items-center justify-center space-x-2">
                <FiCheckCircle className="text-green-400" />
                <span>Tổng đã Phân chia</span>
              </p>
              <p className="text-2xl font-bold text-green-400 mt-1">
                {new Intl.NumberFormat("vi-VN").format(totalSplitAmount)} VNĐ
              </p>
            </div>
            <div className="bg-gray-100 dark:bg-dark-bg p-4 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-text-secondary flex items-center justify-center space-x-2">
                <FiDollarSign className="text-yellow-400" />
                <span>Hình thức</span>
              </p>
              <p className="text-2xl font-bold text-yellow-400 mt-1">
                {project.contract.paymentType === "full"
                  ? "Toàn bộ"
                  : "Theo Cột mốc"}
              </p>
            </div>
          </div>
        </section>

        {project.contract.paymentType === "full" && (
          <section className="bg-dark-surface p-6 rounded-xl border border-border-color animate-fade-in">
            {/* ... UI for full project split ... */}
          </section>
        )}

        {project.contract.paymentType === "milestone" && (
          <section className="animate-fade-in">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">
              Phân chia Ngân sách theo từng Cột mốc
            </h2>
            <div className="space-y-4">
              {project.milestones.map((milestone) => (
                <AccordionMilestone
                  key={milestone.id}
                  milestone={milestone}
                  project={project}
                />
              ))}
            </div>
          </section>
        )}

        <div className="flex justify-end mt-8">
            <button
            onClick={handleSubmit}
            className="bg-green-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-500 transition-colors">
              Lưu tất cả thay đổi
            </button>
        </div>
      </div>
    </div>
  );
}

export default SplitSheetPage;
