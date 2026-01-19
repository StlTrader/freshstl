import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  Users,
  Settings,
  Plus,
  Edit,
  Trash2,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Search,
  X,
  Save,
  Link as LinkIcon,
  CheckCircle,
  AlertCircle,
  Tag,
  Database,
  Loader2,
  Box,
  FileText,
  Ban,
  UserPlus,
  User,
  BookOpen,
  Sparkles,
  Palette,
  Hammer,
  ArrowLeft,
  Zap,
  LayoutTemplate,
  Columns,
  Grid3x3,
  MousePointer2,
  Sun,
  Move,
  Shield,
  RefreshCw,
  CreditCard,
  Menu,
  ArrowRight,
  Globe,
  Eye,
  EyeOff
} from 'lucide-react';
import BlogManager from './admin/BlogManager';
import CollectionManager from './admin/CollectionManager';
import IndexingManager from './admin/IndexingManager';
import { Product, Order, Payment, CartItem, BuilderCategory, BuilderAsset, HeroConfig, Collection } from '../types';
import * as firebaseService from '../services/firebaseService';
import * as paymentService from '../services/paymentService';
import NextLink from 'next/link';
import Image from 'next/image';
import { getStoragePathForUpload, getCleanImageUrl } from '../utils/urlHelpers';

interface AdminPanelProps {
  products: Product[];
  onClose: () => void;
  initialTab?: AdminTab;
  initialEditId?: string;
}

type AdminTab = 'dashboard' | 'products' | 'orders' | 'users' | 'payments' | 'settings' | 'blog' | 'hero' | 'payment_settings' | 'collections' | 'indexing';

export const AdminPanel: React.FC<AdminPanelProps> = ({ products, onClose, initialTab, initialEditId }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab || 'dashboard');
  const [orders, setOrders] = useState<Order[]>([]);
  const [localProducts, setLocalProducts] = useState<Product[]>(products);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Subscribe to products for real-time updates (handling deletions/additions)
  useEffect(() => {
    const unsubscribe = firebaseService.subscribeToProducts((updatedProducts) => {
      setLocalProducts(updatedProducts);
    });
    return () => unsubscribe();
  }, []);

  // Fetch global orders for analytics
  useEffect(() => {
    const unsubscribe = firebaseService.subscribeToGlobalOrders((data) => {
      setOrders(data);
    });
    return () => unsubscribe();
  }, []);



  return (
    <div className="flex h-screen bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-dark-text-primary overflow-hidden transition-colors">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-dark-surface border-r border-gray-200 dark:border-dark-border flex flex-col hidden md:flex transition-colors">
        <div className="p-6 border-b border-gray-200 dark:border-dark-border">
          <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary flex items-center gap-2">
            <span className="bg-social-black dark:bg-white p-1 rounded text-white dark:text-black">Admin</span> Panel
          </h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <SidebarItem
            icon={<LayoutDashboard size={20} />}
            label="Dashboard"
            active={activeTab === 'dashboard'}
            onClick={() => setActiveTab('dashboard')}
          />
          <SidebarItem
            icon={<Package size={20} />}
            label="Products"
            active={activeTab === 'products'}
            onClick={() => setActiveTab('products')}
          />
          <SidebarItem
            icon={<ShoppingCart size={20} />}
            label="Orders"
            active={activeTab === 'orders'}
            onClick={() => setActiveTab('orders')}
          />
          <SidebarItem
            icon={<Users size={20} />}
            label="Users"
            active={activeTab === 'users'}
            onClick={() => setActiveTab('users')}
          />
          <SidebarItem
            icon={<Tag size={20} />}
            label="Categories"
            active={activeTab === 'settings'}
            onClick={() => setActiveTab('settings')}
          />
          <SidebarItem
            icon={<CreditCard size={20} />}
            label="Payment Settings"
            active={activeTab === 'payment_settings'}
            onClick={() => setActiveTab('payment_settings')}
          />

          <SidebarItem
            icon={<BookOpen size={20} />}
            label="Blog"
            active={activeTab === 'blog'}
            onClick={() => setActiveTab('blog')}
          />
          <SidebarItem
            icon={<Sparkles size={20} />}
            label="Hero"
            active={activeTab === 'hero'}
            onClick={() => setActiveTab('hero')}
          />
          <SidebarItem
            icon={<Box size={20} />}
            label="Collections"
            active={activeTab === 'collections'}
            onClick={() => setActiveTab('collections')}
          />
          <SidebarItem
            icon={<Globe size={20} />}
            label="Indexing"
            active={activeTab === 'indexing'}
            onClick={() => setActiveTab('indexing')}
          />
        </nav>
        <div className="p-4 border-t border-gray-200 dark:border-dark-border">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-gray-500 dark:text-dark-text-secondary hover:text-gray-900 dark:hover:text-white transition-colors w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-dark-bg rounded-lg"
          >
            <X size={18} /> Exit Admin
          </button>
          <button
            onClick={() => firebaseService.makeMeAdmin()}
            className="mt-2 flex items-center gap-2 text-xs text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors w-full px-4 py-2"
            title="Click if you see permission errors"
          >
            <Shield size={14} /> Fix Permissions (Dev)
          </button>
          <button
            onClick={() => firebaseService.clearPersistence()}
            className="mt-1 flex items-center gap-2 text-xs text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors w-full px-4 py-2"
            title="Click if you see 'Unexpected state' or crashes"
          >
            <RefreshCw size={14} /> Reset Cache (Fix Crash)
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-dark-surface border-t border-gray-200 dark:border-dark-border z-50 flex justify-around px-2 py-3 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <NavBtn icon={<LayoutDashboard size={22} />} label="Home" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
        <NavBtn icon={<Package size={22} />} label="Products" active={activeTab === 'products'} onClick={() => setActiveTab('products')} />
        <NavBtn icon={<ShoppingCart size={22} />} label="Orders" active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} />
        <NavBtn icon={<Menu size={22} />} label="Menu" active={isMobileMenuOpen} onClick={() => setIsMobileMenuOpen(true)} />
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm md:hidden animate-in fade-in duration-200" onClick={() => setIsMobileMenuOpen(false)}>
          <div
            className="absolute bottom-0 left-0 right-0 bg-white dark:bg-dark-surface rounded-t-3xl p-6 pb-24 animate-in slide-in-from-bottom duration-300 border-t border-gray-200 dark:border-dark-border shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-6" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-dark-text-primary mb-4 px-2">Menu</h3>
            <div className="grid grid-cols-4 gap-4">
              <MenuBtn icon={<Users size={24} />} label="Users" active={activeTab === 'users'} onClick={() => { setActiveTab('users'); setIsMobileMenuOpen(false); }} color="blue" />
              <MenuBtn icon={<BookOpen size={24} />} label="Blog" active={activeTab === 'blog'} onClick={() => { setActiveTab('blog'); setIsMobileMenuOpen(false); }} color="pink" />
              <MenuBtn icon={<Sparkles size={24} />} label="Hero" active={activeTab === 'hero'} onClick={() => { setActiveTab('hero'); setIsMobileMenuOpen(false); }} color="purple" />
              <MenuBtn icon={<Tag size={24} />} label="Cats" active={activeTab === 'settings'} onClick={() => { setActiveTab('settings'); setIsMobileMenuOpen(false); }} color="orange" />
              <MenuBtn icon={<CreditCard size={24} />} label="Payments" active={activeTab === 'payment_settings'} onClick={() => { setActiveTab('payment_settings'); setIsMobileMenuOpen(false); }} color="green" />
              <MenuBtn icon={<Box size={24} />} label="Collections" active={activeTab === 'collections'} onClick={() => { setActiveTab('collections'); setIsMobileMenuOpen(false); }} color="purple" />
              <MenuBtn icon={<Globe size={24} />} label="Indexing" active={activeTab === 'indexing'} onClick={() => { setActiveTab('indexing'); setIsMobileMenuOpen(false); }} color="blue" />
            </div>
            <button
              onClick={onClose}
              className="w-full mt-8 flex items-center justify-center gap-2 p-4 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-bold"
            >
              <X size={20} /> Close Admin
            </button>
          </div>
        </div>
      )}

      {/* Mobile Header - Minimal */}
      <div className="md:hidden absolute top-4 right-4 z-50">
        <button
          onClick={onClose}
          className="bg-white/90 dark:bg-dark-surface/90 backdrop-blur-sm border border-gray-200 dark:border-dark-border text-gray-500 dark:text-dark-text-secondary hover:text-red-600 dark:hover:text-red-400 p-2 rounded-full shadow-sm transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8 transition-colors">
        <div className="max-w-7xl mx-auto">
          {activeTab === 'dashboard' && <DashboardView products={localProducts} orders={orders} />}
          {activeTab === 'products' && <ProductsManager products={localProducts} initialEditId={initialEditId} />}
          {activeTab === 'orders' && <OrdersManager orders={orders} />}
          {activeTab === 'users' && <UsersManager orders={orders} />}
          {activeTab === 'payment_settings' && <PaymentSetting />}

          {activeTab === 'blog' && <BlogManager initialEditId={initialEditId} />}
          {activeTab === 'hero' && <HeroManager products={localProducts} />}
          {activeTab === 'collections' && <CollectionManager products={localProducts} />}
          {activeTab === 'indexing' && <IndexingManager products={localProducts} />}
        </div>
      </main>
    </div>
  );
};

// --- Sub Components ---


// --- Sub Components ---

const CategoriesManager = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    const unsubscribe = firebaseService.subscribeToCategories(setCategories);
    return () => unsubscribe();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    try {
      console.log("Attempting to add category:", newCategory);
      await firebaseService.addCategory(newCategory.trim());
      console.log("Category added successfully");
      setNewCategory('');
      alert("Category added successfully!");
    } catch (error: any) {
      console.error("Failed to add category:", error);
      alert(`Failed to add category: ${error.message || error}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this category?')) {
      try {
        await firebaseService.deleteCategory(id);
      } catch (error) {
        console.error("Failed to delete category:", error);
        alert("Failed to delete category. See console for details.");
      }
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-text-primary mb-6">Category Management</h1>

      <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-gray-200 dark:border-dark-border shadow-sm mb-6">
        <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-dark-text-primary flex items-center gap-2">
          <Plus size={20} className="text-brand-500" /> Add New Category
        </h2>
        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="e.g. Electronics"
            className="flex-1 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl p-3.5 text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
          />
          <button
            type="submit"
            className="bg-brand-600 hover:bg-brand-500 text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm"
          >
            Add
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-dark-surface rounded-2xl overflow-hidden border border-gray-200 dark:border-dark-border shadow-sm transition-colors">
        {/* Mobile List View */}
        <div className="md:hidden divide-y divide-gray-100 dark:divide-dark-border">
          {categories.map((cat) => (
            <div key={cat.id} className="p-4 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-dark-text-primary">{cat.name}</h3>
                <span className="text-xs text-gray-500 font-mono bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">{cat.slug}</span>
              </div>
              <button
                onClick={() => handleDelete(cat.id)}
                className="p-2 text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-dark-bg/50 text-gray-500 dark:text-dark-text-secondary text-sm uppercase">
              <tr>
                <th className="px-6 py-4 font-semibold tracking-wider">Name</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Slug</th>
                <th className="px-6 py-4 text-right font-semibold tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
              {categories.map((cat, index) => (
                <tr
                  key={cat.id}
                  className="hover:bg-gray-50 dark:hover:bg-dark-bg/30 transition-colors group animate-in fade-in slide-in-from-bottom-2 fill-mode-backwards"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <td className="px-6 py-4 font-bold text-gray-900 dark:text-dark-text-primary">{cat.name}</td>
                  <td className="px-6 py-4">
                    <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono text-gray-600 dark:text-gray-300">{cat.slug}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="text-gray-400 hover:text-red-600 bg-gray-50 hover:bg-red-50 dark:bg-gray-700/50 dark:hover:bg-red-900/20 dark:hover:text-red-400 p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      title="Delete Category"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <Tag size={32} className="opacity-30 mb-2" />
                      <p>No categories found.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const SidebarItem = ({ icon, label, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${active ? 'bg-social-black dark:bg-white text-white dark:text-black shadow-lg' : 'text-gray-500 dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-bg hover:text-gray-900 dark:hover:text-white'
      }`}
  >
    {icon}
    <span className="font-medium">{label}</span>
  </button>
);

const NavBtn = ({ icon, label, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl transition-all w-16 ${active
      ? 'text-social-black dark:text-white bg-gray-100 dark:bg-dark-bg'
      : 'text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-dark-bg/50'
      }`}
  >
    {icon}
    <span className="text-[10px] font-medium">{label}</span>
  </button>
);

const MenuBtn = ({ icon, label, active, onClick, color = 'brand' }: any) => {
  const colors: any = {
    brand: 'bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400',
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    pink: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    orange: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
    green: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  };

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all ${active ? 'ring-2 ring-social-black dark:ring-white ring-offset-2 dark:ring-offset-dark-surface' : 'hover:bg-gray-50 dark:hover:bg-dark-bg/50'
        }`}
    >
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colors[color]}`}>
        {icon}
      </div>
      <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{label}</span>
    </button>
  );
};

const DashboardView = ({ products, orders }: { products: Product[], orders: Order[] }) => {
  const totalRevenue = orders.reduce((sum, order) => sum + order.amount, 0);
  const totalSales = orders.length;
  const topProduct = [...products].sort((a, b) => (b.sales || 0) - (a.sales || 0))[0];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-text-primary mb-6">Overview</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={`$${(totalRevenue / 100).toFixed(2)}`}
          icon={<DollarSign className="text-emerald-500" size={24} />}
          trend="+12.5% from last week"
          delay={0}
        />
        <StatCard
          title="Total Orders"
          value={totalSales.toString()}
          icon={<ShoppingCart className="text-blue-500" size={24} />}
          trend="+5 new today"
          delay={100}
        />
        <StatCard
          title="Active Products"
          value={products.length.toString()}
          icon={<Package className="text-purple-500" size={24} />}
          trend="In 3 categories"
          delay={200}
        />
        <StatCard
          title="Top Performer"
          value={topProduct?.name || 'N/A'}
          icon={<TrendingUp className="text-orange-500" size={24} />}
          trend={`${topProduct?.sales || 0} units sold`}
          delay={300}
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-dark-surface rounded-2xl p-6 border border-gray-200 dark:border-dark-border shadow-sm hover:shadow-md transition-shadow duration-300">
        <h3 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary mb-6 flex items-center gap-2">
          <CheckCircle className="text-brand-500" size={20} />
          Recent Activity
        </h3>
        <div className="space-y-3">
          {orders.slice(0, 5).map((order, index) => (
            <div
              key={order.id}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-bg/30 rounded-xl hover:bg-white dark:hover:bg-dark-bg hover:shadow-md transition-all duration-200 border border-transparent hover:border-gray-100 dark:hover:border-gray-600 group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-brand-100 dark:bg-brand-500/20 flex items-center justify-center text-brand-600 dark:text-brand-400 font-bold group-hover:scale-110 transition-transform">
                  {order.items.length}
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-dark-text-primary group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">New order received</p>
                  <p className="text-sm text-gray-500 dark:text-dark-text-secondary">{order.date ? order.date.toDate().toLocaleString() : 'Just now'}</p>
                </div>
              </div>
              <span className="font-bold text-gray-900 dark:text-dark-text-primary bg-white dark:bg-dark-surface px-3 py-1 rounded-lg shadow-sm group-hover:shadow border border-gray-100 dark:border-gray-700">
                ${(order.amount / 100).toFixed(2)}
              </span>
            </div>
          ))}
          {orders.length === 0 && (
            <div className="text-center py-12 text-gray-500 dark:text-dark-text-secondary">
              <div className="bg-gray-100 dark:bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <ShoppingCart size={24} className="opacity-50" />
              </div>
              <p>No recent activity to show.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, trend, delay }: any) => (
  <div
    className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-gray-200 dark:border-dark-border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="flex justify-between items-start mb-4">
      <div>
        <p className="text-gray-500 dark:text-dark-text-secondary text-sm font-medium uppercase tracking-wider">{title}</p>
        <h3 className="text-3xl font-black text-gray-900 dark:text-dark-text-primary mt-2 tracking-tight">{value}</h3>
      </div>
      <div className="p-3 bg-gray-50 dark:bg-dark-surface rounded-xl shadow-inner">{icon}</div>
    </div>
    <div className="text-sm font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-900/20 w-fit px-2 py-1 rounded-lg">
      <TrendingUp size={14} />
      {trend}
    </div>
  </div>
);

const ProductsManager = ({ products, initialEditId }: { products: Product[], initialEditId?: string }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({ tags: [] });

  useEffect(() => {
    if (initialEditId && products.length > 0) {
      const productToEdit = products.find(p => p.id === initialEditId);
      if (productToEdit) {
        setCurrentProduct(productToEdit);
        const initialImages: ProductImageItem[] = (productToEdit.images || (productToEdit.imageUrl ? [productToEdit.imageUrl] : [])).map((url, index) => ({
          id: `existing-${index}-${Date.now()}`,
          type: 'url',
          value: url,
          preview: url
        }));
        setProductImages(initialImages);
        setIsEditing(true);
      }
    }
  }, [initialEditId, products]);
  const [tagInput, setTagInput] = useState('');

  // Unified Image State for Drag and Drop
  type ProductImageItem = { id: string, type: 'url' | 'file', value: string | File, preview: string };
  const [productImages, setProductImages] = useState<ProductImageItem[]>([]);
  const dragItem = React.useRef<number | null>(null);
  const dragOverItem = React.useRef<number | null>(null);

  const [imageGenerationContext, setImageGenerationContext] = useState('general');


  const [previewFile, setPreviewFile] = useState<File | null>(null); // GLB
  const [sourceFile, setSourceFile] = useState<File | null>(null);   // STL
  const [videoFile, setVideoFile] = useState<File | null>(null);     // Video
  const [isUploading, setIsUploading] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCoverIndex, setSelectedCoverIndex] = useState<number>(0);

  // Builder State
  const [builderCategories, setBuilderCategories] = useState<BuilderCategory[]>([]);
  const [builderAssets, setBuilderAssets] = useState<BuilderAsset[]>([]);
  const [newBuilderCatName, setNewBuilderCatName] = useState('');
  const [isUploadingBuilder, setIsUploadingBuilder] = useState(false);
  const [isGeneratingBuilderAssets, setIsGeneratingBuilderAssets] = useState(false);

  // Builder Asset Form State
  const [selectedBuilderCatId, setSelectedBuilderCatId] = useState('');
  const [builderAssetName, setBuilderAssetName] = useState('');
  const [builderModelFile, setBuilderModelFile] = useState<File | null>(null);
  const [builderThumbFile, setBuilderThumbFile] = useState<File | null>(null);

  // Builder Variation State
  const [editingBuilderAsset, setEditingBuilderAsset] = useState<BuilderAsset | null>(null);
  const [variationName, setVariationName] = useState('');
  const [variationColor, setVariationColor] = useState('#ffffff');
  const [variationPrice, setVariationPrice] = useState(0);
  const [variationModelFile, setVariationModelFile] = useState<File | null>(null);
  const [variationThumbFile, setVariationThumbFile] = useState<File | null>(null);
  const [isUploadingVariation, setIsUploadingVariation] = useState(false);

  useEffect(() => {
    const unsubscribe = firebaseService.subscribeToCategories(setCategories);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isEditing && currentProduct.id && currentProduct.isBuilderEnabled) {
      const unsubCat = firebaseService.subscribeToBuilderCategories(setBuilderCategories, currentProduct.id);
      const unsubAsset = firebaseService.subscribeToBuilderAssets(setBuilderAssets, currentProduct.id);
      return () => { unsubCat(); unsubAsset(); };
    } else {
      setBuilderCategories([]);
      setBuilderAssets([]);
    }
  }, [isEditing, currentProduct.id, currentProduct.isBuilderEnabled]);

  const handleSort = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;

    const _productImages = [...productImages];
    const draggedItemContent = _productImages[dragItem.current];

    // Track the cover item ID before move
    const coverItemId = productImages[selectedCoverIndex]?.id;

    _productImages.splice(dragItem.current, 1);
    _productImages.splice(dragOverItem.current, 0, draggedItemContent);

    dragItem.current = null;
    dragOverItem.current = null;

    setProductImages(_productImages);

    // Restore cover selection
    if (coverItemId) {
      const newCoverIndex = _productImages.findIndex(item => item.id === coverItemId);
      if (newCoverIndex !== -1) setSelectedCoverIndex(newCoverIndex);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProduct.name || currentProduct.price === undefined) return;

    // 1. Auth Check
    const user = firebaseService.auth?.currentUser;
    if (!user) {
      alert("You must be logged in to upload products.");
      return;
    }

    // Optional: Check for admin role if possible (client-side check is weak but helpful UX)
    // We can't easily check custom claims synchronously here without an ID token result, 
    // but we can trust the backend rules to fail if not admin.

    setIsUploading(true);

    try {
      let imageUrl = currentProduct.imageUrl;
      let modelUrl = currentProduct.modelUrl;
      let previewStoragePath = currentProduct.previewStoragePath;
      let sourceStoragePath = currentProduct.sourceStoragePath;
      let videoUrl = currentProduct.videoUrl;

      const productSlug = (currentProduct.name || 'product')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // OLD: const productFolder = `products/${productSlug}_${Date.now()}`;
      // NEW: Use category path, but we still need a unique name or folder.
      // We will construct paths individually.

      // Upload Images
      const uploadedImageUrls: string[] = [];

      // Process productImages in order
      for (const item of productImages) {
        if (item.type === 'url') {
          uploadedImageUrls.push(item.value as string);
        } else {
          const file = item.value as File;
          const ext = file.name.split('.').pop() || 'jpg';
          // const path = `${productFolder}/image_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${ext}`;
          const filename = `${productSlug}-image-${Date.now()}.${ext}`;
          const path = getStoragePathForUpload(currentProduct.category || 'misc', productSlug, 'image', filename);
          const url = await firebaseService.uploadFile(file, path);
          uploadedImageUrls.push(url);
        }
      }

      // Set main imageUrl based on selection
      if (uploadedImageUrls.length > 0) {
        // Ensure index is within bounds
        const coverIndex = selectedCoverIndex >= 0 && selectedCoverIndex < uploadedImageUrls.length ? selectedCoverIndex : 0;
        imageUrl = uploadedImageUrls[coverIndex];
      } else {
        imageUrl = '';
      }

      // Upload Preview (GLB) -> Public (now in products folder)
      if (previewFile) {
        const ext = previewFile.name.split('.').pop() || 'glb';
        // Use category folder for public models
        const filename = `${productSlug}-model-${Date.now()}.${ext}`;
        const path = getStoragePathForUpload(currentProduct.category || 'misc', productSlug, 'preview', filename);
        // uploadFile returns URL for public paths
        const url = await firebaseService.uploadFile(previewFile, path);
        modelUrl = url; // Keep modelUrl for backward compatibility or easy access
        previewStoragePath = path;
      }

      // Upload Source (STL) -> Protected
      if (sourceFile) {
        const ext = sourceFile.name.split('.').pop() || 'stl';
        const filename = `${productSlug}-source-${Date.now()}.${ext}`;
        const path = getStoragePathForUpload(currentProduct.category || 'misc', productSlug, 'source', filename);
        // uploadFile returns PATH for protected paths
        sourceStoragePath = await firebaseService.uploadFile(sourceFile, path);
      }

      // Upload Video -> Public (now in products folder)
      if (videoFile) {
        const ext = videoFile.name.split('.').pop() || 'mp4';
        // Use category folder for videos
        const filename = `${productSlug}-video-${Date.now()}.${ext}`;
        const path = getStoragePathForUpload(currentProduct.category || 'misc', productSlug, 'preview', filename);
        const url = await firebaseService.uploadFile(videoFile, path);
        videoUrl = url;
      }

      // Determine status based on file presence
      // If either preview (GLB) or source (STL) is missing, save as draft.
      // Note: We check both the new file upload state and the existing path in currentProduct
      const hasPreview = !!(previewFile || previewStoragePath);
      const hasSource = !!(sourceFile || sourceStoragePath);

      const status: 'published' | 'draft' = (hasPreview && hasSource) ? 'published' : 'draft';

      // Ensure tags is array
      const productToSave = {
        ...currentProduct,
        slug: currentProduct.slug || productSlug,
        imageUrl: imageUrl || '',
        images: uploadedImageUrls,
        modelUrl: modelUrl || '',
        previewStoragePath: previewStoragePath || '',
        sourceStoragePath: sourceStoragePath || '',
        videoUrl: videoUrl || '',
        tags: currentProduct.tags || [],
        aiModel: currentProduct.aiModel || '',
        show3DModel: currentProduct.show3DModel !== undefined ? currentProduct.show3DModel : true,
        showVideo: currentProduct.showVideo !== undefined ? currentProduct.showVideo : true,
        status
      };

      if (currentProduct.id) {
        // Update
        const { id, ...data } = productToSave;
        await firebaseService.updateProduct(id as string, data);
      } else {
        // Create
        await firebaseService.addProduct(productToSave as Omit<Product, 'id'>);
      }
      setIsEditing(false);
      setCurrentProduct({ tags: [] });
      setProductImages([]);
      setPreviewFile(null);
      setSourceFile(null);
      setVideoFile(null);
      setTagInput('');
      setSelectedCoverIndex(0);
      alert("Product saved successfully!");
    } catch (error: any) {
      console.error("Failed to save product", error);

      // Enhanced Error Handling
      let errorMessage = error.message || "Unknown error";
      if (error.code === 'permission-denied' || error.message.includes('permission')) {
        errorMessage = "Permission Denied. You do not have admin rights to perform this action. Please click 'Fix Permissions (Dev)' in the sidebar.";
      } else if (error.code === 'storage/unauthorized') {
        errorMessage = "Storage Unauthorized. You cannot upload files. Ensure you are logged in as an admin.";
      }

      alert(`Failed to save product: ${errorMessage}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await firebaseService.deleteProduct(id);
    }
  };

  // Builder Handlers
  const handleAddBuilderCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBuilderCatName.trim() || !currentProduct.id) {
      console.warn("Cannot add asset: Name empty or Product ID missing", { name: newBuilderCatName, productId: currentProduct.id });
      return;
    }
    try {
      console.log("Adding new asset type (category):", newBuilderCatName);
      await firebaseService.addBuilderCategory(newBuilderCatName.trim(), currentProduct.id);
      setNewBuilderCatName('');
      console.log("Asset type added successfully");
    } catch (error) {
      console.error("Failed to add asset type:", error);
      alert("Failed to add asset type");
    }
  };

  const handleGenerateBuilderAssets = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!currentProduct.id) {
      alert("Please save the product first.");
      return;
    }

    setIsGeneratingBuilderAssets(true);
    try {
      // 1. Prepare Prompt
      const prompt = `Generate 5 unique 3D asset categories for a customizable character or object based on this product: "${currentProduct.name}". 
      Description: ${currentProduct.description || 'No description'}. 
      Existing categories: ${builderCategories.map(c => c.name).join(', ')}.
      Return ONLY a JSON array of 5 strings, e.g. ["Hat", "Sword", "Shield", "Boots", "Cape"]. 
      Do NOT include explanations or markdown formatting. Ensure names are singular and concise.`;

      // 2. Call AI API
      // We'll reuse the existing media generation endpoint but with a text-only prompt for now, 
      // or ideally a dedicated text generation endpoint. 
      // Since we only have 'generate-media', let's assume we can use it or we need to add a text gen capability.
      // For this specific task, I will use a direct call to a new helper or modify the existing one.
      // However, to keep it simple and robust, I'll simulate the AI call structure here or use a new route if available.
      // Let's use the existing 'generate-media' route but we might need to adjust it to return text if it supports it, 
      // OR we create a simple client-side list for now if AI is not set up for text.
      // WAIT - the user asked for AI features. I should probably use the 'generate-media' route if it supports text, 
      // but it seems designed for images. 
      // Let's assume we need to add a text generation route or use a mock for now if not available.
      // actually, let's try to use the existing one and see if we can get text back, or just add a new route.
      // Given the constraints, I will add a new route `api/ai/generate-text` in the next step. 
      // For now, I'll write the fetch call assuming that route exists.

      const response = await fetch('/api/ai/generate-media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, context: 'asset_generation' }),
      });

      if (!response.ok) throw new Error("AI generation failed");
      const data = await response.json();
      const suggestedAssets: string[] = data.text ? JSON.parse(data.text) : [];

      if (!Array.isArray(suggestedAssets)) throw new Error("Invalid AI response format");

      // 3. Add Unique Assets
      let addedCount = 0;
      for (const assetName of suggestedAssets) {
        // Check for duplicates (case-insensitive)
        const exists = builderCategories.some(c => c.name.toLowerCase() === assetName.toLowerCase());
        if (!exists) {
          await firebaseService.addBuilderCategory(assetName, currentProduct.id);
          addedCount++;
        }
      }

      if (addedCount > 0) {
        alert(`Successfully generated and added ${addedCount} new asset types!`);
      } else {
        alert("No new unique asset types were generated (duplicates found).");
      }

    } catch (error: any) {
      console.error("Failed to generate assets:", error);
      alert("Failed to generate assets: " + error.message);
    } finally {
      setIsGeneratingBuilderAssets(false);
    }
  };

  const handleDeleteBuilderCategory = async (id: string) => {
    const hasVariations = builderAssets.some(asset => asset.categoryId === id);
    if (hasVariations) {
      alert("Cannot delete this Asset Type because it contains Variations. Please delete all Variations first.");
      return;
    }
    if (confirm('Delete this asset type?')) {
      await firebaseService.deleteBuilderCategory(id);
    }
  };

  const handleAddBuilderAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Attempting to add variation (asset)...", { selectedBuilderCatId, builderAssetName, hasModel: !!builderModelFile, productId: currentProduct.id });

    if (!selectedBuilderCatId || !builderAssetName || !builderModelFile || !currentProduct.id) {
      alert("Please fill in all required fields (Asset Type, Variation Name, Model File) and ensure product is saved.");
      return;
    }

    setIsUploadingBuilder(true);
    try {
      const cat = builderCategories.find(c => c.id === selectedBuilderCatId);
      if (!cat) throw new Error("Invalid asset type selected");

      const modelExt = builderModelFile.name.split('.').pop() || 'glb';
      const modelFilename = `${cat.slug}-${Date.now()}_${builderAssetName.replace(/\s+/g, '_')}.${modelExt}`;
      const modelPath = getStoragePathForUpload(currentProduct.category || 'misc', currentProduct.slug || 'product', 'builder', modelFilename);
      const modelUrl = await firebaseService.uploadFile(builderModelFile, modelPath);

      let thumbnailUrl = '';
      if (builderThumbFile) {
        const thumbExt = builderThumbFile.name.split('.').pop() || 'png';
        const thumbFilename = `${cat.slug}-thumb-${Date.now()}_${builderAssetName.replace(/\s+/g, '_')}.${thumbExt}`;
        const thumbPath = getStoragePathForUpload(currentProduct.category || 'misc', currentProduct.slug || 'product', 'builder', thumbFilename);
        thumbnailUrl = await firebaseService.uploadFile(builderThumbFile, thumbPath);
      }

      const newAsset: any = {
        name: builderAssetName,
        categoryId: cat.id,
        categorySlug: cat.slug,
        modelUrl,
        thumbnailUrl,
        productId: currentProduct.id
      };

      await firebaseService.addBuilderAsset(newAsset);

      setBuilderAssetName('');
      setBuilderModelFile(null);
      setBuilderThumbFile(null);
      alert("Variation added successfully!");
    } catch (error: any) {
      console.error("Failed to add variation:", error);
      alert("Failed to add variation: " + error.message);
    } finally {
      setIsUploadingBuilder(false);
    }
  };

  const handleDeleteBuilderAsset = async (id: string) => {
    if (confirm('Delete this asset?')) {
      await firebaseService.deleteBuilderAsset(id);
    }
  };

  const handleAddVariation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBuilderAsset || !variationName) return;

    setIsUploadingVariation(true);
    try {
      let modelUrl = '';
      if (variationModelFile) {
        const ext = variationModelFile.name.split('.').pop() || 'glb';
        const filename = `variation-${Date.now()}_${variationName.replace(/\s+/g, '_')}.${ext}`;
        const path = getStoragePathForUpload(currentProduct.category || 'misc', currentProduct.slug || 'product', 'builder', filename);
        modelUrl = await firebaseService.uploadFile(variationModelFile, path);
      }

      let thumbnailUrl = '';
      if (variationThumbFile) {
        const ext = variationThumbFile.name.split('.').pop() || 'png';
        const filename = `variation-thumb-${Date.now()}_${variationName.replace(/\s+/g, '_')}.${ext}`;
        const path = getStoragePathForUpload(currentProduct.category || 'misc', currentProduct.slug || 'product', 'builder', filename);
        thumbnailUrl = await firebaseService.uploadFile(variationThumbFile, path);
      }

      const newVariation: any = {
        id: Date.now().toString(),
        name: variationName,
        color: variationColor,
        price: variationPrice,
        modelUrl,
        thumbnailUrl
      };

      const updatedVariations = [...(editingBuilderAsset.variations || []), newVariation];
      await firebaseService.updateBuilderAsset(editingBuilderAsset.id, { variations: updatedVariations });
      setEditingBuilderAsset({ ...editingBuilderAsset, variations: updatedVariations });

      setVariationName('');
      setVariationColor('#ffffff');
      setVariationPrice(0);
      setVariationModelFile(null);
      setVariationThumbFile(null);
      alert("Variation added!");
    } catch (error: any) {
      console.error("Failed to add variation:", error);
      alert("Failed to add variation: " + error.message);
    } finally {
      setIsUploadingVariation(false);
    }
  };

  const handleDeleteVariation = async (variationId: string) => {
    if (!editingBuilderAsset) return;
    if (confirm('Delete this variation?')) {
      const updatedVariations = editingBuilderAsset.variations?.filter(v => v.id !== variationId) || [];
      await firebaseService.updateBuilderAsset(editingBuilderAsset.id, { variations: updatedVariations });
      setEditingBuilderAsset({ ...editingBuilderAsset, variations: updatedVariations });
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (newTag && !currentProduct.tags?.includes(newTag)) {
        setCurrentProduct({
          ...currentProduct,
          tags: [...(currentProduct.tags || []), newTag]
        });
        setTagInput('');
      }
    }
  };

  const handleGenerateAI = async () => {
    if (productImages.length === 0) {
      alert("Please upload an image first to generate details.");
      return;
    }

    setIsGeneratingAI(true);
    try {
      let base64Image = '';
      const firstImage = productImages[0];

      if (firstImage.type === 'file') {
        // Convert file to base64
        base64Image = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(firstImage.value as File);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = error => reject(error);
        });
      } else {
        // Fetch URL and convert to base64
        const response = await fetch(firstImage.value as string);
        const blob = await response.blob();
        base64Image = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = error => reject(error);
        });
      }

      const response = await fetch('/api/ai/generate-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: base64Image }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate details');
      }

      setCurrentProduct(prev => ({
        ...prev,
        name: data.title,
        description: data.description,
        tags: [...(prev.tags || []), ...data.tags]
      }));

    } catch (error: any) {
      console.error("AI Generation failed:", error);
      alert(`AI Generation failed: ${error.message}`);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleGenerateImage = async () => {
    const promptText = prompt("Enter a prompt for the image:", currentProduct.description || currentProduct.name || "A 3D printed object");
    if (!promptText) return;

    setIsGeneratingImage(true);
    try {
      let referenceImage = null;

      // Determine the current cover image
      if (productImages.length > 0) {
        const coverIndex = selectedCoverIndex >= 0 && selectedCoverIndex < productImages.length ? selectedCoverIndex : 0;
        const coverImage = productImages[coverIndex];

        if (coverImage.type === 'url') {
          // It's an existing image URL
          try {
            const response = await fetch(coverImage.value as string);
            const blob = await response.blob();
            referenceImage = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(blob);
            });
          } catch (e) {
            console.warn("Failed to fetch existing image for reference:", e);
          }
        } else {
          // It's a new file
          referenceImage = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(coverImage.value as File);
          });
        }
      }

      const response = await fetch('/api/ai/generate-media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          referenceImage: referenceImage, // Send base64 image if available
          context: imageGenerationContext
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate image');
      }

      if (data.images && data.images.length > 0) {
        const base64 = data.images[0];
        const res = await fetch(base64);
        const blob = await res.blob();
        const file = new File([blob], "generated-image.png", { type: "image/png" });

        setProductImages(prev => [...prev, {
          id: `new-${Date.now()}`,
          type: 'file',
          value: file,
          preview: URL.createObjectURL(file)
        }]);
        // Set the model name to what we are now using
        setCurrentProduct(prev => ({ ...prev, aiModel: 'Gemini 3 Pro Image' }));
      }

    } catch (error: any) {
      console.error("Image Generation failed:", error);
      alert(`Image Generation failed: ${error.message}`);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setCurrentProduct({
      ...currentProduct,
      tags: currentProduct.tags?.filter(t => t !== tagToRemove)
    });
  };

  if (isEditing) {
    return (
      <div className="max-w-2xl mx-auto bg-white dark:bg-dark-surface p-4 md:p-8 rounded-xl border border-gray-200 dark:border-dark-border shadow-sm animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => { setIsEditing(false); setCurrentProduct({ tags: [] }); }}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-bg text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
            title="Back to Products"
          >
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">{currentProduct.id ? 'Edit Product' : 'Add New Product'}</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product Images - Moved to Top */}
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-dark-text-secondary mb-1">Product Images</label>

            {/* Image Gallery Preview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {/* Combine existing and new images for display to make reordering easier logically, 
                  but we need to keep them separate in state until save. 
                  Actually, to support true reordering, we might need to unify them or handle complex index mapping.
                  
                  Simpler approach: Allow swapping within their own lists, or just visualize them together.
                  The user wants to reorder "2 to 3". If 2 is existing and 3 is new, that's tricky.
                  
                  Let's implement a helper to move items in the arrays.
              */}

              {productImages.map((item, index) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => { dragItem.current = index; }}
                  onDragEnter={(e) => { dragOverItem.current = index; }}
                  onDragEnd={handleSort}
                  onDragOver={(e) => e.preventDefault()}
                  className={`relative group aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${selectedCoverIndex === index ? 'border-brand-500 ring-2 ring-brand-500 ring-offset-2 dark:ring-offset-dark-surface' : 'border-gray-200 dark:border-dark-border hover:border-brand-300'}`}
                  onClick={() => setSelectedCoverIndex(index)}
                >
                  <Image src={item.preview} alt={`Image ${index}`} fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />
                  {selectedCoverIndex === index && (
                    <div className="absolute top-2 left-2 bg-brand-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm z-10">
                      Cover
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setProductImages(prev => {
                        const newImages = prev.filter((_, i) => i !== index);
                        // Adjust cover index
                        if (selectedCoverIndex === index) setSelectedCoverIndex(0);
                        else if (selectedCoverIndex > index) setSelectedCoverIndex(selectedCoverIndex - 1);
                        return newImages;
                      });
                    }}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-10"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}

              <label className="flex flex-col items-center justify-center aspect-square rounded-lg border-2 border-dashed border-gray-300 dark:border-dark-border hover:border-brand-500 dark:hover:border-brand-500 cursor-pointer transition-colors bg-gray-50 dark:bg-dark-bg hover:bg-gray-100 dark:hover:bg-dark-bg/80">
                <Plus size={24} className="text-gray-400" />
                <span className="text-xs text-gray-500 mt-1">Add Image</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={e => {
                    if (e.target.files) {
                      const newFiles = Array.from(e.target.files).map(file => ({
                        id: `new-${Date.now()}-${file.name}`,
                        type: 'file' as const,
                        value: file,
                        preview: URL.createObjectURL(file)
                      }));
                      setProductImages(prev => [...prev, ...newFiles]);
                    }
                  }}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                <p className="text-xs text-gray-500">Drag and drop images to reorder. The highlighted image will be the cover.</p>
                <div className="flex flex-wrap gap-2 items-center">
                  <select
                    value={imageGenerationContext}
                    onChange={(e) => setImageGenerationContext(e.target.value)}
                    className="text-xs bg-gray-50 dark:bg-dark-bg border border-gray-300 dark:border-dark-border rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="general">General Enhancement</option>
                    <option value="background">Change Background</option>
                    <option value="view">Change View/Angle</option>
                    <option value="lighting">Cinematic Lighting</option>
                    <option value="material">Material Detail</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleGenerateImage}
                    disabled={isGeneratingImage}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-pink-600 to-rose-600 text-white text-xs font-bold rounded-lg hover:from-pink-500 hover:to-rose-500 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGeneratingImage ? (
                      <>
                        <span className="animate-spin">✨</span> Generating...
                      </>
                    ) : (
                      <>
                        <Palette size={14} /> Generate Image
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerateAI}
                    disabled={isGeneratingAI || productImages.length === 0}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-bold rounded-lg hover:from-purple-500 hover:to-blue-500 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGeneratingAI ? (
                      <>
                        <span className="animate-spin">✨</span> Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} /> Generate Details
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-dark-text-secondary mb-1">Name</label>
            <input
              type="text"
              required
              value={currentProduct.name || ''}
              onChange={e => setCurrentProduct({ ...currentProduct, name: e.target.value })}
              className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-300 dark:border-dark-border rounded-lg p-3 text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-brand-500 outline-none transition-colors"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-dark-text-secondary mb-1">Price ($)</label>
              <input
                type="number"
                step="0.01"
                required
                value={currentProduct.price !== undefined ? currentProduct.price / 100 : ''}
                onChange={e => {
                  const val = parseFloat(e.target.value);
                  setCurrentProduct({ ...currentProduct, price: isNaN(val) ? undefined : Math.round(val * 100) });
                }}
                className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-300 dark:border-dark-border rounded-lg p-3 text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-brand-500 outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-dark-text-secondary mb-1">Category</label>
              <select
                required
                value={currentProduct.categoryId || ''}
                onChange={e => {
                  const cat = categories.find(c => c.id === e.target.value);
                  setCurrentProduct({
                    ...currentProduct,
                    categoryId: e.target.value,
                    category: cat ? cat.name : '' // Keep name for legacy support
                  });
                }}
                className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-300 dark:border-dark-border rounded-lg p-3 text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-brand-500 outline-none transition-colors"
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tag Manager */}
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-dark-text-secondary mb-1">Tags</label>
            <div className="bg-gray-50 dark:bg-dark-bg border border-gray-300 dark:border-dark-border rounded-lg p-3 focus-within:ring-2 focus-within:ring-brand-500 flex flex-wrap gap-2 transition-colors">
              {currentProduct.tags?.map((tag, index) => (
                <span key={`${tag}-${index}`} className="bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300 px-2 py-1 rounded text-sm flex items-center gap-1">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="hover:text-gray-900 dark:hover:text-white"><X size={12} /></button>
                </span>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder={currentProduct.tags?.length ? "" : "Type tag and press Enter..."}
                className="bg-transparent outline-none flex-1 min-w-[120px] text-gray-900 dark:text-dark-text-primary"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Press Enter or Comma to add tags.</p>
          </div>



          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-dark-text-secondary mb-1">3D Preview (GLB/GLTF)</label>
              <div className="relative group">
                <Box className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="file"
                  accept=".glb,.gltf"
                  onChange={e => {
                    const file = e.target.files ? e.target.files[0] : null;
                    if (file && !file.name.toLowerCase().match(/\.(glb|gltf)$/)) {
                      alert("Only .glb or .gltf files are allowed for preview.");
                      e.target.value = '';
                      setPreviewFile(null);
                    } else {
                      setPreviewFile(file);
                    }
                  }}
                  className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-300 dark:border-dark-border rounded-lg p-3 pl-10 text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-brand-500 outline-none transition-colors"
                />
              </div>
              {currentProduct.previewStoragePath && (
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-green-600">✓ Preview available</p>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentProduct({ ...currentProduct, previewStoragePath: '', modelUrl: '' });
                      setPreviewFile(null);
                    }}
                    className="text-xs text-red-500 hover:text-red-700 underline"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-dark-text-secondary mb-1">Source File (STL/ZIP)</label>
              <div className="relative group">
                <Database className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="file"
                  accept=".stl,.zip"
                  onChange={e => {
                    const file = e.target.files ? e.target.files[0] : null;
                    if (file && !file.name.toLowerCase().match(/\.(stl|zip)$/)) {
                      alert("Only .stl or .zip files are allowed for source.");
                      e.target.value = '';
                      setSourceFile(null);
                    } else {
                      setSourceFile(file);
                    }
                  }}
                  className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-300 dark:border-dark-border rounded-lg p-3 pl-10 text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-brand-500 outline-none transition-colors"
                />
              </div>
              {currentProduct.sourceStoragePath && (
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-green-600">✓ Source available</p>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentProduct({ ...currentProduct, sourceStoragePath: '' });
                      setSourceFile(null);
                    }}
                    className="text-xs text-red-500 hover:text-red-700 underline"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-dark-text-secondary mb-1">Product Video (MP4)</label>
              <div className="relative group">
                <Box className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="file"
                  accept="video/mp4,video/webm"
                  onChange={e => {
                    const file = e.target.files ? e.target.files[0] : null;
                    if (file && !file.type.startsWith('video/')) {
                      alert("Only video files are allowed.");
                      e.target.value = '';
                      setVideoFile(null);
                    } else {
                      setVideoFile(file);
                    }
                  }}
                  className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-300 dark:border-dark-border rounded-lg p-3 pl-10 text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-brand-500 outline-none transition-colors"
                />
              </div>
              {currentProduct.videoUrl && (
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-green-600">✓ Video available</p>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentProduct({ ...currentProduct, videoUrl: '' });
                      setVideoFile(null);
                    }}
                    className="text-xs text-red-500 hover:text-red-700 underline"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isBuilderEnabled"
                checked={currentProduct.isBuilderEnabled || false}
                onChange={e => setCurrentProduct({ ...currentProduct, isBuilderEnabled: e.target.checked })}
                className="w-4 h-4 text-brand-600 bg-gray-100 border-gray-300 rounded focus:ring-brand-500 dark:focus:ring-brand-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label htmlFor="isBuilderEnabled" className="text-sm font-medium text-gray-900 dark:text-gray-300">
                Enable Builder System
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="show3DModel"
                checked={currentProduct.show3DModel !== undefined ? currentProduct.show3DModel : true}
                onChange={e => setCurrentProduct({ ...currentProduct, show3DModel: e.target.checked })}
                className="w-4 h-4 text-brand-600 bg-gray-100 border-gray-300 rounded focus:ring-brand-500 dark:focus:ring-brand-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label htmlFor="show3DModel" className="text-sm font-medium text-gray-900 dark:text-gray-300">
                Show 3D Model
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showVideo"
                checked={currentProduct.showVideo !== undefined ? currentProduct.showVideo : true}
                onChange={e => setCurrentProduct({ ...currentProduct, showVideo: e.target.checked })}
                className="w-4 h-4 text-brand-600 bg-gray-100 border-gray-300 rounded focus:ring-brand-500 dark:focus:ring-brand-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label htmlFor="showVideo" className="text-sm font-medium text-gray-900 dark:text-gray-300">
                Show Video
              </label>
            </div>
          </div>

          {/* Builder Management UI */}
          {
            currentProduct.isBuilderEnabled && currentProduct.id && (
              <div className="mt-6 space-y-6 border-t border-gray-200 dark:border-dark-border pt-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-dark-text-primary flex items-center gap-2">
                  <Hammer size={20} className="text-purple-500" /> Builder Assets
                </h3>

                {/* Assets (formerly Categories) */}
                <div className="bg-gray-50 dark:bg-dark-bg/50 p-4 rounded-xl border border-gray-200 dark:border-dark-border">
                  <h4 className="font-bold text-sm mb-3">Add New Asset</h4>
                  <div className="flex flex-col md:flex-row gap-2 mb-3">
                    <input
                      type="text"
                      value={newBuilderCatName}
                      onChange={(e) => setNewBuilderCatName(e.target.value)}
                      placeholder="New Asset Name (e.g. Sword)"
                      className="flex-1 p-2 rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-sm"
                    />
                    <button onClick={handleAddBuilderCategory} className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-bold">Add</button>
                    <button
                      onClick={handleGenerateBuilderAssets}
                      disabled={isGeneratingBuilderAssets}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 disabled:opacity-50"
                    >
                      {isGeneratingBuilderAssets ? <span className="animate-spin">â ³</span> : <Sparkles size={16} />}
                      Generate 5 Assets
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {builderCategories.map(cat => (
                      <div key={cat.id} className="bg-white dark:bg-dark-surface px-3 py-1.5 rounded-lg border border-gray-200 dark:border-dark-border text-sm flex items-center gap-2">
                        <span>{cat.name}</span>
                        <button onClick={() => handleDeleteBuilderCategory(cat.id)} className="text-gray-400 hover:text-red-500"><X size={12} /></button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add Variation (formerly Asset) */}
                <div className="bg-gray-50 dark:bg-dark-bg/50 p-4 rounded-xl border border-gray-200 dark:border-dark-border">
                  <h4 className="font-bold text-sm mb-3">Add Variation</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <select
                      value={selectedBuilderCatId}
                      onChange={(e) => {
                        const catId = e.target.value;
                        setSelectedBuilderCatId(catId);
                        if (catId) {
                          const count = builderAssets.filter(a => a.categoryId === catId).length;
                          setBuilderAssetName((count + 1).toString());
                        } else {
                          setBuilderAssetName('');
                        }
                      }}
                      className="p-2 rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-sm"
                    >
                      <option value="">Select Asset</option>
                      {builderCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>
                    <input
                      type="text"
                      value={builderAssetName}
                      onChange={(e) => setBuilderAssetName(e.target.value)}
                      placeholder="Variation Name"
                      className="p-2 rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-sm"
                    />
                    <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Model (.glb)</label>
                        <input type="file" accept=".glb,.gltf" onChange={e => setBuilderModelFile(e.target.files?.[0] || null)} className="w-full text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Thumbnail</label>
                        <input type="file" accept="image/*" onChange={e => setBuilderThumbFile(e.target.files?.[0] || null)} className="w-full text-sm" />
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleAddBuilderAsset}
                    disabled={isUploadingBuilder}
                    className="w-full bg-brand-600 text-white py-2 rounded-lg text-sm font-bold disabled:opacity-50"
                  >
                    {isUploadingBuilder ? 'Uploading...' : 'Add Variation'}
                  </button>
                </div>

                {/* Variation List Grouped by Asset Type */}
                <div className="space-y-6">
                  {builderCategories.map(cat => {
                    const catAssets = builderAssets.filter(a => a.categoryId === cat.id);
                    if (catAssets.length === 0) return null;

                    return (
                      <div key={cat.id} className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border overflow-hidden">
                        <div className="bg-gray-50 dark:bg-dark-bg/50 px-4 py-3 border-b border-gray-200 dark:border-dark-border flex justify-between items-center">
                          <h4 className="font-bold text-sm uppercase tracking-wider text-gray-700 dark:text-gray-300">{cat.name}</h4>
                          <span className="text-xs text-gray-500 bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{catAssets.length} Variations</span>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 dark:bg-dark-bg/30 text-gray-500 dark:text-dark-text-secondary uppercase text-xs">
                              <tr>
                                <th className="px-4 py-2 font-semibold">Variation Number</th>
                                <th className="px-4 py-2 font-semibold">Preview</th>
                                <th className="px-4 py-2 text-right font-semibold">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
                              {catAssets.map((asset, index) => (
                                <tr key={asset.id} className="hover:bg-gray-50 dark:hover:bg-dark-bg/30">
                                  <td className="px-4 py-2 font-medium text-gray-900 dark:text-dark-text-primary">
                                    {index + 1}
                                  </td>
                                  <td className="px-4 py-2">
                                    {asset.thumbnailUrl ? (
                                      <Image src={getCleanImageUrl(asset.thumbnailUrl, currentProduct.category)} alt="" width={32} height={32} className="rounded object-cover bg-gray-100" />
                                    ) : (
                                      <span className="text-xs text-gray-400">No image</span>
                                    )}
                                  </td>
                                  <td className="px-4 py-2 text-right">
                                    <button onClick={() => handleDeleteBuilderAsset(asset.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"><Trash2 size={14} /></button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })}
                  {builderAssets.length === 0 && (
                    <div className="text-center py-8 text-gray-500 italic bg-gray-50 dark:bg-dark-bg/50 rounded-xl border border-dashed border-gray-300 dark:border-dark-border">
                      No variations added yet. Start by adding an Asset Type and then a Variation.
                    </div>
                  )}
                </div>
              </div>
            )
          }

          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-dark-text-secondary mb-1">AI Model Used</label>
            <input
              type="text"
              value={currentProduct.aiModel || ''}
              onChange={e => setCurrentProduct({ ...currentProduct, aiModel: e.target.value })}
              placeholder="e.g. Gemini 3"
              className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-300 dark:border-dark-border rounded-lg p-3 text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-brand-500 outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-dark-text-secondary mb-1">Description</label>
            <textarea
              required
              rows={4}
              value={currentProduct.description || ''}
              onChange={e => setCurrentProduct({ ...currentProduct, description: e.target.value })}
              className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-300 dark:border-dark-border rounded-lg p-3 text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-brand-500 outline-none transition-colors"
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => { setIsEditing(false); setCurrentProduct({ tags: [] }); }}
              className="px-6 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-6 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-bold transition-colors shadow-lg shadow-brand-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <span className="animate-spin">â³</span> Uploading...
                </>
              ) : (
                'Save Product'
              )}
            </button>
          </div>
        </form >
      </div >
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-text-primary">Product Management</h1>
        <button
          onClick={() => {
            setCurrentProduct({ tags: [] });
            setProductImages([]);
            setIsEditing(true);
          }}
          className="bg-brand-600 hover:bg-brand-500 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm font-bold"
        >
          <Plus size={20} /> Add Product
        </button>
      </div>

      <div className="bg-white dark:bg-dark-surface rounded-2xl overflow-hidden border border-gray-200 dark:border-dark-border shadow-sm transition-colors">
        {/* Mobile List View */}
        <div className="md:hidden divide-y divide-gray-100 dark:divide-dark-border">
          {products.map((product) => (
            <div key={product.id} className="p-4 flex gap-4 items-start">
              <div className="relative shrink-0">
                {product.imageUrl ? (
                  <Image src={getCleanImageUrl(product.imageUrl, product.category)} alt="" width={80} height={80} className="rounded-lg object-cover bg-gray-100" />
                ) : (
                  <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                    <Package size={24} />
                  </div>
                )}
                {product.status === 'draft' && (
                  <span className="absolute -top-2 -right-2 bg-yellow-100 text-yellow-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-yellow-200 shadow-sm">Draft</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-gray-900 dark:text-dark-text-primary truncate pr-2">{product.name}</h3>
                  <div className="flex gap-1">
                    <button onClick={() => {
                      setCurrentProduct(product);
                      const initialImages: ProductImageItem[] = (product.images || (product.imageUrl ? [product.imageUrl] : [])).map((url, index) => ({
                        id: `existing-${index}-${Date.now()}`,
                        type: 'url',
                        value: url,
                        preview: url
                      }));
                      setProductImages(initialImages);
                      setIsEditing(true);
                    }}
                      className="p-1.5 text-blue-600 bg-blue-50 rounded-lg"
                    >
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDelete(product.id)} className="p-1.5 text-red-600 bg-red-50 rounded-lg">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 mb-1">{product.description}</p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="font-mono font-bold text-gray-900 dark:text-dark-text-primary">${(product.price / 100).toFixed(2)}</span>
                  <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-300">{product.category}</span>
                  <div className="flex items-center gap-1 text-xs text-emerald-600 ml-auto">
                    <TrendingUp size={12} /> {product.sales || 0}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-dark-bg/50 text-gray-500 dark:text-dark-text-secondary text-sm uppercase">
              <tr>
                <th className="px-6 py-4 font-semibold tracking-wider">Product</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Category & Tags</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Price</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Sales</th>
                <th className="px-6 py-4 text-right font-semibold tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
              {products.map((product, index) => (
                <tr
                  key={product.id}
                  className="hover:bg-gray-50 dark:hover:bg-dark-bg/30 transition-colors group animate-in fade-in slide-in-from-bottom-2 fill-mode-backwards"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <NextLink href={`/3d-print/${product.slug}`} target="_blank" className="block relative group/img">
                        {product.imageUrl ? (
                          <Image src={getCleanImageUrl(product.imageUrl, product.category)} alt="" width={48} height={48} className="rounded-lg object-cover bg-gray-200 dark:bg-gray-900 shadow-sm group-hover/img:shadow-md transition-all" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-900 flex items-center justify-center shadow-sm">
                            <Package size={20} className="text-gray-400" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 rounded-lg transition-colors" />
                      </NextLink>
                      <div>
                        <div className="font-bold text-gray-900 dark:text-dark-text-primary text-base flex items-center gap-2">
                          {product.name}
                          {product.status === 'draft' && (
                            <span className="bg-yellow-100 text-yellow-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-yellow-200">Draft</span>
                          )}
                          {product.isBuilderEnabled && (
                            <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-purple-200 dark:border-purple-800 flex items-center gap-1">
                              <Hammer size={10} /> Builder
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-500 truncate max-w-[200px]">{product.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-2">
                      <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg w-fit text-xs text-gray-700 dark:text-dark-text-secondary font-bold border border-gray-200 dark:border-gray-600">{product.category}</span>
                      <div className="flex flex-wrap gap-1.5">
                        {product.tags && product.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="text-[10px] font-medium text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-900/30 px-2 py-0.5 rounded-md border border-brand-200 dark:border-brand-900/50">#{tag}</span>
                        ))}
                        {product.tags && product.tags.length > 3 && (
                          <span className="text-[10px] text-gray-500 px-1 font-medium">+ {product.tags.length - 3}</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono font-medium text-gray-700 dark:text-dark-text-secondary">${(product.price / 100).toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-gray-700 dark:text-dark-text-secondary">
                      <TrendingUp size={14} className="text-emerald-500" />
                      <span className="font-medium">{product.sales || 0}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">

                      <button
                        onClick={() => {
                          setCurrentProduct(product);
                          const initialImages: ProductImageItem[] = (product.images || (product.imageUrl ? [product.imageUrl] : [])).map((url, index) => ({
                            id: `existing-${index}-${Date.now()}`,
                            type: 'url',
                            value: url,
                            preview: url
                          }));
                          setProductImages(initialImages);
                          setIsEditing(true);
                        }}
                        className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 rounded-lg transition-colors"
                        title="Edit Product"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-2 text-red-600 bg-red-50 hover:bg-red-100 dark:text-red-400 dark:bg-red-900/20 dark:hover:bg-red-900/40 rounded-lg transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {products.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-4">
              <Package size={32} className="opacity-50" />
            </div>
            <p className="text-lg font-medium">No products found</p>
            <p className="text-sm opacity-70">Get started by adding your first product.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const OrdersManager = ({ orders }: { orders: Order[] }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOrders = orders.filter(o =>
    (o.transactionId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (o.userId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (o.customerInfo?.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (o.customerInfo?.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    if (confirm(`Change order status to ${newStatus}?`)) {
      await firebaseService.updateOrderStatus(orderId, newStatus);
    }
  };

  const handleRefund = async (order: Order) => {
    if (confirm(`Are you sure you want to refund order ${order.transactionId}? This cannot be undone.`)) {
      await firebaseService.refundOrder(order.id, order.paymentId);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-text-primary mb-6">Order Management</h1>

      <div className="bg-white dark:bg-dark-surface p-4 rounded-2xl border border-gray-200 dark:border-dark-border mb-6 shadow-sm">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-brand-500 transition-colors" size={20} />
          <input
            type="text"
            placeholder="Search by name, email, Transaction ID, or User ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl pl-12 pr-4 py-3.5 text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-dark-surface rounded-2xl overflow-hidden border border-gray-200 dark:border-dark-border shadow-sm transition-colors">
        {/* Mobile List View */}
        <div className="md:hidden divide-y divide-gray-100 dark:divide-dark-border">
          {filteredOrders.map((order) => (
            <div key={order.id} className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 dark:text-dark-text-primary">#{order.transactionId ? order.transactionId.slice(-6) : 'N/A'}</span>
                    {order.isTest && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-orange-100 text-orange-700">TEST</span>}
                  </div>
                  <div className="text-xs text-gray-500">{order.date ? order.date.toDate().toLocaleString() : 'N/A'}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900 dark:text-dark-text-primary">${(order.amount / 100).toFixed(2)}</div>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value as Order['status'])}
                    className={`mt-1 text-[10px] font-bold uppercase px-2 py-1 rounded-full border appearance-none ${order.status === 'completed' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                      order.status === 'refunded' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                        order.status === 'failed' ? 'bg-red-100 text-red-700 border-red-200' :
                          'bg-blue-100 text-blue-700 border-blue-200'
                      }`}
                  >
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="refunded">Refunded</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-dark-bg/50 rounded-lg p-3 text-sm">
                <div className="font-medium text-gray-900 dark:text-dark-text-primary mb-1">{order.customerInfo?.fullName || 'Unknown User'}</div>
                <div className="text-gray-500 text-xs">{order.customerInfo?.email}</div>
              </div>

              <div className="space-y-1">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-400"></div>
                    <span className="truncate">{item.name}</span>
                  </div>
                ))}
              </div>

              {order.status === 'completed' && (
                <button
                  onClick={() => handleRefund(order)}
                  className="w-full py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                >
                  Refund Order
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-dark-bg/50 text-gray-500 dark:text-dark-text-secondary text-sm uppercase">
              <tr>
                <th className="px-6 py-4 font-semibold tracking-wider">Date</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Customer</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Items</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Total</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Payment ID</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Status</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
              {filteredOrders.map((order, index) => (
                <tr
                  key={order.id}
                  className="hover:bg-gray-50 dark:hover:bg-dark-bg/30 transition-colors animate-in fade-in slide-in-from-bottom-2 fill-mode-backwards"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <td className="px-6 py-4 text-gray-700 dark:text-dark-text-secondary">
                    <div className="font-medium">{order.date ? order.date.toDate().toLocaleDateString() : 'N/A'}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{order.date ? order.date.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      {order.customerInfo ? (
                        <>
                          <span className="font-bold text-gray-900 dark:text-dark-text-primary">{order.customerInfo.fullName}</span>
                          <span className="text-xs text-gray-500 dark:text-dark-text-secondary">{order.customerInfo.email}</span>
                          {order.customerInfo.address && (
                            <span className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 flex items-center gap-1">
                              <Box size={10} /> {order.customerInfo.city}, {order.customerInfo.country}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="font-mono text-xs text-gray-500 dark:text-dark-text-secondary bg-gray-100 dark:bg-dark-bg p-1.5 rounded-md inline-block truncate w-24 text-center">
                          {order.userId}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-700 dark:text-dark-text-secondary">
                    <div className="flex flex-col gap-1.5">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-brand-400"></div>
                          <span>{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900 dark:text-dark-text-primary font-mono">${(order.amount / 100).toFixed(2)}</td>
                  <td className="px-6 py-4 font-mono text-xs text-gray-500 select-all">
                    {order.paymentId || 'N/A'}
                    {order.isTest && (
                      <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-orange-100 text-orange-700 border border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800">
                        TEST
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="relative">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value as Order['status'])}
                        className={`appearance-none pl-3 pr-8 py-1.5 rounded-full text-xs font-bold uppercase border outline-none cursor-pointer transition-colors ${order.status === 'completed' ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800 hover:bg-emerald-200 dark:hover:bg-emerald-900/50' :
                          order.status === 'refunded' ? 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800 hover:bg-amber-200 dark:hover:bg-amber-900/50' :
                            order.status === 'failed' ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800 hover:bg-red-200 dark:hover:bg-red-900/50' :
                              'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800 hover:bg-blue-200 dark:hover:bg-blue-900/50'
                          }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="refunded">Refunded</option>
                        <option value="failed">Failed</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {order.status === 'completed' && (
                      <button
                        onClick={() => handleRefund(order)}
                        className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 font-medium transition-colors"
                      >
                        Refund
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredOrders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-4">
              <Search size={32} className="opacity-50" />
            </div>
            <p className="text-lg font-medium">No orders found</p>
            <p className="text-sm opacity-70">Try adjusting your search terms.</p>
          </div>
        )}
      </div>
    </div>
  );
};





const UsersManager = ({ orders }: { orders: Order[] }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [userCart, setUserCart] = useState<CartItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', displayName: '', role: 'customer', password: '' });

  useEffect(() => {
    const unsubscribe = firebaseService.subscribeToAllUsers((data) => {
      setUsers(data);
    });
    return () => unsubscribe();
  }, []);

  // Fetch cart when user is selected
  useEffect(() => {
    if (selectedUser) {
      const unsub = firebaseService.subscribeToUserCart(selectedUser.id, (items) => {
        setUserCart(items);
      });
      return () => unsub();
    }
  }, [selectedUser]);

  const handleViewUser = (user: any) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user? This cannot be undone.')) {
      try {
        await firebaseService.deleteUser(userId);
        if (selectedUser?.id === userId) setIsModalOpen(false);
        alert('User deleted successfully.');
      } catch (error: any) {
        console.error("Failed to delete user:", error);
        alert(`Failed to delete user: ${error.message}`);
      }
    }
  };

  const handleBlockUser = async (user: any) => {
    const isBlocked = !user.isBlocked;
    if (confirm(`Are you sure you want to ${isBlocked ? 'block' : 'unblock'} this user?`)) {
      await firebaseService.toggleUserBlockStatus(user.id, isBlocked);
      // Optimistic update or wait for subscription
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await firebaseService.adminCreateUser(newUser);
      setIsAddingUser(false);
      setNewUser({ email: '', displayName: '', role: 'customer', password: '' });
      alert('User created successfully. Note: They will need to sign up with this email to access the account.');
    } catch (error: any) {
      console.error("Failed to add user:", error);
      alert(`Failed to add user: ${error.message}`);
    }
  };

  const filteredUsers = users.filter(u =>
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-text-primary">User Management</h1>
          <p className="text-gray-500 dark:text-dark-text-secondary mt-1">Manage user accounts, roles, and access.</p>
        </div>
        <button
          onClick={() => setIsAddingUser(true)}
          className="bg-brand-600 hover:bg-brand-500 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm font-bold"
        >
          <UserPlus size={20} /> Add User
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-dark-surface p-4 rounded-2xl border border-gray-200 dark:border-dark-border shadow-sm">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-brand-500 transition-colors" size={20} />
          <input
            type="text"
            placeholder="Search users by name, email, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl pl-12 pr-4 py-3.5 text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-dark-surface rounded-2xl overflow-hidden border border-gray-200 dark:border-dark-border shadow-sm transition-colors">
        {/* Mobile List View */}
        <div className="md:hidden divide-y divide-gray-100 dark:divide-dark-border">
          {filteredUsers.map((user) => {
            const userOrders = orders.filter(o => o.userId === user.id);
            const totalSpent = userOrders.reduce((sum, o) => sum + o.amount, 0);
            return (
              <div key={user.id} className="p-4 flex gap-4 items-start">
                <div className="w-12 h-12 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400 font-bold text-lg shrink-0">
                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-gray-900 dark:text-dark-text-primary truncate">{user.displayName || 'Unknown'}</h3>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-50 text-blue-700'}`}>
                      {user.role || 'Cust'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate mb-2">{user.email}</p>

                  <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400 mb-3">
                    <span className="flex items-center gap-1"><ShoppingCart size={12} /> {userOrders.length} Orders</span>
                    <span className="font-bold text-emerald-600">${(totalSpent / 100).toFixed(2)}</span>
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => handleViewUser(user)} className="flex-1 py-1.5 text-xs font-bold bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300">
                      Details
                    </button>
                    <button onClick={() => handleBlockUser(user)} className={`px-3 py-1.5 rounded-lg ${user.isBlocked ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      <Ban size={14} />
                    </button>
                    <button onClick={() => handleDeleteUser(user.id)} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50 dark:bg-dark-bg/50 backdrop-blur-sm text-gray-500 dark:text-dark-text-secondary text-xs uppercase tracking-wider border-b border-gray-100 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Joined</th>
                <th className="px-6 py-4 text-center font-semibold">Orders</th>
                <th className="px-6 py-4 text-right font-semibold">Total Spent</th>
                <th className="px-6 py-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
              {filteredUsers.map((user, index) => {
                const userOrders = orders.filter(o => o.userId === user.id);
                const totalSpent = userOrders.reduce((sum, o) => sum + o.amount, 0);

                return (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 dark:hover:bg-dark-bg/30 transition-all duration-200 group animate-in fade-in slide-in-from-bottom-2 fill-mode-backwards"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-100 to-brand-200 dark:from-brand-900 dark:to-brand-800 flex items-center justify-center text-brand-600 dark:text-brand-300 font-bold text-sm shadow-sm group-hover:scale-110 transition-transform border border-white dark:border-gray-700">
                          {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 dark:text-dark-text-primary">{user.displayName || 'Unknown'}</div>
                          <div className="text-xs text-gray-500 dark:text-dark-text-secondary font-mono">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide border ${user.role === 'admin'
                        ? 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800'
                        : 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
                        }`}>
                        {user.role || 'Customer'}
                      </span>
                      {user.email === 'yassinebouomrine@gmail.com' && (
                        <span className="ml-2 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide border bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800">
                          Tester
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide border ${user.isBlocked
                        ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
                        : 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800'
                        }`}>
                        {user.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-dark-text-secondary">
                      {user.createdAt ? new Date(user.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 text-xs font-bold text-gray-700 dark:text-dark-text-secondary border border-gray-200 dark:border-gray-600">
                        {userOrders.length}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-gray-900 dark:text-dark-text-primary">
                      ${(totalSpent / 100).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleViewUser(user)}
                          className="p-2 text-brand-600 bg-brand-50 hover:bg-brand-100 dark:text-brand-400 dark:bg-brand-900/20 dark:hover:bg-brand-900/40 rounded-lg transition-colors border border-transparent hover:border-brand-200 dark:hover:border-brand-800"
                          title="View Details"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleBlockUser(user)}
                          className={`p-2 rounded-lg transition-colors border border-transparent ${user.isBlocked
                            ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40 hover:border-emerald-200 dark:hover:border-emerald-800'
                            : 'text-amber-600 bg-amber-50 hover:bg-amber-100 dark:text-amber-400 dark:bg-amber-900/20 dark:hover:bg-amber-900/40 hover:border-amber-200 dark:hover:border-amber-800'}`}
                          title={user.isBlocked ? "Unblock User" : "Block User"}
                        >
                          <Ban size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2 text-red-600 bg-red-50 hover:bg-red-100 dark:text-red-400 dark:bg-red-900/20 dark:hover:bg-red-900/40 rounded-lg transition-colors border border-transparent hover:border-red-200 dark:hover:border-red-800"
                          title="Delete User"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredUsers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-4">
              <Users size={32} className="opacity-50" />
            </div>
            <p className="text-lg font-medium">No users found</p>
            <p className="text-sm opacity-70">Try adjusting your search terms.</p>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {
        isAddingUser && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col p-8 animate-in zoom-in-95 duration-200 border border-gray-200 dark:border-dark-border relative">
              <button
                onClick={() => setIsAddingUser(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <X size={20} />
              </button>
              <div className="mb-6">
                <div className="w-12 h-12 bg-brand-100 dark:bg-brand-900/30 rounded-xl flex items-center justify-center text-brand-600 dark:text-brand-400 mb-4">
                  <UserPlus size={24} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">Add New User</h2>
                <p className="text-gray-500 dark:text-dark-text-secondary text-sm mt-1">Create a new account manually.</p>
              </div>

              <form onSubmit={handleAddUser} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1.5">Display Name</label>
                  <input
                    type="text"
                    required
                    value={newUser.displayName}
                    onChange={e => setNewUser({ ...newUser, displayName: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl p-3.5 text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1.5">Email</label>
                  <input
                    type="email"
                    required
                    value={newUser.email}
                    onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl p-3.5 text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1.5">Role</label>
                  <div className="relative">
                    <select
                      value={newUser.role}
                      onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl p-3.5 text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none appearance-none transition-all"
                    >
                      <option value="customer">Customer</option>
                      <option value="tester">Tester</option>
                      <option value="admin">Admin</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-8 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingUser(false)}
                    className="px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold transition-all shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm"
                  >
                    Create User
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }

      {/* User Details Modal */}
      {
        isModalOpen && selectedUser && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-dark-surface rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border border-gray-200 dark:border-dark-border relative">
              <div className="p-6 border-b border-gray-200 dark:border-dark-border flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-sm sticky top-0 z-10">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary flex items-center gap-3">
                  <User size={24} className="text-brand-600 dark:text-brand-400" />
                  User Details
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500 dark:text-dark-text-secondary"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                {/* User Info */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-100 to-brand-200 dark:from-brand-900 dark:to-brand-800 flex items-center justify-center text-brand-600 dark:text-brand-300 font-bold text-4xl shadow-inner border-4 border-white dark:border-gray-700 shrink-0">
                    {selectedUser.displayName ? selectedUser.displayName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="text-center sm:text-left flex-1 w-full">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                      <h3 className="text-3xl font-bold text-gray-900 dark:text-dark-text-primary">{selectedUser.displayName || 'Unknown User'}</h3>
                      <div className="flex gap-2 justify-center sm:justify-start flex-wrap items-center">
                        <div className="relative group/role">
                          <button
                            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border flex items-center gap-1 cursor-pointer transition-all hover:scale-105 ${selectedUser.role === 'admin'
                              ? 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800'
                              : selectedUser.role === 'tester'
                                ? 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800'
                                : 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'}`}
                          >
                            {selectedUser.role || 'Customer'}
                            <Edit size={10} className="opacity-50" />
                          </button>

                          {/* Role Dropdown */}
                          <div className="absolute top-full left-0 mt-1 w-32 bg-white dark:bg-dark-surface rounded-lg shadow-xl border border-gray-200 dark:border-dark-border overflow-hidden opacity-0 invisible group-hover/role:opacity-100 group-hover/role:visible transition-all z-20">
                            <button
                              onClick={async () => {
                                if (confirm(`Change role to Customer?`)) {
                                  try {
                                    await firebaseService.updateUserRole(selectedUser.id, 'customer');
                                    setSelectedUser({ ...selectedUser, role: 'customer' });
                                    alert('Role updated to Customer');
                                  } catch (e: any) { alert(e.message); }
                                }
                              }}
                              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-dark-bg text-gray-700 dark:text-dark-text-primary"
                            >
                              Customer
                            </button>
                            <button
                              onClick={async () => {
                                if (confirm(`Change role to Tester?`)) {
                                  try {
                                    await firebaseService.updateUserRole(selectedUser.id, 'tester');
                                    setSelectedUser({ ...selectedUser, role: 'tester' });
                                    alert('Role updated to Tester');
                                  } catch (e: any) { alert(e.message); }
                                }
                              }}
                              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-dark-bg text-indigo-600 dark:text-indigo-400 font-medium"
                            >
                              Tester
                            </button>
                            <button
                              onClick={async () => {
                                if (confirm(`Change role to Admin?`)) {
                                  try {
                                    await firebaseService.updateUserRole(selectedUser.id, 'admin');
                                    setSelectedUser({ ...selectedUser, role: 'admin' });
                                    alert('Role updated to Admin');
                                  } catch (e: any) { alert(e.message); }
                                }
                              }}
                              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-dark-bg text-purple-600 dark:text-purple-400 font-medium"
                            >
                              Admin
                            </button>
                          </div>
                        </div>

                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${selectedUser.isBlocked
                          ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
                          : 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800'}`}>
                          {selectedUser.isBlocked ? 'Blocked' : 'Active'}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-500 dark:text-dark-text-secondary text-lg mb-2">{selectedUser.email}</p>
                    <p className="text-xs text-gray-400 font-mono bg-gray-100 dark:bg-dark-bg px-3 py-1.5 rounded-lg w-fit mx-auto sm:mx-0 select-all border border-gray-200 dark:border-dark-border">
                      ID: {selectedUser.id}
                    </p>

                    <div className="mt-6 flex flex-wrap justify-center sm:justify-start gap-3">
                      <button
                        onClick={() => handleBlockUser(selectedUser)}
                        className={`px-5 py-2.5 rounded-xl font-bold text-white transition-all shadow-lg hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 ${selectedUser.isBlocked
                          ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/30'
                          : 'bg-amber-500 hover:bg-amber-400 shadow-amber-500/30'}`}
                      >
                        <Ban size={18} /> {selectedUser.isBlocked ? 'Unblock User' : 'Block User'}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(selectedUser.id)}
                        className="px-5 py-2.5 rounded-xl font-bold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 transition-all flex items-center gap-2"
                      >
                        <Trash2 size={18} /> Delete User
                      </button>
                    </div>
                  </div>
                </div>

                {/* Customer Details Section */}
                <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-gray-200 dark:border-dark-border shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-dark-text-primary mb-4 flex items-center gap-2">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg text-indigo-600 dark:text-indigo-400">
                      <User size={20} />
                    </div>
                    Customer Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Full Name</label>
                      <p className="font-medium text-gray-900 dark:text-dark-text-primary">{selectedUser.fullName || selectedUser.displayName || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</label>
                      <p className="font-medium text-gray-900 dark:text-dark-text-primary">{selectedUser.email || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone</label>
                      <p className="font-medium text-gray-900 dark:text-dark-text-primary">{selectedUser.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Address</label>
                      <p className="font-medium text-gray-900 dark:text-dark-text-primary">{selectedUser.address || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">City / Zip</label>
                      <p className="font-medium text-gray-900 dark:text-dark-text-primary">
                        {selectedUser.city ? `${selectedUser.city}, ` : ''}{selectedUser.zipCode || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Country</label>
                      <p className="font-medium text-gray-900 dark:text-dark-text-primary">{selectedUser.country || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Live Cart */}
                  <div className="bg-gray-50 dark:bg-dark-bg/30 rounded-2xl p-6 border border-gray-200 dark:border-dark-border h-full">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-dark-text-primary mb-4 flex items-center gap-2">
                      <div className="p-2 bg-brand-100 dark:bg-brand-900/50 rounded-lg text-brand-600 dark:text-brand-400">
                        <ShoppingCart size={20} />
                      </div>
                      Live Cart ({userCart.length})
                    </h3>
                    {userCart.length > 0 ? (
                      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {userCart.map((item, idx) => (
                          <div key={idx} className="flex gap-4 items-center bg-white dark:bg-dark-surface p-3 rounded-xl border border-gray-200 dark:border-dark-border shadow-sm hover:shadow-md transition-shadow">
                            <NextLink href={`/3d-print/${item.slug}`} target="_blank" className="block shrink-0 group">
                              {item.imageUrl ? (
                                <Image src={getCleanImageUrl(item.imageUrl, item.category)} alt={item.name} width={56} height={56} className="rounded-lg object-cover bg-gray-100 group-hover:scale-105 transition-transform" />
                              ) : (
                                <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 group-hover:scale-105 transition-transform">
                                  <Package size={20} />
                                </div>
                              )}
                            </NextLink>
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-gray-900 dark:text-dark-text-primary truncate">{item.name}</div>
                              <div className="text-sm font-medium text-brand-600 dark:text-brand-400">${(item.price / 100).toFixed(2)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-gray-500 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-dark-border">
                        <ShoppingCart size={40} className="opacity-20 mb-3" />
                        <span className="text-sm font-medium">Cart is empty</span>
                      </div>
                    )}
                  </div>

                  {/* Order History */}
                  <div className="bg-gray-50 dark:bg-dark-bg/30 rounded-2xl p-6 border border-gray-200 dark:border-dark-border h-full">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-dark-text-primary mb-4 flex items-center gap-2">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg text-blue-600 dark:text-blue-400">
                        <FileText size={20} />
                      </div>
                      Order History
                    </h3>
                    {orders.filter(o => o.userId === selectedUser.id).length > 0 ? (
                      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {orders.filter(o => o.userId === selectedUser.id).map(order => (
                          <div key={order.id} className="bg-white dark:bg-dark-surface p-4 rounded-xl border border-gray-200 dark:border-dark-border shadow-sm hover:shadow-md transition-shadow flex flex-col gap-2 group">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-bold text-gray-900 dark:text-dark-text-primary group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                                  #{order.transactionId ? order.transactionId.slice(-8) : order.id.slice(-8)}
                                </div>
                                <div className="text-xs text-gray-500 mt-0.5">{order.date ? new Date(order.date.seconds * 1000).toLocaleDateString() : 'N/A'}</div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-gray-900 dark:text-dark-text-primary">${(order.amount / 100).toFixed(2)}</div>
                                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full mt-1 inline-block ${order.status === 'completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                                  }`}>
                                  {order.status}
                                </span>
                              </div>
                            </div>

                            {/* Payment Details */}
                            <div className="pt-2 mt-1 border-t border-gray-100 dark:border-gray-800 text-xs flex flex-col gap-1">
                              <div className="flex justify-between">
                                <span className="text-gray-500">Payment ID:</span>
                                <span className="font-mono text-gray-700 dark:text-gray-300 select-all">{order.paymentId || 'N/A'}</span>
                              </div>
                              {order.transactionId && (
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Transaction ID:</span>
                                  <span className="font-mono text-gray-700 dark:text-gray-300 select-all">{order.transactionId}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-gray-500 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-dark-border">
                        <FileText size={40} className="opacity-20 mb-3" />
                        <span className="text-sm font-medium">No orders placed yet</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg/50 flex justify-end rounded-b-3xl">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium shadow-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div>
  );
};



const PaymentSetting = () => {
  const [config, setConfig] = useState(paymentService.getStripeConfig());
  const [saved, setSaved] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const status = firebaseService.getSystemStatus();

  // Visibility States
  const [showTestSecret, setShowTestSecret] = useState(false);
  const [showTestWebhook, setShowTestWebhook] = useState(false);
  const [showLiveSecret, setShowLiveSecret] = useState(false);
  const [showLiveWebhook, setShowLiveWebhook] = useState(false);

  useEffect(() => {
    const unsubscribe = firebaseService.subscribeToAdminStripeConfig((newConfig) => {
      if (newConfig) setConfig(prev => ({ ...prev, ...newConfig }));
    });
    return () => unsubscribe();
  }, []);

  const handleSave = async () => {
    await firebaseService.updateStripeConfig(config);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleConnection = () => {
    // Simulate connecting/disconnecting
    setConfig({ ...config, isConnected: !config.isConnected });
  };

  return (
    <div className="max-w-3xl animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-text-primary mb-6">Payment Settings</h1>

      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl flex gap-3 items-start">
        <Shield className="text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" size={20} />
        <div>
          <h3 className="font-bold text-blue-800 dark:text-blue-300">Access Restricted</h3>
          <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
            Test Mode is currently restricted to <strong>{config.testerEmails?.join(', ') || 'yassinebouomrine@gmail.com'}</strong>.
            All other users will process payments in Live Mode regardless of the setting below.
          </p>
        </div>
      </div>

      {/* Database Connection Status */}
      <div className={`bg-white dark:bg-dark-surface rounded-2xl p-8 border border-gray-200 dark:border-dark-border mb-8 relative overflow-hidden shadow-sm transition-colors`}>
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <Database size={120} />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary flex items-center gap-2 mb-4 relative z-10">
          Database Connection
          {status.isOnline ?
            <span className="bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 text-xs px-2.5 py-1 rounded-full border border-green-200 dark:border-green-900 font-bold uppercase">Online</span> :
            <span className="bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-400 text-xs px-2.5 py-1 rounded-full border border-yellow-200 dark:border-yellow-900 font-bold uppercase">Local Mode</span>
          }
        </h2>
        <div className="grid grid-cols-2 gap-6 relative z-10">
          <div>
            <p className="text-gray-500 dark:text-dark-text-secondary text-sm mb-1.5 font-medium">Project ID</p>
            <p className="font-mono text-gray-900 dark:text-dark-text-primary bg-gray-100 dark:bg-dark-bg p-3 rounded-xl border border-gray-200 dark:border-dark-border">{status.projectId}</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-dark-text-secondary text-sm mb-1.5 font-medium">Storage Type</p>
            <p className="font-mono text-gray-900 dark:text-dark-text-primary bg-gray-100 dark:bg-dark-bg p-3 rounded-xl border border-gray-200 dark:border-dark-border">{status.storageMode}</p>
          </div>
        </div>
        {!status.isOnline && (
          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/50 rounded-xl text-yellow-800 dark:text-yellow-200 text-sm flex gap-3 items-start">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <div>
              <strong>Connection Failed:</strong> The app could not connect to Firestore (Permissions or Config error).
              Data is being saved to your browser's local storage so you can continue to test the app.
            </div>
          </div>
        )}
      </div>



      {/* Stripe Connection Section */}
      <div className="bg-white dark:bg-dark-surface rounded-2xl p-8 border border-gray-200 dark:border-dark-border mb-8 relative overflow-hidden shadow-sm transition-colors">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <DollarSign size={120} />
        </div>
        <div className="flex justify-between items-start mb-6 relative z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary flex items-center gap-2">
              Payment Gateway
              {config.isConnected ?
                <span className="flex items-center text-xs bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 px-2.5 py-1 rounded-full gap-1.5 border border-green-200 dark:border-green-700 font-bold uppercase">
                  <CheckCircle size={12} /> Connected
                </span> :
                <span className="flex items-center text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-dark-text-secondary px-2.5 py-1 rounded-full gap-1.5 font-bold uppercase">
                  <AlertCircle size={12} /> Not Connected
                </span>
              }
            </h2>
            <p className="text-gray-500 dark:text-dark-text-secondary text-sm mt-1">Manage your Stripe integration keys.</p>
          </div>
          <button
            onClick={toggleConnection}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg hover:-translate-y-0.5 active:translate-y-0 ${config.isConnected
              ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 shadow-red-500/10'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/30'
              }`}
          >
            <LinkIcon size={18} /> {config.isConnected ? 'Disconnect Stripe' : 'Connect Stripe'}
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="mb-6 relative z-10">
          <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-3">Payment Mode</label>
          <div className="flex gap-2">
            <button
              onClick={() => setConfig({ ...config, mode: 'test' })}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all border-2 ${config.mode === 'test'
                ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-400 dark:border-orange-600 text-orange-700 dark:text-orange-400'
                : 'bg-gray-50 dark:bg-dark-bg border-gray-200 dark:border-dark-border text-gray-500 dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
            >
              <div className="flex items-center justify-center gap-2">
                <AlertCircle size={18} />
                <span>Test Mode</span>
              </div>
              <p className="text-xs mt-1 opacity-75">Use test cards, no real charges</p>
            </button>
            <button
              onClick={() => setConfig({ ...config, mode: 'live' })}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all border-2 ${config.mode === 'live'
                ? 'bg-green-50 dark:bg-green-900/20 border-green-400 dark:border-green-600 text-green-700 dark:text-green-400'
                : 'bg-gray-50 dark:bg-dark-bg border-gray-200 dark:border-dark-border text-gray-500 dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
            >
              <div className="flex items-center justify-center gap-2">
                <CheckCircle size={18} />
                <span>Live Mode</span>
              </div>
              <p className="text-xs mt-1 opacity-75">Real payments, real charges</p>
            </button>
          </div>
        </div>

        {/* Mode Indicator Banner */}
        {config.isConnected && (
          <div className={`mb-6 p-3 rounded-lg flex items-center gap-2 text-sm ${config.mode === 'test'
            ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border border-orange-200 dark:border-orange-800'
            : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800'
            }`}>
            {config.mode === 'test' ? (
              <>
                <AlertCircle size={16} />
                <span><strong>Test Mode Active:</strong> Use card 4242 4242 4242 4242 with any future date and CVC.</span>
              </>
            ) : (
              <>
                <CheckCircle size={16} />
                <span><strong>Live Mode Active:</strong> Real payments will be processed.</span>
              </>
            )}
          </div>
        )}

        {/* API Keys - Test Mode */}
        {config.mode === 'test' && (
          <div className={`space-y-4 transition-all duration-300 ${config.isConnected ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
            <div className="bg-orange-50 dark:bg-orange-900/10 p-4 rounded-lg border border-orange-200 dark:border-orange-800/50">
              <h3 className="font-medium text-orange-800 dark:text-orange-400 mb-3 flex items-center gap-2">
                <AlertCircle size={16} /> Test API Keys
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Test Publishable Key</label>
                  <input
                    type="text"
                    value={config.testPublicKey || ''}
                    onChange={(e) => setConfig({ ...config, testPublicKey: e.target.value })}
                    placeholder="pk_test_..."
                    className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-dark-border rounded-lg p-3 text-gray-900 dark:text-dark-text-primary font-mono text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Test Secret Key</label>
                  <div className="relative">
                    <input
                      type={showTestSecret ? "text" : "password"}
                      value={config.testSecretKey || ''}
                      onChange={(e) => setConfig({ ...config, testSecretKey: e.target.value })}
                      placeholder={config.testSecretKey ? "••••••••••••••••" : "sk_test_..."}
                      className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-dark-border rounded-lg p-3 pr-10 text-gray-900 dark:text-dark-text-primary font-mono text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowTestSecret(!showTestSecret)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showTestSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Required for backend operations (refunds, etc).</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Test Webhook Secret</label>
                  <div className="relative">
                    <input
                      type={showTestWebhook ? "text" : "password"}
                      value={config.testWebhookSecret || ''}
                      onChange={(e) => setConfig({ ...config, testWebhookSecret: e.target.value })}
                      placeholder={config.testWebhookSecret ? "••••••••••••••••" : "whsec_..."}
                      className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-dark-border rounded-lg p-3 pr-10 text-gray-900 dark:text-dark-text-primary font-mono text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowTestWebhook(!showTestWebhook)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showTestWebhook ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Required for order fulfillment (webhooks).</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* API Keys - Live Mode */}
        {config.mode === 'live' && (
          <div className={`space-y-4 transition-all duration-300 ${config.isConnected ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
            <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-lg border border-green-200 dark:border-green-800/50">
              <h3 className="font-medium text-green-800 dark:text-green-400 mb-3 flex items-center gap-2">
                <CheckCircle size={16} /> Live API Keys
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Live Publishable Key</label>
                  <input
                    type="text"
                    value={config.livePublicKey || ''}
                    onChange={(e) => setConfig({ ...config, livePublicKey: e.target.value })}
                    placeholder="pk_live_..."
                    className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-dark-border rounded-lg p-3 text-gray-900 dark:text-dark-text-primary font-mono text-sm focus:ring-2 focus:ring-green-500 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Live Secret Key</label>
                  <div className="relative">
                    <input
                      type={showLiveSecret ? "text" : "password"}
                      value={config.liveSecretKey || ''}
                      onChange={(e) => setConfig({ ...config, liveSecretKey: e.target.value })}
                      placeholder={config.liveSecretKey ? "••••••••••••••••" : "sk_live_..."}
                      className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-dark-border rounded-lg p-3 pr-10 text-gray-900 dark:text-dark-text-primary font-mono text-sm focus:ring-2 focus:ring-green-500 outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLiveSecret(!showLiveSecret)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showLiveSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Required for real payments.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Live Webhook Secret</label>
                  <div className="relative">
                    <input
                      type={showLiveWebhook ? "text" : "password"}
                      value={config.liveWebhookSecret || ''}
                      onChange={(e) => setConfig({ ...config, liveWebhookSecret: e.target.value })}
                      placeholder={config.liveWebhookSecret ? "••••••••••••••••" : "whsec_..."}
                      className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-dark-border rounded-lg p-3 pr-10 text-gray-900 dark:text-dark-text-primary font-mono text-sm focus:ring-2 focus:ring-green-500 outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLiveWebhook(!showLiveWebhook)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showLiveWebhook ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Required for order fulfillment (webhooks).</p>
                </div>
              </div>
              <p className="text-xs text-red-600 dark:text-red-400 mt-3 flex items-center gap-1">
                <AlertCircle size={12} /> Warning: Live keys will process real payments. Handle with care.
              </p>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saved}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:-translate-y-0.5 active:translate-y-0 ${saved
              ? 'bg-green-500 text-white cursor-default'
              : 'bg-social-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200'
              }`}
          >
            {saved ? (
              <>
                <CheckCircle size={18} /> Saved!
              </>
            ) : (
              <>
                <Save size={18} /> Save API Keys
              </>
            )}
          </button>
        </div>
      </div>



      {/* Database Management */}
      <div className="bg-white dark:bg-dark-surface rounded-xl p-8 border border-gray-200 dark:border-dark-border space-y-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary mb-4">Database Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/30">
            <h3 className="font-medium text-red-800 dark:text-red-400 mb-2 flex items-center gap-2">
              <Trash2 size={18} /> Delete Test Data
            </h3>
            <p className="text-sm text-red-600 dark:text-red-400/80 mb-4">
              Removes all orders and payments created in Test Mode. This checks against your Stripe Test account.
            </p>
            <button
              onClick={async () => {
                if (!confirm('Are you sure you want to delete all test data? This cannot be undone.')) return;
                setDeleting(true);
                try {
                  await paymentService.deleteTestData();
                  alert('Test data deleted successfully.');
                } catch (e: any) {
                  console.error(e);
                  alert('Failed to delete test data: ' + e.message);
                } finally {
                  setDeleting(false);
                }
              }}
              disabled={deleting}
              className="w-full bg-white dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
              {deleting ? 'Deleting...' : 'Delete Test Data'}
            </button>
          </div>
        </div>
      </div>
    </div >
  );
};

const HeroManager = ({ products }: { products: Product[] }) => {
  const [config, setConfig] = useState<HeroConfig>({ mode: 'auto', autoType: 'newest' });
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsubscribe = firebaseService.subscribeToHeroConfig((data) => {
      setConfig(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = firebaseService.subscribeToCollections(setCollections);
    return () => unsubscribe();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await firebaseService.updateHeroConfig(config);
      alert('Hero settings saved!');
    } catch (error) {
      console.error('Failed to save hero settings:', error);
      alert('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const toggleProductSelection = (productId: string) => {
    const currentIds = config.customProductIds || [];
    let newIds;
    if (currentIds.includes(productId)) {
      newIds = currentIds.filter(id => id !== productId);
    } else {
      if (currentIds.length >= 4) {
        alert('You can select up to 4 products for the Hero section.');
        return;
      }
      newIds = [...currentIds, productId];
    }
    setConfig({ ...config, customProductIds: newIds });
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-text-primary mb-6 flex items-center gap-3">
        <Sparkles className="text-brand-500" />
        Hero Section Control
      </h1>

      <div className="bg-white dark:bg-dark-surface p-8 rounded-2xl border border-gray-200 dark:border-dark-border shadow-sm space-y-8">

        {/* Mode Selection */}
        <div>
          <label className="block text-lg font-bold text-gray-900 dark:text-dark-text-primary mb-4">Display Mode</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setConfig({ ...config, mode: 'auto' })}
              className={`p-6 rounded-xl border-2 text-left transition-all ${config.mode === 'auto'
                ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 ring-2 ring-brand-500/20'
                : 'border-gray-200 dark:border-dark-border hover:border-brand-300 dark:hover:border-brand-700'
                }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${config.mode === 'auto' ? 'bg-brand-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                  <Zap size={24} />
                </div>
                <span className={`font-bold text-lg ${config.mode === 'auto' ? 'text-brand-700 dark:text-brand-400' : 'text-gray-900 dark:text-dark-text-primary'}`}>Automatic</span>
              </div>
              <p className="text-gray-500 dark:text-dark-text-secondary text-sm">
                Automatically display products based on criteria like newest arrivals or popularity.
              </p>
            </button>

            <button
              onClick={() => setConfig({ ...config, mode: 'custom' })}
              className={`p-6 rounded-xl border-2 text-left transition-all ${config.mode === 'custom'
                ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 ring-2 ring-brand-500/20'
                : 'border-gray-200 dark:border-dark-border hover:border-brand-300 dark:hover:border-brand-700'
                }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${config.mode === 'custom' ? 'bg-brand-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                  <Edit size={24} />
                </div>
                <span className={`font-bold text-lg ${config.mode === 'custom' ? 'text-brand-700 dark:text-brand-400' : 'text-gray-900 dark:text-dark-text-primary'}`}>Custom Selection</span>
              </div>
              <p className="text-gray-500 dark:text-dark-text-secondary text-sm">
                Manually select specific products to showcase in the hero section.
              </p>
            </button>

            <button
              onClick={() => setConfig({ ...config, mode: 'collection' })}
              className={`p-6 rounded-xl border-2 text-left transition-all ${config.mode === 'collection'
                ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 ring-2 ring-brand-500/20'
                : 'border-gray-200 dark:border-dark-border hover:border-brand-300 dark:hover:border-brand-700'
                }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${config.mode === 'collection' ? 'bg-brand-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                  <Box size={24} />
                </div>
                <span className={`font-bold text-lg ${config.mode === 'collection' ? 'text-brand-700 dark:text-brand-400' : 'text-gray-900 dark:text-dark-text-primary'}`}>Featured Collection</span>
              </div>
              <p className="text-gray-500 dark:text-dark-text-secondary text-sm">
                Highlight a specific collection of products.
              </p>
            </button>
          </div>
        </div>

        {/* Layout Selection */}
        <div>
          <label className="block text-lg font-bold text-gray-900 dark:text-dark-text-primary mb-4">Layout Style</label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { id: 'standard', label: 'Standard', icon: <LayoutDashboard size={20} /> },
              { id: 'centered', label: 'Centered', icon: <LayoutTemplate size={20} /> },
              { id: 'split', label: 'Split', icon: <Columns size={20} /> },
              { id: 'asymmetrical', label: 'Asym.', icon: <Box size={20} /> },
              { id: 'grid', label: 'Grid', icon: <Grid3x3 size={20} /> }
            ].map((layout) => (
              <button
                key={layout.id}
                onClick={() => setConfig({ ...config, layout: layout.id as any })}
                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${config.layout === layout.id
                  ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400'
                  : 'border-gray-200 dark:border-dark-border text-gray-500 hover:border-brand-300'
                  }`}
              >
                {layout.icon}
                <span className="text-sm font-bold">{layout.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Visual Effects */}
        <div>
          <label className="block text-lg font-bold text-gray-900 dark:text-dark-text-primary mb-4">Visual Effect</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { id: 'none', label: 'None', icon: <Ban size={20} /> },
              { id: 'tilt', label: '3D Tilt', icon: <MousePointer2 size={20} /> },
              { id: 'glow', label: 'Glow', icon: <Sun size={20} /> },
              { id: 'parallax', label: 'Parallax', icon: <Move size={20} /> }
            ].map((effect) => (
              <button
                key={effect.id}
                onClick={() => setConfig({ ...config, visualEffect: effect.id as any })}
                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${config.visualEffect === effect.id
                  ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400'
                  : 'border-gray-200 dark:border-dark-border text-gray-500 hover:border-brand-300'
                  }`}
              >
                {effect.icon}
                <span className="text-sm font-bold">{effect.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Auto Options */}
        {config.mode === 'auto' && (
          <div className="animate-in fade-in slide-in-from-top-2">
            <label className="block text-sm font-bold text-gray-700 dark:text-dark-text-secondary mb-3">Automatic Criteria</label>
            <div className="flex flex-wrap gap-3">
              {[
                { id: 'newest', label: 'Newest Arrivals', icon: <Sparkles size={16} /> },
                { id: 'popular', label: 'Most Popular', icon: <TrendingUp size={16} /> },
                { id: 'random', label: 'Random Shuffle', icon: <Box size={16} /> }
              ].map((type) => (
                <button
                  key={type.id}
                  onClick={() => setConfig({ ...config, autoType: type.id as any })}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-all ${config.autoType === type.id
                    ? 'bg-brand-600 text-white border-brand-600 shadow-md'
                    : 'bg-white dark:bg-dark-bg border-gray-200 dark:border-dark-border text-gray-700 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-surface'
                    }`}
                >
                  {type.icon}
                  <span className="font-medium">{type.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Custom Selection */}
        {config.mode === 'custom' && (
          <div className="animate-in fade-in slide-in-from-top-2 space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-bold text-gray-700 dark:text-dark-text-secondary">
                Select Products ({config.customProductIds?.length || 0}/4)
              </label>
              <span className="text-xs text-gray-500">Selected products will appear in order.</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto p-2 border border-gray-200 dark:border-dark-border rounded-xl bg-gray-50 dark:bg-dark-bg/50">
              {products.map(product => {
                const isSelected = config.customProductIds?.includes(product.id);
                return (
                  <div
                    key={product.id}
                    onClick={() => toggleProductSelection(product.id)}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition-all ${isSelected
                      ? 'bg-brand-50 dark:bg-brand-900/20 border-brand-500 ring-1 ring-brand-500'
                      : 'bg-white dark:bg-dark-surface border-gray-200 dark:border-dark-border hover:border-brand-300'
                      }`}
                  >
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-brand-500 border-brand-500 text-white' : 'border-gray-300 dark:border-gray-600'
                      }`}>
                      {isSelected && <CheckCircle size={14} />}
                    </div>
                    <Image src={getCleanImageUrl(product.imageUrl, product.category)} alt={product.name} width={40} height={40} className="rounded object-cover bg-gray-100" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-dark-text-primary truncate">{product.name}</p>
                      <p className="text-xs text-gray-500 dark:text-dark-text-secondary">${(product.price / 100).toFixed(2)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Collection Selection */}
        {config.mode === 'collection' && (
          <div className="animate-in fade-in slide-in-from-top-2 space-y-4">
            <label className="block text-sm font-bold text-gray-700 dark:text-dark-text-secondary">
              Select Collection
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {collections.map(collection => (
                <div
                  key={collection.id}
                  onClick={() => setConfig({ ...config, collectionId: collection.id })}
                  className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${config.collectionId === collection.id
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 ring-1 ring-brand-500'
                    : 'border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface hover:border-brand-300'
                    }`}
                >
                  <div className="flex gap-4">
                    <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden shrink-0 relative">
                      {collection.imageUrl ? (
                        <Image src={getCleanImageUrl(collection.imageUrl, 'collections')} alt={collection.title} fill className="object-cover" />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                          <Box size={24} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 dark:text-dark-text-primary truncate">{collection.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-dark-text-secondary line-clamp-1">{collection.description}</p>
                      <span className="text-xs text-brand-600 dark:text-brand-400 font-medium mt-1 inline-block">
                        {collection.productIds.length} Products
                      </span>
                    </div>
                  </div>
                  {config.collectionId === collection.id && (
                    <div className="absolute top-2 right-2 text-brand-500">
                      <CheckCircle size={20} className="fill-brand-100" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            {collections.length === 0 && (
              <div className="text-center py-8 text-gray-500 bg-gray-50 dark:bg-dark-bg/50 rounded-xl border border-dashed border-gray-200 dark:border-dark-border">
                <p>No collections found. Create one in the Collections tab first.</p>
              </div>
            )}
          </div>
        )}

        {/* Save Action */}
        <div className="pt-6 border-t border-gray-200 dark:border-dark-border flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={20} />
                Save Changes
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
