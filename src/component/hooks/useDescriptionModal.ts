import { useState, useEffect, useRef } from "react";
import { DropResult } from "@hello-pangea/dnd";
import { useCosmicToast } from "@/component/toast/CosmicToastProvider";
import projectService from "@/services/projectService";
import {
  descriptionService,
  MilestoneBriefScope,
  MilestoneBriefUpsertRequest,
} from "@/services/descriptionService";

// --- Interfaces & Types ---
export interface Block {
  id?: number;
  content: string;
  type: "DESCRIPTION" | "HARMONY" | "IMAGE" | "HUM_MELODY";
  label?: string;
  position?: number;
  harmony?: string;
  previewUrl?: string;
  file?: File;
}

export interface Section {
  id: number;
  title: string;
  blocks: Block[];
}

export type RoleType = "CLIENT" | "OWNER" | "COLLABORATOR" | "OBSERVER" | null;

// --- Constants ---
export const BLOCK_TITLES: Record<Block["type"], string> = {
  DESCRIPTION: "Mô tả",
  HARMONY: "Hòa âm",
  IMAGE: "Hình ảnh",
  HUM_MELODY: "Hum / Melody",
};

export const BLOCK_OPTIONS = [
  { type: "DESCRIPTION", label: "Mô tả", icon: "📝" },
  { type: "HARMONY", label: "Hòa âm", icon: "🎼" },
  { type: "IMAGE", label: "Ảnh", icon: "🖼️" },
  { type: "HUM_MELODY", label: "Giai điệu", icon: "🗣️" },
];

// Hợp âm trưởng (Major)
export const MAJOR_CHORDS = [
  "C",
  "C7",
  "Cmaj7",
  "D",
  "D7",
  "Dmaj7",
  "E",
  "E7",
  "Emaj7",
  "F",
  "F7",
  "Fmaj7",
  "G",
  "G7",
  "Gmaj7",
  "A",
  "A7",
  "Amaj7",
  "B",
  "B7",
  "Bmaj7",
];

// Hợp âm thứ (Minor)
export const MINOR_CHORDS = [
  "Cm",
  "Cm7",
  "Dm",
  "Dm7",
  "Em",
  "Em7",
  "Fm",
  "Fm7",
  "Gm",
  "Gm7",
  "Am",
  "Am7",
  "Bm",
  "Bm7",
];

// Tất cả hợp âm (để tương thích ngược)
export const ALL_CHORDS = [...MAJOR_CHORDS, ...MINOR_CHORDS];

let newSectionCounter = 0;
let newBlockCounter = 0;

export type BriefScope = "EXTERNAL" | "INTERNAL";

export const useDescriptionModal = (
  projectId: number,
  milestoneId: number,
  isOpen: boolean,
  initialScope: BriefScope = "EXTERNAL"
) => {
  // --- State ---
  const [sections, setSections] = useState<Section[]>([]);
  const [role, setRole] = useState<RoleType>(null);
  const [loading, setLoading] = useState(false);
  const [savingAction, setSavingAction] = useState<
    "CREATE" | "UPDATE" | "FORWARD" | null
  >(null);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [viewInternal, setViewInternal] = useState(initialScope === "INTERNAL");

  // State quản lý thay đổi
  const [originalData, setOriginalData] = useState<string>("");
  const [isDirty, setIsDirty] = useState(false);

  // State quản lý UI
  const [isEditMode, setIsEditMode] = useState(false); // Mặc định chỉ xem
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [isManageMode, setIsManageMode] = useState(false);
  const [pendingForward, setPendingForward] = useState(false); // Flag để biết có cần forward sau khi lưu không
  const [selectedDeleteIds, setSelectedDeleteIds] = useState<Set<number>>(
    new Set()
  );

  // Reset edit mode khi đóng modal, chuyển phòng, hoặc chọn section mới
  useEffect(() => {
    if (!isOpen) {
      setIsEditMode(false);
    }
  }, [isOpen]);

  useEffect(() => {
    // Khi chuyển phòng, reset edit mode
    setIsEditMode(false);
  }, [viewInternal]);

  useEffect(() => {
    // Khi chọn section: nếu là section mới (chưa lưu) thì tự động vào chế độ edit
    if (selectedSection) {
      const isNewSection = selectedSection.id > 1000000000000;
      setIsEditMode(isNewSection);
    } else {
      setIsEditMode(false);
    }
  }, [selectedSection?.id]);

  const { showToast } = useCosmicToast();
  const mainRef = useRef<HTMLDivElement>(null);

  // --- Helpers ---
  const normalizeFileKey = (urlOrKey: string) => {
    if (!urlOrKey) return "";
    if (urlOrKey.startsWith("http")) {
      try {
        const urlObj = new URL(urlOrKey);
        return urlObj.pathname.startsWith("/")
          ? urlObj.pathname.slice(1)
          : urlObj.pathname;
      } catch (e) {
        return urlOrKey;
      }
    }
    return urlOrKey;
  };

  const validateSections = (): boolean => {
    // Kiểm tra cơ bản: Phải có ít nhất 1 section
    if (sections.length === 0) {
      showToast("Vui lòng thêm ít nhất một mục mô tả!", "error");
      return false;
    }

    let isValid = true;
    for (const sec of sections) {
      // Kiểm tra section có tiêu đề (tùy theo yêu cầu nghiệp vụ)
      if (!sec.title || sec.title.trim() === "") {
        showToast("Tiêu đề mục mô tả không được để trống.", "error");
        isValid = false;
        break;
      }

      // Kiểm tra ít nhất 1 block (tùy theo yêu cầu nghiệp vụ)
      if (sec.blocks.length === 0) {
        showToast(
          `Mục "${sec.title}" phải có ít nhất một nội dung (block).`,
          "error"
        );
        isValid = false;
        break;
      }

      // Kiểm tra nội dung block (tùy theo yêu cầu nghiệp vụ)
      for (const block of sec.blocks) {
        // Block văn bản và Harmony không được rỗng
        if (
          (block.type === "DESCRIPTION" || block.type === "HARMONY") &&
          (!block.content || block.content.trim() === "")
        ) {
          showToast(
            `Nội dung cho block ${BLOCK_TITLES[block.type]} trong mục "${
              sec.title
            }" không được để trống.`,
            "error"
          );
          isValid = false;
          break;
        }
        // Block file (IMAGE/HUM_MELODY) phải có content (file key) HOẶC đang chờ upload (có `file`)
        if (
          (block.type === "IMAGE" || block.type === "HUM_MELODY") &&
          (!block.content || block.content.trim() === "") &&
          !block.file
        ) {
          showToast(
            `Block ${BLOCK_TITLES[block.type]} trong mục "${
              sec.title
            }" chưa có file.`,
            "error"
          );
          isValid = false;
          break;
        }
      }
      if (!isValid) break;
    }

    return isValid;
  };

  // --- Effects ---
  // 1. Dirty Check
  useEffect(() => {
    if (sections.length > 0 && originalData) {
      const currentData = JSON.stringify(sections);
      setIsDirty(currentData !== originalData);
    } else if (sections.length === 0 && originalData === "[]") {
      setIsDirty(false);
    }
  }, [sections, originalData]);

  // 2. Load Role khi mở modal
  useEffect(() => {
    if (isOpen) {
      loadUserRole();
    }
  }, [projectId, isOpen]);

  // 3. Load Data khi Role/View thay đổi
  useEffect(() => {
    if (role && isOpen) {
      // Đồng bộ viewInternal với initialScope
      setViewInternal(initialScope === "INTERNAL");
      loadSections();
    }
  }, [role, milestoneId, viewInternal, isOpen, initialScope]);

  // --- API Loaders ---
  const loadUserRole = async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const permission = await projectService.getProjectPermissionByProjectId(
        Number(projectId)
      );
      // ProjectPermissionResponse has role.projectRole (nested in role object)
      const r = permission?.role?.projectRole;

      const normalizedRole = r ? String(r).toUpperCase() : "";

      if (
        normalizedRole === "CLIENT" ||
        normalizedRole === "OWNER" ||
        normalizedRole === "COLLABORATOR" ||
        normalizedRole === "OBSERVER"
      ) {
        setRole(normalizedRole as RoleType);
      } else {
        setRole(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadSections = async () => {
    if (!projectId || !milestoneId || !role) return;
    setLoading(true);
    try {
      let res;
      // Chọn API dựa trên View (EXTERNAL hay INTERNAL)
      if (viewInternal) {
        // INTERNAL: Owner và Milestone Members (COLLABORATOR/OBSERVER trong milestone) xem được
        res = await descriptionService.getInternalMilestoneBrief(
          Number(projectId),
          Number(milestoneId)
        );
      } else {
        // EXTERNAL: Owner, Client, OBSERVER đều xem được
        res = await descriptionService.getMilestoneBrief(
          Number(projectId),
          Number(milestoneId)
        );
      }

      // Map dữ liệu từ API về cấu trúc Frontend
      const mappedGroups = await Promise.all(
        res.groups.map(async (g: any, gIdx: number) => {
          const mappedBlocks = await Promise.all(
            (g.blocks || []).map(async (b: any, idx: number) => {
              const frontendType =
                b.type === "DESCRIPTION" ||
                b.type === "HARMONY" ||
                b.type === "IMAGE" ||
                b.type === "HUM_MELODY"
                  ? b.type
                  : "DESCRIPTION";

              let resolvedPreviewUrl = undefined;

              // Lấy URL file nếu cần
              if (
                (frontendType === "IMAGE" || frontendType === "HUM_MELODY") &&
                b.content &&
                b.content.trim() !== ""
              ) {
                try {
                  resolvedPreviewUrl = await descriptionService.getBriefFileUrl(
                    Number(projectId),
                    Number(milestoneId),
                    b.content
                  );
                } catch (error) {
                  resolvedPreviewUrl = b.content;
                }
              } else if (
                frontendType === "IMAGE" ||
                frontendType === "HUM_MELODY"
              ) {
                resolvedPreviewUrl = b.content;
              }
              return {
                id: b.id ?? Date.now() + newBlockCounter++ + idx,
                content: b.content ?? "",
                type: frontendType,
                label:
                  frontendType === "HUM_MELODY"
                    ? b.label ?? b.content?.split("/").pop()
                    : b.label,
                position: b.position ?? idx,
                harmony: frontendType === "HARMONY" ? b.content : undefined,
                previewUrl: resolvedPreviewUrl,
              };
            })
          );
          return {
            id: g.id ?? Date.now() + newSectionCounter++ + gIdx,
            title: g.title ?? `Section ${gIdx + 1}`,
            blocks: mappedBlocks,
          };
        })
      );

      setSections(mappedGroups);
      setOriginalData(JSON.stringify(mappedGroups));

      // Giữ selection nếu có thể
      if (mappedGroups.length > 0 && !selectedSection) {
        setSelectedSection(mappedGroups[0]);
      }
      if (selectedSection) {
        const found = mappedGroups.find(
          (g: any) => g.id === selectedSection.id
        );
        if (found) setSelectedSection(found);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- Local Actions (UI Updates) ---
  const updateBlockContent = (secId: number, bId: number, content: string) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === secId
          ? {
              ...s,
              blocks: s.blocks.map((b) =>
                b.id === bId ? { ...b, content } : b
              ),
            }
          : s
      )
    );
    setSelectedSection((prev) =>
      prev?.id === secId
        ? {
            ...prev,
            blocks: prev.blocks.map((b) =>
              b.id === bId ? { ...b, content } : b
            ),
          }
        : prev
    );
  };

  const updateSectionTitle = (secId: number, newTitle: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === secId ? { ...s, title: newTitle } : s))
    );
    if (selectedSection?.id === secId) {
      setSelectedSection({ ...selectedSection, title: newTitle });
    }
  };

  const addSection = () => {
    // EXTERNAL: Owner và Client được tạo
    // INTERNAL: Chỉ Owner được tạo
    if (viewInternal && role !== "OWNER") {
      showToast("Bạn không có quyền tạo mô tả nội bộ", "error");
      return;
    }
    if (!viewInternal && role !== "OWNER" && role !== "CLIENT") {
      showToast("Bạn không có quyền tạo mô tả", "error");
      return;
    }

    // Tạo section mới
    const newSection: Section = {
      id: Date.now() + newSectionCounter++,
      title: "",
      blocks: [
        {
          id: Date.now() + newBlockCounter++,
          content: "",
          type: "DESCRIPTION",
        },
      ],
    };

    setSections((prev) => [...prev, newSection]);

    // Tự động chọn section mới và vào chế độ chỉnh sửa
    setSelectedSection(newSection);
    setIsEditMode(true); // Tự động vào chế độ chỉnh sửa khi tạo mới

    setTimeout(() => {
      mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  };

  const addBlock = (sectionId: number, type: Block["type"]) => {
    const newBlock = { id: Date.now() + newBlockCounter++, content: "", type };
    setSections((prev) =>
      prev.map((sec) =>
        sec.id === sectionId
          ? { ...sec, blocks: [...sec.blocks, newBlock] }
          : sec
      )
    );
    if (selectedSection?.id === sectionId) {
      setSelectedSection({
        ...selectedSection,
        blocks: [...selectedSection!.blocks, newBlock],
      });
    }
  };

  const deleteBlock = (sectionId: number, blockId: number | undefined) => {
    if (!blockId) return;
    setSections((prev) =>
      prev.map((sec) =>
        sec.id === sectionId
          ? {
              ...sec,
              blocks: sec.blocks.filter((b) => b.id !== blockId),
            }
          : sec
      )
    );
    if (selectedSection?.id === sectionId) {
      setSelectedSection({
        ...selectedSection,
        blocks: selectedSection!.blocks.filter((b) => b.id !== blockId),
      });
    }
  };

  const toggleDeleteSelection = (id: number) => {
    const newSet = new Set(selectedDeleteIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedDeleteIds(newSet);
  };

  // --- API Actions ---

  // 1. DELETE Single Section
  const deleteSection = async (sectionId: number) => {
    if (!projectId || !milestoneId) return;
    // EXTERNAL: Owner và Client được xóa
    // INTERNAL: Chỉ Owner được xóa
    if (viewInternal && role !== "OWNER") {
      showToast("Bạn không có quyền xóa mô tả nội bộ", "error");
      return;
    }
    if (!viewInternal && role !== "OWNER" && role !== "CLIENT") {
      showToast("Bạn không có quyền xóa mô tả", "error");
      return;
    }

    const section = sections.find((s) => s.id === sectionId);
    if (!section) return;

    const confirmDelete = window.confirm(
      `Bạn có chắc muốn xóa mô tả "${section.title || "Không tiêu đề"}"?`
    );
    if (!confirmDelete) return;

    // Xóa Draft (chưa lưu DB)
    const isDraftSection = sectionId > 1000000000000;
    if (isDraftSection) {
      setSections((prev) => prev.filter((s) => s.id !== sectionId));
      if (selectedSection?.id === sectionId) setSelectedSection(null);
      showToast("Đã xóa bản nháp ✅", "success");
      return;
    }

    try {
      if (viewInternal) {
        await descriptionService.deleteInternalBriefGroup(
          Number(projectId),
          Number(milestoneId),
          sectionId
        );
      } else {
        await descriptionService.deleteBriefGroup(
          Number(projectId),
          Number(milestoneId),
          sectionId
        );
      }
      setSections((prev) => prev.filter((s) => s.id !== sectionId));
      if (selectedSection?.id === sectionId) setSelectedSection(null);
      showToast("Xóa mô tả thành công ✅", "success");
    } catch (err) {
      console.error("Lỗi xoá mô tả:", err);
      showToast("Không thể xóa mô tả", "error");
    }
  };

  // 2. BULK DELETE
  const handleBulkDelete = async () => {
    if (selectedDeleteIds.size === 0) return;
    const confirm = window.confirm(
      `Bạn có chắc muốn xóa ${selectedDeleteIds.size} mục đã chọn?`
    );
    if (!confirm) return;

    setLoading(true);
    try {
      const idsToDelete = Array.from(selectedDeleteIds);
      await Promise.all(
        idsToDelete.map(async (id) => {
          const isDraft = id > 1000000000000;
          if (isDraft) return;
          if (viewInternal) {
            await descriptionService.deleteInternalBriefGroup(
              Number(projectId),
              Number(milestoneId),
              id
            );
          } else {
            await descriptionService.deleteBriefGroup(
              Number(projectId),
              Number(milestoneId),
              id
            );
          }
        })
      );
      setSections((prev) => prev.filter((s) => !selectedDeleteIds.has(s.id)));
      if (selectedSection && selectedDeleteIds.has(selectedSection.id)) {
        setSelectedSection(null);
      }
      showToast(
        `Đã xóa ${selectedDeleteIds.size} mục thành công ✅`,
        "success"
      );
      setIsDeleteMode(false);
      setSelectedDeleteIds(new Set());
    } catch (error) {
      console.error(error);
      showToast("Có lỗi xảy ra khi xóa", "error");
    } finally {
      setLoading(false);
    }
  };

  // 3. UPLOAD FILE
  const handleUploadImage = async (
    sectionId: number,
    blockId: number,
    file: File
  ) => {
    try {
      if (!projectId || !milestoneId) return;
      const fileKey = await descriptionService.uploadBriefFile(
        Number(projectId),
        Number(milestoneId),
        file,
        "IMAGE"
      );
      const viewableUrl = await descriptionService.getBriefFileUrl(
        Number(projectId),
        Number(milestoneId),
        fileKey
      );

      setSections((prev) =>
        prev.map((sec) =>
          sec.id === sectionId
            ? {
                ...sec,
                blocks: sec.blocks.map((b) =>
                  b.id === blockId
                    ? {
                        ...b,
                        file: undefined,
                        previewUrl: viewableUrl,
                        content: fileKey,
                      }
                    : b
                ),
              }
            : sec
        )
      );
      setSelectedSection((prev) =>
        prev && prev.id === sectionId
          ? {
              ...prev,
              blocks: prev.blocks.map((b) =>
                b.id === blockId
                  ? {
                      ...b,
                      file: undefined,
                      previewUrl: viewableUrl,
                      content: fileKey,
                    }
                  : b
              ),
            }
          : prev
      );
      showToast("Upload ảnh thành công 🚀", "success");
    } catch (err) {
      console.error(err);
      showToast("Lỗi upload ảnh", "error");
    }
  };

  const handleUploadMelody = async (
    sectionId: number,
    blockId: number,
    file: File
  ) => {
    try {
      if (!projectId || !milestoneId) return;
      const fileKey = await descriptionService.uploadBriefFile(
        Number(projectId),
        Number(milestoneId),
        file,
        "HUM_MELODY"
      );
      const viewableUrl = await descriptionService.getBriefFileUrl(
        Number(projectId),
        Number(milestoneId),
        fileKey
      );
      const fileName = fileKey.split("/").pop() || "melody";

      setSections((prev) =>
        prev.map((sec) =>
          sec.id === sectionId
            ? {
                ...sec,
                blocks: sec.blocks.map((b) =>
                  b.id === blockId
                    ? {
                        ...b,
                        file: undefined,
                        previewUrl: viewableUrl,
                        content: fileKey,
                        label: fileName,
                      }
                    : b
                ),
              }
            : sec
        )
      );
      setSelectedSection((prev) =>
        prev && prev.id === sectionId
          ? {
              ...prev,
              blocks: prev.blocks.map((b) =>
                b.id === blockId
                  ? {
                      ...b,
                      file: undefined,
                      previewUrl: viewableUrl,
                      content: fileKey,
                      label: fileName,
                    }
                  : b
              ),
            }
          : prev
      );
      showToast("Upload melody thành công 🎤", "success");
    } catch (err) {
      console.error(err);
      showToast("Lỗi upload melody", "error");
    }
  };

  // --- PAYLOAD PREPARATION (Shared Logic) ---
  const preparePayload = async (
    forCreate: boolean = false,
    overrideScope?: MilestoneBriefScope
  ): Promise<MilestoneBriefUpsertRequest | null> => {
    if (!projectId || !milestoneId || !role) return null;
    if (!validateSections()) return null;

    // Upload các file còn sót (file từ input nhưng chưa được xử lý qua hàm handleUpload riêng)
    // Trường hợp này xảy ra nếu người dùng vừa chọn file xong bấm Lưu ngay lập tức
    for (const sec of sections) {
      for (const b of sec.blocks) {
        if ((b.type === "IMAGE" || b.type === "HUM_MELODY") && b.file) {
          const uploadedKey = await descriptionService.uploadBriefFile(
            Number(projectId),
            Number(milestoneId),
            b.file,
            b.type
          );
          b.content = uploadedKey;
          b.previewUrl = uploadedKey;
          b.label = uploadedKey.split("/").pop();
          delete b.file;
        }
      }
    }

    let sectionsToSend = sections;
    if (forCreate) {
      // Nếu là Create, chỉ lấy các section mới (ID tạm)
      sectionsToSend = sections.filter((s) => s.id > 1000000000000);
      if (sectionsToSend.length === 0) {
        showToast("Không có mô tả mới nào để tạo", "error");
        return null;
      }
    }

    // Logic xác định Scope
    let currentScope = viewInternal
      ? MilestoneBriefScope.INTERNAL
      : MilestoneBriefScope.EXTERNAL;
    if (overrideScope) currentScope = overrideScope;

    // Logic Clone: Bỏ ID nếu đang clone từ External sang Internal hoặc Tạo mới
    const shouldDropIds =
      (overrideScope === MilestoneBriefScope.INTERNAL && !viewInternal) ||
      forCreate;

    return {
      scope: currentScope,
      groups: sectionsToSend.map((sec) => ({
        id: shouldDropIds ? undefined : sec.id,
        title: sec.title,
        blocks: sec.blocks
          .filter((b) =>
            ["DESCRIPTION", "HARMONY", "IMAGE", "HUM_MELODY"].includes(b.type)
          )
          .map((b, idx) => ({
            id: shouldDropIds
              ? undefined
              : typeof b.id === "number"
              ? b.id
              : undefined,
            content: normalizeFileKey(b.content || ""),
            type: b.type as any,
            label: b.label,
            position: b.position ?? idx,
          })),
      })),
    };
  };

  // 4. CREATE
  const handleCreate = async () => {
    // EXTERNAL: Owner và Client được tạo
    // INTERNAL: Chỉ Owner được tạo (nhưng không dùng CREATE ở INTERNAL, dùng UPDATE)
    if (viewInternal) {
      showToast(
        "Phòng nội bộ không hỗ trợ tạo mới trực tiếp. Vui lòng forward từ phòng khách hàng.",
        "error"
      );
      return;
    }
    if (role !== "OWNER" && role !== "CLIENT") {
      showToast("Bạn không có quyền tạo mô tả", "error");
      return;
    }

    const payload = await preparePayload(true);
    if (!payload) return;

    setSavingAction("CREATE");
    try {
      await descriptionService.createBriefGroups(
        Number(projectId),
        Number(milestoneId),
        payload
      );
      showToast("Tạo mô tả thành công 🎉", "success");
      await loadSections();
      setIsEditMode(false); // Chuyển về chế độ xem sau khi lưu thành công
    } catch (err) {
      console.error(err);
      showToast("Tạo thất bại", "error");
    } finally {
      setSavingAction(null);
    }
  };

  // 5. UPDATE
  const handleUpdate = async () => {
    // EXTERNAL: Owner và Client được cập nhật
    // INTERNAL: Chỉ Owner được cập nhật
    if (viewInternal && role !== "OWNER") {
      showToast("Bạn không có quyền cập nhật mô tả nội bộ", "error");
      return;
    }
    if (!viewInternal && role !== "OWNER" && role !== "CLIENT") {
      showToast("Bạn không có quyền cập nhật mô tả", "error");
      return;
    }

    const payload = await preparePayload(false);
    if (!payload) return;

    setSavingAction("UPDATE");
    try {
      if (viewInternal) {
        await descriptionService.upsertInternalMilestoneBrief(
          Number(projectId),
          Number(milestoneId),
          payload
        );
        showToast("Lưu nội bộ thành công 🔒", "success");
      } else {
        await descriptionService.upsertMilestoneBrief(
          Number(projectId),
          Number(milestoneId),
          payload
        );
        showToast("Cập nhật ngoại bộ thành công 📝", "success");
      }
      await loadSections();
      setIsEditMode(false); // Chuyển về chế độ xem sau khi lưu thành công
    } catch (err) {
      console.error(err);
      showToast("Lưu thất bại", "error");
    } finally {
      setSavingAction(null);
    }
  };

  // 6. FORWARD SINGLE (Chỉ Owner mới được forward)
  const handleForwardToInternal = async (withEdit: boolean = false) => {
    // 1. Validate
    if (role !== "OWNER") {
      showToast("Chỉ Owner mới được chuyển tiếp sang phòng nội bộ", "error");
      return;
    }

    if (!selectedSection) {
      showToast("Vui lòng chọn một mô tả để chuyển tiếp! 👆", "error");
      return;
    }

    // Không được forward từ INTERNAL
    if (viewInternal) {
      showToast(
        "Bạn đang ở phòng nội bộ. Vui lòng chuyển sang phòng khách hàng để forward.",
        "error"
      );
      return;
    }

    setSavingAction("FORWARD");
    try {
      if (withEdit) {
        // Forward với chỉnh sửa: dùng dữ liệu đã chỉnh sửa từ UI (luôn forward với edit khi withEdit = true)
        const processedBlocks = [];
        for (const b of selectedSection.blocks) {
          if (
            ["DESCRIPTION", "HARMONY", "IMAGE", "HUM_MELODY"].includes(b.type)
          ) {
            let contentKey = b.content;

            // Upload file on-the-fly nếu chưa upload
            if ((b.type === "IMAGE" || b.type === "HUM_MELODY") && b.file) {
              contentKey = await descriptionService.uploadBriefFile(
                Number(projectId),
                Number(milestoneId),
                b.file,
                b.type
              );
              delete b.file;
              b.content = contentKey;
            }

            processedBlocks.push({
              type: b.type as any,
              label: b.label,
              content: normalizeFileKey(contentKey || ""),
              position: b.position ?? processedBlocks.length,
            });
          }
        }

        const editedGroup = {
          title: selectedSection.title,
          position: 1,
          blocks: processedBlocks,
        };

        await descriptionService.forwardExternalGroupToInternalWithEdit(
          Number(projectId),
          Number(milestoneId),
          selectedSection.id,
          editedGroup
        );
        showToast(
          `Đã chuyển "${selectedSection.title}" (đã chỉnh sửa) sang nội bộ! ➡️🔒`,
          "success"
        );
        setPendingForward(false);
        setIsEditMode(false);
      } else {
        // Forward nguyên bản: không cần body
        await descriptionService.forwardExternalGroupToInternal(
          Number(projectId),
          Number(milestoneId),
          selectedSection.id
        );
        showToast(
          `Đã chuyển "${selectedSection.title}" (nguyên bản) sang nội bộ! ➡️🔒`,
          "success"
        );
      }

      // Không tự động chuyển view sang Internal, để Owner có thể tiếp tục làm việc
      setIsManageMode(false);
      await loadSections(); // Reload để cập nhật dữ liệu
    } catch (err) {
      console.error(err);
      showToast("Chuyển tiếp thất bại", "error");
      setPendingForward(false);
    } finally {
      setSavingAction(null);
    }
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;

    // Lấy hợp âm từ draggableId
    const movedChord =
      source.droppableId === "source" ||
      source.droppableId === "source-major" ||
      source.droppableId === "source-minor"
        ? draggableId.replace("source-", "")
        : draggableId.replace(/^target-.*?-/, "");

    // Kiểm tra nếu kéo từ source vào target hoặc di chuyển trong target
    const isFromSource =
      source.droppableId === "source" ||
      source.droppableId === "source-major" ||
      source.droppableId === "source-minor";
    const isToTarget = destination.droppableId.startsWith("target-");
    const isWithinTarget =
      source.droppableId.startsWith("target-") &&
      destination.droppableId.startsWith("target-");

    if ((isFromSource && isToTarget) || isWithinTarget) {
      const blockIdStr = destination.droppableId.replace("target-", "");

      // Bỏ qua nếu là temp id
      if (blockIdStr === "temp") {
        console.warn("Cannot drop to temp block");
        return;
      }

      setSections((prev) => {
        const newState = prev.map((sec) => ({
          ...sec,
          blocks: sec.blocks.map((b) => {
            // So sánh blockId bằng string để tránh vấn đề parse
            const bIdStr = b.id ? String(b.id) : "";
            if (!b.id || bIdStr !== blockIdStr || b.type !== "HARMONY") {
              return b;
            }

            // Lấy danh sách hợp âm hiện tại
            const targetList = b.content
              ? b.content.split(" ").filter((c) => c.trim())
              : [];

            if (isFromSource) {
              // Thêm hợp âm mới vào vị trí destination.index
              targetList.splice(destination.index, 0, movedChord);
            } else if (isWithinTarget) {
              // Di chuyển hợp âm trong cùng một target
              const sourceBlockIdStr = source.droppableId.replace(
                "target-",
                ""
              );

              // Nếu cùng một block, chỉ cần sắp xếp lại
              if (sourceBlockIdStr === blockIdStr) {
                const [removed] = targetList.splice(source.index, 1);
                targetList.splice(destination.index, 0, removed);
              }
            }

            return { ...b, content: targetList.join(" ") };
          }),
        }));

        // Cập nhật selectedSection nếu có
        if (selectedSection) {
          const currentSec = newState.find((s) => s.id === selectedSection.id);
          if (currentSec) {
            setSelectedSection(currentSec);
          }
        }

        return newState;
      });
    }
  };

  return {
    sections,
    role,
    loading,
    savingAction,
    selectedSection,
    viewInternal,
    isDirty,
    isDeleteMode,
    isManageMode,
    isEditMode,
    selectedDeleteIds,
    mainRef,
    setViewInternal,
    setSelectedSection,
    setIsDeleteMode,
    setIsManageMode,
    setIsEditMode,
    addSection,
    addBlock,
    deleteBlock,
    deleteSection,
    updateBlockContent,
    updateSectionTitle,
    onDragEnd,
    handleUploadImage,
    handleUploadMelody,
    handleCreate,
    handleUpdate,
    handleForwardToInternal,
    toggleDeleteSelection,
    handleBulkDelete,
    pendingForward,
    setPendingForward,
  };
};
