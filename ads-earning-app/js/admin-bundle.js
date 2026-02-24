/**
 * LocalStorage Service
 * Handles data persistence for the application prototype.
 */

const STORE_KEY = 'earn_ads_app_data';

const initialData = {
    users: [], // { id, name, email, phone, balance, totalEarnings, adsWatched, role, referrals, inviteCode, status, createdAt }
    currentUser: null, // ID of currently logged in user
    withdrawals: [], // { id, userId, amount, method, status, date }
    history: [], // { id, userId, type: 'ad' | 'withdrawal', amount, date, detail }
    settings: {
        dailyAdLimit: 20,
        rewardPerAd: 10, // Coins (10 Coins = 0.1 INR)
        minWithdrawal: 1000, // Coins (1000 Coins = 10 INR)
        appMaintenance: false,
        referralPercentage: 10, // %
        unityGameId: '6015899' // User's Unity Game ID
    }
};

class StoreService {
    constructor() {
        this.data = this._loadData();
    }

    _loadData() {
        const stored = localStorage.getItem(STORE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
        this._saveData(initialData);

        // Seed an admin user for demo purposes if new
        this._seedAdmin();

        return JSON.parse(localStorage.getItem(STORE_KEY));
    }

    _saveData(data = this.data) {
        localStorage.setItem(STORE_KEY, JSON.stringify(data));
        this.data = data;
    }

    _seedAdmin() {
        if (!this.data) this.data = initialData;
        const hasAdmin = this.data.users.find(u => u.role === 'admin');
        if (!hasAdmin) {
            this.data.users.push({
                id: 'admin_1',
                name: 'System Admin',
                phone: '6282734806',
                email: 'adminearnads@gmail.com',
                password: 'admin', // Demo purpose
                balance: 0,
                totalEarnings: 0,
                adsWatched: 0,
                role: 'admin',
                referrals: [],
                inviteCode: 'ADMINVIP',
                status: 'active',
                createdAt: new Date().toISOString()
            });
            this._saveData();
        }
    }

    // --- Auth Methods ---
    login(phoneOrEmail, password) {
        let user;
        if (phoneOrEmail.includes('@')) {
            user = this.data.users.find(u => u.email === phoneOrEmail);
        } else {
            user = this.data.users.find(u => u.phone === phoneOrEmail);
        }

        if (user) {
            // Simplified demo authentication
            if ((user.role === 'admin' && password === 'admin') || user.role === 'user') {
                if (user.status === 'blocked') {
                    return { success: false, error: 'Your account is blocked. Contact support.' };
                }
                this.data.currentUser = user.id;
                this._saveData();
                return { success: true, user };
            }
        }
        return { success: false, error: 'Invalid credentials or user not found. (Hint for admin: admin@earnads.com / admin, User: signup first)' };
    }

    signup(name, phone, email, referredBy = null) {
        if (this.data.users.some(u => u.phone === phone || u.email === email)) {
            return { success: false, error: 'User with this phone or email already exists.' };
        }

        const newUser = {
            id: 'user_' + Date.now(),
            name,
            phone,
            email,
            balance: 0,
            totalEarnings: 0,
            adsWatched: 0,
            role: 'user',
            referrals: [],
            inviteCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
            referredBy: referredBy,
            status: 'active',
            createdAt: new Date().toISOString(),
            // Daily tracking
            lastWatchedDate: null,
            dailyAdsCount: 0
        };

        if (referredBy) {
            const referrer = this.data.users.find(u => u.inviteCode === referredBy);
            if (referrer) {
                referrer.referrals.push(newUser.id);
            }
        }

        this.data.users.push(newUser);
        this.data.currentUser = newUser.id;
        this._saveData();
        return { success: true, user: newUser };
    }

    logout() {
        this.data.currentUser = null;
        this._saveData();
    }

    getCurrentUser() {
        if (!this.data.currentUser) return null;
        return this.data.users.find(u => u.id === this.data.currentUser);
    }

    // Updates the current user in DB
    updateUser(userId, updates) {
        const index = this.data.users.findIndex(u => u.id === userId);
        if (index > -1) {
            this.data.users[index] = { ...this.data.users[index], ...updates };
            this._saveData();
            return this.data.users[index];
        }
        return null;
    }

    // --- Admin Methods ---
    getAllUsers() { return this.data.users.filter(u => u.role === 'user'); }
    getAllWithdrawals() { return this.data.withdrawals; }
    getSettings() { return this.data.settings; }

    updateSettings(newSettings) {
        this.data.settings = { ...this.data.settings, ...newSettings };
        this._saveData();
    }
}

const store = new StoreService();

const UserLayout = (content, activeTab = 'home', user = null) => {
    return `
        <div class="app-layout">
            <!-- Top App Bar -->
            <header class="topbar flex justify-between items-center glass">
                <div class="logo font-bold text-accent" style="font-size: 1.25rem;">EarnAds</div>
                <div class="user-profile flex items-center gap-2">
                    <span class="text-sm font-bold text-success font-mono">${(user?.balance || 0).toFixed(0)} Coins</span>
                    <button class="icon-btn" onclick="window.location.hash='#/profile'">
                        <ion-icon name="person-circle" style="font-size: 1.75rem; color: var(--accent-primary);"></ion-icon>
                    </button>
                    <!-- Logout utility -->
                    <button class="icon-btn" onclick="store.logout(); window.location.hash='#/'">
                        <ion-icon name="log-out-outline" style="font-size: 1.5rem;"></ion-icon>
                    </button>
                </div>
            </header>
            
            <main class="main-content">
                ${content}
            </main>

            <!-- Bottom Navigation (Mobile Friendly) -->
            <nav class="bottom-nav glass">
                <a href="#/dashboard" class="nav-item ${activeTab === 'home' ? 'active' : ''}">
                    <ion-icon name="home${activeTab === 'home' ? '' : '-outline'}"></ion-icon>
                    <span>Home</span>
                </a>
                <a href="#/ads" class="nav-item ${activeTab === 'ads' ? 'active' : ''}">
                    <ion-icon name="play-circle${activeTab === 'ads' ? '' : '-outline'}"></ion-icon>
                    <span>Watch Ads</span>
                </a>
                <a href="#/wallet" class="nav-item ${activeTab === 'wallet' ? 'active' : ''}">
                    <ion-icon name="wallet${activeTab === 'wallet' ? '' : '-outline'}"></ion-icon>
                    <span>Wallet</span>
                </a>
                <a href="#/history" class="nav-item ${activeTab === 'history' ? 'active' : ''}">
                    <ion-icon name="time${activeTab === 'history' ? '' : '-outline'}"></ion-icon>
                    <span>History</span>
                </a>
                <a href="#/referrals" class="nav-item ${activeTab === 'referrals' ? 'active' : ''}">
                    <ion-icon name="people${activeTab === 'referrals' ? '' : '-outline'}"></ion-icon>
                    <span>Refer</span>
                </a>
            </nav>
        </div>
    `;
};




const DashboardView = (user) => {
    // Check if daily reset applies based on current date vs lastWatchedDate
    const today = new Date().toDateString();
    let currentDailyAds = user.dailyAdsCount || 0;
    if (user.lastWatchedDate !== today) {
        currentDailyAds = 0; // Reset for today
        store.updateUser(user.id, { dailyAdsCount: 0, lastWatchedDate: today });
    }

    const settings = store.getSettings();
    const limit = settings.dailyAdLimit;
    const progress = Math.min((currentDailyAds / limit) * 100, 100);

    const content = `
        <div class="container animate-fade-in" style="padding-bottom: 80px; padding-top: 80px;">
            <h2 class="mb-4">Hello, ${user.name.split(' ')[0]} 👋</h2>
            
            <!-- Unity Banner Placeholder Area -->
            <div id="unity-banner-container" class="w-full text-center text-xs text-muted mb-4 border border-dashed border-slate-700 py-4 rounded">
                 Unity Banner Ad Space (Android)
            </div>
            
            <div class="card mb-6" style="background: linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary));">
                <div class="flex justify-between items-center mb-4">
                    <span class="text-muted">Wallet Balance</span>
                    <ion-icon name="wallet" class="text-accent" style="font-size: 1.5rem;"></ion-icon>
                </div>
                <h1 class="text-success mb-2 font-mono">${user.balance.toFixed(0)} Coins</h1>
                <div class="flex gap-4 mt-4">
                    <button class="btn btn-primary flex-1" onclick="window.location.hash='#/wallet'">Withdraw</button>
                    <button class="btn btn-secondary flex-1" onclick="window.location.hash='#/history'">History</button>
                </div>
            </div>

            <!-- Stats Grid -->
            <div class="stats-grid mb-6">
                <div class="card flex-col items-center justify-center text-center p-4">
                    <ion-icon name="cash-outline" class="text-success mb-2" style="font-size: 2rem;"></ion-icon>
                    <h3 class="font-mono">${user.totalEarnings.toFixed(0)} Coins</h3>
                    <span class="text-sm text-muted">Total Earnings</span>
                </div>
                <div class="card flex-col items-center justify-center text-center p-4">
                    <ion-icon name="play-circle-outline" class="text-accent mb-2" style="font-size: 2rem;"></ion-icon>
                    <h3 class="font-mono">${user.adsWatched}</h3>
                    <span class="text-sm text-muted">Total Ads Watched</span>
                </div>
            </div>

            <!-- Daily Progress -->
            <div class="card mb-6">
                <div class="flex justify-between items-center mb-2">
                    <h3 class="text-sm font-bold">Today's Ad Limit</h3>
                    <span class="text-sm font-mono">${currentDailyAds} / ${limit}</span>
                </div>
                <div class="progress-bar mb-4">
                    <div class="progress-fill" style="width: ${progress}%;"></div>
                </div>
                <button class="btn btn-primary w-full" onclick="window.location.hash='#/ads'">
                    <ion-icon name="play"></ion-icon> Watch Ads Now
                </button>
            </div>
            
            <!-- Quick Invite -->
            <div class="card flex items-center justify-between pointer" onclick="window.location.hash='#/referrals'" style="border: 1px dashed var(--accent-primary);">
                <div>
                    <h3 class="text-sm font-bold mb-1">Invite & Earn 10%</h3>
                    <span class="text-xs text-muted">Share your code: <strong class="text-accent">${user.inviteCode}</strong></span>
                </div>
                <ion-icon name="share-social-outline" class="text-accent" style="font-size: 1.5rem;"></ion-icon>
            </div>
        </div>
    `;

    // Trigger Banner when Dashboard loads
    setTimeout(() => {
        if (window.UnityAdsBridge) window.UnityAdsBridge.showBanner();
    }, 1000);

    return UserLayout(content, 'home', user);
};




const WatchAdsView = (user) => {
    const today = new Date().toDateString();
    let currentDailyAds = user.dailyAdsCount || 0;
    if (user.lastWatchedDate !== today) {
        currentDailyAds = 0;
    }

    const settings = store.getSettings();
    const limit = settings.dailyAdLimit;
    const canWatch = currentDailyAds < limit;

    const content = `
        <div class="container animate-fade-in" style="padding-top: 2rem;">
            <div class="text-center mb-6">
                <h2 class="mb-2">Watch & Earn</h2>
                <p class="text-muted text-sm">Earn ${settings.rewardPerAd} Coins for every ad you watch entirely.</p>
            </div>

            <div class="card mb-6 flex-col items-center justify-center p-8 text-center" style="min-height: 250px; background: #000; position: relative; border-color: #333;">
                <div id="ad-player-container" class="w-full h-full flex flex-col items-center justify-center">
                    ${canWatch ? `
                        <ion-icon name="videocam-outline" class="text-muted mb-4" style="font-size: 4rem;"></ion-icon>
                        <h3 class="font-bold mb-2">Ready to Watch</h3>
                        <p class="text-sm text-muted mb-6">Partner: Unity Ads (Rewarded Video)</p>
                        <button id="start-ad-btn" class="btn btn-primary" style="padding: 1rem 2rem; font-size: 1.1rem; border-radius: 2rem; margin-bottom: 2rem;">
                            <ion-icon name="play-circle"></ion-icon> Show Unity Ad
                        </button>
                        
                        <div class="w-full text-left mt-4 border-t border-slate-700 pt-6">
                            <h4 class="font-bold text-white mb-4">More Earn Options</h4>
                            <div class="flex flex-col gap-3">
                                <div class="card flex justify-between items-center bg-slate-800 border-slate-700 p-3 pointer" id="admob-ad-btn">
                                    <div class="flex items-center gap-3">
                                        <div class="h-10 w-10 bg-red-500 bg-opacity-20 rounded text-red-500 flex items-center justify-center"><ion-icon name="logo-google"></ion-icon></div>
                                        <div>
                                            <div class="font-bold text-sm text-white">Google AdMob</div>
                                            <div class="text-xs text-muted">+${settings.rewardPerAd} Coins</div>
                                        </div>
                                    </div>
                                    <button class="btn btn-primary text-xs" style="padding: 0.5rem 1rem;">Watch</button>
                                </div>
                                
                                <div class="card flex justify-between items-center bg-slate-800 border-slate-700 p-3 pointer" id="applovin-ad-btn">
                                    <div class="flex items-center gap-3">
                                        <div class="h-10 w-10 bg-blue-500 bg-opacity-20 rounded text-blue-500 flex items-center justify-center"><ion-icon name="phone-portrait-outline"></ion-icon></div>
                                        <div>
                                            <div class="font-bold text-sm text-white">AppLovin Max</div>
                                            <div class="text-xs text-muted">+${settings.rewardPerAd} Coins</div>
                                        </div>
                                    </div>
                                    <button class="btn btn-primary text-xs" style="padding: 0.5rem 1rem;">Watch</button>
                                </div>
                                
                                <div class="flex gap-2 w-full mt-2">
                                     <button id="interstitial-btn" class="btn btn-secondary flex-1 text-xs">Test Unity Interstitial (No Info)</button>
                                </div>
                            </div>
                        </div>
                    ` : `
                        <ion-icon name="checkmark-done-circle-outline" class="text-success mb-4" style="font-size: 4rem;"></ion-icon>
                        <h3 class="font-bold mb-2 text-success">Daily Limit Reached!</h3>
                        <p class="text-sm text-muted">You have watched all ${limit} ads for today. Come back tomorrow for more earnings.</p>
                    `}
                </div>
            </div>

            <div class="card">
                <div class="flex justify-between items-center mb-2">
                    <span class="text-sm font-bold">Today's Progress</span>
                    <span class="text-sm font-mono text-accent">${currentDailyAds} / ${limit}</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${(currentDailyAds / limit) * 100}%;"></div>
                </div>
                <p class="text-xs text-muted mt-4 text-center">Do not close the app while the ad is playing. You will only be rewarded after full completion.</p>
            </div>
        </div>
    `;

    // Event binding mechanism: The router dispatches 'route-rendered' which we can listen to,
    // or we can attach logic to window. However, the router's architecture lets us attach global listeners
    // that check for specific element existence. We'll set it up in app.js or directly here using a hack function.

    return UserLayout(content, 'ads', user);
};

const bindAdsEvents = (user) => {
    // Hide Banner when entering Ad Screen
    if (window.UnityAdsBridge) window.UnityAdsBridge.hideBanner();

    const startBtn = document.getElementById('start-ad-btn');
    const admobBtn = document.getElementById('admob-ad-btn');
    const applovinBtn = document.getElementById('applovin-ad-btn');
    const interBtn = document.getElementById('interstitial-btn');
    const container = document.getElementById('ad-player-container');

    if (interBtn) {
        interBtn.onclick = () => {
            if (window.UnityAdsBridge) window.UnityAdsBridge.showInterstitial();
            window.showToast("Requested Unity Interstitial (Android)", "warning");
        };
    }

    const playSimulatedAd = (networkName) => {
        const settings = store.getSettings();

        // Render playing state
        container.innerHTML = `
            <div class="w-full h-full flex flex-col items-center bg-black justify-center animate-fade-in" style="position: absolute; top:0; left:0; right:0; bottom:0; z-index: 50;">
                <!-- Real Video Player to simulate Ad -->
                <video id="simulated-ad-video" style="width: 100%; height: 100%; object-fit: cover; background-color: #000;" autoplay playsinline>
                    <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4">
                    Your browser does not support HTML video.
                </video>
                
                <div class="absolute top-4 left-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded text-xs border border-gray-600">
                    Sponsored Ad • <span id="ad-time-left">60</span>s
                </div>
                
                <div class="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded text-xs flex items-center gap-1 border border-gray-600" style="opacity: 0.8;">
                    <ion-icon name="${networkName === 'Unity Ads' ? 'logo-android' : networkName === 'AdMob' ? 'logo-google' : 'phone-portrait-outline'}" class="text-accent"></ion-icon> ${networkName}
                </div>
                
                <div class="absolute top-4 right-4" style="opacity: 0.5;">
                    <ion-icon name="volume-mute" class="text-white text-xl"></ion-icon>
                </div>
            </div>
        `;

        // If it's Unity, try the Native Bridge first
        if (networkName === 'Unity Ads' && window.UnityAdsBridge && window.AndroidAdsInterface) {
            window.UnityAdsBridge.showRewarded();
        } else {
            // Web simulation playback
            const vid = document.getElementById('simulated-ad-video');
            const timeEl = document.getElementById('ad-time-left');

            if (vid) {
                vid.muted = true; // Auto-play policies
                vid.play().catch(e => console.log("Auto-play blocked:", e));

                vid.addEventListener('timeupdate', () => {
                    // Force 60 second countdown regardless of video length
                    const left = Math.max(0, 60 - Math.floor(vid.currentTime));
                    if (timeEl) timeEl.innerText = left;

                    if (left <= 0) {
                        vid.pause();
                        const event = new CustomEvent('ad-rewarded-completed', { detail: { networkName } });
                        document.dispatchEvent(event);
                    }
                });

                // Loop video so it doesn't stop before 60s
                vid.loop = true;
            } else {
                setTimeout(() => {
                    const event = new CustomEvent('ad-rewarded-completed', { detail: { networkName } });
                    document.dispatchEvent(event);
                }, 60000);
            }
        }

        // Listen for completion to grant reward
        const rewardHandler = (e) => {
            document.removeEventListener('ad-rewarded-completed', rewardHandler);
            document.removeEventListener('unity-rewarded-completed', rewardHandler); // support native fallback

            const net = e?.detail?.networkName || networkName;

            // Reward user
            const today = new Date().toDateString();
            let currentDailyAds = (user.dailyAdsCount || 0) + 1;
            let balance = user.balance + settings.rewardPerAd;
            let totalEarnings = user.totalEarnings + settings.rewardPerAd;
            let adsWatched = user.adsWatched + 1;

            user = store.updateUser(user.id, {
                dailyAdsCount: currentDailyAds,
                lastWatchedDate: today,
                balance,
                totalEarnings,
                adsWatched
            });

            // Add history record
            store.data.history.push({
                id: 'hist_' + Date.now(),
                userId: user.id,
                type: 'ad',
                amount: settings.rewardPerAd,
                date: new Date().toISOString(),
                detail: `Watched Ad (${net})`
            });
            store._saveData();

            window.showToast(`Reward Credited: ${settings.rewardPerAd} Coins`, 'success');
            window.location.reload();
        };

        document.addEventListener('ad-rewarded-completed', rewardHandler);
        // Link Native unity event just in case
        document.addEventListener('unity-rewarded-completed', rewardHandler);
    };

    if (startBtn && container) startBtn.onclick = () => playSimulatedAd('Unity Ads');
    if (admobBtn && container) admobBtn.onclick = () => playSimulatedAd('AdMob');
    if (applovinBtn && container) applovinBtn.onclick = () => playSimulatedAd('AppLovin Max');
};




const WalletView = (user) => {
    const settings = store.getSettings();
    const canWithdraw = user.balance >= settings.minWithdrawal;
    const progressToPayout = Math.min((user.balance / settings.minWithdrawal) * 100, 100);

    const content = `
        <div class="container animate-fade-in" style="padding-top: 2rem;">
            <div class="text-center mb-6">
                <h2 class="mb-2">Wallet</h2>
            </div>
            
            <div class="card mb-6" style="background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary)); color: white; border: none; box-shadow: 0 10px 25px rgba(100, 116, 139, 0.3);">
                <span class="text-sm font-bold opacity-80">Available Balance</span>
                <h1 class="text-success mb-2 font-mono" style="color: white; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">${user.balance.toFixed(0)} Coins</h1>
                <p class="text-xs text-muted mb-4" style="color: rgba(255,255,255,0.7);">Minimum withdrawal limit is ${settings.minWithdrawal} Coins (₹${(settings.minWithdrawal / 100).toFixed(2)}).</p>
            </div>    <div class="progress-bar mb-2">
                    <div class="progress-fill" style="width: ${progressToPayout}%;"></div>
                </div>
            </div>

            <div class="card mb-6">
                <h3 class="font-bold mb-4">Withdraw Funds</h3>
                <form id="withdraw-form">
                    <div class="input-group">
                        <label>Payment Method</label>
                        <select id="wd-method" required class="w-full">
                            <option value="upi">UPI Transfer</option>
                            <option value="paytm">Paytm Wallet</option>
                            <option value="bank">Bank Transfer</option>
                        </select>
                    </div>
                    <div class="input-group">
                        <label>Account Info (UPI ID / Mobile No.)</label>
                        <input type="text" id="wd-account" required placeholder="Enter details" ${!canWithdraw ? 'disabled' : ''}>
                    </div>
                    <div class="input-group">
                        <label>Amount (Coins)</label>
                        <input type="number" id="wd-amount" required placeholder="0 Coins" max="${user.balance}" min="${settings.minWithdrawal}" ${!canWithdraw ? 'disabled' : ''}>
                    </div>
                    <button type="submit" class="btn btn-primary w-full mt-2" ${!canWithdraw ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''}>
                        <ion-icon name="cash"></ion-icon> Request ₹${(settings.minWithdrawal / 100).toFixed(2)} Payout
                    </button>
                    ${!canWithdraw ? `<p class="text-xs text-danger mt-3 text-center">You need ${(settings.minWithdrawal - user.balance).toFixed(0)} more Coins to withdraw.</p>` : ''}
                </form>
            </div>
        </div>
    `;

    return UserLayout(content, 'wallet', user);
};

const bindWalletEvents = (user) => {
    const form = document.getElementById('withdraw-form');
    if (form) {
        form.onsubmit = (e) => {
            e.preventDefault();
            const method = document.getElementById('wd-method').value;
            const account = document.getElementById('wd-account').value;
            const amount = parseFloat(document.getElementById('wd-amount').value);

            if (amount > user.balance) {
                window.showToast('Error: Insufficient balance', 'error');
                return;
            }

            // Deduct balance securely via service
            store.updateUser(user.id, {
                balance: user.balance - amount
            });

            // Create withdrawal request
            store.data.withdrawals.push({
                id: 'wd_' + Date.now(),
                userId: user.id,
                amount: amount,
                method: method,
                accountDetails: account,
                status: 'pending',
                date: new Date().toISOString()
            });

            // Add history
            store.data.history.push({
                id: 'hist_' + Date.now(),
                userId: user.id,
                type: 'withdrawal',
                amount: amount,
                date: new Date().toISOString(),
                detail: `Withdrawal via ${method.toUpperCase()} (Pending)`
            });

            store._saveData();

            window.showToast('Withdrawal request submitted successfully!', 'success');
            // Auto reload to update current state
            setTimeout(() => window.location.reload(), 1500);
        };
    }
};




const HistoryView = (user) => {
    // Get history for user and reverse it for latest first
    const history = store.data.history.filter(h => h.userId === user.id).reverse();

    let listHTML = '';
    if (history.length === 0) {
        listHTML = `
            <div class="text-center text-muted py-8 glass" style="border-radius: var(--radius-lg);">
                <ion-icon name="document-text-outline" class="mb-2" style="font-size: 3rem; color: var(--text-muted);"></ion-icon>
                <p>No transactions yet.</p>
            </div>
        `;
    } else {
        listHTML = history.map(h => {
            const isAd = h.type === 'ad';
            const icon = isAd ? 'play-circle' : 'cash';
            const colorClass = isAd ? 'text-success' : 'text-warning'; // Changed 'color' to 'colorClass' to avoid conflict
            const sign = isAd ? '+' : '-';
            const date = new Date(h.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

            return `
                <div class="card mb-3 flex items-center justify-between pointer" style="padding: 1rem; border-left: 4px solid var(--${isAd ? 'success' : 'warning'});">
                    <div class="flex items-center gap-3">
                        <div class="glass" style="padding: 0.6rem; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                            <ion-icon name="${icon}" class="${colorClass}" style="font-size: 1.5rem;"></ion-icon>
                        </div>
                        <div>
                            <h4 class="text-sm font-bold m-0 p-0">${h.detail}</h4>
                            <span class="text-xs text-muted">${date}</span>
                        </div>
                    </div>
                    <div class="font-mono font-bold ${isAd ? 'text-success' : ''}">
                        <span class="${colorClass}">${sign}${h.amount.toFixed(0)} Coins</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    const content = `
        <div class="container animate-fade-in" style="padding-top: 2rem;">
            <div class="mb-6 flex justify-between items-end">
                <h2 class="mb-0">History</h2>
                <span class="text-sm font-bold px-3 py-1 glass" style="border-radius:2rem; color: var(--accent-primary);">Latest</span>
            </div>
            
            <div class="history-list">
                ${listHTML}
            </div>
        </div>
    `;

    return UserLayout(content, 'history', user);
};




const ReferralsView = (user) => {
    const settings = store.getSettings();
    const refsCount = user.referrals ? user.referrals.length : 0;

    const content = `
        <div class="container animate-fade-in" style="padding-top: 2rem;">
            <div class="text-center mb-6">
                <h2 class="mb-2">Refer & Earn</h2>
                <p class="text-muted text-sm">Earn ${settings.referralPercentage}% of your friends' ad earnings for life.</p>
            </div>
            
            <div class="card mb-6 text-center" style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), transparent); border: 1px dashed var(--accent-primary);">
                <ion-icon name="gift" class="text-accent mb-2" style="font-size: 3rem; filter: drop-shadow(0 0 10px var(--accent-glow));"></ion-icon>
                <h3 class="font-bold mb-4">Your Invite Code</h3>
                <div class="flex justify-center items-center gap-2 mb-2">
                    <div class="glass flex items-center justify-center font-mono font-bold text-accent px-6 py-3" style="font-size: 1.5rem; letter-spacing: 2px; border-radius: var(--radius-md);">
                        ${user.inviteCode}
                    </div>
                    <button class="btn btn-primary" onclick="window.showToast('Code copied to clipboard!', 'success')" style="padding: 0.75rem;">
                        <ion-icon name="copy-outline"></ion-icon>
                    </button>
                </div>
                <p class="text-xs text-muted mt-4">Ask your friends to enter this code during signup.</p>
            </div>

            <div class="stats-grid mb-6">
                <div class="card flex-col items-center justify-center text-center p-4">
                    <ion-icon name="people" class="text-secondary mb-2" style="font-size: 2rem;"></ion-icon>
                    <h3 class="font-mono">${refsCount}</h3>
                    <span class="text-sm text-muted">Total Referrals</span>
                </div>
                <div class="card flex-col items-center justify-center text-center p-4">
                    <ion-icon name="wallet-outline" class="text-success mb-2" style="font-size: 2rem;"></ion-icon>
                    <h3 class="font-mono text-success">Active</h3>
                    <span class="text-sm text-muted">Commission</span>
                </div>
            </div>
        </div>
    `;

    return UserLayout(content, 'referrals', user);
};

const AdminLayout = (content, activeTab = 'dashboard', user = null) => {
    return `
        <div class="admin-layout flex">
            <!-- Sidebar Navigation -->
            <aside class="admin-sidebar glass-dark">
                <div class="p-6">
                    <h2 class="text-accent font-bold tracking-wider">EarnAds<span class="text-white text-sm ml-2 px-2 py-1 bg-red-500 rounded font-mono">ADMIN</span></h2>
                </div>
                
                <nav class="admin-nav mt-6 flex flex-col gap-2 px-4">
                    <a href="#/admin/dashboard" class="admin-nav-item ${activeTab === 'dashboard' ? 'active' : ''}">
                        <ion-icon name="grid-outline"></ion-icon> Overview
                    </a>
                    <a href="#/admin/users" class="admin-nav-item ${activeTab === 'users' ? 'active' : ''}">
                        <ion-icon name="people-outline"></ion-icon> Manage Users
                    </a>
                    <a href="#/admin/withdrawals" class="admin-nav-item ${activeTab === 'withdrawals' ? 'active' : ''}">
                        <ion-icon name="cash-outline"></ion-icon> Withdrawals
                    </a>
                    <a href="#/admin/settings" class="admin-nav-item ${activeTab === 'settings' ? 'active' : ''}">
                        <ion-icon name="settings-outline"></ion-icon> App Settings
                    </a>
                </nav>

                <div class="absolute bottom-0 w-full p-4 border-t border-gray-700">
                    <button class="btn btn-secondary w-full text-left flex items-center justify-start gap-3" onclick="store.logout(); window.location.hash='#/'">
                        <ion-icon name="log-out-outline"></ion-icon> Logout
                    </button>
                </div>
            </aside>

            <!-- Main Content Area -->
            <main class="admin-main flex-1 bg-slate-900 overflow-y-auto">
                <!-- Top Header -->
                <header class="admin-header glass-dark flex justify-between items-center p-4 sticky top-0 z-50">
                    <h3 class="font-bold text-lg text-white capitalize">${activeTab}</h3>
                    <div class="flex items-center gap-4">
                        <div class="text-right">
                            <p class="text-sm font-bold text-white">${user?.name || 'Admin'}</p>
                            <p class="text-xs text-success">Online</p>
                        </div>
                        <div class="h-10 w-10 bg-accent rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg border-2 border-slate-700">
                            A
                        </div>
                    </div>
                </header>
                
                <div class="p-8">
                    ${content}
                </div>
            </main>
        </div>
    `;
};




const AdminDashboardView = (user) => {
    const allUsers = store.getAllUsers();
    const withdrawals = store.getAllWithdrawals();

    // Stats
    const totalUsers = allUsers.length;

    // Active users today (who watched an ad today)
    const todayStr = new Date().toDateString();
    const activeUsersToday = allUsers.filter(u => u.lastWatchedDate === todayStr).length;

    const totalAdsWatched = allUsers.reduce((sum, u) => sum + (u.adsWatched || 0), 0);
    const totalEarnings = allUsers.reduce((sum, u) => sum + (u.totalEarnings || 0), 0);

    // Today's payout requests
    const todayPayouts = withdrawals.filter(w => new Date(w.date).toDateString() === todayStr && w.status === 'pending');

    const content = `
        <div class="animate-fade-in">
            <h2 class="text-2xl font-bold mb-6 text-white">System Overview</h2>
            
            <div class="grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem;">
                
                <div class="card bg-slate-800 border-l-4" style="border-left-color: var(--accent-primary); border-top: 1px solid rgba(255,255,255,0.05); border-right: 1px solid rgba(255,255,255,0.05); border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <div class="flex justify-between items-center mb-2">
                        <h3 class="text-xs font-bold text-muted uppercase tracking-wider">Total Users</h3>
                        <ion-icon name="people" class="text-accent" style="font-size: 1.5rem;"></ion-icon>
                    </div>
                    <div class="text-4xl font-mono font-bold text-white">${totalUsers}</div>
                </div>
                
                <div class="card bg-slate-800 border-l-4" style="border-left-color: var(--success); border-top: 1px solid rgba(255,255,255,0.05); border-right: 1px solid rgba(255,255,255,0.05); border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <div class="flex justify-between items-center mb-2">
                        <h3 class="text-xs font-bold text-muted uppercase tracking-wider">Active Today</h3>
                        <ion-icon name="pulse" class="text-success" style="font-size: 1.5rem;"></ion-icon>
                    </div>
                    <div class="text-4xl font-mono font-bold text-white">${activeUsersToday}</div>
                </div>

                <div class="card bg-slate-800 border-l-4" style="border-left-color: var(--warning); border-top: 1px solid rgba(255,255,255,0.05); border-right: 1px solid rgba(255,255,255,0.05); border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <div class="flex justify-between items-center mb-2">
                        <h3 class="text-xs font-bold text-muted uppercase tracking-wider">Ads Watched</h3>
                        <ion-icon name="play-circle" class="text-warning" style="font-size: 1.5rem;"></ion-icon>
                    </div>
                    <div class="text-4xl font-mono font-bold text-white">${totalAdsWatched}</div>
                </div>

                <div class="card bg-slate-800 border-l-4" style="border-left-color: #ec4899; border-top: 1px solid rgba(255,255,255,0.05); border-right: 1px solid rgba(255,255,255,0.05); border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <div class="flex justify-between items-center mb-2">
                        <h3 class="text-xs font-bold text-muted uppercase tracking-wider">Total Payout Liability</h3>
                        <ion-icon name="wallet" style="color: #ec4899; font-size: 1.5rem;"></ion-icon>
                    </div>
                    <div class="text-3xl font-mono font-bold text-white">${totalEarnings.toFixed(0)} Coins</div>
                    <div class="text-xs text-success">₹${(totalEarnings / 100).toFixed(2)} Equivalent</div>
                </div>
                
            </div>
            
            <div class="mt-8">
                <h3 class="font-bold mb-4 text-white">Pending Withdrawals (Today)</h3>
                ${todayPayouts.length > 0 ? `
                    <div class="overflow-hidden rounded-lg border border-slate-700">
                        <table class="admin-table">
                            <thead>
                                <tr>
                                    <th>User ID</th>
                                    <th>Amount</th>
                                    <th>Method</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${todayPayouts.map(w => `
                                    <tr>
                                        <td class="font-mono text-sm">${w.userId.split('_')[1]}</td>
                                        <td class="font-bold text-success">${w.amount} Coins</td>
                                        <td class="uppercase text-xs font-bold">${w.method}</td>
                                        <td><a href="#/admin/withdrawals" class="text-accent text-sm hover:underline">Review &rarr;</a></td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                ` : `
                    <div class="glass flex items-center justify-center p-8 text-muted rounded-lg border border-slate-700">
                        No pending withdrawal requests today.
                    </div>
                `}
            </div>
        </div>
    `;

    return AdminLayout(content, 'dashboard', user);
};




const AdminUsersView = (user) => {
    const allUsers = store.getAllUsers();

    let tableRows = allUsers.map(u => {
        const isBlocked = u.status === 'blocked';
        const registerDate = new Date(u.createdAt).toLocaleDateString();
        return `
            <tr>
                <td>
                    <div class="font-bold text-white">${u.name}</div>
                    <div class="text-xs text-muted font-mono">${u.phone}</div>
                </td>
                <td class="font-mono text-success font-bold">${u.balance.toFixed(0)} Coins</td>
                <td class="font-mono text-white">${u.adsWatched}</td>
                <td class="text-xs text-muted">${registerDate}</td>
                <td>
                    <span class="badge ${isBlocked ? 'badge-danger' : 'badge-success'}">${u.status}</span>
                </td>
                <td>
                    <div class="flex gap-2">
                        <button class="btn btn-secondary text-xs px-2 py-1 action-toggle-block" data-id="${u.id}" data-action="${isBlocked ? 'unblock' : 'block'}" title="${isBlocked ? 'Unblock User' : 'Block User'}">
                            <ion-icon name="${isBlocked ? 'checkmark-circle' : 'ban'}"></ion-icon>
                        </button>
                        ${!isBlocked ? `<button class="btn btn-primary text-xs px-2 py-1 action-bonus" data-id="${u.id}" title="Send Bonus">
                            <ion-icon name="gift"></ion-icon>
                        </button>` : ''}
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    if (allUsers.length === 0) {
        tableRows = `<tr><td colspan="6" class="text-center p-8 text-muted">No users registered yet.</td></tr>`;
    }

    const content = `
        <div class="animate-fade-in">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold text-white">Manage Users</h2>
                <div class="text-sm text-muted">Total: ${allUsers.length} Users</div>
            </div>
            
            <div class="card bg-slate-800 p-0 overflow-hidden border-slate-700">
                <div class="overflow-x-auto">
                    <table class="admin-table w-full">
                        <thead>
                            <tr>
                                <th>User Info</th>
                                <th>Wallet Balance</th>
                                <th>Ads Watched</th>
                                <th>Joined Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tableRows}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    return AdminLayout(content, 'users', user);
};

const bindAdminUserEvents = () => {
    // Event delegation for table buttons
    document.querySelectorAll('.action-toggle-block').forEach(btn => {
        btn.onclick = (e) => {
            const btnEl = e.target.closest('.action-toggle-block');
            const id = btnEl.getAttribute('data-id');
            const action = btnEl.getAttribute('data-action');
            if (confirm(`Are you sure you want to ${action} this user?`)) {
                store.updateUser(id, { status: action === 'block' ? 'blocked' : 'active' });
                window.showToast(`User account updated successfully.`);
                window.location.reload();
            }
        };
    });

    document.querySelectorAll('.action-bonus').forEach(btn => {
        btn.onclick = (e) => {
            const btnEl = e.target.closest('.action-bonus');
            const id = btnEl.getAttribute('data-id');
            const amount = prompt("Enter bonus amount (₹):", "10");
            if (amount && !isNaN(amount)) {
                const u = store.data.users.find(x => x.id === id);
                if (u) {
                    store.updateUser(id, {
                        balance: u.balance + parseFloat(amount),
                        totalEarnings: u.totalEarnings + parseFloat(amount)
                    });
                    // add history
                    store.data.history.push({
                        id: 'hist_' + Date.now(),
                        userId: u.id,
                        type: 'ad',
                        amount: parseFloat(amount),
                        date: new Date().toISOString(),
                        detail: 'Admin Bonus Credited'
                    });
                    store._saveData();
                    window.showToast(`${amount} Coins Bonus credited to ${u.name}.`);
                    window.location.reload();
                }
            }
        };
    });
};




const AdminWithdrawalsView = (user) => {
    const list = store.getAllWithdrawals().reverse();
    const users = store.getAllUsers();

    let tableRows = list.map(w => {
        const reqUser = users.find(u => u.id === w.userId);
        const date = new Date(w.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });

        let statusBadge = w.status;
        if (statusBadge === 'pending') statusBadge = 'badge-warning';
        else if (statusBadge === 'approved' || statusBadge === 'paid') statusBadge = 'badge-success';
        else statusBadge = 'badge-danger';

        return `
            <tr>
                <td>
                    <div class="font-bold text-white">${reqUser ? reqUser.name : 'Unknown User'}</div>
                    <div class="text-xs text-muted font-mono">${date}</div>
                </td>
                <td class="font-mono text-white font-bold text-lg">${w.amount} Coins</td>
                <td>
                    <div class="uppercase text-xs font-bold text-accent mb-1">${w.method}</div>
                    <div class="font-mono text-sm text-white bg-slate-700 px-2 py-1 rounded inline-block">${w.accountDetails}</div>
                </td>
                <td>
                    <span class="badge ${statusBadge}">${w.status}</span>
                </td>
                <td>
                    ${w.status === 'pending' ? `
                        <div class="flex gap-2">
                            <button class="btn btn-primary text-xs px-3 py-1 action-wd" data-id="${w.id}" data-action="approved" title="Approve & Mark Paid">
                                <ion-icon name="checkmark-outline"></ion-icon> Approve
                            </button>
                            <button class="btn btn-danger text-xs px-3 py-1 action-wd" data-id="${w.id}" data-action="rejected" title="Reject & Refund">
                                <ion-icon name="close-outline"></ion-icon> Reject
                            </button>
                        </div>
                    ` : `<span class="text-xs text-muted"><ion-icon name="checkmark-done-outline"></ion-icon> Processed</span>`}
                </td>
            </tr>
        `;
    }).join('');

    if (list.length === 0) {
        tableRows = `<tr><td colspan="5" class="text-center p-8 text-muted">No withdrawal requests found.</td></tr>`;
    }

    const content = `
        <div class="animate-fade-in">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold text-white">Withdrawal Requests</h2>
            </div>
            
            <div class="card bg-slate-800 p-0 overflow-hidden border-slate-700">
                <div class="overflow-x-auto">
                    <table class="admin-table w-full">
                        <thead>
                            <tr>
                                <th>User Info & Time</th>
                                <th>Payout Amount</th>
                                <th>Account Details</th>
                                <th>Request Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tableRows}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    return AdminLayout(content, 'withdrawals', user);
};

const bindAdminWithdrawalEvents = () => {
    document.querySelectorAll('.action-wd').forEach(btn => {
        btn.onclick = (e) => {
            const btnEl = e.target.closest('.action-wd');
            const id = btnEl.getAttribute('data-id');
            const action = btnEl.getAttribute('data-action');

            if (confirm(`Confirm ${action.toUpperCase()} action for this withdrawal request?`)) {
                const wd = store.data.withdrawals.find(x => x.id === id);
                if (wd && wd.status === 'pending') {
                    wd.status = action;

                    // Refund if rejected
                    if (action === 'rejected') {
                        const u = store.data.users.find(user => user.id === wd.userId);
                        if (u) {
                            u.balance += wd.amount;
                            store.data.history.push({
                                id: 'hist_' + Date.now(),
                                userId: u.id,
                                type: 'ad',
                                amount: wd.amount,
                                date: new Date().toISOString(),
                                detail: 'Refund: Withdrawal Rejected'
                            });
                        }
                    } else if (action === 'approved') {
                        store.data.history.push({
                            id: 'hist_' + Date.now(),
                            userId: wd.userId,
                            type: 'withdrawal',
                            amount: wd.amount,
                            date: new Date().toISOString(),
                            detail: 'Withdrawal Approved & Processed'
                        });
                    }

                    store._saveData();
                    window.showToast(`Request successfully marked as ${action}.`, 'success');
                    window.location.reload();
                }
            }
        };
    });
};




const AdminSettingsView = (user) => {
    const settings = store.getSettings();

    const content = `
        <div class="animate-fade-in">
            <h2 class="text-2xl font-bold text-white mb-6">Global App Settings</h2>
            
            <div class="card bg-slate-800 border-slate-700 max-w-2xl">
                <form id="admin-settings-form">
                    <div class="grid" style="grid-template-columns: 1fr 1fr; gap: 1.5rem;">
                        <div class="input-group">
                            <label class="text-white">Daily Ad Limit</label>
                            <input type="number" id="set-ad-limit" required value="${settings.dailyAdLimit}" class="bg-slate-900 text-white border-slate-600">
                            <span class="text-xs text-muted mt-1">Maximum ads a user can watch per day.</span>
                        </div>
                        
                        <div class="input-group">
                            <label class="text-white">Reward Per Ad (Coins)</label>
                            <input type="number" step="1" id="set-reward" required value="${settings.rewardPerAd}" class="bg-slate-900 text-white border-slate-600">
                            <span class="text-xs text-muted mt-1">Amount credited to wallet after watching 1 ad.</span>
                        </div>
                        
                        <div class="input-group">
                            <label class="text-white">Minimum Withdrawal (Coins)</label>
                            <input type="number" id="set-min-wd" required value="${settings.minWithdrawal}" class="bg-slate-900 text-white border-slate-600">
                            <span class="text-xs text-muted mt-1">Threshold required before payout request.</span>
                        </div>
                        
                        <div class="input-group">
                            <label class="text-white">Referral Commission (%)</label>
                            <input type="number" id="set-ref-pct" required value="${settings.referralPercentage}" class="bg-slate-900 text-white border-slate-600">
                            <span class="text-xs text-muted mt-1">Simulated percentage for UI display.</span>
                        </div>

                        <div class="input-group">
                            <label class="text-white">Unity Ads Game ID</label>
                            <input type="text" id="set-unity-id" required value="${settings.unityGameId}" class="bg-slate-900 text-white border-slate-600 font-mono">
                            <span class="text-xs text-muted mt-1">Native SDK App Identifier for Android/iOS.</span>
                        </div>
                    </div>
                    
                    <hr class="my-6 border-slate-700">
                    
                    <div class="flex items-center gap-3 mb-6">
                        <input type="checkbox" id="set-maintenance" ${settings.appMaintenance ? 'checked' : ''} style="width:1.5rem; height:1.5rem; accent-color: var(--danger);">
                        <div>
                            <label for="set-maintenance" class="text-white font-bold cursor-pointer">Enable Maintenance Mode</label>
                            <p class="text-xs text-muted">Blocks all user actions during server upgrades.</p>
                        </div>
                    </div>
                    
                    <div class="flex gap-4">
                        <button type="submit" class="btn btn-primary" style="padding: 0.75rem 2rem;">Save Settings</button>
                        <button type="button" class="btn btn-secondary" onclick="window.location.reload()">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    return AdminLayout(content, 'settings', user);
};

const bindAdminSettingsEvents = () => {
    const form = document.getElementById('admin-settings-form');
    if (form) {
        form.onsubmit = (e) => {
            e.preventDefault();

            const newSettings = {
                dailyAdLimit: parseInt(document.getElementById('set-ad-limit').value),
                rewardPerAd: parseInt(document.getElementById('set-reward').value),
                minWithdrawal: parseInt(document.getElementById('set-min-wd').value),
                referralPercentage: parseInt(document.getElementById('set-ref-pct').value),
                appMaintenance: document.getElementById('set-maintenance').checked,
                unityGameId: document.getElementById('set-unity-id').value
            };

            store.updateSettings(newSettings);
            window.showToast('Global settings updated successfully!', 'success');
        };
    }
};



// User Pages






// Admin Pages





// Toast System
window.showToast = (message, type = 'success') => {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let icon = 'checkmark-circle-outline';
    if (type === 'error') icon = 'close-circle-outline';
    if (type === 'warning') icon = 'warning-outline';

    toast.innerHTML = `<ion-icon name="${icon}" style="font-size: 1.5rem;"></ion-icon> <span>${message}</span>`;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};

const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(10px); }
    }
`;
document.head.appendChild(style);


class AppRouter {
    constructor() {
        this.appDiv = document.getElementById('app');
        this.routes = {};

        window.addEventListener('hashchange', () => this.handleRoute());
        setTimeout(() => this.handleRoute(), 0);
    }

    addRoute(path, componentFn) {
        this.routes[path] = componentFn;
    }

    async handleRoute() {
        const path = window.location.hash.slice(1) || '/';
        const user = store.getCurrentUser();

        // Guards
        if (path.startsWith('/admin') && (!user || user.role !== 'admin') && path !== '/admin-login') {
            window.location.hash = '/admin-login';
            return;
        }

        if (path !== '/' && path !== '/signup' && path !== '/admin-login' && !path.startsWith('/admin') && !user) {
            window.location.hash = '/';
            return;
        }

        const matched = this.routes[path];
        if (matched) {
            this.appDiv.innerHTML = '<div class="container flex items-center justify-center min-h-screen text-accent font-bold animate-pulse">Loading View...</div>';
            this.appDiv.innerHTML = typeof matched === 'function' ? await matched(user) : matched;

            const event = new CustomEvent('route-rendered', { detail: { path, user } });
            document.dispatchEvent(event);
        } else {
            this.appDiv.innerHTML = `<div class="container text-center pt-20"><h1>404</h1><p>Not Found</p><button class="btn btn-primary mt-4" onclick="window.history.back()">Back</button></div>`;
        }
    }
}

const router = new AppRouter();

// Auth Routes
router.addRoute('/', () => `
    <div class="auth-layout animate-fade-in">
        <div class="auth-banner">
            <h1 class="text-accent mb-4 slide-down" style="font-size: 3.5rem;">EarnAds</h1>
            <p class="text-muted mb-8 slide-up" style="font-size: 1.2rem; max-width: 400px;">Watch automated ads and earn real money beautifully.</p>
            <ion-icon name="videocam-outline" class="text-accent" style="font-size: 6rem; opacity: 0.2;"></ion-icon>
        </div>
        <div class="auth-content">
            <div class="card w-full glass text-center" style="max-width: 400px; box-shadow: 0 10px 40px rgba(0,0,0,0.5);">
               <!-- Mobile Title (Hidden on Desktop natively by the layout design, but shown for context) -->
               <h1 class="text-accent mb-2 md:hidden" style="font-size: 2rem;">EarnAds</h1>
               <h2 class="mb-4">Welcome Back</h2>
               <form id="login-form">
                   <div id="login-step-1">
                       <div class="input-group">
                           <input type="text" id="login-id" required placeholder="Mobile or Email">
                       </div>
                       <div class="input-group">
                           <input type="password" id="login-pass" placeholder="Password">
                       </div>
                       <button type="submit" class="btn btn-primary w-full mt-4" style="font-size:1.1rem;">Send Login OTP</button>
                   </div>
                   <div id="login-step-2" style="display: none;">
                       <p class="text-sm text-muted mb-4">We sent a 4-digit code to your device.</p>
                       <div class="input-group">
                           <input type="number" id="login-otp" placeholder="Enter OTP (e.g. 1234)">
                       </div>
                       <button type="button" id="verify-login-btn" class="btn btn-primary w-full mt-4" style="font-size:1.1rem;">Verify & Login</button>
                   </div>
               </form>
               <p class="mt-6 text-sm text-muted">New here? <a href="#/signup" class="text-accent font-bold hover:underline">Create Account</a></p>
               <p class="mt-4 text-xs text-muted"><a href="#/admin-login" class="text-muted hover:text-white transition-fast hover:underline">Go to Admin Portal</a></p>
            </div>
        </div>
    </div>
`);

router.addRoute('/admin-login', () => `
    <div class="auth-layout animate-fade-in" style="background-color: var(--bg-primary);">
        <div class="auth-banner" style="border-right-color: #ef4444; background: radial-gradient(circle at top right, #450a0a, var(--bg-primary));">
            <h1 class="text-white mb-4 slide-down" style="font-size: 3.5rem;">EarnAds</h1>
            <h2 class="text-danger font-mono tracking-wider">SECURE PORTAL</h2>
            <ion-icon name="shield-checkmark-outline" class="text-danger mt-8" style="font-size: 6rem; opacity: 0.2;"></ion-icon>
        </div>
        <div class="auth-content text-center">
            <div class="card w-full border border-slate-700 bg-slate-800" style="max-width: 400px; box-shadow: 0 10px 40px rgba(0,0,0,0.5);">
               <h2 class="mb-4 text-white">Owner Access</h2>
               <form id="login-form">
                   <div class="input-group">
                       <input type="email" id="login-id" required placeholder="Admin Email (admin@earnads.com)">
                   </div>
                   <div class="input-group">
                       <input type="password" id="login-pass" placeholder="Password (admin)">
                   </div>
                   <button type="submit" class="btn btn-primary w-full mt-4 bg-red-600 hover:bg-red-700" style="box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);">Access Console</button>
               </form>
               <p class="mt-6 text-sm text-muted"><a href="#/" class="text-muted hover:text-white transition-fast hover:underline">&larr; Back to User App</a></p>
            </div>
        </div>
    </div>
`);

router.addRoute('/signup', () => `
    <div class="auth-layout animate-fade-in">
        <div class="auth-banner">
            <h1 class="text-accent mb-4 slide-down" style="font-size: 3.5rem;">EarnAds</h1>
            <p class="text-muted mb-8 slide-up" style="font-size: 1.2rem; max-width: 400px;">Join thousands earning passive income every day.</p>
            <ion-icon name="rocket-outline" class="text-accent" style="font-size: 6rem; opacity: 0.2;"></ion-icon>
        </div>
        <div class="auth-content">
            <div class="card w-full glass text-center" style="max-width: 400px; box-shadow: 0 10px 40px rgba(0,0,0,0.5);">
               <h2 class="mb-4">Join EarnAds</h2>
               <form id="signup-form">
                   <div id="signup-step-1">
                       <div class="input-group">
                           <input type="text" id="signup-name" required placeholder="Full Name">
                       </div>
                       <div class="input-group">
                           <input type="tel" id="signup-phone" required placeholder="Mobile Number">
                       </div>
                       <div class="input-group">
                           <input type="email" id="signup-email" required placeholder="Email Address">
                       </div>
                       <div class="input-group">
                           <input type="text" id="signup-ref" placeholder="Referral Code (Optional)">
                       </div>
                       <button type="submit" class="btn btn-primary w-full mt-4" style="font-size:1.1rem;">Send Verification OTP</button>
                   </div>
                   <div id="signup-step-2" style="display: none;">
                       <p class="text-sm text-muted mb-4">We sent a 4-digit code to verify your phone.</p>
                       <div class="input-group">
                           <input type="number" id="signup-otp" placeholder="Enter Registration OTP">
                       </div>
                       <button type="button" id="verify-signup-btn" class="btn btn-primary w-full mt-4" style="font-size:1.1rem;">Verify & Create Account</button>
                   </div>
               </form>
               <p class="mt-6 text-sm text-muted">Already a member? <a href="#/" class="text-accent font-bold hover:underline">Login instead</a></p>
            </div>
        </div>
    </div>
`);

// User Routes
router.addRoute('/dashboard', DashboardView);
router.addRoute('/ads', WatchAdsView);
router.addRoute('/wallet', WalletView);
router.addRoute('/history', HistoryView);
router.addRoute('/referrals', ReferralsView);

// Admin Routes
router.addRoute('/admin/dashboard', AdminDashboardView);
router.addRoute('/admin/users', AdminUsersView);
router.addRoute('/admin/withdrawals', AdminWithdrawalsView);
router.addRoute('/admin/settings', AdminSettingsView);

// Interactions
document.addEventListener('route-rendered', (e) => {
    const { path, user } = e.detail;

    let loginData = null;
    let expectedLoginOtp = null;

    const loginForm = document.getElementById('login-form');
    if (loginForm && !window.location.hash.includes('admin-login')) {
        loginForm.onsubmit = (ev) => {
            ev.preventDefault();
            const id = document.getElementById('login-id').value;
            const pass = document.getElementById('login-pass').value;

            // Generate OTP and proceed to step 2.
            loginData = { id, pass };
            expectedLoginOtp = Math.floor(1000 + Math.random() * 9000).toString();

            window.showToast(`[Mock SMS] Your EarnAds Login OTP is: ${expectedLoginOtp}`, 'warning');

            document.getElementById('login-step-1').style.display = 'none';
            document.getElementById('login-step-2').style.display = 'block';
        };

        const verifyLoginBtn = document.getElementById('verify-login-btn');
        if (verifyLoginBtn) {
            verifyLoginBtn.onclick = () => {
                const entered = document.getElementById('login-otp').value;
                if (entered === expectedLoginOtp) {
                    const res = store.login(loginData.id, loginData.pass);
                    if (res.success) {
                        window.showToast(`Welcome, ${res.user.name}!`, 'success');
                        window.location.hash = '/dashboard';
                    } else {
                        window.showToast(res.error, 'error');
                        document.getElementById('login-step-1').style.display = 'block';
                        document.getElementById('login-step-2').style.display = 'none';
                    }
                } else {
                    window.showToast('Invalid OTP entered.', 'error');
                }
            };
        }
    } else if (loginForm && window.location.hash.includes('admin-login')) {
        // Admin stays one step for simplicity
        loginForm.onsubmit = (ev) => {
            ev.preventDefault();
            const id = document.getElementById('login-id').value;
            const pass = document.getElementById('login-pass').value;
            const res = store.login(id, pass);
            if (res.success && res.user.role === 'admin') {
                window.showToast('Authenticated as Admin.');
                window.location.hash = '/admin/dashboard';
            } else {
                window.showToast('Invalid Admin Credentials', 'error');
            }
        };
    }

    let signupData = null;
    let expectedSignupOtp = null;

    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.onsubmit = (ev) => {
            ev.preventDefault();
            signupData = {
                name: document.getElementById('signup-name').value,
                phone: document.getElementById('signup-phone').value,
                email: document.getElementById('signup-email').value,
                ref: document.getElementById('signup-ref').value
            };

            expectedSignupOtp = Math.floor(1000 + Math.random() * 9000).toString();
            window.showToast(`[Mock SMS] Your EarnAds Verification OTP is: ${expectedSignupOtp}`, 'warning');

            document.getElementById('signup-step-1').style.display = 'none';
            document.getElementById('signup-step-2').style.display = 'block';
        };

        const verifySignupBtn = document.getElementById('verify-signup-btn');
        if (verifySignupBtn) {
            verifySignupBtn.onclick = () => {
                const entered = document.getElementById('signup-otp').value;
                if (entered === expectedSignupOtp) {
                    const res = store.signup(signupData.name, signupData.phone, signupData.email, signupData.ref);
                    if (res.success) {
                        window.showToast('Account created! Welcome to EarnAds.');
                        window.location.hash = '/dashboard';
                    } else {
                        window.showToast(res.error, 'error');
                        document.getElementById('signup-step-1').style.display = 'block';
                        document.getElementById('signup-step-2').style.display = 'none';
                    }
                } else {
                    window.showToast('Invalid OTP entered.', 'error');
                }
            };
        }
    }

    // Bind dependencies based on route
    if (path === '/ads') bindAdsEvents(user);
    if (path === '/wallet') bindWalletEvents(user);

    if (path === '/admin/users') bindAdminUserEvents(user);
    if (path === '/admin/withdrawals') bindAdminWithdrawalEvents(user);
    if (path === '/admin/settings') bindAdminSettingsEvents(user);
});


