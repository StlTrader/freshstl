'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Maximize, RotateCw, MousePointer2, Move, ZoomIn, Layers, Settings, Loader2, AlertCircle, Sun, Moon, RefreshCcw, Plus, Minus } from 'lucide-react';

interface SketchfabViewerProps {
    modelUrl?: string;
    color?: string;
    autoRotate?: boolean;
}

export const SketchfabViewer: React.FC<SketchfabViewerProps> = ({
    modelUrl,
    color = '#14b8a6',
    autoRotate = true
}) => {
    const mountRef = useRef<HTMLDivElement>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);
    const modelRef = useRef<THREE.Mesh | null>(null);
    const frameIdRef = useRef<number>(0);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAutoRotating, setIsAutoRotating] = useState(autoRotate);
    const [progress, setProgress] = useState(0);
    const [showGrid, setShowGrid] = useState(true);
    const [showAxes, setShowAxes] = useState(false);
    const [wireframe, setWireframe] = useState(false);

    // --- Initialization ---
    useEffect(() => {
        if (!mountRef.current) return;

        // 1. Scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x121212); // Very dark gray, almost black
        scene.fog = new THREE.FogExp2(0x121212, 0.02);
        sceneRef.current = scene;

        // 2. Camera
        const camera = new THREE.PerspectiveCamera(45, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
        camera.position.set(8, 6, 8);
        cameraRef.current = camera;

        // 3. Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.2;
        mountRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // 4. Controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.autoRotate = isAutoRotating;
        controls.autoRotateSpeed = 1.0;
        controls.minDistance = 2;
        controls.maxDistance = 50;
        controlsRef.current = controls;

        // 5. Lighting - Studio Setup
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        scene.add(ambientLight);

        const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
        mainLight.position.set(5, 10, 7);
        mainLight.castShadow = true;
        mainLight.shadow.mapSize.width = 2048;
        mainLight.shadow.mapSize.height = 2048;
        scene.add(mainLight);

        const fillLight = new THREE.DirectionalLight(0x9090ff, 0.8);
        fillLight.position.set(-5, 0, -5);
        scene.add(fillLight);

        const backLight = new THREE.SpotLight(0xffffff, 1.0);
        backLight.position.set(0, 5, -10);
        scene.add(backLight);

        // 6. Helpers
        const gridHelper = new THREE.GridHelper(30, 60, 0x444444, 0x222222);
        (gridHelper.material as THREE.Material).transparent = true;
        (gridHelper.material as THREE.Material).opacity = 0.2;
        scene.add(gridHelper);

        const axesHelper = new THREE.AxesHelper(2);
        axesHelper.visible = false;
        scene.add(axesHelper);

        // 7. Animation Loop
        const animate = () => {
            frameIdRef.current = requestAnimationFrame(animate);
            if (controlsRef.current) controlsRef.current.update();
            if (rendererRef.current && sceneRef.current && cameraRef.current) {
                rendererRef.current.render(sceneRef.current, cameraRef.current);
            }
        };
        animate();

        // 8. Resize Handler
        // 8. Resize Handler
        const handleResize = () => {
            if (!mountRef.current || !cameraRef.current || !rendererRef.current) return;
            const width = mountRef.current.clientWidth;
            const height = mountRef.current.clientHeight;

            if (width === 0 || height === 0) return;

            cameraRef.current.aspect = width / height;
            cameraRef.current.updateProjectionMatrix();
            rendererRef.current.setSize(width, height);
        };

        // Use ResizeObserver for more robust resizing (handles container resize, not just window)
        const resizeObserver = new ResizeObserver(() => {
            handleResize();
        });

        resizeObserver.observe(mountRef.current);

        // Initial resize check
        handleResize();

        // Cleanup
        return () => {
            resizeObserver.disconnect();
            cancelAnimationFrame(frameIdRef.current);
            if (mountRef.current && rendererRef.current) {
                mountRef.current.removeChild(rendererRef.current.domElement);
            }
            renderer.dispose();
        };
    }, []);

    // --- Model Loading ---
    // --- Model Loading ---
    useEffect(() => {
        if (!sceneRef.current) return;

        let isMounted = true;

        const loadModel = () => {
            setIsLoading(true);
            setError(null);
            setProgress(0);

            // Cleanup old model
            if (modelRef.current) {
                sceneRef.current?.remove(modelRef.current);
                modelRef.current.geometry.dispose();
                if (modelRef.current.material instanceof THREE.Material) {
                    modelRef.current.material.dispose();
                }
                modelRef.current = null;
            }

            const material = new THREE.MeshStandardMaterial({
                color: color,
                metalness: 0.3,
                roughness: 0.4,
                side: THREE.DoubleSide,
                wireframe: wireframe
            });

            if (!modelUrl) {
                loadFallback(material);
                return;
            }

            // Cache busting
            const cacheBuster = `?t=${Date.now()}`;
            const finalUrl = modelUrl.includes('?') ? `${modelUrl}&t=${Date.now()}` : `${modelUrl}${cacheBuster}`;
            console.log("Loading Model from:", finalUrl);

            const isGLB = finalUrl.toLowerCase().includes('.glb') || finalUrl.toLowerCase().includes('.gltf');

            if (isGLB) {
                const loader = new GLTFLoader();
                loader.load(
                    finalUrl,
                    (gltf) => {
                        if (!isMounted) return;
                        const model = gltf.scene;

                        // Ensure matrices are updated for accurate BBox
                        model.updateMatrixWorld(true);

                        // Center and Scale
                        const bbox = new THREE.Box3().setFromObject(model);
                        const size = new THREE.Vector3();
                        bbox.getSize(size);
                        const maxDim = Math.max(size.x, size.y, size.z);

                        if (maxDim > 0) {
                            const scale = 5 / maxDim;
                            model.scale.set(scale, scale, scale);

                            // Re-center after scaling
                            model.updateMatrixWorld(true); // Update again after scale
                            const newBbox = new THREE.Box3().setFromObject(model);
                            const center = new THREE.Vector3();
                            newBbox.getCenter(center);
                            model.position.sub(center);
                            model.position.y += (size.y * scale) / 2; // Sit on grid
                        }

                        model.traverse((child) => {
                            if ((child as THREE.Mesh).isMesh) {
                                child.castShadow = true;
                                child.receiveShadow = true;
                                // Force DoubleSide to prevent invisible backfaces
                                if ((child as THREE.Mesh).material) {
                                    const mats = (Array.isArray((child as THREE.Mesh).material)
                                        ? (child as THREE.Mesh).material
                                        : [(child as THREE.Mesh).material]) as THREE.Material[];

                                    mats.forEach((m: any) => {
                                        m.side = THREE.DoubleSide;
                                        if (m.map) m.map.colorSpace = THREE.SRGBColorSpace;
                                    });
                                }
                            }
                        });

                        sceneRef.current?.add(model);
                        modelRef.current = model as unknown as THREE.Mesh;
                        setIsLoading(false);

                        // Fit camera to model
                        setTimeout(fitCamera, 100);
                    },
                    (xhr) => {
                        if (!isMounted) return;
                        if (xhr.total > 0) {
                            setProgress(Math.round((xhr.loaded / xhr.total) * 100));
                        }
                    },
                    (err) => {
                        if (!isMounted) return;
                        console.error("GLB Load Error:", err);
                        setError("Failed to load GLB model.");
                        loadFallback(material);
                    }
                );
            } else {
                // STL Loader
                const loader = new STLLoader();
                loader.load(
                    finalUrl,
                    (geometry: THREE.BufferGeometry) => {
                        if (!isMounted) return;
                        if (!geometry.attributes.normal) {
                            geometry.computeVertexNormals();
                        }

                        // Center and Scale
                        geometry.center();
                        geometry.computeBoundingBox();
                        const bbox = geometry.boundingBox!;
                        const size = new THREE.Vector3();
                        bbox.getSize(size);
                        const maxDim = Math.max(size.x, size.y, size.z);

                        if (maxDim > 0) {
                            const scale = 5 / maxDim;
                            geometry.scale(scale, scale, scale);
                            geometry.translate(0, (size.y * scale) / 2, 0); // Sit on grid
                        }

                        const mesh = new THREE.Mesh(geometry, material);
                        mesh.castShadow = true;
                        mesh.receiveShadow = true;

                        sceneRef.current?.add(mesh);
                        modelRef.current = mesh;
                        setIsLoading(false);

                        // Fit camera to model
                        setTimeout(fitCamera, 100);
                    },
                    (xhr: ProgressEvent) => {
                        if (!isMounted) return;
                        if (xhr.total > 0) {
                            setProgress(Math.round((xhr.loaded / xhr.total) * 100));
                        }
                    },
                    (err: unknown) => {
                        if (!isMounted) return;
                        console.error("STL Load Error:", err);
                        let msg = "Failed to load model.";
                        if (err instanceof ProgressEvent) {
                            msg = "Network Error: Could not fetch file (CORS or 404).";
                        } else if (err instanceof Error) {
                            msg = err.message;
                        }
                        setError(msg);
                        loadFallback(material);
                    }
                );
            }
        };

        const loadFallback = (material: THREE.Material) => {
            if (!isMounted) return;
            const geometry = new THREE.TorusKnotGeometry(1.5, 0.5, 100, 16);
            geometry.translate(0, 2, 0);
            const mesh = new THREE.Mesh(geometry, material);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            sceneRef.current?.add(mesh);
            modelRef.current = mesh;
            setIsLoading(false);
            if (!modelUrl) setError("No model URL provided (Showing Placeholder)");
            setTimeout(fitCamera, 100);
        };

        loadModel();

        return () => {
            isMounted = false;
        };
    }, [modelUrl, color, wireframe]); // Re-run if these change

    // --- Updates ---
    useEffect(() => {
        if (controlsRef.current) {
            controlsRef.current.autoRotate = isAutoRotating;
        }
    }, [isAutoRotating]);

    useEffect(() => {
        if (modelRef.current && modelRef.current.material instanceof THREE.MeshStandardMaterial) {
            modelRef.current.material.color.set(color);
            modelRef.current.material.wireframe = wireframe;
            modelRef.current.material.needsUpdate = true;
        }
    }, [color, wireframe]);

    useEffect(() => {
        // Toggle helpers
        if (sceneRef.current) {
            const grid = sceneRef.current.children.find(c => c instanceof THREE.GridHelper);
            if (grid) grid.visible = showGrid;

            const axes = sceneRef.current.children.find(c => c instanceof THREE.AxesHelper);
            if (axes) axes.visible = showAxes;
        }
    }, [showGrid, showAxes]);

    // --- Handlers ---
    const fitCamera = () => {
        if (!cameraRef.current || !controlsRef.current || !modelRef.current) return;

        const box = new THREE.Box3().setFromObject(modelRef.current);
        const size = new THREE.Vector3();
        box.getSize(size);
        const center = new THREE.Vector3();
        box.getCenter(center);

        const maxSize = Math.max(size.x, size.y, size.z);
        const fitHeightDistance = maxSize / (2 * Math.atan(Math.PI * cameraRef.current.fov / 360));
        const fitWidthDistance = fitHeightDistance / cameraRef.current.aspect;
        const distance = 2.0 * Math.max(fitHeightDistance, fitWidthDistance); // 2.0x margin for better view

        const direction = new THREE.Vector3(1, 0.5, 1).normalize(); // Nice isometric angle

        controlsRef.current.maxDistance = distance * 10;
        controlsRef.current.target.copy(center);

        cameraRef.current.near = distance / 100;
        cameraRef.current.far = distance * 100;
        cameraRef.current.updateProjectionMatrix();

        cameraRef.current.position.copy(center).add(direction.multiplyScalar(distance));
        controlsRef.current.update();
    };

    const handleFullscreen = () => {
        if (!mountRef.current) return;
        if (!document.fullscreenElement) {
            mountRef.current.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    const handleResetView = () => {
        fitCamera();
    };

    const [bgMode, setBgMode] = useState<'dark' | 'light'>('dark');
    const toggleBackground = () => {
        const newMode = bgMode === 'dark' ? 'light' : 'dark';
        setBgMode(newMode);
        if (sceneRef.current) {
            sceneRef.current.background = new THREE.Color(newMode === 'dark' ? 0x121212 : 0xf0f0f0);
            sceneRef.current.fog = new THREE.FogExp2(newMode === 'dark' ? 0x121212 : 0xf0f0f0, 0.02);
        }
    };

    const handleZoom = (delta: number) => {
        if (cameraRef.current) {
            const zoomFactor = 1 + delta * 0.1;
            cameraRef.current.position.multiplyScalar(1 / zoomFactor);
            cameraRef.current.updateProjectionMatrix();
        }
    };

    return (
        <div ref={mountRef} className="relative w-full h-full bg-[#121212] group select-none overflow-hidden rounded-xl">
            {/* Renderer is appended here by useEffect */}

            {/* Loading Overlay */}
            {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#121212] z-50">
                    <Loader2 className="w-10 h-10 text-brand-500 animate-spin mb-4" />
                    <div className="w-48 h-1 bg-gray-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-brand-500 transition-all duration-300 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <p className="text-gray-400 text-xs mt-2 font-mono">LOADING MODEL {progress}%</p>
                </div>
            )}

            {/* Error Overlay */}
            {error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#121212] z-50">
                    <AlertCircle className="w-10 h-10 text-red-500 mb-4" />
                    <p className="text-white font-bold">Failed to Load Model</p>
                    <p className="text-gray-500 text-sm">{error}</p>
                </div>
            )}

            {/* Top Right Tools */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
                <button
                    onClick={handleFullscreen}
                    className="p-2 rounded-lg backdrop-blur-md bg-black/40 text-gray-400 hover:bg-black/60 hover:text-white transition-colors"
                    title="Fullscreen"
                >
                    <Maximize size={20} />
                </button>
                <button
                    onClick={toggleBackground}
                    className="p-2 rounded-lg backdrop-blur-md bg-black/40 text-gray-400 hover:bg-black/60 hover:text-white transition-colors"
                    title={bgMode === 'dark' ? "Light Mode" : "Dark Mode"}
                >
                    {bgMode === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <button
                    onClick={handleResetView}
                    className="p-2 rounded-lg backdrop-blur-md bg-black/40 text-gray-400 hover:bg-black/60 hover:text-white transition-colors"
                    title="Reset View"
                >
                    <RefreshCcw size={20} />
                </button>
            </div>

            {/* Top Left Tools (Toggles) */}
            <div className="absolute top-4 left-4 flex gap-2">
                <button
                    onClick={() => setShowGrid(!showGrid)}
                    className={`p-2 rounded-lg backdrop-blur-md transition-colors ${showGrid ? 'bg-brand-500/20 text-brand-400' : 'bg-black/40 text-gray-400 hover:bg-black/60'}`}
                    title="Toggle Grid"
                >
                    <Layers size={20} />
                </button>
                <button
                    onClick={() => setWireframe(!wireframe)}
                    className={`p-2 rounded-lg backdrop-blur-md transition-colors ${wireframe ? 'bg-brand-500/20 text-brand-400' : 'bg-black/40 text-gray-400 hover:bg-black/60'}`}
                    title="Toggle Wireframe"
                >
                    <Settings size={20} />
                </button>
                <button
                    onClick={() => setShowAxes(!showAxes)}
                    className={`p-2 rounded-lg backdrop-blur-md transition-colors ${showAxes ? 'bg-brand-500/20 text-brand-400' : 'bg-black/40 text-gray-400 hover:bg-black/60'}`}
                    title="Toggle Axes"
                >
                    <Move size={20} />
                </button>
            </div>

            {/* Right Side Zoom Controls */}
            <div className="absolute top-1/2 right-4 -translate-y-1/2 flex flex-col gap-2">
                <button
                    onClick={() => handleZoom(1)}
                    className="p-2 rounded-lg backdrop-blur-md bg-black/40 text-gray-400 hover:bg-black/60 hover:text-white transition-colors"
                    title="Zoom In"
                >
                    <Plus size={20} />
                </button>
                <button
                    onClick={() => handleZoom(-1)}
                    className="p-2 rounded-lg backdrop-blur-md bg-black/40 text-gray-400 hover:bg-black/60 hover:text-white transition-colors"
                    title="Zoom Out"
                >
                    <Minus size={20} />
                </button>
            </div>

            {/* Bottom Bar - Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
                <div className="flex items-center justify-between pointer-events-auto">

                    <div className="hidden sm:flex gap-4 text-gray-400 text-xs font-medium">
                        <div className="flex items-center gap-1.5">
                            <MousePointer2 size={14} className="text-brand-500" />
                            <span>Rotate</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Move size={14} className="text-brand-500" />
                            <span>Pan (Right Click)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <ZoomIn size={14} className="text-brand-500" />
                            <span>Zoom</span>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsAutoRotating(!isAutoRotating)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${isAutoRotating ? 'bg-brand-600 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                    >
                        <RotateCw size={14} className={isAutoRotating ? 'animate-spin' : ''} />
                        {isAutoRotating ? 'Auto-Rotate ON' : 'Auto-Rotate OFF'}
                    </button>
                </div>
            </div>
        </div>
    );
};
