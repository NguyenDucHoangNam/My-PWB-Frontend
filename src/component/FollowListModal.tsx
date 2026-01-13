import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, Loader2, UserPlus } from "lucide-react";
import { followService, type FollowListResponse } from "../services/followService";
import { ROUTER } from "../routes/router";
import { navigateToPortfolio } from "../utils/portfolioUtils";

interface FollowListModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: number;
    type: "followers" | "following";
    currentUserId?: number; // ID of the currently logged-in user
}

export const FollowListModal = ({
    isOpen,
    onClose,
    userId,
    type,
    currentUserId,
}: FollowListModalProps) => {
    const navigate = useNavigate();
    const [data, setData] = useState<FollowListResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    const handleUserClick = async (targetUserId: number) => {
        onClose();
        // If clicking on own profile, navigate to personal portfolio page
        if (currentUserId && targetUserId === currentUserId) {
            navigate(ROUTER.USER.PORTFOLIO);
        } else {
            // Otherwise, navigate to the user's portfolio page (will try to use slug if available)
            await navigateToPortfolio(navigate, targetUserId);
        }
    };

    useEffect(() => {
        if (isOpen && userId) {
            loadData(0);
        } else {
            setData(null);
            setPage(0);
            setHasMore(true);
        }
    }, [isOpen, userId, type]);

    const loadData = async (pageNum: number) => {
        if (loading) return;
        setLoading(true);
        try {
            const result =
                type === "followers"
                    ? await followService.getFollowers(userId, pageNum, 20)
                    : await followService.getFollowing(userId, pageNum, 20);

            if (pageNum === 0) {
                setData(result);
            } else {
                setData((prev) => {
                    if (!prev) return result;
                    return {
                        ...result,
                        page: {
                            ...result.page,
                            content: [...prev.page.content, ...result.page.content],
                        },
                    };
                });
            }

            setHasMore(
                result.page.number < result.page.totalPages - 1
            );
        } catch (error) {
            console.error("Error loading follow list:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLoadMore = () => {
        if (!loading && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            loadData(nextPage);
        }
    };

    if (!isOpen) return null;

    const users = data?.page.content || [];
    const total = type === "followers" ? data?.totalFollowers || 0 : data?.totalFollowing || 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-gray-800/95 backdrop-blur-md rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col border border-purple-500/20 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-purple-500/20">
                    <h2 className="text-2xl font-bold text-white">
                        {type === "followers" ? "Người theo dõi" : "Đang theo dõi"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700/50 rounded-lg"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Total count */}
                <div className="px-6 py-3 border-b border-purple-500/10">
                    <p className="text-sm text-gray-400">
                        Tổng cộng: <span className="text-cyan-400 font-semibold">{total}</span>
                    </p>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-4">
                    {loading && page === 0 ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 size={32} className="animate-spin text-purple-400" />
                        </div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <UserPlus size={48} className="mx-auto mb-4 text-gray-600" />
                            <p>Chưa có {type === "followers" ? "người theo dõi" : "người nào được theo dõi"}</p>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-2">
                                {users.map((user) => (
                                    <div
                                        key={user.id}
                                        onClick={() => handleUserClick(user.id)}
                                        className="flex items-center gap-4 p-4 rounded-xl bg-gray-700/30 hover:bg-gray-700/50 transition-colors border border-gray-600/20 cursor-pointer"
                                    >
                                        <img
                                            src={user.avatarUrl || "https://i.pravatar.cc/200"}
                                            alt={user.fullName}
                                            className="w-12 h-12 rounded-full object-cover border-2 border-cyan-400/50"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-white truncate">
                                                {user.fullName}
                                            </p>
                                            {user.location && (
                                                <p className="text-sm text-gray-400 truncate">
                                                    {user.location}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {hasMore && (
                                <div className="mt-4 text-center">
                                    <button
                                        onClick={handleLoadMore}
                                        disabled={loading}
                                        className="px-4 py-2 bg-purple-600/60 hover:bg-purple-600/80 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 size={16} className="animate-spin" />
                                                Đang tải...
                                            </>
                                        ) : (
                                            "Tải thêm"
                                        )}
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

