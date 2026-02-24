export const AdminLayout = (content, activeTab = 'dashboard', user = null) => {
    return `
        <div class="admin-layout flex">
            <!-- Sidebar Navigation -->
            <aside class="admin-sidebar glass-dark">
                <div class="p-6">
                    <h2 class="text-accent font-bold tracking-wider">EarnAds<span class="text-white text-sm ml-2 px-2 py-1 bg-red-500 rounded font-mono">ADMIN</span></h2>
                </div>
                
                <nav class="admin-nav mt-6 flex flex-col gap-2 px-4">
                    <a href="#/admin/dashboard" class="admin-nav-item ${activeTab === 'dashboard' ? 'active' : ''}">
                        <ion-icon name="grid-outline"></ion-icon> Overview
                    </a>
                    <a href="#/admin/users" class="admin-nav-item ${activeTab === 'users' ? 'active' : ''}">
                        <ion-icon name="people-outline"></ion-icon> Manage Users
                    </a>
                    <a href="#/admin/withdrawals" class="admin-nav-item ${activeTab === 'withdrawals' ? 'active' : ''}">
                        <ion-icon name="cash-outline"></ion-icon> Withdrawals
                    </a>
                    <a href="#/admin/settings" class="admin-nav-item ${activeTab === 'settings' ? 'active' : ''}">
                        <ion-icon name="settings-outline"></ion-icon> App Settings
                    </a>
                </nav>

                <div class="absolute bottom-0 w-full p-4 border-t border-gray-700">
                    <button class="btn btn-secondary w-full text-left flex items-center justify-start gap-3" onclick="require('./store.js').store.logout(); window.location.hash='#/'">
                        <ion-icon name="log-out-outline"></ion-icon> Logout
                    </button>
                </div>
            </aside>

            <!-- Main Content Area -->
            <main class="admin-main flex-1 bg-slate-900 overflow-y-auto">
                <!-- Top Header -->
                <header class="admin-header glass-dark flex justify-between items-center p-4 sticky top-0 z-50">
                    <h3 class="font-bold text-lg text-white capitalize">${activeTab}</h3>
                    <div class="flex items-center gap-4">
                        <div class="text-right">
                            <p class="text-sm font-bold text-white">${user?.name || 'Admin'}</p>
                            <p class="text-xs text-success">Online</p>
                        </div>
                        <div class="h-10 w-10 bg-accent rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg border-2 border-slate-700">
                            A
                        </div>
                    </div>
                </header>
                
                <div class="p-8">
                    ${content}
                </div>
            </main>
        </div>
    `;
};
