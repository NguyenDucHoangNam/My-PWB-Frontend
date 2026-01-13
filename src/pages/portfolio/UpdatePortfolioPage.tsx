import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTER } from "../../routes/router";
import {
  Plus,
  X,
  Upload,
  MapPin,
  Save,
  Loader2,
  Play,
  Pause,
} from "lucide-react";
import { portfolioService } from "../../services/portfolioService";
import type {
  PortfolioSectionRequest,
  PersonalProjectRequest,
  SocialLinkRequest,
  PortfolioUpdateRequest,
} from "../../services/portfolioService";
import { PortfolioSectionType } from "../../services/portfolioService";
import { useCosmicToast } from "../../component/toast/CosmicToastProvider";
import { useAuth } from "@/contexts/AuthContext";

// Available genres (you may want to fetch these from an API)
const AVAILABLE_GENRES = [
  { id: 1, name: "Pop" },
  { id: 2, name: "V-Pop" },
  { id: 3, name: "K-Pop" },
  { id: 4, name: "Hip Hop / Rap" },
  { id: 5, name: "R&B" },
  { id: 6, name: "Rock" },
  { id: 7, name: "EDM" },
  { id: 8, name: "Vinahouse" },
  { id: 9, name: "Lofi" },
  { id: 10, name: "Ballad" },
  { id: 11, name: "Jazz" },
  { id: 12, name: "Country" },
  { id: 13, name: "Classical" },
  { id: 14, name: "Acoustic" },
  { id: 15, name: "Indie" },
];

// Social platforms
const SOCIAL_PLATFORMS = [
  "Spotify",
  "SoundCloud",
  "YouTube",
  "Facebook",
  "Instagram",
  "Twitter",
  "TikTok",
];

// Global ref to track currently playing audio (for UpdatePortfolioPage)
let currentPlayingAudioUpdate: HTMLAudioElement | null = null;

// Simple Audio Player Component
const SimpleAudioPlayer = ({ src }: { src: string }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        if (currentPlayingAudioUpdate === audioRef.current) {
          currentPlayingAudioUpdate = null;
        }
      } else {
        // Pause any currently playing audio
        if (currentPlayingAudioUpdate && currentPlayingAudioUpdate !== audioRef.current) {
          currentPlayingAudioUpdate.pause();
          // Reset other audio players' state by triggering a custom event
          currentPlayingAudioUpdate.dispatchEvent(new Event('pause'));
        }
        // Play this audio
        audioRef.current.play();
        setIsPlaying(true);
        currentPlayingAudioUpdate = audioRef.current;
      }
    }
  };

  // Listen for pause events from other players
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePause = () => {
      if (audio !== currentPlayingAudioUpdate) {
        setIsPlaying(false);
      }
    };

    audio.addEventListener('pause', handlePause);
    return () => {
      audio.removeEventListener('pause', handlePause);
    };
  }, []);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      const newTime = parseFloat(e.target.value);
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full">
      <audio
        ref={audioRef}
        src={src}
        onEnded={() => {
          setIsPlaying(false);
          if (currentPlayingAudioUpdate === audioRef.current) {
            currentPlayingAudioUpdate = null;
          }
        }}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onError={() => {
          setIsPlaying(false);
          if (currentPlayingAudioUpdate === audioRef.current) {
            currentPlayingAudioUpdate = null;
          }
          console.error("Error playing audio");
        }}
      />
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={togglePlay}
          className="bg-purple-600/40 backdrop-blur-sm text-white rounded-full h-10 w-10 flex items-center justify-center ring-2 ring-purple-400/50 hover:ring-purple-400/80 transition-all shadow-lg shadow-purple-900/50 flex-shrink-0"
        >
          {isPlaying ? (
            <Pause size={18} />
          ) : (
            <Play size={18} className="ml-0.5" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          {/* Progress Bar */}
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
            style={{
              background: `linear-gradient(to right, rgb(168, 85, 247) 0%, rgb(168, 85, 247) ${duration > 0 ? (currentTime / duration) * 100 : 0
                }%, rgb(55, 65, 81) ${duration > 0 ? (currentTime / duration) * 100 : 0}%, rgb(55, 65, 81) 100%)`,
            }}
          />

          {/* Time Display */}
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function UpdatePortfolioPage() {
  const navigate = useNavigate();
  const { showToast } = useCosmicToast();
  const { userRole, isAuthenticated } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if user can edit producer-specific fields (Vị trí, Thể loại nhạc, Tags, Dự án cá nhân)
  // Only PRODUCER and ADMIN can see and edit these fields
  const canEditProducerFields = userRole === "PRODUCER" || userRole === "ADMIN";

  // Check if user has permission - require login
  useEffect(() => {
    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      showToast("Vui lòng đăng nhập để truy cập trang này", "error");
      navigate(ROUTER.USER.LOGIN, { replace: true });
      return;
    }
  }, [isAuthenticated, navigate, showToast]);

  // Don't render form if user doesn't have permission
  if (!isAuthenticated) {
    return (
      <div className="bg-dark-neon text-white min-h-screen font-sans pt-20 pb-12 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 text-lg">Vui lòng đăng nhập để truy cập trang này</p>
        </div>
        <style>{`
          .bg-dark-neon {
            background-color: #0A0A1A;
          }
        `}</style>
      </div>
    );
  }

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [portfolioId, setPortfolioId] = useState<number | null>(null);

  // Store IDs from API response for update
  const [sectionIds, setSectionIds] = useState<(number | undefined)[]>([]);
  const [projectIds, setProjectIds] = useState<(number | undefined)[]>([]);
  const [socialLinkIds, setSocialLinkIds] = useState<(number | undefined)[]>([]);

  // Store files for personal projects (Map<index, File>)
  const [projectAudioFiles, setProjectAudioFiles] = useState<Map<number, File>>(new Map());
  const [projectCoverImages, setProjectCoverImages] = useState<Map<number, File>>(new Map());
  const [projectAudioPreviews, setProjectAudioPreviews] = useState<Map<number, string>>(new Map());
  const [projectCoverPreviews, setProjectCoverPreviews] = useState<Map<number, string>>(new Map());

  // Form data state
  const [formData, setFormData] = useState<{
    customUrlSlug: string;
    headline: string;
    latitude: number | undefined;
    longitude: number | undefined;
    genreIds: number[];
    tags: string[];
    sections: Array<{
      title: string;
      content: string;
      displayOrder: number;
      sectionType: PortfolioSectionType;
    }>;
    personalProjects: Array<{
      title: string;
      description: string;
      audioDemoUrl: string | undefined;
      coverImageUrl: string | undefined;
      releaseYear: number | undefined;
    }>;
    socialLinks: Array<{
      platform: string;
      url: string;
    }>;
  }>({
    customUrlSlug: "",
    headline: "",
    latitude: undefined,
    longitude: undefined,
    genreIds: [],
    tags: [],
    sections: [],
    personalProjects: [],
    socialLinks: [],
  });

  // Fetch existing portfolio data
  useEffect(() => {
    const fetchPortfolioData = async () => {
      setIsLoading(true);
      try {
        const data = await portfolioService.getPersonalPortfolio();
        setPortfolioId(data.id);

        // Pre-fill form with existing data
        const sortedSections = [...(data.sections || [])].sort((a, b) => {
          const orderA = a.displayOrder ?? a.order ?? 0;
          const orderB = b.displayOrder ?? b.order ?? 0;
          return orderA - orderB;
        });

        setFormData({
          customUrlSlug: data.customUrlSlug || "",
          headline: data.headline || "",
          latitude: data.latitude || undefined,
          longitude: data.longitude || undefined,
          genreIds: (data.genres || []).map(genreName => {
            const genre = AVAILABLE_GENRES.find(g => g.name === genreName);
            return genre?.id || 0;
          }).filter(id => id > 0),
          tags: data.tags || [],
          sections: sortedSections.map(s => ({
            title: s.title,
            content: s.content,
            displayOrder: s.displayOrder || s.order || 0,
            sectionType: (s.sectionType && Object.values(PortfolioSectionType).includes(s.sectionType as PortfolioSectionType))
              ? (s.sectionType as PortfolioSectionType)
              : PortfolioSectionType.CUSTOM,
          })),
          personalProjects: (data.personalProjects || []).map(p => ({
            title: p.title,
            description: p.description,
            audioDemoUrl: p.audioDemoUrl,
            coverImageUrl: p.coverImageUrl,
            releaseYear: p.releaseYear,
          })),
          socialLinks: (data.socialLinks || []).map(l => {
            // Normalize platform name from backend (e.g., "FACEBOOK" -> "Facebook")
            const platformName = l.platform.charAt(0).toUpperCase() + l.platform.slice(1).toLowerCase();
            // Map to match SOCIAL_PLATFORMS array (handle variations)
            const normalizedPlatform = SOCIAL_PLATFORMS.find(p =>
              p.toLowerCase() === platformName.toLowerCase()
            ) || platformName;
            return {
              platform: normalizedPlatform,
              url: l.url,
            };
          }),
        });

        // Store IDs for update
        setSectionIds(sortedSections.map(s => s.id));
        setProjectIds((data.personalProjects || []).map(p => p.id));
        setSocialLinkIds((data.socialLinks || []).map(l => l.id));

        // Set cover image preview if exists
        if (data.coverImageUrl) {
          setCoverImagePreview(data.coverImageUrl);
        }
      } catch (error: any) {
        console.error("Error fetching portfolio for update:", error);
        showToast("Không thể tải portfolio để chỉnh sửa", "error");
        navigate(ROUTER.USER.PORTFOLIO);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPortfolioData();
  }, [navigate, showToast]);

  // Handle cover image upload
  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size > maxSize) {
        showToast("Kích thước file vượt quá 10MB. Vui lòng chọn file nhỏ hơn.", "error");
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        showToast("File không phải là ảnh. Vui lòng chọn file ảnh hợp lệ.", "error");
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string);
      };
      reader.onerror = () => {
        showToast("Không thể đọc file ảnh. Vui lòng thử lại.", "error");
        setCoverImage(null);
        setCoverImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle location fetch
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      showToast("Trình duyệt của bạn không hỗ trợ định vị", "error");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }));
        showToast("Đã lấy vị trí thành công", "success");
      },
      (error) => {
        showToast("Không thể lấy vị trí: " + error.message, "error");
      }
    );
  };

  // Add section
  const addSection = () => {
    setFormData((prev) => ({
      ...prev,
      sections: [
        ...(prev.sections || []),
        {
          title: "",
          content: "",
          displayOrder: (prev.sections?.length || 0) + 1,
          sectionType: PortfolioSectionType.CUSTOM
        },
      ],
    }));
    // Add undefined ID for new section
    setSectionIds((prev) => [...prev, undefined]);
  };

  // Remove section
  const removeSection = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      sections: prev.sections?.filter((_, i) => i !== index) || [],
    }));
    setSectionIds((prev) => prev.filter((_, i) => i !== index));
  };

  // Update section
  const updateSection = (
    index: number,
    field: keyof PortfolioSectionRequest,
    value: string | number
  ) => {
    setFormData((prev) => {
      const updated = [...(prev.sections || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, sections: updated };
    });
  };

  // Add personal project
  const addPersonalProject = () => {
    setFormData((prev) => ({
      ...prev,
      personalProjects: [
        ...(prev.personalProjects || []),
        {
          title: "",
          description: "",
          audioDemoUrl: "",
          coverImageUrl: "",
          releaseYear: undefined,
        },
      ],
    }));
    // Add undefined ID for new project
    setProjectIds((prev) => [...prev, undefined]);
  };

  // Remove personal project
  const removePersonalProject = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      personalProjects: prev.personalProjects?.filter((_, i) => i !== index) || [],
    }));
    setProjectIds((prev) => prev.filter((_, i) => i !== index));
    // Remove files for this project
    const newAudioFiles = new Map(projectAudioFiles);
    const newCoverImages = new Map(projectCoverImages);
    const newAudioPreviews = new Map(projectAudioPreviews);
    const newCoverPreviews = new Map(projectCoverPreviews);

    // Remove current index
    newAudioFiles.delete(index);
    newCoverImages.delete(index);
    newAudioPreviews.delete(index);
    newCoverPreviews.delete(index);

    // Shift all indices after the removed one
    const shiftedAudioFiles = new Map<number, File>();
    const shiftedCoverImages = new Map<number, File>();
    const shiftedAudioPreviews = new Map<number, string>();
    const shiftedCoverPreviews = new Map<number, string>();

    newAudioFiles.forEach((file, idx) => {
      if (idx > index) {
        shiftedAudioFiles.set(idx - 1, file);
      } else if (idx < index) {
        shiftedAudioFiles.set(idx, file);
      }
    });

    newCoverImages.forEach((file, idx) => {
      if (idx > index) {
        shiftedCoverImages.set(idx - 1, file);
      } else if (idx < index) {
        shiftedCoverImages.set(idx, file);
      }
    });

    newAudioPreviews.forEach((preview, idx) => {
      if (idx > index) {
        shiftedAudioPreviews.set(idx - 1, preview);
      } else if (idx < index) {
        shiftedAudioPreviews.set(idx, preview);
      }
    });

    newCoverPreviews.forEach((preview, idx) => {
      if (idx > index) {
        shiftedCoverPreviews.set(idx - 1, preview);
      } else if (idx < index) {
        shiftedCoverPreviews.set(idx, preview);
      }
    });

    setProjectAudioFiles(shiftedAudioFiles);
    setProjectCoverImages(shiftedCoverImages);
    setProjectAudioPreviews(shiftedAudioPreviews);
    setProjectCoverPreviews(shiftedCoverPreviews);
  };

  // Update personal project
  const updatePersonalProject = (
    index: number,
    field: keyof PersonalProjectRequest,
    value: string | number | undefined
  ) => {
    setFormData((prev) => {
      const updated = [...(prev.personalProjects || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, personalProjects: updated };
    });
  };

  // Handle project audio file upload
  const handleProjectAudioChange = (index: number, file: File | null) => {
    if (!file) {
      // Remove file and preview
      const newFiles = new Map(projectAudioFiles);
      const newPreviews = new Map(projectAudioPreviews);
      newFiles.delete(index);
      newPreviews.delete(index);
      setProjectAudioFiles(newFiles);
      setProjectAudioPreviews(newPreviews);

      // Also clear the URL in formData to allow re-upload
      updatePersonalProject(index, "audioDemoUrl", "");
      return;
    }

    // Validate file size (max 20MB)
    const maxSize = 20 * 1024 * 1024; // 20MB
    if (file.size > maxSize) {
      showToast("File audio quá lớn. Tối đa 20MB.", "error");
      return;
    }

    // Validate file type
    const validTypes = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/m4a", "audio/aac", "audio/ogg"];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|m4a|aac|ogg)$/i)) {
      showToast("File không phải là audio. Vui lòng chọn file audio hợp lệ (mp3, wav, m4a, aac, ogg).", "error");
      return;
    }

    const newFiles = new Map(projectAudioFiles);
    newFiles.set(index, file);
    setProjectAudioFiles(newFiles);

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    const newPreviews = new Map(projectAudioPreviews);
    newPreviews.set(index, previewUrl);
    setProjectAudioPreviews(newPreviews);
  };

  // Handle project cover image upload
  const handleProjectCoverChange = (index: number, file: File | null) => {
    if (!file) {
      // Remove file and preview
      const newFiles = new Map(projectCoverImages);
      const newPreviews = new Map(projectCoverPreviews);
      newFiles.delete(index);
      newPreviews.delete(index);
      setProjectCoverImages(newFiles);
      setProjectCoverPreviews(newPreviews);

      // Also clear the URL in formData to allow re-upload
      updatePersonalProject(index, "coverImageUrl", "");
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      showToast("File ảnh quá lớn. Tối đa 10MB.", "error");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      showToast("File không phải là ảnh. Vui lòng chọn file ảnh hợp lệ.", "error");
      return;
    }

    const newFiles = new Map(projectCoverImages);
    newFiles.set(index, file);
    setProjectCoverImages(newFiles);

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      const newPreviews = new Map(projectCoverPreviews);
      newPreviews.set(index, reader.result as string);
      setProjectCoverPreviews(newPreviews);
    };
    reader.onerror = () => {
      showToast("Không thể đọc file ảnh. Vui lòng thử lại.", "error");
    };
    reader.readAsDataURL(file);
  };

  // Add social link
  const addSocialLink = () => {
    setFormData((prev) => ({
      ...prev,
      socialLinks: [
        ...(prev.socialLinks || []),
        { platform: "", url: "" },
      ],
    }));
    // Add undefined ID for new link
    setSocialLinkIds((prev) => [...prev, undefined]);
  };

  // Remove social link
  const removeSocialLink = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      socialLinks: prev.socialLinks?.filter((_, i) => i !== index) || [],
    }));
    setSocialLinkIds((prev) => prev.filter((_, i) => i !== index));
  };

  // Update social link
  const updateSocialLink = (
    index: number,
    field: keyof SocialLinkRequest,
    value: string
  ) => {
    setFormData((prev) => {
      const updated = [...(prev.socialLinks || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, socialLinks: updated };
    });
  };

  // Handle tag input
  const handleTagAdd = (tag: string) => {
    if (tag.trim() && !formData.tags?.includes(tag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), tag.trim()],
      }));
    }
  };

  const handleTagRemove = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags?.filter((t) => t !== tag) || [],
    }));
  };

  // Handle genre selection
  const toggleGenre = (genreId: number) => {
    setFormData((prev) => {
      const currentIds = prev.genreIds || [];
      const newIds = currentIds.includes(genreId)
        ? currentIds.filter((id) => id !== genreId)
        : [...currentIds, genreId];
      return { ...prev, genreIds: newIds };
    });
  };

  const ensureValidSectionType = (sectionType: any): PortfolioSectionType => {
    if (!sectionType || typeof sectionType !== 'string') {
      return PortfolioSectionType.CUSTOM;
    }
    // Check if the value is a valid enum value
    const validTypes = Object.values(PortfolioSectionType);
    if (validTypes.includes(sectionType as PortfolioSectionType)) {
      return sectionType as PortfolioSectionType;
    }
    return PortfolioSectionType.CUSTOM;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.headline?.trim()) {
      showToast("Vui lòng nhập tiêu đề (headline)", "error");
      return;
    }

    if (!portfolioId) {
      showToast("Không tìm thấy portfolio để cập nhật", "error");
      return;
    }

    // Validate personal projects (only for PRODUCER and ADMIN)
    if (canEditProducerFields && formData.personalProjects && formData.personalProjects.length > 0) {
      for (let i = 0; i < formData.personalProjects.length; i++) {
        const project = formData.personalProjects[i];
        if (!project.title?.trim()) {
          showToast(`Vui lòng nhập tên dự án cho dự án ${i + 1}`, "error");
          return;
        }
        if (!project.releaseYear || project.releaseYear < 1900) {
          showToast(`Vui lòng nhập năm phát hành hợp lệ (từ 1900) cho dự án ${i + 1}`, "error");
          return;
        }
      }
    }

    setIsSubmitting(true);
    try {
      const updateData: PortfolioUpdateRequest = {
        id: portfolioId,
        customUrlSlug: formData.customUrlSlug,
        headline: formData.headline,
        // Only include producer-specific fields if user is PRODUCER or ADMIN
        latitude: canEditProducerFields ? formData.latitude : undefined,
        longitude: canEditProducerFields ? formData.longitude : undefined,
        genreIds: canEditProducerFields ? formData.genreIds : [],
        tags: canEditProducerFields ? formData.tags : [],
        sections: formData.sections?.map((s, index) => ({
          id: sectionIds[index], // Use stored ID from API response
          title: s.title,
          content: s.content,
          displayOrder: s.displayOrder || index + 1,
          sectionType: ensureValidSectionType(s.sectionType),
        })),
        personalProjects: canEditProducerFields ? formData.personalProjects?.map((p, index) => {
          // Ensure releaseYear is valid (already validated in handleSubmit)
          if (!p.releaseYear || p.releaseYear < 1900) {
            throw new Error(`Dự án ${index + 1} có năm phát hành không hợp lệ`);
          }
          return {
            id: projectIds[index], // Use stored ID from API response
            title: p.title,
            description: p.description,
            releaseYear: p.releaseYear, // Required field, already validated
            // Note: audioDemoUrl and coverImageUrl are NOT sent, files are uploaded separately
          };
        }) : [],
        socialLinks: formData.socialLinks?.map((l, index) => ({
          id: socialLinkIds[index], // Use stored ID from API response
          platform: l.platform.toUpperCase(), // Convert to uppercase for backend
          url: l.url,
        })),
      };

      // Convert Maps to format expected by API (Map<string, File>)
      // Only include project files if user is PRODUCER or ADMIN
      const projectAudioDemosMap = canEditProducerFields ? new Map<string, File>() : undefined;
      const projectCoverImagesMap = canEditProducerFields ? new Map<string, File>() : undefined;

      if (canEditProducerFields) {
        projectAudioFiles.forEach((file, index) => {
          projectAudioDemosMap!.set(index.toString(), file);
        });

        projectCoverImages.forEach((file, index) => {
          projectCoverImagesMap!.set(index.toString(), file);
        });
      }

      await portfolioService.updatePortfolio(
        updateData,
        coverImage || undefined,
        projectAudioDemosMap && projectAudioDemosMap.size > 0 ? projectAudioDemosMap : undefined,
        projectCoverImagesMap && projectCoverImagesMap.size > 0 ? projectCoverImagesMap : undefined
      );
      showToast("Cập nhật portfolio thành công!", "success");
      // Navigate to portfolio view page
      navigate(ROUTER.USER.PORTFOLIO);
    } catch (error: any) {
      showToast(
        error.message || "Có lỗi xảy ra khi cập nhật portfolio",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-dark-neon text-white min-h-screen font-sans pt-20 pb-12">
      {/* Background effects */}
      <div
        className="fixed inset-0 top-0 opacity-[0.4] z-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 10% 20%, rgba(167, 139, 250, 0.05) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(0, 240, 255, 0.05) 0%, transparent 40%)",
        }}
      ></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3">
            Chỉnh sửa Portfolio
          </h1>
          <p className="text-gray-400 text-lg">
            Cập nhật thông tin portfolio của bạn
          </p>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 size={48} className="animate-spin text-purple-400" />
            <p className="ml-4 text-gray-400">Đang tải dữ liệu portfolio...</p>
          </div>
        )}

        {!isLoading && (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Cover Image Section */}
            <div className="bg-gray-800/20 backdrop-blur-md p-6 rounded-2xl border border-purple-500/10 shadow-xl">
              <label className="text-xl font-bold text-purple-400 mb-4 block">
                Ảnh Bìa (Tùy chọn)
              </label>
              <div className="space-y-4">
                {coverImagePreview ? (
                  <div className="relative group">
                    <img
                      src={coverImagePreview}
                      alt="Cover preview"
                      className="w-full h-64 object-cover rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setCoverImage(null);
                        setCoverImagePreview(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-2 transition-all z-10"
                      title="Xóa ảnh"
                    >
                      <X size={20} />
                    </button>
                    {/* Overlay with upload button */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                      <label className="cursor-pointer">
                        <div className="bg-purple-600/80 hover:bg-purple-600 px-4 py-2 rounded-lg text-white text-sm font-semibold flex items-center gap-2">
                          <Upload size={16} />
                          Thay đổi ảnh
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleCoverImageChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-purple-500/30 rounded-xl p-8 text-center cursor-pointer hover:border-purple-400/50 transition-all"
                  >
                    <Upload size={48} className="mx-auto mb-4 text-purple-400" />
                    <p className="text-gray-300 mb-2">Click để tải lên ảnh bìa</p>
                    <p className="text-gray-500 text-sm">JPG, PNG hoặc GIF (tối đa 10MB)</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCoverImageChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* Basic Information */}
            <div className="bg-gray-800/20 backdrop-blur-md p-6 rounded-2xl border border-purple-500/10 shadow-xl space-y-6">
              <h2 className="text-2xl font-bold text-purple-400 mb-4 border-b border-purple-500/30 pb-2">
                Thông Tin Cơ Bản
              </h2>

              <div>
                <label className="block text-sm font-semibold text-cyan-400 mb-2">
                  Custom URL Slug (Tùy chọn)
                </label>
                <input
                  type="text"
                  value={formData.customUrlSlug || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, customUrlSlug: e.target.value }))
                  }
                  placeholder="vd: john-producer"
                  className="w-full bg-gray-900/60 border border-gray-700 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-cyan-400 mb-2">
                  Headline <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.headline || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, headline: e.target.value }))
                  }
                  placeholder="vd: Professional Music Producer & Sound Engineer"
                  required
                  className="w-full bg-gray-900/60 border border-gray-700 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                />
              </div>

              {/* Location - Only for PRODUCER and ADMIN */}
              {canEditProducerFields && (
                <div>
                  <label className="block text-sm font-semibold text-cyan-400 mb-2">
                    Vị Trí (Tùy chọn)
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="hidden"
                      value={formData.latitude || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          latitude: e.target.value ? parseFloat(e.target.value) : undefined,
                        }))
                      }
                    />
                    <input
                      type="hidden"
                      value={formData.longitude || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          longitude: e.target.value ? parseFloat(e.target.value) : undefined,
                        }))
                      }
                    />
                    <button
                      type="button"
                      onClick={handleGetLocation}
                      className="flex items-center gap-2 bg-purple-600/40 hover:bg-purple-600/60 text-white px-4 py-3 rounded-xl border border-purple-500/50 transition-all"
                    >
                      <MapPin size={20} />
                      Lấy vị trí
                    </button>
                  </div>
                </div>
              )}

              {/* Genres - Only for PRODUCER and ADMIN */}
              {canEditProducerFields && (
                <div>
                  <label className="block text-sm font-semibold text-cyan-400 mb-2">
                    Thể Loại Nhạc
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_GENRES.map((genre) => (
                      <button
                        key={genre.id}
                        type="button"
                        onClick={() => toggleGenre(genre.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${formData.genreIds?.includes(genre.id)
                          ? "bg-cyan-500 text-black border-2 border-cyan-400"
                          : "bg-gray-900/60 text-gray-300 border border-gray-700 hover:border-cyan-400/50"
                          }`}
                      >
                        {genre.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags - Only for PRODUCER and ADMIN */}
              {canEditProducerFields && (
                <div>
                  <label className="block text-sm font-semibold text-cyan-400 mb-2">
                    Tags
                  </label>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {formData.tags?.map((tag) => (
                        <span
                          key={tag}
                          className="bg-purple-900/50 text-purple-300 px-3 py-1 rounded-lg text-sm flex items-center gap-2 border border-purple-500/30"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleTagRemove(tag)}
                            className="hover:text-red-400 transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </span>
                      ))}
                    </div>
                    <input
                      type="text"
                      placeholder="Nhập tag và nhấn Enter"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleTagAdd(e.currentTarget.value);
                          e.currentTarget.value = "";
                        }
                      }}
                      className="w-full bg-gray-900/60 border border-gray-700 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Sections */}
            <div className="bg-gray-800/20 backdrop-blur-md p-6 rounded-2xl border border-purple-500/10 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-purple-400 border-b border-purple-500/30 pb-2 flex-1">
                  Các Phần (Sections)
                </h2>
                <button
                  type="button"
                  onClick={addSection}
                  className="flex items-center gap-2 bg-purple-600/40 hover:bg-purple-600/60 text-white px-4 py-2 rounded-xl border border-purple-500/50 transition-all"
                >
                  <Plus size={20} />
                  Thêm
                </button>
              </div>

              <div className="space-y-4">
                {formData.sections?.map((section, index) => (
                  <div
                    key={index}
                    className="bg-gray-900/40 p-4 rounded-xl border border-gray-700/50 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-cyan-400 font-semibold text-sm">
                        Phần {index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeSection(index)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <X size={20} />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={section.title}
                      onChange={(e) => updateSection(index, "title", e.target.value)}
                      placeholder="Tiêu đề phần"
                      className="w-full bg-gray-800/60 border border-gray-700 rounded-lg py-2 px-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                    />
                    <textarea
                      value={section.content}
                      onChange={(e) => updateSection(index, "content", e.target.value)}
                      placeholder="Nội dung phần"
                      rows={4}
                      className="w-full bg-gray-800/60 border border-gray-700 rounded-lg py-2 px-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all resize-none"
                    />
                    <select
                      value={section.sectionType || PortfolioSectionType.CUSTOM}
                      onChange={(e) => {
                        const selectedValue = e.target.value as PortfolioSectionType;
                        updateSection(index, "sectionType", selectedValue);
                      }}
                      className="w-full bg-gray-800/60 border border-gray-700 rounded-lg py-2 px-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                    >
                      <option value={PortfolioSectionType.CUSTOM}>Tùy chỉnh</option>
                      <option value={PortfolioSectionType.BIO}>Giới thiệu</option>
                      <option value={PortfolioSectionType.SKILLS}>Kỹ năng</option>
                      <option value={PortfolioSectionType.EXPERIENCE}>Kinh nghiệm</option>
                      <option value={PortfolioSectionType.EDUCATION}>Học vấn</option>
                      <option value={PortfolioSectionType.AWARD}>Giải thưởng</option>
                      <option value={PortfolioSectionType.SERVICE}>Dịch vụ</option>
                      <option value={PortfolioSectionType.TOOLS}>Công cụ</option>
                    </select>
                  </div>
                ))}
                {(!formData.sections || formData.sections.length === 0) && (
                  <p className="text-gray-500 text-center py-4">
                    Chưa có phần nào. Click "Thêm" để thêm phần mới.
                  </p>
                )}
              </div>
            </div>

            {/* Personal Projects - Only for PRODUCER and ADMIN */}
            {canEditProducerFields && (
              <div className="bg-gray-800/20 backdrop-blur-md p-6 rounded-2xl border border-purple-500/10 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-purple-400 border-b border-purple-500/30 pb-2 flex-1">
                    Dự Án Cá Nhân
                  </h2>
                  <button
                    type="button"
                    onClick={addPersonalProject}
                    className="flex items-center gap-2 bg-purple-600/40 hover:bg-purple-600/60 text-white px-4 py-2 rounded-xl border border-purple-500/50 transition-all"
                  >
                    <Plus size={20} />
                    Thêm
                  </button>
                </div>

                <div className="space-y-4">
                  {formData.personalProjects?.map((project, index) => (
                    <div
                      key={index}
                      className="bg-gray-900/40 p-4 rounded-xl border border-gray-700/50 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-cyan-400 font-semibold text-sm">
                          Dự án {index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removePersonalProject(index)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <X size={20} />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={project.title}
                        onChange={(e) => updatePersonalProject(index, "title", e.target.value)}
                        placeholder="Tên dự án"
                        className="w-full bg-gray-800/60 border border-gray-700 rounded-lg py-2 px-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                      />
                      <textarea
                        value={project.description}
                        onChange={(e) =>
                          updatePersonalProject(index, "description", e.target.value)
                        }
                        placeholder="Mô tả dự án"
                        rows={3}
                        className="w-full bg-gray-800/60 border border-gray-700 rounded-lg py-2 px-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all resize-none"
                      />
                      {/* Audio Demo Upload */}
                      <div>
                        <label className="block text-sm font-semibold text-cyan-400 mb-2">
                          Audio Demo (tùy chọn, tối đa 20MB)
                        </label>
                        {projectAudioPreviews.has(index) || project.audioDemoUrl ? (
                          <div className="relative">
                            <div className="bg-gray-800/60 border border-gray-700 rounded-lg p-3 space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                  <p className="text-white text-sm font-medium truncate">
                                    {projectAudioFiles.has(index)
                                      ? projectAudioFiles.get(index)?.name
                                      : "Audio đã tải lên"}
                                  </p>
                                  <p className="text-gray-400 text-xs">
                                    {projectAudioFiles.has(index)
                                      ? `${(projectAudioFiles.get(index)!.size / 1024 / 1024).toFixed(2)} MB`
                                      : "File hiện có"}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <label className="cursor-pointer">
                                    <div className="bg-purple-600/60 hover:bg-purple-600/80 px-3 py-1.5 rounded-lg text-white text-xs font-semibold flex items-center gap-1 transition-colors">
                                      <Upload size={14} />
                                      Thay đổi
                                    </div>
                                    <input
                                      type="file"
                                      accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0] || null;
                                        handleProjectAudioChange(index, file);
                                        e.target.value = ""; // Reset input
                                      }}
                                      className="hidden"
                                    />
                                  </label>
                                  <button
                                    type="button"
                                    onClick={() => handleProjectAudioChange(index, null)}
                                    className="text-red-400 hover:text-red-300 transition-colors flex-shrink-0"
                                    title="Xóa audio"
                                  >
                                    <X size={20} />
                                  </button>
                                </div>
                              </div>

                              {/* Audio Player */}
                              <SimpleAudioPlayer
                                src={projectAudioPreviews.get(index) || project.audioDemoUrl || ""}
                              />
                            </div>
                          </div>
                        ) : (
                          <label className="block">
                            <div className="border-2 border-dashed border-purple-500/30 rounded-xl p-4 text-center cursor-pointer hover:border-purple-400/50 transition-all">
                              <Upload size={24} className="mx-auto mb-2 text-purple-400" />
                              <p className="text-gray-300 text-sm mb-1">Click để tải lên audio demo</p>
                              <p className="text-gray-500 text-xs">MP3, WAV, M4A, AAC, OGG (tối đa 20MB)</p>
                            </div>
                            <input
                              type="file"
                              accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg"
                              onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                handleProjectAudioChange(index, file);
                                e.target.value = ""; // Reset input
                              }}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>

                      {/* Cover Image Upload */}
                      <div>
                        <label className="block text-sm font-semibold text-cyan-400 mb-2">
                          Ảnh Bìa Dự Án (tùy chọn)
                        </label>
                        {projectCoverPreviews.has(index) || project.coverImageUrl ? (
                          <div className="relative group">
                            <img
                              src={projectCoverPreviews.get(index) || project.coverImageUrl || ""}
                              alt={`Cover ${index + 1}`}
                              className="w-full h-48 object-cover rounded-xl"
                            />
                            <button
                              type="button"
                              onClick={() => handleProjectCoverChange(index, null)}
                              className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-2 transition-all z-10"
                              title="Xóa ảnh"
                            >
                              <X size={16} />
                            </button>
                            {/* Overlay with upload button */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                              <label className="cursor-pointer">
                                <div className="bg-purple-600/80 hover:bg-purple-600 px-4 py-2 rounded-lg text-white text-sm font-semibold flex items-center gap-2">
                                  <Upload size={16} />
                                  Thay đổi ảnh
                                </div>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0] || null;
                                    handleProjectCoverChange(index, file);
                                    e.target.value = ""; // Reset input
                                  }}
                                  className="hidden"
                                />
                              </label>
                            </div>
                          </div>
                        ) : (
                          <label className="block">
                            <div className="border-2 border-dashed border-purple-500/30 rounded-xl p-4 text-center cursor-pointer hover:border-purple-400/50 transition-all">
                              <Upload size={24} className="mx-auto mb-2 text-purple-400" />
                              <p className="text-gray-300 text-sm mb-1">Click để tải lên ảnh bìa</p>
                              <p className="text-gray-500 text-xs">JPG, PNG, WEBP (tối đa 10MB)</p>
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                handleProjectCoverChange(index, file);
                                e.target.value = ""; // Reset input
                              }}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                      <input
                        type="number"
                        value={project.releaseYear || ""}
                        onChange={(e) =>
                          updatePersonalProject(index, "releaseYear", e.target.value ? parseInt(e.target.value) : undefined)
                        }
                        placeholder="Năm phát hành *"
                        min="1900"
                        max={new Date().getFullYear() + 1}
                        required
                        className="w-full bg-gray-800/60 border border-gray-700 rounded-lg py-2 px-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                      />
                    </div>
                  ))}
                  {(!formData.personalProjects ||
                    formData.personalProjects.length === 0) && (
                      <p className="text-gray-500 text-center py-4">
                        Chưa có dự án nào. Click "Thêm" để thêm dự án mới.
                      </p>
                    )}
                </div>
              </div>
            )}

            {/* Social Links */}
            <div className="bg-gray-800/20 backdrop-blur-md p-6 rounded-2xl border border-purple-500/10 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-purple-400 border-b border-purple-500/30 pb-2 flex-1">
                  Liên Kết Mạng Xã Hội
                </h2>
                <button
                  type="button"
                  onClick={addSocialLink}
                  className="flex items-center gap-2 bg-purple-600/40 hover:bg-purple-600/60 text-white px-4 py-2 rounded-xl border border-purple-500/50 transition-all"
                >
                  <Plus size={20} />
                  Thêm
                </button>
              </div>

              <div className="space-y-4">
                {formData.socialLinks?.map((link, index) => (
                  <div
                    key={index}
                    className="bg-gray-900/40 p-4 rounded-xl border border-gray-700/50 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-cyan-400 font-semibold text-sm">
                        Link {index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeSocialLink(index)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <X size={20} />
                      </button>
                    </div>
                    <select
                      value={link.platform}
                      onChange={(e) =>
                        updateSocialLink(index, "platform", e.target.value)
                      }
                      className="w-full bg-gray-800/60 border border-gray-700 rounded-lg py-2 px-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                    >
                      <option value="">Chọn nền tảng</option>
                      {SOCIAL_PLATFORMS.map((platform) => (
                        <option key={platform} value={platform}>
                          {platform}
                        </option>
                      ))}
                    </select>
                    <input
                      type="url"
                      value={link.url}
                      onChange={(e) => updateSocialLink(index, "url", e.target.value)}
                      placeholder="URL"
                      className="w-full bg-gray-800/60 border border-gray-700 rounded-lg py-2 px-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                    />
                  </div>
                ))}
                {(!formData.socialLinks || formData.socialLinks.length === 0) && (
                  <p className="text-gray-500 text-center py-4">
                    Chưa có liên kết nào. Click "Thêm" để thêm liên kết mới.
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3 bg-gray-700/60 hover:bg-gray-700 text-gray-300 font-semibold rounded-xl transition-all border border-gray-600"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-purple-700/50 transition-all transform hover:scale-[1.03] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Đang cập nhật...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    Cập nhật Portfolio
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Custom Styles */}
      <style>{`
        .bg-dark-neon {
          background-color: #0A0A1A;
        }
      `}</style>
    </div>
  );
}

