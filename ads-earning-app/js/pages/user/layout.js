export const UserLayout = (content, activeTab = 'home', user = null) => {
    return `
        <div class="app-layout">
            <!-- Top App Bar -->
            <header class="topbar flex justify-between items-center glass">
                <div class="logo font-bold text-accent" style="font-size: 1.25rem;">EarnAds</div>
                <div class="user-profile flex items-center gap-2">
                    <span class="text-sm font-bold text-success font-mono">₹${user?.balance?.toFixed(2) || 0}</span>
                    <button class="icon-btn" onclick="window.location.hash='#/profile'">
                        <ion-icon name="person-circle" style="font-size: 1.75rem; color: var(--accent-primary);"></ion-icon>
                    </button>
                    <!-- Logout utility -->
                    <button class="icon-btn" onclick="require('./store.js').store.logout(); window.location.hash='#/'">
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
