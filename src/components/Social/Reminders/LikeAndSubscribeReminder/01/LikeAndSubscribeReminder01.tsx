import React from 'react';
import {
    AbsoluteFill,
    interpolate,
    spring,
    useCurrentFrame,
    useVideoConfig,
    Easing,
} from 'remotion';

export const LikeAndSubscribeReminder01: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps, durationInFrames } = useVideoConfig();

    // Timings
    const exitStartFrame = durationInFrames - 25;
    const likeDelay = 12;
    const subscribeDelay = 24;
    const bellDelay = 38;

    // --- Core Springs ---
    const entrance = spring({
        frame,
        fps,
        config: { stiffness: 120, damping: 14, mass: 1.2 },
    });

    const exitSpring = spring({
        frame: Math.max(0, frame - exitStartFrame),
        fps,
        config: { stiffness: 200, damping: 25 },
    });

    // Button Pop Springs (Snappier)
    const sprConfig = { stiffness: 200, damping: 12 };
    const likePop = spring({ frame: frame - likeDelay, fps, config: sprConfig });
    const subPop = spring({ frame: frame - subscribeDelay, fps, config: sprConfig });
    const bellPop = spring({ frame: frame - bellDelay, fps, config: sprConfig });

    // --- Main Container Physics ---
    const mainOpacity = interpolate(frame, [0, 8, exitStartFrame, durationInFrames], [0, 1, 1, 0]);

    // Anticipation & Squash logic
    const anticipationY = interpolate(frame, [0, 10, 20], [0, 15, 0], { easing: Easing.bezier(0.42, 0, 0.58, 1), extrapolateRight: 'clamp' });
    const squashScaleY = interpolate(entrance, [0, 0.5, 0.8, 1], [1, 0.85, 1.1, 1]);
    const squashScaleX = interpolate(entrance, [0, 0.5, 0.8, 1], [1, 1.15, 0.95, 1]);

    const mainY = interpolate(entrance, [0, 1], [100, 0]) + anticipationY + interpolate(exitSpring, [0, 1], [0, -60]);
    const mainScale = (1 - exitSpring * 0.2);

    // Idle Float (Smooth Infinity Loop)
    const floatY = Math.sin(frame / 15) * 3;
    const floatRotate = 0;

    // --- Component Specific Logic ---

    // Bell Jingle: Exponential Decay (Physics based shake)
    const bellShakeTime = frame - bellDelay - 5;
    const bellJingle = bellShakeTime > 0
        ? Math.sin(bellShakeTime * 0.8) * Math.exp(-bellShakeTime * 0.1) * 35
        : 0;

    const midPoint = Math.floor(durationInFrames * 0.5); // Exact middle
    const isSubscribed = frame > midPoint;

    // 1. Define the base scale with the heartbeat pulse
    const subPulse = frame > subscribeDelay + 20
        ? Math.sin((frame - subscribeDelay) / 10) * 0.03
        : 0;

    const subscribeScale = interpolate(subPop, [0, 1], [0, 1]) + subPulse;

    // 2. The Transition "Jolt" (Add this if you haven't yet)
    const transitionSpring = spring({
        frame: frame - midPoint,
        fps,
        config: { stiffness: 300, damping: 15 },
    });

    // This creates a 1-frame white "flash" at the exact moment of change
    const flash = interpolate(frame, [midPoint - 1, midPoint, midPoint + 1], [0, 1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    // 1. The Pop & Tilt
    const likeRotate = interpolate(likePop, [0, 0.5, 1], [-25, 10, 0]);

    const likeChangePoint = midPoint - 20; // Like change (12 frames earlier)

    // Like Change State
    const isLiked = frame > likeChangePoint;

    // Smooth transition for the Like Icon (Opacity or Color swap)
    const likeTransition = spring({
        frame: frame - likeChangePoint,
        fps,
        config: { stiffness: 200, damping: 12 },
    });

    const bellChangePoint = midPoint + 20; // Exactly 20 frames after Subscribe
    const isBellActive = frame > bellChangePoint;

    // The "Jingle" trigger
    const bellActionSpring = spring({
        frame: frame - bellChangePoint,
        fps,
        config: { stiffness: 200, damping: 10 }, // Slightly bouncy
    });

    // Physics-based shake (The decay starts at bellChangePoint)
    const bellShake = bellShakeTime > 0
        ? Math.sin(bellShakeTime * 0.8) * Math.exp(-bellShakeTime * 0.1) * 35
        : 0;

    return (
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent' }}>
            <div
                style={{
                    transform: `translateY(${mainY + floatY}px) scaleX(${squashScaleX * mainScale}) scaleY(${squashScaleY * mainScale}) rotate(${floatRotate}deg)`,
                    opacity: mainOpacity,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <svg
                    width="2032"
                    height="1220"
                    viewBox="0 0 507.99999 285.75"
                    style={{ overflow: 'visible' }}
                >
                    <defs>
                        <filter id="f15" x="-0.5" y="-0.5" width="2" height="2"><feGaussianBlur stdDeviation="14" /></filter>
                        <filter id="f14" x="-0.1" y="-0.1" width="1.2" height="1.2"><feGaussianBlur stdDeviation="0.5" /></filter>
                        <filter id="f16" x="-0.05" y="-0.05" width="1.1" height="1.1"><feGaussianBlur stdDeviation="0.03" /></filter>

                        <linearGradient id="lg19" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor="#d8d8d8" />
                        </linearGradient>
                        <linearGradient id="lg6" x1="0%" y1="100%" x2="100%" y2="0%">
                            <stop offset="0" stopColor="#2c2c2c" /><stop offset="1" stopColor="#9b9b9b" />
                        </linearGradient>
                        <linearGradient id="lg13" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0" stopColor="#e62112" /><stop offset="1" stopColor="#85150c" />
                        </linearGradient>
                        <linearGradient id="lg11" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0" stopColor="#bebebe" /><stop offset="1" stopColor="#e5e5e5" />
                        </linearGradient>
                        <linearGradient id="lg8" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0" stopColor="#000000" /><stop offset="1" stopColor="#ababab" />
                        </linearGradient>
                        <linearGradient id="lgSilver" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0" stopColor="#efefef" />
                            <stop offset="0.5" stopColor="#adadad" />
                            <stop offset="1" stopColor="#d1d1d1" />
                        </linearGradient>
                    </defs>

                    <g id="layer1">
                        {/* Perfect Shadow Layers */}
                        <g id="shadow" opacity={mainOpacity * 0.7} style={{ transform: `translateY(8px)` }}>
                            <rect fill="#000000" width="294.94" height="56.43" x="112.71" y="126.12" ry="25.48" opacity="0.15" filter="url(#f15)" />
                            <rect fill="#000000" width="294.94" height="56.43" x="112.71" y="126.12" ry="25.48" opacity="0.3" filter="url(#f14)" />
                        </g>

                        {/* Main Pill */}
                        <rect id="mainPill" fill="url(#lg19)" stroke="url(#lg6)" strokeWidth="1.32" width="294.94" height="56.43" x="104.65" y="116.17" rx="25.48" />

                        {/* Like Button */}
                        <g
                            id="LikeButton"
                            style={{
                                transform: `scale(${likePop + (likeTransition * 0.1)}) rotate(${likeRotate}deg)`,
                                transformOrigin: '130.51px 143.92px',
                                opacity: likePop,
                            }}
                        >
                            <circle fill={isLiked ? "#2563EB22" : "#ffffff"} stroke="url(#lg8)" strokeWidth="0.79" cx="130.51" cy="143.92" r="18.72" />
                            <path fill={isLiked ? "#2563EB" : "#111827"} d="m 120.77993,151.25424 h 16.01421 a 2.9211275,2.8560802 0 0 0 2.8865,-2.31327 l 1.2556,-6.58514 a 2.8499276,2.7864658 0 0 0 -0.61287,-2.29447 2.9480684,2.8824212 0 0 0 -2.2736,-1.03669 h -4.5905 v -3.76299 c 0,-1.93882 -2.03303,-2.82219 -3.92178,-2.82219 a 0.9621633,0.94073797 0 0 0 -0.96216,0.94076 c 0,1.79399 -0.32726,3.67826 -0.69659,4.03011 l -2.67961,2.55502 h -4.4192 a 0.9621633,0.94073797 0 0 0 -0.9622,0.94074 v 9.40741 a 0.9621633,0.94073797 0 0 0 0.9622,0.94071 z m 5.77291,-9.95206 2.66907,-2.53997 c 0.8948,-0.85327 1.16613,-2.92757 1.25082,-4.31236 0.52148,0.12112 1.06703,0.35748 1.06703,0.81658 v 4.70365 a 0.9621633,0.94073797 0 0 0 0.96216,0.94077 h 5.55265 a 1.0266282,1.0037674 0 0 1 0.79283,0.35747 0.92175237,0.90122695 0 0 1 0.2022,0.75262 l -1.25084,6.58516 a 0.99680117,0.97460455 0 0 1 -1.00446,0.76667 h -10.24131 z m -4.81078,0.5447 h 2.88651 v 7.52589 h -2.88651 z" />
                        </g>

                        {/* Subscribe Button */}
                        <g
                            id="SubscribeButton"
                            style={{
                                transform: `scale(${subscribeScale + (transitionSpring * 0.15)}) rotate(${transitionSpring * 0}deg)`,
                                transformOrigin: '247.26px 144.5px',
                                opacity: subPop,
                            }}
                        >
                            <rect fill={isSubscribed ? "url(#lgSilver)" : "url(#lg13)"} stroke={isSubscribed ? "url(#lg11)" : "url(#lg11)"} strokeWidth="2.76" width="157.59" height="32" x="171.44" y="128.09" rx="11.25" />
                            <rect
                                fill="white"
                                opacity={flash}
                                width="157.59" height="32" x="171.44" y="128.09" rx="11.25"
                            />

                            <text
                                x="247.26" y="154.2"
                                fill={isSubscribed ? "#333" : "#ffffff"}
                                style={{
                                    fontSize: isSubscribed ? '27px' : '27.1px',
                                    fontWeight: 'bold',
                                    fontFamily: 'Inter, sans-serif',
                                    textAnchor: 'middle',
                                    // 3. Make the text scale slightly so it "lands" into place
                                    transform: `scale(${interpolate(transitionSpring, [0, 1], [1, 0.9])})`,
                                    transformOrigin: 'center'
                                }}
                            >
                                {isSubscribed ? "RAHMAT" : "OBUNA"}
                            </text>
                        </g>

                        {/* Bell Button */}
                        <g
                            id="BellButton"
                            style={{
                                transform: `scale(${bellPop + (bellActionSpring * 0.1)}) rotate(${bellShake}deg)`,
                                transformOrigin: '373.15px 143.92px',
                                opacity: bellPop,
                            }}
                        >
                            <circle fill={isBellActive ? "#F59E0B22" : "#ffffff"} stroke="url(#lg8)" strokeWidth="0.79" cx="373.15" cy="143.92" r="18.72" />
                            <path fill={isBellActive ? "#F59E0B" : "#111827"} d="m 378.1,143.26 -0.6,-0.5 v -5 a 3.9,3.9 0 1 0 -7.8,0 v 5 l -0.6,0.5 a 6.8,6.8 0 0 0 -2,3.1 h 13.2 a 6.8,6.8 0 0 0 -2,-3.1 z m -1.6,5.1 a 2.9,2.9 0 0 1 -5.9,0 h -5.9 a 8.8,8.8 0 0 1 2.9,-6.5 v -4.2 a 5.9,5.8 0 1 1 11.8,0 v 4.2 a 8.8,8.8 0 0 1 2.9,6.5 z m -2.9,0.9 a 0.9,0.9 0 0 0 0.9,-0.9 h -1.9 a 0.9,0.9 0 0 0 0.9,0.9 z" />
                        </g>
                    </g>
                </svg>
            </div>
        </AbsoluteFill>
    );
};
