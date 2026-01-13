import { useState } from "react";
import {
  FiPlus,
  FiCheckCircle,
  FiArrowLeft,
} from "react-icons/fi";
import type { Member, Milestone } from "../../types/types"; // Giả sử file types.ts đã có
import { Link } from "react-router-dom";

interface Comment {
  id: number;
  user: { name: string; avatarUrl: string };
  timestamp: string; // ví dụ: "0:45"
  text: string;
}

interface MilestoneFile {
  id: number;
  name: string;
  url: string;
  comments: Comment[];
}

interface MilestoneDetails extends Milestone {
  projectName: string;
  files: MilestoneFile[];
  members: Member[];
  splits: { memberId: number; job: string; amount: number }[];
}

const milestoneData: MilestoneDetails = {
  id: 2,
  projectName: "Starlight Vocal Mix",
  name: "Thu âm Vocal",
  status: "Đang làm",
  assigneeId: 2,
  deadline: "2025-08-20",
  cost: 5000000,
  files: [
    {
      id: 1,
      name: "starlight_vocal_take1.wav",
      url: "#",
      comments: [
        {
          id: 1,
          user: { name: "Luna", avatarUrl: "https://i.pravatar.cc/150?img=2" },
          timestamp: "0:15",
          text: "Chỗ này em hát hơi chênh một chút, mình thu lại nhé!",
        },
        {
          id: 2,
          user: {
            name: "Alex Thorne",
            avatarUrl: "https://i.pravatar.cc/150?img=1",
          },
          timestamp: "0:32",
          text: "Đoạn này feeling rất tốt, giữ nguyên nhé.",
        },
      ],
    },
    { id: 2, name: "starlight_vocal_harmony.wav", url: "#", comments: [] },
  ],
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
  ],
  splits: [
    { memberId: 1, job: "Recording Engineer", amount: 1000000 },
    { memberId: 2, job: "Session Vocalist", amount: 4000000 },
  ],
};

const WaveformSVG = () => (
  <svg
    width="100%"
    height="60"
    viewBox="0 0 500 60"
    preserveAspectRatio="none"
    className="text-text-secondary"
  >
    <path
      d="M0 30 L10 20 L20 40 L30 10 L40 50 L50 25 L60 35 L70 15 L80 45 L90 20 L100 40 L110 25 L120 30 L130 10 L140 50 L150 20 L160 40 L170 25 L180 35 L190 5 L200 55 L210 20 L220 40 L230 25 L240 30 L250 15 L260 45 L270 10 L280 50 L290 20 L300 40 L310 25 L320 35 L330 15 L340 45 L350 20 L360 40 L370 25 L380 30 L390 10 L400 50 L410 20 L420 40 L430 25 L440 35 L450 5 L460 55 L470 20 L480 40 L490 25 L500 30"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
    />
  </svg>
);

const AudioPlayer = ({ file }: { file: MilestoneFile }) => (
  <div className="bg-dark-bg p-4 rounded-xl border border-border-color">
    <p className="font-bold text-text-primary mb-3">{file.name}</p>
    <div className="relative mb-4 cursor-pointer">
      <WaveformSVG />
      {file.comments.map((comment) => (
        <img
          key={comment.id}
          src={comment.user.avatarUrl}
          alt={comment.user.name}
          title={`${comment.user.name} (${comment.timestamp}): ${comment.text}`}
          className="w-6 h-6 rounded-full absolute top-1/2 -translate-y-1/2 border-2 border-dark-surface"
          style={{
            left: `${(parseInt(comment.timestamp.split(":")[1]) / 60) * 100}%`,
          }} // Simplified positioning
        />
      ))}
    </div>
    <div className="space-y-3 max-h-48 overflow-y-auto">
      {file.comments.map((comment) => (
        <div key={comment.id} className="flex items-start space-x-3 text-sm">
          <img
            src={comment.user.avatarUrl}
            alt={comment.user.name}
            className="w-8 h-8 rounded-full flex-shrink-0"
          />
          <div>
            <p>
              <span className="font-bold text-text-primary">
                {comment.user.name}
              </span>
              <span className="text-accent ml-2 text-xs font-mono">
                {comment.timestamp}
              </span>
            </p>
            <p className="text-text-secondary">{comment.text}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

function MilestoneDetailsPage() {
  const [milestone] = useState(milestoneData);
  const totalSplitAmount = milestone.splits.reduce(
    (sum, s) => sum + s.amount,
    0
  );

  return (
    <div className="bg-dark-bg min-h-screen font-inter text-text-primary p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Link
            to="/projectManage"
            className="inline-flex items-center gap-2 text-gray-300 hover:text-white font-medium transition"
          >
            <FiArrowLeft />
            Quay lại
          </Link>
        </div>
        <header className="mb-8">
          <p className="text-sm text-text-secondary">
            Dự án:{" "}
            <a href="#" className="text-accent hover:underline">
              {milestone.projectName}
            </a>
          </p>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-2">
            <h1 className="text-4xl font-bold text-white">{milestone.name}</h1>
            <div className="flex items-center space-x-4 mt-3 sm:mt-0">
              <span className="text-sm text-text-secondary">Trạng thái:</span>
              <select
                defaultValue={milestone.status}
                className="bg-dark-surface border border-border-color rounded-lg px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option>Đang Chờ Lệnh</option>
                <option>Đang làm</option>
                <option>Chờ duyệt</option>
                <option>Đã hoàn thành</option>
              </select>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <main className="lg:col-span-2 space-y-8">
            <section className="bg-dark-surface p-6 rounded-xl border border-border-color">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">
                  Files & Phản hồi
                </h2>
                <button className="text-sm bg-accent text-white font-semibold py-1.5 px-3 rounded-md hover:bg-opacity-80 transition-colors flex items-center space-x-2">
                  <FiPlus size={16} />
                  <span>Tải lên File</span>
                </button>
              </div>
              <div className="space-y-6">
                {milestone.files.map((file) => (
                  <AudioPlayer key={file.id} file={file} />
                ))}
              </div>
            </section>
          </main>

          <aside className="lg:col-span-1 space-y-8">
            <section className="bg-dark-surface p-6 rounded-xl border border-border-color">
              <h2 className="text-xl font-bold text-white mb-4">Ví Cột mốc</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Ngân sách</span>
                  <span className="font-bold text-white">
                    {new Intl.NumberFormat("vi-VN").format(milestone.cost)} VNĐ
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Đã phân chia</span>
                  <span className="font-bold text-white">
                    {new Intl.NumberFormat("vi-VN").format(totalSplitAmount)}{" "}
                    VNĐ
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-border-color">
                  <span className="text-text-secondary">Còn lại</span>
                  <span className="font-bold text-yellow-400">
                    {new Intl.NumberFormat("vi-VN").format(
                      milestone.cost - totalSplitAmount
                    )}{" "}
                    VNĐ
                  </span>
                </div>
              </div>
              <button className="w-full bg-green-600 text-white font-bold py-2.5 rounded-lg mt-6 hover:bg-green-500 transition-colors flex items-center justify-center space-x-2">
                <FiCheckCircle />
                <span>Yêu cầu Thanh toán</span>
              </button>
            </section>

            <section className="bg-dark-surface p-6 rounded-xl border border-border-color">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">
                  Thành viên & Phân chia
                </h2>
                <button className="text-sm text-accent hover:underline flex items-center space-x-1">
                  <FiPlus size={14} />
                  <span>Quản lý</span>
                </button>
              </div>
              <div className="space-y-3">
                {milestone.splits.map((split) => {
                  const member = milestone.members.find(
                    (m) => m.id === split.memberId
                  );
                  if (!member) return null;
                  return (
                    <div
                      key={split.memberId}
                      className="flex items-center justify-between bg-dark-bg p-3 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={member.avatarUrl}
                          alt={member.name}
                          className="w-8 h-8 rounded-full"
                        />
                        <div>
                          <p className="font-bold text-text-primary text-sm">
                            {member.name}
                          </p>
                          <p className="text-xs text-text-secondary">
                            {split.job}
                          </p>
                        </div>
                      </div>
                      <p className="font-bold text-accent text-sm">
                        {new Intl.NumberFormat("vi-VN").format(split.amount)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default MilestoneDetailsPage;
