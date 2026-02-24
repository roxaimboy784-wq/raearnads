import { store } from '../../services/store.js';
import { AdminLayout } from './layout.js';

export const AdminWithdrawalsView = (user) => {
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
                <td class="font-mono text-white font-bold text-lg">₹${w.amount}</td>
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

export const bindAdminWithdrawalEvents = () => {
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
