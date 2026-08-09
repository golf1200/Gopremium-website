/* ⛔ ไฟล์นี้ถูก GENERATE — ห้ามแก้ด้วยมือ ทุกบรรทัดจะถูกทับ
 *
 * ที่มา: GoPremium-Platform/PLATFORM-clickup.html (Pricing Engine ตัวจริง)
 * สร้างด้วย: GoPremium-Platform/data/gen-pricing-module.cjs
 * วันที่สร้าง: 2026-08-09 13:33:18
 * ลายนิ้วมือสูตร: c0fa97ea5738
 *
 * โค้ดข้างล่างคือฟังก์ชัน "ตัวเดียวกัน" ที่ Pricing Engine / Price Engine for Sales / NPD Quote ใช้
 * ไม่ได้เขียนตาม — ดึงออกมาจากไฟล์แอปตรง ๆ แล้วห่อเป็น ESM
 *
 * แก้ราคา = แก้ PR_TIERS ในแอป แล้วรัน gen-pricing-module.cjs ใหม่ (อย่าแก้ไฟล์นี้)
 * ประวัติการตั้งราคา: GoPremium-Platform/docs/PRICING-DECISIONS.md
 */
var PR_V=0.06, PR_FLOOR=0.18, PR_QS=[100,300,500,1000];   // overhead = คอมเซล 3% + Defect 3% (คิดจากยอดขาย)
var PR_FLOOR_BIG=0.15, PR_DEAL_BIG=500000;
var PR_TIERS=[
  {max:20,  mult:2.50,name:"ต่ำกว่า 20฿",  d:[0,0.13,0.20,0.29]},
  {max:35,  mult:2.40,name:"20–35฿",       d:[0,0.14,0.22,0.33]},
  {max:50,  mult:2.25,name:"35–50฿",       d:[0,0.14,0.22,0.32]},
  {max:300, mult:1.68,name:"50–300฿",      d:[0,0.09,0.13,0.18]},
  {max:500, mult:1.55,name:"300–500฿",     d:[0,0.07,0.10,0.13]},
  {max:800, mult:1.47,name:"500–800฿",     d:[0,0.05,0.07,0.09]},
  {max:1000,mult:1.40,name:"800–1,000฿",   d:[0,0.03,0.05,0.06]},
  {max:1e9, mult:1.35,name:"เกิน 1,000฿",   d:[0,0.02,0.03,0.03]}
];
function prOvStd(){return {comm:true, defect:true, am:false, mkt:0};}
function prTierOf(c){for(var i=0;i<PR_TIERS.length;i++){if(c<PR_TIERS[i].max)return PR_TIERS[i];}return PR_TIERS[PR_TIERS.length-1];}
function prVRate(){
  var v=0;
  if(prOv.am) v+=5; else if(prOv.comm) v+=3;
  if(prOv.defect) v+=3;
  v+=(parseFloat(prOv.mkt)||0);
  return v/100;
}
function prFloorRate(cost,qi){
  var t=prTierOf(cost), v=prVRate();
  var std=Math.round(Math.max(cost*t.mult*(1-t.d[qi]), cost/(1-v-PR_FLOOR)));
  return (std*PR_QS[qi]>=PR_DEAL_BIG) ? PR_FLOOR_BIG : PR_FLOOR;
}
function prCalc(cost,qi){
  var t=prTierOf(cost), v=prVRate(), fr=prFloorRate(cost,qi);
  var list=cost*t.mult*(1-t.d[qi]), floor=cost/(1-v-fr);
  var price=Math.round(Math.max(list,floor));
  if((price-cost-price*v)/price < fr-1e-9) price+=1;             // กันปัดเลขจนหลุด floor
  var rev=price*PR_QS[qi], tcogs=cost*PR_QS[qi], expense=rev*v, profit=rev-tcogs-expense;
  return {t:t,qty:PR_QS[qi],price:price,rev:rev,tcogs:tcogs,expense:expense,profit:profit,margin:profit/rev,clamped:floor>list,floorRate:fr,bigDeal:fr===PR_FLOOR_BIG};
}
/* prOv = สมมติฐานค่าใช้จ่ายมาตรฐาน (คอมเซล 3% + Defect 3%) — เหมือนที่บังคับใช้กับทีมขาย */
var prOv = prOvStd();

export const MODEL_VERSION = 'v3.1';
export const MODEL_HASH = 'c0fa97ea5738';
export const QTY_STEPS = PR_QS;

/** ราคาขาย/ชิ้น ตามเอนจิน — qi: 0=100 ชิ้น, 1=300, 2=500, 3=1,000 */
export function priceAt(cost, qi) {
  if (!(cost > 0)) return null;
  return prCalc(cost, qi).price;
}
export function marginAt(cost, qi) {
  if (!(cost > 0)) return null;
  return prCalc(cost, qi).margin;
}

/* ---- self-check: ค่าที่เอนจินจริงคำนวณไว้ตอน generate ----
   ถ้าคำนวณใหม่แล้วไม่ตรง แปลว่าไฟล์นี้ถูกแก้มือหรือ generate เพี้ยน → ล้มทันที
   ปล่อยให้ build ล้ม ดีกว่าปล่อยราคาผิดขึ้นเว็บลูกค้า */
const GOLDEN = [[1.5,[4,3,3,3]],[7.4,[19,16,15,13]],[11,[28,24,22,20]],[19.99,[50,43,40,35]],[20.01,[48,41,37,32]],[25,[60,52,47,40]],[34.99,[84,72,66,56]],[35.01,[79,68,61,54]],[42,[95,81,74,64]],[49.39,[111,96,87,76]],[50.01,[84,76,73,69]],[90,[151,138,132,124]],[180,[302,275,263,248]],[299,[502,457,437,412]],[380,[589,548,530,512]],[675,[992,943,923,903]],[962.5,[1348,1307,1280,1267]],[1376,[1858,1820,1802,1802]]];
for (const [cost, expect] of GOLDEN) {
  for (let qi = 0; qi < expect.length; qi++) {
    const got = prCalc(cost, qi).price;
    if (got !== expect[qi]) {
      throw new Error('[pricing-model.generated] สูตรราคาเพี้ยน: ต้นทุน ' + cost + ' เรท ' + PR_QS[qi]
        + ' ควรได้ ' + expect[qi] + ' แต่ได้ ' + got + ' — อย่า deploy จนกว่าจะ regenerate จากแอป');
    }
  }
}
