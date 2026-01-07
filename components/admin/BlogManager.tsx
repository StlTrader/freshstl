'use client';

import React, { useState, useEffect } from 'react';
import { BlogPost } from '../../types';
import { getPosts, createPost, updatePost, deletePost, storage, subscribeToCategories, subscribeToProducts, auth, app, uploadFile } from '../../services/firebaseService';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Plus, Edit, Trash2, Search, X, Upload, CheckCircle, Eye, Tag, Palette, Sparkles, Box } from 'lucide-react';
import { Product } from '../../types';

export default function BlogManager() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

    // Form State
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [excerpt, setExcerpt] = useState('');
    const [content, setContent] = useState('');
    const [coverImage, setCoverImage] = useState('');
    const [tags, setTags] = useState('');
    const [category, setCategory] = useState('');
    const [published, setPublished] = useState(false);
    const [authorName, setAuthorName] = useState('Admin'); // Default author
    const [uploading, setUploading] = useState(false);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const [isGeneratingBlog, setIsGeneratingBlog] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
    const [blogContext, setBlogContext] = useState('Showcase');

    // Debug State
    const [debugInfo, setDebugInfo] = useState<string>('');
    const [lastError, setLastError] = useState<string>('');
    const [currentUser, setCurrentUser] = useState<any>(null);

    useEffect(() => {
        if (auth?.currentUser) {
            setCurrentUser(auth.currentUser);
        }
        if (app) {
            setDebugInfo(`Project: ${app.options.projectId}`);
        }

        fetchPosts();
        fetchPosts();
        const unsubCat = subscribeToCategories(setCategories);
        const unsubProd = subscribeToProducts(setProducts);
        return () => {
            unsubCat();
            unsubProd();
        };
    }, []);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const data = await getPosts(false); // Fetch all posts, including drafts
            setPosts(data);
            setLastError('');
        } catch (error: any) {
            console.error("Error fetching posts:", error);
            setLastError("Error fetching posts: " + (error.message || JSON.stringify(error)));
        }
        setLoading(false);
    };

    const handleOpenModal = (post?: BlogPost) => {
        if (post) {
            setEditingPost(post);
            setTitle(post.title);
            setSlug(post.slug);
            setExcerpt(post.excerpt);
            setContent(post.content);
            setCoverImage(post.coverImage);
            setTags(post.tags.join(', '));
            setCategory(post.category || '');
            setPublished(post.published);
            setAuthorName(post.authorName);
        } else {
            setEditingPost(null);
            setTitle('');
            setSlug('');
            setExcerpt('');
            setContent('');
            setCoverImage('');
            setTags('');
            setCategory('');
            setPublished(false);
            setAuthorName('Admin');
            setSelectedProductIds([]);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingPost(null);
    };

    const generateSlug = (text: string) => {
        return text
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value);
        if (!editingPost) {
            setSlug(generateSlug(e.target.value));
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!auth?.currentUser) {
            alert("You must be logged in to upload images.");
            return;
        }

        if (!storage) {
            alert("Storage not available");
            return;
        }

        setUploading(true);
        setUploading(true);
        try {
            const path = `blog/${Date.now()}_${file.name}`;
            const url = await uploadFile(file, path);
            setCoverImage(url);
        } catch (error: any) {
            console.error("Upload failed", error);
            alert(`Image upload failed: ${error.code || error.message || error}`);
        } finally {
            setUploading(false);
        }
    };

    const handleGenerateImage = async () => {
        if (!auth?.currentUser) {
            alert("You must be logged in to generate and upload images.");
            return;
        }

        const promptText = prompt("Enter a prompt for the blog image:", title || excerpt || "A blog post cover image");
        if (!promptText) return;

        setIsGeneratingImage(true);
        try {
            const response = await fetch('/api/ai/generate-media', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: promptText }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to generate image');
            }

            if (data.images && data.images.length > 0) {
                const base64 = data.images[0];

                // Convert to Blob
                const res = await fetch(base64);
                const blob = await res.blob();
                const file = new File([blob], `generated-blog-${Date.now()}.png`, { type: "image/png" });

                // Upload to Storage
                if (!storage) throw new Error("Storage not available");

                const storageRef = ref(storage, `blog/${file.name}`);
                await uploadBytes(storageRef, file);
                const url = await getDownloadURL(storageRef);

                setCoverImage(url);
            }

        } catch (error: any) {
            console.error("Image Generation failed:", error);
            alert(`Image Generation failed: ${error.message}`);
        } finally {
            setIsGeneratingImage(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const postData = {
            title,
            slug,
            excerpt,
            content,
            coverImage,
            tags: tags.split(',').map(t => t.trim()).filter(t => t),
            category,
            published,
            authorName,
            authorId: currentUser?.uid || 'admin_user',
        };

        try {
            if (editingPost) {
                await updatePost(editingPost.id, postData);
            } else {
                await createPost(postData);
            }
            handleCloseModal();
            fetchPosts();
        } catch (error: any) {
            console.error("Error saving post:", error);
            alert("Failed to save post: " + (error.message || error));
            setLastError("Error saving post: " + (error.message || error));
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this post?")) {
            try {
                await deletePost(id);
                fetchPosts();
            } catch (error: any) {
                console.error("Error deleting post:", error);
                alert("Failed to delete post: " + (error.message || error));
                setLastError("Error deleting post: " + (error.message || error));
            }
        }
    };

    const handleGenerateBlog = async () => {
        if (selectedProductIds.length === 0) {
            alert("Please select at least one product to generate a blog post.");
            return;
        }

        setIsGeneratingBlog(true);
        try {
            const selectedProducts = products.filter(p => selectedProductIds.includes(p.id));

            const response = await fetch('/api/ai/generate-blog', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    products: selectedProducts,
                    context: blogContext
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to generate blog post');
            }

            setTitle(data.title);
            setSlug(data.slug);
            setExcerpt(data.excerpt);
            setContent(data.content);
            setTags(data.tags.join(', '));

            // If we have a generated title, try to generate an image too if one doesn't exist
            if (!coverImage) {
                // Optional: Trigger image generation automatically or let user do it
            }

        } catch (error: any) {
            console.error("Blog Generation failed:", error);
            alert(`Blog Generation failed: ${error.message}`);
        } finally {
            setIsGeneratingBlog(false);
        }
    };

    const toggleProductSelection = (productId: string) => {
        setSelectedProductIds(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    };

    const filteredPosts = posts.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary flex items-center gap-2">
                    Blog Posts
                    <span className="text-sm font-normal text-gray-500 bg-gray-100 dark:bg-dark-surface px-2 py-1 rounded-full">{posts.length}</span>
                </h2>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl transition-all shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 hover:-translate-y-0.5"
                >
                    <Plus size={20} />
                    New Post
                </button>
            </div>

            {/* Debug Info */}
            <div className="bg-gray-100 dark:bg-dark-surface p-4 rounded-lg mb-4 text-xs font-mono">
                <p><strong>Debug Info:</strong> {debugInfo}</p>
                <p><strong>User:</strong> {currentUser ? `${currentUser.email} (${currentUser.uid})` : 'Not logged in'}</p>
                {lastError && <p className="text-red-500"><strong>Last Error:</strong> {lastError}</p>}
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Search posts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl text-gray-900 dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                />
            </div>

            {/* List */}
            <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-200 dark:border-dark-border overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-dark-bg/50 text-gray-500 dark:text-dark-text-secondary uppercase text-sm font-semibold">
                            <tr>
                                <th className="px-6 py-4">Title</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">Loading posts...</td>
                                </tr>
                            ) : filteredPosts.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">No posts found.</td>
                                </tr>
                            ) : (
                                filteredPosts.map((post) => (
                                    <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-dark-bg/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900 dark:text-dark-text-primary">{post.title}</div>
                                            <div className="text-sm text-gray-500 font-mono">/{post.slug}</div>
                                            {post.category && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-gray-100 dark:bg-dark-surface text-gray-600 dark:text-dark-text-secondary mt-1 border border-gray-200 dark:border-dark-border">
                                                    {post.category}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${post.published
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${post.published ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                                                {post.published ? 'Published' : 'Draft'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-dark-text-secondary text-sm">
                                            {(() => {
                                                if (!post.createdAt) return 'Unknown';
                                                if (typeof post.createdAt === 'string') return new Date(post.createdAt).toLocaleDateString();
                                                if (typeof post.createdAt === 'number') return new Date(post.createdAt).toLocaleDateString();
                                                if (post.createdAt?.toDate) return post.createdAt.toDate().toLocaleDateString();
                                                return 'Unknown';
                                            })()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleOpenModal(post)}
                                                    className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(post.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="sticky top-0 bg-white/80 dark:bg-dark-surface/80 backdrop-blur-md border-b border-gray-200 dark:border-dark-border p-6 flex justify-between items-center z-10">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary">
                                {editingPost ? 'Edit Post' : 'New Post'}
                            </h3>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-900 dark:hover:text-dark-text-primary transition-colors p-2 hover:bg-gray-100 dark:hover:bg-dark-bg rounded-full">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-8">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 space-y-6">
                                    {/* AI Generation Section */}
                                    <div className="bg-gradient-to-br from-brand-50 to-purple-50 dark:from-brand-900/20 dark:to-purple-900/20 p-6 rounded-2xl border border-brand-100 dark:border-brand-900/50">
                                        <h4 className="font-bold text-gray-900 dark:text-dark-text-primary mb-4 flex items-center gap-2">
                                            <Sparkles size={18} className="text-brand-500" /> AI Content Generator
                                        </h4>
                                        <p className="text-sm text-gray-600 dark:text-dark-text-secondary mb-4">
                                            Select products to feature in this blog post, and let AI write the content for you.
                                        </p>

                                        <div className="mb-4">
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Post Context / Tone</label>
                                            <select
                                                value={blogContext}
                                                onChange={(e) => setBlogContext(e.target.value)}
                                                className="w-full p-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg text-sm"
                                            >
                                                <option value="Showcase">Showcase (Promotional)</option>
                                                <option value="Tutorial">Tutorial (Instructional)</option>
                                                <option value="Comparison">Comparison (Analytical)</option>
                                                <option value="News">News (Announcement)</option>
                                                <option value="Guide">Guide (Educational)</option>
                                            </select>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                            {products.map(product => (
                                                <div
                                                    key={product.id}
                                                    onClick={() => toggleProductSelection(product.id)}
                                                    className={`flex items-center gap-3 p-2 rounded-lg border cursor-pointer transition-all ${selectedProductIds.includes(product.id)
                                                        ? 'bg-brand-100 border-brand-500 dark:bg-brand-900/40 dark:border-brand-500'
                                                        : 'bg-white dark:bg-dark-bg border-gray-200 dark:border-dark-border hover:border-brand-300'
                                                        }`}
                                                >
                                                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${selectedProductIds.includes(product.id) ? 'bg-brand-500 border-brand-500' : 'border-gray-400'
                                                        }`}>
                                                        {selectedProductIds.includes(product.id) && <CheckCircle size={12} className="text-white" />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 dark:text-dark-text-primary truncate">{product.name}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={handleGenerateBlog}
                                            disabled={isGeneratingBlog || selectedProductIds.length === 0}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-600 to-purple-600 text-white rounded-lg hover:from-brand-500 hover:to-purple-500 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed font-bold text-sm"
                                        >
                                            {isGeneratingBlog ? (
                                                <>
                                                    <span className="animate-spin">✨</span> Writing your post...
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles size={16} /> Generate Blog Post
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-dark-text-secondary mb-2">Title</label>
                                        <input
                                            type="text"
                                            required
                                            value={title}
                                            onChange={handleTitleChange}
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
                                            placeholder="Enter post title..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-dark-text-secondary mb-2">Slug</label>
                                        <div className="flex items-center px-4 py-3 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl text-gray-500">
                                            <span className="mr-1">/blog/</span>
                                            <input
                                                type="text"
                                                required
                                                value={slug}
                                                onChange={(e) => setSlug(e.target.value)}
                                                className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-dark-text-primary"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-dark-text-secondary mb-2">Excerpt</label>
                                        <textarea
                                            rows={3}
                                            value={excerpt}
                                            onChange={(e) => setExcerpt(e.target.value)}
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all resize-none"
                                            placeholder="Brief summary for SEO and cards..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-dark-text-secondary mb-2">Content (Markdown)</label>
                                        <div className="relative">
                                            <textarea
                                                rows={20}
                                                required
                                                value={content}
                                                onChange={(e) => setContent(e.target.value)}
                                                className="w-full px-4 py-3 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl text-gray-900 dark:text-dark-text-primary font-mono text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
                                                placeholder="# Write your masterpiece..."
                                            />
                                            <div className="absolute top-2 right-2 text-xs text-gray-400 pointer-events-none">Markdown Supported</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="bg-gray-50 dark:bg-dark-bg/50 p-6 rounded-2xl border border-gray-200 dark:border-dark-border">
                                        <h4 className="font-bold text-gray-900 dark:text-dark-text-primary mb-4 flex items-center gap-2">
                                            <CheckCircle size={18} className="text-brand-500" /> Publishing
                                        </h4>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Status</label>
                                                <button
                                                    type="button"
                                                    onClick={() => setPublished(!published)}
                                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${published
                                                        ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400'
                                                        : 'bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-400'
                                                        }`}
                                                >
                                                    <span className="font-bold">{published ? 'Published' : 'Draft'}</span>
                                                    <div className={`w-3 h-3 rounded-full ${published ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                                                </button>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Author</label>
                                                <input
                                                    type="text"
                                                    value={authorName}
                                                    onChange={(e) => setAuthorName(e.target.value)}
                                                    className="w-full px-4 py-2 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg text-gray-900 dark:text-dark-text-primary focus:border-brand-500 outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 dark:bg-dark-bg/50 p-6 rounded-2xl border border-gray-200 dark:border-dark-border">
                                        <h4 className="font-bold text-gray-900 dark:text-dark-text-primary mb-4 flex items-center gap-2">
                                            <Tag size={18} className="text-brand-500" /> Organization
                                        </h4>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Category</label>
                                                <select
                                                    value={category}
                                                    onChange={(e) => setCategory(e.target.value)}
                                                    className="w-full px-4 py-2 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg text-gray-900 dark:text-dark-text-primary focus:border-brand-500 outline-none appearance-none"
                                                >
                                                    <option value="">Select Category...</option>
                                                    {categories.map(cat => (
                                                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Tags</label>
                                                <input
                                                    type="text"
                                                    value={tags}
                                                    onChange={(e) => setTags(e.target.value)}
                                                    placeholder="tech, news, update"
                                                    className="w-full px-4 py-2 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg text-gray-900 dark:text-dark-text-primary focus:border-brand-500 outline-none"
                                                />
                                                <p className="text-xs text-gray-500 mt-1">Comma separated</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 dark:bg-dark-bg/50 p-6 rounded-2xl border border-gray-200 dark:border-dark-border">
                                        <h4 className="font-bold text-gray-900 dark:text-dark-text-primary mb-4 flex items-center gap-2">
                                            <Eye size={18} className="text-brand-500" /> Media
                                        </h4>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Cover Image</label>
                                            <div className="space-y-3">
                                                {coverImage ? (
                                                    <div className="relative aspect-video rounded-lg overflow-hidden border border-gray-200 dark:border-dark-border group">
                                                        <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                            <button
                                                                type="button"
                                                                onClick={() => setCoverImage('')}
                                                                className="text-white bg-red-600 p-2 rounded-full hover:bg-red-700"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="aspect-video rounded-lg border-2 border-dashed border-gray-300 dark:border-dark-border flex flex-col items-center justify-center text-gray-400 bg-white dark:bg-dark-surface">
                                                        <Upload size={24} className="mb-2" />
                                                        <span className="text-xs">No image selected</span>
                                                    </div>
                                                )}

                                                <label className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-bg rounded-lg cursor-pointer transition-colors text-sm font-medium text-gray-700 dark:text-dark-text-secondary">
                                                    <Upload size={16} />
                                                    <span>{uploading ? 'Uploading...' : 'Upload Image'}</span>
                                                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                                                </label>

                                                <button
                                                    type="button"
                                                    onClick={handleGenerateImage}
                                                    disabled={isGeneratingImage || uploading}
                                                    className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-lg hover:from-pink-500 hover:to-rose-500 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm font-bold"
                                                >
                                                    {isGeneratingImage ? (
                                                        <>
                                                            <span className="animate-spin">✨</span> Generating...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Palette size={16} /> Generate with AI
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-dark-border">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-6 py-3 text-gray-600 dark:text-dark-text-secondary hover:text-gray-900 dark:hover:text-dark-text-primary font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 hover:-translate-y-0.5"
                                >
                                    {editingPost ? 'Update Post' : 'Create Post'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
