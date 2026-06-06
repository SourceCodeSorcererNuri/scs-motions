// components/Typography/DustText001.tsx
import React, { useEffect, useRef, useState } from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate, AbsoluteFill } from 'remotion';
import { z } from 'zod';

export const DustTextSchema = z.object({
    text: z.string().optional().default("CREATIVE ENGINE"),
    fontSize: z.number().optional().default(110),
    fontColor: z.string().optional().default("#ffffff"),
    dustColor: z.string().optional().default("#22d3ee"),
    particleDensity: z.number().min(1).max(5).optional().default(3),
    windIntensity: z.number().min(0).max(10).optional().default(3),
    noiseScale: z.number().min(0).max(5).optional().default(1.5),
    inDurationFrames: z.number().optional().default(60),
    outDurationFrames: z.number().optional().default(60),
});

type DustTextProps = z.infer<typeof DustTextSchema>;

interface ParticleNode {
    x: number;
    y: number;
    offsetX: number;
    offsetY: number;
    baseSize: number;
    alpha: number;
    timeDelay: number;
}

export const DustText001: React.FC<DustTextProps> = ({
    text = "CREATIVE ENGINE",
    fontSize = 110,
    fontColor = "#ffffff",
    dustColor = "#22d3ee",
    particleDensity = 3,
    windIntensity = 3,
    noiseScale = 1.5,
    inDurationFrames = 60,
    outDurationFrames = 60,
}) => {
    const frame = useCurrentFrame();
    const { fps, width, height, durationInFrames } = useVideoConfig();
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [nodes, setNodes] = useState<ParticleNode[]>([]);
    const [matrixReady, setMatrixReady] = useState(false);

    // --- BULLETPROOF TIMELINE DRIVER ---
    // Instead of running two independent springs that can fight each other,
    // we use a clean linear interpolation mapped precisely to your config parameters.

    const outStartFrame = durationInFrames - outDurationFrames;

    // Calculate a clean 0 to 1 progress value for the IN phase
    const gatherProgress = spring({
        frame,
        fps,
        config: { damping: 18, mass: 0.8, stiffness: 90 },
        durationInFrames: inDurationFrames
    });

    // Calculate a clean 0 to 1 progress value for the OUT phase
    const disperseProgress = spring({
        frame: Math.max(0, frame - outStartFrame),
        fps,
        config: { damping: 18, mass: 0.8, stiffness: 90 },
        durationInFrames: outDurationFrames
    });

    // Step 1: Calculate coordinates once on mount/update
    useEffect(() => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#ffffff';
        ctx.font = `900 ${fontSize}px Inter, system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, width / 2, height / 2);

        const bufferData = ctx.getImageData(0, 0, width, height).data;
        const generatedNodes: ParticleNode[] = [];
        const samplingStep = Math.max(1, 6 - particleDensity);

        for (let y = 0; y < height; y += samplingStep) {
            for (let x = 0; x < width; x += samplingStep) {
                const alphaIndex = (y * width + x) * 4 + 3;

                if (bufferData[alphaIndex] > 110) {
                    const angle = Math.random() * Math.PI * 2;
                    const dist = 400 + Math.random() * 400;
                    const windX = windIntensity * 70;
                    const windY = -(windIntensity * 25);

                    generatedNodes.push({
                        x,
                        y,
                        offsetX: Math.cos(angle) * dist + windX + (Math.random() - 0.5) * (noiseScale * 60),
                        offsetY: Math.sin(angle) * dist + windY + (Math.random() - 0.5) * (noiseScale * 60),
                        baseSize: Math.random() * 2.2 + 0.6,
                        alpha: Math.random() * 0.6 + 0.4,
                        // Stagger values relative to layout tracking
                        timeDelay: Math.random() * 0.3
                    });
                }
            }
        }

        setNodes(generatedNodes);
        setMatrixReady(true);
    }, [text, fontSize, width, height, particleDensity, windIntensity, noiseScale]);

    // Step 2: Continuous Frame Loop Render Target
    useEffect(() => {
        if (!matrixReady || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, width, height);

        // --- SOLID TEXT VECTOR REVEAL WINDOW ---
        // Completely independent of density to keep things readable
        let textGlobalAlpha = 0;
        if (frame < inDurationFrames) {
            textGlobalAlpha = interpolate(gatherProgress, [0.7, 1], [0, 1]);
        } else if (frame >= outStartFrame) {
            textGlobalAlpha = interpolate(disperseProgress, [0, 0.3], [1, 0]);
        } else {
            textGlobalAlpha = 1; // Pure lock hold stage
        }

        if (textGlobalAlpha > 0) {
            ctx.save();
            ctx.globalAlpha = textGlobalAlpha;
            ctx.fillStyle = fontColor;
            ctx.font = `900 ${fontSize}px Inter, system-ui, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(text, width / 2, height / 2);
            ctx.restore();
        }

        // --- PARTICLE MATRIX RUNTIME RENDERING ---
        const length = nodes.length;
        for (let i = 0; i < length; i++) {
            const node = nodes[i];

            let currentX = node.x;
            let currentY = node.y;
            let particleAlpha = node.alpha;
            let sizeMultiplier = 1;

            if (frame < outStartFrame) {
                // --- SECTION 1: INBOUND GATHERING ---
                // Account for individualized staggered delays cleanly
                const localInProgress = Math.min(1, Math.max(0, (gatherProgress - node.timeDelay * 0.5) / (1 - node.timeDelay * 0.5)));

                currentX = interpolate(localInProgress, [0, 1], [node.x + node.offsetX, node.x]);
                currentY = interpolate(localInProgress, [0, 1], [node.y + node.offsetY, node.y]);
                particleAlpha = interpolate(localInProgress, [0, 0.3], [0, node.alpha]);
                sizeMultiplier = interpolate(localInProgress, [0, 1], [2.5, 1]);

                ctx.fillStyle = localInProgress > 0.9 ? fontColor : dustColor;
            } else {
                // --- SECTION 2: OUTBOUND DISPERSAL ---
                const localOutProgress = Math.min(1, Math.max(0, (disperseProgress - node.timeDelay * 0.5) / (1 - node.timeDelay * 0.5)));

                currentX = interpolate(localOutProgress, [0, 1], [node.x, node.x - node.offsetX]);
                currentY = interpolate(localOutProgress, [0, 1], [node.y, node.y + node.offsetY]);
                particleAlpha = interpolate(localOutProgress, [0, 0.7], [node.alpha, 0]);
                sizeMultiplier = interpolate(localOutProgress, [0, 1], [1, 3]);

                ctx.fillStyle = localOutProgress > 0.1 ? dustColor : fontColor;
            }

            // Apply global safety clamping to transparency layer parameters
            ctx.globalAlpha = Math.max(0, Math.min(1, particleAlpha));
            const finalSize = node.baseSize * sizeMultiplier;

            ctx.fillRect(
                currentX - finalSize / 2,
                currentY - finalSize / 2,
                finalSize,
                finalSize
            );
        }
    }, [frame, matrixReady, nodes, gatherProgress, disperseProgress, fontColor, dustColor, fontSize, text, width, height, inDurationFrames, outStartFrame]);

    return (
        <AbsoluteFill>
            <canvas
                ref={canvasRef}
                width={width}
                height={height}
                style={{ width: '100%', height: '100%' }}
            />
        </AbsoluteFill>
    );
};
