import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  MapPin,
  Link as LinkIcon,
  LocateFixed,
  Star,
  Play,
  ChevronLeft,
  ChevronRight,
  ListMusic,
  Map,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import producerService from "../../services/producerService";
import type {
  GetProducersParams,
  Producer,
  PageInfo,
  LinkInfo,
} from "../../services/producerService";
import LoadingSearch from "../../component/loading/LoadingSearch";
import AnimatedBackground from "../../component/background/AnimatedBackground";
import { createPortal } from "react-dom";
import logo2 from "../../assets/image/logo2.png";
import { ROUTER } from "../../routes/router";
import ProducerMap from "../../component/map/ProducerMap";

// --- Types ---
export type ProducerProfile = Producer & {
  rating: number;
  reviewCount: number;
  isFeatured?: boolean;
};

const PAGE_SIZE = 6;

const StarRating = ({
  rating,
  reviewCount,
}: {
  rating: number;
  reviewCount: number;
}) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-1">
      <div className="flex text-yellow-400">
        {[...Array(fullStars)].map((_, i) => (
          <Star
            key={`full-${i}`}
            size={16}
            fill="currentColor"
            className="stroke-1"
          />
        ))}
        {hasHalfStar && (
          <Star key="half" size={16} fill="currentColor" className="stroke-1" />
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <Star
            key={`empty-${i}`}
            size={16}
            className="text-gray-600 stroke-1"
            fill="currentColor"
          />
        ))}
      </div>
      <span className="ml-2 text-sm text-gray-400 font-medium">
        {rating.toFixed(1)}{" "}
        <span className="text-gray-500">({reviewCount} đánh giá)</span>
      </span>
    </div>
  );
};



const ProducerCard = ({
  producer,
  style,
  showDistanceInfo,
  isSelected,
  onMouseEnter,
  onMouseLeave,
}: {
  producer: ProducerProfile;
  style?: React.CSSProperties;
  showDistanceInfo: boolean;
  isSelected?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(ROUTER.USER.VIEW_PORTFOLIO.replace(":userId", producer.userId.toString()));
  };

  return (
  <div
    className={`bg-gray-800/30 backdrop-blur-sm border rounded-xl p-6 transition-all duration-500 group relative overflow-hidden flex flex-col h-full cursor-pointer ${
      isSelected 
        ? "border-purple-500 shadow-2xl shadow-purple-500/60 scale-[1.02] ring-4 ring-purple-500/30" 
        : "border-gray-700"
    }`}
    style={{ ...style, transformStyle: "preserve-3d" }}
    onClick={handleCardClick}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
  >
    <div className="absolute top-0 left-0 w-full h-full bg-purple-500/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
    <div className="flex flex-col flex-1">
      <div className="flex-1">
        <div className="flex items-center space-x-5">
          <img
            src={
              producer.avatarUrl ||
              `https://placehold.co/100x100/333333/ffffff?text=${producer.fullName.charAt(
                0
              )}`
            }
            alt={producer.fullName}
            className="w-24 h-24 rounded-full object-cover border-2 border-gray-600 group-hover:border-purple-500 transition-colors"
            onError={(e) => {
              e.currentTarget.src = `https://placehold.co/100x100/333333/ffffff?text=${producer.fullName.charAt(
                0
              )}`;
            }}
          />
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-white tracking-tight">
              {producer.fullName}
            </h3>
            <p className="text-purple-400 font-medium mb-2">
              {producer.headline}
            </p>
            <StarRating
              rating={producer.rating}
              reviewCount={producer.reviewCount}
            />
          </div>
        </div>
        <div className="mt-5 pt-5 border-t border-gray-700">
          <div className="flex flex-wrap gap-2">
            {producer.genres.map((genre: string) => (
              <span
                key={genre}
                className="bg-purple-600/20 text-purple-300 text-xs font-semibold px-2.5 py-1 rounded-full"
              >
                {genre}
              </span>
            ))}
            {producer.tags.map((tag: string) => (
              <span
                key={tag}
                className="bg-gray-700 text-gray-300 text-xs font-semibold px-2.5 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center text-sm text-gray-400">
          <MapPin size={14} className="mr-2 text-gray-500" />
          {producer.location}
          {showDistanceInfo && (
            <span
              className={`ml-2 font-medium ${
                producer.distanceInKm !== null
                  ? "text-purple-400"
                  : "text-gray-500 italic"
              }`}
            >
              {producer.distanceInKm !== null
                ? `(${producer.distanceInKm.toFixed(1)} km)`
                : `(Chưa cập nhật)`}
            </span>
          )}
        </div>
        <button 
          className="bg-purple-600 text-white rounded-full h-14 w-14 flex items-center justify-center shadow-lg shadow-purple-500/30 hover:bg-purple-700 transition-all duration-300 transform group-hover:scale-110"
          onClick={(e) => {
            e.stopPropagation();
            handleCardClick();
          }}
        >
          <Play className="ml-1" size={24} />
        </button>
      </div>
    </div>
    {producer.isFeatured && (
      <div className="absolute top-4 right-4 bg-gray-900/50 text-purple-300 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 border border-purple-800">
        <Star size={14} /> Nổi bật
      </div>
    )}
  </div>
  );
};


const GenreSelector = ({
  availableGenres,
  selectedGenres,
  setSelectedGenres,
}: {
  availableGenres: string[];
  selectedGenres: string[];
  setSelectedGenres: React.Dispatch<React.SetStateAction<string[]>>;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDark, setIsDark] = useState(
    document.documentElement.classList.contains("dark")
  );

  // State cho input tìm kiếm
  const [inputValue, setInputValue] = useState("");

  // Cập nhật vị trí dropdown
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [isOpen]);

  // Focus vào input khi dropdown mở
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Theo dõi theme
  useEffect(() => {
    const observer = new MutationObserver(() =>
      setIsDark(document.documentElement.classList.contains("dark"))
    );
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current &&
        dropdownRef.current &&
        !containerRef.current.contains(target) &&
        !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
        setInputValue("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev: string[]) =>
      prev.includes(genre)
        ? prev.filter((g) => g !== genre)
        : [...prev, genre]
    );
  };

  // Xử lý khi nhấn Enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      const genreToAdd = inputValue.trim();
      
      // Kiểm tra xem thể loại đã tồn tại chưa
      if (!selectedGenres.includes(genreToAdd)) {
        setSelectedGenres((prev) => [...prev, genreToAdd]);
      }
      
      setInputValue("");
      setIsOpen(false);
    }
  };

  // Xóa thể loại đã chọn
  const removeGenre = (genreToRemove: string) => {
    setSelectedGenres((prev) => prev.filter((g) => g !== genreToRemove));
  };

  // Lọc danh sách dựa theo input value
  const filteredGenres = availableGenres.filter((genre) =>
    genre.toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <div ref={containerRef} className="relative w-full md:w-auto md:min-w-[250px]">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Thể loại
      </label>

      <div className="relative">
        {/* Container chứa tags và input */}
        <div
          className={`flex flex-wrap gap-1 p-2 border border-gray-600 rounded-lg bg-white/80 dark:bg-gray-900 min-h-[44px] items-center focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-purple-500 transition-all ${
            isOpen ? "rounded-b-none" : ""
          }`}
          onClick={() => {
            setIsOpen(true);
            inputRef.current?.focus();
          }}
        >
          {/* Hiển thị các thể loại đã chọn dưới dạng tags */}
          {selectedGenres.map((genre) => (
            <span
              key={genre}
              className="inline-flex items-center gap-1 px-2 py-1 bg-purple-600/20 text-purple-300 text-xs font-semibold rounded-full border border-purple-500/30"
            >
              {genre}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeGenre(genre);
                }}
                className="ml-1 text-purple-400 hover:text-red-400 transition-colors"
                title="Xóa thể loại"
              >
                ×
              </button>
            </span>
          ))}
          
          {/* Ô input chính có thể nhập trực tiếp */}
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={() => setIsOpen(true)}
            placeholder={selectedGenres.length === 0 ? "Nhập thể loại và nhấn Enter..." : ""}
            className="flex-1 bg-transparent outline-none text-gray-800 dark:text-white placeholder-gray-500 min-w-[120px]"
          />
        </div>

        {/* Dropdown danh sách thể loại có sẵn */}
        {isOpen &&
          createPortal(
            <div
              ref={dropdownRef}
              style={{
                position: "absolute",
                top: `${dropdownPos.top}px`,
                left: `${dropdownPos.left}px`,
                width: `${dropdownPos.width}px`,
                zIndex: 99999,
              }}
              className={`border rounded-lg shadow-xl max-h-60 overflow-y-auto transition-colors duration-200 ${
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"
              } ${selectedGenres.length > 0 ? "rounded-t-none" : ""}`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Danh sách thể loại có sẵn */}
              {filteredGenres.length > 0 ? (
                filteredGenres.map((genre) => (
                  <div
                    key={genre}
                    onClick={() => toggleGenre(genre)}
                    className={`p-2 cursor-pointer transition-colors select-none
                      ${
                        selectedGenres.includes(genre)
                          ? isDark
                            ? "bg-purple-800 text-white font-semibold"
                            : "bg-purple-100 text-purple-700 font-semibold"
                          : isDark
                          ? "hover:bg-gray-700 text-gray-200"
                          : "hover:bg-gray-100 text-gray-800"
                      }`}
                  >
                    {genre}
                  </div>
                ))
              ) : (
                <div className="p-2 text-sm text-gray-500 dark:text-gray-400 italic">
                  Không tìm thấy thể loại nào
                </div>
              )}
            </div>,
            document.body
          )}
      </div>
    </div>
  );
};

const LinkInfoBanner = ({ linkInfo }: { linkInfo: LinkInfo }) => {
  const [imageError, setImageError] = useState(false);

  // Reset image error when linkInfo changes
  useEffect(() => {
    setImageError(false);
  }, [linkInfo.artistImageUrl]);

  const getLinkTypeLabel = (type: string) => {
    switch (type) {
      case 'TRACK':
        return '🎵 Bài hát';
      case 'ARTIST':
        return '🎤 Nghệ sĩ';
      case 'ALBUM':
        return '💿 Album';
      default:
        return type;
    }
  };

  return (
    <div className="mb-6 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl p-4 backdrop-blur-sm">
      <div className="flex items-start gap-4 flex-wrap md:flex-nowrap">
        {/* Artist Image or Default Icon */}
        <div className="flex-shrink-0">
          {linkInfo.artistImageUrl && !imageError ? (
            <img
              src={linkInfo.artistImageUrl}
              alt={linkInfo.artistName || 'Artist'}
              className="w-16 h-16 rounded-full object-cover border-2 border-purple-500/50 shadow-lg"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xl">
              <LinkIcon size={24} />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          {/* Link Type and Spotify ID */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-sm font-semibold text-purple-300">
              {getLinkTypeLabel(linkInfo.linkType)}
            </span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-400 font-mono break-all">
              ID: {linkInfo.spotifyId}
            </span>
          </div>
          
          {/* Artist Name */}
          {linkInfo.artistName && (
            <div className="mb-2">
              <span className="text-sm font-medium text-white">
                Nghệ sĩ: <span className="text-purple-300">{linkInfo.artistName}</span>
              </span>
            </div>
          )}

          {/* Genres */}
          {linkInfo.genres && linkInfo.genres.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs text-gray-400">Thể loại:</span>
              {linkInfo.genres.map((genre, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-600/30 text-purple-200 border border-purple-500/50"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}
        </div>
        
        {/* Right side: Message bubble and animated logo */}
        <div className="flex-shrink-0 flex items-center gap-3 w-full md:w-auto justify-end">
          {/* Speech bubble with text */}
          <div className="relative">
            <div className="bg-gradient-to-br from-purple-500/90 to-pink-500/90 text-white text-xs px-3 py-2 rounded-2xl rounded-br-sm shadow-lg border border-purple-400/50 backdrop-blur-sm animate-bounce-subtle max-w-[140px] md:max-w-[160px]">
              <p className="font-medium leading-relaxed">
                Đây có phải là thần tượng của bạn không? 😄
              </p>
            </div>
            {/* Speech bubble tail */}
            <div className="absolute -right-2 bottom-0 w-0 h-0 border-l-[8px] border-l-purple-500/90 border-t-[8px] border-t-transparent"></div>
          </div>
          
          {/* Animated logo */}
          <div className="animate-bounce-logo">
            <img
              src={logo2}
              alt="PWB Logo"
              className="w-16 h-16 md:w-20 md:h-20 object-contain opacity-90 hover:opacity-100 transition-opacity"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const NoResultsState = () => (
  <div className="flex flex-col items-center justify-center text-center text-gray-400 p-10 col-span-full">
    <ListMusic size={64} className="text-gray-600" />
    <p className="mt-4 text-lg font-semibold">Không tìm thấy producer nào</p>
    <p className="text-sm">Hãy thử thay đổi từ khóa hoặc bộ lọc của bạn nhé.</p>
  </div>
);

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => {
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <nav className="flex items-center justify-center gap-2 mt-12">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center justify-center h-10 w-10 rounded-lg bg-gray-800 text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
      >
        <ChevronLeft size={20} />
      </button>
      {pageNumbers.map((number) => (
        <button
          key={number}
          onClick={() => onPageChange(number)}
          className={`h-10 w-10 rounded-lg font-semibold transition-colors ${
            currentPage === number
              ? "bg-purple-600 text-white"
              : "bg-gray-800 text-gray-300 hover:bg-gray-700"
          }`}
        >
          {number}
        </button>
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center justify-center h-10 w-10 rounded-lg bg-gray-800 text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
      >
        <ChevronRight size={20} />
      </button>
    </nav>
  );
};

// --- Main Component ---
export default function FindProducerPage() {
  const [producers, setProducers] = useState<ProducerProfile[]>([]);
  const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [linkInfo, setLinkInfo] = useState<LinkInfo | null>(null);

  // Filter & Sort states
  const [searchTerm, setSearchTerm] = useState("");
  const [availableGenres, setAvailableGenres] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [useLocation, setUseLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const [radius, setRadius] = useState<number>(1000); // Default to 1000km (very large number)
  const [sortOption, setSortOption] = useState("");

  // Map states
  const [showMap, setShowMap] = useState(false);
  const [selectedProducerId, setSelectedProducerId] = useState<number | undefined>(undefined);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    const fetchGenres = async () => {
      const genresFromApi = [
        "Pop",
        "V-Pop",
        "K-Pop",
        "Hip Hop / Rap",
        "R&B",
        "Rock",
        "EDM",
        "Vinahouse",
        "Lofi",
        "Ballad",
        "Jazz",
        "Country",
        "Classical",
        "Acoustic",
        "Indie",
        "Folk",
        "Soundtrack",
      ];
      setAvailableGenres(genresFromApi);
    };
    fetchGenres();
  }, []);

  const fetchProducers = useCallback(async () => {
    setIsLoading(true);
    try {
      let response;
      // Detect valid Spotify link (track, artist, or album - standard URL or spotify URI)
      const trimmed = searchTerm.trim();
      const isSpotifyLink =
        /^https?:\/\/open\.spotify\.com\/(track|artist|album)\/[A-Za-z0-9]+/.test(trimmed) ||
        /^spotify:(track|artist|album):[A-Za-z0-9]+/.test(trimmed);

      // Điều chỉnh page và size phụ thuộc useLocation
      const page = useLocation ? 0 : currentPage - 1;
      const size = useLocation ? 200 : PAGE_SIZE;

      if (isSpotifyLink) {
        response = await producerService.recommendBySpotify({
          link: searchTerm.trim(),
          page,
          size,
        });
      } else {
        // Clear linkInfo when not using Spotify link
        setLinkInfo(null);
        const params: GetProducersParams = {
          page,
          size,
        };
        if (searchTerm.trim()) params.search = searchTerm.trim();
        if (selectedGenres.length > 0) params.tags = selectedGenres;
        if (useLocation && coordinates) {
          params.lat = coordinates.lat;
          params.lon = coordinates.lon;
          params.radius = radius;
        }
        if (sortOption) params.sort = sortOption;

        response = await producerService.getProducers(params);
      }

      if (response && response.result) {
        // Handle Spotify recommendation response (new structure)
        if (response.result.linkInfo && response.result.producers) {
          setLinkInfo(response.result.linkInfo);
          const processedProducers = response.result.producers.content.map(
            (p: Producer) => ({
              ...p,
              rating: 4.5 + (p.userId % 5) / 10,
              reviewCount: 30 + (p.userId % 70),
            })
          );

          if (useLocation && coordinates) {
            processedProducers.sort((a, b) => {
              if (a.distanceInKm === null && b.distanceInKm !== null) return 1;
              if (a.distanceInKm !== null && b.distanceInKm === null) return -1;
              if (a.distanceInKm !== null && b.distanceInKm !== null) {
                return a.distanceInKm - b.distanceInKm;
              }
              return 0;
            });
          }

          setProducers(processedProducers);
          setPageInfo(response.result.producers.page);
        } 
        // Handle regular search response (old structure)
        else if (response.result.content && response.result.page) {
          const processedProducers = response.result.content.map(
            (p: Producer) => ({
              ...p,
              rating: 4.5 + (p.userId % 5) / 10,
              reviewCount: 30 + (p.userId % 70),
            })
          );

          if (useLocation && coordinates) {
            processedProducers.sort((a, b) => {
              if (a.distanceInKm === null && b.distanceInKm !== null) return 1;
              if (a.distanceInKm !== null && b.distanceInKm === null) return -1;
              if (a.distanceInKm !== null && b.distanceInKm !== null) {
                return a.distanceInKm - b.distanceInKm;
              }
              return 0;
            });
          }

          setProducers(processedProducers);
          setPageInfo(response.result.page);
        } else {
          setProducers([]);
          setPageInfo(null);
          setLinkInfo(null);
        }
      } else {
        setProducers([]);
        setPageInfo(null);
        setLinkInfo(null);
      }
    } catch (error) {
      console.error("Lỗi khi fetch producers:", error);
      setProducers([]);
      setPageInfo(null);
    } finally {
      setIsLoading(false);
    }
  }, [
    currentPage,
    searchTerm,
    selectedGenres,
    useLocation,
    coordinates,
    radius,
    sortOption,
  ]);

  useEffect(() => {
    fetchProducers();
  }, [fetchProducers]);

  // Tự động lấy vị trí GPS khi mở bản đồ
  useEffect(() => {
    if (showMap && !mapCenter) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setMapCenter({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
          },
          (error) => {
            console.warn("Không thể lấy vị trí GPS:", error);
            // Nếu không lấy được GPS, dùng vị trí từ useLocation nếu có
            if (useLocation && coordinates) {
              setMapCenter({
                lat: coordinates.lat,
                lng: coordinates.lon,
              });
            }
          }
        );
      } else {
        // Nếu trình duyệt không hỗ trợ, dùng vị trí từ useLocation nếu có
        if (useLocation && coordinates) {
          setMapCenter({
            lat: coordinates.lat,
            lng: coordinates.lon,
          });
        }
      }
    }
  }, [showMap, mapCenter, useLocation, coordinates]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentPage === 1) fetchProducers();
    else setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= (pageInfo?.totalPages || 1)) setCurrentPage(page);
  };

  const handleLocationToggle = () => {
    if (!useLocation) {
      setLocationError(null);
      setCurrentPage(1); // Reset page khi bật "Gần tôi"
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setCoordinates({
              lat: position.coords.latitude,
              lon: position.coords.longitude,
            });
            setUseLocation(true);
          },
          (error) => {
            setLocationError(
              error.code === error.PERMISSION_DENIED
                ? "Bạn đã từ chối quyền truy cập vị trí."
                : "Không thể lấy vị trí của bạn."
            );
            setUseLocation(false);
          }
        );
      } else {
        setLocationError("Trình duyệt không hỗ trợ định vị.");
        setUseLocation(false);
      }
    } else {
      // Tắt chế độ gần tôi
      setUseLocation(false);
      setCoordinates(null);
      setCurrentPage(1); // Reset page khi tắt "Gần tôi"
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 dark:from-[#050505] dark:to-[#0d0d18] text-gray-900 dark:text-white font-sans overflow-hidden">
      <AnimatedBackground />

      <div className="container mx-auto px-4 pt-28 pb-12 relative z-10">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-extrabold tracking-tight">
            🪐 Khám phá <span className="text-purple-600">Producer</span>
          </h1>
          <p className="mt-4 text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
            Cùng phi hành gia du hành qua không gian âm nhạc, tìm kiếm những Producer tài năng để thắp sáng ý tưởng của bạn.
          </p>
        </header>
        <aside className="bg-white/70 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 rounded-2xl p-6 mb-12 backdrop-blur-md shadow-[0_0_40px_rgba(230,200,255,0.4)] dark:shadow-none transition-all duration-500">
  <form
    onSubmit={handleSearch}
    className="flex flex-wrap items-end gap-6"
  >
    {/* Ô nhập liệu */}
    <div className="flex-grow">
      <label
        htmlFor="search-term"
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
      >
        Tên Nghệ Sĩ hoặc link Spotify (bài hát/nghệ sĩ/album)
      </label>
      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 dark:text-gray-500">
          <LinkIcon size={18} />
        </span>
        <input
          type="text"
          id="search-term"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Nhập link Spotify (bài hát, nghệ sĩ, album)..."
          className="w-full bg-white/80 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl py-3 pl-10 pr-4 text-gray-800 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all shadow-sm"
        />
      </div>
    </div>

    {/* Bộ lọc thể loại */}
    <GenreSelector
      availableGenres={availableGenres}
      selectedGenres={selectedGenres}
      setSelectedGenres={setSelectedGenres}
    />

    {/* Sort */}
    <div>
      <label
        htmlFor="sort-order"
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
      >
        Sắp xếp
      </label>
      <select
        id="sort-order"
        value={sortOption}
        onChange={(e) => setSortOption(e.target.value)}
        className="w-full md:w-auto bg-white/80 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl py-3 pl-4 pr-10 text-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all appearance-none shadow-sm"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
          backgroundPosition: "right 0.75rem center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "1.25em 1.25em",
        }}
      >
        <option value="">Mặc định</option>
        <option value="user.lastName,asc">Tên (A-Z)</option>
        <option value="user.lastName,desc">Tên (Z-A)</option>
      </select>
    </div>

    {/* Gần tôi */}
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Vị trí
      </label>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleLocationToggle}
          className={`flex items-center justify-center px-5 py-3 rounded-xl font-semibold transition-all duration-300 shadow-sm ${
            useLocation
              ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
              : "bg-white/70 hover:bg-white/90 dark:bg-gray-700 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200"
          }`}
        >
          <LocateFixed size={18} className="mr-2" /> Gần tôi
        </button>
        {useLocation && (
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={radius}
              onChange={(e) => setRadius(Math.max(1, parseInt(e.target.value) || 1000))}
              placeholder="Khoảng cách (km)"
              className="w-32 bg-white/80 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl py-3 px-3 text-gray-800 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all shadow-sm text-sm"
              min="1"
              max="10000"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">km</span>
          </div>
        )}
      </div>
      {locationError && (
        <p className="text-red-500 text-xs mt-1 absolute">{locationError}</p>
      )}
    </div>

    {/* Nút tìm kiếm chính */}
    <div className="flex items-center justify-center w-full md:w-auto">
      <button
        type="submit"
        className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold shadow-[0_4px_20px_rgba(168,85,247,0.5)] hover:shadow-[0_6px_30px_rgba(236,72,153,0.5)] transition-all"
      >
        ⚡ Tìm Producer Ngay
      </button>
    </div>
  </form>
</aside>

        <main>
          {/* Hiển thị thông tin link Spotify nếu có */}
          {linkInfo && !isLoading && (
            <LinkInfoBanner linkInfo={linkInfo} />
          )}

          {/* Map Toggle Button - Hiển thị sau khi đã search (không phụ thuộc vào có kết quả hay không) */}
          {!isLoading && (
            <div className="mb-6 flex justify-end">
              <button
                onClick={() => {
                  if (showMap) {
                    // Đóng map: reset mapCenter để lần sau mở sẽ lấy vị trí mới
                    setMapCenter(null);
                  }
                  setShowMap(!showMap);
                }}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all duration-300 shadow-sm ${
                  showMap
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
                    : "bg-white/70 hover:bg-white/90 dark:bg-gray-700 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200"
                }`}
              >
                {showMap ? (
                  <>
                    <X size={18} /> Ẩn bản đồ
                  </>
                ) : (
                  <>
                    <Map size={18} /> Hiển thị bản đồ
                  </>
                )}
              </button>
            </div>
          )}

          {/* Map Section - Hiển thị khi showMap === true, không phụ thuộc vào số lượng producer */}
          {showMap && !isLoading && (
            <div className="mb-8 h-[500px] bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden shadow-lg">
              <ProducerMap
                producers={producers}
                center={
                  mapCenter
                    ? { lat: mapCenter.lat, lng: mapCenter.lng }
                    : useLocation && coordinates
                    ? { lat: coordinates.lat, lng: coordinates.lon }
                    : undefined
                }
                radius={useLocation && coordinates && radius < 10000 ? radius : undefined}
                selectedProducerId={selectedProducerId}
                onMarkerClick={(producer) => {
                  setSelectedProducerId(producer.userId);
                  // Scroll to the card với delay nhỏ để đảm bảo highlight rõ ràng
                  setTimeout(() => {
                    const cardElement = document.getElementById(`producer-card-${producer.userId}`);
                    if (cardElement) {
                      cardElement.scrollIntoView({ behavior: "smooth", block: "center" });
                      // Thêm animation pulse để highlight rõ hơn
                      cardElement.classList.add("animate-pulse-once");
                      setTimeout(() => {
                        cardElement.classList.remove("animate-pulse-once");
                      }, 2000);
                    }
                  }, 100);
                }}
              />
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              <LoadingSearch />
            </div>
          ) : producers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {producers.map((producer) => (
                <div key={producer.userId} id={`producer-card-${producer.userId}`}>
                  <ProducerCard
                    producer={producer}
                    showDistanceInfo={useLocation}
                    isSelected={selectedProducerId === producer.userId}
                    onMouseEnter={() => setSelectedProducerId(producer.userId)}
                    onMouseLeave={() => setSelectedProducerId(undefined)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-16">
              <NoResultsState />
            </div>
          )}

          {pageInfo && pageInfo.totalPages > 1 && !isLoading && !useLocation && (
            <Pagination
              currentPage={currentPage}
              totalPages={pageInfo.totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </main>
      </div>
      <style>{`
                :root { --noise-bg-pattern: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MDAgNTAwIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuNjUiIG51bU9jdGF2ZXM9IjMiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZh0PSIxMDAlIiBmaWx0ZXI9InVybCgjbnoaXNlKSIvPjwvc3ZnPg==); }
                .bg-musical-noise { background-color: #10101a; background-image: radial-gradient(ellipse at top, #1a1a2e, #10101a); }
                @keyframes equalizer { 0%, 100% { height: 0.5rem; } 50% { height: 4rem; } }
                .animate-equalizer { animation: equalizer 1.2s infinite ease-in-out; }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .grid > div { opacity: 1; }
                .group:hover { transform: perspective(1000px) rotateX(2deg) rotateY(-2deg) scale(1.02); }
                
                /* Logo bounce animation - năng động, nhảy nhảy */
                @keyframes bounce-logo {
                  0%, 100% { 
                    transform: translateY(0) rotate(0deg) scale(1);
                  }
                  25% { 
                    transform: translateY(-8px) rotate(-5deg) scale(1.05);
                  }
                  50% { 
                    transform: translateY(-12px) rotate(0deg) scale(1.1);
                  }
                  75% { 
                    transform: translateY(-8px) rotate(5deg) scale(1.05);
                  }
                }
                .animate-bounce-logo {
                  animation: bounce-logo 1.5s ease-in-out infinite;
                }
                
                /* Speech bubble subtle bounce - hài hước */
                @keyframes bounce-subtle {
                  0%, 100% { 
                    transform: translateY(0) scale(1);
                  }
                  50% { 
                    transform: translateY(-3px) scale(1.02);
                  }
                }
                .animate-bounce-subtle {
                  animation: bounce-subtle 2s ease-in-out infinite;
                }
                
                /* Pulse animation for card highlight */
                @keyframes pulse-once {
                  0%, 100% {
                    box-shadow: 0 0 0 0 rgba(147, 51, 234, 0.7);
                  }
                  50% {
                    box-shadow: 0 0 0 10px rgba(147, 51, 234, 0);
                  }
                }
                .animate-pulse-once {
                  animation: pulse-once 2s ease-out;
                }
                
                /* Leaflet Map Styles */
                .leaflet-container {
                  background-color: #1a1a2e;
                  font-family: inherit;
                }
                .dark .leaflet-container {
                  background-color: #0d0d18;
                }
                .leaflet-popup-content-wrapper {
                  background-color: rgba(31, 41, 55, 0.95);
                  color: #f3f4f6;
                  border-radius: 8px;
                }
                .leaflet-popup-tip {
                  background-color: rgba(31, 41, 55, 0.95);
                }
                .leaflet-control-zoom a {
                  background-color: rgba(31, 41, 55, 0.9);
                  color: #f3f4f6;
                  border: 1px solid rgba(75, 85, 99, 0.5);
                }
                .leaflet-control-zoom a:hover {
                  background-color: rgba(55, 65, 81, 0.9);
                }
                .leaflet-control-attribution {
                  background-color: rgba(17, 24, 39, 0.8);
                  color: #9ca3af;
                  font-size: 11px;
                }
            `}</style>
    </div>
  );
}