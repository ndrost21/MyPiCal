const APP_VERSION = 'v1.2.3';
const versionEl = document.getElementById('version-badge');
if (versionEl) {
    versionEl.innerText = APP_VERSION;
}

// Apply Full 12-Month Seasonal Themes
function applySeasonalTheme() {
    const root = document.documentElement;
    const month = new Date().getMonth(); // 0 = Jan ... 11 = Dec

    const themes = {
        0: { // January - Winter Navy & Frost
            '--page-bg': '#0a0f1d', '--grid-bg': '#111827', '--header-bg': '#1e293b',
            '--border-color': '#38bdf8', '--muted-text': '#7dd3fc', '--dim-bg': 'rgba(15, 23, 42, 0.5)',
            '--event-bg-1': '#0284c7', '--event-bg-2': '#1e40af'
        },
        1: { // February - Valentine Deep Rose & Wine
            '--page-bg': '#120509', '--grid-bg': '#1c0a12', '--header-bg': '#4c0519',
            '--border-color': '#f43f5e', '--muted-text': '#fb7185', '--dim-bg': 'rgba(76, 5, 25, 0.4)',
            '--event-bg-1': '#be123c', '--event-bg-2': '#881337'
        },
        2: { // March - St. Patrick Emerald & Gold
            '--page-bg': '#021a12', '--grid-bg': '#062c1e', '--header-bg': '#064e3b',
            '--border-color': '#10b981', '--muted-text': '#34d399', '--dim-bg': 'rgba(6, 78, 59, 0.4)',
            '--event-bg-1': '#047857', '--event-bg-2': '#15803d'
        },
        3: { // April - Spring Bloom & Pastel Teal
            '--page-bg': '#041f1e', '--grid-bg': '#0a2e2c', '--header-bg': '#115e59',
            '--border-color': '#2dd4bf', '--muted-text': '#5eead4', '--dim-bg': 'rgba(17, 94, 89, 0.4)',
            '--event-bg-1': '#0d9488', '--event-bg-2': '#0891b2'
        },
        4: { // May - Early Summer Citrus & Golden Sun
            '--page-bg': '#1c1202', '--grid-bg': '#281b04', '--header-bg': '#78350f',
            '--border-color': '#f59e0b', '--muted-text': '#fbbf24', '--dim-bg': 'rgba(120, 53, 15, 0.4)',
            '--event-bg-1': '#d97706', '--event-bg-2': '#b45309'
        },
        5: { // June - Summer Sky & Ocean Blue
            '--page-bg': '#03192e', '--grid-bg': '#072642', '--header-bg': '#0369a1',
            '--border-color': '#38bdf8', '--muted-text': '#7dd3fc', '--dim-bg': 'rgba(3, 105, 161, 0.4)',
            '--event-bg-1': '#0284c7', '--event-bg-2': '#0e7490'
        },
        6: { // July - Patriotic Navy, Crimson & White
            '--page-bg': '#080c1a', '--grid-bg': '#0f172a', '--header-bg': '#1e1b4b',
            '--border-color': '#ef4444', '--muted-text': '#60a5fa', '--dim-bg': 'rgba(30, 27, 75, 0.5)',
            '--event-bg-1': '#b91c1c', '--event-bg-2': '#1d4ed8'
        },
        7: { // August - Sunset Amber & Copper
            '--page-bg': '#1a0a03', '--grid-bg': '#281207', '--header-bg': '#7c2d12',
            '--border-color': '#f97316', '--muted-text': '#fdba74', '--dim-bg': 'rgba(124, 45, 18, 0.4)',
            '--event-bg-1': '#c2410c', '--event-bg-2': '#ea580c'
        },
        8: { // September - Autumn Harvest & Deep Wine
            '--page-bg': '#18080a', '--grid-bg': '#260f13', '--header-bg': '#701a2d',
            '--border-color': '#eab308', '--muted-text': '#fde047', '--dim-bg': 'rgba(112, 26, 45, 0.4)',
            '--event-bg-1': '#9f1239', '--event-bg-2': '#a16207'
        },
        9: { // October - Halloween Spooky Purple & Orange
            '--page-bg': '#09090b', '--grid-bg': '#18181b', '--header-bg': '#3b0764',
            '--border-color': '#ea580c', '--muted-text': '#f97316', '--dim-bg': 'rgba(59, 7, 100, 0.35)',
            '--event-bg-1': '#c2410c', '--event-bg-2': '#6b21a8'
        },
        10: { // November - Thanksgiving Amber & Warm Wood
            '--page-bg': '#140c07', '--grid-bg': '#1f140d', '--header-bg': '#451a03',
            '--border-color': '#d97706', '--muted-text': '#f59e0b', '--dim-bg': 'rgba(69, 26, 3, 0.4)',
            '--event-bg-1': '#9a3412', '--event-bg-2': '#854d0e'
        },
        11: { // December - Holiday Winter Sky & Evergreen
            '--page-bg': '#08131d', '--grid-bg': '#0f1f2e', '--header-bg': '#0c4a6e',
            '--border-color': '#38bdf8', '--muted-text': '#7dd3fc', '--dim-bg': 'rgba(8, 47, 73, 0.4)',
            '--event-bg-1': '#0284c7', '--event-bg-2': '#047857'
        }
    };

    const selectedTheme = themes[month] || themes[9];
    for (const [key, value] of Object.entries(selectedTheme)) {
        root.style.setProperty(key, value);
    }
}

// Clock Logic
function updateClock() {
    const now = new Date();
    document.getElementById('clock').innerText = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
    document.getElementById('date').innerText = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
}
setInterval(updateClock, 1000);
updateClock();

// Header Photo Banner Logic
let photoList = [];
let photoIndex = 0;
let activeSlot = 1;
let slideshowInterval = null;

async function initHeaderBanner() {
    if (slideshowInterval) {
        clearInterval(slideshowInterval);
        slideshowInterval = null;
    }

    try {
        const response = await fetch('photos.json');
        if (response.ok) {
            photoList = await response.json();
            if (photoList && photoList.length > 0) {
                const bannerContainer = document.getElementById('banner-container');
                bannerContainer.style.display = 'block';
                showNextPhoto();
                if (photoList.length > 1) {
                    slideshowInterval = setInterval(showNextPhoto, 12000);
                }
                return;
            }
        }
    } catch (e) {
        // No photos.json found - fall back to monthly image
    }

    loadMonthlyHeaderImage();
}

const MONTH_ABBREVIATIONS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function loadMonthlyHeaderImage() {
    const bannerContainer = document.getElementById('banner-container');
    const img1 = document.getElementById('banner-img-1');
    const img2 = document.getElementById('banner-img-2');

    const monthIndex = new Date().getMonth();
    const monthAbbr = MONTH_ABBREVIATIONS[monthIndex];

    const primaryFilename = `${monthAbbr}_pic.png`;
    const fallbackFilename = `${monthAbbr.toLowerCase()}_pic.png`;

    const tryLoad = (src, fallbackSrc) => {
        const testImg = new Image();
        testImg.onload = () => {
            img1.src = src;
            img1.style.opacity = '1';
            if (img2) img2.style.opacity = '0';
            bannerContainer.style.display = 'block';
        };
        testImg.onerror = () => {
            if (fallbackSrc) {
                tryLoad(fallbackSrc, null);
            } else {
                bannerContainer.style.display = 'none';
                img1.src = '';
                img1.style.opacity = '0';
                if (img2) {
                    img2.src = '';
                    img2.style.opacity = '0';
                }
            }
        };
        testImg.src = src;
    };

    tryLoad(primaryFilename, fallbackFilename);
}

function showNextPhoto() {
    if (photoList.length === 0) return;
    
    const nextPhotoUrl = photoList[photoIndex];
    photoIndex = (photoIndex + 1) % photoList.length;

    const img1 = document.getElementById('banner-img-1');
    const img2 = document.getElementById('banner-img-2');

    const activeImg = activeSlot === 1 ? img1 : img2;
    const nextImg = activeSlot === 1 ? img2 : img1;

    nextImg.onload = () => {
        nextImg.style.opacity = '1';
        activeImg.style.opacity = '0';
        activeSlot = activeSlot === 1 ? 2 : 1;
    };
    nextImg.src = nextPhotoUrl;
}

// Seasonal Animations (Spooky for October, Turkey for November)
let seasonalIntervalId = null;

function initSpookyAnimations() {
    const svgs = [
        `<svg viewBox="0 0 24 24" fill="#f8fafc"><path d="M12 2C7.58 2 4 5.58 4 10v9a1 1 0 001.447.894L7 19.118l1.553 1.776a1 1 0 001.494 0L11.6 19.118l1.553 1.776a1 1 0 001.494 0L16.2 19.118l1.553 1.776A1 1 0 0019 19v-9c0-4.42-3.58-8-8-8zm-3 8a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm6 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3z"/></svg>`,
        `<svg viewBox="0 0 24 24" fill="#ea580c"><path d="M12 11c-2.5 0-4.5 1-6 3-1.5-2-3.5-3-6-3 3-4 6-6 12-6s9 2 12 6c-2.5 0-4.5 1-6 3-1.5-2-3.5-3-6-3z"/></svg>`,
        `<svg viewBox="0 0 24 24" fill="#f97316"><path d="M12 2v2a8 8 0 018 8c0 4.42-3.58 8-8 8s-8-3.58-8-8a8 8 0 018-8V2h0z"/></svg>`
    ];

    for (let i = 0; i < 3; i++) {
        const ghost = document.createElement('div');
        ghost.className = 'drifting-ghost';
        ghost.innerHTML = svgs[i % svgs.length];
        ghost.style.top = `${15 + Math.random() * 70}%`;
        ghost.style.animationDuration = `${25 + Math.random() * 15}s`;
        ghost.style.animationDelay = `${i * 9}s`;
        document.body.appendChild(ghost);
    }

    const booMessages = ["👻 BOO!", "🎃 Boo!", "👻 Spooky!", "🦇 Boo!", "💀 Boo!"];
    seasonalIntervalId = setInterval(() => {
        const popup = document.createElement('div');
        popup.className = 'boo-popup';
        popup.innerText = booMessages[Math.floor(Math.random() * booMessages.length)];
        
        const randomX = Math.random() * (window.innerWidth - 300) + 100;
        const randomY = Math.random() * (window.innerHeight - 300) + 100;
        
        popup.style.left = `${randomX}px`;
        popup.style.top = `${randomY}px`;
        
        document.body.appendChild(popup);
        
        setTimeout(() => {
            popup.remove();
        }, 3500);
    }, 18000);
}

function spawnOneTurkey() {
    // Remove any turkey still on screen
    document.querySelectorAll('.roaming-turkey').forEach(el => el.remove());

    const turkey = document.createElement('div');
    turkey.className = 'roaming-turkey';
    turkey.textContent = String.fromCodePoint(0x1F983); // turkey emoji

    // Random vertical position (20-75% of screen height)
    turkey.style.top = (20 + Math.random() * 55) + '%';
    turkey.style.left = '-80px';
    turkey.style.position = 'fixed';
    document.body.appendChild(turkey);

    // Duration: 12-20 seconds to cross screen
    const duration = 12000 + Math.random() * 8000;
    const targetX = window.innerWidth + 80;
    let startTime = null;

    function animate(timestamp) {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const x = progress * targetX;
        const bob = Math.sin(elapsed / 200) * 6; // gentle waddle
        turkey.style.transform = `translateX(${x}px) translateY(${bob}px)`;
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            turkey.remove();
        }
    }
    requestAnimationFrame(animate);
}

function initTurkeyAnimations() {
    spawnOneTurkey();
    seasonalIntervalId = setInterval(spawnOneTurkey, 60000);
}

function updateSeasonalAnimations() {
    const month = new Date().getMonth();
    const existingElements = document.querySelectorAll('.drifting-ghost, .boo-popup, .roaming-turkey, .gobble-popup');

    if (seasonalIntervalId) {
        clearInterval(seasonalIntervalId);
        seasonalIntervalId = null;
    }
    existingElements.forEach(el => el.remove());

    if (month === 9) {
        initSpookyAnimations();
    } else if (month === 10) {
        initTurkeyAnimations();
    }
}

// Calendar Grid Rendering with Today Highlighted
async function buildCalendarGrid() {
    const grid = document.getElementById('calendar-grid');
    grid.innerHTML = ''; 

    const now = new Date();
    const startGrid = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    startGrid.setDate(startGrid.getDate() - startGrid.getDay());
    const endGrid = new Date(startGrid);
    endGrid.setDate(startGrid.getDate() + 34); 

    let currentDate = new Date(startGrid);
    const cells = {};
    const todayForDimming = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    while (currentDate <= endGrid) {
        const dateString = currentDate.toISOString().split('T')[0];
        const cell = document.createElement('div');
        cell.className = 'day-cell flex flex-col';
        
        const isToday = currentDate.toDateString() === now.toDateString();

        if (currentDate < todayForDimming) {
            cell.classList.add('day-dimmed'); 
        } else if (isToday) {
            cell.style.backgroundColor = 'var(--event-bg-1)';
            cell.style.borderColor = '#ffffff';
            cell.style.boxShadow = 'inset 0 0 12px rgba(255, 255, 255, 0.4)';
        }
        
        const dayNum = document.createElement('div');
        dayNum.className = isToday
            ? 'text-right text-base text-white font-black mb-1 bg-black/40 px-2 py-0.5 rounded' 
            : 'text-right text-sm text-muted font-bold mb-1';
        
        dayNum.innerText = currentDate.getDate();
        cell.appendChild(dayNum);
        grid.appendChild(cell);
        cells[dateString] = cell;
        currentDate.setDate(currentDate.getDate() + 1);
    }

    try {
        const response = await fetch('events.json?t=' + Date.now());
        const allEvents = await response.json();

        const dayEventCounts = {};

	allEvents.forEach(event => {
    	const rawDateStr = event.start.dateTime || event.start.date;
    	const eventDateObj = new Date(rawDateStr);
    
    	// Format strictly using local date parts to prevent UTC midnight rollovers
    	const year = eventDateObj.getFullYear();
    	const month = String(eventDateObj.getMonth() + 1).padStart(2, '0');
    	const day = String(eventDateObj.getDate()).padStart(2, '0');
    	const eventDate = `${year}-${month}-${day}`;

            if (cells[eventDate]) {
                if (!dayEventCounts[eventDate]) {
                    dayEventCounts[eventDate] = 0;
                }
                const count = dayEventCounts[eventDate];
                dayEventCounts[eventDate]++;

                const evtDiv = document.createElement('div');
                evtDiv.className = 'event-item';
                
                const bgColor = (count % 2 === 0) ? 'var(--event-bg-1)' : 'var(--event-bg-2)';
                evtDiv.style.backgroundColor = bgColor;
                
                let timeString = event.start.dateTime ? eventDateObj.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }) + ' ' : '';
                evtDiv.innerText = timeString + event.summary;
                cells[eventDate].appendChild(evtDiv);
            }
        });
    } catch (err) { console.error("Waiting for JSON update...", err); }
}

// Automatic Month-Rollover and State Management
let currentActiveMonth = -1;

function refreshMonthlyState() {
    const currentMonth = new Date().getMonth();
    if (currentMonth !== currentActiveMonth) {
        currentActiveMonth = currentMonth;
        applySeasonalTheme();
        initHeaderBanner();
        updateSeasonalAnimations();
    }
}

function refreshDashboard() {
    refreshMonthlyState();
    buildCalendarGrid();
}

// Initialize App
refreshDashboard();

// Check for updates & month rollover every 5 minutes
setInterval(refreshDashboard, 5 * 60 * 1000);