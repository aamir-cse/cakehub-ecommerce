import { useState, useEffect } from 'react';
import { Package, Calendar, Clock, XCircle, Star } from 'lucide-react';
import axiosClient from '../api/axiosClient';

const STATUS_COLORS = {
  CONFIRMED: 'bg-blue-50 text-blue-700 border-blue-200',
  BAKING_IN_PROGRESS: 'bg-amber-50 text-amber-700 border-amber-200',
  DECORATING: 'bg-purple-50 text-purple-700 border-purple-200',
  READY_FOR_PICKUP: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  OUT_FOR_DELIVERY: 'bg-orange-50 text-orange-700 border-orange-200',
  DELIVERED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  CANCELLED: 'bg-red-50 text-red-700 border-red-200',
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewingProduct, setReviewingProduct] = useState(null);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/orders/my-orders');
      setOrders(res.data.data?.content || []);
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      await axiosClient.patch(`/orders/${orderId}/cancel`);
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Unable to cancel order');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewingProduct) return;
    try {
      await axiosClient.post('/reviews', {
        productId: reviewingProduct.productId,
        rating: Number(rating),
        title,
        comment,
      });
      alert('Thank you! Your review has been published.');
      setReviewingProduct(null);
      setTitle('');
      setComment('');
    } catch (err) {
      alert(err.response?.data?.message || 'Could not submit review');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center gap-2">
        <Package className="h-6 w-6 text-bakery-600" />
        <h1 className="text-2xl font-bold text-stone-900">My Orders</h1>
      </div>

      {loading ? (
        <p className="text-stone-500">Loading your orders...</p>
      ) : orders.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-bakery-200 text-center text-stone-500">
          You haven't placed any cake orders yet.
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-bakery-200 p-6 space-y-4 shadow-xs"
            >
              {/* Order Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-100 pb-4">
                <div>
                  <span className="text-xs text-stone-500 block">Order Number</span>
                  <span className="font-bold text-stone-900">{order.orderNumber}</span>
                </div>

                <div className="flex items-center gap-4 text-xs text-stone-600">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-bakery-600" /> {order.deliveryDate}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-bakery-600" /> {order.deliveryTimeSlot}
                  </span>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    STATUS_COLORS[order.orderStatus] || 'bg-stone-100 text-stone-700'
                  }`}
                >
                  {order.orderStatus.replaceAll('_', ' ')}
                </span>
              </div>

              {/* Order Items */}
              <div className="space-y-2">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <div>
                      <span className="font-semibold text-stone-800">
                        {item.productNameSnapshot} ({item.weightInKgSnapshot} kg) × {item.quantity}
                      </span>
                      {item.messageOnCake && (
                        <span className="ml-2 text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                          "{item.messageOnCake}"
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-stone-900">₹{Number(item.totalPrice).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Footer */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-stone-100">
                <div className="text-sm">
                  <span className="text-stone-500">Total Paid ({order.paymentMethod}): </span>
                  <span className="font-bold text-stone-900">₹{Number(order.totalAmount).toFixed(2)}</span>
                </div>

                <div className="flex items-center gap-3">
                  {order.orderStatus !== 'DELIVERED' && order.orderStatus !== 'CANCELLED' && (
                    <button
                      onClick={() => handleCancelOrder(order.id)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg border border-red-200 transition"
                    >
                      <XCircle className="h-3.5 w-3.5" /> Cancel Order
                    </button>
                  )}

                  {order.orderStatus === 'DELIVERED' && order.items?.length > 0 && (
                    <button
                      onClick={() =>
                        setReviewingProduct({
                          productId: order.items[0].variantId,
                          name: order.items[0].productNameSnapshot,
                        })
                      }
                      className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg border border-amber-200 transition"
                    >
                      <Star className="h-3.5 w-3.5" /> Write a Review
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {reviewingProduct && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmitReview}
            className="bg-white max-w-md w-full rounded-2xl p-6 space-y-4 shadow-xl"
          >
            <h3 className="text-lg font-bold text-stone-900">Review {reviewingProduct.name}</h3>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Star Rating (1–5)</label>
              <select
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-xl"
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} Stars
                  </option>
                ))}
              </select>
            </div>
            <input
              required
              placeholder="Review Headline"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-stone-300 rounded-xl"
            />
            <textarea
              required
              rows={3}
              placeholder="Tell others how the cake tasted..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-stone-300 rounded-xl"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setReviewingProduct(null)}
                className="px-4 py-2 text-sm text-stone-600 hover:bg-stone-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-semibold bg-bakery-600 text-white rounded-xl hover:bg-bakery-700"
              >
                Submit Review
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}