import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';
import { useGLTF } from '@react-three/drei';
import { BuilderAsset } from '../../types';

interface CharacterProps {
    pose: string;
    hat?: BuilderAsset;
    shoes?: BuilderAsset;
    clothes?: BuilderAsset;
    allSelections?: Record<string, BuilderAsset>;
    selectedVariations?: Record<string, string>; // assetId -> variationId
}

// Helper to render external GLB models
const AssetModel: React.FC<{ url: string; color?: string }> = ({ url, color }) => {
    const { scene } = useGLTF(url);
    // Clone scene to avoid sharing state between instances if needed
    const clone = React.useMemo(() => scene.clone(), [scene]);

    // Apply color if specified (simple override)
    // In a real app, you might want to target specific materials
    if (color) {
        clone.traverse((child: any) => {
            if (child.isMesh) {
                child.material.color.set(color);
            }
        });
    }

    return <primitive object={clone} />;
};

export const Character: React.FC<CharacterProps> = ({ pose, hat, shoes, clothes, allSelections, selectedVariations }) => {
    const groupRef = useRef<Mesh>(null);

    // Simple animation for "poses"
    useFrame((state) => {
        if (!groupRef.current) return;
        const time = state.clock.getElapsedTime();

        if (pose === 'idle') {
            groupRef.current.position.y = Math.sin(time * 2) * 0.1;
            groupRef.current.rotation.y = Math.sin(time * 0.5) * 0.1;
        } else if (pose === 'run') {
            groupRef.current.position.y = Math.abs(Math.sin(time * 10)) * 0.2;
            groupRef.current.rotation.z = Math.sin(time * 10) * 0.1;
        } else if (pose === 'jump') {
            groupRef.current.position.y = Math.abs(Math.sin(time * 3)) * 0.5;
        } else if (pose === 'wave') {
            groupRef.current.rotation.z = Math.sin(time * 5) * 0.1;
        } else if (pose === 'dance') {
            groupRef.current.position.x = Math.sin(time * 5) * 0.2;
            groupRef.current.rotation.y = time * 2;
        }
    });

    // Determine assets to render
    // Merge explicit props with allSelections for backward compatibility + new categories
    const assetsToRender = { ...allSelections };
    if (hat) assetsToRender['hats'] = hat;
    if (shoes) assetsToRender['shoes'] = shoes;
    if (clothes) assetsToRender['clothes'] = clothes;

    return (

        <group ref={groupRef as any} position={[0, -1, 0]}>
            {/* Podium */}
            <mesh position={[0, 0, 0]} receiveShadow>
                <cylinderGeometry args={[2, 2, 0.2, 64]} />
                <meshStandardMaterial color="#333" roughness={0.8} metalness={0.2} />
            </mesh>
            <mesh position={[0, 0.11, 0]} receiveShadow>
                <cylinderGeometry args={[1.8, 1.8, 0.05, 64]} />
                <meshStandardMaterial color="#111" roughness={0.5} metalness={0.8} emissive="#4f46e5" emissiveIntensity={0.2} />
            </mesh>

            {/* Character Root (Offset from podium) */}
            <group position={[0, 0.2, 0]}>
                {/* Base Body */}
                <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
                    <capsuleGeometry args={[0.5, 1.5, 4, 8]} />
                    <meshStandardMaterial color="#f0c0a0" roughness={0.3} />
                </mesh>

                {/* Head */}
                <mesh position={[0, 2.8, 0]} castShadow receiveShadow>
                    <sphereGeometry args={[0.6, 32, 32]} />
                    <meshStandardMaterial color="#f0c0a0" roughness={0.3} />
                </mesh>

                {/* Eyes */}
                <mesh position={[0.2, 2.9, 0.5]} castShadow>
                    <sphereGeometry args={[0.05, 16, 16]} />
                    <meshStandardMaterial color="black" roughness={0.1} />
                </mesh>
                <mesh position={[-0.2, 2.9, 0.5]} castShadow>
                    <sphereGeometry args={[0.05, 16, 16]} />
                    <meshStandardMaterial color="black" roughness={0.1} />
                </mesh>

                {/* Render Assets based on Category */}
                {Object.entries(assetsToRender).map(([category, asset]) => {
                    if (!asset || asset.id === 'none') return null;

                    let position: [number, number, number] = [0, 0, 0];
                    let scale: [number, number, number] = [1, 1, 1];

                    // Define positions for known categories
                    if (category === 'hats' || asset.categorySlug === 'hats') {
                        position = [0, 3.3, 0];
                    } else if (category === 'shoes' || asset.categorySlug === 'shoes') {
                        position = [0, 0, 0];
                    } else if (category === 'clothes' || asset.categorySlug === 'clothes') {
                        position = [0, 1.5, 0];
                    } else if (category === 'weapons' || asset.categorySlug === 'weapons') {
                        position = [0.8, 1.5, 0.5]; // Right hand
                        scale = [0.5, 0.5, 0.5];
                    }

                    // Handle Variations
                    let modelUrl = asset.modelUrl;
                    let color = asset.color;

                    if (selectedVariations && selectedVariations[asset.id] && asset.variations) {
                        const variation = asset.variations.find(v => v.id === selectedVariations[asset.id]);
                        if (variation) {
                            if (variation.modelUrl) modelUrl = variation.modelUrl;
                            if (variation.color) color = variation.color;
                        }
                    }

                    return (
                        <group key={asset.id} position={position} scale={scale}>
                            {modelUrl ? (
                                <React.Suspense fallback={<mesh><boxGeometry args={[0.5, 0.5, 0.5]} /><meshStandardMaterial color="gray" wireframe /></mesh>}>
                                    <AssetModel url={modelUrl} color={color} />
                                </React.Suspense>
                            ) : (
                                // Fallback for legacy hardcoded IDs (if any) or placeholders
                                <>
                                    {asset.id === 'cap' && (
                                        <mesh castShadow>
                                            <boxGeometry args={[0.8, 0.2, 1]} />
                                            <meshStandardMaterial color={color || "red"} />
                                        </mesh>
                                    )}
                                    {asset.id === 'tophat' && (
                                        <mesh castShadow position={[0, 0.3, 0]}>
                                            <cylinderGeometry args={[0.5, 0.5, 1, 32]} />
                                            <meshStandardMaterial color={color || "black"} />
                                        </mesh>
                                    )}
                                    {/* Generic Placeholder if no model and no specific ID match */}
                                    {!['cap', 'tophat'].includes(asset.id) && (
                                        <mesh castShadow>
                                            <boxGeometry args={[0.5, 0.5, 0.5]} />
                                            <meshStandardMaterial color={color || "gray"} wireframe />
                                        </mesh>
                                    )}
                                </>
                            )}
                        </group>
                    );
                })}
            </group>
        </group>
    );
};
