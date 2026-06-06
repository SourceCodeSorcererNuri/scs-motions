// components/Social/Reminders/SocialWatermark001.tsx
import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate, AbsoluteFill } from 'remotion';
import { z } from 'zod';

export const WatermarkPlatformSchema = z.object({
    platformName: z.enum(['Telegram', 'Instagram', 'YouTube', 'GitHub', 'X']),
    handle: z.string(),
});

export const SocialWatermarkSchema = z.object({
    accounts: z.array(WatermarkPlatformSchema),
    themeStyle: z.enum(['minimal', 'glassmorphic', 'neumorphic']).optional().default('glassmorphic'),
    // Full user color control overrides
    backgroundColor: z.string().optional().default('#12141d'),
    fontColor: z.string().optional().default('#ffffff'),
    accentColor: z.string().optional().default('#00ff66'),
    displayDurationFrames: z.number().optional().default(120),
});

type SocialWatermarkProps = z.infer<typeof SocialWatermarkSchema>;

export const SocialWatermark001: React.FC<SocialWatermarkProps> = ({
    accounts,
    themeStyle = 'glassmorphic',
    backgroundColor = '#12141d',
    fontColor = '#ffffff',
    accentColor = '#00ff66',
    displayDurationFrames = 120,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    if (!accounts || accounts.length === 0) return null;

    const totalCycleFrames = accounts.length * displayDurationFrames;
    const currentCycleFrame = frame % totalCycleFrames;
    const activeIndex = Math.floor(currentCycleFrame / displayDurationFrames);
    const localFrame = currentCycleFrame % displayDurationFrames;

    const activeAccount = accounts[activeIndex];

    // Motion Physics Engines
    const springEntrance = spring({
        frame: localFrame,
        fps,
        config: { damping: 15, mass: 0.5, stiffness: 120 },
    });

    const springExit = spring({
        frame: Math.max(0, localFrame - (displayDurationFrames - 12)),
        fps,
        config: { damping: 12, mass: 0.4, stiffness: 150 },
    });

    const activeProgress = springEntrance - springExit;
    const scale = interpolate(activeProgress, [0, 1], [0.88, 1]);
    const opacity = interpolate(activeProgress, [0, 1], [0, 1]);

    // Vector Platform Icon Library Pack
    const getSVGIcon = (platform: string) => {
        const paths: Record<string, string> = {
            Telegram: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-12S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-1-.65-.35-1 .22-1.62.15-.15 2.7-2.48 2.75-2.7.01-.03.01-.14-.07-.2-.08-.07-.19-.05-.27-.03-.12.02-2 1.23-5.63 3.69-.53.36-1.01.54-1.44.53-.48-.01-1.4-.27-2.08-.5-.83-.27-1.49-.42-1.43-.88.03-.24.36-.49.99-.74 3.88-1.69 6.47-2.8 7.77-3.32 3.7-1.47 4.46-1.73 4.96-1.74.11 0 .36.03.52.16.14.11.18.27.2.38-.01.07 0 .22-.02.3z",
            GitHub: "M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.646.64.699 1.026 1.592 1.026 2.683 0 3.842-2.337 4.687-4.565 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z",
            Instagram: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z",
            YouTube: "M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
            X: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
        };

        return (
            <svg viewBox="0 0 24 24" style={{ width: '48px', height: '48px', fill: themeStyle === 'neumorphic' ? accentColor : fontColor }}>
                <path d={paths[platform] || ""} />
            </svg>
        );
    };

    // Structural Theme Style Engine Configurations
    const getThemeStyles = () => {
        switch (themeStyle) {
            case 'minimal':
                return {
                    backgroundColor: backgroundColor,
                    border: `2px solid ${accentColor}`,
                    boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                    backdropFilter: 'none',
                };
            case 'neumorphic':
                // Soft tactile bevel structure calculated from user base coloring parameters
                return {
                    backgroundColor: backgroundColor,
                    border: 'none',
                    boxShadow: `12px 12px 24px rgba(0, 0, 0, 0.4), -12px -12px 24px rgba(255, 255, 255, 0.04), inset 1px 1px 0px rgba(255,255,255,0.05)`,
                    backdropFilter: 'none',
                };
            case 'glassmorphic':
            default:
                // Premium semitransparent blurring engine profile
                return {
                    backgroundColor: hexToRgbRGBA(backgroundColor, 0.65),
                    backdropFilter: `blur(${interpolate(activeProgress, [0, 1], [20, 0])}px) saturate(140%)`,
                    border: `1px solid rgba(255, 255, 255, 0.08)`,
                    borderBottom: `3px solid ${accentColor}`,
                    boxShadow: '0 40px 80px rgba(0,0,0,0.5)',
                };
        }
    };

    return (
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '28px',
                    padding: '32px 56px',
                    borderRadius: themeStyle === 'neumorphic' ? '36px' : '16px',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    color: fontColor,
                    transform: `scale(${scale})`,
                    opacity: opacity,
                    transition: 'background-color 0.2s ease',
                    minWidth: '500px',
                    ...getThemeStyles(),
                }}
            >
                {/* ICON HOLDER GRID BLOCK */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: themeStyle === 'neumorphic' ? 'rgba(0,0,0,0.15)' : 'rgba(255, 255, 255, 0.03)',
                        boxShadow: themeStyle === 'neumorphic' ? 'inset 4px 4px 10px rgba(0,0,0,0.3), inset -4px -4px 10px rgba(255,255,255,0.02)' : 'none',
                        padding: '16px',
                        borderRadius: themeStyle === 'neumorphic' ? '24px' : '12px',
                        border: themeStyle === 'neumorphic' ? 'none' : '1px solid rgba(255, 255, 255, 0.05)'
                    }}
                >
                    {getSVGIcon(activeAccount.platformName)}
                </div>

                {/* TEXT CONTENT CONTAINER SECTION */}
                <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <span
                        style={{
                            fontSize: '14px',
                            color: themeStyle === 'minimal' ? fontColor : accentColor,
                            textTransform: 'uppercase',
                            letterSpacing: '2px',
                            fontWeight: 700,
                            marginBottom: '2px',
                            opacity: 0.8,
                            transform: `translateY(${interpolate(springEntrance, [0, 1], [15, 0])}px)`
                        }}
                    >
                        {activeAccount.platformName}
                    </span>
                    <span
                        style={{
                            fontSize: '34px',
                            fontWeight: 700,
                            letterSpacing: '-0.5px',
                            transform: `translateY(${interpolate(springEntrance, [0, 1], [30, 0])}px)`
                        }}
                    >
                        {activeAccount.handle}
                    </span>
                </div>
            </div>
        </AbsoluteFill>
    );
};

// Clean utility converter logic to inject Alpha values into arbitrary User Hex parameter selections
function hexToRgbRGBA(hex: string, alpha: number): string {
    const sanitized = hex.replace('#', '');
    const bigint = parseInt(sanitized, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return isNaN(r) ? `rgba(18, 20, 29, ${alpha})` : `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
