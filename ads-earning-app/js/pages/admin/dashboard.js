import { store } from '../../services/store.js';
import { AdminLayout } from './layout.js';

export const AdminDashboardView = (user) => {
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
                    <div class="text-3xl font-mono font-bold text-white">₹${totalEarnings.toFixed(2)}</div>
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
                                        <td class="font-bold text-success">₹${w.amount}</td>
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
