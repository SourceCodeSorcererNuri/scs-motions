import React, { useLayoutEffect, useRef, useState } from 'react';
import {
    interpolate,
    useCurrentFrame,
    useVideoConfig,
    AbsoluteFill,
    Easing,
    spring,
} from 'remotion';
import { z } from 'zod';
import { pathData } from './pathData';

// 1. Define the Schema
export const Border008Schema = z.object({
    version: z.enum(['gold', 'silver']).default('gold'),
    undrawStartSeconds: z.number().default(9.6), // ~580 frames / 60fps
    drawDurationMax: z.number().default(480),
    masterScale: z.number().default(5),
});

export type Border008Props = z.infer<typeof Border008Schema>;

const AnimatedPath = ({
    d,
    startFrame,
    drawDuration,
    outStartFrame,
    color,
    strokeWidth = 1.2,
    shouldFloat = false,
    floatDelay = 0,
}: {
    d: string,
    startFrame: number,
    drawDuration: number,
    outStartFrame: number,
    color: string,
    strokeWidth?: number,
    shouldFloat?: boolean,
    floatDelay?: number,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const pathRef = useRef<SVGPathElement>(null);
    const [length, setLength] = useState(0);

    useLayoutEffect(() => {
        if (pathRef.current) setLength(pathRef.current.getTotalLength());
    }, []);

    const easing = Easing.bezier(0.5, 0, 0.5, 0.6);

    const strokeProgress = frame < outStartFrame
        ? interpolate(frame, [startFrame, startFrame + drawDuration], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing })
        : interpolate(frame, [outStartFrame, outStartFrame + (drawDuration * 0.8)], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing });

    const fillIn = spring({
        frame: frame - (startFrame + drawDuration * 0.5),
        fps,
        config: { stiffness: 8, damping: 12 },
    });

    const fillOut = interpolate(frame, [outStartFrame + 50, outStartFrame + 150], [1, 0], { extrapolateLeft: 'clamp' });
    const currentFillOpacity = frame < outStartFrame ? fillIn : fillOut;

    const floatY = shouldFloat ? Math.sin((frame + floatDelay) / 20) * 1.5 : 0;

    return (
        <g style={{ transform: `translateY(${floatY}px)` }}>
            <path
                ref={pathRef}
                d={d}
                fill={color}
                fillOpacity={currentFillOpacity}
                stroke={color}
                strokeWidth={strokeWidth}
                strokeDasharray={length || 1}
                strokeDashoffset={strokeProgress * length}
                strokeLinecap="round"
                style={{ visibility: length === 0 ? 'hidden' : 'visible' }}
            />
            <path
                d={d}
                fill="url(#shimmerGradient)"
                fillOpacity={currentFillOpacity * 0.5}
                stroke="transparent"
                strokeWidth={0}
                strokeDasharray={length || 1}
                strokeDashoffset={strokeProgress * length}
                style={{ mixBlendMode: 'overlay' }}
            />
        </g>
    );
};

export const Border008: React.FC<Partial<Border008Props>> = ({
    version = 'gold',
    undrawStartSeconds = 9.6,
    drawDurationMax = 480,
    masterScale = 5,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const undrawStart = undrawStartSeconds * fps;

    const mainColor = version === 'gold' ? "url(#goldGradient)" : "url(#silverGradient)";
    const dotColor = version === 'gold' ? "url(#dotGold)" : "url(#dotSilver)";

    const sweepProgress = interpolate(frame % 300, [0, 300], [-1, 2], { easing: Easing.inOut(Easing.quad) });

    const topX = 570;
    const topY = 0;
    const bottomX = 570;
    const bottomY = 480;

    const BorderSet = () => (
        <g>
            <AnimatedPath d={pathData.Main} startFrame={0} drawDuration={drawDurationMax} outStartFrame={undrawStart} color={mainColor} />
            <AnimatedPath d={pathData.leftLeaves} startFrame={100} drawDuration={240} outStartFrame={undrawStart + 40} color={mainColor} shouldFloat floatDelay={0} />
            <AnimatedPath d={pathData.rightLeaves} startFrame={120} drawDuration={240} outStartFrame={undrawStart + 40} color={mainColor} shouldFloat floatDelay={10} />
            <AnimatedPath d={pathData.leftHeart01} startFrame={180} drawDuration={200} outStartFrame={undrawStart + 80} color={mainColor} shouldFloat floatDelay={20} />
            <AnimatedPath d={pathData.rightHeart01} startFrame={200} drawDuration={200} outStartFrame={undrawStart + 80} color={mainColor} shouldFloat floatDelay={30} />
            {pathData.leftDots.concat(pathData.rightDots).map((dot, i) => (
                <AnimatedPath
                    key={`dot-${i}`}
                    d={dot}
                    startFrame={300 + (i * 12)}
                    drawDuration={100}
                    outStartFrame={undrawStart + 120}
                    color={dotColor}
                    strokeWidth={0.5}
                />
            ))}
        </g>
    );

    return (
        <AbsoluteFill>
            <svg viewBox="0 0 1920 1080" style={{ overflow: 'visible' }}>
                <defs>
                    <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#4d3500" />
                        <stop offset="25%" stopColor="#bd952d" />
                        <stop offset="50%" stopColor="#fffceb" />
                        <stop offset="80%" stopColor="#bd952d" />
                        <stop offset="100%" stopColor="#4d3500" />
                    </linearGradient>

                    <linearGradient id="silverGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#444444" />
                        <stop offset="25%" stopColor="#999999" />
                        <stop offset="50%" stopColor="#FFFFFF" />
                        <stop offset="75%" stopColor="#999999" />
                        <stop offset="100%" stopColor="#444444" />
                    </linearGradient>

                    <linearGradient id="shimmerGradient" x1={sweepProgress} y1="0" x2={sweepProgress + 0.5} y2="1">
                        <stop offset="0%" stopColor="white" stopOpacity="0" />
                        <stop offset="50%" stopColor="white" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="white" stopOpacity="0" />
                    </linearGradient>

                    <radialGradient id="dotGold">
                        <stop offset="0%" stopColor="#ffffff" />
                        <stop offset="40%" stopColor="#FCF6BA" />
                        <stop offset="100%" stopColor="#AA771C" />
                    </radialGradient>

                    <radialGradient id="dotSilver">
                        <stop offset="0%" stopColor="#ffffff" />
                        <stop offset="60%" stopColor="#e0e0e0" />
                        <stop offset="100%" stopColor="#a0a0a0" />
                    </radialGradient>
                </defs>

                <g transform={`translate(${topX}, ${topY}) scale(${masterScale}, ${masterScale})`} style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
                    <BorderSet />
                </g>

                <g transform={`translate(${bottomX}, ${bottomY}) scale(${masterScale}, -${masterScale})`} style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
                    <BorderSet />
                </g>
            </svg>
        </AbsoluteFill>
    );
};
