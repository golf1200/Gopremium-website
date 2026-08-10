// line-token.mjs — ขอ LINE channel access token อัตโนมัติจาก Channel ID + Secret
// (stateless token, อายุ ~15 นาที — mint ใหม่ทุกครั้งที่ใช้ จึงไม่ต้องเก็บ token ยาว)
// docs: https://developers.line.biz/en/reference/messaging-api/#issue-stateless-channel-access-token

export async function getLineToken(approval = {}) {
  // ถ้ามี long-lived token ที่ใส่เอง(ยาวจริง) ก็ใช้เลย
  const t = approval.channelAccessToken;
  if (t && !t.includes('PASTE') && !t.includes('<') && t.length > 50) return t;

  const { channelId, channelSecret } = approval;
  if (!channelId || !channelSecret) {
    throw new Error('ต้องมี channelId + channelSecret (หรือ channelAccessToken แบบยาว) ใน line.approval');
  }
  const res = await fetch('https://api.line.me/oauth2/v3/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'client_credentials', client_id: String(channelId), client_secret: channelSecret }),
  });
  const d = await res.json();
  if (!d.access_token) throw new Error('ขอ LINE token ไม่สำเร็จ: ' + JSON.stringify(d));
  return d.access_token;
}
