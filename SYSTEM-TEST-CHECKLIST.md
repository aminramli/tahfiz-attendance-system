# 🧪 System Test Checklist
**Sistem Kehadiran MRSM Matra**
**Date**: 2026-01-21

## 📋 Pre-Testing Verification

### ✅ 1. Google Sheet Structure

#### Sheet: Users
- [ ] Header: `UserID | Email | Password | Name | Role | Status | Created | LastLogin`
- [ ] Admin row exists: `999999 | admin@mrsmatra.edu.my | 123456 | Administrator | admin | Active | ...`
- [ ] Guru row exists: `100001 | guru@tahfiz.com | 123456 | Ahmad bin Ali | guru | Active | ...`
- [ ] Status = "Active" (capital A)
- [ ] Role = lowercase (admin/guru)

#### Sheet: Attendance
- [ ] Header: `ID | UserID | UserName | Email | Date | CheckIn | CheckOut | CheckInLat | CheckInLng | CheckOutLat | CheckOutLng | Duration | Status | Notes`
- [ ] 14 columns total (A-N)
- [ ] No duplicate check-ins for same user on same day

#### Sheet: Settings
- [ ] Header: `Key | Value | Description`
- [ ] radius = `100` (not 200)
- [ ] pusatLat = `3.1979163349111825`
- [ ] pusatLng = `102.47799269609713`
- [ ] checkInTime = `08:00`
- [ ] lateThreshold = `15`

#### Sheet: Notes
- [ ] Header: `ID | UserID | UserName | Email | NoteType | NoteDate | NoteReason | SubmittedDate | Status | AdminResponse | AdminRespondedDate`
- [ ] Sheet exists and accessible

---

## 🔐 Authentication Tests

### Test 1: Admin Login
**URL**: https://aminramli.github.io/tahfiz-attendance-system/

**Steps**:
1. Open login page
2. Enter User ID: `999999`
3. Enter Password: `123456` (or your set password)
4. Click "Log Masuk"

**Expected Results**:
- ✅ No console errors
- ✅ Success message or redirect
- ✅ Redirects to `admin-dashboard.html`
- ✅ Shows "Administrator" in header
- ✅ Shows admin navigation tabs

**Actual Results**:
- [ ] PASS / [ ] FAIL
- Notes: ___________________________

---

### Test 2: Guru Login
**Steps**:
1. Logout from admin (if logged in)
2. Enter User ID: `100001`
3. Enter Password: `123456` (or your set password)
4. Click "Log Masuk"

**Expected Results**:
- ✅ Redirects to `user-dashboard.html`
- ✅ Shows "Ahmad bin Ali" (or guru name) in header
- ✅ Shows check-in/check-out buttons

**Actual Results**:
- [ ] PASS / [ ] FAIL
- Notes: ___________________________

---

### Test 3: Wrong Password
**Steps**:
1. Enter User ID: `999999`
2. Enter Password: `wrongpass`
3. Click "Log Masuk"

**Expected Results**:
- ✅ Shows error: "ID Pengguna atau password salah"
- ✅ Does NOT redirect
- ✅ User stays on login page

**Actual Results**:
- [ ] PASS / [ ] FAIL
- Notes: ___________________________

---

### Test 4: Invalid User ID
**Steps**:
1. Enter User ID: `000000`
2. Enter Password: `123456`
3. Click "Log Masuk"

**Expected Results**:
- ✅ Shows error: "ID Pengguna atau password salah"

**Actual Results**:
- [ ] PASS / [ ] FAIL
- Notes: ___________________________

---

## 📍 Check-in Tests (Guru Account)

### Test 5: Check-in Success (Within 100m radius)
**Prerequisites**:
- Logged in as guru
- Have NOT checked in today yet
- Location within 100m of MRSM Matra

**Steps**:
1. Click "Check In" button
2. Allow location access
3. Wait for response

**Expected Results**:
- ✅ Success message: "Check-in berjaya"
- ✅ Check-in time displayed (HH:mm:ss)
- ✅ Status shown: "Hadir" (if before 08:15) or "Lewat" (if after 08:15)
- ✅ Distance shown: "< 100m"
- ✅ Check-out button enabled
- ✅ Data saved in Attendance sheet

**Actual Results**:
- [ ] PASS / [ ] FAIL
- Time: ___________
- Status: ___________
- Distance: ___________
- Notes: ___________________________

---

### Test 6: Check-in Outside Radius (> 100m)
**Prerequisites**:
- Location MORE than 100m from MRSM Matra
- OR use fake GPS coordinates

**Steps**:
1. Click "Check In"
2. System detects location

**Expected Results**:
- ✅ Error message: "Anda berada XXXm dari MRSM. Sila berada dalam radius 100m"
- ✅ Check-in NOT recorded
- ✅ No data added to Attendance sheet

**Actual Results**:
- [ ] PASS / [ ] FAIL
- Distance shown: ___________
- Notes: ___________________________

---

### Test 7: Duplicate Check-in (Same Day)
**Prerequisites**:
- Already checked in today

**Steps**:
1. Try to click "Check In" again

**Expected Results**:
- ✅ Error message: "Anda sudah check-in hari ini"
- ✅ No duplicate entry in Attendance sheet

**Actual Results**:
- [ ] PASS / [ ] FAIL
- Notes: ___________________________

---

## 🚪 Check-out Tests

### Test 8: Check-out Success
**Prerequisites**:
- Already checked in today
- Within 100m radius

**Steps**:
1. Click "Check Out" button
2. Allow location access

**Expected Results**:
- ✅ Success message: "Check-out berjaya"
- ✅ Check-out time displayed
- ✅ Duration calculated (e.g., "9h 25m")
- ✅ Google Sheet updated with:
  - CheckOut time
  - CheckOutLat/Lng
  - Duration

**Actual Results**:
- [ ] PASS / [ ] FAIL
- Check-out time: ___________
- Duration: ___________
- Notes: ___________________________

---

### Test 9: Check-out Without Check-in
**Prerequisites**:
- Have NOT checked in today

**Steps**:
1. Try to click "Check Out"

**Expected Results**:
- ✅ Error message: "Tiada rekod check-in untuk hari ini"
- ✅ Button disabled OR shows error

**Actual Results**:
- [ ] PASS / [ ] FAIL
- Notes: ___________________________

---

### Test 10: Check-out Outside Radius
**Prerequisites**:
- Already checked in
- Location MORE than 100m away

**Steps**:
1. Click "Check Out" from outside radius

**Expected Results**:
- ✅ Error message: "Anda berada XXXm dari MRSM"
- ✅ Check-out NOT recorded

**Actual Results**:
- [ ] PASS / [ ] FAIL
- Notes: ___________________________

---

## 📝 Notes Feature Tests (Guru)

### Test 11: Submit Note
**Steps**:
1. Click "Hantar Catatan Lewat/Tidak Hadir"
2. Select type: "Lewat"
3. Select date: Tomorrow's date
4. Enter reason: "Kereta rosak di highway"
5. Check confirmation checkbox
6. Click "Hantar"

**Expected Results**:
- ✅ Success message: "Catatan berjaya dihantar"
- ✅ Modal closes
- ✅ Data saved in Notes sheet:
  - UserID = 100001
  - Status = "Pending"
  - SubmittedDate recorded

**Actual Results**:
- [ ] PASS / [ ] FAIL
- Notes: ___________________________

---

### Test 12: Submit Note - Validation
**Steps**:
1. Open note modal
2. Leave type empty
3. Try to submit

**Expected Results**:
- ✅ Error: "Sila pilih jenis catatan"
- ✅ Form does NOT submit

**Repeat with**:
- [ ] Empty date
- [ ] Empty reason (< 10 chars)
- [ ] Checkbox not checked

**Actual Results**:
- [ ] PASS / [ ] FAIL
- Notes: ___________________________

---

## 👨‍💼 Admin Dashboard Tests

### Test 13: View All Notes (Admin)
**Steps**:
1. Login as admin
2. Click "Catatan" tab
3. View notes table

**Expected Results**:
- ✅ Tab loads without errors
- ✅ Statistics cards show counts:
  - Pending
  - Approved
  - Rejected
  - Total
- ✅ Table shows all notes
- ✅ Filter controls visible

**Actual Results**:
- [ ] PASS / [ ] FAIL
- Pending count: ___________
- Total notes: ___________
- Notes: ___________________________

---

### Test 14: Filter Notes
**Steps**:
1. Select filter "Type": "Lewat"
2. Click "Tapis"

**Expected Results**:
- ✅ Table shows only "Lewat" type notes
- ✅ Other types hidden

**Test other filters**:
- [ ] Status: Pending
- [ ] Date range

**Actual Results**:
- [ ] PASS / [ ] FAIL
- Notes: ___________________________

---

### Test 15: Approve Note
**Steps**:
1. Click "Lihat" on a pending note
2. Enter admin response: "Diluluskan"
3. Click "✓ Approve"
4. Confirm popup

**Expected Results**:
- ✅ Success message: "Catatan berjaya diluluskan"
- ✅ Modal closes
- ✅ Table refreshes
- ✅ Status badge changes to "Approved" (green)
- ✅ Google Sheet Notes updated:
  - Status = "approved"
  - AdminResponse = "Diluluskan"
  - ProcessedDate recorded
  - AdminName recorded

**Actual Results**:
- [ ] PASS / [ ] FAIL
- Notes: ___________________________

---

### Test 16: Reject Note
**Steps**:
1. Click "Lihat" on another pending note
2. Enter admin response: "Alasan tidak mencukupi"
3. Click "✗ Reject"
4. Confirm popup

**Expected Results**:
- ✅ Success message: "Catatan berjaya ditolak"
- ✅ Status = "rejected"
- ✅ Badge shows red "Rejected"

**Actual Results**:
- [ ] PASS / [ ] FAIL
- Notes: ___________________________

---

### Test 17: View Note (Already Processed)
**Steps**:
1. Open an approved/rejected note
2. Try to edit

**Expected Results**:
- ✅ Approve/Reject buttons DISABLED
- ✅ Admin response field disabled
- ✅ Cannot change status

**Actual Results**:
- [ ] PASS / [ ] FAIL
- Notes: ___________________________

---

### Test 18: View Attendance (Admin)
**Steps**:
1. Click "Kehadiran Hari Ini" tab
2. View attendance table

**Expected Results**:
- ✅ Shows today's check-ins
- ✅ Columns: Nama, Check In, Check Out, Durasi, Status
- ✅ Can filter by date

**Actual Results**:
- [ ] PASS / [ ] FAIL
- Records shown: ___________
- Notes: ___________________________

---

### Test 19: View Users (Admin)
**Steps**:
1. Click "Pengurusan Pengguna" tab
2. View users list

**Expected Results**:
- ✅ Shows all users
- ✅ Can add new user
- ✅ Can edit user
- ✅ Can delete user

**Actual Results**:
- [ ] PASS / [ ] FAIL
- Total users: ___________
- Notes: ___________________________

---

### Test 20: Add New User (Admin)
**Steps**:
1. Click "Tambah Pengguna"
2. Fill form:
   - Name: "Test Guru"
   - Email: "test@tahfiz.com"
   - Password: "123456"
   - Role: "guru"
   - Status: "Active"
3. Click "Simpan"

**Expected Results**:
- ✅ Success message
- ✅ User added to Google Sheet
- ✅ Auto-generated 6-digit UserID (100XXX)
- ✅ Table refreshes

**Actual Results**:
- [ ] PASS / [ ] FAIL
- Generated UserID: ___________
- Notes: ___________________________

---

## 👤 Profile Tests

### Test 21: Edit Profile (Guru)
**Steps**:
1. Login as guru
2. Click profile icon
3. Click edit mode
4. Change name to "Ahmad Updated"
5. Enter new password: "newpass123"
6. Click "Simpan"

**Expected Results**:
- ✅ Success message
- ✅ Name updated in header
- ✅ Google Sheet updated
- ✅ Can login with new password

**Actual Results**:
- [ ] PASS / [ ] FAIL
- Notes: ___________________________

---

### Test 22: Logout
**Steps**:
1. Click logout button
2. Confirm logout

**Expected Results**:
- ✅ Redirects to login page
- ✅ Session cleared
- ✅ Cannot access dashboard by URL
- ✅ Must login again

**Actual Results**:
- [ ] PASS / [ ] FAIL
- Notes: ___________________________

---

## 📱 Mobile Responsive Tests

### Test 23: Mobile Login
**Device**: ________________

**Steps**:
1. Open on mobile browser
2. Test login

**Expected Results**:
- ✅ Login form fits screen
- ✅ Buttons tappable
- ✅ Demo credentials readable

**Actual Results**:
- [ ] PASS / [ ] FAIL
- Notes: ___________________________

---

### Test 24: Mobile Dashboard
**Steps**:
1. Login on mobile
2. Navigate dashboard

**Expected Results**:
- ✅ Bottom navigation visible
- ✅ Tabs work properly
- ✅ Check-in/out buttons accessible
- ✅ Tables scroll horizontally

**Actual Results**:
- [ ] PASS / [ ] FAIL
- Notes: ___________________________

---

### Test 25: Mobile Admin Catatan Tab
**Steps**:
1. Login as admin on mobile
2. Go to Catatan tab

**Expected Results**:
- ✅ Filters stack vertically
- ✅ Table scrolls
- ✅ Modal displays correctly
- ✅ Buttons tappable

**Actual Results**:
- [ ] PASS / [ ] FAIL
- Notes: ___________________________

---

## 🔍 Browser Console Tests

### Test 26: Console Errors Check
**Browser**: Chrome / Firefox / Safari

**Steps**:
1. Open DevTools (F12)
2. Go to Console tab
3. Navigate through all pages
4. Perform all major actions

**Expected Results**:
- ✅ No red errors
- ✅ No 404 errors
- ✅ API responses successful
- ✅ Clear log messages

**Actual Results**:
- [ ] PASS / [ ] FAIL
- Errors found: ___________________________
- Notes: ___________________________

---

### Test 27: Network Tab Check
**Steps**:
1. Open Network tab
2. Login
3. Check API calls

**Expected Results**:
- ✅ API URL correct
- ✅ Status 200 (success)
- ✅ Response has `success: true`
- ✅ Data populated correctly

**Actual Results**:
- [ ] PASS / [ ] FAIL
- API URL: ___________________________
- Response time: ___________ms
- Notes: ___________________________

---

## 🗄️ Google Sheets Backend Tests

### Test 28: Data Persistence
**Steps**:
1. Perform check-in
2. Check Google Sheet Attendance
3. Verify data saved

**Expected Results**:
- ✅ New row added
- ✅ All columns populated correctly
- ✅ UserID = 6-digit format
- ✅ Timestamps correct
- ✅ Status calculated correctly

**Actual Results**:
- [ ] PASS / [ ] FAIL
- Row number: ___________
- Notes: ___________________________

---

### Test 29: Apps Script Logs
**Steps**:
1. Open Apps Script Editor
2. Go to Executions
3. Check recent runs

**Expected Results**:
- ✅ No errors
- ✅ "Login successful" logs
- ✅ "Check-in successful" logs
- ✅ Function runs complete

**Actual Results**:
- [ ] PASS / [ ] FAIL
- Errors found: ___________________________
- Notes: ___________________________

---

### Test 30: Settings Load
**Steps**:
1. Check-in from different location
2. Verify radius check uses 100m

**Expected Results**:
- ✅ System uses radius = 100m (not 200m)
- ✅ Error message mentions "100m"

**Actual Results**:
- [ ] PASS / [ ] FAIL
- Radius used: ___________m
- Notes: ___________________________

---

## 📊 Test Summary

### Overall Results
- **Total Tests**: 30
- **Passed**: _____
- **Failed**: _____
- **Success Rate**: _____%

### Critical Issues Found
1. ___________________________
2. ___________________________
3. ___________________________

### Minor Issues Found
1. ___________________________
2. ___________________________
3. ___________________________

### Recommendations
1. ___________________________
2. ___________________________
3. ___________________________

---

## ✅ Sign-off

**Tested By**: ___________________________
**Date**: ___________________________
**System Version**: 3.0
**Backend Deployment**: AKfycbyfr1jytO4zcnT5pexbv88px2TqwFE-ob8vuf27vVs0tOXJ9kp7a1s4-wM3rJznpQg8

**Status**: [ ] APPROVED FOR PRODUCTION / [ ] NEEDS FIXES

---

**Notes**:
___________________________
___________________________
___________________________
