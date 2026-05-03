import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig, Easing, AbsoluteFill } from "remotion";
import { z } from 'zod';
import { borderPaths } from "./pathData";

export const Border002Schema = z.object({
    version: z.enum(['gold', 'silver']).default('gold'),
    inDuration: z.number().default(2.5),
    staticDuration: z.number().default(5),
    outDuration: z.number().default(2.5),
    floatAmplitude: z.number().default(2),
    floatFrequency: z.number().default(0.1),
    borderWidth: z.number().default(1500),
});

export type Border002Props = z.infer<typeof Border002Schema>;

const Border02Component: React.FC<Border002Props & { style?: React.CSSProperties }> = ({
    version = 'gold',
    style,
    inDuration = 2.5,
    staticDuration = 5,
    outDuration = 2.5,
    floatAmplitude = 2,
    floatFrequency = 0.1
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const inFrames = inDuration * fps;
    const staticFrames = staticDuration * fps;
    const outFrames = outDuration * fps;

    const startIn = 0;
    const endIn = inFrames;
    const startOut = endIn + staticFrames;
    const endOut = startOut + outFrames;

    const smoothStep = Easing.bezier(0.45, 0, 0.55, 1);

    // Choose gradient based on version
    const gradientId = version === 'gold' ? "goldGradientBorder" : "silverGradientBorder";

    const getFloatOffset = (frameOffset: number) => {
        const rawSine = Math.sin((frame + frameOffset) * floatFrequency);
        return (Math.sign(rawSine) * Math.pow(Math.abs(rawSine), 1.2)) * floatAmplitude;
    };

    const drawAndFill = (path: string, baseWidth: number, targetWidth: number, dash = 2500) => {
        const drawProgress = interpolate(
            frame,
            [startIn, endIn, startOut, endOut],
            [1, 0, 0, 1],
            {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: smoothStep,
            }
        );

        const fillProgress = interpolate(
            frame,
            [startIn + (fps * 0.5), endIn, startOut, endOut - (fps * 0.5)],
            [0, 1, 1, 0],
            {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
            }
        );

        const currentStrokeWidth = interpolate(
            fillProgress,
            [0, 1],
            [baseWidth, targetWidth]
        );

        return (
            <path
                d={path}
                stroke={`url(#${gradientId})`}
                strokeWidth={currentStrokeWidth}
                fill={`url(#${gradientId})`}
                fillOpacity={fillProgress}
                strokeDasharray={dash}
                strokeDashoffset={drawProgress * dash}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        );
    };

    return (
        <div style={{ width: 1500, background: "transparent", ...style }}>
            <svg viewBox="0 0 1920 1080" style={{ width: "100%", height: "auto", overflow: "visible" }}>
                <defs>
                    <linearGradient id="goldGradientBorder" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#A47A1E" />
                        <stop offset="25%" stopColor="#D3A84C" />
                        <stop offset="50%" stopColor="#FFEC94" />
                        <stop offset="75%" stopColor="#E6BE69" />
                        <stop offset="100%" stopColor="#B58B3E" />
                    </linearGradient>

                    <linearGradient id="silverGradientBorder" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#7a7a7a" />
                        <stop offset="25%" stopColor="#b8b8b8" />
                        <stop offset="50%" stopColor="#ffffff" />
                        <stop offset="75%" stopColor="#b8b8b8" />
                        <stop offset="100%" stopColor="#9e9e9e" />
                    </linearGradient>
                </defs>
                <g transform="matrix(5.95, 0, 0, 5.95, 150, -116)">
                    {drawAndFill(borderPaths.main, 0.35, 0.8, 2000)}
                    {drawAndFill(borderPaths.bottomLine, 0.3, 0.8, 1500)}

                    <g style={{ transform: `translateY(${getFloatOffset(0)}px)` }}>
                        {drawAndFill(borderPaths.sideHeartLeft, 0.4, 0.8, 1000)}
                    </g>

                    <g style={{ transform: `translateY(${getFloatOffset(-15)}px)` }}>
                        {drawAndFill(borderPaths.sideHeartRight, 0.4, 0.8, 1000)}
                    </g>

                    {borderPaths.dots.map((path, i) => (
                        <g key={i}>{drawAndFill(path, 0.5, 0.8, 500)}</g>
                    ))}
                </g>
            </svg>
        </div>
    );
};

export const Border002: React.FC<Border002Props> = (props) => {
    const { borderWidth = 1500 } = props;

    return (
        <AbsoluteFill style={{ backgroundColor: "transparent" }}>
            <div style={{
                position: 'absolute',
                top: '10%',
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                filter: 'drop-shadow(0px 4px 10px rgba(0,0,0,0.05))'
            }}>
                <Border02Component {...props} style={{ width: borderWidth }} />
            </div>

            <div style={{
                position: 'absolute',
                bottom: '10%',
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                transform: 'scaleY(-1)',
                filter: 'drop-shadow(0px -4px 10px rgba(0,0,0,0.05))'
            }}>
                <Border02Component {...props} style={{ width: borderWidth }} />
            </div>
        </AbsoluteFill>
    );
};
