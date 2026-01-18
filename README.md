# Sistem Kehadiran Tahfiz

Sistem kehadiran berasaskan geolocation untuk memantau kehadiran guru dan kakitangan di Pusat Tahfiz menggunakan GPS tracking dan Google Maps.

## Ciri-ciri Utama

### Untuk Pengguna/Guru:
- Check-in dan check-out dengan validasi GPS
- Paparan peta lokasi real-time
- Sejarah kehadiran bulanan
- Statistik kehadiran peribadi
- Validasi radius 200m dari Pusat Islam

### Untuk Admin:
- Pengurusan pengguna (tambah, edit, hapus)
- Dashboard kehadiran real-time
- Laporan kehadiran bulanan
- Export data ke Excel
- Tetapan sistem (lokasi, radius, waktu)

## Teknologi

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Google Apps Script
- **Database**: Google Sheets
- **Maps**: Google Maps API
- **Geolocation**: HTML5 Geolocation API

## Setup & Konfigurasi

### 1. Google Sheets Setup

Google Sheets anda mesti mempunyai struktur berikut:

**Sheet: Users**
- Columns: `id`, `name`, `email`, `password`, `role`, `status`

**Sheet: Attendance**
- Columns: `id`, `userId`, `userName`, `date`, `checkInTime`, `checkInLat`, `checkInLng`, `checkOutTime`, `checkOutLat`, `checkOutLng`, `status`, `distance`

**Sheet: Settings**
- Columns: `key`, `value`
- Settings untuk: `pusatLat`, `pusatLng`, `radius`, `checkInTime`, `lateThreshold`

### 2. Google Apps Script Setup

1. Buka Google Sheets anda
2. Pergi ke **Extensions > Apps Script**
3. Salin kod dari Apps Script yang disediakan
4. Deploy sebagai **Web App**:
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Salin **Web App URL** yang diberikan

### 3. Konfigurasi Projek

Edit fail `js/config.js`:

```javascript
// Google Apps Script Web App URL
APPS_SCRIPT_URL: 'YOUR_APPS_SCRIPT_URL_HERE',

// Google Sheets ID
SPREADSHEET_ID: 'YOUR_SPREADSHEET_ID_HERE',

// Google Maps API Key
GOOGLE_MAPS_API_KEY: 'YOUR_GOOGLE_MAPS_API_KEY_HERE',

// Lokasi Pusat Islam (Latitude, Longitude)
PUSAT_LOCATION: {
    lat: 3.1390,  // Ganti dengan koordinat sebenar
    lng: 101.6869,
    name: 'Pusat Islam Al-Hidayah'
},

// Radius yang dibenarkan (meter)
ALLOWED_RADIUS: 200,
```

### 4. Google Maps API Key

1. Pergi ke [Google Cloud Console](https://console.cloud.google.com/)
2. Buat project baru atau pilih project sedia ada
3. Enable **Maps JavaScript API**
4. Buat **API Key** di **Credentials**
5. Salin API key dan masukkan dalam:
   - `js/config.js`
   - `pages/user-dashboard.html` (line 198)

### 5. Mendapatkan Koordinat Lokasi

Untuk mendapatkan koordinat Pusat Islam anda:

1. Buka [Google Maps](https://maps.google.com)
2. Cari lokasi Pusat Islam anda
3. Klik kanan pada lokasi
4. Klik **Coordinates** (atau lihat di URL)
5. Salin latitude dan longitude ke `js/config.js`

## Struktur Fail

```
tahfiz-attendance-system/
├── index.html                    # Login page
├── pages/
│   ├── user-dashboard.html       # User dashboard
│   ├── user-history.html         # Attendance history
│   └── admin-dashboard.html      # Admin dashboard
├── js/
│   ├── config.js                 # Configuration
│   ├── auth.js                   # Authentication
│   ├── google-sheets.js          # Google Sheets API
│   ├── geolocation.js           # GPS tracking
│   ├── google-maps.js           # Google Maps
│   ├── app.js                   # User dashboard logic
│   └── admin.js                 # Admin dashboard logic
├── css/
│   ├── style.css                # Main styles
│   └── responsive.css           # Responsive design
└── assets/
    └── images/                   # Images folder
```

## Penggunaan

### Login

**Demo Credentials:**
- **Guru**: `guru@tahfiz.com` / `guru123`
- **Admin**: `admin@tahfiz.com` / `admin123`

### Check-in / Check-out

1. Pastikan browser anda membenarkan akses lokasi
2. Pergi ke User Dashboard
3. Pastikan anda berada dalam radius 200m dari Pusat Islam
4. Klik butang **Check In** untuk rekod kehadiran
5. Klik **Check Out** apabila selesai

### Admin Dashboard

1. Login sebagai admin
2. Urus pengguna di bahagian **Pengurusan Pengguna**
3. Pantau kehadiran hari ini
4. Export laporan bulanan
5. Update tetapan sistem

## Google Apps Script Backend

Backend API perlu handle endpoints berikut:

- `login` - Authentication
- `getUser` - Get user data
- `getAllUsers` - Get all users (admin)
- `addUser` - Add new user (admin)
- `updateUser` - Update user (admin)
- `deleteUser` - Delete user (admin)
- `checkIn` - Record check-in
- `checkOut` - Record check-out
- `getAttendance` - Get attendance history
- `getUserStats` - Get user statistics
- `getTodayAttendance` - Get today's attendance (admin)
- `exportReport` - Export monthly report
- `getSettings` - Get system settings
- `updateSettings` - Update settings (admin)

## Keperluan Browser

- Chrome 90+ (Recommended)
- Firefox 88+
- Safari 14+
- Edge 90+

**Penting**: Sistem ini memerlukan HTTPS untuk geolocation berfungsi dengan betul.

## Troubleshooting

### Geolocation tidak berfungsi
- Pastikan browser membenarkan akses lokasi
- Pastikan website menggunakan HTTPS
- Pastikan GPS device anda aktif

### Google Maps tidak keluar
- Semak Google Maps API key anda valid
- Pastikan Maps JavaScript API enabled
- Semak console untuk error messages

### Login gagal
- Semak Apps Script URL dalam `config.js`
- Pastikan Apps Script deployed dengan betul
- Semak credentials dalam Google Sheets

## Links Penting

- **Google Sheets**: https://docs.google.com/spreadsheets/d/1VkJxBkwrPIZXjUmzvtSwRq7XPYRbU2cTYquB-gJl6qw/edit
- **Apps Script URL**: https://script.google.com/macros/s/AKfycbzJH-uNLjl3s_0QU-SUBBZbUqPlLLUwEn0ISD8QFMe7cRyK2vD7gywla4NQkRiecA5A/exec
- **Google Drive Folder**: https://drive.google.com/drive/folders/1S0T7jV8lIvm1uLBnVk2WqM4BwSMIay_1

## Sokongan

Untuk bantuan atau pertanyaan, sila hubungi admin sistem.

## License

Projek ini dibina untuk kegunaan dalaman Pusat Tahfiz sahaja.
