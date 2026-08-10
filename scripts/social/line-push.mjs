#!/usr/bin/env node
/**
 * line-push.mjs — ส่งข้อความเข้า LINE (ผ่าน OA Messaging API)
 * ใช้ส่ง "draft โพสต์" ให้เจ้าของอนุมัติ หรือแจ้งเตือน
 * อ่าน config จาก scripts/social/.social-config.json (block "line.approval")
 * token: mint อัตโนมัติจาก channelId + channelSecret (ดู line-token.mjs)
 *
 *   node scripts/social/line-push.mjs --test
 *   node scripts/social/line-push.mjs --message="ข้อความ"
 *   node scripts/social/line-push.mjs --message="..." --image="https://.../pic.jpg"
 */

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getLineToken } from './line-token.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = join(HERE, '.social-config.json');
const PUSH_URL = 'https://api.line.me/v2/bot/message/push';

const arg = (name) => {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split('=').slice(1).join('=') : null;
};
const flag = (name) => process.argv.includes(`--${name}`);

let approval;
try {
  approval = JSON.parse(readFileSync(CONFIG_PATH, 'utf8')).line?.approval;
} catch {
  console.error('❌ อ่าน .social-config.json ไม่ได้');
  process.exit(1);
}
if (!approval?.toUserId || approval.toUserId.includes('PASTE') || approval.toUserId.includes('<')) {
  console.error('❌ ยังไม่ได้ใส่ line.approval.toUserId (userId ของคุณ ขึ้นต้น U...)');
  process.exit(1);
}

let message = arg('message');
const image = arg('image');
if (flag('test')) message = message || '🧪 ทดสอบ LINE push ของ GO PREMIUM — บอตอนุมัติพร้อมส่ง draft ให้คุณแล้ว ✅';
if (!message && !image) {
  console.error('❌ ต้องมี --message หรือ --image (หรือ --test)');
  process.exit(1);
}

const messages = [];
if (message) messages.push({ type: 'text', text: message });
if (image) messages.push({ type: 'image', originalContentUrl: image, previewImageUrl: image });

(async () => {
  let token;
  try {
    token = await getLineToken(approval);
  } catch (e) {
    console.error('❌', e.message);
    process.exit(1);
  }
  const res = await fetch(PUSH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ to: approval.toUserId, messages: messages.slice(0, 5) }),
  });
  if (res.status === 200) {
    console.log('✅ ส่งเข้า LINE สำเร็จ — เช็คใน LINE ของคุณได้เลย');
  } else {
    const t = await res.text();
    console.error(`❌ ส่งไม่สำเร็จ (HTTP ${res.status}): ${t}`);
    console.error('   เช็ค: เพิ่มเพื่อนบอตแล้วยัง? · channelId/secret/userId ถูกไหม?');
    process.exit(1);
  }
})();
