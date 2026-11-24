import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Cake } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const login = useAuthStore((s) => s.login);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axiosClient.post('/auth/login', { email, password });
      const auth = res.data.data;
      login(auth.accessToken, {
        email: auth.email,
        fullName: auth.fullName,
        role: auth.role,
      });
      await fetchCart();
      navigate(auth.role === 'ROLE_ADMIN' || auth.role === 'ROLE_BAKER' ? '/admin' : '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-bakery-200 p-8">
        <div className="text-center mb-6">
          <Cake className="h-10 w-10 text-bakery-600 mx-auto mb-2" />
          <h1 className="text-2xl font-bold text-stone-900">Welcome Back</h1>
          <p className="text-sm text-stone-500 mt-1">Sign in to order fresh artisanal cakes</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="customer@cakehub.com"
              className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-bakery-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-bakery-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-bakery-600 hover:bg-bakery-700 text-white font-semibold py-2.5 rounded-xl transition disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-stone-100 text-xs text-stone-500 space-y-1">
          <p className="font-semibold text-stone-600">Demo Accounts:</p>
          <p>Customer: customer@cakehub.com / Customer@123</p>
          <p>Admin: admin@cakehub.com / Admin@123</p>
        </div>

        <p className="text-center text-sm text-stone-600 mt-6">
          New to CakeHub?{' '}
          <Link to="/register" className="text-bakery-600 font-semibold hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}