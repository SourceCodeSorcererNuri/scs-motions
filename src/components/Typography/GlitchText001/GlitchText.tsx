import React, { useMemo } from 'react';
import { useCurrentFrame, interpolate, useVideoConfig, AbsoluteFill, spring, random } from 'remotion';
import { z } from 'zod';

export const GlitchTextSchema = z.object({
    text: z.string().default("SOURCE CODE SORCERER"), // Default here
    fontColor: z.string().default('#00ff00'),
    fontSize: z.number().default(60),
    glitchFrequency: z.number().default(0.3),
});

const GLITCH_CHARS = '01$#!@%^&*()_+{}:"<>?|~';

export const GlitchText: React.FC<z.infer<typeof GlitchTextSchema>> = ({
    text = "DECRYPTING...", // Defensive fallback
    fontColor,
    fontSize,
    glitchFrequency
}) => {
    const frame = useCurrentFrame();
    const { fps, durationInFrames } = useVideoConfig();

    // 1. Safety Guard: Ensure text is always a string
    const safeText = text || "";

    // 2. Kinetic Entrance
    const entrance = spring({
        frame,
        fps,
        config: { stiffness: 100, damping: 20 },
    });

    // 3. The "Decryption" Logic
    // FIX: Using safeText.length so it never accesses property of undefined
    const endFrame = Math.floor(durationInFrames * 0.7);
    const progress = interpolate(frame, [0, endFrame], [0, safeText.length], {
        extrapolateRight: 'clamp',
    });

    // 4. Global Glitch State
    const isGlitching = random(`glitch-${frame}`) < glitchFrequency;
    const globalOffset = isGlitching ? (random(frame) - 0.5) * 15 : 0;

    return (
        <AbsoluteFill style={{
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'transparent',
            perspective: '1000px'
        }}>
            <div style={{
                display: 'flex',
                flexDirection: 'row',
                transform: `translateX(${globalOffset}px) scale(${0.8 + 0.2 * entrance})`,
                filter: `blur(${isGlitching ? 1 : 0}px)`,
                opacity: entrance,
            }}>
                {/* FIX: Map over safeText */}
                {safeText.split('').map((char, i) => {
                    const charProgress = progress - i;
                    const isLocked = charProgress > 0;
                    const isRevealing = charProgress > -3 && charProgress <= 0;

                    const charJitter = isRevealing ? (random(`j-${frame}-${i}`) - 0.5) * 5 : 0;

                    let displayChar = char;
                    if (!isLocked) {
                        const charSeed = Math.floor(frame / 2) + i;
                        displayChar = GLITCH_CHARS[charSeed % GLITCH_CHARS.length];
                    }

                    return (
                        <div key={i} style={{
                            position: 'relative',
                            fontFamily: 'monospace',
                            fontWeight: 'bold',
                            fontSize,
                            color: isLocked ? fontColor : '#fff',
                            textShadow: isLocked ? `0 0 10px ${fontColor}aa` : '0 0 15px #fff',
                            transform: `translateY(${charJitter}px)`,
                            opacity: isLocked ? 1 : isRevealing ? 0.6 : 0,
                            transition: 'color 0.2s ease',
                            width: char === ' ' ? fontSize / 2 : 'auto'
                        }}>
                            {displayChar}

                            {isRevealing && (
                                <span style={{
                                    position: 'absolute',
                                    left: 2,
                                    top: 0,
                                    color: '#ff00ff',
                                    zIndex: -1,
                                    opacity: 0.5
                                }}>{displayChar}</span>
                            )}
                        </div>
                    );
                })}

                <div style={{
                    width: fontSize / 1.5,
                    height: fontSize / 8,
                    backgroundColor: fontColor,
                    alignSelf: 'flex-end',
                    marginBottom: fontSize / 4,
                    marginLeft: 4,
                    boxShadow: `0 0 10px ${fontColor}`,
                    opacity: Math.floor(frame / 4) % 2 === 0 ? 1 : 0
                }} />
            </div>
        </AbsoluteFill>
    );
};
