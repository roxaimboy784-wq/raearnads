import { store } from '../../services/store.js';
import { UserLayout } from './layout.js';

export const HistoryView = (user) => {
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
            const color = isAd ? 'text-success' : 'text-warning';
            const sign = isAd ? '+' : '-';
            const date = new Date(h.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

            return `
                <div class="card mb-3 flex items-center justify-between pointer" style="padding: 1rem; border-left: 4px solid var(--${isAd ? 'success' : 'warning'});">
                    <div class="flex items-center gap-3">
                        <div class="glass" style="padding: 0.6rem; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                            <ion-icon name="${icon}" class="${color}" style="font-size: 1.5rem;"></ion-icon>
                        </div>
                        <div>
                            <h4 class="text-sm font-bold m-0 p-0">${h.detail}</h4>
                            <span class="text-xs text-muted">${date}</span>
                        </div>
                    </div>
                    <div class="font-mono font-bold ${isAd ? 'text-success' : ''}">
                        ${sign}₹${h.amount.toFixed(2)}
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
