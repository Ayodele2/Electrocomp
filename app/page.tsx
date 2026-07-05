import Link from "next/link";

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section style={{ background: "linear-gradient(135deg, #0f1f3d 0%, #1a3a6b 50%, #1a56db 100%)", color: "white", padding: "80px 16px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 999, padding: "6px 16px", fontSize: 13, marginBottom: 24 }}>
            <span style={{ width: 8, height: 8, background: "#22d3ee", borderRadius: "50%", display: "inline-block" }} />
            Now shipping across Nigeria — same-day dispatch in Lagos
          </div>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 800, lineHeight: 1.15, marginBottom: 20, margin: "0 0 20px" }}>
            Power Your Next <br />
            <span style={{ color: "#22d3ee" }}>Electronics Project</span>
          </h1>
          <p style={{ fontSize: 17, color: "#bfdbfe", marginBottom: 32, maxWidth: 520, lineHeight: 1.7, margin: "0 0 32px" }}>
            Shop quality electronic components or let our engineers build your custom project — from concept to delivery, right here in Nigeria.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link href="/products" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "white", color: "#1e3a8a", fontWeight: 700, padding: "13px 26px", borderRadius: 10, textDecoration: "none", fontSize: 14 }}>
              Browse components →
            </Link>
            <Link href="/projects/new" style={{ display: "inline-flex", alignItems: "center", gap: 8, border: "1.5px solid rgba(255,255,255,0.4)", color: "white", fontWeight: 600, padding: "13px 26px", borderRadius: 10, textDecoration: "none", fontSize: 14 }}>
              Start a project
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section style={{ padding: "56px 16px", background: "#f9fafb" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28 }}>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: "#111827", margin: "0 0 4px" }}>Shop by category</h2>
              <p style={{ fontSize: 14, color: "#6b7280", margin: 0 }}>Everything you need for your next build</p>
            </div>
            <Link href="/products" style={{ fontSize: 13, color: "#1d4ed8", fontWeight: 600, textDecoration: "none" }}>View all →</Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 14 }}>
            {[
              ["🔲", "Microcontrollers", "microcontrollers", "Arduino, ESP32, RPi"],
              ["📡", "Sensors", "sensors", "DHT, ultrasonic, PIR"],
              ["🖥️", "Displays", "displays", "OLED, LCD, TFT"],
              ["⚡", "Power Modules", "power", "Regulators, chargers"],
              ["📶", "Communication", "communication", "GSM, WiFi, Bluetooth"],
              ["📦", "Kits & Bundles", "kits", "Starter packs"],
            ].map(([icon, name, slug, sub]) => (
              <Link key={slug} href={`/products?category=${slug}`} style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
                background: "white", borderRadius: 14, padding: "20px 12px",
                border: "1px solid #e5e7eb", textDecoration: "none", textAlign: "center",
              }}>
                <span style={{ fontSize: 30 }}>{icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{name}</div>
                  <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{sub}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured products strip */}
      <section style={{ padding: "56px 16px", background: "white" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: "#111827", margin: 0 }}>Popular products</h2>
            <Link href="/products?sort=popular" style={{ fontSize: 13, color: "#1d4ed8", fontWeight: 600, textDecoration: "none" }}>See all →</Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
            {[
              ["Arduino Uno R3", "₦12,500", "microcontrollers"],
              ["ESP32 Dev Board", "₦6,500", "microcontrollers"],
              ["SIM800L GSM Module", "₦5,500", "communication"],
              ["Arduino Starter Kit", "₦22,000", "kits"],
            ].map(([name, price, cat]) => (
              <Link key={name as string} href={`/products?category=${cat}`} style={{
                display: "flex", flexDirection: "column", background: "#f9fafb",
                borderRadius: 12, border: "1px solid #e5e7eb", overflow: "hidden",
                textDecoration: "none",
              }}>
                <div style={{ aspectRatio: "1", background: "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>
                  🔌
                </div>
                <div style={{ padding: "12px 14px" }}>
                  <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 600, color: "#111827" }}>{name}</p>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#1d4ed8" }}>{price}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Project CTA */}
      <section style={{ padding: "64px 16px", background: "#0f1f3d", color: "white" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
          <div style={{ width: 56, height: 56, background: "#1e3a8a", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 26 }}>⚡</div>
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 14, margin: "0 0 14px" }}>Have a project in mind?</h2>
          <p style={{ color: "#bfdbfe", marginBottom: 28, lineHeight: 1.7, fontSize: 15, margin: "0 0 28px" }}>
            Submit your brief and our engineers will review it within 48 hours — with a full quote in Naira, timeline, and milestone plan.
          </p>
          <Link href="/projects/new" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#22d3ee", color: "#0f1f3d", fontWeight: 800, padding: "14px 32px", borderRadius: 10, textDecoration: "none", fontSize: 15 }}>
            Apply for a project →
          </Link>
        </div>
      </section>

      {/* Why us */}
      <section style={{ padding: "56px 16px", borderTop: "1px solid #e5e7eb" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "#111827", textAlign: "center", marginBottom: 36 }}>Why ElectroComp?</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 28 }}>
            {[
              ["🛡️", "Quality Guaranteed", "Every component tested before shipping."],
              ["🚀", "Fast Delivery", "Same-day dispatch in Lagos. 2–3 days nationwide."],
              ["💳", "Pay with Paystack", "Secure payments via card, bank transfer, or USSD."],
              ["🎧", "Local Support", "Nigerian engineers ready to help with your build."],
            ].map(([icon, title, desc]) => (
              <div key={title as string} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ width: 44, height: 44, background: "#eff6ff", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{icon}</div>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>{title}</div>
                <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
