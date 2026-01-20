# Update: Sistem Login Dengan 6 Digit ID

## Ringkasan Perubahan

Sistem telah dikemaskini dari login menggunakan email kepada **6 digit nombor ID** untuk MRSM Matra.

---

## ✅ Perubahan Utama

### 1. **Login Page**
- ❌ Buang field "Email"
- ✅ Tambah field "ID Pengguna (6 Digit)"
- ✅ Input auto-format: hanya terima nombor, max 6 digit
- ✅ Validation: mesti 6 digit nombor sahaja
- ✅ Tambah footer kredit: "Disediakan oleh Amin Ramli untuk MRSM Matra"

### 2. **User Structure**
**Lama (Email-based):**
```
Email: admin@tahfiz.com
Password: admin123
```

**Baru (ID-based):**
```
User ID: 999999 (6 digit)
Password: admin123
```

### 3. **Default Accounts**

| Role | User ID | Password | Nama |
|------|---------|----------|------|
| Admin | `999999` | `admin123` | Administrator |
| Guru | `100001` | `guru123` | Guru Contoh |
| Guru | `100002` | `guru123` | Ahmad bin Abdullah |

---

## 📁 File Yang Diubah

### Frontend

#### 1. [index.html](index.html)
```html
<!-- SEBELUM -->
<label for="email">Email / ID Pengguna</label>
<input type="text" id="email" ...>

<!-- SELEPAS -->
<label for="userId">ID Pengguna (6 Digit)</label>
<input
  type="text"
  id="userId"
  maxlength="6"
  pattern="[0-9]{6}"
  inputmode="numeric"
  placeholder="Contoh: 123456"
>
```

**Tambahan:**
- Footer kredit Amin Ramli untuk MRSM Matra
- Auto-format input (hanya nombor)
- Helper text: "Masukkan 6 digit nombor ID anda"

#### 2. [js/auth.js](js/auth.js)
**Fungsi `login()`:**
- Support both `userId` (6 digit) dan `email` (backward compatible)
- Auto-detect: jika 6 digit nombor = userId, otherwise = email
- Validation: userId mesti tepat 6 digit

**Auto-format input:**
```javascript
userIdInput.addEventListener('input', function(e) {
    this.value = this.value.replace(/\D/g, ''); // Remove non-numeric
    if (this.value.length > 6) {
        this.value = this.value.slice(0, 6); // Limit to 6 digits
    }
});
```

#### 3. [css/style.css](css/style.css)
**Tambah styling footer:**
```css
.login-page-footer {
    text-align: center;
    margin-top: 30px;
    padding: 20px;
    color: #666;
    font-size: 13px;
}

.login-page-footer strong {
    color: var(--primary-color);
    font-weight: 600;
}
```

---

### Backend (Google Apps Script)

#### 1. [appscript-backup.text](appscript-backup.text)

**Fungsi `handleLogin()`:**
```javascript
function handleLogin(params) {
  const userId = params.userId;  // NEW: Support userId
  const email = params.email;     // OLD: Still support email
  const password = params.password;

  // Check user matches by userId OR email
  const userMatches = (userId && rowUserId === userId) ||
                      (email && rowEmail === email);

  // Return userId in response
  return createResponse(true, 'Login berjaya', {
    id: rowUserId,        // Same as userId
    userId: rowUserId,    // 6 digit ID
    email: rowEmail || '',
    name: rowName,
    role: rowRole,
    status: rowStatus
  });
}
```

**Fungsi `initializeSheet()`:**
```javascript
// Users Sheet Structure
sheet.appendRow(['UserID', 'Email', 'Password', 'Nama', 'Role', 'Status', 'Created', 'LastLogin']);

// Default accounts with 6 digit IDs
sheet.appendRow(['999999', 'admin@mrsmatra.edu.my', ...]);  // Admin
sheet.appendRow(['100001', 'guru@mrsmatra.edu.my', ...]);   // Guru 1
sheet.appendRow(['100002', 'ahmad@mrsmatra.edu.my', ...]);  // Guru 2
```

**Fungsi `generateUserId()`:**
```javascript
function generateUserId() {
  // Generate random 6 digit number (100000 - 999999)
  return String(Math.floor(100000 + Math.random() * 900000));
}
```

**Fungsi `addUser()`:**
- Auto-generate 6 digit userId jika tidak provided
- Validate userId mesti 6 digit
- Check duplicate userId
- Email jadi optional (boleh kosong)

---

## 🗄️ Google Sheets Structure

### Sheet: Users

| Column A | Column B | Column C | Column D | Column E | Column F | Column G | Column H |
|----------|----------|----------|----------|----------|----------|----------|----------|
| **UserID** | **Email** | **Password** | **Nama** | **Role** | **Status** | **Created** | **LastLogin** |
| 999999 | admin@mrsmatra.edu.my | [hashed] | Administrator | admin | Active | 2026-01-20... | |
| 100001 | guru@mrsmatra.edu.my | [hashed] | Guru Contoh | guru | Active | 2026-01-20... | |
| 100002 | ahmad@mrsmatra.edu.my | [hashed] | Ahmad bin Abdullah | guru | Active | 2026-01-20... | |

**Perubahan:**
- ✅ Column A: `ID` → `UserID` (6 digit nombor)
- ✅ Column B: `Email` (now optional, boleh kosong)
- ✅ Email domain: `@mrsmatra.edu.my`

---

## 🚀 Deployment Steps

### 1. Update Google Apps Script Backend

```
1. Buka Google Apps Script Editor
2. Replace semua kod Code.gs dengan kod dari appscript-backup.text
3. Deploy → New deployment
4. Copy URL baru (jika berubah)
5. Update js/config.js jika URL berubah
```

### 2. Update Google Sheet Structure

**Jika sheet sudah ada data lama:**

Option A: **Buat sheet baru** (Recommended)
```
1. Rename sheet "Users" → "Users_OLD"
2. Delete fungsi dalam Apps Script
3. Run initializeSheet() untuk buat sheet baru
4. Migrate data manually dari Users_OLD ke Users
   - Copy UserID dari email (atau generate baru)
   - Paste data ke sheet baru
```

Option B: **Update sheet sedia ada**
```
1. Insert Column A (new)
2. Rename Column A header: "UserID"
3. Generate 6 digit ID untuk setiap user
4. Update admin row: UserID = 999999
5. Update guru row: UserID = 100001, 100002, etc
```

### 3. Test Login

```
1. Clear browser cache dan session storage
2. Pergi ke login page
3. Test dengan ID baru:
   - Admin: 999999 / admin123
   - Guru: 100001 / guru123
4. Verify login berjaya
5. Check data tersimpan dalam Attendance sheet
```

---

## 🔍 Testing Checklist

### Login Page
- [ ] Field "ID Pengguna" hanya terima nombor
- [ ] Input auto-limit kepada 6 digit
- [ ] Cannot input huruf atau simbol
- [ ] Placeholder text clear dan helpful
- [ ] Footer kredit Amin Ramli muncul
- [ ] Demo credentials betul (100001, 999999)

### Login Functionality
- [ ] Login dengan admin ID (999999) berjaya
- [ ] Login dengan guru ID (100001) berjaya
- [ ] Login dengan ID salah → Error message
- [ ] Login dengan password salah → Error message
- [ ] Login dengan ID < 6 digit → Validation error
- [ ] Login dengan ID > 6 digit → Auto-limit to 6
- [ ] "Ingat saya" masih berfungsi

### Backend Response
- [ ] Response mengandungi `userId` field
- [ ] Response mengandungi `id` field (sama dengan userId)
- [ ] Email field boleh kosong
- [ ] Logger.log menunjukkan login attempts

### User Data
- [ ] SessionStorage mengandungi userId
- [ ] LocalStorage (remember me) mengandungi userId
- [ ] Check-in/out guna userId yang betul
- [ ] Attendance records link dengan userId

---

## 🎨 UI/UX Improvements

### Login Page Footer
```
┌────────────────────────────────┐
│                                │
│    [Login Form]                │
│                                │
│    [Demo Credentials]          │
│                                │
│  ──────────────────────────   │
│                                │
│  Disediakan oleh Amin Ramli    │
│  untuk MRSM Matra              │
│                                │
│  © 2026 - Sistem Kehadiran     │
│  MRSM Matra                    │
└────────────────────────────────┘
```

### Input Field UX
- 🔢 Numeric keyboard on mobile (inputmode="numeric")
- ✅ Auto-format: hanya nombor sahaja
- ✅ Visual feedback: max 6 digit
- ✅ Helper text jelas
- ✅ Placeholder contoh: "123456"

---

## 📊 Backward Compatibility

### Email Login Still Supported

Backend masih support login dengan email untuk backward compatibility:

```javascript
// Frontend auto-detect:
const isUserId = /^\d{6}$/.test(input);
const loginParam = isUserId ? 'userId' : 'email';

// Backend check both:
const userMatches = (userId && rowUserId === userId) ||
                    (email && rowEmail === email);
```

**Use cases:**
- Admin boleh login dengan email (jika ada admin panel)
- API integrations yang guna email
- Migration period

---

## 🔐 Security Considerations

1. **Password Hashing:** Kekal sama (SHA-256 with salt)
2. **UserID Generation:** Random 6 digit (100000-999999)
3. **Validation:** Frontend + Backend validation
4. **Session Management:** Unchanged
5. **Remember Me:** Still functional

---

## 📝 Notes for Admins

### Adding New Users

**Melalui Admin Panel:**
```javascript
// Auto-generate userId
{
  name: "Siti Aminah",
  email: "siti@mrsmatra.edu.my",  // Optional
  password: "guru123",
  role: "guru"
}
// System akan auto-generate: userId = 234567

// Manual userId
{
  userId: "100005",  // Specify 6 digit ID
  name: "Ali bin Omar",
  password: "guru123"
}
```

### UserID Ranges (Recommended)

| Range | Purpose |
|-------|---------|
| 999999 | Admin accounts |
| 100000-199999 | Teachers (Guru) |
| 200000-299999 | Staff |
| 300000-899999 | Reserved |
| 900000-999998 | System/Test accounts |

---

## 🐛 Troubleshooting

### Login Gagal

**Problem:** "ID Pengguna atau password salah"

**Check:**
1. UserID dalam Google Sheet betul? (Column A)
2. Password hash correct?
3. Status = "Active"?
4. Backend logs: Apps Script → Executions

### UserID Tidak Muncul

**Problem:** Response tidak ada userId field

**Fix:**
```javascript
// Check backend response structure:
{
  id: "123456",
  userId: "123456",  // Pastikan ada
  name: "...",
  role: "..."
}
```

### Frontend Validation Error

**Problem:** "ID Pengguna mesti 6 digit nombor sahaja"

**Check:**
1. Input value = exactly 6 digits?
2. Pattern regex: /^\d{6}$/
3. Clear sessionStorage dan try lagi

---

## 🎯 Summary

### Key Changes
| Aspect | Before | After |
|--------|--------|-------|
| Login Field | Email | 6 Digit ID |
| Primary Key | Email | UserID |
| Admin Account | admin@tahfiz.com | 999999 |
| Guru Account | guru@tahfiz.com | 100001 |
| Branding | "Tahfiz" | "MRSM Matra" |
| Footer | None | Kredit Amin Ramli |
| Email Requirement | Required | Optional |

### Benefits
- ✅ Simpler login (6 digit easier than email)
- ✅ Numeric keyboard on mobile
- ✅ Faster typing
- ✅ No typo on email domain
- ✅ Professional branding untuk MRSM Matra
- ✅ Clear attribution (Amin Ramli)

---

**Version:** 2.0
**Date:** 2026-01-20
**Developer:** Amin Ramli untuk MRSM Matra
