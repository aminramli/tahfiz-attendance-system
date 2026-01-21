/* ==========================================
   Admin Dashboard Logic
   Sistem Kehadiran Tahfiz
   ========================================== */

const AdminState = {
    currentUser: null,
    users: [],
    todayAttendance: [],
    notes: [],
    filteredNotes: [],
    currentTab: 'overview',
    editingUserId: null,
    selectedNote: null
};

const DOM = {};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Protect admin page
    if (!AuthManager.protectPage('admin')) {
        return;
    }

    AdminState.currentUser = AuthManager.getCurrentUser();
    initializeDOMReferences();
    setupEventListeners();
    setupTabs();
    loadAllData();
    setupReportFilters();
});

function initializeDOMReferences() {
    // Stats
    DOM.statTodayPresent = document.getElementById('statTodayPresent');
    DOM.statNotCheckedOut = document.getElementById('statNotCheckedOut');
    DOM.statTotalUsers = document.getElementById('statTotalUsers');
    DOM.statMonthlyAttendance = document.getElementById('statMonthlyAttendance');

    // Notes Stats
    DOM.statNotesPending = document.getElementById('statNotesPending');
    DOM.statNotesApproved = document.getElementById('statNotesApproved');
    DOM.statNotesRejected = document.getElementById('statNotesRejected');
    DOM.statNotesTotal = document.getElementById('statNotesTotal');

    // Tables
    DOM.attendanceTableBody = document.getElementById('attendanceTableBody');
    DOM.usersTableBody = document.getElementById('usersTableBody');
    DOM.notesTableBody = document.getElementById('notesTableBody');

    // Buttons
    DOM.addUserBtn = document.getElementById('addUserBtn');
    DOM.loadAttendanceBtn = document.getElementById('loadAttendanceBtn');
    DOM.filterDate = document.getElementById('filterDate');

    // User Modal
    DOM.userModal = document.getElementById('userModal');
    DOM.userForm = document.getElementById('userForm');
    DOM.userModalTitle = document.getElementById('userModalTitle');
    DOM.closeUserModal = document.getElementById('closeUserModal');
    DOM.editUserId = document.getElementById('editUserId');
    DOM.userName = document.getElementById('userName');
    DOM.userEmail = document.getElementById('userEmail');
    DOM.userPassword = document.getElementById('userPassword');
    DOM.userRole = document.getElementById('userRole');
    DOM.userStatus = document.getElementById('userStatus');
    DOM.passwordHint = document.getElementById('passwordHint');

    // Profile
    DOM.profileBtn = document.getElementById('profileBtn');
    DOM.profileModal = document.getElementById('profileModal');
    DOM.closeModal = document.getElementById('closeModal');
    DOM.logoutBtn = document.getElementById('logoutBtn');
    DOM.modalUserName = document.getElementById('modalUserName');
    DOM.modalUserEmail = document.getElementById('modalUserEmail');

    // Reports
    DOM.reportMonth = document.getElementById('reportMonth');
    DOM.reportYear = document.getElementById('reportYear');
    DOM.generateReportBtn = document.getElementById('generateReportBtn');
    DOM.exportExcelBtn = document.getElementById('exportExcelBtn');
    DOM.reportContent = document.getElementById('reportContent');

    // Notes
    DOM.refreshNotesBtn = document.getElementById('refreshNotesBtn');
    DOM.filterNoteType = document.getElementById('filterNoteType');
    DOM.filterNoteStatus = document.getElementById('filterNoteStatus');
    DOM.filterNoteDateFrom = document.getElementById('filterNoteDateFrom');
    DOM.filterNoteDateTo = document.getElementById('filterNoteDateTo');
    DOM.filterNotesBtn = document.getElementById('filterNotesBtn');

    // Note Detail Modal
    DOM.noteDetailModal = document.getElementById('noteDetailModal');
    DOM.closeNoteDetailModal = document.getElementById('closeNoteDetailModal');
    DOM.noteDetailUserId = document.getElementById('noteDetailUserId');
    DOM.noteDetailUserName = document.getElementById('noteDetailUserName');
    DOM.noteDetailEmail = document.getElementById('noteDetailEmail');
    DOM.noteDetailType = document.getElementById('noteDetailType');
    DOM.noteDetailDate = document.getElementById('noteDetailDate');
    DOM.noteDetailReason = document.getElementById('noteDetailReason');
    DOM.noteDetailStatus = document.getElementById('noteDetailStatus');
    DOM.noteDetailSubmitted = document.getElementById('noteDetailSubmitted');
    DOM.noteDetailRowIndex = document.getElementById('noteDetailRowIndex');
    DOM.noteAdminResponse = document.getElementById('noteAdminResponse');
    DOM.approveNoteBtn = document.getElementById('approveNoteBtn');
    DOM.rejectNoteBtn = document.getElementById('rejectNoteBtn');
}

function setupTabs() {
    const tabs = document.querySelectorAll('.admin-tab');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;

            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Update active content
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === tabName) {
                    content.classList.add('active');
                    AdminState.currentTab = tabName;

                    // Load data when tab is activated
                    switch (tabName) {
                        case 'attendance':
                            loadTodayAttendance();
                            break;
                        case 'catatan':
                            loadAllNotes();
                            break;
                        case 'users':
                            loadAllUsers();
                            break;
                    }
                }
            });
        });
    });
}

function setupEventListeners() {
    // Add user button
    DOM.addUserBtn.addEventListener('click', openAddUserModal);

    // Close user modal
    DOM.closeUserModal.addEventListener('click', closeUserModal);
    DOM.userModal.addEventListener('click', (e) => {
        if (e.target === DOM.userModal) closeUserModal();
    });

    // User form submit
    DOM.userForm.addEventListener('submit', handleUserFormSubmit);

    // Load attendance
    DOM.loadAttendanceBtn.addEventListener('click', loadTodayAttendance);

    // Set today's date
    DOM.filterDate.value = formatDateForInput(new Date());

    // Profile modal
    DOM.profileBtn.addEventListener('click', openProfileModal);
    DOM.closeModal.addEventListener('click', closeProfileModal);
    DOM.profileModal.addEventListener('click', (e) => {
        if (e.target === DOM.profileModal) closeProfileModal();
    });

    // Logout
    DOM.logoutBtn.addEventListener('click', () => {
        if (confirm('Adakah anda pasti mahu log keluar?')) {
            AuthManager.logout();
        }
    });

    // Reports
    DOM.generateReportBtn.addEventListener('click', generateReport);
    DOM.exportExcelBtn.addEventListener('click', exportToExcel);

    // Bottom navigation
    const bottomNavItems = document.querySelectorAll('.bottom-nav .nav-item[data-tab-trigger]');
    bottomNavItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const tabName = item.dataset.tabTrigger;

            // Find and click the corresponding top tab
            const topTab = document.querySelector(`.admin-tab[data-tab="${tabName}"]`);
            if (topTab) {
                topTab.click();
            }

            // Update bottom nav active state
            bottomNavItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
        });
    });

    // Profile nav from bottom
    const profileNavBottom = document.getElementById('profileNavBottom');
    if (profileNavBottom) {
        profileNavBottom.addEventListener('click', (e) => {
            e.preventDefault();
            openProfileModal();
        });
    }

    // Notes event listeners
    DOM.refreshNotesBtn.addEventListener('click', loadAllNotes);
    DOM.filterNotesBtn.addEventListener('click', applyNotesFilter);

    // Note detail modal
    DOM.closeNoteDetailModal.addEventListener('click', closeNoteDetailModal);
    DOM.noteDetailModal.addEventListener('click', (e) => {
        if (e.target === DOM.noteDetailModal) closeNoteDetailModal();
    });

    DOM.approveNoteBtn.addEventListener('click', () => updateNoteStatus('approved'));
    DOM.rejectNoteBtn.addEventListener('click', () => updateNoteStatus('rejected'));
}

function setupReportFilters() {
    // Populate years
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= currentYear - 5; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        DOM.reportYear.appendChild(option);
    }

    // Set current month and year
    const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
    DOM.reportMonth.value = currentMonth;
    DOM.reportYear.value = currentYear;
}

// Load all initial data
async function loadAllData() {
    await Promise.all([
        loadOverviewStats(),
        loadTodayAttendance(),
        loadAllUsers()
    ]);
}

// Load overview statistics
async function loadOverviewStats() {
    try {
        const today = formatDateForInput(new Date());
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();

        // Load today's attendance
        const attendanceResult = await GoogleSheetsAPI.getAttendance(null, 'admin', today, today);

        // Load all users
        const usersResult = await GoogleSheetsAPI.getAllUsers();

        // Load monthly attendance
        const monthlyResult = await GoogleSheetsAPI.getAttendance(
            null,
            'admin',
            `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`,
            today
        );

        if (attendanceResult.success) {
            const records = attendanceResult.data || [];
            DOM.statTodayPresent.textContent = records.length;

            const notCheckedOut = records.filter(r => !r.checkOut || r.checkOut === '').length;
            DOM.statNotCheckedOut.textContent = notCheckedOut;
        }

        if (usersResult.success) {
            DOM.statTotalUsers.textContent = (usersResult.data || []).length;
        }

        if (monthlyResult.success) {
            DOM.statMonthlyAttendance.textContent = (monthlyResult.data || []).length;
        }

    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Load today's attendance
async function loadTodayAttendance() {
    try {
        const selectedDate = DOM.filterDate.value;
        const result = await GoogleSheetsAPI.getAttendance(null, 'admin', selectedDate, selectedDate);

        if (result.success) {
            AdminState.todayAttendance = result.data || [];
            displayAttendanceTable();
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        console.error('Error loading attendance:', error);
        DOM.attendanceTableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; color: #f44336;">
                    Ralat: ${error.message}
                </td>
            </tr>
        `;
    }
}

function displayAttendanceTable() {
    if (AdminState.todayAttendance.length === 0) {
        DOM.attendanceTableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; color: #757575;">
                    Tiada rekod kehadiran
                </td>
            </tr>
        `;
        return;
    }

    DOM.attendanceTableBody.innerHTML = '';
    AdminState.todayAttendance.forEach(record => {
        const row = document.createElement('tr');
        const statusClass = record.status === 'Hadir' ? 'badge-active' :
                          record.status === 'Lewat' ? 'badge-inactive' : 'badge-inactive';

        row.innerHTML = `
            <td>${record.userName || record.email}</td>
            <td>${record.checkIn || '--:--'}</td>
            <td>${record.checkOut || '--:--'}</td>
            <td>${record.duration || '--'}</td>
            <td><span class="badge ${statusClass}">${record.status || 'Hadir'}</span></td>
        `;
        DOM.attendanceTableBody.appendChild(row);
    });
}

// Load all users
async function loadAllUsers() {
    try {
        const result = await GoogleSheetsAPI.getAllUsers();

        if (result.success) {
            AdminState.users = result.data || [];
            displayUsersTable();
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        console.error('Error loading users:', error);
        DOM.usersTableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; color: #f44336;">
                    Ralat: ${error.message}
                </td>
            </tr>
        `;
    }
}

function displayUsersTable() {
    if (AdminState.users.length === 0) {
        DOM.usersTableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; color: #757575;">
                    Tiada pengguna
                </td>
            </tr>
        `;
        return;
    }

    DOM.usersTableBody.innerHTML = '';
    AdminState.users.forEach(user => {
        const row = document.createElement('tr');
        const statusBadge = user.status === 'Active' ? 'badge-active' : 'badge-inactive';
        const roleBadge = user.role === 'admin' ? 'badge-admin' : 'badge-guru';

        row.innerHTML = `
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td><span class="badge ${roleBadge}">${user.role}</span></td>
            <td><span class="badge ${statusBadge}">${user.status}</span></td>
            <td>
                <button class="btn-action btn-edit" onclick="editUser('${user.id}')">Edit</button>
                <button class="btn-action btn-delete" onclick="deleteUser('${user.id}', '${user.name}')">Hapus</button>
            </td>
        `;
        DOM.usersTableBody.appendChild(row);
    });
}

// Open add user modal
function openAddUserModal() {
    AdminState.editingUserId = null;
    DOM.userModalTitle.textContent = 'Tambah Pengguna Baru';
    DOM.userForm.reset();
    DOM.editUserId.value = '';
    DOM.passwordHint.style.display = 'none';
    DOM.userPassword.placeholder = 'Minimum 6 aksara';
    DOM.userPassword.required = true;
    DOM.userModal.classList.add('active');
}

// Open edit user modal
window.editUser = function(userId) {
    const user = AdminState.users.find(u => u.id === userId);
    if (!user) return;

    AdminState.editingUserId = userId;
    DOM.userModalTitle.textContent = 'Edit Pengguna';
    DOM.editUserId.value = userId;
    DOM.userName.value = user.name;
    DOM.userEmail.value = user.email;
    DOM.userPassword.value = '';
    DOM.userRole.value = user.role;
    DOM.userStatus.value = user.status;
    DOM.passwordHint.style.display = 'block';
    DOM.userPassword.placeholder = 'Kosongkan jika tidak mahu tukar';
    DOM.userPassword.required = false;
    DOM.userModal.classList.add('active');
};

// Close user modal
function closeUserModal() {
    DOM.userModal.classList.remove('active');
    DOM.userForm.reset();
    AdminState.editingUserId = null;
}

// Handle user form submit
async function handleUserFormSubmit(e) {
    e.preventDefault();

    const userData = {
        name: DOM.userName.value.trim(),
        email: DOM.userEmail.value.trim(),
        password: DOM.userPassword.value,
        role: DOM.userRole.value,
        status: DOM.userStatus.value
    };

    // Validate password for new users
    if (!AdminState.editingUserId && (!userData.password || userData.password.length < 6)) {
        alert('Kata laluan mestilah minimum 6 aksara');
        return;
    }

    try {
        let result;

        if (AdminState.editingUserId) {
            // Update existing user
            const updateData = {
                userId: AdminState.editingUserId,
                name: userData.name,
                role: userData.role,
                status: userData.status
            };

            // Only include password if provided
            if (userData.password) {
                updateData.password = userData.password;
            }

            result = await GoogleSheetsAPI.updateUser(AdminState.editingUserId, updateData);
        } else {
            // Add new user
            result = await GoogleSheetsAPI.addUser(userData);
        }

        if (result.success) {
            alert(AdminState.editingUserId ? 'Pengguna berjaya dikemaskini!' : 'Pengguna berjaya ditambah!');
            closeUserModal();
            await loadAllUsers();
            await loadOverviewStats();
        } else {
            alert(result.message || 'Ralat. Sila cuba lagi.');
        }
    } catch (error) {
        console.error('Error saving user:', error);
        alert('Ralat menyimpan pengguna: ' + error.message);
    }
}

// Delete user
window.deleteUser = async function(userId, userName) {
    if (!confirm(`Adakah anda pasti mahu hapus pengguna "${userName}"?\n\nTindakan ini tidak boleh dibatalkan.`)) {
        return;
    }

    try {
        const result = await GoogleSheetsAPI.deleteUser(userId);

        if (result.success) {
            alert('Pengguna berjaya dihapus!');
            await loadAllUsers();
            await loadOverviewStats();
        } else {
            alert(result.message || 'Ralat menghapus pengguna.');
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        alert('Ralat menghapus pengguna: ' + error.message);
    }
};

// Generate report
async function generateReport() {
    const month = DOM.reportMonth.value;
    const year = DOM.reportYear.value;

    if (!month || !year) {
        alert('Sila pilih bulan dan tahun');
        return;
    }

    try {
        const startDate = `${year}-${month}-01`;
        const endDate = `${year}-${month}-31`;

        const result = await GoogleSheetsAPI.getAttendance(null, 'admin', startDate, endDate);

        if (result.success) {
            displayReport(result.data || [], month, year);
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        console.error('Error generating report:', error);
        alert('Ralat menjana laporan: ' + error.message);
    }
}

function displayReport(data, month, year) {
    const monthNames = ['', 'Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun',
                       'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'];

    if (data.length === 0) {
        DOM.reportContent.innerHTML = `
            <p style="text-align: center; color: #757575; padding: 40px;">
                Tiada rekod untuk ${monthNames[parseInt(month)]} ${year}
            </p>
        `;
        return;
    }

    // Group by user
    const userStats = {};
    data.forEach(record => {
        const userId = record.userId;
        if (!userStats[userId]) {
            userStats[userId] = {
                name: record.userName || record.email,
                email: record.email,
                totalDays: 0,
                presentDays: 0,
                lateDays: 0,
                totalHours: 0
            };
        }

        userStats[userId].totalDays++;
        if (record.status === 'Hadir') userStats[userId].presentDays++;
        if (record.status === 'Lewat') userStats[userId].lateDays++;

        // Calculate hours
        if (record.duration) {
            const match = record.duration.match(/(\d+)h\s*(\d+)m/);
            if (match) {
                const hours = parseInt(match[1]) + parseInt(match[2]) / 60;
                userStats[userId].totalHours += hours;
            }
        }
    });

    let html = `
        <h3>${monthNames[parseInt(month)]} ${year}</h3>
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Nama</th>
                        <th>Email</th>
                        <th>Hadir</th>
                        <th>Lewat</th>
                        <th>Jumlah Hari</th>
                        <th>Jumlah Jam</th>
                    </tr>
                </thead>
                <tbody>
    `;

    Object.values(userStats).forEach(stat => {
        html += `
            <tr>
                <td>${stat.name}</td>
                <td>${stat.email}</td>
                <td>${stat.presentDays}</td>
                <td>${stat.lateDays}</td>
                <td>${stat.totalDays}</td>
                <td>${stat.totalHours.toFixed(1)}h</td>
            </tr>
        `;
    });

    html += `
                </tbody>
            </table>
        </div>
    `;

    DOM.reportContent.innerHTML = html;
}

function exportToExcel() {
    alert('Feature export Excel akan ditambah tidak lama lagi!');
}

// ==========================================
// NOTES MANAGEMENT
// ==========================================

// Load all notes
async function loadAllNotes() {
    try {
        const result = await GoogleSheetsAPI.getAllNotes();

        if (result.success) {
            AdminState.notes = result.data || [];
            AdminState.filteredNotes = AdminState.notes;
            displayNotesTable();
            updateNotesStats();
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        console.error('Error loading notes:', error);
        DOM.notesTableBody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; color: #f44336; padding: 40px;">
                    Ralat: ${error.message}
                </td>
            </tr>
        `;
    }
}

// Display notes table
function displayNotesTable() {
    if (AdminState.filteredNotes.length === 0) {
        DOM.notesTableBody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; color: #757575; padding: 40px;">
                    Tiada catatan dijumpai
                </td>
            </tr>
        `;
        return;
    }

    DOM.notesTableBody.innerHTML = '';
    AdminState.filteredNotes.forEach((note, index) => {
        const row = document.createElement('tr');

        // Status badge
        const statusBadge = getStatusBadge(note.status || 'pending');

        // Type badge
        const typeBadge = getTypeBadge(note.noteType);

        // Format submitted date
        const submittedDate = note.submittedDate ?
            formatDateTime(note.submittedDate) : '--';

        row.innerHTML = `
            <td>${note.userId || '--'}</td>
            <td><strong>${note.userName || '--'}</strong></td>
            <td>${typeBadge}</td>
            <td>${note.noteDate || '--'}</td>
            <td style="max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                ${note.noteReason || '--'}
            </td>
            <td>${statusBadge}</td>
            <td style="font-size: 12px;">${submittedDate}</td>
            <td>
                <button class="btn-action btn-edit" onclick="viewNoteDetail(${note.rowIndex})">
                    Lihat
                </button>
            </td>
        `;
        DOM.notesTableBody.appendChild(row);
    });
}

// Update notes statistics
function updateNotesStats() {
    const pending = AdminState.notes.filter(n => !n.status || n.status === 'pending').length;
    const approved = AdminState.notes.filter(n => n.status === 'approved').length;
    const rejected = AdminState.notes.filter(n => n.status === 'rejected').length;

    DOM.statNotesPending.textContent = pending;
    DOM.statNotesApproved.textContent = approved;
    DOM.statNotesRejected.textContent = rejected;
    DOM.statNotesTotal.textContent = AdminState.notes.length;
}

// Apply notes filter
function applyNotesFilter() {
    const typeFilter = DOM.filterNoteType.value;
    const statusFilter = DOM.filterNoteStatus.value;
    const dateFromFilter = DOM.filterNoteDateFrom.value;
    const dateToFilter = DOM.filterNoteDateTo.value;

    AdminState.filteredNotes = AdminState.notes.filter(note => {
        // Type filter
        if (typeFilter && note.noteType !== typeFilter) return false;

        // Status filter
        const noteStatus = note.status || 'pending';
        if (statusFilter && noteStatus !== statusFilter) return false;

        // Date range filter
        if (dateFromFilter && note.noteDate < dateFromFilter) return false;
        if (dateToFilter && note.noteDate > dateToFilter) return false;

        return true;
    });

    displayNotesTable();
}

// View note detail
window.viewNoteDetail = function(rowIndex) {
    const note = AdminState.notes.find(n => n.rowIndex === rowIndex);
    if (!note) {
        alert('Catatan tidak dijumpai');
        return;
    }

    AdminState.selectedNote = note;

    // Populate modal
    DOM.noteDetailUserId.textContent = note.userId || '--';
    DOM.noteDetailUserName.textContent = note.userName || '--';
    DOM.noteDetailEmail.textContent = note.email || '--';
    DOM.noteDetailType.textContent = note.noteType || '--';
    DOM.noteDetailDate.textContent = note.noteDate || '--';
    DOM.noteDetailReason.textContent = note.noteReason || '--';
    DOM.noteDetailStatus.innerHTML = getStatusBadge(note.status || 'pending');
    DOM.noteDetailSubmitted.textContent = note.submittedDate ?
        formatDateTime(note.submittedDate) : '--';
    DOM.noteDetailRowIndex.value = rowIndex;
    DOM.noteAdminResponse.value = note.adminResponse || '';

    // Disable buttons if already processed
    const isProcessed = note.status === 'approved' || note.status === 'rejected';
    DOM.approveNoteBtn.disabled = isProcessed;
    DOM.rejectNoteBtn.disabled = isProcessed;
    DOM.noteAdminResponse.disabled = isProcessed;

    if (isProcessed) {
        DOM.approveNoteBtn.style.opacity = '0.5';
        DOM.rejectNoteBtn.style.opacity = '0.5';
        DOM.approveNoteBtn.style.cursor = 'not-allowed';
        DOM.rejectNoteBtn.style.cursor = 'not-allowed';
    } else {
        DOM.approveNoteBtn.style.opacity = '1';
        DOM.rejectNoteBtn.style.opacity = '1';
        DOM.approveNoteBtn.style.cursor = 'pointer';
        DOM.rejectNoteBtn.style.cursor = 'pointer';
    }

    DOM.noteDetailModal.classList.add('active');
};

// Close note detail modal
function closeNoteDetailModal() {
    DOM.noteDetailModal.classList.remove('active');
    AdminState.selectedNote = null;
}

// Update note status (approve/reject)
async function updateNoteStatus(newStatus) {
    if (!AdminState.selectedNote) {
        alert('Tiada catatan dipilih');
        return;
    }

    const adminResponse = DOM.noteAdminResponse.value.trim();
    const rowIndex = AdminState.selectedNote.rowIndex;

    const confirmMsg = newStatus === 'approved' ?
        'Adakah anda pasti mahu APPROVE catatan ini?' :
        'Adakah anda pasti mahu REJECT catatan ini?';

    if (!confirm(confirmMsg)) {
        return;
    }

    try {
        const result = await GoogleSheetsAPI.updateNoteStatus(
            rowIndex,
            newStatus,
            adminResponse,
            AdminState.currentUser.name
        );

        if (result.success) {
            alert(`Catatan berjaya ${newStatus === 'approved' ? 'diluluskan' : 'ditolak'}!`);
            closeNoteDetailModal();
            await loadAllNotes();
        } else {
            alert(result.message || 'Ralat mengemas kini catatan');
        }
    } catch (error) {
        console.error('Error updating note status:', error);
        alert('Ralat mengemas kini catatan: ' + error.message);
    }
}

// Get status badge HTML
function getStatusBadge(status) {
    const statusMap = {
        'pending': { class: 'badge', style: 'background: #FFF3E0; color: #E65100;', text: 'Pending' },
        'approved': { class: 'badge badge-active', style: '', text: 'Approved' },
        'rejected': { class: 'badge badge-inactive', style: '', text: 'Rejected' }
    };

    const badge = statusMap[status] || statusMap['pending'];
    return `<span class="${badge.class}" style="${badge.style}">${badge.text}</span>`;
}

// Get type badge HTML
function getTypeBadge(type) {
    const typeMap = {
        'Lewat': { color: '#FF9800', text: 'Lewat' },
        'Tidak Hadir': { color: '#f44336', text: 'Tidak Hadir' },
        'Cuti': { color: '#2196F3', text: 'Cuti' },
        'Lain-lain': { color: '#9E9E9E', text: 'Lain-lain' }
    };

    const typeInfo = typeMap[type] || typeMap['Lain-lain'];
    return `<span style="padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; background: ${typeInfo.color}22; color: ${typeInfo.color};">${typeInfo.text}</span>`;
}

// Format datetime
function formatDateTime(isoString) {
    if (!isoString) return '--';

    try {
        const date = new Date(isoString);
        const dateStr = date.toLocaleDateString('ms-MY', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        const timeStr = date.toLocaleTimeString('ms-MY', {
            hour: '2-digit',
            minute: '2-digit'
        });
        return `${dateStr} ${timeStr}`;
    } catch (e) {
        return isoString;
    }
}

// Profile modal
function openProfileModal() {
    DOM.modalUserName.textContent = AdminState.currentUser.name;
    DOM.modalUserEmail.textContent = AdminState.currentUser.email;
    DOM.profileModal.classList.add('active');
}

function closeProfileModal() {
    DOM.profileModal.classList.remove('active');
}

// Utility functions
function formatDateForInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
