'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Product, BlogPost, Collection } from '../types';
import { Plus, Eye, Heart, Search, ArrowUpDown, ShoppingCart, Download, Filter } from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
import { ProductCard } from './ProductCard';
import { getStripeConfig } from '../services/paymentService';
import { ProTipCard } from './ProTipCard';
import { InsightCard } from './InsightCard';
import { CollectionCard } from './CollectionCard';

interface ProductGridProps {
  initialProducts: Product[];
  blogPosts?: BlogPost[];
  collections?: Collection[];
}

type SortOption = 'relevance' | 'price-asc' | 'price-desc' | 'name-asc';

const PRO_TIPS = [
  "Use a brim for better bed adhesion on large prints.",
  "Calibrate your e-steps if you notice under-extrusion.",
  "Keep your filament dry to prevent popping and stringing.",
  "Level your bed while it's hot for better accuracy.",
  "Use tree supports for complex organic shapes to save material."
];

export const ProductGrid: React.FC<ProductGridProps> = ({ initialProducts, blogPosts = [], collections = [] }) => {
  const router = useRouter();
  const { addToCart, toggleWishlist, wishlist, purchases, cart, setIsCartOpen, user } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Use initialProducts from props (server-fetched)
  const products = initialProducts;

  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map(p => p.category)));
    return ['All', 'Collections', ...cats];
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = products;

    // Filter Drafts (Client-Side Security)
    result = result.filter(p => {
      if (p.status === 'draft') {
        const config = getStripeConfig();
        const testerEmails = config.testerEmails || [];
        const isAdmin = user?.email === 'stltraderltd@gmail.com';
        const isTester = user?.email && testerEmails.includes(user.email);
        return isAdmin || isTester;
      }
      return true;
    });

    // Filter Category
    if (selectedCategory === 'Collections') {
      // If collections selected, we might want to return empty products array and handle rendering separately
      // Or we can just return empty here and handle it in the render logic
      result = [];
    } else if (selectedCategory !== 'All') {
      result = result.filter(p => p.category === selectedCategory);
    }

    // Filter Search
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(lower) ||
        p.tags?.some(t => t.toLowerCase().includes(lower))
      );
    }

    // Sort
    if (sortBy === 'price-asc') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result = [...result].sort((a, b) => b.price - a.price);
    } else if (sortBy === 'name-asc') {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [products, selectedCategory, searchTerm, sortBy, user]);

  // Chunking Logic
  const renderGridItems = () => {
    const items: React.ReactNode[] = [];
    const chunkSize = 8; // Insert something every ~8 items (2 rows of 4)

    for (let i = 0; i < filteredProducts.length; i += chunkSize) {
      const chunk = filteredProducts.slice(i, i + chunkSize);

      // Add product cards
      chunk.forEach(product => {
        items.push(<ProductCard key={product.id} product={product} />);
      });

      // Insert content after chunk if not the last chunk
      if (i + chunkSize < filteredProducts.length) {
        const insertionIndex = i / chunkSize;

        // Alternate between ProTip and Insight
        if (insertionIndex % 2 === 0) {
          // Insert Pro Tip
          const tipIndex = (insertionIndex / 2) % PRO_TIPS.length;
          items.push(
            <div key={`tip-${insertionIndex}`} className="break-inside-avoid col-span-1 sm:col-span-2 md:col-span-1 lg:col-span-1">
              <ProTipCard tip={PRO_TIPS[tipIndex]} />
            </div>
          );
        } else {
          // Insert Insight (Blog Post)
          const postIndex = Math.floor(insertionIndex / 2) % blogPosts.length;
          if (blogPosts[postIndex]) {
            items.push(
              <div key={`insight-${insertionIndex}`} className="break-inside-avoid col-span-1">
                <InsightCard post={blogPosts[postIndex]} />
              </div>
            );
          }
        }
      }
    }
    return items;
  };

  // Render Collections Grid
  const renderCollections = () => {
    return collections.map(collection => (
      <div key={collection.id} className="break-inside-avoid col-span-1 sm:col-span-2 md:col-span-1 lg:col-span-1">
        <CollectionCard collection={collection} />
      </div>
    ));
  };

  return (
    <div className="space-y-8" id="products">
      {/* Search & Filter Bar */}
      <div className="sticky top-16 z-20 py-4 bg-gray-50/95 dark:bg-dark-surface/95 backdrop-blur rounded-2xl transition-colors space-y-4 shadow-sm border border-gray-100 dark:border-dark-border px-4">

        {/* Mobile Toggle */}
        <div className="md:hidden flex justify-between items-center">
          <span className="font-bold text-gray-900 dark:text-dark-text-primary">Filters & Search</span>
          <button
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className={`p-2 rounded-lg transition-colors ${isFiltersOpen ? 'bg-gray-100 dark:bg-dark-bg text-social-black dark:text-white' : 'bg-gray-100 dark:bg-dark-surface text-gray-600 dark:text-dark-text-secondary'}`}
            aria-label="Toggle Filters"
          >
            <Filter size={20} />
          </button>
        </div>

        <div className={`flex flex-col md:flex-row gap-4 justify-between ${isFiltersOpen ? 'flex' : 'hidden md:flex'}`}>
          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all shadow-sm ${selectedCategory === cat
                  ? 'bg-social-black dark:bg-white text-white dark:text-black shadow-lg'
                  : 'bg-white dark:bg-dark-surface text-gray-600 dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-surface/80'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Tools */}
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search models..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-full bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border text-gray-900 dark:text-dark-text-primary text-sm focus:ring-2 focus:ring-social-black dark:focus:ring-white outline-none"
              />
            </div>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="appearance-none pl-4 pr-10 py-2 rounded-full bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border text-gray-900 dark:text-dark-text-primary text-sm focus:ring-2 focus:ring-social-black dark:focus:ring-white outline-none cursor-pointer"
              >
                <option value="relevance">Relevance</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A-Z</option>
              </select>
              <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
            </div>
          </div>
        </div>
      </div>

      {/* Masonry Grid with Interspersed Content */}
      <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-3 md:gap-6 space-y-3 md:space-y-6">
        {selectedCategory === 'Collections' ? renderCollections() : renderGridItems()}

        {filteredProducts.length === 0 && selectedCategory !== 'Collections' && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-500 dark:text-dark-text-secondary">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-lg">No products found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};