import React, { useEffect, useRef, useState } from 'react';
import {
    AbsoluteFill,
    interpolate,
    useCurrentFrame,
    useVideoConfig,
    Easing,
} from 'remotion';
import { z } from 'zod';
import { borderPaths } from './pathData';

// 1. Presets for Gold and Silver (using Silver instead of White for a metallic look)
const PRESETS = {
    gold: ['#BF953F', '#FCF6BA', '#B38728', '#FBF5B7', '#AA771C'],
    silver: ['#757575', '#E0E0E0', '#9E9E9E', '#F5F5F5', '#616161'],
};

// 2. Define the Schema
export const Border004Schema = z.object({
    version: z.enum(['gold', 'silver']).default('gold'),
    drawSeconds: z.number().default(2.5),
    outStartSeconds: z.number().default(7.5),
    floatAmplitude: z.number().default(2),
});

export type Border004Props = z.infer<typeof Border004Schema>;

export const Border004: React.FC<Border004Props> = ({
    version = 'gold',
    drawSeconds = 2.5,
    outStartSeconds = 7.5,
    floatAmplitude = 2
}) => {
    const frame = useCurrentFrame();
    const { fps, durationInFrames } = useVideoConfig();

    const drawDuration = drawSeconds * fps;
    const outStart = outStartSeconds * fps;
    const totalFrames = durationInFrames;

    const SVG_WIDTH = 275;
    const VIEW_HEIGHT = 375;

    // Gradient colors based on version
    const colors = PRESETS[version];
    const color = 'url(#metalGradientCenter)';

    const renderGroup = (isBottom: boolean) => {
        const prefix = isBottom ? 'bottom' : 'top';
        const baseTransform = isBottom
            ? `translate(0, ${VIEW_HEIGHT}) scale(1, -1)`
            : `translate(0, 0)`;

        return (
            <g transform={baseTransform}>
                {Object.entries(borderPaths).map(([key, path]) => {
                    const isHeart = key.toLowerCase().includes('heart');

                    let floatY = 0;
                    if (isHeart) {
                        const delay = key.includes('01') ? 0 : 10;
                        const sideDelay = key.includes('left') ? 5 : 0;
                        floatY = Math.sin((frame + delay + sideDelay) / 10) * floatAmplitude;
                    }

                    return (
                        <g key={`${prefix}-${key}`} transform={`translate(0, ${floatY})`}>
                            <SmoothPath
                                d={path}
                                frame={frame}
                                drawDuration={drawDuration}
                                outStart={outStart}
                                totalFrames={totalFrames}
                                color={color}
                            />
                        </g>
                    );
                })}
            </g>
        );
    };

    return (
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
            <svg viewBox={`0 0 ${SVG_WIDTH} ${VIEW_HEIGHT}`} style={{ width: '70%', overflow: 'visible' }}>
                <defs>
                    <linearGradient id="metalGradientCenter" x1="0%" y1="0%" x2="100%" y2="100%">
                        {colors.map((c, i) => (
                            <stop key={i} offset={`${(i / (colors.length - 1)) * 100}%`} stopColor={c} />
                        ))}
                    </linearGradient>
                </defs>
                {renderGroup(false)}
                {renderGroup(true)}
            </svg>
        </AbsoluteFill>
    );
};

const SmoothPath: React.FC<{
    d: string;
    frame: number;
    drawDuration: number;
    outStart: number;
    totalFrames: number;
    color: string;
}> = ({ d, frame, drawDuration, outStart, totalFrames, color }) => {
    const pathRef = useRef<SVGPathElement>(null);
    const [length, setLength] = useState(0);

    useEffect(() => {
        if (pathRef.current) setLength(pathRef.current.getTotalLength());
    }, []);

    const drawProgress = interpolate(frame, [0, drawDuration], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: Easing.bezier(0.65, 0, 0.35, 1),
    });

    const outProgress = interpolate(frame, [outStart, totalFrames], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: Easing.bezier(0.65, 0, 0.35, 1),
    });

    const currentProgress = outProgress > 0 ? 1 - outProgress : drawProgress;

    const fillOpacity = interpolate(
        frame,
        [drawDuration * 0.6, drawDuration, outStart, outStart + 10],
        [0, 1, 1, 0],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    return (
        <path
            ref={pathRef}
            d={d}
            fill={color}
            fillOpacity={fillOpacity}
            stroke={color}
            strokeWidth="0.6"
            strokeDasharray={length || 2000}
            strokeDashoffset={(length || 2000) * (1 - currentProgress)}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    );
};
