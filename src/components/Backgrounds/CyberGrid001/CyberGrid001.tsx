import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';

export const CyberGrid001 = ({
    color = '#00f2ff',
    lineThickness = 5,
    gridSize = 60,
    verticalSpeed = 1,
    swayAmplitude = 30, // How far it moves left/right
    swayFrequency = 0.03 // How fast it oscillates
}) => {
    const frame = useCurrentFrame();

    const yMove = (frame * verticalSpeed) % gridSize;

    const xMove = Math.sin(frame * swayFrequency) * swayAmplitude;

    return (
        <AbsoluteFill style={{ backgroundColor: '#020408' }}>
            {/* The Main Grid Layer */}
            <div style={{
                position: 'absolute',
                // We add extra margin (inset) so the edges don't show when it sways
                inset: `-${swayAmplitude + 20}px`,
                backgroundImage: `
          linear-gradient(to right, ${color}99 ${lineThickness}px, transparent ${lineThickness}px),
          linear-gradient(to bottom, ${color}99 ${lineThickness}px, transparent ${lineThickness}px)
        `,
                backgroundSize: `${gridSize}px ${gridSize}px`,
                // Apply both vertical constant movement and horizontal sway
                transform: `translate(${xMove}px, ${yMove}px)`,
                filter: `drop-shadow(0 0 5px ${color}22)`,
            }} />

            <AbsoluteFill style={{
                background: 'radial-gradient(circle, transparent 30%, rgba(2,4,8,0.9) 100%)',
            }} />
        </AbsoluteFill>
    );
};
