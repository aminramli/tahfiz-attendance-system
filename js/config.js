/* ==========================================
   Configuration File
   Sistem Kehadiran Tahfiz
   ========================================== */

const CONFIG = {
    // Google Apps Script Web App URL
    APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbyL_8yKCAEFqt_c_G53ImL3eq6lhU9zy23vGUfa7Iw6XIscKRvIF0gw3bVC7X0f-3M/exec',

    // Google Sheets ID
    SPREADSHEET_ID: '1VkJxBkwrPIZXjUmzvtSwRq7XPYRbU2cTYquB-gJl6qw',

    // Google Maps API Key
    GOOGLE_MAPS_API_KEY: 'AIzaSyBGuEW3mKh9SpuQBpt2mbSofmjokjYED90',

    // Lokasi Pusat Islam (Latitude, Longitude)
    PUSAT_LOCATION: {
        lat: 3.1979163349111825,
        lng: 102.47799269609713,
        name: 'Pusat Islam Al-Hidayah'
    },

    // Radius yang dibenarkan untuk check-in (dalam meter)
    ALLOWED_RADIUS: 100,

    // Waktu kehadiran
    ATTENDANCE_TIME: {
        checkInTime: '08:00',      // Waktu masuk rasmi
        lateThreshold: 15,          // Had lewat dalam minit
        checkOutTime: '17:00'       // Waktu keluar
    },

    // Session storage keys
    STORAGE_KEYS: {
        USER_DATA: 'tahfiz_user_data',
        AUTH_TOKEN: 'tahfiz_auth_token',
        REMEMBER_ME: 'tahfiz_remember_me'
    },

    // Status kehadiran
    ATTENDANCE_STATUS: {
        PRESENT: 'Hadir',
        LATE: 'Lewat',
        ABSENT: 'Tidak Hadir',
        ON_LEAVE: 'Cuti'
    },

    // User roles
    USER_ROLES: {
        ADMIN: 'admin',
        GURU: 'guru'
    },

    // API Endpoints (untuk Google Apps Script)
    API_ENDPOINTS: {
        LOGIN: 'login',
        LOGOUT: 'logout',
        GET_USER: 'getUser',
        CHECK_IN: 'checkIn',
        CHECK_OUT: 'checkOut',
        GET_ATTENDANCE: 'getAttendance',
        GET_USER_STATS: 'getUserStats',
        GET_ALL_USERS: 'getAllUsers',
        ADD_USER: 'addUser',
        UPDATE_USER: 'updateUser',
        DELETE_USER: 'deleteUser',
        GET_TODAY_ATTENDANCE: 'getTodayAttendance',
        EXPORT_REPORT: 'exportReport',
        UPDATE_SETTINGS: 'updateSettings',
        GET_SETTINGS: 'getSettings'
    }
};

// Export untuk digunakan di fail lain
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
