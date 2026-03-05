import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface PropertyModel3DProps {
    height?: number;
    width?: number;
    depth?: number;
    color?: string;
}

export default function PropertyModel3D({
    height = 5,
    width = 10,
    depth = 10,
    color = '#D4A843'
}: PropertyModel3DProps) {
    const mountRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const currentMount = mountRef.current;
        if (!currentMount) return;

        // SCENE SETUP
        const scene = new THREE.Scene();
        scene.background = new THREE.Color('#0D0F13');

        // CAMERA SETUP
        const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
        camera.position.set(15, 15, 15);
        camera.lookAt(0, 0, 0);

        // RENDERER SETUP
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
        currentMount.appendChild(renderer.domElement);

        // LIGHTING
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(10, 20, 10);
        scene.add(directionalLight);

        // PROPERTY MASSING MODEL (BOX)
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const material = new THREE.MeshPhongMaterial({ color, transparent: true, opacity: 0.8 });
        const cube = new THREE.Mesh(geometry, material);
        cube.position.y = height / 2; // Sit on ground
        scene.add(cube);

        // GROUND PLANE / GRID
        const gridHelper = new THREE.GridHelper(40, 40, '#1E2330', '#111318');
        scene.add(gridHelper);

        // ANIMATION LOOP
        const animate = () => {
            requestAnimationFrame(animate);
            cube.rotation.y += 0.005; // Subtle auto-rotation
            renderer.render(scene, camera);
        };
        animate();

        // CLEANUP
        return () => {
            if (currentMount) currentMount.removeChild(renderer.domElement);
        };
    }, [height, width, depth, color]);

    return <div ref={mountRef} style={{ width: '100%', height: '400px', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--c-border)' }} />;
}
