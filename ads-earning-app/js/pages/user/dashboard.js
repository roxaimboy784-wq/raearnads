import { store } from '../../services/store.js';
import { UserLayout } from './layout.js';

export const DashboardView = (user) => {
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
            
            <div class="card mb-6" style="background: linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary));">
                <div class="flex justify-between items-center mb-4">
                    <span class="text-muted">Wallet Balance</span>
                    <ion-icon name="wallet" class="text-accent" style="font-size: 1.5rem;"></ion-icon>
                </div>
                <h1 class="text-success mb-2 font-mono">₹${user.balance.toFixed(2)}</h1>
                <div class="flex gap-4 mt-4">
                    <button class="btn btn-primary flex-1" onclick="window.location.hash='#/wallet'">Withdraw</button>
                    <button class="btn btn-secondary flex-1" onclick="window.location.hash='#/history'">History</button>
                </div>
            </div>

            <!-- Stats Grid -->
            <div class="stats-grid mb-6">
                <div class="card flex-col items-center justify-center text-center p-4">
                    <ion-icon name="cash-outline" class="text-success mb-2" style="font-size: 2rem;"></ion-icon>
                    <h3 class="font-mono">₹${user.totalEarnings.toFixed(2)}</h3>
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

    return UserLayout(content, 'home', user);
};
