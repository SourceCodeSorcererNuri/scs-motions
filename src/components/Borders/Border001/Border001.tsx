import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';
import { z } from 'zod';
import { rawPathData } from './pathData';

export const Border001Schema = z.object({
    version: z.enum(['gold', 'silver']).default('gold'),
    drawSeconds: z.number().default(4),
    idleSeconds: z.number().default(4),
    undrawSeconds: z.number().default(4),
    staggerFactor: z.number().default(0.002),
    verticalGap: z.number().default(300),
    glowColor: z.string().optional(),
});

export type BorderProps = z.infer<typeof Border001Schema>;

export const Border001: React.FC<BorderProps> = ({
    version = 'gold',
    drawSeconds = 4,
    idleSeconds = 4,
    undrawSeconds = 4,
    staggerFactor = 0.002,
    verticalGap = 300,
    glowColor
}) => {
    const frame = useCurrentFrame();
    const { fps, width, height } = useVideoConfig();

    // Automatic glow color based on version if not specified
    const activeGlow = glowColor || (version === 'gold' ? "#ffcc33" : "#ffffff");
    const activeGradient = version === 'gold' ? "url(#goldGradient)" : "url(#silverGradient)";

    const sortedPaths = useMemo(() => {
        return [...rawPathData].sort((a, b) => {
            const xA = parseFloat(a.split(' ')[1].split(',')[0]);
            const xB = parseFloat(b.split(' ')[1].split(',')[0]);
            return xA - xB;
        });
    }, []);

    return (
        <div style={{ width, height, backgroundColor: 'transparent' }}>
            <svg viewBox="0 0 1920 1080" width="100%" height="100%">
                <defs>
                    {/* Gold Gradient */}
                    <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" style={{ stopColor: '#A47A1E', stopOpacity: 1 }} />
                        <stop offset="20%" style={{ stopColor: '#D3A84E', stopOpacity: 1 }} />
                        <stop offset="50%" style={{ stopColor: '#FFEC94', stopOpacity: 1 }} />
                        <stop offset="80%" style={{ stopColor: '#E6BE69', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: '#FFD87C', stopOpacity: 1 }} />
                    </linearGradient>

                    {/* Silver Gradient */}
                    <linearGradient id="silverGradient" x1="0%" y1="0%" x2="100%" y2="100%" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" style={{ stopColor: '#7a7a7a', stopOpacity: 1 }} />
                        <stop offset="20%" style={{ stopColor: '#b8b8b8', stopOpacity: 1 }} />
                        <stop offset="50%" style={{ stopColor: '#ffffff', stopOpacity: 1 }} />
                        <stop offset="80%" style={{ stopColor: '#b8b8b8', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: '#9e9e9e', stopOpacity: 1 }} />
                    </linearGradient>
                </defs>

                <symbol id="flower-half">
                    <g transform="matrix(0.333333, 0, 0, 0.333333, -204.85, 102.45)">
                        {sortedPaths.map((d, i) => {
                            const staggerFrames = i * staggerFactor * fps;

                            const drawStart = staggerFrames;
                            const drawEnd = drawStart + (drawSeconds * fps);
                            const undrawStart = drawEnd + (idleSeconds * fps);
                            const undrawEnd = undrawStart + (undrawSeconds * fps);

                            const progress = interpolate(
                                frame,
                                [drawStart, drawEnd, undrawStart, undrawEnd],
                                [0, 1, 1, 0],
                                {
                                    extrapolateLeft: 'clamp',
                                    extrapolateRight: 'clamp',
                                    easing: Easing.bezier(0.45, 0.05, 0.55, 0.95)
                                }
                            );

                            return (
                                <path
                                    key={i}
                                    d={d}
                                    stroke={activeGradient}
                                    strokeWidth={3}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    fill={activeGradient}
                                    fillOpacity={interpolate(progress, [0.7, 1], [0, 1], { extrapolateLeft: 'clamp' })}
                                    strokeDasharray={5000}
                                    strokeDashoffset={5000 * (1 - progress)}
                                    opacity={frame > drawStart ? 1 : 0}
                                    style={{
                                        filter: `drop-shadow(0 0 ${5 * progress}px ${activeGlow}${Math.floor(progress * 50)})`,
                                    }}
                                />
                            );
                        })}
                    </g>
                </symbol>

                <g transform={`translate(0, -${verticalGap / 2})`}>
                    <use href="#flower-half" />
                </g>

                <g transform={`scale(1, -1) translate(0, -${900 + verticalGap})`}>
                    <use href="#flower-half" />
                </g>
            </svg>
        </div>
    );
};
