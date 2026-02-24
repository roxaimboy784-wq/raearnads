/**
 * LocalStorage Service
 * Handles data persistence for the application prototype.
 */

const STORE_KEY = 'earn_ads_app_data';

const initialData = {
    users: [], // { id, name, email, phone, balance, totalEarnings, adsWatched, role, referrals, inviteCode, status, createdAt }
    currentUser: null, // ID of currently logged in user
    withdrawals: [], // { id, userId, amount, method, status, date }
    history: [], // { id, userId, type: 'ad' | 'withdrawal', amount, date, detail }
    settings: {
        dailyAdLimit: 20,
        rewardPerAd: 2.5, // INR
        minWithdrawal: 100, // INR
        appMaintenance: false,
        referralPercentage: 10 // %
    }
};

class StoreService {
    constructor() {
        this.data = this._loadData();
    }

    _loadData() {
        const stored = localStorage.getItem(STORE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
        this._saveData(initialData);
        
        // Seed an admin user for demo purposes if new
        this._seedAdmin();
        
        return JSON.parse(localStorage.getItem(STORE_KEY));
    }

    _saveData(data = this.data) {
        localStorage.setItem(STORE_KEY, JSON.stringify(data));
        this.data = data;
    }

    _seedAdmin() {
        if (!this.data) this.data = initialData;
        const hasAdmin = this.data.users.find(u => u.role === 'admin');
        if (!hasAdmin) {
            this.data.users.push({
                id: 'admin_1',
                name: 'System Admin',
                phone: '0000000000',
                email: 'admin@earnads.com',
                password: 'admin', // Demo purpose
                balance: 0,
                totalEarnings: 0,
                adsWatched: 0,
                role: 'admin',
                referrals: [],
                inviteCode: 'ADMINVIP',
                status: 'active',
                createdAt: new Date().toISOString()
            });
            this._saveData();
        }
    }

    // --- Auth Methods ---
    login(phoneOrEmail, password) {
        let user;
        if (phoneOrEmail.includes('@')) {
            user = this.data.users.find(u => u.email === phoneOrEmail);
        } else {
            user = this.data.users.find(u => u.phone === phoneOrEmail);
        }
        
        if (user) {
            // Simplified demo authentication
            if ((user.role === 'admin' && password === 'admin') || user.role === 'user') {
                if (user.status === 'blocked') {
                    return { success: false, error: 'Your account is blocked. Contact support.' };
                }
                this.data.currentUser = user.id;
                this._saveData();
                return { success: true, user };
            }
        }
        return { success: false, error: 'Invalid credentials or user not found. (Hint for admin: admin@earnads.com / admin, User: signup first)' };
    }

    signup(name, phone, email, referredBy = null) {
        if (this.data.users.some(u => u.phone === phone || u.email === email)) {
            return { success: false, error: 'User with this phone or email already exists.' };
        }

        const newUser = {
            id: 'user_' + Date.now(),
            name,
            phone,
            email,
            balance: 0,
            totalEarnings: 0,
            adsWatched: 0,
            role: 'user',
            referrals: [],
            inviteCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
            referredBy: referredBy,
            status: 'active',
            createdAt: new Date().toISOString(),
            // Daily tracking
            lastWatchedDate: null,
            dailyAdsCount: 0,
            // Payout details
            upiId: '',
            bankDetails: ''
        };

        if (referredBy) {
            const referrer = this.data.users.find(u => u.inviteCode === referredBy);
            if (referrer) {
                referrer.referrals.push(newUser.id);
            }
        }

        this.data.users.push(newUser);
        this.data.currentUser = newUser.id;
        this._saveData();
        return { success: true, user: newUser };
    }

    logout() {
        this.data.currentUser = null;
        this._saveData();
    }

    getCurrentUser() {
        if (!this.data.currentUser) return null;
        return this.data.users.find(u => u.id === this.data.currentUser);
    }
    
    // Updates the current user in DB
    updateUser(userId, updates) {
        const index = this.data.users.findIndex(u => u.id === userId);
        if (index > -1) {
            this.data.users[index] = { ...this.data.users[index], ...updates };
            this._saveData();
            return this.data.users[index];
        }
        return null;
    }

    // --- Admin Methods ---
    getAllUsers() { return this.data.users.filter(u => u.role === 'user'); }
    getAllWithdrawals() { return this.data.withdrawals; }
    getSettings() { return this.data.settings; }
    
    updateSettings(newSettings) {
        this.data.settings = { ...this.data.settings, ...newSettings };
        this._saveData();
    }
}

export const store = new StoreService();
