import { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { Sparkles, FileText, TimerReset, X, Rocket, Satellite, Star, Info, Plus, ArrowLeft, Loader2 } from "lucide-react";
import contractService, {
  type AddendumFillBody,
  type AddendumMilestoneItem,
  type ContractMetadata,
} from "../../../services/contractService";
import projectService from "../../../services/projectService";
import milestoneService, { type MilestoneResponse } from "../../../services/milestoneService";
import { type ProjectPermissionResponse } from "../../../types/permission";
import { ROUTER } from "../../../routes/router";
import toast from "react-hot-toast";
import defaultAddendumFullPdf from "../../../assets/pdf/phu-luc-hop-dong-san-xuat-am-nhac.pdf";
import defaultAddendumMilestonePdf from "../../../assets/pdf/phu-luc-hop-dong-san-xuat-am-nhac-milestone.pdf";
import { useCosmicToast } from "../../../component/toast/CosmicToastProvider";
import AnimatedBackground from "@/component/background/AnimatedBackground";

type PaymentMode = "FULL" | "MILESTONE";

export default function CreateAddendumPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const projectId = params.get("id");
  const contractIdParam = params.get("contractId");

  // Generate random positions for stars (memoized to avoid re-renders)
  const starPositions = useMemo(() => 
    Array.from({ length: 8 }, () => ({
      left: 10 + Math.random() * 80,
      top: 10 + Math.random() * 80,
      size: 8 + Math.random() * 8,
      delay: Math.random() * 2,
      duration: 3 + Math.random() * 2,
      moveX: Math.random() * 100 - 50,
      moveY: Math.random() * 100 - 50,
    }))
  , []);

  const [loading, setLoading] = useState(false);
  const [metadata, setMetadata] = useState<ContractMetadata | null>(null);
  const [permissions, setPermissions] = useState<ProjectPermissionResponse | null>(null);
  const [paymentMode, setPaymentMode] = useState<PaymentMode | null>(null);
  const [contractId, setContractId] = useState<number | null>(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [availableMilestones, setAvailableMilestones] = useState<MilestoneResponse[]>([]);
  const [loadingMilestones, setLoadingMilestones] = useState(false);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<MilestoneResponse | null>(null);
  const [showNewMilestoneForm, setShowNewMilestoneForm] = useState(false);
  const { showToast } = useCosmicToast();
  const pdfRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  // Helper: parse currency-like string to number
  const parseCurrencyToNumber = (value: string | number | undefined): number => {
    if (value === undefined || value === null) return 0;
    if (typeof value === "number") return value;
    const cleaned = String(value).replace(/[^0-9.-]/g, "");
    const num = Number(cleaned);
    return Number.isFinite(num) ? num : 0;
  };

  const [form, setForm] = useState<any>({
    addendumNo: "",
    signDate: "",
    signPlace: "",
    title: "",
    effectiveDate: "",
    additional: "",
    // FULL payment type
    numofmoney: "",
    numofedit: "",
    numofrefresh: "",
    // MILESTONE payment type
    milestones: [],
  });

  // State for new milestone form
  const [newMilestoneForm, setNewMilestoneForm] = useState({
    title: "",
    description: "",
    numOfMoney: "",
    numOfEdit: "",
    numOfRefresh: "",
  });

  // State for selected milestone form (when adding existing milestone)
  const [selectedMilestoneForm, setSelectedMilestoneForm] = useState({
    numOfMoney: "",
    numOfEdit: "",
    numOfRefresh: "",
  });

  // Track touched status for required fields
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Additional contents: each line is one item
  const [additionalItems, setAdditionalItems] = useState<string[]>([""]);

  const markTouched = (key: string) =>
    setTouched((t) => ({ ...t, [key]: true }));

  // Tổng tiền milestones
  const totalMilestonesAmount = useMemo(() => {
    if (paymentMode !== "MILESTONE") return 0;
    const milestones = (form.milestones || []) as Array<any>;
    return milestones.reduce((sum: number, m: any) => {
      const amount = parseCurrencyToNumber(m?.numOfMoney);
      return sum + amount;
    }, 0);
  }, [paymentMode, form?.milestones]);

  // Validation summary message
  const validationMessage = useMemo(() => {
    const missing: string[] = [];
    const invalid: string[] = [];

    // Core required
    if (!form.addendumNo || String(form.addendumNo).trim() === "") missing.push("Số phụ lục");
    if (!form.signDate || String(form.signDate).trim() === "") missing.push("Ngày ký");
    else {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(String(form.signDate))) invalid.push("Ngày ký phải đúng định dạng yyyy-MM-dd");
    }
    if (!form.title || String(form.title).trim() === "") missing.push("Tiêu đề phụ lục");

    // Payment type specific validations
    if (paymentMode === "FULL") {
      const money = parseCurrencyToNumber(form.numofmoney);
      if (!form.numofmoney || money <= 0) {
        missing.push("Số tiền (phải > 0)");
      }
    } else if (paymentMode === "MILESTONE") {
      const milestones = (form.milestones || []) as Array<any>;
      if (milestones.length === 0) {
        missing.push("Phải có ít nhất 1 milestone");
      } else {
        for (let i = 0; i < milestones.length; i++) {
          const m = milestones[i];
          if (m.milestoneId === null || m.milestoneId === undefined) {
            // New milestone - require title and numOfMoney
            if (!m.title || String(m.title).trim() === "") {
              missing.push(`Milestone ${i + 1}: Tiêu đề`);
            }
            const money = parseCurrencyToNumber(m.numOfMoney);
            if (!m.numOfMoney || money <= 0) {
              missing.push(`Milestone ${i + 1}: Số tiền (phải > 0)`);
            }
          }
        }
      }
    }

    if (missing.length > 0 || invalid.length > 0) {
      return "Vui lòng điền hết thông tin bắt buộc";
    }

    return "";
  }, [form, paymentMode]);

  useEffect(() => {
    return () => {
      if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl);
    };
  }, [pdfBlobUrl]);

  // Load permissions and contract metadata
  useEffect(() => {
    const loadData = async () => {
      if (!projectId) return;

      try {
        // Load permissions
        const perms = await projectService.getProjectPermissionByProjectId(projectId);
        setPermissions(perms);

        // Load contract metadata
        const meta = await contractService.getContractMetadata(projectId);
        if (meta) {
          setMetadata(meta);
          setContractId(meta.id);
        }

        // Load project details to get payment type
        const projectIdNum = Number(projectId);
        if (isNaN(projectIdNum)) return;
        const projectDetails = await projectService.getProjectDetails(projectIdNum);
        const paymentType = projectDetails?.paymentType?.toUpperCase();
        if (paymentType === "FULL" || paymentType === "MILESTONE") {
          setPaymentMode(paymentType as PaymentMode);
        }
      } catch (error: any) {
        toast.error(error.message || "Không thể tải thông tin");
      }
    };

    loadData();
  }, [projectId]);

  // Load milestones when payment mode is MILESTONE
  useEffect(() => {
    const loadMilestones = async () => {
      if (!projectId || paymentMode !== "MILESTONE") return;

      const projectIdNum = Number(projectId);
      if (isNaN(projectIdNum)) return;

      try {
        setLoadingMilestones(true);
        const milestones = await milestoneService.getMilestones(projectIdNum);
        setAvailableMilestones(milestones);
      } catch (error: any) {
        console.error("Error loading milestones:", error);
        toast.error(error.message || "Không thể tải danh sách cột mốc");
      } finally {
        setLoadingMilestones(false);
      }
    };

    loadMilestones();
  }, [projectId, paymentMode]);

  // Use contractId from params if available
  useEffect(() => {
    if (contractIdParam) {
      const id = parseInt(contractIdParam);
      if (!isNaN(id)) {
        setContractId(id);
      }
    }
  }, [contractIdParam]);

  useEffect(() => {
    const loadPdfBlob = async () => {
      if (metadata?.documentUrl) {
        try {
          const response = await fetch(metadata.documentUrl);
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          setPdfBlobUrl(url);
        } catch (error) {
          console.error("Không thể tải file PDF:", error);
          toast.error("Không thể tải file PDF");
        }
      }
    };

    loadPdfBlob();

    return () => {
      if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl);
    };
  }, [metadata?.documentUrl]);

  const canCreate = useMemo(
    () =>
      permissions?.contract.canCreateContract &&
      contractId !== null &&
      paymentMode !== null,
    [permissions, contractId, paymentMode]
  );

  // Handle adding existing milestone
  const handleAddExistingMilestone = (milestone: MilestoneResponse) => {
    setSelectedMilestone(milestone);
    setSelectedMilestoneForm({
      numOfMoney: milestone.amount?.toString() || "",
      numOfEdit: milestone.editCount?.toString() || "",
      numOfRefresh: "0",
    });
    setShowMilestoneModal(true);
  };

  // Handle confirm adding existing milestone
  const handleConfirmAddMilestone = () => {
    if (!selectedMilestone) return;

    const money = parseCurrencyToNumber(selectedMilestoneForm.numOfMoney);
    if (!selectedMilestoneForm.numOfMoney || money <= 0) {
      toast.error("Số tiền phải > 0");
      return;
    }

    const milestoneItem: any = {
      milestoneId: selectedMilestone.id,
      title: null,
      numOfMoney: null,
    };

    if (selectedMilestoneForm.numOfEdit) {
      const edits = Number(selectedMilestoneForm.numOfEdit);
      if (Number.isInteger(edits) && edits > 0) {
        milestoneItem.numOfEdit = edits;
      }
    }

    if (selectedMilestoneForm.numOfRefresh) {
      const refresh = Number(selectedMilestoneForm.numOfRefresh);
      if (Number.isInteger(refresh) && refresh >= 0) {
        milestoneItem.numOfRefresh = refresh;
      }
    }

    setForm((f: any) => ({
      ...f,
      milestones: [...f.milestones, milestoneItem],
    }));

    setShowMilestoneModal(false);
    setSelectedMilestone(null);
    setSelectedMilestoneForm({
      numOfMoney: "",
      numOfEdit: "",
      numOfRefresh: "",
    });
    showToast("Đã thêm milestone vào phụ lục", "success");
  };

  // Handle create new milestone
  const handleCreateNewMilestone = () => {
    const money = parseCurrencyToNumber(newMilestoneForm.numOfMoney);
    if (!newMilestoneForm.title || newMilestoneForm.title.trim() === "") {
      toast.error("Tiêu đề milestone là bắt buộc");
      return;
    }
    if (!newMilestoneForm.numOfMoney || money <= 0) {
      toast.error("Số tiền phải > 0");
      return;
    }

    const milestoneItem: any = {
      milestoneId: null,
      title: newMilestoneForm.title,
      description: newMilestoneForm.description || undefined,
      numOfMoney: money,
    };

    if (newMilestoneForm.numOfEdit) {
      const edits = Number(newMilestoneForm.numOfEdit);
      if (Number.isInteger(edits) && edits > 0) {
        milestoneItem.numOfEdit = edits;
      }
    }

    if (newMilestoneForm.numOfRefresh) {
      const refresh = Number(newMilestoneForm.numOfRefresh);
      if (Number.isInteger(refresh) && refresh >= 0) {
        milestoneItem.numOfRefresh = refresh;
      }
    }

    setForm((f: any) => ({
      ...f,
      milestones: [...f.milestones, milestoneItem],
    }));

    setShowNewMilestoneForm(false);
    setNewMilestoneForm({
      title: "",
      description: "",
      numOfMoney: "",
      numOfEdit: "",
      numOfRefresh: "",
    });
    showToast("Đã thêm milestone mới vào phụ lục", "success");
  };

  async function onFill() {
    if (!contractId) {
      toast.error("Không tìm thấy contract ID");
      return;
    }

    if (!paymentMode) {
      toast.error("Không xác định được phương thức thanh toán");
      return;
    }

    const missingFields: string[] = [];
    const invalidFields: string[] = [];

    // Basic validations
    if (!form.addendumNo || form.addendumNo.trim() === "") {
      missingFields.push("Số phụ lục");
    }

    if (!form.signDate || form.signDate.trim() === "") {
      missingFields.push("Ngày ký");
    } else {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(form.signDate)) {
        invalidFields.push("Ngày ký phải đúng định dạng yyyy-MM-dd");
      }
    }

    if (!form.title || form.title.trim() === "") {
      missingFields.push("Tiêu đề phụ lục");
    }

    // Payment type specific validations
    if (paymentMode === "FULL") {
      const money = parseCurrencyToNumber(form.numofmoney);
      if (!form.numofmoney || money <= 0) {
        missingFields.push("Số tiền (phải > 0)");
      }
    } else if (paymentMode === "MILESTONE") {
      const milestones = (form.milestones || []) as Array<any>;
      if (milestones.length === 0) {
        missingFields.push("Phải có ít nhất 1 milestone");
      } else {
        for (let i = 0; i < milestones.length; i++) {
          const m = milestones[i];
          if (m.milestoneId === null || m.milestoneId === undefined) {
            if (!m.title || String(m.title).trim() === "") {
              missingFields.push(`Milestone ${i + 1}: Tiêu đề`);
            }
            const money = parseCurrencyToNumber(m.numOfMoney);
            if (!m.numOfMoney || money <= 0) {
              missingFields.push(`Milestone ${i + 1}: Số tiền (phải > 0)`);
            }
          }
        }
      }
    }

    if (missingFields.length > 0 || invalidFields.length > 0) {
      const allErrors = [
        ...(missingFields.length > 0 ? [`Thiếu trường bắt buộc: ${missingFields.join(", ")}`] : []),
        ...invalidFields
      ];
      toast.error(allErrors.join(". "));
      return;
    }

    setLoading(true);
    try {
      // Build request body
      const additionalText = additionalItems
        .map((item) => item.trim())
        .filter(Boolean)
        .join("\n");

      const body: AddendumFillBody = {
        addendumNo: form.addendumNo,
        signDate: form.signDate,
        signPlace: form.signPlace || undefined,
        title: form.title,
        effectiveDate: form.effectiveDate || undefined,
        additional: additionalText || undefined,
      };

      if (paymentMode === "FULL") {
        body.numofmoney = parseCurrencyToNumber(form.numofmoney);
        if (form.numofedit) {
          const edits = Number(form.numofedit);
          if (Number.isInteger(edits) && edits > 0) {
            body.numofedit = edits;
          }
        }
        if (form.numofrefresh) {
          const refresh = Number(form.numofrefresh);
          if (Number.isInteger(refresh) && refresh >= 0) {
            body.numofrefresh = refresh;
          }
        }
      } else if (paymentMode === "MILESTONE") {
        body.milestones = (form.milestones || []).map((m: any) => {
          const milestone: AddendumMilestoneItem = {};
          
          if (m.milestoneId !== null && m.milestoneId !== undefined) {
            // Update existing milestone
            milestone.milestoneId = Number(m.milestoneId);
          } else {
            // New milestone
            milestone.title = m.title;
            milestone.description = m.description || undefined;
            milestone.numOfMoney = parseCurrencyToNumber(m.numOfMoney);
            if (m.numOfEdit) {
              const edits = Number(m.numOfEdit);
              if (Number.isInteger(edits) && edits > 0) {
                milestone.numOfEdit = edits;
              }
            }
            if (m.numOfRefresh) {
              const refresh = Number(m.numOfRefresh);
              if (Number.isInteger(refresh) && refresh >= 0) {
                milestone.numOfRefresh = refresh;
              }
            }
          }
          
          return milestone;
        });
      }

      // Call API
      const blob = await contractService.fillAddendum(contractId, body);
      const url = URL.createObjectURL(blob);
      if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl);
      setPdfBlobUrl(url);
      
      // Open PDF in new tab
      window.open(url, "_blank", "noopener,noreferrer");
      // Cleanup after 60 seconds
      setTimeout(() => URL.revokeObjectURL(url), 60_000);

      showToast("🎉 Phụ lục đã được tạo thành công!", "success");

      // Reload metadata
      if (projectId) {
        const meta = await contractService.getContractMetadata(projectId);
        setMetadata(meta);
      }

      // Điều hướng đến Trạm Phụ Lục của đúng số phụ lục vừa tạo (dựa trên addendumNo)
      const addendumNumber = Number(form.addendumNo);
      const addendumNumberQuery =
        !Number.isNaN(addendumNumber) && addendumNumber > 0
          ? `&addendumNumber=${addendumNumber}`
          : "";

      setTimeout(() => {
        navigate(
          `${ROUTER.USER.ADDENDUM_SPACE}?id=${projectId}&contractId=${contractId}${addendumNumberQuery}`
        );
      }, 1200);
    } catch (e: any) {
      console.error("Fill addendum error:", e);
      toast.error(e.message || "Không thể tạo phụ lục");
    } finally {
      setLoading(false);
    }
  }

  const handleScroll = () => {
    if (!formRef.current || !pdfRef.current) return;

    const left = formRef.current;
    const right = pdfRef.current;

    const scrollPercent =
      left.scrollTop / (left.scrollHeight - left.clientHeight);

    right.scrollTop = scrollPercent * (right.scrollHeight - right.clientHeight);
  };

  return (
    <div className="relative min-h-screen text-white overflow-hidden mt-[73px]">
      <AnimatedBackground />
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.08) 0, transparent 40%), radial-gradient(circle at 80% 30%, rgba(255,255,255,0.06) 0, transparent 35%)",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(transparent 0, rgba(0,0,0,0.8) 80%, #000 100%)",
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10 p-6">
        <header className="relative flex items-center justify-center mb-8 text-center">
          {/* Floating stars background */}
          <div className="absolute inset-0 pointer-events-none">
            {starPositions.map((star, i) => (
              <div
                key={`star-${i}`}
                className="absolute"
                style={{
                  left: `${star.left}%`,
                  top: `${star.top}%`,
                }}
              >
                <Star
                  size={star.size}
                  className="text-yellow-400/60 fill-yellow-400/20"
                />
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 relative z-10">
            {/* Icon container */}
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/50 to-purple-500/50 blur-xl" />
              <div className="relative p-4 rounded-2xl bg-gradient-to-br from-indigo-500/40 via-purple-500/40 to-pink-500/40 border border-white/20 backdrop-blur-sm shadow-[0_0_30px_rgba(139,92,246,0.5)]">
                <FileText className="text-indigo-200 w-8 h-8" />
                {[...Array(3)].map((_, i) => (
                  <div
                    key={`sparkle-${i}`}
                    className="absolute"
                    style={{
                      left: `${i * 40 - 20}%`,
                      top: `${i * 30 - 15}%`,
                    }}
                  >
                    <Sparkles
                      size={12}
                      className="text-yellow-400/80"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Title */}
            <div className="relative">
              <h1 className="text-4xl md:text-5xl font-extrabold relative">
                <span className="relative z-10 bg-gradient-to-r from-cyan-300 via-indigo-300 to-purple-300 bg-clip-text text-transparent">
                  Tạo Phụ Lục Hợp Đồng
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-indigo-500/20 to-purple-500/20 blur-2xl" />
              </h1>
              <p className="text-indigo-200/80 text-base md:text-lg mt-3 flex items-center gap-2">
                <Satellite size={16} className="text-cyan-400" />
                <span className="bg-gradient-to-r from-indigo-200/90 to-purple-200/90 bg-clip-text text-transparent">
                  Soạn thảo phụ lục mới cho hợp đồng của bạn.
                </span>
              </p>
            </div>
          </div>

          {/* Back button */}
          <div className="absolute right-6 top-1/2 -translate-y-1/2 z-10">
            <button
              aria-label="Quay lại Danh sách Phụ lục"
              className="relative overflow-hidden group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 border border-white/15 hover:bg-white/15 transition-all"
              onClick={() =>
                navigate(`${ROUTER.USER.ADDENDUM_LIST}?id=${projectId || ""}`)
              }
            >
              <span className="relative z-10 inline-flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500/40 to-purple-500/40 border border-white/20">
                <ArrowLeft className="w-3.5 h-3.5 text-indigo-100" />
              </span>
              <span className="relative z-10 text-xs">Quay lại Danh sách Phụ lục</span>
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          {/* Permission check */}
          {permissions && !permissions.contract.canCreateContract && (
            <div className="lg:col-span-12">
              <div className="dashboard-card border-red-500/50 bg-red-500/10">
                <div className="flex items-center gap-3">
                  <div className="text-red-400 text-2xl">⚠️</div>
                  <div>
                    <h3 className="text-red-300 font-semibold">
                      Không có quyền tạo phụ lục
                    </h3>
                    <p className="text-red-200/80 text-sm">
                      {permissions.reason ||
                        "Bạn không có quyền tạo phụ lục cho hợp đồng này."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!paymentMode && (
            <div className="lg:col-span-12">
              <div className="dashboard-card border-yellow-500/50 bg-yellow-500/10">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-6 h-6 text-yellow-400 animate-spin" />
                  <p className="text-yellow-200/80 text-sm">
                    Đang tải thông tin hợp đồng...
                  </p>
                </div>
              </div>
            </div>
          )}

          {permissions?.contract.canCreateContract && paymentMode && (
            <>
              {/* Left side - Form content */}
              <section
                ref={formRef}
                onScroll={handleScroll}
                className="lg:col-span-7 space-y-6 overflow-y-auto h-[80vh] hide-scrollbar"
              >
                <div className="space-y-6">
                  {/* Section 1: Thông tin cơ bản phụ lục */}
                  <div className="dashboard-card border-cyan-500/20">
                    <div className="card-header mb-4">
                      <div className="inline-flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 w-full">
                        <Rocket className="icon text-cyan-300 w-5 h-5" />
                        <span className="text-cyan-100 font-semibold text-base md:text-lg">Thông tin Phụ lục Cơ bản</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        ["addendumNo", "Số phụ lục", true],
                        ["signDate", "Ngày ký", true],
                        ["signPlace", "Nơi ký", false],
                        ["title", "Tiêu đề phụ lục", true],
                        ["effectiveDate", "Ngày hiệu lực", false],
                      ].map(([k, label, required]) => {
                        const isDateField = k === "signDate" || k === "effectiveDate";
                        const labelText = String(label);
                        return (
                          <label key={k as string} className={`flex flex-col gap-1.5 ${k === "title" ? "md:col-span-2" : ""}`}>
                            <span className="text-indigo-200/90 text-sm font-medium flex items-center gap-1">
                              {labelText}
                              {required && <span className="text-red-400">*</span>}
                            </span>
                            {k === "title" ? (
                              <input
                                type="text"
                                className={`bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all ${
                                  required ? "border-cyan-400/30" : ""
                                }`}
                                placeholder={`Nhập ${labelText.toLowerCase()}...`}
                                value={form[k as string] || ""}
                                onChange={(e) =>
                                  setForm((f: any) => ({
                                    ...f,
                                    [k as string]: e.target.value,
                                  }))
                                }
                                onBlur={() => markTouched(k as string)}
                              />
                            ) : (
                              <input
                                type={isDateField ? "date" : "text"}
                                className={`bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all ${
                                  isDateField ? "[color-scheme:dark] [&::-webkit-calendar-picker-indicator]:invert" : ""
                                } ${required ? "border-cyan-400/30" : ""}`}
                                placeholder={isDateField ? "" : `Nhập ${labelText.toLowerCase()}...`}
                                value={form[k as string] || ""}
                                onChange={(e) =>
                                  setForm((f: any) => ({
                                    ...f,
                                    [k as string]: e.target.value,
                                  }))
                                }
                                onBlur={() => markTouched(k as string)}
                              />
                            )}
                            {required && touched[k as string] && (!form[k as string] || String(form[k as string]).trim() === "") && (
                              <span className="text-red-400 text-xs mt-1">Trường này bắt buộc</span>
                            )}
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Section 2: Phương thức thanh toán */}
                  <div className="dashboard-card border-indigo-500/20">
                    <div className="card-header mb-4">
                      <div className="inline-flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-400/30 w-full">
                        <TimerReset className="icon text-indigo-300 w-5 h-5" />
                        <span className="text-indigo-100 font-semibold text-base md:text-lg">
                          Phương Thức Thanh Toán: {paymentMode === "FULL" ? "Thanh toán Một lần" : "Theo Cột mốc"}
                        </span>
                      </div>
                    </div>

                    {paymentMode === "FULL" && (
                      <div className="space-y-4">
                        <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-400/20">
                          <p className="text-indigo-200/80 text-xs flex items-center gap-2">
                            <Info className="w-4 h-4" />
                            Hợp đồng này sử dụng phương thức thanh toán một lần (FULL).
                          </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <label className="flex flex-col gap-1.5">
                            <span className="text-indigo-200/90 text-sm font-medium flex items-center gap-1">
                              Số tiền (VNĐ) <span className="text-red-400">*</span>
                            </span>
                            <input
                              type="text"
                              className="bg-white/5 border border-indigo-400/30 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                              placeholder="VD: 1,000,000"
                              value={form.numofmoney || ""}
                              onChange={(e) =>
                                setForm((f: any) => ({
                                  ...f,
                                  numofmoney: e.target.value,
                                }))
                              }
                              onBlur={() => markTouched("numofmoney")}
                            />
                            {touched.numofmoney && (!form.numofmoney || parseCurrencyToNumber(form.numofmoney) <= 0) && (
                              <span className="text-red-400 text-xs mt-1">Số tiền phải &gt; 0</span>
                            )}
                          </label>
                          <label className="flex flex-col gap-1.5">
                            <span className="text-indigo-200/70 text-sm font-medium">Số lượt sửa</span>
                            <input
                              type="number"
                              min={1}
                              step={1}
                              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                              placeholder="VD: 2"
                              value={form.numofedit || ""}
                              onChange={(e) =>
                                setForm((f: any) => ({
                                  ...f,
                                  numofedit: e.target.value,
                                }))
                              }
                            />
                          </label>
                          <label className="flex flex-col gap-1.5">
                            <span className="text-indigo-200/70 text-sm font-medium">Số lần chỉnh sửa</span>
                            <input
                              type="number"
                              min={0}
                              step={1}
                              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                              placeholder="VD: 1"
                              value={form.numofrefresh || ""}
                              onChange={(e) =>
                                setForm((f: any) => ({
                                  ...f,
                                  numofrefresh: e.target.value,
                                }))
                              }
                            />
                          </label>
                        </div>
                      </div>
                    )}

                    {paymentMode === "MILESTONE" && (
                      <div className="space-y-5">
                        <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-400/20">
                          <p className="text-indigo-200/80 text-xs flex items-center gap-2">
                            <Info className="w-4 h-4" />
                            Hợp đồng này sử dụng phương thức thanh toán theo cột mốc (MILESTONE). Bạn có thể thêm milestone có sẵn hoặc tạo milestone mới.
                          </p>
                        </div>

                        {/* Summary */}
                        <div className="p-4 rounded-lg bg-indigo-500/10 border border-indigo-400/20">
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-indigo-200/90">Tổng tiền các milestone đã chọn</span>
                            <span className="text-indigo-300 font-semibold">{totalMilestonesAmount.toLocaleString("vi-VN")} VNĐ</span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-indigo-200/70">
                            <span>Số milestone đã chọn: {form.milestones.length}</span>
                          </div>
                        </div>

                        {/* Available Milestones List */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-indigo-200 font-semibold">Cột mốc có sẵn trong dự án</h4>
                            {loadingMilestones && (
                              <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                            )}
                          </div>
                          
                          {loadingMilestones ? (
                            <div className="text-center py-4 text-indigo-200/70 text-sm">
                              Đang tải danh sách cột mốc...
                            </div>
                          ) : availableMilestones.length === 0 ? (
                            <div className="text-center py-4 text-indigo-200/70 text-sm">
                              Chưa có cột mốc nào trong dự án
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto">
                              {availableMilestones.map((milestone) => {
                                const isAlreadyAdded = form.milestones.some(
                                  (m: any) => m.milestoneId === milestone.id
                                );
                                return (
                                  <div
                                    key={milestone.id}
                                    className="bg-gradient-to-br from-gray-900/40 to-gray-800/20 border border-indigo-400/20 rounded-lg p-4 hover:border-indigo-400/40 transition-all"
                                  >
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <h5 className="text-indigo-200 font-semibold mb-1">
                                          {milestone.title}
                                        </h5>
                                        {milestone.description && (
                                          <p className="text-indigo-200/70 text-xs mb-2">
                                            {milestone.description}
                                          </p>
                                        )}
                                        <div className="flex items-center gap-4 text-xs text-indigo-200/60">
                                          {milestone.amount && (
                                            <span>
                                              Số tiền: {milestone.amount.toLocaleString("vi-VN")} VNĐ
                                            </span>
                                          )}
                                          {milestone.dueDate && (
                                            <span>
                                              Hạn: {new Date(milestone.dueDate).toLocaleDateString("vi-VN")}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      <button
                                        onClick={() => handleAddExistingMilestone(milestone)}
                                        disabled={isAlreadyAdded}
                                        className={`ml-4 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                          isAlreadyAdded
                                            ? "bg-gray-500/20 text-gray-400 cursor-not-allowed"
                                            : "bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 hover:text-indigo-200 border border-indigo-400/30"
                                        }`}
                                      >
                                        {isAlreadyAdded ? "Đã thêm" : "Thêm vào phụ lục"}
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Create New Milestone Button */}
                        <div className="flex justify-end">
                          <button
                            onClick={() => setShowNewMilestoneForm(true)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gradient-to-r from-emerald-600/80 to-teal-500/80 text-white font-medium rounded-lg hover:from-emerald-600 hover:to-teal-500 transition-all duration-200"
                          >
                            <Plus size={14} />
                            Tạo milestone mới
                          </button>
                        </div>

                        {/* Selected Milestones List */}
                        {form.milestones.length > 0 && (
                          <div className="space-y-3 mt-6">
                            <h4 className="text-indigo-200 font-semibold">Cột mốc đã chọn cho phụ lục</h4>
                            <div className="space-y-3">
                              {form.milestones.map((m: any, idx: number) => {
                                const milestone = m.milestoneId
                                  ? availableMilestones.find((ms) => ms.id === m.milestoneId)
                                  : null;
                                
                                return (
                                  <div
                                    key={idx}
                                    className="relative bg-gradient-to-br from-gray-900/40 to-gray-800/20 border border-indigo-400/30 rounded-xl p-4"
                                  >
                                    <button
                                      className="absolute top-2 right-2 text-red-400 hover:text-red-300 transition"
                                      onClick={() =>
                                        setForm((f: any) => ({
                                          ...f,
                                          milestones: f.milestones.filter(
                                            (_: any, i: number) => i !== idx
                                          ),
                                        }))
                                      }
                                      title="Xóa milestone"
                                    >
                                      <X size={16} />
                                    </button>

                                    <div className="pr-8">
                                      {milestone ? (
                                        <>
                                          <h5 className="text-indigo-200 font-semibold mb-1">
                                            {milestone.title}
                                          </h5>
                                          <p className="text-indigo-200/70 text-xs mb-2">
                                            Milestone ID: {milestone.id}
                                          </p>
                                          <div className="text-xs text-indigo-200/60 space-y-1">
                                            {m.numOfEdit && (
                                              <div>Số lượt sửa: {m.numOfEdit}</div>
                                            )}
                                            {m.numOfRefresh && (
                                              <div>Số lần chỉnh sửa: {m.numOfRefresh}</div>
                                            )}
                                          </div>
                                        </>
                                      ) : (
                                        <>
                                          <h5 className="text-indigo-200 font-semibold mb-1">
                                            {m.title || "Milestone mới"}
                                          </h5>
                                          {m.description && (
                                            <p className="text-indigo-200/70 text-xs mb-2">
                                              {m.description}
                                            </p>
                                          )}
                                          <div className="text-xs text-indigo-200/60 space-y-1">
                                            <div>
                                              Số tiền: {parseCurrencyToNumber(m.numOfMoney).toLocaleString("vi-VN")} VNĐ
                                            </div>
                                            {m.numOfEdit && (
                                              <div>Số lượt sửa: {m.numOfEdit}</div>
                                            )}
                                            {m.numOfRefresh && (
                                              <div>Số lần chỉnh sửa: {m.numOfRefresh}</div>
                                            )}
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                      </div>
                    )}
                  </div>

                  {/* Section 3: Nội dung bổ sung */}
                  <div className="dashboard-card border-pink-500/20">
                    <div className="card-header mb-4">
                      <div className="inline-flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-br from-pink-500/20 to-rose-500/20 border border-pink-400/30 w-full">
                        <FileText className="icon text-pink-300 w-5 h-5" />
                        <span className="text-pink-100 font-semibold text-base md:text-lg">Nội dung Bổ sung (Tùy chọn)</span>
                      </div>
                    </div>
                <div className="space-y-3">
                  <p className="text-pink-100/80 text-xs">
                    Mỗi dòng tương ứng với <span className="font-semibold">01 nội dung bổ sung</span>. Nhấn dấu <span className="font-semibold">+</span> để thêm dòng mới.
                  </p>
                  <div className="space-y-2">
                    {additionalItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2"
                      >
                        <span className="text-xs text-pink-200/80 w-5 text-right">
                          {idx + 1}.
                        </span>
                        <input
                          type="text"
                          className="flex-1 bg-white/5 border border-pink-400/30 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                          placeholder="Nhập nội dung bổ sung..."
                          value={item}
                          onChange={(e) =>
                            setAdditionalItems((items) =>
                              items.map((it, i) => (i === idx ? e.target.value : it))
                            )
                          }
                        />
                        {additionalItems.length > 1 && (
                          <button
                            type="button"
                            className="p-1.5 rounded-full bg-red-500/20 border border-red-400/40 text-red-300 hover:bg-red-500/30 transition"
                            onClick={() =>
                              setAdditionalItems((items) =>
                                items.filter((_, i) => i !== idx)
                              )
                            }
                            title="Xóa dòng"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-gradient-to-r from-pink-500/80 to-rose-500/80 text-white font-medium rounded-lg hover:from-pink-500 hover:to-rose-500 transition-all duration-200"
                    onClick={() =>
                      setAdditionalItems((items) => [...items, ""])
                    }
                  >
                    <Plus size={14} />
                    Thêm nội dung
                  </button>
                </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-8 flex flex-wrap gap-4 justify-center">
                    <button
                      disabled={!canCreate || loading || Boolean(validationMessage)}
                      className="flex items-center gap-2 px-10 py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg hover:scale-105 transition-all disabled:opacity-50"
                      onClick={onFill}
                    >
                      <Sparkles size={18} />
                      {loading ? "Đang tạo..." : "Tạo Phụ lục"}
                    </button>
                  </div>
                  {validationMessage && (
                    <p className="mt-2 text-center text-red-400 text-sm">{validationMessage}</p>
                  )}
                </div>
              </section>

              {/* Right side - PDF Viewer */}
              <section
                ref={pdfRef}
                className="lg:col-span-5 w-full h-[80vh] overflow-y-auto hide-scrollbar"
              >
                <div className="dashboard-card h-full">
                  <div className="card-header mb-4">
                    <FileText className="icon text-blue-300" />
                    <h3 className="card-title">Quét Bản Xem Trước</h3>
                  </div>

                  <div className="w-full h-[600px] bg-black/40 rounded-xl border border-white/10 flex items-center justify-center overflow-hidden">
                    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                      <Viewer
                        fileUrl={
                          paymentMode === "FULL"
                            ? defaultAddendumFullPdf
                            : defaultAddendumMilestonePdf
                        }
                      />
                    </Worker>
                  </div>
                </div>
              </section>
            </>
          )}
        </div>
      </div>

      {/* Modal for adding existing milestone */}
      {showMilestoneModal && selectedMilestone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 border border-indigo-500/30 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-indigo-200">Thêm Milestone vào Phụ lục</h3>
              <button
                onClick={() => {
                  setShowMilestoneModal(false);
                  setSelectedMilestone(null);
                }}
                className="text-gray-400 hover:text-white transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-4 p-3 bg-indigo-500/10 border border-indigo-400/20 rounded-lg">
              <h4 className="text-indigo-200 font-semibold mb-1">{selectedMilestone.title}</h4>
              {selectedMilestone.description && (
                <p className="text-indigo-200/70 text-xs mb-2">{selectedMilestone.description}</p>
              )}
              <div className="text-xs text-indigo-200/60">
                {selectedMilestone.amount && (
                  <div>Số tiền gốc: {selectedMilestone.amount.toLocaleString("vi-VN")} VNĐ</div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-indigo-200/90 text-sm font-medium">
                  Số tiền cho phụ lục (VNĐ) <span className="text-red-400">*</span>
                </span>
                <input
                  type="text"
                  className="bg-white/5 border border-indigo-400/30 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  placeholder="VD: 1,000,000"
                  value={selectedMilestoneForm.numOfMoney}
                  onChange={(e) =>
                    setSelectedMilestoneForm((f) => ({
                      ...f,
                      numOfMoney: e.target.value,
                    }))
                  }
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-indigo-200/70 text-sm font-medium">Số lượt sửa</span>
                <input
                  type="number"
                  min={1}
                  step={1}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  placeholder="VD: 2"
                  value={selectedMilestoneForm.numOfEdit}
                  onChange={(e) =>
                    setSelectedMilestoneForm((f) => ({
                      ...f,
                      numOfEdit: e.target.value,
                    }))
                  }
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-indigo-200/70 text-sm font-medium">Số lần chỉnh sửa</span>
                <input
                  type="number"
                  min={0}
                  step={1}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  placeholder="VD: 1"
                  value={selectedMilestoneForm.numOfRefresh}
                  onChange={(e) =>
                    setSelectedMilestoneForm((f) => ({
                      ...f,
                      numOfRefresh: e.target.value,
                    }))
                  }
                />
              </label>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowMilestoneModal(false);
                  setSelectedMilestone(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-500/20 hover:bg-gray-500/30 border border-gray-400/30 rounded-lg text-gray-300 hover:text-white transition-all"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmAddMilestone}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 rounded-lg text-white font-semibold transition-all"
              >
                Thêm vào phụ lục
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for creating new milestone */}
      {showNewMilestoneForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 border border-emerald-500/30 rounded-2xl p-6 max-w-2xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-emerald-200">Tạo Milestone Mới</h3>
              <button
                onClick={() => {
                  setShowNewMilestoneForm(false);
                  setNewMilestoneForm({
                    title: "",
                    description: "",
                    numOfMoney: "",
                    numOfEdit: "",
                    numOfRefresh: "",
                  });
                }}
                className="text-gray-400 hover:text-white transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-emerald-200/90 text-sm font-medium">
                  🌟 Tiêu đề milestone <span className="text-red-400">*</span>
                </span>
                <input
                  type="text"
                  className="bg-white/5 border border-emerald-400/30 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                  placeholder="VD: Hoàn thành bản demo"
                  value={newMilestoneForm.title}
                  onChange={(e) =>
                    setNewMilestoneForm((f) => ({
                      ...f,
                      title: e.target.value,
                    }))
                  }
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-emerald-200/90 text-sm font-medium">📜 Mô tả</span>
                <textarea
                  className="bg-white/5 border border-emerald-400/30 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all resize-y min-h-[80px]"
                  placeholder="VD: Nộp bản phối hoàn chỉnh"
                  value={newMilestoneForm.description}
                  onChange={(e) =>
                    setNewMilestoneForm((f) => ({
                      ...f,
                      description: e.target.value,
                    }))
                  }
                />
              </label>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className="flex flex-col gap-1.5">
                  <span className="text-emerald-200/90 text-sm font-medium">
                    💰 Số tiền (VNĐ) <span className="text-red-400">*</span>
                  </span>
                  <input
                    type="text"
                    className="bg-white/5 border border-emerald-400/30 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                    placeholder="VD: 2,000,000"
                    value={newMilestoneForm.numOfMoney}
                    onChange={(e) =>
                      setNewMilestoneForm((f) => ({
                        ...f,
                        numOfMoney: e.target.value,
                      }))
                    }
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-emerald-200/70 text-sm font-medium">🛠 Số lượt sửa</span>
                  <input
                    type="number"
                    min={1}
                    step={1}
                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                    placeholder="VD: 2"
                    value={newMilestoneForm.numOfEdit}
                    onChange={(e) =>
                      setNewMilestoneForm((f) => ({
                        ...f,
                        numOfEdit: e.target.value,
                      }))
                    }
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-emerald-200/70 text-sm font-medium">🔄 Số lần chỉnh sửa</span>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                    placeholder="VD: 1"
                    value={newMilestoneForm.numOfRefresh}
                    onChange={(e) =>
                      setNewMilestoneForm((f) => ({
                        ...f,
                        numOfRefresh: e.target.value,
                      }))
                    }
                  />
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowNewMilestoneForm(false);
                  setNewMilestoneForm({
                    title: "",
                    description: "",
                    numOfMoney: "",
                    numOfEdit: "",
                    numOfRefresh: "",
                  });
                }}
                className="flex-1 px-4 py-2 bg-gray-500/20 hover:bg-gray-500/30 border border-gray-400/30 rounded-lg text-gray-300 hover:text-white transition-all"
              >
                Hủy
              </button>
              <button
                onClick={handleCreateNewMilestone}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 rounded-lg text-white font-semibold transition-all"
              >
                Tạo milestone
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .dashboard-card { @apply bg-black/30 backdrop-blur-xl border border-white/10 rounded-3xl p-5; }
        .card-header { @apply flex items-center gap-3; }
        .card-title { @apply text-xl font-bold; }
        .card-description { @apply text-indigo-200/80 text-sm; }
        .btn-primary-glow { @apply inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90 transition; }
        .btn-secondary-glow { @apply inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 border border-white/10 hover:bg-white/15 transition; }
        .icon { @apply w-6 h-6; }
        .hide-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}

