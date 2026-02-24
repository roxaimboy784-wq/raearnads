import { store } from '../../services/store.js';
import { UserLayout } from './layout.js';

export const ReferralsView = (user) => {
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
