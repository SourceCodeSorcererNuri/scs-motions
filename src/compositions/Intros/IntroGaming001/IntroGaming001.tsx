import React, { useMemo, useRef, useEffect, useState } from 'react';
import { interpolate, useCurrentFrame, useVideoConfig, AbsoluteFill, spring, continueRender, delayRender } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { z } from 'zod';
import * as THREE from 'three';
import { PerspectiveCamera } from '@react-three/drei';

export const GamingIntroSchema = z.object({
    neonColor: z.string(),
    sunColor: z.string(),
    title: z.string(),
    speed: z.number(),
});

// --- HELPER: BUILDING TEXTURE ---
const createBuildingTexture = (color: string) => {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 64; canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.fillStyle = '#050508';
    ctx.fillRect(0, 0, 64, 128);
    ctx.fillStyle = color;
    for (let y = 0; y < 20; y++) {
        for (let x = 0; x < 4; x++) {
            if (Math.random() > 0.4) {
                ctx.globalAlpha = Math.random() * 0.9 + 0.1;
                ctx.fillRect(x * 16 + 2, y * 6 + 2, 12, 2);
            }
        }
    }
    return new THREE.CanvasTexture(canvas);
};

// --- SCENE COMPONENTS ---
const RetroCyberSun = ({ color }: { color: string }) => (
    <group position={[0, 35, -350]}>
        <mesh>
            <circleGeometry args={[110, 64]} />
            <meshBasicMaterial color={color} transparent opacity={0.9} />
        </mesh>
        {[...Array(18)].map((_, i) => (
            <mesh key={i} position={[0, -80 + i * 7, 1]}>
                <planeGeometry args={[250, 2 + i * 0.4]} />
                <meshBasicMaterial color="#020205" />
            </mesh>
        ))}
    </group>
);

const InstancedCity = ({ chunkOffset, layout, color, texture, growth }: any) => {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const wireRef = useRef<THREE.InstancedMesh>(null);
    const tmpMatrix = useMemo(() => new THREE.Matrix4(), []);

    useEffect(() => {
        if (!meshRef.current || !wireRef.current) return;
        layout.forEach((b: any, i: number) => {
            const currentHeight = Math.max(0.1, b.h * growth);
            tmpMatrix.makeTranslation(b.x, currentHeight / 2, b.z + chunkOffset);
            tmpMatrix.scale(new THREE.Vector3(1, currentHeight, 1));
            meshRef.current?.setMatrixAt(i, tmpMatrix);
            wireRef.current?.setMatrixAt(i, tmpMatrix);
        });
        meshRef.current.instanceMatrix.needsUpdate = true;
        wireRef.current.instanceMatrix.needsUpdate = true;
        meshRef.current.computeBoundingSphere();
        wireRef.current.computeBoundingSphere();
    }, [layout, chunkOffset, tmpMatrix, growth]);

    return (
        <group>
            <instancedMesh ref={meshRef} args={[null as any, null as any, layout.length]} frustumCulled={false}>
                <boxGeometry args={[5, 1, 5]} />
                <meshStandardMaterial color="#08080c" emissive={color} emissiveMap={texture || undefined} emissiveIntensity={6} />
            </instancedMesh>
            <instancedMesh ref={wireRef} args={[null as any, null as any, layout.length]} frustumCulled={false}>
                <boxGeometry args={[5.1, 1, 5.1]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={12} wireframe transparent opacity={0.3} />
            </instancedMesh>
        </group>
    );
};

const Scene: React.FC<z.infer<typeof GamingIntroSchema> & { growth: number }> = ({ neonColor, sunColor, speed, growth }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const winTex = useMemo(() => createBuildingTexture(neonColor), [neonColor]);
    const chunkLength = 300;
    const translation = (frame * speed / fps) % chunkLength;

    const buildingLayout = useMemo(() => {
        const b = [];
        for (let i = -15; i < 15; i++) {
            if (Math.abs(i) < 4) continue;
            for (let j = 0; j < 12; j++) {
                const seed = Math.abs(i * 133 + j * 77);
                b.push({ x: i * 12, z: -j * 25, h: (seed % 80) + 20 });
            }
        }
        return b;
    }, []);

    return (
        <>
            <PerspectiveCamera makeDefault position={[0, 30, 30]} fov={70} far={5000} />
            <fogExp2 attach="fog" args={['#020205', 0.002]} />
            <pointLight position={[0, 100, -200]} intensity={150} color={neonColor} />
            <RetroCyberSun color={sunColor} />
            <group position={[0, 0, translation]}>
                <InstancedCity growth={growth} chunkOffset={0} layout={buildingLayout} color={neonColor} texture={winTex} />
                <InstancedCity growth={growth} chunkOffset={-chunkLength} layout={buildingLayout} color={neonColor} texture={winTex} />
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, -chunkLength]}>
                    <planeGeometry args={[5000, 5000]} />
                    <meshStandardMaterial color="#020205" roughness={0.05} metalness={1} />
                </mesh>
                <gridHelper args={[2000, 100, neonColor, '#111111']} position={[0, 0, -chunkLength / 2]}>
                    <meshStandardMaterial attach="material" color={neonColor} emissive={neonColor} emissiveIntensity={5} />
                </gridHelper>
            </group>
        </>
    );
};

// --- UNIQUE CLEAN GAME UI TITLE ---
const CyberGameTitle: React.FC<{ title: string; neonColor: string; progress: number }> = ({ title, neonColor, progress }) => {
    const frame = useCurrentFrame();
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*";

    // Scramble effect during intro/outro
    const scrambled = useMemo(() => {
        return title.split('').map((char, i) => {
            if (progress > 0.9) return char;
            const seed = Math.floor(frame / 2) + i;
            return chars[seed % chars.length];
        }).join('');
    }, [frame, title, progress]);

    return (
        <div style={{ position: 'relative', textAlign: 'center', opacity: interpolate(progress, [0.4, 0.6], [0, 1]) }}>
            {/* Top accent line */}
            <div style={{ width: interpolate(progress, [0.5, 1], [0, 100]) + '%', height: '2px', background: neonColor, margin: '0 auto' }} />

            <h1 style={{
                fontSize: '90px',
                fontWeight: 900,
                color: 'white',
                margin: '10px 0',
                letterSpacing: '8px',
                textShadow: `0 0 20px ${neonColor}`,
                fontFamily: 'monospace',
                textTransform: 'uppercase'
            }}>
                {scrambled}
            </h1>

            {/* Bottom accent line with "brackets" */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <div style={{ width: '40px', height: '4px', background: neonColor }} />
                <div style={{ flex: 1, maxWidth: '300px', height: '1px', background: `${neonColor}88` }} />
                <div style={{ width: '40px', height: '4px', background: neonColor }} />
            </div>
        </div>
    );
};

export const GamingIntro001: React.FC<z.infer<typeof GamingIntroSchema>> = ({
    neonColor = '#00f2ff',
    sunColor = '#39ff14',
    title = 'LEVEL_UP',
    speed = 120,
}) => {
    const frame = useCurrentFrame();
    const { width, height, fps, durationInFrames } = useVideoConfig();

    const transitionFrames = 60;
    const isOutPhase = frame > durationInFrames - transitionFrames;
    const progress = spring({
        frame: isOutPhase ? durationInFrames - frame : frame,
        fps,
        config: { damping: 12, stiffness: 100 },
        durationInFrames: transitionFrames,
    });

    const typeText = (text: string, p: number) => {
        const count = Math.floor(interpolate(p, [0.4, 1], [0, text.length], { extrapolateLeft: 'clamp' }));
        return text.slice(0, count);
    };

    return (
        <AbsoluteFill style={{ background: `#020205`, overflow: 'hidden', fontFamily: 'monospace' }}>
            <ThreeCanvas width={width} height={height} gl={{ antialias: true }}>
                <Scene growth={progress} neonColor={neonColor} sunColor={sunColor} speed={speed} />
            </ThreeCanvas>

            <svg width="0" height="0"><defs>
                <clipPath id="gameUiClip" clipPathUnits="objectBoundingBox">
                    <path d="M0,0.2 L0.1,0 L0.9,0 L1,0.2 L1,0.8 L0.9,1 L0.1,1 L0,0.8 Z" />
                </clipPath>
            </defs></svg>

            <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', opacity: progress }}>
                <div style={{
                    position: 'relative', padding: '40px 80px', background: 'rgba(0,10,15,0.85)',
                    backdropFilter: 'blur(4px)', clipPath: `url(#gameUiClip)`,
                    border: `1px solid ${neonColor}33`, display: 'flex',
                    flexDirection: 'column', alignItems: 'center', gap: '10px',
                    transform: `scaleY(${interpolate(progress, [0, 0.5], [0, 1], { extrapolateRight: 'clamp' })})`
                }}>
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: sunColor, letterSpacing: '2px' }}>
                        <span>{typeText("SECURE_CONNECTION", progress)}</span>
                        <span>{typeText("v4.0.2", progress)}</span>
                    </div>

                    <CyberGameTitle title={title} neonColor={neonColor} progress={progress} />

                    <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '15px', marginTop: '10px' }}>
                        <div style={{ height: '2px', flex: 1, background: `${neonColor}44` }} />
                        <span style={{ color: sunColor, fontSize: '18px', fontWeight: 'bold' }}>
                            {typeText("INITIALIZING_SYSTEM...", progress)}
                        </span>
                        <div style={{ height: '2px', flex: 1, background: `${neonColor}44` }} />
                    </div>
                </div>
            </AbsoluteFill>

            <AbsoluteFill style={{
                pointerEvents: 'none',
                background: `radial-gradient(circle, transparent 40%, rgba(0,0,0,0.9) 100%),
                             repeating-linear-gradient(0deg, rgba(0,0,0,0.05) 0px, rgba(0,0,0,0.05) 1px, transparent 1px, transparent 3px)`,
            }} />
        </AbsoluteFill>
    );
};
