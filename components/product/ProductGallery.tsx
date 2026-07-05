"use client";

import { useState } from "react";

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const imgs = images && images.length > 0 ? images : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ aspectRatio: "1", background: "#f3f4f6", borderRadius: 16, border: "1px solid #e5e7eb", overflow: "hidden", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {imgs.length > 0 ? (
          <>
            <img src={imgs[active]} alt={`${name} ${active + 1}`} style={{ width: "100%", height: "100%", objectFit: "contain", padding: 16 }} />
            {imgs.length > 1 && (
              <>
                <button onClick={() => setActive(a => (a - 1 + imgs.length) % imgs.length)}
                  style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", width: 32, height: 32, borderRadius: "50%", background: "white", border: "1px solid #e5e7eb", cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
                <button onClick={() => setActive(a => (a + 1) % imgs.length)}
                  style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", width: 32, height: 32, borderRadius: "50%", background: "white", border: "1px solid #e5e7eb", cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>›</button>
              </>
            )}
          </>
        ) : (
          <div style={{ fontSize: 80, opacity: 0.3 }}>🔌</div>
        )}
      </div>
      {imgs.length > 1 && (
        <div style={{ display: "flex", gap: 8 }}>
          {imgs.map((img, i) => (
            <button key={i} onClick={() => setActive(i)} style={{ width: 60, height: 60, borderRadius: 8, border: `2px solid ${active === i ? "#1d4ed8" : "#e5e7eb"}`, background: "#f3f4f6", cursor: "pointer", overflow: "hidden", padding: 0 }}>
              <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
