import React, { useMemo } from 'react';
import {
    interpolate,
    useCurrentFrame,
    AbsoluteFill,
    Easing
} from 'remotion';
import { z } from 'zod';

// 1. Zod Schema for validation and UI sync
export const DynamicTextSchema = z.object({
    text: z.string().default("SOURCE CODE"),
    fontSize: z.number().default(300),
    strokeColor: z.string().default('#ffffff'),
    fillColor: z.string().default('#ffffff'),
    strokeWidth: z.number().default(2),
    totalFrames: z.number().default(150),
    transitionPercent: z.number().min(0).max(0.5).default(0.4),
    fontUrl: z.string().optional().default(""),
});

export const DrawFillText: React.FC<z.infer<typeof DynamicTextSchema>> = (props) => {
    const frame = useCurrentFrame();

    // 1. All Hooks MUST be at the very top
    const fontStyle = useMemo(() => {
        const fontFamily = props.fontUrl ? 'CustomFont' : 'Times New Roman, serif';
        return {
            fontFamily,
            style: props.fontUrl ? `@font-face { font-family: 'CustomFont'; src: url('${props.fontUrl}'); }` : '',
        };
    }, [props.fontUrl]);

    // 2. Data parsing
    const totalFrames = Number(props.totalFrames);
    const transitionPercent = Number(props.transitionPercent);
    const fontSize = Number(props.fontSize) || 150;
    const text = props.text || "";

    // 3. Conditional Return AFTER Hooks
    if (isNaN(totalFrames) || isNaN(transitionPercent) || totalFrames <= 0) {
        return null;
    }

    // --- Rest of your animation logic (Interpolations, etc) ---
    const safeTotalFrames = Math.max(10, totalFrames);
    const safePercent = Math.max(0.01, Math.min(0.45, transitionPercent));
    const transitionFrames = safeTotalFrames * safePercent;

    // Anchor points for the animation timeline
    const p1_startIn = 0;
    const p2_endIn = transitionFrames;
    const p3_startOut = safeTotalFrames - transitionFrames;
    const p4_endOut = safeTotalFrames;

    // Internal split for Draw (80%) and Fill (20%)
    const p1_5_drawDone = p2_endIn * 0.8;
    const p3_5_undrawStart = p3_startOut + (transitionFrames * 0.2);

    // --- 4. STRICTLY MONOTONIC RANGES ---
    // The '+ 0.1' ensures values never overlap, preventing "inputRange" crashes
    const strokeRange = [
        p1_startIn,
        p1_5_drawDone,
        Math.max(p1_5_drawDone + 0.1, p3_5_undrawStart),
        Math.max(p3_5_undrawStart + 0.1, p4_endOut)
    ];

    const fillRange = [
        p1_5_drawDone,
        Math.max(p1_5_drawDone + 0.1, p2_endIn),
        Math.max(p2_endIn + 0.1, p3_startOut),
        Math.max(p3_startOut + 0.1, p3_5_undrawStart)
    ];

    // --- 5. INTERPOLATION LOGIC ---
    const easeInOut = Easing.bezier(0.42, 0, 0.58, 1);

    const drawProgress = interpolate(
        frame,
        strokeRange,
        [1, 0, 0, 1], // Offset multiplier: Hidden -> Drawn -> Drawn -> Hidden
        {
            easing: easeInOut,
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
        }
    );

    const fillOpacity = interpolate(
        frame,
        fillRange,
        [0, 1, 1, 0], // Alpha: Transparent -> Solid -> Solid -> Transparent
        {
            easing: Easing.out(Easing.quad),
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
        }
    );

    // Path calibration to keep "drawing" speed consistent
    const dashArray = fontSize * text.length;

    return (
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent' }}>
            <style>{fontStyle.style}</style>
            <svg width="100%" height="100%" viewBox="0 0 1600 600">
                <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    fontSize={fontSize}
                    fontFamily={fontStyle.fontFamily}
                    fontWeight="bold"
                    fill={props.fillColor}
                    fillOpacity={fillOpacity}
                    stroke={props.strokeColor}
                    strokeWidth={props.strokeWidth}
                    strokeDasharray={dashArray}
                    strokeDashoffset={drawProgress * dashArray}
                    style={{
                        filter: `drop-shadow(0 0 2px ${props.strokeColor})`,
                    }}
                >
                    {text}
                </text>
            </svg>
        </AbsoluteFill>
    );
};
