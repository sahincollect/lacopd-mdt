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
  }, [activeFolder]);

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

  const filteredMails = useMemo(() => {
    return mails.filter(m => {
      const parsed = parseMailContent(m.content);
      if (filterPriority === 'urgent_secret' && parsed.priority === 'normal') return false;
      if (filterPriority === 'normal' && parsed.priority !== 'normal') return false;
      if (filterStatus === 'unread' && m.isRead) return false;
      if (filterStatus === 'read' && !m.isRead) return false;
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

  const handleApplyTemplate = (templateType: 'patrol' | 'arrest' | 'directive' | 'shift') => {
    const now = new Date().toLocaleString('tr-TR');
    if (templateType === 'patrol') {
      setComposeSubject(`DEVRİYE GÖREV SONUÇ RAPORU - #${currentUser?.badge || '0000'}`);
      setComposeBody(`## DEVRİYE OPERASYONEL RAPORU\n**Tarih / Saat:** ${now}\n**Devriye Birimi & Kodu:** ADAM-12 / Standart Devriye\n**Görevli Personel:** ${currentUser?.name || ''} (#${currentUser?.badge || ''})\n\n---\n\n### 1. GÖREV SÜRECİ ÖZETİ\n- **Başlangıç Konumu / Mıntıka:** Central Division - Mission Row\n- **Yapılan İhbar / Müdahale Sayısı:** 0\n- **Kesilen Cezai İşlem (Trafik/İdari):** 0\n\n### 2. ÖNEMLİ OLAYLAR & GÖZLEMLER\n- (Bu alana devriye esnasında karşılaşılan önemli asayiş olaylarını veya şüpheli durumları maddeler halinde yazın.)\n\n### 3. SONUÇ VE TALEP\n- Görev vukuatsız olarak tamamlanmış ve merkez karakola dönüş yapılmıştır. Arz olunur.`);
      toast.success("Devriye Raporu Şablonu uygulandı.");
    } else if (templateType === 'arrest') {
      setComposeSubject(`OLAY YERİ & ŞÜPHELİ GÖZALTI TUTANAĞI - [OLAY KODU]`);
      setComposeBody(`## OLAY YERİ VE GÖZALTI TUTANAĞI\n**Tarih / Saat:** ${now}\n**Olay Yeri Adresi:** \n**Müdahale Eden Memur:** #${currentUser?.badge || ''} - ${currentUser?.name || ''}\n\n---\n\n### 1. ŞÜPHELİ KİMLİK BİLGİLERİ\n- **Adı Soyadı:** \n- **Suçlamalar / Maddeler:** \n- **Gözaltına Alınma Saati:** \n\n### 2. OLAYIN GELİŞİMİ VE DELİLLER\n- (Şüphelinin nasıl tespit edildiği, uyarıların yapılıp yapılmadığı ve ele geçirilen delillerin detayları)\n\n### 3. HUKUKİ PROSEDÜR\n- Miranda Hakları şüpheliye net bir şekilde okunmuş ve anladığı teyit edilmiştir. Şüpheli nezarethaneye sevk edilmiştir.`);
      toast.success("Gözaltı Tutanak Şablonu uygulandı.");
    } else if (templateType === 'directive') {
      setComposeSubject(`İDARİ TALİMAT & GÖREVLENDİRME - [BİRİM/PERSONEL ADI]`);
      setComposeBody(`## İDARİ TALİMAT VE GÖREVLENDİRME BİLDİRİMİ\n**Yayımlayan Yetkili:** #${currentUser?.badge || ''} - ${currentUser?.name || ''} (${currentUser?.rank || ''})\n**Yürürlük Tarihi:** ${now}\n\n---\n\n### TALİMAT İÇERİĞİ VE GEREKÇESİ:\n1. Departman operasyonel standartları gereğince aşağıda belirtilen talimatlara eksiksiz uyulması zorunludur.\n2. (Talimat maddelerini buraya giriniz)\n\n**NOT:** Bu iletinin alındığı teyit edilecek ve talimatlar derhal yürürlüğe konulacaktır.`);
      toast.success("İdari Talimat Şablonu uygulandı.");
    } else if (templateType === 'shift') {
      setComposeSubject(`HAFTALIK NÖBET & İZİN BİLGİLENDİRMESİ`);
      setComposeBody(`## NÖBET VE MESAİ PLANLAMASI\n**Tarih:** ${now}\n**İlgili Birim:** ${currentUser?.department || 'Genel Birim'}\n\nSayın Personel,\nÖnümüzdeki operasyonel dönem için mesai saatleriniz ve görev dağılımlarınız güncellenmiştir. Lütfen MDT Mesai Sistemi üzerinden vardiya saatlerinizi kontrol ediniz. Mazeret veya izin taleplerinizi en geç 24 saat öncesinden 'İzin Talepleri' modülü üzerinden iletmeniz gerekmektedir.`);
      toast.success("Nöbet/Mesai Şablonu uygulandı.");
    }
  };

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
        const targets = allOfficers.filter(o => {
          if (o.id === currentUser?.id) return false;
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

  const handleCopyMailBody = (mail: MailItem) => {
    const parsed = parseMailContent(mail.content);
    navigator.clipboard.writeText(`KONU: ${parsed.subject}\n\n${parsed.body}`);
    toast.success("Posta içeriği panoya kopyalandı!");
  };

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
            <div class="title">LOS ANGELES POLICE DEPARTMENT — INTERNAL MAIL RECORD</div>
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
            CONFIDENTIAL LAW ENFORCEMENT RECORD — CITY OF LOS ANGELES<br/>
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
  const unreadCount = useMemo(() => mails.filter(m => !m.isRead && m.receiverId === currentUser?.id).length, [mails, currentUser]);
  const departmentsList = useMemo(() => Array.from(new Set(allOfficers.map(o => o.department).filter(Boolean))), [allOfficers]);
  const ranksList = useMemo(() => Array.from(new Set(allOfficers.map(o => o.rank).filter(Boolean))), [allOfficers]);

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "0.85rem 1rem", background: 'var(--mdt-bg-main)', border: "1px solid var(--mdt-border)",
    borderRadius: '6px', color: 'var(--mdt-text-primary)', fontSize: "0.85rem", outline: "none", boxSizing: "border-box",
    transition: "border-color 0.15s, box-shadow 0.15s"
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", display: "flex", flexDirection: "column", gap: "2rem" }}>
      
      {/* ── HEADER ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderBottom: "1px solid var(--mdt-border)", paddingBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--mdt-text-muted)', margin: '0 0 0.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            L.A.C.P.D. · İÇ HABERLEŞME
            <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "var(--mdt-text-muted)" }} />
            <span style={{ color: "var(--mdt-accent)" }}>SECURE COMMS</span>
          </p>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 900, color: "var(--mdt-text-primary)", margin: 0, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
            Mesaj & Duyuru Sistemi
          </h1>
          <p style={{ color: 'var(--mdt-text-muted)', fontSize: '0.82rem', marginTop: '0.35rem', fontWeight: 400 }}>
            Operasyonel Mesajlaşma ve Departman Duyuruları.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <button onClick={() => loadMails()} disabled={loading} style={{ padding: '0.75rem 1.25rem', borderRadius: '6px', backgroundColor: 'var(--mdt-card-bg)', border: '1px solid var(--mdt-border)', color: 'var(--mdt-text-secondary)', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.15s' }}
            onMouseOver={e => { (e.currentTarget as HTMLElement).style.color = 'var(--mdt-text-primary)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--mdt-text-primary)'; }}
            onMouseOut={e => { (e.currentTarget as HTMLElement).style.color = 'var(--mdt-text-secondary)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--mdt-border)'; }}>
            <i className={`fa-solid fa-rotate-right ${loading ? 'fa-spin' : ''}`}></i> YENİLE
          </button>

          <button onClick={() => { setActiveFolder('compose'); setComposeSubject(''); setComposeBody(''); setTargetMode('single'); }} style={{ padding: '0.75rem 1.25rem', borderRadius: '6px', backgroundColor: 'var(--mdt-accent)', border: '1px solid var(--mdt-accent)', color: '#111', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.15s' }}
            onMouseOver={e => (e.currentTarget as HTMLElement).style.opacity = '0.85'}
            onMouseOut={e => (e.currentTarget as HTMLElement).style.opacity = '1'}>
            <i className="fa-solid fa-plus"></i> YENİ POSTA
          </button>
        </div>
      </div>

      {/* ── TABS ── */}
      <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: 'var(--mdt-card-bg)', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--mdt-border)', overflowX: 'auto', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
        {[
          { id: 'inbox', label: '📥 Gelen Kutusu', count: unreadCount, badgeColor: 'var(--mdt-danger)' },
          { id: 'sent', label: '📤 Gönderilenler', count: 0 },
          { id: 'broadcast', label: '📢 Genel Duyurular', count: 0 },
          { id: 'compose', label: '✍️ Yeni Mesaj', count: 0 }
        ].map((tab) => {
          const isActive = activeFolder === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveFolder(tab.id as any)} style={{ flex: 1, minWidth: '150px', padding: '0.75rem 1rem', borderRadius: '6px', border: isActive ? '1px solid var(--mdt-border)' : '1px solid transparent', backgroundColor: isActive ? 'var(--mdt-bg-main)' : 'transparent', color: isActive ? 'var(--mdt-text-primary)' : 'var(--mdt-text-secondary)', fontWeight: isActive ? 800 : 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', transition: 'all 0.15s', whiteSpace: 'nowrap' }}
              onMouseOver={e => !isActive && ((e.currentTarget as HTMLElement).style.color = 'var(--mdt-text-primary)')}
              onMouseOut={e => !isActive && ((e.currentTarget as HTMLElement).style.color = 'var(--mdt-text-secondary)')}>
              <span>{tab.label}</span>
              {tab.count > 0 && <span style={{ backgroundColor: tab.badgeColor, color: '#fff', fontSize: '0.65rem', fontWeight: 900, padding: '0.15rem 0.5rem', borderRadius: '4px', letterSpacing: '0.05em' }}>{tab.count} YENİ</span>}
            </button>
          );
        })}
      </div>

      {/* ── BATCH ACTION TOOLBAR ── */}
      {selectedIds.length > 0 && activeFolder !== 'compose' && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--mdt-bg-main)', border: '1px solid var(--mdt-accent)', padding: '1rem 1.5rem', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <span style={{ fontWeight: 800, color: 'var(--mdt-accent)', fontSize: '0.9rem' }}>{selectedIds.length} öğe seçildi</span>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={handleBatchMarkAsRead} disabled={batchActionLoading} style={{ padding: '0.6rem 1.25rem', borderRadius: '6px', backgroundColor: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: 'var(--mdt-success)', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.15s' }}
              onMouseOver={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(34,197,94,0.2)'; }}
              onMouseOut={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(34,197,94,0.1)'; }}>Okundu İşaretle</button>
            <button onClick={handleBatchDelete} disabled={batchActionLoading} style={{ padding: '0.6rem 1.25rem', borderRadius: '6px', backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--mdt-danger)', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.15s' }}
              onMouseOver={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.2)'; }}
              onMouseOut={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)'; }}>Sil</button>
            <button onClick={() => setSelectedIds([])} style={{ padding: '0.6rem 1.25rem', borderRadius: '6px', backgroundColor: 'transparent', border: '1px solid var(--mdt-border)', color: 'var(--mdt-text-secondary)', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.15s' }}
              onMouseOver={e => { (e.currentTarget as HTMLElement).style.color = 'var(--mdt-text-primary)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--mdt-text-primary)'; }}
              onMouseOut={e => { (e.currentTarget as HTMLElement).style.color = 'var(--mdt-text-secondary)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--mdt-border)'; }}>İptal</button>
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      {activeFolder === 'compose' ? (
        <div style={{ backgroundColor: 'var(--mdt-card-bg)', borderRadius: '10px', border: '1px solid var(--mdt-border)', padding: '2rem' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid var(--mdt-border)', paddingBottom: '1.25rem', flexWrap: "wrap", gap: "1rem" }}>
            <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: 'var(--mdt-text-primary)', textTransform: 'uppercase', letterSpacing: '0.02em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className="fa-solid fa-pen-to-square" style={{ color: 'var(--mdt-accent)' }} /> Yeni Operasyonel Posta
            </h2>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--mdt-text-muted)', fontWeight: 700, letterSpacing: '0.1em' }}>HIZLI ŞABLON:</span>
              <button type="button" onClick={() => handleApplyTemplate('patrol')} style={{ padding: '0.5rem 0.8rem', borderRadius: '6px', backgroundColor: 'var(--mdt-bg-main)', border: '1px solid var(--mdt-border)', color: 'var(--mdt-text-secondary)', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', transition: 'all 0.15s' }}
                onMouseOver={e => { (e.currentTarget as HTMLElement).style.color = 'var(--mdt-text-primary)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--mdt-text-primary)'; }}
                onMouseOut={e => { (e.currentTarget as HTMLElement).style.color = 'var(--mdt-text-secondary)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--mdt-border)'; }}>Devriye</button>
              <button type="button" onClick={() => handleApplyTemplate('arrest')} style={{ padding: '0.5rem 0.8rem', borderRadius: '6px', backgroundColor: 'var(--mdt-bg-main)', border: '1px solid var(--mdt-border)', color: 'var(--mdt-text-secondary)', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', transition: 'all 0.15s' }}
                onMouseOver={e => { (e.currentTarget as HTMLElement).style.color = 'var(--mdt-text-primary)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--mdt-text-primary)'; }}
                onMouseOut={e => { (e.currentTarget as HTMLElement).style.color = 'var(--mdt-text-secondary)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--mdt-border)'; }}>Tutanak</button>
              <button type="button" onClick={() => handleApplyTemplate('directive')} style={{ padding: '0.5rem 0.8rem', borderRadius: '6px', backgroundColor: 'var(--mdt-bg-main)', border: '1px solid var(--mdt-border)', color: 'var(--mdt-text-secondary)', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', transition: 'all 0.15s' }}
                onMouseOver={e => { (e.currentTarget as HTMLElement).style.color = 'var(--mdt-text-primary)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--mdt-text-primary)'; }}
                onMouseOut={e => { (e.currentTarget as HTMLElement).style.color = 'var(--mdt-text-secondary)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--mdt-border)'; }}>Talimat</button>
              <button type="button" onClick={() => handleApplyTemplate('shift')} style={{ padding: '0.5rem 0.8rem', borderRadius: '6px', backgroundColor: 'var(--mdt-bg-main)', border: '1px solid var(--mdt-border)', color: 'var(--mdt-text-secondary)', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', transition: 'all 0.15s' }}
                onMouseOver={e => { (e.currentTarget as HTMLElement).style.color = 'var(--mdt-text-primary)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--mdt-text-primary)'; }}
                onMouseOut={e => { (e.currentTarget as HTMLElement).style.color = 'var(--mdt-text-secondary)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--mdt-border)'; }}>Mesai</button>
            </div>
          </div>

          <form onSubmit={handleSendMail} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--mdt-text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>HEDEF SEÇİMİ:</label>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: "1rem" }}>
                <button type="button" onClick={() => setTargetMode('single')} style={{ padding: '0.6rem 1.2rem', borderRadius: '6px', border: targetMode === 'single' ? '1px solid var(--mdt-accent)' : '1px solid var(--mdt-border)', backgroundColor: targetMode === 'single' ? 'color-mix(in srgb, var(--mdt-accent) 10%, transparent)' : 'var(--mdt-bg-main)', color: targetMode === 'single' ? 'var(--mdt-accent)' : 'var(--mdt-text-secondary)', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.15s' }}>Tekli Memur</button>
                <button type="button" onClick={() => setTargetMode('department')} style={{ padding: '0.6rem 1.2rem', borderRadius: '6px', border: targetMode === 'department' ? '1px solid var(--mdt-accent)' : '1px solid var(--mdt-border)', backgroundColor: targetMode === 'department' ? 'color-mix(in srgb, var(--mdt-accent) 10%, transparent)' : 'var(--mdt-bg-main)', color: targetMode === 'department' ? 'var(--mdt-accent)' : 'var(--mdt-text-secondary)', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.15s' }}>Birim Bazlı</button>
                <button type="button" onClick={() => setTargetMode('rank')} style={{ padding: '0.6rem 1.2rem', borderRadius: '6px', border: targetMode === 'rank' ? '1px solid var(--mdt-accent)' : '1px solid var(--mdt-border)', backgroundColor: targetMode === 'rank' ? 'color-mix(in srgb, var(--mdt-accent) 10%, transparent)' : 'var(--mdt-bg-main)', color: targetMode === 'rank' ? 'var(--mdt-accent)' : 'var(--mdt-text-secondary)', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.15s' }}>Rütbe Bazlı</button>
                {isAdmin && <button type="button" onClick={() => setTargetMode('broadcast')} style={{ padding: '0.6rem 1.2rem', borderRadius: '6px', border: targetMode === 'broadcast' ? '1px solid var(--mdt-warning)' : '1px solid var(--mdt-border)', backgroundColor: targetMode === 'broadcast' ? 'rgba(245,158,11,0.1)' : 'var(--mdt-bg-main)', color: targetMode === 'broadcast' ? 'var(--mdt-warning)' : 'var(--mdt-text-secondary)', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.15s' }}>Tüm Departman (Broadcast)</button>}
              </div>

              {targetMode === 'single' && (
                <select value={composeTo} onChange={(e) => setComposeTo(e.target.value)} style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = 'var(--mdt-accent)'; e.target.style.boxShadow = '0 0 0 3px var(--mdt-accent-alpha)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--mdt-border)'; e.target.style.boxShadow = 'none'; }}>
                  <option value="">-- Alıcı Memur Seçiniz --</option>
                  {allOfficers.filter(o => o.id !== currentUser?.id).map(o => (
                    <option key={o.id} value={o.id}>#{o.badge} - {o.name} ({o.rank || 'Memur'} • {o.department || 'Genel Birim'})</option>
                  ))}
                </select>
              )}

              {targetMode === 'department' && (
                <select value={composeDept} onChange={(e) => setComposeDept(e.target.value)} style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = 'var(--mdt-accent)'; e.target.style.boxShadow = '0 0 0 3px var(--mdt-accent-alpha)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--mdt-border)'; e.target.style.boxShadow = 'none'; }}>
                  {departmentsList.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              )}

              {targetMode === 'rank' && (
                <select value={composeRank} onChange={(e) => setComposeRank(e.target.value)} style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = 'var(--mdt-accent)'; e.target.style.boxShadow = '0 0 0 3px var(--mdt-accent-alpha)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--mdt-border)'; e.target.style.boxShadow = 'none'; }}>
                  {ranksList.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--mdt-text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>ÖNCELİK & GİZLİLİK SEVİYESİ:</label>
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <button type="button" onClick={() => setComposePriority('normal')} style={{ flex: 1, padding: '0.75rem', borderRadius: '6px', border: composePriority === 'normal' ? '1px solid var(--mdt-success)' : '1px solid var(--mdt-border)', backgroundColor: composePriority === 'normal' ? 'rgba(34,197,94,0.1)' : 'var(--mdt-bg-main)', color: composePriority === 'normal' ? 'var(--mdt-success)' : 'var(--mdt-text-secondary)', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.15s' }}>Normal</button>
                <button type="button" onClick={() => setComposePriority('urgent')} style={{ flex: 1, padding: '0.75rem', borderRadius: '6px', border: composePriority === 'urgent' ? '1px solid var(--mdt-warning)' : '1px solid var(--mdt-border)', backgroundColor: composePriority === 'urgent' ? 'rgba(245,158,11,0.1)' : 'var(--mdt-bg-main)', color: composePriority === 'urgent' ? 'var(--mdt-warning)' : 'var(--mdt-text-secondary)', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.15s' }}>Önemli</button>
                <button type="button" onClick={() => setComposePriority('secret')} style={{ flex: 1, padding: '0.75rem', borderRadius: '6px', border: composePriority === 'secret' ? '1px solid var(--mdt-danger)' : '1px solid var(--mdt-border)', backgroundColor: composePriority === 'secret' ? 'rgba(239,68,68,0.1)' : 'var(--mdt-bg-main)', color: composePriority === 'secret' ? 'var(--mdt-danger)' : 'var(--mdt-text-secondary)', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.15s' }}>Acil & Gizli</button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--mdt-text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>KONU BAŞLIĞI *</label>
              <input type="text" value={composeSubject} onChange={(e) => setComposeSubject(e.target.value)} style={inputStyle} required 
                onFocus={e => { e.target.style.borderColor = 'var(--mdt-accent)'; e.target.style.boxShadow = '0 0 0 3px var(--mdt-accent-alpha)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--mdt-border)'; e.target.style.boxShadow = 'none'; }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--mdt-text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>MESAJ İÇERİĞİ *</label>
              <textarea rows={10} value={composeBody} onChange={(e) => setComposeBody(e.target.value)} style={{ ...inputStyle, minHeight: "200px", resize: "vertical" }} required 
                onFocus={e => { e.target.style.borderColor = 'var(--mdt-accent)'; e.target.style.boxShadow = '0 0 0 3px var(--mdt-accent-alpha)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--mdt-border)'; e.target.style.boxShadow = 'none'; }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--mdt-border)' }}>
              <button type="button" onClick={() => setActiveFolder('inbox')} style={{ padding: '0.85rem 1.75rem', borderRadius: '6px', backgroundColor: 'transparent', border: '1px solid var(--mdt-border)', color: 'var(--mdt-text-secondary)', fontWeight: 800, cursor: 'pointer', transition: 'all 0.15s', fontSize: '0.85rem' }}
                onMouseOver={e => { (e.currentTarget as HTMLElement).style.color = 'var(--mdt-text-primary)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--mdt-text-primary)'; }}
                onMouseOut={e => { (e.currentTarget as HTMLElement).style.color = 'var(--mdt-text-secondary)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--mdt-border)'; }}>İptal</button>
              <button type="submit" disabled={submitting} style={{ padding: '0.85rem 2.5rem', borderRadius: '6px', backgroundColor: 'var(--mdt-accent)', border: '1px solid var(--mdt-accent)', color: '#111', fontWeight: 800, cursor: submitting ? 'not-allowed' : 'pointer', fontSize: '0.85rem', transition: 'opacity 0.15s', opacity: submitting ? 0.7 : 1 }}
                onMouseOver={e => !submitting && ((e.currentTarget as HTMLElement).style.opacity = '0.85')}
                onMouseOut={e => !submitting && ((e.currentTarget as HTMLElement).style.opacity = '1')}>
                {submitting ? "GÖNDERİLİYOR..." : "MESAJI GÖNDER"}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 400px) 1fr', gap: '1.5rem', minHeight: '650px', alignItems: 'start' }}>
          
          {/* ── MAIL LIST ── */}
          <div style={{ backgroundColor: 'var(--mdt-card-bg)', borderRadius: '10px', border: '1px solid var(--mdt-border)', display: 'flex', flexDirection: 'column', height: '650px', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--mdt-border)', display: 'flex', flexDirection: 'column', gap: '1rem', backgroundColor: 'var(--mdt-bg-main)' }}>
              <div style={{ position: 'relative' }}>
                <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--mdt-text-muted)' }} />
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Ara..." style={{ ...inputStyle, paddingLeft: '2.5rem' }} 
                  onFocus={e => { e.target.style.borderColor = 'var(--mdt-accent)'; e.target.style.boxShadow = '0 0 0 3px var(--mdt-accent-alpha)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--mdt-border)'; e.target.style.boxShadow = 'none'; }} />
              </div>
              
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value as any)} style={{ ...inputStyle, padding: "0.6rem" }}
                  onFocus={e => { e.target.style.borderColor = 'var(--mdt-accent)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--mdt-border)'; }}>
                  <option value="all">Tüm Öncelikler</option>
                  <option value="urgent_secret">Acil / Önemli</option>
                  <option value="normal">Normal</option>
                </select>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)} style={{ ...inputStyle, padding: "0.6rem" }}
                  onFocus={e => { e.target.style.borderColor = 'var(--mdt-accent)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--mdt-border)'; }}>
                  <option value="all">Tüm Durumlar</option>
                  <option value="unread">Okunmamış</option>
                  <option value="read">Okunmuş</option>
                </select>
                <button type="button" onClick={handleToggleSelectAll} style={{ padding: '0.6rem 1rem', borderRadius: '6px', backgroundColor: 'var(--mdt-card-bg)', border: '1px solid var(--mdt-border)', color: 'var(--mdt-text-secondary)', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}
                  onMouseOver={e => { (e.currentTarget as HTMLElement).style.color = 'var(--mdt-text-primary)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--mdt-text-primary)'; }}
                  onMouseOut={e => { (e.currentTarget as HTMLElement).style.color = 'var(--mdt-text-secondary)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--mdt-border)'; }}>Tümü</button>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }} className="scroll-custom">
              {loading && mails.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--mdt-text-muted)', fontWeight: 600 }}>Yükleniyor...</div>
              ) : filteredMails.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--mdt-text-muted)', fontWeight: 600 }}>Posta bulunamadı.</div>
              ) : (
                filteredMails.map((mail) => {
                  const parsed = parseMailContent(mail.content);
                  const isSelected = selectedMail?.id === mail.id;
                  const isChecked = selectedIds.includes(mail.id);
                  const isUnread = !mail.isRead && mail.receiverId === currentUser?.id;

                  return (
                    <div key={mail.id} onClick={() => handleSelectMailItem(mail)} style={{ padding: '1rem', borderRadius: '8px', backgroundColor: isSelected ? 'var(--mdt-bg-main)' : 'transparent', border: isSelected ? '1px solid var(--mdt-accent)' : '1px solid transparent', cursor: 'pointer', display: 'flex', gap: '0.75rem', transition: 'all 0.15s', position: 'relative' }}
                      onMouseOver={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'; }}
                      onMouseOut={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                      {isUnread && <div style={{ position: 'absolute', left: '0', top: '50%', transform: 'translateY(-50%)', width: '3px', height: '60%', backgroundColor: 'var(--mdt-accent)', borderRadius: '0 4px 4px 0' }} />}
                      <div onClick={(e) => handleToggleSelectId(mail.id, e)} style={{ color: isChecked ? 'var(--mdt-accent)' : 'var(--mdt-text-muted)', cursor: 'pointer', paddingTop: '0.1rem', paddingLeft: isUnread ? '0.5rem' : '0' }}>
                        <i className={`fa-${isChecked ? 'solid fa-square-check' : 'regular fa-square'}`}></i>
                      </div>
                      <div style={{ flex: 1, minWidth: 0, paddingLeft: !isUnread && !isChecked ? '0.5rem' : '0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', alignItems: 'center' }}>
                          <span style={{ fontWeight: 800, fontSize: '0.85rem', color: isUnread ? 'var(--mdt-text-primary)' : 'var(--mdt-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {activeFolder === 'sent' ? `Alıcı: ${mail.receiver?.name || 'DEPARTMAN'}` : mail.sender.name}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--mdt-text-muted)', fontWeight: 600 }}>{new Date(mail.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: isUnread ? 'var(--mdt-text-primary)' : 'var(--mdt-text-muted)', marginBottom: '0.4rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{parsed.subject}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {parsed.priority !== 'normal' && <span style={{ fontSize: '0.65rem', fontWeight: 800, color: parsed.priority === 'urgent' ? 'var(--mdt-warning)' : 'var(--mdt-danger)', backgroundColor: parsed.priority === 'urgent' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)', padding: '0.15rem 0.4rem', borderRadius: '4px', border: `1px solid ${parsed.priority === 'urgent' ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)'}` }}>{parsed.priority.toUpperCase()}</span>}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ── MAIL READER ── */}
          <div style={{ backgroundColor: 'var(--mdt-card-bg)', borderRadius: '10px', border: '1px solid var(--mdt-border)', display: 'flex', flexDirection: 'column', height: '650px', overflow: 'hidden' }}>
            {selectedMail ? (
              (() => {
                const parsed = parseMailContent(selectedMail.content);
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--mdt-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', backgroundColor: 'var(--mdt-bg-main)' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 800, color: parsed.priority === 'secret' ? 'var(--mdt-danger)' : parsed.priority === 'urgent' ? 'var(--mdt-warning)' : 'var(--mdt-text-secondary)', letterSpacing: '0.05em', backgroundColor: parsed.priority === 'secret' ? 'rgba(239,68,68,0.1)' : parsed.priority === 'urgent' ? 'rgba(245,158,11,0.1)' : 'transparent', padding: parsed.priority !== 'normal' ? '0.2rem 0.6rem' : '0', borderRadius: '4px', border: parsed.priority === 'secret' ? '1px solid rgba(239,68,68,0.2)' : parsed.priority === 'urgent' ? '1px solid rgba(245,158,11,0.2)' : 'none' }}>
                        {parsed.priority.toUpperCase()}
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => handleReply(selectedMail)} style={{ padding: '0.5rem 1rem', borderRadius: '6px', backgroundColor: 'var(--mdt-accent)', border: '1px solid var(--mdt-accent)', color: '#111', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', transition: 'all 0.15s' }}
                          onMouseOver={e => (e.currentTarget as HTMLElement).style.opacity = '0.85'}
                          onMouseOut={e => (e.currentTarget as HTMLElement).style.opacity = '1'}><i className="fa-solid fa-reply" style={{ marginRight: '0.3rem' }}/> Yanıtla</button>
                        <button onClick={() => handleForward(selectedMail)} style={{ padding: '0.5rem 1rem', borderRadius: '6px', backgroundColor: 'transparent', border: '1px solid var(--mdt-border)', color: 'var(--mdt-text-secondary)', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', transition: 'all 0.15s' }}
                          onMouseOver={e => { (e.currentTarget as HTMLElement).style.color = 'var(--mdt-text-primary)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--mdt-text-primary)'; }}
                          onMouseOut={e => { (e.currentTarget as HTMLElement).style.color = 'var(--mdt-text-secondary)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--mdt-border)'; }}><i className="fa-solid fa-share" style={{ marginRight: '0.3rem' }}/> İlet</button>
                        <button onClick={() => handleCopyMailBody(selectedMail)} style={{ padding: '0.5rem 1rem', borderRadius: '6px', backgroundColor: 'transparent', border: '1px solid var(--mdt-border)', color: 'var(--mdt-text-secondary)', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', transition: 'all 0.15s' }}
                          onMouseOver={e => { (e.currentTarget as HTMLElement).style.color = 'var(--mdt-text-primary)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--mdt-text-primary)'; }}
                          onMouseOut={e => { (e.currentTarget as HTMLElement).style.color = 'var(--mdt-text-secondary)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--mdt-border)'; }}><i className="fa-regular fa-copy" style={{ marginRight: '0.3rem' }}/> Kopyala</button>
                        <button onClick={() => handlePrintMail(selectedMail)} style={{ padding: '0.5rem 1rem', borderRadius: '6px', backgroundColor: 'transparent', border: '1px solid var(--mdt-border)', color: 'var(--mdt-text-secondary)', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', transition: 'all 0.15s' }}
                          onMouseOver={e => { (e.currentTarget as HTMLElement).style.color = 'var(--mdt-text-primary)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--mdt-text-primary)'; }}
                          onMouseOut={e => { (e.currentTarget as HTMLElement).style.color = 'var(--mdt-text-secondary)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--mdt-border)'; }}><i className="fa-solid fa-print" style={{ marginRight: '0.3rem' }}/> Yazdır</button>
                      </div>
                    </div>
                    
                    <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }} className="scroll-custom">
                      <h1 style={{ margin: '0 0 2rem 0', fontSize: '1.4rem', fontWeight: 800, color: 'var(--mdt-text-primary)', lineHeight: 1.3 }}>{parsed.subject}</h1>
                      
                      <div style={{ padding: '1.25rem', borderRadius: '8px', backgroundColor: 'var(--mdt-bg-main)', border: '1px solid var(--mdt-border)', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--mdt-card-bg)', border: '1px solid var(--mdt-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--mdt-text-muted)', fontSize: '1.1rem' }}>
                            <i className="fa-solid fa-user" />
                          </div>
                          <div>
                            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--mdt-text-primary)' }}>{selectedMail.sender.name} <span style={{ color: 'var(--mdt-text-muted)', fontSize: '0.85rem' }}>#{selectedMail.sender.badge}</span></div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--mdt-text-secondary)', fontWeight: 600, marginTop: '0.2rem' }}>{selectedMail.sender.rank || 'Memur'}</div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.65rem', color: 'var(--mdt-text-muted)', fontWeight: 700, letterSpacing: '0.1em' }}>ALICI:</div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--mdt-text-primary)', marginTop: '0.2rem' }}>{selectedMail.receiver ? `${selectedMail.receiver.name} (#${selectedMail.receiver.badge})` : 'TÜM DEPARTMAN'}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--mdt-text-muted)', marginTop: '0.3rem', fontWeight: 500 }}>{new Date(selectedMail.createdAt).toLocaleString('tr-TR')}</div>
                        </div>
                      </div>

                      <div style={{ fontSize: '0.9rem', lineHeight: '1.8', color: 'var(--mdt-text-primary)', whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'inherit' }}>
                        {parsed.body}
                      </div>
                    </div>
                  </div>
                );
              })()
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '3rem', textAlign: 'center', color: 'var(--mdt-text-muted)' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--mdt-bg-main)', border: '1px solid var(--mdt-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                  <i className="fa-regular fa-envelope" style={{ fontSize: '2.5rem', color: 'var(--mdt-text-secondary)' }}></i>
                </div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--mdt-text-secondary)', letterSpacing: '0.05em' }}>OKUMAK İÇİN POSTA SEÇİN</h3>
                <p style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>İçeriğini görüntülemek için sol taraftan bir iletiye tıklayın.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
