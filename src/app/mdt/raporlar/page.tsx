"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { toast } from "react-hot-toast";

const REPORT_TEMPLATES = [
  {
    id: "incident",
    category: "CRIME",
    categoryName: "Suç & Olay",
    name: "Olay Yeri Raporu",
    code: "3.14",
    icon: "fa-shield-halved",
    description: "Genel suçlar ve olay yeri ön soruşturması için resmi tutanak.",
    sections: [
      {
        title: "Olay Bilgileri",
        fields: [
          { id: "incident_type", label: "Olay Türü", type: "text", placeholder: "Silahlı Soygun, Haneye Tecavüz...", width: "6" },
          { id: "incident_location", label: "Olay Yeri", type: "text", placeholder: "Sokak / Blok", width: "6" },
          { id: "incident_date", label: "Tarih", type: "date", width: "3", defaultVal: "today" },
          { id: "incident_time", label: "Saat", type: "time", width: "3", defaultVal: "now" },
          { id: "code_section", label: "Penal Code Maddesi", type: "text", placeholder: "PC 211 - Robbery", width: "6" },
        ],
      },
      {
        title: "Taraflar",
        fields: [
          { id: "suspect_name", label: "Şüpheli", type: "text", placeholder: "Ad Soyad veya 'Meçhul'", width: "6" },
          { id: "suspect_desc", label: "Şüpheli Eşkali", type: "text", placeholder: "Boy, kıyafet, dövme...", width: "6" },
          { id: "victim_name", label: "Mağdur", type: "text", placeholder: "Ad Soyad", width: "6" },
          { id: "victim_phone", label: "Mağdur İletişim", type: "text", placeholder: "555-xxxx", width: "6" },
        ],
      },
      {
        title: "Anlatım & Deliller",
        fields: [
          { id: "narrative", label: "Detaylı Olay Anlatımı", type: "textarea", placeholder: "Olay yerine varıldığında yapılan tespitler...", width: "12", rows: 6 },
          { id: "evidence_collected", label: "Toplanan Delil Listesi", type: "textarea", placeholder: "1. 9mm Kovan\n2. CCTV Kaydı", width: "12", rows: 3 },
        ],
      },
    ],
  },
  {
    id: "arrest",
    category: "CRIME",
    categoryName: "Suç & Olay",
    name: "Gözaltı & Tutuklama Raporu",
    code: "5.02",
    icon: "fa-handcuffs",
    description: "Şüpheli gözaltısı, Miranda hakları ve nezarethane sevk işlemleri.",
    sections: [
      {
        title: "Gözaltına Alınan Şahıs",
        fields: [
          { id: "arrestee_name", label: "Ad Soyad", type: "text", placeholder: "Tam Ad Soyad", width: "6" },
          { id: "arrestee_dob", label: "Doğum Tarihi", type: "date", width: "3" },
          { id: "arrestee_gender", label: "Cinsiyet", type: "select", options: ["Erkek", "Kadın", "Diğer"], width: "3" },
          { id: "arrestee_id", label: "Kimlik No", type: "text", placeholder: "xxxx-xxxx", width: "6" },
          { id: "booking_num", label: "Booking Numarası", type: "text", placeholder: "BK-2026-xxxx", width: "6" },
        ],
      },
      {
        title: "Suçlamalar & Miranda",
        fields: [
          { id: "charges_list", label: "İsnat Edilen Suçlamalar", type: "textarea", placeholder: "1. PC 245(a)(1) - Assault with Deadly Weapon", width: "12", rows: 3 },
          { id: "miranda_read", label: "Miranda Hakları Okundu mu?", type: "select", options: ["Evet — Haklar okundu ve anlaşıldı", "Hayır — Soru sorulmadı", "Şahıs avukat talep etti"], width: "6" },
          { id: "bail_amount", label: "Kefalet Tutarı", type: "text", placeholder: "$50,000 veya Kefaletsiz", width: "6" },
        ],
      },
      {
        title: "Tutuklama Detayı",
        fields: [
          { id: "arrest_narrative", label: "Gözaltı Koşulları & Anlatım", type: "textarea", placeholder: "Şahıs nerede tespit edildi, nasıl durduruldu...", width: "12", rows: 5 },
        ],
      },
    ],
  },
  {
    id: "stolen_veh",
    category: "CRIME",
    categoryName: "Suç & Olay",
    name: "Çalıntı Araç Bildirimi",
    code: "3.77",
    icon: "fa-car-burst",
    description: "BOLO / APB çıkışı için çalıntı araç tanım ve bildirim tutanağı.",
    sections: [
      {
        title: "Araç Bilgileri",
        fields: [
          { id: "veh_plate", label: "Plaka", type: "text", placeholder: "Plaka No", width: "4" },
          { id: "veh_make_model", label: "Marka & Model", type: "text", placeholder: "Bravado Buffalo S", width: "4" },
          { id: "veh_color", label: "Renk", type: "text", placeholder: "Siyah / Mat", width: "4" },
          { id: "veh_vin", label: "VIN / Şasi No", type: "text", placeholder: "12 Haneli VIN", width: "6" },
          { id: "veh_year", label: "Model Yılı", type: "text", placeholder: "2023", width: "6" },
        ],
      },
      {
        title: "Çalınma Detayları",
        fields: [
          { id: "theft_location", label: "Çalındığı Konum", type: "text", placeholder: "Adres / Otopark", width: "6" },
          { id: "theft_date_time", label: "Tahmini Çalınma Zamanı", type: "text", placeholder: "Saat 21:00–23:00", width: "6" },
          { id: "owner_name", label: "Ruhsat Sahibi", type: "text", placeholder: "Ad Soyad", width: "6" },
          { id: "owner_contact", label: "Ruhsat Sahibi Telefon", type: "text", placeholder: "555-xxxx", width: "6" },
          { id: "theft_narrative", label: "Özel İşaretler & Notlar", type: "textarea", placeholder: "Modifiye, kırık cam, özel jant...", width: "12", rows: 4 },
        ],
      },
    ],
  },
  {
    id: "citation",
    category: "TRAFFIC",
    categoryName: "Trafik & Ceza",
    name: "Trafik Cezası (Citation)",
    code: "4.50",
    icon: "fa-file-invoice-dollar",
    description: "Hız ihlalleri ve karayolu kural ihlalleri için resmi ceza makbuzu.",
    sections: [
      {
        title: "Sürücü Bilgileri",
        fields: [
          { id: "driver_name", label: "Sürücü Adı Soyadı", type: "text", placeholder: "Ad Soyad", width: "6" },
          { id: "dl_number", label: "Ehliyet No", type: "text", placeholder: "DL-xxxxxx", width: "3" },
          { id: "dl_class", label: "Ehliyet Sınıfı", type: "text", placeholder: "A / C", width: "3" },
          { id: "driver_address", label: "İkamet Adresi", type: "text", placeholder: "Sokak / Şehir", width: "12" },
        ],
      },
      {
        title: "Araç & İhlal Detayları",
        fields: [
          { id: "citation_plate", label: "Plaka", type: "text", placeholder: "Plaka", width: "4" },
          { id: "citation_make", label: "Araç Modeli", type: "text", placeholder: "Vapid Dominator", width: "4" },
          { id: "citation_color", label: "Renk", type: "text", placeholder: "Kırmızı", width: "4" },
          { id: "violation_location", label: "İhlal Konumu", type: "text", placeholder: "Vinewood Blvd & Alta St", width: "8" },
          { id: "radar_speed", label: "Ölçülen Hız", type: "text", placeholder: "Limit 45 mph / Ölçülen 82 mph", width: "4" },
          { id: "violations", label: "İhlal Maddeleri & Cezalar", type: "textarea", placeholder: "1. VC 22350 — Speeding ($350)\n2. VC 21453(a) — Red Light ($200)", width: "12", rows: 3 },
          { id: "total_fine", label: "Toplam Ceza ($)", type: "text", placeholder: "$550", width: "4" },
          { id: "court_date", label: "Mahkeme Tarihi", type: "date", width: "4" },
          { id: "is_impounded", label: "Araç Çekildi mi?", type: "select", options: ["Hayır", "Evet — Otoparka Çekildi"], width: "4" },
        ],
      },
    ],
  },
  {
    id: "dui",
    category: "TRAFFIC",
    categoryName: "Trafik & Ceza",
    name: "DUI — Alkol / Uyuşturucu Test Raporu",
    code: "4.22",
    icon: "fa-wine-bottle",
    description: "Saha ayıklık testleri (FST) ve alkolölçer (BAC) sonuç tutanağı.",
    sections: [
      {
        title: "Durdurma Gerekçesi",
        fields: [
          { id: "dui_driver", label: "Sürücü", type: "text", placeholder: "Ad Soyad", width: "6" },
          { id: "dui_plate", label: "Plaka", type: "text", placeholder: "Plaka", width: "6" },
          { id: "stop_reason", label: "Durdurma Gerekçesi", type: "text", placeholder: "Şerit ihlali, zikzak çizme...", width: "12" },
        ],
      },
      {
        title: "Saha Ayıklık Testleri (FST)",
        fields: [
          { id: "fst_gaze", label: "HGN Göz Testi", type: "select", options: ["Başarısız — Nistagmus var", "Başarılı", "Uygulanamadı"], width: "6" },
          { id: "fst_walk", label: "Yürüme & Dönüş Testi", type: "select", options: ["Başarısız — Dengesi bozuk", "Başarılı", "Uygulanamadı"], width: "6" },
          { id: "fst_leg", label: "Tek Ayak Denge Testi", type: "select", options: ["Başarısız", "Başarılı", "Uygulanamadı"], width: "6" },
          { id: "breathalyzer_result", label: "BAC Alkolölçer Sonucu", type: "text", placeholder: "%0.14 BAC (Yasal sınır %0.08)", width: "6" },
          { id: "dui_observations", label: "Memur Gözlemleri", type: "textarea", placeholder: "Alkol kokusu, peltek konuşma...", width: "12", rows: 4 },
        ],
      },
    ],
  },
  {
    id: "tow",
    category: "TRAFFIC",
    categoryName: "Trafik & Ceza",
    name: "Araç Çekme & Otopark Tutanağı",
    code: "4.10",
    icon: "fa-truck-pickup",
    description: "İhlale karışan veya el konulan araçların otopark sevk tutanağı.",
    sections: [
      {
        title: "Çekilen Araç Bilgileri",
        fields: [
          { id: "tow_plate", label: "Plaka", type: "text", placeholder: "Plaka", width: "4" },
          { id: "tow_make", label: "Marka & Model", type: "text", placeholder: "Marka Model", width: "4" },
          { id: "tow_color", label: "Renk", type: "text", placeholder: "Renk", width: "4" },
          { id: "tow_location", label: "Çekildiği Konum", type: "text", placeholder: "Adres / Cadde", width: "8" },
          { id: "tow_reason", label: "Çekilme Gerekçesi", type: "select", options: ["Park Yasağı", "Sürücünün Gözaltına Alınması", "DUI", "Kriminal El Koyma", "Terk Edilmiş Araç"], width: "4" },
          { id: "veh_damage", label: "Hasar Durumu", type: "text", placeholder: "Ön tampon vuruk — veya — Temiz", width: "12" },
          { id: "inventory_items", label: "Araç İçi Envanter", type: "textarea", placeholder: "1. Bagajda yedek lastik\n2. Torpido gözünde ruhsat", width: "12", rows: 3 },
        ],
      },
    ],
  },
  {
    id: "detective_case",
    category: "DETECTIVE",
    categoryName: "Dedektif Bürosu",
    name: "Dava & Soruşturma Dosyası",
    code: "3.18",
    icon: "fa-magnifying-glass",
    description: "Organize suçlar ve ağır ceza soruşturmalarının ana dedektif raporu.",
    sections: [
      {
        title: "Dava Künyesi",
        fields: [
          { id: "case_number", label: "Dava Numarası", type: "text", placeholder: "CASE-2026-xxxx", width: "6" },
          { id: "investigation_unit", label: "Soruşturma Birimi", type: "select", options: ["Robbery-Homicide Division (RHD)", "Gang and Narcotics Division (GND)", "Major Crimes Division (MCD)", "Detective Bureau — General"], width: "6" },
          { id: "lead_detectives", label: "Sorumlu Dedektifler", type: "text", placeholder: "Det. Smith #1024, Det. Johnson #1105", width: "12" },
        ],
      },
      {
        title: "Bulgular & İlerleme",
        fields: [
          { id: "case_summary", label: "Dava Özeti", type: "textarea", placeholder: "Soruşturmanın başlangıç noktası...", width: "12", rows: 5 },
          { id: "witness_statements", label: "Tanık İfadeleri", type: "textarea", placeholder: "Tanık A: Olay günü şüphelileri siyah SUV içinde gördüğünü belirtti...", width: "12", rows: 4 },
          { id: "next_steps", label: "Sonraki Adımlar", type: "textarea", placeholder: "1. HTS kayıtları incelemesi\n2. Mahkemeden arama kararı talebi", width: "12", rows: 3 },
        ],
      },
    ],
  },
  {
    id: "uof",
    category: "DETECTIVE",
    categoryName: "Dedektif Bürosu",
    name: "Güç Kullanımı Raporu (Use of Force)",
    code: "1.12",
    icon: "fa-gavel",
    description: "Fiziki güç, Taser veya ateşli silah kullanımı sonrası zorunlu bildirim.",
    sections: [
      {
        title: "Olay & Memur Bilgileri",
        fields: [
          { id: "uof_officer", label: "Güç Kullanan Memur", type: "text", placeholder: "Adı ve Rozet No", width: "6" },
          { id: "uof_subject", label: "Güç Uygulanan Şahıs", type: "text", placeholder: "Şahıs Adı Soyadı", width: "6" },
          { id: "force_type", label: "Uygulanan Güç Seviyesi", type: "select", options: ["Seviye 1 — Fiziki Müdahale / Kelepçe", "Seviye 2 — Taser / OC Sprey", "Seviye 3 — Jop / K9 / Havaya Ateş", "Seviye 4 — Ateşli Silah (Lethal)"], width: "12" },
          { id: "force_justification", label: "Güç Kullanma Gerekçesi", type: "textarea", placeholder: "Şahıs kelepçelenmeye direndi mi, saldırdı mı?...", width: "12", rows: 5 },
          { id: "medical_attention", label: "Tıbbi Müdahale", type: "textarea", placeholder: "EMS çağrıldı mı, hastaneye sevk edildi mi?...", width: "12", rows: 3 },
        ],
      },
    ],
  },
  {
    id: "search_warrant",
    category: "WARRANT",
    categoryName: "Mahkeme Kararları",
    name: "Arama Kararı Talebi",
    code: "8.01",
    icon: "fa-scale-balanced",
    description: "Arama ve el koyma işlemi için mahkemeye sunulan resmi beyan belgesi.",
    sections: [
      {
        title: "Hedef Konum & Deliller",
        fields: [
          { id: "target_address", label: "Aranacak Adres", type: "text", placeholder: "1424 Eclipse Towers, Apt #12", width: "8" },
          { id: "target_owner", label: "Mülk Sahibi / Şüpheli", type: "text", placeholder: "Şüpheli Adı", width: "4" },
          { id: "items_to_seize", label: "Aranacak Nesneler", type: "textarea", placeholder: "1. Yasadışı silahlar\n2. Uyuşturucu madde", width: "12", rows: 4 },
          { id: "probable_cause", label: "Makul Şüphe Beyanı", type: "textarea", placeholder: "Delillerin bu mülkte bulunduğuna dair memur beyanı...", width: "12", rows: 5 },
          { id: "judge_name", label: "Onaylayan Yargıç", type: "text", placeholder: "Yargıç Adı / Mahkeme", width: "6" },
          { id: "warrant_status", label: "Karar Durumu", type: "select", options: ["Mahkemeden Onay Bekliyor", "ONAYLANDI — Aktif", "İnfaz Edildi — Tamamlandı"], width: "6" },
        ],
      },
    ],
  },
  {
    id: "arrest_warrant",
    category: "WARRANT",
    categoryName: "Mahkeme Kararları",
    name: "Yakalama Kararı (Arrest Warrant)",
    code: "8.15",
    icon: "fa-user-lock",
    description: "Firari şüpheliler için mahkeme onaylı resmi yakalama kararı.",
    sections: [
      {
        title: "Aranan Şüpheli",
        fields: [
          { id: "warrant_suspect", label: "Ad Soyad", type: "text", placeholder: "Tam Ad Soyad", width: "6" },
          { id: "warrant_alias", label: "Takma Ad (Alias)", type: "text", placeholder: "'Ghost', 'Slim'", width: "6" },
          { id: "warrant_charges", label: "İsnat Edilen Suçlar", type: "textarea", placeholder: "1. Cinayet Teşebbüsü\n2. Silahlı Soygun", width: "12", rows: 3 },
          { id: "danger_level", label: "Risk Seviyesi", type: "select", options: ["SİLAHLI VE TEHLİKELİ — SWAT Önerilir", "Yüksek Risk / Kaçma Eğilimli", "Standart Yakalama"], width: "12" },
          { id: "warrant_notes", label: "Operasyon Notları", type: "textarea", placeholder: "Şüpheli genellikle Güney LS'de görülmüştür...", width: "12", rows: 4 },
        ],
      },
    ],
  },
  {
    id: "field_contact",
    category: "FIELD",
    categoryName: "Saha Kayıtları",
    name: "Saha İrtibat Raporu (FI Card)",
    code: "15.43",
    icon: "fa-user-check",
    description: "Gözaltısız kimlik tespiti, sorgulama ve GBT kontrollerinin kaydı.",
    sections: [
      {
        title: "Kontrol Edilen Şahıs",
        fields: [
          { id: "contact_name", label: "Ad Soyad", type: "text", placeholder: "Ad Soyad", width: "6" },
          { id: "contact_location", label: "Kontrol Konumu", type: "text", placeholder: "Cadde / Sokak", width: "6" },
          { id: "contact_reason", label: "Kontrol Sebebi", type: "text", placeholder: "Gece vakti şüpheli bekleme...", width: "12" },
          { id: "contact_notes", label: "Gözlemler & Sonuç", type: "textarea", placeholder: "Kimlik ibraz edildi, suç unsuruna rastlanmadı, serbest bırakıldı.", width: "12", rows: 4 },
        ],
      },
    ],
  },
  {
    id: "shift_end",
    category: "FIELD",
    categoryName: "Saha Kayıtları",
    name: "Vardiya Sonu Faaliyet Raporu",
    code: "2.10",
    icon: "fa-calendar-check",
    description: "Devriye bitiminde günlük faaliyet ve istatistiklerin özet raporu.",
    sections: [
      {
        title: "Vardiya Künyesi",
        fields: [
          { id: "shift_unit", label: "Çağrı Kodu", type: "text", placeholder: "1-ADAM-12", width: "4" },
          { id: "shift_officers", label: "Devriyedeki Memurlar", type: "text", placeholder: "Memur A #101, Memur B #102", width: "8" },
          { id: "shift_stats", label: "Vardiya İstatistikleri", type: "textarea", placeholder: "• Durdurulan Araç: 5\n• Kesilen Ceza: 3\n• Tutuklama: 1\n• 911 Çağrısı: 7", width: "12", rows: 4 },
          { id: "shift_summary", label: "Önemli Olaylar & Notlar", type: "textarea", placeholder: "Vardiya boyunca yaşanan önemli olaylar...", width: "12", rows: 4 },
        ],
      },
    ],
  },
];

const CATEGORIES = [
  { id: "ALL", label: "Tüm Şablonlar", icon: "fa-layer-group", color: "#041632" },
  { id: "CRIME", label: "Suç & Olay", icon: "fa-handcuffs", color: "#dc2626" },
  { id: "TRAFFIC", label: "Trafik & Ceza", icon: "fa-car-on", color: "#d97706" },
  { id: "DETECTIVE", label: "Dedektif Bürosu", icon: "fa-magnifying-glass", color: "#4f46e5" },
  { id: "WARRANT", label: "Mahkeme Kararları", icon: "fa-scale-balanced", color: "#E84F2A" },
  { id: "FIELD", label: "Saha Kayıtları", icon: "fa-user-shield", color: "#059669" },
];

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

  useEffect(() => {
    fetchSaved();
  }, []);

  const fetchSaved = async () => {
    setLoadingReports(true);
    try {
      const r = await fetch("/api/forms-reports");
      const d = await r.json();
      if (d.reports) setSavedReports(d.reports);
    } catch {}
    setLoadingReports(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const currentUrls = formData.evidenceUrl ? formData.evidenceUrl.split(",").filter(Boolean) : [];
    if (currentUrls.length >= 5) {
      toast.error("En fazla 5 adet görsel yükleyebilirsiniz.");
      return;
    }
    setUploadingImg(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok) {
        setFormData((prev) => ({
          ...prev,
          evidenceUrl: prev.evidenceUrl ? prev.evidenceUrl + "," + data.url : data.url,
        }));
        toast.success("Delil görseli eklendi.");
      } else {
        toast.error(data.error || "Yükleme başarısız.");
      }
    } catch {
      toast.error("Sunucu hatası.");
    } finally {
      setUploadingImg(false);
    }
  };

  const openTemplate = (tmpl: any) => {
    setTemplate(tmpl);
    const code = `${tmpl.id.toUpperCase()}-${Date.now().toString().slice(-6)}`;
    setReportCode(code);
    const init: Record<string, string> = {};
    tmpl.sections.forEach((s: any) =>
      s.fields.forEach((f: any) => {
        if (f.defaultVal === "today") init[f.id] = new Date().toISOString().split("T")[0];
        else if (f.defaultVal === "now") {
          const n = new Date();
          init[f.id] = `${String(n.getHours()).padStart(2, "0")}:${String(n.getMinutes()).padStart(2, "0")}`;
        } else init[f.id] = "";
      })
    );
    setFormData(init);
    setView("editor");
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const r = await fetch("/api/forms-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: reportCode,
          formId: template.id,
          officerName: user ? `${user.name} (#${user.badge})` : "Bilinmiyor",
          data: formData,
          diagram: [],
        }),
      });
      if (r.ok) {
        await fetchSaved();
        setView("saved");
        toast.success("Rapor başarıyla kaydedildi.");
      } else {
        toast.error("Kaydetme hatası.");
      }
    } catch {
      toast.error("Sunucu hatası.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(`#${id} numaralı raporu kalıcı olarak silmek istiyor musunuz?`)) return;
    await fetch(`/api/forms-reports?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    setSavedReports((prev) => prev.filter((r) => r.id !== id));
    toast.success("Rapor silindi.");
  };

  const openSaved = (s: any) => {
    const tmpl = REPORT_TEMPLATES.find((t) => t.id === s.formId) || REPORT_TEMPLATES[0];
    setTemplate(tmpl);
    setReportCode(s.id);
    setFormData(s.data || {});
    setView("editor");
  };

  const filteredTemplates = REPORT_TEMPLATES.filter(
    (t) =>
      (activeCat === "ALL" || t.category === activeCat) &&
      (t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.code.includes(searchTerm) ||
        t.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredSaved = savedReports.filter(
    (r) =>
      r.id?.toLowerCase().includes(archiveSearch.toLowerCase()) ||
      (r.officerName && r.officerName.toLowerCase().includes(archiveSearch.toLowerCase()))
  );

  const inputStyle: React.CSSProperties = {
    width: "100%",
    backgroundColor: "var(--bg-primary)",
    border: "1px solid var(--border-strong)",
    borderRadius: 6,
    padding: "0.65rem 0.85rem",
    color: "var(--text-primary)",
    fontSize: "0.9rem",
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
  };

  return (
    <>
      <style>{`
        .rp-field:focus { border-color: #041632 !important; box-shadow: 0 0 0 3px rgba(4, 22, 50, 0.08) !important; }
        .tmpl-card { transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease; }
        .tmpl-card:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(15, 23, 42, 0.07); border-color: var(--border-strong) !important; }
        @media print {
          @page { size: portrait; margin: 15mm; }
          body * { visibility: hidden; }
          aside, header, .no-print { display: none !important; }
          .print-doc, .print-doc * { visibility: visible; }
          .print-doc { position: absolute; left: 0; top: 0; width: 100%; background: white !important; color: black !important; border: none !important; padding: 0 !important; box-shadow: none !important; }
        }
      `}</style>

      <div style={{ maxWidth: 1360, margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.25rem", paddingBottom: "2.5rem" }}>
        {/* ── PAGE HEADER CARD ── */}
        <div
          className="no-print"
          style={{
            backgroundColor: "var(--bg-secondary)",
            border: "1px solid var(--border-light)",
            borderRadius: 8,
            padding: "1.25rem 1.5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--LAC-orange)", letterSpacing: "0.04em", marginBottom: "0.2rem" }}>
              LAPD RECORDS & DOCUMENTS // RESMİ TUTANAK SİSTEMİ
            </div>
            <h1 style={{ margin: 0, fontSize: "1.45rem", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
              Rapor ve Belge Portalı
            </h1>
            <p style={{ margin: "0.25rem 0 0", fontSize: "0.86rem", color: "var(--text-secondary)" }}>
              Standart LAPD vaka formlarını doldurun, delil fotoğraflarını ekleyin veya arşivlenmiş tutanakları inceleyin.
            </p>
          </div>

          {/* Segmented View Switcher */}
          <div
            style={{
              display: "inline-flex",
              backgroundColor: "var(--bg-tertiary)",
              border: "1px solid var(--border-light)",
              borderRadius: 8,
              padding: "0.25rem",
              gap: "0.25rem",
            }}
          >
            <button
              onClick={() => setView("home")}
              style={{
                padding: "0.55rem 1.1rem",
                borderRadius: 6,
                border: "none",
                backgroundColor: view === "home" || view === "editor" ? "#041632" : "transparent",
                color: view === "home" || view === "editor" ? "#ffffff" : "var(--text-secondary)",
                fontSize: "0.84rem",
                fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.45rem",
              }}
            >
              <i className="fa-solid fa-layer-group" />
              Rapor Şablonları ({REPORT_TEMPLATES.length})
            </button>
            <button
              onClick={() => setView("saved")}
              style={{
                padding: "0.55rem 1.1rem",
                borderRadius: 6,
                border: "none",
                backgroundColor: view === "saved" ? "#041632" : "transparent",
                color: view === "saved" ? "#ffffff" : "var(--text-secondary)",
                fontSize: "0.84rem",
                fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.45rem",
              }}
            >
              <i className="fa-solid fa-box-archive" />
              Kayıtlı Rapor Arşivi ({savedReports.length})
            </button>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════
            VIEW 1: REPORT TEMPLATES CATALOG
           ════════════════════════════════════════════════════════════════ */}
        {view === "home" && (
          <>
            {/* Filter & Search Bar */}
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
                gap: "0.75rem",
              }}
            >
              <div style={{ display: "flex", gap: "0.45rem", flexWrap: "wrap" }}>
                {CATEGORIES.map((cat) => {
                  const isActive = activeCat === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCat(cat.id)}
                      style={{
                        padding: "0.48rem 0.9rem",
                        borderRadius: 6,
                        backgroundColor: isActive ? "#041632" : "var(--bg-primary)",
                        color: isActive ? "#ffffff" : "var(--text-secondary)",
                        border: isActive ? "1px solid #041632" : "1px solid var(--border-light)",
                        fontSize: "0.82rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.45rem",
                      }}
                    >
                      <i className={`fa-solid ${cat.icon}`} style={{ color: isActive ? "#ffffff" : cat.color, fontSize: "0.8rem" }} />
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              <div style={{ position: "relative", minWidth: 250 }}>
                <i
                  className="fa-solid fa-magnifying-glass"
                  style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: "0.82rem" }}
                />
                <input
                  type="text"
                  placeholder="Form adı veya kodu ile ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    ...inputStyle,
                    padding: "0.5rem 0.85rem 0.5rem 2.2rem",
                    fontSize: "0.85rem",
                  }}
                />
              </div>
            </div>

            {/* Templates Grid */}
            {filteredTemplates.length === 0 ? (
              <div
                style={{
                  backgroundColor: "var(--bg-secondary)",
                  border: "1px solid var(--border-light)",
                  borderRadius: 8,
                  padding: "3rem",
                  textAlign: "center",
                  color: "var(--text-muted)",
                }}
              >
                Arama kriterlerine uygun rapor şablonu bulunamadı.
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
                  gap: "1rem",
                }}
              >
                {filteredTemplates.map((tmpl) => {
                  const catInfo = CATEGORIES.find((c) => c.id === tmpl.category) || CATEGORIES[0];
                  const totalFields = tmpl.sections.reduce((acc, s) => acc + s.fields.length, 0);

                  return (
                    <div
                      key={tmpl.id}
                      className="tmpl-card"
                      onClick={() => openTemplate(tmpl)}
                      style={{
                        backgroundColor: "var(--bg-secondary)",
                        border: "1px solid var(--border-light)",
                        borderTop: `3px solid ${catInfo.color}`,
                        borderRadius: 8,
                        padding: "1.25rem",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        gap: "1rem",
                        cursor: "pointer",
                      }}
                    >
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.4rem",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              color: catInfo.color,
                              backgroundColor: `${catInfo.color}12`,
                              padding: "0.22rem 0.6rem",
                              borderRadius: 4,
                            }}
                          >
                            <i className={`fa-solid ${tmpl.icon}`} />
                            {tmpl.categoryName}
                          </span>
                          <span
                            style={{
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              color: "var(--text-secondary)",
                              backgroundColor: "var(--bg-tertiary)",
                              border: "1px solid var(--border-light)",
                              padding: "0.2rem 0.55rem",
                              borderRadius: 4,
                            }}
                          >
                            FORM {tmpl.code}
                          </span>
                        </div>

                        <h3 style={{ margin: "0 0 0.35rem", fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)" }}>
                          {tmpl.name}
                        </h3>
                        <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                          {tmpl.description}
                        </p>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          paddingTop: "0.85rem",
                          borderTop: "1px solid var(--border-light)",
                        }}
                      >
                        <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 500 }}>
                          {tmpl.sections.length} Bölüm • {totalFields} Veri Alanı
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openTemplate(tmpl);
                          }}
                          style={{
                            padding: "0.45rem 0.95rem",
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
                          Formu Doldur
                          <i className="fa-solid fa-arrow-right" style={{ fontSize: "0.72rem" }} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ════════════════════════════════════════════════════════════════
            VIEW 2: SAVED REPORTS ARCHIVE TABLE
           ════════════════════════════════════════════════════════════════ */}
        {view === "saved" && (
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
                flexWrap: "wrap",
                gap: "0.75rem",
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)" }}>
                  Kayıtlı Rapor Arşivi
                </h2>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: 2 }}>
                  Sistemde arşivlenen tüm vaka tutanakları ve mahkeme belgeleri
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <input
                  type="text"
                  placeholder="Rapor kodu veya memur ara..."
                  value={archiveSearch}
                  onChange={(e) => setArchiveSearch(e.target.value)}
                  style={{ ...inputStyle, width: 250, padding: "0.48rem 0.8rem", fontSize: "0.84rem" }}
                />
                <button
                  onClick={fetchSaved}
                  style={{
                    padding: "0.5rem 0.85rem",
                    borderRadius: 6,
                    backgroundColor: "var(--bg-tertiary)",
                    border: "1px solid var(--border-light)",
                    color: "var(--text-secondary)",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  <i className="fa-solid fa-rotate" /> Yenile
                </button>
              </div>
            </div>

            {loadingReports ? (
              <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
                Rapor arşivi yükleniyor...
              </div>
            ) : filteredSaved.length === 0 ? (
              <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
                Arşivde eşleşen rapor kaydı bulunamadı.
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                  <thead>
                    <tr style={{ backgroundColor: "var(--bg-tertiary)", borderBottom: "1px solid var(--border-light)" }}>
                      <th style={{ padding: "0.85rem 1.25rem", fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)" }}>
                        Rapor Kodu
                      </th>
                      <th style={{ padding: "0.85rem 1.25rem", fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)" }}>
                        Belge Türü
                      </th>
                      <th style={{ padding: "0.85rem 1.25rem", fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)" }}>
                        Kategori
                      </th>
                      <th style={{ padding: "0.85rem 1.25rem", fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)" }}>
                        Hazırlayan Memur
                      </th>
                      <th style={{ padding: "0.85rem 1.25rem", fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)" }}>
                        Tarih & Saat
                      </th>
                      <th style={{ padding: "0.85rem 1.25rem", fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)", textAlign: "right" }}>
                        İşlemler
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSaved.map((r) => {
                      const tmpl = REPORT_TEMPLATES.find((t) => t.id === r.formId) || REPORT_TEMPLATES[0];
                      const catInfo = CATEGORIES.find((c) => c.id === tmpl.category) || CATEGORIES[0];
                      return (
                        <tr key={r.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                          <td style={{ padding: "0.9rem 1.25rem", fontSize: "0.85rem", fontWeight: 700, color: "var(--LAC-orange)" }}>
                            #{r.id}
                          </td>
                          <td style={{ padding: "0.9rem 1.25rem", fontSize: "0.9rem", fontWeight: 600, color: "var(--text-primary)" }}>
                            {tmpl.name}
                          </td>
                          <td style={{ padding: "0.9rem 1.25rem" }}>
                            <span
                              style={{
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                color: catInfo.color,
                                backgroundColor: `${catInfo.color}12`,
                                padding: "0.2rem 0.55rem",
                                borderRadius: 4,
                              }}
                            >
                              {tmpl.categoryName}
                            </span>
                          </td>
                          <td style={{ padding: "0.9rem 1.25rem", fontSize: "0.86rem", color: "var(--text-secondary)", fontWeight: 500 }}>
                            {r.officerName || "—"}
                          </td>
                          <td style={{ padding: "0.9rem 1.25rem", fontSize: "0.82rem", color: "var(--text-muted)" }}>
                            {r.timestamp ? new Date(r.timestamp).toLocaleString("tr-TR") : "—"}
                          </td>
                          <td style={{ padding: "0.9rem 1.25rem", textAlign: "right" }}>
                            <div style={{ display: "inline-flex", gap: "0.45rem" }}>
                              <button
                                onClick={() => openSaved(r)}
                                style={{
                                  padding: "0.4rem 0.8rem",
                                  borderRadius: 6,
                                  backgroundColor: "var(--bg-tertiary)",
                                  border: "1px solid var(--border-strong)",
                                  color: "var(--text-primary)",
                                  fontSize: "0.78rem",
                                  fontWeight: 600,
                                  cursor: "pointer",
                                }}
                              >
                                Görüntüle / Düzenle
                              </button>
                              <button
                                onClick={() => handleDelete(r.id)}
                                style={{
                                  padding: "0.4rem 0.7rem",
                                  borderRadius: 6,
                                  backgroundColor: "var(--color-danger-bg)",
                                  border: "1px solid var(--color-danger-border)",
                                  color: "var(--color-danger)",
                                  fontSize: "0.78rem",
                                  fontWeight: 600,
                                  cursor: "pointer",
                                }}
                              >
                                Sil
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

        {/* ════════════════════════════════════════════════════════════════
            VIEW 3: OFFICIAL LAPD DOCUMENT EDITOR
           ════════════════════════════════════════════════════════════════ */}
        {view === "editor" && template && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* Editor Action Bar */}
            <div
              className="no-print"
              style={{
                backgroundColor: "var(--bg-secondary)",
                border: "1px solid var(--border-light)",
                borderRadius: 8,
                padding: "0.9rem 1.25rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "0.75rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                <button
                  onClick={() => setView("home")}
                  style={{
                    padding: "0.45rem 0.85rem",
                    borderRadius: 6,
                    backgroundColor: "var(--bg-tertiary)",
                    border: "1px solid var(--border-light)",
                    color: "var(--text-secondary)",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  <i className="fa-solid fa-arrow-left" style={{ marginRight: 6 }} />
                  Şablonlara Dön
                </button>
                <div>
                  <div style={{ fontSize: "0.98rem", fontWeight: 700, color: "var(--text-primary)" }}>
                    {template.name}{" "}
                    <span style={{ fontSize: "0.82rem", color: "var(--LAC-orange)", fontWeight: 700 }}>
                      (#{reportCode})
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.6rem" }}>
                <button
                  onClick={() => window.print()}
                  style={{
                    padding: "0.55rem 1rem",
                    borderRadius: 6,
                    backgroundColor: "var(--bg-tertiary)",
                    border: "1px solid var(--border-strong)",
                    color: "var(--text-primary)",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.45rem",
                  }}
                >
                  <i className="fa-solid fa-print" />
                  Yazdır / PDF
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    padding: "0.55rem 1.25rem",
                    borderRadius: 6,
                    backgroundColor: "var(--LAC-orange)",
                    border: "none",
                    color: "#ffffff",
                    fontSize: "0.84rem",
                    fontWeight: 600,
                    cursor: saving ? "not-allowed" : "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.45rem",
                  }}
                >
                  <i className="fa-solid fa-floppy-disk" />
                  {saving ? "Kaydediliyor..." : "Raporu Kaydet"}
                </button>
              </div>
            </div>

            {/* Official LAPD Document Sheet */}
            <div
              className="print-doc"
              style={{
                backgroundColor: "var(--bg-secondary)",
                border: "1px solid var(--border-light)",
                borderTop: "4px solid #041632",
                borderRadius: 8,
                padding: "2rem 2.25rem",
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
              }}
            >
              {/* Official Document Header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingBottom: "1.25rem",
                  borderBottom: "2px solid var(--border-light)",
                  flexWrap: "wrap",
                  gap: "1rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <img src="/logom.png" alt="LAPD" style={{ width: 54, height: 54, objectFit: "contain" }} />
                  <div>
                    <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em" }}>
                      CITY OF LOS ANGELES • RESMİ EMNİYET TUTANAĞI
                    </div>
                    <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text-primary)", marginTop: 2 }}>
                      {template.name}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-secondary)" }}>
                    FORM KODU: LAPD-{template.code}
                  </div>
                  <div
                    style={{
                      marginTop: 4,
                      display: "inline-block",
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      color: "var(--LAC-orange)",
                      backgroundColor: "var(--bg-tertiary)",
                      border: "1px solid var(--border-light)",
                      padding: "0.2rem 0.6rem",
                      borderRadius: 4,
                    }}
                  >
                    KAYIT NO: #{reportCode}
                  </div>
                </div>
              </div>

              {/* Form Sections */}
              {template.sections.map((sec: any, si: number) => (
                <div
                  key={si}
                  style={{
                    border: "1px solid var(--border-light)",
                    borderRadius: 8,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      padding: "0.75rem 1.15rem",
                      backgroundColor: "var(--bg-tertiary)",
                      borderBottom: "1px solid var(--border-light)",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.6rem",
                    }}
                  >
                    <span
                      style={{
                        backgroundColor: "#041632",
                        color: "#ffffff",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        padding: "0.15rem 0.5rem",
                        borderRadius: 4,
                      }}
                    >
                      BÖLÜM {si + 1}
                    </span>
                    <span style={{ fontSize: "0.92rem", fontWeight: 700, color: "var(--text-primary)" }}>
                      {sec.title}
                    </span>
                  </div>

                  <div
                    style={{
                      padding: "1.25rem",
                      display: "grid",
                      gridTemplateColumns: "repeat(12, 1fr)",
                      gap: "1rem",
                    }}
                  >
                    {sec.fields.map((f: any) => (
                      <div key={f.id} style={{ gridColumn: `span ${f.width || 12}` }}>
                        <label
                          style={{
                            display: "block",
                            fontSize: "0.82rem",
                            fontWeight: 600,
                            color: "var(--text-secondary)",
                            marginBottom: "0.4rem",
                          }}
                        >
                          {f.label}
                        </label>
                        {f.type === "textarea" ? (
                          <textarea
                            className="rp-field"
                            value={formData[f.id] || ""}
                            onChange={(e) => setFormData({ ...formData, [f.id]: e.target.value })}
                            placeholder={f.placeholder}
                            rows={f.rows || 4}
                            style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }}
                          />
                        ) : f.type === "select" ? (
                          <select
                            className="rp-field"
                            value={formData[f.id] || ""}
                            onChange={(e) => setFormData({ ...formData, [f.id]: e.target.value })}
                            style={inputStyle}
                          >
                            <option value="">Seçiniz...</option>
                            {f.options?.map((opt: string, i: number) => (
                              <option key={i} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            className="rp-field"
                            type={f.type}
                            value={formData[f.id] || ""}
                            onChange={(e) => setFormData({ ...formData, [f.id]: e.target.value })}
                            placeholder={f.placeholder}
                            style={inputStyle}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Evidence Attachments */}
              <div
                style={{
                  border: "1px solid var(--border-light)",
                  borderRadius: 8,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "0.75rem 1.15rem",
                    backgroundColor: "var(--bg-tertiary)",
                    borderBottom: "1px solid var(--border-light)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-primary)" }}>
                    <i className="fa-solid fa-camera" style={{ color: "var(--LAC-orange)", marginRight: 8 }} />
                    Görsel Delil ve Belge Ekleri
                  </span>
                  <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 600 }}>
                    {formData.evidenceUrl ? formData.evidenceUrl.split(",").filter(Boolean).length : 0} / 5 Görsel
                  </span>
                </div>

                <div style={{ padding: "1.25rem" }}>
                  <label
                    className="no-print"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.55rem 1rem",
                      borderRadius: 6,
                      backgroundColor: "var(--bg-primary)",
                      border: "1px solid var(--border-strong)",
                      color: "var(--text-primary)",
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    <i className={uploadingImg ? "fa-solid fa-spinner fa-spin" : "fa-solid fa-upload"} />
                    {uploadingImg ? "Görsel Yükleniyor..." : "Delil Görseli Yükle"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: "none" }}
                      disabled={
                        uploadingImg ||
                        (formData.evidenceUrl ? formData.evidenceUrl.split(",").filter(Boolean).length >= 5 : false)
                      }
                    />
                  </label>

                  {formData.evidenceUrl && (
                    <div style={{ display: "flex", gap: "0.85rem", flexWrap: "wrap", marginTop: "1rem" }}>
                      {formData.evidenceUrl
                        .split(",")
                        .filter(Boolean)
                        .map((url: string, i: number) => (
                          <div
                            key={i}
                            style={{
                              width: 150,
                              borderRadius: 6,
                              border: "1px solid var(--border-light)",
                              backgroundColor: "var(--bg-primary)",
                              overflow: "hidden",
                              position: "relative",
                            }}
                          >
                            <img
                              src={url}
                              alt={`Delil ${i + 1}`}
                              style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", display: "block" }}
                            />
                            <button
                              type="button"
                              className="no-print"
                              onClick={() => {
                                const newUrls = formData.evidenceUrl
                                  .split(",")
                                  .filter((_: any, idx: number) => idx !== i)
                                  .join(",");
                                setFormData((prev) => ({ ...prev, evidenceUrl: newUrls }));
                              }}
                              style={{
                                position: "absolute",
                                top: 6,
                                right: 6,
                                width: 24,
                                height: 24,
                                borderRadius: "50%",
                                backgroundColor: "rgba(15,23,42,0.85)",
                                color: "#ffffff",
                                border: "none",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "0.75rem",
                              }}
                            >
                              <i className="fa-solid fa-xmark" />
                            </button>
                            <div style={{ padding: "0.35rem 0.5rem", fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                              Delil #{i + 1}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Signature Footer */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingTop: "1.25rem",
                  borderTop: "2px solid var(--border-light)",
                  flexWrap: "wrap",
                  gap: "1rem",
                }}
              >
                <div>
                  <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)" }}>
                    TUTANAĞI DÜZENLEYEN PERSONEL
                  </div>
                  <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)", marginTop: 2 }}>
                    {user ? `${user.rank} ${user.name}` : "—"} (Rozet #{user?.badge || "—"})
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)" }}>
                    ONAY & ZAMAN DAMGASI
                  </div>
                  <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#041632", marginTop: 2 }}>
                    ELEKTRONİK İMZALI • {new Date().toLocaleString("tr-TR")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
