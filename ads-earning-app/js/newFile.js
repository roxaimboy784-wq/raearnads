const { store, bindAdsEvents, bindWalletEvents } = require("./user-bundle");

// Interactions
document.addEventListener('route-rendered', (e) => {
    const { path, user } = e.detail;

    let loginData = null;
    let expectedLoginOtp = null;

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.onsubmit = (ev) => {
            ev.preventDefault();
            const id = document.getElementById('login-id').value;
            const pass = document.getElementById('login-pass').value;

            // Generate OTP and proceed to step 2.
            loginData = { id, pass };
            expectedLoginOtp = Math.floor(1000 + Math.random() * 9000).toString();

            window.showToast(`[Mock SMS] Your EarnAds Login OTP is: ${expectedLoginOtp}`, 'warning');

            document.getElementById('login-step-1').style.display = 'none';
            document.getElementById('login-step-2').style.display = 'block';
        };

        const verifyLoginBtn = document.getElementById('verify-login-btn');
        if (verifyLoginBtn) {
            verifyLoginBtn.onclick = () => {
                const entered = document.getElementById('login-otp').value;
                if (entered === expectedLoginOtp) {
                    const res = store.login(loginData.id, loginData.pass);
                    if (res.success) {
                        window.showToast(`Welcome, ${res.user.name}!`, 'success');
                        window.location.hash = '/dashboard';
                    } else {
                        window.showToast(res.error, 'error');
                        document.getElementById('login-step-1').style.display = 'block';
                        document.getElementById('login-step-2').style.display = 'none';
                    }
                } else {
                    window.showToast('Invalid OTP entered.', 'error');
                }
            };
        }

        // Bind dependencies based on route
        if (path === '/ads') bindAdsEvents(user);
        if (path === '/wallet') bindWalletEvents(user);
    };
});
