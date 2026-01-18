/* ==========================================
   Google Sheets API Integration
   Sistem Kehadiran Tahfiz
   ========================================== */

const GoogleSheetsAPI = {
    baseURL: CONFIG.APPS_SCRIPT_URL,

    async makeRequest(action, data = {}) {
        try {
            let url = `${this.baseURL}?action=${action}`;
            for (let key in data) {
                if (data.hasOwnProperty(key)) {
                    url += `&${key}=${encodeURIComponent(data[key])}`;
                }
            }

            const response = await fetch(url, {
                method: 'GET',
                redirect: 'follow'
            });

            const result = await response.json();
            return result;

        } catch (error) {
            console.error(`API Error (${action}):`, error);
            return {
                success: false,
                message: 'Ralat sambungan ke server'
            };
        }
    },

    async getAllUsers() {
        return await this.makeRequest(CONFIG.API_ENDPOINTS.GET_ALL_USERS);
    },

    async getUser(userId) {
        return await this.makeRequest(CONFIG.API_ENDPOINTS.GET_USER, { userId });
    },

    async addUser(userData) {
        return await this.makeRequest(CONFIG.API_ENDPOINTS.ADD_USER, userData);
    },

    async updateUser(userId, userData) {
        return await this.makeRequest(CONFIG.API_ENDPOINTS.UPDATE_USER, {
            userId,
            ...userData
        });
    },

    async deleteUser(userId) {
        return await this.makeRequest(CONFIG.API_ENDPOINTS.DELETE_USER, { userId });
    },

    async checkIn(userId, location) {
        const now = new Date();
        return await this.makeRequest(CONFIG.API_ENDPOINTS.CHECK_IN, {
            userId: userId,
            timestamp: now.toISOString(),
            date: this.formatDate(now),
            time: this.formatTime(now),
            latitude: location.lat,
            longitude: location.lng,
            distance: location.distance || 0
        });
    },

    async checkOut(userId, location) {
        const now = new Date();
        return await this.makeRequest(CONFIG.API_ENDPOINTS.CHECK_OUT, {
            userId: userId,
            timestamp: now.toISOString(),
            date: this.formatDate(now),
            time: this.formatTime(now),
            latitude: location.lat,
            longitude: location.lng,
            distance: location.distance || 0
        });
    },

    async getAttendance(userId, role = 'guru', startDate = null, endDate = null) {
        const params = { userId, role };
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        return await this.makeRequest(CONFIG.API_ENDPOINTS.GET_ATTENDANCE, params);
    },

    async getUserStats(userId, month = null, year = null) {
        const params = { userId };
        if (month) params.month = month;
        if (year) params.year = year;
        return await this.makeRequest(CONFIG.API_ENDPOINTS.GET_USER_STATS, params);
    },

    async getTodayAttendance() {
        return await this.makeRequest(CONFIG.API_ENDPOINTS.GET_TODAY_ATTENDANCE);
    },

    async getSettings() {
        return await this.makeRequest(CONFIG.API_ENDPOINTS.GET_SETTINGS);
    },

    async updateSettings(settings) {
        return await this.makeRequest(CONFIG.API_ENDPOINTS.UPDATE_SETTINGS, settings);
    },

    async exportReport(month, year, format = 'excel') {
        return await this.makeRequest(CONFIG.API_ENDPOINTS.EXPORT_REPORT, {
            month,
            year,
            format
        });
    },

    formatDate(date) {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    formatTime(date) {
        const d = new Date(date);
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const seconds = String(d.getSeconds()).padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    },

    formatDateTime(date) {
        const d = new Date(date);
        const dateStr = this.formatDate(d);
        const timeStr = this.formatTime(d);
        return `${dateStr} ${timeStr}`;
    },

    calculateStatus(checkInTime, officialTime = '08:00', lateThreshold = 15) {
        if (!checkInTime) return CONFIG.ATTENDANCE_STATUS.ABSENT;
        const checkIn = new Date(`2000-01-01 ${checkInTime}`);
        const official = new Date(`2000-01-01 ${officialTime}`);
        const diffMinutes = (checkIn - official) / (1000 * 60);
        if (diffMinutes > lateThreshold) {
            return CONFIG.ATTENDANCE_STATUS.LATE;
        } else {
            return CONFIG.ATTENDANCE_STATUS.PRESENT;
        }
    },

    getCurrentPeriod() {
        const now = new Date();
        return {
            month: String(now.getMonth() + 1).padStart(2, '0'),
            year: now.getFullYear()
        };
    }
};

// Alias for easier access
const SheetsAPI = GoogleSheetsAPI;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = GoogleSheetsAPI;
}
