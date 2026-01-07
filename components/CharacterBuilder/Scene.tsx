import React from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { Character } from './Character';
import { BuilderAsset } from '../../types';

interface SceneProps {
    pose: string;
    hat?: BuilderAsset;
    shoes?: BuilderAsset;
    clothes?: BuilderAsset;
    allSelections?: Record<string, BuilderAsset>;
    selectedVariations?: Record<string, string>;
    cameraView: 'default' | 'head' | 'feet';
    background: string;
}

const CameraController: React.FC<{ view: 'default' | 'head' | 'feet' }> = ({ view }) => {
    useFrame((state) => {
        const targetPos = new THREE.Vector3(0, 2, 6); // default
        if (view === 'head') {
            targetPos.set(0, 3, 3);
        } else if (view === 'feet') {
            targetPos.set(0, 0.5, 3);
        }

        // Smooth lerp
        state.camera.position.lerp(targetPos, 0.05);
        state.camera.lookAt(0, view === 'feet' ? 0.5 : (view === 'head' ? 2.8 : 1.5), 0);
    });
    return null;
};

export const Scene: React.FC<SceneProps> = ({ pose, hat, shoes, clothes, allSelections, selectedVariations, cameraView, background }) => {
    return (
        <Canvas shadows camera={{ position: [0, 2, 6], fov: 50 }}>
            {background === 'gradient' && <color attach="background" args={['#1a1a1a']} />}
            {background === 'light' && <color attach="background" args={['#f0f0f0']} />}
            {background === 'dark' && <color attach="background" args={['#000000']} />}

            <ambientLight intensity={0.5} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} shadow-mapSize={2048} castShadow />

            <CameraController view={cameraView} />

            <React.Suspense fallback={null}>
                <Character
                    pose={pose}
                    hat={hat}
                    shoes={shoes}
                    clothes={clothes}
                    allSelections={allSelections}
                    selectedVariations={selectedVariations}
                />
            </React.Suspense>

            <ContactShadows resolution={1024} scale={10} blur={1} opacity={0.5} far={10} color="#000000" />
            <OrbitControls minPolarAngle={Math.PI / 4} maxPolarAngle={Math.PI / 2} enablePan={false} minDistance={2} maxDistance={10} />
            <Environment preset="city" />
        </Canvas>
    );
};
