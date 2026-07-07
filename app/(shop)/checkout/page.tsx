"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";

type Step = 0 | 1 | 2;

type ShippingForm = {
  name: string; email: string; phone: string;
  address: string; city: string; state: string;
};

const NIGERIAN_STATES = [
  "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno",
  "Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT - Abuja","Gombe",
  "Imo","Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos",
  "Nasarawa","Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto",
  "Taraba","Yobe","Zamfara"
];

export default function CheckoutPage() {
  const { data: session } = useSession();
  const { items, totalPrice, clearCart } = useCartStore();
  const router = useRouter();
  const [step, setStep] = useState<Step>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState<string | null>(null);

  const [form, setForm] = useState<ShippingForm>({
    name: session?.user?.name ?? "",
    email: session?.user?.email ?? "",
    phone: "",
    address: "",
    city: "",
    state: "Lagos",
  });

  const set = (k: keyof ShippingForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const total = totalPrice();
  const shipping = total >= 50000 ? 0 : 2500;
  const grandTotal = total + shipping;

  const validateStep0 = () => {
    if (!form.name || !form.email || !form.phone || !form.address || !form.city || !form.state) {
      setError("Please fill in all required fields"); return false;
    }
    setError(""); return true;
  };

  const handlePlaceOrder = async () => {
    if (!session) { router.push("/login"); return; }
    setLoading(true);
    setError("");
    try {
      // Create order in DB
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map(i => ({ productId: i.productId, quantity: i.quantity, price: i.product.price })),
          total: grandTotal,
          shipping: { name: form.name, email: form.email, line1: form.address, city: form.city, state: form.state, zip: "000000", country: "NG" },
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to create order"); return; }

      const newOrderId = data.data.id;
      setOrderId(newOrderId);

      // Initialize Paystack payment
      const payRes = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "order", orderId: newOrderId, email: form.email }),
      });
      const payData = await payRes.json();

      if (payData.authorizationUrl) {
        clearCart();
        window.location.href = payData.authorizationUrl;
      } else {
        // If Paystack not configured, just show confirmation
        clearCart();
        setStep(2);
      }
    } catch (err: any) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", border: "1.5px solid #e5e7eb", borderRadius: 10,
    padding: "10px 14px", fontSize: 14, outline: "none",
    boxSizing: "border-box", fontFamily: "inherit",
  };

  // Empty cart
  if (items.length === 0 && step !== 2) {
    return (
      <div style={{ maxWidth: 500, margin: "80px auto", padding: "0 16px", textAlign: "center" }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🛒</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111827", margin: "0 0 8px" }}>Your cart is empty</h2>
        <p style={{ color: "#6b7280", fontSize: 14, margin: "0 0 24px" }}>Add some components before checking out</p>
        <Link href="/products" style={{ background: "#1d4ed8", color: "white", fontWeight: 700, padding: "12px 28px", borderRadius: 10, textDecoration: "none", fontSize: 14 }}>
          Browse products
        </Link>
      </div>
    );
  }

  // Order confirmed
  if (step === 2) {
    return (
      <div style={{ maxWidth: 500, margin: "80px auto", padding: "0 16px", textAlign: "center" }}>
        <div style={{ width: 70, height: 70, background: "#dcfce7", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 30 }}>✅</div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#111827", margin: "0 0 8px" }}>Order confirmed!</h1>
        <p style={{ color: "#6b7280", fontSize: 14, margin: "0 0 6px" }}>Order #{orderId?.slice(-8).toUpperCase()}</p>
        <p style={{ color: "#6b7280", fontSize: 14, margin: "0 0 28px" }}>
          We&apos;ll send a confirmation to {form.email}. Your order will be dispatched within 1–2 business days.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Link href="/orders" style={{ background: "#1d4ed8", color: "white", fontWeight: 700, padding: "12px", borderRadius: 10, textDecoration: "none", display: "block" }}>View my orders</Link>
          <Link href="/products" style={{ color: "#6b7280", fontSize: 13, textDecoration: "none" }}>Continue shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 16px" }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: "#111827", marginBottom: 28 }}>Checkout</h1>

      {/* Steps */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 32 }}>
        {["Shipping", "Review & Pay"].map((label, i) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 700,
                background: step > i ? "#16a34a" : step === i ? "#1d4ed8" : "#f3f4f6",
                color: step >= i ? "white" : "#9ca3af",
                border: `2px solid ${step > i ? "#16a34a" : step === i ? "#1d4ed8" : "#e5e7eb"}`,
              }}>
                {step > i ? "✓" : i + 1}
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: step === i ? "#1d4ed8" : step > i ? "#16a34a" : "#9ca3af" }}>{label}</span>
            </div>
            {i === 0 && <div style={{ width: 40, height: 2, background: step > 0 ? "#16a34a" : "#e5e7eb" }} />}
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 28 }}>
        {/* Left - Forms */}
        <div>
          {error && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#dc2626", marginBottom: 16 }}>
              {error}
            </div>
          )}

          {/* Step 0: Shipping */}
          {step === 0 && (
            <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 16, padding: 24 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: "0 0 20px" }}>Shipping information</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Full name *</label>
                    <input value={form.name} onChange={set("name")} placeholder="John Smith" style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Phone number *</label>
                    <input value={form.phone} onChange={set("phone")} placeholder="08012345678" style={inputStyle} />
                  </div>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Email address *</label>
                  <input type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Delivery address *</label>
                  <input value={form.address} onChange={set("address")} placeholder="12 Example Street, Lekki Phase 1" style={inputStyle} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>City *</label>
                    <input value={form.city} onChange={set("city")} placeholder="Lagos" style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>State *</label>
                    <select value={form.state} onChange={set("state")} style={inputStyle}>
                      {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
                <button onClick={() => { if (validateStep0()) setStep(1); }}
                  style={{ background: "#1d4ed8", color: "white", fontWeight: 700, padding: "11px 24px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 14 }}>
                  Continue to review →
                </button>
              </div>
            </div>
          )}

          {/* Step 1: Review */}
          {step === 1 && (
            <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 16, padding: 24 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: "0 0 20px" }}>Review your order</h2>

              {/* Items */}
              <div style={{ marginBottom: 20 }}>
                {items.map(item => (
                  <div key={item.id} style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f3f4f6" }}>
                    <div style={{ width: 48, height: 48, background: "#f3f4f6", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                      {item.product.images?.[0]
                        ? <img src={item.product.images[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 10 }} />
                        : "🔌"}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "#111827", margin: "0 0 2px" }}>{item.product.name}</p>
                      <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>Qty: {item.quantity}</p>
                    </div>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>{formatPrice(Number(item.product.price) * item.quantity)}</span>
                  </div>
                ))}
              </div>

              {/* Shipping address */}
              <div style={{ background: "#f9fafb", borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 13 }}>
                <p style={{ fontWeight: 700, color: "#374151", margin: "0 0 4px" }}>Shipping to:</p>
                <p style={{ color: "#6b7280", margin: 0 }}>{form.name} · {form.phone}</p>
                <p style={{ color: "#6b7280", margin: 0 }}>{form.address}, {form.city}, {form.state}</p>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
                <button onClick={() => setStep(0)} style={{ background: "none", border: "1.5px solid #e5e7eb", color: "#374151", fontWeight: 600, padding: "11px 20px", borderRadius: 10, cursor: "pointer", fontSize: 13 }}>
                  ← Edit shipping
                </button>
                <button onClick={handlePlaceOrder} disabled={loading}
                  style={{ background: loading ? "#93c5fd" : "#1d4ed8", color: "white", fontWeight: 700, padding: "11px 28px", borderRadius: 10, border: "none", cursor: loading ? "not-allowed" : "pointer", fontSize: 14 }}>
                  {loading ? "Processing…" : "Pay with Paystack →"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right - Order summary */}
        <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 16, padding: 20, height: "fit-content" }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#111827", margin: "0 0 16px" }}>Order summary</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
            {items.map(i => (
              <div key={i.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: "#6b7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "65%" }}>
                  {i.product.name} ×{i.quantity}
                </span>
                <span style={{ fontWeight: 600, flexShrink: 0 }}>{formatPrice(Number(i.product.price) * i.quantity)}</span>
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#6b7280" }}>
              <span>Subtotal</span><span>{formatPrice(total)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#6b7280" }}>
              <span>Shipping</span>
              <span style={{ color: shipping === 0 ? "#16a34a" : undefined }}>
                {shipping === 0 ? "Free" : formatPrice(shipping)}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 16, paddingTop: 8, borderTop: "1px solid #e5e7eb" }}>
              <span>Total</span><span style={{ color: "#1d4ed8" }}>{formatPrice(grandTotal)}</span>
            </div>
          </div>
          {total < 50000 && (
            <p style={{ fontSize: 12, color: "#1d4ed8", background: "#eff6ff", borderRadius: 8, padding: "8px 10px", margin: "12px 0 0" }}>
              Add {formatPrice(50000 - total)} more for free shipping!
            </p>
          )}
          <div style={{ marginTop: 14, padding: "10px 12px", background: "#f9fafb", borderRadius: 8, fontSize: 12, color: "#6b7280", display: "flex", alignItems: "center", gap: 6 }}>
            🔒 Secured by Paystack
          </div>
        </div>
      </div>
    </div>
  );
}
