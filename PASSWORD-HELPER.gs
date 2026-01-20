/* ==========================================
   PASSWORD HELPER SCRIPT
   Sistem Kehadiran MRSM Matra

   Guna script ini untuk generate password hash
   ========================================== */

/**
 * Generate password hash untuk simpan dalam Google Sheet
 *
 * Cara guna:
 * 1. Paste script ini dalam Apps Script Editor (temporary tab)
 * 2. Run function testPasswordHash()
 * 3. Check logs untuk dapatkan hash
 * 4. Copy hash dan paste dalam Google Sheet column Password
 */

function hashPassword(password) {
  return Utilities.base64Encode(Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    password + 'MRSM_MATRA_2026'
  ));
}

function testPasswordHash() {
  // Contoh: Generate hash untuk password yang anda mahu guna

  Logger.log('=== PASSWORD HASH GENERATOR ===');
  Logger.log('');

  // ADMIN - tukar password di bawah ini
  const adminPassword = '123456';  // <-- TUKAR INI
  const adminHash = hashPassword(adminPassword);
  Logger.log('ADMIN:');
  Logger.log('Password: ' + adminPassword);
  Logger.log('Hash: ' + adminHash);
  Logger.log('');

  // GURU - tukar password di bawah ini
  const guruPassword = '654321';  // <-- TUKAR INI
  const guruHash = hashPassword(guruPassword);
  Logger.log('GURU:');
  Logger.log('Password: ' + guruPassword);
  Logger.log('Hash: ' + guruHash);
  Logger.log('');

  Logger.log('=== Copy hash di atas dan paste dalam Google Sheet ===');
}

/**
 * Verify password untuk testing
 */
function testPasswordVerify() {
  const password = '123456';  // Password yang user masukkan
  const storedHash = 'PASTE_HASH_DARI_GOOGLE_SHEET_SINI';  // Hash dari Google Sheet

  const isValid = hashPassword(password) === storedHash;

  Logger.log('Password: ' + password);
  Logger.log('Stored Hash: ' + storedHash);
  Logger.log('Is Valid: ' + isValid);
}

/**
 * Generate hash untuk custom password
 * Run function ini untuk test password lain
 */
function generateCustomHash() {
  const customPassword = SpreadsheetApp.getUi().prompt('Masukkan password:').getResponseText();
  const hash = hashPassword(customPassword);

  SpreadsheetApp.getUi().alert('Password Hash:\n\n' + hash + '\n\nCopy hash ini ke column Password dalam Users sheet.');

  Logger.log('Password: ' + customPassword);
  Logger.log('Hash: ' + hash);
}
