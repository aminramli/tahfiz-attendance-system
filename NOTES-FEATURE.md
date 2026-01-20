# Feature: Catatan Lewat/Tidak Hadir

## Ringkasan

User boleh menghantar catatan/alasan kepada admin jika:
- ✅ Lewat check-in (selepas 8:15 pagi)
- ✅ Tidak dapat hadir
- ✅ Permohonan cuti
- ✅ Lain-lain sebab

Admin boleh lihat semua catatan yang dihantar oleh user.

---

## 🎯 Features

### **User Side:**
1. Butang "Hantar Catatan Lewat/Tidak Hadir" pada dashboard
2. Modal form untuk isi catatan
3. Jenis catatan: Lewat / Tidak Hadir / Cuti / Lain-lain
4. Pilih tarikh
5. Alasan/sebab (min 10 aksara, max 500 aksara)
6. Confirmation checkbox
7. Real-time character count

### **Admin Side:**
- Lihat semua catatan dari semua user
- Filter by user, date, type
- Status: Pending / Approved / Rejected
- Respond kepada catatan

---

## 📋 Form Catatan

### **Fields:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Jenis Catatan | Select | ✅ | Lewat / Tidak Hadir / Cuti / Lain-lain |
| Tarikh | Date | ✅ | Valid date |
| Alasan/Sebab | Textarea | ✅ | Min 10 char, Max 500 char |
| Pengesahan | Checkbox | ✅ | Must be checked |

---

## 💾 Google Sheets Structure

### **Sheet: Notes**

| Column | Field Name | Description | Example |
|--------|-----------|-------------|---------|
| A | ID | Unique note ID | ID1705567890123 |
| B | UserID | 6 digit user ID | 100001 |
| C | UserName | User full name | Ahmad bin Ali |
| D | Email | User email | ahmad@mrsmatra.edu.my |
| E | NoteType | Type of note | Lewat / Tidak Hadir / Cuti |
| F | NoteDate | Date for the note | 2026-01-20 |
| G | NoteReason | Reason/explanation | Kereta rosak... |
| H | SubmittedDate | When submitted | 2026-01-20T08:30:00Z |
| I | Status | Admin status | Pending / Approved / Rejected |
| J | AdminResponse | Admin reply | Approved. Get well soon. |
| K | AdminRespondedDate | When admin responded | 2026-01-20T09:00:00Z |

---

## 📁 File Yang Diubah

### **Frontend:**

#### 1. [user-dashboard.html](user-dashboard.html)
**Additions:**
- Butang "Hantar Catatan Lewat/Tidak Hadir"
- Modal form catatan dengan:
  - Select dropdown untuk jenis
  - Date picker
  - Textarea dengan character counter
  - Confirmation checkbox

```html
<!-- Catatan Button -->
<button class="btn btn-warning btn-block" id="submitNoteBtn">
    Hantar Catatan Lewat/Tidak Hadir
</button>

<!-- Note/Catatan Modal -->
<div class="modal" id="noteModal">
    <form id="noteForm">
        <!-- Form fields -->
    </form>
</div>
```

#### 2. [js/app.js](js/app.js)
**New Functions:**
- `openNoteModal()` - Open modal catatan
- `closeNoteModal()` - Close modal
- `updateCharCount()` - Real-time character count
- `handleSubmitNote(e)` - Submit form dengan validation

**Event Listeners:**
- submitNoteBtn click
- noteReason input (char count)
- noteForm submit
- Modal close events

#### 3. [js/google-sheets.js](js/google-sheets.js)
**New API Functions:**
```javascript
async submitNote(noteData)    // Submit catatan ke backend
async getAllNotes()            // Admin get all notes
async getNotesByUser(userId)   // Get notes untuk user tertentu
```

#### 4. [css/style.css](css/style.css)
**New Styling:**
- `textarea.form-control` - Textarea styling dengan resize vertical
- `select.form-control` - Custom select dropdown dengan arrow
- Character count color changes (normal → warning → danger)

---

### **Backend:**

#### 1. [appscript-backup.text](appscript-backup.text)

**New Constants:**
```javascript
const SHEET_NOTES = 'Notes';
```

**New doGet() Actions:**
```javascript
case 'submitNote':
  return submitNote(e.parameter);
case 'getAllNotes':
  return getAllNotes();
case 'getNotesByUser':
  return getNotesByUser(e.parameter);
```

**New Functions:**
```javascript
function submitNote(params)       // Save note ke sheet
function getAllNotes()            // Get all notes (admin)
function getNotesByUser(params)   // Get notes by user ID
```

**initializeSheet() Update:**
- Auto-create "Notes" sheet dengan headers yang betul

---

## 🚀 Deployment

### **Step 1: Update Backend**

```
1. Buka Google Apps Script Editor
2. Replace Code.gs dengan kod dari appscript-backup.text
3. Deploy → New deployment
4. Test API endpoints:
   - submitNote
   - getAllNotes
   - getNotesByUser
```

### **Step 2: Create Notes Sheet** (Auto-created on first run)

Jika mahu create manual:
```
1. Create new sheet: "Notes"
2. Add headers:
   ID | UserID | UserName | Email | NoteType | NoteDate |
   NoteReason | SubmittedDate | Status | AdminResponse | AdminRespondedDate
```

### **Step 3: Test User Flow**

```
1. Login sebagai user (ID: 100001)
2. Klik "Hantar Catatan Lewat/Tidak Hadir"
3. Pilih jenis: "Lewat"
4. Pilih tarikh: Today
5. Tulis alasan: "Kereta rosak, terlepas bas."
6. Check "Saya mengesahkan..."
7. Klik "Hantar Catatan"
8. Check Google Sheet "Notes" tab
```

### **Step 4: Test Admin View** (Coming soon)

Admin dashboard will show all notes in a table with:
- Filter options
- Status management
- Response functionality

---

## 🎨 UI/UX

### **Modal Form Preview:**

```
┌─────────────────────────────────────┐
│  Hantar Catatan Kehadiran        [×]│
├─────────────────────────────────────┤
│                                     │
│  Jenis Catatan                      │
│  [Lewat (Check-in selepas 8:15) ▼] │
│                                     │
│  Tarikh                             │
│  [2026-01-20]                       │
│  Pilih tarikh untuk catatan ini     │
│                                     │
│  Alasan/Sebab                       │
│  ┌─────────────────────────────┐   │
│  │ Kereta rosak pagi tadi.     │   │
│  │ Terpaksa tunggu                │
│  │ tow truck...                │   │
│  └─────────────────────────────┘   │
│  45/500 aksara                      │
│                                     │
│  ☑ Saya mengesahkan maklumat ini    │
│    adalah benar                     │
│                                     │
│  [✓ Hantar Catatan]  [Batal]       │
└─────────────────────────────────────┘
```

### **Character Counter:**
- 0-400 aksara: Gray (#666)
- 401-450 aksara: Orange (#f39c12)
- 451-500 aksara: Red (#e74c3c)

---

## 📊 Note Types

| Type | Description | Use Case |
|------|-------------|----------|
| **Lewat** | Check-in selepas 8:15 pagi | Traffic jam, kereta rosak, urusan penting |
| **Tidak Hadir** | Tidak dapat datang langsung | Sakit, anak sakit, emergency |
| **Cuti** | Permohonan cuti | Annual leave, cuti kecemasan |
| **Lain-lain** | Sebab lain | Medical appointment, court, official duty |

---

## 🔍 Validation Rules

### **Frontend Validation:**
```javascript
// Jenis catatan
if (!noteType) {
    alert('Sila pilih jenis catatan');
    return;
}

// Tarikh
if (!noteDate) {
    alert('Sila pilih tarikh');
    return;
}

// Alasan (minimum 10 aksara)
if (!noteReason || noteReason.length < 10) {
    alert('Alasan terlalu pendek. Minimum 10 aksara.');
    return;
}

// Confirmation checkbox
if (!noteConfirm) {
    alert('Sila sahkan maklumat adalah benar');
    return;
}
```

### **Backend Validation:**
```javascript
// Check required fields
if (!userId || !userName || !noteType || !noteDate || !noteReason) {
  return createResponse(false, 'Data tidak lengkap');
}
```

---

## 🔔 User Experience Flow

```
User Dashboard
    ↓
[Hantar Catatan] Button
    ↓
Modal Opens
    ↓
User Fills Form:
  - Select type
  - Pick date
  - Write reason (min 10 char)
  - Check confirmation
    ↓
Submit Button
    ↓
Validation (Frontend)
    ↓
Confirmation Dialog
    ↓
API Call (submitNote)
    ↓
Backend Validation
    ↓
Save to Google Sheet
    ↓
Success Response
    ↓
Alert: "Catatan berjaya dihantar!"
    ↓
Modal Closes
```

---

## 📱 Admin View (Future Development)

### **Planned Features:**

1. **Notes Table:**
   - Show all notes from all users
   - Sort by date, type, status
   - Filter by user, date range, type

2. **Note Details:**
   - View full reason
   - User information
   - Submitted date/time

3. **Admin Actions:**
   - Approve note
   - Reject note
   - Add response/comment
   - Mark as resolved

4. **Statistics:**
   - Total notes per month
   - Most common reasons
   - Users with most notes
   - Response time metrics

### **Suggested UI:**

```
┌───────────────────────────────────────────────────────┐
│  Catatan Kehadiran                          [Refresh] │
├───────────────────────────────────────────────────────┤
│                                                       │
│  Filter: [All Users ▼] [All Types ▼] [This Month ▼] │
│                                                       │
│  ┌─────────────────────────────────────────────────┐ │
│  │ ID   │ User    │ Type  │ Date       │ Status   │ │
│  ├─────────────────────────────────────────────────┤ │
│  │ 001  │ Ahmad   │ Lewat │ 2026-01-20 │ Pending  │ │
│  │ 002  │ Siti    │ Cuti  │ 2026-01-19 │ Approved │ │
│  │ 003  │ Ali     │ T.Had │ 2026-01-18 │ Rejected │ │
│  └─────────────────────────────────────────────────┘ │
│                                                       │
│  [View Details] [Approve] [Reject]                   │
└───────────────────────────────────────────────────────┘
```

---

## 🧪 Testing

### **Test Case 1: Submit Note (Happy Path)**
```
1. Login as user (100001)
2. Click "Hantar Catatan"
3. Select "Lewat"
4. Pick today's date
5. Write: "Kereta rosak pagi tadi. Terpaksa tunggu tow truck."
6. Check confirmation
7. Click submit
8. Expected: Success message, modal closes
9. Verify: Check Google Sheet Notes tab
```

### **Test Case 2: Validation - Alasan Pendek**
```
1. Open note modal
2. Select type
3. Write only: "sakit"
4. Try submit
5. Expected: Error "Alasan terlalu pendek. Minimum 10 aksara."
```

### **Test Case 3: Validation - No Confirmation**
```
1. Fill all fields correctly
2. Don't check confirmation checkbox
3. Try submit
4. Expected: Error "Sila sahkan maklumat adalah benar"
```

### **Test Case 4: Character Counter**
```
1. Open modal
2. Type in reason field
3. Expected: Counter updates: "45/500 aksara"
4. Type until 451+ characters
5. Expected: Counter turns red
```

---

## 🐛 Troubleshooting

### **Problem: Catatan tidak tersimpan**

**Check:**
1. Browser console untuk errors
2. Network tab - API call success?
3. Google Apps Script Executions - ada error?
4. Sheet "Notes" wujud?

**Solution:**
```javascript
// Check backend logs:
Apps Script → Executions → View logs
Look for: "Submitting note for user: ..."
```

### **Problem: Modal tidak buka**

**Check:**
1. DOM elements loaded?
2. Event listener attached?
3. Console errors?

**Fix:**
```javascript
// Add debug logs
console.log('submitNoteBtn:', DOM.submitNoteBtn);
console.log('noteModal:', DOM.noteModal);
```

### **Problem: Character counter tidak update**

**Check:**
1. charCount element exists?
2. Event listener on noteReason?

**Fix:**
```javascript
if (DOM.noteReason) {
    DOM.noteReason.addEventListener('input', updateCharCount);
}
```

---

## 📚 API Reference

### **submitNote**
**Method:** GET
**Endpoint:** `?action=submitNote`

**Parameters:**
```
userId: string (6 digit)
userName: string
email: string (optional)
noteType: string (Lewat/Tidak Hadir/Cuti/Lain-lain)
noteDate: string (YYYY-MM-DD)
noteReason: string (10-500 chars)
submittedDate: string (ISO 8601)
```

**Response:**
```json
{
  "success": true,
  "message": "Catatan berjaya dihantar",
  "data": {
    "userId": "100001",
    "noteType": "Lewat",
    "noteDate": "2026-01-20"
  }
}
```

### **getAllNotes**
**Method:** GET
**Endpoint:** `?action=getAllNotes`

**Response:**
```json
{
  "success": true,
  "message": "Senarai catatan berjaya diambil",
  "data": [
    {
      "id": "ID...",
      "userId": "100001",
      "userName": "Ahmad",
      "noteType": "Lewat",
      "noteDate": "2026-01-20",
      "noteReason": "...",
      "status": "Pending"
    }
  ]
}
```

### **getNotesByUser**
**Method:** GET
**Endpoint:** `?action=getNotesByUser&userId=100001`

**Response:**
```json
{
  "success": true,
  "message": "Catatan pengguna berjaya diambil",
  "data": [...]
}
```

---

## ✅ Summary

### **Completed:**
- ✅ Note submission modal
- ✅ Form validation
- ✅ Character counter
- ✅ Backend API (submitNote, getAllNotes, getNotesByUser)
- ✅ Google Sheet structure (Notes tab)
- ✅ Frontend-backend integration

### **Pending:**
- ⏳ Admin dashboard view
- ⏳ Admin response functionality
- ⏳ Note status management
- ⏳ Email notifications (optional)

---

**Version:** 1.0
**Date:** 2026-01-20
**Developer:** Amin Ramli untuk MRSM Matra
