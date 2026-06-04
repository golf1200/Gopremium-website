// ============================================================
// GO PREMIUM — Quote context (global cart state)
// ============================================================

import { createContext, useContext } from 'react';
import { useQuote } from '../hooks/useQuote';

const QuoteCtx = createContext(null);

export function QuoteProvider({ children }) {
  const quote = useQuote();
  return <QuoteCtx.Provider value={quote}>{children}</QuoteCtx.Provider>;
}

export function useQuoteCtx() {
  return useContext(QuoteCtx);
}
