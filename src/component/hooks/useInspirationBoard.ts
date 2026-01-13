import { useState, useRef, useEffect, useCallback, RefObject } from "react";
import { useSearchParams } from "react-router-dom";
import {
  createInspirationNote,
  deleteInspirationItem,
  getProjectInspirations,
  InspirationItemResponse,
  InspirationType,
  uploadInspirationAsset,
} from "@/services/boardService";
import { useCosmicToast } from "@/component/toast/CosmicToastProvider";
import Image1 from "../../assets/image/guitar-inspration.jpg";
import Image2 from "../../assets/image/music-inspiration1.jpg";
import Image3 from "../../assets/image/music-inspiration.avif";
type NodeType = "image" | "audio" | "text" | "video";
interface InspirationNodeData {
  id: number;
  type: NodeType;
  content: string;
  title?: string;
  isDataUrl?: boolean;
}
interface NodeState extends InspirationNodeData {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

const INITIAL_VISIBLE = 12;
const SECTION_HEIGHT = 600;
const SECTION_PADDING = 200;
const CANVAS_WIDTH = 1000;
const REPEL_DISTANCE = 180;

interface UseInspirationBoardLogicResult {
  projectId: number | null;
  visibleNodes: NodeState[];
  hiddenNodes: NodeState[];
  selectedNode: NodeState | null;
  loading: boolean;
  totalCanvasHeight: number;
  setSelectedNode: (node: NodeState | null) => void;
  initializeNodeState: (node: InspirationNodeData) => NodeState;
  handleUpload: (
    note: string,
    file: File | null,
    setNote: (n: string) => void,
    setFile: (f: File | null) => void,
    setShowModal: (s: boolean) => void
  ) => Promise<void>;
  handleDeleteNode: (nodeId: number) => Promise<void>;
  nodesRef: RefObject<NodeState[]>;
  elementsRef: RefObject<HTMLElement[]>;
  loadMoreRef: RefObject<HTMLDivElement | null>;
}

const FAKE_INSPIRATION_DATA: InspirationNodeData[] = [
  {
    id: 1,
    type: "text",
    content: "Đoạn Hook: 'Bước chân lạc giữa ngân hà...'",
    title: "Draft Lyrics - Hook 1",
  },
  {
    id: 2,
    type: "text",
    content: "Moodboard: Neon Tokyo + Cyberpunk Rain.",
    title: "Tâm trạng & Màu sắc",
  },
  {
    id: 3,
    type: "text",
    content: "Cấu trúc bài: Intro (Pad Ambient) -> Drop (Heavy Synth).",
    title: "Sơ đồ Cấu trúc Bài hát",
  },
  {
    id: 4,
    type: "text",
    content: "Sound Reference: Bassline của The Weeknd (Blinding Lights).",
    title: "Tham khảo Âm thanh",
  },
  {
    id: 5,
    type: "text",
    content: "Ý tưởng cho Solo: Solo guitar điện 8 bars, sử dụng nhiều delay.",
    title: "Solo Guitar Concept",
  },
  {
    id: 6,
    type: "audio",
    content: "/mock/audio/drum_loop_v2.mp3",
    title: "Drum Loop 128 BPM (Trap/Lofi)",
  },
  {
    id: 7,
    type: "audio",
    content: "/mock/audio/synth_pad_ambient.mp3",
    title: "Synth Pad Ambient C Minor (Intro)",
  },
  {
    id: 8,
    type: "audio",
    content: "/mock/audio/vocal_chop_idea.mp3",
    title: "Vocal Chop FX - Test (Dry)",
  },
  {
    id: 9,
    type: "audio",
    content: "/mock/audio/bassline_funky.mp3",
    title: "Bassline Funky Groovy (Draft)",
  },
  {
    id: 10,
    type: "image",
    content: Image1,
    title: "Concept Art - Studio Neon",
  },
  {
    id: 11,
    type: "image",
    content: Image2,
    title: "Visual - Abstract Light Painting",
  },
  {
    id: 12,
    type: "image",
    content: Image3,
    title: "Album Cover Idea - Galaxy",
  },
];

export const useInspirationBoardLogic = (
  frameRef: RefObject<HTMLDivElement | null>,
  canvasRef: RefObject<HTMLCanvasElement | null>
): UseInspirationBoardLogicResult => {
  const [selectedNode, setSelectedNode] = useState<NodeState | null>(null);
  const [visibleNodes, setVisibleNodes] = useState<NodeState[]>([]);
  const [hiddenNodes, setHiddenNodes] = useState<NodeState[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useCosmicToast();
  const [searchParams] = useSearchParams();
  const projectIdParam = searchParams.get("id");
  const projectId = projectIdParam ? Number(projectIdParam) : null;

  const nodesRef = useRef<NodeState[]>([]);
  const elementsRef = useRef<HTMLElement[]>([]);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const initializeNodeState = useCallback(
    (node: InspirationNodeData): NodeState => {
      const nodes = nodesRef.current;
      let x: number, y: number;
      let attempts = 0;

      do {
        x = Math.random() * (CANVAS_WIDTH - 240);
        y = Math.random() * (SECTION_HEIGHT - 180);
        attempts++;
      } while (
        nodes.some((n) => Math.abs(n.x - x) < 260 && Math.abs(n.y - y) < 200) &&
        attempts < 100
      );

      return {
        ...node,
        x,
        y,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
      };
    },
    []
  );

  const fetchInspirations = useCallback(async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      const res = await getProjectInspirations(projectId);
      const sourceData = res.items || [];
      const mockItems: InspirationItemResponse[] = FAKE_INSPIRATION_DATA.map(
        (item) => ({
          id: item.id + 1000,
          type: item.type.toUpperCase() as InspirationType,
          title: item.title,
          noteContent: item.type === "text" ? item.content : undefined,
          viewUrl: item.type !== "text" ? item.content : undefined,
          createdAt: new Date().toISOString(),
          isMock: true,
          uploaderId: 0,
          uploaderName: "MOCK",
        })
      ) as InspirationItemResponse[];
      const combinedData = [...sourceData, ...mockItems];
      const initializedNodes: NodeState[] = combinedData.map((item) =>
        initializeNodeState({
          id: item.id,
          type:
            item.type === "NOTE"
              ? "text"
              : (item.type.toLowerCase() as NodeType),
          content: item.viewUrl || item.noteContent || "",
          title: item.title || "",
          isDataUrl: item.viewUrl?.startsWith("data:"),
        })
      );

      nodesRef.current = initializedNodes;

      if (initializedNodes.length <= INITIAL_VISIBLE) {
        setVisibleNodes(initializedNodes);
        setHiddenNodes([]);
      } else {
        setVisibleNodes(initializedNodes.slice(0, INITIAL_VISIBLE));
        setHiddenNodes(initializedNodes.slice(INITIAL_VISIBLE));
      }
    } catch (err) {
      console.error("Lỗi khi fetch data từ API. Chỉ hiển thị Mock Data:", err);

      const mockNodesOnly: NodeState[] = FAKE_INSPIRATION_DATA.map((item) =>
        initializeNodeState(item as InspirationNodeData)
      );
      nodesRef.current = mockNodesOnly;
      setVisibleNodes(mockNodesOnly.slice(0, INITIAL_VISIBLE));
      setHiddenNodes(mockNodesOnly.slice(INITIAL_VISIBLE));
    } finally {
      setLoading(false);
    }
  }, [projectId, initializeNodeState]);

  useEffect(() => {
    fetchInspirations();
  }, [fetchInspirations]);

  useEffect(() => {
    if (!loadMoreRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && hiddenNodes.length > 0) {
            setVisibleNodes((prevVisible) => [
              ...prevVisible,
              ...hiddenNodes.slice(0, INITIAL_VISIBLE),
            ]);
            setHiddenNodes((prevHidden) => prevHidden.slice(INITIAL_VISIBLE));
          }
        });
      },
      { root: null, rootMargin: "0px 0px 200px 0px" }
    );
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hiddenNodes]);

  const handleUpload = useCallback(
    async (
      note: string,
      file: File | null,
      setNote: (n: string) => void,
      setFile: (f: File | null) => void,
      setShowModal: (s: boolean) => void
    ) => {
      if (!projectId) return;

      try {
        let result: InspirationItemResponse;

        if (file) {
          let type: InspirationType = "NOTE";
          if (file.type.startsWith("image/")) type = "IMAGE";
          else if (file.type.startsWith("audio/")) type = "AUDIO";
          else if (file.type.startsWith("video/")) type = "VIDEO";

          result = await uploadInspirationAsset(projectId, type, file);
        } else {
          result = await createInspirationNote(projectId, { content: note });
        }

        const nodeType: NodeType = file
          ? (result.type?.toLowerCase() as NodeType)
          : "text";

        const newNode: NodeState = initializeNodeState({
          id: result.id,
          type: nodeType,
          content:
            nodeType === "text"
              ? note
              : result.viewUrl || result.noteContent || "",
          title: result.title || note || "",
          isDataUrl: result.viewUrl?.startsWith("data:"),
        });

        nodesRef.current.push(newNode);

        setVisibleNodes((prevVisible) => {
          if (prevVisible.length < INITIAL_VISIBLE) {
            return [...prevVisible, newNode];
          } else {
            setHiddenNodes((prevHidden) => [...prevHidden, newNode]);
            return prevVisible;
          }
        });

        setShowModal(false);
        setNote("");
        setFile(null);
        showToast("🌱 Ý tưởng của bạn đã được gieo thành công!", "success");
      } catch (err) {
        console.error(err);
        showToast("💫 Tải lên thất bại. Vui lòng thử lại.", "error");
      }
    },
    [projectId, initializeNodeState, showToast]
  );

  const handleDeleteNode = useCallback(
    async (deletedId: number) => {
      if (!projectId) return;

      try {
        await deleteInspirationItem(projectId, deletedId);

        setVisibleNodes((prev) => prev.filter((n) => n.id !== deletedId));
        setHiddenNodes((prev) => prev.filter((n) => n.id !== deletedId));
        nodesRef.current = nodesRef.current.filter((n) => n.id !== deletedId);
        setSelectedNode(null);

        showToast("🗑 Đã xóa cảm hứng thành công!", "success");
      } catch (err) {
        console.error("Xóa thất bại", err);
        showToast("❌ Không thể xóa cảm hứng 😢", "error");
      }
    },
    [projectId, showToast]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const h = (canvas.height =
      Math.ceil(visibleNodes.length / INITIAL_VISIBLE) * 600);
    const w = (canvas.width = CANVAS_WIDTH);

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const nodes = visibleNodes;

      elementsRef.current = Array.from(
        frameRef.current?.querySelectorAll<HTMLElement>(".node-item") || []
      );

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];

        for (let j = 0; j < nodes.length; j++) {
          if (i === j) continue;
          const o = nodes[j];
          const dx = n.x - o.x;
          const dy = n.y - o.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < REPEL_DISTANCE && dist > 0) {
            const force = (REPEL_DISTANCE - dist) * 0.05;
            n.vx += (dx / dist) * force;
            n.vy += (dy / dist) * force;
          }
        }

        n.vx += (Math.random() - 0.5) * 0.1;
        n.vy += (Math.random() - 0.5) * 0.1;

        n.vx = Math.max(Math.min(n.vx, 2.5), -2.5) * 0.98;
        n.vy = Math.max(Math.min(n.vy, 2.5), -2.5) * 0.98;

        n.x += n.vx;
        n.y += n.vy;

        if (n.x < 0 || n.x > w - 240) n.vx *= -1;
        if (n.y < 0 || n.y > h - 180) n.vy *= -1;
      }

      for (let i = 0; i < 4; i++) {
        if (nodes.length < 2) break;
        const n1 = nodes[Math.floor(Math.random() * nodes.length)];
        const nearNodes = nodes.filter(
          (n2) =>
            n2 &&
            Math.abs(n2.x - n1.x) + Math.abs(n2.y - n1.y) < 300 &&
            n2 !== n1
        );
        if (nearNodes.length === 0) continue;

        const n2 = nearNodes[Math.floor(Math.random() * nearNodes.length)];

        const g = ctx.createLinearGradient(
          n1.x + 120,
          n1.y + 90,
          n2.x + 120,
          n2.y + 90
        );
        g.addColorStop(0, "rgba(155,100,255,0)");
        g.addColorStop(0.5, "rgba(190,150,255,0.6)");
        g.addColorStop(1, "rgba(155,100,255,0)");
        ctx.beginPath();
        ctx.moveTo(n1.x + 120, n1.y + 90);
        ctx.lineTo(n2.x + 120, n2.y + 90);
        ctx.strokeStyle = g;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
      elementsRef.current.forEach((el, i) => {
        const n = nodes[i];
        if (!n) return;
        el.style.transform = `translate3d(${n.x}px, ${
          n.y + Math.floor(i / INITIAL_VISIBLE) * SECTION_HEIGHT
        }px, 0)`;
      });

      requestAnimationFrame(draw);
    };

    const animationFrame = requestAnimationFrame(draw);

    return () => cancelAnimationFrame(animationFrame);
  }, [visibleNodes, canvasRef, frameRef]);

  const totalCanvasHeight =
    Math.ceil(visibleNodes.length / INITIAL_VISIBLE) *
    (SECTION_HEIGHT + SECTION_PADDING);

  return {
    projectId,
    visibleNodes,
    hiddenNodes,
    selectedNode,
    loading,
    totalCanvasHeight,
    setSelectedNode,
    initializeNodeState,
    handleUpload,
    handleDeleteNode,
    nodesRef,
    elementsRef,
    loadMoreRef,
  };
};
