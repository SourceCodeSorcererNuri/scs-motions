import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig, Easing, AbsoluteFill } from 'remotion';
import { z } from 'zod';
import { SVG_PATHS } from './Path';

// 1. Keep your timing constants or move them to schema
export const Border009Schema = z.object({
    version: z.enum(['gold', 'silver']).default('gold'),
});

export type Border009Props = z.infer<typeof Border009Schema>;

const calmBezier = Easing.bezier(0.23, 1, 0.32, 1);

const AnimatedPath: React.FC<{
    d: string;
    start: number;
    duration: number;
    blurDuration?: number;
    strokeWidth?: number;
    translateX?: number;
    exitStart: number;
    color: string;
    version: 'gold' | 'silver';
}> = ({
    d,
    start,
    duration,
    blurDuration,
    strokeWidth = 1.1,
    translateX = 0,
    exitStart,
    color,
    version
}) => {
        const frame = useCurrentFrame();

        const drawIn = interpolate(frame, [start, start + duration], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: calmBezier,
        });

        const scaleIn = interpolate(frame, [start, start + duration], [1.05, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: calmBezier,
        });

        const opacityIn = interpolate(frame, [start, start + duration * 0.5], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
        });

        const drawOut = interpolate(frame, [exitStart, exitStart + duration], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: calmBezier,
        });

        const scaleOut = interpolate(frame, [exitStart, exitStart + duration], [1, 1.05], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: calmBezier,
        });

        const opacityOut = interpolate(frame, [exitStart + (duration * 0.5), exitStart + duration], [1, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
        });

        const isExiting = frame >= exitStart;

        const finalDraw = isExiting ? (1 - drawOut) : drawIn;
        const finalScale = isExiting ? scaleOut : scaleIn;
        const finalOpacity = isExiting ? opacityOut : opacityIn;

        const blurValue = blurDuration
            ? (isExiting
                ? interpolate(frame, [exitStart, exitStart + duration], [0, 4], { extrapolateRight: 'clamp', easing: calmBezier })
                : interpolate(frame, [start, start + duration], [4, 0], { extrapolateRight: 'clamp', easing: calmBezier }))
            : 0;

        const tx = translateX
            ? (isExiting
                ? interpolate(frame, [exitStart, exitStart + duration], [0, translateX], { extrapolateRight: 'clamp', easing: calmBezier })
                : interpolate(frame, [start, start + duration], [translateX, 0], { extrapolateRight: 'clamp', easing: calmBezier }))
            : 0;

        return (
            <g style={{
                transformOrigin: 'center',
                transform: `translateX(${tx}px) scale(${finalScale})`,
                filter: blurDuration ? `blur(${blurValue}px)` : undefined,
                opacity: finalOpacity,
                // Silver looks better with a slight glow in this calm version
                boxShadow: version === 'silver' ? '0 0 10px rgba(255,255,255,0.2)' : 'none'
            }}>
                <path
                    d={d}
                    pathLength={1}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={1}
                    strokeDashoffset={1 - finalDraw}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </g>
        );
    };

export const Border009: React.FC<Partial<Border009Props>> = ({
    version = 'gold'
}) => {
    const { width, height, durationInFrames, fps } = useVideoConfig();

    // Use your original FPS logic
    const INTERNAL_FPS = 30;
    const ACTION_DUR = Math.round(4 * INTERNAL_FPS);
    const STAGGER = Math.round(1.5 * INTERNAL_FPS);

    const HEART_IN = 10;
    const LEAVES_IN = HEART_IN + STAGGER;
    const ROWS_IN = LEAVES_IN + STAGGER;

    const HEART_OUT = durationInFrames - ACTION_DUR - 10;
    const LEAVES_OUT = HEART_OUT - STAGGER;
    const ROWS_OUT = LEAVES_OUT - STAGGER;

    // Set colors for the two versions
    const mainColor = version === 'gold' ? "#D4AF37" : "#E0E0E0";

    return (
        <AbsoluteFill style={{ backgroundColor: 'transparent', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <svg width={width} height={height} viewBox="0 0 508 285.75">
                <AnimatedPath
                    d={SVG_PATHS.heart}
                    start={HEART_IN}
                    duration={ACTION_DUR}
                    blurDuration={ACTION_DUR}
                    strokeWidth={0.5}
                    exitStart={HEART_OUT}
                    color={mainColor}
                    version={version}
                />
                <AnimatedPath
                    d={SVG_PATHS.leaves1}
                    start={LEAVES_IN}
                    duration={ACTION_DUR}
                    blurDuration={ACTION_DUR}
                    translateX={-25}
                    exitStart={LEAVES_OUT}
                    color={mainColor}
                    version={version}
                />
                <AnimatedPath
                    d={SVG_PATHS.leaves2}
                    start={LEAVES_IN}
                    duration={ACTION_DUR}
                    blurDuration={ACTION_DUR}
                    translateX={25}
                    exitStart={LEAVES_OUT}
                    color={mainColor}
                    version={version}
                />
                <AnimatedPath
                    d={SVG_PATHS.row1}
                    start={ROWS_IN}
                    duration={ACTION_DUR}
                    translateX={0}
                    exitStart={ROWS_OUT}
                    color={mainColor}
                    version={version}
                />
                <AnimatedPath
                    d={SVG_PATHS.row2}
                    start={ROWS_IN}
                    duration={ACTION_DUR}
                    translateX={0}
                    exitStart={ROWS_OUT}
                    color={mainColor}
                    version={version}
                />
            </svg>
        </AbsoluteFill>
    );
};
