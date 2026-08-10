#!/usr/bin/env node
/**
 * get-fb-token.mjs — แปลง short-lived token → long-lived Page Access Token (ไม่หมดอายุ)
 *
 * ใช้ครั้งเดียวตอนตั้งค่า (ดู README-FACEBOOK-SETUP.md)
 *
 *   node scripts/social/get-fb-token.mjs \
 *     --app-id=XXXX --app-secret=YYYY --short-token=ZZZZ
 *
 * จะพิมพ์ Page ID + Long-lived Page Access Token พร้อมวางลง .social-config.json
 */

const GRAPH = 'https://graph.facebook.com/v21.0';

function arg(name) {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split('=').slice(1).join('=') : null;
}

const appId = arg('app-id');
const appSecret = arg('app-secret');
const shortToken = arg('short-token');
const wantPage = (arg('page') || 'gopremiums').toLowerCase();

if (!appId || !appSecret || !shortToken) {
  console.error(`
❌ ใส่ args ไม่ครบ ต้องการ:
   --app-id=<APP_ID>          (developers.facebook.com → App → Settings → Basic)
   --app-secret=<APP_SECRET>
   --short-token=<TOKEN>       (จาก Graph API Explorer, ขั้นที่ 2)

ตัวอย่าง:
   node scripts/social/get-fb-token.mjs --app-id=123 --app-secret=abc --short-token=EAAB...
`);
  process.exit(1);
}

async function getJson(url) {
  const res = await fetch(url);
  const data = await res.json();
  if (data.error) {
    throw new Error(`${data.error.message} (code ${data.error.code})`);
  }
  return data;
}

(async () => {
  try {
    // 1) short-lived user token → long-lived user token (~60 วัน)
    console.log('⏳ 1/3 แลก long-lived user token...');
    const ll = await getJson(
      `${GRAPH}/oauth/access_token?grant_type=fb_exchange_token` +
        `&client_id=${appId}&client_secret=${appSecret}` +
        `&fb_exchange_token=${encodeURIComponent(shortToken)}`
    );
    const longUserToken = ll.access_token;

    // 2) ดึงรายการเพจ + page token (page token จาก long-lived user token = ไม่หมดอายุ)
    console.log('⏳ 2/3 ดึง Page token...');
    const accounts = await getJson(
      `${GRAPH}/me/accounts?fields=name,id,access_token,username&access_token=${encodeURIComponent(longUserToken)}`
    );
    const pages = accounts.data || [];
    if (!pages.length) {
      throw new Error('ไม่พบเพจที่จัดการได้ — เช็คว่าใส่ permission pages_show_list + เลือกเพจตอน generate token แล้ว');
    }
    const page =
      pages.find((p) => (p.username || '').toLowerCase() === wantPage) ||
      pages.find((p) => (p.name || '').toLowerCase().includes('premium')) ||
      pages[0];

    // 3) ตรวจ token ว่าโพสต์ได้จริง (อ่านข้อมูลเพจ)
    console.log('⏳ 3/3 ตรวจสอบ token...');
    const check = await getJson(
      `${GRAPH}/${page.id}?fields=name,fan_count,link&access_token=${encodeURIComponent(page.access_token)}`
    );

    console.log(`
✅ สำเร็จ! เพจ: ${check.name}  (followers: ${check.fan_count ?? 'n/a'})
   ${check.link || ''}

── วางค่านี้ลง scripts/social/.social-config.json ──
{
  "facebook": {
    "pageId": "${page.id}",
    "pageAccessToken": "${page.access_token}",
    "pageUrl": "https://www.facebook.com/gopremiums"
  }
}
────────────────────────────────────────────────────

หมายเหตุ: ถ้าพบหลายเพจ เลือกใช้อันที่ถูกต้อง รายการที่จัดการได้:
${pages.map((p) => `  • ${p.name}  (id ${p.id}${p.username ? ', @' + p.username : ''})`).join('\n')}
`);
  } catch (err) {
    console.error(`\n❌ ผิดพลาด: ${err.message}\n`);
    process.exit(1);
  }
})();
