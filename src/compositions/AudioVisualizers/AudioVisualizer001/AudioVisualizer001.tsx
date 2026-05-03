import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useAudioData, visualizeAudio } from "@remotion/media-utils";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig, Audio, interpolate, spring } from 'remotion';
import { z } from 'zod';
import * as mm from 'music-metadata-browser';
import * as Vibrant from 'node-vibrant/browser';

// --- Helper: Procedural Colors & Names ---
const stringToColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return `hsl(${hash % 360}, 70%, 50%)`;
};

const cleanFileName = (name: string) => {
    return name
        .replace(/\.[^/.]+$/, "") // Remove extension
        .replace(/[_-]/g, " ")   // Replace underscores/dashes with spaces
        .replace(/\b(4k|mp3|official|lyrics|video|hd)\b/gi, ""); // Clean common tags
};

// --- Types & Config ---
const AUDIO_FILES = ["music001.mp3", "music002.mp3", "music003.mp3", "music004.mp3", "music005.mp3", "music006.mp3", "music007.mp3", "TEST AUDIO.mp3", "INSANE.mp3"] as const;
const BAR_COUNT = 140;

export const AudioVisualizerSchema = z.object({
    audioFileName: z.enum(AUDIO_FILES),
    baseGlow: z.number().min(0).max(200),
});

// --- Component: Fallback Placeholder ---
const ArtworkFallback: React.FC<{ name: string; pulse: number; color: string }> = ({ name, pulse, color }) => {
    return (
        <AbsoluteFill style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: `linear-gradient(45deg, #1a1a1a, #000)`,
            fontSize: 200, fontWeight: 900, color: 'white',
            border: `4px solid ${color}`
        }}>
            <div style={{
                position: 'absolute', inset: 0, opacity: 0.3,
                backgroundImage: `radial-gradient(circle at 50% 50%, ${color} 0%, transparent 80%)`,
                transform: `scale(${1 + pulse * 0.5})`
            }} />
            {name.charAt(0).toUpperCase()}
        </AbsoluteFill>
    );
};

// --- Sub-Component: Canvas Symmetrical Bars (Keep existing) ---
const CanvasBars: React.FC<{
    frequencyData: number[];
    pulse: number;
    palette: { vibrant: string; lightVibrant: string }
}> = ({ frequencyData, pulse, palette }) => {
    const frame = useCurrentFrame();
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, 1200, 1200);
        ctx.save();
        ctx.translate(600, 600);
        ctx.rotate((frame * 0.15 * Math.PI) / 180);

        frequencyData.forEach((v, i) => {
            const radius = 270 + (pulse * 40);
            const angleBase = (i / (BAR_COUNT / 2)) * Math.PI;
            const barHeight = v * 500 * (1 + pulse * 0.5);

            [-1, 1].forEach(side => {
                const angle = angleBase * side;
                const x1 = Math.cos(angle) * radius;
                const y1 = Math.sin(angle) * radius;
                const x2 = Math.cos(angle) * (radius + barHeight);
                const y2 = Math.sin(angle) * (radius + barHeight);
                const grad = ctx.createLinearGradient(x1, y1, x2, y2);
                grad.addColorStop(0, palette.lightVibrant);
                grad.addColorStop(1, palette.vibrant);
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.strokeStyle = grad;
                ctx.lineWidth = interpolate(v, [0, 1], [4, 18], { extrapolateRight: 'clamp' });
                ctx.lineCap = 'round';
                ctx.globalAlpha = interpolate(v, [0, 0.4], [0.3, 1], { extrapolateRight: 'clamp' });
                ctx.stroke();
            });
        });
        ctx.restore();
    }, [frame, frequencyData, pulse, palette]);

    return <canvas ref={canvasRef} width={1200} height={1200} style={{ position: 'absolute', width: 1200, height: 1200 }} />;
};

const ReactiveParticles: React.FC<{ pulse: number; color: string }> = ({ pulse, color }) => {
    const frame = useCurrentFrame();
    const { width, height } = useVideoConfig();
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const PARTICLE_COUNT = 250;
    const particles = useMemo(() => {
        return Array.from({ length: PARTICLE_COUNT }).map(() => ({
            x: Math.random() * width - width / 2,
            y: Math.random() * height - height / 2,
            z: Math.random() * width,
            prevZ: 0,
        }));
    }, [width, height]);

    useEffect(() => {
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, width, height);
        // This is the "Parallax" logic: speed tied to pulse
        const speed = 2 + pulse * 60;

        particles.forEach((p) => {
            p.prevZ = p.z;
            p.z -= speed;
            if (p.z <= 0) { p.z = width; p.prevZ = width; }

            const k = 128 / p.z;
            const px = p.x * k + width / 2;
            const py = p.y * k + height / 2;
            const kPrev = 128 / p.prevZ;
            const pxPrev = p.x * kPrev + width / 2;
            const pyPrev = p.y * kPrev + height / 2;

            if (px > 0 && px < width && py > 0 && py < height) {
                ctx.beginPath();
                ctx.moveTo(pxPrev, pyPrev);
                ctx.lineTo(px, py);
                ctx.strokeStyle = color;
                ctx.lineWidth = (1 - p.z / width) * 4;
                ctx.lineCap = 'round';
                ctx.stroke();
            }
        });
    }, [frame, pulse, color, width, height, particles]);

    return (
        <canvas
            ref={canvasRef}
            width={width}
            height={height}
            style={{
                position: 'absolute',
                inset: 0,
                mixBlendMode: 'screen',
                opacity: 0.3 // Keep it subtle so it doesn't distract from the bars
            }}
        />
    );
};

const Letter: React.FC<{ char: string; index: number; entrance: number; color: string }> = ({ char, index, entrance, color }) => {
    // Stagger each letter's appearance
    const delay = index * 0.05;
    const springValue = spring({
        frame: entrance - delay,
        fps: 30,
        config: { damping: 12, stiffness: 200 },
    });

    return (
        <span style={{
            display: 'inline-block',
            transform: `translateY(${(1 - springValue) * 20}px) scale(${springValue})`,
            opacity: springValue,
            color: char === " " ? "transparent" : "white",
            textShadow: char === " " ? "none" : `0 0 ${springValue * 20}px ${color}66`,
            whiteSpace: 'pre'
        }}>
            {char}
        </span>
    );
};

// --- Main Scene ---
export const AudioVisualizerScene: React.FC<z.infer<typeof AudioVisualizerSchema>> = ({
    audioFileName,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const imgRef = useRef<HTMLImageElement>(null);

    const musicUrl = useMemo(() => staticFile(`audios/${audioFileName}`), [audioFileName]);
    const audioData = useAudioData(musicUrl);

    const [metadata, setMetadata] = useState({
        title: cleanFileName(audioFileName),
        artist: 'Original Soundtrack',
        thumbnail: null as string | null
    });

    const [palette, setPalette] = useState({
        vibrant: stringToColor(audioFileName), // Procedural default
        lightVibrant: '#ffffff',
        darkVibrant: '#000000',
    });

    useEffect(() => {
        let isMounted = true;
        let currentUrl: string | null = null;
        const loadMetadata = async () => {
            try {
                const response = await fetch(musicUrl);
                if (!response.ok) throw new Error("Failed to fetch audio");
                const blob = await response.blob();
                const tags = await mm.parseBlob(blob);
                if (!isMounted) return;

                if (tags.common.picture?.[0]) {
                    const pic = tags.common.picture[0];
                    currentUrl = URL.createObjectURL(new Blob([pic.data], { type: pic.format }));
                }
                setMetadata({
                    title: tags.common.title || cleanFileName(audioFileName),
                    artist: tags.common.artist || "Unknown Artist",
                    thumbnail: currentUrl
                });
            } catch (e) {
                console.error("Web Render Metadata Error:", e);
                // Fallback to defaults so the render doesn't freeze
                setMetadata(prev => ({ ...prev, title: "Unknown Track" }));
            }
        };
        loadMetadata();
        return () => { isMounted = false; if (currentUrl) URL.revokeObjectURL(currentUrl); };
    }, [musicUrl, audioFileName]);

    const handleImageLoad = () => {
        if (!imgRef.current) return;
        new (Vibrant as any).Vibrant(imgRef.current).getPalette().then((vP: any) => {
            setPalette({
                vibrant: vP.Vibrant?.hex || palette.vibrant,
                lightVibrant: vP.LightVibrant?.hex || '#fff',
                darkVibrant: vP.DarkVibrant?.hex || '#000',
            });
        });
    };

    const audioValues = useMemo(() => {
        if (!audioData) return { frequencyData: Array(BAR_COUNT / 2).fill(0), pulse: 0 };
        const freq = visualizeAudio({ fps, frame, audioData, numberOfSamples: 512 });
        const halfData = freq.slice(2, (BAR_COUNT / 2) + 2).map((v, i) => Math.pow(v * (1 + (i / 70) * 4), 0.8));
        const bass = freq.slice(0, 5).reduce((a, b) => a + b, 0) / 5;
        return { frequencyData: halfData, pulse: Math.pow(bass, 1.2) };
    }, [audioData, fps, frame]);

    const entrance = spring({ frame, fps, config: { stiffness: 100 } });
    const thumbScale = spring({ frame, fps, from: 1, to: 1 + audioValues.pulse * 0.15, config: { damping: 12, stiffness: 200 } });

    return (
        <AbsoluteFill style={{ backgroundColor: '#000', fontFamily: 'Inter, sans-serif' }}>
            <Audio src={musicUrl} />
            <img ref={imgRef} src={metadata.thumbnail || undefined} onLoad={handleImageLoad} style={{ display: 'none' }} crossOrigin="anonymous" />

            {/* Background Layer */}
            <AbsoluteFill style={{ filter: 'blur(100px) brightness(0.4)', opacity: 0.5 }}>
                {metadata.thumbnail ?
                    <Img src={metadata.thumbnail} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> :
                    <div style={{ background: `linear-gradient(to bottom, ${palette.vibrant}, #000)`, height: '100%' }} />
                }
            </AbsoluteFill>

            {/* 2. THE PARTICLES (Re-added here) */}
            <ReactiveParticles
                pulse={audioValues.pulse}
                color={palette.vibrant}
            />

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <div style={{ position: 'relative', width: 800, height: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CanvasBars frequencyData={audioValues.frequencyData} pulse={audioValues.pulse} palette={palette} />

                    {/* Album Art Core with Fallback */}
                    <div style={{
                        width: 500, height: 500, borderRadius: '50%', border: '8px solid rgba(255,255,255,0.2)',
                        overflow: 'hidden', zIndex: 5,
                        boxShadow: `0 0 ${40 + audioValues.pulse * 100}px ${palette.vibrant}88`,
                        transform: `scale(${thumbScale})`,
                    }}>
                        {metadata.thumbnail ?
                            <Img src={metadata.thumbnail} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> :
                            <ArtworkFallback name={metadata.title} pulse={audioValues.pulse} color={palette.vibrant} />
                        }
                    </div>
                </div>

                {/* Text Metadata Section */}
                <div style={{
                    textAlign: 'center',
                    marginTop: 60,
                    width: '100%',
                    zIndex: 10
                }}>
                    {/* TITLE: Character-by-character animation */}
                    <h1 style={{
                        margin: 0,
                        fontSize: 95,
                        fontWeight: 900,
                        textTransform: 'uppercase',
                        letterSpacing: -2,
                        color: 'white',
                        display: 'flex',
                        justifyContent: 'center',
                        flexWrap: 'wrap'
                    }}>
                        {metadata.title.split("").map((char, i) => {
                            // Stagger: Each letter starts 2 frames after the previous
                            const delay = i * 2;
                            const letterSpring = spring({
                                frame: frame - delay,
                                fps,
                                config: { stiffness: 120, damping: 12 },
                            });

                            return (
                                <span
                                    key={i}
                                    style={{
                                        display: 'inline-block',
                                        opacity: letterSpring,
                                        transform: `translateY(${(1 - letterSpring) * 30}px)`,
                                        textShadow: `0 0 ${letterSpring * 30}px ${palette.vibrant}aa`,
                                        minWidth: char === " " ? "20px" : "auto"
                                    }}
                                >
                                    {char}
                                </span>
                            );
                        })}
                    </h1>

                    {/* SUBTITLE: Slide-up Reveal */}
                    <div style={{ marginTop: 10, overflow: 'hidden' }}>
                        <h2 style={{
                            color: palette.lightVibrant,
                            fontSize: 30,
                            margin: 0,
                            fontWeight: 400,
                            letterSpacing: 12,
                            textTransform: 'uppercase',
                            opacity: interpolate(entrance, [0.6, 1], [0, 0.7]),
                            transform: `translateY(${(1 - entrance) * 50}px)`,
                            filter: `drop-shadow(0 0 ${audioValues.pulse * 10}px ${palette.vibrant})`
                        }}>
                            {metadata.artist}
                        </h2>
                    </div>

                    {/* Animated Underline */}
                    <div style={{
                        height: 2,
                        width: interpolate(entrance, [0.5, 1], [0, 400], { extrapolateLeft: 'clamp' }),
                        background: `linear-gradient(90deg, transparent, ${palette.vibrant}, transparent)`,
                        margin: '25px auto',
                        opacity: 0.5
                    }} />
                </div>
            </div>
        </AbsoluteFill>
    );
};
