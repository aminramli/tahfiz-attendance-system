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

    // Edit Profile Elements
    DOM.editProfileBtn = document.getElementById('editProfileBtn');
    DOM.cancelEditBtn = document.getElementById('cancelEditBtn');
    DOM.profileViewMode = document.getElementById('profileViewMode');
    DOM.profileEditMode = document.getElementById('profileEditMode');
    DOM.editProfileForm = document.getElementById('editProfileForm');
    DOM.editName = document.getElementById('editName');
    DOM.editEmail = document.getElementById('editEmail');
    DOM.editPassword = document.getElementById('editPassword');
    DOM.editPasswordConfirm = document.getElementById('editPasswordConfirm');

    // Note/Catatan Elements
    DOM.submitNoteBtn = document.getElementById('submitNoteBtn');
    DOM.noteModal = document.getElementById('noteModal');
    DOM.closeNoteModal = document.getElementById('closeNoteModal');
    DOM.cancelNoteBtn = document.getElementById('cancelNoteBtn');
    DOM.noteForm = document.getElementById('noteForm');
    DOM.noteType = document.getElementById('noteType');
    DOM.noteDate = document.getElementById('noteDate');
    DOM.noteReason = document.getElementById('noteReason');
    DOM.noteConfirm = document.getElementById('noteConfirm');
    DOM.charCount = document.getElementById('charCount');
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

        console.log('Load attendance result:', result);

        if (result.success && result.data) {
            const todayRecord = result.data.find(record => record.date === today);
            console.log('Today record:', todayRecord);

            if (todayRecord) {
                AppState.currentAttendance = todayRecord;
                AppState.hasCheckedInToday = !!(todayRecord.checkInTime || todayRecord.checkIn);
                AppState.hasCheckedOutToday = !!(todayRecord.checkOutTime || todayRecord.checkOut);
                displayTodayAttendance(todayRecord);
            } else {
                // Reset display jika tiada rekod hari ini
                if (DOM.checkInTime) DOM.checkInTime.textContent = '-- : --';
                if (DOM.checkOutTime) DOM.checkOutTime.textContent = '-- : --';
                if (DOM.checkInStatus) {
                    DOM.checkInStatus.textContent = '';
                    DOM.checkInStatus.className = 'status-badge';
                }
            }
        }
    } catch (error) {
        console.error('Error loading attendance:', error);
    }
}

function displayTodayAttendance(record) {
    console.log('Displaying attendance:', record);

    // Support both checkInTime and checkIn naming
    const checkInTime = record.checkInTime || record.checkIn;
    const checkOutTime = record.checkOutTime || record.checkOut;

    if (DOM.checkInTime) {
        if (checkInTime) {
            DOM.checkInTime.textContent = checkInTime;
        } else {
            DOM.checkInTime.textContent = '-- : --';
        }
    }

    if (DOM.checkOutTime) {
        if (checkOutTime) {
            DOM.checkOutTime.textContent = checkOutTime;
        } else {
            DOM.checkOutTime.textContent = '-- : --';
        }
    }

    if (DOM.checkInStatus && record.status) {
        DOM.checkInStatus.textContent = record.status;
        DOM.checkInStatus.className = `status-badge ${getStatusClass(record.status)}`;
    } else if (DOM.checkInStatus) {
        DOM.checkInStatus.textContent = '';
        DOM.checkInStatus.className = 'status-badge';
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
            console.log('Check-in with location:', locationData);

            const result = await GoogleSheetsAPI.checkIn(AppState.user.id, locationData);
            console.log('Check-in result:', result);

            if (result.success) {
                AppState.hasCheckedInToday = true;
                AppState.hasCheckedOutToday = false;

                // Update display immediately with returned data
                if (result.data && result.data.checkInTime) {
                    if (DOM.checkInTime) {
                        DOM.checkInTime.textContent = result.data.checkInTime;
                    }
                    if (DOM.checkInStatus && result.data.status) {
                        DOM.checkInStatus.textContent = result.data.status;
                        DOM.checkInStatus.className = `status-badge ${getStatusClass(result.data.status)}`;
                    }
                }

                // Load fresh data from server
                await loadTodayAttendance();

                // Re-enable buttons and update UI
                DOM.checkInBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg><span>Check In</span>';

                // Force update buttons state
                const currentLocation = GeoLocation.getLocationData();
                updateCheckInOutButtons(currentLocation);

                alert('✓ Check in berjaya! Masa: ' + (result.data?.checkInTime || 'N/A'));
            } else {
                alert(result.message || 'Ralat check in. Sila cuba lagi.');
                DOM.checkInBtn.disabled = false;
                DOM.checkInBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg><span>Check In</span>';
            }
        } catch (error) {
            console.error('Check in error:', error);
            alert('Ralat check in. Sila cuba lagi. Error: ' + error.message);
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
            console.log('Check-out with location:', locationData);

            const result = await GoogleSheetsAPI.checkOut(AppState.user.id, locationData);
            console.log('Check-out result:', result);

            if (result.success) {
                AppState.hasCheckedOutToday = true;

                // Update display immediately with returned data
                if (result.data && result.data.checkOutTime) {
                    if (DOM.checkOutTime) {
                        DOM.checkOutTime.textContent = result.data.checkOutTime;
                    }
                }

                // Load fresh data from server
                await loadTodayAttendance();

                // Re-enable buttons and update UI
                DOM.checkOutBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M18 6L6 18M6 6l12 12"/></svg><span>Check Out</span>';

                // Force update buttons state
                const currentLocation = GeoLocation.getLocationData();
                updateCheckInOutButtons(currentLocation);

                alert('✓ Check out berjaya! Masa: ' + (result.data?.checkOutTime || 'N/A') + '\nDurasi: ' + (result.data?.duration || 'N/A'));
            } else {
                alert(result.message || 'Ralat check out. Sila cuba lagi.');
                DOM.checkOutBtn.disabled = false;
                DOM.checkOutBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M18 6L6 18M6 6l12 12"/></svg><span>Check Out</span>';
            }
        } catch (error) {
            console.error('Check out error:', error);
            alert('Ralat check out. Sila cuba lagi. Error: ' + error.message);
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

    // Edit Profile Event Listeners
    if (DOM.editProfileBtn) {
        DOM.editProfileBtn.addEventListener('click', showEditProfileMode);
    }
    if (DOM.cancelEditBtn) {
        DOM.cancelEditBtn.addEventListener('click', showViewProfileMode);
    }
    if (DOM.editProfileForm) {
        DOM.editProfileForm.addEventListener('submit', handleEditProfile);
    }

    // Note/Catatan Event Listeners
    if (DOM.submitNoteBtn) {
        DOM.submitNoteBtn.addEventListener('click', openNoteModal);
    }
    if (DOM.closeNoteModal) {
        DOM.closeNoteModal.addEventListener('click', closeNoteModal);
    }
    if (DOM.cancelNoteBtn) {
        DOM.cancelNoteBtn.addEventListener('click', closeNoteModal);
    }
    if (DOM.noteForm) {
        DOM.noteForm.addEventListener('submit', handleSubmitNote);
    }
    if (DOM.noteReason) {
        DOM.noteReason.addEventListener('input', updateCharCount);
    }
    if (DOM.noteModal) {
        DOM.noteModal.addEventListener('click', (e) => {
            if (e.target === DOM.noteModal) {
                closeNoteModal();
            }
        });
    }

    // Set default date to today
    if (DOM.noteDate) {
        const today = new Date().toISOString().split('T')[0];
        DOM.noteDate.value = today;
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
    // Normalize status untuk cari class
    const normalizedStatus = status?.toLowerCase();

    if (normalizedStatus === 'hadir' || normalizedStatus === 'present') {
        return 'success';
    } else if (normalizedStatus === 'lewat' || normalizedStatus === 'late') {
        return 'warning';
    } else if (normalizedStatus === 'tidak hadir' || normalizedStatus === 'absent') {
        return 'danger';
    } else if (normalizedStatus === 'cuti' || normalizedStatus === 'on_leave') {
        return 'info';
    }

    return '';
}

// ==========================================
// Note/Catatan Functions
// ==========================================

function openNoteModal() {
    if (DOM.noteModal) {
        // Reset form
        if (DOM.noteForm) DOM.noteForm.reset();
        if (DOM.noteDate) {
            const today = new Date().toISOString().split('T')[0];
            DOM.noteDate.value = today;
        }
        if (DOM.charCount) DOM.charCount.textContent = '0';

        DOM.noteModal.classList.add('active');
    }
}

function closeNoteModal() {
    if (DOM.noteModal) {
        DOM.noteModal.classList.remove('active');
        if (DOM.noteForm) DOM.noteForm.reset();
    }
}

function updateCharCount() {
    if (DOM.noteReason && DOM.charCount) {
        const count = DOM.noteReason.value.length;
        DOM.charCount.textContent = count;

        // Change color if nearing limit
        if (count > 450) {
            DOM.charCount.style.color = '#e74c3c';
        } else if (count > 400) {
            DOM.charCount.style.color = '#f39c12';
        } else {
            DOM.charCount.style.color = '#666';
        }
    }
}

async function handleSubmitNote(e) {
    e.preventDefault();

    if (!AppState.user) {
        alert('User data tidak dijumpai');
        return;
    }

    const noteType = DOM.noteType?.value;
    const noteDate = DOM.noteDate?.value;
    const noteReason = DOM.noteReason?.value?.trim();
    const noteConfirm = DOM.noteConfirm?.checked;

    // Validation
    if (!noteType) {
        alert('Sila pilih jenis catatan');
        return;
    }

    if (!noteDate) {
        alert('Sila pilih tarikh');
        return;
    }

    if (!noteReason || noteReason.length < 10) {
        alert('Alasan terlalu pendek. Minimum 10 aksara.');
        return;
    }

    if (!noteConfirm) {
        alert('Sila sahkan maklumat adalah benar');
        return;
    }

    // Confirmation
    if (!confirm(`Anda pasti mahu hantar catatan "${noteType}" untuk tarikh ${noteDate}?`)) {
        return;
    }

    try {
        // Show loading
        const submitBtn = DOM.noteForm.querySelector('button[type="submit"]');
        const originalBtnHTML = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Menghantar...</span>';

        // Prepare note data
        const noteData = {
            userId: AppState.user.userId || AppState.user.id,
            userName: AppState.user.name,
            email: AppState.user.email || '',
            noteType: noteType,
            noteDate: noteDate,
            noteReason: noteReason,
            submittedDate: new Date().toISOString()
        };

        console.log('Submitting note:', noteData);

        const result = await GoogleSheetsAPI.submitNote(noteData);

        console.log('Submit note result:', result);

        if (result.success) {
            alert('✓ Catatan berjaya dihantar! Admin akan melihat catatan anda.');
            closeNoteModal();
        } else {
            alert(result.message || 'Ralat menghantar catatan. Sila cuba lagi.');
        }

        // Restore button
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHTML;

    } catch (error) {
        console.error('Error submitting note:', error);
        alert('Ralat menghantar catatan. Sila cuba lagi.');

        // Restore button
        const submitBtn = DOM.noteForm.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="margin-right: 5px;"><path d="M20 6L9 17l-5-5"/></svg>Hantar Catatan';
        }
    }
}

// ==========================================
// Edit Profile Functions
// ==========================================

function showEditProfileMode() {
    if (!AppState.user) return;

    // Populate form dengan data user semasa
    if (DOM.editName) DOM.editName.value = AppState.user.name;
    if (DOM.editEmail) DOM.editEmail.value = AppState.user.email;
    if (DOM.editPassword) DOM.editPassword.value = '';
    if (DOM.editPasswordConfirm) DOM.editPasswordConfirm.value = '';

    // Toggle visibility
    if (DOM.profileViewMode) DOM.profileViewMode.style.display = 'none';
    if (DOM.profileEditMode) DOM.profileEditMode.style.display = 'block';
}

function showViewProfileMode() {
    // Clear form
    if (DOM.editPassword) DOM.editPassword.value = '';
    if (DOM.editPasswordConfirm) DOM.editPasswordConfirm.value = '';

    // Toggle visibility
    if (DOM.profileViewMode) DOM.profileViewMode.style.display = 'block';
    if (DOM.profileEditMode) DOM.profileEditMode.style.display = 'none';
}

async function handleEditProfile(e) {
    e.preventDefault();

    if (!AppState.user) {
        alert('User data tidak dijumpai');
        return;
    }

    const name = DOM.editName?.value?.trim();
    const password = DOM.editPassword?.value?.trim();
    const passwordConfirm = DOM.editPasswordConfirm?.value?.trim();

    // Validation
    if (!name) {
        alert('Nama diperlukan');
        return;
    }

    if (name.length < 3) {
        alert('Nama terlalu pendek. Minimum 3 aksara.');
        return;
    }

    // Password validation (jika nak tukar password)
    if (password) {
        if (password.length < 6) {
            alert('Password terlalu pendek. Minimum 6 aksara.');
            return;
        }

        if (password !== passwordConfirm) {
            alert('Password dan Confirm Password tidak sama!');
            return;
        }
    }

    // Confirmation
    const confirmMsg = password
        ? 'Anda pasti mahu update profil dan password?'
        : 'Anda pasti mahu update profil?';

    if (!confirm(confirmMsg)) {
        return;
    }

    try {
        // Show loading
        const submitBtn = DOM.editProfileForm.querySelector('button[type="submit"]');
        const originalBtnHTML = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Memproses...</span>';

        // Prepare update data
        const updateData = {
            userId: AppState.user.id,
            name: name
        };

        // Only include password if changed
        if (password) {
            updateData.password = password;
        }

        console.log('Updating profile:', { ...updateData, password: password ? '[HIDDEN]' : undefined });

        const result = await GoogleSheetsAPI.updateUser(AppState.user.id, updateData);

        console.log('Update profile result:', result);

        if (result.success) {
            // Update local user data
            AppState.user.name = name;
            AuthManager.updateUserData(AppState.user);

            // Update display
            displayUserInfo();

            // Show success message
            alert('✓ Profil berjaya dikemaskini!');

            // Back to view mode
            showViewProfileMode();
        } else {
            alert(result.message || 'Ralat mengemaskini profil. Sila cuba lagi.');
        }

        // Restore button
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHTML;

    } catch (error) {
        console.error('Error updating profile:', error);
        alert('Ralat mengemaskini profil. Sila cuba lagi.');

        // Restore button
        const submitBtn = DOM.editProfileForm.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="margin-right: 5px;"><path d="M20 6L9 17l-5-5"/></svg>Simpan';
        }
    }
}
