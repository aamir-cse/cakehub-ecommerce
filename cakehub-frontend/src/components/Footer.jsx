import { Link } from 'react-router-dom';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  ShieldCheck,
  Cake,
} from 'lucide-react';

const SEO_KEYWORDS = [
  'Birthday Cakes',
  'Kids Birthday Cakes',
  'Anniversary Cakes',
  'Wedding Cakes',
  'Photo Cakes',
  'Custom Cakes',
  'Designer Cakes',
  'Eggless Cakes',
  'Bento Cakes',
  '1 Kg Cakes',
  'Corporate Cake Orders',
  'Cakes by Occasion',
  'Cake Shop in Delhi NCR',
  'Same-Day Cake Delivery',
  'Order Cakes Online',
];

export default function Footer() {
  return (
    <footer className="bg-[#3d2822] text-[#e7d8d3] mt-16 border-t border-[#523830]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
        {/* Top 4-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-[#563b33]">
          {/* Column 1: Brand Info & Socials */}
          <div className="space-y-4">
            <Link to="/" className="inline-flex items-center gap-2.5 text-white">
              <div className="p-1.5 rounded-xl bg-bakery-600 text-white">
                <Cake className="h-5 w-5" />
              </div>
              <span className="font-serif text-2xl font-bold tracking-tight">CakeHub</span>
            </Link>

            <p className="text-sm text-[#d6c3bd] leading-relaxed">
              Freshly baked cakes, pastries, and desserts delivered across Delhi NCR. Handcrafted daily with premium ingredients.
            </p>

            <p className="text-xs font-semibold text-emerald-400">
              100% Pure Veg • Dedicated eggless options available
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3.5 pt-1 text-[#d6c3bd]">
              <a
                href="#visit"
                aria-label="Location"
                className="hover:text-white transition"
              >
                <MapPin className="h-5 w-5" />
              </a>

              {/* Instagram */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="hover:text-white transition"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>

              {/* Facebook */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="hover:text-white transition"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>

              {/* YouTube */}
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                className="hover:text-white transition"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
                  <path d="m10 15 5-3-5-3z" />
                </svg>
              </a>

              {/* LinkedIn */}
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="hover:text-white transition"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect width="4" height="12" x="2" y="9" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Shop */}
          <div className="space-y-3.5">
            <h3 className="font-serif text-base font-bold text-white">Shop</h3>
            <ul className="space-y-2.5 text-sm text-[#d6c3bd]">
              <li>
                <Link to="/" className="hover:text-white transition">
                  Our Menu
                </Link>
              </li>
              <li>
                <Link to="/checkout" className="hover:text-white transition">
                  Place an Order
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-white transition">
                  Custom Photo Cake
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Help */}
          <div className="space-y-3.5">
            <h3 className="font-serif text-base font-bold text-white">Help</h3>
            <ul className="space-y-2.5 text-sm text-[#d6c3bd]">
              <li>
                <Link to="/orders" className="hover:text-white transition">
                  Track My Order
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-white transition">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-white transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-white transition">
                  Terms of Use
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-white transition">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Visit Us */}
          <div id="visit" className="space-y-3.5">
            <h3 className="font-serif text-base font-bold text-white">Visit Us</h3>
            <ul className="space-y-3 text-sm text-[#d6c3bd]">
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 mt-1 shrink-0 text-[#c9afa7]" />
                <span>Sector 18, Main Market, Noida, Delhi NCR 201301</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-[#c9afa7]" />
                <a href="tel:+919876543210" className="hover:text-white transition">
                  +91 98765 43210
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-[#c9afa7]" />
                <a href="mailto:support@cakehub.in" className="hover:text-white transition">
                  support@cakehub.in
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="h-4 w-4 mt-1 shrink-0 text-[#c9afa7]" />
                <span>Order pickup and phone support • Walk-in enquiries 10 am–9 pm</span>
              </li>
              <li className="flex items-center gap-2.5 text-xs">
                <ShieldCheck className="h-4 w-4 shrink-0 text-[#c9afa7]" />
                <span>FSSAI Lic. No. 12726001001688</span>
              </li>
              <li className="flex items-center gap-2.5 text-xs">
                <ShieldCheck className="h-4 w-4 shrink-0 text-[#c9afa7]" />
                <span>GSTIN 09AAVFC4538Q1ZW</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Category & Delivery Keyword Links */}
        <div className="pt-8 space-y-3">
          <h4 className="font-serif text-sm font-bold text-white">
            Cakes &amp; delivery in Delhi NCR
          </h4>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs sm:text-sm text-[#d6c3bd]">
            {SEO_KEYWORDS.map((label) => (
              <Link
                key={label}
                to="/"
                className="hover:text-white transition"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Copyright Strip */}
        <div className="mt-8 pt-6 border-t border-[#563b33] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#b89f98]">
          <p>© {new Date().getFullYear()} CakeHub Artisanal Bakery. All rights reserved.</p>
          <p>Baked fresh daily with love &amp; hygiene.</p>
        </div>
      </div>
    </footer>
  );
}