import { store } from '../../services/store.js';
import { UserLayout } from './layout.js';

export const WatchAdsView = (user) => {
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
                <p class="text-muted text-sm">Earn ₹${settings.rewardPerAd.toFixed(2)} for every ad you watch entirely.</p>
            </div>

            <div class="card mb-6 flex-col items-center justify-center p-8 text-center" style="min-height: 250px; background: #000; position: relative; border-color: #333;">
                <div id="ad-player-container" class="w-full h-full flex flex-col items-center justify-center">
                    ${canWatch ? `
                        <ion-icon name="videocam-outline" class="text-muted mb-4" style="font-size: 4rem;"></ion-icon>
                        <h3 class="font-bold mb-2">Ready to Watch</h3>
                        <p class="text-sm text-muted mb-6">Partner: Google AdMob / Unity</p>
                        <button id="start-ad-btn" class="btn btn-primary" style="padding: 1rem 2rem; font-size: 1.1rem; border-radius: 2rem;">
                            <ion-icon name="play-circle"></ion-icon> Start Ad
                        </button>
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

export const bindAdsEvents = (user) => {
    const startBtn = document.getElementById('start-ad-btn');
    const container = document.getElementById('ad-player-container');

    if (startBtn && container) {
        startBtn.onclick = () => {
            const settings = store.getSettings();

            // Render playing state
            container.innerHTML = `
                <div class="w-full h-full flex flex-col items-center justify-center animate-fade-in" style="position: absolute; top:0; left:0; right:0; bottom:0; padding:1rem;">
                    <!-- Simulating a Video Ad using CSS animation or placeholder -->
                    <div class="relative w-full h-full bg-slate-800 rounded-lg overflow-hidden flex flex-col items-center justify-center border" style="border-color: #333">
                        <ion-icon name="globe-outline" class="text-accent mb-2 ad-spinner" style="font-size: 4rem; animation: spin 3s linear infinite;"></ion-icon>
                        <h2 class="text-white mb-1">Sponsored Ad</h2>
                        <span class="text-sm text-muted">Please wait...</span>
                        
                        <!-- Timer Overlay -->
                        <div class="absolute top-4 right-4 bg-black bg-opacity-50 px-3 py-1 rounded-full border border-gray-600 text-sm font-mono flex items-center gap-2">
                            <span id="ad-timer">15</span>s
                        </div>
                        <div class="absolute bottom-4 left-4 bg-black bg-opacity-50 px-3 py-1 rounded border border-gray-600 text-xs font-bold text-accent">
                            AdMob Network
                        </div>
                    </div>
                </div>
            `;

            // Add spin animation dynamically if missing
            if (!document.getElementById('spin-style')) {
                const s = document.createElement('style');
                s.id = 'spin-style';
                s.textContent = '@keyframes spin { 100% { transform: rotate(360deg); } }';
                document.head.appendChild(s);
            }

            // Timer logic
            let timeLeft = 15; // 15 seconds ad
            const timerEl = document.getElementById('ad-timer');

            const interval = setInterval(() => {
                timeLeft--;
                if (timerEl) timerEl.innerText = timeLeft;

                if (timeLeft <= 0) {
                    clearInterval(interval);

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
                        detail: 'Watched Video Ad (AdMob)'
                    });
                    store._saveData();

                    window.showToast(`Earnings credited: ₹${settings.rewardPerAd}`, 'success');

                    // Re-render the view
                    window.location.reload(); // Quickest way to refresh state in hash router
                }
            }, 1000);
        };
    }
};
