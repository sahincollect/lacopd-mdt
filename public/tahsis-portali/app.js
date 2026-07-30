// Mock data to populate on first load
const MOCK_OFFICERS = [
  {
    id: "1",
    name: "John Doe",
    badge: "2G-12",
    rank: "Sergeant II",
    callsign: "1-ADAM-12",
    weaponName: "Glock 17",
    weaponLicense: "W-582910",
    vehicleName: "Ford Explorer Utility",
    vehiclePlate: "20LPD812"
  },
  {
    id: "2",
    name: "Marcus Vance",
    badge: "3M-45",
    rank: "Officer III",
    callsign: "1-ADAM-20",
    weaponName: "Combat Pistol",
    weaponLicense: "W-382019",
    vehicleName: "Vapid Stanier",
    vehiclePlate: "20LPD310"
  },
  {
    id: "3",
    name: "Sarah Connor",
    badge: "1D-05",
    rank: "Detective",
    callsign: "2-LINCOLN-10",
    weaponName: "Glock 17",
    weaponLicense: "W-902183",
    vehicleName: "Unmarked Cruiser",
    vehiclePlate: "48LPD902"
  }
];

// App State
let officers = [];
let settings = {
  webhookUrl: "",
  autoSendDiscord: false
};

// Elements
const officerGrid = document.getElementById("officerGrid");
const inputSearch = document.getElementById("inputSearch");
const filterAllocation = document.getElementById("filterAllocation");

// Stats Elements
const statTotalOfficers = document.getElementById("statTotalOfficers");
const statTotalWeapons = document.getElementById("statTotalWeapons");
const statTotalVehicles = document.getElementById("statTotalVehicles");

// Modal Elements
const modalOfficer = document.getElementById("modalOfficer");
const modalSettings = document.getElementById("modalSettings");
const modalBackup = document.getElementById("modalBackup");

// Form Elements
const formOfficer = document.getElementById("formOfficer");
const officerIdInput = document.getElementById("officerId");
const officerNameInput = document.getElementById("officerName");
const badgeNumberInput = document.getElementById("badgeNumber");
const officerRankSelect = document.getElementById("officerRank");
const callsignInput = document.getElementById("callsign");
const weaponNameInput = document.getElementById("weaponName");
const weaponLicenseInput = document.getElementById("weaponLicense");
const prcLicenseInput = document.getElementById("prcLicense");
const vehicleNameInput = document.getElementById("vehicleName");
const vehiclePlateInput = document.getElementById("vehiclePlate");

const webhookUrlInput = document.getElementById("webhookUrl");
const autoSendDiscordInput = document.getElementById("autoSendDiscord");

// Initialize App
document.addEventListener("DOMContentLoaded", () => {
  loadData();
  setupEventListeners();
  render();
});

// Load from LocalStorage
function loadData() {
  const storedOfficers = localStorage.getItem("LAC_officers");
  if (storedOfficers) {
    officers = JSON.parse(storedOfficers);
    
    // Proactive Migration: Replace "Expo" with "Explorer" in existing saved data
    let migrated = false;
    officers.forEach(off => {
      if (off.vehicleName && off.vehicleName.includes("Expo")) {
        off.vehicleName = off.vehicleName.replace(/Expo/g, "Explorer");
        migrated = true;
      }
    });
    if (migrated) {
      saveOfficers();
    }
  } else {
    // First load, populate mock data
    officers = [...MOCK_OFFICERS];
    saveOfficers();
  }

  const storedSettings = localStorage.getItem("LAC_settings");
  if (storedSettings) {
    settings = JSON.parse(storedSettings);
  }
}

// Save to LocalStorage
function saveOfficers() {
  localStorage.setItem("LAC_officers", JSON.stringify(officers));
}

function saveSettings() {
  localStorage.setItem("LAC_settings", JSON.stringify(settings));
}

// Setup Event Listeners
function setupEventListeners() {
  // Modal toggling
  document.getElementById("btnNewOfficer").addEventListener("click", () => openOfficerModal());
  document.getElementById("btnSettings").addEventListener("click", () => openSettingsModal());
  document.getElementById("btnBackup").addEventListener("click", () => openBackupModal());

  document.getElementById("btnCloseOfficerModal").addEventListener("click", () => closeOfficerModal());
  document.getElementById("btnCancelOfficer").addEventListener("click", () => closeOfficerModal());
  
  document.getElementById("btnCloseSettingsModal").addEventListener("click", () => closeSettingsModal());
  document.getElementById("btnCloseBackupModal").addEventListener("click", () => closeBackupModal());

  // Click outside to close modals
  window.addEventListener("click", (e) => {
    if (e.target === modalSettings) closeSettingsModal();
    if (e.target === modalBackup) closeBackupModal();
    if (e.target === modalImageLightbox) closeImageModal();
  });

  // Search & Filter change
  inputSearch.addEventListener("input", render);
  filterAllocation.addEventListener("change", render);

  // Form submits
  formOfficer.addEventListener("submit", handleOfficerSubmit);
  document.getElementById("btnSaveSettings").addEventListener("click", handleSettingsSubmit);
  document.getElementById("btnTestWebhook").addEventListener("click", testWebhook);

  // Backup actions
  document.getElementById("btnExportData").addEventListener("click", exportData);
  
  const fileInput = document.getElementById("importFile");
  document.getElementById("btnImportTrigger").addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", importData);

  // Sort ranks action
  document.getElementById("btnSortRanks").addEventListener("click", sortOfficersByRank);

  // Tab Switchers
  document.getElementById("tabBtnAllocation").addEventListener("click", (e) => switchTab(e, "tabAllocation"));
  document.getElementById("tabBtnEquipment").addEventListener("click", (e) => switchTab(e, "tabEquipment"));

  // Lightbox Modal closing
  document.getElementById("btnCloseImageLightbox").addEventListener("click", closeImageModal);
}

// Render Dashboard
function render() {
  // Filter officers
  const query = inputSearch.value.trim().toLowerCase();
  const rankFilter = "ALL";
  const allocFilter = filterAllocation.value;

  const filtered = officers.filter(off => {
    // Search query match
    const matchesQuery = 
      off.name.toLowerCase().includes(query) ||
      off.badge.toLowerCase().includes(query) ||
      (off.weaponName && off.weaponName.toLowerCase().includes(query)) ||
      (off.weaponLicense && off.weaponLicense.toLowerCase().includes(query)) ||
      (off.vehicleName && off.vehicleName.toLowerCase().includes(query)) ||
      (off.vehiclePlate && off.vehiclePlate.toLowerCase().includes(query)) ||
      (off.callsign && off.callsign.toLowerCase().includes(query)) ||
      (off.hasPrc && ("ar-15".includes(query) || "prc".includes(query)));

    // Rank match
    let matchesRank = true;
    if (rankFilter !== "ALL") {
      matchesRank = off.rank === rankFilter;
    }

    // Allocation match
    let matchesAlloc = true;
    const hasWeapon = !!off.weaponName || !!off.hasPrc;
    if (allocFilter === "BOTH") {
      matchesAlloc = hasWeapon && !!off.vehicleName;
    } else if (allocFilter === "WEAPON") {
      matchesAlloc = hasWeapon && !off.vehicleName;
    } else if (allocFilter === "VEHICLE") {
      matchesAlloc = !hasWeapon && !!off.vehicleName;
    } else if (allocFilter === "NONE") {
      matchesAlloc = !hasWeapon && !off.vehicleName;
    }

    return matchesQuery && matchesRank && matchesAlloc;
  });

  // Render stats
  renderStats();

  // Render cards
  officerGrid.innerHTML = "";
  if (filtered.length === 0) {
    officerGrid.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        </svg>
        <h3>Kayıt Bulunamadı</h3>
        <p>Aradığınız kriterlere uygun herhangi bir tahsis kaydı veya memur listelenemedi.</p>
      </div>
    `;
    return;
  }

  filtered.forEach(off => {
    const card = document.createElement("div");
    card.className = "officer-card";
    
    // Rank styling helper class
    let rankClass = "";
    if (off.rank.includes("Chief") || off.rank.includes("Commander") || off.rank.includes("Captain")) {
      rankClass = "rank-chief";
    } else if (off.rank.includes("Lieutenant") || off.rank.includes("Sergeant")) {
      rankClass = "rank-lieutenant";
    }

    card.innerHTML = `
      <div>
        <div class="card-header">
          <div class="officer-identity">
            <span class="officer-name">${off.name}</span>
            <span class="officer-badge">Rozet: #${off.badge}</span>
          </div>
          <span class="rank-badge ${rankClass}">${off.rank}</span>
        </div>
        
        <div class="allocation-details">
          <!-- Callsign -->
          <div class="allocation-item" style="border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem; margin-bottom: 0.5rem;">
            <span class="item-label">📻 Devriye Çağrı Kodu</span>
            <span class="item-value" style="color: var(--color-secondary); font-weight: bold;">${off.callsign || 'Tahsis Yok'}</span>
          </div>

          <!-- Weapon -->
          <div class="allocation-section">
            <div class="section-title title-weapon">
              <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 11h-4V7a2 2 0 00-2-2H7a2 2 0 00-2 2v6h2l2 6h8a2 2 0 002-2v-5z"/></svg>
              SİLAH TAHSİSİ
            </div>
            ${(off.weaponName || off.hasPrc) ? `
              ${off.weaponName ? `
                <div class="allocation-item">
                  <span class="item-label">Tabanca:</span>
                  <span class="item-value">${off.weaponName}</span>
                </div>
                <div class="allocation-item">
                  <span class="item-label">Lisans/Seri:</span>
                  <span class="item-value code">${off.weaponLicense || 'N/A'}</span>
                </div>
              ` : ''}
              ${off.hasPrc ? `
                <div class="allocation-item" style="${off.weaponName ? 'margin-top: 0.4rem; border-top: 1px dashed rgba(255,255,255,0.05); padding-top: 0.4rem;' : ''}">
                  <span class="item-label" style="color: var(--color-success);">PRC Lisansı:</span>
                  <span class="item-value" style="color: var(--color-success); font-weight: bold;">Aktif</span>
                </div>
                <div class="allocation-item">
                  <span class="item-label">Tüfek:</span>
                  <span class="item-value" style="font-weight: bold;">AR-15</span>
                </div>
              ` : ''}
            ` : `<p style="font-size: 0.85rem; color: var(--text-dark); font-style: italic;">Silah tahsisi bulunmuyor.</p>`}
          </div>

          <!-- Vehicle -->
          <div class="allocation-section">
            <div class="section-title title-vehicle">
              <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zm10 0a2 2 0 11-4 0 2 2 0 014 0zM4 17h1v-4h14v4h1M4 13L6 7h12l2 6H4z"/></svg>
              ARAÇ TAHSİSİ
            </div>
            ${off.vehicleName ? `
              <div class="allocation-item">
                <span class="item-label">Model:</span>
                <span class="item-value">${off.vehicleName}</span>
              </div>
              <div class="allocation-item">
                <span class="item-label">Plaka:</span>
                <span class="item-value code">${off.vehiclePlate}</span>
              </div>
            ` : `<p style="font-size: 0.85rem; color: var(--text-dark); font-style: italic;">Araç tahsisi bulunmuyor.</p>`}
          </div>
        </div>
      </div>
      
      <div class="card-actions">
        <button class="btn btn-secondary" onclick="editOfficer('${off.id}')">
          Düzenle
        </button>
        <button class="btn btn-secondary" style="border-color: rgba(0, 168, 255, 0.25);" onclick="copyToClipboard('${off.id}')" title="Discord için Kopyala">
          Kopyala
        </button>
        <button class="btn btn-primary" onclick="postToDiscordWebhook('${off.id}')">
          Discord'a At
        </button>
      </div>
    `;
    officerGrid.appendChild(card);
  });
}

// Render Stats Count
function renderStats() {
  statTotalOfficers.textContent = officers.length;
  statTotalWeapons.textContent = officers.filter(o => !!o.weaponName || o.hasPrc).length;
  statTotalVehicles.textContent = officers.filter(o => !!o.vehicleName).length;
}

// Modal Handles
function openOfficerModal(officer = null) {
  formOfficer.reset();
  officerIdInput.value = "";
  document.getElementById("modalOfficerTitle").textContent = "Yeni Tahsis Ekle";

  if (officer) {
    document.getElementById("modalOfficerTitle").textContent = "Tahsis Kaydını Düzenle";
    officerIdInput.value = officer.id;
    officerNameInput.value = officer.name;
    badgeNumberInput.value = officer.badge;
    officerRankSelect.value = officer.rank;
    callsignInput.value = officer.callsign || "";
    weaponNameInput.value = officer.weaponName || "";
    weaponLicenseInput.value = officer.weaponLicense || "";
    prcLicenseInput.checked = !!officer.hasPrc;
    vehicleNameInput.value = officer.vehicleName || "";
    vehiclePlateInput.value = officer.vehiclePlate || "";
  } else {
    prcLicenseInput.checked = false;
  }
  
  modalOfficer.classList.add("active");
}

function closeOfficerModal() {
  modalOfficer.classList.remove("active");
}

function openSettingsModal() {
  webhookUrlInput.value = settings.webhookUrl;
  autoSendDiscordInput.checked = settings.autoSendDiscord;
  modalSettings.classList.add("active");
}

function closeSettingsModal() {
  modalSettings.classList.remove("active");
}

function openBackupModal() {
  modalBackup.classList.add("active");
}

function closeBackupModal() {
  modalBackup.classList.remove("active");
}

// Handle Form Submissions
function handleOfficerSubmit(e) {
  e.preventDefault();
  
  const id = officerIdInput.value;
  const officerData = {
    id: id || Date.now().toString(),
    name: officerNameInput.value.trim(),
    badge: badgeNumberInput.value.trim(),
    rank: officerRankSelect.value,
    callsign: callsignInput.value.trim(),
    weaponName: weaponNameInput.value.trim(),
    weaponLicense: weaponLicenseInput.value.trim(),
    hasPrc: prcLicenseInput.checked,
    vehicleName: vehicleNameInput.value.trim(),
    vehiclePlate: vehiclePlateInput.value.trim().toUpperCase()
  };

  if (id) {
    // Update existing
    const idx = officers.findIndex(o => o.id === id);
    if (idx !== -1) officers[idx] = officerData;
    showToast("Tahsis kaydı başarıyla güncellendi.", "success");
  } else {
    // Create new
    officers.unshift(officerData);
    showToast("Yeni tahsis kaydı eklendi.", "success");
    
    // Auto send to discord if enabled
    if (settings.webhookUrl && settings.autoSendDiscord) {
      sendWebhook(officerData);
    }
  }

  saveOfficers();
  closeOfficerModal();
  render();
}

function handleSettingsSubmit() {
  settings.webhookUrl = webhookUrlInput.value.trim();
  settings.autoSendDiscord = autoSendDiscordInput.checked;
  
  saveSettings();
  showToast("Ayarlar başarıyla kaydedildi.", "success");
  closeSettingsModal();
}

// Edit handler
window.editOfficer = function(id) {
  const officer = officers.find(o => o.id === id);
  if (officer) {
    openOfficerModal(officer);
  }
};

// Clipboard format handler
window.copyToClipboard = function(id) {
  const officer = officers.find(o => o.id === id);
  if (!officer) return;

  const text = formatDiscordMarkdown(officer);
  
  navigator.clipboard.writeText(text)
    .then(() => {
      showToast("Discord metni kopyalandı! Discord'a yapıştırabilirsiniz.", "success");
    })
    .catch(err => {
      showToast("Kopyalama başarısız oldu.", "danger");
      console.error(err);
    });
};

function formatDiscordMarkdown(officer) {
  let msg = `**🚨 LAC | EKİPMAN & ARAÇ TAHSİS KAYDI 🚨**\n`;
  msg += `──────────────────────────────\n`;
  msg += `**👮 Memur:** ${officer.name} (Rozet: #${officer.badge})\n`;
  msg += `**⭐ Rütbe:** ${officer.rank}\n`;
  msg += `**📻 Çağrı Kodu:** ${officer.callsign || 'Bulunmuyor'}\n\n`;
  
  msg += `**🔫 SİLAH TAHSİSİ**\n`;
  if (officer.weaponName || officer.hasPrc) {
    if (officer.weaponName) {
      msg += `• Tabanca: *${officer.weaponName}*\n`;
      msg += `• Lisans/Seri No: \`${officer.weaponLicense || 'N/A'}\`\n`;
    }
    if (officer.hasPrc) {
      msg += `• PRC Lisansı: *Aktif*\n`;
      msg += `• Devriye Tüfeği: *AR-15*\n`;
    }
    msg += `\n`;
  } else {
    msg += `*Tahsis edilmedi.*\n\n`;
  }

  msg += `**🚔 ARAÇ TAHSİSİ**\n`;
  if (officer.vehicleName) {
    msg += `• Model: *${officer.vehicleName}*\n`;
    msg += `• Plaka: \`${officer.vehiclePlate}\`\n`;
  } else {
    msg += `*Tahsis edilmedi.*\n`;
  }
  msg += `──────────────────────────────`;
  return msg;
}

// Discord Webhook Call
window.postToDiscordWebhook = function(id) {
  const officer = officers.find(o => o.id === id);
  if (!officer) return;

  if (!settings.webhookUrl) {
    showToast("Lütfen önce Webhook Ayarlarından bir URL tanımlayın!", "warning");
    openSettingsModal();
    return;
  }

  sendWebhook(officer);
};

function sendWebhook(officer) {
  // Format beautifully using Embeds
  const payload = {
    embeds: [
      {
        title: "🚨 LAC | Ekipman & Araç Tahsis Kaydı",
        color: 13938487, // LAC Gold Color (HEX d4af37 -> DEC 13938487)
        fields: [
          {
            name: "👮 Memur Detayları",
            value: `**Adı Soyadı:** ${officer.name}\n**Rozet No:** #${officer.badge}\n**Rütbe:** ${officer.rank}\n**Çağrı Kodu:** ${officer.callsign || 'N/A'}`,
            inline: false
          },
          {
            name: "🔫 Silah Tahsisi",
            value: (officer.weaponName || officer.hasPrc) ? 
              `${officer.weaponName ? `**Tabanca:** ${officer.weaponName}\n**Lisans:** \`${officer.weaponLicense || 'N/A'}\`\n` : ''}${officer.hasPrc ? `**PRC Lisansı:** Aktif\n**Tüfek:** AR-15` : ''}` 
              : "❌ Tahsis Yapılmadı",
            inline: true
          },
          {
            name: "🚔 Araç Tahsisi",
            value: officer.vehicleName ? `**Model:** ${officer.vehicleName}\n**Plaka:** \`${officer.vehiclePlate}\`` : "❌ Tahsis Yapılmadı",
            inline: true
          }
        ],
        footer: {
          text: "LAC Quartermaster Registry System"
        },
        timestamp: new Date().toISOString()
      }
    ]
  };

  fetch(settings.webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  })
  .then(res => {
    if (res.ok) {
      showToast("Veri başarıyla Discord'a gönderildi!", "success");
    } else {
      showToast("Discord'a gönderilirken hata oluştu. URL geçersiz olabilir.", "danger");
    }
  })
  .catch(err => {
    showToast("Bağlantı hatası oluştu.", "danger");
    console.error(err);
  });
}

function testWebhook() {
  const url = webhookUrlInput.value.trim();
  if (!url) {
    showToast("Test etmek için bir URL girin.", "warning");
    return;
  }

  const payload = {
    content: "🔔 **LAC Quartermaster Sistemi**: Webhook bağlantı testi başarılı!"
  };

  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  })
  .then(res => {
    if (res.ok) {
      showToast("Test mesajı gönderildi! Discord kanalınızı kontrol edin.", "success");
    } else {
      showToast("Test gönderimi başarısız. URL'yi kontrol edin.", "danger");
    }
  })
  .catch(err => {
    showToast("Bağlantı hatası oluştu.", "danger");
    console.error(err);
  });
}

// Backup & Restore Functions
function exportData() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(officers, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `LAC_tahsis_yedek_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  showToast("Yedek dosyası indirildi.", "success");
}

function importData(e) {
  const fileReader = new FileReader();
  const file = e.target.files[0];
  if (!file) return;

  fileReader.onload = function(event) {
    try {
      const parsed = JSON.parse(event.target.result);
      if (Array.isArray(parsed)) {
        officers = parsed;
        saveOfficers();
        render();
        showToast("Veriler başarıyla geri yüklendi!", "success");
        closeBackupModal();
      } else {
        showToast("Hata: Geçersiz yedek dosyası yapısı.", "danger");
      }
    } catch (err) {
      showToast("Hata: Dosya okunamadı veya JSON geçersiz.", "danger");
    }
  };
  fileReader.readAsText(file);
}

// Toast Notification Engine
function showToast(message, type = "success") {
  const container = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  
  toast.innerHTML = `
    <span class="toast-message">${message}</span>
    <span style="font-size: 1.2rem; cursor: pointer; opacity: 0.5; font-weight: bold;" onclick="this.parentElement.remove()">&times;</span>
  `;

  container.appendChild(toast);
  
  // Trigger animation
  setTimeout(() => toast.classList.add("show"), 10);

  // Auto remove
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Rank Priorities for sorting
const RANK_ORDER = {
  "Cadet": 1,
  "Officer I": 2,
  "Officer II": 3,
  "Officer III": 4,
  "Senior Lead Officer": 5,
  "Detective": 6,
  "Detective II": 7,
  "Detective III": 8,
  "Sergeant I": 9,
  "Sergeant II": 10,
  "Lieutenant": 11
};

// Sort function
function sortOfficersByRank() {
  officers.sort((a, b) => {
    const priorityA = RANK_ORDER[a.rank] || 99;
    const priorityB = RANK_ORDER[b.rank] || 99;
    return priorityA - priorityB;
  });
  saveOfficers();
  render();
  showToast("Rütbeler başarıyla sıralandı!", "success");
}

// Tab switcher function
function switchTab(e, tabId) {
  // Toggle buttons
  document.querySelectorAll(".tab-navigation .btn").forEach(btn => btn.classList.remove("active"));
  e.currentTarget.classList.add("active");

  // Toggle content divs
  document.querySelectorAll(".tab-content").forEach(content => content.classList.remove("active"));
  document.getElementById(tabId).classList.add("active");
}

// Lightbox Modal functions
const modalImageLightbox = document.getElementById("modalImageLightbox");
const lightboxImg = document.getElementById("lightboxImg");

function openImageModal(src, title) {
  lightboxImg.src = src;
  lightboxImg.alt = title;
  modalImageLightbox.classList.add("show");
}

function closeImageModal() {
  modalImageLightbox.classList.remove("show");
}
