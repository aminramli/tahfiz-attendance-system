/* ==========================================
   Sistem Kehadiran MRSM Matra - Backend API
   Google Apps Script
   Version: 3.0 (Updated with 6-digit ID + Notes)
   Developer: Amin Ramli
   ========================================== */

// Configuration
const SPREADSHEET_ID = '1VkJxBkwrPIZXjUmzvtSwRq7XPYRbU2cTYquB-gJl6qw';
const SHEET_USERS = 'Users';
const SHEET_ATTENDANCE = 'Attendance';
const SHEET_SETTINGS = 'Settings';
const SHEET_NOTES = 'Notes';

// GPS Settings (Koordinat MRSM Matra)
const MRSM_LAT = 3.1979163349111825;
const MRSM_LNG = 102.47799269609713;
const ALLOWED_RADIUS = 200; // 200 meter radius

/* ==========================================
   MAIN HANDLER - GET Method (No CORS)
   ========================================== */

function doGet(e) {
  try {
    const params = e.parameter || {};
    const action = params.action;

    Logger.log('Action: ' + action);
    Logger.log('Params: ' + JSON.stringify(params));

    let result = {};

    // Route based on action
    switch(action) {
      case 'login':
        result = handleLogin(params);
        break;
      case 'getUser':
        result = getUser(params);
        break;
      case 'getAllUsers':
        result = getAllUsers();
        break;
      case 'addUser':
        result = addUser(params);
        break;
      case 'updateUser':
        result = updateUser(params);
        break;
      case 'deleteUser':
        result = deleteUser(params);
        break;
      case 'checkIn':
        result = handleCheckIn(params);
        break;
      case 'checkOut':
        result = handleCheckOut(params);
        break;
      case 'getAttendance':
        result = getAttendance(params);
        break;
      case 'getUserStats':
        result = getUserStats(params);
        break;
      case 'getTodayAttendance':
        result = getTodayAttendance();
        break;
      case 'submitNote':
        result = submitNote(params);
        break;
      case 'getAllNotes':
        result = getAllNotes();
        break;
      case 'getNotesByUser':
        result = getNotesByUser(params);
        break;
      case 'updateNoteStatus':
        result = updateNoteStatus(params);
        break;
      case 'getSettings':
        result = getSettings();
        break;
      case 'updateSettings':
        result = updateSettings(params);
        break;
      default:
        result = createResponse(false, 'Action not found: ' + action);
    }

    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch(error) {
    Logger.log('Error in doGet: ' + error.toString());
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        message: 'Server error: ' + error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  return doGet(e); // Use same handler
}

/* ==========================================
   HELPER FUNCTIONS
   ========================================== */

function createResponse(success, message, data = null) {
  const response = {
    success: success,
    message: message,
    timestamp: new Date().toISOString()
  };

  if (data !== null) {
    response.data = data;
  }

  return response;
}

function getSpreadsheet() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function getSheet(sheetName) {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    initializeSheet(sheet, sheetName);
  }

  return sheet;
}

function initializeSheet(sheet, sheetName) {
  if (sheetName === SHEET_USERS) {
    sheet.appendRow(['UserID', 'Email', 'Password', 'Name', 'Role', 'Status', 'Created', 'LastLogin']);

    // Default accounts with 6-digit IDs
    const adminPass = hashPassword('admin123');
    sheet.appendRow(['999999', 'admin@mrsmatra.edu.my', adminPass, 'Administrator', 'admin', 'active', new Date().toISOString(), '']);

    const guruPass = hashPassword('guru123');
    sheet.appendRow(['100001', 'guru@mrsmatra.edu.my', guruPass, 'Guru Contoh', 'guru', 'active', new Date().toISOString(), '']);

  } else if (sheetName === SHEET_ATTENDANCE) {
    sheet.appendRow(['ID', 'UserID', 'UserName', 'Email', 'Date', 'CheckIn', 'CheckOut', 'CheckInLat', 'CheckInLng', 'CheckOutLat', 'CheckOutLng', 'Duration', 'Status', 'Notes']);

  } else if (sheetName === SHEET_SETTINGS) {
    sheet.appendRow(['Key', 'Value', 'Description']);
    sheet.appendRow(['pusatLat', MRSM_LAT, 'Latitude MRSM Matra']);
    sheet.appendRow(['pusatLng', MRSM_LNG, 'Longitude MRSM Matra']);
    sheet.appendRow(['radius', ALLOWED_RADIUS, 'Radius dibenarkan (meter)']);
    sheet.appendRow(['checkInTime', '08:00', 'Waktu check-in rasmi']);
    sheet.appendRow(['lateThreshold', '15', 'Had lewat (minit)']);

  } else if (sheetName === SHEET_NOTES) {
    sheet.appendRow(['ID', 'UserID', 'UserName', 'Email', 'NoteType', 'NoteDate', 'NoteReason', 'SubmittedDate', 'Status', 'AdminResponse', 'AdminRespondedDate']);
  }
}

function generateId() {
  return 'ID' + new Date().getTime() + Math.random().toString(36).substr(2, 9);
}

function generateUserId() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function hashPassword(password) {
  return Utilities.base64Encode(Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    password + 'MRSM_MATRA_2026'
  ));
}

function verifyPassword(password, hash) {
  return hashPassword(password) === hash;
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}

function verifyLocation(lat, lng) {
  const distance = calculateDistance(MRSM_LAT, MRSM_LNG, lat, lng);
  return {
    valid: distance <= ALLOWED_RADIUS,
    distance: Math.round(distance),
    maxDistance: ALLOWED_RADIUS
  };
}

/* ==========================================
   AUTHENTICATION
   ========================================== */

function handleLogin(params) {
  try {
    const userId = params.userId;
    const email = params.email;
    const password = params.password;

    if ((!userId && !email) || !password) {
      return createResponse(false, 'ID Pengguna/Email dan password diperlukan');
    }

    const sheet = getSheet(SHEET_USERS);
    const data = sheet.getDataRange().getValues();

    Logger.log('Login attempt - userId: ' + userId + ', email: ' + email);

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const rowUserId = row[0];
      const rowEmail = row[1];
      const rowPassword = row[2];
      const rowName = row[3];
      const rowRole = row[4];
      const rowStatus = row[5];

      const userMatches = (userId && rowUserId === userId) || (email && rowEmail === email);

      if (userMatches && (rowStatus === 'active' || rowStatus === 'Active')) {
        if (verifyPassword(password, rowPassword)) {
          sheet.getRange(i + 1, 8).setValue(new Date().toISOString());

          Logger.log('Login successful for: ' + rowName);

          return createResponse(true, 'Login berjaya', {
            id: rowUserId,
            userId: rowUserId,
            email: rowEmail || '',
            name: rowName,
            role: rowRole,
            status: rowStatus
          });
        }
      }
    }

    return createResponse(false, 'ID Pengguna atau password salah');

  } catch(error) {
    Logger.log('Login error: ' + error.toString());
    return createResponse(false, 'Login error: ' + error.toString());
  }
}

/* ==========================================
   USER MANAGEMENT
   ========================================== */

function getAllUsers() {
  try {
    const sheet = getSheet(SHEET_USERS);
    const data = sheet.getDataRange().getValues();
    const users = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[0]) {
        users.push({
          id: row[0],
          userId: row[0],
          name: row[3],
          email: row[1],
          role: row[4],
          status: row[5],
          created: row[6],
          lastLogin: row[7]
        });
      }
    }

    return createResponse(true, 'Senarai pengguna berjaya diambil', users);
  } catch(error) {
    return createResponse(false, error.toString());
  }
}

function getUser(params) {
  try {
    const userId = params.userId;
    const sheet = getSheet(SHEET_USERS);
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] == userId) {
        return createResponse(true, 'Pengguna dijumpai', {
          id: data[i][0],
          userId: data[i][0],
          email: data[i][1],
          name: data[i][3],
          role: data[i][4],
          status: data[i][5]
        });
      }
    }

    return createResponse(false, 'Pengguna tidak dijumpai');
  } catch(error) {
    return createResponse(false, error.toString());
  }
}

function addUser(params) {
  try {
    const sheet = getSheet(SHEET_USERS);
    const data = sheet.getDataRange().getValues();

    let userId = params.userId;
    if (!userId) {
      userId = generateUserId();
      let attempts = 0;
      while (attempts < 10) {
        let exists = false;
        for (let i = 1; i < data.length; i++) {
          if (data[i][0] === userId) {
            exists = true;
            break;
          }
        }
        if (!exists) break;
        userId = generateUserId();
        attempts++;
      }
    }

    const hashedPassword = hashPassword(params.password);

    sheet.appendRow([
      userId,
      params.email || '',
      hashedPassword,
      params.name,
      params.role || 'guru',
      params.status || 'active',
      new Date().toISOString(),
      ''
    ]);

    return createResponse(true, 'Pengguna berjaya ditambah', { userId: userId, name: params.name });
  } catch(error) {
    return createResponse(false, error.toString());
  }
}

function updateUser(params) {
  try {
    const userId = params.userId;
    const sheet = getSheet(SHEET_USERS);
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] == userId) {
        const row = i + 1;
        if (params.name) sheet.getRange(row, 4).setValue(params.name);
        if (params.email) sheet.getRange(row, 2).setValue(params.email);
        if (params.role) sheet.getRange(row, 5).setValue(params.role);
        if (params.status) sheet.getRange(row, 6).setValue(params.status);
        if (params.password) {
          sheet.getRange(row, 3).setValue(hashPassword(params.password));
        }

        return createResponse(true, 'Pengguna berjaya dikemaskini');
      }
    }

    return createResponse(false, 'Pengguna tidak dijumpai');
  } catch(error) {
    return createResponse(false, error.toString());
  }
}

function deleteUser(params) {
  try {
    const userId = params.userId;
    const sheet = getSheet(SHEET_USERS);
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] == userId) {
        sheet.deleteRow(i + 1);
        return createResponse(true, 'Pengguna berjaya dihapus');
      }
    }

    return createResponse(false, 'Pengguna tidak dijumpai');
  } catch(error) {
    return createResponse(false, error.toString());
  }
}

/* ==========================================
   ATTENDANCE
   ========================================== */

function handleCheckIn(params) {
  try {
    const userId = params.userId;
    const lat = parseFloat(params.latitude || params.lat);
    const lng = parseFloat(params.longitude || params.lng);

    Logger.log('CheckIn - userId: ' + userId + ', lat: ' + lat + ', lng: ' + lng);

    if (!userId || !lat || !lng || isNaN(lat) || isNaN(lng)) {
      return createResponse(false, 'Data tidak lengkap');
    }

    // Get user info
    const userSheet = getSheet(SHEET_USERS);
    const userData = userSheet.getDataRange().getValues();
    let userName = 'Unknown';
    let email = '';

    for (let i = 1; i < userData.length; i++) {
      if (userData[i][0] === userId) {
        userName = userData[i][3];
        email = userData[i][1];
        break;
      }
    }

    // Verify location
    const locationCheck = verifyLocation(lat, lng);
    if (!locationCheck.valid) {
      return createResponse(false, `Anda berada ${locationCheck.distance}m dari MRSM. Sila berada dalam radius ${locationCheck.maxDistance}m`);
    }

    const sheet = getSheet(SHEET_ATTENDANCE);
    const today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
    const data = sheet.getDataRange().getValues();

    // Check if already checked in
    for (let i = 1; i < data.length; i++) {
      if (data[i][1] === userId && data[i][4] === today) {
        return createResponse(false, 'Anda sudah check-in hari ini');
      }
    }

    const now = new Date();
    const timeString = Utilities.formatDate(now, Session.getScriptTimeZone(), 'HH:mm:ss');
    const status = calculateStatus(timeString);

    sheet.appendRow([
      generateId(),
      userId,
      userName,
      email,
      today,
      timeString,
      '',
      lat,
      lng,
      '',
      '',
      '',
      status,
      'Check-in: ' + locationCheck.distance + 'm'
    ]);

    Logger.log('Check-in successful');

    return createResponse(true, 'Check-in berjaya', {
      checkInTime: timeString,
      distance: locationCheck.distance,
      status: status,
      date: today,
      userName: userName,
      email: email
    });

  } catch(error) {
    Logger.log('CheckIn error: ' + error.toString());
    return createResponse(false, 'Error check-in: ' + error.toString());
  }
}

function handleCheckOut(params) {
  try {
    const userId = params.userId;
    const lat = parseFloat(params.latitude || params.lat);
    const lng = parseFloat(params.longitude || params.lng);

    if (!userId || !lat || !lng) {
      return createResponse(false, 'Data tidak lengkap');
    }

    const locationCheck = verifyLocation(lat, lng);
    if (!locationCheck.valid) {
      return createResponse(false, `Anda berada ${locationCheck.distance}m dari MRSM`);
    }

    const sheet = getSheet(SHEET_ATTENDANCE);
    const today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][1] === userId && data[i][4] === today && data[i][6] === '') {
        const now = new Date();
        const timeString = Utilities.formatDate(now, Session.getScriptTimeZone(), 'HH:mm:ss');

        const checkInTime = new Date(today + ' ' + data[i][5]);
        const durationMs = now - checkInTime;
        const hours = Math.floor(durationMs / 3600000);
        const minutes = Math.floor((durationMs % 3600000) / 60000);
        const duration = hours + 'h ' + minutes + 'm';

        sheet.getRange(i + 1, 7).setValue(timeString);
        sheet.getRange(i + 1, 10).setValue(lat);
        sheet.getRange(i + 1, 11).setValue(lng);
        sheet.getRange(i + 1, 12).setValue(duration);

        return createResponse(true, 'Check-out berjaya', {
          checkOutTime: timeString,
          duration: duration,
          distance: locationCheck.distance,
          checkInTime: data[i][5],
          status: data[i][12],
          date: today
        });
      }
    }

    return createResponse(false, 'Tiada rekod check-in untuk hari ini');

  } catch(error) {
    return createResponse(false, 'Error: ' + error.toString());
  }
}

function getAttendance(params) {
  try {
    const userId = params.userId;
    const sheet = getSheet(SHEET_ATTENDANCE);
    const data = sheet.getDataRange().getValues();
    const records = [];

    for (let i = 1; i < data.length; i++) {
      if (data[i][1] == userId) {
        records.push({
          id: data[i][0],
          userId: data[i][1],
          userName: data[i][2],
          email: data[i][3],
          date: data[i][4],
          checkIn: data[i][5],
          checkInTime: data[i][5],
          checkOut: data[i][6],
          checkOutTime: data[i][6],
          checkInLat: data[i][7],
          checkInLng: data[i][8],
          checkOutLat: data[i][9],
          checkOutLng: data[i][10],
          duration: data[i][11],
          status: data[i][12],
          notes: data[i][13]
        });
      }
    }

    return createResponse(true, 'Rekod berjaya diambil', records);
  } catch(error) {
    return createResponse(false, error.toString());
  }
}

function getUserStats(params) {
  try {
    const userId = params.userId;
    const sheet = getSheet(SHEET_ATTENDANCE);
    const data = sheet.getDataRange().getValues();

    let present = 0, late = 0, absent = 0;

    for (let i = 1; i < data.length; i++) {
      if (data[i][1] == userId) {
        const status = data[i][12];
        if (status == 'Hadir') present++;
        else if (status == 'Lewat') late++;
        else if (status == 'Tidak Hadir') absent++;
      }
    }

    const total = present + late;
    const percentage = total > 0 ? Math.round(((present + late) / (present + late + absent)) * 100) : 0;

    return createResponse(true, 'Statistik berjaya diambil', {
      stats: {
        present: present,
        late: late,
        absent: absent,
        percentage: percentage
      }
    });
  } catch(error) {
    return createResponse(false, error.toString());
  }
}

function getTodayAttendance() {
  try {
    const today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
    const sheet = getSheet(SHEET_ATTENDANCE);
    const data = sheet.getDataRange().getValues();
    const records = [];

    for (let i = 1; i < data.length; i++) {
      if (data[i][4] == today) {
        records.push({
          id: data[i][0],
          userId: data[i][1],
          userName: data[i][2],
          email: data[i][3],
          date: data[i][4],
          checkIn: data[i][5],
          checkOut: data[i][6],
          status: data[i][12]
        });
      }
    }

    return createResponse(true, 'Rekod hari ini berjaya diambil', records);
  } catch(error) {
    return createResponse(false, error.toString());
  }
}

/* ==========================================
   NOTES/CATATAN
   ========================================== */

function submitNote(params) {
  try {
    const userId = params.userId;
    const userName = params.userName;
    const email = params.email;
    const noteType = params.noteType;
    const noteDate = params.noteDate;
    const noteReason = params.noteReason;
    const submittedDate = params.submittedDate;

    if (!userId || !userName || !noteType || !noteDate || !noteReason) {
      return createResponse(false, 'Data tidak lengkap');
    }

    Logger.log('Submitting note for user: ' + userName);

    const sheet = getSheet(SHEET_NOTES);

    sheet.appendRow([
      generateId(),
      userId,
      userName,
      email || '',
      noteType,
      noteDate,
      noteReason,
      submittedDate,
      'Pending',
      '',
      ''
    ]);

    Logger.log('Note submitted successfully');

    return createResponse(true, 'Catatan berjaya dihantar', {
      userId: userId,
      noteType: noteType,
      noteDate: noteDate
    });

  } catch(error) {
    Logger.log('Error in submitNote: ' + error.toString());
    return createResponse(false, 'Error: ' + error.toString());
  }
}

function getAllNotes() {
  try {
    const sheet = getSheet(SHEET_NOTES);
    const data = sheet.getDataRange().getValues();
    const notes = [];

    for (let i = 1; i < data.length; i++) {
      notes.push({
        rowIndex: i + 1, // Row number in sheet (1-indexed)
        id: data[i][0],
        userId: data[i][1],
        userName: data[i][2],
        email: data[i][3],
        noteType: data[i][4],
        noteDate: data[i][5],
        noteReason: data[i][6],
        submittedDate: data[i][7],
        status: data[i][8] || 'pending',
        adminResponse: data[i][9] || '',
        processedDate: data[i][10] || '',
        adminName: data[i][11] || ''
      });
    }

    return createResponse(true, 'Senarai catatan berjaya diambil', notes);

  } catch(error) {
    return createResponse(false, error.toString());
  }
}

function getNotesByUser(params) {
  try {
    const userId = params.userId;

    if (!userId) {
      return createResponse(false, 'User ID diperlukan');
    }

    const sheet = getSheet(SHEET_NOTES);
    const data = sheet.getDataRange().getValues();
    const notes = [];

    for (let i = 1; i < data.length; i++) {
      if (data[i][1] === userId) {
        notes.push({
          rowIndex: i + 1, // Row number in sheet (1-indexed)
          id: data[i][0],
          userId: data[i][1],
          userName: data[i][2],
          email: data[i][3],
          noteType: data[i][4],
          noteDate: data[i][5],
          noteReason: data[i][6],
          submittedDate: data[i][7],
          status: data[i][8] || 'pending',
          adminResponse: data[i][9] || '',
          processedDate: data[i][10] || '',
          adminName: data[i][11] || ''
        });
      }
    }

    return createResponse(true, 'Catatan pengguna berjaya diambil', notes);

  } catch(error) {
    return createResponse(false, error.toString());
  }
}

function updateNoteStatus(params) {
  try {
    const rowIndex = parseInt(params.rowIndex);
    const status = params.status;
    const adminResponse = params.adminResponse || '';
    const adminName = params.adminName || 'Admin';
    const processedDate = params.processedDate || new Date().toISOString();

    if (!rowIndex || !status) {
      return createResponse(false, 'Data tidak lengkap');
    }

    if (status !== 'approved' && status !== 'rejected') {
      return createResponse(false, 'Status tidak sah. Gunakan "approved" atau "rejected"');
    }

    Logger.log('Updating note status: ' + rowIndex + ' to ' + status);

    const sheet = getSheet(SHEET_NOTES);
    const data = sheet.getDataRange().getValues();

    // Find the note by rowIndex (row number in sheet)
    if (rowIndex < 2 || rowIndex > data.length) {
      return createResponse(false, 'Catatan tidak dijumpai');
    }

    // Update columns (I=9, J=10, K=11)
    sheet.getRange(rowIndex, 9).setValue(status); // Status
    sheet.getRange(rowIndex, 10).setValue(adminResponse); // Admin Response
    sheet.getRange(rowIndex, 11).setValue(processedDate); // Processed Date
    sheet.getRange(rowIndex, 12).setValue(adminName); // Admin Name

    Logger.log('Note status updated successfully');

    return createResponse(true, 'Status catatan berjaya dikemas kini', {
      rowIndex: rowIndex,
      status: status,
      adminResponse: adminResponse
    });

  } catch(error) {
    Logger.log('Error in updateNoteStatus: ' + error.toString());
    return createResponse(false, 'Error: ' + error.toString());
  }
}

/* ==========================================
   SETTINGS
   ========================================== */

function getSettings() {
  try {
    const sheet = getSheet(SHEET_SETTINGS);
    const data = sheet.getDataRange().getValues();
    const settings = {};

    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) {
        settings[data[i][0]] = data[i][1];
      }
    }

    return createResponse(true, 'Settings berjaya diambil', {
      settings: {
        pusatLocation: {
          lat: parseFloat(settings.pusatLat) || MRSM_LAT,
          lng: parseFloat(settings.pusatLng) || MRSM_LNG,
          name: 'MRSM Matra'
        },
        radius: parseInt(settings.radius) || ALLOWED_RADIUS,
        checkInTime: settings.checkInTime || '08:00',
        lateThreshold: parseInt(settings.lateThreshold) || 15
      }
    });
  } catch(error) {
    return createResponse(false, error.toString());
  }
}

function updateSettings(params) {
  try {
    const sheet = getSheet(SHEET_SETTINGS);
    const data = sheet.getDataRange().getValues();

    for (let key in params) {
      let found = false;
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] == key) {
          sheet.getRange(i + 1, 2).setValue(params[key]);
          found = true;
          break;
        }
      }
      if (!found) {
        sheet.appendRow([key, params[key], '']);
      }
    }

    return createResponse(true, 'Settings dikemaskini');
  } catch(error) {
    return createResponse(false, error.toString());
  }
}

/* ==========================================
   HELPER - Status Calculation
   ========================================== */

function calculateStatus(checkInTime) {
  try {
    const time = checkInTime.split(':');
    const hours = parseInt(time[0]);
    const minutes = parseInt(time[1]);
    const checkInMinutes = hours * 60 + minutes;
    const officialTime = 8 * 60;
    const lateThreshold = 15;

    return (checkInMinutes <= officialTime + lateThreshold) ? 'Hadir' : 'Lewat';
  } catch(error) {
    return 'Hadir';
  }
}

/* ==========================================
   END OF CODE
   ========================================== */
