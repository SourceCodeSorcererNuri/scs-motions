import React from 'react';
import {
    AbsoluteFill,
    interpolate,
    spring,
    useCurrentFrame,
    useVideoConfig,
} from 'remotion';
import { z } from 'zod';

export const Intro001Schema = z.object({
    channelName: z.string().default("SOURCE_CODE"),
    statusMessage: z.string().default("SYSTEM_DECRYPTION"),
    statusResult: z.string().default("COMPLETE"),
    accentColor: z.string().default("#22d3ee"),
});

export type Intro001Props = z.infer<typeof Intro001Schema>;

/**
 * 2D SVG Perspective Grid 
 * This avoids CSS `perspective` by drawing the converging lines manually.
 */
const FlatPerspectiveGrid: React.FC<{ color: string; frame: number }> = ({ color, frame }) => {
    const { width, height } = useVideoConfig();

    const numVLines = 20; // Vertical (converging) lines
    const numHLines = 15; // Horizontal (scrolling) lines
    const horizonY = height * 0.4; // The "vanishing point" height
    const gridBottom = height;

    // Animation: offset for horizontal lines to create movement
    const movement = (frame * 4) % 100;

    return (
        <AbsoluteFill style={{ opacity: 0.2 }}>
            <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
                {/* VANISHING LINES (Verticals) */}
                {Array.from({ length: numVLines + 1 }).map((_, i) => {
                    const xBottom = (width / numVLines) * i;
                    const xTop = width / 2 + (xBottom - width / 2) * 0.2; // Converge toward center
                    return (
                        <line
                            key={`v-${i}`}
                            x1={xTop}
                            y1={horizonY}
                            x2={xBottom}
                            y2={gridBottom}
                            stroke={color}
                            strokeWidth="1"
                        />
                    );
                })}

                {/* SCROLLING LINES (Horizontals) */}
                {Array.from({ length: numHLines }).map((_, i) => {
                    // Using exponential spacing to simulate perspective depth
                    const progress = ((i * (100 / numHLines) + movement) % 100) / 100;
                    // Exponential curve: lines are closer at the top (horizon)
                    const yPos = horizonY + (Math.pow(progress, 2) * (gridBottom - horizonY));

                    return (
                        <line
                            key={`h-${i}`}
                            x1="0"
                            y1={yPos}
                            x2={width}
                            y2={yPos}
                            stroke={color}
                            strokeWidth="1"
                        />
                    );
                })}
            </svg>
        </AbsoluteFill>
    );
};

export const Intro001: React.FC<Intro001Props> = ({
    channelName = "SOURCE_CODE",
    statusMessage = "SYSTEM_DECRYPTION",
    statusResult = "COMPLETE",
    accentColor = "#22d3ee"
}) => {
    const frame = useCurrentFrame();
    const { fps, width, height } = useVideoConfig();

    const START_OUT = 540;
    const END_FRAME = 600;

    const entrance = spring({
        frame,
        fps,
        config: { damping: 12, stiffness: 100 },
    });

    const exitScaleY = interpolate(frame, [START_OUT, END_FRAME - 10], [1, 0.005], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    const exitScaleX = interpolate(frame, [END_FRAME - 15, END_FRAME], [1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    const globalOpacity = interpolate(frame, [END_FRAME - 5, END_FRAME], [1, 0]);
    const isGlitching = frame % 45 < 5;
    const glitchOffset = isGlitching ? Math.random() * 20 - 10 : 0;

    return (
        <AbsoluteFill style={{
            backgroundColor: '#020617',
            overflow: 'hidden',
            fontFamily: 'monospace',
            opacity: globalOpacity,
            transform: `scaleX(${exitScaleX}) scaleY(${exitScaleY})`,
        }}>

            {/* Pure SVG Grid - No CSS Perspective required */}
            <FlatPerspectiveGrid color={accentColor} frame={frame} />

            {/* DIGITAL CODE RAIN */}
            {[...Array(15)].map((_, i) => {
                const columnPos = (width / 15) * i;
                const speed = 10 + (i % 3) * 7;
                const dropY = (frame * speed) % (height + 200);
                return (
                    <div key={i} style={{
                        position: 'absolute', left: columnPos, top: dropY - 200,
                        color: accentColor, fontSize: '12px', opacity: 0.2,
                    }}>
                        {((i + 10) * 123456).toString(36).substring(2, 8).toUpperCase()}
                    </div>
                );
            })}

            {/* SCANNING LASER */}
            <div style={{
                position: 'absolute',
                top: (frame * 10) % height,
                width: '100%', height: '3px',
                background: accentColor,
                boxShadow: `0 0 30px ${accentColor}`,
                zIndex: 10,
                opacity: frame > START_OUT ? 0 : 0.4,
            }} />

            <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', flex: 1,
                transform: `scale(${entrance}) translate(${glitchOffset}px, 0px)`,
            }}>
                <div style={{ position: 'relative' }}>
                    {['#22d3ee', '#f43f5e', '#fff'].map((color, idx) => (
                        <h1 key={color} style={{
                            fontSize: '140px', fontWeight: 900, color: color,
                            position: idx === 2 ? 'relative' : 'absolute',
                            top: idx === 0 ? '-4px' : idx === 1 ? '4px' : 0,
                            left: idx === 0 ? (isGlitching ? '-12px' : '-4px') : idx === 1 ? (isGlitching ? '12px' : '4px') : 0,
                            opacity: idx === 2 ? 1 : 0.7,
                            margin: 0, fontStyle: 'italic',
                        }}>
                            {channelName}
                        </h1>
                    ))}
                </div>

                <div style={{
                    marginTop: '20px',
                    width: interpolate(frame, [0, 40], [0, 600], { extrapolateRight: 'clamp' }),
                    height: '2px',
                    background: accentColor,
                }} />

                <div style={{
                    color: accentColor, fontSize: '16px', letterSpacing: '10px',
                    marginTop: '15px', fontWeight: 'bold',
                }}>
                    {statusMessage}: <span style={{ color: '#fff' }}>{statusResult}</span>
                </div>
            </div>

            <div style={{
                position: 'absolute', inset: 0,
                background: 'radial-gradient(circle, transparent 20%, rgba(0,0,0,0.8) 100%)',
                pointerEvents: 'none'
            }} />
        </AbsoluteFill>
    );
};
