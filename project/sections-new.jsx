// sections-new.jsx — Occasion, Budget, Category, Services sections (UI Kit 2026)
const { useState: useStateN, useRef: useRefN } = React;

/* ============================
   OCCASION SECTION
   เลือกตามโอกาส
   ============================ */
function GpOccasion({ onQuote }) {
  const occasions = [
    {
      id:"occ-0", title:"ของขวัญปีใหม่",
      desc:"กิฟต์เซ็ตและของพรีเมียมสำหรับมอบพนักงาน ลูกค้า และคู่ค้าช่วงปลายปี",
      from:"120", gradient:"linear-gradient(135deg,#1F3A5F,#2C4F7C)",
      badge:"พีคสุด",
    },
    {
      id:"occ-1", title:"ชุดต้อนรับพนักงานใหม่",
      desc:"Welcome kit สร้างความประทับใจวันแรก เสริมภาพลักษณ์องค์กร",
      from:"250", gradient:"linear-gradient(135deg,#2C4F7C,#3E689B)",
      badge:null,
    },
    {
      id:"occ-2", title:"ของขวัญลูกค้า VIP",
      desc:"ของพรีเมียมระดับผู้บริหาร แพ็กเกจหรู สื่อถึงความใส่ใจ",
      from:"1,000", gradient:"linear-gradient(135deg,#16293F,#1F3A5F)",
      badge:"Exclusive",
    },
    {
      id:"occ-3", title:"งานอีเวนต์ & สัมมนา",
      desc:"ของแจกพิมพ์โลโก้ พร้อมส่งทันงาน เหมาะกับงานจำนวนมาก",
      from:"35", gradient:"linear-gradient(135deg,#244873,#1F3A5F)",
      badge:null,
    },
    {
      id:"occ-4", title:"ครบรอบ & Milestone",
      desc:"ของที่ระลึกพิเศษเฉพาะวาระ ดีไซน์สั่งทำ สะท้อนความสำเร็จ",
      from:"500", gradient:"linear-gradient(135deg,#1F3A5F,#16293F)",
      badge:"Custom",
    },
    {
      id:"occ-5", title:"ของขวัญรักษ์โลก",
      desc:"วัสดุรีไซเคิล เล่าเรื่อง ESG ขององค์กร เทรนด์ 2026",
      from:"120", gradient:"linear-gradient(135deg,#2F4A3A,#3E689B)",
      badge:"Eco",
    },
  ];

  return (
    <section id="occasion" className="gp-section" style={{background:"var(--gp-cloud)"}}>
      <div className="gp-wrap">
        <GpReveal style={{display:"flex",flexDirection:"column",gap:13,maxWidth:"56ch",marginBottom:36}}>
          <span className="gp-eyebrow"><span className="dot"/>เลือกตามโอกาส</span>
          <h2 className="gp-h2">ของขวัญที่ใช่<br/>สำหรับทุกโอกาส</h2>
          <p className="gp-lead">ไม่รู้จะเริ่มจากไหน? เลือกโอกาสของคุณ — เราแนะนำสินค้าและดีไซน์ที่เหมาะสมให้ทันที</p>
        </GpReveal>

        <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:18}}>
          {occasions.map((occ, i) => (
            <GpReveal key={occ.id} delay={i * 60}>
              <div style={{
                background:"#fff", border:"1px solid var(--gp-grey-200)",
                borderRadius:"var(--gp-radius)", overflow:"hidden",
                boxShadow:"var(--gp-shadow-sm)", display:"flex", flexDirection:"column",
              }}>
                {/* Colour header with image-slot */}
                <div style={{position:"relative", height:120}}>
                  <div style={{position:"absolute",inset:0,background:occ.gradient}}/>
                  <image-slot
                    id={occ.id}
                    shape="rect"
                    placeholder="ลากรูปผลงานมาวาง"
                    style={{position:"absolute",inset:0,width:"100%",height:"100%",display:"block",zIndex:1}}
                  ></image-slot>
                  {occ.badge && (
                    <span className="gp-badge gp-badge-glass" style={{
                      position:"absolute", top:10, left:12, zIndex:2,
                      fontSize:10, padding:"3px 9px",
                    }}>{occ.badge}</span>
                  )}
                </div>
                {/* Body */}
                <div style={{padding:"14px 16px 18px", flex:1, display:"flex", flexDirection:"column", gap:6}}>
                  <h4 style={{fontSize:16, color:"var(--gp-navy)"}}>{occ.title}</h4>
                  <p style={{fontSize:12.5, color:"var(--gp-grey)", lineHeight:1.55, flex:1}}>{occ.desc}</p>
                  <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:8}}>
                    <span style={{fontFamily:"var(--gp-font-head)", fontWeight:600, fontSize:13.5, color:"var(--gp-navy)"}}>
                      เริ่ม ฿{occ.from} <span style={{fontWeight:400, fontSize:11, color:"var(--gp-grey)"}}>/ชิ้น</span>
                    </span>
                    <button className="gp-btn gp-btn-ghost gp-btn-sm" onClick={onQuote}>ดูไอเดีย</button>
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

/* ============================
   BUDGET SECTION
   เลือกตามงบ
   ============================ */
function GpBudget({ onQuote }) {
  const tiers = [
    {
      label:"เริ่มต้น", badgeClass:"gp-badge-navy",
      range:"ไม่เกิน 60 THB",
      desc:"เหมาะกับของแจกงานอีเวนต์ จำนวนมาก MOQ 300+ ชิ้น",
      items:["ปากกาพิมพ์โลโก้","กระเป๋าผ้าสปันบอนด์","แมสก์ปรับแต่ง","พวงกุญแจ"],
      highlight:false,
    },
    {
      label:"คุ้มค่า", badgeClass:"gp-badge-navy",
      range:"ไม่เกิน 200 THB",
      desc:"ของพนักงาน/ลูกค้าทั่วไป ดูดีในงบที่คุมได้ MOQ 100+ ชิ้น",
      items:["กระบอกน้ำสเตนเลส","กระเป๋าผ้าแคนวาส","สมุดโน้ต PU","เซ็ตเครื่องเขียน"],
      highlight:false,
    },
    {
      label:"ระดับกลาง", badgeClass:"gp-badge-mustard",
      range:"300–800 THB",
      desc:"กิฟต์เซ็ตดีไซน์เฉพาะพร้อมแพ็กเกจ MOQ 50+ ชิ้น",
      items:["กิฟต์เซ็ตกระบอกน้ำ + สมุด","เซ็ตของใช้สำนักงาน","ถุงของขวัญพรีเมียม","แก้ว Borosilicate"],
      highlight:true,
    },
    {
      label:"ผู้บริหาร", badgeClass:"gp-badge-mustard",
      range:"1,000 THB ขึ้นไป",
      desc:"ของขวัญ VIP แพ็กเกจหรู สลักชื่อ MOQ ยืดหยุ่น",
      items:["กล่องหนังหรูสลักชื่อ","กระเป๋าหนังพรีเมียม","เซ็ตไวน์/ชา","ของที่ระลึกพิเศษ"],
      highlight:false,
    },
  ];

  return (
    <section id="budget" className="gp-section" style={{background:"#fff"}}>
      <div className="gp-wrap">
        <GpReveal style={{display:"flex",flexDirection:"column",gap:13,maxWidth:"56ch",marginBottom:36}}>
          <span className="gp-eyebrow"><span className="dot"/>เลือกตามงบ</span>
          <h2 className="gp-h2">งบเท่าไหร่<br/>ก็มีของขวัญที่ใช่</h2>
          <p className="gp-lead">เราไม่ใช้คำว่า "งบน้อย" — ทุกงบมีของขวัญที่ดูดีและน่าจดจำในแบบของมัน</p>
        </GpReveal>

        <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:16}}>
          {tiers.map((tier, i) => (
            <GpReveal key={i} delay={i * 70}>
              <div style={{
                background: tier.highlight ? "linear-gradient(165deg,#1F3A5F,#16293F)" : "#fff",
                border: tier.highlight ? "none" : "1px solid var(--gp-grey-200)",
                borderRadius:"var(--gp-radius)",
                padding:20,
                boxShadow: tier.highlight ? "var(--gp-shadow)" : "var(--gp-shadow-sm)",
                height:"100%", display:"flex", flexDirection:"column", gap:14,
                position:"relative", overflow:"hidden",
              }}>
                {tier.highlight && (
                  <div className="gp-dotgrid on-dark" style={{position:"absolute",inset:0,opacity:.45}}/>
                )}
                <div style={{position:"relative"}}>
                  <span className={"gp-badge " + tier.badgeClass} style={{fontSize:10}}>{tier.label}</span>
                  <div style={{
                    fontFamily:"var(--gp-font-head)", fontWeight:700, fontSize:22,
                    color: tier.highlight ? "#fff" : "var(--gp-navy)", marginTop:10, lineHeight:1.2,
                  }}>{tier.range}</div>
                  <p style={{
                    fontSize:12.5, lineHeight:1.55, marginTop:8,
                    color: tier.highlight ? "#B9C6DA" : "var(--gp-grey)",
                  }}>{tier.desc}</p>

                  <div style={{marginTop:12, display:"flex", flexDirection:"column", gap:5}}>
                    {tier.items.map((item, j) => (
                      <div key={j} style={{
                        display:"flex", alignItems:"center", gap:7,
                        fontSize:12, color: tier.highlight ? "#CBD7E8" : "var(--gp-ink)",
                      }}>
                        <span style={{
                          width:5, height:5, borderRadius:2,
                          background: tier.highlight ? "var(--gp-mustard)" : "var(--gp-mustard-deep)",
                          flexShrink:0,
                        }}/>
                        {item}
                      </div>
                    ))}
                  </div>

                  <button
                    className={"gp-btn gp-btn-sm " + (tier.highlight ? "gp-btn-primary" : "gp-btn-ghost")}
                    onClick={onQuote}
                    style={{width:"100%", justifyContent:"center", marginTop:16}}
                  >ขอราคา</button>
                </div>
              </div>
            </GpReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================
   CATEGORY SECTION
   ประเภทสินค้า
   ============================ */
function GpCategory({ onQuote }) {
  const cats = [
    {id:"cat-0", label:"ขายดี", badgeClass:"gp-badge-mustard", name:"แก้วน้ำ & กระบอกน้ำ", moq:"MOQ 100"},
    {id:"cat-1", label:"พิมพ์โลโก้ได้", badgeClass:"gp-badge-navy", name:"กระเป๋า & ถุงผ้า", moq:"MOQ 150"},
    {id:"cat-2", label:"รักษ์โลก", badgeClass:"gp-badge-mustard", name:"กิฟต์เซ็ต", moq:"MOQ 50"},
    {id:"cat-3", label:"เหมาะกับองค์กร", badgeClass:"gp-badge-navy", name:"แกดเจ็ต & ไอที", moq:"MOQ 80"},
    {id:"cat-4", label:"พิมพ์โลโก้ได้", badgeClass:"gp-badge-navy", name:"ร่มพรีเมียม", moq:"MOQ 100"},
    {id:"cat-5", label:"ขายดี", badgeClass:"gp-badge-mustard", name:"เครื่องเขียน & สำนักงาน", moq:"MOQ 100"},
  ];

  return (
    <section id="category" className="gp-section" style={{background:"var(--gp-cloud)"}}>
      <div className="gp-wrap">
        <GpReveal style={{display:"flex",flexDirection:"column",gap:13,maxWidth:"56ch",marginBottom:36}}>
          <span className="gp-eyebrow"><span className="dot"/>ประเภทสินค้า</span>
          <h2 className="gp-h2">รู้ว่าอยากได้อะไร?<br/>เลือกเลย</h2>
          <p className="gp-lead">สินค้าทุกชิ้นพิมพ์โลโก้ได้ ปรับสีตามแบรนด์ และมี Mockup ให้ดูก่อนผลิตทุกออเดอร์</p>
        </GpReveal>

        <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:16}}>
          {cats.map((cat, i) => (
            <GpReveal key={cat.id} delay={i * 55}>
              <div style={{
                background:"#fff", border:"1px solid var(--gp-grey-200)",
                borderRadius:"var(--gp-radius)", overflow:"hidden",
                boxShadow:"var(--gp-shadow-sm)", textAlign:"center",
              }}>
                {/* Image slot */}
                <div style={{position:"relative", height:110, background:"var(--gp-cloud-2)"}}>
                  <image-slot
                    id={cat.id}
                    shape="rect"
                    placeholder="รูปสินค้า"
                    style={{position:"absolute",inset:0,width:"100%",height:"100%",display:"block"}}
                  ></image-slot>
                </div>
                <div style={{padding:"12px 14px 16px"}}>
                  <span className={"gp-badge " + cat.badgeClass} style={{fontSize:9.5}}>{cat.label}</span>
                  <h4 style={{fontSize:14.5, color:"var(--gp-navy)", margin:"8px 0 3px"}}>{cat.name}</h4>
                  <p style={{fontSize:11.5, color:"var(--gp-grey)", marginBottom:10}}>{cat.moq}</p>
                  <button className="gp-btn gp-btn-ghost gp-btn-sm" onClick={onQuote}
                    style={{width:"100%", justifyContent:"center"}}>ดูสินค้า & ขอราคา</button>
                </div>
              </div>
            </GpReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================
   SERVICES SECTION
   บริการเสริม (UI Kit 2026)
   ============================ */
function GpServices({ onQuote }) {
  const svcs = [
    {
      icon:(
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="14" rx="2"/><path d="M3 9h18"/>
        </svg>
      ),
      title:"Mockup ก่อนผลิต",
      desc:"เห็นภาพงานจริงก่อนเริ่มผลิต ลดความเสี่ยงเรื่องสี โลโก้ และองค์ประกอบแบรนด์",
      ai:true,
    },
    {
      icon:(
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/>
        </svg>
      ),
      title:"พิมพ์โลโก้ & ปรับดีไซน์",
      desc:"ปรับสีและดีไซน์ให้เข้ากับแบรนด์ลูกค้าอย่างพิถีพิถัน ใช้ AI ช่วยขึ้น Mockup ไวขึ้น",
      ai:false,
    },
    {
      icon:(
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 7h16v13H4z"/><path d="M4 7l2-3h12l2 3M12 4v16"/>
        </svg>
      ),
      title:"จัดเซ็ตของขวัญ (Curation)",
      desc:"คัดและจัดหลายชิ้นเป็นเซ็ตเดียว เพิ่มมูลค่าและความน่าจดจำ เล่าเรื่องแบรนด์คุณ",
      ai:false,
    },
    {
      icon:(
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 8l9-5 9 5-9 5z"/><path d="M3 8v8l9 5 9-5V8"/>
        </svg>
      ),
      title:"ออกแบบกล่อง & แพ็กเกจ",
      desc:"กล่อง การ์ดขอบคุณ และแท็กแบรนด์ ให้ของขวัญดูสมบูรณ์และน่าแกะ",
      ai:false,
    },
    {
      icon:(
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="6" width="15" height="11"/><path d="M16 10h4l3 3v4h-7M5.5 19a2 2 0 100-1M18.5 19a2 2 0 100-1"/>
        </svg>
      ),
      title:"แพ็ก & จัดส่งรายคน",
      desc:"Kitting & fulfillment ส่งตรงถึงพนักงานหรือลูกค้าแต่ละคน หลายสาขาก็ทำได้",
      ai:false,
    },
    {
      icon:(
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2l2.4 7.4H22l-6 4.5 2.3 7.1L12 16.8 5.7 21l2.3-7.1-6-4.5h7.6z"/>
        </svg>
      ),
      title:"งานด่วน 7–14 วัน",
      desc:"สำหรับองค์กรที่มี deadline ชัด พร้อมผลิตและส่งมอบตรงเวลาทุกออเดอร์",
      ai:false,
    },
  ];

  return (
    <section id="services" className="gp-section" style={{background:"#fff"}}>
      <div className="gp-wrap">
        <GpReveal style={{
          display:"flex", alignItems:"flex-end", justifyContent:"space-between",
          gap:24, flexWrap:"wrap", marginBottom:36,
        }}>
          <div style={{display:"flex",flexDirection:"column",gap:13,maxWidth:"52ch"}}>
            <span className="gp-eyebrow"><span className="dot"/>บริการเสริม</span>
            <h2 className="gp-h2">ครบทุกบริการ<br/>จบในที่เดียว</h2>
            <p className="gp-lead">GO PREMIUM ไม่ใช่แค่ร้านขายของ — เราเป็น partner ที่ดูแลตั้งแต่ไอเดียจนถึงมือผู้รับ</p>
          </div>
          <button className="gp-btn gp-btn-primary" onClick={onQuote}>ปรึกษาฟรี</button>
        </GpReveal>

        <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:16}}>
          {svcs.map((svc, i) => (
            <GpReveal key={i} delay={i * 55}>
              <div style={{
                background:"var(--gp-cloud)", border:"1px solid var(--gp-grey-200)",
                borderRadius:"var(--gp-radius)", padding:20,
              }}>
                <div style={{
                  width:46, height:46, borderRadius:12,
                  background: svc.ai ? "var(--gp-mustard-soft)" : "#fff",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  color:"var(--gp-navy)", marginBottom:12,
                  border:"1px solid var(--gp-grey-200)",
                }}>
                  {svc.icon}
                </div>
                <h4 style={{fontSize:15, color:"var(--gp-navy)", display:"flex", alignItems:"center", gap:7}}>
                  {svc.title}
                  {svc.ai && (
                    <span className="gp-badge gp-badge-ai" style={{fontSize:9, padding:"2px 7px"}}>
                      <GpSpark size={10}/> AI
                    </span>
                  )}
                </h4>
                <p style={{fontSize:13, color:"var(--gp-grey)", marginTop:5, lineHeight:1.6}}>{svc.desc}</p>
              </div>
            </GpReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { GpOccasion, GpBudget, GpCategory, GpServices });
