import { useState, useEffect } from 'react';
import { User, MapPin, Trash2, Check } from 'lucide-react';
import axiosClient from '../api/axiosClient';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [addresses, setAddresses] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfileAndAddresses();
  }, []);

  const loadProfileAndAddresses = async () => {
    try {
      const [profRes, addrRes] = await Promise.all([
        axiosClient.get('/users/me'),
        axiosClient.get('/addresses'),
      ]);
      const p = profRes.data.data;
      setProfile(p);
      setFullName(p.fullName || '');
      setPhoneNumber(p.phoneNumber || '');
      setAddresses(addrRes.data.data || []);
    } catch (err) {
      console.error('Failed to load profile', err);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await axiosClient.put('/users/me', { fullName, phoneNumber });
      setProfile(res.data.data);
      alert('Profile updated!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefault = async (id) => {
    await axiosClient.patch(`/addresses/${id}/default`);
    loadProfileAndAddresses();
  };

  const handleDeleteAddress = async (id) => {
    await axiosClient.delete(`/addresses/${id}`);
    loadProfileAndAddresses();
  };

  if (!profile) {
    return <div className="max-w-4xl mx-auto p-8 text-stone-500">Loading profile...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Account Details */}
      <div className="bg-white p-6 rounded-2xl border border-bakery-200 space-y-4">
        <h1 className="text-xl font-bold text-stone-900 flex items-center gap-2">
          <User className="h-5 w-5 text-bakery-600" /> My Profile
        </h1>

        <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-500 mb-1">Full Name</label>
            <input
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-stone-300 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-500 mb-1">Phone Number</label>
            <input
              pattern="[0-9]{10}"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-stone-300 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-500 mb-1">Email (Read-Only)</label>
            <input
              disabled
              value={profile.email}
              className="w-full px-3.5 py-2 text-sm border border-stone-200 bg-stone-50 text-stone-500 rounded-xl"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-bakery-600 hover:bg-bakery-700 text-white text-sm font-semibold px-5 py-2 rounded-xl transition"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Saved Addresses */}
      <div className="bg-white p-6 rounded-2xl border border-bakery-200 space-y-4">
        <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
          <MapPin className="h-5 w-5 text-bakery-600" /> Saved Delivery Addresses
        </h2>

        {addresses.length === 0 ? (
          <p className="text-sm text-stone-500">No saved addresses yet. Add one during checkout!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {addresses.map((addr) => (
              <div key={addr.id} className="p-4 rounded-xl border border-stone-200 flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-stone-900">{addr.recipientName}</span>
                    {addr.isDefault && (
                      <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-600 mt-1">
                    {addr.streetAddress}, {addr.city}, {addr.state} - {addr.postalCode}
                  </p>
                  <p className="text-xs text-stone-500 mt-0.5">Phone: {addr.recipientPhone}</p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2 border-t border-stone-100">
                  {!addr.isDefault && (
                    <button
                      onClick={() => handleSetDefault(addr.id)}
                      className="text-xs font-semibold text-bakery-600 hover:underline flex items-center gap-1"
                    >
                      <Check className="h-3.5 w-3.5" /> Set Default
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteAddress(addr.id)}
                    className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}