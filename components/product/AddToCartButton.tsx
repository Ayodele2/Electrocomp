"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cartStore";

export function AddToCartButton({ product }: { product: any }) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const price = typeof product.price === "number" ? product.price : Number(product.price);

  const handleAdd = () => {
    addItem({ ...product, price }, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (product.stock === 0) {
    return (
      <button disabled style={{ width: "100%", padding: 12, borderRadius: 12, background: "#f3f4f6", color: "#9ca3af", fontWeight: 700, border: "none", fontSize: 14 }}>
        Out of stock
      </button>
    );
  }

  return (
    <div style={{ display: "flex", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", border: "1.5px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>
        <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ padding: "10px 14px", background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#374151" }}>−</button>
        <span style={{ padding: "10px 8px", fontWeight: 700, fontSize: 15, minWidth: 32, textAlign: "center" }}>{qty}</span>
        <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} style={{ padding: "10px 14px", background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#374151" }}>+</button>
      </div>
      <button onClick={handleAdd} style={{
        flex: 1, padding: 12, borderRadius: 12, border: "none", cursor: "pointer",
        fontWeight: 700, fontSize: 14, background: added ? "#16a34a" : "#1d4ed8", color: "white",
      }}>
        {added ? "✓ Added!" : "🛒 Add to cart"}
      </button>
    </div>
  );
}
