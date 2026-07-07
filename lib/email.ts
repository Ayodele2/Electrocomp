// lib/email.ts
// Sends transactional emails via Resend (https://resend.com)

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM = process.env.EMAIL_FROM ?? "onboarding@resend.dev";

async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  if (!RESEND_API_KEY) {
    console.log(`[EMAIL - no API key] To: ${to} | Subject: ${subject}`);
    return { success: false, error: "No RESEND_API_KEY set" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: FROM, to, subject, html }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("Resend error:", data);
      return { success: false, error: data.message };
    }
    return { success: true, id: data.id };
  } catch (err) {
    console.error("Email send failed:", err);
    return { success: false, error: String(err) };
  }
}

export async function sendOrderConfirmation(to: string, orderId: string, total: number) {
  return sendEmail({
    to,
    subject: "Order confirmed — ElectroComp",
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 16px">
        <div style="background:#0f1f3d;padding:20px 24px;border-radius:12px 12px 0 0;text-align:center">
          <h1 style="color:white;font-size:20px;margin:0">⚡ ElectroComp</h1>
        </div>
        <div style="border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;padding:28px 24px">
          <h2 style="font-size:18px;color:#111827;margin:0 0 12px">Order confirmed! ✅</h2>
          <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0 0 20px">
            Thank you for your order. We've received it and will dispatch within 1–2 business days.
          </p>
          <div style="background:#f9fafb;border-radius:8px;padding:16px;margin-bottom:20px">
            <p style="margin:0 0 6px;font-size:13px;color:#374151"><strong>Order ID:</strong> #${orderId.slice(-8).toUpperCase()}</p>
            <p style="margin:0;font-size:13px;color:#374151"><strong>Total:</strong> ₦${total.toLocaleString("en-NG", { minimumFractionDigits: 2 })}</p>
          </div>
          <a href="${process.env.NEXTAUTH_URL}/orders" style="display:inline-block;background:#1d4ed8;color:white;font-weight:700;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:14px">
            View my orders
          </a>
          <p style="color:#9ca3af;font-size:12px;margin-top:24px">
            Questions? Email us at hello@electrocomp.com
          </p>
        </div>
      </div>
    `,
  });
}

export async function sendProjectSubmitted(to: string, projectTitle: string) {
  return sendEmail({
    to,
    subject: "Project received — ElectroComp",
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 16px">
        <div style="background:#0f1f3d;padding:20px 24px;border-radius:12px 12px 0 0;text-align:center">
          <h1 style="color:white;font-size:20px;margin:0">⚡ ElectroComp</h1>
        </div>
        <div style="border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;padding:28px 24px">
          <h2 style="font-size:18px;color:#111827;margin:0 0 12px">Project received! 🛠️</h2>
          <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0 0 16px">
            We've received your project brief for <strong>${projectTitle}</strong>. 
            Our engineers will review it within 48 hours and send you a full quote and timeline.
          </p>
          <a href="${process.env.NEXTAUTH_URL}/projects" style="display:inline-block;background:#1d4ed8;color:white;font-weight:700;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:14px">
            View my projects
          </a>
        </div>
      </div>
    `,
  });
}

export async function sendProjectQuoted(to: string, projectTitle: string, quote: number, projectId: string) {
  return sendEmail({
    to,
    subject: "You have a quote — ElectroComp",
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 16px">
        <div style="background:#0f1f3d;padding:20px 24px;border-radius:12px 12px 0 0;text-align:center">
          <h1 style="color:white;font-size:20px;margin:0">⚡ ElectroComp</h1>
        </div>
        <div style="border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;padding:28px 24px">
          <h2 style="font-size:18px;color:#111827;margin:0 0 12px">Your quote is ready! 💰</h2>
          <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0 0 16px">
            Our engineers have reviewed <strong>${projectTitle}</strong> and sent a quote.
          </p>
          <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px;margin-bottom:20px">
            <p style="margin:0;font-size:16px;font-weight:700;color:#1d4ed8">
              Total quote: ₦${quote.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
            </p>
            <p style="margin:6px 0 0;font-size:13px;color:#3b82f6">
              Deposit to start: ₦${(quote / 2).toLocaleString("en-NG", { minimumFractionDigits: 2 })}
            </p>
          </div>
          <a href="${process.env.NEXTAUTH_URL}/projects/${projectId}" style="display:inline-block;background:#1d4ed8;color:white;font-weight:700;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:14px">
            View quote & pay deposit
          </a>
        </div>
      </div>
    `,
  });
}

export async function sendPasswordReset(to: string, resetUrl: string) {
  return sendEmail({
    to,
    subject: "Reset your password — ElectroComp",
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 16px">
        <div style="background:#0f1f3d;padding:20px 24px;border-radius:12px 12px 0 0;text-align:center">
          <h1 style="color:white;font-size:20px;margin:0">⚡ ElectroComp</h1>
        </div>
        <div style="border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;padding:28px 24px">
          <h2 style="font-size:18px;color:#111827;margin:0 0 12px">Reset your password</h2>
          <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0 0 20px">
            Click the button below to reset your password. This link expires in 1 hour.
          </p>
          <a href="${resetUrl}" style="display:inline-block;background:#1d4ed8;color:white;font-weight:700;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:14px">
            Reset password
          </a>
          <p style="color:#9ca3af;font-size:12px;margin-top:20px">
            If you didn't request this, ignore this email.
          </p>
        </div>
      </div>
    `,
  });
}
