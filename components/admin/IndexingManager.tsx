import React, { useState, useEffect } from 'react';
import { Search, Save, AlertCircle, CheckCircle, Settings, Globe, Trash2, ExternalLink, Layers, PlayCircle, StopCircle, Filter, RefreshCw, CheckSquare, Square } from 'lucide-react';
import * as firebaseService from '../../services/firebaseService';
import { Product, BlogPost } from '../../types';

interface IndexingManagerProps {
    products: Product[];
}

interface IndexableItem {
    id: string;
    title: string;
    slug: string;
    type: 'product' | 'post' | 'static';
    lastIndexedAt?: any;
    url: string;
}

const IndexingManager: React.FC<IndexingManagerProps> = ({ products }) => {
    const [activeTab, setActiveTab] = useState<'request' | 'bulk' | 'selective' | 'settings'>('request');
    const [url, setUrl] = useState('');
    const [serviceAccountJson, setServiceAccountJson] = useState('');
    const [baseUrl, setBaseUrl] = useState('https://freshstl.com');
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [isConfigured, setIsConfigured] = useState(false);

    // Bulk Indexing State
    const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0, active: false });
    const [bulkLogs, setBulkLogs] = useState<string[]>([]);

    // Selective Indexing State
    const [items, setItems] = useState<IndexableItem[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [filterType, setFilterType] = useState<'all' | 'product' | 'post'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [posts, setPosts] = useState<BlogPost[]>([]);

    useEffect(() => {
        checkConfiguration();
        fetchPosts();
    }, []);

    useEffect(() => {
        if (baseUrl) {
            const productItems: IndexableItem[] = products
                .filter(p => p.status !== 'draft')
                .map(p => ({
                    id: p.id,
                    title: p.name,
                    slug: p.slug,
                    type: 'product',
                    lastIndexedAt: p.lastIndexedAt,
                    url: `${baseUrl.replace(/\/$/, '')}/3d-print/${p.slug}`
                }));

            const postItems: IndexableItem[] = posts.map(p => ({
                id: p.id,
                title: p.title,
                slug: p.slug,
                type: 'post',
                lastIndexedAt: p.lastIndexedAt,
                url: `${baseUrl.replace(/\/$/, '')}/blog/${p.slug}`
            }));

            setItems([...productItems, ...postItems]);
        }
    }, [products, posts, baseUrl]);

    const checkConfiguration = async () => {
        try {
            const settings = await firebaseService.getIndexingSettings();
            if (settings) {
                if (settings.serviceAccount) {
                    setServiceAccountJson(settings.serviceAccount);
                    setIsConfigured(true);
                }
                if (settings.baseUrl) {
                    setBaseUrl(settings.baseUrl);
                }
            }
        } catch (error) {
            console.error("Failed to load settings", error);
        }
    };

    const fetchPosts = async () => {
        const fetchedPosts = await firebaseService.getAllBlogPosts();
        setPosts(fetchedPosts);
    };

    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setStatus(null);
        try {
            JSON.parse(serviceAccountJson);
            let cleanBaseUrl = baseUrl.trim();
            if (cleanBaseUrl && !cleanBaseUrl.startsWith('http')) {
                throw new Error("Base URL must start with http:// or https://");
            }
            // Remove trailing slash
            cleanBaseUrl = cleanBaseUrl.replace(/\/$/, '');

            await firebaseService.saveIndexingConfig({ serviceAccount: serviceAccountJson, baseUrl: cleanBaseUrl });
            setBaseUrl(cleanBaseUrl); // Update state with cleaned URL
            setIsConfigured(true);
            setStatus({ type: 'success', message: 'Configuration saved successfully.' });
            setActiveTab('request');
        } catch (error: any) {
            setStatus({ type: 'error', message: 'Invalid Input or save failed: ' + error.message });
        } finally {
            setIsLoading(false);
        }
    };

    const handleRequestIndexing = async (targetUrl: string, type: 'URL_UPDATED' | 'URL_DELETED') => {
        if (!targetUrl) return;
        try {
            await firebaseService.requestIndexing(targetUrl, type);
            return true;
        } catch (error: any) {
            console.error("Indexing request failed", error);
            // Throw the error so the caller can handle it and display the message
            throw error;
        }
    };

    const onSingleRequest = async (type: 'URL_UPDATED' | 'URL_DELETED') => {
        setIsLoading(true);
        setStatus(null);
        try {
            await handleRequestIndexing(url, type);
            setStatus({ type: 'success', message: `Successfully requested ${type === 'URL_UPDATED' ? 'update' : 'removal'} for ${url}` });
            setUrl('');
        } catch (error: any) {
            // Display the error message from the Cloud Function
            setStatus({ type: 'error', message: 'Request failed: ' + (error.message || 'Unknown error') });
        } finally {
            setIsLoading(false);
        }
    };

    const runBulkIndexing = async (itemsToIndex: IndexableItem[]) => {
        if (!baseUrl) {
            setStatus({ type: 'error', message: `Base URL is not configured (Current value: '${baseUrl}'). Please go to Settings and save it.` });
            return;
        }

        setBulkProgress({ current: 0, total: itemsToIndex.length, active: true });
        setBulkLogs([]);
        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < itemsToIndex.length; i++) {
            const item = itemsToIndex[i];

            try {
                setBulkLogs(prev => [`Indexing: ${item.url}...`, ...prev]);
                await handleRequestIndexing(item.url, 'URL_UPDATED');

                // Update status in Firestore
                await firebaseService.updateIndexingStatus(item.type, item.id);

                setBulkLogs(prev => [`✅ Success: ${item.title}`, ...prev]);
                successCount++;
            } catch (error: any) {
                setBulkLogs(prev => [`❌ Failed: ${item.title} - ${error.message}`, ...prev]);
                failCount++;
            }
            setBulkProgress({ current: i + 1, total: itemsToIndex.length, active: true });
            await new Promise(r => setTimeout(r, 600));
        }

        setBulkProgress(prev => ({ ...prev, active: false }));
        setStatus({ type: 'success', message: `Bulk Indexing Complete. Success: ${successCount}, Failed: ${failCount}` });

        // Refresh posts to get updated timestamps
        fetchPosts();
    };

    // Selective Indexing Handlers
    const toggleSelection = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === filteredItems.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredItems.map(i => i.id)));
        }
    };

    const handleIndexSelected = () => {
        const selectedItems = items.filter(i => selectedIds.has(i.id));
        runBulkIndexing(selectedItems);
    };

    const filteredItems = items.filter(item => {
        if (filterType !== 'all' && item.type !== filterType) return false;
        if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    // Simple Bulk Handlers (wrappers)
    const handleIndexHome = () => runBulkIndexing([{ id: 'home', title: 'Home Page', slug: '', type: 'static', url: baseUrl } as any]);
    const handleIndexProducts = () => runBulkIndexing(items.filter(i => i.type === 'product'));
    const handleIndexBlog = () => runBulkIndexing(items.filter(i => i.type === 'post'));
    const handleIndexImportant = () => {
        const paths = ['/about', '/contact', '/faq', '/terms', '/privacy'];
        const impItems = paths.map(p => ({ id: p, title: p, slug: p, type: 'static', url: `${baseUrl}${p}` } as any));
        runBulkIndexing([{ id: 'home', title: 'Home Page', slug: '', type: 'static', url: baseUrl } as any, ...impItems]);
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-text-primary flex items-center gap-3">
                    <Globe className="text-brand-500" /> Google Indexing
                </h1>
                <div className="flex bg-gray-100 dark:bg-dark-bg p-1 rounded-xl overflow-x-auto">
                    {['request', 'bulk', 'selective', 'settings'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize whitespace-nowrap ${activeTab === tab
                                ? 'bg-white dark:bg-dark-surface text-brand-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                                }`}
                        >
                            {tab === 'request' ? 'Single Request' : tab}
                        </button>
                    ))}
                </div>
            </div>

            {!isConfigured && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-xl mb-6 flex items-start gap-3">
                    <AlertCircle className="text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-bold text-yellow-800 dark:text-yellow-300">Configuration Required</h3>
                        <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                            Please configure the <b>Service Account</b> and <b>Base URL</b> in the Settings tab.
                        </p>
                    </div>
                </div>
            )}

            {status && (
                <div className={`p-4 rounded-xl mb-6 flex items-start gap-3 ${status.type === 'success'
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                    }`}>
                    {status.type === 'success' ? <CheckCircle className="text-green-600" /> : <AlertCircle className="text-red-600" />}
                    <div>
                        <h3 className={`font-bold ${status.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                            {status.type === 'success' ? 'Success' : 'Error'}
                        </h3>
                        <p className={`text-sm mt-1 ${status.type === 'success' ? 'text-green-700' : 'text-red-700'}`}>
                            {status.message}
                        </p>
                    </div>
                </div>
            )}

            {/* Progress Bar (Global) */}
            {bulkProgress.active && (
                <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-gray-200 dark:border-dark-border shadow-sm mb-6 sticky top-4 z-10">
                    <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-gray-900 dark:text-dark-text-primary flex items-center gap-2">
                            <RefreshCw className="animate-spin text-brand-500" size={16} /> Indexing in Progress...
                        </span>
                        <span className="text-sm text-gray-500">{bulkProgress.current} / {bulkProgress.total}</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 mb-4">
                        <div
                            className="bg-brand-600 h-2.5 rounded-full transition-all duration-300"
                            style={{ width: `${(bulkProgress.current / bulkProgress.total) * 100}%` }}
                        ></div>
                    </div>
                    <div className="h-32 overflow-y-auto bg-gray-50 dark:bg-dark-bg rounded-xl p-4 font-mono text-xs space-y-1 border border-gray-200 dark:border-dark-border">
                        {bulkLogs.map((log, i) => (
                            <div key={i} className={log.startsWith('✅') ? 'text-green-600' : log.startsWith('❌') ? 'text-red-600' : 'text-gray-500'}>
                                {log}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'request' && (
                <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-gray-200 dark:border-dark-border shadow-sm">
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Page URL to Index</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="https://your-site.com/page-to-index"
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                disabled={!isConfigured || isLoading}
                            />
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={() => onSingleRequest('URL_UPDATED')} disabled={!url || !isConfigured || isLoading} className="flex-1 bg-brand-600 hover:bg-brand-500 text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                            <Globe size={20} /> Update URL
                        </button>
                        <button onClick={() => onSingleRequest('URL_DELETED')} disabled={!url || !isConfigured || isLoading} className="flex-1 bg-red-100 text-red-600 px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                            <Trash2 size={20} /> Remove URL
                        </button>
                    </div>
                </div>
            )}

            {activeTab === 'bulk' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <BulkCard icon={<Globe />} title="Index Home Page" desc="Submit main landing page" onClick={handleIndexHome} disabled={!isConfigured || bulkProgress.active} color="blue" />
                    <BulkCard icon={<Layers />} title="Index Important Pages" desc="About, Contact, FAQ, etc." onClick={handleIndexImportant} disabled={!isConfigured || bulkProgress.active} color="purple" />
                    <BulkCard icon={<Settings />} title="Index All Products" desc={`Submit all ${products.length} products`} onClick={handleIndexProducts} disabled={!isConfigured || bulkProgress.active} color="orange" />
                    <BulkCard icon={<Settings />} title="Index All Blog Posts" desc={`Submit all ${posts.length} posts`} onClick={handleIndexBlog} disabled={!isConfigured || bulkProgress.active} color="pink" />
                </div>
            )}

            {activeTab === 'selective' && (
                <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-200 dark:border-dark-border shadow-sm overflow-hidden">
                    {/* Toolbar */}
                    <div className="p-4 border-b border-gray-200 dark:border-dark-border flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50 dark:bg-dark-bg/50">
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <div className="relative flex-1 md:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search pages..."
                                    className="w-full pl-9 pr-4 py-2 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                                />
                            </div>
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value as any)}
                                className="px-3 py-2 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg text-sm outline-none"
                            >
                                <option value="all">All Types</option>
                                <option value="product">Products</option>
                                <option value="post">Blog Posts</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <span className="text-sm text-gray-500">{selectedIds.size} selected</span>
                            <button
                                onClick={handleIndexSelected}
                                disabled={selectedIds.size === 0 || bulkProgress.active || !isConfigured}
                                className="bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2"
                            >
                                <PlayCircle size={16} /> Index Selected
                            </button>
                        </div>
                    </div>

                    {/* Table Header */}
                    <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 p-4 border-b border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-xs font-bold text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center">
                            <button onClick={toggleSelectAll} className="text-gray-400 hover:text-brand-600">
                                {selectedIds.size > 0 && selectedIds.size === filteredItems.length ? <CheckSquare size={18} /> : <Square size={18} />}
                            </button>
                        </div>
                        <div>Page Title</div>
                        <div>Type</div>
                        <div>Last Indexed</div>
                    </div>

                    {/* List */}
                    <div className="max-h-[500px] overflow-y-auto divide-y divide-gray-100 dark:divide-dark-border">
                        {filteredItems.map((item) => (
                            <div
                                key={item.id}
                                className={`grid grid-cols-[auto_1fr_auto_auto] gap-4 p-4 items-center hover:bg-gray-50 dark:hover:bg-dark-bg/50 transition-colors ${selectedIds.has(item.id) ? 'bg-brand-50 dark:bg-brand-900/10' : ''}`}
                            >
                                <div onClick={() => toggleSelection(item.id)} className="cursor-pointer text-gray-400 hover:text-brand-600">
                                    {selectedIds.has(item.id) ? <CheckSquare size={18} className="text-brand-600" /> : <Square size={18} />}
                                </div>
                                <div>
                                    <div className="font-medium text-gray-900 dark:text-dark-text-primary">{item.title}</div>
                                    <div className="text-xs text-gray-500 truncate max-w-[300px]">{item.url}</div>
                                </div>
                                <div>
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${item.type === 'product' ? 'bg-orange-100 text-orange-700' : 'bg-pink-100 text-pink-700'}`}>
                                        {item.type}
                                    </span>
                                </div>
                                <div className="text-sm text-gray-500">
                                    {item.lastIndexedAt ? (
                                        <span className="flex items-center gap-1 text-green-600">
                                            <CheckCircle size={12} />
                                            {item.lastIndexedAt?.toDate ? item.lastIndexedAt.toDate().toLocaleDateString() : 'Recently'}
                                        </span>
                                    ) : (
                                        <span className="text-gray-400 text-xs">Never</span>
                                    )}
                                </div>
                            </div>
                        ))}
                        {filteredItems.length === 0 && (
                            <div className="p-8 text-center text-gray-500">
                                No pages found matching your filters.
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'settings' && (
                <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-gray-200 dark:border-dark-border shadow-sm">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary mb-4 flex items-center gap-2">
                        <Settings size={20} className="text-gray-500" /> Configuration
                    </h2>
                    <form onSubmit={handleSaveSettings}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Base URL</label>
                            <input type="url" value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} placeholder="https://freshstl.com" className="w-full p-3 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-brand-500 outline-none" required />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Service Account JSON</label>
                            <textarea value={serviceAccountJson} onChange={(e) => setServiceAccountJson(e.target.value)} placeholder='Paste service-account.json content...' className="w-full h-64 p-4 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl font-mono text-xs focus:ring-2 focus:ring-brand-500 outline-none" required />
                        </div>
                        <div className="flex justify-end">
                            <button type="submit" disabled={isLoading} className="bg-brand-600 hover:bg-brand-500 text-white px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2">
                                {isLoading ? 'Saving...' : <><Save size={20} /> Save Configuration</>}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

const BulkCard = ({ icon, title, desc, onClick, disabled, color }: any) => {
    const colors: any = {
        blue: 'bg-blue-100 text-blue-600',
        purple: 'bg-purple-100 text-purple-600',
        orange: 'bg-orange-100 text-orange-600',
        pink: 'bg-pink-100 text-pink-600',
    };
    return (
        <button onClick={onClick} disabled={disabled} className="p-6 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-2xl hover:border-brand-500 transition-all text-left group disabled:opacity-50">
            <div className={`w-12 h-12 ${colors[color]} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-dark-text-primary">{title}</h3>
            <p className="text-sm text-gray-500 mt-1">{desc}</p>
        </button>
    );
};

export default IndexingManager;
