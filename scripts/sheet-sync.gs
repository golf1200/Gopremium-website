/**
 * GO PREMIUM — Sheet Sync Web App
 * ให้ Claude (ผ่าน Bash) อ่าน/อัปเดต Google Sheet "Gopremium Dev Master" ได้
 *
 * วิธีติดตั้ง (ทำครั้งเดียว ~5 นาที):
 *  1. เปิด Google Sheet → เมนู Extensions → Apps Script
 *  2. ลบโค้ดเดิมทั้งหมด → วางโค้ดนี้ทับ → กดบันทึก (รูปแผ่นดิสก์)
 *  3. กด Deploy → New deployment → ไอคอนเฟือง เลือก "Web app"
 *       - Execute as: Me (อีเมลคุณ)
 *       - Who has access: Anyone        ← ต้องเป็น Anyone (กันด้วย token แทน)
 *  4. กด Deploy → Authorize access → อนุญาต
 *  5. ก๊อป "Web app URL" (ลงท้าย /exec) ส่งกลับมาให้ Claude
 *  เวลาแก้โค้ดภายหลัง: Deploy → Manage deployments → ดินสอ → New version → Deploy
 */

const SECRET = '8a9c7e87534827302826d6326ce3563a24351f85c5af68c4'; // token ลับ — อย่าเปิดเผย

function doGet(e) {
  return _json({ ok: true, msg: 'GO PREMIUM sheet-sync alive' });
}

function doPost(e) {
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (body.token !== SECRET) return _json({ ok: false, error: 'bad token' });

    // รองรับหลายชีต: ถ้าส่ง spreadsheetId มา → เปิดชีตนั้น, ไม่งั้นใช้ชีตที่ผูกอยู่ (Gopremium Dev Master)
    const ss = body.spreadsheetId
      ? SpreadsheetApp.openById(body.spreadsheetId)
      : SpreadsheetApp.getActiveSpreadsheet();
    const a = body.action;

    if (a === 'getSheets') {
      return _json({ ok: true, sheets: ss.getSheets().map(s => s.getName()) });
    }

    if (a === 'addSheet') {                    // สร้างแท็บใหม่ (ถ้ามีอยู่แล้วก็ผ่าน): {sheet}
      let sh = ss.getSheetByName(body.sheet);
      if (!sh) sh = ss.insertSheet(body.sheet);
      return _json({ ok: true, created: sh.getName() });
    }

    if (a === 'read') {                       // อ่านค่า: {sheet, range?}
      const sh = ss.getSheetByName(body.sheet);
      if (!sh) return _json({ ok: false, error: 'no sheet ' + body.sheet });
      const rng = body.range ? sh.getRange(body.range) : sh.getDataRange();
      return _json({ ok: true, values: rng.getValues() });
    }

    if (a === 'setCell') {                     // เซ็ต 1 ช่อง: {sheet, cell:"E5", value}
      const sh = ss.getSheetByName(body.sheet);
      if (!sh) return _json({ ok: false, error: 'no sheet ' + body.sheet });
      sh.getRange(body.cell).setValue(body.value);
      return _json({ ok: true, set: body.cell });
    }

    if (a === 'write') {                       // เซ็ตช่วง: {sheet, range:"A2:C4", values:[[...]]}
      const sh = ss.getSheetByName(body.sheet) || ss.insertSheet(body.sheet); // auto-create
      sh.getRange(body.range).setValues(body.values);
      return _json({ ok: true, wrote: body.range });
    }

    // อัปเดตแบบหาแถว: หาแถวที่คอลัมน์ matchCol == matchVal แล้วเซ็ต setCol = setVal
    // matchCol/setCol ใส่เป็น "ชื่อหัวคอลัมน์" หรือเลขคอลัมน์ (1=A) ก็ได้
    if (a === 'update') {
      const sh = ss.getSheetByName(body.sheet);
      if (!sh) return _json({ ok: false, error: 'no sheet ' + body.sheet });
      const data = sh.getDataRange().getValues();
      const hRow = (body.headerRow || 1) - 1;
      const headers = data[hRow].map(String);
      const col = (k) => isNaN(k) ? headers.indexOf(String(k)) : (parseInt(k, 10) - 1);
      const mc = col(body.matchCol), sc = col(body.setCol);
      if (mc < 0) return _json({ ok: false, error: 'matchCol not found: ' + body.matchCol });
      if (sc < 0) return _json({ ok: false, error: 'setCol not found: ' + body.setCol });
      for (let r = hRow + 1; r < data.length; r++) {
        if (String(data[r][mc]).trim() === String(body.matchVal).trim()) {
          sh.getRange(r + 1, sc + 1).setValue(body.setVal);
          return _json({ ok: true, row: r + 1, set: body.setVal });
        }
      }
      return _json({ ok: false, error: 'match not found: ' + body.matchVal });
    }

    if (a === 'appendRow') {                   // เพิ่มแถวท้าย: {sheet, row:[...]}
      const sh = ss.getSheetByName(body.sheet) || ss.insertSheet(body.sheet); // auto-create
      sh.appendRow(body.row);
      return _json({ ok: true, appended: true });
    }

    if (a === 'appendRows') {                  // เพิ่มหลายแถวรวด: {sheet, rows:[[...],[...]]}
      const sh = ss.getSheetByName(body.sheet) || ss.insertSheet(body.sheet);
      if (body.rows && body.rows.length) {
        sh.getRange(sh.getLastRow() + 1, 1, body.rows.length, body.rows[0].length).setValues(body.rows);
      }
      return _json({ ok: true, appended: (body.rows || []).length });
    }

    if (a === 'clear') {                        // ล้างค่า: {sheet, range?} (ไม่ใส่ range = ทั้งแท็บ)
      const sh = ss.getSheetByName(body.sheet);
      if (!sh) return _json({ ok: false, error: 'no sheet ' + body.sheet });
      (body.range ? sh.getRange(body.range) : sh.getDataRange()).clearContent();
      return _json({ ok: true, cleared: body.range || 'all' });
    }

    if (a === 'deleteSheet') {                  // ลบแท็บ: {sheet}
      const sh = ss.getSheetByName(body.sheet);
      if (sh) ss.deleteSheet(sh);
      return _json({ ok: true, deleted: body.sheet });
    }

    return _json({ ok: false, error: 'unknown action: ' + a });
  } catch (err) {
    return _json({ ok: false, error: String(err) });
  }
}

function _json(o) {
  return ContentService.createTextOutput(JSON.stringify(o))
    .setMimeType(ContentService.MimeType.JSON);
}
