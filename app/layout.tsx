import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/shared/Providers";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";

export const metadata: Metadata = {
  title: {
    default: "ElectroComp — Electronic Components, Powering Innovation",
    template: "%s | ElectroComp",
  },
  description: "Shop quality electronic components and get your custom electronics project built by expert engineers.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, -apple-system, sans-serif" }}>
        <Providers>
          <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            <Navbar />
            <main style={{ flex: 1 }}>{children}</main>
            <Footer />
          </div>
          <CartDrawer />
        </Providers>
      </body>
    </html>
  );
}