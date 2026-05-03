import React, { useMemo } from 'react';
import {
    AbsoluteFill,
    interpolate,
    spring,
    useCurrentFrame,
    useVideoConfig,
} from 'remotion';
import { z } from 'zod';

export const YouTubeNotifySchema = z.object({
    channelName: z.string().default("kanal nomi"),
});

export type YouTubeNotifyProps = z.infer<typeof YouTubeNotifySchema>

const YoutubeIcon = React.memo(({ size = 80 }: { size?: number }) => (
    <div style={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
    }}>
        <svg width="100%" height="100%" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="24" cy="24" r="20" fill="#FF0000" />
            <path fillRule="evenodd" clipRule="evenodd" d="M35.3005 16.3781C35.6996 16.7772 35.9872 17.2739 36.1346 17.8187C36.9835 21.2357 36.7873 26.6324 36.1511 30.1813C36.0037 30.7261 35.7161 31.2228 35.317 31.6219C34.9179 32.021 34.4212 32.3086 33.8764 32.456C31.8819 33 23.8544 33 23.8544 33C23.8544 33 15.8269 33 13.8324 32.456C13.2876 32.3086 12.7909 32.021 12.3918 31.6219C11.9927 31.2228 11.7051 30.7261 11.5577 30.1813C10.7038 26.7791 10.9379 21.3791 11.5412 17.8352C11.6886 17.2903 11.9762 16.7936 12.3753 16.3945C12.7744 15.9954 13.2711 15.7079 13.8159 15.5604C15.8104 15.0165 23.8379 15 23.8379 15C23.8379 15 31.8654 15 33.8599 15.544C34.4047 15.6914 34.9014 15.979 35.3005 16.3781ZM27.9423 24L21.283 27.8571V20.1428L27.9423 24Z" fill="white" />
        </svg>
    </div>
));

export const YouTubeNotify: React.FC<{ channelName: string }> = ({ channelName }) => {
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

    // 1. Calculate dynamic font size (Shrinks if name is > 12 characters)
    const fontSize = Math.min(32, Math.max(20, 32 - (fullHandle.length - 12) * 1.2));

    // 2. Calculate target width based on text length (Safety max at 800)
    const targetWidth = Math.min(800, 240 + fullHandle.length * (fontSize * 0.6));

    // 3. Final bubble width interpolation
    const rawWidth = interpolate(textReveal, [0, 1], [140, targetWidth]);
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
                    borderRadius: 70, // Exactly half of height
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
                    <YoutubeIcon size={90} />
                </div>

                <div style={{
                    marginLeft: 25,
                    display: 'flex',
                    flexDirection: 'column',
                    opacity: textReveal,
                    whiteSpace: 'nowrap' // Crucial to prevent wrapping during animation
                }}>
                    <div style={{
                        fontSize: 18,
                        color: '#636e72',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '1.5px'
                    }}>
                        YouTubeda obuna bo'ling
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
                                    fontSize: fontSize, // Using dynamic font size
                                    color: '#CC0000',
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
