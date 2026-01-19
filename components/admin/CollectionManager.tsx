import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, Save, X, Image as ImageIcon, Sparkles, Search, Check } from 'lucide-react';
import { Collection, Product } from '../../types';
import * as firebaseService from '../../services/firebaseService';
import Image from 'next/image';
import { getCleanImageUrl } from '../../utils/urlHelpers';

interface CollectionManagerProps {
    products: Product[];
}

const CollectionManager: React.FC<CollectionManagerProps> = ({ products }) => {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [currentCollection, setCurrentCollection] = useState<Partial<Collection>>({
        productIds: [],
        tags: [],
        status: 'draft'
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const unsubscribe = firebaseService.subscribeToCollections(setCollections);
        return () => unsubscribe();
    }, []);

    const handleSave = async () => {
        if (!currentCollection.title) {
            alert("Title is required");
            return;
        }

        try {
            if (currentCollection.id) {
                await firebaseService.updateCollection(currentCollection.id, currentCollection);
            } else {
                await firebaseService.addCollection(currentCollection as Omit<Collection, 'id'>);
            }
            setIsEditing(false);
            setCurrentCollection({ productIds: [], tags: [], status: 'draft' });
        } catch (error) {
            console.error("Failed to save collection:", error);
            alert("Failed to save collection");
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Delete this collection?")) {
            await firebaseService.deleteCollection(id);
        }
    };

    const toggleProduct = (productId: string) => {
        const currentIds = currentCollection.productIds || [];
        const newIds = currentIds.includes(productId)
            ? currentIds.filter(id => id !== productId)
            : [...currentIds, productId];
        setCurrentCollection({ ...currentCollection, productIds: newIds });
    };

    const generateAIContent = async () => {
        if ((currentCollection.productIds?.length || 0) === 0) {
            alert("Select products first!");
            return;
        }

        setIsGeneratingAI(true);
        try {
            const selectedProducts = products.filter(p => currentCollection.productIds?.includes(p.id));
            const productNames = selectedProducts.map(p => p.name).join(', ');

            const prompt = `Create a catchy title, a compelling description (max 2 sentences), and 5 tags for a product collection containing: ${productNames}. Return JSON: { "title": "...", "description": "...", "tags": [...] }`;

            const response = await fetch('/api/ai/generate-text', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
            });

            const data = await response.json();

            if (data.error) throw new Error(data.error);

            setCurrentCollection(prev => ({
                ...prev,
                title: data.title,
                description: data.description,
                tags: data.tags
            }));
        } catch (error) {
            console.error("AI Generation failed:", error);
            alert("Failed to generate content");
        } finally {
            setIsGeneratingAI(false);
        }
    };

    const generateCollage = async () => {
        if ((currentCollection.productIds?.length || 0) === 0) {
            alert("Select products first!");
            return;
        }

        setIsGeneratingImage(true);
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        canvas.width = 1200;
        canvas.height = 630;

        // Clear
        ctx.fillStyle = '#f3f4f6';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        try {
            const selectedProducts = products.filter(p => currentCollection.productIds?.includes(p.id)).slice(0, 4);
            const images = await Promise.all(selectedProducts.map(p => {
                return new Promise<HTMLImageElement>((resolve, reject) => {
                    const img = new window.Image();
                    img.crossOrigin = "Anonymous";
                    img.onload = () => resolve(img);
                    img.onerror = (e) => {
                        console.error("Failed to load image for collage:", p.imageUrl, e);
                        reject(new Error(`Failed to load image: ${p.name}`));
                    };
                    // Append timestamp to avoid cached response without CORS headers
                    const separator = p.imageUrl.includes('?') ? '&' : '?';
                    img.src = `${p.imageUrl}${separator}t=${Date.now()}`;
                });
            }));

            // Draw grid
            const cols = 2;
            const rows = 2;
            const cellW = canvas.width / cols;
            const cellH = canvas.height / rows;

            images.forEach((img, i) => {
                const x = (i % cols) * cellW;
                const y = Math.floor(i / cols) * cellH;

                // Cover fit
                const scale = Math.max(cellW / img.width, cellH / img.height);
                const w = img.width * scale;
                const h = img.height * scale;
                const ox = (cellW - w) / 2;
                const oy = (cellH - h) / 2;

                ctx.save();
                ctx.beginPath();
                ctx.rect(x, y, cellW, cellH);
                ctx.clip();
                ctx.drawImage(img, x + ox, y + oy, w, h);
                ctx.restore();
            });

            // Convert to blob and upload
            canvas.toBlob(async (blob) => {
                if (!blob) {
                    console.error("Canvas toBlob failed: blob is null");
                    setIsGeneratingImage(false);
                    return;
                }
                console.log("Collage Blob created, size:", blob.size);

                const user = firebaseService.auth?.currentUser;
                console.log("Current User:", user?.uid);

                if (!user) {
                    alert("You must be logged in to upload images.");
                    setIsGeneratingImage(false);
                    return;
                }

                try {
                    const file = new File([blob], `collection_${Date.now()}.jpg`, { type: 'image/jpeg' });
                    const url = await firebaseService.uploadFile(file, `collections/${file.name}`);
                    console.log("Collage uploaded successfully:", url);
                    setCurrentCollection(prev => ({ ...prev, imageUrl: url }));
                } catch (error: any) {
                    console.error("Upload failed:", error);
                    const errorCode = error.code || 'unknown';
                    const errorMessage = error.message || error;
                    alert(`Failed to upload collage. Code: ${errorCode}. Message: ${errorMessage}`);
                } finally {
                    setIsGeneratingImage(false);
                }
            }, 'image/jpeg', 0.9);
        } catch (error) {
            console.error("Collage generation failed:", error);
            alert("Failed to generate collage. Ensure product images allow cross-origin access.");
            setIsGeneratingImage(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Collections</h1>
                <button
                    onClick={() => { setIsEditing(true); setCurrentCollection({ productIds: [], tags: [], status: 'draft' }); }}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
                >
                    <Plus size={20} /> New Collection
                </button>
            </div>

            {isEditing ? (
                <div className="bg-white dark:bg-dark-surface rounded-2xl p-6 border border-gray-200 dark:border-dark-border shadow-lg">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold">
                            {currentCollection.id ? 'Edit Collection' : 'New Collection'}
                        </h2>
                        <button onClick={() => setIsEditing(false)} className="text-gray-500 hover:text-gray-700">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Title</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={currentCollection.title || ''}
                                        onChange={e => setCurrentCollection({ ...currentCollection, title: e.target.value })}
                                        className="flex-1 p-2 border rounded-lg dark:bg-dark-bg dark:border-dark-border"
                                        placeholder="e.g. Summer Essentials"
                                    />
                                    <button
                                        onClick={generateAIContent}
                                        disabled={isGeneratingAI}
                                        className="p-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 disabled:opacity-50"
                                        title="Generate with AI"
                                    >
                                        <Sparkles size={20} className={isGeneratingAI ? "animate-spin" : ""} />
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea
                                    value={currentCollection.description || ''}
                                    onChange={e => setCurrentCollection({ ...currentCollection, description: e.target.value })}
                                    className="w-full p-2 border rounded-lg dark:bg-dark-bg dark:border-dark-border h-24"
                                    placeholder="Collection description..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Price (Optional Bundle Price)</label>
                                <input
                                    type="number"
                                    value={currentCollection.price || ''}
                                    onChange={e => setCurrentCollection({ ...currentCollection, price: Number(e.target.value) })}
                                    className="w-full p-2 border rounded-lg dark:bg-dark-bg dark:border-dark-border"
                                    placeholder="0.00"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Cover Image</label>
                                <div className="flex gap-2 items-start">
                                    <div className="relative w-full h-48 bg-gray-100 dark:bg-dark-bg rounded-lg overflow-hidden border border-dashed border-gray-300 flex items-center justify-center">
                                        {currentCollection.imageUrl ? (
                                            <Image src={getCleanImageUrl(currentCollection.imageUrl)} alt="Cover" fill className="object-cover" />
                                        ) : (
                                            <span className="text-gray-400">No image</span>
                                        )}
                                        <canvas ref={canvasRef} className="hidden" />
                                    </div>
                                    <button
                                        onClick={generateCollage}
                                        disabled={isGeneratingImage}
                                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 disabled:opacity-50"
                                        title="Generate Collage"
                                    >
                                        <ImageIcon size={20} className={isGeneratingImage ? "animate-spin" : ""} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="block text-sm font-medium">Select Products</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    placeholder="Search products..."
                                    className="w-full pl-10 p-2 border rounded-lg dark:bg-dark-bg dark:border-dark-border"
                                />
                            </div>
                            <div className="h-[400px] overflow-y-auto border rounded-lg dark:border-dark-border p-2 space-y-2">
                                {products
                                    .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
                                    .map(product => (
                                        <div
                                            key={product.id}
                                            onClick={() => toggleProduct(product.id)}
                                            className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${currentCollection.productIds?.includes(product.id)
                                                ? 'bg-brand-50 border-brand-200 dark:bg-brand-900/20'
                                                : 'hover:bg-gray-50 dark:hover:bg-dark-bg'
                                                }`}
                                        >
                                            <div className={`w-5 h-5 rounded border flex items-center justify-center ${currentCollection.productIds?.includes(product.id)
                                                ? 'bg-brand-500 border-brand-500 text-white'
                                                : 'border-gray-300'
                                                }`}>
                                                {currentCollection.productIds?.includes(product.id) && <Check size={14} />}
                                            </div>
                                            <div className="w-10 h-10 relative rounded overflow-hidden bg-gray-100">
                                                <Image src={getCleanImageUrl(product.imageUrl)} alt={product.name} fill className="object-cover" />
                                            </div>
                                            <span className="text-sm font-medium truncate flex-1">{product.name}</span>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-8 pt-6 border-t dark:border-dark-border">
                        <button
                            onClick={() => setIsEditing(false)}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-6 py-2 bg-brand-600 text-white font-bold rounded-lg hover:bg-brand-700 transition-colors shadow-lg shadow-brand-500/30"
                        >
                            Save Collection
                        </button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {collections.map(collection => (
                        <div key={collection.id} className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-200 dark:border-dark-border overflow-hidden group hover:shadow-lg transition-all">
                            <div className="relative h-48 bg-gray-100">
                                {collection.imageUrl ? (
                                    <Image src={getCleanImageUrl(collection.imageUrl)} alt={collection.title} fill className="object-cover" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
                                )}
                                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => { setCurrentCollection(collection); setIsEditing(true); }}
                                        className="p-2 bg-white/90 rounded-full shadow-sm hover:text-brand-600"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(collection.id)}
                                        className="p-2 bg-white/90 rounded-full shadow-sm hover:text-red-600"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="font-bold text-lg mb-1">{collection.title}</h3>
                                <p className="text-sm text-gray-500 line-clamp-2 mb-3">{collection.description}</p>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="bg-gray-100 dark:bg-dark-bg px-2 py-1 rounded text-gray-600">
                                        {collection.productIds.length} Products
                                    </span>
                                    {collection.price && (
                                        <span className="font-bold text-brand-600">${(collection.price / 100).toFixed(2)}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CollectionManager;
