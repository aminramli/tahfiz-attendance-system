/* ==========================================
   Main Application Logic - User Dashboard
   Sistem Kehadiran Tahfiz
   ========================================== */

const AppState = {
    user: null,
    currentAttendance: null,
    isLoading: false,
    hasCheckedInToday: false,
    hasCheckedOutToday: false
};

const DOM = {};

document.addEventListener('DOMContentLoaded', async function() {
    if (!document.body.classList.contains('user-page')) {
        return;
    }

    if (!AuthManager.protectPage()) {
        return;
    }

    initializeDOMReferences();
    AppState.user = AuthManager.getCurrentUser();
    displayUserInfo();
    initializeGeolocation();

    if (typeof google !== 'undefined') {
        MapManager.init('map');
    }

    await loadTodayAttendance();
    await loadUserStatistics();
    setupEventListeners();
});

function initializeDOMReferences() {
    DOM.userName = document.getElementById('userName');
    DOM.userEmail = document.getElementById('userEmail');
    DOM.userInitials = document.getElementById('userInitials');
    DOM.locationStatus = document.getElementById('locationStatus');
    DOM.checkInBtn = document.getElementById('checkInBtn');
    DOM.checkOutBtn = document.getElementById('checkOutBtn');
    DOM.checkInTime = document.getElementById('checkInTime');
    DOM.checkOutTime = document.getElementById('checkOutTime');
    DOM.checkInStatus = document.getElementById('checkInStatus');
    DOM.checkOutStatus = document.getElementById('checkOutStatus');
    DOM.infoMessage = document.getElementById('infoMessage');
    DOM.refreshLocation = document.getElementById('refreshLocation');
    DOM.profileBtn = document.getElementById('profileBtn');
    DOM.profileNav = document.getElementById('profileNav');
    DOM.profileModal = document.getElementById('profileModal');
    DOM.closeModal = document.getElementById('closeModal');
    DOM.logoutBtn = document.getElementById('logoutBtn');
    DOM.modalUserName = document.getElementById('modalUserName');
    DOM.modalUserEmail = document.getElementById('modalUserEmail');
    DOM.modalUserRole = document.getElementById('modalUserRole');
}

function displayUserInfo() {
    if (!AppState.user) return;
    if (DOM.userName) DOM.userName.textContent = AppState.user.name;
    if (DOM.userEmail) DOM.userEmail.textContent = AppState.user.email;
    if (DOM.userInitials) {
        const initials = AppState.user.name
            .split(' ')
            .map(word => word[0])
            .join('')
            .substring(0, 2)
            .toUpperCase();
        DOM.userInitials.textContent = initials;
    }
    if (DOM.modalUserName) DOM.modalUserName.textContent = AppState.user.name;
    if (DOM.modalUserEmail) DOM.modalUserEmail.textContent = AppState.user.email;
    if (DOM.modalUserRole) DOM.modalUserRole.textContent = AppState.user.role === 'admin' ? 'Admin' : 'Guru';
}

function initializeGeolocation() {
    GeoLocation.init(onLocationUpdate, onLocationError);
}

function onLocationUpdate(data) {
    updateLocationStatus(data);
    updateCheckInOutButtons(data);
    if (MapManager.map && data.location) {
        MapManager.updateUserMarker(data.location);
    }
}

function onLocationError(error) {
    updateLocationStatusError(error.message);
    disableCheckInOutButtons();
}

function updateLocationStatus(data) {
    if (!DOM.locationStatus) return;
    const statusIcon = data.isWithinRadius ? 'success' : 'warning';
    const statusText = data.isWithinRadius
        ? 'Anda berada di kawasan yang dibenarkan'
        : 'Anda berada di luar kawasan';
    const distance = GeoLocation.formatDistance(data.distance);

    DOM.locationStatus.innerHTML = `
        <div class="status-icon ${statusIcon}">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                ${data.isWithinRadius
                    ? '<path d="M9 11l3 3L22 4"/>'
                    : '<path d="M12 8v4m0 4h.01"/>'
                }
            </svg>
        </div>
        <p class="status-text">${statusText}</p>
        <p class="status-distance">Jarak: ${distance}</p>
    `;
}

function updateLocationStatusError(message) {
    if (!DOM.locationStatus) return;
    DOM.locationStatus.innerHTML = `
        <div class="status-icon danger">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
        </div>
        <p class="status-text">${message}</p>
        <p class="status-distance">--</p>
    `;
}

function updateCheckInOutButtons(data) {
    if (!DOM.checkInBtn || !DOM.checkOutBtn) return;
    const canCheckIn = data.isWithinRadius && !AppState.hasCheckedInToday;
    const canCheckOut = data.isWithinRadius && AppState.hasCheckedInToday && !AppState.hasCheckedOutToday;

    DOM.checkInBtn.disabled = !canCheckIn;
    DOM.checkOutBtn.disabled = !canCheckOut;

    if (DOM.infoMessage) {
        let message = '';
        if (!data.isWithinRadius) {
            message = `Anda perlu berada dalam radius ${CONFIG.ALLOWED_RADIUS}m dari ${CONFIG.PUSAT_LOCATION.name} untuk check in/out.`;
        } else if (AppState.hasCheckedInToday && AppState.hasCheckedOutToday) {
            message = 'Anda telah selesai check in dan check out hari ini.';
        } else if (AppState.hasCheckedInToday) {
            message = 'Anda sudah check in. Klik Check Out apabila selesai.';
        } else {
            message = 'Anda boleh check in sekarang.';
        }
        DOM.infoMessage.innerHTML = `<p>${message}</p>`;
    }
}

function disableCheckInOutButtons() {
    if (DOM.checkInBtn) DOM.checkInBtn.disabled = true;
    if (DOM.checkOutBtn) DOM.checkOutBtn.disabled = true;
}

async function loadTodayAttendance() {
    try {
        const today = GoogleSheetsAPI.formatDate(new Date());
        const result = await GoogleSheetsAPI.getAttendance(
            AppState.user.id,
            new Date().getMonth() + 1,
            new Date().getFullYear()
        );

        if (result.success && result.data) {
            const todayRecord = result.data.find(record => record.date === today);
            if (todayRecord) {
                AppState.currentAttendance = todayRecord;
                AppState.hasCheckedInToday = !!todayRecord.checkInTime;
                AppState.hasCheckedOutToday = !!todayRecord.checkOutTime;
                displayTodayAttendance(todayRecord);
            }
        }
    } catch (error) {
        console.error('Error loading attendance:', error);
    }
}

function displayTodayAttendance(record) {
    if (DOM.checkInTime && record.checkInTime) {
        DOM.checkInTime.textContent = record.checkInTime;
    }
    if (DOM.checkOutTime && record.checkOutTime) {
        DOM.checkOutTime.textContent = record.checkOutTime;
    }
    if (DOM.checkInStatus && record.status) {
        DOM.checkInStatus.textContent = record.status;
        DOM.checkInStatus.className = `status-badge ${getStatusClass(record.status)}`;
    }
}

async function handleCheckIn() {
    const validation = GeoLocation.canCheckIn();
    if (!validation.allowed) {
        alert(validation.message);
        return;
    }

    if (confirm('Anda pasti mahu check in sekarang?')) {
        try {
            DOM.checkInBtn.disabled = true;
            DOM.checkInBtn.innerHTML = '<span>Memproses...</span>';

            const locationData = GeoLocation.getLocationData();
            const result = await GoogleSheetsAPI.checkIn(AppState.user.id, locationData);

            if (result.success) {
                AppState.hasCheckedInToday = true;
                AppState.hasCheckedOutToday = false;
                await loadTodayAttendance();

                // Re-enable buttons and update UI
                DOM.checkInBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg><span>Check In</span>';

                // Force update buttons state
                const currentLocation = GeoLocation.getLocationData();
                updateCheckInOutButtons(currentLocation);

                alert('✓ Check in berjaya! Anda kini boleh check out.');
            } else {
                alert(result.message || 'Ralat check in. Sila cuba lagi.');
                DOM.checkInBtn.disabled = false;
                DOM.checkInBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg><span>Check In</span>';
            }
        } catch (error) {
            console.error('Check in error:', error);
            alert('Ralat check in. Sila cuba lagi.');
            DOM.checkInBtn.disabled = false;
            DOM.checkInBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg><span>Check In</span>';
        }
    }
}

async function handleCheckOut() {
    const validation = GeoLocation.canCheckIn();
    if (!validation.allowed) {
        alert(validation.message);
        return;
    }

    if (confirm('Anda pasti mahu check out sekarang?')) {
        try {
            DOM.checkOutBtn.disabled = true;
            DOM.checkOutBtn.innerHTML = '<span>Memproses...</span>';

            const locationData = GeoLocation.getLocationData();
            const result = await GoogleSheetsAPI.checkOut(AppState.user.id, locationData);

            if (result.success) {
                AppState.hasCheckedOutToday = true;
                await loadTodayAttendance();

                // Re-enable buttons and update UI
                DOM.checkOutBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M18 6L6 18M6 6l12 12"/></svg><span>Check Out</span>';

                // Force update buttons state
                const currentLocation = GeoLocation.getLocationData();
                updateCheckInOutButtons(currentLocation);

                alert('✓ Check out berjaya! Terima kasih.');
            } else {
                alert(result.message || 'Ralat check out. Sila cuba lagi.');
                DOM.checkOutBtn.disabled = false;
                DOM.checkOutBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M18 6L6 18M6 6l12 12"/></svg><span>Check Out</span>';
            }
        } catch (error) {
            console.error('Check out error:', error);
            alert('Ralat check out. Sila cuba lagi.');
            DOM.checkOutBtn.disabled = false;
            DOM.checkOutBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M18 6L6 18M6 6l12 12"/></svg><span>Check Out</span>';
        }
    }
}

async function loadUserStatistics() {
    try {
        const period = GoogleSheetsAPI.getCurrentPeriod();
        const result = await GoogleSheetsAPI.getUserStats(
            AppState.user.id,
            period.month,
            period.year
        );

        if (result.success && result.stats) {
            displayStatistics(result.stats);
        }
    } catch (error) {
        console.error('Error loading statistics:', error);
    }
}

function displayStatistics(stats) {
    const statPresent = document.getElementById('statPresent');
    const statAbsent = document.getElementById('statAbsent');
    const statLate = document.getElementById('statLate');
    const statPercentage = document.getElementById('statPercentage');

    if (statPresent) statPresent.textContent = stats.present || '0';
    if (statAbsent) statAbsent.textContent = stats.absent || '0';
    if (statLate) statLate.textContent = stats.late || '0';
    if (statPercentage) statPercentage.textContent = `${stats.percentage || '0'}%`;
}

function setupEventListeners() {
    if (DOM.checkInBtn) {
        DOM.checkInBtn.addEventListener('click', handleCheckIn);
    }
    if (DOM.checkOutBtn) {
        DOM.checkOutBtn.addEventListener('click', handleCheckOut);
    }
    if (DOM.refreshLocation) {
        DOM.refreshLocation.addEventListener('click', () => {
            GeoLocation.getCurrentLocation(onLocationUpdate, onLocationError);
        });
    }
    if (DOM.profileBtn) {
        DOM.profileBtn.addEventListener('click', () => openProfileModal());
    }
    if (DOM.profileNav) {
        DOM.profileNav.addEventListener('click', (e) => {
            e.preventDefault();
            openProfileModal();
        });
    }
    if (DOM.closeModal) {
        DOM.closeModal.addEventListener('click', closeProfileModal);
    }
    if (DOM.logoutBtn) {
        DOM.logoutBtn.addEventListener('click', () => {
            if (confirm('Anda pasti mahu log keluar?')) {
                AuthManager.logout();
            }
        });
    }
    if (DOM.profileModal) {
        DOM.profileModal.addEventListener('click', (e) => {
            if (e.target === DOM.profileModal) {
                closeProfileModal();
            }
        });
    }
}

function openProfileModal() {
    if (DOM.profileModal) {
        DOM.profileModal.classList.add('active');
    }
}

function closeProfileModal() {
    if (DOM.profileModal) {
        DOM.profileModal.classList.remove('active');
    }
}

function getStatusClass(status) {
    switch (status) {
        case CONFIG.ATTENDANCE_STATUS.PRESENT:
            return 'success';
        case CONFIG.ATTENDANCE_STATUS.LATE:
            return 'warning';
        case CONFIG.ATTENDANCE_STATUS.ABSENT:
            return 'danger';
        default:
            return '';
    }
}
