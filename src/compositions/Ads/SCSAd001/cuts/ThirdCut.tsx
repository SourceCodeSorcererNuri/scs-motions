import React from 'react';
import {
    interpolate,
    spring,
    useCurrentFrame,
    useVideoConfig,
    AbsoluteFill,
    random
} from 'remotion';

const MISSIONS = [
    { label: "SABAB_01", desc: "Komponentlarni to'liq kontrol qilish (ranglar, fontlar, formatlar)" },
    { label: "SABAB_02", desc: "Matematik mukammal animatsiyalar" },
    { label: "SABAB_03", desc: "Takrorlanmas materiallar, eksklyuziv content" }
];

const CyberMesh: React.FC<{ frame: number }> = ({ frame }) => (
    <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ opacity: 0.2 }}>
        <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#00ffff', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#ff00ff', stopOpacity: 1 }} />
            </linearGradient>
        </defs>
        <path
            d="M0,0 L100,0 L100,100 L0,100 Z M50,10 L90,50 L50,90 L10,50 Z"
            fill="none"
            stroke="url(#grad1)"
            strokeWidth="0.3"
            transform={`rotate(${frame * 0.1} 50 50)`}
        />
    </svg>
);

export const ThirdCut: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps, width, height, durationInFrames } = useVideoConfig();

    const cutExit = spring({
        frame: frame - (durationInFrames - 20),
        fps,
        config: { damping: 20 }
    });

    return (
        <AbsoluteFill style={{
            backgroundColor: '#00080a', // Deep midnight cyan base
            overflow: 'hidden',
            opacity: 1 - cutExit
        }}>

            {/* --- BACKGROUND LAYER --- */}
            <div style={{ position: 'absolute', inset: -50, zIndex: 0 }}>
                <CyberMesh frame={frame} />
            </div>

            <div style={{
                position: 'absolute', inset: 0,
                background: `radial-gradient(circle at 50% 50%, rgba(0, 255, 255, 0.1) 0%, transparent 70%)`,
                zIndex: 1,
            }} />

            {/* --- CONTENT LAYER --- */}
            <div style={{ position: 'relative', zIndex: 10 }}>
                <div style={{ padding: '80px 60px 30px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                        <div style={{
                            width: 14, height: 14, backgroundColor: '#00ffff', borderRadius: '2px',
                            boxShadow: '0 0 20px #00ffff'
                        }} />
                        <span style={{
                            color: '#00ffff', fontFamily: 'monospace', fontSize: 24, fontWeight: 'bold',
                            textShadow: '0 0 10px #00ffff', letterSpacing: 4
                        }}>
                            SYSTEM_UNLOCK // 100%
                        </span>
                    </div>
                    <h1 style={{
                        color: '#fff', fontFamily: 'Impact', fontSize: 75, margin: '10px 0 0',
                        textTransform: 'uppercase', fontStyle: 'italic',
                        filter: 'drop-shadow(0 0 15px rgba(0,255,255,0.5))'
                    }}>
                        BIZNI TANLASH UCHUN <span style={{ color: '#00ffff' }}>TOP 3</span> SABAB
                    </h1>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', padding: '0 60px' }}>
                    {MISSIONS.map((item, i) => {
                        const startFrame = i * 20 + 10;
                        const progress = spring({
                            frame: frame - startFrame,
                            fps,
                            config: { stiffness: 150, damping: 15 }
                        });

                        // The NFSU "Light Sweep" effect
                        const sweep = interpolate((frame - startFrame) % 60, [0, 60], [-100, 200]);

                        if (frame < startFrame) return null;

                        return (
                            <div key={i} style={{
                                opacity: progress,
                                transform: `translateX(${(1 - progress) * 120}px) skewX(-12deg)`,
                                position: 'relative',
                            }}>
                                {/* THE NFSU GLOWING BOX */}
                                <div style={{
                                    // NFSU CYAN FILL
                                    background: `linear-gradient(90deg, rgba(0, 255, 255, 0.3) 0%, rgba(0, 40, 40, 0.8) 100%)`,
                                    borderLeft: '8px solid #00ffff',
                                    borderTop: '1px solid rgba(0, 255, 255, 0.4)',
                                    borderBottom: '1px solid rgba(0, 255, 255, 0.2)',
                                    // Massive outer glow
                                    boxShadow: `0 0 30px rgba(0, 255, 255, 0.25), inset 0 0 15px rgba(0, 255, 255, 0.1)`,
                                    padding: '25px 35px',
                                    clipPath: 'polygon(0% 0%, 98% 0%, 100% 25%, 100% 100%, 2% 100%, 0% 75%)',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    backdropFilter: 'blur(4px)'
                                }}>
                                    {/* INTERNAL SWEEP LIGHT */}
                                    <div style={{
                                        position: 'absolute',
                                        top: 0, left: `${sweep}%`,
                                        width: '40%', height: '100%',
                                        background: 'linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.4), transparent)',
                                        transform: 'skewX(-20deg)',
                                    }} />

                                    <span style={{
                                        color: '#00ffff',
                                        fontFamily: 'monospace',
                                        fontSize: 18,
                                        fontWeight: 'black',
                                        display: 'block',
                                        marginBottom: 8,
                                        textShadow: '0 0 8px #00ffff'
                                    }}>
                                        {`>> ${item.label}`}
                                    </span>

                                    <p style={{
                                        color: '#fff',
                                        fontFamily: 'monospace',
                                        fontSize: 34,
                                        fontWeight: 900,
                                        lineHeight: 1.1,
                                        margin: 0,
                                        textTransform: 'uppercase',
                                        letterSpacing: -1,
                                        filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.8))'
                                    }}>
                                        {item.desc}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* DARKER OVERLAY SCANLINES */}
            <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: 'linear-gradient(rgba(0, 255, 255, 0.03) 50%, transparent 50%)',
                backgroundSize: '100% 2px', zIndex: 100, pointerEvents: 'none',
            }} />
        </AbsoluteFill>
    );
};
