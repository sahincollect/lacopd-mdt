"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import toast from "react-hot-toast";

export interface TacticalStructure {
  id: string;
  type:
    | "BUILDING_MAIN"
    | "WAREHOUSE"
    | "APARTMENT"
    | "ROOM"
    | "CORRIDOR"
    | "CONTAINER_RED"
    | "CONTAINER_BLUE"
    | "CONTAINER_GREEN"
    | "CONTAINER_YELLOW"
    | "SILO"
    | "CRATES"
    | "ROAD"
    | "WALL"
    | "DOOR"
    | "WINDOW"
    | "STAIRS"
    | "TREE"
    | "PARKED_CAR";
  label: string;
  sublabel?: string;
  x: number; // center X percentage 0..100
  y: number; // center Y percentage 0..100
  width: number; // width percentage 1..100
  height: number; // height percentage 1..100
  rotation: number; // degrees 0..360
  color: string;
  locked?: boolean;
}

export interface TacticalMarker {
  id: string;
  category: "UNIT" | "SUSPECT" | "DIRECTIVE_PIN" | "NOTE";
  type: string;
  label: string;
  sublabel: string;
  x: number; // percentage 0..100
  y: number; // percentage 0..100
  color?: string;
}

export interface TacticalDrawing {
  id: string;
  type: "ARROW" | "PATH" | "ZONE";
  color: string;
  label?: string;
  points: { x: number; y: number }[];
}

export interface TacticalDirective {
  id: string;
  phase: string;
  priority: "NORMAL" | "YÜKSEK" | "KRİTİK";
  assignedTo: string;
  text: string;
  completed: boolean;
}

export interface TacticalComment {
  id: string;
  authorName: string;
  authorBadge: string;
  authorRank: string;
  content: string;
  createdAt: string;
}

export interface TacticalPlan {
  id: string;
  title: string;
  location: string;
  riskLevel: "DÜŞÜK" | "ORTA" | "YÜKSEK" | "KRİTİK";
  status: "PLANLANIYOR" | "AKTİF OPERASYON" | "TAMAMLANDI";
  commander: string;
  mapType: "EMPTY" | "BUILDING" | "BANK" | "INTERSECTION" | "GRID" | "CUSTOM";
  customMapUrl?: string;
  summary: string;
  createdAt: string;
  structures?: TacticalStructure[];
  markers: TacticalMarker[];
  drawings?: TacticalDrawing[];
  directives: TacticalDirective[];
  comments: TacticalComment[];
}

interface StructurePaletteItem {
  kind: "STRUCTURE";
  type: TacticalStructure["type"];
  group: "BİNALAR & ODALAR" | "KONTEYNER & SANAYİ" | "YOL, DUVAR & ÇEVRE";
  name: string;
  defaultLabel: string;
  defaultSub: string;
  defaultW: number;
  defaultH: number;
  color: string;
  icon: string;
}

interface MarkerPaletteItem {
  kind: "MARKER";
  type: string;
  category: "UNIT" | "SUSPECT" | "DIRECTIVE_PIN" | "NOTE";
  group: "BİRİMLER" | "ŞÜPHELİ & HEDEF" | "TAKTİK İŞARETLER";
  name: string;
  defaultLabel: string;
  defaultSub: string;
  icon: string;
  bg: string;
  border: string;
  text: string;
}

type AnyPaletteItem = StructurePaletteItem | MarkerPaletteItem;

const STRUCTURE_PALETTE: StructurePaletteItem[] = [
  // BİNALAR & ODALAR
  {
    kind: "STRUCTURE",
    type: "BUILDING_MAIN",
    group: "BİNALAR & ODALAR",
    name: "Müstakil Bina / Mülk",
    defaultLabel: "HEDEF BİNA",
    defaultSub: "2 Katlı / Betonarme",
    defaultW: 26,
    defaultH: 26,
    color: "#3b82f6",
    icon: "fa-building",
  },
  {
    kind: "STRUCTURE",
    type: "WAREHOUSE",
    group: "BİNALAR & ODALAR",
    name: "Büyük Depo / Hangar",
    defaultLabel: "ANA DEPO",
    defaultSub: "Endüstriyel Hangar",
    defaultW: 34,
    defaultH: 24,
    color: "#6366f1",
    icon: "fa-warehouse",
  },
  {
    kind: "STRUCTURE",
    type: "APARTMENT",
    group: "BİNALAR & ODALAR",
    name: "Apartman / Blok",
    defaultLabel: "APARTMAN BLOK",
    defaultSub: "Çok Katlı Konut",
    defaultW: 20,
    defaultH: 30,
    color: "#0ea5e9",
    icon: "fa-city",
  },
  {
    kind: "STRUCTURE",
    type: "ROOM",
    group: "BİNALAR & ODALAR",
    name: "İç Oda / Bölme",
    defaultLabel: "ODA 1",
    defaultSub: "İç Bölme",
    defaultW: 12,
    defaultH: 12,
    color: "#38bdf8",
    icon: "fa-vector-square",
  },
  {
    kind: "STRUCTURE",
    type: "CORRIDOR",
    group: "BİNALAR & ODALAR",
    name: "Koridor / Geçit",
    defaultLabel: "KORİDOR",
    defaultSub: "Bağlantı Holü",
    defaultW: 18,
    defaultH: 7,
    color: "#64748b",
    icon: "fa-arrows-left-right",
  },

  // KONTEYNER & SANAYİ
  {
    kind: "STRUCTURE",
    type: "CONTAINER_RED",
    group: "KONTEYNER & SANAYİ",
    name: "Konteyner (Kırmızı)",
    defaultLabel: "KONTEYNER #1",
    defaultSub: "40ft Metal Konteyner",
    defaultW: 15,
    defaultH: 6.5,
    color: "#ef4444",
    icon: "fa-box-archive",
  },
  {
    kind: "STRUCTURE",
    type: "CONTAINER_BLUE",
    group: "KONTEYNER & SANAYİ",
    name: "Konteyner (Mavi)",
    defaultLabel: "KONTEYNER #2",
    defaultSub: "40ft Metal Konteyner",
    defaultW: 15,
    defaultH: 6.5,
    color: "#3b82f6",
    icon: "fa-box-archive",
  },
  {
    kind: "STRUCTURE",
    type: "CONTAINER_GREEN",
    group: "KONTEYNER & SANAYİ",
    name: "Konteyner (Yeşil)",
    defaultLabel: "KONTEYNER #3",
    defaultSub: "20ft Kargo",
    defaultW: 12,
    defaultH: 6.5,
    color: "#10b981",
    icon: "fa-box-archive",
  },
  {
    kind: "STRUCTURE",
    type: "CONTAINER_YELLOW",
    group: "KONTEYNER & SANAYİ",
    name: "Konteyner (Sarı)",
    defaultLabel: "KONTEYNER #4",
    defaultSub: "20ft Kargo",
    defaultW: 12,
    defaultH: 6.5,
    color: "#f59e0b",
    icon: "fa-box-archive",
  },
  {
    kind: "STRUCTURE",
    type: "SILO",
    group: "KONTEYNER & SANAYİ",
    name: "Sanayi Tankı / Silo",
    defaultLabel: "YAKIT TANKI",
    defaultSub: "Yanıcı / Siper",
    defaultW: 10,
    defaultH: 15,
    color: "#94a3b8",
    icon: "fa-database",
  },
  {
    kind: "STRUCTURE",
    type: "CRATES",
    group: "KONTEYNER & SANAYİ",
    name: "Kasa / Palet Yığını",
    defaultLabel: "KASA YIĞINI",
    defaultSub: "Alçak Siper",
    defaultW: 7,
    defaultH: 7,
    color: "#d97706",
    icon: "fa-cubes",
  },

  // YOL, DUVAR & ÇEVRE
  {
    kind: "STRUCTURE",
    type: "ROAD",
    group: "YOL, DUVAR & ÇEVRE",
    name: "Asfalt Yol / Cadde",
    defaultLabel: "ANA CADDE",
    defaultSub: "Çift Şeritli Yol",
    defaultW: 48,
    defaultH: 13,
    color: "#475569",
    icon: "fa-road",
  },
  {
    kind: "STRUCTURE",
    type: "WALL",
    group: "YOL, DUVAR & ÇEVRE",
    name: "Duvar / Çit / Siper",
    defaultLabel: "DUVAR",
    defaultSub: "Bahçe / Çevre Duvarı",
    defaultW: 24,
    defaultH: 2.5,
    color: "#94a3b8",
    icon: "fa-border-all",
  },
  {
    kind: "STRUCTURE",
    type: "DOOR",
    group: "YOL, DUVAR & ÇEVRE",
    name: "Kapı / Giriş Noktası",
    defaultLabel: "KAPI",
    defaultSub: "Giriş / Çıkış",
    defaultW: 6,
    defaultH: 2.5,
    color: "#f97316",
    icon: "fa-door-open",
  },
  {
    kind: "STRUCTURE",
    type: "WINDOW",
    group: "YOL, DUVAR & ÇEVRE",
    name: "Pencere / Cam Cephe",
    defaultLabel: "PENCERE",
    defaultSub: "Ateş / Gözlem Açısı",
    defaultW: 7,
    defaultH: 2.2,
    color: "#38bdf8",
    icon: "fa-table-columns",
  },
  {
    kind: "STRUCTURE",
    type: "STAIRS",
    group: "YOL, DUVAR & ÇEVRE",
    name: "Merdiven / Çatı Çıkışı",
    defaultLabel: "MERDİVEN",
    defaultSub: "Üst Kat Bağlantısı",
    defaultW: 7,
    defaultH: 9,
    color: "#a855f7",
    icon: "fa-stairs",
  },
  {
    kind: "STRUCTURE",
    type: "PARKED_CAR",
    group: "YOL, DUVAR & ÇEVRE",
    name: "Sivil Araç (Siper)",
    defaultLabel: "SİVİL ARAÇ",
    defaultSub: "Araç Siperi",
    defaultW: 8,
    defaultH: 5,
    color: "#64748b",
    icon: "fa-car-side",
  },
  {
    kind: "STRUCTURE",
    type: "TREE",
    group: "YOL, DUVAR & ÇEVRE",
    name: "Ağaç / Çalılık",
    defaultLabel: "AĞAÇLIK",
    defaultSub: "Görüş Engeli",
    defaultW: 7,
    defaultH: 10,
    color: "#22c55e",
    icon: "fa-tree",
  },
];

const MARKER_PALETTE: MarkerPaletteItem[] = [
  // BİRİMLER
  {
    kind: "MARKER",
    type: "PATROL",
    category: "UNIT",
    group: "BİRİMLER",
    name: "Devriye Birimi (Adam)",
    defaultLabel: "1-ADAM-12",
    defaultSub: "Çevre Güvenliği",
    icon: "fa-car-on",
    bg: "#041632",
    border: "#3b82f6",
    text: "#ffffff",
  },
  {
    kind: "MARKER",
    type: "SWAT",
    category: "UNIT",
    group: "BİRİMLER",
    name: "SWAT Taktik Ekip",
    defaultLabel: "SWAT-1",
    defaultSub: "Giriş Ekibi",
    icon: "fa-shield-halved",
    bg: "#0f172a",
    border: "#38bdf8",
    text: "#38bdf8",
  },
  {
    kind: "MARKER",
    type: "SNIPER",
    category: "UNIT",
    group: "BİRİMLER",
    name: "Keskin Nişancı",
    defaultLabel: "GÖZLEM-1",
    defaultSub: "Çatı Gözlem",
    icon: "fa-crosshairs",
    bg: "#064e3b",
    border: "#10b981",
    text: "#ecfdf5",
  },
  {
    kind: "MARKER",
    type: "AIR",
    category: "UNIT",
    group: "BİRİMLER",
    name: "Hava Desteği (Air)",
    defaultLabel: "AIR-1",
    defaultSub: "Termal Gözlem",
    icon: "fa-helicopter",
    bg: "#0c4a6e",
    border: "#0ea5e9",
    text: "#e0f2fe",
  },
  {
    kind: "MARKER",
    type: "K9",
    category: "UNIT",
    group: "BİRİMLER",
    name: "K-9 Köpek Birimi",
    defaultLabel: "K9-1",
    defaultSub: "Arama & Takip",
    icon: "fa-paw",
    bg: "#78350f",
    border: "#f59e0b",
    text: "#fef3c7",
  },
  {
    kind: "MARKER",
    type: "DETECTIVE",
    category: "UNIT",
    group: "BİRİMLER",
    name: "Dedektif / Müzakereci",
    defaultLabel: "RHD-1",
    defaultSub: "Müzakere",
    icon: "fa-user-tie",
    bg: "#312e81",
    border: "#818cf8",
    text: "#e0e7ff",
  },
  {
    kind: "MARKER",
    type: "BEARCAT",
    category: "UNIT",
    group: "BİRİMLER",
    name: "Zırhlı Araç (BearCat)",
    defaultLabel: "BEARCAT",
    defaultSub: "Zırhlı Siper",
    icon: "fa-truck-monster",
    bg: "#1e293b",
    border: "#64748b",
    text: "#f8fafc",
  },
  {
    kind: "MARKER",
    type: "PERIMETER",
    category: "UNIT",
    group: "BİRİMLER",
    name: "Barikat / Yol Kapama",
    defaultLabel: "BARİKAT",
    defaultSub: "Yol Kapalı",
    icon: "fa-road-barrier",
    bg: "#334155",
    border: "#f97316",
    text: "#ffffff",
  },

  // ŞÜPHELİ & HEDEF
  {
    kind: "MARKER",
    type: "ARMED_SUSPECT",
    category: "SUSPECT",
    group: "ŞÜPHELİ & HEDEF",
    name: "Silahlı Şüpheli",
    defaultLabel: "Şüpheli #1",
    defaultSub: "Silahlı / Tehlikeli",
    icon: "fa-person-rifle",
    bg: "#991b1b",
    border: "#ef4444",
    text: "#ffffff",
  },
  {
    kind: "MARKER",
    type: "SUSPECT_FOOT",
    category: "SUSPECT",
    group: "ŞÜPHELİ & HEDEF",
    name: "Şüpheli / Gözcü",
    defaultLabel: "Gözcü",
    defaultSub: "Bina Çevresi",
    icon: "fa-user-secret",
    bg: "#7f1d1d",
    border: "#f87171",
    text: "#ffffff",
  },
  {
    kind: "MARKER",
    type: "SUSPECT_VEHICLE",
    category: "SUSPECT",
    group: "ŞÜPHELİ & HEDEF",
    name: "Kaçış Aracı",
    defaultLabel: "Şüpheli Araç",
    defaultSub: "Kaçış İhtimali",
    icon: "fa-car-burst",
    bg: "#881337",
    border: "#fb7185",
    text: "#ffe4e6",
  },
  {
    kind: "MARKER",
    type: "HOSTAGE",
    category: "SUSPECT",
    group: "ŞÜPHELİ & HEDEF",
    name: "Rehine / Sivil",
    defaultLabel: "Rehine",
    defaultSub: "Sivil Koruması",
    icon: "fa-person-shelter",
    bg: "#92400e",
    border: "#fbbf24",
    text: "#ffffff",
  },
  {
    kind: "MARKER",
    type: "HAZARD",
    category: "SUSPECT",
    group: "ŞÜPHELİ & HEDEF",
    name: "Patlayıcı / Tuzak",
    defaultLabel: "TEHLİKE",
    defaultSub: "Bomba İhtimali",
    icon: "fa-triangle-exclamation",
    bg: "#7c2d12",
    border: "#f97316",
    text: "#ffedd5",
  },

  // TAKTİK İŞARETLER
  {
    kind: "MARKER",
    type: "BREACH",
    category: "DIRECTIVE_PIN",
    group: "TAKTİK İŞARETLER",
    name: "Giriş Noktası (Breach)",
    defaultLabel: "Giriş A",
    defaultSub: "Koçbaşı / Flashbang",
    icon: "fa-door-open",
    bg: "#c2410c",
    border: "#fb923c",
    text: "#ffffff",
  },
  {
    kind: "MARKER",
    type: "COMMAND_POST",
    category: "DIRECTIVE_PIN",
    group: "TAKTİK İŞARETLER",
    name: "Komuta Noktası",
    defaultLabel: "KOMUTA",
    defaultSub: "Kriz Merkezi",
    icon: "fa-flag",
    bg: "#1e3a8a",
    border: "#60a5fa",
    text: "#ffffff",
  },
  {
    kind: "MARKER",
    type: "EMS",
    category: "DIRECTIVE_PIN",
    group: "TAKTİK İŞARETLER",
    name: "Tıbbi Tahliye (EMS)",
    defaultLabel: "EMS NOKTASI",
    defaultSub: "Ambulans Bekleme",
    icon: "fa-kit-medical",
    bg: "#065f46",
    border: "#34d399",
    text: "#ffffff",
  },
  {
    kind: "MARKER",
    type: "NOTE",
    category: "NOTE",
    group: "TAKTİK İŞARETLER",
    name: "Harita Üstü Direktif Notu",
    defaultLabel: "DİREKTİF NOTU",
    defaultSub: "Özel Taktik Not",
    icon: "fa-note-sticky",
    bg: "#fef3c7",
    border: "#f59e0b",
    text: "#78350f",
  },
];

type ToolMode = "MOVE" | "DRAW_BUILDING" | "ARROW" | "PATH" | "ZONE";
type ResizeHandle = "n" | "s" | "e" | "w" | "nw" | "ne" | "sw" | "se";

const STRUCTURE_COLORS = [
  { c: "#3b82f6", label: "Mavi (Bina)" },
  { c: "#6366f1", label: "İndigo (Depo)" },
  { c: "#ef4444", label: "Kırmızı (Konteyner/Hedef)" },
  { c: "#10b981", label: "Yeşil (Konteyner/Park)" },
  { c: "#f59e0b", label: "Sarı (Konteyner/Kasa)" },
  { c: "#f97316", label: "Turuncu (Kapı/Geçit)" },
  { c: "#64748b", label: "Gri (Yol/Duvar)" },
  { c: "#a855f7", label: "Mor (Özel Alan)" },
];

export default function TaktikselPlanlamaPage() {
  const { data: meData } = useSWR("/api/auth/me", fetcher);
  const { data: plansData, mutate: mutatePlans } = useSWR("/api/tactical-plans", fetcher, {
    revalidateOnFocus: false,
  });

  const user = meData?.user || null;
  const plans: TacticalPlan[] = plansData?.plans || [];

  const [activePlanId, setActivePlanId] = useState<string>("");
  const [localPlan, setLocalPlan] = useState<TacticalPlan | null>(null);
  const [saveStatus, setSaveStatus] = useState<"SAVED" | "DIRTY" | "SAVING">("SAVED");

  // Left sidebar library tab
  const [paletteTab, setPaletteTab] = useState<"STRUCTURES" | "UNITS" | "ALL">("ALL");

  // Canvas interaction state
  const [toolMode, setToolMode] = useState<ToolMode>("MOVE");
  const [drawColor, setDrawColor] = useState<string>("#38bdf8");
  const [structuresLocked, setStructuresLocked] = useState<boolean>(false);

  // Selection state (either a structure or a marker)
  const [selectedStructureId, setSelectedStructureId] = useState<string | null>(null);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);

  // Smooth dragging for markers
  const [draggingMarkerId, setDraggingMarkerId] = useState<string | null>(null);
  const dragOffsetRef = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });

  // Smooth dragging & resizing & rotating for structures (buildings, containers, roads, walls)
  const [draggingStructureId, setDraggingStructureId] = useState<string | null>(null);
  const [resizingState, setResizingState] = useState<{
    id: string;
    handle: ResizeHandle;
    startClientX: number;
    startClientY: number;
    startX: number;
    startY: number;
    startW: number;
    startH: number;
  } | null>(null);
  const [rotatingStructureId, setRotatingStructureId] = useState<string | null>(null);

  // Drawing a new building box directly on the canvas
  const [buildingDraft, setBuildingDraft] = useState<{
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
  } | null>(null);

  // Pointer dragging from Left Palette directly onto the canvas
  const [paletteDragItem, setPaletteDragItem] = useState<AnyPaletteItem | null>(null);
  const [paletteDragPos, setPaletteDragPos] = useState<{ clientX: number; clientY: number } | null>(null);

  // Active drawing state (Arrow / Freehand / Zone)
  const [activeDrawing, setActiveDrawing] = useState<TacticalDrawing | null>(null);

  const boardRef = useRef<HTMLDivElement | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Directives & Comments forms
  const [dirPhase, setDirPhase] = useState("AŞAMA 1");
  const [dirPriority, setDirPriority] = useState<"NORMAL" | "YÜKSEK" | "KRİTİK">("YÜKSEK");
  const [dirAssigned, setDirAssigned] = useState("");
  const [dirText, setDirText] = useState("");
  const [commentText, setCommentText] = useState("");

  // New Plan modal
  const [showNewPlanModal, setShowNewPlanModal] = useState(false);
  const [newPlanForm, setNewPlanForm] = useState({
    title: "",
    location: "",
    riskLevel: "YÜKSEK",
    mapType: "EMPTY",
    summary: "",
  });

  // Initialize active plan once when loaded
  useEffect(() => {
    if (plans.length > 0 && !activePlanId) {
      const first = plans[0];
      setActivePlanId(first.id);
      setLocalPlan({
        ...first,
        mapType: first.mapType || "EMPTY",
        structures: first.structures || [],
        markers: first.markers || [],
        drawings: first.drawings || [],
      });
    }
  }, [plans, activePlanId]);

  const persistToServer = useCallback(
    async (planToSave: TacticalPlan, showToast = false) => {
      setSaveStatus("SAVING");
      try {
        const res = await fetch("/api/tactical-plans", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "UPDATE_PLAN", plan: planToSave }),
        });
        if (res.ok) {
          setSaveStatus("SAVED");
          mutatePlans();
          if (showToast) toast.success("Taktiksel plan kaydedildi.");
        } else {
          setSaveStatus("DIRTY");
          if (showToast) toast.error("Kaydetme başarısız.");
        }
      } catch {
        setSaveStatus("DIRTY");
        if (showToast) toast.error("Bağlantı hatası.");
      }
    },
    [mutatePlans]
  );

  const updateLocalAndScheduleSave = useCallback(
    (updater: (prev: TacticalPlan) => TacticalPlan) => {
      setLocalPlan((prev) => {
        if (!prev) return null;
        const next = updater(prev);
        setSaveStatus("DIRTY");
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(() => {
          persistToServer(next, false);
        }, 650);
        return next;
      });
    },
    [persistToServer]
  );

  // Keyboard delete shortcut for selected structure or marker
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedMarkerId) {
          e.preventDefault();
          updateLocalAndScheduleSave((prev) => ({
            ...prev,
            markers: prev.markers.filter((m) => m.id !== selectedMarkerId),
          }));
          setSelectedMarkerId(null);
        } else if (selectedStructureId && !structuresLocked) {
          e.preventDefault();
          updateLocalAndScheduleSave((prev) => ({
            ...prev,
            structures: (prev.structures || []).filter((s) => s.id !== selectedStructureId),
          }));
          setSelectedStructureId(null);
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedMarkerId, selectedStructureId, structuresLocked, updateLocalAndScheduleSave]);

  // Global pointer move / up for dragging from the Left Palette onto the Board
  useEffect(() => {
    if (!paletteDragItem) return;

    const handleGlobalMove = (e: PointerEvent) => {
      setPaletteDragPos({ clientX: e.clientX, clientY: e.clientY });
    };

    const handleGlobalUp = (e: PointerEvent) => {
      if (boardRef.current && paletteDragItem) {
        const rect = boardRef.current.getBoundingClientRect();
        const isInside =
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom;

        if (isInside) {
          const x = Math.max(2, Math.min(98, Number((((e.clientX - rect.left) / rect.width) * 100).toFixed(2))));
          const y = Math.max(2, Math.min(98, Number((((e.clientY - rect.top) / rect.height) * 100).toFixed(2))));

          if (paletteDragItem.kind === "STRUCTURE") {
            const newStruct: TacticalStructure = {
              id: `st-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              type: paletteDragItem.type,
              label: paletteDragItem.defaultLabel,
              sublabel: paletteDragItem.defaultSub,
              x,
              y,
              width: paletteDragItem.defaultW,
              height: paletteDragItem.defaultH,
              rotation: 0,
              color: paletteDragItem.color,
              locked: false,
            };
            updateLocalAndScheduleSave((prev) => ({
              ...prev,
              structures: [...(prev.structures || []), newStruct],
            }));
            setSelectedStructureId(newStruct.id);
            setSelectedMarkerId(null);
            setToolMode("MOVE");
          } else {
            const newMarker: TacticalMarker = {
              id: `mk-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              category: paletteDragItem.category,
              type: paletteDragItem.type,
              label: paletteDragItem.defaultLabel,
              sublabel: paletteDragItem.defaultSub,
              x,
              y,
            };
            updateLocalAndScheduleSave((prev) => ({
              ...prev,
              markers: [...prev.markers, newMarker],
            }));
            setSelectedMarkerId(newMarker.id);
            setSelectedStructureId(null);
            setToolMode("MOVE");
          }
        }
      }
      setPaletteDragItem(null);
      setPaletteDragPos(null);
    };

    window.addEventListener("pointermove", handleGlobalMove);
    window.addEventListener("pointerup", handleGlobalUp);
    return () => {
      window.removeEventListener("pointermove", handleGlobalMove);
      window.removeEventListener("pointerup", handleGlobalUp);
    };
  }, [paletteDragItem, updateLocalAndScheduleSave]);

  // Quick spawn at center if user clicks a palette item
  const handleQuickAddFromPalette = (item: AnyPaletteItem) => {
    const jitterX = Number((48 + (Math.random() * 8 - 4)).toFixed(2));
    const jitterY = Number((48 + (Math.random() * 8 - 4)).toFixed(2));

    if (item.kind === "STRUCTURE") {
      const newStruct: TacticalStructure = {
        id: `st-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        type: item.type,
        label: item.defaultLabel,
        sublabel: item.defaultSub,
        x: jitterX,
        y: jitterY,
        width: item.defaultW,
        height: item.defaultH,
        rotation: 0,
        color: item.color,
        locked: false,
      };
      updateLocalAndScheduleSave((prev) => ({
        ...prev,
        structures: [...(prev.structures || []), newStruct],
      }));
      setSelectedStructureId(newStruct.id);
      setSelectedMarkerId(null);
      setToolMode("MOVE");
    } else {
      const newMarker: TacticalMarker = {
        id: `mk-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        category: item.category,
        type: item.type,
        label: item.defaultLabel,
        sublabel: item.defaultSub,
        x: jitterX,
        y: jitterY,
      };
      updateLocalAndScheduleSave((prev) => ({
        ...prev,
        markers: [...prev.markers, newMarker],
      }));
      setSelectedMarkerId(newMarker.id);
      setSelectedStructureId(null);
      setToolMode("MOVE");
    }
  };

  // Board Pointer Down
  const handleBoardPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!localPlan || !boardRef.current) return;

    const rect = boardRef.current.getBoundingClientRect();
    const x = Number((((e.clientX - rect.left) / rect.width) * 100).toFixed(2));
    const y = Number((((e.clientY - rect.top) / rect.height) * 100).toFixed(2));

    if (toolMode === "MOVE") {
      setSelectedMarkerId(null);
      setSelectedStructureId(null);
      return;
    }

    e.currentTarget.setPointerCapture(e.pointerId);

    if (toolMode === "DRAW_BUILDING") {
      setBuildingDraft({
        startX: x,
        startY: y,
        currentX: x,
        currentY: y,
      });
      return;
    }

    const newDrawing: TacticalDrawing = {
      id: `drw-${Date.now()}`,
      type: toolMode === "ARROW" ? "ARROW" : toolMode === "PATH" ? "PATH" : "ZONE",
      color: drawColor,
      points: [
        { x, y },
        { x, y },
      ],
    };
    setActiveDrawing(newDrawing);
  };

  // Board Pointer Move
  const handleBoardPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!boardRef.current || !localPlan) return;
    const rect = boardRef.current.getBoundingClientRect();

    // 1. Resizing a structure
    if (resizingState) {
      const deltaX = ((e.clientX - resizingState.startClientX) / rect.width) * 100;
      const deltaY = ((e.clientY - resizingState.startClientY) / rect.height) * 100;

      let newW = resizingState.startW;
      let newH = resizingState.startH;
      let newX = resizingState.startX;
      let newY = resizingState.startY;

      const h = resizingState.handle;
      if (h.includes("e")) {
        newW = Math.max(2, Math.min(95, resizingState.startW + deltaX));
        newX = resizingState.startX + (newW - resizingState.startW) / 2;
      }
      if (h.includes("w")) {
        newW = Math.max(2, Math.min(95, resizingState.startW - deltaX));
        newX = resizingState.startX - (newW - resizingState.startW) / 2;
      }
      if (h.includes("s")) {
        newH = Math.max(1.8, Math.min(95, resizingState.startH + deltaY));
        newY = resizingState.startY + (newH - resizingState.startH) / 2;
      }
      if (h.includes("n")) {
        newH = Math.max(1.8, Math.min(95, resizingState.startH - deltaY));
        newY = resizingState.startY - (newH - resizingState.startH) / 2;
      }

      setLocalPlan((prev) =>
        prev
          ? {
              ...prev,
              structures: (prev.structures || []).map((s) =>
                s.id === resizingState.id
                  ? {
                      ...s,
                      x: Number(newX.toFixed(2)),
                      y: Number(newY.toFixed(2)),
                      width: Number(newW.toFixed(2)),
                      height: Number(newH.toFixed(2)),
                    }
                  : s
              ),
            }
          : null
      );
      return;
    }

    // 2. Rotating a structure
    if (rotatingStructureId) {
      const st = (localPlan.structures || []).find((s) => s.id === rotatingStructureId);
      if (st) {
        const centerX = rect.left + (st.x / 100) * rect.width;
        const centerY = rect.top + (st.y / 100) * rect.height;
        const angleRad = Math.atan2(e.clientY - centerY, e.clientX - centerX);
        let angleDeg = Math.round((angleRad * 180) / Math.PI + 90);
        if (angleDeg < 0) angleDeg += 360;
        // Snap to 15 deg if close
        const snapped = Math.abs(angleDeg % 15) <= 3 ? Math.round(angleDeg / 15) * 15 : angleDeg;
        setLocalPlan((prev) =>
          prev
            ? {
                ...prev,
                structures: (prev.structures || []).map((s) =>
                  s.id === rotatingStructureId ? { ...s, rotation: snapped % 360 } : s
                ),
              }
            : null
        );
      }
      return;
    }

    // 3. Dragging a structure
    if (draggingStructureId) {
      const rawX = ((e.clientX - rect.left - dragOffsetRef.current.dx) / rect.width) * 100;
      const rawY = ((e.clientY - rect.top - dragOffsetRef.current.dy) / rect.height) * 100;
      const x = Math.max(1, Math.min(99, Number(rawX.toFixed(2))));
      const y = Math.max(1, Math.min(99, Number(rawY.toFixed(2))));

      setLocalPlan((prev) =>
        prev
          ? {
              ...prev,
              structures: (prev.structures || []).map((s) => (s.id === draggingStructureId ? { ...s, x, y } : s)),
            }
          : null
      );
      return;
    }

    // 4. Dragging a unit/suspect marker
    if (draggingMarkerId) {
      const rawX = ((e.clientX - rect.left - dragOffsetRef.current.dx) / rect.width) * 100;
      const rawY = ((e.clientY - rect.top - dragOffsetRef.current.dy) / rect.height) * 100;
      const x = Math.max(0.5, Math.min(99.5, Number(rawX.toFixed(2))));
      const y = Math.max(0.5, Math.min(99.5, Number(rawY.toFixed(2))));

      setLocalPlan((prev) =>
        prev
          ? {
              ...prev,
              markers: prev.markers.map((m) => (m.id === draggingMarkerId ? { ...m, x, y } : m)),
            }
          : null
      );
      return;
    }

    // 5. Drawing a new building box
    if (buildingDraft) {
      const x = Math.max(0, Math.min(100, Number((((e.clientX - rect.left) / rect.width) * 100).toFixed(2))));
      const y = Math.max(0, Math.min(100, Number((((e.clientY - rect.top) / rect.height) * 100).toFixed(2))));
      setBuildingDraft((prev) => (prev ? { ...prev, currentX: x, currentY: y } : null));
      return;
    }

    // 6. Drawing arrows/paths/zones
    if (activeDrawing) {
      const x = Math.max(0, Math.min(100, Number((((e.clientX - rect.left) / rect.width) * 100).toFixed(2))));
      const y = Math.max(0, Math.min(100, Number((((e.clientY - rect.top) / rect.height) * 100).toFixed(2))));

      setActiveDrawing((prev) => {
        if (!prev) return null;
        if (prev.type === "PATH") {
          return { ...prev, points: [...prev.points, { x, y }] };
        } else {
          return { ...prev, points: [prev.points[0], { x, y }] };
        }
      });
    }
  };

  const handleBoardPointerUp = () => {
    if (resizingState && localPlan) {
      setResizingState(null);
      updateLocalAndScheduleSave((prev) => ({ ...prev }));
    }
    if (rotatingStructureId && localPlan) {
      setRotatingStructureId(null);
      updateLocalAndScheduleSave((prev) => ({ ...prev }));
    }
    if (draggingStructureId && localPlan) {
      setDraggingStructureId(null);
      updateLocalAndScheduleSave((prev) => ({ ...prev }));
    }
    if (draggingMarkerId && localPlan) {
      setDraggingMarkerId(null);
      updateLocalAndScheduleSave((prev) => ({ ...prev }));
    }
    if (buildingDraft && localPlan) {
      const w = Math.abs(buildingDraft.currentX - buildingDraft.startX);
      const h = Math.abs(buildingDraft.currentY - buildingDraft.startY);
      if (w > 2 && h > 2) {
        const cx = (buildingDraft.startX + buildingDraft.currentX) / 2;
        const cy = (buildingDraft.startY + buildingDraft.currentY) / 2;
        const count = (localPlan.structures || []).length + 1;
        const newStruct: TacticalStructure = {
          id: `st-${Date.now()}`,
          type: "BUILDING_MAIN",
          label: `BİNA / ODA #${count}`,
          sublabel: "Özel Çizim Yapı",
          x: Number(cx.toFixed(2)),
          y: Number(cy.toFixed(2)),
          width: Number(w.toFixed(2)),
          height: Number(h.toFixed(2)),
          rotation: 0,
          color: drawColor || "#3b82f6",
          locked: false,
        };
        updateLocalAndScheduleSave((prev) => ({
          ...prev,
          structures: [...(prev.structures || []), newStruct],
        }));
        setSelectedStructureId(newStruct.id);
        setSelectedMarkerId(null);
        setToolMode("MOVE");
      }
      setBuildingDraft(null);
    }
    if (activeDrawing && localPlan) {
      const p0 = activeDrawing.points[0];
      const pLast = activeDrawing.points[activeDrawing.points.length - 1];
      const dist = Math.hypot(pLast.x - p0.x, pLast.y - p0.y);
      if (dist > 1.5) {
        const finished = activeDrawing;
        updateLocalAndScheduleSave((prev) => ({
          ...prev,
          drawings: [...(prev.drawings || []), finished],
        }));
      }
      setActiveDrawing(null);
    }
  };

  const handleUndoLastDrawing = () => {
    updateLocalAndScheduleSave((prev) => ({
      ...prev,
      drawings: (prev.drawings || []).slice(0, -1),
    }));
  };

  const handleClearUnitsOnly = () => {
    if (!confirm("Binalar ve yapılar korunarak sadece birim, şüpheli ve ok çizimleri temizlensin mi?")) return;
    updateLocalAndScheduleSave((prev) => ({
      ...prev,
      markers: [],
      drawings: [],
    }));
    setSelectedMarkerId(null);
  };

  const handleClearEntireBoard = () => {
    if (!confirm("Binalar, konteynerler, birimler ve çizimler dahil TÜM tahtayı sıfırlamak istiyor musunuz?")) return;
    updateLocalAndScheduleSave((prev) => ({
      ...prev,
      mapType: "EMPTY",
      structures: [],
      markers: [],
      drawings: [],
    }));
    setSelectedMarkerId(null);
    setSelectedStructureId(null);
  };

  const handleDuplicateStructure = (st: TacticalStructure) => {
    const copy: TacticalStructure = {
      ...st,
      id: `st-${Date.now()}`,
      x: Math.min(94, Number((st.x + 4).toFixed(2))),
      y: Math.min(94, Number((st.y + 4).toFixed(2))),
    };
    updateLocalAndScheduleSave((prev) => ({
      ...prev,
      structures: [...(prev.structures || []), copy],
    }));
    setSelectedStructureId(copy.id);
  };

  const handleDuplicateMarker = (m: TacticalMarker) => {
    const copy: TacticalMarker = {
      ...m,
      id: `mk-${Date.now()}`,
      x: Math.min(96, m.x + 3.5),
      y: Math.min(96, m.y + 3.5),
    };
    updateLocalAndScheduleSave((prev) => ({
      ...prev,
      markers: [...prev.markers, copy],
    }));
    setSelectedMarkerId(copy.id);
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlanForm.title.trim()) return;
    try {
      const res = await fetch("/api/tactical-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CREATE_PLAN",
          title: newPlanForm.title.trim(),
          location: newPlanForm.location.trim() || "Los Angeles",
          riskLevel: newPlanForm.riskLevel,
          mapType: newPlanForm.mapType,
          summary: newPlanForm.summary.trim(),
          commander: user ? `${user.rank} ${user.name} (#${user.badge})` : "Komuta Merkezi",
        }),
      });
      const data = await res.json();
      if (res.ok && data.plan) {
        toast.success("Yeni boş operasyon tahtası oluşturuldu.");
        setShowNewPlanModal(false);
        setNewPlanForm({ title: "", location: "", riskLevel: "YÜKSEK", mapType: "EMPTY", summary: "" });
        await mutatePlans();
        setActivePlanId(data.plan.id);
        setLocalPlan({ ...data.plan, structures: [], markers: [], drawings: [] });
      }
    } catch {
      toast.error("Plan oluşturulamadı.");
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!confirm("Bu taktiksel operasyon planını silmek istediğinize emin misiniz?")) return;
    try {
      const res = await fetch("/api/tactical-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "DELETE_PLAN", planId: id }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Operasyon planı silindi.");
        const remaining = data.plans || [];
        if (remaining.length > 0) {
          setActivePlanId(remaining[0].id);
          setLocalPlan({
            ...remaining[0],
            structures: remaining[0].structures || [],
            markers: remaining[0].markers || [],
            drawings: remaining[0].drawings || [],
          });
        }
        mutatePlans();
      }
    } catch {
      toast.error("Silinemedi.");
    }
  };

  const handleAddDirective = (e: React.FormEvent) => {
    e.preventDefault();
    if (!localPlan || !dirText.trim()) return;
    const newDir: TacticalDirective = {
      id: `dir-${Date.now()}`,
      phase: dirPhase,
      priority: dirPriority,
      assignedTo: dirAssigned.trim() || "Tüm Birimler",
      text: dirText.trim(),
      completed: false,
    };
    setDirText("");
    setDirAssigned("");
    updateLocalAndScheduleSave((prev) => ({
      ...prev,
      directives: [...prev.directives, newDir],
    }));
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!localPlan || !commentText.trim()) return;
    const newComment: TacticalComment = {
      id: `com-${Date.now()}`,
      authorName: user?.name || "Personel",
      authorBadge: user?.badge || "---",
      authorRank: user?.rank || "Officer",
      content: commentText.trim(),
      createdAt: new Date().toISOString(),
    };
    setCommentText("");
    updateLocalAndScheduleSave((prev) => ({
      ...prev,
      comments: [...prev.comments, newComment],
    }));
  };

  const selectedStructure = (localPlan?.structures || []).find((s) => s.id === selectedStructureId) || null;
  const selectedMarker = localPlan?.markers.find((m) => m.id === selectedMarkerId) || null;
  const allDrawings = [...(localPlan?.drawings || []), ...(activeDrawing ? [activeDrawing] : [])];
  const structuresList = localPlan?.structures || [];
  const isBoardCompletelyEmpty =
    (localPlan?.mapType === "EMPTY" || localPlan?.mapType === "GRID") &&
    structuresList.length === 0 &&
    (localPlan?.markers.length || 0) === 0 &&
    allDrawings.length === 0;

  return (
    <div style={{ maxWidth: 1520, margin: "0 auto", display: "flex", flexDirection: "column", gap: "1rem", paddingBottom: "2.5rem" }}>
      {/* ── FLOATING DRAG GHOST WHEN DRAGGING FROM LEFT PALETTE ── */}
      {paletteDragItem && paletteDragPos && (
        <div
          style={{
            position: "fixed",
            left: paletteDragPos.clientX,
            top: paletteDragPos.clientY,
            transform: "translate(-50%, -50%)",
            backgroundColor: paletteDragItem.kind === "STRUCTURE" ? "#0f172a" : paletteDragItem.bg,
            border: `2px solid ${paletteDragItem.kind === "STRUCTURE" ? paletteDragItem.color : paletteDragItem.border}`,
            color: paletteDragItem.kind === "STRUCTURE" ? "#ffffff" : paletteDragItem.text,
            padding: "0.5rem 0.9rem",
            borderRadius: 6,
            boxShadow: "0 12px 28px rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            pointerEvents: "none",
            zIndex: 9999,
            fontSize: "0.8rem",
            fontWeight: 700,
          }}
        >
          <i className={`fa-solid ${paletteDragItem.icon}`} />
          <span>{paletteDragItem.defaultLabel}</span>
        </div>
      )}

      {/* ── TOP HEADER BAR ── */}
      <div
        style={{
          backgroundColor: "var(--bg-secondary)",
          border: "1px solid var(--border-light)",
          borderRadius: 8,
          padding: "0.9rem 1.25rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.85rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--LAC-orange)", letterSpacing: "0.04em" }}>
              LAPD TACTICAL PLANNING // SERBEST KROKİ & OPERASYON İNŞA TAHTASI
            </div>
            <h1 style={{ margin: 0, fontSize: "1.3rem", fontWeight: 700, color: "var(--text-primary)" }}>
              Taktiksel Planlama Merkezi
            </h1>
          </div>

          <select
            value={activePlanId}
            onChange={(e) => {
              const found = plans.find((p) => p.id === e.target.value);
              if (found) {
                setActivePlanId(found.id);
                setLocalPlan({
                  ...found,
                  mapType: found.mapType || "EMPTY",
                  structures: found.structures || [],
                  markers: found.markers || [],
                  drawings: found.drawings || [],
                });
                setSelectedMarkerId(null);
                setSelectedStructureId(null);
              }
            }}
            style={{
              padding: "0.48rem 0.85rem",
              borderRadius: 6,
              backgroundColor: "var(--bg-primary)",
              border: "1px solid var(--border-strong)",
              color: "var(--text-primary)",
              fontSize: "0.85rem",
              fontWeight: 600,
              minWidth: 250,
              cursor: "pointer",
            }}
          >
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                [{p.id}] {p.title}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.55rem", flexWrap: "wrap" }}>
          <span
            style={{
              fontSize: "0.76rem",
              fontWeight: 600,
              color: saveStatus === "SAVED" ? "#16a34a" : saveStatus === "SAVING" ? "var(--LAC-orange)" : "var(--text-muted)",
              padding: "0.35rem 0.7rem",
              borderRadius: 6,
              backgroundColor: "var(--bg-tertiary)",
            }}
          >
            {saveStatus === "SAVED"
              ? "✓ Otomatik Kaydedildi"
              : saveStatus === "SAVING"
              ? "Kaydediliyor..."
              : "Değişiklikler Kaydediliyor..."}
          </span>

          {localPlan && (
            <button
              onClick={() => persistToServer(localPlan, true)}
              style={{
                padding: "0.48rem 0.9rem",
                borderRadius: 6,
                backgroundColor: "#041632",
                color: "#ffffff",
                border: "none",
                fontSize: "0.8rem",
                fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
              }}
            >
              <i className="fa-solid fa-floppy-disk" />
              Kaydet
            </button>
          )}

          <button
            onClick={() => setShowNewPlanModal(true)}
            style={{
              padding: "0.48rem 0.9rem",
              borderRadius: 6,
              backgroundColor: "var(--LAC-orange)",
              color: "#ffffff",
              border: "none",
              fontSize: "0.8rem",
              fontWeight: 600,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
            }}
          >
            <i className="fa-solid fa-plus" />
            Yeni Boş Tahta Aç
          </button>

          {localPlan && (
            <button
              onClick={() => handleDeletePlan(localPlan.id)}
              style={{
                padding: "0.48rem 0.75rem",
                borderRadius: 6,
                backgroundColor: "var(--color-danger-bg)",
                border: "1px solid var(--color-danger-border)",
                color: "var(--color-danger)",
                fontSize: "0.8rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
              title="Bu Planı Sil"
            >
              <i className="fa-solid fa-trash" />
            </button>
          )}
        </div>
      </div>

      {localPlan && (
        <>
          {/* ── MAIN WORKSPACE: LEFT DRAG PALETTE (295px) + RIGHT WIDE TACTICAL BOARD ── */}
          <div style={{ display: "grid", gridTemplateColumns: "295px 1fr", gap: "1rem", alignItems: "stretch" }}>
            {/* ── LEFT PANEL: DRAGGABLE BUILDINGS / CONTAINERS / UNITS / SUSPECTS LIBRARY ── */}
            <div
              style={{
                backgroundColor: "var(--bg-secondary)",
                border: "1px solid var(--border-light)",
                borderRadius: 8,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "0.8rem 0.95rem",
                  backgroundColor: "#041632",
                  color: "#ffffff",
                }}
              >
                <div style={{ fontSize: "0.88rem", fontWeight: 700 }}>İnşa & Birim Kütüphanesi</div>
                <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.75)", marginTop: 2 }}>
                  Bina, konteyner, yol ve birimleri tahtaya sürükleyin
                </div>

                {/* Category Filter Tabs */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.3rem", marginTop: "0.65rem" }}>
                  {[
                    { id: "ALL", label: "Tümü" },
                    { id: "STRUCTURES", label: "Yapı & Bina" },
                    { id: "UNITS", label: "Birim & Hedef" },
                  ].map((tab) => {
                    const active = paletteTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setPaletteTab(tab.id as any)}
                        style={{
                          padding: "0.32rem 0.4rem",
                          borderRadius: 5,
                          border: active ? "1px solid var(--LAC-orange)" : "1px solid rgba(255,255,255,0.18)",
                          backgroundColor: active ? "var(--LAC-orange)" : "rgba(255,255,255,0.08)",
                          color: "#ffffff",
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div
                style={{
                  padding: "0.75rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.95rem",
                  overflowY: "auto",
                  maxHeight: 650,
                }}
              >
                {/* SECTION 1: BUILDINGS, CONTAINERS, ROADS, WALLS */}
                {(paletteTab === "ALL" || paletteTab === "STRUCTURES") &&
                  (["BİNALAR & ODALAR", "KONTEYNER & SANAYİ", "YOL, DUVAR & ÇEVRE"] as const).map((groupName) => (
                    <div key={groupName}>
                      <div
                        style={{
                          fontSize: "0.7rem",
                          fontWeight: 800,
                          color: "var(--LAC-orange)",
                          letterSpacing: "0.04em",
                          marginBottom: "0.4rem",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.35rem",
                        }}
                      >
                        <i className="fa-solid fa-Layer-group" />
                        {groupName}
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.38rem" }}>
                        {STRUCTURE_PALETTE.filter((i) => i.group === groupName).map((item) => (
                          <div
                            key={item.type}
                            onPointerDown={(e) => {
                              e.preventDefault();
                              setPaletteDragItem(item);
                              setPaletteDragPos({ clientX: e.clientX, clientY: e.clientY });
                            }}
                            onClick={() => handleQuickAddFromPalette(item)}
                            title={`${item.name} — Sürükle veya Tıkla Ekle`}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.45rem",
                              padding: "0.45rem 0.55rem",
                              borderRadius: 6,
                              backgroundColor: "var(--bg-primary)",
                              border: "1px solid var(--border-light)",
                              borderLeft: `3px solid ${item.color}`,
                              cursor: "grab",
                              userSelect: "none",
                            }}
                          >
                            <div
                              style={{
                                width: 24,
                                height: 24,
                                borderRadius: 5,
                                backgroundColor: `${item.color}22`,
                                border: `1px solid ${item.color}`,
                                color: item.color,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "0.75rem",
                                flexShrink: 0,
                              }}
                            >
                              <i className={`fa-solid ${item.icon}`} />
                            </div>
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <div
                                style={{
                                  fontSize: "0.73rem",
                                  fontWeight: 700,
                                  color: "var(--text-primary)",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {item.name}
                              </div>
                              <div style={{ fontSize: "0.64rem", color: "var(--text-muted)" }}>Sürükle / Ekle</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                {/* SECTION 2: UNITS, SUSPECTS, PINS */}
                {(paletteTab === "ALL" || paletteTab === "UNITS") &&
                  (["BİRİMLER", "ŞÜPHELİ & HEDEF", "TAKTİK İŞARETLER"] as const).map((groupName) => (
                    <div key={groupName}>
                      <div
                        style={{
                          fontSize: "0.7rem",
                          fontWeight: 800,
                          color: "var(--text-muted)",
                          letterSpacing: "0.04em",
                          marginBottom: "0.4rem",
                        }}
                      >
                        {groupName}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                        {MARKER_PALETTE.filter((i) => i.group === groupName).map((item) => (
                          <div
                            key={item.type}
                            onPointerDown={(e) => {
                              e.preventDefault();
                              setPaletteDragItem(item);
                              setPaletteDragPos({ clientX: e.clientX, clientY: e.clientY });
                            }}
                            onClick={() => handleQuickAddFromPalette(item)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.6rem",
                              padding: "0.46rem 0.65rem",
                              borderRadius: 6,
                              backgroundColor: "var(--bg-primary)",
                              border: "1px solid var(--border-light)",
                              borderLeft: `4px solid ${item.bg === "#fef3c7" ? "#f59e0b" : item.bg}`,
                              cursor: "grab",
                              userSelect: "none",
                            }}
                          >
                            <div
                              style={{
                                width: 26,
                                height: 26,
                                borderRadius: 6,
                                backgroundColor: item.bg,
                                color: item.text,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "0.78rem",
                                flexShrink: 0,
                              }}
                            >
                              <i className={`fa-solid ${item.icon}`} />
                            </div>
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.2 }}>
                                {item.name}
                              </div>
                              <div style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>{item.defaultSub}</div>
                            </div>
                            <i className="fa-solid fa-grip-vertical" style={{ color: "var(--text-muted)", fontSize: "0.72rem" }} />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* ── RIGHT PANEL: INTERACTIVE TACTICAL CANVAS + INSPECTOR ── */}
            <div
              style={{
                backgroundColor: "var(--bg-secondary)",
                border: "1px solid var(--border-light)",
                borderRadius: 8,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              {/* Canvas Top Toolbar */}
              <div
                style={{
                  padding: "0.65rem 0.95rem",
                  borderBottom: "1px solid var(--border-light)",
                  backgroundColor: "var(--bg-tertiary)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "0.55rem",
                }}
              >
                {/* Left Tools: Move, Draw Building Box, Draw Arrow, Freehand, Zone */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", flexWrap: "wrap" }}>
                  {[
                    { id: "MOVE", label: "Seç / Taşı / Boyutlandır", icon: "fa-arrows-up-down-left-right" },
                    { id: "DRAW_BUILDING", label: "Bina / Oda Çiz (Kutu)", icon: "fa-regular fa-square-plus" },
                    { id: "ARROW", label: "Taktik Ok Çiz", icon: "fa-arrow-trend-up" },
                    { id: "PATH", label: "Serbest Çizim", icon: "fa-pen" },
                    { id: "ZONE", label: "Bölge / Çember", icon: "fa-vector-square" },
                  ].map((t) => {
                    const isActive = toolMode === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setToolMode(t.id as ToolMode)}
                        style={{
                          padding: "0.4rem 0.72rem",
                          borderRadius: 6,
                          backgroundColor: isActive ? "#041632" : "var(--bg-secondary)",
                          color: isActive ? "#ffffff" : "var(--text-primary)",
                          border: isActive ? "1px solid #041632" : "1px solid var(--border-strong)",
                          fontSize: "0.76rem",
                          fontWeight: 600,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.38rem",
                        }}
                      >
                        <i className={`fa-solid ${t.icon}`} />
                        {t.label}
                      </button>
                    );
                  })}

                  {/* Color swatches when drawing */}
                  {toolMode !== "MOVE" && (
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "0.28rem", marginLeft: "0.3rem" }}>
                      {[
                        { c: "#38bdf8", label: "Mavi" },
                        { c: "#ef4444", label: "Kırmızı" },
                        { c: "#f97316", label: "Turuncu" },
                        { c: "#22c55e", label: "Yeşil" },
                      ].map((sw) => (
                        <button
                          key={sw.c}
                          type="button"
                          title={sw.label}
                          onClick={() => setDrawColor(sw.c)}
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: "50%",
                            backgroundColor: sw.c,
                            border: drawColor === sw.c ? "2px solid #ffffff" : "1px solid rgba(0,0,0,0.3)",
                            boxShadow: drawColor === sw.c ? "0 0 0 2px #041632" : "none",
                            cursor: "pointer",
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Controls: Lock Buildings, Optional Template, Undo, Clear */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={() => {
                      setStructuresLocked((prev) => !prev);
                      setSelectedStructureId(null);
                    }}
                    style={{
                      padding: "0.38rem 0.68rem",
                      borderRadius: 6,
                      backgroundColor: structuresLocked ? "#f59e0b" : "var(--bg-secondary)",
                      color: structuresLocked ? "#ffffff" : "var(--text-primary)",
                      border: structuresLocked ? "1px solid #d97706" : "1px solid var(--border-strong)",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.35rem",
                    }}
                    title="Aktif edildiğinde binalar ve konteynerler sabitlenir, üstlerinde birim sürüklerken yapılar kaymaz"
                  >
                    <i className={`fa-solid ${structuresLocked ? "fa-lock" : "fa-lock-open"}`} />
                    {structuresLocked ? "Yapılar Kilitli" : "Yapıları Kilitle"}
                  </button>

                  <select
                    value={localPlan.mapType || "EMPTY"}
                    onChange={(e) =>
                      updateLocalAndScheduleSave((prev) => ({
                        ...prev,
                        mapType: e.target.value as TacticalPlan["mapType"],
                      }))
                    }
                    style={{
                      padding: "0.38rem 0.65rem",
                      borderRadius: 6,
                      backgroundColor: "var(--bg-secondary)",
                      border: "1px solid var(--border-strong)",
                      color: "var(--text-primary)",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    <option value="EMPTY">Zemin: Boş Taktik Tahta (Varsayılan)</option>
                    <option value="BUILDING">Hazır Altlık: Müstakil Bina</option>
                    <option value="BANK">Hazır Altlık: Banka Planı</option>
                    <option value="INTERSECTION">Hazır Altlık: Şehir Kavşağı</option>
                  </select>

                  {(localPlan.drawings?.length || 0) > 0 && (
                    <button
                      type="button"
                      onClick={handleUndoLastDrawing}
                      style={{
                        padding: "0.38rem 0.6rem",
                        borderRadius: 6,
                        backgroundColor: "var(--bg-secondary)",
                        border: "1px solid var(--border-strong)",
                        color: "var(--text-secondary)",
                        fontSize: "0.74rem",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                      title="Son Çizimi Geri Al"
                    >
                      <i className="fa-solid fa-rotate-left" /> Geri Al
                    </button>
                  )}

                  {localPlan.markers.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearUnitsOnly}
                      style={{
                        padding: "0.38rem 0.6rem",
                        borderRadius: 6,
                        backgroundColor: "var(--bg-secondary)",
                        border: "1px solid var(--border-strong)",
                        color: "var(--text-secondary)",
                        fontSize: "0.74rem",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Birimleri Temizle
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleClearEntireBoard}
                    style={{
                      padding: "0.38rem 0.65rem",
                      borderRadius: 6,
                      backgroundColor: "var(--color-danger-bg)",
                      border: "1px solid var(--color-danger-border)",
                      color: "var(--color-danger)",
                      fontSize: "0.74rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Tahtayı Sıfırla
                  </button>
                </div>
              </div>

              {/* ── THE TACTICAL CANVAS ── */}
              <div
                ref={boardRef}
                onPointerDown={handleBoardPointerDown}
                onPointerMove={handleBoardPointerMove}
                onPointerUp={handleBoardPointerUp}
                style={{
                  position: "relative",
                  width: "100%",
                  height: 625,
                  backgroundColor: "#0b1528",
                  cursor: toolMode === "MOVE" ? "default" : "crosshair",
                  userSelect: "none",
                  touchAction: "none",
                  overflow: "hidden",
                }}
              >
                {/* SVG Grid & Optional Background Preset & Tactical Drawings */}
                <svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 1000 600"
                  preserveAspectRatio="none"
                  style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
                >
                  <defs>
                    <pattern id="tacGridFine" width="25" height="25" patternUnits="userSpaceOnUse">
                      <path d="M 25 0 L 0 0 0 25" fill="none" stroke="rgba(148,163,184,0.08)" strokeWidth="1" />
                    </pattern>
                    <pattern id="tacGridMajor" width="125" height="125" patternUnits="userSpaceOnUse">
                      <rect width="125" height="125" fill="none" stroke="rgba(148,163,184,0.18)" strokeWidth="1.2" />
                    </pattern>
                    <marker id="arrow-blue" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
                      <path d="M 0 1 L 9 5 L 0 9 z" fill="#38bdf8" />
                    </marker>
                    <marker id="arrow-red" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
                      <path d="M 0 1 L 9 5 L 0 9 z" fill="#ef4444" />
                    </marker>
                    <marker id="arrow-orange" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
                      <path d="M 0 1 L 9 5 L 0 9 z" fill="#f97316" />
                    </marker>
                    <marker id="arrow-green" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
                      <path d="M 0 1 L 9 5 L 0 9 z" fill="#22c55e" />
                    </marker>
                  </defs>

                  <rect width="1000" height="600" fill="url(#tacGridFine)" />
                  <rect width="1000" height="600" fill="url(#tacGridMajor)" />

                  {/* Compass Indicator in Top-Right Corner */}
                  <g transform="translate(955, 42)" opacity="0.45">
                    <circle cx="0" cy="0" r="22" fill="rgba(15,23,42,0.8)" stroke="#94a3b8" strokeWidth="1.5" />
                    <polygon points="0,-15 -5,4 0,0 5,4" fill="#ef4444" />
                    <text x="-4" y="-6" fill="#ffffff" fontSize="9" fontWeight="800">
                      K
                    </text>
                  </g>

                  {/* OPTIONAL PRESET MAPS (ONLY IF USER EXPLICITLY SELECTS ONE FROM DROPDOWN) */}
                  {localPlan.mapType === "BUILDING" && (
                    <g>
                      <rect x="0" y="485" width="1000" height="85" fill="rgba(30,41,59,0.8)" stroke="rgba(148,163,184,0.3)" />
                      <line x1="0" y1="527" x2="1000" y2="527" stroke="rgba(250,204,21,0.45)" strokeWidth="2" strokeDasharray="16 12" />
                      <rect x="290" y="140" width="420" height="250" fill="rgba(30,58,138,0.26)" stroke="#60a5fa" strokeWidth="3" />
                      <line x1="500" y1="140" x2="500" y2="390" stroke="rgba(96,165,250,0.55)" strokeWidth="2" />
                      <line x1="290" y1="265" x2="710" y2="265" stroke="rgba(96,165,250,0.55)" strokeWidth="2" />
                    </g>
                  )}

                  {localPlan.mapType === "BANK" && (
                    <g>
                      <rect x="0" y="470" width="1000" height="100" fill="rgba(30,41,59,0.85)" />
                      <rect x="220" y="100" width="560" height="330" fill="rgba(30,58,138,0.25)" stroke="#60a5fa" strokeWidth="3" />
                      <line x1="220" y1="260" x2="780" y2="260" stroke="#60a5fa" strokeWidth="2.5" />
                      <rect x="540" y="125" width="210" height="110" fill="rgba(220,38,38,0.22)" stroke="#f87171" strokeWidth="2.5" />
                    </g>
                  )}

                  {localPlan.mapType === "INTERSECTION" && (
                    <g>
                      <rect x="0" y="230" width="1000" height="140" fill="rgba(30,41,59,0.85)" />
                      <rect x="420" y="0" width="160" height="600" fill="rgba(30,41,59,0.85)" />
                      <line x1="0" y1="300" x2="1000" y2="300" stroke="rgba(250,204,21,0.5)" strokeWidth="2" strokeDasharray="16 12" />
                      <line x1="500" y1="0" x2="500" y2="600" stroke="rgba(250,204,21,0.5)" strokeWidth="2" strokeDasharray="16 12" />
                    </g>
                  )}
                </svg>

                {/* EMPTY BOARD WATERMARK HELPER */}
                {isBoardCompletelyEmpty && !buildingDraft && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      pointerEvents: "none",
                      textAlign: "center",
                      padding: "2rem",
                    }}
                  >
                    <div
                      style={{
                        width: 58,
                        height: 58,
                        borderRadius: "50%",
                        backgroundColor: "rgba(59,130,246,0.12)",
                        border: "1px dashed rgba(96,165,250,0.45)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#60a5fa",
                        fontSize: "1.4rem",
                        marginBottom: "0.75rem",
                      }}
                    >
                      <i className="fa-solid fa-building-shield" />
                    </div>
                    <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.95rem", fontWeight: 700 }}>
                      BOŞ TAKTİKSEL PLANLAMA TAHTASI
                    </div>
                    <div style={{ color: "rgba(148,163,184,0.75)", fontSize: "0.8rem", maxWidth: 460, marginTop: "0.35rem", lineHeight: 1.5 }}>
                      Sol kütüphaneden <strong>Bina, Oda, Konteyner, Yol, Duvar, Birim ve Şüphelileri</strong> tutup buraya sürükleyin veya üstteki{" "}
                      <strong>&ldquo;Bina / Oda Çiz&rdquo;</strong> aracıyla doğrudan kutu çizin.
                    </div>
                  </div>
                )}

                {/* ── LAYER 1: USER-PLACED ARCHITECTURAL STRUCTURES (BUILDINGS, CONTAINERS, ROADS, WALLS) ── */}
                {structuresList.map((st) => {
                  const isSelected = selectedStructureId === st.id && !structuresLocked;
                  const isContainer = st.type.startsWith("CONTAINER_");
                  const isRoad = st.type === "ROAD";
                  const isWall = st.type === "WALL";
                  const isDoor = st.type === "DOOR";
                  const isWindow = st.type === "WINDOW";
                  const isStairs = st.type === "STAIRS";
                  const isRound = st.type === "SILO" || st.type === "TREE";

                  let bgStyle: React.CSSProperties = {
                    backgroundColor: `${st.color}28`,
                    border: isSelected ? "2px solid #ffffff" : `2px solid ${st.color}`,
                  };

                  if (isContainer) {
                    bgStyle = {
                      background: `repeating-linear-gradient(90deg, ${st.color}cc, ${st.color}cc 8px, ${st.color}99 8px, ${st.color}99 16px)`,
                      border: isSelected ? "2px solid #ffffff" : `2px solid ${st.color}`,
                    };
                  } else if (isRoad) {
                    bgStyle = {
                      backgroundColor: "rgba(30, 41, 59, 0.9)",
                      borderTop: "2px solid rgba(148, 163, 184, 0.45)",
                      borderBottom: "2px solid rgba(148, 163, 184, 0.45)",
                      borderLeft: isSelected ? "2px solid #ffffff" : "1px dashed rgba(148, 163, 184, 0.25)",
                      borderRight: isSelected ? "2px solid #ffffff" : "1px dashed rgba(148, 163, 184, 0.25)",
                    };
                  } else if (isWall) {
                    bgStyle = {
                      background: "repeating-linear-gradient(45deg, #64748b, #64748b 6px, #475569 6px, #475569 12px)",
                      border: isSelected ? "2px solid #ffffff" : "1px solid #cbd5e1",
                    };
                  } else if (isStairs) {
                    bgStyle = {
                      background: `repeating-linear-gradient(0deg, ${st.color}44, ${st.color}44 6px, ${st.color}18 6px, ${st.color}18 12px)`,
                      border: isSelected ? "2px solid #ffffff" : `2px solid ${st.color}`,
                    };
                  } else if (isDoor || isWindow) {
                    bgStyle = {
                      backgroundColor: st.color,
                      border: isSelected ? "2px solid #ffffff" : `1px solid #ffffff`,
                    };
                  }

                  return (
                    <div
                      key={st.id}
                      onPointerDown={(e) => {
                        if (structuresLocked || toolMode !== "MOVE") return;
                        e.stopPropagation();
                        setSelectedStructureId(st.id);
                        setSelectedMarkerId(null);
                        if (!st.locked && boardRef.current) {
                          e.currentTarget.setPointerCapture(e.pointerId);
                          const boardRect = boardRef.current.getBoundingClientRect();
                          const stPxX = (st.x / 100) * boardRect.width;
                          const stPxY = (st.y / 100) * boardRect.height;
                          dragOffsetRef.current = {
                            dx: e.clientX - boardRect.left - stPxX,
                            dy: e.clientY - boardRect.top - stPxY,
                          };
                          setDraggingStructureId(st.id);
                        }
                      }}
                      style={{
                        position: "absolute",
                        left: `${st.x}%`,
                        top: `${st.y}%`,
                        width: `${st.width}%`,
                        height: `${st.height}%`,
                        transform: `translate(-50%, -50%) rotate(${st.rotation || 0}deg)`,
                        borderRadius: isRound ? "50%" : 4,
                        cursor: structuresLocked ? "default" : st.locked ? "not-allowed" : draggingStructureId === st.id ? "grabbing" : "move",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: isSelected ? 8 : 3,
                        boxShadow: isSelected ? "0 0 0 2px #E84F2A, 0 8px 20px rgba(0,0,0,0.45)" : "0 2px 8px rgba(0,0,0,0.3)",
                        pointerEvents: structuresLocked ? "none" : "auto",
                        ...bgStyle,
                      }}
                    >
                      {/* Road center dashed line */}
                      {isRoad && (
                        <div
                          style={{
                            position: "absolute",
                            left: 0,
                            right: 0,
                            top: "50%",
                            borderTop: "2px dashed rgba(250, 204, 21, 0.55)",
                            pointerEvents: "none",
                          }}
                        />
                      )}

                      {/* Structure Label inside */}
                      {st.height >= 4 && st.width >= 5 && (
                        <div
                          style={{
                            textAlign: "center",
                            padding: "2px 6px",
                            pointerEvents: "none",
                            zIndex: 2,
                          }}
                        >
                          <div
                            style={{
                              fontSize: st.width < 10 ? "0.65rem" : "0.78rem",
                              fontWeight: 800,
                              color: "#ffffff",
                              textShadow: "0 1px 3px rgba(0,0,0,0.85)",
                              letterSpacing: "0.03em",
                              lineHeight: 1.15,
                            }}
                          >
                            {st.label}
                          </div>
                          {st.sublabel && st.height >= 9 && (
                            <div
                              style={{
                                fontSize: "0.64rem",
                                fontWeight: 600,
                                color: "rgba(255,255,255,0.8)",
                                textShadow: "0 1px 2px rgba(0,0,0,0.85)",
                              }}
                            >
                              {st.sublabel}
                            </div>
                          )}
                        </div>
                      )}

                      {/* RESIZE & ROTATE HANDLES WHEN SELECTED */}
                      {isSelected && !st.locked && (
                        <>
                          {/* Top Rotate Handle */}
                          <div
                            onPointerDown={(e) => {
                              e.stopPropagation();
                              e.currentTarget.setPointerCapture(e.pointerId);
                              setRotatingStructureId(st.id);
                            }}
                            title="Döndürmek için sürükleyin"
                            style={{
                              position: "absolute",
                              top: -26,
                              left: "50%",
                              transform: "translateX(-50%)",
                              width: 22,
                              height: 22,
                              borderRadius: "50%",
                              backgroundColor: "#E84F2A",
                              color: "#ffffff",
                              border: "2px solid #ffffff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "0.65rem",
                              cursor: "grab",
                              zIndex: 20,
                            }}
                          >
                            <i className="fa-solid fa-rotate" />
                          </div>

                          {/* 8 Resize Handles */}
                          {(["nw", "n", "ne", "e", "se", "s", "sw", "w"] as ResizeHandle[]).map((h) => {
                            const posStyle: React.CSSProperties = {
                              position: "absolute",
                              width: 11,
                              height: 11,
                              backgroundColor: "#ffffff",
                              border: "2px solid #041632",
                              borderRadius: 2,
                              zIndex: 20,
                            };
                            if (h.includes("n")) posStyle.top = -6;
                            if (h.includes("s")) posStyle.bottom = -6;
                            if (h.includes("w")) posStyle.left = -6;
                            if (h.includes("e")) posStyle.right = -6;
                            if (h === "n" || h === "s") {
                              posStyle.left = "50%";
                              posStyle.transform = "translateX(-50%)";
                              posStyle.cursor = "ns-resize";
                            }
                            if (h === "e" || h === "w") {
                              posStyle.top = "50%";
                              posStyle.transform = "translateY(-50%)";
                              posStyle.cursor = "ew-resize";
                            }
                            if (h === "nw" || h === "se") posStyle.cursor = "nwse-resize";
                            if (h === "ne" || h === "sw") posStyle.cursor = "nesw-resize";

                            return (
                              <div
                                key={h}
                                onPointerDown={(e) => {
                                  e.stopPropagation();
                                  e.currentTarget.setPointerCapture(e.pointerId);
                                  setResizingState({
                                    id: st.id,
                                    handle: h,
                                    startClientX: e.clientX,
                                    startClientY: e.clientY,
                                    startX: st.x,
                                    startY: st.y,
                                    startW: st.width,
                                    startH: st.height,
                                  });
                                }}
                                style={posStyle}
                              />
                            );
                          })}
                        </>
                      )}
                    </div>
                  );
                })}

                {/* LIVE BUILDING DRAFT PREVIEW WHEN DRAWING A BUILDING */}
                {buildingDraft && (
                  <div
                    style={{
                      position: "absolute",
                      left: `${Math.min(buildingDraft.startX, buildingDraft.currentX)}%`,
                      top: `${Math.min(buildingDraft.startY, buildingDraft.currentY)}%`,
                      width: `${Math.abs(buildingDraft.currentX - buildingDraft.startX)}%`,
                      height: `${Math.abs(buildingDraft.currentY - buildingDraft.startY)}%`,
                      backgroundColor: "rgba(59, 130, 246, 0.28)",
                      border: "2px dashed #60a5fa",
                      borderRadius: 4,
                      pointerEvents: "none",
                      zIndex: 15,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#ffffff",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                    }}
                  >
                    Yeni Yapı / Bina
                  </div>
                )}

                {/* ── LAYER 2: TACTICAL DRAWINGS (ARROWS, PATHS, ZONES) OVER STRUCTURES ── */}
                <svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 1000 600"
                  preserveAspectRatio="none"
                  style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 12 }}
                >
                  {allDrawings.map((d) => {
                    if (d.points.length < 2) return null;
                    const markerId =
                      d.color === "#ef4444"
                        ? "url(#arrow-red)"
                        : d.color === "#f97316"
                        ? "url(#arrow-orange)"
                        : d.color === "#22c55e"
                        ? "url(#arrow-green)"
                        : "url(#arrow-blue)";

                    if (d.type === "ARROW") {
                      const p1 = d.points[0];
                      const p2 = d.points[d.points.length - 1];
                      return (
                        <line
                          key={d.id}
                          x1={p1.x * 10}
                          y1={p1.y * 6}
                          x2={p2.x * 10}
                          y2={p2.y * 6}
                          stroke={d.color}
                          strokeWidth="3.5"
                          markerEnd={markerId}
                        />
                      );
                    }

                    if (d.type === "ZONE") {
                      const p1 = d.points[0];
                      const p2 = d.points[d.points.length - 1];
                      const x = Math.min(p1.x, p2.x) * 10;
                      const y = Math.min(p1.y, p2.y) * 6;
                      const w = Math.abs(p2.x - p1.x) * 10;
                      const h = Math.abs(p2.y - p1.y) * 6;
                      return (
                        <rect
                          key={d.id}
                          x={x}
                          y={y}
                          width={w}
                          height={h}
                          rx="8"
                          fill={`${d.color}22`}
                          stroke={d.color}
                          strokeWidth="2.5"
                          strokeDasharray="8 6"
                        />
                      );
                    }

                    const polyPoints = d.points.map((pt) => `${pt.x * 10},${pt.y * 6}`).join(" ");
                    return (
                      <polyline
                        key={d.id}
                        fill="none"
                        stroke={d.color}
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={polyPoints}
                      />
                    );
                  })}
                </svg>

                {/* ── LAYER 3: UNITS, SUSPECTS, PINS ── */}
                {localPlan.markers.map((m) => {
                  const meta = MARKER_PALETTE.find((p) => p.type === m.type) || MARKER_PALETTE[0];
                  const isSelected = selectedMarkerId === m.id;

                  return (
                    <div
                      key={m.id}
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        setSelectedMarkerId(m.id);
                        setSelectedStructureId(null);
                        if (toolMode === "MOVE" && boardRef.current) {
                          e.currentTarget.setPointerCapture(e.pointerId);
                          const boardRect = boardRef.current.getBoundingClientRect();
                          const markerPxX = (m.x / 100) * boardRect.width;
                          const markerPxY = (m.y / 100) * boardRect.height;
                          dragOffsetRef.current = {
                            dx: e.clientX - boardRect.left - markerPxX,
                            dy: e.clientY - boardRect.top - markerPxY,
                          };
                          setDraggingMarkerId(m.id);
                        }
                      }}
                      style={{
                        position: "absolute",
                        left: `${m.x}%`,
                        top: `${m.y}%`,
                        transform: "translate(-50%, -50%)",
                        backgroundColor: meta.bg,
                        border: isSelected ? "2px solid #ffffff" : `2px solid ${meta.border}`,
                        color: meta.text,
                        padding: "0.36rem 0.68rem",
                        borderRadius: 6,
                        cursor: draggingMarkerId === m.id ? "grabbing" : "grab",
                        boxShadow: isSelected
                          ? "0 0 0 3px #E84F2A, 0 8px 20px rgba(0,0,0,0.55)"
                          : "0 4px 12px rgba(0,0,0,0.45)",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.45rem",
                        whiteSpace: "nowrap",
                        zIndex: isSelected ? 35 : 20,
                        touchAction: "none",
                      }}
                    >
                      <i className={`fa-solid ${meta.icon}`} style={{ fontSize: "0.82rem" }} />
                      <div>
                        <div style={{ fontSize: "0.76rem", fontWeight: 700, lineHeight: 1.15 }}>{m.label}</div>
                        {m.sublabel && (
                          <div style={{ fontSize: "0.66rem", opacity: 0.88, marginTop: 1 }}>{m.sublabel}</div>
                        )}
                      </div>

                      {isSelected && (
                        <button
                          type="button"
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={(e) => {
                            e.stopPropagation();
                            updateLocalAndScheduleSave((prev) => ({
                              ...prev,
                              markers: prev.markers.filter((item) => item.id !== m.id),
                            }));
                            setSelectedMarkerId(null);
                          }}
                          title="Kaldır (Delete)"
                          style={{
                            marginLeft: 4,
                            width: 19,
                            height: 19,
                            borderRadius: "50%",
                            backgroundColor: "#dc2626",
                            color: "#ffffff",
                            border: "none",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.65rem",
                            cursor: "pointer",
                          }}
                        >
                          <i className="fa-solid fa-xmark" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* ── BOTTOM INSPECTOR BAR (FOR SELECTED STRUCTURE OR SELECTED MARKER) ── */}
              <div
                style={{
                  padding: "0.75rem 1rem",
                  borderTop: "1px solid var(--border-light)",
                  backgroundColor: "var(--bg-secondary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "0.75rem",
                }}
              >
                {selectedStructure ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.55rem", flex: 1, flexWrap: "wrap" }}>
                    <span style={{ fontSize: "0.78rem", fontWeight: 800, color: "var(--LAC-orange)" }}>
                      Seçili Yapı:
                    </span>
                    <input
                      type="text"
                      value={selectedStructure.label}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateLocalAndScheduleSave((prev) => ({
                          ...prev,
                          structures: (prev.structures || []).map((s) =>
                            s.id === selectedStructure.id ? { ...s, label: val } : s
                          ),
                        }));
                      }}
                      placeholder="Bina / Konteyner Adı"
                      style={{
                        padding: "0.38rem 0.65rem",
                        borderRadius: 6,
                        border: "1px solid var(--border-strong)",
                        backgroundColor: "var(--bg-primary)",
                        color: "var(--text-primary)",
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        width: 155,
                      }}
                    />
                    <input
                      type="text"
                      value={selectedStructure.sublabel || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateLocalAndScheduleSave((prev) => ({
                          ...prev,
                          structures: (prev.structures || []).map((s) =>
                            s.id === selectedStructure.id ? { ...s, sublabel: val } : s
                          ),
                        }));
                      }}
                      placeholder="Alt Bilgi (Örn: 2 Katlı / Kilitli)"
                      style={{
                        padding: "0.38rem 0.65rem",
                        borderRadius: 6,
                        border: "1px solid var(--border-strong)",
                        backgroundColor: "var(--bg-primary)",
                        color: "var(--text-primary)",
                        fontSize: "0.8rem",
                        width: 175,
                      }}
                    />

                    {/* Color Swatches for Structure */}
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                      {STRUCTURE_COLORS.map((sc) => (
                        <button
                          key={sc.c}
                          type="button"
                          title={sc.label}
                          onClick={() =>
                            updateLocalAndScheduleSave((prev) => ({
                              ...prev,
                              structures: (prev.structures || []).map((s) =>
                                s.id === selectedStructure.id ? { ...s, color: sc.c } : s
                              ),
                            }))
                          }
                          style={{
                            width: 19,
                            height: 19,
                            borderRadius: 4,
                            backgroundColor: sc.c,
                            border: selectedStructure.color === sc.c ? "2px solid var(--text-primary)" : "1px solid rgba(0,0,0,0.2)",
                            cursor: "pointer",
                          }}
                        />
                      ))}
                    </div>

                    {/* Quick Rotate Buttons */}
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                      <button
                        type="button"
                        onClick={() =>
                          updateLocalAndScheduleSave((prev) => ({
                            ...prev,
                            structures: (prev.structures || []).map((s) =>
                              s.id === selectedStructure.id
                                ? { ...s, rotation: ((s.rotation || 0) - 45 + 360) % 360 }
                                : s
                            ),
                          }))
                        }
                        style={{
                          padding: "0.35rem 0.55rem",
                          borderRadius: 5,
                          backgroundColor: "var(--bg-tertiary)",
                          border: "1px solid var(--border-strong)",
                          color: "var(--text-primary)",
                          fontSize: "0.74rem",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                        title="45 Derece Sola Döndür"
                      >
                        -45°
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateLocalAndScheduleSave((prev) => ({
                            ...prev,
                            structures: (prev.structures || []).map((s) =>
                              s.id === selectedStructure.id ? { ...s, rotation: ((s.rotation || 0) + 45) % 360 } : s
                            ),
                          }))
                        }
                        style={{
                          padding: "0.35rem 0.55rem",
                          borderRadius: 5,
                          backgroundColor: "var(--bg-tertiary)",
                          border: "1px solid var(--border-strong)",
                          color: "var(--text-primary)",
                          fontSize: "0.74rem",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                        title="45 Derece Sağa Döndür"
                      >
                        +45°
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateLocalAndScheduleSave((prev) => ({
                            ...prev,
                            structures: (prev.structures || []).map((s) =>
                              s.id === selectedStructure.id ? { ...s, rotation: ((s.rotation || 0) + 90) % 360 } : s
                            ),
                          }))
                        }
                        style={{
                          padding: "0.35rem 0.55rem",
                          borderRadius: 5,
                          backgroundColor: "var(--bg-tertiary)",
                          border: "1px solid var(--border-strong)",
                          color: "var(--text-primary)",
                          fontSize: "0.74rem",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                        title="90 Derece Döndür"
                      >
                        90°
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDuplicateStructure(selectedStructure)}
                      style={{
                        padding: "0.38rem 0.7rem",
                        borderRadius: 6,
                        backgroundColor: "var(--bg-tertiary)",
                        border: "1px solid var(--border-strong)",
                        color: "var(--text-primary)",
                        fontSize: "0.76rem",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      <i className="fa-regular fa-copy" style={{ marginRight: 4 }} />
                      Çoğalt
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        updateLocalAndScheduleSave((prev) => ({
                          ...prev,
                          structures: (prev.structures || []).filter((s) => s.id !== selectedStructure.id),
                        }));
                        setSelectedStructureId(null);
                      }}
                      style={{
                        padding: "0.38rem 0.7rem",
                        borderRadius: 6,
                        backgroundColor: "var(--color-danger-bg)",
                        border: "1px solid var(--color-danger-border)",
                        color: "var(--color-danger)",
                        fontSize: "0.76rem",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      <i className="fa-solid fa-trash" style={{ marginRight: 4 }} />
                      Sil
                    </button>
                  </div>
                ) : selectedMarker ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", flex: 1, flexWrap: "wrap" }}>
                    <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--LAC-orange)" }}>
                      Seçili Birim / Hedef:
                    </span>
                    <input
                      type="text"
                      value={selectedMarker.label}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateLocalAndScheduleSave((prev) => ({
                          ...prev,
                          markers: prev.markers.map((m) => (m.id === selectedMarker.id ? { ...m, label: val } : m)),
                        }));
                      }}
                      placeholder="Birim Kodu / Başlık"
                      style={{
                        padding: "0.4rem 0.7rem",
                        borderRadius: 6,
                        border: "1px solid var(--border-strong)",
                        backgroundColor: "var(--bg-primary)",
                        color: "var(--text-primary)",
                        fontSize: "0.82rem",
                        fontWeight: 600,
                        width: 175,
                      }}
                    />
                    <input
                      type="text"
                      value={selectedMarker.sublabel}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateLocalAndScheduleSave((prev) => ({
                          ...prev,
                          markers: prev.markers.map((m) => (m.id === selectedMarker.id ? { ...m, sublabel: val } : m)),
                        }));
                      }}
                      placeholder="Görev / Direktif Notu"
                      style={{
                        padding: "0.4rem 0.7rem",
                        borderRadius: 6,
                        border: "1px solid var(--border-strong)",
                        backgroundColor: "var(--bg-primary)",
                        color: "var(--text-primary)",
                        fontSize: "0.82rem",
                        width: 230,
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleDuplicateMarker(selectedMarker)}
                      style={{
                        padding: "0.4rem 0.75rem",
                        borderRadius: 6,
                        backgroundColor: "var(--bg-tertiary)",
                        border: "1px solid var(--border-strong)",
                        color: "var(--text-primary)",
                        fontSize: "0.76rem",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      <i className="fa-regular fa-copy" style={{ marginRight: 5 }} />
                      Çoğalt
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        updateLocalAndScheduleSave((prev) => ({
                          ...prev,
                          markers: prev.markers.filter((m) => m.id !== selectedMarker.id),
                        }));
                        setSelectedMarkerId(null);
                      }}
                      style={{
                        padding: "0.4rem 0.75rem",
                        borderRadius: 6,
                        backgroundColor: "var(--color-danger-bg)",
                        border: "1px solid var(--color-danger-border)",
                        color: "var(--color-danger)",
                        fontSize: "0.76rem",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      <i className="fa-solid fa-trash" style={{ marginRight: 5 }} />
                      Sil
                    </button>
                  </div>
                ) : (
                  <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                    <strong>Kullanım:</strong> Sol kütüphaneden <strong>Bina, Oda, Konteyner, Yol, Duvar</strong> veya{" "}
                    <strong>Birimleri</strong> tahtaya sürükleyin. Eklediğiniz binaların köşelerinden tutup boyutunu büyütebilir, üstteki turuncu noktadan döndürebilirsiniz.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── BOTTOM 2-COLUMN SECTION: OPERATIONAL DIRECTIVES + TACTICAL DISCUSSION ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", alignItems: "start" }}>
            {/* Left: Directives */}
            <div
              style={{
                backgroundColor: "var(--bg-secondary)",
                border: "1px solid var(--border-light)",
                borderRadius: 8,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "1rem 1.25rem",
                  borderBottom: "1px solid var(--border-light)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)" }}>
                    Operasyon Direktifleri ve Görev Emirleri
                  </h2>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 2 }}>
                    Birimlere atanan aşama bazlı taktik direktifler
                  </div>
                </div>
                <span
                  style={{
                    fontSize: "0.76rem",
                    fontWeight: 700,
                    backgroundColor: "var(--bg-tertiary)",
                    color: "var(--text-secondary)",
                    padding: "0.2rem 0.6rem",
                    borderRadius: 4,
                  }}
                >
                  {localPlan.directives.filter((d) => d.completed).length} / {localPlan.directives.length} Tamamlandı
                </span>
              </div>

              <div style={{ padding: "1rem 1.25rem", display: "flex", flexDirection: "column", gap: "0.6rem", maxHeight: 300, overflowY: "auto" }}>
                {localPlan.directives.length === 0 ? (
                  <div style={{ padding: "1.5rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                    Henüz direktif eklenmedi.
                  </div>
                ) : (
                  localPlan.directives.map((d) => (
                    <div
                      key={d.id}
                      style={{
                        padding: "0.75rem 0.9rem",
                        borderRadius: 6,
                        backgroundColor: d.completed ? "var(--bg-tertiary)" : "var(--bg-primary)",
                        border: "1px solid var(--border-light)",
                        borderLeft:
                          d.priority === "KRİTİK"
                            ? "3px solid #dc2626"
                            : d.priority === "YÜKSEK"
                            ? "3px solid var(--LAC-orange)"
                            : "3px solid #0284c7",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "0.75rem",
                        opacity: d.completed ? 0.7 : 1,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={d.completed}
                        onChange={() =>
                          updateLocalAndScheduleSave((prev) => ({
                            ...prev,
                            directives: prev.directives.map((item) =>
                              item.id === d.id ? { ...item, completed: !item.completed } : item
                            ),
                          }))
                        }
                        style={{ marginTop: 4, cursor: "pointer", width: 16, height: 16 }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", flexWrap: "wrap", marginBottom: "0.2rem" }}>
                          <span
                            style={{
                              fontSize: "0.72rem",
                              fontWeight: 700,
                              color: "var(--text-primary)",
                              backgroundColor: "var(--bg-secondary)",
                              padding: "0.1rem 0.45rem",
                              borderRadius: 4,
                              border: "1px solid var(--border-light)",
                            }}
                          >
                            {d.phase}
                          </span>
                          <span style={{ fontSize: "0.76rem", fontWeight: 700, color: "var(--LAC-orange)" }}>
                            {d.assignedTo}
                          </span>
                        </div>
                        <div
                          style={{
                            fontSize: "0.86rem",
                            color: "var(--text-primary)",
                            textDecoration: d.completed ? "line-through" : "none",
                            lineHeight: 1.45,
                          }}
                        >
                          {d.text}
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          updateLocalAndScheduleSave((prev) => ({
                            ...prev,
                            directives: prev.directives.filter((item) => item.id !== d.id),
                          }))
                        }
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--text-muted)",
                          cursor: "pointer",
                          fontSize: "0.8rem",
                        }}
                      >
                        <i className="fa-solid fa-xmark" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <form
                onSubmit={handleAddDirective}
                style={{
                  padding: "0.9rem 1.25rem",
                  borderTop: "1px solid var(--border-light)",
                  backgroundColor: "var(--bg-tertiary)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.55rem",
                }}
              >
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.3fr", gap: "0.5rem" }}>
                  <select
                    value={dirPhase}
                    onChange={(e) => setDirPhase(e.target.value)}
                    style={{
                      padding: "0.45rem 0.6rem",
                      borderRadius: 6,
                      border: "1px solid var(--border-strong)",
                      backgroundColor: "var(--bg-secondary)",
                      color: "var(--text-primary)",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                    }}
                  >
                    <option value="AŞAMA 1">Aşama 1</option>
                    <option value="AŞAMA 2">Aşama 2</option>
                    <option value="AŞAMA 3">Aşama 3</option>
                    <option value="ACİL DURUM">Acil Durum</option>
                  </select>
                  <select
                    value={dirPriority}
                    onChange={(e) => setDirPriority(e.target.value as any)}
                    style={{
                      padding: "0.45rem 0.6rem",
                      borderRadius: 6,
                      border: "1px solid var(--border-strong)",
                      backgroundColor: "var(--bg-secondary)",
                      color: "var(--text-primary)",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                    }}
                  >
                    <option value="NORMAL">Öncelik: Normal</option>
                    <option value="YÜKSEK">Öncelik: Yüksek</option>
                    <option value="KRİTİK">Öncelik: Kritik</option>
                  </select>
                  <input
                    type="text"
                    value={dirAssigned}
                    onChange={(e) => setDirAssigned(e.target.value)}
                    placeholder="Sorumlu Birim (Örn: SWAT-1)"
                    style={{
                      padding: "0.45rem 0.65rem",
                      borderRadius: 6,
                      border: "1px solid var(--border-strong)",
                      backgroundColor: "var(--bg-secondary)",
                      color: "var(--text-primary)",
                      fontSize: "0.78rem",
                    }}
                  />
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <input
                    type="text"
                    value={dirText}
                    onChange={(e) => setDirText(e.target.value)}
                    placeholder="Yeni taktik direktif veya görev emri yazın..."
                    style={{
                      flex: 1,
                      padding: "0.5rem 0.75rem",
                      borderRadius: 6,
                      border: "1px solid var(--border-strong)",
                      backgroundColor: "var(--bg-secondary)",
                      color: "var(--text-primary)",
                      fontSize: "0.84rem",
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      padding: "0.5rem 0.95rem",
                      borderRadius: 6,
                      backgroundColor: "#041632",
                      color: "#ffffff",
                      border: "none",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    + Direktif Ekle
                  </button>
                </div>
              </form>
            </div>

            {/* Right: Discussion & Briefing */}
            <div
              style={{
                backgroundColor: "var(--bg-secondary)",
                border: "1px solid var(--border-light)",
                borderRadius: 8,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "1rem 1.25rem",
                  borderBottom: "1px solid var(--border-light)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)" }}>
                    Taktiksel Tartışma ve Brifing Kanalı
                  </h2>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 2 }}>
                    Operasyon planı üzerine personel görüşleri ve istihbarat paylaşımı
                  </div>
                </div>
                <span
                  style={{
                    fontSize: "0.76rem",
                    fontWeight: 700,
                    backgroundColor: "var(--bg-tertiary)",
                    color: "var(--text-secondary)",
                    padding: "0.2rem 0.6rem",
                    borderRadius: 4,
                  }}
                >
                  {localPlan.comments.length} Mesaj
                </span>
              </div>

              <div style={{ padding: "1rem 1.25rem", display: "flex", flexDirection: "column", gap: "0.65rem", maxHeight: 300, overflowY: "auto" }}>
                {localPlan.comments.length === 0 ? (
                  <div style={{ padding: "1.5rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                    Henüz taktik değerlendirme yazılmadı.
                  </div>
                ) : (
                  localPlan.comments.map((c) => (
                    <div
                      key={c.id}
                      style={{
                        padding: "0.75rem 0.9rem",
                        borderRadius: 6,
                        backgroundColor: "var(--bg-primary)",
                        border: "1px solid var(--border-light)",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.3rem" }}>
                        <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-primary)" }}>
                          <span style={{ color: "var(--LAC-orange)" }}>{c.authorRank}</span> {c.authorName}{" "}
                          <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>(#{c.authorBadge})</span>
                        </div>
                        <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                          {new Date(c.createdAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>{c.content}</div>
                    </div>
                  ))
                )}
              </div>

              <form
                onSubmit={handleAddComment}
                style={{
                  padding: "0.9rem 1.25rem",
                  borderTop: "1px solid var(--border-light)",
                  backgroundColor: "var(--bg-tertiary)",
                  display: "flex",
                  gap: "0.5rem",
                }}
              >
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Operasyon planı hakkında taktik görüş veya istihbarat notu ekleyin..."
                  style={{
                    flex: 1,
                    padding: "0.55rem 0.75rem",
                    borderRadius: 6,
                    border: "1px solid var(--border-strong)",
                    backgroundColor: "var(--bg-secondary)",
                    color: "var(--text-primary)",
                    fontSize: "0.84rem",
                  }}
                />
                <button
                  type="submit"
                  style={{
                    padding: "0.55rem 1rem",
                    borderRadius: 6,
                    backgroundColor: "var(--LAC-orange)",
                    color: "#ffffff",
                    border: "none",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  Gönder
                </button>
              </form>
            </div>
          </div>
        </>
      )}

      {/* ── NEW PLAN MODAL ── */}
      {showNewPlanModal && (
        <div
          onClick={() => setShowNewPlanModal(false)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(4,22,50,0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "1rem",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "var(--bg-secondary)",
              border: "1px solid var(--border-light)",
              borderRadius: 8,
              width: "100%",
              maxWidth: 520,
              overflow: "hidden",
              boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
            }}
          >
            <div
              style={{
                padding: "1rem 1.25rem",
                backgroundColor: "#041632",
                color: "#ffffff",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ fontWeight: 700, fontSize: "1rem" }}>Yeni Taktiksel Operasyon Tahtası Oluştur</div>
              <button
                onClick={() => setShowNewPlanModal(false)}
                style={{ background: "none", border: "none", color: "#ffffff", cursor: "pointer", fontSize: "1rem" }}
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <form onSubmit={handleCreatePlan} style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.9rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, marginBottom: 4, color: "var(--text-primary)" }}>
                  Operasyon Başlığı *
                </label>
                <input
                  type="text"
                  required
                  value={newPlanForm.title}
                  onChange={(e) => setNewPlanForm({ ...newPlanForm, title: e.target.value })}
                  placeholder="Örn: Liman Konteyner Baskını Planı"
                  style={{
                    width: "100%",
                    padding: "0.55rem 0.75rem",
                    borderRadius: 6,
                    border: "1px solid var(--border-strong)",
                    backgroundColor: "var(--bg-primary)",
                    color: "var(--text-primary)",
                    fontSize: "0.86rem",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, marginBottom: 4, color: "var(--text-primary)" }}>
                    Konum / Bölge
                  </label>
                  <input
                    type="text"
                    value={newPlanForm.location}
                    onChange={(e) => setNewPlanForm({ ...newPlanForm, location: e.target.value })}
                    placeholder="Örn: Elysian Limanı"
                    style={{
                      width: "100%",
                      padding: "0.55rem 0.75rem",
                      borderRadius: 6,
                      border: "1px solid var(--border-strong)",
                      backgroundColor: "var(--bg-primary)",
                      color: "var(--text-primary)",
                      fontSize: "0.86rem",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, marginBottom: 4, color: "var(--text-primary)" }}>
                    Başlangıç Şablonu
                  </label>
                  <select
                    value={newPlanForm.mapType}
                    onChange={(e) => setNewPlanForm({ ...newPlanForm, mapType: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "0.55rem 0.75rem",
                      borderRadius: 6,
                      border: "1px solid var(--border-strong)",
                      backgroundColor: "var(--bg-primary)",
                      color: "var(--text-primary)",
                      fontSize: "0.86rem",
                      boxSizing: "border-box",
                    }}
                  >
                    <option value="EMPTY">Boş Taktik Tahta (Kendin İnşa Et)</option>
                    <option value="BUILDING">Hazır Müstakil Bina</option>
                    <option value="BANK">Hazır Banka Planı</option>
                    <option value="INTERSECTION">Hazır Şehir Kavşağı</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, marginBottom: 4, color: "var(--text-primary)" }}>
                  Operasyon Özeti
                </label>
                <textarea
                  rows={3}
                  value={newPlanForm.summary}
                  onChange={(e) => setNewPlanForm({ ...newPlanForm, summary: e.target.value })}
                  placeholder="Operasyon hedefi ve genel istihbarat bilgileri..."
                  style={{
                    width: "100%",
                    padding: "0.55rem 0.75rem",
                    borderRadius: 6,
                    border: "1px solid var(--border-strong)",
                    backgroundColor: "var(--bg-primary)",
                    color: "var(--text-primary)",
                    fontSize: "0.85rem",
                    boxSizing: "border-box",
                    fontFamily: "inherit",
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => setShowNewPlanModal(false)}
                  style={{
                    padding: "0.55rem 1rem",
                    borderRadius: 6,
                    border: "1px solid var(--border-strong)",
                    backgroundColor: "var(--bg-primary)",
                    color: "var(--text-primary)",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  İptal
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "0.55rem 1.2rem",
                    borderRadius: 6,
                    border: "none",
                    backgroundColor: "var(--LAC-orange)",
                    color: "#ffffff",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Boş Tahtayı Oluştur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
