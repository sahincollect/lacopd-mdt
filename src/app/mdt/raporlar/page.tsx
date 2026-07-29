"use client";

import { useState, useEffect } from "react";

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
  { id: "ALL",      label: "Tümü",      icon: "fa-border-all" },
  { id: "CRIME",    label: "Suç & Olay",icon: "fa-handcuffs" },
  { id: "TRAFFIC",  label: "Trafik",    icon: "fa-car-on" },
  { id: "DETECTIVE",label: "Dedektif",  icon: "fa-magnifying-glass" },
  { id: "WARRANT",  label: "Mahkeme",   icon: "fa-scale-balanced" },
  { id: "FIELD",    label: "Saha",      icon: "fa-user-shield" },
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
  const [previewTemplate, setPreviewTemplate] = useState<any>(null);

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

  return (
    <div className="app-root" style={{ width: '100%', fontFamily: "var(--font-inter)" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { size: portrait; margin: 15mm; }
          .no-print { display: none !important; }
          .app-root { background: #fff !important; min-height: auto !important; }
          .editor-wrapper { padding: 0 !important; margin: 0 !important; max-width: none !important; }
          
          .print-doc {
            background:#fff !important; color:#000 !important;
            padding: 0 !important; font-family: 'Times New Roman', Times, serif !important;
            border: none !important; box-shadow: none !important;
          }

          .print-doc * { color: #000 !important; border-color: #000 !important; }
          .print-doc .doc-header-title { font-family: 'Arial', sans-serif !important; font-size: 16pt !important; font-weight: bold !important; letter-spacing: 1px !important; }
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
          .print-doc .field-wrap:last-child { border-right: none !important; }
          .print-doc label { font-family: 'Arial', sans-serif !important; font-size: 7pt !important; text-transform: uppercase !important; display: block !important; margin-bottom: 2px !important; }

          .print-doc input, .print-doc select {
            background: transparent !important;
            border: none !important; border-radius: 0 !important;
            padding: 0 !important;
            font-family: 'Times New Roman', serif !important; font-size: 10pt !important;
            color: #000 !important; box-shadow: none !important;
            -webkit-appearance: none; width: 100% !important; height: auto !important;
          }
          
          .print-doc .no-print-textarea { display: none !important; }
          .print-doc .print-only-text {
            display: block !important; white-space: pre-wrap !important; word-break: break-word !important;
            font-family: 'Times New Roman', serif !important; font-size: 10pt !important; color: #000 !important; width: 100% !important;
          }

          .print-doc ::-webkit-input-placeholder { color: transparent !important; }
          .print-doc i { display: none !important; }
          .print-doc select { padding-right: 0 !important; background-image: none !important; }
          
          .print-doc .doc-footer { border-top: 2px solid #000 !important; margin: 20px 0 0 0 !important; padding: 10px 0 !important; }
          .print-doc .doc-footer * { font-family: 'Arial', sans-serif !important; }
        }
      `}} />

      {/* ── HEADER TABS (Replaces sticky navbar) ── */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '2px solid var(--border-light)', paddingBottom: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--lapd-blue-dark)', margin: 0, textTransform: 'uppercase' }}>RAPOR SİSTEMİ</h1>
          <p style={{ margin: '0.2rem 0 0', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500 }}>Sistem üzerinde resmi belgeler oluşturun ve arşivleyin.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-secondary)', padding: '0.3rem', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
          <button 
            onClick={() => setView("home")} 
            style={{ 
              background: view === "home" || view === "editor" ? 'var(--lapd-blue-dark)' : 'transparent', 
              color: view === "home" || view === "editor" ? '#fff' : 'var(--text-muted)', 
              border: 'none', padding: '0.5rem 1.5rem', borderRadius: '4px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' 
            }}>
            YENİ RAPOR
          </button>
          <button 
            onClick={() => setView("saved")} 
            style={{ 
              background: view === "saved" ? 'var(--lapd-blue-dark)' : 'transparent', 
              color: view === "saved" ? '#fff' : 'var(--text-muted)', 
              border: 'none', padding: '0.5rem 1.5rem', borderRadius: '4px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' 
            }}>
            ARŞİV ({savedReports.length})
          </button>
        </div>
      </div>

      {/* ── HOME: TEMPLATE GALLERY ── */}
      {view === "home" && (
        <div>
          {/* Filters */}
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCat(cat.id)}
                  style={{
                    background: activeCat === cat.id ? 'var(--lapd-orange)' : 'var(--bg-secondary)',
                    border: '1px solid var(--border-light)',
                    color: activeCat === cat.id ? '#fff' : 'var(--text-primary)',
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                  }}
                >
                  <i className={`fa-solid ${cat.icon}`} />
                  {cat.label}
                </button>
              ))}
            </div>

            <input
              type="text"
              placeholder="Şablon ara..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ padding: '0.5rem 1rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-light)', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '0.85rem', width: '250px' }}
            />
          </div>

          {/* Template Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {filtered.map((tmpl) => {
              return (
                <div
                  key={tmpl.id}
                  onClick={() => openTemplate(tmpl)}
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-light)',
                    padding: '1.5rem',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    position: 'relative',
                    transition: 'border-color 0.2s',
                  }}
                  onMouseOver={e => e.currentTarget.style.borderColor = 'var(--lapd-orange)'}
                  onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border-light)'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ width: '40px', height: '40px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--lapd-blue-dark)', fontSize: '1.2rem', borderRadius: '4px' }}>
                      <i className={`fa-solid ${tmpl.icon}`} />
                    </div>
                    <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: 'var(--lapd-orange)', fontWeight: 800, background: 'rgba(232, 79, 42, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                      LAC {tmpl.code}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--lapd-blue-dark)', marginBottom: '0.35rem' }}>{tmpl.name}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{tmpl.description}</div>
                  </div>

                  <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); setPreviewTemplate(tmpl); }}
                      style={{ flex: 1, background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', color: 'var(--text-primary)', padding: '0.6rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      ÖNİZLE
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); openTemplate(tmpl); }}
                      style={{ flex: 2, background: 'var(--lapd-blue-dark)', border: 'none', color: '#fff', padding: '0.6rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      DOLDUR
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── PREVIEW MODAL ── */}
      {previewTemplate && (
        <div onClick={() => setPreviewTemplate(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-light)', borderRadius: '8px', width: '100%', maxWidth: '700px', maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)' }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>ÖNİZLEME</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--lapd-blue-dark)' }}>{previewTemplate.name}</div>
              </div>
              <button onClick={() => setPreviewTemplate(null)} style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
            <div style={{ overflowY: 'auto', padding: '2rem' }}>
              {previewTemplate.sections.map((sec: any, si: number) => (
                <div key={si} style={{ marginBottom: '1.5rem', border: '1px solid var(--border-light)', borderRadius: '4px' }}>
                  <div style={{ padding: '0.75rem 1rem', background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-light)', fontSize: '0.8rem', fontWeight: 800 }}>{sec.title}</div>
                  <div style={{ padding: '1rem', display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1rem' }}>
                    {sec.fields.map((f: any) => (
                      <div key={f.id} style={{ gridColumn: `span ${f.width || 12}` }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.3rem' }}>{f.label}</div>
                        <div style={{ height: f.type === 'textarea' ? '60px' : '35px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: '4px' }}></div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: '1rem', borderTop: '1px solid var(--border-light)', textAlign: 'right', background: 'var(--bg-secondary)' }}>
              <button onClick={() => { openTemplate(previewTemplate); setPreviewTemplate(null); }} style={{ background: 'var(--lapd-orange)', color: '#fff', border: 'none', padding: '0.75rem 1.5rem', fontWeight: 800, borderRadius: '4px', cursor: 'pointer' }}>
                BU ŞABLONU KULLAN
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── EDITOR VIEW ── */}
      {view === "editor" && template && (
        <div className="editor-wrapper" style={{ margin: '0 auto' }}>
          
          <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-light)', marginBottom: '2rem', borderRadius: '4px' }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>DÜZENLENİYOR</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--lapd-blue-dark)' }}>{template.name} <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>#{reportCode}</span></div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => window.print()} style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', color: 'var(--text-primary)', padding: '0.6rem 1rem', borderRadius: '4px', fontWeight: 700, cursor: 'pointer' }}>
                <i className="fa-solid fa-print" /> YAZDIR
              </button>
              <button onClick={handleSave} disabled={saving} style={{ background: 'var(--color-success)', border: 'none', color: '#fff', padding: '0.6rem 1rem', borderRadius: '4px', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer' }}>
                <i className="fa-solid fa-floppy-disk" /> {saving ? "KAYDEDİLİYOR..." : "KAYDET"}
              </button>
            </div>
          </div>

          <div className="print-doc" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-light)', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid var(--border-light)', paddingBottom: '1rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <img src="/tahsis-portali/lapd-badge-logo-pngseeklogo-214481.png" alt="LAPD" style={{ width: '50px' }} />
                <div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--lapd-blue-dark)' }}>LOS ANGELES POLICE DEPARTMENT</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)' }}>{template.name}</div>
                </div>
              </div>
              <div style={{ textAlign: 'right', fontFamily: 'monospace', color: 'var(--lapd-orange)', fontWeight: 800 }}>
                <div>LAC {template.code}</div>
                <div style={{ color: 'var(--text-muted)' }}>{reportCode}</div>
              </div>
            </div>

            <div>
              {template.sections.map((sec: any, si: number) => (
                <div key={si} className="section-box" style={{ marginBottom: '1.5rem', border: '1px solid var(--border-light)' }}>
                  <div className="section-title" style={{ padding: '0.5rem 1rem', background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-light)', fontSize: '0.8rem', fontWeight: 800 }}>
                    {sec.title}
                  </div>
                  <div className="field-grid" style={{ padding: '1rem', display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1rem' }}>
                    {sec.fields.map((f: any) => (
                      <div key={f.id} className="field-wrap" style={{ gridColumn: `span ${f.width || 12}` }}>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>{f.label}</label>
                        {f.type === "textarea" ? (
                          <>
                            <div className="print-only-text" style={{ display: 'none' }}>{formData[f.id] || ""}</div>
                            <textarea className="no-print-textarea" rows={f.rows || 4} style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: '4px', color: 'var(--text-primary)', fontFamily: 'inherit' }} value={formData[f.id] || ""} onChange={e => setFormData(p => ({ ...p, [f.id]: e.target.value }))} />
                          </>
                        ) : f.type === "select" ? (
                          <select style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: '4px', color: 'var(--text-primary)', fontFamily: 'inherit' }} value={formData[f.id] || ""} onChange={e => setFormData(p => ({ ...p, [f.id]: e.target.value }))}>
                            <option value="">— Seçiniz —</option>
                            {f.options?.map((o: string, i: number) => <option key={i} value={o}>{o}</option>)}
                          </select>
                        ) : (
                          <input type={f.type || "text"} style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: '4px', color: 'var(--text-primary)', fontFamily: 'inherit' }} value={formData[f.id] || ""} onChange={e => setFormData(p => ({ ...p, [f.id]: e.target.value }))} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="doc-footer" style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '2px solid var(--border-light)', display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>HAZIRLAYAN MEMUR</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--lapd-blue-dark)' }}>{user ? user.name : "L. COOPER"} <span style={{ color: 'var(--lapd-orange)' }}>#{user?.badge || "101"}</span></div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>DİJİTAL İMZA</div>
                <div style={{ fontFamily: 'monospace', color: 'var(--lapd-blue-dark)', fontWeight: 800 }}>Signed · #{user?.badge || "101"}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date().toLocaleString('tr-TR')}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SAVED REPORTS (ARCHIVE) ── */}
      {view === "saved" && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                placeholder="Arşivde ara..."
                value={archiveSearch}
                onChange={e => setArchiveSearch(e.target.value)}
                style={{ padding: '0.5rem 1rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-light)', borderRadius: '4px', width: '300px' }}
              />
              <button onClick={fetchSaved} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-light)', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}>
                <i className="fa-solid fa-rotate" />
              </button>
            </div>
          </div>

          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-light)', borderRadius: '4px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-light)' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>RAPOR KODU</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>ŞABLON</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>MEMUR</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>TARİH</th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>İŞLEMLER</th>
                </tr>
              </thead>
              <tbody>
                {savedReports.filter(r => r.id.includes(archiveSearch) || (r.officerName && r.officerName.includes(archiveSearch))).map((r, i) => {
                  const tmpl = REPORT_TEMPLATES.find(t => t.id === r.formId);
                  return (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '1rem', fontFamily: 'monospace', color: 'var(--lapd-orange)', fontWeight: 800 }}>#{r.id}</td>
                      <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--lapd-blue-dark)' }}>{tmpl?.name || r.formId}</td>
                      <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{r.officerName || "—"}</td>
                      <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{r.timestamp ? new Date(r.timestamp).toLocaleString('tr-TR') : '—'}</td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                          <button onClick={() => openSaved(r)} style={{ background: 'var(--lapd-blue-dark)', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 700, fontSize: '0.75rem' }}>
                            AÇ
                          </button>
                          <button onClick={() => handleDelete(r.id)} style={{ background: 'var(--color-danger)', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 700, fontSize: '0.75rem' }}>
                            SİL
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {savedReports.length === 0 && (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Arşiv boş.</div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
