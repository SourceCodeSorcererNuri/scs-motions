import React, { useMemo } from 'react';
import {
    AbsoluteFill,
    interpolate,
    spring,
    useCurrentFrame,
    useVideoConfig,
} from 'remotion';
import { z } from 'zod';

// 1. Define the Schema
export const InstagramNotifySchema = z.object({
    channelName: z.string().default("your_username"),
});

// 2. Derive the Type from the Schema
export type InstagramNotifyProps = z.infer<typeof InstagramNotifySchema>;

const InstagramIcon = React.memo(({ size = 79 }: { size?: number }) => (
    <div style={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
    }}>
        <svg width="100%" height="100%" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="2" width="28" height="28" rx="24" fill="url(#paint0_radial_87_7153)" />
            <rect x="2" y="2" width="28" height="28" rx="24" fill="url(#paint1_radial_87_7153)" />
            <rect x="2" y="2" width="28" height="28" rx="24" fill="url(#paint2_radial_87_7153)" />
            <path d="M23 10.5C23 11.3284 22.3284 12 21.5 12C20.6716 12 20 11.3284 20 10.5C20 9.67157 20.6716 9 21.5 9C22.3284 9 23 9.67157 23 10.5Z" fill="white" />
            <path fillRule="evenodd" clipRule="evenodd" d="M16 21C18.7614 21 21 18.7614 21 16C21 13.2386 18.7614 11 16 11C13.2386 11 11 13.2386 11 16C11 18.7614 13.2386 21 16 21ZM16 19C17.6569 19 19 17.6569 19 16C19 14.3431 17.6569 13 16 13C14.3431 13 13 14.3431 13 16C13 17.6569 14.3431 19 16 19Z" fill="white" />
            <path fillRule="evenodd" clipRule="evenodd" d="M6 15.6C6 12.2397 6 10.5595 6.65396 9.27606C7.2292 8.14708 8.14708 7.2292 9.27606 6.65396C10.5595 6 12.2397 6 15.6 6H16.4C19.7603 6 21.4405 6 22.7239 6.65396C23.8529 7.2292 24.7708 8.14708 25.346 9.27606C26 10.5595 26 12.2397 26 15.6V16.4C26 19.7603 26 21.4405 25.346 22.7239C24.7708 23.8529 23.8529 24.7708 22.7239 25.346C21.4405 26 19.7603 26 16.4 26H15.6C12.2397 26 10.5595 26 9.27606 25.346C8.14708 24.7708 7.2292 23.8529 6.65396 22.7239C6 21.4405 6 19.7603 6 16.4V15.6ZM15.6 8H16.4C18.1132 8 19.2777 8.00156 20.1779 8.0751C21.0548 8.14674 21.5032 8.27659 21.816 8.43597C22.5686 8.81947 23.1805 9.43139 23.564 10.184C23.7234 10.4968 23.8533 10.9452 23.9249 11.8221C23.9984 12.7223 24 13.8868 24 15.6V16.4C24 18.1132 23.9984 19.2777 23.9249 20.1779C23.8533 21.0548 23.7234 21.5032 23.564 21.816C23.1805 22.5686 22.5686 23.1805 21.816 23.564C21.5032 23.7234 21.0548 23.8533 20.1779 23.9249C19.2777 23.9984 18.1132 24 16.4 24H15.6C13.8868 24 12.7223 23.9984 11.8221 23.9249C10.9452 23.8533 10.4968 23.7234 10.184 23.564C9.43139 23.1805 8.81947 22.5686 8.43597 21.816C8.27659 21.5032 8.14674 21.0548 8.0751 20.1779C8.00156 19.2777 8 18.1132 8 16.4V15.6C8 13.8868 8.00156 12.7223 8.0751 11.8221C8.14674 10.9452 8.27659 10.4968 8.43597 10.184C8.81947 9.43139 9.43139 8.81947 10.184 8.43597C10.4968 8.27659 10.9452 8.14674 11.8221 8.0751C12.7223 8.00156 13.8868 8 15.6 8Z" fill="white" />
            <defs>
                <radialGradient id="paint0_radial_87_7153" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(12 23) rotate(-55.3758) scale(25.5196)">
                    <stop stopColor="#B13589" />
                    <stop offset="0.79309" stopColor="#C62F94" />
                    <stop offset="1" stopColor="#8A3AC8" />
                </radialGradient>
                <radialGradient id="paint1_radial_87_7153" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(11 31) rotate(-65.1363) scale(22.5942)">
                    <stop stopColor="#E0E8B7" />
                    <stop offset="0.444662" stopColor="#FB8A2E" />
                    <stop offset="0.71474" stopColor="#E2425C" />
                    <stop offset="1" stopColor="#E2425C" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="paint2_radial_87_7153" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(0.500002 3) rotate(-8.1301) scale(38.8909 8.31836)">
                    <stop offset="0.156701" stopColor="#406ADC" />
                    <stop offset="0.467799" stopColor="#6A45BE" />
                    <stop offset="1" stopColor="#6A45BE" stopOpacity="0" />
                </radialGradient>
            </defs>
        </svg>
    </div>
));

export const InstagramNotify: React.FC<InstagramNotifyProps> = ({ channelName }) => {
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

    // 1. Dynamic font size: starts at 32px, scales down for handles longer than 12 chars
    const fontSize = Math.min(32, Math.max(20, 32 - (fullHandle.length - 12) * 1.2));

    // 2. Dynamic width: pill expands based on character count and current font size
    const targetWidth = Math.min(800, 280 + fullHandle.length * (fontSize * 0.6));
    const rawWidth = interpolate(textReveal, [0, 1], [140, targetWidth]);

    // 3. Keep perfect circle intro (width >= height)
    const bubbleWidth = Math.max(rawWidth, 140);
    const iconRotate = interpolate(entrance, [0, 1], [-90, 0]);

    return (
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: '#ffffff',
                    height: 140,
                    width: bubbleWidth,
                    padding: '0 35px',
                    borderRadius: 70, // Fixed half-height for perfect semi-circles
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
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: `${shineProgress}%`,
                    width: '60%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
                    transform: 'skewX(-25deg)',
                }} />

                <div style={{ transform: `rotate(${iconRotate}deg)`, zIndex: 2, flexShrink: 0 }}>
                    <InstagramIcon size={90} />
                </div>

                <div style={{
                    marginLeft: 25,
                    display: 'flex',
                    flexDirection: 'column',
                    opacity: textReveal,
                    whiteSpace: 'nowrap'
                }}>
                    <div style={{
                        fontSize: 18,
                        color: '#636e72',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '1.5px'
                    }}>
                        Instagramda Follow bosing
                    </div>

                    <div style={{
                        display: 'flex',
                        alignItems: 'baseline'
                    }}>
                        {characters.map((char, i) => {
                            const charSpring = spring({
                                frame: frame - (15 + (i * 1.5)),
                                fps,
                                config: { damping: 12, stiffness: 160 },
                            });
                            return (
                                <span key={i} style={{
                                    fontSize: fontSize, // Using dynamic font size here
                                    fontWeight: 900,
                                    display: 'inline-block',
                                    transform: `translateY(${(1 - charSpring) * 15}px) scale(${charSpring})`,
                                    opacity: charSpring,
                                    minWidth: char === ' ' ? '10px' : 'auto',
                                    background: 'linear-gradient(45deg, #f9ce34, #ee2a7b, #6228d7)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                }}>{char}</span>
                            );
                        })}
                    </div>
                </div>
            </div>
        </AbsoluteFill>
    );
};
