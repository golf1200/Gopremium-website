#!/usr/bin/env node
/**
 * facebook-publish.mjs — โพสต์ลง Facebook Page "GO PREMIUM" ผ่าน Graph API
 * อ่าน token จาก scripts/social/.social-config.json (gitignored)
 *
 *   node scripts/social/facebook-publish.mjs --test
 *   node scripts/social/facebook-publish.mjs --message="ข้อความ" --link="https://..."
 *   node scripts/social/facebook-publish.mjs --check        # ตรวจ token + ดูข้อมูลเพจ (ไม่โพสต์)
 *
 * หมายเหตุ: ถ้า pageId ใน config ว่าง สคริปต์จะดึงให้อัตโนมัติจาก token
 */

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = join(HERE, '.social-config.json');
const GRAPH = 'https://graph.facebook.com/v21.0';

const arg = (name) => {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split('=').slice(1).join('=') : null;
};
const flag = (name) => process.argv.includes(`--${name}`);

async function api(path, params = {}, method = 'GET') {
  const url = new URL(`${GRAPH}/${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url, { method });
  const data = await res.json();
  if (data.error) throw new Error(`${data.error.message} (code ${data.error.code})`);
  return data;
}

(async () => {
  // ---- load config ----
  let cfg;
  try {
    cfg = JSON.parse(readFileSync(CONFIG_PATH, 'utf8')).facebook;
  } catch {
    console.error('❌ ไม่พบ/อ่าน scripts/social/.social-config.json ไม่ได้ — ดู README-FACEBOOK-SETUP.md');
    process.exit(1);
  }
  const token = cfg?.pageAccessToken;
  if (!token || token.includes('PASTE_')) {
    console.error('❌ ยังไม่ได้วาง Page Access Token ใน .social-config.json (ช่อง pageAccessToken)');
    process.exit(1);
  }

  // ---- resolve pageId (auto จาก token ถ้าว่าง) ----
  let pageId = cfg.pageId;
  try {
    const me = await api('me', { fields: 'id,name,fan_count,link', access_token: token });
    if (!pageId) pageId = me.id;
    console.log(`📄 เพจ: ${me.name}  (id ${me.id}${me.fan_count != null ? `, followers ${me.fan_count}` : ''})`);
    if (me.link) console.log(`   ${me.link}`);
  } catch (e) {
    console.error(`❌ token ใช้ไม่ได้: ${e.message}`);
    console.error('   เช็คว่าเป็น "Page" Access Token (ไม่ใช่ User) และมี permission pages_manage_posts');
    process.exit(1);
  }

  // ---- --check: ตรวจอย่างเดียว ไม่โพสต์ ----
  if (flag('check')) {
    console.log('✅ token ใช้งานได้ พร้อมโพสต์');
    return;
  }

  // ---- เตรียมเนื้อหา ----
  let message = arg('message');
  const link = arg('link');
  if (flag('test')) {
    message =
      message ||
      '🧪 ทดสอบระบบโพสต์อัตโนมัติของ GO PREMIUM (โพสต์นี้ลบได้) — ของพรีเมียมองค์กร เห็นราคา เห็นงานจริง สั่งได้เร็ว';
  }
  if (!message && !link) {
    console.error('❌ ต้องมี --message หรือ --link อย่างน้อยหนึ่งอย่าง (หรือใช้ --test)');
    process.exit(1);
  }

  // ---- โพสต์ลง feed ----
  const params = { access_token: token };
  if (message) params.message = message;
  if (link) params.link = link; // FB จะดึง preview จาก OG tags ของหน้านั้นเอง

  try {
    const out = await api(`${pageId}/feed`, params, 'POST');
    const postUrl = `https://www.facebook.com/${out.id}`;
    console.log(`\n✅ โพสต์สำเร็จ! post id: ${out.id}`);
    console.log(`   ดู/ลบได้ที่: ${postUrl}\n`);
  } catch (e) {
    console.error(`\n❌ โพสต์ไม่สำเร็จ: ${e.message}\n`);
    process.exit(1);
  }
})();
