"use client";

import { useState, useEffect, useRef } from "react";

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
  { id: "ALL",      label: "Tümü",      icon: "fa-border-all",        color: "#94a3b8", bg: "rgba(148,163,184,0.1)" },
  { id: "CRIME",    label: "Suç & Olay",icon: "fa-handcuffs",         color: "#f87171", bg: "rgba(248,113,113,0.1)" },
  { id: "TRAFFIC",  label: "Trafik",    icon: "fa-car-on",            color: "#fb923c", bg: "rgba(251,146,60,0.1)"  },
  { id: "DETECTIVE",label: "Dedektif",  icon: "fa-magnifying-glass",  color: "#a78bfa", bg: "rgba(167,139,250,0.1)" },
  { id: "WARRANT",  label: "Mahkeme",   icon: "fa-scale-balanced",    color: "#38bdf8", bg: "rgba(56,189,248,0.1)"  },
  { id: "FIELD",    label: "Saha",      icon: "fa-user-shield",       color: "#34d399", bg: "rgba(52,211,153,0.1)"  },
];

function fieldCount(tmpl: any) {
  return tmpl.sections.reduce((acc: number, s: any) => acc + s.fields.length, 0);
}

export default function RaporPortali() {
  const [view, setView] = useState<"home" | "editor" | "saved">("home");
  const [activeCat, setActiveCat] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [template, setTemplate] = useState<any>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [reportCode, setReportCode] = useState("");
  const [savedReports, setSavedReports] = useState<any[]>([]);
  const [archiveSearch, setArchiveSearch] = useState("");
  const [user, setUser] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [loadingReports, setLoadingReports] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<any>(null); // for preview modal

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => d.user && setUser(d.user)).catch(() => {});
    fetchSaved();
  }, []);

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
        body: JSON.stringify({ id: reportCode, formId: template.id, officerName: user ? `${user.name} (#${user.badge})` : "L. COOPER (#101)", data: formData, diagram: [] })
      });
      if (r.ok) { await fetchSaved(); setView("saved"); }
      else alert("Kaydetme hatası.");
    } catch { alert("Sunucu hatası."); }
    setSaving(false);
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

  const filtered = REPORT_TEMPLATES.filter(t => {
    const catOk = activeCat === "ALL" || t.category === activeCat;
    const searchOk = !searchTerm || t.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.description.toLowerCase().includes(searchTerm.toLowerCase());
    return catOk && searchOk;
  });

  const getCatInfo = (catId: string) => CATEGORIES.find(c => c.id === catId) || CATEGORIES[0];

  return (
    <div className="app-root" style={{ minHeight: '100vh', background: '#07090f', color: '#c8d3e0', fontFamily: "'Inter', system-ui, sans-serif", position: 'relative', overflowX: 'hidden' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        input:focus, textarea:focus { border-color: rgba(14,165,233,0.4) !important; box-shadow: 0 0 0 3px rgba(14,165,233,0.07) !important; outline: none; }
        select:focus { outline: none; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        .tmpl-card { transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important; }
        .tmpl-card:hover { border-color: rgba(255,255,255,0.18) !important; background: rgba(255,255,255,0.045) !important; transform: translateY(-3px) !important; box-shadow: 0 10px 30px rgba(0,0,0,0.5) !important; }
        .tmpl-card:active { transform: scale(0.97) translateY(0) !important; box-shadow: 0 5px 15px rgba(0,0,0,0.3) !important; }
        .cat-btn:hover { background: rgba(255,255,255,0.07) !important; }
        .action-btn:hover { opacity: 0.85 !important; }
        @media print {
          @page { size: portrait; margin: 15mm; }
          .no-print { display: none !important; }
          
          /* Restore normal flow, remove background */
          .app-root { background: #fff !important; min-height: auto !important; }
          .editor-wrapper { padding: 0 !important; margin: 0 !important; max-width: none !important; }
          
          .print-doc {
            background:#fff !important; color:#000 !important;
            padding: 0 !important; font-family: 'Times New Roman', Times, serif !important;
            border: none !important; box-shadow: none !important;
          }

          /* Force colors to black for stark contrast */
          .print-doc * { color: #000 !important; border-color: #000 !important; }

          /* Document Header Typography */
          .print-doc .doc-header-title { font-family: 'Arial', sans-serif !important; font-size: 16pt !important; font-weight: bold !important; letter-spacing: 1px !important; }
          .print-doc .doc-header-subtitle { font-family: 'Times New Roman', serif !important; font-size: 12pt !important; font-weight: normal !important; text-transform: uppercase !important; }
          .print-doc .doc-header-code { font-family: 'Courier New', monospace !important; font-size: 12pt !important; font-weight: bold !important; }

          /* Form Field Containers & Sections */
          .print-doc .section-box { border: 2px solid #000 !important; border-radius: 0 !important; margin: 0 0 15px 0 !important; break-inside: avoid; }
          .print-doc .section-title {
            background: #e2e2e2 !important; border-bottom: 2px solid #000 !important;
            color: #000 !important; font-family: 'Arial', sans-serif !important;
            font-size: 9pt !important; font-weight: bold !important;
            -webkit-print-color-adjust: exact; print-color-adjust: exact;
            padding: 4px 8px !important;
          }
          .print-doc .field-grid { gap: 0 !important; padding: 0 !important; }
          .print-doc .field-wrap { border: 1px solid #000 !important; border-top: none !important; border-left: none !important; padding: 4px 6px !important; margin: 0 !important; }
          /* Fix borders in grid so they don't double up */
          .print-doc .field-wrap:last-child { border-right: none !important; }
          .print-doc .field-wrap:nth-last-child(-n+12) { border-bottom: none !important; } /* Approximating bottom row */

          /* Labels */
          .print-doc label { font-family: 'Arial', sans-serif !important; font-size: 7pt !important; text-transform: uppercase !important; display: block !important; margin-bottom: 2px !important; }

          /* Inputs & Textareas */
          .print-doc input, .print-doc select {
            background: transparent !important;
            border: none !important; border-radius: 0 !important;
            padding: 0 !important;
            font-family: 'Times New Roman', serif !important; font-size: 10pt !important;
            color: #000 !important; box-shadow: none !important;
            -webkit-appearance: none;
            width: 100% !important; height: auto !important;
          }
          
          /* Handle Textareas specifically for auto-expand in print */
          .print-doc .no-print-textarea { display: none !important; }
          .print-doc .print-only-text {
            display: block !important;
            white-space: pre-wrap !important;
            word-break: break-word !important;
            font-family: 'Times New Roman', serif !important;
            font-size: 10pt !important;
            color: #000 !important;
            width: 100% !important;
          }

          /* Hide placeholders and icons */
          .print-doc ::-webkit-input-placeholder { color: transparent !important; }
          .print-doc :-moz-placeholder { color: transparent !important; }
          .print-doc ::-moz-placeholder { color: transparent !important; }
          .print-doc :-ms-input-placeholder { color: transparent !important; }
          .print-doc i { display: none !important; }
          .print-doc select { padding-right: 0 !important; background-image: none !important; }
          
          /* Footer */
          .print-doc .doc-footer { border-top: 2px solid #000 !important; margin: 20px 0 0 0 !important; padding: 10px 0 !important; }
          .print-doc .doc-footer * { font-family: 'Arial', sans-serif !important; }
        }
      `}} />

      {/* Subtle top glow */}
      <div className="no-print" style={{ position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)', width: '900px', height: '300px', background: 'radial-gradient(ellipse at top, rgba(14,80,180,0.12) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      {/* ── HEADER ── */}
      <header className="no-print" style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(7,9,15,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '0 2.5rem', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', cursor: 'pointer' }} onClick={() => setView("home")}>
          <img src="/tahsis-portali/lapd-badge-logo-pngseeklogo-214481.png" alt="LAPD" style={{ width: '28px', filter: 'drop-shadow(0 0 6px rgba(56,189,248,0.3))' }} />
          <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#e2e8f0', letterSpacing: '0.01em' }}>
            LAPD <span style={{ color: '#38bdf8' }}>L.A.R.S.</span>
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          {view !== "home" && (
            <button onClick={() => setView("home")} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: '#64748b', padding: '0.45rem 0.9rem', borderRadius: '8px', fontWeight: 500, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <i className="fa-solid fa-arrow-left" style={{ fontSize: '0.7rem' }} /> Şablonlar
            </button>
          )}
          <button onClick={() => setView("saved")} style={{ background: view === "saved" ? 'rgba(14,165,233,0.1)' : 'rgba(255,255,255,0.04)', border: view === "saved" ? '1px solid rgba(14,165,233,0.25)' : '1px solid rgba(255,255,255,0.07)', color: view === "saved" ? '#38bdf8' : '#64748b', padding: '0.45rem 0.9rem', borderRadius: '8px', fontWeight: 500, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <i className="fa-solid fa-folder" style={{ fontSize: '0.7rem' }} /> Arşiv {savedReports.length > 0 && `(${savedReports.length})`}
          </button>
        </div>
      </header>

      {/* ── HOME: TEMPLATE GALLERY ── */}
      {view === "home" && (
        <div style={{ position: 'relative', zIndex: 10, padding: '3rem 3rem 5rem' }}>

          {/* Hero */}
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.15)', borderRadius: '50px', padding: '0.3rem 1rem', marginBottom: '1.5rem', fontSize: '0.75rem', fontWeight: 600, color: '#38bdf8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              <i className="fa-solid fa-file-shield" style={{ fontSize: '0.7rem' }} />
              Los Angeles Police Department
            </div>
            <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 300, color: '#f1f5f9', letterSpacing: '-0.03em', margin: '0 0 0.75rem', lineHeight: 1.2 }}>
              Resmi Rapor Şablonları
            </h1>
            <p style={{ color: '#475569', fontSize: '0.95rem', fontWeight: 400, margin: 0 }}>
              Bir şablon seçin, formu doldurun ve PDF olarak indirin
            </p>
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap' }}>
            {/* Category tabs */}
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', flex: 1 }}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  className="cat-btn"
                  onClick={() => setActiveCat(cat.id)}
                  style={{
                    background: activeCat === cat.id ? cat.bg : 'transparent',
                    border: activeCat === cat.id ? `1px solid ${cat.color}33` : '1px solid transparent',
                    color: activeCat === cat.id ? cat.color : '#475569',
                    padding: '0.45rem 1rem',
                    borderRadius: '50px',
                    fontSize: '0.82rem',
                    fontWeight: activeCat === cat.id ? 600 : 500,
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                    transition: 'all 0.15s',
                  }}
                >
                  <i className={`fa-solid ${cat.icon}`} style={{ fontSize: '0.7rem' }} />
                  {cat.label}
                  <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>
                    ({cat.id === "ALL" ? REPORT_TEMPLATES.length : REPORT_TEMPLATES.filter(t => t.category === cat.id).length})
                  </span>
                </button>
              ))}
            </div>

            {/* Search */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#334155', fontSize: '0.75rem' }} />
              <input
                type="text"
                placeholder="Şablon ara..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '2.25rem', paddingRight: '0.9rem', paddingTop: '0.5rem', paddingBottom: '0.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '50px', color: '#e2e8f0', fontSize: '0.82rem', width: '200px', fontFamily: 'inherit' }}
              />
            </div>
          </div>

          {/* Template Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1px', background: 'rgba(255,255,255,0.04)', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
            {filtered.map((tmpl, idx) => {
              const cat = getCatInfo(tmpl.category);
              const fieldCnt = fieldCount(tmpl);
              return (
                  <div
                    key={tmpl.id}
                    className="tmpl-card"
                    onClick={() => openTemplate(tmpl)}
                    style={{
                      background: '#07090f',
                      padding: '1.75rem',
                      cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    position: 'relative',
                  }}
                >
                  {/* Card top row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: cat.bg, border: `1px solid ${cat.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cat.color, fontSize: '1.15rem' }}>
                      <i className={`fa-solid ${tmpl.icon}`} />
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'monospace', fontSize: '0.68rem', color: '#d4af37', background: 'rgba(212,175,55,0.07)', border: '1px solid rgba(212,175,55,0.15)', padding: '0.2rem 0.55rem', borderRadius: '4px', display: 'inline-block' }}>
                        LAPD {tmpl.code}
                      </div>
                    </div>
                  </div>

                  {/* Name + Description */}
                  <div>
                    <div style={{ fontSize: '1rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.35rem', lineHeight: 1.3 }}>{tmpl.name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.55 }}>{tmpl.description}</div>
                  </div>

                  {/* Meta row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: 'auto' }}>
                    <span style={{ fontSize: '0.72rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <i className="fa-solid fa-list-check" style={{ color: '#1e3a52' }} />
                      {fieldCnt} alan · {tmpl.sections.length} bölüm
                    </span>
                    <span style={{ fontSize: '0.72rem', color: cat.color, background: cat.bg, padding: '0.15rem 0.55rem', borderRadius: '50px', fontWeight: 600 }}>
                      {tmpl.categoryName}
                    </span>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      className="action-btn"
                      onClick={(e) => { e.stopPropagation(); setPreviewTemplate(tmpl); }}
                      style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#64748b', padding: '0.55rem', borderRadius: '9px', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', transition: 'opacity 0.15s' }}
                    >
                      <i className="fa-regular fa-eye" style={{ fontSize: '0.75rem' }} /> Önizle
                    </button>
                    <button
                      className="action-btn"
                      onClick={(e) => { e.stopPropagation(); openTemplate(tmpl); }}
                      style={{ flex: 2, background: `linear-gradient(135deg, ${cat.color}18, ${cat.color}10)`, border: `1px solid ${cat.color}25`, color: cat.color, padding: '0.55rem', borderRadius: '9px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', transition: 'opacity 0.15s' }}
                    >
                      <i className="fa-solid fa-pen-to-square" style={{ fontSize: '0.75rem' }} /> Formu Doldur
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '5rem', color: '#334155' }}>
              <i className="fa-solid fa-magnifying-glass" style={{ fontSize: '2rem', marginBottom: '1rem', display: 'block' }} />
              <div>"{searchTerm}" için sonuç bulunamadı.</div>
            </div>
          )}
        </div>
      )}

      {/* ── PREVIEW MODAL ── */}
      {previewTemplate && (
        <div
          onClick={() => setPreviewTemplate(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', backdropFilter: 'blur(4px)' }}
        >
          <div onClick={e => e.stopPropagation()} style={{ background: '#0d1320', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', width: '100%', maxWidth: '700px', maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {/* Modal Header */}
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.2rem' }}>Önizleme</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 600, color: '#e2e8f0' }}>{previewTemplate.name}</div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => { openTemplate(previewTemplate); setPreviewTemplate(null); }} style={{ background: 'rgba(14,165,233,0.15)', border: '1px solid rgba(14,165,233,0.3)', color: '#38bdf8', padding: '0.5rem 1.1rem', borderRadius: '8px', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <i className="fa-solid fa-pen-to-square" style={{ fontSize: '0.72rem' }} /> Formu Doldur
                </button>
                <button onClick={() => setPreviewTemplate(null)} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#475569', padding: '0.5rem 0.75rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                  <i className="fa-solid fa-xmark" />
                </button>
              </div>
            </div>

            {/* Modal Body — form preview */}
            <div style={{ overflowY: 'auto', padding: '1.5rem' }}>
              {/* Doc Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <img src="/tahsis-portali/lapd-badge-logo-pngseeklogo-214481.png" alt="LAPD" style={{ width: '36px', opacity: 0.8 }} />
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#cbd5e1', letterSpacing: '0.5px' }}>LOS ANGELES POLICE DEPARTMENT</div>
                    <div style={{ fontSize: '0.88rem', color: '#38bdf8', fontWeight: 500, marginTop: '0.1rem' }}>{previewTemplate.name}</div>
                  </div>
                </div>
                <div style={{ fontFamily: 'monospace', color: '#d4af37', fontSize: '0.88rem', fontWeight: 700 }}>LAPD {previewTemplate.code}</div>
              </div>

              {previewTemplate.sections.map((sec: any, si: number) => (
                <div key={si} style={{ marginBottom: '1.25rem', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                  <div style={{ padding: '0.65rem 1rem', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.7rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.09em' }}>
                    {sec.title}
                  </div>
                  <div style={{ padding: '1rem', display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '0.75rem' }}>
                    {sec.fields.map((f: any) => (
                      <div key={f.id} style={{ gridColumn: `span ${f.width || 12}` }}>
                        <div style={{ fontSize: '0.68rem', fontWeight: 600, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.3rem' }}>{f.label}</div>
                        <div style={{ height: f.type === 'textarea' ? `${(f.rows || 3) * 20}px` : '32px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', display: 'flex', alignItems: 'center', padding: '0 0.65rem' }}>
                          <span style={{ fontSize: '0.72rem', color: '#1e293b', fontStyle: 'italic' }}>{f.placeholder || '—'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── EDITOR VIEW ── */}
      {view === "editor" && template && (
        <div className="editor-wrapper" style={{ position: 'relative', zIndex: 10, padding: '2rem 3rem 5rem', maxWidth: '1100px', margin: '0 auto' }}>
          {/* Action bar */}
          <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', padding: '1rem 1.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', marginBottom: '2rem' }}>
            <div>
              <div style={{ fontSize: '0.68rem', color: '#334155', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.2rem' }}>Düzenleniyor</div>
              <div style={{ fontSize: '1rem', fontWeight: 600, color: '#e2e8f0' }}>
                {template.name}
                <span style={{ color: '#334155', fontWeight: 400, marginLeft: '0.5rem', fontSize: '0.82rem', fontFamily: 'monospace' }}>#{reportCode}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <button onClick={() => window.print()} style={{ background: 'linear-gradient(135deg, #0284c7, #1d4ed8)', border: 'none', color: '#fff', padding: '0.6rem 1.25rem', borderRadius: '9px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 4px 15px rgba(2,132,199,0.3)' }}>
                <i className="fa-solid fa-file-pdf" style={{ fontSize: '0.8rem' }} /> PDF İndir
              </button>
              <button onClick={handleSave} disabled={saving} style={{ background: 'linear-gradient(135deg, #059669, #047857)', border: 'none', color: '#fff', padding: '0.6rem 1.25rem', borderRadius: '9px', fontWeight: 600, fontSize: '0.85rem', cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 4px 15px rgba(5,150,105,0.25)', opacity: saving ? 0.6 : 1 }}>
                <i className="fa-solid fa-floppy-disk" style={{ fontSize: '0.8rem' }} /> {saving ? "Kaydediliyor..." : "Kaydet"}
              </button>
            </div>
          </div>

          {/* Document */}
          <div className="print-doc" style={{ background: 'rgba(10,14,22,0.9)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', overflow: 'hidden' }}>
            {/* Doc Header */}
            <div style={{ padding: '2rem 2.5rem', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <img src="/tahsis-portali/lapd-badge-logo-pngseeklogo-214481.png" alt="LAPD" style={{ width: '52px', filter: 'drop-shadow(0 0 5px rgba(56,189,248,0.2))' }} />
                <div>
                  <div className="doc-header-title" style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f1f5f9', letterSpacing: '0.5px' }}>LOS ANGELES POLICE DEPARTMENT</div>
                  <div className="doc-header-subtitle" style={{ fontSize: '0.9rem', color: '#38bdf8', fontWeight: 500, marginTop: '0.15rem' }}>{template.name}</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="doc-header-code" style={{ fontFamily: 'monospace', color: '#d4af37', fontWeight: 700, fontSize: '1rem' }}>LAPD {template.code}</div>
                <div className="doc-header-code" style={{ fontSize: '0.75rem', color: '#334155', marginTop: '0.25rem', fontFamily: 'monospace' }}>{reportCode}</div>
              </div>
            </div>

            {/* Sections */}
            <div style={{ padding: '2rem 0' }}>
              {template.sections.map((sec: any, si: number) => (
                <div key={si} className="section-box" style={{ margin: '0 2.5rem 2rem', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', overflow: 'hidden' }}>
                  <div className="section-title" style={{ padding: '0.75rem 1.25rem', background: 'rgba(255,255,255,0.025)', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: '0.72rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    {sec.title}
                  </div>
                  <div className="field-grid" style={{ padding: '1.25rem', display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1rem' }}>
                    {sec.fields.map((f: any) => (
                      <div key={f.id} className="field-wrap" style={{ gridColumn: `span ${f.width || 12}` }}>
                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>{f.label}</label>
                        {f.type === "textarea" ? (
                          <>
                            <div className="print-only-text" style={{ display: 'none' }}>
                              {formData[f.id] || ""}
                            </div>
                            <textarea className="no-print-textarea" rows={f.rows || 4} style={{ width: '100%', padding: '0.7rem 0.9rem', background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#e2e8f0', fontSize: '0.88rem', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }} placeholder={f.placeholder || ""} value={formData[f.id] || ""} onChange={e => setFormData(p => ({ ...p, [f.id]: e.target.value }))} />
                          </>
                        ) : f.type === "select" ? (
                          <select style={{ width: '100%', padding: '0.7rem 0.9rem', background: 'rgba(5,10,18,0.95)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#e2e8f0', fontSize: '0.88rem', cursor: 'pointer' }} value={formData[f.id] || ""} onChange={e => setFormData(p => ({ ...p, [f.id]: e.target.value }))}>
                            <option value="">— Seçiniz —</option>
                            {f.options?.map((o: string, i: number) => <option key={i} value={o}>{o}</option>)}
                          </select>
                        ) : (
                          <input type={f.type || "text"} style={{ width: '100%', padding: '0.7rem 0.9rem', background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#e2e8f0', fontSize: '0.88rem', fontFamily: 'inherit' }} placeholder={f.placeholder || ""} value={formData[f.id] || ""} onChange={e => setFormData(p => ({ ...p, [f.id]: e.target.value }))} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="doc-footer" style={{ margin: '0 2.5rem', padding: '1.5rem 0', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>

              <div>
                <div style={{ fontSize: '0.68rem', color: '#334155', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.25rem' }}>Hazırlayan Memur</div>
                <div style={{ fontSize: '1rem', color: '#e2e8f0', fontWeight: 600 }}>{user ? user.name : "L. COOPER"} <span style={{ color: '#38bdf8' }}>#{user?.badge || "101"}</span></div>
                <div style={{ fontSize: '0.78rem', color: '#d4af37', marginTop: '0.1rem' }}>{user?.rank || "Officer II"} — {user?.department || "Patrol Division"}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.68rem', color: '#334155', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.25rem' }}>Dijital İmza</div>
                <div style={{ fontFamily: 'monospace', color: '#38bdf8', fontStyle: 'italic' }}>Signed · #{user?.badge || "101"}</div>
                <div style={{ fontSize: '0.72rem', color: '#334155', marginTop: '0.15rem' }}>{new Date().toLocaleString('tr-TR')}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SAVED REPORTS (ARCHIVE) ── */}
      {view === "saved" && (
        <div style={{ position: 'relative', zIndex: 10, padding: '2.5rem 3rem 5rem', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f1f5f9', margin: 0, letterSpacing: '-0.02em' }}>Arşiv Raporları</h2>
              <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0.35rem 0 0' }}>{savedReports.length} kayıtlı rapor</p>
            </div>
            
            <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#475569', fontSize: '0.75rem' }} />
                <input
                  type="text"
                  placeholder="Rapor kodu, isim veya tarih ara..."
                  value={archiveSearch}
                  onChange={e => setArchiveSearch(e.target.value)}
                  style={{ paddingLeft: '2.25rem', paddingRight: '0.9rem', paddingTop: '0.55rem', paddingBottom: '0.55rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', color: '#e2e8f0', fontSize: '0.82rem', width: '280px', fontFamily: 'inherit', transition: 'border-color 0.2s' }}
                />
              </div>
              <button onClick={fetchSaved} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: '#94a3b8', padding: '0.55rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.4rem', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'} onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}>
                <i className="fa-solid fa-rotate" style={{ fontSize: '0.75rem' }} /> Yenile
              </button>
            </div>
          </div>

          {loadingReports ? (
            <div style={{ textAlign: 'center', padding: '6rem', color: '#475569' }}>
              <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: '2rem' }} />
              <div style={{ marginTop: '1rem', fontSize: '0.85rem' }}>Raporlar yükleniyor...</div>
            </div>
          ) : savedReports.length === 0 ? (
            <div style={{ background: 'rgba(255,255,255,0.015)', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: '16px', padding: '6rem', textAlign: 'center' }}>
              <i className="fa-regular fa-folder-open" style={{ fontSize: '3rem', color: '#334155', marginBottom: '1.25rem', display: 'block' }} />
              <div style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '2rem' }}>Henüz kayıtlı rapor bulunmuyor.</div>
              <button onClick={() => setView("home")} style={{ background: 'linear-gradient(135deg, #0284c7, #1d4ed8)', border: 'none', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '9px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', boxShadow: '0 4px 15px rgba(2,132,199,0.25)' }}>
                İlk Raporu Oluştur
              </button>
            </div>
          ) : (
            <div style={{ background: 'rgba(10,14,22,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    {["Rapor Kodu", "Şablon", "Memur", "Tarih", ""].map((h, i) => (
                      <th key={i} style={{ padding: '1rem 1.5rem', textAlign: i === 4 ? 'right' : 'left', fontSize: '0.7rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {savedReports.map((r, i) => {
                    const tmpl = REPORT_TEMPLATES.find(t => t.id === r.formId);
                    const cat = getCatInfo(tmpl?.category || "ALL");
                    return (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        <td style={{ padding: '1rem 1.25rem', fontFamily: 'monospace', color: '#38bdf8', fontSize: '0.82rem' }}>#{r.id}</td>
                        <td style={{ padding: '1rem 1.25rem', color: '#cbd5e1', fontSize: '0.85rem' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <i className={`fa-solid ${tmpl?.icon || 'fa-file'}`} style={{ color: cat.color, fontSize: '0.75rem' }} />
                            {tmpl?.name || r.formId}
                          </span>
                        </td>
                        <td style={{ padding: '1rem 1.25rem', color: '#475569', fontSize: '0.82rem' }}>{r.officerName || "—"}</td>
                        <td style={{ padding: '1rem 1.25rem', color: '#334155', fontSize: '0.78rem' }}>{r.timestamp ? new Date(r.timestamp).toLocaleString('tr-TR') : '—'}</td>
                        <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                            <button onClick={() => openSaved(r)} style={{ background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.15)', color: '#38bdf8', padding: '0.4rem 0.85rem', borderRadius: '7px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}>
                              <i className="fa-solid fa-folder-open" /> Aç
                            </button>
                            <button onClick={() => handleDelete(r.id)} style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', color: '#f87171', padding: '0.4rem 0.65rem', borderRadius: '7px', cursor: 'pointer', fontSize: '0.75rem' }}>
                              <i className="fa-solid fa-trash" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
