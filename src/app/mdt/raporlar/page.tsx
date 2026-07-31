"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { toast } from "react-hot-toast";

/* ─── Palette tokens ─── */
// bg: #0a0a0a  card: #111  elevated: #161616
// border: rgba(255,255,255,0.08)   text: #ededed  sec: #888  muted: #555
// blue: #1D6EF7   green: #00d26a   red: #ef4444

const REPORT_TEMPLATES = [
  {
    id: "incident", category: "CRIME", categoryName: "Suç & Olay",
    name: "Olay Yeri Raporu", code: "3.14", icon: "fa-shield-halved",
    description: "Genel suçlar ve olay yeri ön soruşturması için temel rapor.",
    sections: [
      { title: "Olay Bilgileri", fields: [
        { id: "incident_type", label: "Olay Türü", type: "text", placeholder: "Silahlı Soygun, Haneye Tecavüz...", width: "6" },
        { id: "incident_location", label: "Olay Yeri", type: "text", placeholder: "Sokak / Blok", width: "6" },
        { id: "incident_date", label: "Tarih", type: "date", width: "3", defaultVal: "today" },
        { id: "incident_time", label: "Saat", type: "time", width: "3", defaultVal: "now" },
        { id: "code_section", label: "Penal Code Maddesi", type: "text", placeholder: "PC 211 - Robbery", width: "6" },
      ]},
      { title: "Taraflar", fields: [
        { id: "suspect_name", label: "Şüpheli", type: "text", placeholder: "Ad Soyad veya 'Meçhul'", width: "6" },
        { id: "suspect_desc", label: "Şüpheli Eşkali", type: "text", placeholder: "Boy, kıyafet, dövme...", width: "6" },
        { id: "victim_name", label: "Mağdur", type: "text", placeholder: "Ad Soyad", width: "6" },
        { id: "victim_phone", label: "Mağdur İletişim", type: "text", placeholder: "555-xxxx", width: "6" },
      ]},
      { title: "Anlatım & Deliller", fields: [
        { id: "narrative", label: "Detaylı Olay Anlatımı", type: "textarea", placeholder: "Olay yerine varıldığında yapılan tespitler...", width: "12", rows: 7 },
        { id: "evidence_collected", label: "Toplanan Delil Listesi", type: "textarea", placeholder: "1. 9mm Kovan\n2. CCTV Kaydı", width: "12", rows: 3 },
      ]},
    ]
  },
  {
    id: "arrest", category: "CRIME", categoryName: "Suç & Olay",
    name: "Gözaltı & Tutuklama", code: "5.02", icon: "fa-handcuffs",
    description: "Şüpheli gözaltısı, Miranda hakları ve nezarethane sevk işlemleri.",
    sections: [
      { title: "Gözaltı Kişisi", fields: [
        { id: "arrestee_name", label: "Ad Soyad", type: "text", placeholder: "Tam Ad Soyad", width: "6" },
        { id: "arrestee_dob", label: "Doğum Tarihi", type: "date", width: "3" },
        { id: "arrestee_gender", label: "Cinsiyet", type: "select", options: ["Erkek", "Kadın", "Diğer"], width: "3" },
        { id: "arrestee_id", label: "Kimlik No", type: "text", placeholder: "xxxx-xxxx", width: "6" },
        { id: "booking_num", label: "Booking #", type: "text", placeholder: "BK-2026-xxxx", width: "6" },
      ]},
      { title: "Suçlamalar & Miranda", fields: [
        { id: "charges_list", label: "Suçlamalar", type: "textarea", placeholder: "1. PC 245(a)(1) - Assault with Deadly Weapon", width: "12", rows: 3 },
        { id: "miranda_read", label: "Miranda Hakları Okundu mu?", type: "select", options: ["Evet — Haklar okundu ve anlaşıldı", "Hayır — Soru sorulmadı", "Şahıs avukat istiyor"], width: "6" },
        { id: "bail_amount", label: "Kefalet", type: "text", placeholder: "$50,000 veya Kefaletsiz", width: "6" },
      ]},
      { title: "Tutuklama Detayı", fields: [
        { id: "arrest_narrative", label: "Gözaltı Koşulları", type: "textarea", placeholder: "Şahıs nerede tespit edildi, nasıl durduruldu...", width: "12", rows: 6 },
      ]},
    ]
  },
  {
    id: "stolen_veh", category: "CRIME", categoryName: "Suç & Olay",
    name: "Çalıntı Araç Bildirimi", code: "3.77", icon: "fa-car-burst",
    description: "BOLO / APB çıkışı için çalıntı araç tanım ve bildirim raporu.",
    sections: [
      { title: "Araç Bilgileri", fields: [
        { id: "veh_plate", label: "Plaka", type: "text", placeholder: "Plaka No", width: "4" },
        { id: "veh_make_model", label: "Marka & Model", type: "text", placeholder: "Bravado Buffalo S", width: "4" },
        { id: "veh_color", label: "Renk", type: "text", placeholder: "Siyah / Mat", width: "4" },
        { id: "veh_vin", label: "VIN / Şasi", type: "text", placeholder: "12 Haneli VIN", width: "6" },
        { id: "veh_year", label: "Model Yılı", type: "text", placeholder: "2023", width: "6" },
      ]},
      { title: "Çalınma Detayları", fields: [
        { id: "theft_location", label: "Çalındığı Konum", type: "text", placeholder: "Adres / Otopark", width: "6" },
        { id: "theft_date_time", label: "Tahmini Çalınma Zamanı", type: "text", placeholder: "13.07.2026 Saat 21:00–23:00", width: "6" },
        { id: "owner_name", label: "Ruhsat Sahibi", type: "text", placeholder: "Ad Soyad", width: "6" },
        { id: "owner_contact", label: "Ruhsat Sahibi Telefon", type: "text", placeholder: "555-xxxx", width: "6" },
        { id: "theft_narrative", label: "Özel İşaretler & Notlar", type: "textarea", placeholder: "Modifiye, kırık cam, özel jant...", width: "12", rows: 4 },
      ]},
    ]
  },
  {
    id: "citation", category: "TRAFFIC", categoryName: "Trafik & Ceza",
    name: "Trafik Cezası (Citation)", code: "4.50", icon: "fa-file-invoice-dollar",
    description: "Hız ihlalleri ve karayolu kural ihlalleri için resmi ceza makbuzu.",
    sections: [
      { title: "Sürücü Bilgileri", fields: [
        { id: "driver_name", label: "Sürücü", type: "text", placeholder: "Ad Soyad", width: "6" },
        { id: "dl_number", label: "Ehliyet No", type: "text", placeholder: "DL-xxxxxx", width: "3" },
        { id: "dl_class", label: "Sınıf", type: "text", placeholder: "A / C", width: "3" },
        { id: "driver_address", label: "İkamet Adresi", type: "text", placeholder: "Sokak / Şehir", width: "12" },
      ]},
      { title: "Araç & İhlal", fields: [
        { id: "citation_plate", label: "Plaka", type: "text", placeholder: "Plaka", width: "4" },
        { id: "citation_make", label: "Araç", type: "text", placeholder: "Vapid Dominator", width: "4" },
        { id: "citation_color", label: "Renk", type: "text", placeholder: "Kırmızı", width: "4" },
        { id: "violation_location", label: "İhlal Konumu", type: "text", placeholder: "Vinewood Blvd & Alta St", width: "8" },
        { id: "radar_speed", label: "Ölçülen Hız", type: "text", placeholder: "Limit 45 mph / Ölçülen 82 mph", width: "4" },
        { id: "violations", label: "İhlal Maddeleri & Cezalar", type: "textarea", placeholder: "1. VC 22350 — Speeding ($350)\n2. VC 21453(a) — Red Light ($200)", width: "12", rows: 3 },
        { id: "total_fine", label: "Toplam Ceza ($)", type: "text", placeholder: "$550", width: "4" },
        { id: "court_date", label: "Mahkeme Tarihi", type: "date", width: "4" },
        { id: "is_impounded", label: "Araç Çekildi mi?", type: "select", options: ["Hayır", "Evet — Otoparka Çekildi"], width: "4" },
      ]},
    ]
  },
  {
    id: "dui", category: "TRAFFIC", categoryName: "Trafik & Ceza",
    name: "DUI — Alkol / Uyuşturucu", code: "4.22", icon: "fa-wine-bottle",
    description: "Saha ayıklık testleri (FST) ve alkolölçer (BAC) sonuç raporu.",
    sections: [
      { title: "Durdurma Gerekçesi", fields: [
        { id: "dui_driver", label: "Sürücü", type: "text", placeholder: "Ad Soyad", width: "6" },
        { id: "dui_plate", label: "Plaka", type: "text", placeholder: "Plaka", width: "6" },
        { id: "stop_reason", label: "Durdurma Gerekçesi", type: "text", placeholder: "Şerit ihlali, zikzak çizme...", width: "12" },
      ]},
      { title: "Saha Ayıklık Testleri (FST)", fields: [
        { id: "fst_gaze", label: "HGN Testi", type: "select", options: ["Başarısız — Nistagmus var", "Başarılı", "Uygulanamadı"], width: "6" },
        { id: "fst_walk", label: "Yürüme & Dönüş", type: "select", options: ["Başarısız — Dengesi bozuk", "Başarılı", "Uygulanamadı"], width: "6" },
        { id: "fst_leg", label: "Tek Ayak", type: "select", options: ["Başarısız", "Başarılı", "Uygulanamadı"], width: "6" },
        { id: "breathalyzer_result", label: "BAC Sonucu", type: "text", placeholder: "%0.14 BAC (Yasal sınır %0.08)", width: "6" },
        { id: "dui_observations", label: "Memur Gözlemleri", type: "textarea", placeholder: "Alkol kokusu, peltek konuşma...", width: "12", rows: 4 },
      ]},
    ]
  },
  {
    id: "tow", category: "TRAFFIC", categoryName: "Trafik & Ceza",
    name: "Araç Çekme & Otopark", code: "4.10", icon: "fa-truck-pickup",
    description: "İhlale karışan veya el konulan araçların otopark sevk tutanağı.",
    sections: [
      { title: "Çekilen Araç", fields: [
        { id: "tow_plate", label: "Plaka", type: "text", placeholder: "Plaka", width: "4" },
        { id: "tow_make", label: "Marka & Model", type: "text", placeholder: "Marka Model", width: "4" },
        { id: "tow_color", label: "Renk", type: "text", placeholder: "Renk", width: "4" },
        { id: "tow_location", label: "Çekildiği Konum", type: "text", placeholder: "Adres / Cadde", width: "8" },
        { id: "tow_reason", label: "Gerekçe", type: "select", options: ["Park Yasağı", "Sürücünün Gözaltına Alınması", "DUI", "Kriminal El Koyma", "Terk Edilmiş Araç"], width: "4" },
        { id: "veh_damage", label: "Hasar Durumu", type: "text", placeholder: "Ön tampon vuruk — veya — Temiz", width: "12" },
        { id: "inventory_items", label: "Araç İçi Envanter", type: "textarea", placeholder: "1. Bagajda yedek lastik\n2. Torpido gözünde ruhsat", width: "12", rows: 3 },
      ]},
    ]
  },
  {
    id: "detective_case", category: "DETECTIVE", categoryName: "Dedektif",
    name: "Dava & Soruşturma Dosyası", code: "3.18", icon: "fa-magnifying-glass",
    description: "Organize suçlar ve ağır ceza soruşturmalarının ana dedektif raporu.",
    sections: [
      { title: "Dava Künyesi", fields: [
        { id: "case_number", label: "Dava No", type: "text", placeholder: "CASE-2026-xxxx", width: "6" },
        { id: "investigation_unit", label: "Soruşturma Birimi", type: "select", options: ["Robbery-Homicide Division (RHD)", "Gang and Narcotics Division (GND)", "Major Crimes Division (MCD)", "Detective Bureau — General"], width: "6" },
        { id: "lead_detectives", label: "Sorumlu Dedektifler", type: "text", placeholder: "Det. Smith #1024, Det. Johnson #1105", width: "12" },
      ]},
      { title: "Bulgular & İlerleme", fields: [
        { id: "case_summary", label: "Dava Özeti", type: "textarea", placeholder: "Soruşturmanın başlangıç noktası...", width: "12", rows: 5 },
        { id: "witness_statements", label: "Tanık İfadeleri", type: "textarea", placeholder: "Tanık A: Olay günü şüphelileri siyah SUV içinde gördüğünü belirtti...", width: "12", rows: 4 },
        { id: "next_steps", label: "Sonraki Adımlar", type: "textarea", placeholder: "1. HTS kayıtları incelemesi\n2. Mahkemeden arama kararı talebi", width: "12", rows: 3 },
      ]},
    ]
  },
  {
    id: "uof", category: "DETECTIVE", categoryName: "Dedektif",
    name: "Güç Kullanımı (UOF)", code: "1.12", icon: "fa-gavel",
    description: "Fiziki güç, Taser veya ateşli silah kullanımı zorunlu raporu.",
    sections: [
      { title: "Olay & Memur", fields: [
        { id: "uof_officer", label: "Güç Kullanan Memur", type: "text", placeholder: "Adı ve Rozet No", width: "6" },
        { id: "uof_subject", label: "Güç Uygulanan Şahıs", type: "text", placeholder: "Şahıs Adı Soyadı", width: "6" },
        { id: "force_type", label: "Güç Seviyesi", type: "select", options: ["Seviye 1 — Fiziki Müdahale / Kelepçe", "Seviye 2 — Taser / OC Sprey", "Seviye 3 — Jop / K9 / Havaya Ateş", "Seviye 4 — Ateşli Silah (Lethal)"], width: "12" },
        { id: "force_justification", label: "Güç Kullanma Gerekçesi", type: "textarea", placeholder: "Şahıs kelepçelenmeye direndi mi, saldırdı mı?...", width: "12", rows: 5 },
        { id: "medical_attention", label: "Tıbbi Müdahale", type: "textarea", placeholder: "EMS çağrıldı mı, hastaneye sevk edildi mi?...", width: "12", rows: 3 },
      ]},
    ]
  },
  {
    id: "search_warrant", category: "WARRANT", categoryName: "Mahkeme",
    name: "Arama Kararı Talebi", code: "8.01", icon: "fa-scale-balanced",
    description: "Arama ve el koyma için mahkemeye sunulan resmi beyan belgesi.",
    sections: [
      { title: "Hedef Konum & Deliller", fields: [
        { id: "target_address", label: "Aranacak Adres", type: "text", placeholder: "1424 Eclipse Towers, Apt #12", width: "8" },
        { id: "target_owner", label: "Şüpheli Sahibi", type: "text", placeholder: "Şüpheli Adı", width: "4" },
        { id: "items_to_seize", label: "Aranacak Nesneler", type: "textarea", placeholder: "1. Yasadışı silahlar\n2. Uyuşturucu madde", width: "12", rows: 4 },
        { id: "probable_cause", label: "Makul Şüphe Beyanı", type: "textarea", placeholder: "Delillerin bu mülkte bulunduğuna dair memur beyanı...", width: "12", rows: 6 },
        { id: "judge_name", label: "Onaylayan Yargıç", type: "text", placeholder: "Yargıç Adı / Mahkeme", width: "6" },
        { id: "warrant_status", label: "Karar Durumu", type: "select", options: ["Mahkemeden Onay Bekliyor", "ONAYLANDI — Aktif", "İnfaz Edildi — Tamamlandı"], width: "6" },
      ]},
    ]
  },
  {
    id: "arrest_warrant", category: "WARRANT", categoryName: "Mahkeme",
    name: "Yakalama Kararı", code: "8.15", icon: "fa-user-lock",
    description: "Firari şüpheliler için mahkeme onaylı resmi yakalama kararı.",
    sections: [
      { title: "Aranan Şüpheli", fields: [
        { id: "warrant_suspect", label: "Ad Soyad", type: "text", placeholder: "Tam Ad Soyad", width: "6" },
        { id: "warrant_alias", label: "Takma Ad (Alias)", type: "text", placeholder: "'Ghost', 'Slim'", width: "6" },
        { id: "warrant_charges", label: "İsnat Edilen Suçlar", type: "textarea", placeholder: "1. Cinayet Teşebbüsü\n2. Silahlı Soygun", width: "12", rows: 3 },
        { id: "danger_level", label: "Risk Seviyesi", type: "select", options: ["SİLAHLI VE TEHLİKELİ — SWAT Önerilir", "Yüksek Risk / Kaçma Eğilimli", "Standart Yakalama"], width: "12" },
        { id: "warrant_notes", label: "Operasyon Notları", type: "textarea", placeholder: "Şüpheli genellikle Güney LS'de görülmüştür...", width: "12", rows: 4 },
      ]},
    ]
  },
  {
    id: "field_contact", category: "FIELD", categoryName: "Saha",
    name: "Saha İrtibat Raporu", code: "15.43", icon: "fa-user-check",
    description: "Gözaltısız kimlik tespiti, sorgulama ve GBT kontrollerinin kaydı.",
    sections: [
      { title: "Kontrol Edilen Şahıs", fields: [
        { id: "contact_name", label: "Ad Soyad", type: "text", placeholder: "Ad Soyad", width: "6" },
        { id: "contact_location", label: "Kontrol Konumu", type: "text", placeholder: "Cadde / Sokak", width: "6" },
        { id: "contact_reason", label: "Kontrol Sebebi", type: "text", placeholder: "Gece vakti şüpheli bekleme...", width: "12" },
        { id: "contact_notes", label: "Gözlemler & Sonuç", type: "textarea", placeholder: "Kimlik ibraz edildi, suç unsuruna rastlanmadı, serbest bırakıldı.", width: "12", rows: 4 },
      ]},
    ]
  },
  {
    id: "shift_end", category: "FIELD", categoryName: "Saha",
    name: "Vardiya Sonu Raporu", code: "2.10", icon: "fa-calendar-check",
    description: "Devriye bitiminde günlük faaliyet ve istatistiklerin özet raporu.",
    sections: [
      { title: "Vardiya Künyesi", fields: [
        { id: "shift_unit", label: "Çağrı Kodu", type: "text", placeholder: "1-ADAM-12", width: "4" },
        { id: "shift_officers", label: "Devriyedeki Memurlar", type: "text", placeholder: "Memur A #101, Memur B #102", width: "8" },
        { id: "shift_stats", label: "Vardiya İstatistikleri", type: "textarea", placeholder: "• Durdurulan Araç: 5\n• Kesilen Ceza: 3\n• Tutuklama: 1\n• 911 Çağrısı: 7", width: "12", rows: 5 },
        { id: "shift_summary", label: "Önemli Olaylar & Notlar", type: "textarea", placeholder: "Vardiya boyunca önemli olaylar...", width: "12", rows: 4 },
      ]},
    ]
  },
];

const CATEGORIES = [
  { id: "ALL",       label: "Tümü",       icon: "fa-border-all",        color: "#888",    dot: "#555" },
  { id: "CRIME",     label: "Suç & Olay", icon: "fa-handcuffs",         color: "#ef4444", dot: "#ef4444" },
  { id: "TRAFFIC",   label: "Trafik",     icon: "fa-car-on",            color: "#f59e0b", dot: "#f59e0b" },
  { id: "DETECTIVE", label: "Dedektif",   icon: "fa-magnifying-glass",  color: "#8b5cf6", dot: "#8b5cf6" },
  { id: "WARRANT",   label: "Mahkeme",    icon: "fa-scale-balanced",    color: "#1D6EF7", dot: "#1D6EF7" },
  { id: "FIELD",     label: "Saha",       icon: "fa-user-shield",       color: "#00d26a", dot: "#00d26a" },
];

const card: React.CSSProperties = {
  background: "#111111",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 8,
  overflow: "hidden",
};

const inputBase: React.CSSProperties = {
  width: "100%",
  background: "#161616",
  border: "1px solid rgba(255,255,255,0.08)",
  borderBottom: "2px solid rgba(255,255,255,0.14)",
  borderRadius: 4,
  padding: "0.6rem 0.85rem",
  color: "#ededed",
  fontSize: "0.83rem",
  outline: "none",
  fontFamily: "inherit",
  transition: "border-color 0.15s, box-shadow 0.15s",
  boxSizing: "border-box" as const,
};

export default function RaporPortali() {
  const { data: meData } = useSWR("/api/auth/me", fetcher);
  const user = meData?.user ?? null;

  const [view, setView] = useState<"home" | "editor" | "saved">("home");
  const [activeCat, setActiveCat] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const [template, setTemplate] = useState<any>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [reportCode, setReportCode] = useState("");

  const [savedReports, setSavedReports] = useState<any[]>([]);
  const [archiveSearch, setArchiveSearch] = useState("");
  const [loadingReports, setLoadingReports] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);

  useEffect(() => { fetchSaved(); }, []);

  const fetchSaved = async () => {
    setLoadingReports(true);
    try {
      const r = await fetch('/api/forms-reports');
      const d = await r.json();
      if (d.reports) setSavedReports(d.reports);
    } catch {}
    setLoadingReports(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const currentUrls = formData.evidenceUrl ? formData.evidenceUrl.split(",") : [];
    if (currentUrls.length >= 5) { toast.error("En fazla 5 adet görsel yükleyebilirsiniz."); return; }
    setUploadingImg(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok) {
        setFormData(prev => ({ ...prev, evidenceUrl: prev.evidenceUrl ? prev.evidenceUrl + "," + data.url : data.url }));
        toast.success("Delil görseli eklendi.");
      } else toast.error(data.error || "Yükleme başarısız.");
    } catch { toast.error("Sunucu hatası."); }
    finally { setUploadingImg(false); }
  };

  const openTemplate = (tmpl: any) => {
    setTemplate(tmpl);
    const code = `${tmpl.id.toUpperCase()}-${Date.now().toString().slice(-6)}`;
    setReportCode(code);
    const init: Record<string, string> = {};
    tmpl.sections.forEach((s: any) => s.fields.forEach((f: any) => {
      if (f.defaultVal === "today") init[f.id] = new Date().toISOString().split("T")[0];
      else if (f.defaultVal === "now") {
        const n = new Date();
        init[f.id] = `${String(n.getHours()).padStart(2,'0')}:${String(n.getMinutes()).padStart(2,'0')}`;
      } else init[f.id] = "";
    }));
    setFormData(init);
    setView("editor");
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const r = await fetch('/api/forms-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: reportCode, formId: template.id,
          officerName: user ? `${user.name} (#${user.badge})` : "Bilinmiyor",
          data: formData, diagram: []
        })
      });
      if (r.ok) { await fetchSaved(); setView("saved"); toast.success("Rapor kaydedildi."); }
      else toast.error("Kaydetme hatası.");
    } catch { toast.error("Sunucu hatası."); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(`#${id} silinsin mi?`)) return;
    await fetch(`/api/forms-reports?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    setSavedReports(prev => prev.filter(r => r.id !== id));
  };

  const openSaved = (s: any) => {
    const tmpl = REPORT_TEMPLATES.find(t => t.id === s.formId) || REPORT_TEMPLATES[0];
    setTemplate(tmpl);
    setReportCode(s.id);
    setFormData(s.data || {});
    setView("editor");
  };

  const filtered = REPORT_TEMPLATES.filter(t =>
    (activeCat === "ALL" || t.category === activeCat) &&
    (t.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.code.includes(searchTerm))
  );

  const sectionLabel: React.CSSProperties = {
    fontSize: "0.55rem", fontWeight: 700, color: "#555",
    letterSpacing: "0.2em", textTransform: "uppercase",
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&display=swap');
        .rp-inp:focus { border-color: rgba(29,110,247,0.5) !important; box-shadow: 0 0 0 3px rgba(29,110,247,0.1) !important; outline: none; }
        .rp-inp option { background: #161616; color: #ededed; }
        .tmpl-row { transition: background 0.14s, border-color 0.14s; cursor: pointer; }
        .tmpl-row:hover { background: rgba(255,255,255,0.04) !important; border-color: rgba(255,255,255,0.12) !important; }
        .cat-btn { transition: all 0.15s ease; }
        .arch-row { transition: background 0.13s; }
        .arch-row:hover { background: rgba(255,255,255,0.04) !important; }
        .tab-btn { transition: all 0.15s ease; border: none; cursor: pointer; }
        .tab-btn:hover { color: #ededed !important; }
        @media print {
          @page { size: portrait; margin: 15mm; }
          body * { visibility: hidden; }
          aside, header, .no-print { display: none !important; }
          .print-doc, .print-doc * { visibility: visible; }
          .print-doc { position: absolute; left: 0; top: 0; width: 100%; background: white !important; color: black !important; border: none !important; padding: 0 !important; }
          .print-doc * { color: black !important; background: transparent !important; }
        }
      `}</style>

      <div className="no-print" style={{ maxWidth: 1100, margin: "0 auto", paddingBottom: "2rem", display: "flex", flexDirection: "column", gap: "1rem" }}>

        {/* ─── Header ─── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ ...sectionLabel, marginBottom: "0.4rem" }}>L.A.C.P.D. · DOKÜMAN ARŞİVİ</div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#ededed", margin: 0, letterSpacing: "-0.025em" }}>
              Rapor & Belge Portalı
            </h1>
          </div>

          {/* Tab switcher */}
          <div style={{ display: "flex", background: "#161616", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "0.25rem", gap: "0.25rem" }}>
            {[
              { id: "home",  label: "Şablonlar",              icon: "fa-layer-group" },
              { id: "saved", label: `Arşiv (${savedReports.length})`, icon: "fa-box-archive" },
            ].map(tab => {
              const isActive = view === tab.id || (tab.id === "home" && view === "editor");
              return (
                <button key={tab.id} className="tab-btn" onClick={() => setView(tab.id as any)} style={{
                  background: isActive ? "#111111" : "transparent",
                  color: isActive ? "#ededed" : "#555",
                  padding: "0.45rem 1.1rem", borderRadius: 4,
                  fontWeight: 700, fontSize: "0.76rem",
                  border: isActive ? "1px solid rgba(255,255,255,0.1)" : "1px solid transparent",
                  display: "flex", alignItems: "center", gap: "0.5rem",
                }}>
                  <i className={`fa-solid ${tab.icon}`} style={{ fontSize: "0.65rem" }} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── HOME: TEMPLATE LIST ─── */}
        {view === "home" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {/* Filter bar */}
            <div style={{ ...card, padding: "0.75rem 1rem", display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap", justifyContent: "space-between" }}>
              <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                {CATEGORIES.map(cat => {
                  const isActive = activeCat === cat.id;
                  return (
                    <button key={cat.id} className="cat-btn" onClick={() => setActiveCat(cat.id)} style={{
                      background: isActive ? "rgba(255,255,255,0.08)" : "transparent",
                      border: isActive ? `1px solid rgba(255,255,255,0.12)` : "1px solid rgba(255,255,255,0.06)",
                      color: isActive ? "#ededed" : "#555",
                      padding: "0.35rem 0.85rem",
                      borderRadius: 4, fontSize: "0.72rem", fontWeight: 700,
                      cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem",
                    }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: isActive ? cat.dot : "#333", display: "inline-block", flexShrink: 0 }} />
                      {cat.label}
                    </button>
                  );
                })}
              </div>
              <input
                className="rp-inp"
                type="text"
                placeholder="Şablon ara..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ ...inputBase, width: 220, borderRadius: 4 }}
              />
            </div>

            {/* Template rows — list style, not big cards */}
            <div style={card}>
              {filtered.length === 0 ? (
                <div style={{ padding: "3rem", textAlign: "center", color: "#333", fontSize: "0.8rem" }}>Eşleşen şablon bulunamadı.</div>
              ) : filtered.map((tmpl, idx) => {
                const catInfo = CATEGORIES.find(c => c.id === tmpl.category) || CATEGORIES[0];
                return (
                  <div
                    key={tmpl.id}
                    className="tmpl-row"
                    onClick={() => openTemplate(tmpl)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      padding: "0.85rem 1.1rem",
                      borderBottom: idx < filtered.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                      background: "transparent",
                      border: "none",
                    }}
                  >
                    {/* Icon */}
                    <div style={{
                      width: 36, height: 36, borderRadius: 6, flexShrink: 0,
                      background: `${catInfo.color}12`,
                      border: `1px solid ${catInfo.color}25`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: catInfo.color, fontSize: "0.82rem",
                    }}>
                      <i className={`fa-solid ${tmpl.icon}`} />
                    </div>

                    {/* Name & description */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#ededed" }}>{tmpl.name}</div>
                      <div style={{ fontSize: "0.72rem", color: "#555", marginTop: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{tmpl.description}</div>
                    </div>

                    {/* Category badge */}
                    <div style={{ flexShrink: 0 }}>
                      <span style={{
                        fontSize: "0.6rem", fontWeight: 700, padding: "0.2rem 0.55rem",
                        borderRadius: 4, background: `${catInfo.color}10`,
                        border: `1px solid ${catInfo.color}20`,
                        color: catInfo.color, letterSpacing: "0.06em",
                        display: "flex", alignItems: "center", gap: "0.35rem",
                      }}>
                        <i className={`fa-solid ${catInfo.icon}`} style={{ fontSize: "0.55rem" }} />
                        {tmpl.categoryName}
                      </span>
                    </div>

                    {/* Code */}
                    <div style={{
                      fontFamily: "'JetBrains Mono', monospace", fontSize: "0.65rem",
                      fontWeight: 700, color: "#444", background: "#1a1a1a",
                      padding: "0.2rem 0.55rem", borderRadius: 4,
                      border: "1px solid rgba(255,255,255,0.06)", flexShrink: 0,
                    }}>
                      LAC {tmpl.code}
                    </div>

                    {/* Fill button */}
                    <button
                      onClick={e => { e.stopPropagation(); openTemplate(tmpl); }}
                      style={{
                        background: "#1D6EF7", border: "none", color: "#fff",
                        padding: "0.4rem 0.9rem", borderRadius: 4,
                        fontSize: "0.68rem", fontWeight: 700, cursor: "pointer",
                        flexShrink: 0, letterSpacing: "0.06em",
                      }}
                    >
                      DOLDUR
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── ARCHIVE ─── */}
        {view === "saved" && (
          <div style={card}>
            <div style={{ padding: "0.85rem 1.1rem", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#ededed" }}>Arşivlenmiş Raporlar</div>
                <div style={{ fontSize: "0.68rem", color: "#555", marginTop: 2 }}>Kaydedilmiş rapor kayıtlarını görüntüle veya düzenle</div>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  className="rp-inp"
                  type="text"
                  placeholder="Arşivde ara..."
                  value={archiveSearch}
                  onChange={e => setArchiveSearch(e.target.value)}
                  style={{ ...inputBase, width: 220 }}
                />
                <button onClick={fetchSaved} style={{ background: "#161616", border: "1px solid rgba(255,255,255,0.08)", color: "#888", padding: "0.5rem 0.8rem", borderRadius: 4, cursor: "pointer" }}>
                  <i className="fa-solid fa-rotate" style={{ fontSize: "0.75rem" }} />
                </button>
              </div>
            </div>
            <div>
              {loadingReports ? (
                <div style={{ padding: "3rem", textAlign: "center", color: "#333", fontSize: "0.8rem" }}>
                  <i className="fa-solid fa-circle-notch fa-spin" style={{ marginRight: "0.5rem" }} />Yükleniyor...
                </div>
              ) : savedReports.length === 0 ? (
                <div style={{ padding: "3rem", textAlign: "center", color: "#333", fontSize: "0.8rem" }}>Arşivde kayıt bulunamadı.</div>
              ) : savedReports
                .filter(r => r.id.toLowerCase().includes(archiveSearch.toLowerCase()) || (r.officerName && r.officerName.toLowerCase().includes(archiveSearch.toLowerCase())))
                .map((r, idx, arr) => {
                  const tmpl = REPORT_TEMPLATES.find(t => t.id === r.formId) || REPORT_TEMPLATES[0];
                  const catInfo = CATEGORIES.find(c => c.id === tmpl.category) || CATEGORIES[0];
                  return (
                    <div key={r.id} className="arch-row" style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "0.85rem 1.1rem",
                      borderBottom: idx < arr.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <div style={{ width: 5, height: 5, borderRadius: "50%", background: catInfo.dot, flexShrink: 0 }} />
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#ededed" }}>{tmpl.name}</span>
                            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.6rem", color: "#444", background: "#1a1a1a", padding: "0.15rem 0.45rem", borderRadius: 3, border: "1px solid rgba(255,255,255,0.06)" }}>#{r.id}</span>
                          </div>
                          <div style={{ fontSize: "0.68rem", color: "#555", marginTop: 3 }}>
                            {r.officerName || "—"} · {r.timestamp ? new Date(r.timestamp).toLocaleString("tr-TR") : "—"}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "0.4rem" }}>
                        <button onClick={() => openSaved(r)} style={{ background: "#161616", color: "#1D6EF7", border: "1px solid rgba(255,255,255,0.08)", padding: "0.35rem 0.75rem", borderRadius: 4, fontSize: "0.68rem", fontWeight: 700, cursor: "pointer" }}>GÖRÜNTÜLE</button>
                        <button onClick={() => handleDelete(r.id)} style={{ background: "rgba(239,68,68,0.08)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.15)", padding: "0.35rem 0.75rem", borderRadius: 4, fontSize: "0.68rem", fontWeight: 700, cursor: "pointer" }}>SİL</button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>

      {/* ─── EDITOR ─── */}
      {view === "editor" && template && (
        <div style={{ maxWidth: 980, margin: "0 auto" }}>

          {/* Editor toolbar */}
          <div className="no-print" style={{ ...card, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.85rem 1.1rem", marginBottom: "1rem" }}>
            <div>
              <div style={{ fontSize: "0.55rem", fontWeight: 700, color: "#555", letterSpacing: "0.18em", textTransform: "uppercase" }}>DÜZENLENİYOR</div>
              <div style={{ fontSize: "1rem", fontWeight: 800, color: "#ededed", display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.15rem" }}>
                {template.name}
                <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "#444", fontSize: "0.72rem", background: "#1a1a1a", padding: "0.15rem 0.5rem", borderRadius: 4, border: "1px solid rgba(255,255,255,0.06)" }}>#{reportCode}</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button onClick={() => setView("home")} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.08)", color: "#555", padding: "0.5rem 0.9rem", borderRadius: 4, fontWeight: 700, fontSize: "0.72rem", cursor: "pointer" }}>İPTAL</button>
              <button onClick={() => window.print()} style={{ background: "#161616", border: "1px solid rgba(255,255,255,0.08)", color: "#888", padding: "0.5rem 1rem", borderRadius: 4, fontWeight: 700, cursor: "pointer", fontSize: "0.72rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <i className="fa-solid fa-print" style={{ fontSize: "0.65rem" }} /> YAZDIR
              </button>
              <button onClick={handleSave} disabled={saving} style={{ background: "#00d26a", border: "none", color: "#000", padding: "0.5rem 1.1rem", borderRadius: 4, fontWeight: 800, cursor: saving ? "not-allowed" : "pointer", fontSize: "0.72rem", opacity: saving ? 0.65 : 1, display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <i className="fa-solid fa-floppy-disk" style={{ fontSize: "0.65rem" }} /> {saving ? "KAYDEDİLİYOR..." : "KAYDET"}
              </button>
            </div>
          </div>

          {/* Print document */}
          <div className="print-doc" style={{ ...card, padding: "2.5rem", borderTop: "3px solid #1D6EF7" }}>
            {/* Doc header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "1.25rem", marginBottom: "2rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <img src="/logom.png" alt="LACPD" style={{ width: 52 }} />
                <div>
                  <div style={{ fontSize: "1.1rem", fontWeight: 900, color: "#ededed", letterSpacing: "0.04em" }}>LOS ANGELES POLICE DEPARTMENT</div>
                  <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#888", marginTop: "0.1rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>{template.name}</div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.65rem", color: "#444" }}>LAC-{template.code}</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", color: "#1D6EF7", fontSize: "0.78rem", marginTop: "0.25rem", background: "#161616", padding: "0.2rem 0.5rem", borderRadius: 4, border: "1px solid rgba(255,255,255,0.08)", display: "inline-block" }}>#{reportCode}</div>
              </div>
            </div>

            {/* Sections */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              {template.sections.map((sec: any, si: number) => {
                const hasFullWidth = sec.fields.some((f: any) => f.width === "12" || !f.width);
                return (
                  <div key={si} style={{ gridColumn: hasFullWidth ? "1 / -1" : "auto", border: "1px solid rgba(255,255,255,0.07)", borderLeft: "2px solid #1D6EF7", borderRadius: 6, overflow: "hidden" }}>
                    <div style={{ padding: "0.6rem 1rem", background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.58rem", fontWeight: 800, color: "#1D6EF7" }}>{String(si + 1).padStart(2, "0")}</span>
                      <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "#ededed", letterSpacing: "0.1em", textTransform: "uppercase" }}>{sec.title}</span>
                    </div>
                    <div style={{ padding: "1rem", display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: "0.75rem" }}>
                      {sec.fields.map((f: any) => (
                        <div key={f.id} style={{ gridColumn: `span ${f.width || 12}` }}>
                          <label style={{ display: "block", fontSize: "0.56rem", fontWeight: 700, color: "#555", marginBottom: "0.3rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                            {f.label}
                          </label>
                          {f.type === "textarea" ? (
                            <textarea className="rp-inp" value={formData[f.id] || ""} onChange={e => setFormData({ ...formData, [f.id]: e.target.value })} placeholder={f.placeholder} rows={f.rows || 3} style={{ ...inputBase, resize: "vertical" }} />
                          ) : f.type === "select" ? (
                            <select className="rp-inp" value={formData[f.id] || ""} onChange={e => setFormData({ ...formData, [f.id]: e.target.value })} style={inputBase}>
                              <option value="">Seçiniz...</option>
                              {f.options?.map((opt: string, i: number) => <option key={i} value={opt}>{opt}</option>)}
                            </select>
                          ) : (
                            <input className="rp-inp" type={f.type} value={formData[f.id] || ""} onChange={e => setFormData({ ...formData, [f.id]: e.target.value })} placeholder={f.placeholder} style={inputBase} />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Evidence images */}
            <div style={{ marginTop: "1rem", border: "1px solid rgba(255,255,255,0.07)", borderLeft: "2px solid #1D6EF7", borderRadius: 6, overflow: "hidden" }}>
              <div style={{ padding: "0.6rem 1rem", background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <i className="fa-solid fa-camera" style={{ fontSize: "0.6rem", color: "#1D6EF7" }} />
                <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "#ededed", letterSpacing: "0.1em", textTransform: "uppercase" }}>Görsel Delil / Belge Eki</span>
                <span style={{ marginLeft: "auto", fontSize: "0.6rem", color: "#444" }}>{formData.evidenceUrl ? formData.evidenceUrl.split(",").filter(Boolean).length : 0}/5</span>
              </div>
              <div style={{ padding: "1rem" }}>
                <label className="no-print" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "#161616", border: "1px solid rgba(255,255,255,0.08)", color: "#888", padding: "0.5rem 1rem", borderRadius: 4, cursor: "pointer", fontSize: "0.72rem", fontWeight: 700 }}>
                  <i className={uploadingImg ? "fa-solid fa-spinner fa-spin" : "fa-solid fa-upload"} style={{ fontSize: "0.65rem" }} />
                  {uploadingImg ? "Yükleniyor..." : "Görsel Seç"}
                  <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} disabled={uploadingImg || (formData.evidenceUrl ? formData.evidenceUrl.split(",").filter(Boolean).length >= 5 : false)} />
                </label>
                {formData.evidenceUrl && (
                  <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginTop: "0.85rem" }}>
                    {formData.evidenceUrl.split(",").filter(Boolean).map((url: string, i: number) => (
                      <div key={i} style={{ width: 120, flexShrink: 0, background: "#161616", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, overflow: "hidden", position: "relative" }}>
                        <img src={url} alt={`Delil ${i + 1}`} style={{ width: "100%", display: "block", objectFit: "cover", aspectRatio: "4/3" }} />
                        <button type="button" onClick={() => {
                          const newUrls = formData.evidenceUrl.split(",").filter((_: any, idx: number) => idx !== i).join(",");
                          setFormData(prev => ({ ...prev, evidenceUrl: newUrls }));
                        }} className="no-print" style={{ position: "absolute", top: 4, right: 4, background: "rgba(0,0,0,0.8)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "50%", width: 20, height: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.55rem" }}>
                          <i className="fa-solid fa-xmark" />
                        </button>
                        <div style={{ padding: "0.3rem 0.4rem", fontSize: "0.5rem", color: "#444", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>GÖRSEL {i + 1}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Signature footer */}
            <div style={{ marginTop: "2rem", paddingTop: "1.25rem", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <div>
                <div style={{ fontSize: "0.55rem", fontWeight: 700, color: "#444", letterSpacing: "0.12em", textTransform: "uppercase" }}>HAZIRLAYAN MEMUR</div>
                <div style={{ fontSize: "0.9rem", fontWeight: 800, color: "#ededed", marginTop: "0.25rem" }}>
                  {user ? user.name : "—"} <span style={{ color: "#1D6EF7", fontFamily: "'JetBrains Mono', monospace" }}>#{user?.badge || "—"}</span>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "0.55rem", fontWeight: 700, color: "#444", letterSpacing: "0.12em", textTransform: "uppercase" }}>DİJİTAL İMZA</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", color: "#1D6EF7", fontWeight: 700, marginTop: "0.25rem", fontSize: "0.78rem", background: "#161616", padding: "0.15rem 0.5rem", borderRadius: 4, border: "1px solid rgba(255,255,255,0.08)", display: "inline-block" }}>
                  SIGNED · #{user?.badge || "SYS"}
                </div>
                <div style={{ fontSize: "0.65rem", color: "#555", marginTop: "0.25rem", fontFamily: "'JetBrains Mono', monospace" }}>{new Date().toLocaleString("tr-TR")}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
