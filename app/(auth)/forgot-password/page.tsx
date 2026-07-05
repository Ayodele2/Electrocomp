"use client";

import { useState } from "react";
import Link from "next/link";
import { Zap, Loader2, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Something went wrong");
        return;
      }
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-display font-bold text-xl mb-6">
            <div className="w-8 h-8 rounded bg-blue-700 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-blue-900">ELECTRO</span><span className="text-blue-600">COMP</span>
          </Link>
          <h1 className="font-display text-2xl font-bold text-gray-900">Reset your password</h1>
          <p className="text-gray-500 text-sm mt-1">We'll send a reset link to your email</p>
        </div>

        <div className="bg-white rounded-2xl border shadow-sm p-8">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Check your inbox</p>
                <p className="text-sm text-gray-500 mt-1">
                  If <strong>{email}</strong> is registered, you'll receive a reset link shortly.
                </p>
              </div>
              <Link href="/login" className="block text-sm text-blue-700 font-medium hover:underline">
                Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-100 rounded-lg px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com" required autoComplete="email"
                  className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : "Send reset link"}
              </button>
              <p className="text-center text-sm text-gray-500">
                Remember it?{" "}
                <Link href="/login" className="text-blue-700 font-medium hover:underline">Sign in</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
