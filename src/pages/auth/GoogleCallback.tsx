import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";
import LoadingPage from "../../component/loading/LoadingPage";

const GoogleCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { handleGoogleCallback } = useAuth();
    const [isProcessing, setIsProcessing] = useState(true);

    useEffect(() => {
        const processGoogleCallback = async () => {
            const code = searchParams.get("code");
            const error = searchParams.get("error");

            if (error) {
                toast.error("Đăng nhập Google bị hủy hoặc có lỗi xảy ra", {
                    style: {
                        borderRadius: "12px",
                        background: "#1E1E2F",
                        color: "#fff",
                        padding: "12px 16px",
                    },
                });
                navigate("/login");
                return;
            }

            if (!code) {
                toast.error("Không nhận được mã xác thực từ Google", {
                    style: {
                        borderRadius: "12px",
                        background: "#1E1E2F",
                        color: "#fff",
                        padding: "12px 16px",
                    },
                });
                navigate("/login");
                return;
            }

            try {
                const result = await handleGoogleCallback(code);

                if (result.success) {
                    toast.success("🎉 Đăng nhập Google thành công! Chào mừng bạn 👋", {
                        style: {
                            borderRadius: "12px",
                            background: "#1E1E2F",
                            color: "#fff",
                            padding: "12px 16px",
                        },
                        iconTheme: {
                            primary: "#8b5cf6",
                            secondary: "#fff",
                        },
                    });
                    // Redirect admin to dashboardAdmin
                    if (result.role === "ADMIN") {
                        navigate("/dashboardAdmin");
                    } else {
                        navigate("/");
                    }
                } else {
                    toast.error(result.message || "Đăng nhập Google thất bại", {
                        style: {
                            borderRadius: "12px",
                            background: "#1E1E2F",
                            color: "#fff",
                            padding: "12px 16px",
                        },
                    });
                    navigate("/login");
                }
            } catch (error) {
                console.error("Google callback error:", error);
                toast.error("Có lỗi xảy ra trong quá trình đăng nhập", {
                    style: {
                        borderRadius: "12px",
                        background: "#1E1E2F",
                        color: "#fff",
                        padding: "12px 16px",
                    },
                });
                navigate("/login");
            } finally {
                setIsProcessing(false);
            }
        };

        processGoogleCallback();
    }, [searchParams, navigate]);

    if (isProcessing) {
        return <LoadingPage />;
    }

    return null;
};

export default GoogleCallback;
