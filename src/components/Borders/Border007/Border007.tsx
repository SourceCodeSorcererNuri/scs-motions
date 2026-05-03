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
export const Border007Schema = z.object({
    version: z.enum(['gold', 'silver']).default('gold'),
    undrawStartSeconds: z.number().default(10.8), // 650 frames / 60fps
    animationSpeed: z.number().default(150),
    sweepLoopDuration: z.number().default(300),
});

export type Border007Props = z.infer<typeof Border007Schema>;

const AnimatedPath = ({
    d,
    startFrame,
    drawDuration,
    outStartFrame,
    strokeWidth = 1,
    shouldFloat = false,
    floatDelay = 0,
    isLightLayer = false,
    version = 'gold',
}: {
    d: string,
    startFrame: number,
    drawDuration: number,
    outStartFrame: number,
    strokeWidth?: number,
    shouldFloat?: boolean,
    floatDelay?: number,
    isLightLayer?: boolean,
    version?: 'gold' | 'silver',
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const pathRef = useRef<SVGPathElement>(null);
    const [length, setLength] = useState(0);

    useLayoutEffect(() => {
        if (pathRef.current) setLength(pathRef.current.getTotalLength());
    }, []);

    const easing = Easing.inOut(Easing.quad);

    const strokeProgress = frame < outStartFrame
        ? interpolate(frame, [startFrame, startFrame + drawDuration], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing })
        : interpolate(frame, [outStartFrame, outStartFrame + drawDuration], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing });

    const fillIn = spring({
        frame: frame - (startFrame + drawDuration * 0.3),
        fps,
        config: { stiffness: 10, damping: 5 },
    });

    const fillOut = interpolate(frame, [outStartFrame, outStartFrame + 50], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    const currentFillOpacity = frame < outStartFrame ? fillIn : fillOut;
    const floatY = shouldFloat ? Math.sin((frame + floatDelay) / 5) * 0.8 : 0;

    // Base color selection: Silver uses a light gray base to allow the sweep to pop
    const baseColor = version === 'gold' ? "url(#goldGradient)" : "#C0C0C0";

    return (
        <path
            ref={pathRef}
            d={d}
            fill={isLightLayer ? "url(#sweepGradient)" : baseColor}
            fillOpacity={currentFillOpacity}
            stroke={isLightLayer ? "url(#sweepGradient)" : baseColor}
            strokeWidth={strokeWidth}
            strokeDasharray={length || 1}
            strokeDashoffset={strokeProgress * length}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
                transform: `translateY(${floatY}px)`,
                mixBlendMode: isLightLayer ? (version === 'silver' ? "overlay" : "screen") : "normal",
                filter: isLightLayer ? "blur(1px)" : "none",
                willChange: 'stroke-dashoffset, transform',
                visibility: length === 0 ? 'hidden' : 'visible'
            }}
        />
    );
};

export const Border007: React.FC<Partial<Border007Props>> = ({
    version = 'gold',
    undrawStartSeconds = 10.8,
    animationSpeed = 150,
    sweepLoopDuration = 300
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const undrawStart = undrawStartSeconds * fps;
    const activeSweepDuration = 120;
    const localFrame = frame % sweepLoopDuration;

    const sweepProgress = interpolate(
        localFrame,
        [0, activeSweepDuration, sweepLoopDuration],
        [-1.5, 2, 2],
        {
            easing: Easing.bezier(0.45, 0.05, 0.55, 0.95),
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp'
        }
    );

    const BorderSet = ({ isLightLayer = false }: { isLightLayer?: boolean }) => (
        <g>
            <AnimatedPath d={pathData.Main} startFrame={0} drawDuration={400} outStartFrame={undrawStart} isLightLayer={isLightLayer} version={version} />
            <AnimatedPath d={pathData.leftHeartDoodle} startFrame={40} drawDuration={animationSpeed} outStartFrame={undrawStart + 100} shouldFloat floatDelay={0} isLightLayer={isLightLayer} version={version} />
            <AnimatedPath d={pathData.leftHeart01} startFrame={90} drawDuration={animationSpeed} outStartFrame={undrawStart + 90} shouldFloat floatDelay={10} isLightLayer={isLightLayer} version={version} />
            <AnimatedPath d={pathData.leftHeart02} startFrame={140} drawDuration={animationSpeed} outStartFrame={undrawStart + 80} shouldFloat floatDelay={20} isLightLayer={isLightLayer} version={version} />
            <AnimatedPath d={pathData.rightHeartDoodle} startFrame={65} drawDuration={animationSpeed} outStartFrame={undrawStart + 100} shouldFloat floatDelay={5} isLightLayer={isLightLayer} version={version} />
            <AnimatedPath d={pathData.rightHeart01} startFrame={115} drawDuration={animationSpeed} outStartFrame={undrawStart + 90} shouldFloat floatDelay={15} isLightLayer={isLightLayer} version={version} />
            <AnimatedPath d={pathData.rightHeart02} startFrame={165} drawDuration={animationSpeed} outStartFrame={undrawStart + 80} shouldFloat floatDelay={25} isLightLayer={isLightLayer} version={version} />
            {pathData.leftDots.map((dot, i) => (
                <AnimatedPath key={`l-dot-${i}`} d={dot} startFrame={200 + (i * 10)} drawDuration={80} outStartFrame={undrawStart} isLightLayer={isLightLayer} version={version} />
            ))}
            {pathData.rightDots.map((dot, i) => (
                <AnimatedPath key={`r-dot-${i}`} d={dot} startFrame={225 + (i * 10)} drawDuration={80} outStartFrame={undrawStart} isLightLayer={isLightLayer} version={version} />
            ))}
        </g>
    );

    return (
        <AbsoluteFill>
            <svg viewBox="-825 225 1920 1080" width={1920} height={1080} style={{ overflow: 'visible', transform: 'scale(5)', transformOrigin: 'center' }}>
                <defs>
                    <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#BF953F" />
                        <stop offset="25%" stopColor="#FCF6BA" />
                        <stop offset="50%" stopColor="#B38728" />
                        <stop offset="75%" stopColor="#FBF5B7" />
                        <stop offset="100%" stopColor="#AA771C" />
                    </linearGradient>

                    <linearGradient
                        id="sweepGradient"
                        gradientUnits="objectBoundingBox"
                        x1={sweepProgress}
                        y1="0"
                        x2={sweepProgress + 0.6}
                        y2="1"
                    >
                        <stop offset="0%" stopColor="white" stopOpacity="0" />
                        <stop offset="45%" stopColor="white" stopOpacity="0" />
                        <stop offset="50%" stopColor="white" stopOpacity={version === 'silver' ? 0.6 : 0.8} />
                        <stop offset="55%" stopColor="white" stopOpacity="0" />
                        <stop offset="100%" stopColor="white" stopOpacity="0" />
                    </linearGradient>
                </defs>

                <g transform="translate(0, 425)">
                    <BorderSet />
                    <BorderSet isLightLayer />
                </g>

                <g transform="translate(0, 1100) scale(1, -1)">
                    <BorderSet />
                    <BorderSet isLightLayer />
                </g>
            </svg>
        </AbsoluteFill>
    );
};
