import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';

export default function CartDrawer() {
  const { cart, isDrawerOpen, closeDrawer, updateItem, removeItem, isLoading } = useCartStore();
  const navigate = useNavigate();

  if (!isDrawerOpen) return null;

  const handleCheckout = () => {
    closeDrawer();
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 transition-opacity" onClick={closeDrawer} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-xl flex flex-col justify-between">
          {/* Header */}
          <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-bakery-600" />
              <h2 className="text-lg font-semibold text-stone-900">Your Cake Box</h2>
            </div>
            <button onClick={closeDrawer} className="text-stone-400 hover:text-stone-600">
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {!cart || cart.items.length === 0 ? (
              <div className="text-center py-16 text-stone-500">
                <ShoppingBag className="h-12 w-12 mx-auto mb-3 text-stone-300" />
                <p className="font-medium">Your cake box is empty</p>
                <p className="text-sm mt-1">Explore our freshly baked cakes to add some sweetness!</p>
              </div>
            ) : (
              cart.items.map((item) => (
                <div
                  key={item.id}
                  className="border border-stone-200 rounded-xl p-4 flex flex-col gap-2 bg-bakery-50/40"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-stone-900 text-sm">{item.productName}</h3>
                      <p className="text-xs text-stone-500">
                        {item.weightInKg} kg • ₹{Number(item.unitPrice).toFixed(2)} each
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      disabled={isLoading}
                      className="text-stone-400 hover:text-red-500 transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {item.messageOnCake && (
                    <p className="text-xs bg-amber-50 text-amber-800 px-2.5 py-1 rounded border border-amber-200">
                      Message: "{item.messageOnCake}"
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center border border-stone-300 rounded-lg bg-white">
                      <button
                        disabled={isLoading || item.quantity <= 1}
                        onClick={() => updateItem(item.id, { quantity: item.quantity - 1 })}
                        className="p-1.5 text-stone-600 hover:text-bakery-600 disabled:opacity-40"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="px-3 text-sm font-medium">{item.quantity}</span>
                      <button
                        disabled={isLoading}
                        onClick={() => updateItem(item.id, { quantity: item.quantity + 1 })}
                        className="p-1.5 text-stone-600 hover:text-bakery-600"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <span className="font-semibold text-stone-900 text-sm">
                      ₹{Number(item.itemTotal).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer / Totals */}
          {cart && cart.items.length > 0 && (
            <div className="border-t border-stone-200 px-6 py-4 bg-stone-50 space-y-3">
              <div className="space-y-1 text-sm">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span>₹{Number(cart.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Estimated GST (5%)</span>
                  <span>₹{Number(cart.estimatedTax).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Delivery Fee</span>
                  <span>
                    {cart.estimatedDeliveryFee === 0 ? (
                      <span className="text-emerald-600 font-medium">FREE</span>
                    ) : (
                      `₹${Number(cart.estimatedDeliveryFee).toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-base text-stone-900 pt-2 border-t border-stone-200">
                  <span>Estimated Total</span>
                  <span>₹{Number(cart.estimatedGrandTotal).toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full bg-bakery-600 hover:bg-bakery-700 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition"
              >
                Proceed to Checkout
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}