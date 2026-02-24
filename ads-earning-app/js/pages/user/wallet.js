import { store } from '../../services/store.js';
import { UserLayout } from './layout.js';

export const WalletView = (user) => {
    const settings = store.getSettings();
    const canWithdraw = user.balance >= settings.minWithdrawal;
    const progressToPayout = Math.min((user.balance / settings.minWithdrawal) * 100, 100);

    const content = `
        <div class="container animate-fade-in" style="padding-top: 2rem;">
            <div class="text-center mb-6">
                <h2 class="mb-2">Wallet</h2>
            </div>
            
            <div class="card mb-6" style="border: 1px solid var(--accent-primary); background: linear-gradient(to bottom, var(--bg-tertiary), var(--bg-secondary));">
                <span class="text-muted">Available Balance</span>
                <h1 class="text-success mb-2 font-mono">₹${user.balance.toFixed(2)}</h1>
                <p class="text-xs text-muted mb-4">Minimum withdrawal limit is ₹${settings.minWithdrawal}.</p>
                <div class="progress-bar mb-2">
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
                        <label>Amount (₹)</label>
                        <input type="number" id="wd-amount" required placeholder="0" max="${user.balance}" min="${settings.minWithdrawal}" ${!canWithdraw ? 'disabled' : ''}>
                    </div>
                    <button type="submit" class="btn btn-primary w-full mt-2" ${!canWithdraw ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''}>
                        <ion-icon name="cash"></ion-icon> Request Withdrawal
                    </button>
                    ${!canWithdraw ? `<p class="text-xs text-danger mt-3 text-center">You need ₹${(settings.minWithdrawal - user.balance).toFixed(2)} more to withdraw.</p>` : ''}
                </form>
            </div>
        </div>
    `;

    return UserLayout(content, 'wallet', user);
};

export const bindWalletEvents = (user) => {
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
