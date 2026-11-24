import { Link, useNavigate } from 'react-router-dom';
import { Cake, ShoppingBag, User, LogOut, LayoutDashboard, Package, MapPin } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { cart, setDrawerOpen } = useCartStore();
  const navigate = useNavigate();

  const itemCount = cart?.totalItems || 0;
  const isStaff = user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_BAKER';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 shadow-2xs">
      {/* Promotional Announcement Bar */}
      <div className="bg-bakery-700 text-white text-[11px] sm:text-xs py-1.5 px-4 text-center font-medium">
        🎉 Free Same-Day Delivery on Orders Above ₹499 • Freshly Baked to Order!
      </div>

      {/* Main Navigation Bar */}
      <nav className="bg-white/95 backdrop-blur-md border-b border-bakery-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo + Delivery City Pill */}
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 text-bakery-700 font-extrabold text-xl tracking-tight">
              <div className="p-1.5 rounded-xl bg-bakery-600 text-white">
                <Cake className="h-5 w-5" />
              </div>
              <span>CakeHub</span>
            </Link>

            <div className="hidden md:flex items-center gap-1.5 text-xs font-medium text-stone-600 bg-bakery-50 border border-bakery-200 px-3 py-1.5 rounded-full">
              <MapPin className="h-3.5 w-3.5 text-bakery-600" />
              <span>Delivering across Delhi NCR</span>
            </div>
          </div>

          {/* Center Nav Links */}
          <div className="hidden sm:flex items-center gap-6 text-sm font-semibold text-stone-700">
            <Link to="/" className="hover:text-bakery-600 transition">
              Cakes & Menu
            </Link>
            {isAuthenticated && (
              <Link to="/orders" className="hover:text-bakery-600 transition flex items-center gap-1.5">
                <Package className="h-4 w-4" /> My Orders
              </Link>
            )}
            {isStaff && (
              <Link
                to="/admin"
                className="text-bakery-700 bg-bakery-50 border border-bakery-200 px-3 py-1.5 rounded-full hover:bg-bakery-100 transition flex items-center gap-1.5"
              >
                <LayoutDashboard className="h-4 w-4" /> Bakery Dashboard
              </Link>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {isAuthenticated && (
              <button
                onClick={() => setDrawerOpen(true)}
                className="relative p-2 text-stone-700 hover:text-bakery-600 hover:bg-bakery-50 rounded-full transition"
                aria-label="Open Cart"
              >
                <ShoppingBag className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-bakery-600 text-white text-[11px] font-bold h-5 w-5 flex items-center justify-center rounded-full">
                    {itemCount}
                  </span>
                )}
              </button>
            )}

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/profile"
                  className="flex items-center gap-1.5 text-sm font-medium text-stone-700 hover:text-bakery-600 px-2.5 py-1.5 rounded-lg hover:bg-bakery-50 transition"
                >
                  <User className="h-4 w-4" />
                  <span className="hidden md:inline">{user?.fullName?.split(' ')[0]}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-2 text-stone-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-stone-700 hover:text-bakery-600 px-3 py-1.5"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-semibold bg-bakery-600 text-white px-4 py-2 rounded-xl hover:bg-bakery-700 transition shadow-2xs"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}