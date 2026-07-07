"use client";
import Link from "next/link";
import { Zap, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <Link href="/" className="flex items-center gap-2 font-display font-bold text-lg">
              <div className="w-7 h-7 rounded bg-blue-700 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-blue-900">ELECTRO</span><span className="text-blue-600">COMP</span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed">
              Quality electronic components and custom project engineering for makers, students, and professionals.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-gray-900 mb-3">Shop</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              {["Microcontrollers","Sensors","Modules","Displays","Kits"].map(c => (
                <li key={c}><Link href={`/products?category=${c.toLowerCase()}`} className="hover:text-blue-700 transition-colors">{c}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-gray-900 mb-3">Services</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              {[["Start a project","/projects/new"],["Project portal","/projects"],["How it works","/how-it-works"],["Pricing","/pricing"]].map(([l,h]) => (
                <li key={h}><Link href={h} className="hover:text-blue-700 transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-gray-900 mb-3">Contact</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li className="flex items-center gap-2"><Mail className="w-4 h-4 shrink-0"/><a href="mailto:hello@electrocomp.com" className="hover:text-blue-700">electronicscompnentpoweringin@gmail.com</a></li>
              <li className="flex items-center gap-2"><Phone className="w-4 h-4 shrink-0"/><span>+234 (0) 901-819-4510</span></li>
              <li className="flex items-center gap-2"><MapPin className="w-4 h-4 shrink-0"/><span>Ilupeju District, LG</span></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-gray-400">
          <p>© {new Date().getFullYear()} ElectroComp. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-gray-700">Privacy</Link>
            <Link href="/terms" className="hover:text-gray-700">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
