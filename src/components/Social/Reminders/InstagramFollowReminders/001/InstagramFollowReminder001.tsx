import React from 'react';
import {
    interpolate,
    useCurrentFrame,
    useVideoConfig,
    spring,
    AbsoluteFill,
    Img,
    staticFile
} from 'remotion';
import { z } from 'zod';

// 1. Define the Schema
export const InstagramFollowSchema = z.object({
    username: z.string().default("shablonlar_kanali"),
    profileImg: z.string().default(staticFile("profile.png")), // Path to your image
});

// 2. Derive the Type
export type InstagramFollowProps = z.infer<typeof InstagramFollowSchema>;

export const InstagramFollowReminder001: React.FC<InstagramFollowProps> = ({
    username = "username",
    profileImg
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // 1. Entrance Config (Bounce Up)
    const entrance = spring({
        frame,
        fps,
        config: { damping: 10, stiffness: 100 },
    });

    // 2. Click Config (Trigger at 2 seconds)
    const CLICK_FRAME = fps * 2;
    const isFollowed = frame >= CLICK_FRAME;

    const clickScale = interpolate(
        frame,
        [CLICK_FRAME - 2, CLICK_FRAME, CLICK_FRAME + 3],
        [1, 0.85, 1],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    return (
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
            <div style={{
                transform: `translateY(${(1 - entrance) * 150}px) scale(${entrance})`,
                opacity: entrance
            }}>
                <svg
                    width="1920"
                    height="1080"
                    viewBox="0 0 507.99999 285.75"
                    style={{ width: '100%', height: 'auto', overflow: 'visible' }}
                >
                    <defs>
                        {/* Clip path to make the profile image a circle */}
                        <clipPath id="circleClip">
                            <circle cx="136.62" cy="141.18" r="44.09" />
                        </clipPath>
                    </defs>

                    {/* Main Container */}
                    <rect
                        style={{ fill: '#ffffff', stroke: '#bebebe', strokeWidth: 1.5 }}
                        width="347.48"
                        height="114.25"
                        x="77.43"
                        y="84.26"
                        ry="57.12"
                    />

                    {/* Profile Image with Circle Clip */}
                    <g clipPath="url(#circleClip)">
                        <image
                            href={profileImg}
                            x="92.53"
                            y="97.09"
                            width="88.18"
                            height="88.18"
                            preserveAspectRatio="xMidYMid slice"
                        />
                    </g>

                    {/* Channel Name */}
                    <text
                        style={{
                            fontSize: '24px',
                            fontWeight: 'bold',
                            fontFamily: 'sans-serif',
                            fill: '#000000'
                        }}
                        x="200"
                        y="130"
                    >
                        {username}
                    </text>

                    {/* Follow Button Group */}
                    <g style={{
                        transform: `scale(${clickScale})`,
                        transformOrigin: '255px 166px',
                        transition: '0.1s ease-out'
                    }}>
                        <rect
                            style={{ fill: isFollowed ? '#efefef' : '#0095f6' }}
                            width="118.29"
                            height="35.04"
                            x="195.96"
                            y="142.28"
                            ry="8"
                        />
                        <text
                            style={{
                                fontSize: '16px',
                                fontWeight: 'bold',
                                fontFamily: 'sans-serif',
                                textAnchor: 'middle',
                                fill: isFollowed ? '#000000' : '#ffffff'
                            }}
                            x="255"
                            y="165"
                        >
                            {isFollowed ? 'Following' : 'Follow'}
                        </text>
                    </g>
                </svg>
            </div>
        </AbsoluteFill>
    );
};
