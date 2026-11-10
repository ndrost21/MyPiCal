const APP_VERSION = 'v1.2.5';
const versionEl = document.getElementById('version-badge');
if (versionEl) {
    versionEl.innerText = APP_VERSION;
}

// Helper to determine the active month (supports ?month=0-11 or ?santa query param for testing)
function getActiveMonth() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('month')) {
        const m = parseInt(urlParams.get('month'), 10);
        if (!isNaN(m) && m >= 0 && m <= 11) return m;
    }
    if (urlParams.has('santa')) return 11;
    return new Date().getMonth();
}

// Apply Full 12-Month Seasonal Themes
function applySeasonalTheme() {
    const root = document.documentElement;
    const month = getActiveMonth(); // 0 = Jan ... 11 = Dec

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

    const monthIndex = getActiveMonth();
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

// Seasonal Animations (Spooky for October, Turkey for November, Santa for December)
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

function spawnOneSanta() {
    // Remove any santa still on screen
    document.querySelectorAll('.roaming-santa').forEach(el => el.remove());

    const santa = document.createElement('div');
    santa.className = 'roaming-santa';

    santa.innerHTML = `
        <div class="santa-speech-bubble">HO HO HO! 🎅</div>
        <svg viewBox="0 0 220 75" class="santa-svg">
            <!-- Sparkles / Magic Stardust Trail -->
            <g class="santa-trail" opacity="0.85">
                <circle cx="10" cy="50" r="1.5" fill="#fef08a" />
                <path d="M 22 42 L 24 38 L 26 42 L 30 44 L 26 46 L 24 50 L 22 46 L 18 44 Z" fill="#fbbf24" />
                <circle cx="34" cy="56" r="2" fill="#ffffff" />
                <path d="M 40 32 L 41.5 28 L 43 32 L 47 33.5 L 43 35 L 41.5 39 L 40 35 L 36 33.5 Z" fill="#fde047" />
            </g>
            <!-- Golden Reins -->
            <path d="M 102 44 Q 140 48 178 38" fill="none" stroke="#f59e0b" stroke-width="1.8" stroke-dasharray="3,1" />
            <!-- Sleigh Runners -->
            <line x1="65" y1="58" x2="68" y2="67" stroke="#d97706" stroke-width="2.5" stroke-linecap="round" />
            <line x1="105" y1="58" x2="108" y2="67" stroke="#d97706" stroke-width="2.5" stroke-linecap="round" />
            <path d="M 48 67 L 120 67 Q 134 67 136 55 Q 137 49 132 49 Q 128 49 129 54" fill="none" stroke="#fbbf24" stroke-width="3" stroke-linecap="round" />
            <!-- Toy Sack in Back -->
            <ellipse cx="66" cy="42" rx="14" ry="13" fill="#047857" />
            <rect x="56" y="27" width="10" height="10" rx="1" fill="#f59e0b" />
            <line x1="61" y1="27" x2="61" y2="37" stroke="#dc2626" stroke-width="2" />
            <line x1="56" y1="32" x2="66" y2="32" stroke="#dc2626" stroke-width="2" />
            <circle cx="68" cy="30" r="5" fill="#38bdf8" />
            <!-- Santa Torso & Coat -->
            <path d="M 80 56 Q 80 40 94 40 Q 108 40 108 56 Z" fill="#dc2626" />
            <path d="M 82 50 L 106 50" stroke="#1e293b" stroke-width="4" />
            <rect x="91" y="47" width="6" height="6" fill="#fbbf24" rx="1" />
            <ellipse cx="94" cy="56" rx="14" ry="3.5" fill="#ffffff" />
            <!-- Santa Face & Beard -->
            <circle cx="95" cy="31" r="8" fill="#fecaca" />
            <circle cx="98" cy="30" r="1.5" fill="#1e293b" />
            <circle cx="101" cy="33" r="2" fill="#f87171" opacity="0.6" />
            <path d="M 91 32 Q 95 44 102 38 Q 106 44 102 34 Q 105 32 101 31 Q 95 31 91 32 Z" fill="#ffffff" />
            <ellipse cx="99" cy="33" rx="4" ry="2" fill="#f8fafc" />
            <!-- Santa Hat -->
            <path d="M 89 27 Q 95 24 102 27 L 97 14 Q 90 20 89 27 Z" fill="#dc2626" />
            <ellipse cx="95.5" cy="27" rx="7.5" ry="3" fill="#ffffff" />
            <circle cx="97" cy="13" r="3.5" fill="#ffffff" />
            <!-- Santa Waving Arm & Mitten -->
            <path d="M 102 44 Q 112 40 114 32" fill="none" stroke="#dc2626" stroke-width="4.5" stroke-linecap="round" />
            <circle cx="114" cy="31" r="3" fill="#ffffff" />
            <ellipse cx="116" cy="28" rx="3.5" ry="4" fill="#dc2626" transform="rotate(15 116 28)" />
            <!-- Sleigh Body -->
            <path d="M 54 44 Q 50 56 68 59 L 115 59 Q 128 59 127 48 Q 120 52 110 50 Q 82 50 72 44 Q 60 40 54 44 Z" fill="#b91c1c" />
            <path d="M 52 44 Q 60 40 72 44 Q 82 50 110 50 Q 120 52 127 48" fill="none" stroke="#fbbf24" stroke-width="2.5" stroke-linecap="round" />
            <circle cx="90" cy="54" r="2" fill="#15803d" />
            <circle cx="94" cy="54" r="2" fill="#15803d" />
            <circle cx="92" cy="52" r="1.5" fill="#ef4444" />
            <!-- Reindeer (Rudolph) -->
            <path d="M 166 45 L 158 54 M 172 46 L 165 57" stroke="#78350f" stroke-width="3" stroke-linecap="round" />
            <ellipse cx="178" cy="42" rx="16" ry="11" fill="#92400e" />
            <path d="M 186 46 L 196 54 M 182 46 L 190 56" stroke="#78350f" stroke-width="3" stroke-linecap="round" />
            <path d="M 163 39 Q 159 38 162 42" stroke="#92400e" stroke-width="2.5" stroke-linecap="round" />
            <path d="M 185 43 L 196 30 Q 199 26 205 28 L 209 30 Q 212 33 207 36 L 192 46 Z" fill="#92400e" />
            <ellipse cx="196" cy="26" rx="4" ry="2" fill="#78350f" transform="rotate(-30 196 26)" />
            <path d="M 197 25 L 195 15 M 195 19 L 191 16 M 195 16 L 198 12 M 199 25 L 202 17 M 201 20 L 206 19" stroke="#fbbf24" stroke-width="2" stroke-linecap="round" />
            <circle cx="203" cy="29" r="1.2" fill="#1e293b" />
            <line x1="192" y1="36" x2="197" y2="42" stroke="#dc2626" stroke-width="2.5" />
            <circle cx="195" cy="40" r="2" fill="#fbbf24" />
            <!-- Glowing Red Nose -->
            <circle cx="210" cy="32" r="3.5" fill="#ef4444" />
            <circle cx="210" cy="32" r="6" fill="#ef4444" opacity="0.35" class="rudolph-glow" />
            <circle cx="209" cy="31" r="1" fill="#ffffff" />
        </svg>
    `;

    // Fly in upper half of the screen (10-50% height)
    santa.style.top = (10 + Math.random() * 40) + '%';
    santa.style.left = '-260px';
    santa.style.position = 'fixed';
    document.body.appendChild(santa);

    // Duration: 14-22 seconds to cross screen smoothly
    const duration = 14000 + Math.random() * 8000;
    const targetX = window.innerWidth + 300;
    let startTime = null;

    function animate(timestamp) {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const x = progress * targetX;
        const wave = Math.sin(elapsed / 350);
        const bob = wave * 14; // gentle swooping flight
        const tilt = Math.cos(elapsed / 350) * 3; // subtle pitch tilt as he rides the wind
        santa.style.transform = `translateX(${x}px) translateY(${bob}px) rotate(${tilt}deg)`;
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            santa.remove();
        }
    }
    requestAnimationFrame(animate);
}

function initSantaAnimations() {
    spawnOneSanta();
    seasonalIntervalId = setInterval(spawnOneSanta, 60000);
}

// Expose on window for easy testing/previewing
window.spawnOneSanta = spawnOneSanta;
window.initSantaAnimations = initSantaAnimations;

function updateSeasonalAnimations() {
    const month = getActiveMonth();
    const existingElements = document.querySelectorAll('.drifting-ghost, .boo-popup, .roaming-turkey, .gobble-popup, .roaming-santa');

    if (seasonalIntervalId) {
        clearInterval(seasonalIntervalId);
        seasonalIntervalId = null;
    }
    existingElements.forEach(el => el.remove());

    if (month === 9) {
        initSpookyAnimations();
    } else if (month === 10) {
        initTurkeyAnimations();
    } else if (month === 11) {
        initSantaAnimations();
    }
}

// Helper to format local Date objects as YYYY-MM-DD
function formatDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Calendar Grid Rendering with Today Highlighted
async function buildCalendarGrid() {
    const grid = document.getElementById('calendar-grid');
    grid.innerHTML = ''; 

    const now = new Date();
    // Use local noon to prevent daylight saving time boundary shifts
    const startGrid = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0);
    startGrid.setDate(startGrid.getDate() - startGrid.getDay());
    const endGrid = new Date(startGrid);
    endGrid.setDate(startGrid.getDate() + 34); 

    let currentDate = new Date(startGrid);
    const cells = {};
    const todayForDimming = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0);

    while (currentDate <= endGrid) {
        const dateString = formatDateKey(currentDate);
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

        const dayEvents = {};

        allEvents.forEach(event => {
            if (!event.start) return;

            const summary = event.summary || '(No title)';

            if (event.start.date) {
                // All-day event: start.date is "YYYY-MM-DD", end.date is exclusive "YYYY-MM-DD"
                // Parse directly as local calendar dates to avoid UTC offset shifting the day
                const [sY, sM, sD] = event.start.date.split('-').map(Number);
                const startDate = new Date(sY, sM - 1, sD, 12, 0, 0);

                let endDate;
                if (event.end && event.end.date) {
                    const [eY, eM, eD] = event.end.date.split('-').map(Number);
                    endDate = new Date(eY, eM - 1, eD, 12, 0, 0);
                } else {
                    endDate = new Date(startDate);
                    endDate.setDate(endDate.getDate() + 1);
                }

                if (endDate <= startDate) {
                    endDate = new Date(startDate);
                    endDate.setDate(endDate.getDate() + 1);
                }

                // Iterate through all days in the span (exclusive of endDate)
                const curr = new Date(startDate);
                while (curr < endDate) {
                    const dateKey = formatDateKey(curr);
                    if (cells[dateKey]) {
                        if (!dayEvents[dateKey]) dayEvents[dateKey] = [];
                        dayEvents[dateKey].push({
                            isAllDay: true,
                            sortTime: 0,
                            displayText: summary
                        });
                    }
                    curr.setDate(curr.getDate() + 1);
                }
            } else if (event.start.dateTime) {
                // Timed event
                const startObj = new Date(event.start.dateTime);
                const endObj = event.end && event.end.dateTime ? new Date(event.end.dateTime) : startObj;

                const startDate = new Date(startObj.getFullYear(), startObj.getMonth(), startObj.getDate(), 12, 0, 0);

                let effectiveEnd = new Date(endObj);
                // If the event ends exactly at midnight (00:00:00), don't roll over into the next day
                if (effectiveEnd > startObj && effectiveEnd.getHours() === 0 && effectiveEnd.getMinutes() === 0 && effectiveEnd.getSeconds() === 0) {
                    effectiveEnd = new Date(effectiveEnd.getTime() - 1000);
                }
                const endDate = new Date(effectiveEnd.getFullYear(), effectiveEnd.getMonth(), effectiveEnd.getDate(), 12, 0, 0);

                const curr = new Date(startDate);
                while (curr <= endDate) {
                    const dateKey = formatDateKey(curr);
                    if (cells[dateKey]) {
                        if (!dayEvents[dateKey]) dayEvents[dateKey] = [];
                        const isStartDay = (curr.getTime() === startDate.getTime());
                        const timeString = isStartDay
                            ? startObj.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }) + ' '
                            : '';
                        dayEvents[dateKey].push({
                            isAllDay: false,
                            sortTime: startObj.getTime(),
                            displayText: timeString + summary
                        });
                    }
                    curr.setDate(curr.getDate() + 1);
                }
            }
        });

        // Render sorted events into cells with alternating theme colors
        for (const [dateKey, events] of Object.entries(dayEvents)) {
            if (!cells[dateKey]) continue;

            // Sort: All-day events first, then timed events chronologically
            events.sort((a, b) => {
                if (a.isAllDay && !b.isAllDay) return -1;
                if (!a.isAllDay && b.isAllDay) return 1;
                return a.sortTime - b.sortTime;
            });

            events.forEach((evt, idx) => {
                const evtDiv = document.createElement('div');
                evtDiv.className = 'event-item';
                const bgColor = (idx % 2 === 0) ? 'var(--event-bg-1)' : 'var(--event-bg-2)';
                evtDiv.style.backgroundColor = bgColor;
                evtDiv.innerText = evt.displayText;
                cells[dateKey].appendChild(evtDiv);
            });
        }
    } catch (err) { console.error("Waiting for JSON update...", err); }
}

// Automatic Month-Rollover and State Management
let currentActiveMonth = -1;

function refreshMonthlyState() {
    const currentMonth = getActiveMonth();
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
