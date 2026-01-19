/* ==========================================
   Authentication Module
   Sistem Kehadiran Tahfiz
   ========================================== */

const AuthManager = {
    async login(email, password, rememberMe = false) {
        const loginForm = document.getElementById('loginForm');
        const errorMessage = document.getElementById('errorMessage');
        const submitBtn = loginForm.querySelector('button[type="submit"]');

        try {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span>Mengelog masuk...</span>';
            this.hideError();

            const url = `${CONFIG.APPS_SCRIPT_URL}?action=${CONFIG.API_ENDPOINTS.LOGIN}&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`;

            const response = await fetch(url, {
                method: 'GET',
                redirect: 'follow'
            });

            const data = await response.json();

            if (data.success) {
                const userData = {
                    id: data.user.id,
                    name: data.user.name,
                    email: data.user.email,
                    role: data.user.role,
                    status: data.user.status
                };

                sessionStorage.setItem(CONFIG.STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
                sessionStorage.setItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN, data.token || 'authenticated');

                if (rememberMe) {
                    localStorage.setItem(CONFIG.STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
                    localStorage.setItem(CONFIG.STORAGE_KEYS.REMEMBER_ME, 'true');
                }

                this.redirectToDashboard(userData.role);
            } else {
                this.showError(data.message || 'Email atau kata laluan tidak sah');
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<span>Log Masuk</span>';
            }

        } catch (error) {
            console.error('Login error:', error);
            this.showError('Ralat sambungan. Sila cuba lagi.');
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span>Log Masuk</span>';
        }
    },

    logout() {
        sessionStorage.removeItem(CONFIG.STORAGE_KEYS.USER_DATA);
        sessionStorage.removeItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);

        if (!localStorage.getItem(CONFIG.STORAGE_KEYS.REMEMBER_ME)) {
            localStorage.removeItem(CONFIG.STORAGE_KEYS.USER_DATA);
        }

        window.location.href = 'index.html';
    },

    isAuthenticated() {
        const sessionUser = sessionStorage.getItem(CONFIG.STORAGE_KEYS.USER_DATA);
        const localUser = localStorage.getItem(CONFIG.STORAGE_KEYS.USER_DATA);
        return !!(sessionUser || localUser);
    },

    getCurrentUser() {
        const sessionUser = sessionStorage.getItem(CONFIG.STORAGE_KEYS.USER_DATA);
        const localUser = localStorage.getItem(CONFIG.STORAGE_KEYS.USER_DATA);
        const userData = sessionUser || localUser;
        return userData ? JSON.parse(userData) : null;
    },

    redirectToDashboard(role) {
        if (role === 'admin' || role === CONFIG.USER_ROLES.ADMIN) {
            window.location.href = 'admin-dashboard.html';
        } else {
            window.location.href = 'user-dashboard.html';
        }
    },

    showError(message) {
        const errorMessage = document.getElementById('errorMessage');
        if (errorMessage) {
            errorMessage.querySelector('p').textContent = message;
            errorMessage.style.display = 'block';
        }
    },

    hideError() {
        const errorMessage = document.getElementById('errorMessage');
        if (errorMessage) {
            errorMessage.style.display = 'none';
        }
    },

    protectPage(requiredRole = null) {
        if (!this.isAuthenticated()) {
            window.location.href = '../index.html';
            return false;
        }

        if (requiredRole) {
            const user = this.getCurrentUser();
            if (user.role !== requiredRole) {
                this.redirectToDashboard(user.role);
                return false;
            }
        }

        return true;
    }
};

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        if (AuthManager.isAuthenticated()) {
            const user = AuthManager.getCurrentUser();
            AuthManager.redirectToDashboard(user.role);
            return;
        }

        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const rememberMe = document.getElementById('remember').checked;
            await AuthManager.login(email, password, rememberMe);
        });

        const forgotPasswordLink = document.getElementById('forgotPassword');
        if (forgotPasswordLink) {
            forgotPasswordLink.addEventListener('click', function(e) {
                e.preventDefault();
                alert('Sila hubungi admin untuk reset kata laluan:\nadmin@tahfiz.com');
            });
        }
    }
});
