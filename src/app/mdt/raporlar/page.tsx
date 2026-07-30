"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

const REPORT_TEMPLATES = [
  {
    id: "incident", category: "CRIME", categoryName: "Suç & Olay",
    name: "Olay Yeri Raporu", code: "3.14", icon: "fa-shield-halved",
    description: "Devriye sırasında genel suçlar ve olay yeri ön soruşturması için temel rapor.",
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
        { id: "charges_list", label: "Suçlamalar", type: "textarea", placeholder: "1. PC 245(a)(1) - Assault with Deadly Weapon\n2. PC 148(a)(1) - Resisting Arrest", width: "12", rows: 3 },
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
        { id: "case_summary", label: "Dava Özeti", type: "textarea", placeholder: "Soruşturmanın başlangıç noktası, şüphelilerin bağlantıları...", width: "12", rows: 5 },
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
        { id: "items_to_seize", label: "Aranacak Nesneler", type: "textarea", placeholder: "1. Yasadışı silahlar\n2. Uyuşturucu madde\n3. Suç geliri nakit", width: "12", rows: 4 },
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
  { id: "ALL",      label: "Tümü",      icon: "fa-border-all",       color: "rgba(200,208,230,0.5)" },
  { id: "CRIME",    label: "Suç & Olay",icon: "fa-handcuffs",        color: "#E84F2A" },
  { id: "TRAFFIC",  label: "Trafik",    icon: "fa-car-on",           color: "#f59e0b" },
  { id: "DETECTIVE",label: "Dedektif",  icon: "fa-magnifying-glass", color: "#8b5cf6" },
  { id: "WARRANT",  label: "Mahkeme",   icon: "fa-scale-balanced",   color: "#1D6EF7" },
  { id: "FIELD",    label: "Saha",      icon: "fa-user-shield",      color: "#22c55e" },
];

/* ─── Premium Glass UI ─── */
const glassCard: React.CSSProperties = {
  background: "linear-gradient(145deg, rgba(16,22,36,0.9) 0%, rgba(10,14,26,0.85) 100%)",
  backdropFilter: "blur(24px)",
  border: "1px solid rgba(29,110,247,0.25)",
  borderRadius: 14,
  overflow: "hidden",
  boxShadow: "0 12px 40px -10px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.05)",
};

const inputBase: React.CSSProperties = {
  width: "100%", background: "rgba(6,10,18,0.7)",
  border: "1px solid rgba(29,110,247,0.15)",
  borderBottom: "2px solid rgba(29,110,247,0.4)",
  borderRadius: 4,
  padding: "0.6rem 0.85rem", color: "#e8ecf5",
  fontSize: "0.83rem", outline: "none", fontFamily: "'JetBrains Mono', monospace",
  transition: "all 0.2s ease", boxSizing: "border-box",
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
      if (r.ok) { await fetchSaved(); setView("saved"); }
      else alert("Kaydetme hatası.");
    } catch { alert("Sunucu hatası."); }
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

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&display=swap');
        .mdt-inp:focus { border-color: rgba(29,110,247,0.5) !important; box-shadow: 0 0 0 3px rgba(29,110,247,0.1) !important; }
        .rep-card { transition: all 0.2s ease; cursor: pointer; }
        .rep-card:hover { transform: translateY(-3px); box-shadow: 0 12px 24px rgba(29,110,247,0.15) !important; border-color: rgba(29,110,247,0.4) !important; }
        .archive-row { transition: background 0.15s; }
        .archive-row:hover { background: rgba(29,110,247,0.05) !important; }

        /* Print styles to hide sidebar and layout */
        @media print {
          @page { size: portrait; margin: 15mm; }
          body * { visibility: hidden; }
          aside, header, .no-print, .mdt-sidebar { display: none !important; }
          .mdt-main { background: white !important; padding: 0 !important; }
          .print-doc, .print-doc * { visibility: visible; }
          .print-doc {
            position: absolute; left: 0; top: 0; width: 100%;
            background: white !important; color: black !important;
            border: none !important; box-shadow: none !important; padding: 0 !important;
          }
          .print-doc * { color: black !important; background: transparent !important; }
          .print-doc img { filter: none !important; }
        }
      `}</style>

      <div className="no-print" style={{ display: "flex", flexDirection: "column", gap: "1.75rem", maxWidth: 1200, margin: "0 auto", paddingBottom: "2rem" }}>

        {/* ─── Header & Tabs ─── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ fontSize: "0.6rem", fontWeight: 800, color: "rgba(29,110,247,0.4)", letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: "0.45rem" }}>
              L.A.C.P.D. · ARŞİV
            </div>
            <h1 style={{ fontSize: "1.9rem", fontWeight: 900, color: "#e8ecf5", margin: 0, letterSpacing: "-0.02em" }}>
              Rapor ve Belge Portalı
            </h1>
          </div>
          <div style={{ display: "flex", gap: "0.5rem", background: "rgba(13,18,32,0.8)", border: "1px solid rgba(29,110,247,0.15)", borderRadius: 10, padding: "0.4rem" }}>
            <button onClick={() => setView("home")} style={{
              background: view === "home" || view === "editor" ? "rgba(29,110,247,0.15)" : "transparent",
              color: view === "home" || view === "editor" ? "#1D6EF7" : "rgba(200,208,230,0.4)",
              border: "none", padding: "0.5rem 1.25rem", borderRadius: 8, fontWeight: 700, fontSize: "0.8rem", cursor: "pointer", transition: "all 0.15s"
            }}>Şablonlar</button>
            <button onClick={() => setView("saved")} style={{
              background: view === "saved" ? "rgba(29,110,247,0.15)" : "transparent",
              color: view === "saved" ? "#1D6EF7" : "rgba(200,208,230,0.4)",
              border: "none", padding: "0.5rem 1.25rem", borderRadius: 8, fontWeight: 700, fontSize: "0.8rem", cursor: "pointer", transition: "all 0.15s"
            }}>Arşiv ({savedReports.length})</button>
          </div>
        </div>

        {/* ─── HOME: TEMPLATE GALLERY ─── */}
        {view === "home" && (
          <div>
            {/* Filters */}
            <div style={{ display: "flex", gap: "1.5rem", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", justifyContent: "space-between" }}>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {CATEGORIES.map(cat => (
                  <button key={cat.id} onClick={() => setActiveCat(cat.id)} style={{
                    background: activeCat === cat.id ? `${cat.color}20` : "rgba(13,18,32,0.6)",
                    border: `1px solid ${activeCat === cat.id ? cat.color : "rgba(29,110,247,0.1)"}`,
                    color: activeCat === cat.id ? cat.color : "rgba(200,208,230,0.4)",
                    padding: "0.5rem 1rem", borderRadius: 8, fontSize: "0.75rem", fontWeight: 700, cursor: "pointer",
                    display: "flex", alignItems: "center", gap: "0.5rem", transition: "all 0.15s"
                  }}>
                    <i className={`fa-solid ${cat.icon}`} /> {cat.label}
                  </button>
                ))}
              </div>
              <input className="mdt-inp" type="text" placeholder="Şablon ara..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ ...inputBase, width: 250 }} />
            </div>

            {/* Template Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.25rem" }}>
              {filtered.map(tmpl => {
                const catInfo = CATEGORIES.find(c => c.id === tmpl.category) || CATEGORIES[0];
                return (
                  <div key={tmpl.id} className="rep-card" onClick={() => openTemplate(tmpl)} style={{ ...glassCard, padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ width: 42, height: 42, borderRadius: 10, background: `${catInfo.color}15`, border: `1px solid ${catInfo.color}30`, display: "flex", alignItems: "center", justifyContent: "center", color: catInfo.color, fontSize: "1.2rem" }}>
                        <i className={`fa-solid ${tmpl.icon}`} />
                      </div>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", fontWeight: 800, color: "rgba(29,110,247,0.6)", background: "rgba(29,110,247,0.06)", padding: "0.25rem 0.6rem", borderRadius: 6, border: "1px solid rgba(29,110,247,0.15)" }}>
                        LAC {tmpl.code}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "#e8ecf5", marginBottom: "0.35rem" }}>{tmpl.name}</div>
                      <div style={{ fontSize: "0.8rem", color: "rgba(200,208,230,0.4)", lineHeight: 1.5 }}>{tmpl.description}</div>
                    </div>
                    <div style={{ marginTop: "auto", paddingTop: "1rem" }}>
                      <button style={{ width: "100%", background: "linear-gradient(135deg, #1D6EF7 0%, #1558d6 100%)", border: "1px solid rgba(29,110,247,0.4)", color: "#fff", padding: "0.65rem", borderRadius: 8, fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 16px rgba(29,110,247,0.25)" }}>
                        DOLDUR
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── SAVED REPORTS (ARCHIVE) ─── */}
        {view === "saved" && (
          <div style={glassCard}>
            <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid rgba(29,110,247,0.08)", background: "rgba(29,110,247,0.02)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ margin: 0, fontWeight: 800, fontSize: "1.05rem", color: "#e8ecf5" }}>Arşivlenmiş Raporlar</h3>
                <p style={{ margin: "0.2rem 0 0", fontSize: "0.75rem", color: "rgba(200,208,230,0.4)" }}>Önceki rapor kayıtlarını görüntüleyin veya düzenleyin.</p>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input className="mdt-inp" type="text" placeholder="Arşivde ara..." value={archiveSearch} onChange={e => setArchiveSearch(e.target.value)} style={{ ...inputBase, width: 250 }} />
                <button onClick={fetchSaved} style={{ background: "rgba(29,110,247,0.08)", border: "1px solid rgba(29,110,247,0.2)", color: "#1D6EF7", padding: "0.5rem 1rem", borderRadius: 8, cursor: "pointer" }}><i className="fa-solid fa-rotate" /></button>
              </div>
            </div>
            <div>
              {loadingReports ? (
                <div style={{ padding: "4rem", textAlign: "center", color: "rgba(200,208,230,0.3)", fontSize: "0.85rem" }}><i className="fa-solid fa-circle-notch fa-spin" style={{ marginRight: "0.5rem" }} />Yükleniyor...</div>
              ) : savedReports.length === 0 ? (
                <div style={{ padding: "4rem", textAlign: "center", color: "rgba(200,208,230,0.3)", fontSize: "0.85rem" }}>Arşivde kayıt bulunamadı.</div>
              ) : (
                savedReports.filter(r => r.id.includes(archiveSearch) || (r.officerName && r.officerName.includes(archiveSearch))).map(r => {
                  const tmpl = REPORT_TEMPLATES.find(t => t.id === r.formId) || REPORT_TEMPLATES[0];
                  return (
                    <div key={r.id} className="archive-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 1.5rem", borderBottom: "1px solid rgba(29,110,247,0.05)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.75rem", fontWeight: 700, color: "rgba(29,110,247,0.6)", background: "rgba(29,110,247,0.08)", padding: "0.3rem 0.6rem", borderRadius: 6 }}>
                          #{r.id}
                        </div>
                        <div>
                          <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#e8ecf5" }}>{tmpl.name}</div>
                          <div style={{ fontSize: "0.7rem", color: "rgba(200,208,230,0.4)", marginTop: "0.2rem" }}>{r.officerName || "—"} · {r.timestamp ? new Date(r.timestamp).toLocaleString("tr-TR") : "—"}</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button onClick={() => openSaved(r)} style={{ background: "rgba(29,110,247,0.08)", color: "#1D6EF7", border: "1px solid rgba(29,110,247,0.2)", padding: "0.4rem 0.8rem", borderRadius: 6, fontSize: "0.7rem", fontWeight: 700, cursor: "pointer" }}>GÖRÜNTÜLE</button>
                        <button onClick={() => handleDelete(r.id)} style={{ background: "rgba(239,68,68,0.08)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)", padding: "0.4rem 0.8rem", borderRadius: 6, fontSize: "0.7rem", fontWeight: 700, cursor: "pointer" }}>SİL</button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* ─── EDITOR VIEW (Printable Area inside here) ─── */}
      {view === "editor" && template && (
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          
          <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 1.5rem", ...glassCard, marginBottom: "1.5rem" }}>
            <div>
              <div style={{ fontSize: "0.6rem", fontWeight: 800, color: "rgba(29,110,247,0.5)", letterSpacing: "0.15em", textTransform: "uppercase" }}>DÜZENLENİYOR</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#e8ecf5", display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.2rem" }}>
                {template.name}
                <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(29,110,247,0.6)", fontSize: "0.8rem", background: "rgba(29,110,247,0.08)", padding: "0.2rem 0.6rem", borderRadius: 4 }}>#{reportCode}</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button onClick={() => setView("home")} style={{ background: "transparent", border: "1px solid rgba(29,110,247,0.2)", color: "rgba(200,208,230,0.5)", padding: "0.6rem 1rem", borderRadius: 6, fontWeight: 700, fontSize: "0.75rem", cursor: "pointer" }}>İPTAL</button>
              <button onClick={() => window.print()} style={{ background: "rgba(29,110,247,0.08)", border: "1px solid rgba(29,110,247,0.2)", color: "#1D6EF7", padding: "0.6rem 1.25rem", borderRadius: 6, fontWeight: 700, cursor: "pointer", fontSize: "0.75rem" }}>
                <i className="fa-solid fa-print" style={{ marginRight: "0.4rem" }} /> YAZDIR (PDF)
              </button>
              <button onClick={handleSave} disabled={saving} style={{ background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)", border: "1px solid rgba(34,197,94,0.4)", color: "#fff", padding: "0.6rem 1.25rem", borderRadius: 6, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", fontSize: "0.75rem", boxShadow: "0 4px 16px rgba(34,197,94,0.25)", opacity: saving ? 0.7 : 1 }}>
                <i className="fa-solid fa-floppy-disk" style={{ marginRight: "0.4rem" }} /> {saving ? "KAYDEDİLİYOR..." : "KAYDET"}
              </button>
            </div>
          </div>

          <div className="print-doc" style={{ ...glassCard, padding: "3rem", borderRadius: 8, borderTop: "4px solid #1D6EF7" }}>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(29,110,247,0.2)", paddingBottom: "1.5rem", marginBottom: "2.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                <img src="/logom.png" alt="LACPD" style={{ width: 68 }} />
                <div>
                  <div style={{ fontSize: "1.35rem", fontWeight: 900, color: "#e8ecf5", letterSpacing: "0.03em", fontFamily: "'Oswald', sans-serif" }}>LOS ANGELES POLICE DEPARTMENT</div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "rgba(200,208,230,0.6)", marginTop: "0.15rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>{template.name}</div>
                </div>
              </div>
              <div style={{ textAlign: "right", fontFamily: "'JetBrains Mono', monospace", fontWeight: 800 }}>
                <div style={{ fontSize: "0.95rem", color: "rgba(200,208,230,0.4)" }}>LAC-{template.code}</div>
                <div style={{ color: "#1D6EF7", fontSize: "0.85rem", marginTop: "0.3rem", background: "rgba(29,110,247,0.08)", padding: "0.2rem 0.5rem", borderRadius: 4 }}>#{reportCode}</div>
              </div>
            </div>

            {/* Tactical 2-Column Grid for Sections */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
              {template.sections.map((sec: any, si: number) => {
                // If a section has a large textarea (width 12), make the whole section span both columns
                const hasFullWidthField = sec.fields.some((f: any) => f.width === "12" || !f.width);
                const colSpan = hasFullWidthField ? "1 / -1" : "auto";
                
                return (
                  <div key={si} style={{ gridColumn: colSpan, marginBottom: "0.5rem", background: "rgba(8,12,20,0.6)", border: "1px solid rgba(29,110,247,0.15)", borderLeft: "3px solid #1D6EF7", borderRadius: 6, overflow: "hidden" }}>
                    <div style={{ padding: "0.75rem 1.25rem", background: "linear-gradient(90deg, rgba(29,110,247,0.1) 0%, transparent 100%)", borderBottom: "1px solid rgba(29,110,247,0.1)", fontSize: "0.75rem", fontWeight: 800, color: "#e8ecf5", letterSpacing: "0.08em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ color: "#1D6EF7" }}>{String(si + 1).padStart(2, "0")}</span> {sec.title}
                    </div>
                    <div style={{ padding: "1.25rem", display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: "1rem" }}>
                      {sec.fields.map((f: any) => (
                        <div key={f.id} style={{ gridColumn: `span ${f.width || 12}` }}>
                          <label style={{ display: "flex", justifyContent: "space-between", fontSize: "0.58rem", fontWeight: 800, color: "rgba(200,208,230,0.5)", marginBottom: "0.35rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                            <span>{f.label}</span>
                            {f.type === "textarea" && <i className="fa-solid fa-pen-clip" style={{ color: "rgba(29,110,247,0.3)" }} />}
                          </label>
                          {f.type === "textarea" ? (
                            <textarea className="mdt-inp" value={formData[f.id] || ""} onChange={e => setFormData({ ...formData, [f.id]: e.target.value })} placeholder={f.placeholder} rows={f.rows || 3} style={{ ...inputBase, resize: "vertical" }} />
                          ) : f.type === "select" ? (
                            <select className="mdt-inp" value={formData[f.id] || ""} onChange={e => setFormData({ ...formData, [f.id]: e.target.value })} style={inputBase}>
                              <option value="">Seçiniz...</option>
                              {f.options?.map((opt: string, i: number) => <option key={i} value={opt}>{opt}</option>)}
                            </select>
                          ) : (
                            <input className="mdt-inp" type={f.type} value={formData[f.id] || ""} onChange={e => setFormData({ ...formData, [f.id]: e.target.value })} placeholder={f.placeholder} style={inputBase} />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: "3rem", paddingTop: "1.5rem", borderTop: "2px solid rgba(29,110,247,0.2)", display: "flex", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: "0.6rem", fontWeight: 800, color: "rgba(200,208,230,0.4)", letterSpacing: "0.1em" }}>HAZIRLAYAN MEMUR</div>
                <div style={{ fontSize: "1rem", fontWeight: 800, color: "#e8ecf5", marginTop: "0.3rem" }}>{user ? user.name : "—"} <span style={{ color: "#1D6EF7" }}>#{user?.badge || "—"}</span></div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "0.6rem", fontWeight: 800, color: "rgba(200,208,230,0.4)", letterSpacing: "0.1em" }}>DİJİTAL İMZA & ZAMAN DAMGASI</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", color: "#1D6EF7", fontWeight: 800, marginTop: "0.3rem", fontSize: "0.9rem", background: "rgba(29,110,247,0.06)", padding: "0.2rem 0.5rem", borderRadius: 4, display: "inline-block" }}>SIGNED · #{user?.badge || "SYS"}</div>
                <div style={{ fontSize: "0.7rem", color: "rgba(200,208,230,0.5)", marginTop: "0.35rem", fontFamily: "'JetBrains Mono', monospace" }}>{new Date().toLocaleString("tr-TR")}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
