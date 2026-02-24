import { store } from '../../services/store.js';
import { UserLayout } from './layout.js';

export const ProfileView = (user) => {
    const content = `
        <div class="container animate-fade-in" style="padding-top: 2rem; padding-bottom: 4rem;">
            <div class="text-center mb-6">
                <h2 class="mb-2">Profile & Settings</h2>
                <p class="text-muted text-sm">Manage your account, contact and payout details.</p>
            </div>

            <!-- Basic Info -->
            <div class="card mb-6">
                <h3 class="text-sm font-bold mb-4">Account Details</h3>
                <form id="profile-form">
                    <div class="input-group">
                        <label>Full Name</label>
                        <input type="text" id="pf-name" required value="${user.name || ''}">
                    </div>
                    <div class="input-group">
                        <label>Mobile Number</label>
                        <input type="tel" id="pf-phone" required value="${user.phone || ''}">
                    </div>
                    <div class="input-group">
                        <label>Email Address</label>
                        <input type="email" id="pf-email" required value="${user.email || ''}">
                    </div>

                    <hr class="my-4" style="border-color: rgba(255,255,255,0.06);" />

                    <!-- Payout Details -->
                    <h3 class="text-sm font-bold mb-3">Payout Details</h3>
                    <div class="input-group">
                        <label>UPI ID</label>
                        <input type="text" id="pf-upi" placeholder="your-upi@bank" value="${user.upiId || ''}">
                    </div>
                    <div class="input-group">
                        <label>Bank Details (Optional)</label>
                        <textarea id="pf-bank" rows="3" placeholder="Account Name, Number, IFSC">${user.bankDetails || ''}</textarea>
                    </div>

                    <button type="submit" class="btn btn-primary w-full mt-4">
                        <ion-icon name="save-outline"></ion-icon> Save Changes
                    </button>
                </form>
            </div>

            <!-- Security & Logout -->
            <div class="card">
                <h3 class="text-sm font-bold mb-3">Security</h3>
                <p class="text-xs text-muted mb-3">
                    This prototype uses password-less login for users (mobile / email based).
                    Admin password is <span class="font-mono">admin</span> for demo only.
                </p>
                <button id="pf-logout" class="btn btn-secondary w-full">
                    <ion-icon name="log-out-outline"></ion-icon> Logout
                </button>
            </div>
        </div>
    `;

    return UserLayout(content, 'profile', user);
};

export const bindProfileEvents = (user) => {
    const form = document.getElementById('profile-form');
    const logoutBtn = document.getElementById('pf-logout');

    if (form) {
        form.onsubmit = (e) => {
            e.preventDefault();

            const updated = {
                name: document.getElementById('pf-name').value,
                phone: document.getElementById('pf-phone').value,
                email: document.getElementById('pf-email').value,
                upiId: document.getElementById('pf-upi').value,
                bankDetails: document.getElementById('pf-bank').value
            };

            store.updateUser(user.id, updated);
            window.showToast('Profile updated successfully.', 'success');
        };
    }

    if (logoutBtn) {
        logoutBtn.onclick = () => {
            store.logout();
            window.location.hash = '/';
            window.showToast('Logged out.', 'success');
        };
    }
};

