import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import ekycService from "../../services/ekycService";
import userService, { SaveCccdInfoRequest } from "../../services/userService";

declare global {
    interface Window {
        ekycsdk: any;
    }
}

const decodeJWT = (token: string): any => {
    try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join("")
        );
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error("Error decoding JWT:", error);
        return null;
    }
};

const isTokenExpired = (token: string): boolean => {
    const decoded = decodeJWT(token);
    if (!decoded || !decoded.exp) return true;

    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
};

const normalizeString = (value?: string | null) =>
    (value ?? "").toString().trim().toLowerCase();

const isStatusSuccess = (section: any) => {
    if (!section) return true;

    if (
        typeof section.statusCode === "number" &&
        section.statusCode !== 200
    ) {
        return false;
    }

    const status = normalizeString(section.status);
    if (status && status !== "success" && status !== "ok") {
        return false;
    }

    if (Array.isArray(section.errors) && section.errors.length > 0) {
        return false;
    }

    return true;
};

const isLivenessSuccess = (section: any) => {
    if (!isStatusSuccess(section)) return false;
    const livenessValue =
        section?.liveness ?? section?.object?.liveness ?? section?.object?.liveness_status;
    if (!livenessValue) return true;
    const normalized = normalizeString(livenessValue);
    return ["success", "pass", "true"].includes(normalized);
};

const isMaskedSuccess = (section: any) => {
    if (!section) return true;
    const maskedValue = section?.object?.masked ?? section?.masked;
    return normalizeString(maskedValue) !== "yes";
};

const isOcrSuccess = (section: any) => isStatusSuccess(section);

const isOverallSuccess = (merged: any) =>
    isStatusSuccess(merged?.compare) &&
    isLivenessSuccess(merged?.liveness_card_back) &&
    isLivenessSuccess(merged?.liveness_card_front) &&
    isLivenessSuccess(merged?.liveness_face) &&
    isMaskedSuccess(merged?.masked) &&
    isOcrSuccess(merged?.ocr);

const extractCccdInfo = (merged: any): SaveCccdInfoRequest => {
    const ocrObject = merged?.ocr?.object || merged?.ocr?.result || {};

    return {
        cccdNumber: ocrObject.id || ocrObject.cccd_number || "",
        cccdFullName: ocrObject.name || ocrObject.full_name || "",
        cccdBirthDay: ocrObject.birth_day || ocrObject.date_of_birth || "",
        cccdGender: ocrObject.gender || "",
        cccdOriginLocation: ocrObject.origin_location || "",
        cccdRecentLocation: ocrObject.recent_location || "",
        cccdIssueDate: ocrObject.issue_date || "",
        cccdIssuePlace: ocrObject.issue_place || "",
    };
};

const Ekyc = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const isInitializedRef = useRef(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [flowCompleted, setFlowCompleted] = useState(false);
    const [cccdInfo, setCccdInfo] = useState<SaveCccdInfoRequest | null>(null);
    const [isSavingCccd, setIsSavingCccd] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (isInitializedRef.current) return;

        const VNPT_CDN = "https://ekyc-web.vnpt.vn";

        const loadDependencies = (): Promise<void> => {
            return new Promise((resolve) => {
                const dependencies = [
                    {
                        id: "lottie",
                        src: "https://cdnjs.cloudflare.com/ajax/libs/bodymovin/5.7.4/lottie.min.js",
                        check: () => (window as any).lottie,
                    },
                    {
                        id: "oval_model",
                        src: "https://ekyc-web.vnpt.vn/lib/VNPTBrowserSDKAppV3.1.2.js",
                        check: () => document.getElementById("oval_model"),
                    },
                    {
                        id: "jsQR",
                        src: "https://ekyc-web.vnpt.vn/lib/jsQR.js",
                        check: () => (window as any).jsQR,
                    },
                ];

                let loadedCount = 0;
                const totalDeps = dependencies.length;

                dependencies.forEach((dep) => {
                    if (dep.check()) {
                        loadedCount++;
                        if (loadedCount === totalDeps) resolve();
                        return;
                    }

                    const script = document.createElement("script");
                    script.id = dep.id;
                    script.src = dep.src;
                    script.async = true;
                    script.onload = () => {
                        loadedCount++;
                        if (loadedCount === totalDeps) resolve();
                    };
                    script.onerror = () => {
                        console.warn(`Không thể load ${dep.id}, tiếp tục...`);
                        loadedCount++;
                        if (loadedCount === totalDeps) resolve();
                    };
                    document.head.appendChild(script);
                });

                if (loadedCount === totalDeps) resolve();
            });
        };

        const checkSDKLoaded = (): Promise<void> => {
            return new Promise((resolve) => {
                if (window.ekycsdk) {
                    resolve();
                    return;
                }

                const existingStyles = document.getElementById("vnpt_ekyc_styles");
                if (!existingStyles) {
                    const vnpt_ekyc_styles = document.createElement("link");
                    vnpt_ekyc_styles.id = "vnpt_ekyc_styles";
                    vnpt_ekyc_styles.rel = "stylesheet";
                    vnpt_ekyc_styles.href = "/ekyc-web-sdk-2.1.4.6-stable.css";
                    document.head.appendChild(vnpt_ekyc_styles);
                }

                const existingScript = document.getElementById("vnpt_ekyc_sdk");
                if (existingScript) {
                    if (window.ekycsdk) {
                        resolve();
                    } else {
                        existingScript.addEventListener("load", () => resolve());
                    }
                } else {
                    const vnpt_ekyc_sdk = document.createElement("script");
                    vnpt_ekyc_sdk.id = "vnpt_ekyc_sdk";
                    vnpt_ekyc_sdk.src = "/ekyc-web-sdk-2.1.4.6-stable.js";
                    vnpt_ekyc_sdk.async = true;
                    vnpt_ekyc_sdk.defer = true;
                    vnpt_ekyc_sdk.onload = () => resolve();
                    vnpt_ekyc_sdk.onerror = () => {
                        console.error("Không thể load eKYC SDK script");
                        resolve();
                    };
                    document.head.appendChild(vnpt_ekyc_sdk);
                }
            });
        };

        const initSDK = async () => {
            try {
                setLoading(true);
                setError(null);

                await loadDependencies();
                await checkSDKLoaded();
                await new Promise((resolve) => setTimeout(resolve, 500));

                if (!window.ekycsdk) {
                    console.error("eKYC SDK không được load");
                    setError("Không thể tải eKYC SDK. Vui lòng tải lại trang.");
                    setLoading(false);
                    return;
                }

                let authorizationToken: string;
                const tokenKey = "MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBANoEaqB3bjukNbzH6rt7qmYs6nIhIXb7oSMvtIS9tKfTV8iQ/fNlRU+gTSmo/7w+Nik2syqA83xH6XyKJhDfmcECAwEAAQ==";
                const tokenId = "4432dfcb-6655-7cbb-e063-63199f0a456c";

                try {
                    authorizationToken = await ekycService.getToken();
                } catch (error: any) {
                    console.error("Không thể lấy token từ backend:", error);
                    setError("Không thể lấy token eKYC từ server. Vui lòng thử lại sau.");
                    setLoading(false);
                    return;
                }

                if (isTokenExpired(authorizationToken)) {
                    console.error("Token eKYC đã hết hạn!");
                    setError("Token eKYC đã hết hạn. Vui lòng liên hệ quản trị viên để cập nhật token mới.");
                    setLoading(false);
                    return;
                }

                const initObj = {
                    VERSION: "2.1.4.4",
                    BASE_CDN: VNPT_CDN,
                    BACKEND_URL: "https://api.idg.vnpt.vn/",
                    TOKEN_KEY: tokenKey,
                    TOKEN_ID: tokenId,
                    AUTHORIZION: authorizationToken,
                    PARRENT_ID: "ekyc_sdk_intergrated",
                    FLOW_TYPE: "DOCUMENT",
                    SHOW_HELP: false,
                    SHOW_TRADEMARK: false,
                    CHECK_LIVENESS_CARD: true,
                    CHECK_LIVENESS_FACE: true,
                    CHECK_MASKED_FACE: true,
                    COMPARE_FACE: true,
                    LANGUAGE: "vi",
                    LIST_ITEM: [-1],
                    TYPE_DOCUMENT: -1,
                    USE_WEBCAM: true,
                    USE_UPLOAD: true,
                    ADVANCE_LIVENESS_FACE: true,
                    ASYNC_LOAD_AI: false,
                    LIST_CHOOSE_STYLE: {
                        text_color: "white",
                        item_active_color: "#18D696",
                        background_icon: "#18D696",
                        id_icon: VNPT_CDN + "/images/si/id_card.svg",
                        passport_icon: VNPT_CDN + "/images/si/passport.svg",
                        drivecard_icon: VNPT_CDN + "/images/si/drivecard.svg",
                        army_id_icon: VNPT_CDN + "/images/si/other_doc.svg",
                        id_chip_icon: VNPT_CDN + "/images/si/id_chip.svg",
                        start_button_background: "#18D696",
                        start_button_color: "#111127",
                    },
                    CAPTURE_IMAGE_STYLE: {
                        big_title_color: "white",
                        description1_color: "white",
                        capture_btn_background: "#18D696",
                        capture_btn_color: "#000000",
                        capture_btn_icon: VNPT_CDN + "/images/hdbank2/capture.svg",
                        tutorial_btn_icon: VNPT_CDN + "/images/hdbank/help.gif",
                        upload_btn_background: "white",
                        upload_btn_color: "#000000",
                        upload_btn_boder: "2px solid #18d696",
                        upload_btn_icon: VNPT_CDN + "/images/altiss/upload.svg",
                        recapture_btn_background: "#18D696",
                        recapture_btn_color: "#fff",
                        recapture_btn_border: "2px solid #18D696",
                        recapture_btn_icon: VNPT_CDN + "/images/hdbank2/capture.svg",
                        nextstep_btn_background: "#18D696",
                        nextstep_btn_color: "black",
                        nextstep_btn_icon: VNPT_CDN + "/images/hdbank2/next_icon.svg",
                        capture_and_upload_wrapper_bg: "rgba(23, 24, 28, 0.7);",
                        capture_and_upload_wrapper_bg_img: VNPT_CDN + "/altiss/bg-img.svg",
                    },
                    MODAL_DOC_STYLE: {
                        touch_icon: VNPT_CDN + "/altiss/touch_cmt.svg",
                        close_icon: VNPT_CDN + "/altiss/close_icon.svg",
                        notice1_icon: VNPT_CDN + "/altiss/cmt_notice1.svg",
                        notice2_icon: VNPT_CDN + "/altiss/cmt_notice2.svg",
                        notice3_icon: VNPT_CDN + "/altiss/cmt_notice3.svg",
                    },
                    MODAL_FACE_STYLE: {
                        face_icon: VNPT_CDN + "/altiss/face_icon.svg",
                        close_icon: VNPT_CDN + "/altiss/close_icon.svg",
                        notice1_icon: VNPT_CDN + "/altiss/cmt_notice1.svg",
                        notice2_icon: VNPT_CDN + "/altiss/cmt_notice2.svg",
                        notice3_icon: VNPT_CDN + "/altiss/cmt_notice3.svg",
                    },
                    OTHER_CONFIG: {
                        loading_icon: VNPT_CDN + "/images/hdbank2/loading.gif",
                        loading_styles: "background-color: #000000; opacity: 0.7",
                        oval_web: VNPT_CDN + "/animation/web_oval.json",
                        oval_mobile: VNPT_CDN + "/kbsv/mobile_border.json",
                        notice_ani: VNPT_CDN + "/animation/caution.json",
                        oval_title_color: "white",
                        description_oval_content: "Vui lòng tháo kính để xác thực chính xác hơn!",
                        description_oval: "text-align: center; color: white; font-weight: bold",
                        video_tutorial_oval: VNPT_CDN + "/animation/video_tutorial_oval_dark.mp4",
                    },
                };

                const call_after_end_flow = (data: any) => {
                    console.log("Document flow completed:", data);

                    const vnpt_ekyc = document.getElementById("vnpt_ekyc");
                    if (vnpt_ekyc && vnpt_ekyc.parentNode) {
                        vnpt_ekyc.parentNode.removeChild(vnpt_ekyc);
                    }

                    window.ekycsdk.init(
                        {
                            ...initObj,
                            FLOW_TYPE: "FACE",
                            TYPE_DOCUMENT: data.type_document,
                            client_session: data.client_session,
                        },
                        (res2: any) => {
                            const merged = { ...data, ...res2 };
                            console.log("Merged result:", merged);

                            if (window.ekycsdk.viewResult) {
                                window.ekycsdk.viewResult(data.type_document, merged);
                            }

                            const success = isOverallSuccess(merged);
                            setFlowCompleted(success);

                            if (!success) {
                                console.warn(
                                    "Kết quả xác thực chưa đạt yêu cầu, vui lòng thực hiện lại."
                                );
                                setCccdInfo(null);
                            } else {
                                setCccdInfo(extractCccdInfo(merged));
                            }
                        }
                    );
                };

                const containerElement = document.getElementById("ekyc_sdk_intergrated");
                if (!containerElement) {
                    console.error("Không tìm thấy element #ekyc_sdk_intergrated trong DOM");
                    setError("Không tìm thấy container element. Vui lòng tải lại trang.");
                    setLoading(false);
                    return;
                }

                await new Promise((resolve) => setTimeout(resolve, 200));

                try {
                    window.ekycsdk.init(
                        initObj,
                        (res: any) => {
                            console.log("Document step result:", res);
                        },
                        call_after_end_flow
                    );

                    isInitializedRef.current = true;
                    setLoading(false);
                } catch (initError) {
                    console.error("Lỗi khi gọi ekycsdk.init:", initError);
                    throw initError;
                }
            } catch (error: any) {
                console.error("Lỗi khi khởi tạo eKYC SDK:", error);
                const errorMessage = error?.message || error?.toString() || "Có lỗi xảy ra khi khởi tạo eKYC SDK. Vui lòng thử lại.";
                setError(errorMessage);
                setLoading(false);
            }
        };

        initSDK();

        return () => {
            isInitializedRef.current = false;
            setFlowCompleted(false);
            setCccdInfo(null);
            setIsSavingCccd(false);

            const vnpt_ekyc = document.getElementById("vnpt_ekyc");
            if (vnpt_ekyc && vnpt_ekyc.parentNode) {
                vnpt_ekyc.parentNode.removeChild(vnpt_ekyc);
            }
        };
    }, []);

    const handleFinish = async () => {
        if (!cccdInfo) {
            toast.error("Không có dữ liệu CCCD để lưu. Vui lòng xác thực lại.");
            return;
        }

        try {
            setIsSavingCccd(true);
            await userService.saveCccdInfo(cccdInfo);
            toast.success("Lưu thông tin CCCD thành công!");
            navigate("/userProfile");
        } catch (err: any) {
            const message = err?.message || "Không thể lưu thông tin CCCD, vui lòng thử lại.";
            toast.error(message);
        } finally {
            setIsSavingCccd(false);
        }
    };

    return (
        <div
            ref={containerRef}
            style={{
                minHeight: "100vh",
                background: "#112e40",
                position: "relative",
                paddingBottom: "80px",
            }}
        >
            <div id="ekyc_sdk_intergrated" style={{ display: error ? "none" : "block" }}></div>

            {flowCompleted && !loading && !error && cccdInfo && (
                <div
                    style={{
                        width: "100%",
                        display: "flex",
                        justifyContent: "center",
                        position: "absolute",
                        bottom: "20px",
                        left: 0,
                        pointerEvents: "none",
                    }}
                >
                    <button
                        onClick={handleFinish}
                        style={{
                            padding: "12px 28px",
                            borderRadius: "999px",
                            border: "none",
                            background: "linear-gradient(120deg,#2af598,#009efd)",
                            color: "#02101d",
                            fontWeight: 600,
                            fontSize: "15px",
                            boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
                            cursor: "pointer",
                            pointerEvents: "auto",
                            opacity: isSavingCccd ? 0.7 : 1,
                        }}
                        disabled={isSavingCccd}
                    >
                        {isSavingCccd ? "Đang lưu..." : "Hoàn tất & trở về hồ sơ"}
                    </button>
                </div>
            )}

            {loading && (
                <div
                    style={{
                        padding: "20px",
                        color: "#18D696",
                        textAlign: "center",
                        background: "#fff",
                        margin: "20px",
                        borderRadius: "8px",
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        zIndex: 1000,
                    }}
                >
                    <h3>Đang khởi tạo eKYC...</h3>
                    <p>Vui lòng đợi trong giây lát</p>
                </div>
            )}

            {error && (
                <div
                    style={{
                        padding: "20px",
                        color: "#ff6b6b",
                        textAlign: "center",
                        background: "#fff",
                        margin: "20px",
                        borderRadius: "8px",
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        zIndex: 1000,
                    }}
                >
                    <h3>Lỗi khởi tạo eKYC</h3>
                    <p>{error}</p>
                </div>
            )}
        </div>
    );
};

export default Ekyc;
