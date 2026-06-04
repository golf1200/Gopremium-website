// sections-top.jsx — shared helpers + Nav, Hero, Trust, HowItWorks
const { useState: useStateT, useEffect: useEffectT, useRef: useRefT } = React;

/* ---------- smooth scroll ---------- */
function gpScrollTo(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const y = el.getBoundingClientRect().top + window.scrollY - 74;
  window.scrollTo({ top: y, behavior: "smooth" });
}

/* ---------- Logo — image-slot so real logo can be dropped in ---------- */
function GpLogo({ width = 168, tone = "navy" }) {
  const h = Math.round(width * 44 / 230);
  const color = tone === "light" ? "#fff" : "var(--gp-navy)";
  /* Fallback text logo shown beneath the slot until an image is dropped */
  return (
    <div style={{ position: "relative", width: width + "px", height: h + "px", flexShrink: 0, display: "flex", alignItems: "center" }}>
      {/* text fallback — always present, hidden by image once dropped */}
      <div aria-hidden="true" style={{
        position: "absolute", inset: 0, display: "flex", alignItems: "center", gap: 0,
        fontFamily: "var(--gp-font-head)", fontWeight: 800,
        fontSize: Math.round(h * 0.56) + "px", letterSpacing: "-.03em",
        pointerEvents: "none", userSelect: "none", color
      }}>
        <span style={{
          background: "var(--gp-mustard)", color: "var(--gp-navy)",
          borderRadius: 6, padding: "0 7px", marginRight: 7, lineHeight: 1.4
        }}>GO</span>
        <span>PREMIUM</span>
      </div>
      {/* drop target — becomes visible when logo image is loaded */}
      <image-slot
        id="nav-logo"
        shape="rect"
        placeholder="วางโลโก้ที่นี่"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block", zIndex: 1 }}>
      </image-slot>
    </div>);

}

/* ---------- icon set ---------- */
function GpIcon({ name, size = 22, stroke = "currentColor", sw = 1.8 }) {
  const p = {
    chat: "M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7A8.38 8.38 0 0 1 4 11.5 8.5 8.5 0 0 1 12.5 3 8.38 8.38 0 0 1 21 11.5Z",
    palette: "M12 21a9 9 0 1 1 0-18c4.97 0 9 3.58 9 8 0 2.5-2 4-4 4h-2a2 2 0 0 0-1.5 3.3A1.5 1.5 0 0 1 12 21Z",
    box: "M21 8 12 3 3 8l9 5 9-5Zm0 0v8l-9 5-9-5V8",
    truck: "M3 7h11v8H3V7Zm11 3h4l3 3v2h-7v-5ZM7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm10 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
    shield: "M12 3 5 6v5c0 4.2 2.9 8 7 9 4.1-1 7-4.8 7-9V6l-7-3Z",
    clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-14v5l3 2",
    star: "M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17l-5.2 2.7 1-5.8L3.5 9.7l5.9-.9L12 3.5Z",
    check: "M20 6 9 17l-5-5",
    arrow: "M5 12h14M13 6l6 6-6 6",
    bulb: "M9 18h6m-5 3h4M12 3a6 6 0 0 1 4 10.5c-.7.6-1 1.2-1 2.5H9c0-1.3-.3-1.9-1-2.5A6 6 0 0 1 12 3Z",
    leaf: "M5 21c0-9 5-14 14-14 0 9-5 14-14 14Zm0 0c2.5-5 5.5-7 9-8.5",
    layers: "M12 3 3 8l9 5 9-5-9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5"
  }[name] || "";
  const fillFor = name === "star" ? "currentColor" : "none";
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fillFor} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={p} />
    </svg>);

}

/* ---------- reveal-on-scroll wrapper ---------- */
function GpReveal({ children, delay = 0, as = "div", className = "", style }) {
  const ref = useRefT(null);
  useEffectT(() => {
    const el = ref.current;if (!el) return;
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => {if (e.isIntersecting) {el.classList.add("in");io.unobserve(el);}});
    }, { threshold: .14 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const Tag = as;
  return <Tag ref={ref} className={"gp-reveal " + className} style={{ transitionDelay: delay + "ms", ...style }}>{children}</Tag>;
}

/* ============================ NAV ============================ */
function GpNav({ onQuote }) {
  const [scrolled, setScrolled] = useStateT(false);
  const [open, setOpen] = useStateT(false);
  useEffectT(() => {
    const h = () => setScrolled(window.scrollY > 16);
    h();window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  const links = [
  { l: "AI Concierge", id: "ai" },
  { l: "สินค้าพร้อมส่ง", id: "products" },
  { l: "เลือกตามโอกาส", id: "occasion" },
  { l: "เลือกตามงบ", id: "budget" },
  { l: "ผลงานของเรา", id: "portfolio" }];

  return (
    <header style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, transition: ".25s" }}>
      <div style={{
        background: scrolled ? "rgba(255,255,255,.82)" : "rgba(255,255,255,0)",
        backdropFilter: scrolled ? "blur(14px)" : "none",
        borderBottom: scrolled ? "1px solid var(--gp-grey-200)" : "1px solid transparent",
        boxShadow: scrolled ? "0 6px 24px -18px rgba(31,58,95,.5)" : "none",
        transition: ".25s"
      }}>
        <div className="gp-wrap" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 68 }}>
          <a href="#top" onClick={(e) => {e.preventDefault();window.scrollTo({ top: 0, behavior: "smooth" });}} style={{ display: "flex", alignItems: "center" }}>
            <GpLogo width={150} />
          </a>
          <nav className="gp-nav-links" style={{ display: "flex", alignItems: "center", gap: 22 }}>
            {links.map((x) =>
            <a key={x.id} href={"#" + x.id} onClick={(e) => {e.preventDefault();gpScrollTo(x.id);}}
            style={{ fontFamily: "var(--gp-font-head)", fontSize: 14.5, fontWeight: 500, color: "var(--gp-navy)", cursor: "pointer", transition: ".15s", whiteSpace: "nowrap" }}
            onMouseEnter={(e) => e.currentTarget.style.color = "var(--gp-mustard-deep)"}
            onMouseLeave={(e) => e.currentTarget.style.color = "var(--gp-navy)"}>{x.l}</a>
            )}
            <button className="gp-btn gp-btn-primary gp-btn-sm" onClick={onQuote}>ขอใบเสนอราคา</button>
          </nav>
          <button className="gp-nav-burger" onClick={() => setOpen((o) => !o)} aria-label="menu"
          style={{ display: "none", background: "none", border: "none", padding: 8 }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--gp-navy)" strokeWidth="2"><path d={open ? "M6 6l12 12M6 18 18 6" : "M3 6h18M3 12h18M3 18h18"} /></svg>
          </button>
        </div>
        {open &&
        <div className="gp-wrap" style={{ paddingBottom: 16, display: "flex", flexDirection: "column", gap: 4 }}>
            {links.map((x) =>
          <a key={x.id} href={"#" + x.id} onClick={(e) => {e.preventDefault();setOpen(false);gpScrollTo(x.id);}}
          style={{ fontFamily: "var(--gp-font-head)", fontSize: 16, fontWeight: 500, color: "var(--gp-navy)", padding: "11px 4px", borderBottom: "1px solid var(--gp-grey-200)" }}>{x.l}</a>
          )}
            <button className="gp-btn gp-btn-primary" style={{ marginTop: 10 }} onClick={() => {setOpen(false);onQuote && onQuote();}}>ขอใบเสนอราคา</button>
          </div>
        }
      </div>
    </header>);

}

/* ============================ HERO ============================ */
function GpHero({ layout = "split", vibe = "safe", onQuote }) {
  const [hq, setHq] = useStateT("");
  const bold = vibe === "bold";
  function runAI() {
    const t = hq.trim() || "ของขวัญปีใหม่พนักงาน 200 คน งบ 300฿ สายมินิมอล";
    gpScrollTo("ai");
    setTimeout(() => window.dispatchEvent(new CustomEvent("gp-ai-run", { detail: { query: t } })), 480);
  }

  const eyebrow = <span className="gp-eyebrow"><span className="dot" />ของขวัญองค์กร · ดีไซน์เฉพาะแบรนด์คุณ</span>;
  const headline =
  <h1 style={{
    fontSize: bold ? "clamp(40px,6.4vw,82px)" : "clamp(34px,5.2vw,66px)",
    color: "var(--gp-navy)", letterSpacing: "-.025em", marginTop: 18,
    fontWeight: bold ? 600 : 600, textWrap: "balance", lineHeight: "1", height: "212px"
  }}>
      มากกว่าของขวัญ<br />
      คือ<span style={{ position: "relative", whiteSpace: "nowrap" }}>
        <span style={{ color: "var(--gp-mustard-deep)" }}>ประสบการณ์</span>
      </span>ที่น่าจดจำ
    </h1>;

  const lead =
  <p className="gp-lead" style={{ marginTop: 18, maxWidth: "46ch", fontSize: bold ? "clamp(17px,1.5vw,20px)" : undefined }}>
      เราออกแบบและผลิตของพรีเมียมที่สะท้อนแบรนด์คุณ ครบตั้งแต่คอนเซ็ปต์ ดีไซน์ ผลิต ถึงส่งมอบ — และตอนนี้มี <b style={{ color: "var(--gp-navy)" }}>AI ช่วยคิดเซ็ตของขวัญ</b> ให้คุณในไม่กี่วินาที
    </p>;

  const ctas =
  <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 26, alignItems: "center" }}>
      <button className="gp-btn gp-btn-primary gp-btn-lg" onClick={onQuote}>ขอใบเสนอราคา <GpIcon name="arrow" size={17} /></button>
      <button className="gp-btn gp-btn-ghost gp-btn-lg" onClick={() => gpScrollTo("portfolio")}>ดูผลงานจริง</button>
    </div>;

  const aiBar =
  <div style={{ marginTop: 26, maxWidth: 560 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8, fontSize: 12.5, color: "var(--gp-grey)", fontFamily: "var(--gp-font-head)" }}>
        <GpSpark size={13} style={{ color: "var(--gp-mustard-deep)" }} /> ลองให้ AI ช่วยคิดของขวัญ — พิมพ์โจทย์ของคุณ
      </div>
      <div style={{ display: "flex", gap: 8, background: "#fff", border: "1.5px solid var(--gp-grey-200)", borderRadius: 14, padding: 7, boxShadow: "var(--gp-shadow-sm)" }}>
        <input className="gp-input" value={hq} onChange={(e) => setHq(e.target.value)} onKeyDown={(e) => {if (e.key === "Enter") runAI();}}
      placeholder="เช่น ของขวัญลูกค้า VIP 50 ชุด ดูหรู" style={{ border: "none", boxShadow: "none", flex: 1, minWidth: 0 }} />
        <button className="gp-btn gp-btn-secondary" onClick={runAI} style={{ flex: "0 0 auto" }}><GpSpark size={15} /> ถาม AI</button>
      </div>
    </div>;

  const stats =
  <div style={{ display: "flex", gap: 26, flexWrap: "wrap", marginTop: 34 }}>
      {[["500+", "ชิ้นงานส่งมอบ"], ["48 ชม.", "ตอบกลับ + เสนอราคา"], ["100%", "Mockup ก่อนผลิต"]].map((s, i) =>
    <div key={i}>
          <div style={{ fontFamily: "var(--gp-font-head)", fontWeight: 700, fontSize: 24, color: "var(--gp-navy)" }}>{s[0]}</div>
          <div style={{ fontSize: 12.5, color: "var(--gp-grey)" }}>{s[1]}</div>
        </div>
    )}
    </div>;


  /* visual panel for split layout */
  const visual =
  <div style={{ position: "relative" }}>
      <image-slot id="hero-main" shape="rounded" radius="22"
    placeholder="ลากรูปงานเด่นมาวางที่นี่"
    style={{ width: "100%", height: "min(560px,62vh)", boxShadow: "var(--gp-shadow)" }}></image-slot>
      {/* floating AI result chip */}
      <div style={{
      position: "absolute", left: -18, bottom: 34, background: "#fff", borderRadius: 16, padding: "13px 15px",
      boxShadow: "var(--gp-shadow-md)", width: 212, border: "1px solid var(--gp-grey-200)"
    }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11.5, color: "var(--gp-mustard-deep)", fontFamily: "var(--gp-font-head)", fontWeight: 600, whiteSpace: "nowrap" }}>
          <GpSpark size={12} /> AI แนะนำ
        </div>
        <div style={{ fontFamily: "var(--gp-font-head)", fontWeight: 600, fontSize: 14.5, color: "var(--gp-navy)", marginTop: 5 }}>เซ็ตรักษ์โลก Everyday</div>
        <div style={{ fontSize: 11.5, color: "var(--gp-grey)", marginTop: 2 }}>กระบอกน้ำ · กระเป๋าผ้า · สมุดรีไซเคิล</div>
        <div style={{ fontFamily: "var(--gp-font-head)", fontWeight: 600, fontSize: 13, color: "var(--gp-navy)", marginTop: 7 }}>฿255–420 <span style={{ fontWeight: 400, color: "var(--gp-grey)", fontSize: 11 }}>/ชุด</span></div>
      </div>
      {/* floating rating chip */}
      <div style={{ position: "absolute", right: -12, top: 26, background: "var(--gp-navy)", color: "#fff", borderRadius: 14, padding: "11px 14px", boxShadow: "var(--gp-shadow-md)" }}>
        <div style={{ display: "flex", gap: 3, color: "var(--gp-mustard)" }}>
          {[0, 1, 2, 3, 4].map((i) => <GpIcon key={i} name="star" size={13} stroke="none" />)}
        </div>
        <div style={{ fontSize: 11.5, color: "#C7D4E6", marginTop: 4 }}>“ส่งตรงเวลา คุยง่ายมาก”</div>
      </div>
    </div>;


  return (
    <section id="top" style={{ position: "relative", overflow: "hidden", paddingTop: 118, paddingBottom: "clamp(48px,7vw,88px)", background: "linear-gradient(180deg,#FBFCFD 0%, var(--gp-cloud) 100%)" }}>
      <div className="gp-dotgrid" style={{ position: "absolute", inset: 0, opacity: .5, maskImage: "radial-gradient(120% 90% at 70% 0%, #000 30%, transparent 75%)", WebkitMaskImage: "radial-gradient(120% 90% at 70% 0%, #000 30%, transparent 75%)" }} />
      <div style={{ position: "absolute", right: "-8%", top: "-12%", width: 520, height: 520, borderRadius: "50%", background: "radial-gradient(circle at 35% 35%, rgba(244,189,68,.30), transparent 60%)", pointerEvents: "none" }} />
      <div className="gp-wrap" style={{ position: "relative" }}>
        {layout === "centered" &&
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
            {eyebrow}{headline}
            <div style={{ maxWidth: 640 }}>{lead}</div>
            <div style={{ display: "flex", justifyContent: "center" }}>{ctas}</div>
            <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>{aiBar}</div>
            {stats}
            <div style={{ marginTop: 54, width: "100%", maxWidth: 980 }}>
              <image-slot id="hero-main" shape="rounded" radius="22" placeholder="ลากรูปงานเด่นมาวางที่นี่" style={{ width: "100%", height: "min(440px,48vh)", boxShadow: "var(--gp-shadow)" }}></image-slot>
            </div>
          </div>
        }
        {layout === "editorial" &&
        <div>
            <div style={{ maxWidth: 1000 }}>{eyebrow}
              <h1 style={{ fontSize: "clamp(44px,8.5vw,116px)", lineHeight: .98, color: "var(--gp-navy)", letterSpacing: "-.035em", marginTop: 14, fontWeight: 600 }}>
                มากกว่า<br />ของขวัญ<span style={{ color: "var(--gp-mustard-deep)" }}>.</span>
              </h1>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 40, marginTop: 24, alignItems: "end" }} className="gp-hero-ed">
              <div>{lead}{ctas}{aiBar}</div>
              <div>{stats}</div>
            </div>
            <div style={{ marginTop: 44 }}>
              <image-slot id="hero-main" shape="rounded" radius="22" placeholder="ลากรูปงานเด่นมาวางที่นี่" style={{ width: "100%", height: "min(420px,46vh)", boxShadow: "var(--gp-shadow)" }}></image-slot>
            </div>
          </div>
        }
        {layout === "split" &&
        <div style={{ display: "grid", gridTemplateColumns: "1.04fr .96fr", gap: "clamp(28px,4vw,64px)", alignItems: "center" }} className="gp-hero-split">
            <div>{eyebrow}{headline}{lead}{ctas}{aiBar}{stats}</div>
            <div>{visual}</div>
          </div>
        }
      </div>
    </section>);

}

/* ============================ TRUST BAR ============================ */
function GpTrust() {
  const clients = ["ABC Corp", "SiamTech", "Bloom & Co.", "NovaBank", "Greenleaf", "Orbit Agency", "Lotus Group", "Vela"];
  const row = [...clients, ...clients];
  return (
    <section style={{ borderTop: "1px solid var(--gp-grey-200)", borderBottom: "1px solid var(--gp-grey-200)", background: "#fff", padding: "26px 0", overflow: "hidden" }}>
      <div className="gp-wrap" style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 18 }}>
        <span style={{ fontFamily: "var(--gp-font-head)", fontSize: 12.5, letterSpacing: ".08em", color: "var(--gp-grey)", textTransform: "uppercase", whiteSpace: "nowrap" }}>ได้รับความไว้วางใจจากองค์กรชั้นนำ</span>
        <span style={{ flex: 1, height: 1, background: "var(--gp-grey-200)" }} />
      </div>
      <div style={{ position: "relative", maskImage: "linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)", WebkitMaskImage: "linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)" }}>
        <div style={{ display: "flex", gap: 54, width: "max-content", animation: "gp-marquee 26s linear infinite" }}>
          {row.map((c, i) =>
          <span key={i} style={{ fontFamily: "var(--gp-font-head)", fontWeight: 600, fontSize: 21, color: "#AEB6C2", letterSpacing: "-.01em", whiteSpace: "nowrap" }}>{c}</span>
          )}
        </div>
      </div>
    </section>);

}

/* ============================ HOW IT WORKS ============================ */
function GpHowItWorks() {
  const steps = [
  { n: "01", icon: "chat", t: "ปรึกษา", d: "บอกโจทย์ โอกาส งบ และจำนวน ทีมเราตอบไวภายใน 48 ชม." },
  { n: "02", icon: "palette", t: "ดีไซน์ + AI Mockup", d: "เห็นภาพงานจริงก่อนตัดสินใจ ใช้ AI ขึ้น Mockup โลโก้บนสินค้าให้ดูทันที", ai: true },
  { n: "03", icon: "box", t: "ผลิต", d: "ควบคุมคุณภาพทุกชิ้น วัสดุที่สัมผัสได้ถึงความพรีเมียม" },
  { n: "04", icon: "truck", t: "ส่งมอบ", d: "ตรงเวลา ทันงาน พร้อมบริการจัดส่งรายคน (kitting) ถ้าต้องการ" }];

  return (
    <section id="how" className="gp-section" style={{ background: "var(--gp-cloud)" }}>
      <div className="gp-wrap">
        <GpReveal style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          <span className="gp-eyebrow"><span className="dot" />วิธีการทำงาน</span>
          <h2 className="gp-h2" style={{ maxWidth: "20ch" }}>ครบ จบในที่เดียว — ไม่ต้องกลัวงานพลาด</h2>
          <p className="gp-lead" style={{ textAlign: "center" }}>4 ขั้นตอนที่โปร่งใส ออกแบบมาเพื่อให้ลูกค้า B2B มั่นใจตั้งแต่ทักครั้งแรกจนของถึงมือ</p>
        </GpReveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 18, marginTop: 46 }}>
          {steps.map((s, i) =>
          <GpReveal key={i} delay={i * 90}>
              <div className="gp-card" style={{ height: "100%", position: "relative", overflow: "hidden", background: s.ai ? "linear-gradient(165deg,#1F3A5F,#16293F)" : "#fff", color: s.ai ? "#fff" : undefined, border: s.ai ? "none" : undefined }}>
                {s.ai && <div className="gp-dotgrid on-dark" style={{ position: "absolute", inset: 0, opacity: .5 }} />}
                <div style={{ position: "relative" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ width: 48, height: 48, borderRadius: 13, display: "flex", alignItems: "center", justifyContent: "center",
                    background: s.ai ? "rgba(244,189,68,.16)" : "var(--gp-mustard-soft)", color: s.ai ? "var(--gp-mustard)" : "var(--gp-navy)" }}>
                      <GpIcon name={s.icon} size={23} />
                    </div>
                    <span style={{ fontFamily: "var(--gp-font-head)", fontWeight: 700, fontSize: 26, color: s.ai ? "rgba(255,255,255,.22)" : "var(--gp-grey-200)" }}>{s.n}</span>
                  </div>
                  <h4 style={{ fontSize: 18, marginTop: 16, color: s.ai ? "#fff" : "var(--gp-navy)", display: "flex", alignItems: "center", gap: 7 }}>
                    {s.t}{s.ai && <span className="gp-badge gp-badge-ai" style={{ fontSize: 9.5, padding: "3px 8px" }}><GpSpark size={10} />AI</span>}
                  </h4>
                  <p style={{ fontSize: 13.5, marginTop: 8, lineHeight: 1.6, color: s.ai ? "#B9C6DA" : "var(--gp-grey)" }}>{s.d}</p>
                </div>
              </div>
            </GpReveal>
          )}
        </div>
      </div>
    </section>);

}

Object.assign(window, { gpScrollTo, GpLogo, GpIcon, GpReveal, GpNav, GpHero, GpTrust, GpHowItWorks });