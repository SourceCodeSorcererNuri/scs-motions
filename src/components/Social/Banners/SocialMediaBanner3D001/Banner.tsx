import React, { useMemo } from 'react';
import {
    AbsoluteFill,
    spring,
    useCurrentFrame,
    useVideoConfig,
    interpolate,
} from 'remotion';
import { z } from 'zod';

// The Icon Library
const Icons = {
    Github: () => <svg width="70" height="70" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>GitHub</title><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg>,
    Instagram: () => <svg width="70" height="70" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>,
    YouTube: () => <svg width="70" height="70" viewBox="0 0 24 24" fill="black"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33zM9.75 15.02V8.48L15.45 11.75l-5.7 3.27z" /></svg>,
    Telegram: () => <svg fill="#000000" width="70" height="70" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>telegram</title><path d="M22.26465,2.42773a2.04837,2.04837,0,0,0-2.07813-.32421L2.26562,9.33887a2.043,2.043,0,0,0,.1045,3.81836l3.625,1.26074,2.0205,6.68164A.998.998,0,0,0,8.134,21.352c.00775.012.01868.02093.02692.03259a.98844.98844,0,0,0,.21143.21576c.02307.01758.04516.03406.06982.04968a.98592.98592,0,0,0,.31073.13611l.01184.001.00671.00287a1.02183,1.02183,0,0,0,.20215.02051c.00653,0,.01233-.00312.0188-.00324a.99255.99255,0,0,0,.30109-.05231c.02258-.00769.04193-.02056.06384-.02984a.9931.9931,0,0,0,.20429-.11456,250.75993,250.75993,0,0,1,.15222-.12818L12.416,18.499l4.03027,3.12207a2.02322,2.02322,0,0,0,1.24121.42676A2.05413,2.05413,0,0,0,19.69531,20.415L22.958,4.39844A2.02966,2.02966,0,0,0,22.26465,2.42773ZM9.37012,14.73633a.99357.99357,0,0,0-.27246.50586l-.30951,1.504-.78406-2.59307,4.06525-2.11695ZM17.67188,20.04l-4.7627-3.68945a1.00134,1.00134,0,0,0-1.35352.11914l-.86541.9552.30584-1.48645,7.083-7.083a.99975.99975,0,0,0-1.16894-1.59375L6.74487,12.55432,3.02051,11.19141,20.999,3.999Z" /></svg>,
};

export const BannerProps = z.object({
    channelName: z.string(),
    // We tell Zod exactly which words are allowed in the array
    iconKeys: z.array(z.enum(["Telegram", "Instagram", "YouTube", "Github"])),
});

export type BannerProps = z.infer<typeof BannerProps>;

const HighPopButton: React.FC<{ icon: React.ReactNode; delay: number }> = ({ icon, delay }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const springVal = spring({ frame: frame - delay, fps, config: { damping: 10, stiffness: 100 } });
    const height = interpolate(springVal, [0, 1], [0, 40]);

    return (
        <div style={{
            width: 160, height: 160, position: 'relative', transformStyle: 'preserve-3d',
            transform: `translateZ(${height}px) scale(${springVal})`,
        }}>
            <div style={{
                position: 'absolute', inset: 0, backgroundColor: '#000', borderRadius: 24,
                transform: 'translateZ(-20px)',
            }} />
            <div style={{
                position: 'absolute', inset: 0, backgroundColor: 'white', border: '5px solid black',
                borderRadius: 24, display: 'flex', justifyContent: 'center', alignItems: 'center',
                transform: 'translateZ(0px)',
            }}>
                {icon}
            </div>
        </div>
    );
};

export const Banner: React.FC<BannerProps> = ({ channelName, iconKeys }) => {
    const safeIcons = useMemo(() => {
        if (Array.isArray(iconKeys)) return iconKeys;
        if (typeof iconKeys === 'string') return (iconKeys as string).split(',').map(s => s.trim());
        return ["Telegram"]; // Default fallback
    }, [iconKeys]);
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const entrance = spring({ frame, fps, config: { damping: 12 } });
    const float = Math.sin(frame / 15) * 12;

    return (
        <AbsoluteFill style={{
            backgroundColor: '#ffffff00', perspective: '3000px', display: 'flex',
            justifyContent: 'center', alignItems: 'center'
        }}>
            <div style={{
                width: 550, height: 750, position: 'relative', transformStyle: 'preserve-3d',
                transform: `rotateX(50deg) rotateY(5deg) rotateZ(-20deg) scale(${entrance}) translateY(${float}px)`,
            }}>
                <div style={{
                    position: 'absolute', inset: 0, backgroundColor: 'black', borderRadius: 60,
                    transform: 'translateZ(-40px)', boxShadow: '80px 100px 60px rgba(0,0,0,0.5)',
                }} />

                <div style={{
                    position: 'absolute', inset: 0, backgroundColor: 'white', borderRadius: 60,
                    border: '8px solid black', padding: 40, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', transformStyle: 'preserve-3d',
                }}>
                    <div style={{
                        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, marginTop: 30,
                        transformStyle: 'preserve-3d'
                    }}>
                        {safeIcons.slice(0, 4).map((key, index) => {
                            const IconComponent = Icons[key as keyof typeof Icons];
                            return IconComponent ? (
                                <HighPopButton key={`${key}-${index}`} delay={15 + (index * 3)} icon={<IconComponent />} />
                            ) : null;
                        })}
                    </div>

                    <div style={{
                        marginTop: 80, backgroundColor: 'black', color: 'white', padding: '25px 45px',
                        borderRadius: 100, fontSize: 24, fontWeight: 900, fontFamily: 'system-ui, sans-serif',
                        transform: 'translateZ(40px)', boxShadow: '-10px 25px 0 #333'
                    }}>
                        {channelName || "KANAL_NOMI"}
                    </div>
                </div>
            </div>
        </AbsoluteFill>
    );
};
