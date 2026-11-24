import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Clock, Tag, CheckCircle2, X, ShoppingBag } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { useCartStore } from '../store/cartStore';

const STANDARD_SLOTS = [
  '10:00 AM - 01:00 PM',
  '01:00 PM - 04:00 PM',
  '04:00 PM - 07:00 PM',
  '07:00 PM - 10:00 PM',
];

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, fetchCart } = useCartStore();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [showNewAddress, setShowNewAddress] = useState(false);

  const [newAddr, setNewAddr] = useState({
    addressType: 'HOME',
    recipientName: '',
    recipientPhone: '',
    streetAddress: '',
    landmark: '',
    city: 'Ghaziabad',
    state: 'Uttar Pradesh',
    postalCode: '',
  });

  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const [deliveryDate, setDeliveryDate] = useState(tomorrow);
  const [deliveryTimeSlot, setDeliveryTimeSlot] = useState(STANDARD_SLOTS[1]);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');

  // Promo Coupon State
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const [placingOrder, setPlacingOrder] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [addrRes, coupRes] = await Promise.all([
        axiosClient.get('/addresses'),
        axiosClient.get('/coupons'),
      ]);
      const addrList = addrRes.data.data || [];
      setAddresses(addrList);
      if (addrList.length > 0) {
        const def = addrList.find((a) => a.isDefault) || addrList[0];
        setSelectedAddressId(String(def.id));
      } else {
        setShowNewAddress(true);
      }
      setAvailableCoupons(coupRes.data.data || []);
    } catch (err) {
      console.error('Failed to load checkout data', err);
    }
  };

  const subtotal = Number(
    cart?.subtotal ??
      cart?.items?.reduce((acc, item) => acc + Number(item.itemTotal || 0), 0) ??
      0
  );
  const discount = Number(appliedCoupon?.discountAmount || 0);
  const discountedSubtotal = Math.max(0, subtotal - discount);
  const gst = Number((discountedSubtotal * 0.05).toFixed(2));
  const deliveryFee = discountedSubtotal >= 499 || discountedSubtotal === 0 ? 0 : 49;
  const grandTotal = Number((discountedSubtotal + gst + deliveryFee).toFixed(2));

  const handleApplyCoupon = async (codeOverride) => {
    const codeToTest = (codeOverride ?? couponInput).trim().toUpperCase();
    if (!codeToTest) return;

    setApplyingCoupon(true);
    setCouponError('');
    try {
      const res = await axiosClient.post('/coupons/validate', {
        code: codeToTest,
        subtotal,
      });
      setAppliedCoupon(res.data.data);
      setCouponInput(res.data.data.code);
    } catch (err) {
      setAppliedCoupon(null);
      setCouponError(err.response?.data?.message || 'Invalid promo code.');
    } finally {
      setApplyingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError('');
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setError('');

    const cleanPhone = newAddr.recipientPhone.replace(/\D/g, '').slice(-10);
    const cleanPostal = newAddr.postalCode.replace(/\D/g, '').slice(0, 6);

    if (cleanPhone.length !== 10) {
      setError('Recipient phone must be a valid 10-digit mobile number (without leading 0).');
      return;
    }
    if (cleanPostal.length !== 6) {
      setError('Postal code must be a valid 6-digit PIN code.');
      return;
    }

    setSavingAddress(true);
    try {
      const payload = {
        recipientName: newAddr.recipientName.trim(),
        recipientPhone: cleanPhone,
        streetAddress: newAddr.streetAddress.trim(),
        landmark: newAddr.landmark.trim() || null,
        city: newAddr.city.trim(),
        state: newAddr.state.trim(),
        postalCode: cleanPostal,
        addressType: newAddr.addressType || 'HOME',
        isDefault: true,
      };
      const res = await axiosClient.post('/addresses', payload);
      const created = res.data.data;
      setAddresses((prev) => [...prev, created]);
      setSelectedAddressId(String(created.id));
      setShowNewAddress(false);
    } catch (err) {
      const data = err.response?.data;
      const detailedMsg = data?.errors
        ? Object.values(data.errors).join(' | ')
        : data?.message || 'Failed to save delivery address.';
      setError(detailedMsg);
    } finally {
      setSavingAddress(false);
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!selectedAddressId) {
      setError('Please select or add a delivery address.');
      return;
    }

    setPlacingOrder(true);
    setError('');
    try {
      await axiosClient.post('/orders/checkout', {
        deliveryAddressId: Number(selectedAddressId),
        deliveryDate,
        deliveryTimeSlot,
        paymentMethod,
        deliveryInstructions: deliveryInstructions.trim() || null,
        couponCode: appliedCoupon?.code || null,
      });
      await fetchCart();
      navigate('/orders');
    } catch (err) {
      const data = err.response?.data;
      const detailedMsg = data?.errors
        ? Object.values(data.errors).join(' | ')
        : data?.message || 'Could not place order. Please try again.';
      setError(detailedMsg);
    } finally {
      setPlacingOrder(false);
    }
  };

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <ShoppingBag className="h-12 w-12 text-bakery-400 mx-auto" />
        <h2 className="text-xl font-bold text-stone-900">Your Cake Box is empty</h2>
        <button
          onClick={() => navigate('/')}
          className="bg-bakery-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl"
        >
          Browse Cakes
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-extrabold text-stone-900 mb-6">Complete Your Cake Order</h1>

      {error && (
        <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Address & Delivery Slot */}
        <div className="lg:col-span-7 space-y-6">
          {/* Step 1: Delivery Address */}
          <div className="bg-white p-6 rounded-2xl border border-bakery-200 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-stone-900 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-bakery-600" /> 1. Delivery Address
              </h2>
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setShowNewAddress(!showNewAddress);
                }}
                className="text-xs font-bold text-bakery-600 hover:underline"
              >
                {showNewAddress ? 'Cancel' : '+ Add New Address'}
              </button>
            </div>

            {showNewAddress ? (
              <form onSubmit={handleSaveAddress} className="space-y-3 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    required
                    placeholder="Recipient Name"
                    value={newAddr.recipientName}
                    onChange={(e) => setNewAddr({ ...newAddr, recipientName: e.target.value })}
                    className="px-3.5 py-2 text-sm border border-stone-300 rounded-xl"
                  />
                  <input
                    required
                    maxLength={10}
                    placeholder="10-Digit Mobile (e.g. 6200305153)"
                    value={newAddr.recipientPhone}
                    onChange={(e) =>
                      setNewAddr({
                        ...newAddr,
                        recipientPhone: e.target.value.replace(/\D/g, '').slice(0, 10),
                      })
                    }
                    className="px-3.5 py-2 text-sm border border-stone-300 rounded-xl"
                  />
                </div>
                <input
                  required
                  placeholder="House / Flat No., Street, Area"
                  value={newAddr.streetAddress}
                  onChange={(e) => setNewAddr({ ...newAddr, streetAddress: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-stone-300 rounded-xl"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    placeholder="Landmark (Optional)"
                    value={newAddr.landmark}
                    onChange={(e) => setNewAddr({ ...newAddr, landmark: e.target.value })}
                    className="px-3.5 py-2 text-sm border border-stone-300 rounded-xl"
                  />
                  <select
                    value={newAddr.addressType}
                    onChange={(e) => setNewAddr({ ...newAddr, addressType: e.target.value })}
                    className="px-3.5 py-2 text-sm border border-stone-300 rounded-xl bg-white"
                  >
                    <option value="HOME">Home</option>
                    <option value="WORK">Work / Office</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <input
                    required
                    placeholder="City"
                    value={newAddr.city}
                    onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                    className="px-3.5 py-2 text-sm border border-stone-300 rounded-xl"
                  />
                  <input
                    required
                    placeholder="State"
                    value={newAddr.state}
                    onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                    className="px-3.5 py-2 text-sm border border-stone-300 rounded-xl"
                  />
                  <input
                    required
                    maxLength={6}
                    placeholder="6-Digit PIN Code"
                    value={newAddr.postalCode}
                    onChange={(e) =>
                      setNewAddr({
                        ...newAddr,
                        postalCode: e.target.value.replace(/\D/g, '').slice(0, 6),
                      })
                    }
                    className="px-3.5 py-2 text-sm border border-stone-300 rounded-xl"
                  />
                </div>
                <button
                  type="submit"
                  disabled={savingAddress}
                  className="bg-stone-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-stone-800 disabled:opacity-50"
                >
                  {savingAddress ? 'Saving...' : 'Save Address'}
                </button>
              </form>
            ) : (
              <div className="space-y-2.5">
                {addresses.map((addr) => (
                  <label
                    key={addr.id}
                    className={`block p-3.5 rounded-xl border cursor-pointer transition ${
                      String(selectedAddressId) === String(addr.id)
                        ? 'border-bakery-600 bg-bakery-50/70'
                        : 'border-stone-200 hover:border-bakery-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="address"
                        checked={String(selectedAddressId) === String(addr.id)}
                        onChange={() => setSelectedAddressId(String(addr.id))}
                        className="mt-1 text-bakery-600"
                      />
                      <div className="text-xs space-y-0.5">
                        <p className="font-bold text-stone-900">
                          {addr.recipientName} ({addr.addressType || 'HOME'}) • {addr.recipientPhone}
                        </p>
                        <p className="text-stone-600">
                          {addr.streetAddress}
                          {addr.landmark ? `, Near ${addr.landmark}` : ''}, {addr.city},{' '}
                          {addr.state} - {addr.postalCode}
                        </p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Step 2: Delivery Date, Time Slot & Payment Mode */}
          <div className="bg-white p-6 rounded-2xl border border-bakery-200 space-y-4">
            <h2 className="font-bold text-stone-900 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-bakery-600" /> 2. Delivery Schedule & Payment
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">
                  Delivery Date
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-stone-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> Time Slot
                </label>
                <select
                  value={deliveryTimeSlot}
                  onChange={(e) => setDeliveryTimeSlot(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-stone-300 rounded-xl bg-white"
                >
                  {STANDARD_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                Payment Method
              </label>
              <div className="flex flex-wrap gap-2.5">
                {['COD', 'UPI', 'CARD'].map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
                      paymentMethod === method
                        ? 'border-bakery-600 bg-bakery-50 text-bakery-800'
                        : 'border-stone-200 text-stone-600 hover:border-bakery-300'
                    }`}
                  >
                    {method === 'COD' ? 'Cash on Delivery (COD)' : method}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                Delivery Instructions (Optional)
              </label>
              <input
                type="text"
                maxLength={255}
                value={deliveryInstructions}
                onChange={(e) => setDeliveryInstructions(e.target.value)}
                placeholder="e.g. Ring the doorbell gently or call on arrival"
                className="w-full px-3.5 py-2 text-sm border border-stone-300 rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Promo Code & Order Summary */}
        <div className="lg:col-span-5 space-y-6">
          {/* Promo Coupon Box */}
          <div className="bg-white p-6 rounded-2xl border border-bakery-200 space-y-3">
            <h2 className="font-bold text-stone-900 flex items-center gap-2 text-sm">
              <Tag className="h-4 w-4 text-bakery-600" /> Apply Promo Coupon
            </h2>

            {appliedCoupon ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                <div className="flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>{appliedCoupon.message}</span>
                </div>
                <button
                  type="button"
                  onClick={removeCoupon}
                  className="p-1 hover:bg-emerald-100 rounded-lg"
                  title="Remove coupon"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="Enter code (e.g. FIRST100)"
                  className="flex-1 px-3.5 py-2 text-sm uppercase border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-bakery-500"
                />
                <button
                  type="button"
                  disabled={applyingCoupon || !couponInput.trim()}
                  onClick={() => handleApplyCoupon()}
                  className="px-4 py-2 text-xs font-bold bg-stone-900 text-white rounded-xl hover:bg-stone-800 disabled:opacity-50"
                >
                  {applyingCoupon ? 'Checking...' : 'Apply'}
                </button>
              </div>
            )}

            {couponError && <p className="text-xs text-red-600 font-medium">{couponError}</p>}

            {/* Clickable Available Coupon Chips */}
            {!appliedCoupon && availableCoupons.length > 0 && (
              <div className="pt-1 space-y-1.5">
                <p className="text-[11px] font-semibold text-stone-400 uppercase">Available Offers</p>
                <div className="flex flex-wrap gap-2">
                  {availableCoupons.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleApplyCoupon(c.code)}
                      className="text-xs px-2.5 py-1 rounded-lg border border-dashed border-bakery-400 bg-bakery-50/70 text-bakery-800 font-bold hover:bg-bakery-100 transition"
                    >
                      {c.code} (
                      {c.discountType === 'PERCENT'
                        ? `${Number(c.discountValue)}% OFF`
                        : `₹${Number(c.discountValue)} OFF`}
                      )
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bill Summary */}
          <div className="bg-white p-6 rounded-2xl border border-bakery-200 space-y-4">
            <h2 className="font-bold text-stone-900">Order Summary ({cart.totalItems} items)</h2>

            <div className="space-y-2 text-sm border-b border-stone-100 pb-4">
              {cart.items.map((item) => (
                <div key={item.id} className="flex justify-between text-stone-700">
                  <span className="truncate pr-2">
                    {item.quantity}× {item.productName} ({item.weightInKg}kg)
                  </span>
                  <span className="font-semibold">₹{Number(item.itemTotal || 0).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-stone-600">
                <span>Item Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Promo Discount ({appliedCoupon.code})</span>
                  <span>-₹{discount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-stone-600">
                <span>GST (5%)</span>
                <span>₹{gst.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-stone-600">
                <span>Delivery Fee</span>
                <span className={deliveryFee === 0 ? 'text-emerald-600 font-semibold' : ''}>
                  {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toFixed(2)}`}
                </span>
              </div>

              <div className="flex justify-between text-base font-extrabold text-stone-900 pt-2 border-t border-stone-200">
                <span>Total Payable</span>
                <span>₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={placingOrder}
              className="w-full bg-bakery-600 hover:bg-bakery-700 text-white font-bold py-3.5 rounded-xl transition shadow-xs disabled:opacity-50"
            >
              {placingOrder ? 'Placing Order...' : `Confirm Order • ₹${grandTotal.toFixed(2)}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}