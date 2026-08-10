#!/usr/bin/env node
/**
 * send-draft.mjs — สร้างโพสต์ Facebook เป็น "draft (unpublished)" + ส่งการ์ดอนุมัติเข้า LINE
 * (ส่วนต้นทางของ Tier 2: routine เรียกตัวนี้ → คุณกดปุ่มใน LINE → webhook เผยแพร่)
 *
 *   node scripts/social/send-draft.mjs --message="แคปชัน..." --link="https://..." \
 *        --image="https://.../og.jpg" --label="Informational · อังคาร 09:00"
 *
 * อ่าน config: facebook{pageId,pageAccessToken} + line.approval{channelAccessToken,toUserId}
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const cfg = JSON.parse(readFileSync(join(HERE, '.social-config.json'), 'utf8'));
const GRAPH = 'https://graph.facebook.com/v21.0';
const arg = (n) => { const h = process.argv.find((a) => a.startsWith(`--${n}=`)); return h ? h.split('=').slice(1).join('=') : null; };

const message = arg('message');
const link = arg('link');
const image = arg('image');
const label = arg('label') || '';
if (!message && !link) { console.error('❌ ต้องมี --message หรือ --link'); process.exit(1); }

const fb = cfg.facebook;
const ln = cfg.line?.approval;
if (!ln?.channelAccessToken || !ln?.toUserId) {
  console.error('❌ ยังไม่ได้ตั้ง line.approval (channelAccessToken + toUserId) ใน .social-config.json — ดู README-LINE-SETUP.md');
  process.exit(1);
}

(async () => {
  // 1) สร้างโพสต์เป็น draft (ยังไม่เผยแพร่)
  const params = new URLSearchParams({ access_token: fb.pageAccessToken, published: 'false' });
  if (message) params.set('message', message);
  if (link) params.set('link', link);
  const r = await fetch(`${GRAPH}/${fb.pageId}/feed`, { method: 'POST', body: params });
  const post = await r.json();
  if (post.error) { console.error('❌ สร้าง draft ไม่สำเร็จ:', post.error.message); process.exit(1); }
  const postId = post.id;
  console.log('📝 สร้าง FB draft แล้ว:', postId);

  // 2) ส่งการ์ดอนุมัติเข้า LINE (รูป + แคปชัน + ปุ่ม)
  const messages = [];
  if (image) messages.push({ type: 'image', originalContentUrl: image, previewImageUrl: image });
  messages.push({
    type: 'text',
    text: `📋 ร่างโพสต์ใหม่${label ? ' · ' + label : ''}\n${'─'.repeat(18)}\n${message || ''}${link ? '\n\n🔗 ' + link : ''}\n${'─'.repeat(18)}\nกดปุ่มด้านล่างเพื่อสั่งงาน 👇`,
    quickReply: {
      items: [
        { type: 'action', action: { type: 'postback', label: '✅ อนุมัติ+โพสต์', data: `action=approve&post=${postId}`, displayText: '✅ อนุมัติ' } },
        { type: 'action', action: { type: 'postback', label: '⏭️ ข้าม/ลบ', data: `action=skip&post=${postId}`, displayText: '⏭️ ข้าม' } },
      ],
    },
  });
  const lr = await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ln.channelAccessToken}` },
    body: JSON.stringify({ to: ln.toUserId, messages }),
  });
  if (lr.status === 200) {
    console.log('📲 ส่งการ์ดอนุมัติเข้า LINE แล้ว — รออนุมัติในมือถือ');
  } else {
    console.error(`⚠️ FB draft สร้างแล้ว แต่ส่ง LINE ไม่ผ่าน (HTTP ${lr.status}):`, await lr.text());
    console.error('   (draft ยังอยู่บนเพจ — อนุมัติใน Business Suite ได้)');
  }
})();
