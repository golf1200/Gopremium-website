// sections-bottom.jsx — Products, Portfolio, Reviews, RFQ form, CTA, Footer, Floating
const { useState: useS, useEffect: useE, useRef: useR } = React;

/* ============================ PRODUCTS (Prime / Upsell) ============================ */
function GpProducts({ onQuote }){
  const prime = [
    {t:"กระบอกน้ำเก็บอุณหภูมิ", moq:"MOQ 100", from:180, badge:"ขายดี", tint:["#1F3A5F","#2C4F7C"]},
    {t:"กระเป๋าผ้าแคนวาส", moq:"MOQ 150", from:120, badge:"รักษ์โลก", tint:["#2C4F7C","#3E689B"]},
    {t:"สมุดโน้ตปกหนัง PU", moq:"MOQ 100", from:95, badge:null, tint:["#16293F","#1F3A5F"]},
    {t:"เซ็ตของใช้สำนักงาน", moq:"MOQ 80", from:240, badge:"นิยม", tint:["#3A4250","#566075"]},
  ];
  const upsell = [
    {icon:"palette",t:"บริการออกแบบเฉพาะ",d:"คอนเซ็ปต์ & ดีไซน์เฉพาะแบรนด์ ไม่ใช่ของโหล"},
    {icon:"box",t:"แพ็กเกจ & กล่องพรีเมียม",d:"กล่อง การ์ด และแท็กแบรนด์ ยกระดับการแกะกล่อง"},
    {icon:"layers",t:"จัดกิฟต์เซ็ต (Curation)",d:"หลายชิ้นในเซ็ตเดียว เล่าเรื่องแบรนด์คุณ"},
    {icon:"clock",t:"งานด่วน (Rush)",d:"ดีลกระชั้นก็ทันงาน วางแผนการผลิตให้"},
    {icon:"truck",t:"คลังสินค้า & จัดส่งรายคน",d:"Kitting & fulfillment ส่งตรงถึงพนักงานแต่ละคน"},
  ];
  return (
    <section id="products" className="gp-section" style={{background:"#fff"}}>
      <div className="gp-wrap">
        <GpReveal style={{display:"flex",flexDirection:"column",gap:14,maxWidth:"60ch"}}>
          <span className="gp-eyebrow"><span className="dot"/>สินค้า & บริการ</span>
          <h2 className="gp-h2">เริ่มจากสินค้าที่ใช่ <br/>แล้วยกระดับให้เป็นประสบการณ์</h2>
          <p className="gp-lead">สินค้าหลักราคาเข้าถึงได้เป็นจุดเริ่ม — บริการเสริมคือสิ่งที่เปลี่ยน “ของแจก” ให้กลายเป็น “ของที่อยากเก็บ”</p>
        </GpReveal>

        <div style={{display:"grid",gridTemplateColumns:"1.25fr 1fr",gap:"clamp(24px,3.5vw,52px)",marginTop:46,alignItems:"start"}} className="gp-prod-grid">
          {/* PRIME */}
          <div>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:18}}>
              <span className="gp-badge gp-badge-solid">PRIME</span>
              <span style={{fontFamily:"var(--gp-font-head)",fontSize:15,color:"var(--gp-navy)",fontWeight:500}}>สินค้ายอดนิยม</span>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:16}}>
              {prime.map((p,i)=>(
                <GpReveal key={i} delay={i*70}>
                  <div className="gp-card" style={{padding:14,height:"100%",display:"flex",flexDirection:"column"}}>
                    <div style={{position:"relative"}}>
                      <image-slot id={"prod-"+i} shape="rounded" radius="11" placeholder="รูปสินค้า"
                        style={{width:"100%",height:128}} src=""></image-slot>
                      {p.badge && <span className="gp-badge gp-badge-mustard" style={{position:"absolute",top:9,left:9,fontSize:10.5,padding:"4px 9px"}}>{p.badge}</span>}
                    </div>
                    <h4 style={{fontSize:15.5,color:"var(--gp-navy)",marginTop:13}}>{p.t}</h4>
                    <p style={{fontSize:12,color:"var(--gp-grey)",marginTop:3}}>พิมพ์โลโก้ · {p.moq}</p>
                    <div style={{marginTop:"auto",paddingTop:13,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                      <span style={{fontFamily:"var(--gp-font-head)",fontWeight:600,fontSize:14.5,color:"var(--gp-navy)"}}>เริ่ม ฿{p.from}</span>
                      <button className="gp-btn gp-btn-ghost gp-btn-sm" onClick={onQuote}>ขอราคา</button>
                    </div>
                  </div>
                </GpReveal>
              ))}
            </div>
          </div>
          {/* UPSELL */}
          <div>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:18}}>
              <span className="gp-badge gp-badge-mustard">UPSELL</span>
              <span style={{fontFamily:"var(--gp-font-head)",fontSize:15,color:"var(--gp-navy)",fontWeight:500}}>บริการเพิ่มมูลค่า</span>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:11}}>
              {upsell.map((u,i)=>(
                <GpReveal key={i} delay={i*60}>
                  <div style={{display:"flex",gap:14,alignItems:"flex-start",background:"var(--gp-cloud)",borderRadius:14,padding:"15px 16px",border:"1px solid var(--gp-grey-200)"}}>
                    <div style={{flex:"0 0 auto",width:42,height:42,borderRadius:11,background:"#fff",display:"flex",alignItems:"center",justifyContent:"center",color:"var(--gp-navy)",border:"1px solid var(--gp-grey-200)"}}>
                      <GpIcon name={u.icon} size={20}/>
                    </div>
                    <div>
                      <h4 style={{fontSize:14.5,color:"var(--gp-navy)"}}>{u.t}</h4>
                      <p style={{fontSize:12.5,color:"var(--gp-grey)",marginTop:2,lineHeight:1.5}}>{u.d}</p>
                    </div>
                  </div>
                </GpReveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================ PORTFOLIO (tweakable display) ============================ */
const GP_CASES = [
  {t:"เซ็ตปีใหม่ บริษัท ABC", tag:"Case study · 500 ชุด", d:"ออกแบบกล่อง + การ์ดเฉพาะแบรนด์ ส่งทันปีใหม่", tint:["#1F3A5F","#2C4F7C"], h:230},
  {t:"Welcome Kit · SiamTech", tag:"Onboarding · 120 ชุด", d:"ชุดต้อนรับพนักงานใหม่ สาย minimal สีแบรนด์", tint:["#2C4F7C","#3E689B"], h:300},
  {t:"Press Kit เปิดตัวสินค้า", tag:"Event · 80 ชุด", d:"กล่องสื่อมวลชนพรีเมียม ถ่ายรูปลงสื่อสวย", tint:["#16293F","#244873"], h:260},
  {t:"VIP Box · NovaBank", tag:"Client gift · 60 ชุด", d:"กล่องหนังหรู สลักชื่อลูกค้าคนสำคัญรายบุคคล", tint:["#3A4250","#566075"], h:220},
  {t:"Eco Set · Greenleaf", tag:"รักษ์โลก · 300 ชุด", d:"วัสดุรีไซเคิล 100% เล่าเรื่องความยั่งยืน", tint:["#2F4A3A","#3E689B"], h:300},
  {t:"ครบรอบ 10 ปี Lotus", tag:"Milestone · 250 ชุด", d:"ของที่ระลึกครบรอบ ดีไซน์พิเศษเฉพาะวาระ", tint:["#1F3A5F","#16293F"], h:240},
];
function GpCaseCard({ c, idx, h }){
  return (
    <div style={{position:"relative",borderRadius:16,overflow:"hidden",boxShadow:"var(--gp-shadow-sm)",border:"1px solid var(--gp-grey-200)",background:"#fff"}}>
      <div style={{position:"relative"}}>
        <image-slot id={"case-"+idx} shape="rect" placeholder="รูปผลงาน" style={{width:"100%",height:(h||c.h)+"px",display:"block"}}></image-slot>
        <span className="gp-badge gp-badge-glass" style={{position:"absolute",top:12,left:12,fontSize:11}}>{c.tag}</span>
      </div>
      <div style={{padding:"15px 17px 18px"}}>
        <h4 style={{fontSize:17,color:"var(--gp-navy)"}}>{c.t}</h4>
        <p style={{fontSize:13,color:"var(--gp-grey)",marginTop:6,lineHeight:1.55}}>{c.d}</p>
      </div>
    </div>
  );
}
function GpPortfolio({ display="grid" }){
  const scroller = useR(null);
  function nudge(dir){ const el=scroller.current; if(el) el.scrollBy({left:dir*Math.min(380,el.clientWidth*.8),behavior:"smooth"}); }
  return (
    <section id="portfolio" className="gp-section" style={{background:"var(--gp-cloud)"}}>
      <div className="gp-wrap">
        <GpReveal style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",gap:24,flexWrap:"wrap"}}>
          <div style={{display:"flex",flexDirection:"column",gap:13,maxWidth:"56ch"}}>
            <span className="gp-eyebrow"><span className="dot"/>ผลงานจริง</span>
            <h2 className="gp-h2">งานที่ส่งมอบแล้ว <br/>คือคำสัญญาที่จับต้องได้</h2>
            <p className="gp-lead">เลือกดูตามโอกาส — ปีใหม่ ต้อนรับพนักงาน อีเวนต์ และลูกค้า VIP ทุกชิ้นผ่าน Mockup ก่อนผลิตจริง</p>
          </div>
          {display==="carousel" && (
            <div style={{display:"flex",gap:9}}>
              <button onClick={()=>nudge(-1)} className="gp-btn gp-btn-ghost gp-btn-sm" aria-label="prev" style={{width:44,height:44,padding:0,borderRadius:"50%"}}><GpIcon name="arrow" size={18} stroke="var(--gp-navy)"/><span style={{display:"none"}}>prev</span></button>
              <button onClick={()=>nudge(1)} className="gp-btn gp-btn-secondary gp-btn-sm" aria-label="next" style={{width:44,height:44,padding:0,borderRadius:"50%"}}><GpIcon name="arrow" size={18} stroke="#fff"/></button>
            </div>
          )}
        </GpReveal>

        <div style={{marginTop:40}}>
          {display==="grid" && (
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))",gap:20}}>
              {GP_CASES.map((c,i)=>(<GpReveal key={i} delay={(i%3)*80}><GpCaseCard c={c} idx={i} h={236}/></GpReveal>))}
            </div>
          )}
          {display==="masonry" && (
            <div style={{columnCount:3,columnGap:20}} className="gp-masonry">
              {GP_CASES.map((c,i)=>(
                <div key={i} style={{breakInside:"avoid",marginBottom:20}}><GpCaseCard c={c} idx={i}/></div>
              ))}
            </div>
          )}
          {display==="carousel" && (
            <div ref={scroller} className="gp-scroll" style={{display:"flex",gap:20,overflowX:"auto",scrollSnapType:"x mandatory",paddingBottom:8,margin:"0 calc(-1*var(--gp-gutter))",paddingLeft:"var(--gp-gutter)",paddingRight:"var(--gp-gutter)"}}>
              {GP_CASES.map((c,i)=>(
                <div key={i} style={{flex:"0 0 340px",scrollSnapAlign:"start"}}><GpCaseCard c={c} idx={i} h={250}/></div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ============================ REVIEWS ============================ */
function GpReviews(){
  const items = [
    {q:"งานดีไซน์สวย ส่งตรงเวลา คุยง่ายมาก ปีหน้าสั่งอีกแน่นอน",n:"คุณเอ",r:"HR Manager, ABC Corp"},
    {q:"AI ช่วยคิดเซ็ตได้ตรงใจมาก ประหยัดเวลาเลือกของไปเยอะ",n:"คุณบี",r:"Marketing Lead, Orbit Agency"},
    {q:"เห็น Mockup ก่อนผลิตทำให้มั่นใจ ไม่ต้องลุ้นว่างานจะพลาด",n:"คุณซี",r:"เจ้าของธุรกิจ, Bloom & Co."},
  ];
  return (
    <section id="reviews" className="gp-section" style={{background:"#fff"}}>
      <div className="gp-wrap">
        <GpReveal style={{textAlign:"center",display:"flex",flexDirection:"column",alignItems:"center",gap:13}}>
          <span className="gp-eyebrow"><span className="dot"/>เสียงจากลูกค้า</span>
          <h2 className="gp-h2" style={{maxWidth:"18ch"}}>ลูกค้า B2B กลัวงานพลาด เราจึงทำให้ไว้ใจได้</h2>
        </GpReveal>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:18,marginTop:42}}>
          {items.map((it,i)=>(
            <GpReveal key={i} delay={i*90}>
              <div className="gp-card" style={{height:"100%",display:"flex",flexDirection:"column",background:i===1?"linear-gradient(165deg,#1F3A5F,#16293F)":"#fff",color:i===1?"#fff":undefined,border:i===1?"none":undefined,position:"relative",overflow:"hidden"}}>
                {i===1 && <div className="gp-dotgrid on-dark" style={{position:"absolute",inset:0,opacity:.4}}/>}
                <div style={{position:"relative"}}>
                  <div style={{display:"flex",gap:3,color:"var(--gp-mustard)",marginBottom:13}}>
                    {[0,1,2,3,4].map(s=><GpIcon key={s} name="star" size={16} stroke="none"/>)}
                  </div>
                  <p style={{fontSize:16,lineHeight:1.6,color:i===1?"#E6EDF6":"var(--gp-ink)",fontFamily:"var(--gp-font-head)",fontWeight:400}}>“{it.q}”</p>
                  <div style={{marginTop:18,display:"flex",alignItems:"center",gap:11}}>
                    <div style={{width:40,height:40,borderRadius:"50%",background:i===1?"rgba(244,189,68,.2)":"var(--gp-mustard-soft)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"var(--gp-font-head)",fontWeight:700,color:i===1?"var(--gp-mustard)":"var(--gp-navy)"}}>{it.n.slice(-1)}</div>
                    <div>
                      <div style={{fontFamily:"var(--gp-font-head)",fontWeight:500,fontSize:13.5,color:i===1?"#fff":"var(--gp-navy)"}}>{it.n}</div>
                      <div style={{fontSize:12,color:i===1?"#9FB2CC":"var(--gp-grey)"}}>{it.r}</div>
                    </div>
                  </div>
                </div>
              </div>
            </GpReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================ RFQ FORM ============================ */
function GpRFQ({ prefill }){
  const [f,setF] = useS({name:"",contact:"",occasion:"ของขวัญปีใหม่พนักงาน",qty:"",date:"",budget:"",details:""});
  const [err,setErr] = useS({});
  const [sent,setSent] = useS(false);
  const ref = useR(null);
  useE(()=>{ if(prefill && prefill.text){ setF(p=>({...p, details: prefill.text})); setSent(false);
    if(prefill.occasion) setF(p=>({...p, occasion: prefill.occasion, details: prefill.text})); } },[prefill]);
  function set(k,v){ setF(p=>({...p,[k]:v})); if(err[k]) setErr(e=>({...e,[k]:null})); }
  function submit(){
    const e={};
    if(!f.name.trim()) e.name="กรุณากรอกชื่อ-บริษัท";
    if(!f.contact.trim()) e.contact="กรุณากรอกอีเมลหรือเบอร์โทร";
    else if(!/^[\d\s+\-()]{8,}$/.test(f.contact) && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.contact)) e.contact="รูปแบบอีเมล/เบอร์ไม่ถูกต้อง";
    setErr(e);
    if(Object.keys(e).length===0) setSent(true);
  }
  return (
    <section id="rfq" ref={ref} className="gp-section" style={{position:"relative",overflow:"hidden",background:"linear-gradient(165deg,#16293F,#1F3A5F)",color:"#fff"}}>
      <div className="gp-dotgrid on-dark" style={{position:"absolute",inset:0,opacity:.5}}/>
      <div style={{position:"absolute",left:"-6%",bottom:"-20%",width:460,height:460,borderRadius:"50%",background:"radial-gradient(circle at 40% 40%, rgba(244,189,68,.28), transparent 62%)",pointerEvents:"none"}}/>
      <div className="gp-wrap" style={{position:"relative",display:"grid",gridTemplateColumns:"1fr 1.1fr",gap:"clamp(28px,4.5vw,72px)",alignItems:"center"}}>
        <div className="gp-rfq-left">
          <span className="gp-eyebrow on-dark"><span className="dot"/>ขอใบเสนอราคา · ปรึกษาฟรี</span>
          <h2 className="gp-h2 on-dark" style={{marginTop:16,maxWidth:"15ch"}}>เริ่มของขวัญชิ้นต่อไปของคุณ</h2>
          <p className="gp-lead on-dark" style={{marginTop:14,maxWidth:"42ch"}}>กรอกข้อมูลสั้นๆ ทีมเราจะตอบกลับพร้อมไอเดียและช่วงราคาภายใน 48 ชม. ปรึกษาฟรี ไม่มีข้อผูกมัด</p>
          <div style={{display:"flex",flexDirection:"column",gap:12,marginTop:26}}>
            {[["shield","นิติบุคคลจดทะเบียน เชื่อถือได้"],["clock","ตอบกลับ + เสนอราคาใน 48 ชม."],["palette","Mockup ก่อนผลิตเสมอ"]].map((x,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:11,color:"#CBD7E8",fontSize:14}}>
                <span style={{width:34,height:34,borderRadius:9,background:"rgba(244,189,68,.15)",color:"var(--gp-mustard)",display:"flex",alignItems:"center",justifyContent:"center",flex:"0 0 auto"}}><GpIcon name={x[0]} size={18}/></span>
                {x[1]}
              </div>
            ))}
          </div>
        </div>

        <div style={{background:"#fff",borderRadius:"var(--gp-radius-lg)",padding:"clamp(22px,3vw,34px)",boxShadow:"var(--gp-shadow)",color:"var(--gp-ink)"}}>
          {sent ? (
            <div style={{textAlign:"center",padding:"24px 8px"}}>
              <div style={{width:64,height:64,borderRadius:"50%",background:"var(--gp-mustard-soft)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 18px"}}>
                <GpIcon name="check" size={34} stroke="var(--gp-navy)" sw={2.4}/>
              </div>
              <h3 style={{fontSize:23,color:"var(--gp-navy)"}}>ได้รับคำขอแล้ว ขอบคุณค่ะ</h3>
              <p style={{fontSize:14,color:"var(--gp-grey)",marginTop:10,maxWidth:"36ch",marginLeft:"auto",marginRight:"auto"}}>
                ทีม GO PREMIUM จะติดต่อกลับที่ <b style={{color:"var(--gp-navy)"}}>{f.contact}</b> พร้อมไอเดียและช่วงราคาภายใน 48 ชม.
              </p>
              <button className="gp-btn gp-btn-ghost" style={{marginTop:22}} onClick={()=>{setSent(false);setF({name:"",contact:"",occasion:"ของขวัญปีใหม่พนักงาน",qty:"",date:"",budget:"",details:""});}}>ส่งคำขอใหม่</button>
            </div>
          ) : (
            <div>
              <h3 style={{fontSize:21,color:"var(--gp-navy)",marginBottom:4}}>แบบฟอร์มขอใบเสนอราคา</h3>
              <p style={{fontSize:12.5,color:"var(--gp-grey)",marginBottom:18}}>ใช้เวลาไม่ถึง 1 นาที · <span style={{color:"var(--gp-danger)"}}>*</span> จำเป็น</p>
              <div className="gp-field" style={{marginBottom:13}}>
                <label className="gp-label">ชื่อ-บริษัท <span style={{color:"var(--gp-danger)"}}>*</span></label>
                <input className={"gp-input"+(err.name?" err":"")} value={f.name} onChange={e=>set("name",e.target.value)} placeholder="เช่น คุณแป้ง · บริษัท ABC"/>
                {err.name && <span className="gp-errmsg">{err.name}</span>}
              </div>
              <div className="gp-field" style={{marginBottom:13}}>
                <label className="gp-label">อีเมล หรือ เบอร์โทร <span style={{color:"var(--gp-danger)"}}>*</span></label>
                <input className={"gp-input"+(err.contact?" err":"")} value={f.contact} onChange={e=>set("contact",e.target.value)} placeholder="you@company.com หรือ 08x-xxx-xxxx"/>
                {err.contact && <span className="gp-errmsg">{err.contact}</span>}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:13,marginBottom:13}}>
                <div className="gp-field">
                  <label className="gp-label">โอกาส / งาน</label>
                  <select className="gp-select" value={f.occasion} onChange={e=>set("occasion",e.target.value)}>
                    <option>ของขวัญปีใหม่พนักงาน</option><option>ของขวัญลูกค้า / คู่ค้า</option>
                    <option>อีเวนต์ / แคมเปญ</option><option>ต้อนรับพนักงานใหม่</option><option>อื่น ๆ</option>
                  </select>
                </div>
                <div className="gp-field"><label className="gp-label">จำนวน (ชิ้น)</label><input className="gp-input" value={f.qty} onChange={e=>set("qty",e.target.value)} placeholder="เช่น 200"/></div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:13,marginBottom:13}}>
                <div className="gp-field"><label className="gp-label">ต้องการรับงาน</label><input className="gp-input" type="date" value={f.date} onChange={e=>set("date",e.target.value)}/></div>
                <div className="gp-field"><label className="gp-label">งบ/ชิ้น (฿)</label><input className="gp-input" value={f.budget} onChange={e=>set("budget",e.target.value)} placeholder="เช่น 300"/></div>
              </div>
              <div className="gp-field" style={{marginBottom:18}}>
                <label className="gp-label">รายละเอียดเพิ่มเติม</label>
                <textarea className="gp-textarea" value={f.details} onChange={e=>set("details",e.target.value)} placeholder="บอกคอนเซ็ปต์หรือสินค้าที่สนใจ"></textarea>
              </div>
              <button className="gp-btn gp-btn-primary gp-btn-lg" style={{width:"100%"}} onClick={submit}>ส่งขอใบเสนอราคา <GpIcon name="arrow" size={17}/></button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ============================ CTA + FOOTER ============================ */
function GpCTA({ onQuote }){
  return (
    <section className="gp-section" style={{background:"var(--gp-cloud)",paddingTop:"clamp(48px,7vw,80px)",paddingBottom:"clamp(48px,7vw,80px)"}}>
      <div className="gp-wrap">
        <div style={{background:"var(--gp-mustard)",borderRadius:"var(--gp-radius-lg)",padding:"clamp(30px,4.5vw,56px)",display:"flex",alignItems:"center",justifyContent:"space-between",gap:24,flexWrap:"wrap",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",right:-60,top:-60,width:240,height:240,borderRadius:"50%",background:"rgba(255,255,255,.22)"}}/>
          <div style={{position:"relative",maxWidth:"30ch"}}>
            <h2 style={{fontSize:"clamp(26px,3.2vw,40px)",color:"var(--gp-navy)",letterSpacing:"-.02em"}}>พร้อมเริ่มของขวัญชิ้นต่อไปแล้วหรือยัง</h2>
            <p style={{color:"#6B4E08",fontSize:16,marginTop:10}}>ปรึกษาฟรี พร้อม Mockup ก่อนผลิต — หรือให้ AI ช่วยคิดเซ็ตให้ก่อนก็ได้</p>
          </div>
          <div style={{position:"relative",display:"flex",gap:12,flexWrap:"wrap"}}>
            <button className="gp-btn gp-btn-secondary gp-btn-lg" onClick={onQuote}>คุยกับเราเลย</button>
            <button className="gp-btn gp-btn-ghost gp-btn-lg" style={{borderColor:"rgba(31,58,95,.3)",color:"var(--gp-navy)"}} onClick={()=>gpScrollTo("ai")}><GpSpark size={16}/> ลอง AI Concierge</button>
          </div>
        </div>
      </div>
    </section>
  );
}

function GpFooter(){
  return (
    <footer style={{background:"var(--gp-navy-900)",color:"#C7D4E6"}}>
      <div className="gp-wrap" style={{paddingTop:54,paddingBottom:30}}>
        <div style={{display:"grid",gridTemplateColumns:"1.4fr 1fr 1fr 1fr",gap:32}} className="gp-foot-grid">
          <div>
            <GpLogo width={166} tone="light"/>
            <p style={{fontSize:13.5,marginTop:16,maxWidth:"30ch",lineHeight:1.7,color:"#9FB2CC"}}>มากกว่าของขวัญ คือประสบการณ์ที่น่าจดจำ — ผู้ออกแบบและผลิตของพรีเมียมสำหรับองค์กร</p>
          </div>
          {[
            {h:"สำรวจ",links:[["AI Concierge","ai"],["ผลงาน","portfolio"],["สินค้า & บริการ","products"],["วิธีสั่งทำ","how"]]},
            {h:"บริษัท",links:[["รีวิวลูกค้า","reviews"],["ขอใบเสนอราคา","rfq"]]},
          ].map((col,i)=>(
            <div key={i}>
              <div style={{fontFamily:"var(--gp-font-head)",fontWeight:500,color:"#fff",fontSize:14,marginBottom:13}}>{col.h}</div>
              <div style={{display:"flex",flexDirection:"column",gap:9}}>
                {col.links.map((l,j)=>(<a key={j} href={"#"+l[1]} onClick={e=>{e.preventDefault();gpScrollTo(l[1]);}} style={{fontSize:13.5,color:"#9FB2CC",cursor:"pointer"}}>{l[0]}</a>))}
              </div>
            </div>
          ))}
          <div>
            <div style={{fontFamily:"var(--gp-font-head)",fontWeight:500,color:"#fff",fontSize:14,marginBottom:13}}>ติดต่อ</div>
            <div style={{display:"flex",flexDirection:"column",gap:9,fontSize:13.5,color:"#9FB2CC"}}>
              <span>02-096-6465</span>
              <span>info@passiongrow.co.th</span>
              <span>@gopremium</span>
            </div>
          </div>
        </div>
        <div style={{borderTop:"1px solid rgba(255,255,255,.12)",marginTop:34,paddingTop:20,display:"flex",justifyContent:"space-between",gap:16,flexWrap:"wrap",fontSize:12,color:"#7E92AE"}}>
          <span>© 2026 PASSION GROW TRADING CO., LTD. · All rights reserved.</span>
          <span style={{display:"inline-flex",alignItems:"center",gap:6}}><GpSpark size={12}/> ขับเคลื่อนประสบการณ์ด้วย AI</span>
        </div>
      </div>
    </footer>
  );
}

/* ============================ FLOATING ACTIONS ============================ */
function GpFloating({ onQuote }){
  const [show,setShow] = useS(false);
  useE(()=>{ const h=()=>setShow(window.scrollY>620); h(); window.addEventListener("scroll",h,{passive:true}); return ()=>window.removeEventListener("scroll",h); },[]);
  return (
    <div style={{position:"fixed",right:"clamp(16px,2.5vw,28px)",bottom:"clamp(16px,2.5vw,28px)",zIndex:45,display:"flex",flexDirection:"column",gap:12,alignItems:"flex-end",
      opacity:show?1:0,transform:show?"none":"translateY(16px)",pointerEvents:show?"auto":"none",transition:".3s"}}>
      <button onClick={()=>gpScrollTo("ai")} style={{display:"inline-flex",alignItems:"center",gap:8,background:"#fff",color:"var(--gp-navy)",border:"1px solid var(--gp-grey-200)",borderRadius:99,padding:"11px 17px",fontFamily:"var(--gp-font-head)",fontWeight:500,fontSize:14,boxShadow:"var(--gp-shadow-md)",cursor:"pointer"}}>
        <GpSpark size={15} style={{color:"var(--gp-mustard-deep)"}}/> ถาม AI
      </button>
      <button onClick={onQuote} aria-label="chat" style={{display:"inline-flex",alignItems:"center",gap:9,background:"#06C755",color:"#fff",border:"none",borderRadius:99,padding:"13px 20px",fontFamily:"var(--gp-font-head)",fontWeight:600,fontSize:15,boxShadow:"0 14px 30px -10px rgba(6,199,85,.6)",cursor:"pointer"}}>
        <GpIcon name="chat" size={20} stroke="#fff" sw={2}/> แชต LINE
      </button>
    </div>
  );
}

Object.assign(window, { GpProducts, GpPortfolio, GpReviews, GpRFQ, GpCTA, GpFooter, GpFloating });
