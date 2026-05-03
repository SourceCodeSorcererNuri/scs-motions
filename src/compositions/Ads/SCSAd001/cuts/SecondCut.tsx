import React from 'react';
import {
    interpolate,
    spring,
    useCurrentFrame,
    useVideoConfig,
    AbsoluteFill,
    random
} from 'remotion';

export const SecondCut: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps, width, height, durationInFrames } = useVideoConfig();

    // 30 Frame Stagger Logic
    const intrance = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' });
    const exit = interpolate(frame, [durationInFrames - 30, durationInFrames], [0, 1], { extrapolateLeft: 'clamp' });

    const moveIn = spring({ frame, fps, config: { damping: 14 } });
    const jitter = (frame % 2 === 0) ? (random(frame + 10) - 0.5) * 15 : 0;

    return (
        <AbsoluteFill style={{ backgroundColor: '#0a000a', overflow: 'hidden' }}>

            {/* BACKGROUND: Diagonal Luxury Gradient */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: `linear-gradient(135deg, #2d0036 0%, #000000 100%)`,
            }} />

            {/* GOLDEN "DATA STREAM" */}
            {new Array(10).fill(0).map((_, i) => {
                const x = (random(`x2-${i}`) * width);
                const speed = random(`s2-${i}`) * 25 + 15;
                const y = (frame * speed) % (height + 200);
                return (
                    <div key={i} style={{
                        position: 'absolute', left: x, top: y - 100,
                        width: 2, height: 150,
                        background: 'linear-gradient(to bottom, transparent, #ffcc00)',
                        opacity: 0.2,
                    }} />
                );
            })}

            {/* MAIN LAYOUT: Split Elements */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
                zIndex: 20,
                opacity: intrance - exit,
                transform: `translateX(${(1 - moveIn) * 100}px) skewY(${(1 - intrance) * 5}deg)`,
            }}>

                {/* 90s Badge Style */}
                <div style={{
                    backgroundColor: '#ff00ff',
                    color: '#fff',
                    padding: '8px 20px',
                    fontFamily: 'monospace',
                    fontSize: 28,
                    fontWeight: 'bold',
                    marginBottom: 30,
                    boxShadow: '8px 8px 0px #ffcc00',
                    transform: `rotate(-3deg) scale(${intrance})`,
                }}>
                    YANGI_KANAL.exe
                </div>

                <h1 style={{
                    color: '#fff',
                    fontSize: 75,
                    textAlign: 'center',
                    fontFamily: 'Impact, sans-serif',
                    textTransform: 'uppercase',
                    lineHeight: 1,
                    filter: `drop-shadow(${jitter}px 0px 0px rgba(255, 204, 0, 0.7))`
                }}>
                    UNDA <span style={{ color: '#ffcc00' }}>@SCS_MOTIONS</span> <br />
                    TELEGRAM KANALI AYNAN <br />
                    <span style={{
                        WebkitTextStroke: '2px #fff',
                        color: 'transparent'
                    }}>SIZ UCHUN!</span>
                </h1>

                {/* Cyber Geometric Element */}
                <div style={{
                    marginTop: 40,
                    width: 300,
                    height: 300,
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    position: 'absolute',
                    zIndex: -1,
                    transform: `rotate(${frame}deg) scale(${intrance * 2})`,
                    opacity: 0.1
                }} />

            </div>

            {/* OVERLAY: Flashy Magenta Glitch Bar */}
            <div style={{
                position: 'absolute',
                bottom: 100,
                left: 0,
                width: '100%',
                height: 60,
                background: 'rgba(255, 0, 255, 0.1)',
                borderTop: '1px solid #ff00ff',
                borderBottom: '1px solid #ff00ff',
                display: 'flex',
                alignItems: 'center',
                overflow: 'hidden'
            }}>
                <div style={{
                    whiteSpace: 'nowrap',
                    color: '#ff00ff',
                    fontFamily: 'monospace',
                    fontSize: 20,
                    transform: `translateX(-${frame * 5}px)`
                }}>
                    MAXIMALIZM // PREMIUM ANIMATSIYALAR // 60FPS // RENDER KECHIKISHLARSIZ // SOURCE CODE SORCERER // TO'LIQ MIJOZ HOHLAGAN NARSA ORTIQCHA TO'LOVSIZ //
                </div>
            </div>

            {/* 90s Grain & CRT Overlay */}
            <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: 'radial-gradient(rgba(255,0,255,0.05) 1px, transparent 0)',
                backgroundSize: '4px 4px',
                zIndex: 100, pointerEvents: 'none',
                opacity: 0.4
            }} />
        </AbsoluteFill>
    );
};
