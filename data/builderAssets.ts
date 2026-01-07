import { BuilderAsset } from '../types';

export const BUILDER_ASSETS = {
    poses: [
        { id: 'idle', name: 'Idle', categoryId: 'cat_poses', categorySlug: 'poses', modelUrl: '' },
        { id: 'run', name: 'Run', categoryId: 'cat_poses', categorySlug: 'poses', modelUrl: '' },
        { id: 'jump', name: 'Jump', categoryId: 'cat_poses', categorySlug: 'poses', modelUrl: '' },
        { id: 'wave', name: 'Wave', categoryId: 'cat_poses', categorySlug: 'poses', modelUrl: '' },
        { id: 'dance', name: 'Dance', categoryId: 'cat_poses', categorySlug: 'poses', modelUrl: '' },
    ] as BuilderAsset[],
    hats: [
        { id: 'none', name: 'No Hat', categoryId: 'cat_hats', categorySlug: 'hats', modelUrl: '' },
        { id: 'cap', name: 'Baseball Cap', categoryId: 'cat_hats', categorySlug: 'hats', modelUrl: '', color: '#ff0000' },
        { id: 'beanie', name: 'Beanie', categoryId: 'cat_hats', categorySlug: 'hats', modelUrl: '', color: '#00ff00' },
        { id: 'tophat', name: 'Top Hat', categoryId: 'cat_hats', categorySlug: 'hats', modelUrl: '', color: '#0000ff' },
        { id: 'cowboy', name: 'Cowboy Hat', categoryId: 'cat_hats', categorySlug: 'hats', modelUrl: '', color: '#8B4513' },
        { id: 'helmet', name: 'Viking Helmet', categoryId: 'cat_hats', categorySlug: 'hats', modelUrl: '', color: '#C0C0C0' },
        { id: 'crown', name: 'Crown', categoryId: 'cat_hats', categorySlug: 'hats', modelUrl: '', color: '#FFD700' },
    ] as BuilderAsset[],
    shoes: [
        { id: 'none', name: 'Barefoot', categoryId: 'cat_shoes', categorySlug: 'shoes', modelUrl: '' },
        { id: 'sneakers', name: 'Sneakers', categoryId: 'cat_shoes', categorySlug: 'shoes', modelUrl: '', color: '#ffffff' },
        { id: 'boots', name: 'Boots', categoryId: 'cat_shoes', categorySlug: 'shoes', modelUrl: '', color: '#000000' },
        { id: 'sandals', name: 'Sandals', categoryId: 'cat_shoes', categorySlug: 'shoes', modelUrl: '', color: '#8B4513' },
        { id: 'heels', name: 'High Heels', categoryId: 'cat_shoes', categorySlug: 'shoes', modelUrl: '', color: '#ff00ff' },
    ] as BuilderAsset[],
    clothes: [
        { id: 'basic', name: 'Basic Tee', categoryId: 'cat_clothes', categorySlug: 'clothes', modelUrl: '', color: '#808080' },
        { id: 'suit', name: 'Business Suit', categoryId: 'cat_clothes', categorySlug: 'clothes', modelUrl: '', color: '#000080' },
        { id: 'dress', name: 'Summer Dress', categoryId: 'cat_clothes', categorySlug: 'clothes', modelUrl: '', color: '#FF69B4' },
        { id: 'armor', name: 'Plate Armor', categoryId: 'cat_clothes', categorySlug: 'clothes', modelUrl: '', color: '#C0C0C0' },
        { id: 'robe', name: 'Wizard Robe', categoryId: 'cat_clothes', categorySlug: 'clothes', modelUrl: '', color: '#4B0082' },
        { id: 'hoodie', name: 'Street Hoodie', categoryId: 'cat_clothes', categorySlug: 'clothes', modelUrl: '', color: '#333333' },
        { id: 'uniform', name: 'Uniform', categoryId: 'cat_clothes', categorySlug: 'clothes', modelUrl: '', color: '#006400' },
        { id: 'pjs', name: 'Pajamas', categoryId: 'cat_clothes', categorySlug: 'clothes', modelUrl: '', color: '#ADD8E6' },
        { id: 'sport', name: 'Sportswear', categoryId: 'cat_clothes', categorySlug: 'clothes', modelUrl: '', color: '#FF4500' },
    ] as BuilderAsset[],
};
