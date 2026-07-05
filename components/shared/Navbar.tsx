"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { ShoppingCart, Menu, X, Zap, User, LogOut, Settings, Package, LayoutDashboard } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useState } from "react";

const navLinks = [
  { href: "/products", label: "Products" },
  { href: "/products?category=microcontrollers", label: "Microcontrollers" },
  { href: "/products?category=sensors", label: "Sensors" },
  { href: "/projects/new", label: "Start a Project" },
];

export function Navbar() {
  const { data: session } = useSession();
  const totalItems = useCartStore((s) => s.totalItems());
  const openCart = useCartStore((s) => s.openCart);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const isAdmin = (session?.user as any)?.role === "ADMIN" || (session?.user as any)?.role === "ENGINEER";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <div className="flex items-center justify-center w-8 h-8 rounded bg-blue-700">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-blue-900">ELECTRO</span>
          <span className="text-blue-600">COMP</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}
              className="text-sm font-medium text-gray-600 hover:text-blue-700 transition-colors">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button onClick={openCart} className="relative p-2 rounded-md hover:bg-gray-100 transition-colors" aria-label="Open cart">
            <ShoppingCart className="w-5 h-5 text-gray-700" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-blue-600 text-white text-xs rounded-full font-semibold">
                {totalItems}
              </span>
            )}
          </button>

          {session ? (
            <div className="relative">
              <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center p-1.5 rounded-md hover:bg-gray-100 transition-colors">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm">
                  {session.user?.name?.[0] ?? session.user?.email?.[0] ?? "U"}
                </div>
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-lg border py-1 z-50">
                  <div className="px-3 py-2 border-b">
                    <p className="text-sm font-medium truncate">{session.user?.name ?? "User"}</p>
                    <p className="text-xs text-gray-500 truncate">{session.user?.email}</p>
                  </div>
                  {isAdmin && (
                    <Link href="/admin/dashboard" className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
                      onClick={() => setUserMenuOpen(false)}>
                      <LayoutDashboard className="w-4 h-4" /> Admin panel
                    </Link>
                  )}
                  <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
                    onClick={() => setUserMenuOpen(false)}>
                    <User className="w-4 h-4" /> Dashboard
                  </Link>
                  <Link href="/orders" className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
                    onClick={() => setUserMenuOpen(false)}>
                    <Package className="w-4 h-4" /> Orders
                  </Link>
                  <Link href="/projects" className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
                    onClick={() => setUserMenuOpen(false)}>
                    <Settings className="w-4 h-4" /> My projects
                  </Link>
                  <hr className="my-1" />
                  <button onClick={() => { signOut(); setUserMenuOpen(false); }}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left">
                    <LogOut className="w-4 h-4" /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-blue-700 px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors">
                Sign in
              </Link>
              <Link href="/signup" className="text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 px-4 py-1.5 rounded-md transition-colors">
                Get started
              </Link>
            </div>
          )}

          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-md hover:bg-gray-100">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t bg-white px-4 py-4 space-y-3">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}
              className="block text-sm font-medium text-gray-700 py-1"
              onClick={() => setMobileOpen(false)}>
              {link.label}
            </Link>
          ))}
          {!session && (
            <div className="flex flex-col gap-2 pt-2 border-t">
              <Link href="/login" className="text-sm font-medium text-center text-gray-700 border rounded-md py-2" onClick={() => setMobileOpen(false)}>Sign in</Link>
              <Link href="/signup" className="text-sm font-medium text-center text-white bg-blue-700 rounded-md py-2" onClick={() => setMobileOpen(false)}>Get started</Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
