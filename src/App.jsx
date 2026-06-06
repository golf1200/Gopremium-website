import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QuoteProvider } from './contexts/QuoteContext';
import Nav from './components/Nav';
import Footer from './components/Footer';
import Floating from './components/Floating';
import QuoteFab from './components/QuoteFab';
import MobileCTABar from './components/MobileCTABar';

import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import CategoryPage from './pages/CategoryPage';
import OccasionPage from './pages/OccasionPage';
import BudgetPage from './pages/BudgetPage';
import QuotePage from './pages/QuotePage';
import Privacy from './pages/Privacy';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <BrowserRouter>
      <QuoteProvider>
        <Nav />
        <main>
          <Routes>
            <Route path="/"               element={<Home />} />
            <Route path="/products"       element={<Catalog />} />
            <Route path="/product/:sku"   element={<ProductDetail />} />
            <Route path="/category/:slug" element={<CategoryPage />} />
            <Route path="/occasion/:slug" element={<OccasionPage />} />
            <Route path="/budget/:slug"   element={<BudgetPage />} />
            <Route path="/quote"          element={<QuotePage />} />
            <Route path="/privacy"        element={<Privacy />} />
            <Route path="*"              element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
        <QuoteFab />
        <Floating />
        <MobileCTABar />
      </QuoteProvider>
    </BrowserRouter>
  );
}
