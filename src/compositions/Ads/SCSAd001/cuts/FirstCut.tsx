import React from 'react';
import {
    interpolate,
    spring,
    useCurrentFrame,
    useVideoConfig,
    AbsoluteFill,
    random
} from 'remotion';

export const FirstCut: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps, width, height, durationInFrames } = useVideoConfig();

    // 1. ADVANCED MOTION LOGIC (30 Frame In / 30 Frame Out)
    // Entrance: 0 to 30
    const intranceProgress = interpolate(frame, [0, 30], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    // Exit: Last 30 frames
    const exitProgress = interpolate(
        frame,
        [durationInFrames - 45, durationInFrames],
        [0, 1],
        {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
        }
    );

    // Spring for that "luxury" bounce on top of the linear progress
    const bounce = spring({
        frame,
        fps,
        config: { damping: 12, stiffness: 100 },
    });

    // 2. STUNNING TEXT EFFECTS
    const blur = interpolate(intranceProgress, [0, 1], [20, 0]) + interpolate(exitProgress, [0, 1], [0, 20]);
    const letterSpacing = interpolate(intranceProgress, [0, 1], [50, 2]) + interpolate(exitProgress, [0, 1], [0, 50]);
    const opacity = (frame % 2 === 0 && frame < 15) ? 0.3 : intranceProgress - exitProgress;

    // Background & Scanline logic
    const scanlinePos = interpolate(frame % (fps * 2), [0, fps * 2], [-100, height + 100]);
    const jitter = (frame % 3 === 0) ? (random(frame) - 0.5) * 10 : 0;
    const gridMovement = frame * 6;

    const renderDataRain = () => {
        return new Array(12).fill(0).map((_, i) => {
            const x = random(`x-${i}`) * width;
            const speed = random(`s-${i}`) * 15 + 5;
            const y = (frame * speed) % (height + 200);
            return (
                <div key={i} style={{
                    position: 'absolute',
                    left: x, top: y - 100,
                    color: '#00ffff', fontFamily: 'monospace',
                    fontSize: 12, opacity: 0.1, writingMode: 'vertical-rl'
                }}>
                    {Math.random().toString(16).toUpperCase().substring(2, 8)}
                </div>
            );
        });
    };

    const GridLayer = ({ position }: { position: 'top' | 'bottom' }) => (
        <div style={{
            position: 'absolute', [position]: -150, width: '200%', left: '-50%', height: '45%',
            backgroundImage: `linear-gradient(to right, rgba(0, 255, 255, 0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 255, 255, 0.2) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
            backgroundPosition: `0px ${position === 'bottom' ? -gridMovement : gridMovement}px`,
            transform: `perspective(500px) rotateX(${position === 'bottom' ? 65 : -65}deg)`,
            maskImage: `linear-gradient(${position === 'bottom' ? 'to top' : 'to bottom'}, black, transparent)`,
            WebkitMaskImage: `linear-gradient(${position === 'bottom' ? 'to top' : 'to bottom'}, black, transparent)`,
        }} />
    );

    return (
        <AbsoluteFill style={{ backgroundColor: '#020202', overflow: 'hidden' }}>
            <div style={{
                position: 'absolute', inset: 0,
                background: `radial-gradient(circle at 50% 50%, rgba(0, 100, 255, 0.15) 0%, rgba(0, 0, 0, 1) 90%)`,
            }} />

            {renderDataRain()}
            <GridLayer position="top" />
            <GridLayer position="bottom" />

            <div style={{
                position: 'absolute', top: scanlinePos, left: 0, width: '100%', height: '4px',
                background: 'rgba(0, 255, 255, 0.8)',
                boxShadow: '0 0 20px 5px rgba(0, 255, 255, 0.5)',
                zIndex: 50, opacity: 0.6, backdropFilter: 'brightness(1.5)',
            }} />

            {/* MAIN CONTENT AREA */}
            <div style={{
                display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                height: '100%', zIndex: 10,
                opacity: opacity,
                filter: `blur(${blur}px)`,
                transform: `scale(${0.8 + (intranceProgress * 0.2) - (exitProgress * 0.1)})`,
            }}>
                <div style={{
                    color: '#00ffff', fontSize: 24, fontFamily: 'monospace', fontWeight: 'bold',
                    letterSpacing: letterSpacing, textShadow: '0 0 15px #00ffff'
                }}>
                    {jitter > 6 ? '[ SYSTEM_ERROR ]' : '[ INITIALIZING_V01 ]'}
                </div>

                <div style={{
                    position: 'relative',
                    textAlign: 'center',
                    transform: `translateX(${jitter}px)`,
                    marginTop: 20
                }}>
                    <h1 style={{
                        color: '#fff', fontSize: 90, fontFamily: 'Impact, sans-serif',
                        fontWeight: 900, lineHeight: 0.9, textTransform: 'uppercase',
                        letterSpacing: letterSpacing / 2,
                    }}>
                        ESKI EFFECT VA<br />
                        <span style={{ color: '#00ffff', textShadow: '0 0 25px #00ffff' }}>
                            ANIMATSIYALARDAN
                        </span><br />
                        CHARCHADINGIZMI?
                    </h1>
                </div>

                {/* ANIMATED UI BAR */}
                <div style={{
                    height: 8,
                    width: intranceProgress * 500,
                    background: 'linear-gradient(90deg, transparent, #00ffff, #ff00ff, #00ffff, transparent)',
                    marginTop: 35,
                    boxShadow: '0 0 50px #00ffff',
                    transform: `skewX(-25deg) scaleX(${1 - exitProgress})`,
                    opacity: 1 - exitProgress
                }} />
            </div>

            <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%)',
                backgroundSize: '100% 4px', zIndex: 100, pointerEvents: 'none',
            }} />
        </AbsoluteFill>
    );
};
