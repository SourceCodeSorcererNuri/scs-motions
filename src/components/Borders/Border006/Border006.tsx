import React from 'react';
import {
    AbsoluteFill,
    interpolate,
    useCurrentFrame,
    useVideoConfig,
    Easing
} from 'remotion';
import { z } from 'zod';
import { pathData } from './pathData';

// 1. Define the Schema
export const Border006Schema = z.object({
    version: z.enum(['gold', 'silver']).default('gold'),
    drawInSeconds: z.number().default(7),
    undrawSeconds: z.number().default(7),
    shimmerSpeedSeconds: z.number().default(4),
    staticWhiteOpacity: z.number().min(0).max(1).default(1),
    goldBaseColor: z.string().default("#8A6628"),
    silverBaseColor: z.string().default("#757575"),
});

export type Border006Props = z.infer<typeof Border006Schema>;

export const Border006: React.FC<Partial<Border006Props>> = ({
    version = 'gold',
    drawInSeconds = 7,
    undrawSeconds = 7,
    shimmerSpeedSeconds = 4,
    staticWhiteOpacity = 1,
    goldBaseColor = "#8A6628",
    silverBaseColor = "#757575"
}) => {
    const frame = useCurrentFrame();
    const { fps, durationInFrames } = useVideoConfig();

    const drawInDur = drawInSeconds * fps;
    const fillInDur = 0.5 * fps;
    const undrawDur = undrawSeconds * fps;
    const startFill = drawInDur - (2 * fps);
    const startUndraw = durationInFrames - undrawDur;

    const softEase = Easing.bezier(0.42, 0, 0.58, 0.6);

    const shimmerMove = interpolate(
        frame % (fps * shimmerSpeedSeconds),
        [0, fps * shimmerSpeedSeconds],
        [-150, 250],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    const drawProgress = interpolate(
        frame,
        [0, drawInDur, startUndraw, durationInFrames],
        [1, 0, 0, 1],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: softEase }
    );

    const fillOpacity = interpolate(
        frame,
        [startFill, startFill + fillInDur, startUndraw, startUndraw + 3.5 * fps],
        [0, 1, 1, 0],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.quad) }
    );

    const isSilver = version === 'silver';
    const mainColor = `url(#${version}Gradient)`;
    const mainOpacity = isSilver ? staticWhiteOpacity : 1;
    const baseColor = isSilver ? silverBaseColor : goldBaseColor;

    return (
        <AbsoluteFill style={{ backgroundColor: 'transparent' }}>
            <svg viewBox="0 0 1920 1080" style={{ width: '100%', height: '100%' }}>
                <defs>
                    {/* Gold Gradient */}
                    <linearGradient
                        id="goldGradient"
                        x1={`${shimmerMove}%`}
                        y1="0%"
                        x2={`${shimmerMove + 120}%`}
                        y2="25%"
                        gradientUnits="userSpaceOnUse"
                    >
                        <stop offset="0%" stopColor={baseColor} />
                        <stop offset="20%" stopColor="#E0B050" />
                        <stop offset="48%" stopColor="#F9F1A5" />
                        <stop offset="50%" stopColor="#FFFFFF" />
                        <stop offset="52%" stopColor="#F9F1A5" />
                        <stop offset="80%" stopColor="#D4A017" />
                        <stop offset="100%" stopColor={baseColor} />
                    </linearGradient>

                    {/* Silver Gradient */}
                    <linearGradient
                        id="silverGradient"
                        x1={`${shimmerMove}%`}
                        y1="0%"
                        x2={`${shimmerMove + 120}%`}
                        y2="25%"
                        gradientUnits="userSpaceOnUse"
                    >
                        <stop offset="0%" stopColor={baseColor} />
                        <stop offset="20%" stopColor="#C0C0C0" />
                        <stop offset="48%" stopColor="#E0E0E0" />
                        <stop offset="50%" stopColor="#FFFFFF" />
                        <stop offset="52%" stopColor="#E0E0E0" />
                        <stop offset="80%" stopColor="#A0A0A0" />
                        <stop offset="100%" stopColor={baseColor} />
                    </linearGradient>

                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3.5" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>

                <g transform="translate(960, 280) scale(0.7) translate(-960, -300)">
                    <OrnamentGroup
                        fillOpacity={fillOpacity * mainOpacity}
                        drawProgress={drawProgress}
                        color={mainColor}
                    />
                </g>

                <g transform="translate(960, 800) scale(0.7, -0.6) translate(-960, -300)">
                    <OrnamentGroup
                        fillOpacity={fillOpacity * mainOpacity}
                        drawProgress={drawProgress}
                        color={mainColor}
                    />
                </g>
            </svg>
        </AbsoluteFill>
    );
};

const OrnamentGroup: React.FC<{
    fillOpacity: number;
    drawProgress: number;
    color: string;
}> = ({ fillOpacity, drawProgress, color }) => (
    <g>
        <path
            d={pathData.main}
            fill={color}
            stroke={color}
            fillOpacity={fillOpacity}
            strokeWidth="1.6"
            strokeDasharray={15000}
            strokeDashoffset={drawProgress * 15000}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d={pathData.bottomLine}
            fill="none"
            stroke={color}
            strokeWidth="1.6"
            strokeDasharray={2000}
            strokeDashoffset={drawProgress * 2000}
            strokeLinecap="round"
        />
    </g>
);
