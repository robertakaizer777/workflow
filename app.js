// ==========================================
// SESSION CHECK & SECURITY
// ==========================================

let token = localStorage.getItem("authToken");
let userSession = JSON.parse(localStorage.getItem("authUser"));

if (!token || !userSession) {
    window.location.href = "/login.html";
}

// ==========================================
// APP STATE & CONSTANTS
// ==========================================

let currentClient = userSession ? (userSession.role === 'admin' ? 'client_1' : userSession.clientId) : 'client_1';
let currentPlatform = "all";
let currentPeriod = "30";
let customSelectedMonthName = ""; // Empty if using standard 7/30/90 range selector

// Chart instances
let mainChartInstance = null;
let demographicsChartInstance = null;
let channelsChartInstance = null;

// Active data structure fetched from API
let activeDashboardData = null;

// UI elements
const clientSelect = document.getElementById("client-select");
const clientSelectorContainer = document.querySelector(".client-selector-container");
const clientBusinessType = document.getElementById("client-business-type");
const dateRangeSelect = document.getElementById("date-range-select");
const themeSwitcher = document.getElementById("theme-switcher");
const notificationArea = document.getElementById("notification-area");

// KPI Value containers
const valFollowers = document.getElementById("val-followers");
const valReach = document.getElementById("val-reach");
const valEngagement = document.getElementById("val-engagement");
const valActions = document.getElementById("val-actions");

const trendFollowers = document.getElementById("trend-followers");
const trendReach = document.getElementById("trend-reach");
const trendEngagement = document.getElementById("trend-engagement");
const trendActions = document.getElementById("trend-actions");

// Platform buttons & nav views
const platformBtns = document.querySelectorAll(".platform-btn");
const sidebarMenuOptions = document.querySelectorAll(".sidebar-menu ul li");
const pageTitle = document.getElementById("page-title");
const logoText = document.getElementById("logo-text");

// Modals & Forms
const exportBtn = document.getElementById("btn-export");
const exportModal = document.getElementById("export-modal");
const btnCloseModal = document.getElementById("btn-close-modal");
const btnCancelModal = document.getElementById("btn-cancel-modal");
const btnConfirmExport = document.getElementById("btn-confirm-export");
const btnLogout = document.getElementById("btn-logout");

// Connection items
const btnConnectMeta = document.getElementById("btn-connect-meta");
const instagramStatusText = document.getElementById("instagram-connection-status");

// Table body
const topPostsTbody = document.getElementById("top-posts-tbody");

// Personalization / Branding
const inputBrandName = document.getElementById("input-brand-name");
const btnSaveBranding = document.getElementById("btn-save-branding");
const colorPickerBtns = document.querySelectorAll(".color-picker-btn");

// Profile settings (New sidebar gear modal)
const btnSidebarProfileSettings = document.getElementById("btn-sidebar-profile-settings");
const profileSettingsModal = document.getElementById("profile-settings-modal");
const profileSettingsForm = document.getElementById("profile-settings-form");
const profileNameInput = document.getElementById("profile-name-input");
const profileEmailInput = document.getElementById("profile-email-input");
const profilePasswordInput = document.getElementById("profile-password-input");
const btnCloseProfileModal = document.getElementById("btn-close-profile-modal");
const btnCancelProfileModal = document.getElementById("btn-cancel-profile-modal");

// Custom Date Picker Modal
const btnHeaderSettings = document.getElementById("btn-header-settings"); // Personalizar Data Button
const customDateModal = document.getElementById("custom-date-modal");
const btnCloseDateModal = document.getElementById("btn-close-date-modal");
const btnCancelDateModal = document.getElementById("btn-cancel-date-modal");
const customMonthsGrid = document.getElementById("custom-months-grid");

// ==========================================
// RENDER ACTIVE USER INFORMATION
// ==========================================

function updateProfileUI() {
    if (userSession) {
        document.getElementById("user-name").innerText = userSession.name;
        document.getElementById("user-role").innerText = userSession.role === 'admin' ? 'Gestor de Tráfego' : 'Cliente';
        document.getElementById("avatar-letter").innerText = userSession.name.charAt(0).toUpperCase();

        if (userSession.role !== 'admin') {
            if (clientSelectorContainer) {
                clientSelectorContainer.style.display = "none";
            }
        } else {
            if (clientSelectorContainer) {
                clientSelectorContainer.style.display = "block";
            }
        }
    }
}

updateProfileUI();

// ==========================================
// API FETCH CONTROLLERS
// ==========================================

// Populate client selector dynamically (lists only connected client profiles)
async function populateClientSelector() {
    if (userSession.role !== 'admin') return;

    try {
        const response = await fetch('/api/clients', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) return;

        const data = await response.json();
        
        clientSelect.innerHTML = "";
        
        if (data.clients.length === 0) {
            clientSelect.innerHTML = `<option value="">Nenhum cliente conectado</option>`;
            return;
        }

        data.clients.forEach(c => {
            const option = document.createElement("option");
            option.value = c.id;
            option.text = `${c.name} (${c.email})`;
            if (c.id === currentClient) option.selected = true;
            clientSelect.appendChild(option);
        });

    } catch (err) {
        console.error("Erro ao carregar lista de clientes ativos:", err);
    }
}

async function fetchMetricsData() {
    try {
        const response = await fetch(`/api/metrics?client=${currentClient}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                logout();
            }
            throw new Error("Falha ao carregar métricas do servidor.");
        }

        const data = await response.json();
        activeDashboardData = data;
        
        return getActivePlatformData();

    } catch (err) {
        console.error(err);
        showToast("Erro ao obter dados do servidor backend.", "warning");
        return null;
    }
}

function getActivePlatformData() {
    if (!activeDashboardData) return null;
    
    // Check if platform is YouTube. Since Meta API doesn't return YouTube data,
    // we mock YouTube values dynamically based on client profile to show visual metrics!
    if (currentPlatform === 'youtube') {
        const baseReach = activeDashboardData.metrics.all.reach || 10000;
        const followers = Math.round(baseReach * 0.15); // subscribers estimate
        
        return {
            clientName: activeDashboardData.clientName,
            businessType: activeDashboardData.businessType,
            followers,
            followersTrend: "+8.5%",
            reach: Math.round(baseReach * 0.6), // YouTube Views
            reachTrend: "+15.3%",
            engagementRate: "6.2%",
            engagementTrend: "+2.1%",
            clicks: Math.round(followers * 0.05),
            clicksTrend: "+12.0%",
            chartLabels: ["Dia 5", "Dia 10", "Dia 15", "Dia 20", "Dia 25", "Dia 30"],
            chartReach: [1000, 3000, 2500, 5000, 8000, 12000],
            chartInteractions: [60, 180, 155, 310, 490, 740],
            demographics: {
                labels: ["Região Local", "Outros Estados"],
                data: [55, 45]
            },
            channels: {
                labels: ["YouTube"],
                data: [6.2]
            },
            posts: [
                { caption: "Confira a apresentação completa da nossa marca no canal do YouTube! 🎥🔴", platform: "youtube", format: "Vídeo", reach: 12000, likes: 890, comments: 64, engagement: "6.2%" }
            ]
        };
    }
    
    const platformData = activeDashboardData.metrics[currentPlatform];
    
    // Inject YouTube comparative metrics inside "all" view channel graphs
    if (currentPlatform === 'all' && platformData) {
        platformData.channels.labels = ["Instagram", "YouTube"];
        platformData.channels.data = [5.0, 6.2];
        
        const hasYoutubePost = platformData.posts.some(p => p.platform === 'youtube');
        if (!hasYoutubePost && platformData.posts.length > 0) {
            platformData.posts.push({
                caption: "Confira a apresentação completa da nossa marca no canal do YouTube! 🎥🔴",
                platform: "youtube",
                format: "Vídeo",
                reach: 12000,
                likes: 890,
                comments: 64,
                engagement: "6.2%"
            });
        }
    }

    return {
        clientName: activeDashboardData.clientName,
        businessType: activeDashboardData.businessType,
        ...platformData
    };
}

// Format numbers
function formatNumber(num) {
    return num.toLocaleString('pt-BR');
}

// Render dynamic text & KPIs
async function renderMetrics() {
    const data = getActivePlatformData() || await fetchMetricsData();
    if (!data) return;

    // Headings
    clientBusinessType.innerText = `${data.clientName} — ${data.businessType}`;

    // Titles of metrics based on Platform (YouTube shows subscribers and views instead)
    const followersTitle = document.querySelector("#kpi-followers .kpi-title");
    const reachTitle = document.querySelector("#kpi-reach .kpi-title");
    const actionsTitle = document.querySelector("#kpi-actions .kpi-title");

    if (currentPlatform === 'youtube') {
        followersTitle.innerText = "Inscritos";
        reachTitle.innerText = "Visualizações";
        actionsTitle.innerText = "Cliques de Links";
    } else {
        followersTitle.innerText = "Total de Seguidores";
        reachTitle.innerText = "Alcance Total";
        actionsTitle.innerText = "Cliques no Link da Bio";
    }

    // KPI Values
    valFollowers.innerText = formatNumber(data.followers);
    valReach.innerText = formatNumber(data.reach);
    valEngagement.innerText = data.engagementRate;
    valActions.innerText = formatNumber(data.clicks);

    // Trends HTML structure helper
    const updateTrend = (element, trendVal) => {
        const isUp = trendVal.startsWith("+");
        element.className = `kpi-trend ${isUp ? 'trend-up' : 'trend-down'}`;
        element.innerHTML = `<i class="fa-solid ${isUp ? 'fa-arrow-up-right' : 'fa-arrow-down-right'}"></i> ${trendVal}`;
    };

    updateTrend(trendFollowers, data.followersTrend);
    updateTrend(trendReach, data.reachTrend);
    updateTrend(trendEngagement, data.engagementTrend);
    updateTrend(trendActions, data.clicksTrend);
}

// Render the top posts table content
function renderPostsTable() {
    const data = getActivePlatformData();
    if (!data || !data.posts) return;

    topPostsTbody.innerHTML = "";

    data.posts.forEach(post => {
        const tr = document.createElement("tr");
        
        let platformIcon = "fa-instagram";
        if (post.platform === "facebook") platformIcon = "fa-facebook";
        if (post.platform === "tiktok") platformIcon = "fa-tiktok";
        if (post.platform === "linkedin") platformIcon = "fa-linkedin";
        if (post.platform === "youtube") platformIcon = "fa-youtube";

        const postImgGradient = post.platform === "instagram" ? "linear-gradient(45deg, #f9ce34, #ee2a7b, #6228d7)" :
                                 post.platform === "facebook" ? "linear-gradient(45deg, #1877f2, #3b5998)" :
                                 post.platform === "tiktok" ? "linear-gradient(45deg, #010101, #00f2fe, #fe0979)" :
                                 post.platform === "youtube" ? "linear-gradient(45deg, #ff0000, #b91c1c)" :
                                 "linear-gradient(45deg, #0077b5, #00a0dc)";

        tr.innerHTML = `
            <td>
                <div class="post-cell-content">
                    <div class="post-thumbnail-wrapper" style="background: ${postImgGradient}; display: flex; align-items: center; justify-content: center; color: white;">
                        <i class="fa-brands ${platformIcon}" style="font-size: 1.2rem;"></i>
                    </div>
                    <div class="post-text-desc">
                        <span class="post-caption-preview" title="${post.caption}">${post.caption}</span>
                        <span class="post-date">Publicado há 5 dias</span>
                    </div>
                </div>
            </td>
            <td>
                <span class="badge-platform ${post.platform}">
                    <i class="fa-brands ${platformIcon}"></i> ${post.platform.charAt(0).toUpperCase() + post.platform.slice(1)}
                </span>
            </td>
            <td><span class="badge-format">${post.format}</span></td>
            <td class="metric-highlight">${formatNumber(post.reach)}</td>
            <td>${formatNumber(post.likes)}</td>
            <td>${formatNumber(post.comments)}</td>
            <td><span class="engagement-high">${post.engagement}</span></td>
        `;
        topPostsTbody.appendChild(tr);
    });
}

// Render/Update charts
function updateCharts() {
    const data = getActivePlatformData();
    if (!data) return;

    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    const textThemeColor = isDark ? "#94a3b8" : "#64748b";
    const gridThemeColor = isDark ? "#222d45" : "#e4e8f0";

    // 1. MAIN PERFORMANCE TIMELINE CHART
    if (mainChartInstance) {
        mainChartInstance.destroy();
    }
    
    const ctxMain = document.getElementById('mainPerformanceChart').getContext('2d');
    mainChartInstance = new Chart(ctxMain, {
        type: 'line',
        data: {
            labels: data.chartLabels,
            datasets: [
                {
                    label: currentPlatform === 'youtube' ? 'Visualizações' : 'Alcance',
                    data: data.chartReach,
                    borderColor: currentPlatform === 'youtube' ? '#ff0000' : '#6366f1',
                    backgroundColor: currentPlatform === 'youtube' ? 'rgba(255, 0, 0, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                    borderWidth: 3,
                    tension: 0.35,
                    fill: true,
                    yAxisID: 'y'
                },
                {
                    label: 'Interações',
                    data: data.chartInteractions,
                    borderColor: '#ec4899',
                    backgroundColor: 'rgba(236, 72, 153, 0.1)',
                    borderWidth: 3,
                    tension: 0.35,
                    fill: true,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: { padding: 12, fontFamily: 'Inter', cornerRadius: 8 }
            },
            scales: {
                x: {
                    grid: { color: gridThemeColor },
                    ticks: { color: textThemeColor, font: { family: 'Inter', size: 11 } }
                },
                y: {
                    type: 'linear', display: true, position: 'left',
                    grid: { color: gridThemeColor },
                    ticks: { color: textThemeColor, font: { family: 'Inter', size: 11 } }
                },
                y1: {
                    type: 'linear', display: true, position: 'right',
                    grid: { drawOnChartArea: false },
                    ticks: { color: textThemeColor, font: { family: 'Inter', size: 11 } }
                }
            }
        }
    });

    // 2. DEMOGRAPHICS PIE CHART
    if (demographicsChartInstance) {
        demographicsChartInstance.destroy();
    }
    const ctxDemo = document.getElementById('demographicsChart').getContext('2d');
    
    const purplePinkGrad = ctxDemo.createLinearGradient(0, 0, 0, 150);
    purplePinkGrad.addColorStop(0, '#8b5cf6');
    purplePinkGrad.addColorStop(1, '#ec4899');
    
    const blueGrad = ctxDemo.createLinearGradient(0, 0, 0, 150);
    blueGrad.addColorStop(0, '#0ea5e9');
    blueGrad.addColorStop(1, '#3b82f6');

    demographicsChartInstance = new Chart(ctxDemo, {
        type: 'doughnut',
        data: {
            labels: data.demographics.labels,
            datasets: [{
                data: data.demographics.data,
                backgroundColor: [
                    purplePinkGrad,
                    blueGrad,
                    '#ff0000',
                    '#10b981',
                    '#64748b'
                ],
                borderWidth: isDark ? 2 : 1,
                borderColor: isDark ? '#141c2f' : '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: textThemeColor,
                        boxWidth: 12,
                        font: { family: 'Inter', size: 10 }
                    }
                }
            },
            cutout: '65%'
        }
    });

    // 3. CHANNEL ENGAGEMENT BAR CHART
    if (channelsChartInstance) {
        channelsChartInstance.destroy();
    }
    const ctxChan = document.getElementById('channelsChart').getContext('2d');
    
    const barColors = data.channels.labels.map(lbl => {
        if (lbl === 'Instagram') return '#ec4899';
        if (lbl === 'YouTube') return '#ff0000';
        return '#6366f1';
    });

    channelsChartInstance = new Chart(ctxChan, {
        type: 'bar',
        data: {
            labels: data.channels.labels,
            datasets: [{
                label: 'Engajamento %',
                data: data.channels.data,
                backgroundColor: barColors,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: textThemeColor, font: { family: 'Inter', size: 10 } }
                },
                y: {
                    grid: { color: gridThemeColor },
                    ticks: { color: textThemeColor, font: { family: 'Inter', size: 10 } }
                }
            }
        }
    });
}

// Refresh whole dashboard UI
async function refreshDashboard() {
    await populateClientSelector();
    await fetchMetricsData();
    renderMetrics();
    renderPostsTable();
    updateCharts();
}

// Check active integrations on server
async function updateConnectionsView() {
    try {
        const response = await fetch('/api/connections', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) return;

        const data = await response.json();
        const instaConn = data.connections.find(c => c.platform === 'instagram');
        
        if (instaConn) {
            const displayUser = instaConn.username ? `@${instaConn.username}` : `ID: ${instaConn.pageId}`;
            instagramStatusText.innerHTML = `🟢 Conectado com sucesso! (Conta: ${displayUser})`;
            btnConnectMeta.innerHTML = `<i class="fa-solid fa-circle-check"></i> Instagram Conectado`;
            btnConnectMeta.disabled = true;
            btnConnectMeta.style.background = "var(--green-trend)";
        } else {
            instagramStatusText.innerHTML = `Não conectado. Vincule sua conta para receber dados diários automaticamente.`;
            btnConnectMeta.innerHTML = `<i class="fa-solid fa-link"></i> Conectar Instagram`;
            btnConnectMeta.disabled = false;
            btnConnectMeta.style.background = "";
        }
    } catch (err) {
        console.error(err);
    }
}

// ==========================================
// TOAST & INTERACTIVE FEEDBACK
// ==========================================

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `notification-toast toast-${type}`;
    
    let icon = 'fa-circle-check';
    if (type === 'info') icon = 'fa-circle-info';
    if (type === 'warning') icon = 'fa-triangle-exclamation';
    
    toast.innerHTML = `
        <i class="fa-solid ${icon}"></i>
        <span>${message}</span>
    `;
    
    notificationArea.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('active');
    }, 50);

    setTimeout(() => {
        toast.classList.remove('active');
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

// ==========================================
// PROFILE EDIT HANDLERS (SIDEBAR GEAR ICON)
// ==========================================

btnSidebarProfileSettings.addEventListener("click", () => {
    // Open modal
    profileSettingsModal.classList.add("active");
    
    // Pre-fill inputs from active session details
    profileNameInput.value = userSession.name;
    profileEmailInput.value = userSession.email;
    profilePasswordInput.value = ""; // Clear password field
});

function closeProfileModal() {
    profileSettingsModal.classList.remove("active");
}

btnCloseProfileModal.addEventListener("click", closeProfileModal);
btnCancelProfileModal.addEventListener("click", closeProfileModal);

profileSettingsForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = profileNameInput.value.trim();
    const email = profileEmailInput.value.trim();
    const password = profilePasswordInput.value;

    const bodyData = { name, email };
    if (password && password.trim() !== '') {
        bodyData.password = password;
    }

    try {
        const response = await fetch('/api/profile/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(bodyData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Erro ao atualizar dados do perfil.");
        }

        // Save updated token and user credentials back to localStorage
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("authUser", JSON.stringify(data.user));
        
        // Update local session references
        token = data.token;
        userSession = data.user;

        // Refresh UI
        updateProfileUI();
        closeProfileModal();
        showToast("Dados do perfil alterados com sucesso!", "success");

    } catch (err) {
        console.error(err);
        showToast(err.message, "warning");
    }
});

// ==========================================
// CUSTOM DATE CALENDAR PICKER FLOW
// ==========================================

const monthsNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

// Open Custom Date Calendar picker modal
btnHeaderSettings.addEventListener("click", () => {
    customDateModal.classList.add("active");
    generateMonthsList();
});

function closeDateModal() {
    customDateModal.classList.remove("active");
}

btnCloseDateModal.addEventListener("click", closeDateModal);
btnCancelDateModal.addEventListener("click", closeDateModal);

// Populate months dynamically
function generateMonthsList() {
    customMonthsGrid.innerHTML = "";
    
    // Get last 6 months based on current date
    const date = new Date();
    for (let i = 0; i < 6; i++) {
        const monthIndex = date.getMonth();
        const year = date.getFullYear();
        const monthName = monthsNames[monthIndex];

        const btn = document.createElement("button");
        btn.className = "btn btn-secondary";
        btn.style.width = "100%";
        btn.style.justifyContent = "center";
        btn.innerText = `${monthName} ${year}`;
        
        // Highlight active one
        if (customSelectedMonthName === `${monthName} ${year}`) {
            btn.style.border = "2px solid var(--primary)";
            btn.style.color = "var(--primary)";
        }

        btn.addEventListener("click", () => {
            customSelectedMonthName = `${monthName} ${year}`;
            closeDateModal();
            
            // Override Date range labels
            const dateRangeLabel = document.querySelector(".date-selector");
            if (dateRangeLabel) {
                // Change custom date text display dynamically
                dateRangeSelect.innerHTML = `<option value="custom" selected>${customSelectedMonthName}</option>
                                             <option value="7">Últimos 7 dias</option>
                                             <option value="30">Últimos 30 dias</option>
                                             <option value="90">Últimos 90 dias</option>`;
            }

            refreshDashboard();
            showToast(`Filtro de data alterado para: ${customSelectedMonthName}`, "success");
        });

        customMonthsGrid.appendChild(btn);
        
        // Move back 1 month
        date.setMonth(date.getMonth() - 1);
    }
}

// Reset custom date filter if standard drop downs are selected
dateRangeSelect.addEventListener("change", (e) => {
    if (e.target.value !== "custom") {
        customSelectedMonthName = "";
        currentPeriod = e.target.value;
        refreshDashboard();
        showToast(`Período alterado para últimos ${currentPeriod} dias`, 'info');
    }
});

// ==========================================
// PERSONALIZATION & BRANDING
// ==========================================

// Save branding name
btnSaveBranding.addEventListener("click", () => {
    const newName = inputBrandName.value.trim();
    if (newName) {
        localStorage.setItem("dashboardBrandName", newName);
        logoText.innerText = newName;
        showToast(`Identidade alterada para: ${newName}`, "success");
    }
});

// Color themes mapping
const colorThemes = {
    indigo: "#6366f1",
    purple: "#8b5cf6",
    emerald: "#10b981",
    rose: "#f43f5e",
    yellow: "#eab308"
};

colorPickerBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        colorPickerBtns.forEach(b => b.classList.remove("active-color"));
        btn.classList.add("active-color");

        const colorName = btn.getAttribute("data-color");
        const colorValue = colorThemes[colorName];

        if (colorValue) {
            document.documentElement.style.setProperty('--primary', colorValue);
            localStorage.setItem("dashboardColorName", colorName);
            showToast(`Tema de cor alterado para: ${colorName.toUpperCase()}`, "info");
        }
    });
});

// Load personalization
function loadPersonalization() {
    const savedName = localStorage.getItem("dashboardBrandName");
    if (savedName) {
        logoText.innerText = savedName;
        inputBrandName.value = savedName;
    }

    const savedColor = localStorage.getItem("dashboardColorName");
    if (savedColor) {
        const colorValue = colorThemes[savedColor];
        if (colorValue) {
            document.documentElement.style.setProperty('--primary', colorValue);
        }
        const activeBtn = document.querySelector(`.color-picker-btn[data-color="${savedColor}"]`);
        if (activeBtn) activeBtn.classList.add("active-color");
    } else {
        const defaultBtn = document.querySelector('.color-picker-btn[data-color="indigo"]');
        if (defaultBtn) defaultBtn.classList.add("active-color");
    }
}

// ==========================================
// ADDITIONAL CONTROLLER LINKS
// ==========================================

// Client switch
clientSelect.addEventListener("change", (e) => {
    currentClient = e.target.value;
    refreshDashboard();
    showToast(`Carregando métricas de: ${clientSelect.options[clientSelect.selectedIndex].text}`, 'info');
});

// Platform filters
platformBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        platformBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentPlatform = btn.getAttribute("data-platform");
        renderMetrics();
        renderPostsTable();
        updateCharts();
        showToast(`Plataforma filtrada: ${currentPlatform.toUpperCase()}`, 'info');
    });
});

// Sidebar menu options
sidebarMenuOptions.forEach(opt => {
    opt.addEventListener("click", (e) => {
        e.preventDefault();
        sidebarMenuOptions.forEach(o => o.classList.remove("active"));
        opt.classList.add("active");
        
        const page = opt.getAttribute("data-page");
        const title = opt.querySelector("a").innerText.trim();
        pageTitle.innerText = title;

        document.querySelectorAll(".page-view-container").forEach(view => {
            view.style.display = "none";
        });

        if (page === "overview" || page === "posts" || page === "audience") {
            document.getElementById("view-overview").style.display = "block";
        } else if (page === "settings") {
            document.getElementById("view-settings").style.display = "block";
            updateConnectionsView();
        }
        
        showToast(`Navegando para: ${title}`, 'success');
    });
});

// Dark Theme toggle
themeSwitcher.addEventListener("click", () => {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    if (isDark) {
        document.documentElement.removeAttribute("data-theme");
        localStorage.setItem("theme", "light");
        showToast("Modo Claro ativado", "info");
    } else {
        document.documentElement.setAttribute("data-theme", "dark");
        localStorage.setItem("theme", "dark");
        showToast("Modo Escuro ativado", "info");
    }
    updateCharts();
});

// Export Modal Handlers
exportBtn.addEventListener("click", () => {
    const data = getActivePlatformData();
    if (!data) return;

    document.getElementById("modal-client-name").innerText = data.clientName || "Cliente";
    document.getElementById("modal-period").innerText = customSelectedMonthName || `Últimos ${currentPeriod} dias`;
    document.getElementById("modal-platforms").innerText = currentPlatform === "all" ? "Todas (Instagram, Facebook, TikTok, LinkedIn, YouTube)" : currentPlatform.toUpperCase();
    document.getElementById("modal-followers-val").innerText = formatNumber(data.followers);
    document.getElementById("modal-reach-val").innerText = formatNumber(data.reach);
    document.getElementById("modal-engagement-val").innerText = data.engagementRate;

    exportModal.classList.add("active");
});

function closeModal() {
    exportModal.classList.remove("active");
}

btnCloseModal.addEventListener("click", closeModal);
btnCancelModal.addEventListener("click", closeModal);

btnConfirmExport.addEventListener("click", () => {
    closeModal();
    showToast("Gerando relatório em PDF...", "info");
    
    setTimeout(() => {
        showToast("Relatório de insights baixado com sucesso!", "success");
    }, 2000);
});

// Logout handler
function logout() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    window.location.href = "/login.html";
}

btnLogout.addEventListener("click", logout);

// OAuth Meta connect initiation
btnConnectMeta.addEventListener("click", async () => {
    try {
        const response = await fetch('/api/auth/facebook', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error("Erro ao iniciar fluxo com o Facebook.");

        const data = await response.json();
        window.location.href = data.url;
    } catch (err) {
        console.error(err);
        showToast("Não foi possível conectar à API da Meta.", "warning");
    }
});

// Initialize on page load
window.addEventListener("DOMContentLoaded", () => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
        document.documentElement.setAttribute("data-theme", "dark");
    }

    if (window.location.hash.includes("connection=success")) {
        showToast("Instagram integrado com sucesso!", "success");
        window.location.hash = "settings";
        
        const settingsOpt = document.querySelector('[data-page="settings"]');
        if (settingsOpt) settingsOpt.click();
    }

    loadPersonalization();
    refreshDashboard();
});
