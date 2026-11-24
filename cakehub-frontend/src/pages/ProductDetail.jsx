import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Star,
  Leaf,
  ShoppingBag,
  CheckCircle2,
  ArrowLeft,
  MapPin,
  Sparkles,
  ImagePlus,
  X,
} from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';

const PARTY_ADDONS = [
  { id: 'candle', label: 'Magic Sparkle Candle (Free)' },
  { id: 'knife', label: 'Cake Knife & Server (Free)' },
  { id: 'card', label: 'Celebration Greeting Card (Free)' },
];

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [ratingSummary, setRatingSummary] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [messageOnCake, setMessageOnCake] = useState('');
  const [selectedAddons, setSelectedAddons] = useState(['candle', 'knife']);

  // Custom Photo Cake Upload State
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Pincode Checker State
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Review form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewMsg, setReviewMsg] = useState('');

  const addItem = useCartStore((s) => s.addItem);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    loadProductDetails();
  }, [slug]);

  const loadProductDetails = async () => {
    setLoading(true);
    try {
      const prodRes = await axiosClient.get(`/products/${slug}`);
      const prodData = prodRes.data.data;
      setProduct(prodData);
      if (prodData.variants?.length > 0) {
        setSelectedVariant(prodData.variants[0]);
      }

      const [revRes, sumRes] = await Promise.all([
        axiosClient.get(`/reviews/product/${prodData.id}`),
        axiosClient.get(`/reviews/product/${prodData.id}/summary`),
      ]);
      setReviews(revRes.data.data?.content || []);
      setRatingSummary(sumRes.data.data);
    } catch (err) {
      console.error('Failed to load product', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isAuthenticated) {
      alert('Please sign in first to upload a custom cake photo.');
      navigate('/login');
      return;
    }

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setUploadingPhoto(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await axiosClient.post('/uploads/cake-photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadedPhotoUrl(res.data.data?.url || '');
    } catch (err) {
      alert(err.response?.data?.message || 'Photo upload failed. Use JPG/PNG under 5MB.');
      setPhotoFile(null);
      setPhotoPreview('');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const clearPhoto = () => {
    setPhotoFile(null);
    setPhotoPreview('');
    setUploadedPhotoUrl('');
  };

  const handleCheckPincode = (e) => {
    e.preventDefault();
    const cleanPin = pincode.trim();
    if (!/^\d{6}$/.test(cleanPin)) {
      setPincodeStatus({
        ok: false,
        text: 'Please enter a valid 6-digit Indian pincode (e.g. 110001, 201301).',
      });
      return;
    }
    setPincodeStatus({
      ok: true,
      text: `Same-day doorstep delivery is available for pincode ${cleanPin}!`,
    });
  };

  const toggleAddon = (id) => {
    setSelectedAddons((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!selectedVariant) return;

    const addonLabels = PARTY_ADDONS.filter((a) => selectedAddons.includes(a.id)).map(
      (a) => a.label.replace(' (Free)', '')
    );

    const combinedNote = [
      messageOnCake.trim() ? `Msg: ${messageOnCake.trim()}` : '',
      addonLabels.length > 0 ? `Add-ons: ${addonLabels.join(', ')}` : '',
      uploadedPhotoUrl ? `PhotoURL: ${uploadedPhotoUrl}` : '',
    ]
      .filter(Boolean)
      .join(' | ');

    setSubmitting(true);
    try {
      await addItem(selectedVariant.id, quantity, combinedNote);
    } catch (err) {
      const data = err.response?.data;
      const detailedMsg = data?.errors
        ? Object.values(data.errors).join(' | ')
        : data?.message || 'Could not add item to cart.';
      alert(detailedMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewMsg('');
    try {
      await axiosClient.post(`/reviews/product/${product.id}`, { rating, comment });
      setComment('');
      setReviewMsg('Thank you! Your review has been published.');
      loadProductDetails();
    } catch (err) {
      setReviewMsg(err.response?.data?.message || 'Unable to submit review.');
    }
  };

  if (loading) return <div className="max-w-5xl mx-auto p-12 text-stone-500">Loading cake details...</div>;
  if (!product) return <div className="max-w-5xl mx-auto p-12 text-red-600">Cake not found.</div>;

  const fallbackImg =
    'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=80';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-600 hover:text-bakery-600"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Menu
      </button>

      {/* Main Product Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 bg-white p-6 md:p-8 rounded-3xl border border-bakery-200 shadow-2xs">
        <div className="space-y-4">
          <div className="rounded-2xl overflow-hidden bg-bakery-100 h-80 md:h-[420px]">
            <img
              src={product.primaryImageUrl || fallbackImg}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Pincode Delivery Checker */}
          <form
            onSubmit={handleCheckPincode}
            className="p-4 rounded-2xl bg-bakery-50/70 border border-bakery-200 space-y-2.5"
          >
            <label className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-bakery-600" /> Check Delivery Availability
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="Enter 6-digit Pincode (e.g. 110001)"
                className="flex-1 px-3.5 py-2 text-sm bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-bakery-500"
              />
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition"
              >
                Check
              </button>
            </div>
            {pincodeStatus && (
              <p
                className={`text-xs font-medium ${
                  pincodeStatus.ok ? 'text-emerald-700' : 'text-red-600'
                }`}
              >
                {pincodeStatus.text}
              </p>
            )}
          </form>
        </div>

        <div className="space-y-5">
          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="text-bakery-600 uppercase tracking-wider">{product.categoryName}</span>
            {product.isEggless && (
              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full">
                <Leaf className="h-3.5 w-3.5" /> 100% Eggless
              </span>
            )}
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-stone-900">{product.name}</h1>

          {ratingSummary && (
            <div className="flex items-center gap-2 text-sm">
              <span className="inline-flex items-center gap-1 font-bold text-amber-600">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                {Number(ratingSummary.averageRating || 0).toFixed(1)}
              </span>
              <span className="text-stone-400">({ratingSummary.totalReviews} reviews)</span>
            </div>
          )}

          <p className="text-stone-600 text-sm leading-relaxed">{product.description}</p>

          {/* Weight Variant Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500">
              1. Select Cake Weight
            </label>
            <div className="flex flex-wrap gap-2.5">
              {product.variants?.map((variant) => {
                const isSelected = selectedVariant?.id === variant.id;
                return (
                  <button
                    key={variant.id}
                    type="button"
                    disabled={variant.stockQuantity <= 0}
                    onClick={() => setSelectedVariant(variant)}
                    className={`px-4 py-2.5 rounded-xl border text-left transition ${
                      isSelected
                        ? 'border-bakery-600 bg-bakery-50 text-bakery-800 ring-1 ring-bakery-600'
                        : 'border-stone-200 hover:border-bakery-300'
                    } ${variant.stockQuantity <= 0 ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    <div className="text-sm font-bold">{variant.weightInKg} kg</div>
                    <div className="text-xs text-stone-500">₹{Number(variant.price).toFixed(0)}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Photo Cake Uploader */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
              <ImagePlus className="h-3.5 w-3.5 text-bakery-600" /> 2. Make it a Photo Cake (Optional)
            </label>

            {!photoPreview ? (
              <label className="flex items-center justify-center gap-2 p-3.5 border-2 border-dashed border-bakery-300 rounded-xl bg-bakery-50/40 hover:bg-bakery-50 cursor-pointer transition text-xs font-semibold text-bakery-700">
                <ImagePlus className="h-4 w-4" />
                <span>Upload Photo for Edible Sugar Print (JPG/PNG)</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="flex items-center gap-3 p-2.5 rounded-xl border border-bakery-200 bg-bakery-50/50">
                <img
                  src={photoPreview}
                  alt="Custom cake preview"
                  className="w-14 h-14 rounded-lg object-cover border border-stone-200"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-stone-800 truncate">{photoFile?.name}</p>
                  <p className="text-[11px] text-emerald-700 font-medium">
                    {uploadingPhoto
                      ? 'Uploading photo...'
                      : '✓ Photo attached for edible sheet print'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={clearPhoto}
                  className="p-1.5 text-stone-500 hover:text-red-600 rounded-lg"
                  title="Remove photo"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Cake Inscription Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500">
              3. Message on Cake (Optional)
            </label>
            <input
              type="text"
              maxLength={60}
              value={messageOnCake}
              onChange={(e) => setMessageOnCake(e.target.value)}
              placeholder="e.g. Happy Birthday Ananya!"
              className="w-full px-3.5 py-2 text-sm border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-bakery-500"
            />
          </div>

          {/* Complimentary Party Add-ons */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-bakery-600" /> 4. Complimentary Celebration Add-ons
            </label>
            <div className="flex flex-wrap gap-2">
              {PARTY_ADDONS.map((addon) => {
                const active = selectedAddons.includes(addon.id);
                return (
                  <button
                    key={addon.id}
                    type="button"
                    onClick={() => toggleAddon(addon.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                      active
                        ? 'bg-bakery-50 border-bakery-500 text-bakery-800'
                        : 'bg-white border-stone-200 text-stone-600 hover:border-bakery-300'
                    }`}
                  >
                    {active ? '✓ ' : '+ '}
                    {addon.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity & Add Button */}
          <div className="pt-2 flex items-center gap-4">
            <div className="flex items-center border border-stone-300 rounded-xl">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3.5 py-2.5 text-stone-600 hover:bg-stone-100 rounded-l-xl font-bold"
              >
                -
              </button>
              <span className="px-4 font-bold text-stone-800">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="px-3.5 py-2.5 text-stone-600 hover:bg-stone-100 rounded-r-xl font-bold"
              >
                +
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={submitting || uploadingPhoto || !selectedVariant || selectedVariant.stockQuantity <= 0}
              className="flex-1 bg-bakery-600 hover:bg-bakery-700 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50 shadow-xs"
            >
              <ShoppingBag className="h-5 w-5" />
              {submitting
                ? 'Adding...'
                : `Add to Cake Box • ₹${((selectedVariant?.price || 0) * quantity).toFixed(0)}`}
            </button>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-stone-900">Customer Reviews</h2>
          {reviews.length === 0 ? (
            <p className="text-sm text-stone-500 bg-white p-6 rounded-2xl border border-bakery-200">
              No reviews yet. Order this cake to share your tasting notes!
            </p>
          ) : (
            reviews.map((rev) => (
              <div key={rev.id} className="bg-white p-5 rounded-2xl border border-bakery-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-stone-800">{rev.userFullName}</span>
                    {rev.isVerifiedPurchase && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="h-3 w-3" /> Verified Purchase
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-0.5 text-amber-500 text-xs font-bold">
                    {'★'.repeat(rev.rating)}
                  </div>
                </div>
                <p className="text-sm text-stone-600">{rev.comment}</p>
              </div>
            ))
          )}
        </div>

        {/* Write a Review Card */}
        <div className="bg-white p-6 rounded-2xl border border-bakery-200 h-fit space-y-4">
          <h3 className="font-bold text-stone-900">Write a Review</h3>
          {!isAuthenticated ? (
            <p className="text-xs text-stone-500">Please sign in to leave a review.</p>
          ) : (
            <form onSubmit={handleReviewSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-stone-600 block mb-1">Rating</label>
                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl"
                >
                  {[5, 4, 3, 2, 1].map((num) => (
                    <option key={num} value={num}>
                      {num} Stars
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-600 block mb-1">Your Review</label>
                <textarea
                  rows={3}
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="How was the sponge, frosting, and delivery?"
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl"
                />
              </div>
              {reviewMsg && <p className="text-xs text-bakery-700 font-medium">{reviewMsg}</p>}
              <button
                type="submit"
                className="w-full bg-stone-900 hover:bg-stone-800 text-white text-sm font-semibold py-2.5 rounded-xl transition"
              >
                Submit Review
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}