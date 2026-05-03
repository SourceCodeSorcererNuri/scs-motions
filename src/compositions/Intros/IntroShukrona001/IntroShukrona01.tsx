import React from 'react';
import {
    Audio,
    interpolate,
    spring,
    useCurrentFrame,
    useVideoConfig,
    AbsoluteFill,
    staticFile,
    Sequence,
} from 'remotion';
import { z } from 'zod';

// 1. Define the Schema for Remotion Sidebar
export const IntroShukronaSchema = z.object({
    channelName: z.string().default("SHUKRONA"),
    subTexts: z.array(z.string()).default(["OFFICIAL", "PRESENTS", "STUDIO"]),
    activeText: z.string().default("PRESENTS"),
    exitFrame: z.number().default(430), // Now adjustable in sidebar
});

export type IntroShukronaProps = z.infer<typeof IntroShukronaSchema>;

export const IntroShukrona001: React.FC<IntroShukronaProps> = ({
    channelName = "SHUKRONA",
    subTexts = [],
    activeText = "PRESENTS",
    exitFrame = 430
}) => {
    const frame = useCurrentFrame();
    const { fps, durationInFrames } = useVideoConfig();

    // --- MOTION LOGIC ---
    // Visuals begin their "exit" at frame 430
    const outMotion = spring({
        frame: frame - exitFrame,
        fps,
        config: { damping: 12, stiffness: 60 }
    });

    // --- ANIMATION CALCULATIONS ---
    const scale = interpolate(frame, [0, durationInFrames], [1.07, 0.9]) - (outMotion * 0.1);

    // 1. Overall Fade Logic: Fades IN at start, Fades OUT at the very end (SIMPLE FADE TO BLACK)
    const finalFadeOut = interpolate(
        frame,
        [durationInFrames - 20, durationInFrames - 1], // Fades out over the last 20 frames
        [1, 0],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    const entranceFade = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
    const combinedOpacity = Math.min(entranceFade, finalFadeOut);

    const blurEffect = interpolate(outMotion, [0, 1], [0, 20], { extrapolateRight: 'clamp' });
    const letters = channelName.toUpperCase().split("");

    // 2. Floor Reflection Color Control: Turn red reflection black during exit
    const reflectionRedness = interpolate(outMotion, [0, 1], [0.7, 0], { extrapolateRight: 'clamp' }); // Fades red to transparent

    return (
        <AbsoluteFill style={{
            backgroundColor: '#000', // The "Black" we are fading to
            perspective: '1500px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            opacity: combinedOpacity, // Applied to the entire component
        }}>
            {/* 1. DYNAMIC FLOOR REFLECTION (With red-to-black logic) */}
            <div style={{
                position: 'absolute',
                bottom: -50,
                width: '100%',
                height: '60%',
                // The reflection itself now gets darker during exit
                background: `linear-gradient(to top, rgba(64,0,0,${reflectionRedness}) 0%, rgba(32,0,0,${reflectionRedness * 0.5}) 25%, #0a0000 60%, #000000 100%)`,
                transform: `perspective(1200px) rotateX(55deg) scaleX(3)`,
                filter: `blur(${80 + blurEffect}px)`,
                opacity: (1 - outMotion) * 0.7,
                pointerEvents: 'none',
            }} />

            <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
                transform: `scale(${scale})`,
                filter: `blur(${blurEffect}px)`
            }}>
                {/* 2. LIGHTNING STRIKE */}
                <div style={{
                    position: 'absolute',
                    width: '2px',
                    height: '400px',
                    background: 'white',
                    filter: 'blur(100px)',
                    opacity: interpolate(frame, [15, 25, 35], [0, 0.8, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
                    transform: `translateX(${interpolate(frame, [15, 35], [-500, 500])}px) skewX(-45deg)`
                }} />

                {/* 3. MAIN TITLE */}
                <div style={{ display: 'flex', gap: '4px' }}>
                    {letters.map((char, i) => {
                        const delay = i * 1.5;
                        const spr = spring({
                            frame: frame - delay,
                            fps,
                            config: { damping: 15, stiffness: 100 }
                        });

                        return (
                            <span key={i} style={{
                                fontSize: '100px',
                                fontWeight: 900,
                                transform: `translateZ(${interpolate(spr, [0, 1], [-200, 0]) - (outMotion * 300)}px) rotateY(${interpolate(spr, [0, 1], [45, 0]) + (outMotion * 20)}deg)`,
                                background: 'linear-gradient(180deg, #FFFFFF 30%, #444444 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                opacity: spr,
                                filter: `drop-shadow(0 0 ${interpolate(spr, [0, 1], [20, 0])}px rgba(255,255,255,0.5))`,
                            }}>
                                {char === " " ? "\u00A0" : char}
                            </span>
                        );
                    })}
                </div>

                {/* 4. SUBTEXT LIST */}
                <div style={{
                    marginTop: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '40px',
                    opacity: spring({ frame: frame - 40, fps }) - outMotion,
                    transform: `translateY(${outMotion * 20}px)`
                }}>
                    {subTexts.map((text, i) => {
                        const isActive = text.toUpperCase() === activeText.toUpperCase();
                        return (
                            <div key={`${text}-${i}`} style={{ position: 'relative', overflow: 'hidden' }}>
                                <span style={{
                                    fontSize: '20px',
                                    fontWeight: 800,
                                    letterSpacing: '5px',
                                    color: isActive ? '#FF0000' : '#888',
                                    textShadow: isActive ? '0 0 20px rgba(255,0,0,0.4)' : 'none',
                                }}>
                                    {text}
                                </span>
                                <div style={{
                                    height: '2px',
                                    background: isActive ? '#FF0000' : '#888',
                                    width: '100%',
                                    transform: `translateX(${interpolate(spring({ frame: frame - 50 - (i * 5), fps }), [0, 1], [-105, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}%)`,
                                }} />
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* !!! FLASHBANG REMOVED !!! */}
            {/* The white lens flare div that used to be here is now deleted. */}

            {/* --- AUDIO SEQUENCES --- */}

            <Sequence name="Background Music" from={0}>
                <Audio
                    src={staticFile('audios/cinematic-shukrona-intro-bgm.mp3')}
                    volume={interpolate(
                        frame,
                        [0, 60, durationInFrames - 25, durationInFrames - 1],
                        [0, 0.5, 0.5, 0],
                        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
                    )}
                />
            </Sequence>

            <Sequence name="Entrance Whoosh" from={0} durationInFrames={60}>
                <Audio
                    src={staticFile('audios/WhooshSoundEffect01.mp3')}
                    volume={interpolate(frame, [0, 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}
                />
            </Sequence>

            <Sequence name="Exit Swoosh" from={exitFrame}>
                <Audio
                    src={staticFile('audios/SwooshSoundEffect001.mp3')}
                    volume={interpolate(
                        frame,
                        [exitFrame, exitFrame + 15],
                        [0, 1],
                        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
                    )}
                />
            </Sequence>

        </AbsoluteFill>
    );
};
