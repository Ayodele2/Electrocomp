"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { formatDate } from "@/lib/utils";

export function ProjectMessages({ messages: initial, projectId }: { messages: any[]; projectId: string }) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState(initial);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const myId = (session?.user as any)?.id;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!body.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const data = await res.json();
      if (res.ok) { setMessages(m => [...m, data.data]); setBody(""); }
    } finally { setSending(false); }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: 360, border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden", background: "#f9fafb" }}>
      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
        {messages.length === 0 && (
          <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "#9ca3af" }}>
            No messages yet — start the conversation
          </div>
        )}
        {messages.map(msg => {
          const isMe = msg.sender.id === myId;
          return (
            <div key={msg.id} style={{ display: "flex", gap: 8, flexDirection: isMe ? "row-reverse" : "row" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, color: "#1d4ed8", flexShrink: 0, marginTop: 2 }}>
                {msg.sender.name?.[0] ?? "?"}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2, alignItems: isMe ? "flex-end" : "flex-start", maxWidth: "75%" }}>
                <div style={{ padding: "9px 13px", borderRadius: isMe ? "14px 14px 4px 14px" : "14px 14px 14px 4px", fontSize: 13, lineHeight: 1.5, background: isMe ? "#1d4ed8" : "white", color: isMe ? "white" : "#111827", border: isMe ? "none" : "1px solid #e5e7eb" }}>
                  {msg.body}
                </div>
                <span style={{ fontSize: 11, color: "#9ca3af", paddingInline: 2 }}>{formatDate(msg.createdAt)}</span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ borderTop: "1px solid #e5e7eb", padding: "10px 12px", display: "flex", gap: 8, background: "white" }}>
        <input value={body} onChange={e => setBody(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Type a message…"
          style={{ flex: 1, border: "1.5px solid #e5e7eb", borderRadius: 10, padding: "8px 12px", fontSize: 13, outline: "none", background: "#f9fafb" }} />
        <button onClick={send} disabled={!body.trim() || sending}
          style={{ width: 38, height: 38, borderRadius: 10, background: body.trim() && !sending ? "#1d4ed8" : "#e5e7eb", color: "white", border: "none", cursor: body.trim() && !sending ? "pointer" : "default", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {sending ? "…" : "→"}
        </button>
      </div>
    </div>
  );
}
