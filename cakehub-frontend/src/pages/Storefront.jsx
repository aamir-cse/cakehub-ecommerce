import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Star,
  Leaf,
  ShoppingBag,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Truck,
  ShieldCheck,
  Award,
  Gift,
} from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';

const HERO_BANNERS = [
  {
    badge: 'Same-Day Fresh Delivery',
    title: 'Handcrafted Celebration Cakes Delivered Fresh',
    subtitle:
      'From rich Belgian Dark Truffle to 100% Eggless Fresh Fruit Gateaux — freshly baked to order.',
    cta: 'Order Bestsellers',
    filterKeyword: '',
    bgClass: 'from-bakery-700 via-bakery-600 to-rose-500',
    image:
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=80',
  },
  {
    badge: '100% Pure Veg & Eggless Kitchen',
    title: 'Melt-in-Mouth Eggless Artisanal Cheesecakes',
    subtitle:
      'Lotus Biscoff, Blueberry Compote, and New York Baked Cheesecakes crafted with zero eggs.',
    cta: 'Explore Cheesecakes',
    filterKeyword: 'Cheese',
    bgClass: 'from-rose-800 via-pink-700 to-amber-600',
    image:
      'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=900&q=80',
  },
  {
    badge: 'Custom Photo & Theme Cakes',
    title: 'Make Birthdays & Anniversaries Unforgettable',
    subtitle:
      'Add custom cake messages, sparkle candles, and same-day doorstep surprise delivery.',
    cta: 'Explore Chocolate Cakes',
    filterKeyword: 'Chocolate',
    bgClass: 'from-stone-900 via-bakery-900 to-bakery-700',
    image:
      'https://images.unsplash.com/photo-1562440499-64c9a111f713?auto=format&fit=crop&w=900&q=80',
  },
];

const FLAVOUR_CARDS = [
  {
    name: 'Belgian Chocolate',
    keyword: 'Chocolate',
    img: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Fresh Fruit',
    keyword: 'Fruit',
    img: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Red Velvet',
    keyword: 'Velvet',
    img: 'https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Cheesecakes',
    keyword: 'Cheese',
    img: 'https://images.unsplash.com/photo-1524351199678-941a58a3df50?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Butterscotch',
    keyword: 'Butterscotch',
    img: 'https://images.unsplash.com/photo-1542826438-bd32f43d626f?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Black Forest',
    keyword: 'Forest',
    img: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&w=400&q=80',
  },
];

const OCCASIONS = [
  { label: 'Birthday Cakes', tag: 'Most Popular', keyword: '' },
  { label: 'Anniversary Specials', tag: 'Romantic', keyword: 'Velvet' },
  { label: 'Wedding & Grand', tag: 'Tiered', keyword: 'Wedding' },
  { label: 'Kids Theme Cakes', tag: 'Fun', keyword: 'Chocolate' },
];

export default function Storefront() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [egglessOnly, setEgglessOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState(null);
  const [slideIdx, setSlideIdx] = useState(0);

  const addItem = useCartStore((s) => s.addItem);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, egglessOnly]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIdx((prev) => (prev + 1) % HERO_BANNERS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axiosClient.get('/categories');
      setCategories(res.data.data || []);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  const fetchProducts = async (searchOverride = searchQuery) => {
    setLoading(true);
    try {
      const params = { page: 0, size: 20 };
      if (selectedCategory !== '') params.categoryId = Number(selectedCategory);
      if (searchOverride.trim()) params.search = searchOverride.trim();
      if (egglessOnly) params.eggless = true;

      const res = await axiosClient.get('/products', { params });
      setProducts(res.data.data?.content || []);
    } catch (err) {
      console.error('Failed to load products', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts(searchQuery);
  };

  const handleQuickFilter = (keyword) => {
    setSelectedCategory('');
    setSearchQuery(keyword);
    fetchProducts(keyword);
    const menuEl = document.getElementById('cake-menu-section');
    if (menuEl) menuEl.scrollIntoView({ behavior: 'smooth' });
  };

  const handleQuickAdd = async (e, product) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please sign in to add cakes to your Cake Box.');
      return;
    }

    const defaultVariant = product.variants?.[0];
    if (!defaultVariant) {
      alert('No weight variants available for this cake yet.');
      return;
    }

    setAddingId(product.id);
    try {
      await addItem(defaultVariant.id, 1, '');
    } catch (err) {
      alert(err.response?.data?.message || 'Could not add cake to cart.');
    } finally {
      setAddingId(null);
    }
  };

  const activeBanner = HERO_BANNERS[slideIdx];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10">
      {/* 1. Promotional Hero Carousel */}
      <div
        className={`relative rounded-3xl bg-gradient-to-r ${activeBanner.bgClass} text-white overflow-hidden shadow-md transition-all duration-500`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
          <div className="lg:col-span-7 p-7 sm:p-10 lg:p-12 space-y-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-white/20 backdrop-blur-xs px-3.5 py-1.5 rounded-full">
              <Sparkles className="h-3.5 w-3.5" /> {activeBanner.badge}
            </span>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              {activeBanner.title}
            </h1>
            <p className="text-white/90 text-sm sm:text-base max-w-xl">
              {activeBanner.subtitle}
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => handleQuickFilter(activeBanner.filterKeyword)}
                className="bg-white text-bakery-700 hover:bg-bakery-50 font-bold text-sm px-6 py-3 rounded-xl shadow-sm transition cursor-pointer"
              >
                {activeBanner.cta}
              </button>
              <button
                onClick={() => {
                  setEgglessOnly(true);
                  const menuEl = document.getElementById('cake-menu-section');
                  if (menuEl) menuEl.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-white/15 hover:bg-white/25 text-white font-semibold text-sm px-5 py-3 rounded-xl border border-white/30 transition cursor-pointer"
              >
                100% Eggless Range
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 h-56 sm:h-72 lg:h-96 relative">
            <img
              src={activeBanner.image}
              alt={activeBanner.title}
              className="w-full h-full object-cover"
            />
            <div className="hidden lg:block absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-black/25 to-transparent" />
          </div>
        </div>

        {/* Carousel Controls */}
        <button
          onClick={() =>
            setSlideIdx((prev) => (prev - 1 + HERO_BANNERS.length) % HERO_BANNERS.length)
          }
          aria-label="Previous Banner"
          className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/85 hover:bg-white text-stone-800 p-2 rounded-full shadow-md transition"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() => setSlideIdx((prev) => (prev + 1) % HERO_BANNERS.length)}
          aria-label="Next Banner"
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/85 hover:bg-white text-stone-800 p-2 rounded-full shadow-md transition"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        {/* Slide Dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
          {HERO_BANNERS.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlideIdx(i)}
              className={`h-2 rounded-full transition-all ${
                i === slideIdx ? 'w-7 bg-white' : 'w-2 bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* 2. Trust Badges Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-bakery-200 shadow-2xs">
        <div className="flex items-center gap-3 p-2">
          <div className="p-2.5 rounded-xl bg-bakery-50 text-bakery-600">
            <Truck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-stone-900">Same-Day Delivery</p>
            <p className="text-[11px] text-stone-500">On-time doorstep delivery</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-2">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
            <Leaf className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-stone-900">100% Eggless Options</p>
            <p className="text-[11px] text-stone-500">Dedicated pure-veg prep</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-2">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-stone-900">Freshly Baked</p>
            <p className="text-[11px] text-stone-500">Baked after order confirmation</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-2">
          <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-stone-900">Hygienic Packaging</p>
            <p className="text-[11px] text-stone-500">Tamper-proof cake boxes</p>
          </div>
        </div>
      </div>

      {/* 3. Shop by Flavour */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900">Shop by Flavour</h2>
            <p className="text-xs text-stone-500">Pick your favourite artisanal cake flavour</p>
          </div>
          {searchQuery && (
            <button
              onClick={() => handleQuickFilter('')}
              className="text-xs font-semibold text-bakery-600 hover:underline"
            >
              Clear Flavour Filter
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
          {FLAVOUR_CARDS.map((flav) => (
            <button
              key={flav.name}
              onClick={() => handleQuickFilter(flav.keyword)}
              className="group bg-white p-3 rounded-2xl border border-bakery-100 hover:border-bakery-400 hover:shadow-sm transition flex flex-col items-center text-center space-y-2 cursor-pointer"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-bakery-200 group-hover:border-bakery-500 transition">
                <img
                  src={flav.img}
                  alt={flav.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                />
              </div>
              <span className="text-xs sm:text-sm font-bold text-stone-800 group-hover:text-bakery-600">
                {flav.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* 4. Shop by Occasion Strip */}
      <section className="space-y-3">
        <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 flex items-center gap-2">
          <Gift className="h-5 w-5 text-bakery-600" /> Celebrate Every Occasion
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {OCCASIONS.map((occ) => (
            <button
              key={occ.label}
              onClick={() => handleQuickFilter(occ.keyword)}
              className="p-4 rounded-2xl bg-gradient-to-br from-bakery-50 to-white border border-bakery-200 hover:border-bakery-500 text-left transition flex items-center justify-between group cursor-pointer"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-bakery-600 bg-bakery-100 px-2 py-0.5 rounded-full">
                  {occ.tag}
                </span>
                <p className="font-bold text-stone-900 mt-1.5 group-hover:text-bakery-700">
                  {occ.label}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-bakery-500 group-hover:translate-x-1 transition" />
            </button>
          ))}
        </div>
      </section>

      {/* 5. Main Menu Section */}
      <section id="cake-menu-section" className="space-y-5 pt-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-bakery-200 shadow-2xs">
          <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="h-4 w-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search cakes by flavor, occasion, or name..."
                className="w-full pl-10 pr-4 py-2 text-sm border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-bakery-500"
              />
            </div>
            <button
              type="submit"
              className="bg-bakery-600 hover:bg-bakery-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition"
            >
              Search
            </button>
          </form>

          <label className="inline-flex items-center gap-2 text-sm font-medium text-stone-700 cursor-pointer select-none px-3.5 py-2 rounded-xl border border-stone-200 hover:bg-bakery-50">
            <input
              type="checkbox"
              checked={egglessOnly}
              onChange={(e) => setEgglessOnly(e.target.checked)}
              className="rounded text-bakery-600 focus:ring-bakery-500"
            />
            <Leaf className="h-4 w-4 text-emerald-600" />
            100% Eggless Only
          </label>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition ${
              selectedCategory === ''
                ? 'bg-bakery-600 text-white shadow-xs'
                : 'bg-white text-stone-700 border border-stone-200 hover:border-bakery-300'
            }`}
          >
            All Cakes
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(String(cat.id))}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition ${
                String(selectedCategory) === String(cat.id)
                  ? 'bg-bakery-600 text-white shadow-xs'
                  : 'bg-white text-stone-700 border border-stone-200 hover:border-bakery-300'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Smooth Product Grid */}
        {loading && products.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-bakery-200 overflow-hidden animate-pulse"
              >
                <div className="h-52 bg-bakery-100/80" />
                <div className="p-4 space-y-3">
                  <div className="h-3 w-20 bg-bakery-100 rounded" />
                  <div className="h-5 w-3/4 bg-stone-200 rounded" />
                  <div className="h-3 w-full bg-stone-100 rounded" />
                  <div className="pt-2 flex justify-between items-center">
                    <div className="h-5 w-16 bg-stone-200 rounded" />
                    <div className="h-8 w-20 bg-bakery-100 rounded-xl" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-bakery-200">
            <p className="text-stone-600 font-medium">No cakes found matching your filters.</p>
            <button
              onClick={() => {
                setSelectedCategory('');
                setSearchQuery('');
                setEgglessOnly(false);
                fetchProducts('');
              }}
              className="mt-3 text-sm font-semibold text-bakery-600 hover:underline"
            >
              Reset all filters
            </button>
          </div>
        ) : (
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 transition-opacity duration-200 ${
              loading ? 'opacity-50 pointer-events-none' : 'opacity-100'
            }`}
          >
            {products.map((product) => {
              const displayPrice = Number(product.startingPrice ?? product.basePrice ?? 0);
              const fallbackImg =
                'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80';

              return (
                <Link
                  key={product.id}
                  to={`/products/${product.slug}`}
                  className="group bg-white rounded-2xl border border-bakery-200 overflow-hidden hover:shadow-md hover:border-bakery-300 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-52 bg-bakery-100 overflow-hidden">
                      <img
                        src={product.primaryImageUrl || fallbackImg}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      {product.isEggless && (
                        <span className="absolute top-3 left-3 inline-flex items-center gap-1 bg-white/95 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full shadow-2xs">
                          <Leaf className="h-3 w-3" /> Eggless
                        </span>
                      )}
                      {product.averageRating > 0 && (
                        <span className="absolute top-3 right-3 inline-flex items-center gap-1 bg-stone-900/85 text-amber-300 text-xs font-bold px-2.5 py-1 rounded-full">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          {Number(product.averageRating).toFixed(1)}
                        </span>
                      )}
                    </div>

                    <div className="p-4 space-y-1.5">
                      <div className="text-xs text-bakery-600 font-semibold">
                        <span>{product.categoryName}</span>
                      </div>
                      <h3 className="font-bold text-stone-900 group-hover:text-bakery-700 transition line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="text-xs text-stone-500 line-clamp-2">{product.description}</p>
                    </div>
                  </div>

                  <div className="px-4 pb-4 pt-2 flex items-center justify-between border-t border-stone-100">
                    <div>
                      <span className="text-[11px] text-stone-400 block">Starting from</span>
                      <span className="text-lg font-extrabold text-stone-900">
                        ₹{displayPrice.toFixed(0)}
                      </span>
                    </div>

                    <button
                      onClick={(e) => handleQuickAdd(e, product)}
                      disabled={addingId === product.id}
                      className="inline-flex items-center gap-1.5 bg-bakery-50 hover:bg-bakery-600 text-bakery-700 hover:text-white font-semibold text-xs px-3.5 py-2 rounded-xl border border-bakery-200 hover:border-bakery-600 transition disabled:opacity-50"
                    >
                      <ShoppingBag className="h-3.5 w-3.5" />
                      {addingId === product.id ? 'Adding...' : 'Add'}
                    </button>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}