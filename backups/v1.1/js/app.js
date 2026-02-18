const BOOK_NAMES = {
    "gn": "창세기", "ex": "출애굽기", "lv": "레위기", "nm": "민수기", "dt": "신명기", "js": "여호수아", "jud": "사사기", "rt": "룻기", "1sm": "사무엘상", "2sm": "사무엘하", "1kgs": "열왕기상", "2kgs": "열왕기하", "1ch": "역대상", "2ch": "역대하", "ezr": "에스라", "ne": "느헤미야", "et": "에스더", "job": "욥기", "ps": "시편", "prv": "잠언", "ec": "전도서", "so": "아가", "is": "이사야", "jr": "예레미야", "lm": "예레미야 애가", "ez": "에스겔", "dn": "다니엘", "ho": "호세아", "jl": "요엘", "am": "아모스", "ob": "오바댜", "jn": "요나", "mi": "미가", "na": "나훔", "hk": "하박국", "zp": "스바냐", "hg": "학개", "zc": "스가랴", "ml": "말라기", "mt": "마태복음", "mk": "마가복음", "lk": "누가복음", "jo": "요한복음", "act": "사도행전", "rm": "로마서", "1co": "고린도전서", "2co": "고린도후서", "gl": "갈라디아서", "eph": "에베소서", "ph": "빌립보서", "cl": "골로새서", "1ts": "데살로니가전서", "2ts": "데살로니가후서", "1tm": "디모데전서", "2tm": "디모데후서", "tt": "디도서", "phm": "빌레몬서", "hb": "히브리서", "jm": "야고보서", "1pe": "베드로전서", "2pe": "베드로후서", "1jo": "요한1서", "2jo": "요한2서", "3jo": "요한3서", "jd": "유다서", "re": "요한계시록"
};

const API_BASE = `http://${window.location.hostname}:8085/api`;
console.log('API_BASE initialized as:', API_BASE);
const DEFAULT_GROUP = "교구";

window.onerror = function (msg, url, lineNo, columnNo, error) {
    alert('오류 발생: ' + msg + '\n파일: ' + url + '\n줄번호: ' + lineNo);
    return false;
};

const DEFAULT_PLAN = {
    startDate: "2026-02-01",
    endDate: "2026-10-24",
    totalChapters: 1189,
    dailyTarget: 4,
    readMap: {}
};

class BibleApp {
    constructor() {
        this.bibleData = [];
        this.chapterMap = []; // Flat list of all 1189 chapters
        this.currentBookIndex = 0;
        this.currentChapterIndex = 0;
        this.user = JSON.parse(localStorage.getItem('bible_user') || 'null');
        this.history = JSON.parse(localStorage.getItem('bible_history') || '[]');
        this.settings = JSON.parse(localStorage.getItem('bible_settings') || JSON.stringify({
            fontSize: 1.25,
            lineHeight: 1.7,
            fontFamily: 'gothic',
            theme: 'light',
            auxVersion: ''
        }));
        this.readingPlan = JSON.parse(localStorage.getItem('bible_reading_plan') || JSON.stringify(DEFAULT_PLAN));
        this.wordbook = JSON.parse(localStorage.getItem('bible_wordbook') || '[]');
        this.wordHighlights = JSON.parse(localStorage.getItem('bible_highlights') || '{}'); // { "word": true }
        this.currentCalDate = new Date();

        this.elements = {
            bookList: document.getElementById('books-list'),
            historyList: document.getElementById('history-list'),
            readingPlan: document.getElementById('reading-plan'),
            verseDisplay: document.getElementById('verse-display'),
            content: document.getElementById('content'),
            currentLocation: document.getElementById('current-location'),
            chapterSelector: document.getElementById('chapter-selector'),
            prevBtn: document.getElementById('prev-chapter'),
            nextBtn: document.getElementById('next-chapter'),

            themeToggle: document.getElementById('theme-toggle'),
            auxVersionSelect: document.getElementById('aux-version-select'),
            sidebar: document.getElementById('sidebar'),
            menuToggle: document.getElementById('menu-toggle'),

            bookSearchInput: document.getElementById('book-search-input'),
            searchInput: document.getElementById('search-input'),
            searchOverlay: document.getElementById('search-results-overlay'),
            searchResultsList: document.getElementById('search-results-list'),
            closeSearch: document.getElementById('close-search'),

            tabBtns: document.querySelectorAll('.tab-btn'),
            tabContents: document.querySelectorAll('.tab-content'),
            settingsBtn: document.getElementById('settings-btn'),
            settingsOverlay: document.getElementById('settings-overlay'),
            closeSettings: document.getElementById('close-settings'),
            fontSizeSlider: document.getElementById('font-size-slider'),
            fontSizeVal: document.getElementById('font-size-val'),
            lineHeightSlider: document.getElementById('line-height-slider'),
            lineHeightVal: document.getElementById('line-height-val'),
            fontBtns: document.querySelectorAll('.font-btn'),

            setupPlanBtn: document.getElementById('setup-plan-btn'),
            planSetupOverlay: document.getElementById('plan-setup-overlay'),
            closePlanSetup: document.getElementById('close-plan-setup'),
            planStartDate: document.getElementById('plan-start-date'),
            planEndDate: document.getElementById('plan-end-date'),
            savePlanBtn: document.getElementById('save-plan-btn'),
            planStatus: document.getElementById('plan-status'),
            calGrid: document.getElementById('calendar-grid'),
            calMonthYear: document.getElementById('calendar-month-year'),
            prevMonthBtn: document.getElementById('prev-month'),
            nextMonthBtn: document.getElementById('next-month'),

            loginOverlay: document.getElementById('login-overlay'),
            modalUsername: document.getElementById('modal-username'),
            modalPassword: document.getElementById('modal-password'),
            modalLoginBtn: document.getElementById('modal-login-btn'),
            usernameInput: document.getElementById('username-input'),
            passwordInput: document.getElementById('password-input'),
            loginBtn: document.getElementById('login-btn'),
            authSection: document.getElementById('auth-section'),
            groupSection: document.getElementById('group-section'),
            userDisplayName: document.getElementById('user-display-name'),
            logoutBtn: document.getElementById('logout-btn'),
            groupMembersList: document.getElementById('group-members-list'),
            myDailyChart: document.getElementById('my-daily-chart'),

            // Admin
            adminBtn: document.getElementById('admin-btn'),
            adminOverlay: document.getElementById('admin-overlay'),
            closeAdmin: document.getElementById('close-admin'),
            adminMemberSearch: document.getElementById('admin-member-search'),
            exportCsvBtn: document.getElementById('export-csv-btn'),
            adminStatsSummary: document.getElementById('admin-stats-summary'),
            adminMemberTbody: document.getElementById('admin-member-tbody'),
            adminResetBtn: document.getElementById('admin-reset-btn'),

            // Wordbook
            wordbookBtn: document.getElementById('wordbook-btn'),
            wordbookOverlay: document.getElementById('wordbook-overlay'),
            closeWordbook: document.getElementById('close-wordbook'),
            wordbookList: document.getElementById('wordbook-list'),
            wordbookEmpty: document.getElementById('wordbook-empty'),

            bibleSelectorOverlay: document.getElementById('bible-selector-overlay'),
            selectorTitle: document.getElementById('selector-title'),
            selectorBooks: document.getElementById('selector-books'),
            selectorChapters: document.getElementById('selector-chapters'),
            selectedBookTitle: document.getElementById('selected-book-title'),
            closeSelector: document.getElementById('close-selector'),
            locBook: document.getElementById('loc-book'),
            locChapter: document.getElementById('loc-chapter')
        };

        this.init();
    }

    async init() {
        try {
            const response = await fetch('data/bible_ko.json');
            this.bibleData = await response.json();

            // Load selected auxiliary version
            if (this.settings.auxVersion) {
                await this.loadAuxBible(this.settings.auxVersion);
            } else {
                // Preload NIV by default
                await this.loadAuxBible('niv');
            }

            // Fetch Global Reading Plan from Server
            await this.fetchReadingPlan();

            // Generate flat chapter map for reading plan calculations
            this.bibleData.forEach((book, bIdx) => {
                book.chapters.forEach((chap, cIdx) => {
                    this.chapterMap.push({ bIdx, cIdx, abbrev: book.abbrev });
                });
            });

            this.applySettings();
            this.renderBookList();
            this.renderHistory();
            this.updatePlanStatus();
            this.renderCalendar();

            const savedCreds = JSON.parse(localStorage.getItem('bible_creds') || 'null');
            if (savedCreds && !this.user) {
                this.elements.modalUsername.value = savedCreds.u;
                this.elements.modalPassword.value = savedCreds.p;
            }

            this.updateAuthUI();

            const lastPos = JSON.parse(localStorage.getItem('bible_last_pos') || '{"b":0, "c":0}');
            this.loadChapter(lastPos.b, lastPos.c);

            this.setupEventListeners();
        } catch (error) {
            console.error('Failed to load Bible data:', error);
            this.elements.verseDisplay.innerHTML = '<div class="error">성경 데이터를 불러오는 데 실패했습니다.</div>';
        }
    }

    async fetchReadingPlan() {
        try {
            const res = await fetch(`${API_BASE}/plan`);
            const serverPlan = await res.json();

            // Get local readMap
            const localPlan = JSON.parse(localStorage.getItem('bible_reading_plan') || '{}');
            const readMap = localPlan.readMap || {};

            this.readingPlan = {
                ...serverPlan,
                readMap: readMap,
                completed: Object.keys(readMap).length
            };

            // Sync fields to setup UI
            this.elements.planStartDate.value = this.readingPlan.startDate;
            this.elements.planEndDate.value = this.readingPlan.endDate;

        } catch (e) {
            console.error('Failed to fetch reading plan:', e);
            this.readingPlan = JSON.parse(localStorage.getItem('bible_reading_plan') || JSON.stringify(DEFAULT_PLAN));
        }
    }

    applySettings() {
        const root = document.documentElement;
        root.style.setProperty('--verse-size', `${this.settings.fontSize}rem`);
        root.style.setProperty('--line-height', this.settings.lineHeight);
        root.style.setProperty('--verse-font', this.settings.fontFamily === 'myeongjo' ? "'Nanum Myeongjo', serif" : "'Outfit', sans-serif");

        document.body.setAttribute('data-theme', this.settings.theme);
        this.elements.themeToggle.textContent = this.settings.theme === 'dark' ? '☀️' : '🌓';

        if (this.elements.fontSizeSlider) {
            this.elements.fontSizeSlider.value = this.settings.fontSize;
            this.elements.fontSizeVal.textContent = `${this.settings.fontSize}rem`;
            this.elements.lineHeightSlider.value = this.settings.lineHeight;
            this.elements.lineHeightVal.textContent = this.settings.lineHeight;

            this.elements.fontBtns.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.font === this.settings.fontFamily);
            });
        }
        if (this.elements.auxVersionSelect) {
            this.elements.auxVersionSelect.value = this.settings.auxVersion || '';
        }
    }

    async loadAuxBible(version) {
        if (!version) return;
        if (this[`bibleData_${version}`]) return;

        try {
            const fileName = `bible_en_${version}.json`;
            const res = await fetch(`data/${fileName}`);
            if (res.ok) {
                const data = await res.json();
                this[`bibleData_${version}`] = data;
                console.log(`Loaded auxiliary Bible: ${version}`, data.length, 'books');
            } else {
                console.error(`Fetch failed for ${version}: ${res.status}`);
            }
        } catch (e) {
            console.error(`Failed to load ${version} data:`, e);
        }
    }

    saveSettings() {
        localStorage.setItem('bible_settings', JSON.stringify(this.settings));
        this.applySettings();
    }

    setupEventListeners() {
        this.elements.prevBtn.onclick = () => this.navigateChapter(-1);
        this.elements.nextBtn.onclick = () => this.navigateChapter(1);
        this.elements.chapterSelector.onchange = (e) => this.loadChapter(this.currentBookIndex, parseInt(e.target.value));
        this.elements.themeToggle.onclick = () => {
            this.settings.theme = this.settings.theme === 'dark' ? 'light' : 'dark';
            this.saveSettings();
        };
        if (this.elements.auxVersionSelect) {
            this.elements.auxVersionSelect.onchange = async (e) => {
                const version = e.target.value;
                this.settings.auxVersion = version;
                if (version) {
                    this.elements.verseDisplay.innerHTML = '<div class="loading-state">데이터를 불러오는 중...</div>';
                    await this.loadAuxBible(version);
                }
                this.saveSettings();
                this.loadChapter(this.currentBookIndex, this.currentChapterIndex);
            };
        }

        this.elements.tabBtns.forEach(btn => {
            btn.onclick = () => {
                const tabId = btn.id.replace('tab-', '');
                this.elements.tabBtns.forEach(b => b.classList.toggle('active', b === btn));
                this.elements.tabContents.forEach(content => {
                    content.classList.toggle('hidden', !content.id.includes(tabId));
                });

                if (tabId === 'books') {
                    this.elements.bookSearchInput.classList.remove('hidden');
                    this.elements.searchInput.classList.add('hidden');
                    setTimeout(() => this.elements.bookSearchInput.focus(), 100);
                } else {
                    this.elements.bookSearchInput.classList.add('hidden');
                    this.elements.searchInput.classList.remove('hidden');
                    if (tabId !== 'plan') setTimeout(() => this.elements.searchInput.focus(), 100);
                }

                if (tabId === 'plan') this.renderCalendar();
                if (tabId === 'social' && this.user) this.fetchGroupProgress();
            };
        });

        this.elements.bookSearchInput.oninput = (e) => {
            this.renderBookList(e.target.value.trim());
        };

        this.elements.bookSearchInput.onkeypress = (e) => {
            if (e.key === 'Enter') {
                const firstResult = this.elements.bookList.querySelector('.book-item');
                if (firstResult) firstResult.click();
            }
        };

        this.elements.settingsBtn.onclick = () => this.elements.settingsOverlay.classList.remove('hidden');
        this.elements.closeSettings.onclick = () => this.elements.settingsOverlay.classList.add('hidden');

        this.elements.fontSizeSlider.oninput = (e) => {
            this.settings.fontSize = e.target.value;
            this.saveSettings();
        };

        this.elements.lineHeightSlider.oninput = (e) => {
            this.settings.lineHeight = e.target.value;
            this.saveSettings();
        };

        this.elements.fontBtns.forEach(btn => {
            btn.onclick = () => {
                this.settings.fontFamily = btn.dataset.font;
                this.saveSettings();
            };
        });

        this.elements.menuToggle.onclick = (e) => {
            e.stopPropagation();
            this.elements.sidebar.classList.toggle('open');
        };
        this.elements.content.onclick = () => {
            if (this.elements.sidebar.classList.contains('open')) {
                this.elements.sidebar.classList.remove('open');
            }
        };

        this.elements.searchInput.onkeypress = (e) => {
            if (e.key === 'Enter') this.performSearch(e.target.value);
        };
        this.elements.closeSearch.onclick = () => {
            this.elements.searchOverlay.classList.add('hidden');
            this.elements.searchOverlay.style.display = 'none';
        };

        this.elements.setupPlanBtn.onclick = () => this.elements.planSetupOverlay.classList.remove('hidden');
        this.elements.closePlanSetup.onclick = () => this.elements.planSetupOverlay.classList.add('hidden');
        this.elements.savePlanBtn.onclick = () => this.createReadingPlan();

        this.elements.prevMonthBtn.onclick = () => { this.currentCalDate.setMonth(this.currentCalDate.getMonth() - 1); this.renderCalendar(); };
        this.elements.nextMonthBtn.onclick = () => { this.currentCalDate.setMonth(this.currentCalDate.getMonth() + 1); this.renderCalendar(); };

        this.elements.loginBtn.onclick = () => this.login(false);
        this.elements.modalLoginBtn.onclick = () => this.login(true);
        this.elements.logoutBtn.onclick = () => this.logout();

        // Word Selection Feature
        document.addEventListener('selectionchange', () => this.handleWordSelection());
        document.addEventListener('mousedown', (e) => {
            if (!e.target.closest('.context-menu')) this.hideContextMenu();
        });
        document.addEventListener('touchstart', (e) => {
            if (!e.target.closest('.context-menu')) this.hideContextMenu();
        });

        // Wordbook Toggle
        this.elements.wordbookBtn.onclick = () => this.openWordbook();
        this.elements.closeWordbook.onclick = () => this.elements.wordbookOverlay.classList.add('hidden');

        // Admin
        this.elements.adminBtn.onclick = () => this.openAdmin();
        this.elements.closeAdmin.onclick = () => this.elements.adminOverlay.classList.add('hidden');
        this.elements.exportCsvBtn.onclick = () => this.exportToCSV();
        this.elements.adminMemberSearch.oninput = (e) => this.renderAdminDashboard(this.allMembersData, e.target.value.trim());
        this.elements.adminResetBtn.onclick = () => this.resetAllProgress();

        // Bible Selector
        this.elements.currentLocation.addEventListener('click', (e) => {
            console.log('Location clicked');
            e.stopPropagation();
            this.openBibleSelector();
        });

        this.elements.closeSelector.onclick = (e) => {
            e.stopPropagation();
            this.elements.bibleSelectorOverlay.classList.add('hidden');
            this.elements.bibleSelectorOverlay.style.display = 'none';
        };

        this.setupSwipeEvents();
    }

    setupSwipeEvents() {
        let touchstartX = 0;
        let touchendX = 0;
        let touchstartY = 0;
        let touchendY = 0;

        const handleGesture = () => {
            const dx = touchendX - touchstartX;
            const dy = touchendY - touchstartY;

            // Sensitivity threshold
            if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 100) {
                if (dx > 0) {
                    this.navigateChapter(-1); // Swipe Right -> Previous
                } else {
                    this.navigateChapter(1);  // Swipe Left -> Next
                }
            }
        };

        this.elements.verseDisplay.addEventListener('touchstart', e => {
            touchstartX = e.changedTouches[0].screenX;
            touchstartY = e.changedTouches[0].screenY;
        }, { passive: true });

        this.elements.verseDisplay.addEventListener('touchend', e => {
            touchendX = e.changedTouches[0].screenX;
            touchendY = e.changedTouches[0].screenY;
            handleGesture();
        }, { passive: true });
    }

    async login(fromModal = false) {
        let username, password;
        if (fromModal) {
            username = this.elements.modalUsername.value.trim();
            password = this.elements.modalPassword.value.trim();
        } else {
            username = this.elements.usernameInput.value.trim();
            password = this.elements.passwordInput.value.trim();
        }

        if (!username || !password) return alert('아이디와 비밀번호를 입력해주세요.');

        this.elements.modalLoginBtn.textContent = "로그인 중...";
        this.elements.modalLoginBtn.disabled = true;

        try {
            const res = await fetch(`${API_BASE}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

            const data = await res.json();
            if (data.success) {
                this.user = data.user;
                localStorage.setItem('bible_user', JSON.stringify(this.user));
                localStorage.setItem('bible_creds', JSON.stringify({ u: username, p: password }));

                // Sync Data from Server (Server Wins)
                if (data.user.wordbook && Array.isArray(data.user.wordbook)) {
                    this.wordbook = data.user.wordbook;
                    localStorage.setItem('bible_wordbook', JSON.stringify(this.wordbook));
                }
                if (data.user.highlights && typeof data.user.highlights === 'object') {
                    this.wordHighlights = data.user.highlights;
                    localStorage.setItem('bible_highlights', JSON.stringify(this.wordHighlights));
                }
                if (data.user.history && Array.isArray(data.user.history)) {
                    this.history = data.user.history;
                    localStorage.setItem('bible_history', JSON.stringify(this.history));
                    this.renderHistory();
                }

                // If Server data is empty but we have local data (migration case), push it
                const serverHasData = (data.user.wordbook && data.user.wordbook.length > 0) ||
                    (data.user.history && data.user.history.length > 0);

                if (!serverHasData && (this.wordbook.length > 0 || this.history.length > 0)) {
                    await this.syncUserData();
                }

                if (this.user.group !== DEFAULT_GROUP) {
                    await this.joinGroup(DEFAULT_GROUP);
                }

                this.updateAuthUI();

                // On mobile, open the menu automatically after login so they see the plan
                if (window.innerWidth <= 768) {
                    this.elements.sidebar.classList.add('open');
                }

                this.syncProgress(0); // Sync initial
            } else {
                alert(data.message);
                this.elements.modalLoginBtn.textContent = "로그인 / 시작하기";
                this.elements.modalLoginBtn.disabled = false;
            }
        } catch (e) {
            console.error('Login Error:', e);
            alert(`서버 연결 실패 (API: ${API_BASE}). 서버 상태와 8085 포트를 확인해 주세요.`);
            this.elements.modalLoginBtn.textContent = "로그인 / 시작하기";
            this.elements.modalLoginBtn.disabled = false;
        }
    }

    async syncUserData() {
        if (!this.user) return;
        try {
            await fetch(`${API_BASE}/sync-data`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: this.user.username,
                    wordbook: this.wordbook,
                    highlights: this.wordHighlights,
                    history: this.history
                })
            });
            console.log('User data synced to server');
        } catch (e) {
            console.error('Sync user data failed', e);
        }
    }

    logout() {
        this.user = null;
        localStorage.removeItem('bible_user');
        this.updateAuthUI();
    }

    async joinGroup(groupName) {
        try {
            const res = await fetch(`${API_BASE}/group/join`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: this.user.username, groupName })
            });
            const data = await res.json();
            if (data.success) {
                this.user.group = groupName;
                localStorage.setItem('bible_user', JSON.stringify(this.user));
                this.fetchGroupProgress();
            }
        } catch (e) {
            console.error(e);
        }
    }

    updateAuthUI() {
        if (this.user) {
            this.elements.loginOverlay.classList.add('hidden');
            this.elements.authSection.classList.add('hidden');
            this.elements.groupSection.classList.remove('hidden');
            this.elements.logoutBtn.classList.remove('hidden');
            this.elements.userDisplayName.textContent = `${this.user.username}`;

            // Show Admin Button for specific users (Admin or 김완주)
            const isAdmin = this.user.username.toLowerCase() === 'admin' || this.user.username === '김완주';
            this.elements.adminBtn.classList.toggle('hidden', !isAdmin);

            this.fetchGroupProgress();
        } else {
            this.elements.loginOverlay.classList.remove('hidden');
            this.elements.authSection.classList.remove('hidden');
            this.elements.groupSection.classList.add('hidden');
            this.elements.logoutBtn.classList.add('hidden');
            this.elements.adminBtn.classList.add('hidden');
        }
    }

    async fetchGroupProgress() {
        if (!this.user || !this.user.group) return;
        try {
            const res = await fetch(`${API_BASE}/group/${this.user.group}`);
            const data = await res.json();
            if (data.success) {
                this.allMembersData = data.members;
                this.renderSocialTab(data.members);
            }
        } catch (e) {
            console.error(e);
        }
    }

    renderSocialTab(members) {
        const me = members.find(m => m.username === this.user.username);
        const otherMembers = members.filter(m => m.username !== this.user.username);

        // 1. My Section
        if (me) {
            this.renderMemberChart(me.dailyProgress, this.elements.myDailyChart);
        }

        // 2. Group Summary Section
        this.elements.groupMembersList.innerHTML = '';

        // Calculate Averages for Others
        const othersCount = otherMembers.length;
        if (othersCount > 0) {
            const avgProgress = Math.round(otherMembers.reduce((sum, m) => sum + m.progress, 0) / othersCount);
            const avgToday = Math.round(otherMembers.reduce((sum, m) => sum + m.todayCount, 0) / othersCount);

            // Average Daily History for Others
            const avgDailyProgress = {};
            const last7Days = [];
            for (let i = 6; i >= 0; i--) {
                const d = new Date(); d.setDate(d.getDate() - i);
                const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                last7Days.push(dStr);
            }

            last7Days.forEach(date => {
                const dayTotal = otherMembers.reduce((sum, m) => sum + (m.dailyProgress[date] || 0), 0);
                avgDailyProgress[date] = Math.round(dayTotal / othersCount);
            });

            const div = document.createElement('div');
            div.className = 'member-item';
            div.style.background = 'rgba(212, 175, 55, 0.05)';
            div.innerHTML = `
                <div class="member-info">
                    <span class="member-name" style="color:var(--accent-color); font-weight:700;">전체 평균 (그 외 ${othersCount}명)</span>
                    <span class="member-percent">${avgProgress}% (오늘 평균: ${avgToday}장)</span>
                </div>
                <div class="daily-chart-container" style="height: 35px; margin-bottom: 0.5rem; opacity: 0.8">
                    ${this.generateChartHTML(avgDailyProgress)}
                </div>
                <div class="progress-bar-container" style="height: 6px; margin: 8px 0; background:rgba(0,0,0,0.05)">
                    <div class="progress-bar" style="width: ${avgProgress}%; background:var(--accent-color)"></div>
                </div>
                <p style="font-size:0.75rem; text-align:center; opacity:0.6; margin-top:5px;">함께하는 성경 완독!</p>
            `;
            this.elements.groupMembersList.appendChild(div);
        } else {
            this.elements.groupMembersList.innerHTML = '<div class="loading-state">함께 읽는 멤버가 아직 없습니다.</div>';
        }
    }

    generateChartHTML(dailyProgress = {}) {
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            last7Days.push(dStr);
        }
        let html = '';
        last7Days.forEach(date => {
            const val = dailyProgress[date] || 0;
            const height = Math.min(100, (val / 10) * 100); // 10 chapters = 100% height
            html += `<div class="chart-bar" style="height: ${height}%" data-val="${val}장"></div>`;
        });
        return html;
    }

    renderMemberChart(dailyProgress, container) {
        container.innerHTML = this.generateChartHTML(dailyProgress);
    }

    async syncProgress(delta = 0) {
        if (!this.user || !this.readingPlan) return;
        try {
            const book = this.bibleData[this.currentBookIndex];
            const lastRead = `${BOOK_NAMES[book.abbrev]} ${this.currentChapterIndex + 1}장`;

            // Count unique chapters read so far for accurate progress
            const completed = Object.keys(this.readingPlan.readMap).length;
            this.readingPlan.completed = completed; // Update local count

            await fetch(`${API_BASE}/progress`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: this.user.username,
                    completed: completed,
                    total: this.readingPlan.totalChapters,
                    lastRead: lastRead,
                    deltaChapters: delta
                })
            });
        } catch (e) {
            console.error('Sync failed', e);
        }
    }

    loadChapter(bookIdx, chapIdx, shouldScroll = true) {
        this.currentBookIndex = bookIdx;
        this.currentChapterIndex = chapIdx;

        const book = this.bibleData[bookIdx];
        if (!book) return;

        const chapter = book.chapters[chapIdx];

        // Get Auxiliary Verses
        let auxVerses = null;
        const auxVer = this.settings.auxVersion;
        const auxData = auxVer ? this[`bibleData_${auxVer}`] : null;

        if (auxVer && auxData) {
            // Find book by index first
            let auxBook = auxData[bookIdx];

            // Fallback: Find by abbreviation if indexes don't match
            if (!auxBook || auxBook.abbrev !== book.abbrev) {
                auxBook = auxData.find(b => b.abbrev === book.abbrev);
            }

            if (auxBook && auxBook.chapters[chapIdx]) {
                auxVerses = auxBook.chapters[chapIdx];
            } else {
                console.warn(`Auxiliary verses not found for ${auxVer}: BookIdx ${bookIdx}, ChapIdx ${chapIdx}`);
            }
        }

        this.elements.locBook.textContent = BOOK_NAMES[book.abbrev];
        this.elements.locChapter.textContent = `${chapIdx + 1}장`;

        this.elements.verseDisplay.innerHTML = '';
        chapter.forEach((verse, i) => {
            const verseDiv = document.createElement('div');
            verseDiv.className = 'verse fade-in';
            let auxText = auxVerses && auxVerses[i] ? auxVerses[i] : '';

            // Apply Highlights to Auxiliary Text
            if (auxText && Object.keys(this.wordHighlights).length > 0) {
                // Sort highlights by length descending to match longest phrases first
                const sortedPhrases = Object.keys(this.wordHighlights).sort((a, b) => b.length - a.length);

                sortedPhrases.forEach(phrase => {
                    const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    const regex = new RegExp(`\\b(${escaped})\\b`, 'gi');

                    // Simple logic to avoid double-wrapping: 
                    // only replace if the match is not already inside a tag
                    let lastIdx = 0;
                    let result = "";
                    let match;

                    while ((match = regex.exec(auxText)) !== null) {
                        const offset = match.index;
                        const before = auxText.substring(0, offset);
                        const openCount = (before.match(/</g) || []).length;
                        const closeCount = (before.match(/>/g) || []).length;

                        result += auxText.substring(lastIdx, offset);

                        if (openCount > closeCount) {
                            // Inside tag, don't wrap
                            result += match[0];
                        } else {
                            result += `<span class="highlight-word" data-word="${phrase}">${match[0]}</span>`;
                        }
                        lastIdx = regex.lastIndex;
                    }
                    result += auxText.substring(lastIdx);
                    auxText = result;
                });
            }

            verseDiv.innerHTML = `
                <span class="verse-num">${i + 1}</span>
                <div class="verse-content-wrapper" style="display:flex; flex-direction:column; flex:1;">
                    <span class="verse-text">${verse}</span>
                    ${auxText ? `<span class="verse-en">${auxText}</span>` : ''}
                </div>
            `;
            this.elements.verseDisplay.appendChild(verseDiv);
        });

        // Add "Next Chapter" button at the end of verses
        const isLastChapter = (this.currentBookIndex === this.bibleData.length - 1) &&
            (this.currentChapterIndex === this.bibleData[this.currentBookIndex].chapters.length - 1);

        if (!isLastChapter) {
            const nextBtnContainer = document.createElement('div');
            nextBtnContainer.className = 'next-chapter-bottom fade-in';
            nextBtnContainer.style.cssText = 'padding: 3rem 0; display: flex; justify-content: center; width: 100%;';

            const nextBtnBottom = document.createElement('button');
            nextBtnBottom.className = 'nav-btn primary';
            nextBtnBottom.style.width = 'auto';
            nextBtnBottom.style.padding = '1rem 3rem';
            nextBtnBottom.innerHTML = `
                <span>다음 장으로</span>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
            `;
            nextBtnBottom.onclick = () => this.navigateChapter(1);

            nextBtnContainer.appendChild(nextBtnBottom);
            this.elements.verseDisplay.appendChild(nextBtnContainer);
        }

        this.updateChapterSelector();
        if (shouldScroll) this.elements.verseDisplay.scrollTop = 0;

        localStorage.setItem('bible_last_pos', JSON.stringify({ b: bookIdx, c: chapIdx }));
        this.updatePlanProgress(bookIdx, chapIdx);
    }

    updatePlanProgress(bookIdx, chapIdx) {
        if (!this.readingPlan) return;

        const key = `${bookIdx}-${chapIdx}`;
        if (!this.readingPlan.readMap[key]) {
            this.readingPlan.readMap[key] = true;
            this.readingPlan.completed++;
            localStorage.setItem('bible_reading_plan', JSON.stringify(this.readingPlan));
            this.addToHistory(bookIdx, chapIdx);
            this.updatePlanStatus();
            this.syncProgress(1); // 1 chapter delta
        } else {
            this.addToHistory(bookIdx, chapIdx);
            this.syncProgress(0);
        }
    }

    getReadingTaskForDate(dateStr) {
        if (!this.readingPlan) return null;
        const targetDate = new Date(dateStr);
        const startDate = new Date(this.readingPlan.startDate);
        const diffDays = Math.floor((targetDate - startDate) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return null;

        const startIdx = diffDays * this.readingPlan.dailyTarget;
        const endIdx = Math.min(1189, startIdx + this.readingPlan.dailyTarget);

        if (startIdx >= 1189) return "완료됨";

        const first = this.chapterMap[startIdx];
        const last = this.chapterMap[endIdx - 1];

        return {
            start: first,
            label: `${BOOK_NAMES[first.abbrev]} ${first.cIdx + 1}장 ~ ${BOOK_NAMES[last.abbrev]} ${last.cIdx + 1}장`
        };
    }

    renderCalendar() {
        const year = this.currentCalDate.getFullYear();
        const month = this.currentCalDate.getMonth();
        this.elements.calMonthYear.textContent = `${year}년 ${month + 1}월`;

        this.elements.calGrid.innerHTML = '';
        ['일', '월', '화', '수', '목', '금', '토'].forEach(d => {
            const el = document.createElement('div');
            el.className = 'cal-day-label';
            el.textContent = d;
            this.elements.calGrid.appendChild(el);
        });

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let i = 0; i < firstDay; i++) {
            this.elements.calGrid.appendChild(document.createElement('div'));
        }

        const now = new Date();
        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const task = this.getReadingTaskForDate(dateStr);

            const el = document.createElement('div');
            el.className = 'cal-day';
            const isToday = todayStr === dateStr;
            if (isToday) el.classList.add('today');

            el.innerHTML = `<span>${day}</span>`;
            if (task && task !== "완료됨") {
                el.classList.add('has-task');
                el.innerHTML += `<span class="task-hint">${task.label.split('~')[0]}</span>`;
                el.onclick = () => {
                    this.loadChapter(task.start.bIdx, task.start.cIdx);
                    if (window.innerWidth <= 768) this.elements.sidebar.classList.remove('open');
                };
            }
            this.elements.calGrid.appendChild(el);
        }
    }

    addToHistory(bookIdx, chapIdx) {
        const book = this.bibleData[bookIdx];
        const entry = {
            b: bookIdx,
            c: chapIdx,
            name: `${BOOK_NAMES[book.abbrev]} ${chapIdx + 1}장`,
            time: new Date().getTime()
        };
        this.history = this.history.filter(h => !(h.b === bookIdx && h.c === chapIdx));
        this.history.unshift(entry);
        this.history = this.history.slice(0, 20);
        localStorage.setItem('bible_history', JSON.stringify(this.history));
        this.renderHistory();
        this.syncUserData();
    }

    renderHistory() {
        this.elements.historyList.innerHTML = '';
        if (this.history.length === 0) {
            this.elements.historyList.innerHTML = '<div class="loading-state">기록 없음</div>';
            return;
        }
        this.history.forEach(h => {
            const div = document.createElement('div');
            div.className = 'history-item';
            div.textContent = h.name;
            div.onclick = () => this.loadChapter(h.b, h.c);
            this.elements.historyList.appendChild(div);
        });
    }

    async createReadingPlan() {
        const start = new Date(this.elements.planStartDate.value);
        const end = new Date(this.elements.planEndDate.value);
        if (end <= start) return alert('목표일은 시작일보다 미래여야 합니다.');

        const totalChapters = 1189;
        const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) || 1;
        const chaptersPerDay = Math.ceil(totalChapters / diffDays);

        const newPlan = {
            startDate: start.toISOString().split('T')[0],
            endDate: end.toISOString().split('T')[0],
            dailyTarget: chaptersPerDay
        };

        // If user is admin, save to server
        const isAdmin = this.user && (this.user.username.toLowerCase() === 'admin' || this.user.username === '김완주' || this.user.isAdmin);

        if (isAdmin) {
            try {
                const res = await fetch(`${API_BASE}/plan`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ...newPlan,
                        requester: this.user.username
                    })
                });
                const data = await res.json();
                if (!data.success) {
                    alert(data.message || '계획 저장 실패');
                    return;
                }
            } catch (e) {
                console.error(e);
                alert('서버 연결 실패. 나중에 다시 시도해주세요.');
                return;
            }
        }

        // Always update local state
        this.readingPlan = {
            ...this.readingPlan,
            ...newPlan,
            totalChapters: 1189
        };

        localStorage.setItem('bible_reading_plan', JSON.stringify({
            startDate: this.readingPlan.startDate,
            endDate: this.readingPlan.endDate,
            readMap: this.readingPlan.readMap
        }));

        this.elements.planSetupOverlay.classList.add('hidden');
        this.updatePlanStatus();
        this.renderCalendar();
        this.syncProgress(0);

        if (isAdmin) alert('전체 회원에게 적용되는 성경 완독 계획이 설정되었습니다.');
    }

    updatePlanStatus() {
        if (!this.readingPlan) {
            this.elements.planStatus.innerHTML = '<div class="loading-state">읽기 계획을 설정해주세요.</div>';
            return;
        }
        const progress = Math.round((this.readingPlan.completed / this.readingPlan.totalChapters) * 100);
        this.elements.planStatus.innerHTML = `
            <div class="plan-info">
                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: ${progress}%"></div>
                </div>
                <p>진행률: ${progress}% (${this.readingPlan.completed}/${this.readingPlan.totalChapters}장)</p>
                <p>오늘 목표: ${this.readingPlan.dailyTarget}장</p>
            </div>
            <button id="reset-plan" class="nav-btn small" style="margin-top: 5px">초기화</button>
        `;
        document.getElementById('reset-plan').onclick = () => {
            if (confirm('계획을 삭제하시겠습니까?')) {
                this.readingPlan = null;
                localStorage.removeItem('bible_reading_plan');
                this.updatePlanStatus();
                this.renderCalendar();
            }
        };
    }

    renderBookList(filter = "") {
        this.elements.bookList.innerHTML = '';
        const searchVal = filter.toLowerCase().trim();

        this.bibleData.forEach((book, index) => {
            const name = BOOK_NAMES[book.abbrev] || book.abbrev;
            const abbrev = book.abbrev.toLowerCase();

            // Match if name contains search or abbreviation starts with search
            const matches = !searchVal ||
                name.includes(searchVal) ||
                abbrev.startsWith(searchVal);

            if (!matches) return;

            const div = document.createElement('div');
            div.className = 'book-item';
            div.innerHTML = `<span>${name}</span><span class="ch-count">${book.chapters.length}</span>`;
            div.onclick = () => {
                this.renderChapterList(index);
            };
            this.elements.bookList.appendChild(div);
        });
    }

    renderChapterList(bookIndex) {
        const book = this.bibleData[bookIndex];
        const name = BOOK_NAMES[book.abbrev] || book.abbrev;
        this.elements.bookList.innerHTML = '';

        // Back button
        const backBtn = document.createElement('div');
        backBtn.className = 'back-to-books';
        backBtn.innerHTML = `<span>←</span> <span>${name} - 목록으로</span>`;
        backBtn.onclick = () => this.renderBookList(this.elements.bookSearchInput.value);
        this.elements.bookList.appendChild(backBtn);

        // Chapter Grid
        const grid = document.createElement('div');
        grid.className = 'chapter-grid';

        book.chapters.forEach((_, i) => {
            const chap = document.createElement('div');
            chap.className = 'chapter-item';
            chap.textContent = i + 1;
            chap.onclick = () => {
                this.loadChapter(bookIndex, i);
                if (window.innerWidth <= 768) this.elements.sidebar.classList.remove('open');
            };
            grid.appendChild(chap);
        });

        this.elements.bookList.appendChild(grid);
    }

    updateChapterSelector() {
        this.elements.chapterSelector.innerHTML = '';
        const book = this.bibleData[this.currentBookIndex];
        if (!book) return;
        book.chapters.forEach((_, i) => {
            const option = document.createElement('option');
            option.value = i; option.textContent = `${i + 1}장`;
            option.selected = i === this.currentChapterIndex;
            this.elements.chapterSelector.appendChild(option);
        });
    }

    navigateChapter(delta) {
        let newChap = this.currentChapterIndex + delta;
        let newBook = this.currentBookIndex;
        if (newChap < 0) {
            newBook--;
            if (newBook >= 0) newChap = this.bibleData[newBook].chapters.length - 1; else return;
        } else if (newChap >= this.bibleData[newBook].chapters.length) {
            newBook++;
            if (newBook < this.bibleData.length) newChap = 0; else return;
        }
        this.loadChapter(newBook, newChap);
    }

    performSearch(query) {
        if (!query || query.length < 1) return;
        this.elements.searchOverlay.classList.remove('hidden');
        this.elements.searchResultsList.innerHTML = '<div class="loading-state">검색 중...</div>';

        const keywords = query.toLowerCase().split(/\s+/).filter(k => k.length > 0);
        if (keywords.length === 0) return;

        const isEnglish = /[a-zA-Z]/.test(query);
        const results = [];

        // Decide which dataset to search
        let searchData = this.bibleData;
        const auxVer = this.settings.auxVersion;
        const auxData = auxVer ? this[`bibleData_${auxVer}`] : null;

        // If English search, and auxData is available, search both or prioritze English
        // Let's search Korean by default, but if English keywords, check English data

        this.bibleData.forEach((book, bIdx) => {
            book.chapters.forEach((chapter, cIdx) => {
                chapter.forEach((verse, vIdx) => {
                    const koVerse = verse.toLowerCase().replace(/\s+/g, '');
                    const koMatch = keywords.every(k => koVerse.includes(k.replace(/\s+/g, '')));

                    let enMatch = false;
                    let enText = '';
                    if (isEnglish && auxData && auxData[bIdx] && auxData[bIdx].chapters[cIdx] && auxData[bIdx].chapters[cIdx][vIdx]) {
                        enText = auxData[bIdx].chapters[cIdx][vIdx];
                        const enTextLower = enText.toLowerCase();
                        enMatch = keywords.every(k => enTextLower.includes(k));
                    }

                    if (koMatch || enMatch) {
                        results.push({
                            bookIdx: bIdx,
                            chapIdx: cIdx,
                            verseIdx: vIdx,
                            text: verse,
                            enText: enText,
                            location: `${BOOK_NAMES[book.abbrev]} ${cIdx + 1}:${vIdx + 1}`
                        });
                    }
                });
            });
        });
        this.renderSearchResults(results);
    }

    renderSearchResults(results) {
        this.elements.searchResultsList.innerHTML = '';
        if (results.length === 0) {
            this.elements.searchResultsList.innerHTML = '<div class="loading-state">결과 없음</div>';
            return;
        }
        results.slice(0, 100).forEach(res => {
            const div = document.createElement('div');
            div.className = 'search-result-item';
            div.innerHTML = `
                <div class="search-result-loc">${res.location}</div>
                <div class="search-result-text">${res.text}</div>
                ${res.enText ? `<div class="search-result-en" style="font-size: 0.8em; opacity: 0.7; margin-top: 4px;">${res.enText}</div>` : ''}
            `;
            div.onclick = () => {
                this.loadChapter(res.bookIdx, res.chapIdx);
                this.elements.searchOverlay.classList.add('hidden');
                setTimeout(() => {
                    const verses = document.querySelectorAll('.verse');
                    if (verses[res.verseIdx]) {
                        verses[res.verseIdx].scrollIntoView({ behavior: 'smooth', block: 'center' });
                        verses[res.verseIdx].classList.add('highlight');
                        setTimeout(() => verses[res.verseIdx].classList.remove('highlight'), 3000);
                    }
                }, 300);
            };
            this.elements.searchResultsList.appendChild(div);
        });
    }

    async openAdmin() {
        this.elements.adminOverlay.classList.remove('hidden');
        await this.fetchGroupProgress();
        this.renderAdminDashboard(this.allMembersData);
    }

    renderAdminDashboard(members, filter = "") {
        if (!members) return;

        // 1. Stats Summary
        const total = members.length;
        const avgProgress = Math.round(members.reduce((s, m) => s + m.progress, 0) / total) || 0;
        const todayTotal = members.reduce((s, m) => s + m.todayCount, 0);

        this.elements.adminStatsSummary.innerHTML = `
            <div class="admin-stat-card"><h5>총 멤버</h5><p>${total}명</p></div>
            <div class="admin-stat-card"><h5>평균 진행률</h5><p>${avgProgress}%</p></div>
            <div class="admin-stat-card"><h5>오늘 읽은 장수</h5><p>${todayTotal}장</p></div>
        `;

        // 2. Table
        this.elements.adminMemberTbody.innerHTML = '';
        const filtered = members.filter(m => m.username.includes(filter));

        filtered.sort((a, b) => b.progress - a.progress).forEach(m => {
            const tr = document.createElement('tr');
            const isProtected = m.username.toLowerCase() === 'admin' || m.username === '김완주';
            const isAdmin = m.isAdmin; // from server

            tr.innerHTML = `
                <td>${m.username} ${isAdmin ? '<span style="font-size:0.7em; background:var(--accent-color); color:white; padding:2px 4px; border-radius:4px;">관리자</span>' : ''}</td>
                <td style="text-align:center;">${m.progress}%</td>
                <td style="text-align:center;">${m.completedCount}장</td>
                <td style="text-align:center;">${m.todayCount}장</td>
                <td style="font-size:0.8rem; opacity:0.8;">${m.lastRead}</td>
                <td style="text-align:center; display:flex; gap:5px; justify-content:center;">
                    ${isProtected ? '' : `
                        <button class="nav-btn small" style="background:${isAdmin ? '#636e72' : '#00b894'}; color:white; padding: 2px 8px;" onclick="bibleApp.toggleAdminRole('${m.username}', ${!isAdmin})">${isAdmin ? '해제' : '임명'}</button>
                        <button class="nav-btn small" style="background:#ff7675; color:white; padding: 2px 8px;" onclick="bibleApp.deleteUser('${m.username}')">삭제</button>
                    `}
                </td>
            `;
            this.elements.adminMemberTbody.appendChild(tr);
        });
    }

    async toggleAdminRole(username, makeAdmin) {
        if (!confirm(`'${username}' 님을 관리자로 ${makeAdmin ? '임명' : '해제'}하시겠습니까?`)) return;

        try {
            const res = await fetch(`${API_BASE}/user/${username}/role`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isAdmin: makeAdmin })
            });
            const data = await res.json();
            if (data.success) {
                alert('변경되었습니다.');
                await this.fetchGroupProgress();
                this.renderAdminDashboard(this.allMembersData);
            } else {
                alert(data.message);
            }
        } catch (e) {
            console.error('Role update failed', e);
            alert('변경 실패');
        }
    }

    async deleteUser(username) {
        if (!confirm(`'${username}' 사용자를 삭제하시겠습니까? 모든 읽기 기록이 사라집니다.`)) return;

        try {
            const res = await fetch(`${API_BASE}/user/${username}`, {
                method: 'DELETE'
            });
            const data = await res.json();
            if (data.success) {
                alert('삭제되었습니다.');
                await this.fetchGroupProgress();
                this.renderAdminDashboard(this.allMembersData);
            } else {
                alert(data.message);
            }
        } catch (e) {
            console.error('Delete failed', e);
            alert('삭제 실패');
        }
    }

    exportToCSV() {
        if (!this.allMembersData) return;

        const headers = ["성함", "진도율(%)", "총 읽은 장수", "오늘 읽은 장수", "마지막 읽은 구절"];
        const rows = this.allMembersData.map(m => [
            m.username, m.progress, m.completedCount, m.todayCount, m.lastRead
        ]);

        let csvContent = "\uFEFF"; // UTF-8 BOM for Excel Korean support
        csvContent += headers.join(",") + "\n";
        rows.forEach(row => {
            csvContent += row.map(v => `"${v}"`).join(",") + "\n";
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `성경읽기_현황_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    handleWordSelection() {
        const selection = window.getSelection();
        const selectedText = selection.toString().trim().toLowerCase();

        // Allow phrases (alphabet and spaces, up to 100 chars)
        if (!selectedText || !/^[a-z\s]{2,100}$/i.test(selectedText)) return;

        // Determine if selection happened within an English verse
        const range = selection.getRangeAt(0);
        const container = range.commonAncestorContainer.parentElement;
        if (!container.closest('.verse-en')) return;

        const rect = range.getBoundingClientRect();
        this.showContextMenu(selectedText, rect);
    }

    showContextMenu(word, rect) {
        this.hideContextMenu();

        const menu = document.createElement('div');
        menu.className = 'context-menu fade-in';
        // Position BELOW the word
        menu.style.top = `${rect.bottom + window.scrollY + 10}px`;
        menu.style.left = `${rect.left + window.scrollX}px`;

        menu.innerHTML = `
            <div class="menu-item" id="highlight-btn">
                <span>🎨 강조 및 단어장 저장</span>
            </div>
        `;

        document.body.appendChild(menu);

        document.getElementById('highlight-btn').onclick = () => {
            this.toggleHighlight(word);
            this.hideContextMenu();
        };
    }

    hideContextMenu() {
        const existing = document.querySelector('.context-menu');
        if (existing) existing.remove();
    }

    toggleHighlight(word) {
        if (this.wordHighlights[word]) {
            delete this.wordHighlights[word];
        } else {
            this.wordHighlights[word] = true;
            this.saveToWordbook(word);
        }
        localStorage.setItem('bible_highlights', JSON.stringify(this.wordHighlights));
        this.loadChapter(this.currentBookIndex, this.currentChapterIndex, false); // Refresh UI without scrolling
    }

    saveToWordbook(word) {
        if (!this.wordbook.includes(word)) {
            this.wordbook.unshift(word);
            localStorage.setItem('bible_wordbook', JSON.stringify(this.wordbook));
            console.log(`Saved to wordbook: ${word}`);
            this.syncUserData();
        }
    }

    openWordbook() {
        this.elements.wordbookOverlay.classList.remove('hidden');
        this.renderWordbook();
    }

    renderWordbook() {
        this.elements.wordbookList.innerHTML = '';
        if (this.wordbook.length === 0) {
            this.elements.wordbookEmpty.classList.remove('hidden');
            return;
        }
        this.elements.wordbookEmpty.classList.add('hidden');

        this.wordbook.forEach(word => {
            const div = document.createElement('div');
            div.className = 'word-item fade-in';
            div.innerHTML = `
                <span class="word-text">${word}</span>
                <div style="display:flex; gap:10px;">
                    <button class="nav-btn small" onclick="bibleApp.removeWord('${word}')">❌</button>
                    <button class="nav-btn small" style="background:var(--accent-color); color:white;" onclick="window.open('https://en.dict.naver.com/#/search?query=${word}&range=all', '_blank')">사전</button>
                </div>
            `;
            this.elements.wordbookList.appendChild(div);
        });
    }

    removeWord(word) {
        if (!confirm(`'${word}' 단어를 삭제하시겠습니까?`)) return;
        this.wordbook = this.wordbook.filter(w => w !== word);
        localStorage.setItem('bible_wordbook', JSON.stringify(this.wordbook));

        // Also remove highlight if exists
        if (this.wordHighlights[word]) {
            delete this.wordHighlights[word];
            localStorage.setItem('bible_highlights', JSON.stringify(this.wordHighlights));
            this.loadChapter(this.currentBookIndex, this.currentChapterIndex);
        }
        this.syncUserData();

        this.renderWordbook();
    }

    async resetAllProgress() {
        if (!confirm('정말로 모든 사용자의 읽기 진도를 초기화하시겠습니까?\n이 작업은 되돌릴 수 없으며, 주간 진도 차트도 모두 삭제됩니다.')) return;

        try {
            const res = await fetch(`${API_BASE}/admin/reset-progress`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ adminUser: this.user.username })
            });
            const data = await res.json();
            if (data.success) {
                alert(data.message);
                this.fetchGroupProgress(); // Refresh UI
            } else {
                alert(data.message || '초기화에 실패했습니다.');
            }
        } catch (e) {
            console.error(e);
            alert('서버 오류로 인해 초기화할 수 없습니다.');
        }
    }

    // Bible Selector Methods (Dual Pane)
    openBibleSelector() {
        if (!this.bibleData || this.bibleData.length === 0) return;
        this.elements.bibleSelectorOverlay.classList.remove('hidden');
        this.elements.bibleSelectorOverlay.style.display = 'flex';

        this.renderSelectorBooks();
        // Load chapters for current book by default
        this.showChapterSelector(this.currentBookIndex);
    }

    renderSelectorBooks() {
        this.elements.selectorBooks.innerHTML = '';

        const createHeader = (text) => {
            const h = document.createElement('div');
            h.className = 'selector-grid-header';
            h.textContent = text;
            return h;
        };

        this.elements.selectorBooks.appendChild(createHeader('구약성경'));

        this.bibleData.forEach((book, idx) => {
            if (idx === 39) {
                this.elements.selectorBooks.appendChild(createHeader('신약성경'));
            }

            const btn = document.createElement('div');
            btn.className = 'selector-item';
            if (idx === this.currentBookIndex) btn.classList.add('active');

            btn.innerHTML = `
                <span>${BOOK_NAMES[book.abbrev]}</span>
                <span style="font-size:0.7rem; opacity:0.6;">${book.chapters.length}장</span>
            `;

            btn.onclick = (e) => {
                e.stopPropagation();
                // Update active state
                this.elements.selectorBooks.querySelectorAll('.selector-item').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.showChapterSelector(idx);
            };
            this.elements.selectorBooks.appendChild(btn);
        });
    }

    showChapterSelector(bookIdx) {
        const book = this.bibleData[bookIdx];
        this.elements.selectedBookTitle.textContent = `${BOOK_NAMES[book.abbrev]} (장 선택)`;

        this.elements.selectorChapters.innerHTML = '';
        book.chapters.forEach((chap, cIdx) => {
            const btn = document.createElement('div');
            btn.className = 'chapter-badge';
            if (bookIdx === this.currentBookIndex && cIdx === this.currentChapterIndex) btn.classList.add('active');
            btn.textContent = `${cIdx + 1}`;

            btn.onclick = (e) => {
                e.stopPropagation();
                this.loadChapter(bookIdx, cIdx);
                this.elements.bibleSelectorOverlay.classList.add('hidden');
                this.elements.bibleSelectorOverlay.style.display = 'none';
            };
            this.elements.selectorChapters.appendChild(btn);
        });

        // Scroll to top of chapter pane
        this.elements.selectorChapters.parentElement.scrollTop = 0;
    }
}

window.onload = () => { window.bibleApp = new BibleApp(); };
