# Admin Notes Management Feature
**Sistem Kehadiran MRSM Matra**

## Overview

The Admin Notes Management feature allows administrators to view, filter, and manage all notes submitted by users (guru) regarding lateness or absence. Admins can approve or reject notes with optional responses.

---

## Features

### 1. **View All Notes**
- Display all notes submitted by users in a table format
- Show key information: User ID, Name, Note Type, Date, Reason, Status, Submitted Date
- Real-time statistics: Pending, Approved, Rejected, Total

### 2. **Filter Notes**
- **By Type**: Lewat, Tidak Hadir, Cuti, Lain-lain
- **By Status**: Pending, Approved, Rejected
- **By Date Range**: From date → To date

### 3. **Note Details Modal**
- View complete note information
- See user details (ID, Name, Email)
- Read full reason/explanation
- View current status and submitted date

### 4. **Approve/Reject Notes**
- Approve or reject pending notes
- Add optional admin response/comment
- Track who processed the note and when
- Once processed, notes cannot be modified

---

## User Interface

### Catatan Tab Location
**Admin Dashboard → Catatan Tab (3rd tab)**

```
📊 Overview | 📋 Kehadiran | 📝 Catatan | 👥 Pengguna | 📈 Laporan
```

### Statistics Cards
```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│   Pending    │   Approved   │   Rejected   │    Jumlah    │
│      5       │      12      │      3       │      20      │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

### Filter Bar
```
[Semua Jenis ▼] [Semua Status ▼] [Dari Tarikh] [Hingga Tarikh] [Tapis]
```

### Notes Table
| User ID | Nama | Jenis | Tarikh | Alasan | Status | Dihantar | Tindakan |
|---------|------|-------|--------|--------|--------|----------|----------|
| 100001 | Guru Contoh | Lewat | 2026-01-20 | Kereta rosak... | Pending | 20/01 08:45 | [Lihat] |

---

## Admin Workflow

### Step 1: Access Notes
1. Login as admin (ID: 999999)
2. Navigate to **Admin Dashboard**
3. Click **Catatan** tab
4. System loads all notes automatically

### Step 2: Filter Notes (Optional)
1. Select filters:
   - **Type**: Choose note type or leave as "Semua Jenis"
   - **Status**: Choose status or leave as "Semua Status"
   - **Date Range**: Enter start/end dates
2. Click **[Tapis]** button
3. Table updates with filtered results

### Step 3: View Note Details
1. Click **[Lihat]** button on any note row
2. Modal opens showing:
   - User information
   - Complete reason/explanation
   - Current status
   - Submission timestamp

### Step 4: Process Note (Approve/Reject)
1. In the note detail modal:
   - Read the complete reason
   - (Optional) Enter admin response in text area
   - Click **✓ Approve** or **✗ Reject**
2. Confirm action in popup dialog
3. System updates note status
4. Modal closes and table refreshes

### Step 5: Refresh Data
- Click **[Refresh]** button to reload all notes
- Useful after processing multiple notes

---

## Note Status Lifecycle

```
User submits note
       ↓
  Status: Pending (default)
       ↓
Admin reviews and processes
       ↓
   ┌─────────┴─────────┐
   ↓                   ↓
Approved          Rejected
(Green badge)     (Red badge)
   ↓                   ↓
Cannot be modified anymore
```

---

## API Reference

### 1. Get All Notes
**Endpoint**: `?action=getAllNotes`

**Response**:
```json
{
  "success": true,
  "message": "Senarai catatan berjaya diambil",
  "data": [
    {
      "rowIndex": 2,
      "id": "NOTE001",
      "userId": "100001",
      "userName": "Guru Contoh",
      "email": "guru@mrsmatra.edu.my",
      "noteType": "Lewat",
      "noteDate": "2026-01-20",
      "noteReason": "Kereta rosak di highway",
      "submittedDate": "2026-01-20T08:45:00.000Z",
      "status": "pending",
      "adminResponse": "",
      "processedDate": "",
      "adminName": ""
    }
  ]
}
```

### 2. Update Note Status
**Endpoint**: `?action=updateNoteStatus`

**Parameters**:
- `rowIndex`: Row number in Google Sheet (integer)
- `status`: "approved" or "rejected"
- `adminResponse`: Optional admin comment (string)
- `adminName`: Name of admin processing (string)
- `processedDate`: ISO timestamp (auto-generated)

**Example Request**:
```
?action=updateNoteStatus&rowIndex=2&status=approved&adminResponse=Diluluskan&adminName=Administrator
```

**Response**:
```json
{
  "success": true,
  "message": "Status catatan berjaya dikemas kini",
  "data": {
    "rowIndex": 2,
    "status": "approved",
    "adminResponse": "Diluluskan"
  }
}
```

---

## Google Sheets Structure

### Notes Sheet Columns
| Column | Field | Type | Description |
|--------|-------|------|-------------|
| A | ID | String | Auto-generated note ID |
| B | UserID | String | 6-digit user ID |
| C | UserName | String | Full name of user |
| D | Email | String | User email |
| E | NoteType | String | Lewat/Tidak Hadir/Cuti/Lain-lain |
| F | NoteDate | Date | Date the incident occurred |
| G | NoteReason | String | Explanation (10-500 chars) |
| H | SubmittedDate | ISO | When note was submitted |
| I | Status | String | pending/approved/rejected |
| J | AdminResponse | String | Admin's comment |
| K | ProcessedDate | ISO | When admin processed |
| L | AdminName | String | Name of admin who processed |

### Example Data
```
ID       | UserID | UserName     | Email              | NoteType     | NoteDate   | NoteReason        | SubmittedDate        | Status   | AdminResponse | ProcessedDate        | AdminName
---------|--------|--------------|--------------------|--------------|-----------|--------------------|----------------------|----------|---------------|----------------------|-----------
NOTE001  | 100001 | Guru Contoh  | guru@mrsmatra.my   | Lewat        | 2026-01-20| Kereta rosak      | 2026-01-20T08:45:00Z | approved | Diluluskan    | 2026-01-20T09:00:00Z | Admin
NOTE002  | 100002 | Ahmad        | ahmad@mrsmatra.my  | Tidak Hadir  | 2026-01-19| Anak sakit        | 2026-01-19T07:30:00Z | pending  |               |                      |
```

---

## Frontend Code Reference

### Admin.js - Key Functions

#### Load All Notes
```javascript
async function loadAllNotes() {
    const result = await GoogleSheetsAPI.getAllNotes();
    if (result.success) {
        AdminState.notes = result.data || [];
        AdminState.filteredNotes = AdminState.notes;
        displayNotesTable();
        updateNotesStats();
    }
}
```

#### Display Notes Table
```javascript
function displayNotesTable() {
    if (AdminState.filteredNotes.length === 0) {
        DOM.notesTableBody.innerHTML = 'Tiada catatan dijumpai';
        return;
    }

    AdminState.filteredNotes.forEach(note => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${note.userId}</td>
            <td><strong>${note.userName}</strong></td>
            <td>${getTypeBadge(note.noteType)}</td>
            <td>${note.noteDate}</td>
            <td>${note.noteReason}</td>
            <td>${getStatusBadge(note.status)}</td>
            <td>${formatDateTime(note.submittedDate)}</td>
            <td>
                <button onclick="viewNoteDetail(${note.rowIndex})">
                    Lihat
                </button>
            </td>
        `;
        DOM.notesTableBody.appendChild(row);
    });
}
```

#### Update Note Status
```javascript
async function updateNoteStatus(newStatus) {
    const rowIndex = AdminState.selectedNote.rowIndex;
    const adminResponse = DOM.noteAdminResponse.value.trim();

    const result = await GoogleSheetsAPI.updateNoteStatus(
        rowIndex,
        newStatus,
        adminResponse,
        AdminState.currentUser.name
    );

    if (result.success) {
        alert('Catatan berjaya ' + (newStatus === 'approved' ? 'diluluskan' : 'ditolak'));
        closeNoteDetailModal();
        await loadAllNotes();
    }
}
```

### Google-sheets.js - API Client

```javascript
async updateNoteStatus(rowIndex, status, adminResponse, adminName) {
    return await this.makeRequest('updateNoteStatus', {
        rowIndex,
        status,
        adminResponse: adminResponse || '',
        adminName,
        processedDate: new Date().toISOString()
    });
}
```

---

## Backend Code Reference

### FINAL-BACKEND-CODE.gs

#### doGet Handler
```javascript
case 'updateNoteStatus':
    result = updateNoteStatus(params);
    break;
```

#### updateNoteStatus Function
```javascript
function updateNoteStatus(params) {
  try {
    const rowIndex = parseInt(params.rowIndex);
    const status = params.status;
    const adminResponse = params.adminResponse || '';
    const adminName = params.adminName || 'Admin';
    const processedDate = params.processedDate || new Date().toISOString();

    // Validation
    if (!rowIndex || !status) {
      return createResponse(false, 'Data tidak lengkap');
    }

    if (status !== 'approved' && status !== 'rejected') {
      return createResponse(false, 'Status tidak sah');
    }

    const sheet = getSheet(SHEET_NOTES);
    const data = sheet.getDataRange().getValues();

    // Check row exists
    if (rowIndex < 2 || rowIndex > data.length) {
      return createResponse(false, 'Catatan tidak dijumpai');
    }

    // Update Google Sheet
    sheet.getRange(rowIndex, 9).setValue(status);
    sheet.getRange(rowIndex, 10).setValue(adminResponse);
    sheet.getRange(rowIndex, 11).setValue(processedDate);
    sheet.getRange(rowIndex, 12).setValue(adminName);

    return createResponse(true, 'Status catatan berjaya dikemas kini');

  } catch(error) {
    Logger.log('Error: ' + error.toString());
    return createResponse(false, 'Error: ' + error.toString());
  }
}
```

---

## Testing Checklist

### Manual Testing Steps

#### ✅ Test 1: View Notes
- [ ] Login as admin (999999/admin123)
- [ ] Click Catatan tab
- [ ] Verify all notes load
- [ ] Verify statistics cards show correct counts

#### ✅ Test 2: Filter Notes
- [ ] Select "Lewat" type → Verify only Lewat notes shown
- [ ] Select "Pending" status → Verify only pending notes shown
- [ ] Enter date range → Verify notes within range shown
- [ ] Clear filters → Verify all notes shown again

#### ✅ Test 3: View Note Detail
- [ ] Click "Lihat" on any note
- [ ] Verify modal opens
- [ ] Verify all fields populated correctly
- [ ] Verify admin response textarea is editable
- [ ] Close modal → Verify it closes

#### ✅ Test 4: Approve Note
- [ ] Open a pending note
- [ ] Enter admin response: "Diluluskan"
- [ ] Click "✓ Approve"
- [ ] Confirm in popup
- [ ] Verify success message
- [ ] Verify table refreshes
- [ ] Verify status changed to "Approved" (green badge)
- [ ] Open same note again → Verify buttons disabled

#### ✅ Test 5: Reject Note
- [ ] Open a pending note
- [ ] Enter admin response: "Alasan tidak mencukupi"
- [ ] Click "✗ Reject"
- [ ] Confirm in popup
- [ ] Verify success message
- [ ] Verify status changed to "Rejected" (red badge)
- [ ] Verify buttons disabled for processed note

#### ✅ Test 6: Refresh Functionality
- [ ] Click "Refresh" button
- [ ] Verify table reloads
- [ ] Verify statistics update

#### ✅ Test 7: Mobile Responsive
- [ ] Open on mobile device/emulator
- [ ] Verify table scrolls horizontally
- [ ] Verify filters stack vertically
- [ ] Verify modal displays correctly
- [ ] Verify buttons are tappable

---

## User Permissions

| Role | View Notes | Filter Notes | Approve/Reject | Add Notes |
|------|-----------|--------------|----------------|-----------|
| **Admin** | ✅ All notes | ✅ Yes | ✅ Yes | ✅ Yes |
| **Guru** | ✅ Own notes only | ❌ No | ❌ No | ✅ Yes |

---

## Error Handling

### Common Errors

#### 1. "Catatan tidak dijumpai"
- **Cause**: Invalid rowIndex or note deleted
- **Solution**: Refresh the page and try again

#### 2. "Data tidak lengkap"
- **Cause**: Missing rowIndex or status parameter
- **Solution**: Check API request parameters

#### 3. "Status tidak sah"
- **Cause**: Status is not "approved" or "rejected"
- **Solution**: Use valid status values

#### 4. "Ralat: [error message]"
- **Cause**: Backend/Google Sheets error
- **Solution**: Check Apps Script logs, verify sheet structure

---

## Security Considerations

### 1. **Authentication Required**
- Admin dashboard protected by `AuthManager.protectPage('admin')`
- Only users with `role: 'admin'` can access

### 2. **Once Processed, Cannot Modify**
- Approved/rejected notes have disabled buttons
- Backend should also validate status before updating

### 3. **Audit Trail**
- Track who processed each note (adminName)
- Track when processed (processedDate)
- Preserve original submission date

### 4. **Input Validation**
- Backend validates all parameters
- Status must be "approved" or "rejected"
- rowIndex must be valid integer

---

## Future Enhancements

### Potential Features
1. **Bulk Actions**
   - Select multiple notes → Approve/Reject all at once

2. **Email Notifications**
   - Send email to user when note approved/rejected
   - Include admin response in email

3. **Note History**
   - View all notes from a specific user
   - Generate reports on note patterns

4. **Export Notes**
   - Export filtered notes to Excel/CSV
   - Include admin responses

5. **Note Categories**
   - Add more specific categories (Medical, Family, Emergency, etc.)

6. **Attachments**
   - Allow users to upload supporting documents (MC, photos, etc.)

7. **Push Notifications**
   - Real-time alerts for new notes
   - Badge count on Catatan tab

---

## Deployment Steps

### 1. Update Backend
```bash
# Copy FINAL-BACKEND-CODE.gs to Google Apps Script
# Deploy as Web App
# Copy new deployment URL
```

### 2. Update Frontend Config
```javascript
// js/config.js
APPS_SCRIPT_URL: 'https://script.google.com/macros/s/YOUR_NEW_DEPLOYMENT_ID/exec'
```

### 3. Verify Google Sheet
- Check Notes sheet exists
- Verify columns A-L are set up correctly
- Add header row if missing

### 4. Test End-to-End
- Submit note as user
- View and approve as admin
- Verify status updates in Google Sheet

---

## Support & Troubleshooting

### Check Backend Logs
1. Open Google Apps Script Editor
2. Click **Executions** (left sidebar)
3. View recent executions and errors
4. Check Logger.log() outputs

### Verify API Responses
1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Click "Lihat" button
4. Check request/response in Network log

### Common Issues

**Issue**: Notes not loading
- **Fix**: Check API URL in config.js, verify backend deployment

**Issue**: Approve/Reject not working
- **Fix**: Check rowIndex is being sent correctly, verify backend has updateNoteStatus function

**Issue**: Statistics not updating
- **Fix**: Ensure updateNotesStats() is called after loadAllNotes()

---

## Document Information

**Version**: 1.0
**Last Updated**: 2026-01-20
**Author**: Amin Ramli
**System**: Sistem Kehadiran MRSM Matra

**Related Documents**:
- [NOTES-FEATURE.md](./NOTES-FEATURE.md) - User-side notes feature
- [ACCOUNTS-INFO.md](./ACCOUNTS-INFO.md) - Login credentials
- [DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md) - Deployment instructions
