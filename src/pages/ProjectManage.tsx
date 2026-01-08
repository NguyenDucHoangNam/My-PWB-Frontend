import React, { useState, useMemo } from "react";
import {
  FiPlus,
  FiSearch,
  FiBriefcase,
  FiMessageSquare,
  FiClock,
  FiFileText,
} from "react-icons/fi";
import { Link } from "react-router-dom";

const dashboardData = {
  stats: [
    { id: 1, label: "Dự án đang hoạt động", value: "8", icon: <FiBriefcase /> },
    {
      id: 2,
      label: "Phản hồi đang chờ",
      value: "12",
      icon: <FiMessageSquare />,
    },
    { id: 3, label: "Nhiệm vụ sắp đến hạn", value: "5", icon: <FiClock /> },
    { id: 4, label: "Hóa đơn chưa trả", value: "3", icon: <FiFileText /> },
  ],
  projects: [
    {
      id: 1,
      name: "Starlight Vocal Mix",
      client: "Luna",
      status: "Demo",
      progress: 80,
      members: [
        "https://i.pravatar.cc/150?img=1",
        "https://i.pravatar.cc/150?img=2",
      ],
    },
    {
      id: 2,
      name: "Summer Vibe EP",
      client: "ChillVibes Records",
      status: "Mixing",
      progress: 60,
      members: [
        "https://i.pravatar.cc/150?img=3",
        "https://i.pravatar.cc/150?img=4",
        "https://i.pravatar.cc/150?img=5",
      ],
    },
    {
      id: 3,
      name: "Podcast Theme Song",
      client: "The Digital Nomad",
      status: "Hoàn thành",
      progress: 100,
      members: ["https://i.pravatar.cc/150?img=6"],
    },
    {
      id: 4,
      name: "Lo-fi Beat Pack Vol. 3",
      client: "BeatCo",
      status: "Làm beat",
      progress: 45,
      members: ["https://i.pravatar.cc/150?img=1"],
    },
    {
      id: 5,
      name: 'Cinematic Score "Odyssey"',
      client: "Indie Films",
      status: "Demo",
      progress: 95,
      members: [
        "https://i.pravatar.cc/150?img=7",
        "https://i.pravatar.cc/150?img=8",
      ],
    },
    {
      id: 6,
      name: 'Ad Music for "Nova"',
      client: "Adgency",
      status: "Mastering",
      progress: 90,
      members: ["https://i.pravatar.cc/150?img=9"],
    },
  ],
  tasks: [
    {
      id: 1,
      text: 'Gửi bản mix v2 cho "Starlight"',
      due: "Ngày mai",
      project: "Starlight Vocal Mix",
    },
    {
      id: 2,
      text: 'Thu âm guitar cho "Summer Vibe"',
      due: "Thứ Sáu",
      project: "Summer Vibe EP",
    },
    {
      id: 3,
      text: 'Hoàn thành bản master "Nova"',
      due: "2 ngày nữa",
      project: 'Ad Music for "Nova"',
    },
  ],
  feedback: [
    {
      id: 1,
      text: '"Đoạn intro nghe tuyệt vời, nhưng có thể giảm bass ở verse 2 không?"',
      client: "Luna",
      project: "Starlight Vocal Mix",
    },
    {
      id: 2,
      text: '"Sound design cho score rất hợp mood phim!"',
      client: "Indie Films",
      project: 'Cinematic Score "Odyssey"',
    },
    {
      id: 3,
      text: '"Yêu cầu thêm một phiên bản không có melody chính."',
      client: "BeatCo",
      project: "Lo-fi Beat Pack Vol. 3",
    },
  ],
};

const statusColors: { [key: string]: string } = {
  Demo: "bg-yellow-500/20 text-yellow-400",
  Mixing: "bg-blue-500/20 text-blue-400",
  "Hoàn thành": "bg-green-500/20 text-green-400",
  "Làm beat": "bg-teal-500/20 text-teal-400",
  Mastering: "bg-purple-500/20 text-purple-400",
};

function ProjectManage() {
  const [filter, setFilter] = useState("Tất cả");
  const projectFilters = [
    "Tất cả",
    "Làm beat",
    "Mixing",
    "Mastering",
    "Chờ phản hồi",
    "Hoàn thành",
  ];

  const filteredProjects = useMemo(() => {
    if (filter === "Tất cả") return dashboardData.projects;
    return dashboardData.projects.filter((p) => p.status === filter);
  }, [filter]);

  return (
    <div className="bg-white text-gray-900 dark:bg-dark-bg dark:text-text-primary min-h-screen font-inter p-4 sm:p-6 lg:p-8 mt-16">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Bảng điều khiển</h1>
            <p className="text-gray-500 dark:text-text-secondary mt-1">Chào mừng trở lại, Alex!</p>
          </div>
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <div className="relative">
              <FiSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-text-secondary" />
              <input
                type="text"
                placeholder="Tìm kiếm dự án..."
                className="bg-white border border-gray-300 dark:bg-dark-surface dark:border-border-color rounded-lg pl-10 pr-4 py-2 w-full sm:w-64 focus:ring-2 focus:ring-accent focus:outline-none text-gray-900 dark:text-text-primary placeholder:text-gray-500"
              />
            </div>
            <Link to={"/createProject"}>
              <button className="bg-accent text-white font-bold py-2 px-4 rounded-lg flex items-center space-x-2 hover:bg-opacity-80 transition-colors">
                <FiPlus />
                <span>Tạo Dự án</span>
              </button>
            </Link>
          </div>
        </header>

        <section className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {dashboardData.stats.map((stat) => (
            <div
              key={stat.id}
              className="bg-white dark:bg-dark-surface p-6 rounded-xl border border-gray-200 dark:border-border-color"
            >
              <div className="flex items-center justify-between">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </span>
                <div className="text-accent bg-accent/10 p-2 rounded-lg">
                  {React.cloneElement(stat.icon, { size: 24 })}
                </div>
              </div>
              <p className="text-gray-500 dark:text-text-secondary mt-2">{stat.label}</p>
            </div>
          ))}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <main className="lg:col-span-2">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Tất cả Dự án</h2>
              <div className="flex items-center space-x-2 mt-3 sm:mt-0 overflow-x-auto pb-2">
                {projectFilters.map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${
                      filter === f
                        ? "bg-accent text-white"
                        : "bg-white text-gray-600 hover:bg-gray-100 dark:bg-dark-surface dark:text-text-secondary dark:hover:bg-border-color"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-border-color">
              <div className="grid grid-cols-1 divide-y divide-border-color">
                {filteredProjects.map((project) => (
                  <div
                    key={project.id}
                    className="p-6 hover:bg-gray-50 dark:hover:bg-border-color/20 transition-colors"
                  >
                    <Link to={"/milestone"}>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                        <div>
                          <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                            {project.name}
                          </h3>
                          <p className="text-gray-500 dark:text-text-secondary text-sm">
                            {project.client}
                          </p>
                        </div>
                        <div
                          className={`mt-2 sm:mt-0 text-xs font-semibold px-3 py-1 rounded-full ${
                            statusColors[project.status] || ""
                          }`}
                        >
                          {project.status}
                        </div>
                      </div>
                    </Link>
                    <div className="flex items-center space-x-4 mt-4">
                      <div className="flex items-center -space-x-2">
                        {project.members.map((mem, i) => (
                          <img
                            key={i}
                            src={mem}
                            className="w-8 h-8 rounded-full border-2 border-white dark:border-dark-surface"
                            alt={`member ${i}`}
                          />
                        ))}
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-dark-bg rounded-full h-2">
                        <div
                          className="bg-accent h-2 rounded-full"
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-500 dark:text-text-secondary">
                        {project.progress}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </main>

          <aside className="lg:col-span-1 space-y-8">
            <div className="bg-white dark:bg-dark-surface p-6 rounded-xl border border-gray-200 dark:border-border-color">
              <h3 className="text-bold text-gray-900 dark:text-white text-lg mb-4">
                Nhiệm vụ của tôi & Deadline
              </h3>
              <div className="space-y-4">
                {dashboardData.tasks.map((task) => (
                  <div key={task.id}>
                    <p className="text-gray-900 dark:text-text-primary font-medium">{task.text}</p>
                    <p className="text-xs text-accent">
                      {task.project} &middot;{" "}
                      <span className="text-gray-500 dark:text-text-secondary">{task.due}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white dark:bg-dark-surface p-6 rounded-xl border border-gray-200 dark:border-border-color">
              <h3 className="text-bold text-gray-900 dark:text-white text-lg mb-4">
                Phản hồi chờ xử lý
              </h3>
              <div className="space-y-4">
                {dashboardData.feedback.map((fb) => (
                  <div key={fb.id} className="border-l-2 border-accent pl-3">
                    <p className="text-gray-900 dark:text-text-primary text-sm italic">
                      "{fb.text}"
                    </p>
                    <p className="text-xs text-gray-500 dark:text-text-secondary mt-1 text-right">
                      &mdash; {fb.client}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default ProjectManage;
