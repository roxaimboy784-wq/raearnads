import { store } from './services/store.js';

// User Pages
import { DashboardView } from './pages/user/dashboard.js';
import { WatchAdsView, bindAdsEvents } from './pages/user/ads.js';
import { WalletView, bindWalletEvents } from './pages/user/wallet.js';
import { HistoryView } from './pages/user/history.js';
import { ReferralsView } from './pages/user/referrals.js';
import { ProfileView, bindProfileEvents } from './pages/user/profile.js';

// Admin Pages
import { AdminDashboardView } from './pages/admin/dashboard.js';
import { AdminUsersView, bindAdminUserEvents } from './pages/admin/users.js';
import { AdminWithdrawalsView, bindAdminWithdrawalEvents } from './pages/admin/withdrawals.js';
import { AdminSettingsView, bindAdminSettingsEvents } from './pages/admin/settings.js';

// Toast System
window.showToast = (message, type = 'success') => {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let icon = 'checkmark-circle-outline';
    if (type === 'error') icon = 'close-circle-outline';
    if (type === 'warning') icon = 'warning-outline';

    toast.innerHTML = `<ion-icon name="${icon}" style="font-size: 1.5rem;"></ion-icon> <span>${message}</span>`;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};

const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(10px); }
    }
`;
document.head.appendChild(style);


class AppRouter {
    constructor() {
        this.appDiv = document.getElementById('app');
        this.routes = {};

        window.addEventListener('hashchange', () => this.handleRoute());
        setTimeout(() => this.handleRoute(), 0);
    }

    addRoute(path, componentFn) {
        this.routes[path] = componentFn;
    }

    async handleRoute() {
        const path = window.location.hash.slice(1) || '/';
        const user = store.getCurrentUser();

        // Guards
        if (path.startsWith('/admin') && (!user || user.role !== 'admin') && path !== '/admin-login') {
            window.location.hash = '/admin-login';
            return;
        }

        if (path !== '/' && path !== '/signup' && path !== '/admin-login' && !path.startsWith('/admin') && !user) {
            window.location.hash = '/';
            return;
        }

        const matched = this.routes[path];
        if (matched) {
            this.appDiv.innerHTML = '<div class="container flex items-center justify-center min-h-screen text-accent font-bold animate-pulse">Loading View...</div>';
            this.appDiv.innerHTML = typeof matched === 'function' ? await matched(user) : matched;

            const event = new CustomEvent('route-rendered', { detail: { path, user } });
            document.dispatchEvent(event);
        } else {
            this.appDiv.innerHTML = `<div class="container text-center pt-20"><h1>404</h1><p>Not Found</p><button class="btn btn-primary mt-4" onclick="window.history.back()">Back</button></div>`;
        }
    }
}

export const router = new AppRouter();

// Auth Routes
router.addRoute('/', () => `
    <div class="container flex flex-col items-center justify-center min-h-screen text-center animate-fade-in" style="min-height: 100vh;">
        <h1 class="text-accent mb-4 slide-down">EarnAds</h1>
        <p class="text-muted mb-8 slide-up">Watch ads and earn real money beautifully.</p>
        <div class="card w-full glass" style="max-width: 400px; box-shadow: 0 10px 40px rgba(0,0,0,0.5);">
           <h2 class="mb-4">Login</h2>
           <form id="login-form">
               <div class="input-group">
                   <input type="text" id="login-id" required placeholder="Mobile or Email">
               </div>
               <div class="input-group">
                   <input type="password" id="login-pass" placeholder="Password">
               </div>
               <button type="submit" class="btn btn-primary w-full mt-4" style="font-size:1.1rem;">Secure Login</button>
           </form>
           <p class="mt-6 text-sm text-muted">New here? <a href="#/signup" class="text-accent font-bold">Create Account</a></p>
           <p class="mt-4 text-xs text-muted"><a href="#/admin-login" class="text-muted hover:text-white transition-fast">Go to Admin Portal</a></p>
        </div>
    </div>
`);

router.addRoute('/admin-login', () => `
    <div class="container flex flex-col items-center justify-center min-h-screen text-center animate-fade-in" style="min-height: 100vh; background-color: var(--bg-primary);">
        <h1 class="text-accent mb-4">EarnAds <span class="px-2 py-1 bg-red-500 rounded text-sm text-white font-mono ml-2">ADMIN</span></h1>
        <div class="card w-full border border-slate-700 bg-slate-800" style="max-width: 400px;">
           <h2 class="mb-4 text-white">Owner Access</h2>
           <form id="login-form">
               <div class="input-group">
                   <input type="email" id="login-id" required placeholder="Admin Email (admin@earnads.com)">
               </div>
               <div class="input-group">
                   <input type="password" id="login-pass" placeholder="Password (admin)">
               </div>
               <button type="submit" class="btn btn-primary w-full mt-4 bg-red-600 hover:bg-red-700" style="box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);">Access Console</button>
           </form>
           <p class="mt-6 text-sm text-muted"><a href="#/" class="text-muted hover:text-white transition-fast">&larr; Back to App</a></p>
        </div>
    </div>
`);

router.addRoute('/signup', () => `
    <div class="container flex flex-col items-center justify-center min-h-screen animate-fade-in" style="min-height: 100vh;">
        <div class="card w-full glass" style="max-width: 400px;">
           <h2 class="mb-4 text-center">Join EarnAds</h2>
           <form id="signup-form">
               <div class="input-group">
                   <input type="text" id="signup-name" required placeholder="Full Name">
               </div>
               <div class="input-group">
                   <input type="tel" id="signup-phone" required placeholder="Mobile Number">
               </div>
               <div class="input-group">
                   <input type="email" id="signup-email" required placeholder="Email Address">
               </div>
               <div class="input-group">
                   <input type="text" id="signup-ref" placeholder="Referral Code (Optional)">
               </div>
               <button type="submit" class="btn btn-primary w-full mt-4">Create Account</button>
           </form>
           <p class="mt-4 text-sm text-center text-muted">Already a member? <a href="#/" class="text-accent font-bold">Login</a></p>
        </div>
    </div>
`);

// User Routes
router.addRoute('/dashboard', DashboardView);
router.addRoute('/ads', WatchAdsView);
router.addRoute('/wallet', WalletView);
router.addRoute('/history', HistoryView);
router.addRoute('/referrals', ReferralsView);
router.addRoute('/profile', ProfileView);

// Admin Routes
router.addRoute('/admin/dashboard', AdminDashboardView);
router.addRoute('/admin/users', AdminUsersView);
router.addRoute('/admin/withdrawals', AdminWithdrawalsView);
router.addRoute('/admin/settings', AdminSettingsView);

// Interactions
document.addEventListener('route-rendered', (e) => {
    const { path, user } = e.detail;

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.onsubmit = (ev) => {
            ev.preventDefault();
            const id = document.getElementById('login-id').value;
            const pass = document.getElementById('login-pass').value;
            const res = store.login(id, pass);
            if (res.success) {
                window.showToast(res.user.role === 'admin' ? 'Authenticated as Admin.' : `Welcome, ${res.user.name}!`);
                window.location.hash = res.user.role === 'admin' ? '/admin/dashboard' : '/dashboard';
            } else {
                window.showToast(res.error, 'error');
            }
        };
    }

    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.onsubmit = (ev) => {
            ev.preventDefault();
            const res = store.signup(
                document.getElementById('signup-name').value,
                document.getElementById('signup-phone').value,
                document.getElementById('signup-email').value,
                document.getElementById('signup-ref').value
            );
            if (res.success) {
                window.showToast('Account created! Welcome to EarnAds.');
                window.location.hash = '/dashboard';
            } else {
                window.showToast(res.error, 'error');
            }
        };
    }

    // Bind dependencies based on route
    if (path === '/ads') bindAdsEvents(user);
    if (path === '/wallet') bindWalletEvents(user);

    if (path === '/admin/users') bindAdminUserEvents(user);
    if (path === '/admin/withdrawals') bindAdminWithdrawalEvents(user);
    if (path === '/admin/settings') bindAdminSettingsEvents(user);
    if (path === '/profile') bindProfileEvents(user);
});
