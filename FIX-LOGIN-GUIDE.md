# 🔧 Panduan Fix Login Issue

## Masalah: Login tidak berfungsi selepas tukar password kepada digit nombor

---

## ✅ SOLUTION 1: Guna Plain Text Password (Paling Mudah)

Backend dah di-update untuk accept **plain text password** untuk kemudahan testing.

### Langkah:

1. **Buka Google Sheet**:
   ```
   https://docs.google.com/spreadsheets/d/1VkJxBkwrPIZXjUmzvtSwRq7XPYRbU2cTYquB-gJl6qw/edit
   ```

2. **Pergi ke sheet "Users"**

3. **Update data (contoh)**:

   | UserID | Email | Password | Name | Role | Status |
   |--------|-------|----------|------|------|--------|
   | 999999 | admin@mrsmatra.edu.my | **123456** | Administrator | admin | Active |
   | 100001 | guru@mrsmatra.edu.my | **654321** | Guru Contoh | guru | Active |

   **PENTING**: Status mesti **"Active"** (huruf besar A)

4. **Deploy FINAL-BACKEND-CODE.gs yang terbaru**:
   - Buka https://script.google.com/home
   - Cari project "Sistem Kehadiran"
   - Copy semua code dari [FINAL-BACKEND-CODE.gs](./FINAL-BACKEND-CODE.gs)
   - Paste replace semua code
   - Klik **Deploy** → **Manage deployments**
   - Edit deployment yang ada → **Version: New version**
   - Klik **Deploy**

5. **Test Login**:
   ```
   https://aminramli.github.io/tahfiz-attendance-system/

   Admin: 999999 / 123456
   Guru:  100001 / 654321
   ```

---

## ✅ SOLUTION 2: Guna Hashed Password (Lebih Selamat)

Untuk production, lebih baik guna hashed password.

### Langkah:

1. **Buka Google Apps Script**:
   ```
   https://script.google.com/home
   ```

2. **Buka project "Sistem Kehadiran"**

3. **Tambah temporary file untuk generate hash**:
   - Klik **+** → **Script**
   - Nama: `PasswordHelper`
   - Copy code dari [PASSWORD-HELPER.gs](./PASSWORD-HELPER.gs)
   - Paste dalam file baru

4. **Edit password yang anda mahu** (line 28 & 34):
   ```javascript
   const adminPassword = '123456';  // <-- TUKAR INI
   const guruPassword = '654321';   // <-- TUKAR INI
   ```

5. **Run function `testPasswordHash`**:
   - Pilih function: **testPasswordHash**
   - Klik **Run** ▶️
   - Authorize jika diminta
   - Klik **View** → **Logs** (Ctrl+Enter)

6. **Copy hash dari logs**:
   ```
   ADMIN:
   Password: 123456
   Hash: XoP9hG7K... (long hash string)

   GURU:
   Password: 654321
   Hash: Ab2D4fH9... (long hash string)
   ```

7. **Update Google Sheet**:
   - Paste hash dalam column **Password**
   - Jangan paste password plain text!

8. **Test Login** dengan password asal (123456, bukan hash)

---

## 🔍 Troubleshooting

### Issue 1: "Email dan password diperlukan"

**Sebab**: Backend tidak receive parameter dengan betul

**Fix**:
- Check [js/config.js](./js/config.js) - URL backend betul ke?
- Check network tab - parameter ada dihantar ke?
- Deploy backend code terbaru

### Issue 2: "ID Pengguna atau password salah"

**Sebab**: Password tidak match atau status bukan "Active"

**Fix**:
- Check Google Sheet column **Status** = "Active" (bukan "active")
- Check password dalam sheet match dengan yang anda masukkan
- Check UserID format betul (6 digit nombor)

### Issue 3: Login success tapi redirect failed

**Sebab**: User data tidak complete atau role salah

**Fix**:
- Check column **Role** = "admin" atau "guru" (lowercase)
- Check semua column ada data (Name, Email, Role, Status)

---

## 📊 Format Google Sheet Yang Betul

### Sheet: Users

**Headers (Row 1)**:
```
UserID | Email | Password | Name | Role | Status | Created | LastLogin
```

**Data Example (Row 2 - Admin)**:
```
999999 | admin@mrsmatra.edu.my | 123456 | Administrator | admin | Active | 2026-01-20 |
```

**Data Example (Row 3 - Guru)**:
```
100001 | guru@mrsmatra.edu.my | 654321 | Guru Contoh | guru | Active | 2026-01-20 |
```

**PENTING**:
- ✅ **Status**: `Active` (huruf besar A)
- ✅ **Role**: `admin` atau `guru` (huruf kecil)
- ✅ **Password**: Plain text atau hash (both ok dengan update terbaru)
- ✅ **UserID**: 6 digit nombor (contoh: 999999, 100001)

---

## 🧪 Test Checklist

Selepas update, test ini:

### ✅ Test 1: Admin Login
- [ ] Buka https://aminramli.github.io/tahfiz-attendance-system/
- [ ] Masukkan ID: `999999`
- [ ] Masukkan Password: (password anda set)
- [ ] Klik "Log Masuk"
- [ ] Check redirect ke admin-dashboard.html
- [ ] Check ada nama "Administrator" di header

### ✅ Test 2: Guru Login
- [ ] Logout dari admin
- [ ] Masukkan ID: `100001`
- [ ] Masukkan Password: (password anda set)
- [ ] Klik "Log Masuk"
- [ ] Check redirect ke user-dashboard.html
- [ ] Check ada nama "Guru Contoh" di header

### ✅ Test 3: Wrong Password
- [ ] Masukkan ID: `999999`
- [ ] Masukkan Password salah: `000000`
- [ ] Klik "Log Masuk"
- [ ] Check muncul error: "ID Pengguna atau password salah"

### ✅ Test 4: Console Check
- [ ] Buka DevTools (F12)
- [ ] Go to Console tab
- [ ] Try login
- [ ] Check ada log "Login response: {success: true, ...}"
- [ ] Check TIDAK ada error

---

## 🔐 Recommended Credentials

Untuk production, guna password yang lebih selamat:

### Option 1: Simple Digit (Testing)
```
Admin: 999999 / 123456
Guru:  100001 / 654321
```

### Option 2: Combination (Better)
```
Admin: 999999 / admin2026
Guru:  100001 / guru2026
```

### Option 3: Strong (Production)
```
Admin: 999999 / Adm!n@MRSM2026
Guru:  100001 / Guru@MRSM2026
```

---

## 📞 Masih Ada Masalah?

Check ini:

1. **Backend Logs**:
   - Apps Script Editor → View → Executions
   - Check error messages
   - Check "Login attempt" logs

2. **Browser Console**:
   - F12 → Console tab
   - Check API response
   - Check error messages

3. **Network Tab**:
   - F12 → Network tab
   - Click login
   - Check request to Apps Script URL
   - Check response data

4. **Google Sheet**:
   - Verify sheet name = "Users" (exactly)
   - Verify columns match expected format
   - Verify data in correct columns

---

## 🚀 Quick Fix Summary

**Jika login masih tidak jalan, buat ini:**

1. Update Google Sheet:
   ```
   Row 2: 999999 | admin@mrsmatra.edu.my | 123456 | Administrator | admin | Active
   Row 3: 100001 | guru@mrsmatra.edu.my | 654321 | Guru Contoh | guru | Active
   ```

2. Deploy backend code terbaru (FINAL-BACKEND-CODE.gs)

3. Test login dengan credentials di atas

4. Check browser console untuk error messages

---

**Updated**: 2026-01-21
**Version**: 2.0 (With plain text password support)
