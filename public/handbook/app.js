// LAPD Duty Manual - Application State
let currentLang = localStorage.getItem('lapd_lang') || 'EN';
let currentTheme = localStorage.getItem('lapd_theme') || 'dark-theme';

// Initialize Page
document.addEventListener("DOMContentLoaded", () => {
    // Clock setup
    initClock();
    
    // Apply default language and theme
    applyLanguage(currentLang);
    applyTheme(currentTheme);
    
    // Event listeners
    document.getElementById("langBtnEN").addEventListener("click", () => applyLanguage("EN"));
    document.getElementById("langBtnTR").addEventListener("click", () => applyLanguage("TR"));
    document.getElementById("themeToggle").addEventListener("click", toggleTheme);
    document.getElementById("globalSearch").addEventListener("input", handleSearch);
    
    // Mobile Navigation Controls
    const sidebar = document.getElementById("sidebar");
    const toggleBtn = document.getElementById("sidebarToggleBtn");
    const closeBtn = document.getElementById("sidebarCloseBtn");
    
    toggleBtn.addEventListener("click", () => sidebar.classList.add("active"));
    closeBtn.addEventListener("click", () => sidebar.classList.remove("active"));
});

// Clock Logic
function initClock() {
    const clockEl = document.getElementById("systemClock");
    setInterval(() => {
        const now = new Date();
        const hrs = String(now.getHours()).padStart(2, '0');
        const mins = String(now.getMinutes()).padStart(2, '0');
        const secs = String(now.getSeconds()).padStart(2, '0');
        clockEl.textContent = `${hrs}:${mins}:${secs}`;
    }, 1000);
}

// Tab Swapping
function switchTab(tabId) {
    // Hide all tabs
    document.querySelectorAll(".tab-content").forEach(el => el.classList.remove("active"));
    
    // Deactivate all nav buttons
    document.querySelectorAll(".nav-btn").forEach(btn => btn.classList.remove("active"));
    
    // Show selected tab
    const targetTab = document.getElementById(tabId);
    if (targetTab) {
        targetTab.classList.add("active");
    }
    
    // Activate nav button
    const targetBtn = document.getElementById(`btn-${tabId}`);
    if (targetBtn) {
        targetBtn.classList.add("active");
    }
    
    // Auto-scroll content area back to top
    document.getElementById("contentBody").scrollTop = 0;
    
    // If mobile view, close the sidebar overlay
    document.getElementById("sidebar").classList.remove("active");

}

// Theme Controls
function toggleTheme() {
    const nextTheme = currentTheme === 'dark-theme' ? 'light-theme' : 'dark-theme';
    applyTheme(nextTheme);
}

function applyTheme(theme) {
    document.body.className = theme;
    currentTheme = theme;
    localStorage.setItem('lapd_theme', theme);
    
    const themeBtnIcon = document.querySelector("#themeToggle i");
    if (theme === 'dark-theme') {
        themeBtnIcon.className = "fa-solid fa-sun";
    } else {
        themeBtnIcon.className = "fa-solid fa-moon";
    }
}

// Language Controls
function applyLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('lapd_lang', lang);
    
    // Update segmented buttons active state
    const btnEN = document.getElementById("langBtnEN");
    const btnTR = document.getElementById("langBtnTR");
    if (btnEN && btnTR) {
        if (lang === 'EN') {
            btnEN.classList.add("active");
            btnTR.classList.remove("active");
        } else {
            btnTR.classList.add("active");
            btnEN.classList.remove("active");
        }
    }
    
    // Switch html lang attribute
    document.documentElement.lang = lang.toLowerCase();
    
    // Find all elements with translations
    document.querySelectorAll("[data-en]").forEach(el => {
        const text = el.getAttribute(`data-${lang.toLowerCase()}`);
        if (text) {
            // Check if element has child nodes (like icons). If so, replace only the text node.
            let hasTextNode = false;
            for (let child of el.childNodes) {
                if (child.nodeType === Node.TEXT_NODE) {
                    child.textContent = text;
                    hasTextNode = true;
                    break;
                }
            }
            if (!hasTextNode) {
                el.textContent = text;
            }
        }
    });

    // Update Input placeholders
    document.querySelectorAll("[data-en-placeholder]").forEach(el => {
        const placeholder = el.getAttribute(`data-${lang.toLowerCase()}-placeholder`);
        if (placeholder) {
            el.placeholder = placeholder;
        }
    });

}

// Highlight matching search text
function highlightMatch(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
    return text.replace(regex, '<span class="search-highlight">$1</span>');
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Tab Display Names for Search Categories
const tabCategoryNames = {
    dashboard: { EN: "Dashboard", TR: "Ana Ekran" },
    ethics: { EN: "Ethics & True Policing", TR: "Etik & Doğru Polislik" },
    cadet: { EN: "Cadet Authorities", TR: "Aday Memur Yetkileri" },
    fid: { EN: "Field Interview (FID)", TR: "Saha Mülakatı (FID)" },
    procedures: { EN: "Essential Procedures", TR: "Temel Prosedürler" },
    bls: { EN: "First Aid & BLS", TR: "İlk Yardım & BLS" },
    traffic: { EN: "Traffic Division", TR: "Trafik Divizyonu" },
    dresscode: { EN: "Uniform & Dress Code", TR: "Kıyafet Kodu" }
};

// Close dropdown on click outside
document.addEventListener("click", (e) => {
    const dropdown = document.getElementById("searchResultsDropdown");
    const searchInput = document.getElementById("globalSearch");
    if (dropdown && searchInput && !dropdown.contains(e.target) && e.target !== searchInput) {
        dropdown.style.display = "none";
    }
});

// Global search handling
function handleSearch(e) {
    const val = e.target.value.trim();
    const dropdown = document.getElementById("searchResultsDropdown");
    
    if (!dropdown) return;
    
    // Clear previous results
    dropdown.innerHTML = "";
    
    if (!val || val.length < 2) {
        dropdown.style.display = "none";
        
        // Reset any muted highlights on active tab if search cleared
        const activeTab = document.querySelector(".tab-content.active");
        if (activeTab) {
            const searchables = activeTab.querySelectorAll("p, li, blockquote, .rights-quote, .ethics-text, .suspicion-level-card");
            searchables.forEach(el => {
                const originalText = el.getAttribute("data-original-text");
                if (originalText) {
                    el.innerHTML = originalText;
                    el.removeAttribute("data-original-text");
                }
                el.style.opacity = "1";
            });
        }
        return;
    }
    
    dropdown.style.display = "flex";
    const query = val.toLowerCase();
    const results = [];
    
    // 1. Search in structural text content (across all tabs)
    document.querySelectorAll(".tab-content").forEach(section => {
        const tabId = section.id;
        
        
        
        // Query paragraphs, list items, headings, quotes, suspicion cards
        const textElements = section.querySelectorAll("p, li, blockquote, .rights-quote, .ethics-text, h1, h2, h3, h4, .suspicion-level-card");
        
        textElements.forEach(el => {
            // Get original text to search
            const originalText = el.getAttribute("data-original-text") || el.textContent;
            
            // Skip empty elements
            if (!originalText || originalText.trim().length === 0) return;
            
            if (originalText.toLowerCase().includes(query)) {
                // Find descriptive category name
                const catName = tabCategoryNames[tabId] ? tabCategoryNames[tabId][currentLang] : tabId;
                
                // Create a brief snippet context
                const idx = originalText.toLowerCase().indexOf(query);
                const start = Math.max(0, idx - 30);
                const end = Math.min(originalText.length, idx + query.length + 40);
                let snippet = originalText.substring(start, end).trim();
                
                if (start > 0) snippet = "..." + snippet;
                if (end < originalText.length) snippet = snippet + "...";
                
                results.push({
                    type: 'content',
                    tabId: tabId,
                    category: catName,
                    snippet: snippet,
                    element: el
                });
            }
        });
    });
    
    // Render results
    if (results.length === 0) {
        const noResults = document.createElement("div");
        noResults.className = "no-results-item";
        noResults.textContent = currentLang === 'EN' ? "No results found." : "Sonuç bulunamadı.";
        dropdown.appendChild(noResults);
        return;
    }
    
    // Limit to top 8 search results for premium look/performance
    results.slice(0, 8).forEach(res => {
        const item = document.createElement("div");
        item.className = "search-result-item";
        
        // Highlight keywords in category and snippets
        const highlightedSnippet = highlightMatch(res.snippet, val);
        
        item.innerHTML = `
            <span class="result-category">${res.category}</span>
            <span class="result-snippet">${highlightedSnippet}</span>
        `;
        
        // Click action: navigate, highlight and scroll
        item.addEventListener("click", () => {
            dropdown.style.display = "none";
            
            // Switch to destination tab
            switchTab(res.tabId);
            
            if (res.type === 'content' && res.element) {
                // Focus and flash highlight the text block
                setTimeout(() => {
                    res.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    
                    // Flash highlight animation
                    res.element.classList.remove("highlight-flash");
                    void res.element.offsetWidth; // force reflow
                    res.element.classList.add("highlight-flash");
                    
                    // Temporarily highlight the text query inside
                    const orig = res.element.getAttribute("data-original-text") || res.element.textContent;
                    if (!res.element.getAttribute("data-original-text")) {
                        res.element.setAttribute("data-original-text", orig);
                    }
                    res.element.innerHTML = highlightMatch(orig, val);
                }, 150);
            }
        });
        
        dropdown.appendChild(item);
    });
}

// FID Form Controls
function resetFIDForm() {
    document.getElementById("fidForm").reset();
    document.getElementById("fidOutputContainer").style.display = "none";
    showToast(currentLang === 'EN' ? "Form cleared." : "Form temizlendi.");
}

function generateFIDCard() {
    const name = document.getElementById("fidName").value.trim();
    const gender = document.getElementById("fidGender").value;
    const physical = document.getElementById("fidPhysical").value.trim();
    const size = document.getElementById("fidSize").value.trim();
    const scars = document.getElementById("fidScars").value.trim();
    const vehicle = document.getElementById("fidVehicle").value.trim();
    const reason = document.getElementById("fidReason").value.trim();
    
    if (!name) {
        showToast(currentLang === 'EN' ? "Full Name is required!" : "Ad Soyad alanı zorunludur!", true);
        return;
    }
    
    const now = new Date();
    const timestamp = now.toLocaleString(currentLang === 'EN' ? 'en-US' : 'tr-TR');
    
    // Construct formatting
    let cardText = `==================================================\n`;
    cardText += `             FIELD INTERVIEW CARD (FID)           \n`;
    cardText += `             LOS ANGELES POLICE DEPT              \n`;
    cardText += `==================================================\n`;
    cardText += `DATE/TIME   : ${timestamp}\n`;
    cardText += `SUBJECT     : ${name.toUpperCase()}\n`;
    cardText += `GENDER      : ${gender.toUpperCase()}\n`;
    cardText += `DESCRIPTORS : ${physical || "N/A"}\n`;
    cardText += `HGT / WGT   : ${size || "N/A"}\n`;
    cardText += `SCARS/TATTOO: ${scars || "N/A"}\n`;
    cardText += `VEHICLE     : ${vehicle || "N/A"}\n`;
    cardText += `--------------------------------------------------\n`;
    cardText += `REASON FOR CONTACT:\n`;
    cardText += `${reason || "Suspicious subject contact / field query."}\n`;
    cardText += `==================================================\n`;
    
    const outputContainer = document.getElementById("fidOutputContainer");
    const outputPre = document.getElementById("fidTextOutput");
    
    outputPre.textContent = cardText;
    outputContainer.style.display = "block";
    
    // Scroll output into view
    outputContainer.scrollIntoView({ behavior: 'smooth' });
    
    // Copy automatically
    navigator.clipboard.writeText(cardText)
        .then(() => {
            showToast(currentLang === 'EN' ? "FID Card generated and copied to clipboard!" : "FID Kartı oluşturuldu ve panoya kopyalandı!");
        })
        .catch(err => {
            showToast(currentLang === 'EN' ? "Generated. Copy manual using button." : "Oluşturuldu. Butonu kullanarak manuel kopyalayın.");
        });
}

function copyConsoleContent(elementId) {
    const el = document.getElementById(elementId);
    if (el) {
        navigator.clipboard.writeText(el.textContent)
            .then(() => {
                showToast(currentLang === 'EN' ? "Copied to clipboard!" : "Panoya kopyalandı!");
            });
    }
}

// Toast notification helper
function showToast(msg, isWarning = false) {
    const toast = document.getElementById("toast");
    const toastMsg = document.getElementById("toastMsg");
    
    toastMsg.textContent = msg;
    toast.className = "toast show";
    
    if (isWarning) {
        toast.style.borderColor = "var(--color-red)";
        toast.style.backgroundColor = "var(--color-red-light)";
        toast.style.color = "var(--color-red)";
    } else {
        toast.style.borderColor = "var(--border-color)";
        toast.style.backgroundColor = "#1e293b";
        toast.style.color = "#ffffff";
    }
    
    setTimeout(() => {
        toast.className = "toast";
    }, 3000);
}

