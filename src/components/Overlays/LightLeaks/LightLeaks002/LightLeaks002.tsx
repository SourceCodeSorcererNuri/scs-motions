import React, { useMemo } from 'react';
import {
    AbsoluteFill,
    interpolate,
    useCurrentFrame,
    useVideoConfig,
    random,
} from 'remotion';

const CIRCLE_COUNT = 60; // Significantly busier

const DefinedCircle: React.FC<{ index: number }> = ({ index }) => {
    const frame = useCurrentFrame();
    const { width, height } = useVideoConfig();
    const seed = `wedding-busy-circle-${index}`;

    const vars = useMemo(() => {
        const colors = [
            '#FFB6C1', // Light Pink
            '#87CEFA', // Sky Blue
            '#E6E6FA', // Lavender
            '#FFFACD', // Lemon Chiffon
            '#F0FFF0', // Honeydew
            '#FFDAB9', // Peach Puff
            '#FFFFFF', // Pure White
        ];

        return {
            size: interpolate(random(`${seed}-s`), [0, 1], [40, 180]), // Smaller, more numerous
            xBase: random(`${seed}-x`) * width,
            yBase: random(`${seed}-y`) * height,
            color: colors[Math.floor(random(`${seed}-c`) * colors.length)],
            speedX: (random(`${seed}-sx`) - 0.5) * 2,
            speedY: (random(`${seed}-sy`) - 0.5) * 2,
            // Lower blur values for "fully visible" shapes
            blur: interpolate(random(`${seed}-b`), [0, 1], [2, 12]),
        };
    }, [seed, width, height]);

    // Constant slow-float movement
    const x = (vars.xBase + (frame * vars.speedX)) % (width + 200) - 100;
    const y = (vars.yBase + (frame * vars.speedY)) % (height + 200) - 100;

    // Faster "shimmer" effect for a busier feel
    const opacity = interpolate(
        Math.sin(frame / 30 + index),
        [-1, 1],
        [0.1, 0.5] // Increased visibility
    );

    const scale = interpolate(
        Math.cos(frame / 45 + index),
        [-1, 1],
        [0.9, 1.1]
    );

    return (
        <div
            style={{
                position: 'absolute',
                width: vars.size,
                height: vars.size,
                left: x,
                top: y,
                backgroundColor: vars.color,
                borderRadius: '50%',
                // Added a slight border to make them "pop" against light backgrounds
                border: '1px solid rgba(255, 255, 255, 0.2)',
                filter: `blur(${vars.blur}px)`,
                opacity: opacity,
                mixBlendMode: 'screen',
                transform: `scale(${scale})`,
                willChange: 'transform, opacity',
            }}
        />
    );
};

export const LightLeaksOverlay002: React.FC = () => {
    return (
        <AbsoluteFill style={{ backgroundColor: 'transparent', overflow: 'hidden' }}>
            {/* Soft global wash for atmosphere */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(45deg, rgba(255,182,193,0.1), rgba(135,206,250,0.1))',
                mixBlendMode: 'plus-lighter'
            }} />

            {/* The Busy Circle Field */}
            {new Array(CIRCLE_COUNT).fill(0).map((_, i) => (
                <DefinedCircle key={`dc-${i}`} index={i} />
            ))}
        </AbsoluteFill>
    );
};
