import React, { useRef, useEffect, useState } from 'react';
import {
    AbsoluteFill,
    interpolate,
    useCurrentFrame,
    useVideoConfig,
    Easing,
} from 'remotion';
import { z } from 'zod';
import { pathData } from './pathData';

export const Border005Schema = z.object({
    version: z.enum(['gold', 'silver']).default('gold'),
    drawInSeconds: z.number().default(9),
    staticHoldSeconds: z.number().default(1.6),
    drawOutSeconds: z.number().default(6),
    globalScale: z.number().default(0.7),
});

export type Border005Props = z.infer<typeof Border005Schema>;

export const Border005: React.FC<Border005Props> = ({
    version = 'gold',
    drawInSeconds = 9,
    staticHoldSeconds = 1.6,
    drawOutSeconds = 6,
    globalScale = 0.7
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const pathRef = useRef<SVGPathElement>(null);
    const [length, setLength] = useState(0);

    useEffect(() => {
        if (pathRef.current) {
            setLength(pathRef.current.getTotalLength());
        }
    }, []);

    const drawInFrames = drawInSeconds * fps;
    const staticFrames = staticHoldSeconds * fps;
    const drawOutFrames = drawOutSeconds * fps;

    const drawInStart = 0;
    const drawInEnd = drawInFrames;
    const drawOutStart = drawInEnd + staticFrames;
    const drawOutEnd = drawOutStart + drawOutFrames;

    const drawProgress = interpolate(
        frame,
        [drawInStart, drawInEnd, drawOutStart, drawOutEnd],
        [0, 1, 1, 0],
        {
            easing: Easing.bezier(0.42, 0, 0.58, 1),
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
        }
    );

    const fillOpacity = interpolate(
        frame,
        [drawInStart + 50, drawInEnd, drawOutStart, drawOutEnd - 50],
        [0, 1, 1, 0],
        {
            easing: Easing.linear,
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
        }
    );

    const sweepProgress = interpolate(
        frame % 400,
        [0, 400],
        [-150, 250],
        { easing: Easing.bezier(0.4, 0, 0.6, 1) }
    );

    const { scale, translateX, translateY } = pathData.groupTransform;

    const renderPathGroup = (isBottom: boolean) => {
        const mirrorY = isBottom ? 'scale(1, -1)' : '';
        const pathLength = length || 8000;
        const gradientId = version === 'gold' ? 'url(#goldGradient)' : 'url(#silverGradient)';

        return (
            <g
                style={{
                    transform: `translate(640px, 0px) ${mirrorY} scale(${globalScale})`,
                    transformOrigin: 'center center',
                }}
            >
                <g transform={`translate(-960, -50) matrix(${scale}, 0, 0, ${scale}, ${translateX}, ${translateY})`}>
                    <path
                        ref={isBottom ? null : pathRef}
                        d={pathData.mainBorder}
                        stroke={gradientId}
                        strokeWidth="0.8"
                        fill={gradientId}
                        fillOpacity={fillOpacity}
                        strokeDasharray={pathLength}
                        strokeDashoffset={pathLength * (1 - drawProgress)}
                        strokeLinecap="round"
                    />

                    {[
                        ...pathData.bottomLeftDots,
                        ...pathData.leftDots,
                        ...pathData.bottomRightDots,
                        ...pathData.rightDots,
                    ].map((dot, i) => (
                        <path
                            key={i}
                            d={dot}
                            fill={gradientId}
                            opacity={fillOpacity}
                        />
                    ))}
                </g>
            </g>
        );
    };

    return (
        <AbsoluteFill>
            <svg viewBox="0 0 1920 1080" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                <defs>
                    <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#8A6628" />
                        <stop offset={`${sweepProgress - 40}%`} stopColor="#8A6628" />
                        <stop offset={`${sweepProgress - 15}%`} stopColor="#D4AF37" />
                        <stop offset={`${sweepProgress}%`} stopColor="#FFFFE0" />
                        <stop offset={`${sweepProgress + 15}%`} stopColor="#C5A028" />
                        <stop offset={`${sweepProgress + 40}%`} stopColor="#8A6628" />
                        <stop offset="100%" stopColor="#8A6628" />
                    </linearGradient>

                    <linearGradient id="silverGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#757575" />
                        <stop offset={`${sweepProgress - 30}%`} stopColor="#757575" />
                        <stop offset={`${sweepProgress}%`} stopColor="#FFFFFF" />
                        <stop offset={`${sweepProgress + 30}%`} stopColor="#757575" />
                        <stop offset="100%" stopColor="#757575" />
                    </linearGradient>

                    <filter id="subtleGlow">
                        <feGaussianBlur stdDeviation="1.2" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>
                {renderPathGroup(false)}
                {renderPathGroup(true)}
            </svg>
        </AbsoluteFill>
    );
};
