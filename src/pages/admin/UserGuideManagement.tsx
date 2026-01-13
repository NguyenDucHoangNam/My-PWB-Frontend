import React, { useState, useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import {
    userGuideService,
    GuideCategory,
    GuideDifficulty,
    UserGuideIndexRequest,
    UserGuideSummaryResponse,
} from "../../services/userGuideService";
import { useCosmicToast } from "../../component/toast/CosmicToastProvider";
import {
    Loader2,
    Plus,
    Trash2,
    Save,
    Image as ImageIcon,
    X,
    Edit2,
    Search,
    AlertTriangle,
    Eye,
    Clock,
    User,
    Tag,
    Layers,
    FileText,
    Calendar,
    ArrowLeft,
    HelpCircle, // ⭐ For FAQ section
} from "lucide-react";

// --- Components ---
const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
        {children}
    </h3>
);

const InputLabel = ({
    label,
    required,
}: {
    label: string;
    required?: boolean;
}) => (
    <label className="block text-sm font-medium text-gray-300 mb-1.5">
        {label} {required && <span className="text-rose-500">*</span>}
    </label>
);

const ErrorMessage = ({ message }: { message?: string }) => {
    if (!message) return null;
    return (
        <p className="text-rose-400 text-xs mt-1 flex items-center gap-1">
            <span className="inline-block w-1 h-1 rounded-full bg-rose-400" />
            {message}
        </p>
    );
};

// ⭐ NEW: Pasteable Image Input Component
const PasteableImageInput = ({
    onImageChange,
    currentImage,
    label,
    id,
    showToast,
}: {
    onImageChange: (file: File) => void;
    currentImage?: File | null;
    label: string;
    id: string;
    showToast: (msg: string, type: 'success' | 'error') => void;
}) => {
    const [preview, setPreview] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (currentImage) {
            const url = URL.createObjectURL(currentImage);
            setPreview(url);
            return () => URL.revokeObjectURL(url);
        } else {
            setPreview(null);
        }
    }, [currentImage]);

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const items = e.clipboardData?.items;

        if (items) {
            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image') !== -1) {
                    const file = items[i].getAsFile();
                    if (file) {
                        onImageChange(file);
                        showToast('✅ Đã paste ảnh thành công!', 'success');
                        break;
                    }
                }
            }
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onImageChange(e.target.files[0]);
        }
    };

    const handleClear = () => {
        setPreview(null);
        onImageChange(null as any); // Clear the image
    };

    return (
        <div
            tabIndex={0}
            onPaste={handlePaste}
            className="relative border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:border-accent transition-all focus:ring-2 focus:ring-accent focus:border-accent cursor-pointer"
        >
            <input
                type="file"
                accept="image/*"
                id={id}
                className="hidden"
                onChange={handleFileChange}
            />

            {preview ? (
                <div className="space-y-3">
                    <img
                        src={preview}
                        alt="Preview"
                        className="max-h-40 mx-auto rounded-lg border border-white/10"
                    />
                    <div className="flex gap-2 justify-center">
                        <label
                            htmlFor={id}
                            className="px-3 py-1.5 bg-accent/20 hover:bg-accent/30 rounded-lg text-sm text-accent transition-colors cursor-pointer"
                        >
                            Đổi ảnh
                        </label>
                        <button
                            type="button"
                            onClick={handleClear}
                            className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 rounded-lg text-sm text-rose-400 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    <p className="text-xs text-gray-500">
                        Hoặc paste ảnh mới: <kbd className="px-2 py-0.5 bg-white/10 rounded text-accent">Ctrl+V</kbd>
                    </p>
                </div>
            ) : (
                <label htmlFor={id} className="cursor-pointer block">
                    <div className="space-y-3">
                        <ImageIcon className="w-12 h-12 mx-auto text-gray-500" />
                        <p className="text-sm font-medium text-gray-300">{label}</p>
                        <p className="text-xs text-gray-500">
                            Click để chọn file hoặc <kbd className="px-2 py-0.5 bg-white/10 rounded text-accent font-mono">Ctrl+V</kbd> để paste
                        </p>
                    </div>
                </label>
            )}
        </div>
    );
};

// --- Confirmation Modal ---
const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    isLoading,
}: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    isLoading: boolean;
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <div className="relative w-full max-w-[400px] bg-[#121212] border border-white/5 rounded-3xl shadow-2xl overflow-hidden">
                <div className="p-8 flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-[#3f161e] flex items-center justify-center mb-5">
                        <AlertTriangle className="w-8 h-8 text-[#e11d48]" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
                    <p className="text-gray-400 mb-8 text-base leading-relaxed">{message}</p>

                    <div className="flex gap-4 w-full">
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="flex-1 px-4 py-3 rounded-xl bg-[#262626] hover:bg-[#333] text-white font-medium transition-colors"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isLoading}
                            className="flex-1 px-4 py-3 rounded-xl bg-[#e11d48] hover:bg-[#be123c] text-white font-bold transition-colors flex items-center justify-center gap-2"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                            Xóa ngay
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function UserGuideManagement() {
    const { showToast } = useCosmicToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [guides, setGuides] = useState<UserGuideSummaryResponse[]>([]);
    const [viewMode, setViewMode] = useState<"list" | "form" | "detail">("list");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [selectedGuide, setSelectedGuide] = useState<any | null>(null);

    // Modal State
    const [deleteModal, setDeleteModal] = useState<{
        isOpen: boolean;
        guideId: string | null;
        guideTitle: string;
    }>({
        isOpen: false,
        guideId: null,
        guideTitle: "",
    });

    // Form setup
    const {
        control,
        handleSubmit,
        register,
        reset,
        watch,
        formState: { errors },
    } = useForm<UserGuideIndexRequest>({
        defaultValues: {
            title: "",
            shortDescription: "",
            category: GuideCategory.GETTING_STARTED,
            difficulty: GuideDifficulty.BEGINNER,
            contentText: "",
            prerequisites: [],
            tags: [],
            keywords: [],
            searchableQueries: [], // ⭐ NEW
            steps: [
                {
                    stepOrder: 1,
                    title: "",
                    description: "",
                    expectedResult: "",
                },
            ],
            author: "Admin",
            version: "1.0",
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "steps",
    });

    // Image states
    const [coverImage, setCoverImage] = useState<File | null>(null);
    const [stepImages, setStepImages] = useState<(File | null)[]>([]);

    // Fetch guides on mount
    useEffect(() => {
        fetchGuides();
    }, []);

    const fetchGuides = async () => {
        setIsFetching(true);
        try {
            const response = await userGuideService.getAllGuides();
            if (response.data && response.data.result) {
                const resData = response.data.result;
                setGuides(resData || []);
            }
        } catch (error) {
            console.error("Failed to fetch guides", error);
            showToast("Không thể tải danh sách hướng dẫn", "error");
        } finally {
            setIsFetching(false);
        }
    };

    // --- Handlers ---

    // const _handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     if (e.target.files && e.target.files[0]) {
    //         setCoverImage(e.target.files[0]);
    //     }
    // };

    const handleStepImageChange = (
        index: number,
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        if (e.target.files && e.target.files[0]) {
            const newStepImages = [...stepImages];
            newStepImages[index] = e.target.files[0];
            setStepImages(newStepImages);
        }
    };

    const handleAddTag = (
        e: React.KeyboardEvent,
        field: any,
        value: string,
        setValueLocal: (val: string) => void
    ) => {
        if (e.key === "Enter" && value.trim()) {
            e.preventDefault();
            const current = field.value || [];
            if (!current.includes(value.trim())) {
                field.onChange([...current, value.trim()]);
            }
            setValueLocal("");
        }
    };

    const removeArrayItem = (index: number, field: any) => {
        const newArray = [...(field.value || [])];
        newArray.splice(index, 1);
        field.onChange(newArray);
    };

    const switchToDetail = async (guide: UserGuideSummaryResponse) => {
        setIsLoading(true);
        try {
            const fullGuideResponse = await userGuideService.getGuideById(guide.id);
            const fullGuide = fullGuideResponse.data.result;
            if (!fullGuide) throw new Error("Could not fetch guide details");

            setSelectedGuide(fullGuide);
            setViewMode("detail");
        } catch (error) {
            console.error("Failed to fetch guide details", error);
            showToast("Không thể tải chi tiết hướng dẫn", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const switchToForm = async (guide?: UserGuideSummaryResponse) => {
        if (guide) {
            setIsLoading(true);
            try {
                const fullGuideResponse = await userGuideService.getGuideById(guide.id);
                const fullGuide = fullGuideResponse.data.result;

                if (!fullGuide) throw new Error("Could not fetch guide details");

                setEditingId(fullGuide.id);

                // Map screenshotUrl to imageUrl for steps
                const formattedSteps = fullGuide.steps?.map((step: any) => ({
                    ...step,
                    imageUrl: step.screenshotUrl || step.imageUrl
                })) || [];

                // Populate form
                reset({
                    title: fullGuide.title,
                    shortDescription: fullGuide.shortDescription,
                    category: fullGuide.category,
                    difficulty: fullGuide.difficulty,
                    contentText: fullGuide.contentText || "",
                    prerequisites: fullGuide.prerequisites || [],
                    tags: fullGuide.tags || [],
                    keywords: fullGuide.keywords || [],
                    searchableQueries: fullGuide.searchableQueries || [], // ⭐ NEW
                    steps: formattedSteps,
                    author: fullGuide.author || "Admin",
                    version: fullGuide.version || "1.0",
                });
                setCoverImage(null);
                setStepImages(new Array(formattedSteps.length).fill(null));
                setViewMode("form");
            } catch (error) {
                console.error("Failed to fetch guide details", error);
                showToast("Không thể tải chi tiết hướng dẫn", "error");
            } finally {
                setIsLoading(false);
            }
        } else {
            setEditingId(null);
            reset({
                title: "",
                shortDescription: "",
                category: GuideCategory.GETTING_STARTED,
                difficulty: GuideDifficulty.BEGINNER,
                contentText: "",
                prerequisites: [],
                tags: [],
                keywords: [],
                searchableQueries: [], // ⭐ NEW
                steps: [
                    {
                        stepOrder: 1,
                        title: "",
                        description: "",
                        expectedResult: "",
                    },
                ],
                author: "Admin",
                version: "1.0",
            });
            setCoverImage(null);
            setStepImages([]);
            setViewMode("form");
        }
    };

    const handleDeleteClick = (guide: UserGuideSummaryResponse, e: React.MouseEvent) => {
        e.stopPropagation();
        setDeleteModal({
            isOpen: true,
            guideId: guide.id,
            guideTitle: guide.title,
        });
    };

    const confirmDelete = async () => {
        if (!deleteModal.guideId) return;

        setIsLoading(true);
        try {
            await userGuideService.deleteGuide(deleteModal.guideId);
            showToast("Xóa hướng dẫn thành công", "success");
            setDeleteModal(prev => ({ ...prev, isOpen: false }));
            fetchGuides();
        } catch (error: any) {
            const msg = error.response?.data?.message || error.message || "Lỗi khi xóa";
            showToast(msg, "error");
        } finally {
            setIsLoading(false);
        }
    };

    const onSubmit = async (data: UserGuideIndexRequest) => {
        setIsLoading(true);
        try {
            // Ensure step images array matches steps length
            const finalStepImages = stepImages.slice(0, data.steps.length);
            // Pad with null if needed
            while (finalStepImages.length < data.steps.length) {
                finalStepImages.push(null);
            }

            if (editingId) {
                await userGuideService.updateGuide(editingId, data, coverImage || undefined, finalStepImages);
                showToast("Cập nhật hướng dẫn thành công!", "success");
            } else {
                await userGuideService.indexGuide(data, coverImage || undefined, finalStepImages);
                showToast("Tạo hướng dẫn mới thành công!", "success");
            }

            fetchGuides();
            setViewMode("list");
        } catch (error: any) {
            console.error("Submit error:", error);
            const msg = error.response?.data?.message || error.message || "Có lỗi xảy ra";
            showToast(msg, "error");
        } finally {
            setIsLoading(false);
        }
    };

    // --- Render ---

    if (viewMode === "list") {
        return (
            <div className="p-6 max-w-7xl mx-auto font-inter text-gray-100">
                {/* Modal */}
                <ConfirmationModal
                    isOpen={deleteModal.isOpen}
                    onClose={() => setDeleteModal(prev => ({ ...prev, isOpen: false }))}
                    onConfirm={confirmDelete}
                    title="Xóa hướng dẫn?"
                    message={`Bạn có chắc chắn muốn xóa "${deleteModal.guideTitle}"? Hành động này không thể hoàn tác.`}
                    isLoading={isLoading}
                />

                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            Quản lý Hướng dẫn sử dụng
                        </h1>
                        <p className="text-gray-400 mt-2">
                            Danh sách các bài hướng dẫn hiện có trên hệ thống
                        </p>
                    </div>
                    <button
                        onClick={() => switchToForm()}
                        className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent/90 rounded-lg transition-colors font-medium text-white shadow-lg shadow-accent/20"
                    >
                        <Plus className="w-5 h-5" />
                        Tạo hướng dẫn mới
                    </button>
                </div>

                {isFetching ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-10 h-10 animate-spin text-accent" />
                    </div>
                ) : guides.length === 0 ? (
                    <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
                        <Search className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-white">Chưa có hướng dẫn nào</h3>
                        <p className="text-gray-400 mt-2">Hãy tạo hướng dẫn đầu tiên để giúp người dùng.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {guides.map((guide) => (
                            <div
                                key={guide.id}
                                className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-accent/50 transition-colors group flex flex-col"
                            >
                                <div className="aspect-video w-full bg-black/40 relative overflow-hidden">
                                    {guide.coverImageUrl ? (
                                        <img
                                            src={guide.coverImageUrl || ""}
                                            alt={guide.title}
                                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-600">
                                            <ImageIcon className="w-12 h-12" />
                                        </div>
                                    )}
                                    <div className="absolute top-2 right-2">
                                        <span className={`px-2 py-1 rounded text-xs font-bold backdrop-blur-md ${guide.difficulty === GuideDifficulty.BEGINNER ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                            guide.difficulty === GuideDifficulty.INTERMEDIATE ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                                                'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                            }`}>
                                            {guide.difficulty}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="mb-2 text-xs text-gray-500 flex justify-between">
                                        <span>{guide.category.replace(/_/g, " ")}</span>
                                        <span>{new Date(guide.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-1" title={guide.title}>
                                        {guide.title}
                                    </h3>
                                    <p className="text-sm text-gray-400 line-clamp-2 mb-4 flex-1">
                                        {guide.shortDescription || "Không có mô tả ngắn"}
                                    </p>

                                    <div className="flex items-center gap-3 mt-auto pt-4 border-t border-white/10">
                                        <button
                                            onClick={() => switchToDetail(guide)}
                                            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-sm font-medium transition-colors"
                                        >
                                            <Eye className="w-4 h-4" /> Xem
                                        </button>
                                        <button
                                            onClick={() => switchToForm(guide)}
                                            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm font-medium transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4" /> Sửa
                                        </button>
                                        <button
                                            onClick={(e) => handleDeleteClick(guide, e)}
                                            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-sm font-medium transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" /> Xóa
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    if (viewMode === "detail" && selectedGuide) {
        return (
            <div className="p-6 max-w-6xl mx-auto font-inter text-gray-100">
                <div className="mb-6">
                    <button
                        onClick={() => setViewMode("list")}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
                    >
                        <ArrowLeft className="w-5 h-5" /> Quay lại danh sách
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Hero Section */}
                        <div className="relative rounded-2xl overflow-hidden aspect-video bg-black/40 border border-white/10">
                            {selectedGuide.coverImageUrl ? (
                                <img
                                    src={selectedGuide.coverImageUrl}
                                    alt={selectedGuide.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-600">
                                    <ImageIcon className="w-16 h-16" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-8">
                                <div className="flex gap-3 mb-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md ${selectedGuide.difficulty === GuideDifficulty.BEGINNER ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                        selectedGuide.difficulty === GuideDifficulty.INTERMEDIATE ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                                            'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                        }`}>
                                        {selectedGuide.difficulty}
                                    </span>
                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 backdrop-blur-md">
                                        {selectedGuide.category}
                                    </span>
                                </div>
                                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{selectedGuide.title}</h1>
                                <p className="text-gray-300 text-lg line-clamp-2">{selectedGuide.shortDescription}</p>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
                            <SectionTitle>Nội dung chi tiết</SectionTitle>
                            <div className="prose prose-invert max-w-none text-gray-300 whitespace-pre-wrap">
                                {selectedGuide.contentText}
                            </div>
                        </div>

                        {/* Steps */}
                        <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
                            <SectionTitle>Các bước thực hiện</SectionTitle>
                            <div className="space-y-8">
                                {selectedGuide.steps?.map((step: any, index: number) => (
                                    <div key={index} className="relative pl-8 border-l-2 border-white/10 pb-8 last:pb-0 last:border-0">
                                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-accent border-4 border-[#121212]" />
                                        <h4 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                                            <span className="text-accent">Bước {step.stepOrder}:</span> {step.title}
                                        </h4>
                                        <p className="text-gray-400 mb-4">{step.description}</p>
                                        {step.expectedResult && (
                                            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 mb-4">
                                                <p className="text-sm text-green-400">
                                                    <strong>Kết quả mong đợi:</strong> {step.expectedResult}
                                                </p>
                                            </div>
                                        )}
                                        {(step.screenshotUrl || step.imageUrl) && (
                                            <div className="rounded-xl overflow-hidden border border-white/10 mt-4">
                                                <img
                                                    src={step.screenshotUrl || step.imageUrl}
                                                    alt={`Step ${step.stepOrder}`}
                                                    className="w-full h-auto"
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Metadata */}
                    <div className="space-y-6">
                        <div className="bg-white/5 rounded-2xl p-6 border border-white/10 sticky top-6">
                            <h3 className="text-lg font-bold text-white mb-4">Thông tin thêm</h3>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-gray-400">
                                    <User className="w-5 h-5 text-accent" />
                                    <div>
                                        <p className="text-xs text-gray-500">Tác giả</p>
                                        <p className="text-sm text-white">{selectedGuide.author || "Admin"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-gray-400">
                                    <Layers className="w-5 h-5 text-accent" />
                                    <div>
                                        <p className="text-xs text-gray-500">Phiên bản</p>
                                        <p className="text-sm text-white">{selectedGuide.version || "1.0"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-gray-400">
                                    <Calendar className="w-5 h-5 text-accent" />
                                    <div>
                                        <p className="text-xs text-gray-500">Ngày tạo</p>
                                        <p className="text-sm text-white">{new Date(selectedGuide.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-gray-400">
                                    <Clock className="w-5 h-5 text-accent" />
                                    <div>
                                        <p className="text-xs text-gray-500">Cập nhật lần cuối</p>
                                        <p className="text-sm text-white">{new Date(selectedGuide.updatedAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-white/10">
                                <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                                    <Tag className="w-4 h-4 text-accent" /> Tags
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {selectedGuide.tags?.map((tag: string, idx: number) => (
                                        <span key={idx} className="px-2 py-1 rounded bg-white/10 text-xs text-gray-300">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-white/10">
                                <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-accent" /> Keywords
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {selectedGuide.keywords?.map((kw: string, idx: number) => (
                                        <span key={idx} className="px-2 py-1 rounded bg-white/10 text-xs text-gray-300">
                                            {kw}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* ⭐ NEW: FAQ / Searchable Queries Section */}
                            {selectedGuide.searchableQueries && selectedGuide.searchableQueries.length > 0 && (
                                <div className="mt-6 pt-6 border-t border-white/10">
                                    <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                                        <HelpCircle className="w-4 h-4 text-accent" /> Câu hỏi thường gặp (FAQ)
                                    </h4>
                                    <div className="space-y-2">
                                        {selectedGuide.searchableQueries.map((query: string, idx: number) => (
                                            <div
                                                key={idx}
                                                className="px-3 py-2 rounded-lg bg-accent/10 border border-accent/20 text-xs text-gray-200 hover:bg-accent/15 transition-colors"
                                            >
                                                ❓ {query}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="mt-8">
                                <button
                                    onClick={() => switchToForm(selectedGuide)}
                                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-accent hover:bg-accent/90 text-white font-bold transition-colors shadow-lg shadow-accent/20"
                                >
                                    <Edit2 className="w-4 h-4" /> Chỉnh sửa
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Form View
    return (
        <div className="p-6 max-w-5xl mx-auto font-inter text-gray-100">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <button
                        onClick={() => setViewMode("list")}
                        className="text-sm text-gray-400 hover:text-white flex items-center gap-1 mb-2 transition-colors"
                    >
                        ← Quay lại danh sách
                    </button>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        {editingId ? "Chỉnh sửa Hướng dẫn" : "Tạo Hướng dẫn mới"}
                    </h1>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* 1. Basic Info */}
                <div className="bg-white/5 p-6 rounded-2xl border border-white/10 shadow-xl backdrop-blur-sm">
                    <SectionTitle>Thông tin cơ bản</SectionTitle>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <InputLabel label="Tiêu đề hướng dẫn" required />
                            <input
                                {...register("title", { required: "Tiêu đề là bắt buộc" })}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all placeholder:text-gray-600"
                                placeholder="Ví dụ: Cách tạo dự án mới..."
                            />
                            <ErrorMessage message={errors.title?.message} />
                        </div>

                        <div className="col-span-2">
                            <InputLabel label="Mô tả ngắn" required />
                            <textarea
                                {...register("shortDescription", {
                                    required: "Mô tả ngắn là bắt buộc",
                                })}
                                rows={3}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all placeholder:text-gray-600"
                                placeholder="Tóm tắt nội dung hướng dẫn..."
                            />
                            <ErrorMessage message={errors.shortDescription?.message} />
                        </div>

                        <div>
                            <InputLabel label="Danh mục" required />
                            <select
                                {...register("category")}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all appearance-none"
                            >
                                {Object.values(GuideCategory).map((cat) => (
                                    <option key={cat} value={cat} className="bg-gray-900">
                                        {cat}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <InputLabel label="Độ khó" required />
                            <select
                                {...register("difficulty")}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all appearance-none"
                            >
                                {Object.values(GuideDifficulty).map((diff) => (
                                    <option key={diff} value={diff} className="bg-gray-900">
                                        {diff}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="col-span-2">
                            <InputLabel label="Ảnh bìa (Cover Image)" />
                            <PasteableImageInput
                                id="cover-upload"
                                label="Ảnh bìa"
                                currentImage={coverImage}
                                onImageChange={(file) => setCoverImage(file)}
                                showToast={showToast}
                            />
                        </div>
                    </div>
                </div>

                {/* 2. Content & Metadata */}
                <div className="bg-white/5 p-6 rounded-2xl border border-white/10 shadow-xl backdrop-blur-sm">
                    <SectionTitle>Nội dung chi tiết & Metadata</SectionTitle>
                    <div className="space-y-6">
                        <div>
                            <InputLabel label="Nội dung chính (Markdown/Text)" required />
                            <textarea
                                {...register("contentText", {
                                    required: "Nội dung chính là bắt buộc",
                                })}
                                rows={6}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all placeholder:text-gray-600 font-mono text-sm"
                                placeholder="Nội dung chi tiết của bài hướng dẫn..."
                            />
                            <ErrorMessage message={errors.contentText?.message} />
                        </div>

                        {/* Dynamic Lists: Prerequisites, Tags, Keywords */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Prerequisites */}
                            <Controller
                                control={control}
                                name="prerequisites"
                                render={({ field }) => {
                                    const [inputVal, setInputVal] = useState("");
                                    return (
                                        <div>
                                            <InputLabel label="Yêu cầu tiên quyết" />
                                            <input
                                                value={inputVal}
                                                onChange={(e) => setInputVal(e.target.value)}
                                                onKeyDown={(e) =>
                                                    handleAddTag(e, field, inputVal, setInputVal)
                                                }
                                                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm mb-2 focus:border-accent focus:outline-none"
                                                placeholder="Nhập & Enter..."
                                            />
                                            <div className="flex flex-wrap gap-2">
                                                {(field.value || []).map((item, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-500/20 text-blue-300 text-xs"
                                                    >
                                                        {item}
                                                        <button
                                                            type="button"
                                                            onClick={() => removeArrayItem(idx, field)}
                                                            className="hover:text-white"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                }}
                            />

                            {/* Tags */}
                            <Controller
                                control={control}
                                name="tags"
                                render={({ field }) => {
                                    const [inputVal, setInputVal] = useState("");
                                    return (
                                        <div>
                                            <InputLabel label="Tags" />
                                            <input
                                                value={inputVal}
                                                onChange={(e) => setInputVal(e.target.value)}
                                                onKeyDown={(e) =>
                                                    handleAddTag(e, field, inputVal, setInputVal)
                                                }
                                                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm mb-2 focus:border-accent focus:outline-none"
                                                placeholder="Nhập & Enter..."
                                            />
                                            <div className="flex flex-wrap gap-2">
                                                {(field.value || []).map((item, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="inline-flex items-center gap-1 px-2 py-1 rounded bg-purple-500/20 text-purple-300 text-xs"
                                                    >
                                                        {item}
                                                        <button
                                                            type="button"
                                                            onClick={() => removeArrayItem(idx, field)}
                                                            className="hover:text-white"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                }}
                            />

                            {/* Keywords */}
                            <Controller
                                control={control}
                                name="keywords"
                                render={({ field }) => {
                                    const [inputVal, setInputVal] = useState("");
                                    return (
                                        <div>
                                            <InputLabel label="Keywords" />
                                            <input
                                                value={inputVal}
                                                onChange={(e) => setInputVal(e.target.value)}
                                                onKeyDown={(e) =>
                                                    handleAddTag(e, field, inputVal, setInputVal)
                                                }
                                                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm mb-2 focus:border-accent focus:outline-none"
                                                placeholder="Nhập & Enter..."
                                            />
                                            <div className="flex flex-wrap gap-2">
                                                {(field.value || []).map((item, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="inline-flex items-center gap-1 px-2 py-1 rounded bg-orange-500/20 text-orange-300 text-xs"
                                                    >
                                                        {item}
                                                        <button
                                                            type="button"
                                                            onClick={() => removeArrayItem(idx, field)}
                                                            className="hover:text-white"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                }}
                            />
                        </div>

                        {/* ⭐ NEW: Searchable Queries - MOST IMPORTANT for search! */}
                        <div className="col-span-3">
                            <Controller
                                control={control}
                                name="searchableQueries"
                                render={({ field }) => {
                                    const [inputVal, setInputVal] = useState("");
                                    return (
                                        <div className="bg-accent/5 border-2 border-accent/20 rounded-xl p-5">
                                            <div className="flex items-start gap-3 mb-3">
                                                <div className="flex-1">
                                                    <InputLabel label="⭐ Câu hỏi thường gặp (Searchable Queries)" />
                                                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                                                        <strong className="text-accent">QUAN TRỌNG:</strong> Nhập các câu hỏi mà users thường HỎI (ví dụ: "Làm sao để login?", "Tôi muốn vào hệ thống").
                                                        <br />Khuyến nghị: <strong>10-15 queries</strong> bao gồm tiếng Việt + English, natural language + problem-based.
                                                    </p>
                                                </div>
                                            </div>
                                            <input
                                                value={inputVal}
                                                onChange={(e) => setInputVal(e.target.value)}
                                                onKeyDown={(e) =>
                                                    handleAddTag(e, field, inputVal, setInputVal)
                                                }
                                                className="w-full bg-black/20 border border-accent/30 rounded-lg px-4 py-3 text-sm mb-3 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                                                placeholder='Ví dụ: "Làm sao để đăng nhập?", "How to login?", "Tôi muốn vào hệ thống"...'
                                            />
                                            <div className="flex flex-wrap gap-2">
                                                {(field.value || []).map((item, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent/30 text-white text-sm font-medium border border-accent/40"
                                                    >
                                                        {item}
                                                        <button
                                                            type="button"
                                                            onClick={() => removeArrayItem(idx, field)}
                                                            className="hover:text-rose-300 transition-colors"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                            {(field.value || []).length > 0 && (
                                                <p className="text-xs text-gray-500 mt-3">
                                                    ✅ Đã thêm {(field.value || []).length} câu hỏi. Mục tiêu: 10-15 queries.
                                                </p>
                                            )}
                                        </div>
                                    );
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* 3. Steps */}
                <div className="bg-white/5 p-6 rounded-2xl border border-white/10 shadow-xl backdrop-blur-sm">
                    <div className="flex justify-between items-center mb-6">
                        <SectionTitle>Các bước thực hiện</SectionTitle>
                        <button
                            type="button"
                            onClick={() =>
                                append({
                                    stepOrder: fields.length + 1,
                                    title: "",
                                    description: "",
                                    expectedResult: "",
                                })
                            }
                            className="flex items-center gap-2 px-3 py-1.5 bg-accent/20 hover:bg-accent/30 text-accent rounded-lg text-sm font-medium transition-colors"
                        >
                            <Plus className="w-4 h-4" /> Thêm bước
                        </button>
                    </div>

                    <div className="space-y-6">
                        {fields.map((field, index) => (
                                <div
                                    key={field.id}
                                    className="relative pl-6 border-l-2 border-white/10"
                                >
                                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-accent border-4 border-[#121212]" />

                                    <div className="bg-black/20 p-5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                                        <div className="flex justify-between items-start mb-4">
                                            <h4 className="font-bold text-white">Bước {index + 1}</h4>
                                            {fields.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => remove(index)}
                                                    className="text-gray-500 hover:text-rose-400 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="col-span-2">
                                                <InputLabel label="Tiêu đề bước" required />
                                                <input
                                                    {...register(`steps.${index}.title` as const, {
                                                        required: "Tiêu đề bước là bắt buộc",
                                                    })}
                                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
                                                    placeholder="Ví dụ: Mở terminal..."
                                                />
                                                <ErrorMessage
                                                    message={errors.steps?.[index]?.title?.message}
                                                />
                                            </div>

                                            <div className="col-span-2">
                                                <InputLabel label="Mô tả chi tiết" required />
                                                <textarea
                                                    {...register(`steps.${index}.description` as const, {
                                                        required: "Mô tả bước là bắt buộc",
                                                    })}
                                                    rows={2}
                                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
                                                    placeholder="Mô tả chi tiết hành động..."
                                                />
                                                <ErrorMessage
                                                    message={errors.steps?.[index]?.description?.message}
                                                />
                                            </div>

                                            <div className="col-span-2">
                                                <InputLabel label="Kết quả mong đợi" />
                                                <input
                                                    {...register(`steps.${index}.expectedResult` as const)}
                                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
                                                    placeholder="Ví dụ: Hiển thị thông báo thành công..."
                                                />
                                            </div>

                                            {/* NEW: Screen Location */}
                                            <div>
                                                <InputLabel label="Vị trí màn hình" />
                                                <input
                                                    {...register(`steps.${index}.screenLocation` as const)}
                                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
                                                    placeholder="Ví dụ: Dashboard - Top Right"
                                                />
                                            </div>

                                            {/* NEW: UI Element */}
                                            <div>
                                                <InputLabel label="Phần tử UI" />
                                                <input
                                                    {...register(`steps.${index}.uiElement` as const)}
                                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
                                                    placeholder="Ví dụ: Button 'Submit' (màu xanh)"
                                                />
                                            </div>

                                            {/* NEW: Tips */}
                                            <div className="col-span-2">
                                                <InputLabel label="💡 Mẹo hữu ích" />
                                                <input
                                                    {...register(`steps.${index}.tips` as const)}
                                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
                                                    placeholder="Ví dụ: Phím tắt Ctrl+S để lưu nhanh"
                                                />
                                            </div>

                                            {/* NEW: Common Mistakes */}
                                            <div className="col-span-2">
                                                <InputLabel label="⚠️ Lỗi thường gặp" />
                                                <input
                                                    {...register(`steps.${index}.commonMistakes` as const)}
                                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
                                                    placeholder="Ví dụ: Nhiều người nhầm nút X với nút Y"
                                                />
                                            </div>

                                            <div className="col-span-2">
                                                <InputLabel label="Hình ảnh minh họa" />
                                                <div className="flex items-center gap-4">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => handleStepImageChange(index, e)}
                                                        className="hidden"
                                                        id={`step-img-${index}`}
                                                    />
                                                    <label
                                                        htmlFor={`step-img-${index}`}
                                                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer transition-colors border border-white/10"
                                                    >
                                                        <ImageIcon className="w-4 h-4 text-gray-400" />
                                                        <span className="text-sm text-gray-300">
                                                            {stepImages[index]
                                                                ? stepImages[index]?.name
                                                                : "Chọn ảnh"}
                                                        </span>
                                                    </label>
                                                    {/* Show existing image if editing and no new image selected */}
                                                    {!stepImages[index] && watch(`steps.${index}.imageUrl`) && (
                                                        <div className="h-10 w-10 rounded overflow-hidden border border-white/10">
                                                            <img
                                                                src={watch(`steps.${index}.imageUrl`)}
                                                                alt="Step"
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-4 pt-4 border-t border-white/10">
                    <button
                        type="button"
                        onClick={() => setViewMode("list")}
                        className="px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-colors"
                    >
                        Hủy bỏ
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-6 py-2.5 rounded-xl bg-accent hover:bg-accent/90 text-white font-bold transition-colors flex items-center gap-2 shadow-lg shadow-accent/20"
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Save className="w-5 h-5" />
                        )}
                        {editingId ? "Lưu thay đổi" : "Tạo hướng dẫn"}
                    </button>
                </div>
            </form>
        </div>
    );
}
