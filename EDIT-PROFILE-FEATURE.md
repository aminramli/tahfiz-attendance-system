# Feature: Edit Profil User

## Deskripsi

User yang login kini boleh mengedit profil mereka sendiri, termasuk:
- ✅ Menukar nama
- ✅ Menukar password
- ❌ Email tidak boleh diubah (kekal sebagai unique identifier)

---

## Lokasi Feature

**User Dashboard** → **Icon Profil** (top right) → **Edit Profil**

atau

**Bottom Navigation** → **Profil** → **Edit Profil**

---

## Cara Guna

### 1. Buka Profile Modal
- Klik icon profil di header (top right)
- Atau klik tab "Profil" di bottom navigation

### 2. Klik Butang "Edit Profil"
- Modal akan switch ke mode edit
- Form akan diisi dengan data semasa

### 3. Edit Maklumat
**Nama:**
- Wajib diisi
- Minimum 3 aksara
- Boleh tukar kepada nama baru

**Email:**
- Disabled (tidak boleh edit)
- Digunakan sebagai unique identifier untuk login

**Password Baru (Optional):**
- Kosongkan jika tidak mahu tukar password
- Jika isi, minimum 6 aksara
- Mesti sama dengan "Confirm Password"

### 4. Simpan Perubahan
- Klik butang "Simpan"
- Akan ada confirmation dialog
- Selepas berjaya, data akan update dan modal kembali ke view mode

### 5. Batal Edit
- Klik butang "Batal" untuk cancel tanpa save

---

## Validation Rules

### Nama
- ✅ Wajib diisi
- ✅ Minimum 3 aksara
- ❌ Tidak boleh kosong

### Password (jika mahu tukar)
- ✅ Minimum 6 aksara
- ✅ Mesti sama dengan Confirm Password
- ✅ Boleh dikosongkan (tidak wajib)

### Email
- 🔒 Locked (tidak boleh diubah)
- Digunakan untuk login

---

## File Yang Diubah

### 1. [user-dashboard.html](user-dashboard.html#L163-L224)
- Tambah form edit profil dalam modal
- Toggle antara view mode dan edit mode
- Input fields: nama, email (disabled), password, confirm password

### 2. [js/app.js](js/app.js#L61-L70)
- `initializeDOMReferences()` - Tambah references untuk edit form
- `showEditProfileMode()` - Show form edit dengan data semasa
- `showViewProfileMode()` - Kembali ke view mode
- `handleEditProfile()` - Handle submit form dengan validation
- Setup event listeners untuk butang edit/cancel/submit

### 3. [js/auth.js](js/auth.js#L133-L144)
- `updateUserData()` - Update user data di session/local storage
- Sync dengan remember me functionality

### 4. [js/google-sheets.js](js/google-sheets.js#L47-L52)
- `updateUser()` - API call ke backend untuk update user
- Support update nama dan/atau password

### 5. [css/style.css](css/style.css#L627-L668)
- Form styling (`.form-group`, `.form-control`)
- Input focus states
- Disabled input styling
- Helper text styling

---

## Backend Support

Feature ini menggunakan existing API endpoint:

**Endpoint:** `updateUser`

**Parameters:**
```javascript
{
  userId: "ID123456",
  name: "Nama Baru",      // Required
  password: "newpass123"  // Optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Pengguna berjaya dikemaskini",
  "timestamp": "2026-01-19T..."
}
```

Backend akan:
1. Verify user exists
2. Update nama di Users sheet
3. Hash password baru (jika ada) dan update
4. Return success/error response

---

## User Experience Flow

```
┌─────────────────────┐
│  Profile Modal      │
│  (View Mode)        │
│                     │
│  Nama: Ahmad        │
│  Email: ahmad@...   │
│  Role: Guru         │
│                     │
│  [Edit Profil]      │  ← Klik
│  [Log Keluar]       │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│  Profile Modal      │
│  (Edit Mode)        │
│                     │
│  Nama: [Ahmad___]   │  ← Boleh edit
│  Email: [ahmad@...] │  ← Disabled
│  Password: [_____]  │  ← Optional
│  Confirm: [______]  │
│                     │
│  [Simpan] [Batal]   │
└─────────────────────┘
         │
         ▼ (Submit)
┌─────────────────────┐
│  Validation         │
│  - Check nama       │
│  - Check password   │
│  - Confirmation     │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│  API Call           │
│  updateUser()       │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│  Update Success     │
│  - Update storage   │
│  - Update display   │
│  - Show alert       │
│  - Back to view     │
└─────────────────────┘
```

---

## Security Notes

1. **Password Hashing:** Password di-hash oleh backend sebelum save ke Google Sheet
2. **Email Locked:** Email tidak boleh diubah untuk maintain data integrity
3. **Validation:** Frontend dan backend validation untuk data quality
4. **Session Update:** User data dikemaskini di session storage selepas update

---

## Testing Checklist

### Test 1: Update Nama Sahaja
- [ ] Login sebagai user
- [ ] Buka profile modal
- [ ] Klik "Edit Profil"
- [ ] Tukar nama kepada nama baru
- [ ] Kosongkan password fields
- [ ] Klik "Simpan"
- [ ] Verify: Nama dikemaskini di UI dan storage
- [ ] Refresh page, verify nama kekal

### Test 2: Update Password Sahaja
- [ ] Buka edit mode
- [ ] Biarkan nama unchanged
- [ ] Masukkan password baru (min 6 char)
- [ ] Confirm password sama
- [ ] Simpan
- [ ] Logout dan login dengan password baru
- [ ] Verify: Login berjaya

### Test 3: Update Nama + Password
- [ ] Edit kedua-dua nama dan password
- [ ] Simpan
- [ ] Verify nama updated
- [ ] Logout dan login dengan password baru

### Test 4: Validation Errors
- [ ] Nama kosong → Error
- [ ] Nama < 3 char → Error
- [ ] Password < 6 char → Error
- [ ] Password tidak match confirm → Error
- [ ] Cancel button → Kembali tanpa save

### Test 5: Email Tidak Boleh Edit
- [ ] Verify email field disabled
- [ ] Cannot change email value
- [ ] Email tetap sama selepas save

---

## Error Handling

| Scenario | Error Message |
|----------|---------------|
| Nama kosong | "Nama diperlukan" |
| Nama < 3 aksara | "Nama terlalu pendek. Minimum 3 aksara." |
| Password < 6 aksara | "Password terlalu pendek. Minimum 6 aksara." |
| Password tidak match | "Password dan Confirm Password tidak sama!" |
| API Error | "Ralat mengemaskini profil. Sila cuba lagi." |
| Network Error | "Ralat sambungan. Sila cuba lagi." |

---

## Console Logs (untuk debugging)

Jika ada masalah, check browser console (F12):

```javascript
// Success flow:
Updating profile: {userId: "ID...", name: "...", password: "[HIDDEN]"}
Update profile result: {success: true, message: "..."}
User data updated in storage

// Error flow:
Error updating profile: [Error details]
```

---

## Future Enhancements

Cadangan untuk improvement masa depan:

1. **Profile Picture:** Upload dan display gambar profil
2. **Phone Number:** Tambah field nombor telefon
3. **Change Email:** Allow email change dengan verification
4. **Password Strength Meter:** Visual indicator untuk password strength
5. **Activity Log:** Show history of profile changes
6. **Two-Factor Auth:** Extra security layer

---

## Support

Jika ada masalah dengan edit profil:
1. Check browser console untuk errors
2. Verify user data dalam sessionStorage
3. Check Google Apps Script execution logs
4. Ensure backend `updateUser` function working properly

---

**Version:** 1.0
**Date:** 2026-01-20
**Author:** Claude Code
