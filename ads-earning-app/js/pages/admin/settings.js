import { store } from '../../services/store.js';
import { AdminLayout } from './layout.js';

export const AdminSettingsView = (user) => {
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
                            <label class="text-white">Reward Per Ad (₹)</label>
                            <input type="number" step="0.1" id="set-reward" required value="${settings.rewardPerAd}" class="bg-slate-900 text-white border-slate-600">
                            <span class="text-xs text-muted mt-1">Amount credited to wallet after watching 1 ad.</span>
                        </div>
                        
                        <div class="input-group">
                            <label class="text-white">Minimum Withdrawal (₹)</label>
                            <input type="number" id="set-min-wd" required value="${settings.minWithdrawal}" class="bg-slate-900 text-white border-slate-600">
                            <span class="text-xs text-muted mt-1">Threshold required before payout request.</span>
                        </div>
                        
                        <div class="input-group">
                            <label class="text-white">Referral Commission (%)</label>
                            <input type="number" id="set-ref-pct" required value="${settings.referralPercentage}" class="bg-slate-900 text-white border-slate-600">
                            <span class="text-xs text-muted mt-1">Simulated percentage for UI display.</span>
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

export const bindAdminSettingsEvents = () => {
    const form = document.getElementById('admin-settings-form');
    if (form) {
        form.onsubmit = (e) => {
            e.preventDefault();

            const newSettings = {
                dailyAdLimit: parseInt(document.getElementById('set-ad-limit').value),
                rewardPerAd: parseFloat(document.getElementById('set-reward').value),
                minWithdrawal: parseInt(document.getElementById('set-min-wd').value),
                referralPercentage: parseInt(document.getElementById('set-ref-pct').value),
                appMaintenance: document.getElementById('set-maintenance').checked
            };

            store.updateSettings(newSettings);
            window.showToast('Global settings updated successfully!', 'success');
        };
    }
};
