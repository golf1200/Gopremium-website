import { useState } from 'react';
import Nav from './components/Nav';
import Hero from './components/Hero';
import Trust from './components/Trust';
import AIConcierge from './components/AIConcierge';
import Occasion from './components/Occasion';
import Budget from './components/Budget';
import Category from './components/Category';
import Services from './components/Services';
import HowItWorks from './components/HowItWorks';
import Products from './components/Products';
import Portfolio from './components/Portfolio';
import Reviews from './components/Reviews';
import RFQ from './components/RFQ';
import CTA from './components/CTA';
import Footer from './components/Footer';
import Floating from './components/Floating';
import GpReveal from './components/shared/GpReveal';
import { gpScrollTo } from './utils/scroll';

export default function App() {
  const [prefill, setPrefill] = useState(null);

  const goQuote = () => gpScrollTo('rfq');
  const requestQuote = (text) => {
    setPrefill({ text, _ts: Date.now() });
    setTimeout(() => gpScrollTo('rfq'), 80);
  };

  return (
    <>
      <Nav onQuote={goQuote} />
      <main>
        <Hero onQuote={goQuote} />
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
        <Products onQuote={goQuote} />
        <Portfolio />
        <Reviews />
        <RFQ prefill={prefill} />
        <CTA onQuote={goQuote} />
      </main>
      <Footer />
      <Floating onQuote={goQuote} />
    </>
  );
}
