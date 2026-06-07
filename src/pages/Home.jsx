// ============================================================
// GO PREMIUM — Home page (original landing content)
// ============================================================
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMeta } from '../hooks/useMeta';

import Trust from '../components/Trust';
import AIConcierge from '../components/AIConcierge';
import Occasion from '../components/Occasion';
import Budget from '../components/Budget';
import Category from '../components/Category';
import Services from '../components/Services';
import HowItWorks from '../components/HowItWorks';
import Products from '../components/Products';
import Portfolio from '../components/Portfolio';
import Reviews from '../components/Reviews';
import RFQ from '../components/RFQ';
import CTA from '../components/CTA';
import GpReveal from '../components/shared/GpReveal';
import { gpScrollTo } from '../utils/scroll';
import { site } from '../config';

// ---------------------------------------------------------------------------
// Hero (inline — avoids circular dep with Nav)
// ---------------------------------------------------------------------------
import Hero from '../components/Hero';

export default function Home() {
  useMeta({
    title: 'GO PREMIUM — ของพรีเมียมพิมพ์โลโก้ B2B ครบวงจร',
    description: 'ของที่ระลึกพรีเมียม ของขวัญองค์กร ของแจกพนักงาน พิมพ์โลโก้ได้ ราคาส่ง MOQ เริ่มต้น 50 ชิ้น ตอบกลับภายใน 2 ชม.',
    canonical: site.siteUrl,
  });

  const [prefill, setPrefill] = useState(null);
  const navigate = useNavigate();

  const goQuote = () => gpScrollTo('rfq');
  const requestQuote = (text) => {
    setPrefill({ text, _ts: Date.now() });
    setTimeout(() => gpScrollTo('rfq'), 80);
  };
  const goCatalog = () => navigate('/products');

  return (
    <>
      <Hero onQuote={goQuote} onCatalog={goCatalog} />
      <Trust />
      <section id="ai" className="gp-section" style={{ background: 'var(--gp-cloud)' }}>
        <GpReveal>
          <AIConcierge onRequestQuote={requestQuote} />
        </GpReveal>
      </section>
      <Occasion onQuote={goQuote} />
      <Budget onQuote={goQuote} />
      <Category onQuote={goQuote} />
      <Services onQuote={goQuote} />
      <HowItWorks />
      <Products onQuote={goQuote} onCatalog={goCatalog} />
      <Portfolio />
      <Reviews />
      <RFQ prefill={prefill} />
      <CTA onQuote={goQuote} />
    </>
  );
}
