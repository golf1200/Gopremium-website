// ============================================================
// GO PREMIUM — Quote cart hook (localStorage-backed)
// ============================================================

import { useState, useCallback, useEffect } from 'react';
import { track } from '../utils/analytics';

const STORAGE_KEY = 'gp_quote_v1';

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function useQuote() {
  const [items, setItems] = useState(load);

  // Persist whenever items change
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch {}
  }, [items]);

  const add = useCallback((product) => {
    let added = false;
    setItems((prev) => {
      const exists = prev.find((i) => i.sku === product.sku);
      if (exists) return prev; // already in list
      added = true;
      return [
        ...prev,
        { sku: product.sku, name: product.name, qty: product.moq || 100 },
      ];
    });
    if (added) track('add_to_quote', { sku: product.sku });
  }, []);

  const remove = useCallback((sku) => {
    setItems((prev) => prev.filter((i) => i.sku !== sku));
  }, []);

  const updateQty = useCallback((sku, qty) => {
    setItems((prev) => prev.map((i) => i.sku === sku ? { ...i, qty } : i));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const has = useCallback((sku) => items.some((i) => i.sku === sku), [items]);

  return { items, add, remove, updateQty, clear, has, count: items.length };
}
