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
    <div className="app-root" style={{ width: '100%', fontFamily: "'Inter', sans-serif" }}>
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

        .scroll-custom::-webkit-scrollbar { width: 6px; }
        .scroll-custom::-webkit-scrollbar-track { background: transparent; }
        .scroll-custom::-webkit-scrollbar-thumb { background: var(--mdt-border); border-radius: 4px; }
      `}} />

      {/* ── HEADER TABS ── */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', borderBottom: '1px solid var(--mdt-border)', paddingBottom: '1.5rem', flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--mdt-text-muted)', margin: '0 0 0.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            L.A.C.P.D. · RAPOR SİSTEMİ
            <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "var(--mdt-text-muted)" }} />
            <span style={{ color: "var(--mdt-accent)" }}>OFFICIAL DOCUMENTATION</span>
          </p>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 900, color: "var(--mdt-text-primary)", margin: 0, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
            Resmi Evrak Portalı
          </h1>
          <p style={{ color: 'var(--mdt-text-muted)', fontSize: '0.82rem', marginTop: '0.35rem', fontWeight: 400 }}>
            Sistem üzerinde resmi belgeler oluşturun ve arşivleyin.
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--mdt-card-bg)', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--mdt-border)' }}>
          <button 
            onClick={() => setView("home")} 
            style={{ 
              background: view === "home" || view === "editor" ? 'var(--mdt-accent)' : 'transparent', 
              color: view === "home" || view === "editor" ? '#fff' : 'var(--mdt-text-secondary)', 
              border: 'none', padding: '0.5rem 1.5rem', borderRadius: '6px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.15s' 
            }}>
            YENİ RAPOR
          </button>
          <button 
            onClick={() => setView("saved")} 
            style={{ 
              background: view === "saved" ? 'var(--mdt-accent)' : 'transparent', 
              color: view === "saved" ? '#fff' : 'var(--mdt-text-secondary)', 
              border: 'none', padding: '0.5rem 1.5rem', borderRadius: '6px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.15s' 
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
                    background: activeCat === cat.id ? 'var(--mdt-accent)' : 'var(--mdt-card-bg)',
                    border: activeCat === cat.id ? '1px solid var(--mdt-accent)' : '1px solid var(--mdt-border)',
                    color: activeCat === cat.id ? '#fff' : 'var(--mdt-text-secondary)',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    transition: 'all 0.15s'
                  }}
                  onMouseOver={e => { if (activeCat !== cat.id) { (e.currentTarget as HTMLElement).style.borderColor = 'var(--mdt-text-muted)'; (e.currentTarget as HTMLElement).style.color = 'var(--mdt-text-primary)'; } }}
                  onMouseOut={e => { if (activeCat !== cat.id) { (e.currentTarget as HTMLElement).style.borderColor = 'var(--mdt-border)'; (e.currentTarget as HTMLElement).style.color = 'var(--mdt-text-secondary)'; } }}
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
              style={{ padding: '0.65rem 1rem', background: 'var(--mdt-bg-main)', border: '1px solid var(--mdt-border)', borderRadius: '6px', color: 'var(--mdt-text-primary)', fontSize: '0.85rem', width: '250px', outline: 'none', transition: 'border-color 0.15s' }}
              onFocus={e => e.target.style.borderColor = 'var(--mdt-accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--mdt-border)'}
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
                    background: 'var(--mdt-card-bg)',
                    border: '1px solid var(--mdt-border)',
                    padding: '1.5rem',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    position: 'relative',
                    transition: 'all 0.15s',
                    borderRadius: '10px'
                  }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--mdt-accent)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--mdt-border)'; e.currentTarget.style.transform = 'none'; }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ width: '45px', height: '45px', background: 'color-mix(in srgb, var(--mdt-accent) 15%, transparent)', border: '1px solid color-mix(in srgb, var(--mdt-accent) 30%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--mdt-accent)', fontSize: '1.25rem', borderRadius: '8px' }}>
                      <i className={`fa-solid ${tmpl.icon}`} />
                    </div>
                    <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: 'var(--mdt-warning)', fontWeight: 800, background: 'color-mix(in srgb, var(--mdt-warning) 10%, transparent)', padding: '0.25rem 0.6rem', borderRadius: '6px', border: '1px solid color-mix(in srgb, var(--mdt-warning) 20%, transparent)' }}>
                      LAC {tmpl.code}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--mdt-text-primary)', marginBottom: '0.35rem' }}>{tmpl.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--mdt-text-secondary)', lineHeight: 1.5 }}>{tmpl.description}</div>
                  </div>

                  <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem', paddingTop: '1rem' }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); setPreviewTemplate(tmpl); }}
                      style={{ flex: 1, background: 'var(--mdt-bg-main)', border: '1px solid var(--mdt-border)', color: 'var(--mdt-text-secondary)', padding: '0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}
                      onMouseOver={e => { (e.currentTarget as HTMLElement).style.color = 'var(--mdt-text-primary)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--mdt-text-primary)'; }}
                      onMouseOut={e => { (e.currentTarget as HTMLElement).style.color = 'var(--mdt-text-secondary)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--mdt-border)'; }}
                    >
                      ÖNİZLE
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); openTemplate(tmpl); }}
                      style={{ flex: 2, background: 'var(--mdt-accent)', border: '1px solid var(--mdt-accent)', color: '#fff', padding: '0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}
                      onMouseOver={e => (e.currentTarget as HTMLElement).style.opacity = '0.85'}
                      onMouseOut={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
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
        <div onClick={() => setPreviewTemplate(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--mdt-card-bg)', border: '1px solid var(--mdt-border)', borderRadius: '12px', width: '100%', maxWidth: '750px', maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--mdt-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--mdt-bg-main)' }}>
              <div>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--mdt-text-muted)', letterSpacing: '0.1em' }}>ŞABLON ÖNİZLEME</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--mdt-text-primary)' }}>{previewTemplate.name}</div>
              </div>
              <button onClick={() => setPreviewTemplate(null)} style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--mdt-text-muted)', transition: 'color 0.15s' }} onMouseOver={e => e.currentTarget.style.color = '#fff'} onMouseOut={e => e.currentTarget.style.color = 'var(--mdt-text-muted)'}>
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
            <div className="scroll-custom" style={{ overflowY: 'auto', padding: '2rem' }}>
              {previewTemplate.sections.map((sec: any, si: number) => (
                <div key={si} style={{ marginBottom: '1.5rem', border: '1px solid var(--mdt-border)', borderRadius: '8px', overflow: 'hidden' }}>
                  <div style={{ padding: '0.75rem 1rem', background: 'var(--mdt-bg-main)', borderBottom: '1px solid var(--mdt-border)', fontSize: '0.75rem', fontWeight: 800, color: 'var(--mdt-text-primary)' }}>{sec.title}</div>
                  <div style={{ padding: '1.25rem', display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1rem', background: 'var(--mdt-card-bg)' }}>
                    {sec.fields.map((f: any) => (
                      <div key={f.id} style={{ gridColumn: `span ${f.width || 12}` }}>
                        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--mdt-text-muted)', marginBottom: '0.4rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{f.label}</div>
                        <div style={{ height: f.type === 'textarea' ? '60px' : '38px', background: 'var(--mdt-bg-main)', border: '1px solid var(--mdt-border)', borderRadius: '6px' }}></div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: '1.25rem', borderTop: '1px solid var(--mdt-border)', textAlign: 'right', background: 'var(--mdt-bg-main)' }}>
              <button onClick={() => { openTemplate(previewTemplate); setPreviewTemplate(null); }} style={{ background: 'var(--mdt-accent)', color: '#fff', border: '1px solid var(--mdt-accent)', padding: '0.75rem 1.5rem', fontWeight: 700, borderRadius: '6px', cursor: 'pointer', transition: 'all 0.15s', fontSize: '0.8rem' }}
                onMouseOver={e => (e.currentTarget as HTMLElement).style.opacity = '0.85'}
                onMouseOut={e => (e.currentTarget as HTMLElement).style.opacity = '1'}>
                BU ŞABLONU DOLDUR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── EDITOR VIEW ── */}
      {view === "editor" && template && (
        <div className="editor-wrapper" style={{ margin: '0 auto' }}>
          
          <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', background: 'var(--mdt-card-bg)', border: '1px solid var(--mdt-border)', marginBottom: '2rem', borderRadius: '10px' }}>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--mdt-text-muted)', letterSpacing: '0.1em' }}>DÜZENLENİYOR</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--mdt-text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {template.name} <span style={{ color: 'var(--mdt-text-muted)', fontSize: '0.85rem', fontWeight: 600, background: 'var(--mdt-bg-main)', padding: '0.1rem 0.5rem', borderRadius: '4px', border: '1px solid var(--mdt-border)' }}>#{reportCode}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => window.print()} style={{ background: 'var(--mdt-bg-main)', border: '1px solid var(--mdt-border)', color: 'var(--mdt-text-secondary)', padding: '0.6rem 1.25rem', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem', transition: 'all 0.15s' }}
                onMouseOver={e => { (e.currentTarget as HTMLElement).style.color = 'var(--mdt-text-primary)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--mdt-text-primary)'; }}
                onMouseOut={e => { (e.currentTarget as HTMLElement).style.color = 'var(--mdt-text-secondary)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--mdt-border)'; }}>
                <i className="fa-solid fa-print" style={{ marginRight: '0.3rem' }} /> YAZDIR
              </button>
              <button onClick={handleSave} disabled={saving} style={{ background: 'var(--mdt-success)', border: '1px solid var(--mdt-success)', color: '#fff', padding: '0.6rem 1.25rem', borderRadius: '6px', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontSize: '0.8rem', transition: 'all 0.15s', opacity: saving ? 0.7 : 1 }}
                onMouseOver={e => !saving && ((e.currentTarget as HTMLElement).style.opacity = '0.85')}
                onMouseOut={e => !saving && ((e.currentTarget as HTMLElement).style.opacity = '1')}>
                <i className="fa-solid fa-floppy-disk" style={{ marginRight: '0.3rem' }} /> {saving ? "KAYDEDİLİYOR..." : "KAYDET"}
              </button>
            </div>
          </div>

          <div className="print-doc" style={{ background: 'var(--mdt-card-bg)', border: '1px solid var(--mdt-border)', padding: '2rem', borderRadius: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--mdt-border)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <img src="/tahsis-portali/LAC-badge-logo-pngseeklogo-214481.png" alt="LAC" style={{ width: '55px', filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.5))' }} />
                <div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--mdt-text-primary)', letterSpacing: '0.02em' }}>LOS ANGELES POLICE DEPARTMENT</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--mdt-text-muted)' }}>{template.name}</div>
                </div>
              </div>
              <div style={{ textAlign: 'right', fontFamily: 'monospace', color: 'var(--mdt-warning)', fontWeight: 800 }}>
                <div style={{ fontSize: '0.9rem' }}>LAC {template.code}</div>
                <div style={{ color: 'var(--mdt-text-muted)', fontSize: '0.8rem' }}>{reportCode}</div>
              </div>
            </div>

            <div>
              {template.sections.map((sec: any, si: number) => (
                <div key={si} className="section-box" style={{ marginBottom: '1.5rem', border: '1px solid var(--mdt-border)', borderRadius: '8px', overflow: 'hidden' }}>
                  <div className="section-title" style={{ padding: '0.65rem 1rem', background: 'var(--mdt-bg-main)', borderBottom: '1px solid var(--mdt-border)', fontSize: '0.75rem', fontWeight: 800, color: 'var(--mdt-text-primary)', letterSpacing: '0.05em' }}>
                    {sec.title}
                  </div>
                  <div className="field-grid" style={{ padding: '1.25rem', display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1rem', background: 'var(--mdt-card-bg)' }}>
                    {sec.fields.map((f: any) => (
                      <div key={f.id} className="field-wrap" style={{ gridColumn: `span ${f.width || 12}` }}>
                        <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: 'var(--mdt-text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{f.label}</label>
                        {f.type === "textarea" ? (
                          <>
                            <div className="print-only-text" style={{ display: 'none' }}>{formData[f.id] || ""}</div>
                            <textarea className="no-print-textarea" rows={f.rows || 4} style={{ width: '100%', padding: '0.75rem', background: 'var(--mdt-bg-main)', border: '1px solid var(--mdt-border)', borderRadius: '6px', color: 'var(--mdt-text-primary)', fontFamily: 'inherit', fontSize: '0.85rem', resize: 'vertical', outline: 'none', transition: 'border-color 0.15s' }} value={formData[f.id] || ""} onChange={e => setFormData(p => ({ ...p, [f.id]: e.target.value }))} onFocus={e => e.target.style.borderColor = 'var(--mdt-accent)'} onBlur={e => e.target.style.borderColor = 'var(--mdt-border)'} />
                          </>
                        ) : f.type === "select" ? (
                          <select style={{ width: '100%', padding: '0.75rem', background: 'var(--mdt-bg-main)', border: '1px solid var(--mdt-border)', borderRadius: '6px', color: 'var(--mdt-text-primary)', fontFamily: 'inherit', fontSize: '0.85rem', outline: 'none', transition: 'border-color 0.15s' }} value={formData[f.id] || ""} onChange={e => setFormData(p => ({ ...p, [f.id]: e.target.value }))} onFocus={e => e.target.style.borderColor = 'var(--mdt-accent)'} onBlur={e => e.target.style.borderColor = 'var(--mdt-border)'}>
                            <option value="">— Seçiniz —</option>
                            {f.options?.map((o: string, i: number) => <option key={i} value={o}>{o}</option>)}
                          </select>
                        ) : (
                          <input type={f.type || "text"} style={{ width: '100%', padding: '0.75rem', background: 'var(--mdt-bg-main)', border: '1px solid var(--mdt-border)', borderRadius: '6px', color: 'var(--mdt-text-primary)', fontFamily: 'inherit', fontSize: '0.85rem', outline: 'none', transition: 'border-color 0.15s' }} value={formData[f.id] || ""} onChange={e => setFormData(p => ({ ...p, [f.id]: e.target.value }))} onFocus={e => e.target.style.borderColor = 'var(--mdt-accent)'} onBlur={e => e.target.style.borderColor = 'var(--mdt-border)'} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="doc-footer" style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--mdt-border)', display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--mdt-text-muted)', letterSpacing: '0.1em' }}>HAZIRLAYAN MEMUR</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--mdt-text-primary)', marginTop: '0.2rem' }}>{user ? user.name : "L. COOPER"} <span style={{ color: 'var(--mdt-warning)' }}>#{user?.badge || "101"}</span></div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--mdt-text-muted)', letterSpacing: '0.1em' }}>DİJİTAL İMZA</div>
                <div style={{ fontFamily: 'monospace', color: 'var(--mdt-accent)', fontWeight: 800, marginTop: '0.2rem', fontSize: '0.9rem' }}>Signed · #{user?.badge || "101"}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--mdt-text-muted)', marginTop: '0.2rem' }}>{new Date().toLocaleString('tr-TR')}</div>
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
                style={{ padding: '0.65rem 1rem', background: 'var(--mdt-bg-main)', border: '1px solid var(--mdt-border)', borderRadius: '6px', width: '300px', color: 'var(--mdt-text-primary)', fontSize: '0.85rem', outline: 'none', transition: 'border-color 0.15s' }}
                onFocus={e => e.target.style.borderColor = 'var(--mdt-accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--mdt-border)'}
              />
              <button onClick={fetchSaved} style={{ background: 'var(--mdt-bg-main)', border: '1px solid var(--mdt-border)', color: 'var(--mdt-text-secondary)', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.15s' }}
                onMouseOver={e => { (e.currentTarget as HTMLElement).style.color = 'var(--mdt-text-primary)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--mdt-text-primary)'; }}
                onMouseOut={e => { (e.currentTarget as HTMLElement).style.color = 'var(--mdt-text-secondary)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--mdt-border)'; }}>
                <i className="fa-solid fa-rotate" />
              </button>
            </div>
          </div>

          <div style={{ background: 'var(--mdt-card-bg)', border: '1px solid var(--mdt-border)', borderRadius: '10px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--mdt-bg-main)', borderBottom: '1px solid var(--mdt-border)' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 800, color: 'var(--mdt-text-muted)', letterSpacing: '0.05em' }}>RAPOR KODU</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 800, color: 'var(--mdt-text-muted)', letterSpacing: '0.05em' }}>ŞABLON</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 800, color: 'var(--mdt-text-muted)', letterSpacing: '0.05em' }}>MEMUR</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 800, color: 'var(--mdt-text-muted)', letterSpacing: '0.05em' }}>TARİH</th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.7rem', fontWeight: 800, color: 'var(--mdt-text-muted)', letterSpacing: '0.05em' }}>İŞLEMLER</th>
                </tr>
              </thead>
              <tbody>
                {savedReports.filter(r => r.id.includes(archiveSearch) || (r.officerName && r.officerName.includes(archiveSearch))).map((r, i) => {
                  const tmpl = REPORT_TEMPLATES.find(t => t.id === r.formId);
                  return (
                    <tr key={i} style={{ borderBottom: '1px solid var(--mdt-border)', transition: 'background 0.15s' }} onMouseOver={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'} onMouseOut={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                      <td style={{ padding: '1rem', fontFamily: 'monospace', color: 'var(--mdt-warning)', fontWeight: 800, fontSize: '0.85rem' }}>#{r.id}</td>
                      <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--mdt-text-primary)', fontSize: '0.85rem' }}>{tmpl?.name || r.formId}</td>
                      <td style={{ padding: '1rem', color: 'var(--mdt-text-secondary)', fontSize: '0.85rem' }}>{r.officerName || "—"}</td>
                      <td style={{ padding: '1rem', color: 'var(--mdt-text-muted)', fontSize: '0.8rem' }}>{r.timestamp ? new Date(r.timestamp).toLocaleString('tr-TR') : '—'}</td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                          <button onClick={() => openSaved(r)} style={{ background: 'var(--mdt-bg-main)', color: 'var(--mdt-text-primary)', border: '1px solid var(--mdt-border)', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 700, fontSize: '0.7rem', transition: 'all 0.15s' }}
                            onMouseOver={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--mdt-text-primary)'; }}
                            onMouseOut={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--mdt-border)'; }}>
                            GÖRÜNTÜLE
                          </button>
                          <button onClick={() => handleDelete(r.id)} style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--mdt-danger)', border: '1px solid rgba(239,68,68,0.2)', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 700, fontSize: '0.7rem', transition: 'all 0.15s' }}
                            onMouseOver={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.2)'; }}
                            onMouseOut={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)'; }}>
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
              <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--mdt-text-muted)', fontWeight: 600 }}>Arşivde kayıtlı rapor bulunamadı.</div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
