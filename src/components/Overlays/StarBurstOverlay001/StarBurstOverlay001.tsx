import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, random, interpolate } from 'remotion';
import { z } from 'zod';

export const StarBurst001Schema = z.object({
    version: z.enum(['gold', 'silver']).default('gold'),
});

export type StarBurstProps = z.infer<typeof StarBurst001Schema>;

const EDGE_STAR_COUNT = 130;
const LIFECYCLE = 180;
const SPIKE_WIDTH = 1.0;
const FLICKER_SPEED = 0.4;
const FLICKER_INTENSITY = 0.3;

export const StarBurstOverlay001: React.FC<Partial<StarBurstProps>> = ({
    version = 'gold'
}) => {
    const frame = useCurrentFrame();
    const { width, height } = useVideoConfig();

    // --- SORCERER COLOR ENGINE ---
    const colors = useMemo(() => {
        if (version === 'gold') {
            return {
                main: '#FFD700',      // Pure Gold
                glow: '#BF953F',      // Deep Bronze Glow
                accent: '#FFFACD',    // Lemon Chiffon Highlights
            };
        }
        return {
            main: '#E0E0E0',          // Platinum/Silver
            glow: '#808080',          // Steel Glow
            accent: '#FFFFFF',        // Pure White Highlights
        };
    }, [version]);

    const stars = useMemo(() => {
        return new Array(EDGE_STAR_COUNT).fill(0).map((_, i) => ({
            edge: i % 4,
            edgePos: random(`pos-${i}`),
            size: 10 + random(`s-${i}`) * 13,
            delay: random(`d-${i}`) * LIFECYCLE,
            rotationSpeed: (random(`r-${i}`) - 0.5) * 0.1,
            travelDistance: 180 + random(`t-${i}`) * 70,
            flickerOffset: random(`f-${i}`) * Math.PI * 2,
        }));
    }, [width, height]); // Re-calculate stars if resolution changes

    return (
        <AbsoluteFill style={{ backgroundColor: 'transparent', overflow: 'hidden' }}>
            <canvas
                width={width}
                height={height}
                ref={(canvas) => {
                    if (!canvas) return;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) return;
                    ctx.clearRect(0, 0, width, height);

                    stars.forEach((s) => {
                        const loopFrame = (frame + s.delay) % LIFECYCLE;
                        const progress = interpolate(loopFrame, [0, LIFECYCLE * 0.85], [0, 1], {
                            extrapolateRight: 'clamp'
                        });

                        const flicker = 1 - (Math.sin(frame * FLICKER_SPEED + s.flickerOffset) * FLICKER_INTENSITY);

                        const distFromEdgeCenter = Math.abs(s.edgePos - 0.5) * 2;
                        const curvature = Math.pow(distFromEdgeCenter, 2) * 130;
                        const forwardMovement = (progress * s.travelDistance) + curvature;
                        const pullFactor = 40 * progress * (s.edgePos - 0.5);

                        let x = 0, y = 0;
                        if (s.edge === 0) { x = s.edgePos * width - pullFactor; y = -50 + forwardMovement; }
                        else if (s.edge === 1) { x = s.edgePos * width - pullFactor; y = height + 50 - forwardMovement; }
                        else if (s.edge === 2) { x = -50 + forwardMovement; y = s.edgePos * height - pullFactor; }
                        else if (s.edge === 3) { x = width + 50 - forwardMovement; y = s.edgePos * height - pullFactor; }

                        const dx = x - width / 2;
                        const dy = y - height / 2;
                        const distFromCenter = Math.sqrt(dx * dx + dy * dy);

                        const safeZone = Math.min(width, height) * 0.25;
                        const radialAlpha = interpolate(distFromCenter, [safeZone, safeZone + 100], [0, 1], {
                            extrapolateLeft: 'clamp',
                            extrapolateRight: 'clamp'
                        });

                        const baseOpacity = interpolate(progress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
                        const finalOpacity = baseOpacity * radialAlpha * flicker;

                        if (finalOpacity > 0) {
                            ctx.save();
                            ctx.translate(x, y);
                            ctx.rotate(frame * s.rotationSpeed);
                            ctx.globalAlpha = finalOpacity;

                            // Dynamic Metallic Shadow
                            ctx.shadowBlur = 8 * finalOpacity;
                            ctx.shadowColor = colors.glow;

                            // Create a small gradient for the spike to look "shiny"
                            const gradient = ctx.createLinearGradient(0, 0, 0, s.size);
                            gradient.addColorStop(0, colors.accent);
                            gradient.addColorStop(1, colors.main);
                            ctx.fillStyle = gradient;

                            for (let j = 0; j < 4; j++) {
                                ctx.rotate(Math.PI / 2);
                                ctx.beginPath();
                                ctx.moveTo(0, 0);
                                ctx.lineTo(SPIKE_WIDTH, 0);
                                ctx.lineTo(0, s.size * flicker * finalOpacity);
                                ctx.lineTo(-SPIKE_WIDTH, 0);
                                ctx.fill();
                            }

                            // Center core
                            ctx.beginPath();
                            ctx.arc(0, 0, 1.5 * finalOpacity, 0, Math.PI * 2);
                            ctx.fillStyle = colors.accent;
                            ctx.fill();

                            ctx.restore();
                        }
                    });
                }}
                style={{ mixBlendMode: 'screen' }}
            />
        </AbsoluteFill>
    );
};
