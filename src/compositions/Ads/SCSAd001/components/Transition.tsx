import { interpolate, useCurrentFrame } from 'remotion';

export const GlitchOverlay: React.FC<{ progress: number }> = ({ progress }) => {
    return (
        <div style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: '#00ff41',
            opacity: interpolate(progress, [0, 0.5, 1], [0, 0.8, 0]),
            transform: `translateX(${interpolate(progress, [0, 1], [-100, 100])}%)`,
            boxShadow: '0 0 100px #00ff41',
            zIndex: 5000,
        }} />
    );
};
