"use client";

import { useCartStore } from "@/store/cartStore";
import { X, ShoppingCart, Trash2, Plus, Minus } from "lucide-react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, totalPrice } = useCartStore();

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50" onClick={closeCart} />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-blue-700" />
            <h2 className="font-semibold text-gray-900">
              Cart <span className="text-gray-400 font-normal text-sm">({items.length})</span>
            </h2>
          </div>
          <button onClick={closeCart} className="p-2 rounded-md hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4">
              <ShoppingCart className="w-12 h-12 text-gray-200" />
              <div>
                <p className="font-medium text-gray-900">Your cart is empty</p>
                <p className="text-sm text-gray-500 mt-1">Add some components to get started</p>
              </div>
              <button onClick={closeCart} className="text-sm text-blue-700 font-medium hover:underline">
                Continue shopping
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4 py-3 border-b last:border-0">
                <div className="w-16 h-16 bg-gray-100 rounded-lg shrink-0 overflow-hidden">
                  {item.product.images?.[0] ? (
                    <img src={item.product.images[0]} alt={item.product.name}
                      className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No img</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900 truncate">{item.product.name}</p>
                  <p className="text-sm text-blue-700 font-semibold mt-0.5">
                    {formatPrice(Number(item.product.price) * item.quantity)}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1 border rounded-md">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1.5 hover:bg-gray-100 transition-colors">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm w-6 text-center font-medium">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1.5 hover:bg-gray-100 transition-colors">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <button onClick={() => removeItem(item.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t px-5 py-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">Subtotal</span>
              <span className="font-bold text-gray-900">{formatPrice(totalPrice())}</span>
            </div>
            <p className="text-xs text-gray-400">Shipping calculated at checkout</p>
            <Link href="/checkout" onClick={closeCart}
              className="block w-full bg-blue-700 hover:bg-blue-800 text-white text-center font-semibold py-3 rounded-lg transition-colors">
              Proceed to checkout
            </Link>
            <Link href="/cart" onClick={closeCart}
              className="block w-full text-center text-sm text-gray-600 hover:text-gray-900 py-1 transition-colors">
              View full cart
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
