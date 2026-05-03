import React, { useMemo } from 'react';
import {
    AbsoluteFill,
    interpolate,
    useCurrentFrame,
    useVideoConfig,
    random,
} from 'remotion';

const LEAK_COUNT = 6;
const BOKEH_COUNT = 22;

const ProfessionalBokeh: React.FC<{ index: number }> = ({ index }) => {
    const frame = useCurrentFrame();
    const { width, height, fps } = useVideoConfig();
    const seed = `pro-filled-bokeh-${index}`;

    // Memoize static random values to save cycles
    const vars = useMemo(() => ({
        size: interpolate(random(`${seed}-size`), [0, 1], [100, 280]),
        speed: 0.08 + random(`${seed}-speed`) * 0.15,
        xBase: random(`${seed}-x`) * width,
        blurVal: interpolate(random(`${seed}-blur`), [0, 2], [0, 2]),
        colorIdx: Math.floor(random(`${seed}-c`) * 4),
    }), [seed, width]);

    const warmPalette = ['rgba(255, 255, 255, 0.8)', 'rgba(255, 250, 230, 0.7)', 'rgba(255, 240, 200, 0.6)', 'rgba(255, 220, 150, 0.5)'];
    const color = warmPalette[vars.colorIdx];

    const yProgress = (frame / (fps * 35) * vars.speed + random(`${seed}-offset`)) % 1;
    const yPos = interpolate(yProgress, [0, 1], [height + 250, -250]);
    const xSway = Math.sin(frame / 120 + index) * 80;

    const opacity = interpolate(Math.sin(frame / 80 + index), [-1, 1], [0.1, 0.3]);

    return (
        <div
            style={{
                position: 'absolute',
                width: vars.size,
                height: vars.size,
                left: vars.xBase + xSway,
                top: yPos,
                opacity: opacity,
                mixBlendMode: 'screen',
                borderRadius: '50%',
                background: `radial-gradient(circle, ${color} 0%, ${color} 70%, white 100%)`,
                boxShadow: `inset 0 0 20px rgba(255, 255, 255, 0.5)`,
                filter: `blur(${vars.blurVal}px)`,
                // FORCE HARDWARE ACCELERATION
                willChange: 'transform, opacity',
                transform: `translateZ(0) scale(${interpolate(Math.sin(frame / 150 + index), [-1, 1], [0.95, 1.05])})`,
            }}
        />
    );
};

const ProLeak: React.FC<{ index: number }> = ({ index }) => {
    const frame = useCurrentFrame();
    const { width, height, fps } = useVideoConfig();
    const seed = `pro-leak-rand-${index}`;

    const size = useMemo(() => interpolate(random(`${seed}-s`), [0, 1], [1200, 2000]), [seed]);
    const color = useMemo(() => {
        const colors = ['#ff5e00', '#00f2ff', '#ff00bb', '#ffcc00'];
        return colors[Math.floor(random(`${seed}-color`) * colors.length)];
    }, [seed]);

    const x = interpolate(
        Math.sin(frame / 180) * 0.4 + Math.sin(frame / 70 + index) * 0.4 + Math.cos(frame / 250) * 0.2,
        [-1, 1], [-width * 0.5, width * 0.9]
    );
    const y = interpolate(
        Math.cos(frame / 190) * 0.4 + Math.sin(frame / 85 + index) * 0.4 + Math.sin(frame / 220) * 0.2,
        [-1, 1], [-height * 0.5, height * 0.9]
    );

    return (
        <div
            style={{
                position: 'absolute',
                width: size,
                height: size,
                left: x,
                top: y,
                backgroundColor: color,
                borderRadius: '50%',
                filter: `blur(${size / 3}px)`,
                opacity: 0.15,
                mixBlendMode: 'screen',
                // FORCE HARDWARE ACCELERATION
                willChange: 'transform',
                transform: 'translateZ(0)',
            }}
        />
    );
};

export const LightLeaksOverlay001: React.FC = () => {
    return (
        <AbsoluteFill style={{ backgroundColor: 'transparent', overflow: 'hidden' }}>
            {new Array(LEAK_COUNT).fill(0).map((_, i) => <ProLeak key={`l-${i}`} index={i} />)}
            {new Array(BOKEH_COUNT).fill(0).map((_, i) => <ProfessionalBokeh key={`b-${i}`} index={i} />)}
        </AbsoluteFill>
    );
};
