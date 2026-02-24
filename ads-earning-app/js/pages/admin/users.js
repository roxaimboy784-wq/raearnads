import { store } from '../../services/store.js';
import { AdminLayout } from './layout.js';

export const AdminUsersView = (user) => {
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
                <td class="font-mono text-success font-bold">₹${u.balance.toFixed(2)}</td>
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

export const bindAdminUserEvents = () => {
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
                    window.showToast(`₹${amount} Bonus credited to ${u.name}.`);
                    window.location.reload();
                }
            }
        };
    });
};
