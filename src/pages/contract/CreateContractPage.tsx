import { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { motion } from "framer-motion";
import {
  Sparkles,
  FileText,
  TimerReset,
  X,
  Rocket,
  Satellite,
  Users,
  Star,
  AlertCircle,
  Info,
  Plus,
  ArrowLeft,
  CheckCircle2,
  Loader,
} from "lucide-react";
import contractService, {
  type ContractFillBodyMilestones,
  type ContractFillBodyPayOnce,
  type ContractMetadata,
} from "../../services/contractService";
import projectService from "../../services/projectService";
import { type ProjectPermissionResponse } from "../../types/permission";
import { ROUTER } from "../../routes/router";
import toast from "react-hot-toast";
import defaultPdfUrl from "../../assets/pdf/hop-dong-san-xuat-am-nhac.pdf";
import { useCosmicToast } from "../../component/toast/CosmicToastProvider";
import AnimatedBackground from "@/component/background/AnimatedBackground";
import { ConfirmModal } from "../../component/modal/ConfirmModal";

type Mode = "PAY_ONCE" | "MILESTONES";

export default function CreateContractPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const projectId = params.get("id");

  // Generate random positions for stars (memoized to avoid re-renders)
  const starPositions = useMemo(
    () =>
      Array.from({ length: 8 }, () => ({
        left: 10 + Math.random() * 80,
        top: 10 + Math.random() * 80,
        size: 8 + Math.random() * 8,
        delay: Math.random() * 2,
        duration: 3 + Math.random() * 2,
        moveX: Math.random() * 100 - 50,
        moveY: Math.random() * 100 - 50,
      })),
    []
  );

  const [loading, setLoading] = useState(false);
  const [metadata, setMetadata] = useState<ContractMetadata | null>(null);
  const [permissions, setPermissions] =
    useState<ProjectPermissionResponse | null>(null);
  const [mode, setMode] = useState<Mode>("PAY_ONCE");
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const { showToast } = useCosmicToast();
  const pdfRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const [loadingVerifiedInfo, setLoadingVerifiedInfo] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  // Helper: Validate phone number
  const validatePhone = (phone: string): string | null => {
    if (!phone || phone.trim() === "") return null;
    const phoneRegex =
      /^(0?)(3[2-9]|5[6|8|9]|7[0|6-9]|8[0-6|8|9]|9[0-4|6-9])[0-9]{7}$/;
    if (!phoneRegex.test(phone.trim())) {
      return "Số điện thoại không hợp lệ (phải là số điện thoại Việt Nam)";
    }
    return null;
  };

  // Helper: Validate CCCD
  const validateCccd = (cccd: string): string | null => {
    if (!cccd || cccd.trim() === "") return null;
    const cccdRegex = /^[0-9]{12}$/;
    if (!cccdRegex.test(cccd.trim())) {
      return "CCCD phải là 12 chữ số";
    }
    return null;
  };

  // Helper: parse currency-like string to number
  const parseCurrencyToNumber = (
    value: string | number | undefined
  ): number => {
    if (value === undefined || value === null) return 0;
    if (typeof value === "number") return value;
    const cleaned = value.replace(/[^0-9.-]/g, "");
    const num = Number(cleaned);
    return Number.isFinite(num) ? num : 0;
  };
  const calcAmountString = (
    qty: number | string | undefined,
    price: string | number | undefined
  ): string => {
    const q = typeof qty === "string" ? Number(qty) : qty || 0;
    const p = parseCurrencyToNumber(price as any);
    const amount = (Number.isFinite(q as number) ? (q as number) : 0) * p;
    return String(amount || 0);
  };
  const [form, setForm] = useState<any>({
    contractNo: "",
    signDate: "",
    signPlace: "",
    percent: "",
    aName: "",
    aCccd: "",
    aCccdIssueDate: "",
    aCccdIssuePlace: "",
    aAddress: "",
    aPhone: "",
    bName: "",
    bCccd: "",
    bCccdIssueDate: "",
    bCccdIssuePlace: "",
    bAddress: "",
    bPhone: "",
    lines: [
      {
        item: "",
        unit: "",
        qty: "",
        price: "",
      },
    ],
    payOnce: true,
    payMilestone: false,
    fpEditAmount: "",
    milestones: [
      {
        title: "",
        description: "",
        amount: "",
        dueDate: "",
        editCount: "",
        productCount: "",
      },
    ],
    additionalTerms: [""], // Array of terms, each term will be separated by \n\n
  });

  // Track touched status for required fields and line-1 fields
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [lineTouched, setLineTouched] = useState<
    Record<number, Record<string, boolean>>
  >({});

  const markTouched = (key: string) =>
    setTouched((t) => ({ ...t, [key]: true }));
  const markLineTouched = (index: number, key: string) =>
    setLineTouched((t) => ({
      ...t,
      [index]: { ...(t[index] || {}), [key]: true },
    }));

  // Tổng tiền hạng mục và tổng tiền cột mốc
  const totalItemsAmount = useMemo(() => {
    const lines = (form as any)?.lines || [];
    return lines.reduce((sum: number, line: any) => {
      const qty = Number(
        typeof line?.qty === "string" ? line.qty : line?.qty || 0
      );
      const price = parseCurrencyToNumber(line?.price);
      return sum + (Number.isFinite(qty) ? qty : 0) * price;
    }, 0);
  }, [form?.lines]);
  const totalMilestonesAmount = useMemo(() => {
    if (mode !== "MILESTONES") return 0;
    const milestones = (form as any)?.milestones || [];
    return milestones.reduce(
      (sum: number, m: any) => sum + parseCurrencyToNumber(m?.amount),
      0
    );
  }, [mode, form?.milestones]);
  const totalLinesQty = useMemo(() => {
    const lines = (form as any)?.lines || [];
    return lines.reduce((sum: number, line: any) => {
      const qty = Number(
        typeof line?.qty === "string" ? line.qty : line?.qty || 0
      );
      return sum + (Number.isFinite(qty) ? qty : 0);
    }, 0);
  }, [form?.lines]);

  // Validation summary message for disabling submit and showing guidance
  const validationMessage = useMemo(() => {
    const missing: string[] = [];
    const invalid: string[] = [];

    // Core required
    if (!form.contractNo || String(form.contractNo).trim() === "")
      missing.push("Số hợp đồng");
    if (!form.signDate || String(form.signDate).trim() === "")
      missing.push("Ngày ký");
    else {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(String(form.signDate)))
        invalid.push("Ngày ký phải đúng định dạng yyyy-MM-dd");
    }
    if (!form.percent || String(form.percent).trim() === "")
      missing.push("Phần trăm (%)");
    else {
      const percentValue = Number(form.percent);
      if (isNaN(percentValue)) {
        invalid.push("Phần trăm phải là số hợp lệ");
      } else if (percentValue <= 7) {
        invalid.push("Phần trăm phải lớn hơn 7");
      }
    }

    // Party A required
    if (!form.aName || String(form.aName).trim() === "")
      missing.push("A - Tên");
    if (!form.aCccd || String(form.aCccd).trim() === "")
      missing.push("A - CCCD");
    else {
      const cccdRegex = /^[0-9]{12}$/;
      if (!cccdRegex.test(String(form.aCccd).trim()))
        invalid.push("A - CCCD phải là 12 chữ số");
    }
    if (!form.aCccdIssueDate || String(form.aCccdIssueDate).trim() === "")
      missing.push("A - Ngày cấp CCCD");
    else {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(String(form.aCccdIssueDate)))
        invalid.push("A - Ngày cấp CCCD phải đúng định dạng yyyy-MM-dd");
    }
    if (!form.aCccdIssuePlace || String(form.aCccdIssuePlace).trim() === "")
      missing.push("A - Nơi cấp CCCD");
    if (!form.aAddress || String(form.aAddress).trim() === "")
      missing.push("A - Địa chỉ");
    if (!form.aPhone || String(form.aPhone).trim() === "")
      missing.push("A - Số điện thoại");
    else {
      const phoneRegex =
        /^(0?)(3[2-9]|5[6|8|9]|7[0|6-9]|8[0-6|8|9]|9[0-4|6-9])[0-9]{7}$/;
      if (!phoneRegex.test(String(form.aPhone).trim()))
        invalid.push(
          "A - Số điện thoại không hợp lệ (phải là số điện thoại Việt Nam)"
        );
    }

    // Party B required
    if (!form.bName || String(form.bName).trim() === "")
      missing.push("B - Tên");
    if (!form.bCccd || String(form.bCccd).trim() === "")
      missing.push("B - CCCD");
    else {
      const cccdRegex = /^[0-9]{12}$/;
      if (!cccdRegex.test(String(form.bCccd).trim()))
        invalid.push("B - CCCD phải là 12 chữ số");
    }
    if (!form.bCccdIssueDate || String(form.bCccdIssueDate).trim() === "")
      missing.push("B - Ngày cấp CCCD");
    else {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(String(form.bCccdIssueDate)))
        invalid.push("B - Ngày cấp CCCD phải đúng định dạng yyyy-MM-dd");
    }
    if (!form.bCccdIssuePlace || String(form.bCccdIssuePlace).trim() === "")
      missing.push("B - Nơi cấp CCCD");
    if (!form.bAddress || String(form.bAddress).trim() === "")
      missing.push("B - Địa chỉ");
    if (!form.bPhone || String(form.bPhone).trim() === "")
      missing.push("B - Số điện thoại");
    else {
      const phoneRegex =
        /^(0?)(3[2-9]|5[6|8|9]|7[0|6-9]|8[0-6|8|9]|9[0-4|6-9])[0-9]{7}$/;
      if (!phoneRegex.test(String(form.bPhone).trim()))
        invalid.push(
          "B - Số điện thoại không hợp lệ (phải là số điện thoại Việt Nam)"
        );
    }

    // First line required
    const line1 = (form.lines || [])[0] || {};
    if (!line1.item || String(line1.item).trim() === "")
      missing.push("Hạng mục 1 - Tên");
    if (!line1.unit || String(line1.unit).trim() === "")
      missing.push("Hạng mục 1 - Đơn vị");
    if (!line1.qty || String(line1.qty).trim() === "")
      missing.push("Hạng mục 1 - Số lượng");
    else {
      const qty = Number(line1.qty);
      if (!Number.isInteger(qty) || qty <= 0)
        invalid.push("Hạng mục 1 - Số lượng phải là số nguyên > 0");
    }
    if (!line1.price || String(line1.price).trim() === "")
      missing.push("Hạng mục 1 - Đơn giá");

    // Milestone validations
    if (mode === "MILESTONES") {
      const diff = totalItemsAmount - totalMilestonesAmount;
      if (diff !== 0) {
        return diff > 0
          ? `Tổng tiền cột mốc còn thiếu ${diff.toLocaleString("vi-VN")} VNĐ`
          : `Tổng tiền cột mốc vượt quá ${Math.abs(diff).toLocaleString(
              "vi-VN"
            )} VNĐ`;
      }

      const milestones = (form.milestones || []) as Array<any>;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      let productSum = 0;
      for (let i = 0; i < milestones.length; i++) {
        const dStr = milestones[i]?.dueDate || "";
        if (!dStr) return `Cột mốc ${i + 1}: Vui lòng nhập hạn hoàn thành`;
        const date = new Date(dStr);
        if (Number.isNaN(date.getTime()))
          return `Cột mốc ${i + 1}: Ngày không hợp lệ`;
        date.setHours(0, 0, 0, 0);
        if (i === 0) {
          if (!(date.getTime() > today.getTime()))
            return `Cột mốc 1: Hạn phải sau ngày hiện tại`;
        } else {
          const prevStr = milestones[i - 1]?.dueDate || "";
          const prev = new Date(prevStr);
          prev.setHours(0, 0, 0, 0);
          if (!(date.getTime() > prev.getTime()))
            return `Cột mốc ${i + 1}: Hạn phải sau cột mốc ${i}`;
        }
        const edits = Number(milestones[i]?.editCount);
        if (!Number.isInteger(edits) || edits <= 0)
          return `Cột mốc ${i + 1}: Số lượt sửa phải là số nguyên > 0`;
        const pc = Number(milestones[i]?.productCount);
        if (!Number.isInteger(pc) || pc <= 0)
          return `Cột mốc ${i + 1}: Số lượng sản phẩm phải là số nguyên > 0`;
        productSum += pc;
      }
      if (productSum !== totalLinesQty) {
        return productSum < totalLinesQty
          ? `Tổng số lượng sản phẩm cột mốc còn thiếu ${
              totalLinesQty - productSum
            }`
          : `Tổng số lượng sản phẩm cột mốc vượt quá ${
              productSum - totalLinesQty
            }`;
      }
    }

    // Validate số lượt sửa trong thanh toán một lần
    if (mode === "PAY_ONCE") {
      if (!form.fpEditAmount || String(form.fpEditAmount).trim() === "")
        missing.push("Số lượt sửa");
      else {
        const edits = Number(form.fpEditAmount);
        if (!Number.isInteger(edits) || edits <= 0)
          invalid.push("Số lượt sửa phải là số nguyên > 0");
      }
    }

    // Ưu tiên hiển thị lỗi invalid (cụ thể) trước missing (chung chung)
    if (invalid.length > 0) {
      return invalid[0]; // Trả về lỗi đầu tiên
    }

    if (missing.length > 0) {
      return "Vui lòng điền hết thông tin bắt buộc";
    }

    return "";
  }, [form, mode, totalItemsAmount, totalMilestonesAmount, totalLinesQty]);

  useEffect(() => {
    return () => {
      if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl);
    };
  }, [pdfBlobUrl]);

  // Load permissions on mount
  useEffect(() => {
    const loadPermissions = async () => {
      if (!projectId) return;

      try {
        const perms = await projectService.getProjectPermissionByProjectId(
          projectId
        );
        setPermissions(perms);
      } catch (error: any) {
        toast.error(error.message || "Không thể tải thông tin quyền truy cập");
      }
    };

    loadPermissions();
  }, [projectId]);
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
      (!metadata ||
        (metadata.signnowStatus &&
          [
            "DRAFT",
            "DECLINED",
            "OUT_FOR_SIGNATURE",
            "PARTIALLY_SIGNED",
          ].includes(metadata.signnowStatus))),
    [permissions, metadata]
  );

  async function onFill() {
    if (!projectId) return;

    const missingFields: string[] = [];
    const invalidFields: string[] = [];

    // A. Thông tin cơ bản hợp đồng - Bắt buộc
    if (!form.contractNo || form.contractNo.trim() === "") {
      missingFields.push("Số hợp đồng");
    }

    if (!form.signDate || form.signDate.trim() === "") {
      missingFields.push("Ngày ký hợp đồng");
    } else {
      // Validate date format yyyy-MM-dd
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(form.signDate)) {
        invalidFields.push("Ngày ký hợp đồng phải đúng định dạng yyyy-MM-dd");
      }
    }

    if (!form.percent || form.percent.trim() === "") {
      missingFields.push("Phần trăm (%)");
    } else {
      const percentValue = Number(form.percent);
      if (isNaN(percentValue)) {
        invalidFields.push("Phần trăm phải là số hợp lệ");
      } else if (percentValue <= 7) {
        invalidFields.push("Phần trăm phải lớn hơn 7");
      }
    }

    // B. Thông tin bên A (Producer/Owner) - Bắt buộc
    if (!form.aName || form.aName.trim() === "") {
      missingFields.push("A - Tên");
    }
    if (!form.aCccd || form.aCccd.trim() === "") {
      missingFields.push("A - CCCD");
    } else {
      const cccdRegex = /^[0-9]{12}$/;
      if (!cccdRegex.test(form.aCccd.trim())) {
        invalidFields.push("A - CCCD phải là 12 chữ số");
      }
    }
    if (!form.aCccdIssueDate || form.aCccdIssueDate.trim() === "") {
      missingFields.push("A - Ngày cấp CCCD");
    } else {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(form.aCccdIssueDate)) {
        invalidFields.push("A - Ngày cấp CCCD phải đúng định dạng yyyy-MM-dd");
      }
    }
    if (!form.aCccdIssuePlace || form.aCccdIssuePlace.trim() === "") {
      missingFields.push("A - Nơi cấp CCCD");
    }
    if (!form.aAddress || form.aAddress.trim() === "") {
      missingFields.push("A - Địa chỉ");
    }
    if (!form.aPhone || form.aPhone.trim() === "") {
      missingFields.push("A - Số điện thoại");
    } else {
      const phoneRegex =
        /^(0?)(3[2-9]|5[6|8|9]|7[0|6-9]|8[0-6|8|9]|9[0-4|6-9])[0-9]{7}$/;
      if (!phoneRegex.test(form.aPhone.trim())) {
        invalidFields.push(
          "A - Số điện thoại không hợp lệ (phải là số điện thoại Việt Nam)"
        );
      }
    }

    // C. Thông tin bên B (Client) - Bắt buộc
    if (!form.bName || form.bName.trim() === "") {
      missingFields.push("B - Tên");
    }
    if (!form.bCccd || form.bCccd.trim() === "") {
      missingFields.push("B - CCCD");
    } else {
      const cccdRegex = /^[0-9]{12}$/;
      if (!cccdRegex.test(form.bCccd.trim())) {
        invalidFields.push("B - CCCD phải là 12 chữ số");
      }
    }
    if (!form.bCccdIssueDate || form.bCccdIssueDate.trim() === "") {
      missingFields.push("B - Ngày cấp CCCD");
    } else {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(form.bCccdIssueDate)) {
        invalidFields.push("B - Ngày cấp CCCD phải đúng định dạng yyyy-MM-dd");
      }
    }
    if (!form.bCccdIssuePlace || form.bCccdIssuePlace.trim() === "") {
      missingFields.push("B - Nơi cấp CCCD");
    }
    if (!form.bAddress || form.bAddress.trim() === "") {
      missingFields.push("B - Địa chỉ");
    }
    if (!form.bPhone || form.bPhone.trim() === "") {
      missingFields.push("B - Số điện thoại");
    } else {
      const phoneRegex =
        /^(0?)(3[2-9]|5[6|8|9]|7[0|6-9]|8[0-6|8|9]|9[0-4|6-9])[0-9]{7}$/;
      if (!phoneRegex.test(form.bPhone.trim())) {
        invalidFields.push(
          "B - Số điện thoại không hợp lệ (phải là số điện thoại Việt Nam)"
        );
      }
    }

    // D. Thông tin dòng đầu tiên - Bắt buộc
    if (!form.lines || form.lines.length === 0) {
      missingFields.push("Phải có ít nhất 1 hạng mục");
    } else {
      const line1 = form.lines[0];
      if (!line1?.item?.trim()) {
        missingFields.push("Hạng mục 1 - Tên sản phẩm/dịch vụ");
      }
      if (!line1?.unit?.trim()) {
        missingFields.push("Hạng mục 1 - Đơn vị tính");
      }
      if (!line1?.qty?.trim()) {
        missingFields.push("Hạng mục 1 - Số lượng");
      } else {
        const qty = Number(line1.qty);
        if (!Number.isInteger(qty) || qty <= 0) {
          invalidFields.push(
            "Hạng mục 1 - Số lượng phải là số nguyên lớn hơn 0"
          );
        }
      }
      if (!line1?.price?.trim()) {
        missingFields.push("Hạng mục 1 - Đơn giá");
      }
    }

    // Hiển thị lỗi
    if (missingFields.length > 0 || invalidFields.length > 0) {
      const allErrors = [
        ...(missingFields.length > 0
          ? [`Thiếu trường bắt buộc: ${missingFields.join(", ")}`]
          : []),
        ...invalidFields,
      ];
      toast.error(allErrors.join(". "));
      return;
    }

    // Kiểm tra tổng tiền cột mốc phải bằng tổng tiền hạng mục (khi chọn theo cột mốc)
    if (mode === "MILESTONES") {
      const diff = totalItemsAmount - totalMilestonesAmount;
      if (diff !== 0) {
        toast.error(
          diff > 0
            ? `Tổng tiền cột mốc còn thiếu ${diff.toLocaleString("vi-VN")} VNĐ`
            : `Tổng tiền cột mốc vượt quá ${Math.abs(diff).toLocaleString(
                "vi-VN"
              )} VNĐ`
        );
        return;
      }
      const milestones = (form.milestones || []) as Array<any>;
      let productSum = 0;
      for (let i = 0; i < milestones.length; i++) {
        const edits = Number(milestones[i]?.editCount);
        if (!Number.isInteger(edits) || edits <= 0) {
          toast.error(`Cột mốc ${i + 1}: Số lượt sửa phải là số nguyên > 0`);
          return;
        }
        const pc = Number(milestones[i]?.productCount);
        if (!Number.isInteger(pc) || pc <= 0) {
          toast.error(
            `Cột mốc ${i + 1}: Số lượng sản phẩm phải là số nguyên > 0`
          );
          return;
        }
        productSum += pc;
      }
      if (productSum !== totalLinesQty) {
        toast.error(
          productSum < totalLinesQty
            ? `Tổng số lượng sản phẩm cột mốc còn thiếu ${
                totalLinesQty - productSum
              }`
            : `Tổng số lượng sản phẩm cột mốc vượt quá ${
                productSum - totalLinesQty
              }`
        );
        return;
      }
    }
    if (mode === "PAY_ONCE") {
      if (!form.fpEditAmount || String(form.fpEditAmount).trim() === "") {
        toast.error("Số lượt sửa là bắt buộc");
        return;
      }
      const edits = Number(form.fpEditAmount);
      if (!Number.isInteger(edits) || edits <= 0) {
        toast.error("Số lượt sửa phải là số nguyên > 0");
        return;
      }
    }

    setLoading(true);
    try {
      // Chuyển dữ liệu sang format API
      const body: ContractFillBodyPayOnce | ContractFillBodyMilestones = {
        contractNo: form.contractNo,
        signDate: form.signDate,
        signPlace: form.signPlace,
        percent: form.percent,

        // Bên A
        aName: form.aName,
        aCccd: form.aCccd,
        aCccdIssueDate: form.aCccdIssueDate,
        aCccdIssuePlace: form.aCccdIssuePlace,
        aAddress: form.aAddress,
        aPhone: form.aPhone,

        // Bên B
        bName: form.bName,
        bCccd: form.bCccd,
        bCccdIssueDate: form.bCccdIssueDate,
        bCccdIssuePlace: form.bCccdIssuePlace,
        bAddress: form.bAddress,
        bPhone: form.bPhone,

        // Hạng mục 1
        line1Item: form.lines?.[0]?.item || "",
        line1Unit: form.lines?.[0]?.unit || "",
        line1Qty: Number(form.lines?.[0]?.qty || 0),
        line1Price: form.lines?.[0]?.price || "",
        line1Amount: calcAmountString(
          form.lines?.[0]?.qty,
          form.lines?.[0]?.price
        ),

        // Hạng mục 2–10 (tuỳ chọn)
        line2Item: form.lines?.[1]?.item || "",
        line2Unit: form.lines?.[1]?.unit || "",
        line2Qty: Number(form.lines?.[1]?.qty || 0),
        line2Price: form.lines?.[1]?.price || "",
        line2Amount: calcAmountString(
          form.lines?.[1]?.qty,
          form.lines?.[1]?.price
        ),

        line3Item: form.lines?.[2]?.item || "",
        line3Unit: form.lines?.[2]?.unit || "",
        line3Qty: Number(form.lines?.[2]?.qty || 0),
        line3Price: form.lines?.[2]?.price || "",
        line3Amount: calcAmountString(
          form.lines?.[2]?.qty,
          form.lines?.[2]?.price
        ),

        line4Item: form.lines?.[3]?.item || "",
        line4Unit: form.lines?.[3]?.unit || "",
        line4Qty: Number(form.lines?.[3]?.qty || 0),
        line4Price: form.lines?.[3]?.price || "",
        line4Amount: calcAmountString(
          form.lines?.[3]?.qty,
          form.lines?.[3]?.price
        ),

        line5Item: form.lines?.[4]?.item || "",
        line5Unit: form.lines?.[4]?.unit || "",
        line5Qty: Number(form.lines?.[4]?.qty || 0),
        line5Price: form.lines?.[4]?.price || "",
        line5Amount: calcAmountString(
          form.lines?.[4]?.qty,
          form.lines?.[4]?.price
        ),

        line6Item: form.lines?.[5]?.item || "",
        line6Unit: form.lines?.[5]?.unit || "",
        line6Qty: Number(form.lines?.[5]?.qty || 0),
        line6Price: form.lines?.[5]?.price || "",
        line6Amount: calcAmountString(
          form.lines?.[5]?.qty,
          form.lines?.[5]?.price
        ),

        line7Item: form.lines?.[6]?.item || "",
        line7Unit: form.lines?.[6]?.unit || "",
        line7Qty: Number(form.lines?.[6]?.qty || 0),
        line7Price: form.lines?.[6]?.price || "",
        line7Amount: calcAmountString(
          form.lines?.[6]?.qty,
          form.lines?.[6]?.price
        ),

        line8Item: form.lines?.[7]?.item || "",
        line8Unit: form.lines?.[7]?.unit || "",
        line8Qty: Number(form.lines?.[7]?.qty || 0),
        line8Price: form.lines?.[7]?.price || "",
        line8Amount: calcAmountString(
          form.lines?.[7]?.qty,
          form.lines?.[7]?.price
        ),

        line9Item: form.lines?.[8]?.item || "",
        line9Unit: form.lines?.[8]?.unit || "",
        line9Qty: Number(form.lines?.[8]?.qty || 0),
        line9Price: form.lines?.[8]?.price || "",
        line9Amount: calcAmountString(
          form.lines?.[8]?.qty,
          form.lines?.[8]?.price
        ),

        line10Item: form.lines?.[9]?.item || "",
        line10Unit: form.lines?.[9]?.unit || "",
        line10Qty: Number(form.lines?.[9]?.qty || 0),
        line10Price: form.lines?.[9]?.price || "",
        line10Amount: calcAmountString(
          form.lines?.[9]?.qty,
          form.lines?.[9]?.price
        ),

        // Phương thức thanh toán
        payOnce: mode === "PAY_ONCE",
        payMilestone: mode === "MILESTONES",

        // Điều khoản bổ sung - Join các điều khoản bằng \n\n (2 dòng trống)
        additionalTerms:
          form.additionalTerms && form.additionalTerms.length > 0
            ? form.additionalTerms
                .filter((term: string) => term && term.trim() !== "") // Bỏ các điều khoản rỗng
                .join("\n\n") // Join bằng 2 dòng trống theo logic BE
            : undefined,

        ...(mode === "PAY_ONCE"
          ? { fpEditAmount: Number(form.fpEditAmount || 0) }
          : {}),
        ...(mode === "MILESTONES"
          ? {
              milestones: (form.milestones || []).map((m: any) => ({
                title: m.title,
                description: m.description,
                amount: m.amount,
                dueDate: m.dueDate,
                editCount: Number(m.editCount || 0),
                productCount: Number(m.productCount || 0),
              })),
            }
          : {}),
      };

      // Gọi API tạo hợp đồng
      const blob = await contractService.fillContract(projectId, body);
      const url = URL.createObjectURL(blob);
      if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl);
      setPdfBlobUrl(url);

      // Mở PDF trong tab mới
      window.open(url, "_blank", "noopener,noreferrer");
      // Cleanup sau 60 giây
      setTimeout(() => URL.revokeObjectURL(url), 60_000);

      showToast("🎉 Hợp đồng đã được tạo thành công!", "success");

      // Lấy metadata (tuỳ bạn có cần không)
      const meta = await contractService.getContractMetadata(projectId);
      setMetadata(meta);

      // ➡️ Điều hướng sau khi tạo thành công
      setTimeout(() => {
        navigate(`${ROUTER.USER.CONTRACTSPACE}?id=${projectId}`);
      }, 1200); // chờ toast hiển thị 1.2s rồi mới chuyển trang
    } catch (e: any) {
      console.error("Fill contract error:", e);
      toast.error(e.message || "Không thể tạo hợp đồng");
    } finally {
      setLoading(false);
    }
  }
  const handleScroll = () => {
    if (!formRef.current || !pdfRef.current) return;

    const left = formRef.current;
    const right = pdfRef.current;

    // Tính tỷ lệ scroll của cột trái
    const scrollPercent =
      left.scrollTop / (left.scrollHeight - left.clientHeight);

    // Áp dụng cho cột phải
    right.scrollTop = scrollPercent * (right.scrollHeight - right.clientHeight);
  };

  // Handler để lấy thông tin từ xác thực
  const handleGetVerifiedInfo = async () => {
    setLoadingVerifiedInfo(true);
    try {
      const verifiedInfo = await contractService.getPartyBVerifiedInfo();

      // Fill form với dữ liệu từ API
      setForm((f: any) => ({
        ...f,
        bName: verifiedInfo.bName,
        bCccd: verifiedInfo.bCccd,
        bCccdIssueDate: verifiedInfo.bCccdIssueDate, // API trả về yyyy-MM-dd, form input type="date" cần format này
        bCccdIssuePlace: verifiedInfo.bCccdIssuePlace,
        bAddress: verifiedInfo.bAddress,
        bPhone: verifiedInfo.bPhone,
      }));

      // Mark các trường đã được fill là touched để ẩn validation error nếu có
      setTouched((t) => ({
        ...t,
        bName: true,
        bCccd: true,
        bCccdIssueDate: true,
        bCccdIssuePlace: true,
        bAddress: true,
        bPhone: true,
      }));

      // Hiển thị toast thành công
      showToast({
        type: "success",
        title: "✅ Thành công",
        message: "Đã lấy thông tin từ xác thực thành công",
      });
    } catch (error: any) {
      const errorCode = error?.code;
      const errorStatus = error?.status;
      const errorResponse = error?.response?.data;

      // Error 3008: User chưa xác thực CCCD (có thể từ response body hoặc error object)
      const isNotVerified = errorCode === 3008 || errorResponse?.code === 3008;
      if (isNotVerified) {
        setShowVerificationModal(true);
        return;
      }

      // Error 401: Chưa đăng nhập (có thể từ HTTP status hoặc error code)
      const isUnauthorized =
        errorStatus === 401 ||
        errorCode === 2001 ||
        errorResponse?.code === 2001;
      if (isUnauthorized) {
        showToast({
          type: "error",
          title: "Lỗi xác thực",
          message: "Yêu cầu xác thực. Vui lòng đăng nhập.",
        });
        setTimeout(() => {
          navigate(ROUTER.USER.LOGIN);
        }, 1500);
        return;
      }

      // Error khác - lấy message từ response hoặc error object
      const errorMessage =
        errorResponse?.message ||
        error?.message ||
        "Không thể lấy thông tin từ xác thực. Vui lòng thử lại.";
      showToast({
        type: "error",
        title: "Lỗi",
        message: errorMessage,
      });
    } finally {
      setLoadingVerifiedInfo(false);
    }
  };

  // Handler để đi đến trang xác thực
  const handleGoToVerification = () => {
    setShowVerificationModal(false);
    navigate(ROUTER.USER.VERIFY_CCCD);
  };

  return (
    <div className="relative min-h-screen text-white overflow-hidden mt-[73px]">
      <AnimatedBackground />
      {/* <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900 via-indigo-900 to-black" /> */}
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
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/50 to-purple-500/50 blur-xl" />
              <div className="relative p-4 rounded-2xl bg-gradient-to-br from-indigo-500/40 via-purple-500/40 to-pink-500/40 border border-white/20 backdrop-blur-sm shadow-[0_0_30px_rgba(139,92,246,0.5)]">
                <FileText className="text-indigo-200 w-8 h-8" />
              </div>
            </div>

            {/* Title */}
            <div className="relative">
              <h1 className="text-4xl md:text-5xl font-extrabold relative">
                <span className="relative z-10 bg-gradient-to-r from-cyan-300 via-indigo-300 to-purple-300 bg-clip-text text-transparent">
                  Khởi Tạo Giao Ước
                </span>
              </h1>
              <p className="text-indigo-200/80 text-base md:text-lg mt-3 flex items-center gap-2">
                <Satellite size={16} className="text-cyan-400" />
                <span className="bg-gradient-to-r from-indigo-200/90 to-purple-200/90 bg-clip-text text-transparent">
                  Soạn thảo và niêm phong Giao ước Liên sao mới cho phi vụ của
                  bạn.
                </span>
              </p>
            </div>
          </div>

          {/* Back button - pinned at right, clear back icon */}
          <div className="absolute right-6 top-1/2 -translate-y-1/2 z-10">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              aria-label="Quay lại trang dự án"
              className="relative overflow-hidden group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 border border-white/15 hover:bg-white/15"
              onClick={() =>
                navigate(`${ROUTER.USER.PROJECTDETAIL}?id=${projectId || ""}`)
              }
            >
              {/* Shine effect on hover */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.6 }}
              />
              <span className="relative z-10 inline-flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500/40 to-purple-500/40 border border-white/20">
                <ArrowLeft className="w-3.5 h-3.5 text-indigo-100" />
              </span>
              <span className="relative z-10 text-xs">
                Quay lại trang dự án
              </span>
            </motion.button>
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
                      Không có quyền tạo hợp đồng
                    </h3>
                    <p className="text-red-200/80 text-sm">
                      {permissions.reason ||
                        "Bạn không có quyền tạo hợp đồng cho dự án này."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {permissions?.contract.canCreateContract && (
            <>
              {/* Left side - Form content */}
              <section
                ref={formRef}
                onScroll={handleScroll}
                className="lg:col-span-7 space-y-6 overflow-y-auto h-[80vh] hide-scrollbar"
              >
                <div className="space-y-6">
                  {/* Section 1: Thông tin cơ bản hợp đồng */}
                  <div className="dashboard-card border-cyan-500/20">
                    <div className="card-header mb-4">
                      <div className="inline-flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 w-full">
                        <Rocket className="icon text-cyan-300 w-5 h-5" />
                        <span className="text-cyan-100 font-semibold text-base md:text-lg">
                          Thông tin Giao ước Cơ bản
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        ["contractNo", "Số hợp đồng", true],
                        ["signDate", "Hôm nay, ngày/tháng/năm", true],
                        ["signPlace", "Nơi ký", false],
                      ].map(([k, label, required]) => {
                        const isDateField = k === "signDate";
                        const labelText = String(label);
                        return (
                          <label
                            key={k as string}
                            className="flex flex-col gap-1.5"
                          >
                            <span className="text-indigo-200/90 text-sm font-medium flex items-center gap-1">
                              {labelText}
                              {required && (
                                <span className="text-red-400">*</span>
                              )}
                            </span>
                            <input
                              type={isDateField ? "date" : "text"}
                              className={`bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all ${
                                isDateField
                                  ? "[color-scheme:dark] [&::-webkit-calendar-picker-indicator]:invert"
                                  : ""
                              } ${required ? "border-cyan-400/30" : ""}`}
                              placeholder={
                                isDateField
                                  ? ""
                                  : `Nhập ${labelText.toLowerCase()}...`
                              }
                              value={form[k as string] || ""}
                              onChange={(e) =>
                                setForm((f: any) => ({
                                  ...f,
                                  [k as string]: e.target.value,
                                }))
                              }
                              onBlur={() => markTouched(k as string)}
                            />
                            {required &&
                              touched[k as string] &&
                              (!form[k as string] ||
                                String(form[k as string]).trim() === "") && (
                                <span className="text-red-400 text-xs mt-1">
                                  Trường này bắt buộc
                                </span>
                              )}
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Section 2: Thông tin Bên A - Producer/Owner */}
                  <div className="dashboard-card border-purple-500/20">
                    <div className="card-header mb-4">
                      <div className="inline-flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/30 w-full">
                        <Users className="icon text-purple-300 w-5 h-5" />
                        <span className="text-purple-100 font-semibold text-base md:text-lg">
                          Bên A - Khách Hàng
                        </span>
                      </div>
                    </div>

                    {/* Trường bắt buộc */}
                    <div className="mb-4">
                      <p className="text-xs text-purple-300/70 mb-3 flex items-center gap-1">
                        <AlertCircle size={12} />
                        Thông tin bắt buộc
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          ["aName", "Tên"],
                          ["aCccd", "Số CCCD"],
                          ["aCccdIssueDate", "Ngày cấp CCCD"],
                          ["aCccdIssuePlace", "Nơi cấp CCCD"],
                          ["aAddress", "Địa chỉ"],
                          ["aPhone", "Số điện thoại"],
                        ].map(([k, label]) => {
                          const isDateField = k === "aCccdIssueDate";
                          return (
                            <label
                              key={k as string}
                              className="flex flex-col gap-1.5"
                            >
                              <span className="text-purple-200/90 text-sm font-medium flex items-center gap-1">
                                {label} <span className="text-red-400">*</span>
                              </span>
                              <input
                                type={isDateField ? "date" : "text"}
                                className={`bg-white/5 border border-purple-400/30 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all ${
                                  isDateField
                                    ? "[color-scheme:dark] [&::-webkit-calendar-picker-indicator]:invert"
                                    : ""
                                }`}
                                placeholder={
                                  isDateField
                                    ? ""
                                    : `Nhập ${label.toLowerCase()}...`
                                }
                                value={form[k as string] || ""}
                                onChange={(e) =>
                                  setForm((f: any) => ({
                                    ...f,
                                    [k as string]: e.target.value,
                                  }))
                                }
                                onBlur={() => markTouched(k as string)}
                              />
                              {touched[k as string] &&
                                (!form[k as string] ||
                                  String(form[k as string]).trim() === "") && (
                                  <span className="text-red-400 text-xs mt-1">
                                    Trường này bắt buộc
                                  </span>
                                )}
                              {touched[k as string] &&
                                form[k as string] &&
                                String(form[k as string]).trim() !== "" && (
                                  <>
                                    {k === "aCccd" &&
                                      validateCccd(form[k as string]) && (
                                        <span className="text-red-400 text-xs mt-1">
                                          {validateCccd(form[k as string])}
                                        </span>
                                      )}
                                    {k === "aPhone" &&
                                      validatePhone(form[k as string]) && (
                                        <span className="text-red-400 text-xs mt-1">
                                          {validatePhone(form[k as string])}
                                        </span>
                                      )}
                                  </>
                                )}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Thông tin Bên B - Client */}
                  <div className="dashboard-card border-teal-500/20">
                    <div className="card-header mb-4">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 w-full">
                        <div className="inline-flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-br from-teal-500/20 to-emerald-500/20 border border-teal-400/30">
                          <Star className="icon text-teal-300 w-5 h-5" />
                          <span className="text-teal-100 font-semibold text-base md:text-lg">
                            Bên B - Nhà Sản xuất
                          </span>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleGetVerifiedInfo}
                          disabled={loadingVerifiedInfo}
                          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-teal-600/80 to-emerald-600/80 hover:from-teal-500 hover:to-emerald-500 text-white font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-teal-500/30 w-full md:w-auto"
                        >
                          {loadingVerifiedInfo ? (
                            <>
                              <Loader className="w-4 h-4 animate-spin" />
                              <span>Đang tải...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Lấy từ xác thực</span>
                            </>
                          )}
                        </motion.button>
                      </div>
                    </div>

                    {/* Trường bắt buộc */}
                    <div className="mb-4">
                      <p className="text-xs text-teal-300/70 mb-3 flex items-center gap-1">
                        <AlertCircle size={12} />
                        Thông tin bắt buộc
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          ["bName", "Tên"],
                          ["bCccd", "Số CCCD"],
                          ["bCccdIssueDate", "Ngày cấp CCCD"],
                          ["bCccdIssuePlace", "Nơi cấp CCCD"],
                          ["bAddress", "Địa chỉ"],
                          ["bPhone", "Số điện thoại"],
                        ].map(([k, label]) => {
                          const isDateField = k === "bCccdIssueDate";
                          return (
                            <label
                              key={k as string}
                              className="flex flex-col gap-1.5"
                            >
                              <span className="text-teal-200/90 text-sm font-medium flex items-center gap-1">
                                {label} <span className="text-red-400">*</span>
                              </span>
                              <input
                                type={isDateField ? "date" : "text"}
                                className={`bg-white/5 border border-teal-400/30 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all ${
                                  isDateField
                                    ? "[color-scheme:dark] [&::-webkit-calendar-picker-indicator]:invert"
                                    : ""
                                }`}
                                placeholder={
                                  isDateField
                                    ? ""
                                    : `Nhập ${label.toLowerCase()}...`
                                }
                                value={form[k as string] || ""}
                                onChange={(e) =>
                                  setForm((f: any) => ({
                                    ...f,
                                    [k as string]: e.target.value,
                                  }))
                                }
                                onBlur={() => markTouched(k as string)}
                              />
                              {touched[k as string] &&
                                (!form[k as string] ||
                                  String(form[k as string]).trim() === "") && (
                                  <span className="text-red-400 text-xs mt-1">
                                    Trường này bắt buộc
                                  </span>
                                )}
                              {touched[k as string] &&
                                form[k as string] &&
                                String(form[k as string]).trim() !== "" && (
                                  <>
                                    {k === "bCccd" &&
                                      validateCccd(form[k as string]) && (
                                        <span className="text-red-400 text-xs mt-1">
                                          {validateCccd(form[k as string])}
                                        </span>
                                      )}
                                    {k === "bPhone" &&
                                      validatePhone(form[k as string]) && (
                                        <span className="text-red-400 text-xs mt-1">
                                          {validatePhone(form[k as string])}
                                        </span>
                                      )}
                                  </>
                                )}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Section 4: Hạng mục sản phẩm/dịch vụ */}
                  <div className="dashboard-card border-yellow-500/20 mt-6">
                    <div className="card-header mb-4">
                      <div className="inline-flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-400/30 w-full">
                        <Satellite className="icon text-yellow-300 w-5 h-5" />
                        <span className="text-yellow-100 font-semibold text-base md:text-lg">
                          Hạng Mục Sản Phẩm / Dịch Vụ
                        </span>
                      </div>
                      <div className="w-full">
                        <div className="mt-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-400/20 flex items-start gap-2">
                          <Info className="w-4 h-4 text-yellow-300 mt-0.5 flex-shrink-0" />
                          <p className="text-yellow-200/80 text-xs leading-relaxed">
                            <span className="font-semibold">Lưu ý:</span> Cần
                            tối thiểu{" "}
                            <span className="font-bold text-yellow-300">
                              1 hạng mục
                            </span>{" "}
                            và tối đa{" "}
                            <span className="font-bold text-yellow-300">
                              10 hạng mục
                            </span>
                            . Hạng mục đầu tiên là{" "}
                            <span className="font-semibold text-yellow-300">
                              bắt buộc
                            </span>{" "}
                            (đánh dấu <span className="text-red-400">*</span>).
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {form.lines.map((line: any, idx: number) => (
                        <div
                          key={idx}
                          className="relative bg-gradient-to-br from-gray-900/40 to-gray-800/20 border border-yellow-400/20 rounded-xl p-5 shadow-lg hover:shadow-[0_0_20px_rgba(234,179,8,0.3)] transition-all duration-300"
                        >
                          {/* Label hiển thị tên hạng mục */}
                          <div className="absolute -top-3 left-4 px-3 py-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/30 rounded-full">
                            <span className="text-yellow-300 font-bold text-xs">
                              Hạng mục {idx + 1}{" "}
                              {idx === 0 && (
                                <span className="text-red-400">*</span>
                              )}
                            </span>
                          </div>

                          <div className="space-y-4">
                            {/* 🪐 Tên hạng mục - Full width row */}
                            <label className="flex flex-col">
                              <span className="text-yellow-200/90 mb-1 font-medium flex items-center gap-1">
                                🪐 Tên hạng mục{" "}
                                {idx === 0 && (
                                  <span className="text-red-400">*</span>
                                )}
                              </span>
                              <input
                                placeholder="VD: Làm bản phối mới"
                                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-400 outline-none w-full"
                                value={line.item}
                                onChange={(e) =>
                                  setForm((f: any) => {
                                    const lines = [...f.lines];
                                    lines[idx].item = e.target.value;
                                    return { ...f, lines };
                                  })
                                }
                                onBlur={() => markLineTouched(idx, "item")}
                              />
                              {idx === 0 &&
                                lineTouched[idx]?.item &&
                                (!line.item ||
                                  String(line.item).trim() === "") && (
                                  <span className="text-red-400 text-xs mt-1">
                                    Trường này bắt buộc
                                  </span>
                                )}
                            </label>

                            {/* ⚙️ Đơn vị, 🔢 Số lượng, 💰 Đơn giá - One row */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {/* ⚙️ Đơn vị */}
                              <label className="flex flex-col">
                                <span className="text-yellow-200/90 mb-1 font-medium flex items-center gap-1">
                                  ⚙️ Đơn vị{" "}
                                  {idx === 0 && (
                                    <span className="text-red-400">*</span>
                                  )}
                                </span>
                                <input
                                  placeholder="VD: Track, Mixtape, Album,..."
                                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-400 outline-none"
                                  value={line.unit}
                                  onChange={(e) =>
                                    setForm((f: any) => {
                                      const lines = [...f.lines];
                                      lines[idx].unit = e.target.value;
                                      return { ...f, lines };
                                    })
                                  }
                                  onBlur={() => markLineTouched(idx, "unit")}
                                />
                                {idx === 0 &&
                                  lineTouched[idx]?.unit &&
                                  (!line.unit ||
                                    String(line.unit).trim() === "") && (
                                    <span className="text-red-400 text-xs mt-1">
                                      Trường này bắt buộc
                                    </span>
                                  )}
                              </label>

                              {/* 🔢 Số lượng */}
                              <label className="flex flex-col">
                                <span className="text-yellow-200/90 mb-1 font-medium flex items-center gap-1">
                                  🔢 Số lượng{" "}
                                  {idx === 0 && (
                                    <span className="text-red-400">*</span>
                                  )}
                                </span>
                                <input
                                  type="number"
                                  min="1"
                                  step="1"
                                  placeholder="VD: 5"
                                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-400 outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                                  value={line.qty}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    // Chỉ cho phép số nguyên dương
                                    if (
                                      val === "" ||
                                      (Number(val) > 0 &&
                                        Number.isInteger(Number(val)))
                                    ) {
                                      setForm((f: any) => {
                                        const lines = [...f.lines];
                                        lines[idx].qty = val;
                                        return { ...f, lines };
                                      });
                                    }
                                  }}
                                  onBlur={() => markLineTouched(idx, "qty")}
                                />
                                {idx === 0 &&
                                  lineTouched[idx]?.qty &&
                                  (!line.qty ||
                                    String(line.qty).trim() === "") && (
                                    <span className="text-red-400 text-xs mt-1">
                                      Trường này bắt buộc
                                    </span>
                                  )}
                              </label>

                              {/* 💰 Đơn giá */}
                              <label className="flex flex-col">
                                <span className="text-yellow-200/90 mb-1 font-medium flex items-center gap-1">
                                  💰 Đơn giá (VNĐ){" "}
                                  {idx === 0 && (
                                    <span className="text-red-400">*</span>
                                  )}
                                </span>
                                <input
                                  placeholder="VD: 1,000,000"
                                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-400 outline-none"
                                  value={line.price}
                                  onChange={(e) =>
                                    setForm((f: any) => {
                                      const lines = [...f.lines];
                                      lines[idx].price = e.target.value;
                                      return { ...f, lines };
                                    })
                                  }
                                  onBlur={() => markLineTouched(idx, "price")}
                                />
                                {idx === 0 &&
                                  lineTouched[idx]?.price &&
                                  (!line.price ||
                                    String(line.price).trim() === "") && (
                                    <span className="text-red-400 text-xs mt-1">
                                      Trường này bắt buộc
                                    </span>
                                  )}
                              </label>
                            </div>
                          </div>

                          {/* Tổng tiền cho hạng mục này */}
                          <div className="mt-2 pt-2 border-t border-yellow-400/10 flex items-center justify-between text-sm">
                            <span className="text-yellow-200/70">
                              Thành tiền
                            </span>
                            <span className="text-yellow-300 font-semibold">
                              {(() => {
                                const qty = Number(
                                  typeof line.qty === "string"
                                    ? line.qty
                                    : line.qty || 0
                                );
                                const price = parseCurrencyToNumber(line.price);
                                const amount =
                                  (Number.isFinite(qty) ? qty : 0) * price;
                                return amount.toLocaleString("vi-VN") + " VNĐ";
                              })()}
                            </span>
                          </div>

                          {/* Nút thêm và xóa - Phía dưới */}
                          <div className="flex items-center justify-between pt-2 border-t border-yellow-400/10">
                            {/* Bộ đếm */}
                            <span className="text-yellow-300/70 text-xs font-medium">
                              {form.lines.length}/10 hạng mục
                            </span>

                            {/* Nút thêm và xóa */}
                            <div className="flex items-center gap-2">
                              {/* Thêm sau hạng mục hiện tại */}
                              <button
                                onClick={() =>
                                  setForm((f: any) => {
                                    if (f.lines.length >= 10) {
                                      toast.error(
                                        "Bạn chỉ được thêm tối đa 10 hạng mục."
                                      );
                                      return f;
                                    }
                                    const newLine = {
                                      item: "",
                                      unit: "",
                                      qty: "",
                                      price: "",
                                    };
                                    const before = f.lines.slice(0, idx + 1);
                                    const after = f.lines.slice(idx + 1);
                                    return {
                                      ...f,
                                      lines: [...before, newLine, ...after],
                                    };
                                  })
                                }
                                disabled={form.lines.length >= 10}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-400/20 hover:bg-emerald-500/20 hover:border-emerald-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Thêm hạng mục"
                              >
                                <Plus size={14} className="text-emerald-400" />
                                <span className="text-emerald-400 text-xs font-medium">
                                  Thêm
                                </span>
                              </button>

                              {/* Xóa hạng mục hiện tại */}
                              <button
                                onClick={() =>
                                  setForm((f: any) => ({
                                    ...f,
                                    lines: f.lines.filter(
                                      (_: any, i: number) => i !== idx
                                    ),
                                  }))
                                }
                                disabled={form.lines.length === 1}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-400/20 hover:bg-red-500/20 hover:border-red-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Xóa hạng mục"
                              >
                                <X size={14} className="text-red-400" />
                                <span className="text-red-400 text-xs font-medium">
                                  Xóa
                                </span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Tổng tiền tất cả hạng mục */}
                      <div className="mt-4 p-4 rounded-lg bg-yellow-500/10 border border-yellow-400/20 flex items-center justify-between">
                        <span className="text-yellow-200/80 font-medium">
                          Tổng tiền tất cả hạng mục
                        </span>
                        <span className="text-yellow-300 font-bold text-lg">
                          {totalItemsAmount.toLocaleString("vi-VN")} VNĐ
                        </span>
                      </div>

                      {/* Nút thêm hạng mục đã được chuyển cạnh mỗi hạng mục */}
                    </div>
                  </div>

                  {/* Section 5: Phương thức thanh toán */}
                  <div className="dashboard-card border-indigo-500/20 mt-6">
                    <div className="card-header mb-4">
                      <div className="inline-flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-400/30 w-full">
                        <TimerReset className="icon text-indigo-300 w-5 h-5" />
                        <span className="text-indigo-100 font-semibold text-base md:text-lg">
                          Phương Thức Thanh Toán
                        </span>
                      </div>
                    </div>

                    {/* --- Payment Mode Selector (compact) --- */}
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <button
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all duration-300 ${
                            mode === "PAY_ONCE"
                              ? "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-[0_0_12px_rgba(139,92,246,0.5)]"
                              : "bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white"
                          }`}
                          onClick={() => {
                            setMode("PAY_ONCE");
                            setForm((f: any) => ({
                              ...f,
                              payOnce: true,
                              payMilestone: false,
                            }));
                          }}
                        >
                          <Sparkles size={16} />
                          Thanh toán Một lần
                        </button>

                        <button
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all duration-300 ${
                            mode === "MILESTONES"
                              ? "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-[0_0_12px_rgba(139,92,246,0.5)]"
                              : "bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white"
                          }`}
                          onClick={() => {
                            setMode("MILESTONES");
                            setForm((f: any) => ({
                              ...f,
                              payOnce: false,
                              payMilestone: true,
                            }));
                          }}
                        >
                          <TimerReset size={16} />
                          Theo cột mốc
                        </button>
                      </div>

                      {mode === "PAY_ONCE" && (
                        <div className="flex flex-wrap items-center gap-4 text-sm text-indigo-200/80">
                          <label className="flex items-center gap-3">
                            <span>
                              Số lượt sửa{" "}
                              <span className="text-red-400">*</span>
                            </span>
                            <input
                              type="number"
                              min={1}
                              step={1}
                              className="bg-white/10 border border-white/20 text-white rounded-lg px-3 py-1.5 w-24 focus:ring-2 focus:ring-indigo-400 outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                              value={form.fpEditAmount ?? ""}
                              onChange={(e) =>
                                setForm((f: any) => ({
                                  ...f,
                                  fpEditAmount: e.target.value,
                                }))
                              }
                              onBlur={() => markTouched("fpEditAmount")}
                            />
                          </label>
                          {touched["fpEditAmount"] &&
                            (!form.fpEditAmount ||
                              String(form.fpEditAmount).trim() === "") && (
                              <span className="text-red-400 text-xs">
                                Trường này bắt buộc
                              </span>
                            )}
                          {touched["fpEditAmount"] &&
                            form.fpEditAmount &&
                            String(form.fpEditAmount).trim() !== "" &&
                            (() => {
                              const edits = Number(form.fpEditAmount);
                              if (!Number.isInteger(edits) || edits <= 0) {
                                return (
                                  <span className="text-red-400 text-xs">
                                    Phải là số nguyên {">"} 0
                                  </span>
                                );
                              }
                              return null;
                            })()}
                          <label className="flex items-center gap-3">
                            <span>Tổng số lượng sản phẩm</span>
                            <input
                              type="number"
                              disabled
                              className="bg-white/10 border border-white/20 text-white/80 rounded-lg px-3 py-1.5 w-32 focus:outline-none cursor-not-allowed [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                              value={totalLinesQty}
                              readOnly
                            />
                          </label>
                        </div>
                      )}
                    </div>

                    {/* --- Milestones --- */}
                    {mode === "MILESTONES" && (
                      <div className="space-y-5 mt-2">
                        {/* Tổng hợp số tiền theo hạng mục và cột mốc */}
                        <div className="p-4 rounded-lg bg-indigo-500/10 border border-indigo-400/20">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-indigo-200/90">
                              Tổng tiền hạng mục
                            </span>
                            <span className="text-indigo-300 font-semibold">
                              {totalItemsAmount.toLocaleString("vi-VN")} VNĐ
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-indigo-200/90">
                              Tổng tiền các cột mốc đã nhập
                            </span>
                            <span className="text-indigo-300 font-semibold">
                              {totalMilestonesAmount.toLocaleString("vi-VN")}{" "}
                              VNĐ
                            </span>
                          </div>
                          {(() => {
                            const diff =
                              totalItemsAmount - totalMilestonesAmount;
                            const isBalanced = diff === 0;
                            const isOver = diff < 0;
                            return (
                              <div
                                className={`flex items-center justify-between text-sm mt-1 ${
                                  isBalanced
                                    ? "text-emerald-300"
                                    : isOver
                                    ? "text-red-300"
                                    : "text-amber-300"
                                }`}
                              >
                                <span>
                                  {isBalanced
                                    ? "Cân bằng"
                                    : isOver
                                    ? "Vượt quá"
                                    : "Còn thiếu"}
                                </span>
                                <span className="font-semibold">
                                  {Math.abs(diff).toLocaleString("vi-VN")} VNĐ
                                </span>
                              </div>
                            );
                          })()}
                          {/* Tổng số lượng sản phẩm theo cột mốc vs hạng mục */}
                          {(() => {
                            const productSum = (form.milestones || []).reduce(
                              (s: number, m: any) =>
                                s + (Number(m?.productCount) || 0),
                              0
                            );
                            const qDiff = totalLinesQty - productSum;
                            const qBalanced = qDiff === 0;
                            const qOver = qDiff < 0;
                            return (
                              <div className="mt-3 pt-3 border-t border-indigo-400/10 space-y-1">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-indigo-200/90">
                                    Tổng số lượng hạng mục
                                  </span>
                                  <span className="text-indigo-300 font-semibold">
                                    {totalLinesQty}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-indigo-200/90">
                                    Tổng số lượng theo cột mốc
                                  </span>
                                  <span className="text-indigo-300 font-semibold">
                                    {productSum}
                                  </span>
                                </div>
                                <div
                                  className={`flex items-center justify-between text-sm ${
                                    qBalanced
                                      ? "text-emerald-300"
                                      : qOver
                                      ? "text-red-300"
                                      : "text-amber-300"
                                  }`}
                                >
                                  <span>
                                    {qBalanced
                                      ? "Cân bằng"
                                      : qOver
                                      ? "Vượt quá"
                                      : "Còn thiếu"}
                                  </span>
                                  <span className="font-semibold">
                                    {Math.abs(qDiff)}
                                  </span>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                        {form.milestones.map((m: any, idx: number) => (
                          <div
                            key={idx}
                            className="relative bg-gradient-to-br from-gray-900/40 to-gray-800/20 border border-white/10 rounded-xl p-5 shadow-lg hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all duration-300"
                          >
                            {/* Nút xóa */}
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
                              title="Xóa cột mốc"
                            >
                              <X size={16} />
                            </button>

                            <div className="space-y-4">
                              {/* 🌟 Tiêu đề - Full width row */}
                              <label className="flex flex-col">
                                <span className="text-indigo-300 mb-1 font-medium">
                                  🌟 Tiêu đề cột mốc{" "}
                                  <span className="text-red-400">*</span>
                                </span>
                                <input
                                  placeholder="VD: Hoàn thành bản demo"
                                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-400 outline-none w-full"
                                  value={m.title}
                                  onChange={(e) =>
                                    setForm((f: any) => {
                                      const ms = [...f.milestones];
                                      ms[idx].title = e.target.value;
                                      return { ...f, milestones: ms };
                                    })
                                  }
                                />
                              </label>

                              {/* 📜 Mô tả - Full width row */}
                              <label className="flex flex-col">
                                <span className="text-indigo-300 mb-1 font-medium">
                                  📜 Mô tả chi tiết{" "}
                                  <span className="text-red-400">*</span>
                                </span>
                                <input
                                  placeholder="VD: Nộp bản phối hoàn chỉnh"
                                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-400 outline-none w-full"
                                  value={m.description}
                                  onChange={(e) =>
                                    setForm((f: any) => {
                                      const ms = [...f.milestones];
                                      ms[idx].description = e.target.value;
                                      return { ...f, milestones: ms };
                                    })
                                  }
                                />
                              </label>

                              {/* 💰 Số tiền, 🗓 Hạn, 🛠 Số vòng sửa, 📦 Số SP - One row */}
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                {/* 💰 Số tiền */}
                                <label className="flex flex-col">
                                  <span className="text-indigo-300 mb-1 font-medium">
                                    💰 Số tiền (VNĐ){" "}
                                    <span className="text-red-400">*</span>
                                  </span>
                                  <input
                                    placeholder="VD: 2,000,000"
                                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-400 outline-none"
                                    value={m.amount}
                                    onChange={(e) =>
                                      setForm((f: any) => {
                                        const ms = [...f.milestones];
                                        ms[idx].amount = e.target.value;
                                        return { ...f, milestones: ms };
                                      })
                                    }
                                  />
                                </label>

                                {/* 🗓 Hạn */}
                                <label className="flex flex-col">
                                  <span className="text-indigo-300 mb-1 font-medium">
                                    🗓 Hạn{" "}
                                    <span className="text-red-400">*</span>
                                  </span>
                                  <input
                                    type="date"
                                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-400 outline-none [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:invert"
                                    value={m.dueDate}
                                    onChange={(e) =>
                                      setForm((f: any) => {
                                        const ms = [...f.milestones];
                                        ms[idx].dueDate = e.target.value;
                                        return { ...f, milestones: ms };
                                      })
                                    }
                                  />
                                  {(() => {
                                    if (!m.dueDate) return null;
                                    const current = new Date(m.dueDate);
                                    if (Number.isNaN(current.getTime()))
                                      return (
                                        <span className="text-red-400 text-xs mt-1">
                                          Ngày không hợp lệ
                                        </span>
                                      );
                                    current.setHours(0, 0, 0, 0);
                                    if (idx === 0) {
                                      const today = new Date();
                                      today.setHours(0, 0, 0, 0);
                                      if (
                                        !(current.getTime() > today.getTime())
                                      ) {
                                        return (
                                          <span className="text-red-400 text-xs mt-1">
                                            Hạn cột mốc 1 phải sau ngày hiện tại
                                          </span>
                                        );
                                      }
                                    } else {
                                      const prevStr =
                                        form.milestones[idx - 1]?.dueDate;
                                      if (prevStr) {
                                        const prev = new Date(prevStr);
                                        prev.setHours(0, 0, 0, 0);
                                        if (
                                          !(current.getTime() > prev.getTime())
                                        ) {
                                          return (
                                            <span className="text-red-400 text-xs mt-1">
                                              Hạn phải sau cột mốc {idx}
                                            </span>
                                          );
                                        }
                                      }
                                    }
                                    return null;
                                  })()}
                                </label>

                                {/* 🛠 Số vòng sửa */}
                                <label className="flex flex-col">
                                  <span className="text-indigo-300 mb-1 font-medium">
                                    🛠 Số lượt sửa{" "}
                                    <span className="text-red-400">*</span>
                                  </span>
                                  <input
                                    type="number"
                                    min={1}
                                    step={1}
                                    placeholder="VD: 2"
                                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-400 outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                                    value={m.editCount ?? ""}
                                    onChange={(e) =>
                                      setForm((f: any) => {
                                        const ms = [...f.milestones];
                                        ms[idx].editCount = e.target.value;
                                        return { ...f, milestones: ms };
                                      })
                                    }
                                  />
                                </label>

                                {/* 📦 Số SP cho cột mốc */}
                                <label className="flex flex-col">
                                  <span className="text-indigo-300 mb-1 font-medium">
                                    📦 SL sản phẩm{" "}
                                    <span className="text-red-400">*</span>
                                  </span>
                                  <input
                                    type="number"
                                    min={1}
                                    step={1}
                                    placeholder="VD: 3"
                                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-400 outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                                    value={m.productCount ?? ""}
                                    onChange={(e) =>
                                      setForm((f: any) => {
                                        const ms = [...f.milestones];
                                        ms[idx].productCount = e.target.value;
                                        return { ...f, milestones: ms };
                                      })
                                    }
                                  />
                                </label>
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Button thêm cột mốc - compact trong ô */}
                        <div className="flex justify-end">
                          <button
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gradient-to-r from-purple-600/80 via-indigo-500/80 to-blue-500/80 text-white font-medium rounded-lg hover:from-purple-600 hover:via-indigo-500 hover:to-blue-500 transition-all duration-200"
                            onClick={() => {
                              if (form.milestones.length >= 10) {
                                toast.error(
                                  "Bạn chỉ được thêm tối đa 10 hạng mục."
                                );
                                return;
                              }
                              setForm((f: any) => ({
                                ...f,
                                milestones: [
                                  ...f.milestones,
                                  {
                                    title: "",
                                    description: "",
                                    amount: "",
                                    dueDate: "",
                                    editCount: "1",
                                    productCount: "",
                                  },
                                ],
                              }));
                            }}
                          >
                            <Sparkles size={14} />
                            Thêm cột mốc
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Section 6: Phần trăm VAT */}
                  <div className="dashboard-card border-cyan-500/20 mt-6">
                    <div className="card-header mb-4">
                      <div className="inline-flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 w-full">
                        <Rocket className="icon text-cyan-300 w-5 h-5" />
                        <span className="text-cyan-100 font-semibold text-base md:text-lg">
                          Phần Trăm Đền Bù
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <label className="flex flex-col gap-1.5">
                        <span className="text-indigo-200/90 text-sm font-medium flex items-center gap-1">
                          Phần trăm (%) <span className="text-red-400">*</span>
                        </span>
                        <input
                          type="text"
                          className="bg-white/5 border border-cyan-400/30 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                          placeholder="Ví dụ: 8"
                          value={form.percent || ""}
                          onChange={(e) =>
                            setForm((f: any) => ({
                              ...f,
                              percent: e.target.value,
                            }))
                          }
                          onBlur={() => markTouched("percent")}
                        />
                        {touched["percent"] &&
                          (!form.percent ||
                            String(form.percent).trim() === "") && (
                            <span className="text-red-400 text-xs mt-1">
                              Trường này bắt buộc
                            </span>
                          )}
                      </label>
                    </div>
                  </div>

                  {/* Section 7: Điều khoản bổ sung */}
                  <div className="dashboard-card border-pink-500/20 mt-6">
                    <div className="card-header mb-4">
                      <div className="inline-flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-br from-pink-500/20 to-rose-500/20 border border-pink-400/30 w-full">
                        <FileText className="icon text-pink-300 w-5 h-5" />
                        <span className="text-pink-100 font-semibold text-base md:text-lg">
                          Điều Khoản Bổ Sung (Tùy chọn)
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {form.additionalTerms.map((term: string, idx: number) => (
                        <div
                          key={idx}
                          className="relative bg-gradient-to-br from-gray-900/40 to-gray-800/20 border border-pink-400/20 rounded-xl p-4"
                        >
                          {form.additionalTerms.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                setForm((f: any) => ({
                                  ...f,
                                  additionalTerms: f.additionalTerms.filter(
                                    (_: any, i: number) => i !== idx
                                  ),
                                }));
                              }}
                              className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-400/20 hover:border-red-400/40 transition-all duration-200 group"
                              title="Xóa điều khoản"
                            >
                              <X
                                size={14}
                                className="text-red-400 group-hover:text-red-300 transition-colors"
                              />
                            </button>
                          )}

                          <label className="flex flex-col gap-2">
                            <span className="text-pink-200/80 text-xs font-medium">
                              Điều khoản {idx + 9}
                            </span>
                            <textarea
                              className="bg-white/5 border border-pink-400/20 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50 resize-y min-h-[80px] pr-12"
                              placeholder={`Nhập nội dung điều khoản ${
                                idx + 9
                              }...\nVí dụ: Lịch giao nhận sản phẩm, nghĩa vụ bảo mật, v.v.`}
                              value={term}
                              onChange={(e) => {
                                const newTerms = [...form.additionalTerms];
                                newTerms[idx] = e.target.value;
                                setForm((f: any) => ({
                                  ...f,
                                  additionalTerms: newTerms,
                                }));
                              }}
                            />
                          </label>
                        </div>
                      ))}

                      {form.additionalTerms.length === 0 && (
                        <div className="text-center py-8 text-gray-400 text-sm">
                          <p>
                            Chưa có điều khoản nào. Nhấn "Thêm điều khoản" để
                            bắt đầu.
                          </p>
                        </div>
                      )}

                      {/* Button thêm điều khoản - đặt dưới cùng */}
                      <div className="flex items-center justify-end pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setForm((f: any) => ({
                              ...f,
                              additionalTerms: [
                                ...(f.additionalTerms || []),
                                "",
                              ],
                            }));
                          }}
                          className="flex items-center gap-2 px-3 py-1.5 text-xs bg-gradient-to-r from-pink-600/80 to-rose-600/80 hover:from-pink-500 hover:to-rose-500 text-white font-medium rounded-lg transition-all duration-200"
                        >
                          <Sparkles size={14} />
                          Thêm điều khoản
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* --- Action Buttons --- */}
                  <div className="mt-8 flex flex-wrap gap-4 justify-center">
                    <button
                      disabled={
                        !canCreate || loading || Boolean(validationMessage)
                      }
                      className="flex items-center gap-2 px-10 py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg hover:scale-105 transition-all disabled:opacity-50"
                      onClick={onFill}
                    >
                      <Sparkles size={18} />
                      {loading ? "Đang tạo..." : "Tạo Giao Ước"}
                    </button>
                  </div>
                  {validationMessage && (
                    <p className="mt-2 text-center text-red-400 text-sm">
                      {validationMessage}
                    </p>
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
                    {pdfBlobUrl ? (
                      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                        <Viewer fileUrl={pdfBlobUrl} />
                      </Worker>
                    ) : metadata?.documentUrl ? (
                      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                        <Viewer fileUrl={metadata.documentUrl} />
                      </Worker>
                    ) : (
                      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                        <Viewer fileUrl={defaultPdfUrl} />
                      </Worker>
                    )}
                  </div>
                </div>
              </section>
            </>
          )}
        </div>
      </div>

      {/* Modal xác thực CCCD */}
      <ConfirmModal
        show={showVerificationModal}
        title="Chưa xác thực CCCD"
        message="Tài khoản chưa xác thực CCCD. Vui lòng xác thực trước khi sử dụng tính năng này."
        confirmText="Đi đến xác thực"
        cancelText="Đóng"
        confirmButtonClass="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500"
        icon={
          <div className="p-2 rounded-lg bg-teal-500/20 border border-teal-500/50">
            <AlertCircle size={24} className="text-teal-400" />
          </div>
        }
        onClose={() => setShowVerificationModal(false)}
        onConfirm={handleGoToVerification}
      />

      <style>{`
        .dashboard-card { @apply bg-black/30 backdrop-blur-xl border border-white/10 rounded-3xl p-5; }
        .card-header { @apply flex items-center gap-3; }
        .card-title { @apply text-xl font-bold; }
        .card-description { @apply text-indigo-200/80 text-sm; }
        .btn-primary-glow { @apply inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90 transition; }
        .btn-secondary-glow { @apply inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 border border-white/10 hover:bg-white/15 transition; }
        .icon { @apply w-6 h-6; }
      `}</style>
    </div>
  );
}
