import React, { useState } from "react";
import {
  FiChevronRight,
  FiChevronLeft,
  FiUser,
  FiBriefcase,
  FiUploadCloud,
} from "react-icons/fi";
import { Link } from "react-router-dom";

interface User {
  name: string;
  avatarUrl: string;
}

interface ProjectData {
  currentUser: User;
  projectName: string;
  projectImage: File | null;
  projectImagePreview: string;
  projectType: string;
  projectScope: "personal" | "client" | null;
}

const initialData: ProjectData = {
  currentUser: {
    name: "Alex Thorne",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
  },
  projectName: "",
  projectImage: null,
  projectImagePreview: "",
  projectType: "Single",
  projectScope: null,
};

function CreateProjectPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [projectData, setProjectData] = useState<ProjectData>(initialData);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setProjectData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProjectData((p) => ({
        ...p,
        projectImage: file,
        projectImagePreview: URL.createObjectURL(file),
      }));
    }
  };

  const handleScopeSelectAndSubmit = (scope: "personal" | "client") => {
    const finalData = { ...projectData, projectScope: scope };
    console.log("Final Project Data:", finalData);
    alert(
      `Dự án đã được tạo! Chuyển hướng đến trang chi tiết ${
        scope === "personal" ? "Dự án Cá nhân" : "Dự án Hợp tác"
      }...`
    );
  };

  const nextStep = () => setCurrentStep(2);
  const prevStep = () => setCurrentStep(1);

  const renderStepIndicator = () => {
    const steps = ["Thông tin", "Hoàn tất"];
    return (
      <div className="flex items-center justify-center space-x-4 mb-12 mt-16">
        {steps.map((label, index) => (
          <React.Fragment key={label}>
            <div className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-all ${
                  currentStep > index + 1
                    ? "bg-green-500 text-white"
                    : currentStep === index + 1
                    ? "bg-accent text-white"
                    : "bg-dark-surface border-2 border-border-color text-text-secondary"
                }`}
              >
                {index + 1}
              </div>
              <p
                className={`ml-3 font-medium ${
                  currentStep === index + 1
                    ? "text-white"
                    : "text-text-secondary"
                }`}
              >
                {label}
              </p>
            </div>
            {index < steps.length - 1 && (
              <div className="h-0.5 w-16 bg-border-color" />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8 max-w-3xl mx-auto w-full">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-dark-bg dark:text-white mb-2">
                Thông tin Cơ bản của Dự án
              </h2>
            </div>
            <div className="bg-dark-bg p-4 rounded-lg flex items-center">
              <img
                src={projectData.currentUser.avatarUrl}
                alt="Producer"
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="ml-4">
                <p className="font-bold text-text-primary">
                  {projectData.currentUser.name}
                </p>
                <p className="text-sm text-text-secondary">
                  Producer (Người tạo dự án)
                </p>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-text-secondary block mb-2">
                  Ảnh đại diện Dự án
                </label>
                <div className="mt-2 flex justify-center rounded-lg border border-dashed border-border-color px-6 py-10 bg-dark-bg">
                  <div className="text-center">
                    {projectData.projectImagePreview ? (
                      <img
                        src={projectData.projectImagePreview}
                        alt="Project preview"
                        className="mx-auto h-24 w-24 object-cover rounded-lg"
                      />
                    ) : (
                      <FiUploadCloud className="mx-auto h-12 w-12 text-text-secondary" />
                    )}
                    <div className="mt-4 flex text-sm justify-center">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer rounded-md font-semibold text-accent"
                      >
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          onChange={handleFileChange}
                          accept="image/*"
                        />
                        <span>Tải ảnh lên</span>
                      </label>
                      <p className="pl-1">hoặc kéo thả</p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-text-secondary block mb-2">
                  Tên dự án
                </label>
                <input
                  type="text"
                  name="projectName"
                  value={projectData.projectName}
                  onChange={handleInputChange}
                  className="w-full bg-dark-bg border border-border-color text-text-primary rounded-lg p-3"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-text-secondary block mb-2">
                  Loại dự án
                </label>
                <select
                  name="projectType"
                  value={projectData.projectType}
                  onChange={handleInputChange}
                  className="w-full bg-dark-bg border border-border-color text-text-primary rounded-lg p-3"
                >
                  <option>Single</option>
                  <option>EP/Album</option>
                  <option>Sản xuất Beat</option>
                  <option>Remix</option>
                  <option>Cover</option>
                  <option>Nhạc phim</option>
                  <option>Podcast/Intro</option>
                </select>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Hoàn tất & Lưu trữ
            </h2>
            <p className="text-text-secondary mb-8">
              Chọn loại hình để lưu trữ và quản lý dự án này.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <button
                onClick={() => handleScopeSelectAndSubmit("personal")}
                className="bg-dark-surface p-8 rounded-2xl border-2 border-border-color hover:border-accent hover:bg-accent/10 transition-all text-left"
              >
                <FiUser size={32} className="text-accent mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">
                  Lưu thành Dự án Cá nhân
                </h3>
                <p className="text-text-secondary">
                  Dự án sẽ được quản lý trong không gian cá nhân của bạn.
                </p>
              </button>
              <Link to={"/projectDetail"}>
                <button
                  className="bg-dark-surface p-8 rounded-2xl border-2 border-border-color hover:border-accent hover:bg-accent/10 transition-all text-left"
                >
                  <FiBriefcase size={32} className="text-accent mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">
                    Lưu thành Dự án Hợp tác
                  </h3>
                  <p className="text-text-secondary">
                    Dự án sẽ có đầy đủ tính năng hợp đồng, cột mốc, ví tiền...
                  </p>
                </button>
              </Link>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white text-gray-900 dark:bg-dark-bg dark:text-text-primary min-h-screen font-inter p-8">
      <div className="max-w-7xl mx-auto">
        {renderStepIndicator()}
        <div className="bg-white dark:bg-dark-surface p-8 rounded-2xl border border-gray-200 dark:border-border-color mt-8 min-h-[500px] flex items-center justify-center">
          <div className="w-full">{renderStepContent()}</div>
        </div>
        <div className="flex justify-between mt-8">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="bg-gray-200 text-gray-900 dark:bg-border-color dark:text-text-primary font-bold py-3 px-6 rounded-lg flex items-center disabled:opacity-50"
          >
            <FiChevronLeft />
            <span>Quay lại</span>
          </button>
          {currentStep === 1 && (
            <button
              onClick={nextStep}
              className="bg-accent text-white font-bold py-3 px-6 rounded-lg flex items-center"
            >
              <span>Tiếp tục</span>
              <FiChevronRight />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default CreateProjectPage;
