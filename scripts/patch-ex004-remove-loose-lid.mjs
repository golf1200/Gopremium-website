// EX004 — feedback 2026-07-30 "รูปแรกลบฝาออก": ลบฝาที่หลุดอยู่มุมซ้ายล่างของรูปหลัก
// พื้นหลังเป็นครีมไล่เฉดเรียบ ๆ → inpaint ด้วยการไล่สีตามแนวนอนจากพิกเซลสะอาดสองข้างของแต่ละแถว
// (ไม่ใช้ AI ไม่มีค่าใช้จ่าย) · เขียนทับ ex004-drinkware-square.jpg โดยสำรองต้นฉบับไว้ *.pre-lidpatch.jpg
import sharp from 'sharp';
import { existsSync, copyFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIR = path.join(REPO, 'public/images/products/ex004-drinkware');
const TARGET = path.join(DIR, 'ex004-drinkware-square.jpg');
const BACKUP = path.join(DIR, 'ex004-drinkware-square.pre-lidpatch.jpg');
if (!existsSync(BACKUP)) copyFileSync(TARGET, BACKUP);

const { data, info } = await sharp(BACKUP).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: W, channels: C } = info;
const at = (x, y) => (y * W + x) * C;
const rgbAt = (x, y) => { const i = at(x, y); return [data[i], data[i + 1], data[i + 2]]; };

// ค่าเฉลี่ยของแถบสะอาดกว้าง SPAN px ใช้เป็นจุดยึดสี — กันจุดรบกวนเดี่ยว ๆ
const anchor = (x0, y, span) => {
  const s = [0, 0, 0];
  for (let x = x0; x < x0 + span; x++) { const p = rgbAt(x, y); s[0] += p[0]; s[1] += p[1]; s[2] += p[2]; }
  return s.map((v) => v / span);
};

const colAnchor = (x, y0, span) => {
  const s = [0, 0, 0];
  for (let y = y0; y < y0 + span; y++) { const p = rgbAt(x, y); s[0] += p[0]; s[1] += p[1]; s[2] += p[2]; }
  return s.map((v) => v / span);
};

// A) ตัวฝา — ไล่สีตามแนวตั้งจากแถวสะอาดเหนือ/ใต้ฝา (ห้ามใช้ก้นขวดทางขวาเป็นจุดยึด สีจะเพี้ยนเป็นแถบขาว)
const A = { xL: 198, xR: 380, y0: 772, y1: 888, yTop: 762, yBot: 894 };
for (let x = A.xL; x <= A.xR; x++) {
  const a = colAnchor(x, A.yTop - 8, 8);
  const b = colAnchor(x, A.yBot, 8);
  for (let y = A.y0; y <= A.y1; y++) {
    const t = (y - A.y0) / (A.y1 - A.y0);
    const i = at(x, y);
    for (let c = 0; c < 3; c++) data[i + c] = Math.round(a[c] + (b[c] - a[c]) * t);
  }
}
// B) เงาฝาที่ทอดไปทางขวา — ตอนนี้ฝั่งซ้ายสะอาดแล้ว ไล่สีตามแนวนอนได้
const B = { xL: 381, xR: 452, y0: 812, y1: 886 };
for (let y = B.y0; y <= B.y1; y++) {
  const a = anchor(B.xL - 22, y, 18);
  const b = anchor(B.xR + 6, y, 18);
  for (let x = B.xL; x <= B.xR; x++) {
    const t = (x - B.xL) / (B.xR - B.xL);
    const i = at(x, y);
    for (let c = 0; c < 3; c++) data[i + c] = Math.round(a[c] + (b[c] - a[c]) * t);
  }
}
// เกลี่ยขอบซ้าย/ขวาของแถบ A และขอบบน/ล่างของแถบ B ให้กลืนกับพื้นเดิม
for (let y = A.y0; y <= A.y1; y++) {
  for (const [xEdge, dir] of [[A.xL, -1], [A.xR, 1]]) {
    for (let k = 1; k <= 8; k++) {
      const x = xEdge + dir * k, w = 1 - k / 9, i = at(x, y), j = at(xEdge, y);
      for (let c = 0; c < 3; c++) data[i + c] = Math.round(data[i + c] * (1 - w) + data[j + c] * w);
    }
  }
}
for (const [yEdge, dir] of [[B.y0, -1], [B.y1, 1]]) {
  for (let k = 1; k <= 6; k++) {
    const y = yEdge + dir * k, w = 1 - k / 7;
    for (let x = B.xL; x <= B.xR; x++) {
      const i = at(x, y), j = at(x, yEdge);
      for (let c = 0; c < 3; c++) data[i + c] = Math.round(data[i + c] * (1 - w) + data[j + c] * w);
    }
  }
}

const final = await sharp(data, { raw: { width: W, height: info.height, channels: C } })
  .jpeg({ quality: 88, mozjpeg: true }).toBuffer();
await sharp(final).toFile(TARGET);
if (process.env.OUT) await sharp(final).extract({ left: 120, top: 700, width: 440, height: 230 }).resize(1100).png().toFile(path.join(process.env.OUT, '_ex004-zoom.png'));
console.log('ok', Math.round(final.length / 1024) + 'KB ->', TARGET);
