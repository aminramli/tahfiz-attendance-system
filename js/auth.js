/* ==========================================
   Authentication Module
   Sistem Kehadiran Tahfiz
   ========================================== */

const AuthManager = {
    async login(userIdOrEmail, password, rememberMe = false) {
        const loginForm = document.getElementById('loginForm');
        const errorMessage = document.getElementById('errorMessage');
        const submitBtn = loginForm.querySelector('button[type="submit"]');

        try {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span>Mengelog masuk...</span>';
            this.hideError();

            // Support both userId (6 digit) and email login
            const isUserId = /^\d{6}$/.test(userIdOrEmail);
            const loginParam = isUserId ? `userId=${encodeURIComponent(userIdOrEmail)}` : `email=${encodeURIComponent(userIdOrEmail)}`;

            const url = `${CONFIG.APPS_SCRIPT_URL}?action=${CONFIG.API_ENDPOINTS.LOGIN}&${loginParam}&password=${encodeURIComponent(password)}`;

            console.log('Login attempt with:', isUserId ? 'userId' : 'email', userIdOrEmail);

            const response = await fetch(url, {
                method: 'GET',
                redirect: 'follow'
            });

            const data = await response.json();
            console.log('Login response:', data);

            if (data.success) {
                const userData = {
                    id: data.data.id || data.user.id,
                    userId: data.data.userId || data.user.userId || userIdOrEmail,
                    name: data.data.name || data.user.name,
                    email: data.data.email || data.user.email || '',
                    role: data.data.role || data.user.role,
                    status: data.data.status || data.user.status
                };

                sessionStorage.setItem(CONFIG.STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
                sessionStorage.setItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN, data.token || 'authenticated');

                if (rememberMe) {
                    localStorage.setItem(CONFIG.STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
                    localStorage.setItem(CONFIG.STORAGE_KEYS.REMEMBER_ME, 'true');
                }

                this.redirectToDashboard(userData.role);
            } else {
                this.showError(data.message || 'ID Pengguna atau kata laluan tidak sah');
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
        try {
            console.log('Logging out...');

            // Clear all session storage
            sessionStorage.clear();

            // Clear all local storage
            localStorage.clear();

            console.log('Storage cleared, redirecting...');

            // Force redirect to login page using replace to prevent back button
            window.location.replace('index.html');
        } catch (error) {
            console.error('Logout error:', error);
            // Force redirect anyway
            alert('Logout error, tetapi akan redirect ke login page');
            window.location.replace('index.html');
        }
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
            window.location.href = 'index.html';
            return false;
        }

        if (requiredRole) {
            const user = this.getCurrentUser();
            if (user && user.role !== requiredRole) {
                this.redirectToDashboard(user.role);
                return false;
            }
        }

        return true;
    },

    updateUserData(userData) {
        // Update session storage
        sessionStorage.setItem(CONFIG.STORAGE_KEYS.USER_DATA, JSON.stringify(userData));

        // Update local storage jika remember me aktif
        const rememberMe = localStorage.getItem(CONFIG.STORAGE_KEYS.REMEMBER_ME);
        if (rememberMe === 'true') {
            localStorage.setItem(CONFIG.STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
        }

        console.log('User data updated in storage');
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

            // Support both old email field and new userId field
            const userIdField = document.getElementById('userId');
            const emailField = document.getElementById('email');
            const userId = userIdField ? userIdField.value.trim() : (emailField ? emailField.value.trim() : '');
            const password = document.getElementById('password').value;
            const rememberMe = document.getElementById('remember').checked;

            // Validate 6 digit ID if using new system
            if (userIdField && userId) {
                if (!/^\d{6}$/.test(userId)) {
                    AuthManager.showError('ID Pengguna mesti 6 digit nombor sahaja');
                    return;
                }
            }

            await AuthManager.login(userId, password, rememberMe);
        });

        const forgotPasswordLink = document.getElementById('forgotPassword');
        if (forgotPasswordLink) {
            forgotPasswordLink.addEventListener('click', function(e) {
                e.preventDefault();
                alert('Sila hubungi admin untuk reset kata laluan:\nID Admin: 999999');
            });
        }

        // Auto-format userId input to numbers only
        const userIdInput = document.getElementById('userId');
        if (userIdInput) {
            userIdInput.addEventListener('input', function(e) {
                // Remove non-numeric characters
                this.value = this.value.replace(/\D/g, '');
                // Limit to 6 digits
                if (this.value.length > 6) {
                    this.value = this.value.slice(0, 6);
                }
            });
        }
    }
});
