import React from 'react';
import {
    interpolate,
    spring,
    useCurrentFrame,
    useVideoConfig,
} from 'remotion';
import { z } from 'zod';

export const PhoneNumberSchema = z.object({
    phoneNumber: z.string().default("+998 90 123 45 67"),
});

export type PhoneNumberProps = z.infer<typeof PhoneNumberSchema>;

export const PhoneNumberMotion001: React.FC<PhoneNumberProps> = ({
    phoneNumber = "+998 90 123 45 67"
}) => {
    const frame = useCurrentFrame();
    const { fps, durationInFrames } = useVideoConfig();
    const safePhoneNumber = phoneNumber || "";

    const entrance = spring({
        frame,
        fps,
        config: { damping: 10, stiffness: 150, mass: 0.8 },
    });

    const jumpIn = interpolate(entrance, [0, 1], [0.5, 1]);
    const slideOut = interpolate(entrance, [0, 1], [-50, 0]);

    const ringSway = Math.sin(frame / 1.5) * 5;
    const isRinging = Math.floor(frame / 30) % 2 === 0;
    const rotation = isRinging ? ringSway : 0;

    const iconEntrance = spring({
        frame: Math.max(0, frame - 15),
        fps,
        config: { damping: 12, stiffness: 120 }
    });

    const exitSpring = spring({
        frame: Math.max(0, frame - (durationInFrames - 30)), // Simplified exit timing
        fps,
        config: { stiffness: 200, damping: 20 },
    });

    const exitScale = interpolate(exitSpring, [0, 1], [1, 0.8]);
    const exitOpacity = interpolate(exitSpring, [0, 1], [1, 0]);
    const exitSlide = interpolate(exitSpring, [0, 1], [0, 20]);

    const labelText = "Murojat uchun:";

    // Fixed timing function
    const getSkeuoSpring = (index: number, baseDelay: number) => {
        return spring({
            frame: frame - (baseDelay + index * 2),
            fps,
            config: { stiffness: 120, damping: 12, mass: 1 },
        });
    };

    const pillRadius = 27.75;

    return (
        <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <svg
                width="1920"
                height="1080"
                viewBox="0 0 508 286"
                style={{ width: '100%', height: '100%' }}
            >
                <defs>
                    <linearGradient id="emeraldGradient" x1="109" y1="130" x2="139" y2="160" gradientUnits="userSpaceOnUse">
                        <stop offset="0" stopColor="#01ff80" />
                        <stop offset="0.5" stopColor="#2f9400" />
                        <stop offset="1" stopColor="#00fd81" />
                    </linearGradient>
                    <linearGradient id="pillGradient" x1="137" y1="37" x2="355" y2="255" gradientUnits="userSpaceOnUse">
                        <stop offset="0" stopColor="#ffffff" />
                        <stop offset="0.6" stopColor="#d8d8d8" />
                        <stop offset="0.86" stopColor="#9a9a9a" />
                    </linearGradient>
                    <linearGradient id="bevelStroke" x1="137" y1="37" x2="355" y2="255" gradientUnits="userSpaceOnUse">
                        <stop offset="0.14" stopColor="#000000" />
                        <stop offset="0.5" stopColor="#676767" />
                        <stop offset="0.84" stopColor="#ffffff" />
                    </linearGradient>
                    <filter id="bigShadow" x="-20%" y="-20%" width="150%" height="150%">
                        <feGaussianBlur stdDeviation="3.6" />
                    </filter>
                </defs>

                <g style={{
                    opacity: entrance * exitOpacity,
                    transform: `scale(${jumpIn * exitScale}) translateX(${exitSlide}px)`,
                    transformOrigin: '254px 143px'
                }}>
                    <rect
                        fill="#333"
                        opacity="0.4"
                        filter="url(#bigShadow)"
                        width="307.8"
                        height="55.5"
                        x="103"
                        y="130"
                        rx={pillRadius}
                        ry={pillRadius}
                    />
                    <rect
                        fill="url(#pillGradient)"
                        stroke="url(#bevelStroke)"
                        strokeWidth="1.3"
                        width="307.8"
                        height="55.5"
                        x="92.8"
                        y="118.4"
                        rx={pillRadius}
                        ry={pillRadius}
                    />

                    <g id="PhoneNumIcon" style={{ opacity: iconEntrance, transform: `scale(${iconEntrance})`, transformOrigin: '124.3px 145.7px' }}>
                        <circle fill="url(#emeraldGradient)" cx="124.3" cy="145.7" r="21.2" stroke="#676767" strokeWidth="1.5" />
                        <g style={{ transformOrigin: '121px 145px', transform: `rotate(${rotation}deg)` }}>
                            <path fill="none" stroke="#000" strokeWidth="1.8" d="m 121.8,137.5 -3.7,-3.8 c -0.4,-0.3 -1,-0.3 -1.5,0 l -2.8,2.9 c -0.6,0.5 -0.8,1.4 -0.5,2.1 0.7,2 2.6,6.2 6.3,10 3.7,3.7 7.9,5.5 10,6.3 0.8,0.2 1.6,0 2.2,-0.4 l 2.8,-2.8 c 0.4,-0.4 0.4,-1 0,-1.5 l -3.7,-3.7 c -0.4,-0.4 -1,-0.4 -1.5,0 l -2.2,2.2 c 0,0 -2.5,-1 -4.5,-3 -2,-1.9 -3,-4.5 -3,-4.5 l 2.2,-2.2 c 0.4,-0.4 0.4,-1.1 0,-1.5 z" />
                        </g>
                    </g>

                    <g style={{ transform: `translateX(${slideOut}px)` }}>
                        {/* Simplified Text rendering to avoid SVG to Image failures */}
                        <text
                            x="265"
                            y="137"
                            textAnchor="middle"
                            style={{
                                fontFamily: 'Inter, sans-serif',
                                fontWeight: 'bold',
                                fontSize: '17.4px',
                                fill: '#444',
                            }}
                        >
                            {labelText}
                        </text>

                        <text
                            x="265"
                            y="160.4"
                            textAnchor="middle"
                            style={{
                                fontFamily: 'Inter, sans-serif',
                                fontWeight: 900,
                                fontSize: '23.1px',
                                fill: '#222'
                            }}
                        >
                            {safePhoneNumber}
                        </text>
                    </g>
                </g>
            </svg>
        </div>
    );
};
