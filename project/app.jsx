// app.jsx — assembles the GO PREMIUM homepage + Tweaks
const { useState: useStateA, useEffect: useEffectA } = React;
const {
  useTweaks, TweaksPanel, TweakSection, TweakRadio,
  GpNav, GpHero, GpTrust, GpHowItWorks,
  GpProducts, GpPortfolio, GpReviews, GpRFQ, GpCTA, GpFooter, GpFloating,
  GpConcierge, GpSpark, GpReveal,
  GpOccasion, GpBudget, GpCategory, GpServices,
} = window;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "heroLayout": "split",
  "vibe": "safe",
  "portfolio": "grid"
}/*EDITMODE-END*/;

function App(){
  const [t,setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [prefill,setPrefill] = useStateA(null);

  const goQuote = ()=>window.gpScrollTo("rfq");
  const requestQuote = (text)=>{ setPrefill({ text, _ts:Date.now() }); setTimeout(()=>window.gpScrollTo("rfq"), 80); };

  return (
    <React.Fragment>
      <GpNav onQuote={goQuote}/>
      <main>
        <GpHero layout={t.heroLayout} vibe={t.vibe} onQuote={goQuote}/>
        <GpTrust/>
        <section id="ai" className="gp-section" style={{background:"var(--gp-cloud)"}}>
          <GpReveal>
            <GpConcierge vibe={t.vibe} onRequestQuote={requestQuote}/>
          </GpReveal>
        </section>
        <GpOccasion onQuote={goQuote}/>
        <GpBudget onQuote={goQuote}/>
        <GpCategory onQuote={goQuote}/>
        <GpServices onQuote={goQuote}/>
        <GpHowItWorks/>
        <GpPortfolio display={t.portfolio}/>
        <GpReviews/>
        <GpRFQ prefill={prefill}/>
        <GpCTA onQuote={goQuote}/>
      </main>
      <GpFooter/>
      <GpFloating onQuote={goQuote}/>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Hero" />
        <TweakRadio label="เลย์เอาต์ Hero" value={t.heroLayout}
          options={[{label:"Split",value:"split"},{label:"Centered",value:"centered"},{label:"Editorial",value:"editorial"}]}
          onChange={v=>setTweak("heroLayout",v)} />
        <TweakSection label="โทนโดยรวม" />
        <TweakRadio label="Vibe" value={t.vibe}
          options={[{label:"On-brand",value:"safe"},{label:"Bold",value:"bold"}]}
          onChange={v=>setTweak("vibe",v)} />
        <TweakSection label="ผลงาน" />
        <TweakRadio label="การแสดงผล" value={t.portfolio}
          options={[{label:"Grid",value:"grid"},{label:"Masonry",value:"masonry"},{label:"Carousel",value:"carousel"}]}
          onChange={v=>setTweak("portfolio",v)} />
      </TweaksPanel>
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
