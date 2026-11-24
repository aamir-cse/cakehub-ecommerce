import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Plus,
  RefreshCw,
  PackageCheck,
  Cake,
  Pencil,
  FolderPlus,
  MapPin,
  Phone,
} from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { useAuthStore } from '../store/authStore';

const ALL_STATUSES = [
  'CONFIRMED',
  'BAKING_IN_PROGRESS',
  'DECORATING',
  'READY_FOR_PICKUP',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
];

export default function AdminDashboard() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'ROLE_ADMIN';

  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add / Edit Product Modal State
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  // Inline New Category Creation State
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');
  const [creatingCategory, setCreatingCategory] = useState(false);

  const [cakeForm, setCakeForm] = useState({
    categoryId: '',
    name: '',
    slug: '',
    description: '',
    basePrice: '',
    primaryImageUrl: '',
    isEggless: true,
    isFeatured: false,
    weightInKg: '0.5',
    sku: '',
    stockQuantity: '10',
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [ordRes, prodRes, catRes] = await Promise.all([
        axiosClient.get('/orders/admin/all?size=50'),
        axiosClient.get('/products?size=50'),
        axiosClient.get('/categories'),
      ]);
      setOrders(ordRes.data.data?.content || []);
      setProducts(prodRes.data.data?.content || []);
      setCategories(catRes.data.data || []);
    } catch (err) {
      console.error('Failed to load staff dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const toSlug = (text) =>
    text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

  const extractBackendError = (err, fallback) => {
    const data = err.response?.data;
    if (data?.errors && typeof data.errors === 'object') {
      const details = Object.entries(data.errors)
        .map(([field, msg]) => `${field}: ${msg}`)
        .join(' | ');
      return `${data.message || 'Validation failed'} (${details})`;
    }
    if (Array.isArray(data?.data)) {
      return data.data.join(' | ');
    }
    return data?.message || fallback;
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      setFormError('Please enter a category name.');
      return;
    }
    setCreatingCategory(true);
    setFormError('');
    try {
      const res = await axiosClient.post('/categories', {
        name: newCategoryName.trim(),
        slug: toSlug(newCategoryName),
        description: newCategoryDesc.trim() || `${newCategoryName.trim()} specialty cakes`,
      });
      const createdCategory = res.data.data;
      setCategories((prev) => [...prev, createdCategory]);
      setCakeForm((prev) => ({ ...prev, categoryId: createdCategory.id }));
      setNewCategoryName('');
      setNewCategoryDesc('');
      setShowNewCategoryInput(false);
    } catch (err) {
      setFormError(
        extractBackendError(
          err,
          'Failed to create category. Make sure you are logged in as ROLE_ADMIN.'
        )
      );
    } finally {
      setCreatingCategory(false);
    }
  };

  const openAddModal = () => {
    setEditingProductId(null);
    setFormError('');
    setShowNewCategoryInput(false);
    setCakeForm({
      categoryId: categories[0]?.id || '',
      name: '',
      slug: '',
      description: '',
      basePrice: '',
      primaryImageUrl: '',
      isEggless: true,
      isFeatured: false,
      weightInKg: '0.5',
      sku: `CAKE-${Math.floor(1000 + Math.random() * 9000)}`,
      stockQuantity: '10',
    });
    setShowProductModal(true);
  };

  const openEditModal = (prod) => {
    setEditingProductId(prod.id);
    setFormError('');
    setShowNewCategoryInput(false);
    const firstVariant = prod.variants?.[0];
    setCakeForm({
      categoryId: prod.categoryId || categories[0]?.id || '',
      name: prod.name || '',
      slug: prod.slug || '',
      description: prod.description || '',
      basePrice: prod.basePrice ?? prod.startingPrice ?? '',
      primaryImageUrl: prod.primaryImageUrl || '',
      isEggless: Boolean(prod.isEggless),
      isFeatured: Boolean(prod.isFeatured),
      weightInKg: firstVariant?.weightInKg || '0.5',
      sku: firstVariant?.sku || `CAKE-${Math.floor(1000 + Math.random() * 9000)}`,
      stockQuantity: firstVariant?.stockQuantity ?? '10',
    });
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!cakeForm.categoryId) {
      setFormError('Please select or create a category first.');
      return;
    }

    setFormError('');
    setSaving(true);

    const priceNum = Number(cakeForm.basePrice);
    const autoSku =
      cakeForm.sku.trim() ||
      `${toSlug(cakeForm.name).toUpperCase().slice(0, 8)}-${Math.floor(100 + Math.random() * 900)}`;

    const payload = {
      categoryId: Number(cakeForm.categoryId),
      name: cakeForm.name.trim(),
      slug: cakeForm.slug.trim() || toSlug(cakeForm.name),
      description: cakeForm.description.trim(),
      basePrice: priceNum,
      primaryImageUrl: cakeForm.primaryImageUrl.trim() || null,
      isEggless: cakeForm.isEggless,
      isFeatured: cakeForm.isFeatured,
      prepTimeHours: 4,
      variants: [
        {
          sku: autoSku,
          weightInKg: Number(cakeForm.weightInKg),
          flavour: cakeForm.name.trim(),
          price: priceNum,
          stockQuantity: Number(cakeForm.stockQuantity),
        },
      ],
    };

    try {
      if (editingProductId) {
        await axiosClient.put(`/products/${editingProductId}`, payload);
      } else {
        await axiosClient.post('/products', payload);
      }
      setShowProductModal(false);
      await loadDashboardData();
    } catch (err) {
      setFormError(
        extractBackendError(
          err,
          err.response?.status === 403
            ? 'Access Denied (403): Make sure you are logged in as ROLE_ADMIN.'
            : 'Failed to save product. Check all required fields.'
        )
      );
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axiosClient.patch(`/orders/admin/${orderId}/status?status=${newStatus}`);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, orderStatus: newStatus } : o))
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <LayoutDashboard className="h-7 w-7 text-bakery-600" />
          <div>
            <h1 className="text-2xl font-bold text-stone-900">Bakery Operations Dashboard</h1>
            <p className="text-xs text-stone-500">Manage live kitchen order workflow &amp; catalog inventory</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadDashboardData}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium bg-white border border-stone-300 rounded-xl hover:bg-stone-50"
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>

          {isAdmin && (
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-bakery-600 text-white rounded-xl hover:bg-bakery-700"
            >
              <Plus className="h-4 w-4" /> Add New Cake
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-stone-200 pb-2">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition ${
            activeTab === 'orders'
              ? 'bg-bakery-600 text-white'
              : 'text-stone-600 hover:bg-bakery-100'
          }`}
        >
          <PackageCheck className="h-4 w-4" /> Live Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('catalog')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition ${
            activeTab === 'catalog'
              ? 'bg-bakery-600 text-white'
              : 'text-stone-600 hover:bg-bakery-100'
          }`}
        >
          <Cake className="h-4 w-4" /> Catalog &amp; Stock ({products.length})
        </button>
      </div>

      {loading ? (
        <p className="text-stone-500 py-8">Loading bakery data...</p>
      ) : activeTab === 'orders' ? (
        <div className="bg-white rounded-2xl border border-bakery-200 overflow-x-auto shadow-2xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-200 bg-bakery-50/70 text-xs font-bold uppercase text-stone-600">
                <th className="py-3.5 px-4">Order #</th>
                <th className="py-3.5 px-4">Delivery Schedule</th>
                <th className="py-3.5 px-4">Customer &amp; Delivery Address</th>
                <th className="py-3.5 px-4">Items, Inscriptions &amp; Photo Print</th>
                <th className="py-3.5 px-4">Total</th>
                <th className="py-3.5 px-4">Kitchen Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-sm">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-stone-500">
                    No customer orders placed yet.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const addr = order.deliveryAddress;
                  return (
                    <tr key={order.id} className="hover:bg-stone-50/70 align-top">
                      <td className="py-4 px-4 font-bold text-stone-900 whitespace-nowrap">
                        <div>{order.orderNumber}</div>
                        <div className="text-[11px] font-semibold text-stone-500 mt-0.5">
                          {order.paymentMethod} • {order.paymentStatus}
                        </div>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-medium text-stone-800">{order.deliveryDate}</div>
                        <div className="text-xs text-stone-500">{order.deliveryTimeSlot}</div>
                      </td>

                      {/* Delivery Address & Contact Column */}
                      <td className="py-4 px-4 max-w-xs">
                        {addr ? (
                          <div className="text-xs space-y-1">
                            <div className="font-bold text-stone-900 flex items-center gap-1.5">
                              <span>{addr.recipientName}</span>
                              <span className="text-[10px] uppercase bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded">
                                {addr.addressType || 'HOME'}
                              </span>
                            </div>
                            <div className="text-bakery-700 font-semibold flex items-center gap-1">
                              <Phone className="h-3 w-3 shrink-0" />
                              <a href={`tel:${addr.recipientPhone}`} className="hover:underline">
                                {addr.recipientPhone}
                              </a>
                            </div>
                            <div className="text-stone-600 flex items-start gap-1 leading-snug">
                              <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0 text-stone-400" />
                              <span>
                                {addr.streetAddress}
                                {addr.apartmentSuite ? `, ${addr.apartmentSuite}` : ''}
                                {addr.landmark ? ` (Near ${addr.landmark})` : ''}, {addr.city},{' '}
                                {addr.state} - <strong className="text-stone-800">{addr.postalCode}</strong>
                              </span>
                            </div>
                            {order.deliveryInstructions && (
                              <div className="text-[11px] text-amber-800 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                                Note: {order.deliveryInstructions}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-stone-400 italic">Address unavailable</span>
                        )}
                      </td>

                      <td className="py-4 px-4 space-y-1.5">
                        {order.items?.map((item) => {
                          const photoMatch = item.messageOnCake?.match(/PhotoURL:\s*(https?:\/\/\S+)/);
                          const photoUrl = photoMatch?.[1];
                          const cleanMsg = item.messageOnCake
                            ?.replace(/\|\s*PhotoURL:\s*https?:\/\/\S+/, '')
                            .replace(/PhotoURL:\s*https?:\/\/\S+/, '')
                            .trim();

                          return (
                            <div key={item.id} className="text-xs space-y-1">
                              <div>
                                <span className="font-semibold text-stone-800">
                                  {item.quantity}× {item.productNameSnapshot} ({item.weightInKgSnapshot}kg)
                                </span>
                                {cleanMsg && (
                                  <span className="ml-1.5 bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded">
                                    {cleanMsg}
                                  </span>
                                )}
                              </div>
                              {photoUrl && (
                                <a
                                  href={photoUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 text-[11px] font-bold text-bakery-700 bg-bakery-50 border border-bakery-200 px-2 py-0.5 rounded hover:bg-bakery-100 transition"
                                >
                                  🖼️ View / Print Cake Photo
                                </a>
                              )}
                            </div>
                          );
                        })}
                      </td>

                      <td className="py-4 px-4 font-bold text-stone-900 whitespace-nowrap">
                        ₹{Number(order.totalAmount).toFixed(2)}
                      </td>

                      <td className="py-4 px-4">
                        <select
                          value={order.orderStatus}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className="px-3 py-1.5 text-xs font-semibold border border-stone-300 rounded-lg bg-white focus:ring-2 focus:ring-bakery-500"
                        >
                          {ALL_STATUSES.map((st) => (
                            <option key={st} value={st}>
                              {st.replaceAll('_', ' ')}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* Catalog & Inventory Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((prod) => {
            const displayPrice = Number(prod.startingPrice ?? prod.basePrice ?? 0);
            return (
              <div
                key={prod.id}
                className="bg-white p-5 rounded-2xl border border-bakery-200 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="text-xs font-semibold text-bakery-600">{prod.categoryName}</span>
                      <h3 className="font-bold text-stone-900">{prod.name}</h3>
                    </div>

                    {isAdmin && (
                      <button
                        onClick={() => openEditModal(prod)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-bakery-700 bg-bakery-50 hover:bg-bakery-100 px-2.5 py-1.5 rounded-lg border border-bakery-200 transition"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-stone-500 line-clamp-2">{prod.description}</p>
                  <div className="text-xs font-semibold text-stone-700">
                    Starting Price: ₹{displayPrice.toFixed(2)}
                  </div>
                </div>

                <div className="space-y-1.5 pt-3 border-t border-stone-100">
                  <p className="text-xs font-semibold text-stone-500 uppercase">Variants &amp; Stock</p>
                  {prod.variants?.length > 0 ? (
                    prod.variants.map((v) => (
                      <div
                        key={v.id}
                        className="flex justify-between text-xs bg-bakery-50/70 px-3 py-1.5 rounded-lg"
                      >
                        <span className="font-medium text-stone-800">
                          {v.weightInKg} kg ({v.sku})
                        </span>
                        <span className="font-bold text-stone-900">
                          ₹{Number(v.price).toFixed(0)} • {v.stockQuantity} in stock
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-stone-400 italic">No variants added yet</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Cake Modal (Admin Only) */}
      {isAdmin && showProductModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleSaveProduct}
            className="bg-white max-w-md w-full rounded-2xl p-6 space-y-4 shadow-xl my-8"
          >
            <h2 className="text-lg font-bold text-stone-900">
              {editingProductId ? 'Edit Cake Details' : 'Add New Cake to Menu'}
            </h2>

            {formError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs break-words">
                {formError}
              </div>
            )}

            {/* Category Selector + Inline "+ New Category" Creator */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-stone-600">Category</label>
                <button
                  type="button"
                  onClick={() => setShowNewCategoryInput(!showNewCategoryInput)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-bakery-600 hover:text-bakery-800"
                >
                  <FolderPlus className="h-3.5 w-3.5" />
                  {showNewCategoryInput ? 'Cancel New Category' : '+ New Category'}
                </button>
              </div>

              {showNewCategoryInput ? (
                <div className="p-3 rounded-xl bg-bakery-50 border border-bakery-200 space-y-2">
                  <input
                    type="text"
                    placeholder="New Category Name (e.g. Wedding Cakes)"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm bg-white border border-stone-300 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Short Description (Optional)"
                    value={newCategoryDesc}
                    onChange={(e) => setNewCategoryDesc(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm bg-white border border-stone-300 rounded-lg"
                  />
                  <button
                    type="button"
                    disabled={creatingCategory}
                    onClick={handleCreateCategory}
                    className="w-full py-1.5 text-xs font-semibold bg-stone-900 text-white rounded-lg hover:bg-stone-800 disabled:opacity-50"
                  >
                    {creatingCategory ? 'Creating...' : 'Save & Select Category'}
                  </button>
                </div>
              ) : (
                <select
                  required
                  value={cakeForm.categoryId}
                  onChange={(e) => setCakeForm({ ...cakeForm, categoryId: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl bg-white"
                >
                  <option value="" disabled>
                    Select a category
                  </option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Cake Name</label>
              <input
                required
                placeholder="e.g. Ferrero Rocher Hazelnut Cake"
                value={cakeForm.name}
                onChange={(e) => setCakeForm({ ...cakeForm, name: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-stone-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Description</label>
              <textarea
                required
                rows={2}
                placeholder="Rich hazelnut chocolate layers..."
                value={cakeForm.description}
                onChange={(e) => setCakeForm({ ...cakeForm, description: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-stone-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Base Price (₹)</label>
              <input
                required
                type="number"
                step="0.01"
                min="1"
                placeholder="500"
                value={cakeForm.basePrice}
                onChange={(e) => setCakeForm({ ...cakeForm, basePrice: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-stone-300 rounded-xl"
              />
            </div>

            {/* Default Variant Weight & Stock */}
            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-bakery-50/70 border border-bakery-200">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Weight (kg)</label>
                <input
                  required
                  type="number"
                  step="0.25"
                  min="0.25"
                  value={cakeForm.weightInKg}
                  onChange={(e) => setCakeForm({ ...cakeForm, weightInKg: e.target.value })}
                  className="w-full px-3 py-1.5 text-sm bg-white border border-stone-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Initial Stock</label>
                <input
                  required
                  type="number"
                  min="1"
                  value={cakeForm.stockQuantity}
                  onChange={(e) => setCakeForm({ ...cakeForm, stockQuantity: e.target.value })}
                  className="w-full px-3 py-1.5 text-sm bg-white border border-stone-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                Image URL (Optional)
              </label>
              <input
                type="url"
                placeholder="https://example.com/cake.jpg"
                value={cakeForm.primaryImageUrl}
                onChange={(e) => setCakeForm({ ...cakeForm, primaryImageUrl: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-stone-300 rounded-xl"
              />
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm text-stone-700">
                <input
                  type="checkbox"
                  checked={cakeForm.isEggless}
                  onChange={(e) => setCakeForm({ ...cakeForm, isEggless: e.target.checked })}
                />
                100% Eggless
              </label>

              <label className="flex items-center gap-2 text-sm text-stone-700">
                <input
                  type="checkbox"
                  checked={cakeForm.isFeatured}
                  onChange={(e) => setCakeForm({ ...cakeForm, isFeatured: e.target.checked })}
                />
                Featured Cake
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowProductModal(false)}
                className="px-4 py-2 text-sm text-stone-600 hover:bg-stone-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 text-sm font-semibold bg-bakery-600 text-white rounded-xl hover:bg-bakery-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : editingProductId ? 'Update Cake' : 'Create Cake'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}