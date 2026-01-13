import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Send,
  Upload,
  FileText,
  X,
  ClipboardList,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import { TicketPostService, TicketRequest } from "@/services/ticketsService";
import projectService, { Project } from "@/services/projectService";
import AnimatedBackground from "@/component/background/AnimatedBackground";
import BackToProjectButton from "@/component/buttons/BackToProjectButton";
import { useCosmicToast } from "@/component/toast/CosmicToastProvider";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILES = 5;

// Component chính
const TicketsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isProjectLoading, setIsProjectLoading] = useState(true);
  const [projectError, setProjectError] = useState<string | null>(null);

  const [formData, setFormData] = useState<
    Omit<TicketRequest, "attachmentUrls">
  >({
    title: "",
    content: "",
    projectId: 0, // Giá trị mặc định là 0, sẽ được cập nhật sau khi tải dự án
  });
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { showToast } = useCosmicToast();

  // ===================================================
  // LOGIC TẢI DỮ LIỆU DỰ ÁN (PROJECT DATA FETCHING)
  // ===================================================
  const fetchProjects = useCallback(async () => {
    setIsProjectLoading(true);
    setProjectError(null);
    try {
      // Lấy 20 dự án đầu tiên
      const projectsPage = await projectService.getMyProjects({
        page: 0,
        size: 20,
      });
      const fetchedProjects = projectsPage.content;

      setProjects(fetchedProjects);

      // Nếu có dự án, đặt ID của dự án đầu tiên làm mặc định
      if (fetchedProjects.length > 0) {
        setFormData((prev) => ({
          ...prev,
          projectId: fetchedProjects[0].id,
        }));
      }
    } catch (err: any) {
      console.error("Lỗi khi tải danh sách dự án:", err);
      setProjectError(`Không thể tải danh sách dự án: ${err.message}`);
    } finally {
      setIsProjectLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // ===================================================
  // LOGIC FORM VÀ API SUBMISSION
  // ===================================================

  // Xử lý thay đổi input cơ bản
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "projectId" ? parseInt(value) : value,
    }));
    setError(null);
  };

  // Xử lý chọn file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const validFiles: File[] = [];

      newFiles.forEach((file) => {
        if (file.size > MAX_FILE_SIZE) {
          setError(`Lỗi: File "${file.name}" vượt quá giới hạn 5MB.`);
          return;
        }
        if (files.length + validFiles.length < MAX_FILES) {
          validFiles.push(file);
        } else {
          setError(`Lỗi: Chỉ được đính kèm tối đa ${MAX_FILES} file.`);
        }
      });

      if (validFiles.length > 0) {
        setFiles((prev) => [...prev, ...validFiles]);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Xử lý xóa file
  const handleRemoveFile = (fileName: string) => {
    setFiles((prev) => prev.filter((file) => file.name !== fileName));
    setError(null);
  };

  // Xử lý gửi form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.title ||
      !formData.content ||
      !formData.projectId ||
      formData.projectId <= 0
    ) {
      showToast("Vui lòng nhập đầy đủ Tiêu đề, Nội dung và chọn Dự án.", "error");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await TicketPostService.createTicket(formData, files);

      showToast("🚀 Báo cáo đã được gửi thành công!", "success");

      // Redirect về trang danh sách tickets sau 1.5s
      setTimeout(() => {
        navigate("/myTickets");
      }, 1500);
    } catch (err) {
      console.error("Lỗi gửi ticket:", err);
      showToast("Lỗi hệ thống: Không thể gửi ticket. Vui lòng thử lại.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // ===================================================
  // PHẦN RENDER GIAO DIỆN
  // ===================================================

  const inputClasses =
    "w-full bg-[#1A0D33] px-4 py-2.5 rounded-lg border border-purple-700/50 text-white transition text-sm disabled:opacity-50 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/50";
  const labelClasses =
    "block text-xs text-blue-400/90 mb-1.5 font-semibold uppercase tracking-widest";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto my-8 sm:my-16 mt-16 sm:mt-[75px] px-4 sm:px-8 py-6 sm:py-8 rounded-xl bg-[#0F081C]/90 shadow-2xl shadow-purple-900/50 border border-purple-600/50"
    >
      <AnimatedBackground />
      <div className="hidden sm:block absolute left-12 top-24">
        <BackToProjectButton />
      </div>
      {/* TIÊU ĐỀ MODULE */}
      <h2 className="text-xl sm:text-3xl font-extrabold mb-6 sm:mb-8 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-400 drop-shadow-[0_0_10px_rgba(56,189,248,0.5)] text-center sm:text-left">
        <Send className="inline w-5 h-5 sm:w-7 sm:h-7 mr-2 sm:mr-3" />
        TRẠM BÁO CÁO VŨ TRỤ
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. PROJECT ID (CHỌN DỰ ÁN) */}
        <div>
          <label htmlFor="projectId" className={labelClasses}>
            Mã Phi Thuyền / Trạm (Project ID)
          </label>
          <div className="relative">
            {isProjectLoading ? (
              <div
                className={`${inputClasses} flex items-center justify-center`}
              >
                <Loader2 className="w-4 h-4 mr-2 animate-spin text-purple-400" />
                Đang tải danh sách dự án...
              </div>
            ) : projectError ? (
              <div
                className={`${inputClasses} border-red-500 text-red-400 flex items-center`}
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                {projectError}
              </div>
            ) : projects.length === 0 ? (
              <div
                className={`${inputClasses} border-yellow-500 text-yellow-400 flex items-center`}
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Bạn chưa có dự án nào. Vui lòng tạo dự án trước.
              </div>
            ) : (
              <>
                <ClipboardList className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-400 pointer-events-none" />
                <select
                  id="projectId"
                  name="projectId"
                  value={formData.projectId}
                  onChange={handleInputChange}
                  className={`${inputClasses} appearance-none pl-10`}
                  disabled={isLoading}
                >
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.title} - {project.myRole}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
                  ▼
                </div>
              </>
            )}
          </div>
        </div>

        {/* 2. TITLE (TIÊU ĐỀ) */}
        <div>
          <label htmlFor="title" className={labelClasses}>
            Tóm tắt sự cố / Yêu cầu
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Ví dụ: Lỗi hệ thống định vị..."
            className={inputClasses}
            disabled={isLoading || isProjectLoading || projects.length === 0}
          />
        </div>

        {/* 3. CONTENT (NỘI DUNG) */}
        <div>
          <label htmlFor="content" className={labelClasses}>
            Chi tiết sự cố / Nội dung báo cáo
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            rows={5}
            placeholder="Mô tả chi tiết và các bước để tái hiện..."
            className={`${inputClasses} resize-none`}
            disabled={isLoading || isProjectLoading || projects.length === 0}
          />
        </div>

        {/* 4. FILE UPLOAD (ĐÍNH KÈM DATA LOGS) */}
        <div>
          <label className={labelClasses}>
            Đính kèm File Log / Ảnh (Tối đa {MAX_FILES} files, 5MB/file)
          </label>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
            accept="image/*, application/pdf, .zip, .log"
            className="hidden"
            disabled={
              isLoading ||
              files.length >= MAX_FILES ||
              isProjectLoading ||
              projects.length === 0
            }
          />

          <motion.button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            whileHover={{ scale: 1.01 }}
            className={`w-full py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 text-sm font-semibold 
                            border border-blue-600 text-blue-300 hover:bg-blue-500/10 
                            shadow-md shadow-blue-900/30 ${isLoading ||
                files.length >= MAX_FILES ||
                isProjectLoading ||
                projects.length === 0
                ? "opacity-50 cursor-not-allowed"
                : ""
              }`}
            disabled={
              isLoading ||
              files.length >= MAX_FILES ||
              isProjectLoading ||
              projects.length === 0
            }
          >
            <Upload className="w-4 h-4" />
            Tải Data Logs / Ảnh
          </motion.button>

          {/* Danh sách File đính kèm với preview ảnh */}
          {files.length > 0 && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-60 overflow-y-auto p-2 border border-purple-800/50 rounded-lg">
              {files.map((file, index) => {
                const isImage = file.type.startsWith('image/');
                const previewUrl = isImage ? URL.createObjectURL(file) : null;

                return (
                  <motion.div
                    key={file.name + index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative group rounded-lg overflow-hidden border border-purple-700/50 bg-[#2A1D42]"
                  >
                    {isImage && previewUrl ? (
                      <img
                        src={previewUrl}
                        alt={file.name}
                        className="w-full h-24 object-cover"
                        onLoad={() => URL.revokeObjectURL(previewUrl)}
                      />
                    ) : (
                      <div className="w-full h-24 flex items-center justify-center bg-[#1A0D33]">
                        <FileText className="w-10 h-10 text-purple-400" />
                      </div>
                    )}

                    {/* Overlay với tên file */}
                    <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-black/70 text-xs text-gray-300">
                      <div className="truncate">{file.name}</div>
                      <div className="text-gray-500 text-[10px]">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>

                    {/* Nút xóa */}
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(file.name)}
                      className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-red-600 rounded-full text-white transition"
                      disabled={isLoading}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* THÔNG BÁO LỖI / THÀNH CÔNG */}
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-3 text-sm font-medium text-red-300 bg-red-900/30 border border-red-700/50 rounded-lg shadow-inner"
          >
            {error}
          </motion.p>
        )}

        {/* NÚT SUBMIT */}
        <button
          type="submit"
          disabled={isLoading || isProjectLoading || projects.length === 0}
          className="w-full px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 
                               hover:from-cyan-400 hover:to-blue-500 transition-all 
                               text-base font-extrabold text-white 
                               shadow-[0_0_15px_rgba(56,189,248,0.5)] 
                               hover:shadow-[0_0_20px_rgba(56,189,248,0.7)] uppercase tracking-wider
                               disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 inline mr-2 animate-spin" />
              Đang truyền dữ liệu...
            </>
          ) : (
            "GỬI BÁO CÁO"
          )}
        </button>
      </form>
    </motion.div>
  );
};

export default TicketsPage;
