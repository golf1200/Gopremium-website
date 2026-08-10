import { chromium } from 'playwright';
const b = await chromium.connectOverCDP('http://localhost:9222');
const ctx = b.contexts()[0];
const pages = ctx.pages();
console.log('contexts:', b.contexts().length, '| pages:', pages.length);
for (const p of pages) {
  let title=''; try{title=await p.title();}catch{}
  console.log(' -', p.url().slice(0,90), '|', title.slice(0,45));
}
const cookies = await ctx.cookies();
const names = cookies.map(c=>c.name);
const hasLogin = names.some(n=>/^(unb|munb|_l_g_|lgc|_tb_token_|cookie2|_nk_)/i.test(n));
console.log('total cookies:', cookies.length, '| 1688/taobao login markers:', hasLogin);
await b.close();
