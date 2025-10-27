
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { CartItem } from "../types";
import { productos } from "../data";

type Ctx = {
  items: CartItem[];
  add: (id: number, qty?: number) => void;
  change: (id: number, delta: number) => void;
  remove: (id: number) => void;
  clear: () => void;
  count: number;
  total: number;
};

const KEY = "cart";
const CartCtx = createContext<Ctx | null>(null);

/* Utils seguras para localStorage */
const canUseStorage = typeof window !== "undefined" && !!window.localStorage;

function loadCart(): CartItem[] {
  if (!canUseStorage) return [];
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    // Validación mínima de forma
    if (Array.isArray(parsed))
      return parsed.filter(
        (x) =>
          x &&
          typeof x === "object" &&
          typeof (x as CartItem).id === "number" &&
          typeof (x as CartItem).qty === "number"
      ) as CartItem[];
  } catch {/* ignore */}
  return [];
}

function saveCart(items: CartItem[]) {
  if (!canUseStorage) return;
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {/* ignore */}
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => loadCart());

  // Persistencia
  useEffect(() => { saveCart(items); }, [items]);

  // Sync entre pestañas
  useEffect(() => {
    if (!canUseStorage) return;
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) setItems(loadCart());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const add = useCallback((id: number, qty = 1) => {
  setItems((cs) => {
    const i = cs.findIndex((x) => x.id === id);
    if (i >= 0) {
      const n = [...cs];
      const cur = n[i]!;
      n[i] = { ...cur, qty: cur.qty + qty };
      return n;
    }
    return [...cs, { id, qty }];
  });
}, []);

  const change = useCallback((id: number, delta: number) => {
    setItems((cs) =>
      cs
        .map((x) => (x.id === id ? { ...x, qty: Math.max(0, x.qty + delta) } : x))
        .filter((x) => x.qty > 0)
    );
  }, []);

  const remove = useCallback((id: number) => {
    setItems((cs) => cs.filter((x) => x.id !== id));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const { count, total } = useMemo(() => {
    return items.reduce(
      (acc, it) => {
        const p = productos.find((pp) => pp.id === it.id);
        acc.count += it.qty;
        acc.total += (p?.precio ?? 0) * it.qty;
        return acc;
      },
      { count: 0, total: 0 }
    );
  }, [items]);

  const value: Ctx = { items, add, change, remove, clear, count, total };
  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export const useCart = () => {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
