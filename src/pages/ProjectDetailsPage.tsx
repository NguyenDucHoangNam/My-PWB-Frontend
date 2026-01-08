import { FiPlus, FiFileText } from "react-icons/fi";
import type { Project } from "../types/types";
import { Link } from "react-router-dom";

const projectData: Project = {
  id: 1,
  name: "Starlight Vocal Mix",
  client: "Luna",
  imageUrl:
    "https://images.unsplash.com/photo-1516269613936-48c93545d4f3?w=400",
  status: "Đang thực hiện",
  progress: 60,
  contract: null,
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
  splits: [
    { memberId: 1, job: "Sản xuất Beat", percentage: 50, amount: 7500000 },
    { memberId: 2, job: "Viết lời & Hát", percentage: 40, amount: 6000000 },
    { memberId: 3, job: "Sáng tác Guitar", percentage: 10, amount: 1500000 },
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
  transactions: [
    {
      id: 1,
      date: "2025-08-01",
      description: "Luna nạp tiền (trả trước 50%)",
      amount: 7500000,
    },
    {
      id: 2,
      date: "2025-08-11",
      description: 'Thanh toán cho cột mốc "Sản xuất Beat"',
      amount: -7500000,
    },
  ],
  files: [
    {
      id: 1,
      name: "starlight_beat_v1.mp3",
      version: "v1",
      uploadedAt: "2025-08-05",
      commentCount: 3,
    },
    {
      id: 2,
      name: "starlight_beat_final.wav",
      version: "final",
      uploadedAt: "2025-08-10",
      commentCount: 1,
    },
  ],
};

function ProjectDetailsPage() {
  const getMemberById = (id: number) =>
    projectData.members.find((m) => m.id === id);
  return (
    <div className="bg-white text-gray-900 dark:bg-dark-bg dark:text-text-primary min-h-screen font-inter p-4 sm:p-6 lg:p-8 mt-16">
      <div className="w-full">
        <header className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-gray-200 dark:border-border-color mb-8">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <img
              src={projectData.imageUrl}
              alt={projectData.name}
              className="w-full sm:w-32 h-32 object-cover rounded-lg"
            />
            <div className="w-full">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500 dark:text-text-secondary">Dự án Hợp tác</p>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                    {projectData.name}
                  </h1>
                  <p className="text-accent font-medium mt-1">
                    Khách hàng: {projectData.client}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-500 dark:text-text-secondary">Tiến độ</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {projectData.progress}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-dark-bg rounded-full h-2.5">
                  <div
                    className="bg-accent h-2.5 rounded-full"
                    style={{ width: `${projectData.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <main className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-dark-surface p-6 rounded-xl border border-gray-200 dark:border-border-color h-full flex items-center justify-center">
              <p className="text-gray-500 dark:text-text-secondary">Không gian làm việc chính</p>
            </div>
          </main>

          <aside className="lg:col-span-1 space-y-8">
            <section className="bg-white dark:bg-dark-surface p-6 rounded-xl border border-gray-200 dark:border-border-color">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Hợp đồng</h2>
              {projectData.contract ? (
                <div>
                  <p className="text-sm text-gray-500 dark:text-text-secondary">
                    Trạng thái:{" "}
                    <span className="font-medium text-green-400">
                      {projectData.contract.status}
                    </span>
                  </p>
                  <button className="w-full mt-4 bg-gray-100 dark:bg-dark-bg border border-gray-200 dark:border-border-color text-gray-900 dark:text-text-primary font-semibold py-2 rounded-lg hover:border-accent transition-colors">
                    Xem chi tiết
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <FiFileText
                    size={32}
                    className="mx-auto text-text-secondary mb-2"
                  />
                  <p className="text-sm text-gray-500 dark:text-text-secondary mb-4">
                    Chưa có hợp đồng cho dự án này.
                  </p>
                  <Link to={"/createContract"}>
                    <button className="w-full bg-accent text-white font-bold py-2 rounded-lg hover:bg-opacity-80 transition-colors">
                      Tạo Hợp đồng
                    </button>
                  </Link>
                </div>
              )}
            </section>

            <section className="bg-white dark:bg-dark-surface p-6 rounded-xl border border-gray-200 dark:border-border-color">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-gray-900 dark:text-white text-xl">Thành viên</h2>
                <button className="text-sm text-accent hover:underline flex items-center space-x-1">
                  <FiPlus size={14} />
                  <span>Mời</span>
                </button>
              </div>
              <div className="space-y-4">
                {projectData.members.map((mem) => (
                  <div key={mem.id} className="flex items-center space-x-3">
                    <img
                      src={mem.avatarUrl}
                      alt={mem.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="font-bold text-gray-900 dark:text-text-primary">{mem.name}</p>
                      <p className="text-sm text-gray-500 dark:text-text-secondary">{mem.role}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-border-color">
                <h3 className="font-bold text-gray-900 dark:text-white text-md mb-4">
                  Phân chia Doanh thu (Split Sheet)
                </h3>
                <div className="space-y-3">
                  {projectData.splits.map((split) => {
                    const member = getMemberById(split.memberId);
                    if (!member) return null;
                    return (
                      <div
                        key={split.memberId}
                        className="flex items-center justify-between text-sm"
                      >
                        <div>
                          <p className="font-medium text-gray-900 dark:text-text-primary">
                            {member.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-text-secondary">
                            {split.job}
                          </p>
                        </div>
                        <p className="font-semibold text-accent">
                          {split.percentage}%
                        </p>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-border-color mt-3">
                  <p className="font-bold text-gray-900 dark:text-text-primary text-sm">Tổng</p>
                  <p className="font-bold text-gray-900 dark:text-white">100%</p>
                </div>
                <Link to={"/splitMoney"}>
                  <button className="w-full bg-accent text-white font-bold py-2 rounded-lg hover:bg-opacity-80 transition-colors">
                    Phân chia doanh thu
                  </button>
                </Link>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default ProjectDetailsPage;
