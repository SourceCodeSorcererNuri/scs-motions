import { AbsoluteFill, useCurrentFrame, random, useVideoConfig } from 'remotion';

export const WrinkledPaper001 = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // 1.5 seconds interval calculation
    const interval = fps * 0.3;
    const step = Math.floor(frame / interval);

    // Deterministic random values based on our 1.5s step
    const seed = random(`seed-${step}`) * 1000;

    // Rotating the light source slightly makes the folds feel deeper/different
    const azimuth = 45 + (random(`light-${step}`) * 90);

    return (
        <AbsoluteFill style={{ backgroundColor: '#e0ddd5' }}>
            <svg style={{ position: 'absolute', width: 0, height: 0 }}>
                <filter id="heavy-folds">
                    {/* Increased baseFrequency creates larger, fold-like shapes */}
                    <feTurbulence
                        type="fractalNoise"
                        baseFrequency="0.010"
                        numOctaves="5"
                        seed={seed}
                        result="noise"
                    />
                    {/* surfaceScale: Higher values (5-10) make "wrinkles" look like "cliffs"
              diffuseConstant: Controls how much light reflects off the folds
          */}
                    <feDiffuseLighting
                        in="noise"
                        lightingColor="#ffffff"
                        surfaceScale="8"
                        diffuseConstant="0.7"
                    >
                        <feDistantLight azimuth={azimuth} elevation="40" />
                    </feDiffuseLighting>

                    {/* Blending the light back with a subtle base color to keep it from being pure white/black */}
                    <feColorMatrix
                        type="matrix"
                        values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"
                    />
                </filter>
            </svg>

            <div
                style={{
                    width: '100%',
                    height: '100%',
                    filter: 'url(#heavy-folds)',
                    opacity: 0.9,
                    // Mix with a second texture layer for that "micro-fiber" paper look
                    backgroundImage: 'radial-gradient(circle, transparent 0%, rgba(0,0,0,0.05) 100%)',
                }}
            />

            {/* Optional: Add a subtle overlay to soften the "digital" look */}
            <AbsoluteFill style={{
                boxShadow: 'inset 0 0 100px rgba(0,0,0,0.1)',
                mixBlendMode: 'multiply'
            }} />
        </AbsoluteFill>
    );
};
