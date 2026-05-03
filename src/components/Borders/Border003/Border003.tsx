import React from 'react';
import {
    AbsoluteFill,
    interpolate,
    useCurrentFrame,
    useVideoConfig,
    Easing,
} from 'remotion';
import { z } from 'zod';
import { borderPaths } from './pathData';

// 1. Define the Presets
const PRESETS = {
    gold: ['#BF953F', '#FCF6BA', '#B38728', '#FBF5B7', '#AA771C'],
    silver: ['#757575', '#E0E0E0', '#9E9E9E', '#F5F5F5', '#616161'],
};

// 2. Define the Schema with a Dropdown
export const Border003Schema = z.object({
    version: z.enum(['gold', 'silver']).default('gold'), // This creates the dropdown
    transitionSeconds: z.number().default(4.9),
    floatSpeed: z.number().default(20),
    floatAmplitude: z.number().default(2),
    strokeWidth: z.number().default(1.2),
});

export type Border003Props = z.infer<typeof Border003Schema>;

export const Border003: React.FC<Border003Props> = ({
    version = 'gold',
    transitionSeconds = 4.9,
    floatSpeed = 20,
    floatAmplitude = 2,
    strokeWidth = 1.2
}) => {
    const frame = useCurrentFrame();
    const { fps, durationInFrames } = useVideoConfig();

    // Pick colors based on the version prop
    const colors = PRESETS[version as keyof typeof PRESETS] ?? PRESETS.gold;

    const transitionFrames = transitionSeconds * fps;
    const introEnd = transitionFrames;
    const outroStart = durationInFrames - transitionFrames;

    const renderPath = (isMirrored: boolean) => {
        return (
            <svg
                viewBox="250 50 220 60"
                style={{
                    width: '1200px',
                    overflow: 'visible',
                    transform: isMirrored ? 'scaleY(-1)' : 'none',
                }}
            >
                <defs>
                    <linearGradient id="metalGradient" x1="0%" y1="0%" x2="100%" y2="30%">
                        {colors.map((color, i) => (
                            <stop
                                key={i}
                                offset={`${(i / (colors.length - 1)) * 100}%`}
                                stopColor={color}
                            />
                        ))}
                    </linearGradient>
                </defs>

                {Object.entries(borderPaths).map(([key, pathData]) => {
                    const drawProgress = interpolate(
                        frame,
                        [0, introEnd, outroStart, durationInFrames],
                        [1, 0, 0, 1],
                        {
                            easing: Easing.bezier(0.45, 0, 0.55, 1),
                            extrapolateLeft: 'clamp',
                            extrapolateRight: 'clamp',
                        }
                    );

                    const fillOpacity = interpolate(
                        frame,
                        [introEnd * 0.2, introEnd, outroStart, durationInFrames - (introEnd * 0.2)],
                        [0, 1, 1, 0],
                        {
                            easing: Easing.inOut(Easing.ease),
                            extrapolateLeft: 'clamp',
                            extrapolateRight: 'clamp',
                        }
                    );

                    const isHeart = key.toLowerCase().includes('heart');
                    const floatY = isHeart ? Math.sin(frame / floatSpeed) * floatAmplitude : 0;

                    return (
                        <path
                            key={key}
                            d={pathData}
                            fill="url(#metalGradient)"
                            fillOpacity={fillOpacity}
                            stroke="url(#metalGradient)"
                            strokeWidth={strokeWidth}
                            strokeDasharray="2000"
                            strokeDashoffset={drawProgress * 2000}
                            strokeLinecap="round"
                            style={{
                                transform: `translateY(${floatY}px)`,
                            }}
                        />
                    );
                })}
            </svg>
        );
    };

    return (
        <AbsoluteFill style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '10px'
        }}>
            {renderPath(false)}
            {renderPath(true)}
        </AbsoluteFill>
    );
};
