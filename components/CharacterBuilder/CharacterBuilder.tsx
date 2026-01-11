import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, RotateCcw, Save, Box, Shuffle, Eye, EyeOff, Loader2, Share2, Download, Palette, ChevronRight, Lock, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import { useGLTF } from '@react-three/drei';
import { Scene } from './Scene';
import { User } from 'firebase/auth';
import { BuilderAsset, BuilderCategory } from '../../types';
import * as firebaseService from '../../services/firebaseService';

interface CharacterBuilderProps {
    onBack: () => void;
    productId?: string;
}

export const CharacterBuilder: React.FC<CharacterBuilderProps> = ({ onBack, productId }) => {
    // Data State
    const [categories, setCategories] = useState<BuilderCategory[]>([]);
    const [assets, setAssets] = useState<BuilderAsset[]>([]);

    // Selection State
    const [activeTab, setActiveTab] = useState<string>('');
    const [selections, setSelections] = useState<Record<string, BuilderAsset>>({});
    const [selectedVariations, setSelectedVariations] = useState<Record<string, string>>({}); // assetId -> variationId

    // History State for Undo/Redo
    const [history, setHistory] = useState<{ selections: Record<string, BuilderAsset>, variations: Record<string, string> }[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    // UI State
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // New UI Features
    const [cameraView, setCameraView] = useState<'default' | 'head' | 'feet'>('default');
    const [pose, setPose] = useState<string>('idle');
    const [background, setBackground] = useState<string>('gradient'); // 'gradient', 'solid', etc.

    // Auth & Purchase State
    const [user, setUser] = useState<User | null>(null);
    const [isPurchased, setIsPurchased] = useState(false);
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const [productVideoUrl, setProductVideoUrl] = useState<string | null>(null);

    // Check Auth & Purchase
    useEffect(() => {
        const unsubAuth = firebaseService.subscribeToAuth((currentUser) => {
            setUser(currentUser);
            if (!currentUser) {
                setIsPurchased(false);
                setIsAuthLoading(false);
            }
        });
        return () => unsubAuth();
    }, []);

    useEffect(() => {
        if (!user || !productId) {
            if (!user) setIsPurchased(false);
            // If no productId, maybe it's a demo or free builder? Assuming protected for now if productId exists.
            // If productId is missing, we might default to allowed or blocked. Let's assume blocked if we want to sell it.
            // But the prompt implies "if user still not buy the product".
            return;
        }

        const unsubPurchases = firebaseService.subscribeToPurchases(user.uid, (purchases) => {
            const hasBought = purchases.some(p => p.productId === productId);
            setIsPurchased(hasBought);
            setIsAuthLoading(false);
        });

        return () => unsubPurchases();
    }, [user, productId]);

    // Fetch Product Video
    useEffect(() => {
        if (productId) {
            const fetchProduct = async () => {
                try {
                    const product = await firebaseService.getProduct(productId);
                    if (product && product.videoUrl) {
                        setProductVideoUrl(product.videoUrl);
                    }
                } catch (error) {
                    console.error("Failed to fetch product video:", error);
                }
            };
            fetchProduct();
        }
    }, [productId]);

    // Fetch Data
    useEffect(() => {
        const unsubCat = firebaseService.subscribeToBuilderCategories((cats) => {
            setCategories(cats);
            if (cats.length > 0 && !activeTab) {
                setActiveTab(cats[0].slug);
            }
        }, productId);
        const unsubAsset = firebaseService.subscribeToBuilderAssets((fetchedAssets) => {
            setAssets(fetchedAssets);
            setIsLoading(false);
            // Preload assets to prevent loading issues
            fetchedAssets.forEach(asset => {
                if (asset.modelUrl) useGLTF.preload(asset.modelUrl);
                asset.variations?.forEach(v => {
                    if (v.modelUrl) useGLTF.preload(v.modelUrl);
                });
            });
        }, productId);
        return () => { unsubCat(); unsubAsset(); };
    }, [productId]);

    // Initialize Default Selections
    useEffect(() => {
        if (categories.length > 0 && assets.length > 0 && Object.keys(selections).length === 0) {
            const defaults: Record<string, BuilderAsset> = {};
            categories.forEach(cat => {
                const catAssets = assets.filter(a => a.categorySlug === cat.slug);
                if (catAssets.length > 0) {
                    defaults[cat.slug] = catAssets[0];
                }
            });
            setSelections(defaults);
            // Initialize history
            setHistory([{ selections: defaults, variations: {} }]);
            setHistoryIndex(0);
        }
    }, [categories, assets]);

    // Helper to push to history
    const updateSelectionsWithHistory = (newSelections: Record<string, BuilderAsset>, newVariations: Record<string, string>) => {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push({ selections: newSelections, variations: newVariations });
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);

        setSelections(newSelections);
        setSelectedVariations(newVariations);
    };

    const handleUndo = () => {
        if (historyIndex > 0) {
            const prev = history[historyIndex - 1];
            setSelections(prev.selections);
            setSelectedVariations(prev.variations);
            setHistoryIndex(historyIndex - 1);
        }
    };

    const handleRedo = () => {
        if (historyIndex < history.length - 1) {
            const next = history[historyIndex + 1];
            setSelections(next.selections);
            setSelectedVariations(next.variations);
            setHistoryIndex(historyIndex + 1);
        }
    };

    const handleSelect = (categorySlug: string, asset: BuilderAsset) => {
        const newSelections = { ...selections, [categorySlug]: asset };
        updateSelectionsWithHistory(newSelections, selectedVariations);
    };

    const handleSelectVariation = (assetId: string, variationId: string) => {
        const newVariations = { ...selectedVariations, [assetId]: variationId };
        updateSelectionsWithHistory(selections, newVariations);
    };

    const handleRandomize = () => {
        const newSelections: Record<string, BuilderAsset> = {};
        const newVariations: Record<string, string> = {};

        categories.forEach(cat => {
            const catAssets = assets.filter(a => a.categorySlug === cat.slug);
            if (catAssets.length > 0) {
                const randomAsset = catAssets[Math.floor(Math.random() * catAssets.length)];
                newSelections[cat.slug] = randomAsset;

                if (randomAsset.variations && randomAsset.variations.length > 0) {
                    const randomVar = randomAsset.variations[Math.floor(Math.random() * randomAsset.variations.length)];
                    newVariations[randomAsset.id] = randomVar.id;
                }
            }
        });
        updateSelectionsWithHistory(newSelections, newVariations);
    };

    const handleReset = () => {
        // Re-calculate defaults or just clear non-defaults? 
        // For now, let's just go back to the very first history state if available, or recalc defaults.
        if (history.length > 0) {
            const first = history[0];
            updateSelectionsWithHistory(first.selections, first.variations);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsSaving(false);
        alert('Design Saved! (This would save to your profile)');
    };

    const handleNextCategory = () => {
        const currentIndex = categories.findIndex(c => c.slug === activeTab);
        if (currentIndex < categories.length - 1) {
            setActiveTab(categories[currentIndex + 1].slug);
        }
    };

    const handlePrevCategory = () => {
        const currentIndex = categories.findIndex(c => c.slug === activeTab);
        if (currentIndex > 0) {
            setActiveTab(categories[currentIndex - 1].slug);
        }
    };

    const renderAssetGrid = () => {
        const currentAssets = assets.filter(a => a.categorySlug === activeTab);
        const selected = selections[activeTab];

        return (
            <div className="space-y-6 pb-20">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {currentAssets.map((asset) => (
                        <button
                            key={asset.id}
                            onClick={() => handleSelect(activeTab, asset)}
                            className={`
                                group relative p-3 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2
                                ${selected?.id === asset.id
                                    ? 'border-brand-500 bg-brand-500/5 text-brand-600 dark:text-brand-400 ring-2 ring-brand-500/20'
                                    : 'border-gray-200 dark:border-dark-border hover:border-brand-300 dark:hover:border-brand-700 bg-white dark:bg-dark-surface text-gray-600 dark:text-dark-text-secondary hover:shadow-md'}
                            `}
                        >
                            {/* Thumbnail or Icon */}
                            <div className={`
                                w-14 h-14 rounded-lg flex items-center justify-center transition-colors relative overflow-hidden
                                ${selected?.id === asset.id ? 'bg-brand-100 dark:bg-brand-900/20' : 'bg-gray-100 dark:bg-dark-bg group-hover:bg-gray-50 dark:group-hover:bg-dark-surface'}
                            `}>
                                {asset.thumbnailUrl ? (
                                    <div className="relative w-full h-full p-1">
                                        <Image
                                            src={asset.thumbnailUrl}
                                            alt={asset.name}
                                            fill
                                            className="object-contain"
                                            sizes="(max-width: 768px) 50vw, 33vw"
                                        />
                                    </div>
                                ) : (
                                    <Box size={24} className={selected?.id === asset.id ? 'text-brand-500' : 'text-gray-400'} />
                                )}

                                {asset.variations && asset.variations.length > 0 && (
                                    <div className="absolute bottom-0 right-0 bg-black/50 backdrop-blur-sm px-1 py-0.5 rounded-tl-md">
                                        <Palette size={10} className="text-white" />
                                    </div>
                                )}
                            </div>

                            <span className="text-xs font-bold text-center truncate w-full px-1">{asset.name}</span>

                            {selected?.id === asset.id && (
                                <div className="absolute top-2 right-2 w-5 h-5 bg-brand-500 rounded-full flex items-center justify-center shadow-sm animate-in zoom-in duration-200">
                                    <Check size={12} className="text-white" />
                                </div>
                            )}
                        </button>
                    ))}
                    {currentAssets.length === 0 && (
                        <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-400">
                            <Box size={48} className="mb-4 opacity-20" />
                            <p>No items found in this category.</p>
                        </div>
                    )}
                </div>

                {/* Variations Selector */}
                {selected && selected.variations && selected.variations.length > 0 && (
                    <div className="bg-gray-100 dark:bg-dark-bg/50 p-4 rounded-xl border border-gray-200 dark:border-dark-border animate-in slide-in-from-top-2">
                        <h4 className="text-xs font-bold uppercase text-gray-500 mb-3 flex items-center gap-2">
                            <Palette size={12} /> Variations for {selected.name}
                        </h4>
                        <div className="flex flex-wrap gap-3">
                            {selected.variations.map((variation) => {
                                const isVarSelected = selectedVariations[selected.id] === variation.id;
                                return (
                                    <button
                                        key={variation.id}
                                        onClick={() => handleSelectVariation(selected.id, variation.id)}
                                        className={`
                                            group relative flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all
                                            ${isVarSelected
                                                ? 'border-brand-500 bg-white dark:bg-dark-surface shadow-sm'
                                                : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600 bg-white/50 dark:bg-dark-surface/50'}
                                        `}
                                        title={variation.name}
                                    >
                                        <div
                                            className="w-4 h-4 rounded-full border border-gray-200 shadow-sm"
                                            style={{ backgroundColor: variation.color || '#eee' }}
                                        />
                                        <span className={`text-xs font-bold ${isVarSelected ? 'text-gray-900 dark:text-dark-text-primary' : 'text-gray-500'}`}>
                                            {variation.name}
                                        </span>
                                        {isVarSelected && <Check size={10} className="text-brand-500 ml-1" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // Helper to get current selection for Scene
    const getSelection = (slug: string) => selections[slug] || null;

    return (
        <div className="h-screen w-full flex flex-col md:flex-row bg-gray-900 dark:bg-black overflow-hidden font-sans">
            {/* Left: 3D Canvas */}
            <div className={`relative transition-all duration-500 ease-in-out ${isSidebarOpen ? 'w-full md:w-[calc(100%-400px)]' : 'w-full'} h-full`}>

                {/* Top Controls */}
                <div className="absolute top-6 left-6 right-6 z-10 flex justify-between items-start pointer-events-none">
                    <div className="flex gap-2 pointer-events-auto">
                        <button
                            onClick={onBack}
                            className="flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-xl text-white rounded-full hover:bg-black/60 transition-all border border-white/10 hover:border-white/20 group shadow-lg"
                        >
                            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                            <span className="font-bold text-sm hidden sm:inline">Exit</span>
                        </button>

                        <div className="h-full w-px bg-white/10 mx-2"></div>

                        <button
                            onClick={handleUndo}
                            disabled={historyIndex <= 0}
                            className="p-2 bg-black/40 backdrop-blur-xl text-white rounded-full hover:bg-black/60 disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-white/10"
                            title="Undo"
                        >
                            <RotateCcw size={18} className="-scale-x-100" />
                        </button>
                        <button
                            onClick={handleRedo}
                            disabled={historyIndex >= history.length - 1}
                            className="p-2 bg-black/40 backdrop-blur-xl text-white rounded-full hover:bg-black/60 disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-white/10"
                            title="Redo"
                        >
                            <RotateCcw size={18} />
                        </button>
                    </div>

                    <div className="flex gap-2 pointer-events-auto">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-3 bg-black/40 backdrop-blur-xl text-white rounded-full hover:bg-black/60 transition-all border border-white/10 hover:border-white/20 shadow-lg"
                            title={isSidebarOpen ? "Hide UI" : "Show UI"}
                        >
                            {isSidebarOpen ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                </div>

                {/* 3D Scene */}
                <div className="w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-800 via-gray-900 to-black relative">
                    {/* Video Overlay for Non-Purchasers */}
                    {!isPurchased && !isAuthLoading && productId && (
                        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
                            <div className="w-full h-full absolute inset-0 overflow-hidden">
                                {/* Placeholder Video - Replace with actual video URL */}
                                <video
                                    className="w-full h-full object-cover opacity-50"
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                    src={productVideoUrl || "https://cdn.pixabay.com/video/2023/10/22/186115-877653483_large.mp4"}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50" />
                            </div>

                            <div className="relative z-30 flex flex-col items-center text-center p-8 max-w-md animate-in fade-in zoom-in duration-500">
                                <div className="w-20 h-20 bg-brand-500 rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-brand-500/50">
                                    <Lock size={40} className="text-white" />
                                </div>
                                <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Unlock Full Builder</h2>
                                <p className="text-gray-300 mb-8 text-lg">
                                    Purchase this product to access the interactive 3D customization tool and export your designs.
                                </p>
                                <button
                                    onClick={() => {
                                        // Navigate to product page or trigger purchase modal
                                        // For now, let's assume we go back to product page to buy
                                        onBack();
                                    }}
                                    className="px-8 py-4 bg-white text-black rounded-full font-bold text-lg hover:scale-105 transition-transform flex items-center gap-3 shadow-xl"
                                >
                                    <ShoppingCart size={24} />
                                    Buy Now
                                </button>
                            </div>
                        </div>
                    )}

                    <Scene
                        pose={pose}
                        hat={getSelection('hats')}
                        shoes={getSelection('shoes')}
                        clothes={getSelection('clothes')}
                        allSelections={selections}
                        selectedVariations={selectedVariations}
                        cameraView={cameraView}
                        background={background}
                    />
                </div>

                {/* Bottom Floating Controls */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 pointer-events-none z-10 w-full max-w-lg px-4">

                    {/* Camera, Pose & Background Controls */}
                    <div className="flex items-center gap-2 p-1.5 bg-black/40 backdrop-blur-xl rounded-full border border-white/10 pointer-events-auto shadow-lg">
                        <button
                            onClick={() => setCameraView('head')}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${cameraView === 'head' ? 'bg-brand-500 text-white' : 'text-white/70 hover:bg-white/10'}`}
                        >
                            Head
                        </button>
                        <button
                            onClick={() => setCameraView('default')}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${cameraView === 'default' ? 'bg-brand-500 text-white' : 'text-white/70 hover:bg-white/10'}`}
                        >
                            Full
                        </button>
                        <button
                            onClick={() => setCameraView('feet')}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${cameraView === 'feet' ? 'bg-brand-500 text-white' : 'text-white/70 hover:bg-white/10'}`}
                        >
                            Feet
                        </button>

                        <div className="w-px h-4 bg-white/20 mx-1"></div>

                        <select
                            value={pose}
                            onChange={(e) => setPose(e.target.value)}
                            className="bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer [&>option]:text-black"
                            title="Pose"
                        >
                            <option value="idle">Idle</option>
                            <option value="run">Run</option>
                            <option value="jump">Jump</option>
                            <option value="wave">Wave</option>
                            <option value="dance">Dance</option>
                        </select>

                        <div className="w-px h-4 bg-white/20 mx-1"></div>

                        <select
                            value={background}
                            onChange={(e) => setBackground(e.target.value)}
                            className="bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer [&>option]:text-black"
                            title="Background"
                        >
                            <option value="gradient">Dark</option>
                            <option value="light">Light</option>
                            <option value="dark">Black</option>
                        </select>
                    </div>

                    {/* Navigation Hints */}
                    <div className="flex items-center gap-6 text-white/50 text-[10px] font-medium uppercase tracking-widest">
                        <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse"></span> Drag to Rotate</span>
                        <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span> Scroll to Zoom</span>
                    </div>
                </div>
            </div>

            {/* Right: Customization Panel */}
            <div className={`
                fixed md:relative bottom-0 right-0 w-full md:w-[400px] 
                flex flex-col bg-white/95 dark:bg-dark-surface/95 backdrop-blur-xl
                border-t md:border-t-0 md:border-l border-gray-200 dark:border-dark-border 
                shadow-2xl z-20 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
                ${isSidebarOpen ? 'translate-y-0 md:translate-x-0' : 'translate-y-full md:translate-x-full'}
                h-[60vh] md:h-full rounded-t-3xl md:rounded-none
            `}>

                {/* Header */}
                <div className="p-6 border-b border-gray-200 dark:border-dark-border flex justify-between items-center bg-white/50 dark:bg-dark-surface/50 backdrop-blur-md sticky top-0 z-10">
                    <div>
                        <h1 className="text-xl font-black text-gray-900 dark:text-dark-text-primary tracking-tight">Builder</h1>
                        <p className="text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">Custom Edition</p>
                    </div>
                    <button
                        onClick={handleRandomize}
                        className="p-2 text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg transition-colors flex items-center gap-2 text-sm font-bold group"
                        title="Randomize All"
                    >
                        <Shuffle size={16} className="group-hover:rotate-180 transition-transform duration-500" />
                        <span className="hidden sm:inline">Randomize</span>
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex p-2 gap-2 overflow-x-auto border-b border-gray-200 dark:border-dark-border no-scrollbar bg-gray-50/50 dark:bg-dark-bg/50">
                    {isLoading ? (
                        <div className="w-full flex justify-center py-4">
                            <Loader2 className="animate-spin text-brand-500" size={20} />
                        </div>
                    ) : (
                        categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveTab(cat.slug)}
                                className={`
                                    px-4 py-2 rounded-lg text-sm font-bold capitalize whitespace-nowrap transition-all flex-shrink-0
                                    ${activeTab === cat.slug
                                        ? 'bg-white dark:bg-dark-surface text-brand-600 dark:text-brand-400 shadow-sm ring-1 ring-gray-200 dark:ring-dark-border scale-105'
                                        : 'text-gray-500 hover:bg-gray-200/50 dark:hover:bg-dark-surface dark:text-dark-text-secondary'}
                                `}
                            >
                                {cat.name}
                            </button>
                        ))
                    )}
                </div>

                {/* Content Area */}
                <div className="flex-grow overflow-y-auto p-6 custom-scrollbar bg-gray-50 dark:bg-dark-bg relative">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                {categories.find(c => c.slug === activeTab)?.name || 'Select Category'}
                                <ChevronRight size={12} />
                            </h3>
                            <span className="text-xs font-medium bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">
                                {assets.filter(a => a.categorySlug === activeTab).length}
                            </span>
                        </div>

                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
                                <Loader2 className="animate-spin text-brand-500" size={32} />
                                <p className="text-sm font-medium">Loading assets...</p>
                            </div>
                        ) : (
                            renderAssetGrid()
                        )}
                    </div>
                </div>

                {/* Bottom Navigation & Actions */}
                <div className="p-4 border-t border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface flex flex-col gap-3">

                    {/* Category Navigation */}
                    <div className="flex justify-between items-center gap-2 mb-2">
                        <button
                            onClick={handlePrevCategory}
                            disabled={categories.findIndex(c => c.slug === activeTab) <= 0}
                            className="px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-border text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-bg disabled:opacity-30"
                        >
                            Prev Category
                        </button>
                        <button
                            onClick={handleNextCategory}
                            disabled={categories.findIndex(c => c.slug === activeTab) >= categories.length - 1}
                            className="px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-border text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-bg disabled:opacity-30"
                        >
                            Next Category
                        </button>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={handleReset}
                            className="p-3 rounded-xl border border-gray-200 dark:border-dark-border text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-bg transition-colors flex flex-col items-center justify-center gap-1 min-w-[70px] group"
                            title="Reset All"
                        >
                            <RotateCcw size={18} className="group-hover:-rotate-180 transition-transform duration-500" />
                            <span className="text-[10px] font-bold uppercase">Reset</span>
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex-grow py-3 px-6 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold shadow-lg shadow-brand-500/30 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed group"
                        >
                            {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} className="group-hover:scale-110 transition-transform" />}
                            <span>{isSaving ? 'Saving...' : 'Save Design'}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
