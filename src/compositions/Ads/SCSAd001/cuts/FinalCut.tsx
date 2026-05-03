import React from 'react';
import {
    interpolate,
    spring,
    useCurrentFrame,
    useVideoConfig,
    AbsoluteFill,
    random,
} from 'remotion';
import { QRCodeSVG } from 'qrcode.react';

// 1. THE "DATA VORTEX" BACKGROUND
const DataVortex: React.FC = () => {
    const frame = useCurrentFrame();
    const { width, height } = useVideoConfig();

    return (
        <AbsoluteFill style={{ backgroundColor: '#000800' }}>
            {/* Pulsing Core Glow */}
            <div style={{
                position: 'absolute', inset: 0,
                background: `radial-gradient(circle at 50% 50%, rgba(0, 255, 65, ${0.1 + Math.sin(frame * 0.1) * 0.05}) 0%, transparent 70%)`,
            }} />

            {/* Rotating Hex-Ring Field */}
            {new Array(60).fill(0).map((_, i) => {
                const angle = (i / 60) * Math.PI * 2 + (frame * 0.01);
                const radius = 300 + Math.sin(frame * 0.02 + i) * 50;
                const x = width / 2 + Math.cos(angle) * radius;
                const y = height / 2 + Math.sin(angle) * radius;

                return (
                    <div key={i} style={{
                        position: 'absolute', left: x, top: y,
                        color: '#00ff41', fontFamily: 'monospace', fontSize: 12,
                        opacity: 0.2, transform: `rotate(${angle}rad)`,
                        textShadow: '0 0 5px #00ff41'
                    }}>
                        0x{Math.floor(random(i) * 0xFF).toString(16).toUpperCase()}
                    </div>
                );
            })}
        </AbsoluteFill>
    );
};

export const FinalCut: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // STAGGERED ANIMATION CONTROLS
    const headerEntry = spring({ frame: frame - 5, fps, config: { stiffness: 100, damping: 10 } });
    const qrEntry = spring({ frame: frame - 15, fps, config: { stiffness: 150, damping: 12 } });
    const ctaEntry = spring({ frame: frame - 25, fps, config: { stiffness: 200, damping: 15 } });

    const isAlert = random(frame) > 0.95;
    const glitchJitter = isAlert ? (random(frame) - 0.5) * 40 : 0;

    return (
        <AbsoluteFill style={{ overflow: 'hidden' }}>
            <DataVortex />

            {/* CRT Scanline Grain */}
            <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: 'linear-gradient(rgba(0, 255, 65, 0.05) 1px, transparent 1px)',
                backgroundSize: '100% 3px', zDistance: 100, pointerEvents: 'none'
            }} />

            <div style={{
                display: 'flex', flexDirection: 'column', justifyContent: 'center',
                alignItems: 'center', height: '100%', zIndex: 10,
                transform: `perspective(1000px) rotateY(${Math.sin(frame * 0.02) * 2}deg)`
            }}>

                {/* --- HEADER: STAGGER 1 --- */}
                <div style={{
                    opacity: headerEntry,
                    transform: `translateY(${(1 - headerEntry) * -50}px)`,
                    textAlign: 'center', marginBottom: 40
                }}>
                    <div style={{
                        color: isAlert ? '#ff0000' : '#00ff41',
                        fontFamily: 'monospace', fontSize: 24, fontWeight: 'bold',
                        letterSpacing: 15, textShadow: `0 0 15px ${isAlert ? '#ff0000' : '#00ff41'}`
                    }}>
                        {isAlert ? "CRITICAL_OVERRIDE" : "ESTABLISHING_MAINFRAME"}
                    </div>
                    <div style={{ height: 2, background: '#00ff41', width: '100%', marginTop: 10, opacity: 0.5 }} />
                </div>

                {/* --- QR FRAME: STAGGER 2 --- */}
                <div style={{
                    padding: 40, background: 'rgba(0,0,0,0.95)',
                    border: `2px solid ${isAlert ? '#ff0000' : '#00ff41'}`,
                    boxShadow: `0 0 100px ${isAlert ? 'rgba(255,0,0,0.4)' : 'rgba(0, 255, 65, 0.2)'}`,
                    position: 'relative',
                    transform: `scale(${qrEntry}) rotate(${(1 - qrEntry) * 45}deg)`,
                    marginBottom: 60
                }}>
                    {/* Animated HUD Corners */}
                    {[[0, 0], [1, 0], [0, 1], [1, 1]].map(([x, y], i) => (
                        <div key={i} style={{
                            position: 'absolute',
                            top: y ? 'auto' : -20, bottom: y ? -20 : 'auto',
                            left: x ? 'auto' : -20, right: x ? 20 : 'auto',
                            width: 60, height: 60,
                            borderTop: y ? 'none' : '8px solid #fff',
                            borderBottom: y ? '8px solid #fff' : 'none',
                            borderLeft: x ? 'none' : '8px solid #fff',
                            borderRight: x ? '8px solid #fff' : 'none',
                            boxShadow: '0 0 20px rgba(255,255,255,0.3)'
                        }} />
                    ))}

                    <QRCodeSVG
                        value="https://t.me/scs_motions"
                        size={450}
                        bgColor="transparent"
                        fgColor={isAlert ? '#ff0000' : '#fff'}
                        level="H"
                    />

                    {/* Dual Laser Scanning Beam */}
                    <div style={{
                        position: 'absolute', top: 0, left: 0, width: '100%', height: '10px',
                        background: 'linear-gradient(transparent, #00ff41, transparent)',
                        boxShadow: '0 0 40px #00ff41',
                        transform: `translateY(${interpolate(frame % 40, [0, 40], [0, 530])}px)`,
                    }} />
                </div>

                {/* --- CTA & HANDLE: STAGGER 3 --- */}
                <div style={{
                    opacity: ctaEntry,
                    transform: `scale(${ctaEntry}) translateY(${glitchJitter}px)`,
                    textAlign: 'center'
                }}>
                    <h1 style={{
                        color: '#fff', fontFamily: 'Impact, sans-serif', fontSize: 90, margin: 0,
                        letterSpacing: 20, lineHeight: 0.8,
                        textShadow: `${isAlert ? 20 : 5}px 0 #ff0000, ${isAlert ? -20 : -5}px 0 #00ff41`
                    }}>
                        @SCS_MOTIONS
                    </h1>

                    <div style={{
                        marginTop: 50, padding: '30px 80px',
                        backgroundColor: isAlert ? '#ff0000' : '#00ff41',
                        color: '#000', fontFamily: 'monospace', fontSize: 40, fontWeight: '1000',
                        clipPath: 'polygon(15% 0, 100% 0, 85% 100%, 0 100%)',
                        boxShadow: '0 10px 50px rgba(0, 255, 65, 0.5)',
                        letterSpacing: 4
                    }}>
                        HOZIROQ_QO'SHILING
                    </div>
                </div>
            </div>

            {/* --- FINAL HACKER OVERLAYS --- */}
            {/* Vignette */}
            <div style={{
                position: 'absolute', inset: 0,
                background: 'radial-gradient(circle, transparent 10%, black 140%)',
                pointerEvents: 'none'
            }} />

            {/* Binary Ticker (Top & Bottom) */}
            {[0, 1].map(i => (
                <div key={i} style={{
                    position: 'absolute', [i ? 'bottom' : 'top']: 0,
                    width: '100%', height: 40, backgroundColor: 'rgba(0, 255, 65, 0.1)',
                    display: 'flex', alignItems: 'center', overflow: 'hidden', borderTop: '1px solid #00ff41'
                }}>
                    <div style={{
                        whiteSpace: 'nowrap', color: '#00ff41', fontFamily: 'monospace', fontSize: 16,
                        transform: `translateX(${(i ? -1 : 1) * frame * 5}px)`
                    }}>
                        {new Array(20).fill("0110101100010101010101101010").join(" ")}
                    </div>
                </div>
            ))}
        </AbsoluteFill>
    );
};
