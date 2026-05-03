import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Html } from "@react-three/drei";
import { useCurrentFrame, spring, useVideoConfig } from "remotion";

const createRectShape = (width: number, height: number, radius: number = 0) => {
    const shape = new THREE.Shape();
    if (radius === 0) {
        shape.moveTo(-width / 2, -height / 2);
        shape.lineTo(width / 2, -height / 2);
        shape.lineTo(width / 2, height / 2);
        shape.lineTo(-width / 2, height / 2);
        shape.closePath();
    } else {
        const x = -width / 2, y = -height / 2;
        shape.moveTo(x, y + radius);
        shape.lineTo(x, y + height - radius);
        shape.quadraticCurveTo(x, y + height, x + radius, y + height);
        shape.lineTo(x + width - radius, y + height);
        shape.quadraticCurveTo(x + width, y + height, x + width, y + height - radius);
        shape.lineTo(x + width, y + radius);
        shape.quadraticCurveTo(x + width, y, x + width - radius, y);
        shape.lineTo(x + radius, y);
        shape.quadraticCurveTo(x, y, x, y + radius);
    }
    return shape;
};

export const BannerModel: React.FC = () => {
    const { fps } = useVideoConfig();
    const frame = useCurrentFrame();

    const entrance = spring({
        frame,
        fps,
        config: { damping: 12 }
    });

    // Shapes & Data (Kept outside map to avoid hook errors)
    const baseShape = useMemo(() => createRectShape(5.5, 9.5, 0.4), []);
    const squareShape = useMemo(() => createRectShape(1.9, 1.9, 0.1), []);
    const pillShape = useMemo(() => createRectShape(4.2, 1.3, 0.65), []);
    const icons = useMemo(() => ["♪", "○", "▶", "X"], []);

    return (
        <group
            scale={entrance}
            // ADJUSTED ROTATION: Laying flat (1.3) and angled (0.5)
            rotation={[1.3, 0, 0.5]}
            position={[0, -2.5, 0]}
        >
            {/* GROUND SHADOW - Cast slightly to the side */}
            <mesh position={[0.5, -0.9, 0.5]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[8, 12]} />
                <meshBasicMaterial color="black" transparent opacity={0.6} />
            </mesh>

            {/* 1. MAIN CARD BASE */}
            <mesh position={[0, -0.7, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <extrudeGeometry args={[baseShape, { depth: 0.6, bevelEnabled: false }]} />
                <meshBasicMaterial attach="material-0" color="#FFFFFF" />
                <meshBasicMaterial attach="material-1" color="#000000" />
            </mesh>

            {/* 2. ICON BLOCKS */}
            <group position={[-1.25, 0, -2.6]}>
                {icons.map((icon, i) => {
                    const row = Math.floor(i / 2);
                    const col = i % 2;
                    return (
                        <mesh
                            key={i}
                            position={[col * 2.5, 0, row * 2.5]}
                            rotation={[-Math.PI / 2, 0, 0]}
                        >
                            <extrudeGeometry args={[squareShape, { depth: 0.5, bevelEnabled: false }]} />
                            <meshBasicMaterial attach="material-0" color="#FFFFFF" />
                            <meshBasicMaterial attach="material-1" color="#000000" />

                            <Html transform position={[0, 0, 0.51]} style={{ pointerEvents: 'none' }}>
                                <div style={{
                                    fontSize: 70,
                                    color: 'black',
                                    fontWeight: '900',
                                    fontFamily: 'Arial Black, sans-serif'
                                }}>
                                    {icon}
                                </div>
                            </Html>
                        </mesh>
                    );
                })}
            </group>

            {/* 3. USERNAME PILL */}
            <mesh position={[0, 0, 3.2]} rotation={[-Math.PI / 2, 0, 0]}>
                <extrudeGeometry args={[pillShape, { depth: 0.6, bevelEnabled: false }]} />
                <meshBasicMaterial attach="material-0" color="#000000" />
                <meshBasicMaterial attach="material-1" color="#000000" />
                <Html transform position={[0, 0, 0.61]} style={{ width: '400px', textAlign: 'center' }}>
                    <div style={{
                        fontSize: 38,
                        color: 'white',
                        fontWeight: 'bold',
                        fontFamily: 'Arial, sans-serif',
                        letterSpacing: '1px'
                    }}>
                        @remotion
                    </div>
                </Html>
            </mesh>
        </group>
    );
};
