# Panduan Deployment - Sistem Kehadiran Tahfiz

## Masalah Yang Telah Dibetulkan

### 1. Backend Tidak Menerima Request dari Frontend
**Masalah:** Backend menggunakan `doPost()` tetapi frontend menghantar GET request
**Penyelesaian:** Backend dikemaskini untuk menerima GET request dengan query parameters

### 2. Parameter Koordinat Tidak Match
**Masalah:** Frontend hantar `latitude/longitude` tetapi backend expect `lat/lng`
**Penyelesaian:** Backend sekarang support kedua-dua format

### 3. Data Tidak Dipaparkan Selepas Check-In/Check-Out
**Masalah:** Frontend tidak update display dengan betul
**Penyelesaian:** Tambah immediate update dan reload data selepas check-in/out

---

## Langkah-Langkah Deployment Backend

### 1. Buka Google Apps Script Editor

1. Pergi ke Google Sheet anda di: https://docs.google.com/spreadsheets/d/1VkJxBkwrPIZXjUmzvtSwRq7XPYRbU2cTYquB-gJl6qw/edit
2. Klik **Extensions** → **Apps Script**
3. Anda akan dibawa ke Google Apps Script Editor

### 2. Replace Kod Backend

1. Dalam Apps Script Editor, pilih fail **Code.gs**
2. **DELETE semua kod sedia ada**
3. Buka fail `appscript-backup.text` dalam folder projek ini
4. Copy **SEMUA kod** dari baris 11 hingga baris 718 (dari `const SPREADSHEET_ID` hingga fungsi `getTodayAttendance()`)
5. Paste ke dalam Code.gs

### 3. Update Configuration

Dalam Code.gs yang baru, pastikan nilai-nilai ini betul:

```javascript
// Baris 11-20: Configuration
const SPREADSHEET_ID = '1VkJxBkwrPIZXjUmzvtSwRq7XPYRbU2cTYquB-gJl6qw'; // ✓ Sudah betul
const SHEET_USERS = 'Users';
const SHEET_ATTENDANCE = 'Attendance';
const SHEET_SETTINGS = 'Settings';

// GPS Settings (Koordinat Tahfiz)
const TAHFIZ_LAT = 3.1979163349111825;  // ✓ Koordinat Pusat Islam Al-Hidayah
const TAHFIZ_LNG = 102.47799269609713;  // ✓ Koordinat Pusat Islam Al-Hidayah
const ALLOWED_RADIUS = 200; // 200 meter radius
```

### 4. Deploy Backend

1. Klik **Deploy** → **New deployment**
2. Klik ⚙️ (gear icon) → Pilih **Web app**
3. Isi maklumat deployment:
   - **Description:** "Fix check-in/check-out issues - v2"
   - **Execute as:** Me (your email)
   - **Who has access:** Anyone
4. Klik **Deploy**
5. **PENTING:** Anda akan dapat **Web app URL** baru. URL ini akan berbeza dari yang lama!
   - Format: `https://script.google.com/macros/s/AKfycby.../exec`

### 5. Update Frontend Configuration

**JIKA** anda dapat URL baru dari step 4, kena update `js/config.js`:

1. Buka fail `js/config.js`
2. Update baris 8 dengan URL baru:

```javascript
APPS_SCRIPT_URL: 'https://script.google.com/macros/s/[URL_BARU_ANDA]/exec',
```

### 6. Test Deployment

1. Authorize app jika diminta:
   - Klik **Review Permissions**
   - Pilih akaun Google anda
   - Klik **Advanced** → **Go to [Project Name] (unsafe)**
   - Klik **Allow**

2. Test backend dengan URL ini (ganti dengan URL anda):
```
https://script.google.com/macros/s/[URL_ANDA]/exec?action=getAllUsers
```

Anda patut dapat response JSON seperti ini:
```json
{
  "success": true,
  "message": "Senarai pengguna berjaya diambil",
  "timestamp": "2026-01-19T...",
  "data": [...]
}
```

---

## Test Check-In/Check-Out

### Sebelum Test:
1. Pastikan anda berada dalam radius 200m dari Pusat Islam Al-Hidayah
   - Koordinat: 3.1979163349111825, 102.47799269609713
2. Pastikan browser allow GPS/location access
3. Buka browser Developer Console (F12) untuk lihat logs

### Test Check-In:
1. Login ke sistem
2. Pergi ke User Dashboard
3. Tunggu sehingga status lokasi show "Anda berada di kawasan yang dibenarkan"
4. Klik butang **Check In**
5. Confirm dialog
6. **Check yang betul:**
   - ✓ Alert muncul dengan masa check-in
   - ✓ Masa check-in dipaparkan di "Kehadiran Hari Ini" section
   - ✓ Status badge muncul (Hadir/Lewat)
   - ✓ Butang Check Out enabled
   - ✓ Data muncul di Google Sheet (refresh sheet)

### Test Check-Out:
1. Klik butang **Check Out**
2. Confirm dialog
3. **Check yang betul:**
   - ✓ Alert muncul dengan masa check-out dan durasi
   - ✓ Masa check-out dipaparkan di "Kehadiran Hari Ini" section
   - ✓ Data check-out muncul di Google Sheet (Column G, J, K)

---

## Troubleshooting

### Masalah: "Tiada rekod check-in" walaupun dah check-in

**Sebab:** Data tidak save ke Google Sheet

**Penyelesaian:**
1. Buka Google Apps Script Editor
2. Klik **Executions** (icon clock di sebelah kiri)
3. Lihat ada error atau tidak
4. Jika ada error "Permission denied", kena authorize app semula
5. Lihat **Logs** untuk debug message

### Masalah: Masa check-in/out tidak muncul di UI

**Sebab:** Frontend tidak dapat data dari backend

**Penyelesaian:**
1. Buka Browser Console (F12)
2. Lihat error messages
3. Check network request ke Apps Script URL
4. Pastikan response ada `data.checkInTime` atau `data.checkOutTime`

### Masalah: "Koordinat GPS tidak lengkap"

**Sebab:** Location data tidak dihantar dengan betul

**Penyelesaian:**
1. Check browser console untuk `locationData` object
2. Pastikan ada properties `lat` dan `lng`
3. Pastikan browser allow GPS access

---

## Struktur Google Sheet

Pastikan Google Sheet ada 3 tabs dengan struktur ini:

### Sheet: Users
| Column A | Column B | Column C | Column D | Column E | Column F | Column G | Column H |
|----------|----------|----------|----------|----------|----------|----------|----------|
| ID | Email | Password | Nama | Role | Status | Created | LastLogin |

### Sheet: Attendance
| A | B | C | D | E | F | G | H | I | J | K | L | M | N |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| ID | UserID | UserName | Email | Date | CheckIn | CheckOut | CheckInLat | CheckInLng | CheckOutLat | CheckOutLng | Duration | Status | Notes |

### Sheet: Settings
| Column A | Column B | Column C |
|----------|----------|----------|
| Key | Value | Description |
| tahfiz_lat | 3.1979163349111825 | Latitude Tahfiz |
| tahfiz_lng | 102.47799269609713 | Longitude Tahfiz |
| allowed_radius | 200 | Radius dibenarkan (meter) |

---

## Perubahan Yang Dibuat

### Backend (`appscript-backup.text`)
- ✅ Tukar `doGet()` untuk handle API requests (bukan HTML serving)
- ✅ Support GET requests dengan query parameters
- ✅ `handleCheckIn()` - Support `latitude/longitude` dan `lat/lng`
- ✅ `handleCheckIn()` - Auto-fetch userName dan email dari Users sheet
- ✅ `handleCheckIn()` - Return lengkap data (checkInTime, status, userName, email)
- ✅ `handleCheckOut()` - Support `latitude/longitude` dan `lat/lng`
- ✅ `handleCheckOut()` - Return lengkap data (checkOutTime, duration, checkInTime)
- ✅ Tambah error logging untuk debugging
- ✅ Tambah fungsi `getUser()` dan `getTodayAttendance()`

### Frontend (`js/app.js`)
- ✅ `loadTodayAttendance()` - Support multiple field naming conventions
- ✅ `displayTodayAttendance()` - Better display logic dengan fallback
- ✅ `handleCheckIn()` - Immediate UI update + reload data
- ✅ `handleCheckIn()` - Show check-in time dalam alert
- ✅ `handleCheckOut()` - Immediate UI update + reload data
- ✅ `handleCheckOut()` - Show check-out time dan duration dalam alert
- ✅ `getStatusClass()` - Support Bahasa Melayu status (Hadir/Lewat/Tidak Hadir)
- ✅ Tambah console logging untuk debugging

---

## Next Steps

1. **Deploy backend** mengikut langkah di atas
2. **Test check-in/out** dengan teliti
3. **Monitor logs** di Google Apps Script untuk any issues
4. **Backup data** Google Sheet sebelum testing production

---

## Support

Jika masih ada masalah, check:
1. Browser Console (F12) untuk frontend errors
2. Google Apps Script **Executions** untuk backend errors
3. Network tab untuk API request/response

Semua logs telah ditambah untuk mudahkan debugging.
