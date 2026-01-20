# 🔐 Sistem Kehadiran MRSM Matra - Akaun Login

## Default Accounts (Pre-configured)

### 👨‍💼 **ADMIN ACCOUNT**
```
User ID:  999999
Password: admin123
Nama:     Administrator
Email:    admin@mrsmatra.edu.my
Role:     admin
Status:   active
```

**Akses:**
- ✅ Admin Dashboard
- ✅ Lihat semua kehadiran
- ✅ Manage users (add/edit/delete)
- ✅ Lihat semua catatan dari user
- ✅ Approve/reject catatan
- ✅ Export reports
- ✅ Update system settings

---

### 👨‍🏫 **GURU ACCOUNT #1**
```
User ID:  100001
Password: guru123
Nama:     Guru Contoh
Email:    guru@mrsmatra.edu.my
Role:     guru
Status:   active
```

**Akses:**
- ✅ User Dashboard
- ✅ Check-in / Check-out (GPS)
- ✅ Lihat kehadiran sendiri
- ✅ Hantar catatan (lewat/tidak hadir)
- ✅ Lihat statistik sendiri
- ✅ Edit profil sendiri

---

### 👨‍🏫 **GURU ACCOUNT #2** (Sample)
```
User ID:  100002
Password: guru123
Nama:     Ahmad bin Abdullah
Email:    ahmad@mrsmatra.edu.my
Role:     guru
Status:   active
```

**Akses:** Same as Guru Account #1

---

## 🔢 User ID Format

### **ID Ranges:**
| Range | Purpose | Example |
|-------|---------|---------|
| **999999** | Admin (Fixed) | 999999 |
| **100000-199999** | Teachers (Guru) | 100001, 100002, 100003 |
| **200000-299999** | Staff (Reserved) | 200001, 200002 |
| **300000-899999** | Reserved for future use | - |
| **900000-999998** | System/Test accounts | 900001 |

---

## 🔑 Login Methods

### **Method 1: 6-Digit ID (NEW - Recommended)**
```
Login Page:
- ID Pengguna: 999999
- Password: admin123
```

### **Method 2: Email (Backward Compatible)**
```
Login Page (if using old system):
- Email: admin@mrsmatra.edu.my
- Password: admin123
```

**Note:** Backend support both methods untuk backward compatibility.

---

## 📝 Password Rules

### **Current System:**
- ❌ No special requirements (for demo)
- Minimum length: Any (for now)
- Simple passwords allowed: `admin123`, `guru123`

### **Production Recommendations:**
- ✅ Minimum 8 characters
- ✅ Mix of uppercase and lowercase
- ✅ At least 1 number
- ✅ Change default passwords immediately

---

## 🔐 Password Hashing

Passwords are hashed using **SHA-256** with salt:

```javascript
function hashPassword(password) {
  return Utilities.base64Encode(
    Utilities.computeDigest(
      Utilities.DigestAlgorithm.SHA_256,
      password + 'MRSM_MATRA_2026'
    )
  );
}
```

**Salt:** `MRSM_MATRA_2026`

---

## 🆕 Adding New Users

### **Via Admin Dashboard:**
```
1. Login as admin (999999)
2. Go to Users tab
3. Click "Tambah Pengguna"
4. Fill in:
   - User ID: (optional - auto-generate jika kosong)
   - Name: Full name
   - Email: user@mrsmatra.edu.my
   - Password: Set password
   - Role: guru / admin
5. Click "Simpan"
```

### **Via Google Sheet (Manual):**
```
Sheet: Users
Add new row:
| UserID | Email | Password (hashed) | Name | Role | Status | Created | LastLogin |
| 100003 | user@... | [hash] | Name | guru | active | [ISO date] | |
```

**Important:** Password MUST be hashed using the `hashPassword()` function!

---

## 🔄 Changing Passwords

### **User Change Own Password:**
```
1. Login
2. Click Profile icon
3. Click "Edit Profil"
4. Enter new password (min 6 chars)
5. Confirm new password
6. Click "Simpan"
```

### **Admin Change User Password:**
```
1. Login as admin
2. Go to Users tab
3. Select user
4. Click "Edit"
5. Enter new password
6. Click "Simpan"
```

### **Manual via Google Sheet:**
```
1. Open Users sheet
2. Find user row
3. Replace password with new hash
4. Use hashPassword() function to generate hash
```

---

## 🔓 Password Reset Process

### **If User Forgot Password:**

**Option 1: Contact Admin**
```
User → Contact admin@mrsmatra.edu.my
Admin → Reset password via dashboard
Admin → Send new temporary password
User → Login and change password
```

**Option 2: Manual Reset**
```
Admin → Open Google Sheet
Admin → Find user in Users sheet
Admin → Replace password with hash of "temp123"
Admin → Inform user to login with temp123
User → Change password after login
```

---

## 🧪 Test Accounts

All test accounts use same password: `guru123`

| User ID | Name | Role | Email |
|---------|------|------|-------|
| 999999 | Administrator | admin | admin@mrsmatra.edu.my |
| 100001 | Guru Contoh | guru | guru@mrsmatra.edu.my |
| 100002 | Ahmad bin Abdullah | guru | ahmad@mrsmatra.edu.my |

---

## 🔒 Security Best Practices

### **For Production:**

1. **Change Default Passwords**
   ```
   ❌ admin123 → ✅ Strong_P@ssw0rd!2026
   ❌ guru123  → ✅ Secure_Teacher#123
   ```

2. **Update Salt**
   ```javascript
   // Change this in backend:
   password + 'MRSM_MATRA_2026'
   // To something unique:
   password + 'YOUR_UNIQUE_SALT_HERE_XYZ123'
   ```

3. **Limit Login Attempts**
   - Add rate limiting
   - Lock account after 5 failed attempts
   - Send notification to admin

4. **Enable HTTPS Only**
   - Google Apps Script already uses HTTPS
   - ✅ Already secure

5. **Regular Password Changes**
   - Force password change every 90 days
   - Don't allow reuse of last 5 passwords

6. **Monitor Login Activity**
   - Log all login attempts
   - Alert on suspicious activity
   - Track LastLogin timestamp

---

## 📊 User Status

| Status | Description | Can Login? |
|--------|-------------|------------|
| **active** | Normal user | ✅ Yes |
| **inactive** | Temporarily disabled | ❌ No |
| **suspended** | Suspended by admin | ❌ No |
| **archived** | Old/removed user | ❌ No |

---

## 🆘 Troubleshooting

### **Login Failed - "ID Pengguna atau password salah"**

**Check:**
1. User ID correct? (exactly 6 digits)
2. Password correct? (case-sensitive)
3. User status = 'active'?
4. Check Google Sheet Users tab
5. Check backend logs (Apps Script → Executions)

**Solutions:**
```javascript
// Check user exists:
?action=getUser&userId=100001

// Check password hash:
Open Users sheet → Column C (Password)
```

### **Login Works But No Access**

**Check:**
1. Role field = 'guru' or 'admin'?
2. Status = 'active'?
3. Clear browser cache and cookies
4. Try incognito/private mode

---

## 📋 Quick Reference Card

```
╔════════════════════════════════════════╗
║   SISTEM KEHADIRAN MRSM MATRA          ║
╠════════════════════════════════════════╣
║                                        ║
║   👨‍💼 ADMIN:                            ║
║   ID: 999999                           ║
║   PW: admin123                         ║
║                                        ║
║   👨‍🏫 GURU:                             ║
║   ID: 100001                           ║
║   PW: guru123                          ║
║                                        ║
║   🌐 URL:                               ║
║   https://aminramli.github.io/         ║
║   tahfiz-attendance-system/            ║
║                                        ║
║   📞 Support:                           ║
║   admin@mrsmatra.edu.my                ║
║                                        ║
╚════════════════════════════════════════╝
```

---

## 🔄 Account Lifecycle

```
Create Account
    ↓
Set Password (hashed)
    ↓
Status: active
    ↓
User Login
    ↓
Update LastLogin timestamp
    ↓
[Use System]
    ↓
Password Change (optional)
    ↓
Logout
    ↓
[If needed: suspend/archive]
```

---

## ✅ Checklist: First Time Setup

### **Admin Must Do:**

- [ ] Login with default admin account (999999/admin123)
- [ ] Change admin password immediately
- [ ] Update admin email
- [ ] Test user login (100001/guru123)
- [ ] Add real teacher accounts
- [ ] Delete or disable demo accounts
- [ ] Update system settings (GPS coordinates)
- [ ] Test check-in/check-out functionality
- [ ] Test notes submission
- [ ] Backup Google Sheet

### **Each User Must Do:**

- [ ] Login with temporary password
- [ ] Change password (Profile → Edit Profil)
- [ ] Update profile information
- [ ] Test check-in (must be within GPS radius)
- [ ] Test check-out
- [ ] Test submit note (if late/absent)

---

**Document Version:** 1.0
**Last Updated:** 2026-01-20
**Maintained By:** Amin Ramli untuk MRSM Matra
