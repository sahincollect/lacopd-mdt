"use client";

import { useState, useEffect, useMemo } from 'react';
import toast from "react-hot-toast";

interface MailItem {
  id: number;
  senderId: number;
  receiverId: number | null;
  content: string;
  createdAt: string;
  isRead: boolean;
  sender: {
    id: number;
    name: string;
    rank: string;
    badge: string;
    profileImage?: string;
  };
  receiver?: {
    id: number;
    name: string;
    rank: string;
    badge: string;
    profileImage?: string;
  };
}

// Helper to parse subject, body, priority from raw content or JSON string
function parseMailContent(raw: string) {
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && parsed.subject !== undefined) {
      return {
        subject: parsed.subject || '(Konusuz Posta)',
        body: parsed.body || '',
        priority: (parsed.priority || 'normal') as 'normal' | 'urgent' | 'secret'
      };
    }
  } catch (e) {}

  // Fallback for older messages
  const lines = raw.split('\n');
  if (lines[0]?.startsWith('KONU: ')) {
    return {
      subject: lines[0].replace('KONU: ', '').trim(),
      body: lines.slice(1).join('\n').trim(),
      priority: 'normal' as const
    };
  }
  return {
    subject: raw.length > 45 ? raw.slice(0, 45) + '...' : raw || '(Konusuz İleti)',
    body: raw,
    priority: 'normal' as const
  };
}

export default function MailBoxPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeFolder, setActiveFolder] = useState<'inbox' | 'sent' | 'broadcast' | 'compose'>('inbox');
  const [mails, setMails] = useState<MailItem[]>([]);
  const [selectedMail, setSelectedMail] = useState<MailItem | null>(null);
  const [allOfficers, setAllOfficers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<'all' | 'urgent_secret' | 'normal'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'unread' | 'read'>('all');

  // Bulk Selection Checkboxes
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [batchActionLoading, setBatchActionLoading] = useState(false);

  // Compose State
  const [targetMode, setTargetMode] = useState<'single' | 'department' | 'rank' | 'broadcast'>('single');
  const [composeTo, setComposeTo] = useState<string>('');
  const [composeDept, setComposeDept] = useState<string>('SWAT');
  const [composeRank, setComposeRank] = useState<string>('Sergeant I');
  const [composeSubject, setComposeSubject] = useState<string>('');
  const [composeBody, setComposeBody] = useState<string>('');
  const [composePriority, setComposePriority] = useState<'normal' | 'urgent' | 'secret'>('normal');
  const [submitting, setSubmitting] = useState(false);

  // Load current user and all officers
  useEffect(() => {
    fetch('/api/auth/me').then(res => res.json()).then(data => {
      if (data.user) setCurrentUser(data.user);
    });
    fetch('/api/officers').then(res => res.json()).then(data => {
      if (data.officers) setAllOfficers(data.officers);
    });
  }, []);

  const loadMails = (signal?: AbortSignal, showLoading = true) => {
    if (showLoading) setLoading(true);
    fetch(`/api/messages?folder=${activeFolder}`, { signal })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setMails(data);
          // If we had a selected mail, update its data or select the first unread
          if (selectedMail) {
            const updated = data.find(m => m.id === selectedMail.id);
            if (updated) setSelectedMail(updated);
          }
        }
        if (showLoading) setLoading(false);
      })
      .catch(() => {
        if (showLoading) setLoading(false);
      });
  };

  useEffect(() => {
    if (activeFolder === 'compose') {
      setSelectedIds([]);
      return;
    }
    const controller = new AbortController();
    setSelectedMail(null);
    setSelectedIds([]);
    loadMails(controller.signal, true);

    const interval = setInterval(() => {
      loadMails(controller.signal, false);
    }, 8000);

    return () => { clearInterval(interval); controller.abort(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFolder]);

  // Mark mail as read when clicked
  const handleSelectMailItem = async (mail: MailItem) => {
    setSelectedMail(mail);
    if (!mail.isRead && activeFolder === 'inbox' && mail.receiverId === currentUser?.id) {
      try {
        await fetch('/api/messages', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: mail.id })
        });
        setMails(prev => prev.map(m => m.id === mail.id ? { ...m, isRead: true } : m));
      } catch (e) {}
    }
  };

  // Filtered & Searched Mails
  const filteredMails = useMemo(() => {
    return mails.filter(m => {
      const parsed = parseMailContent(m.content);
      // Priority filter
      if (filterPriority === 'urgent_secret' && parsed.priority === 'normal') return false;
      if (filterPriority === 'normal' && parsed.priority !== 'normal') return false;
      // Status filter
      if (filterStatus === 'unread' && m.isRead) return false;
      if (filterStatus === 'read' && !m.isRead) return false;
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const sub = parsed.subject.toLowerCase();
        const body = parsed.body.toLowerCase();
        const sender = `${m.sender.name} #${m.sender.badge} ${m.sender.rank}`.toLowerCase();
        const receiver = m.receiver ? `${m.receiver.name} #${m.receiver.badge} ${m.receiver.rank}`.toLowerCase() : 'genel duyuru';
        return sub.includes(q) || body.includes(q) || sender.includes(q) || receiver.includes(q);
      }
      return true;
    });
  }, [mails, filterPriority, filterStatus, searchQuery]);

  // Bulk Selection Handlers
  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredMails.length && filteredMails.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredMails.map(m => m.id));
    }
  };

  const handleToggleSelectId = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(i => i !== id));
    } else {
      setSelectedIds(prev => [...prev, id]);
    }
  };

  const handleBatchMarkAsRead = async () => {
    if (selectedIds.length === 0) return;
    setBatchActionLoading(true);
    let successCount = 0;
    for (const id of selectedIds) {
      try {
        await fetch('/api/messages', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id })
        });
        successCount++;
      } catch (e) {}
    }
    setMails(prev => prev.map(m => selectedIds.includes(m.id) ? { ...m, isRead: true } : m));
    setSelectedIds([]);
    setBatchActionLoading(false);
    toast.success(`${successCount} posta okundu olarak işaretlendi.`);
  };

  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Seçili ${selectedIds.length} postayı silmek istediğinize emin misiniz?`)) return;
    setBatchActionLoading(true);
    let deletedCount = 0;
    for (const id of selectedIds) {
      try {
        const res = await fetch('/api/messages', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id })
        });
        if (res.ok) deletedCount++;
      } catch (e) {}
    }
    setMails(prev => prev.filter(m => !selectedIds.includes(m.id)));
    if (selectedMail && selectedIds.includes(selectedMail.id)) setSelectedMail(null);
    setSelectedIds([]);
    setBatchActionLoading(false);
    toast.success(`${deletedCount} posta kalıcı olarak silindi.`);
  };

  // Quick Operational Templates
  const handleApplyTemplate = (templateType: 'patrol' | 'arrest' | 'directive' | 'shift') => {
    const now = new Date().toLocaleString('tr-TR');
    if (templateType === 'patrol') {
      setComposeSubject(`DEVRİYE GÖREV SONUÇ RAPORU - #${currentUser?.badge || '0000'}`);
      setComposeBody(`## DEVRİYE OPERASYONEL RAPORU
**Tarih / Saat:** ${now}
**Devriye Birimi & Kodu:** ADAM-12 / Standart Devriye
**Görevli Personel:** ${currentUser?.name || ''} (#${currentUser?.badge || ''})

---

### 1. GÖREV SÜRECİ ÖZETİ
- **Başlangıç Konumu / Mıntıka:** Central Division - Mission Row
- **Yapılan İhbar / Müdahale Sayısı:** 0
- **Kesilen Cezai İşlem (Trafik/İdari):** 0

### 2. ÖNEMLİ OLAYLAR & GÖZLEMLER
- (Bu alana devriye esnasında karşılaşılan önemli asayiş olaylarını veya şüpheli durumları maddeler halinde yazın.)

### 3. SONUÇ VE TALEP
- Görev vukuatsız olarak tamamlanmış ve merkez karakola dönüş yapılmıştır. Arz olunur.`);
      toast.success("Devriye Raporu Şablonu uygulandı.");
    } else if (templateType === 'arrest') {
      setComposeSubject(`OLAY YERİ & ŞÜPHELİ GÖZALTI TUTANAĞI - [OLAY KODU]`);
      setComposeBody(`## OLAY YERİ VE GÖZALTI TUTANAĞI
**Tarih / Saat:** ${now}
**Olay Yeri Adresi:** 
**Müdahale Eden Memur:** #${currentUser?.badge || ''} - ${currentUser?.name || ''}

---

### 1. ŞÜPHELİ KİMLİK BİLGİLERİ
- **Adı Soyadı:** 
- **Suçlamalar / Maddeler:** 
- **Gözaltına Alınma Saati:** 

### 2. OLAYIN GELİŞİMİ VE DELİLLER
- (Şüphelinin nasıl tespit edildiği, uyarıların yapılıp yapılmadığı ve ele geçirilen delillerin detayları)

### 3. HUKUKİ PROSEDÜR
- Miranda Hakları şüpheliye net bir şekilde okunmuş ve anladığı teyit edilmiştir. Şüpheli nezarethaneye sevk edilmiştir.`);
      toast.success("Gözaltı Tutanak Şablonu uygulandı.");
    } else if (templateType === 'directive') {
      setComposeSubject(`İDARİ TALİMAT & GÖREVLENDİRME - [BİRİM/PERSONEL ADI]`);
      setComposeBody(`## İDARİ TALİMAT VE GÖREVLENDİRME BİLDİRİMİ
**Yayımlayan Yetkili:** #${currentUser?.badge || ''} - ${currentUser?.name || ''} (${currentUser?.rank || ''})
**Yürürlük Tarihi:** ${now}

---

### TALİMAT İÇERİĞİ VE GEREKÇESİ:
1. Departman operasyonel standartları gereğince aşağıda belirtilen talimatlara eksiksiz uyulması zorunludur.
2. (Talimat maddelerini buraya giriniz)

**NOT:** Bu iletinin alındığı teyit edilecek ve talimatlar derhal yürürlüğe konulacaktır.`);
      toast.success("İdari Talimat Şablonu uygulandı.");
    } else if (templateType === 'shift') {
      setComposeSubject(`HAFTALIK NÖBET & İZİN BİLGİLENDİRMESİ`);
      setComposeBody(`## NÖBET VE MESAİ PLANLAMASI
**Tarih:** ${now}
**İlgili Birim:** ${currentUser?.department || 'Genel Birim'}

Sayın Personel,
Önümüzdeki operasyonel dönem için mesai saatleriniz ve görev dağılımlarınız güncellenmiştir. Lütfen MDT Mesai Sistemi üzerinden vardiya saatlerinizi kontrol ediniz. Mazeret veya izin taleplerinizi en geç 24 saat öncesinden 'İzin Talepleri' modülü üzerinden iletmeniz gerekmektedir.`);
      toast.success("Nöbet/Mesai Şablonu uygulandı.");
    }
  };

  // Send Mail (Single, Department Bulk, Rank Bulk, or Broadcast)
  const handleSendMail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeSubject.trim() || !composeBody.trim()) {
      toast.error("Lütfen konu başlığı ve mesaj içeriğini doldurun.");
      return;
    }

    setSubmitting(true);
    const contentPayload = JSON.stringify({
      subject: composeSubject.trim(),
      body: composeBody.trim(),
      priority: composePriority
    });

    try {
      if (targetMode === 'broadcast') {
        const res = await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ receiverId: null, content: contentPayload })
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Genel duyuru gönderilemedi.');
        }
        toast.success("📢 Genel duyuru tüm departmana başarıyla iletildi!");
      } else if (targetMode === 'single') {
        if (!composeTo) {
          toast.error("Lütfen bir alıcı memur seçin.");
          setSubmitting(false);
          return;
        }
        const res = await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ receiverId: parseInt(composeTo), content: contentPayload })
        });
        if (!res.ok) throw new Error('Posta gönderilemedi.');
        toast.success("Posta başarıyla gönderildi!");
      } else if (targetMode === 'department' || targetMode === 'rank') {
        // Find matching officers
        const targets = allOfficers.filter(o => {
          if (o.id === currentUser?.id) return false; // skip self
          if (targetMode === 'department') return o.department === composeDept;
          if (targetMode === 'rank') return o.rank === composeRank;
          return false;
        });

        if (targets.length === 0) {
          toast.error("Bu kriterde aktif hiçbir alıcı personel bulunamadı.");
          setSubmitting(false);
          return;
        }

        let sentCount = 0;
        for (const target of targets) {
          try {
            await fetch('/api/messages', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ receiverId: target.id, content: contentPayload })
            });
            sentCount++;
          } catch (e) {}
        }
        toast.success(`🏢 Toplu posta ${sentCount} personele başarıyla iletildi!`);
      }

      // Reset & Switch to Sent
      setComposeSubject('');
      setComposeBody('');
      setComposeTo('');
      setActiveFolder('sent');
    } catch (err: any) {
      toast.error(err.message || 'Posta gönderilirken bir hata oluştu.');
    } finally {
      setSubmitting(false);
    }
  };

  // Reply & Forward actions
  const handleReply = (mail: MailItem) => {
    const parsed = parseMailContent(mail.content);
    setTargetMode('single');
    setComposeTo(mail.senderId.toString());
    setComposeSubject(parsed.subject.startsWith('RE: ') ? parsed.subject : `RE: ${parsed.subject}`);
    setComposeBody(`\n\n--- On ${new Date(mail.createdAt).toLocaleString('tr-TR')}, #${mail.sender.badge} ${mail.sender.name} wrote: ---\n> ${parsed.body.replace(/\n/g, '\n> ')}`);
    setComposePriority(parsed.priority);
    setActiveFolder('compose');
  };

  const handleForward = (mail: MailItem) => {
    const parsed = parseMailContent(mail.content);
    setTargetMode('single');
    setComposeTo('');
    setComposeSubject(parsed.subject.startsWith('FWD: ') ? parsed.subject : `FWD: ${parsed.subject}`);
    setComposeBody(`\n\n--- İLETİLEN POSTA (Original From: #${mail.sender.badge} ${mail.sender.name}) ---\n${parsed.body}`);
    setComposePriority(parsed.priority);
    setActiveFolder('compose');
  };

  // Copy Content
  const handleCopyMailBody = (mail: MailItem) => {
    const parsed = parseMailContent(mail.content);
    navigator.clipboard.writeText(`KONU: ${parsed.subject}\n\n${parsed.body}`);
    toast.success("Posta içeriği panoya kopyalandı!");
  };

  // Print Operational Record
  const handlePrintMail = (mail: MailItem) => {
    const parsed = parseMailContent(mail.content);
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>LAC OFFICIAL RECORD - #${mail.id}</title>
          <style>
            body { font-family: 'Courier New', monospace; padding: 40px; color: #000; background: #fff; }
            .header { border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 25px; }
            .title { font-size: 20px; font-weight: bold; margin: 0; }
            .sub { font-size: 12px; color: #444; margin-top: 5px; }
            .meta { margin-bottom: 25px; font-size: 13px; line-height: 1.6; background: #f4f4f4; padding: 15px; border: 1px solid #ccc; }
            .body { font-size: 14px; line-height: 1.6; white-space: pre-wrap; font-family: Arial, sans-serif; }
            .footer { margin-top: 50px; border-top: 1px dashed #666; padding-top: 15px; font-size: 11px; color: #666; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">LOS ANGELES COMMUNITY — INTERNAL MAIL RECORD</div>
            <div class="sub">OFFICIAL LAW ENFORCEMENT COMMUNICATION TRANSCRIPT</div>
          </div>
          <div class="meta">
            <strong>RECORD ID:</strong> #${mail.id}<br/>
            <strong>DATE & TIME:</strong> ${new Date(mail.createdAt).toLocaleString('tr-TR')}<br/>
            <strong>SENDER:</strong> #${mail.sender.badge} - ${mail.sender.name} (${mail.sender.rank})<br/>
            <strong>RECIPIENT:</strong> ${mail.receiver ? `#${mail.receiver.badge} - ${mail.receiver.name} (${mail.receiver.rank})` : 'GENERAL DEPARTMENT BROADCAST'}<br/>
            <strong>PRIORITY LEVEL:</strong> ${parsed.priority.toUpperCase()}<br/>
            <strong>SUBJECT:</strong> ${parsed.subject}
          </div>
          <div class="body">${parsed.body}</div>
          <div class="footer">
            CONFIDENTIAL LAW ENFORCEMENT RECORD — CITY OF LOS ANGELES COMMUNITY<br/>
            Printed on: ${new Date().toLocaleString('tr-TR')} by Officer #${currentUser?.badge || 'UNKNOWN'}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const isAdmin = currentUser?.role === 'admin';

  // Compute unread badges for tabs
  const unreadCount = useMemo(() => mails.filter(m => !m.isRead && m.receiverId === currentUser?.id).length, [mails, currentUser]);

  // Unique departments and ranks from officer list
  const departmentsList = useMemo(() => Array.from(new Set(allOfficers.map(o => o.department).filter(Boolean))), [allOfficers]);
  const ranksList = useMemo(() => Array.from(new Set(allOfficers.map(o => o.rank).filter(Boolean))), [allOfficers]);

  return (
    <div style={{ padding: '1.75rem', maxWidth: '1650px', margin: '0 auto', minHeight: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column', gap: '1.5rem', boxSizing: 'border-box' }}>
      
      {/* ── TOP OPERATIONAL CONTROL HEADER & STATS BAR ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', backgroundColor: '#0f172a', padding: '1.25rem 1.75rem', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: 'rgba(14, 165, 233, 0.15)', border: '1px solid rgba(14, 165, 233, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
              <i className="fa-solid fa-envelope-open-text" style={{ fontSize: '1.3rem' }}></i>
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 900, color: '#fff', fontFamily: "'Oswald', sans-serif", letterSpacing: '0.04em' }}>
                LAC OPERASYONEL MAIL BOX
              </h1>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.08em' }}>
                KURUMSAL BİRİM İÇİ VE DEPARTMANLAR ARASI HABERLEŞME TERMİNALİ
              </span>
            </div>
          </div>
        </div>

        {/* Quick Action & Refresh Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <button
            onClick={() => loadMails()}
            disabled={loading}
            style={{ padding: '0.6rem 1.1rem', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#e2e8f0', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.15s' }}
            onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
            onMouseOut={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
          >
            <i className={`fa-solid fa-rotate-right ${loading ? 'fa-spin' : ''}`}></i> GÜNCELLE
          </button>

          <button
            onClick={() => {
              setActiveFolder('compose');
              setComposeSubject('');
              setComposeBody('');
              setTargetMode('single');
            }}
            style={{ padding: '0.6rem 1.3rem', borderRadius: '10px', backgroundColor: '#0284c7', border: '1px solid #38bdf8', color: '#fff', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.6rem', boxShadow: '0 4px 15px rgba(2, 132, 199, 0.4)', transition: 'all 0.15s' }}
            onMouseOver={e => e.currentTarget.style.backgroundColor = '#0369a1'}
            onMouseOut={e => e.currentTarget.style.backgroundColor = '#0284c7'}
          >
            <i className="fa-solid fa-plus"></i> YENİ POSTA YAZ
          </button>
        </div>
      </div>

      {/* ── NAVIGATION FOLDERS TABS BAR ── */}
      <div style={{ display: 'flex', gap: '0.6rem', backgroundColor: '#0c1222', padding: '0.5rem', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.06)', overflowX: 'auto' }}>
        {[
          { id: 'inbox', label: '📥 Gelen Kutusu (Inbox)', count: unreadCount, badgeColor: '#ef4444' },
          { id: 'sent', label: '📤 Gönderilenler (Sent)', count: 0 },
          { id: 'broadcast', label: '📢 Genel Duyurular (Broadcasts)', count: 0 },
          { id: 'compose', label: '✍️ Yeni Mail Yaz (Compose)', count: 0 }
        ].map((tab) => {
          const isActive = activeFolder === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveFolder(tab.id as any)}
              style={{
                flex: 1,
                minWidth: '200px',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                border: isActive ? '1px solid #38bdf8' : '1px solid transparent',
                backgroundColor: isActive ? 'rgba(14, 165, 233, 0.2)' : 'transparent',
                color: isActive ? '#fff' : '#94a3b8',
                fontWeight: isActive ? 800 : 600,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.6rem',
                transition: 'all 0.15s',
                whiteSpace: 'nowrap'
              }}
            >
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span style={{ backgroundColor: tab.badgeColor, color: '#fff', fontSize: '0.7rem', fontWeight: 900, padding: '0.12rem 0.55rem', borderRadius: '12px' }}>
                  {tab.count} YENİ
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── BATCH / BULK ACTION FLOATING TOOLBAR ── */}
      <>
        {selectedIds.length > 0 && activeFolder !== 'compose' && (
          <div
           
           
           
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(30, 41, 59, 0.95)', border: '1px solid #38bdf8', padding: '0.75rem 1.5rem', borderRadius: '12px', boxShadow: '0 8px 32px rgba(14, 165, 233, 0.25)', zIndex: 10 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#38bdf8' }}></span>
              <span style={{ fontWeight: 800, color: '#fff', fontSize: '0.95rem' }}>
                {selectedIds.length} öğe seçildi
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={handleBatchMarkAsRead}
                disabled={batchActionLoading}
                style={{ padding: '0.5rem 1rem', borderRadius: '8px', backgroundColor: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#38bdf8', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <i className="fa-solid fa-check-double"></i> Seçilenleri Okundu Yap
              </button>
              <button
                onClick={handleBatchDelete}
                disabled={batchActionLoading}
                style={{ padding: '0.5rem 1rem', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#f87171', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <i className="fa-solid fa-trash-can"></i> Seçilenleri Sil
              </button>
              <button
                onClick={() => setSelectedIds([])}
                style={{ padding: '0.5rem 0.85rem', borderRadius: '8px', backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#cbd5e1', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}
              >
                İptal
              </button>
            </div>
          </div>
        )}
      </>

      {/* ── MAIN CONTENT SECTION ── */}
      {activeFolder === 'compose' ? (
        /* ================= COMPOSE (YENİ POSTA YAZ) FUNCTIONAL SCREEN ================= */
        <div
         
         
          style={{ backgroundColor: '#0f172a', borderRadius: '18px', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '2.25rem', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1.25rem' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900, color: '#fff', fontFamily: "'Oswald', sans-serif" }}>
                ✍️ YENİ OPERASYONEL POSTA OLUŞTUR
              </h2>
              <p style={{ margin: '0.3rem 0 0 0', fontSize: '0.82rem', color: '#94a3b8' }}>
                Göndereceğiniz postalar LAC resmi kayıtlarında şifreli olarak arşivlenir.
              </p>
            </div>

            {/* Quick Operational Templates Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, marginRight: '0.2rem' }}>HAZIR ŞABLON:</span>
              <button
                type="button"
                onClick={() => handleApplyTemplate('patrol')}
                style={{ padding: '0.45rem 0.8rem', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}
              >
                <i className="fa-solid fa-car-on"></i> Devriye Raporu
              </button>
              <button
                type="button"
                onClick={() => handleApplyTemplate('arrest')}
                style={{ padding: '0.45rem 0.8rem', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}
              >
                <i className="fa-solid fa-handcuffs"></i> Gözaltı Tutanak
              </button>
              <button
                type="button"
                onClick={() => handleApplyTemplate('directive')}
                style={{ padding: '0.45rem 0.8rem', borderRadius: '8px', backgroundColor: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)', color: '#fbbf24', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}
              >
                <i className="fa-solid fa-gavel"></i> İdari Talimat
              </button>
              <button
                type="button"
                onClick={() => handleApplyTemplate('shift')}
                style={{ padding: '0.45rem 0.8rem', borderRadius: '8px', backgroundColor: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#38bdf8', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}
              >
                <i className="fa-solid fa-calendar-days"></i> Nöbet & Mesai
              </button>
            </div>
          </div>

          <form onSubmit={handleSendMail} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Target Selection Mode Tabs */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#e2e8f0', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                HEDEF VE ALICI MODU SEÇİN:
              </label>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setTargetMode('single')}
                  style={{ padding: '0.6rem 1.2rem', borderRadius: '10px', border: targetMode === 'single' ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)', backgroundColor: targetMode === 'single' ? 'rgba(14, 165, 233, 0.2)' : 'rgba(0,0,0,0.3)', color: targetMode === 'single' ? '#fff' : '#94a3b8', fontWeight: targetMode === 'single' ? 800 : 600, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <i className="fa-solid fa-user"></i> Tekli Memur Seç
                </button>
                <button
                  type="button"
                  onClick={() => setTargetMode('department')}
                  style={{ padding: '0.6rem 1.2rem', borderRadius: '10px', border: targetMode === 'department' ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)', backgroundColor: targetMode === 'department' ? 'rgba(14, 165, 233, 0.2)' : 'rgba(0,0,0,0.3)', color: targetMode === 'department' ? '#fff' : '#94a3b8', fontWeight: targetMode === 'department' ? 800 : 600, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <i className="fa-solid fa-building-shield"></i> Birim Bazlı Toplu Gönder
                </button>
                <button
                  type="button"
                  onClick={() => setTargetMode('rank')}
                  style={{ padding: '0.6rem 1.2rem', borderRadius: '10px', border: targetMode === 'rank' ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)', backgroundColor: targetMode === 'rank' ? 'rgba(14, 165, 233, 0.2)' : 'rgba(0,0,0,0.3)', color: targetMode === 'rank' ? '#fff' : '#94a3b8', fontWeight: targetMode === 'rank' ? 800 : 600, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <i className="fa-solid fa-medal"></i> Rütbe Bazlı Toplu Gönder
                </button>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => setTargetMode('broadcast')}
                    style={{ padding: '0.6rem 1.2rem', borderRadius: '10px', border: targetMode === 'broadcast' ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.1)', backgroundColor: targetMode === 'broadcast' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(0,0,0,0.3)', color: targetMode === 'broadcast' ? '#fbbf24' : '#94a3b8', fontWeight: targetMode === 'broadcast' ? 800 : 600, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <i className="fa-solid fa-bullhorn"></i> Tüm Departmana Duyuru (Broadcast)
                  </button>
                )}
              </div>
            </div>

            {/* Target Selectors based on Mode */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
              {targetMode === 'single' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                    Alıcı Memur <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    value={composeTo}
                    onChange={(e) => setComposeTo(e.target.value)}
                    style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', backgroundColor: '#080e1a', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
                  >
                    <option value="">-- Alıcı Memur Seçiniz --</option>
                    {allOfficers
                      .filter(o => o.id !== currentUser?.id)
                      .map(o => (
                        <option key={o.id} value={o.id}>
                          #{o.badge} - {o.name} ({o.rank || 'Memur'} • {o.department || 'Genel Birim'})
                        </option>
                      ))}
                  </select>
                </div>
              )}

              {targetMode === 'department' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#38bdf8', marginBottom: '0.4rem' }}>
                    Hedef Departman / Birim <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    value={composeDept}
                    onChange={(e) => setComposeDept(e.target.value)}
                    style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', backgroundColor: '#080e1a', border: '1px solid #38bdf8', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
                  >
                    {departmentsList.map(d => (
                      <option key={d} value={d}>
                        🏢 {d} (Bu birimdeki tüm memurlara ilet)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {targetMode === 'rank' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#38bdf8', marginBottom: '0.4rem' }}>
                    Hedef Rütbe Grubu <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    value={composeRank}
                    onChange={(e) => setComposeRank(e.target.value)}
                    style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', backgroundColor: '#080e1a', border: '1px solid #38bdf8', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
                  >
                    {ranksList.map(r => (
                      <option key={r} value={r}>
                        🎖️ {r} (Bu rütbedeki tüm personele ilet)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {targetMode === 'broadcast' && (
                <div style={{ padding: '0.85rem 1rem', borderRadius: '12px', backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px dashed #f59e0b', color: '#fbbf24', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <i className="fa-solid fa-shield-halved" style={{ fontSize: '1.3rem' }}></i>
                  <span>Bu ileti departmandaki tüm memur ve yöneticilerin Gelen Kutusuna <strong>Genel Departman Duyurusu</strong> olarak yayımlanacaktır.</span>
                </div>
              )}

              {/* Priority Selector */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                  Öncelik & Gizlilik Seviyesi
                </label>
                <div style={{ display: 'flex', gap: '0.6rem' }}>
                  {[
                    { id: 'normal', label: '🟢 Normal', bg: 'rgba(16, 185, 129, 0.15)', border: '#10b981', text: '#34d399' },
                    { id: 'urgent', label: '🟡 Önemli', bg: 'rgba(245, 158, 11, 0.15)', border: '#f59e0b', text: '#fbbf24' },
                    { id: 'secret', label: '🔴 ACİL & GİZLİ', bg: 'rgba(239, 68, 68, 0.2)', border: '#ef4444', text: '#f87171' }
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setComposePriority(p.id as any)}
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        borderRadius: '10px',
                        border: composePriority === p.id ? `2px solid ${p.border}` : '1px solid rgba(255,255,255,0.1)',
                        backgroundColor: composePriority === p.id ? p.bg : 'rgba(0,0,0,0.3)',
                        color: composePriority === p.id ? p.text : '#94a3b8',
                        fontWeight: composePriority === p.id ? 800 : 600,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Subject */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                Posta Konu Başlığı (`Subject`) <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                value={composeSubject}
                onChange={(e) => setComposeSubject(e.target.value)}
                placeholder="Örn: Operasyonel Hazırlık Bildirimi / Devriye Raporu"
                style={{ width: '100%', padding: '0.9rem 1rem', borderRadius: '12px', backgroundColor: '#080e1a', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.95rem', fontWeight: 600, outline: 'none' }}
              />
            </div>

            {/* Body */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                Posta İçeriği & Detaylar (`Body`) <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <textarea
                rows={12}
                value={composeBody}
                onChange={(e) => setComposeBody(e.target.value)}
                placeholder="Kurumsal ileti içeriğini buraya yazın... (Markdown veya maddeler halinde biçimlendirebilirsiniz)"
                style={{ width: '100%', padding: '1rem', borderRadius: '12px', backgroundColor: '#080e1a', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.92rem', lineHeight: '1.6', fontFamily: "'Inter', sans-serif", outline: 'none', resize: 'vertical' }}
              />
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <button
                type="button"
                onClick={() => setActiveFolder('inbox')}
                style={{ padding: '0.85rem 1.75rem', borderRadius: '12px', backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#cbd5e1', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}
              >
                İptal Et
              </button>
              <button
                type="submit"
                disabled={submitting}
                style={{ padding: '0.85rem 2.5rem', borderRadius: '12px', backgroundColor: '#0284c7', border: '1px solid #38bdf8', color: '#fff', fontWeight: 800, fontSize: '0.95rem', cursor: submitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.6rem', boxShadow: '0 4px 20px rgba(2, 132, 199, 0.4)' }}
              >
                {submitting ? (
                  <>
                    <i className="fa-solid fa-circle-notch fa-spin"></i> GÖNDERİLİYOR...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-paper-plane"></i> {targetMode === 'broadcast' || targetMode === 'department' || targetMode === 'rank' ? 'TOPLU POSTAYI GÖNDER' : 'POSTAYI GÖNDER'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* ================= INBOX / SENT / BROADCAST MASTER-DETAIL WORKSPACE ================= */
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(380px, 460px) 1fr', gap: '1.5rem', minHeight: '680px' }}>
          
          {/* ── LEFT FOLDER LIST & OPERATIONAL FILTER PANEL ── */}
          <div style={{ backgroundColor: '#0f172a', borderRadius: '18px', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
            
            {/* Search and Filters Header */}
            <div style={{ padding: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ position: 'relative' }}>
                <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontSize: '0.9rem' }}></i>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Konu, memur adı, sicil veya içerik ara..."
                  style={{ width: '100%', padding: '0.7rem 1rem 0.7rem 2.6rem', borderRadius: '10px', backgroundColor: '#080e1a', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              {/* Functional Filters Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '0.4rem', flex: 1 }}>
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value as any)}
                    style={{ flex: 1, padding: '0.45rem 0.6rem', borderRadius: '8px', backgroundColor: '#080e1a', border: '1px solid rgba(255,255,255,0.1)', color: '#cbd5e1', fontSize: '0.76rem', fontWeight: 600, outline: 'none' }}
                  >
                    <option value="all">Filtre: Tüm Öncelikler</option>
                    <option value="urgent_secret">🔴 Sadece Acil / Önemli</option>
                    <option value="normal">🟢 Standart Postalar</option>
                  </select>

                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    style={{ flex: 1, padding: '0.45rem 0.6rem', borderRadius: '8px', backgroundColor: '#080e1a', border: '1px solid rgba(255,255,255,0.1)', color: '#cbd5e1', fontSize: '0.76rem', fontWeight: 600, outline: 'none' }}
                  >
                    <option value="all">Durum: Tümü</option>
                    <option value="unread">🔵 Okunmamışlar</option>
                    <option value="read">✅ Okunanlar</option>
                  </select>
                </div>

                {/* Select All Checkbox Button */}
                <button
                  type="button"
                  onClick={handleToggleSelectAll}
                  title="Tümünü Seç / Kaldır"
                  style={{ padding: '0.45rem 0.7rem', borderRadius: '8px', backgroundColor: selectedIds.length > 0 ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: selectedIds.length > 0 ? '#38bdf8' : '#cbd5e1', fontSize: '0.76rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  <i className={`fa-${selectedIds.length === filteredMails.length && filteredMails.length > 0 ? 'solid fa-square-check' : 'regular fa-square'}`}></i> Seç
                </button>
              </div>
            </div>

            {/* Mail Rows List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {loading && mails.length === 0 ? (
                <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#64748b' }}>
                  <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: '2rem', marginBottom: '1rem', color: '#38bdf8' }}></i>
                  <div style={{ fontWeight: 700 }}>Postalar senkronize ediliyor...</div>
                </div>
              ) : filteredMails.length === 0 ? (
                <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#64748b' }}>
                  <i className="fa-solid fa-folder-open" style={{ fontSize: '2.5rem', marginBottom: '1rem', opacity: 0.5 }}></i>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Bu klasörde veya arama kriterinizde posta bulunmuyor.</div>
                </div>
              ) : (
                filteredMails.map((mail) => {
                  const parsed = parseMailContent(mail.content);
                  const isSelected = selectedMail?.id === mail.id;
                  const isChecked = selectedIds.includes(mail.id);
                  const isUnread = !mail.isRead && mail.receiverId === currentUser?.id;

                  // Priority styles
                  let priorityColor = '#34d399';
                  let priorityIcon = 'fa-circle-check';
                  if (parsed.priority === 'urgent') {
                    priorityColor = '#fbbf24';
                    priorityIcon = 'fa-circle-exclamation';
                  } else if (parsed.priority === 'secret') {
                    priorityColor = '#ef4444';
                    priorityIcon = 'fa-triangle-exclamation';
                  }

                  return (
                    <div
                      key={mail.id}
                      onClick={() => handleSelectMailItem(mail)}
                      style={{
                        padding: '1rem',
                        borderRadius: '12px',
                        backgroundColor: isSelected ? 'rgba(14, 165, 233, 0.18)' : isUnread ? 'rgba(30, 41, 59, 0.8)' : 'rgba(15, 23, 42, 0.6)',
                        border: isSelected ? '1px solid #38bdf8' : isUnread ? '1px solid rgba(56, 189, 248, 0.35)' : '1px solid rgba(255,255,255,0.06)',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.85rem',
                        position: 'relative'
                      }}
                    >
                      {/* Selection Checkbox */}
                      <div
                        onClick={(e) => handleToggleSelectId(mail.id, e)}
                        style={{ padding: '0.2rem', color: isChecked ? '#38bdf8' : '#64748b', fontSize: '1.1rem', cursor: 'pointer', marginTop: '2px' }}
                      >
                        <i className={`fa-${isChecked ? 'solid fa-square-check' : 'regular fa-square'}`}></i>
                      </div>

                      {/* Avatar */}
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1rem', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
                        {mail.sender.profileImage ? (
                          <img src={mail.sender.profileImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }} />
                        ) : (
                          mail.sender.name.charAt(0)
                        )}
                      </div>

                      {/* Meta info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                          <span style={{ fontWeight: 800, fontSize: '0.85rem', color: isUnread ? '#fff' : '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {activeFolder === 'sent' ? `Alıcı: ${mail.receiver ? `${mail.receiver.name}` : 'TÜM DEPARTMAN'}` : `${mail.sender.name} (#${mail.sender.badge})`}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, flexShrink: 0 }}>
                            {new Date(mail.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <div style={{ fontWeight: isUnread ? 800 : 600, fontSize: '0.88rem', color: isUnread ? '#38bdf8' : '#cbd5e1', marginBottom: '0.3rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {parsed.subject}
                        </div>

                        <div style={{ fontSize: '0.78rem', color: '#94a3b8', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.4' }}>
                          {parsed.body}
                        </div>

                        {/* Priority Badge & Status Indicator */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.6rem' }}>
                          <span style={{ fontSize: '0.68rem', fontWeight: 800, color: priorityColor, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <i className={`fa-solid ${priorityIcon}`}></i>
                            {parsed.priority.toUpperCase()}
                          </span>
                          {isUnread && (
                            <span style={{ fontSize: '0.65rem', fontWeight: 900, backgroundColor: '#38bdf8', color: '#080e1a', padding: '0.1rem 0.45rem', borderRadius: '6px' }}>
                              YENİ
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ── RIGHT FUNCTIONAL READER PANEL (DETAY OKUYUCU) ── */}
          <div style={{ backgroundColor: '#0f172a', borderRadius: '18px', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
            {selectedMail ? (
              (() => {
                const parsed = parseMailContent(selectedMail.content);
                let priorityColor = '#34d399';
                let priorityLabel = 'NORMAL ÖNCELİK';
                if (parsed.priority === 'urgent') {
                  priorityColor = '#fbbf24';
                  priorityLabel = 'ÖNEMLİ OPERASYONEL İLETİ';
                } else if (parsed.priority === 'secret') {
                  priorityColor = '#ef4444';
                  priorityLabel = '🔴 ACİL & GİZLİ OPERASYONEL ALARM';
                }

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    
                    {/* Reader Toolbar Header */}
                    <div style={{ padding: '1.25rem 1.75rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: priorityColor, boxShadow: `0 0 10px ${priorityColor}` }} />
                        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: priorityColor, letterSpacing: '0.06em' }}>
                          {priorityLabel}
                        </span>
                      </div>

                      {/* Operational Quick Buttons */}
                      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => handleReply(selectedMail)}
                          style={{ padding: '0.5rem 0.95rem', borderRadius: '8px', backgroundColor: 'rgba(14, 165, 233, 0.15)', border: '1px solid rgba(14, 165, 233, 0.35)', color: '#38bdf8', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                        >
                          <i className="fa-solid fa-reply"></i> YANITLA
                        </button>
                        <button
                          onClick={() => handleForward(selectedMail)}
                          style={{ padding: '0.5rem 0.95rem', borderRadius: '8px', backgroundColor: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.25)', color: '#7dd3fc', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                        >
                          <i className="fa-solid fa-share"></i> İLET
                        </button>
                        <button
                          onClick={() => handleCopyMailBody(selectedMail)}
                          style={{ padding: '0.5rem 0.95rem', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: '#e2e8f0', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                          title="İçeriği Kopyala"
                        >
                          <i className="fa-solid fa-copy"></i>
                        </button>
                        <button
                          onClick={() => handlePrintMail(selectedMail)}
                          style={{ padding: '0.5rem 0.95rem', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: '#e2e8f0', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                          title="Yazdır / Tutanak Çıktısı"
                        >
                          <i className="fa-solid fa-print"></i>
                        </button>
                      </div>
                    </div>

                    {/* Reader Scrollable Content */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
                      
                      {/* Subject Heading */}
                      <h1 style={{ margin: '0 0 1.5rem 0', fontSize: '1.75rem', fontWeight: 900, color: '#fff', fontFamily: "'Oswald', sans-serif", letterSpacing: '0.03em', lineHeight: '1.3' }}>
                        {parsed.subject}
                      </h1>

                      {/* Sender & Recipient Information Card */}
                      <div style={{ padding: '1.25rem', borderRadius: '14px', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(14, 165, 233, 0.15)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.3rem', border: '1px solid rgba(14, 165, 233, 0.3)' }}>
                            {selectedMail.sender.profileImage ? (
                              <img src={selectedMail.sender.profileImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} />
                            ) : (
                              selectedMail.sender.name.charAt(0)
                            )}
                          </div>
                          <div>
                            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>
                              {selectedMail.sender.name} <span style={{ color: '#38bdf8' }}>#{selectedMail.sender.badge}</span>
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>
                              Gönderen Rütbe: {selectedMail.sender.rank || 'Memur'}
                            </div>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                            ALICI / HEDEF:
                          </div>
                          <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#e2e8f0', marginTop: '2px' }}>
                            {selectedMail.receiver ? (
                              `${selectedMail.receiver.name} (#${selectedMail.receiver.badge})`
                            ) : (
                              <span style={{ color: '#fbbf24' }}>📢 TÜM DEPARTMAN GENEL DUYURUSU</span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                            Tarih: {new Date(selectedMail.createdAt).toLocaleString('tr-TR')}
                          </div>
                        </div>
                      </div>

                      {/* Message Body Content Box */}
                      <div style={{ padding: '1.75rem', borderRadius: '14px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', fontSize: '0.98rem', lineHeight: '1.8', color: 'var(--bg-tertiary)', whiteSpace: 'pre-wrap', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", wordBreak: 'break-word' }}>
                        {parsed.body}
                      </div>
                    </div>
                  </div>
                );
              })()
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '24px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                  <i className="fa-solid fa-envelope-open-text" style={{ fontSize: '2.5rem', opacity: 0.4, color: '#38bdf8' }}></i>
                </div>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.3rem', fontWeight: 800, color: '#cbd5e1', fontFamily: "'Oswald', sans-serif" }}>
                  OKUMAK İÇİN BİR POSTA SEÇİN
                </h3>
                <p style={{ margin: 0, fontSize: '0.88rem', maxWidth: '380px' }}>
                  Sol listedeki postaların üzerine tıklayarak tüm operasyonel detayları, ekleri ve hızlı işlem araçlarını görüntüleyebilirsiniz.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
