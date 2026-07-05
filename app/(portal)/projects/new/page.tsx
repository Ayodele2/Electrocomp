import { ProjectBriefForm } from "@/components/project/ProjectBriefForm";

export const metadata = { title: "Start a Project" };

export default function NewProjectPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", padding: "48px 16px" }}>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#111827", margin: "0 0 10px" }}>Start a project</h1>
          <p style={{ fontSize: 15, color: "#6b7280", margin: 0, lineHeight: 1.6 }}>
            Tell us about your idea. We&apos;ll review it within 48 hours and send a detailed quote, timeline, and milestone breakdown.
          </p>
        </div>
        <div style={{ background: "white", borderRadius: 20, border: "1px solid #e5e7eb", boxShadow: "0 4px 24px rgba(0,0,0,0.06)", padding: 36 }}>
          <ProjectBriefForm />
        </div>
      </div>
    </div>
  );
}
