import React, { useMemo } from 'react';
import {
    AbsoluteFill,
    interpolate,
    spring,
    useCurrentFrame,
    useVideoConfig,
} from 'remotion';
import { z } from 'zod';

export const TelegramNotifySchema = z.object({
    channelName: z.string().default("kanal nomi"),
})

export type TelegramNotifyProps = z.infer<typeof TelegramNotifySchema>;

const TelegramIcon = React.memo(({ size = 80 }: { size?: number }) => (
    <div style={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
    }}>
        <svg width="100%" height="100%" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="14" fill="url(#paint0_linear_87_7225)" />
            <path d="M22.9866 10.2088C23.1112 9.40332 22.3454 8.76755 21.6292 9.082L7.36482 15.3448C6.85123 15.5703 6.8888 16.3483 7.42147 16.5179L10.3631 17.4547C10.9246 17.6335 11.5325 17.541 12.0228 17.2023L18.655 12.6203C18.855 12.4821 19.073 12.7665 18.9021 12.9426L14.1281 17.8646C13.665 18.3421 13.7569 19.1512 14.314 19.5005L19.659 22.8523C20.2585 23.2282 21.0297 22.8506 21.1418 22.1261L22.9866 10.2088Z" fill="white" />
            <defs>
                <linearGradient id="paint0_linear_87_7225" x1="16" y1="2" x2="16" y2="30" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#37BBFE" />
                    <stop offset="1" stopColor="#007DBB" />
                </linearGradient>
            </defs>
        </svg>
    </div>
));

export const TelegramNotify: React.FC<{ channelName: string }> = ({ channelName }) => {
    const frame = useCurrentFrame();
    const { fps, durationInFrames } = useVideoConfig();

    const OUTRO_START = durationInFrames - 15;

    const entrance = spring({
        frame,
        fps,
        config: { damping: 12, stiffness: 120 }
    });

    const exit = spring({
        frame: frame - OUTRO_START,
        fps,
        config: { damping: 20, stiffness: 200 }
    });

    const totalScale = entrance - (exit * entrance);

    const textReveal = spring({
        frame: frame - 10,
        fps,
        config: { damping: 15, stiffness: 100 }
    });

    const float = Math.sin(frame / 20) * 8 * (entrance - exit);

    const shineProgress = interpolate(
        (frame + 40) % 90,
        [0, 40],
        [-150, 150],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    // --- DYNAMIC FONT & WIDTH LOGIC ---
    const fullHandle = `@${channelName}`;
    const characters = useMemo(() => fullHandle.split(''), [fullHandle]);

    // Shrink font size if handle is long (over 12 chars)
    const fontSize = Math.min(32, Math.max(20, 32 - (fullHandle.length - 12) * 1.2));

    // Adjust bubble width based on handle length to keep it pill-shaped
    const targetWidth = Math.min(800, 240 + fullHandle.length * (fontSize * 0.6));
    const bubbleWidth = interpolate(textReveal, [0, 1], [140, targetWidth]);

    const iconRotate = interpolate(entrance, [0, 1], [-90, 0]);

    return (
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: '#ffffff',
                    height: 140,
                    width: Math.max(bubbleWidth, 140), // Safety floor
                    padding: '0 40px',
                    borderRadius: 70, // Fixed half-height for perfect pill
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    position: 'relative',
                    overflow: 'hidden',
                    transform: `translateY(${float}px) scale(${totalScale})`,
                    opacity: 1 - exit,
                    fontFamily: 'Inter, system-ui, sans-serif',
                    boxSizing: 'border-box',
                    flexShrink: 0,
                }}
            >
                {/* Shine Sweep Overlay */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: `${shineProgress}%`,
                    width: '60%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                    transform: 'skewX(-25deg)',
                    pointerEvents: 'none',
                }} />

                <div style={{ transform: `rotate(${iconRotate}deg)`, zIndex: 2, flexShrink: 0 }}>
                    <TelegramIcon size={90} />
                </div>

                <div style={{
                    marginLeft: 25,
                    display: 'flex',
                    flexDirection: 'column',
                    opacity: textReveal,
                    whiteSpace: 'nowrap' // Prevent text from wrapping/squishing
                }}>
                    <div style={{
                        fontSize: 16,
                        color: '#636e72',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '1.2px'
                    }}>
                        Telegramga qo'shiling
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline' }}>
                        {characters.map((char, i) => {
                            const charSpring = spring({
                                frame: frame - (15 + (i * 1.5)),
                                fps,
                                config: { damping: 12, stiffness: 160 },
                            });
                            return (
                                <span key={i} style={{
                                    fontSize: fontSize, // Dynamic font size applied here
                                    color: '#0088cc',
                                    fontWeight: 900,
                                    display: 'inline-block',
                                    transform: `translateY(${(1 - charSpring) * 15}px) scale(${charSpring})`,
                                    opacity: charSpring,
                                    minWidth: char === ' ' ? '10px' : 'auto',
                                }}>{char}</span>
                            );
                        })}
                    </div>
                </div>
            </div>
        </AbsoluteFill>
    );
};
