// components/Backgrounds/MatrixBackground001/MatrixBackground001.tsx
import React, { useEffect, useRef } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { z } from 'zod';

export const MatrixBackgroundSchema = z.object({
    matrixColor: z.string().optional().default('#00ff66'),
    fontSize: z.number().optional().default(16),
    speedFactor: z.number().optional().default(1),
});

type MatrixBackgroundProps = z.infer<typeof MatrixBackgroundSchema>;

export const MatrixBackground001: React.FC<MatrixBackgroundProps> = ({
    matrixColor = '#00ff66',
    fontSize = 16,
    speedFactor = 1,
}) => {
    const frame = useCurrentFrame();
    const { width, height } = useVideoConfig();
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    // Universal Latin alphanumeric and core programming characters
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789X=$<>!+-*/%&|{}[]#@";
    const charArr = chars.split("");
    const columns = Math.floor(width / fontSize);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Pure black base fill
        ctx.fillStyle = '#050508';
        ctx.fillRect(0, 0, width, height);

        ctx.font = `bold ${fontSize}px monospace`;

        // Single pass loop - O(N) execution complex profile per frame render
        for (let i = 0; i < columns; i++) {
            // 1. Generate a deterministic speed variant for this column track index
            const speedTrackSeed = Math.sin(i * 45.67) * 0.4 + 0.6; // Speed scale modifier between 0.2 and 1.0
            const calculatedSpeed = speedFactor * speedTrackSeed;

            // 2. Continuous linear calculation instead of iterative lookup cycles
            const totalGridRows = Math.ceil(height / fontSize);
            const initialOffset = Math.floor(Math.abs(Math.sin(i * 12.34)) * totalGridRows * 2);

            // Exact row position coordinate matching the active timeline moment
            let currentLeadingY = Math.floor(initialOffset + (frame * calculatedSpeed)) % (totalGridRows + 20);
            currentLeadingY -= 15; // Offset to let streams enter cleanly from top screen boundary

            // 3. Render the falling track trail array segment behind the leading stream edge
            const trailLength = 14;
            for (let j = 0; j < trailLength; j++) {
                const currentRow = currentLeadingY - j;
                if (currentRow < 0 || currentRow > totalGridRows) continue;

                const yPos = currentRow * fontSize;
                const xPos = i * fontSize;

                // Generate stable, non-flashing deterministic character arrays per grid coordinate
                const charSeed = Math.sin(i * 98.76 + currentRow * 54.32);
                const charIndex = Math.floor(Math.abs(charSeed) * charArr.length) % charArr.length;
                const text = charArr[charIndex];

                // Determine fading gradient depth values
                if (j === 0) {
                    // Leading digital block gets highlighted terminal white profile glow
                    ctx.fillStyle = '#ffffff';
                } else {
                    // Calculate descending transparency values
                    const alphaValue = (1 - (j / trailLength)).toFixed(2);
                    ctx.fillStyle = `rgba(${hexToRgb(matrixColor)}, ${alphaValue})`;
                }

                ctx.fillText(text, xPos, yPos);
            }
        }
    }, [frame, width, height, matrixColor, fontSize, speedFactor, columns, charArr]);

    return (
        <canvas
            ref={canvasRef}
            width={width}
            height={height}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 0,
            }}
        />
    );
};

// Helper hex converter function to apply smooth canvas RGBA trail alpha overlays
function hexToRgb(hex: string): string {
    const sanitized = hex.replace('#', '');
    const bigint = parseInt(sanitized, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return isNaN(r) ? "0, 255, 102" : `${r}, ${g}, ${b}`;
}
