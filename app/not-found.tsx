import Link from "next/link";
import { Zap } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
        <Zap className="w-8 h-8 text-blue-700" />
      </div>
      <h1 className="font-display text-6xl font-bold text-gray-900 mb-3">404</h1>
      <p className="text-xl font-semibold text-gray-700 mb-2">Page not found</p>
      <p className="text-gray-500 text-sm mb-8 max-w-sm">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex gap-3">
        <Link href="/"
          className="bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-800 transition-colors text-sm">
          Go home
        </Link>
        <Link href="/products"
          className="border text-gray-700 font-semibold px-5 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm">
          Browse products
        </Link>
      </div>
    </div>
  );
}
