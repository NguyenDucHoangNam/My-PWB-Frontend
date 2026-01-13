import CreateProPackage from "@/component/dashboardAdmin/CreateProPackage";
import ProPackageList from "@/component/dashboardAdmin/ProPackageList";
import React, { useState } from "react";
const ProducerPackagePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"create" | "list">("list");
  return (
    <div className="min-h-screen text-white relative overflow-hidden p-4 sm:p-8">
      {/* Lớp phủ mờ để chữ dễ đọc */}
      <div className="absolute inset-0 z-0"></div>
      {/* Nội dung chính */}
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* --- Thanh Điều Hướng Tabs (Galaxy Navigation) --- */}
        <div className="mb-4 flex justify-center space-x-4 p-2 bg-gray-800/70 rounded-full border border-purple-500/50 shadow-xl">
          <button
            onClick={() => setActiveTab("list")}
            className={`px-6 py-2 rounded-full text-lg font-semibold transition duration-300 ${
              activeTab === "list"
                ? "bg-purple-600 shadow-lg shadow-purple-500/50 text-white transform scale-105"
                : "text-gray-300 hover:bg-gray-700/50 hover:text-white"
            }`}
          >
            Danh Sách Gói (Bản Đồ Ngân Hà 🛰️)
          </button>
          <button
            onClick={() => setActiveTab("create")}
            className={`px-6 py-2 rounded-full text-lg font-semibold transition duration-300 ${
              activeTab === "create"
                ? "bg-purple-600 shadow-lg shadow-purple-500/50 text-white transform scale-105"
                : "text-gray-300 hover:bg-gray-700/50 hover:text-white"
            }`}
          >
            Tạo Gói Mới (Khởi Động Tàu 🚀)
          </button>
        </div>
        {/* --- Hiển thị Nội dung Tab --- */}
        <section className="mt-0">
          {activeTab === "create" && (
            <div className="p-4 rounded-xl">
              {/* COMPONENT TẠO GÓI ĐƯỢC IMPORT VÀ SỬ DỤNG */}
              <CreateProPackage />
            </div>
          )}
          {activeTab === "list" && (
            <div className="p-8 bg-gray-800/90 rounded-2xl shadow-2xl border border-cyan-500/50 text-center min-h-[400px]">
              <h3 className="text-4xl font-bold text-cyan-400 mb-4">
                🛰️ Bản Đồ Ngân Hà (Danh Sách Gói)
              </h3>
              <ProPackageList />
              {/* Nơi thêm component hiển thị danh sách gói sau này */}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ProducerPackagePage;
