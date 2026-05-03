import React from 'react';
import { Composition, staticFile, getInputProps } from 'remotion';
import { getAudioDurationInSeconds } from '@remotion/media-utils';

// Polyfill Buffer for music-metadata
import { Buffer } from 'buffer';
if (typeof window !== 'undefined') {
    window.Buffer = window.Buffer || Buffer;
}

// Borders
import {
    Border001, Border001Schema, Border002, Border002Schema, Border003, Border003Schema,
    Border004, Border004Schema, Border005, Border005Schema, Border006, Border006Schema,
    Border007, Border007Schema, Border008, Border008Schema, Border009, Border009Schema
} from './components/Borders';

// Social
import {
    Banner, PhoneNumberMotion001, PhoneNumberSchema, InstagramNotify, InstagramNotifySchema,
    TelegramNotify, TelegramNotifySchema, YouTubeNotify, YouTubeNotifySchema,
    InstagramFollowReminder001, InstagramFollowSchema, LikeAndSubscribeReminder01, BannerProps
} from './components/Social';

// Overlays
import { LightLeaksOverlay001, LightLeaksOverlay002, StarBurstOverlay001, StarBurst001Schema } from './components/Overlays';

// Backgrounds
import { WrinkledPaper001 } from './components/Backgrounds/WrinkledPaper001/WrinkledPaper001';
import { CyberGrid001 } from './components/Backgrounds/CyberGrid001/CyberGrid001';

// Typography
import { GlitchText, GlitchTextSchema } from './components/Typography/GlitchText001/GlitchText';
import { DrawFillText, DynamicTextSchema } from './components/Typography/DrawFillText001/DrawFillTExt001';

// Compositions
import { SCSAd001 } from './compositions/Ads/SCSAd001/SCSAd001';
import { Intro001, Intro001Schema } from './compositions/Intros/IntroSCS001/Intro01';
import { IntroShukrona001, IntroShukronaSchema } from './compositions/Intros/IntroShukrona001/IntroShukrona01';
import { GamingIntro001, GamingIntroSchema } from './compositions/Intros/IntroGaming001/IntroGaming001';

// Audio Visualizer
import { AudioVisualizerScene, AudioVisualizerSchema } from './compositions/AudioVisualizers/AudioVisualizer001/AudioVisualizer001';
import { text } from 'stream/consumers';

export const RemotionRoot: React.FC<any> = (passedProps) => {
    // Determine props by checking if we are in Studio (getInputProps) or Player (passedProps)
    let inputProps;
    try {
        inputProps = { ...passedProps, ...getInputProps() };
    } catch (e) {
        inputProps = passedProps;
    }
    const defaultTotalFrames = 150;

    return (
        <>
            {/* --- BORDERS --- */}
            <Composition id="Border-01" component={Border001} schema={Border001Schema} durationInFrames={720} fps={60} width={1920} height={1080} defaultProps={{ version: "gold" as const, drawSeconds: 4, idleSeconds: 4, undrawSeconds: 3, staggerFactor: 0.005, verticalGap: 300, glowColor: "#ffcc33" }} />
            <Composition id="Border-02" component={Border002} schema={Border002Schema} durationInFrames={450} fps={45} width={1920} height={1080} defaultProps={{ version: "gold", inDuration: 2.5, staticDuration: 5, outDuration: 2.5, floatAmplitude: 3, floatFrequency: 0.08, borderWidth: 1400 }} />
            <Composition id="Border-03" component={Border003} schema={Border003Schema} durationInFrames={780} fps={60} width={1920} height={1080} defaultProps={{
                version:
                    "gold" as const,
                transitionSeconds: 4.5,
                floatSpeed: 25,
                floatAmplitude: 1.5,
                strokeWidth: 1,
            }} />
            <Composition id="Border-04" component={Border004} schema={Border004Schema} durationInFrames={600} fps={60} width={1920} height={1080} defaultProps={{ version: "gold" as const, drawSeconds: 3, outStartSeconds: 7, floatAmplitude: 2.5 }} />
            <Composition id="Border-05" component={Border005} schema={Border005Schema} durationInFrames={1000} fps={60} width={1920} height={1080} defaultProps={{ version: 'gold', drawInSeconds: 9, staticHoldSeconds: 2, drawOutSeconds: 6, globalScale: 0.75 }} />
            <Composition id="Border-06" component={Border006} schema={Border006Schema} durationInFrames={902} fps={60} width={1920} height={1080} defaultProps={{ version: 'gold', drawInSeconds: 7, undrawSeconds: 7, shimmerSpeedSeconds: 4, staticWhiteOpacity: 1, goldBaseColor: "#8A6628", silverBaseColor: "#757575" }} />
            <Composition id="Border-07" component={Border007} schema={Border007Schema} durationInFrames={1050} fps={60} width={1920} height={1080} defaultProps={{ version: 'gold', undrawStartSeconds: 11, animationSpeed: 150, sweepLoopDuration: 300 }} />
            <Composition id="Border-08" component={Border008} schema={Border008Schema} durationInFrames={980} fps={60} width={1920} height={1080} defaultProps={{ version: 'gold', undrawStartSeconds: 9.6, drawDurationMax: 480, masterScale: 5 }} />
            <Composition id="Border-09" component={Border009} schema={Border009Schema} durationInFrames={600} fps={60} width={1920} height={1080} defaultProps={{ version: "silver" as const }} />

            {/* --- SOCIAL --- */}
            <Composition id='TelegramNotify' component={TelegramNotify} schema={TelegramNotifySchema} durationInFrames={300} fps={60} width={1920} height={1080} defaultProps={{ channelName: "SourceCodeSorcerer" }} />
            <Composition id='YoutubeNotify' component={YouTubeNotify} schema={YouTubeNotifySchema} durationInFrames={300} fps={60} width={1920} height={1080} defaultProps={{ channelName: 'SourceCodeSorcerer' }} />
            <Composition id='InstagramNotify' component={InstagramNotify} schema={InstagramNotifySchema} durationInFrames={300} fps={60} width={1920} height={1080} defaultProps={{ channelName: 'scs_motions' }} />
            <Composition id='InstagramFollowReminder001' component={InstagramFollowReminder001} schema={InstagramFollowSchema} durationInFrames={300} fps={60} width={1920} height={1080} defaultProps={{ username: "scs_motions", profileImg: staticFile("images/LogoSCS01-motion-channel.png") }} />
            <Composition id='LikeAndSubscribeReminder01' component={LikeAndSubscribeReminder01} durationInFrames={300} fps={60} width={1920} height={1080} />
            <Composition id="PhoneNumberMotion001" component={PhoneNumberMotion001} schema={PhoneNumberSchema} durationInFrames={300} fps={60} width={1920} height={1080} defaultProps={{ phoneNumber: "+998 00 000 0000" }} />
            <Composition id="Banner" component={Banner} schema={BannerProps} durationInFrames={300} fps={60} width={1920} height={1080} defaultProps={{ channelName: "@scs_motions", iconKeys: ["Telegram" as const, "Instagram" as const, "YouTube" as const] }} />

            {/* --- INTROS --- */}
            <Composition id="ShukronaIntro01" component={IntroShukrona001} schema={IntroShukronaSchema} durationInFrames={480} fps={60} width={1920} height={1080} defaultProps={{ channelName: "SHUKRONA", subTexts: ["PRESENTS"], activeText: "PRESENTS", exitFrame: 430 }} />
            <Composition id="Intro01SCS" component={Intro001} schema={Intro001Schema} durationInFrames={600} fps={60} width={1920} height={1080} defaultProps={{ channelName: "SOURCE_CODE_SORCERER", statusMessage: "TEACHING_LINUX", statusResult: "ONGOING", accentColor: "#22d3ee" }} />
            <Composition id="GamingIntro001" component={GamingIntro001} schema={GamingIntroSchema} durationInFrames={420} fps={60} width={1920} height={1080} defaultProps={{ neonColor: "#00ffff", sunColor: "#ff0000", speed: 20, title: "PLAYER ONE" }} />
            <Composition id="SCS-Ad-001" component={SCSAd001} durationInFrames={1320} fps={60} width={1080} height={1920} />

            {/* --- OVERLAYS --- */}
            <Composition id="StarBurstOverlay01" component={StarBurstOverlay001} schema={StarBurst001Schema} durationInFrames={1800} fps={60} width={1920} height={1080} defaultProps={{ version: "gold" }} />
            <Composition id="LightLeaksOverlay01" component={LightLeaksOverlay001} durationInFrames={1800} fps={60} width={1920} height={1080} />
            <Composition id="LightLeaksOverlay02" component={LightLeaksOverlay002} durationInFrames={1800} fps={60} width={1920} height={1080} />
            <Composition id='WrinkledPaper001' component={WrinkledPaper001} durationInFrames={1200} fps={60} width={1920} height={1080} />
            <Composition id='CyberGrid001' component={CyberGrid001} durationInFrames={1200} fps={60} width={1080} height={1920} />

            {/* --- Typography ---*/}
            <Composition id="GlitchText001" component={GlitchText} durationInFrames={180} fps={60} width={1920} height={1080} schema={GlitchTextSchema} defaultProps={{ text: "MATRIX", fontColor: "#00ff00", fontSize: 85, glitchFrequency: 0.1 }} />
            <Composition
                id="DynamicText"
                component={DrawFillText}
                // This links the timeline length to the Zod prop
                durationInFrames={defaultTotalFrames}
                fps={60}
                width={1920}
                height={1080}
                schema={DynamicTextSchema}
                defaultProps={{
                    text: "TEXT",
                    totalFrames: 300,
                    transitionPercent: 0.4,
                    fontSize: 140,
                    strokeColor: "#ffffff",
                    fillColor: "#FFFFFF",
                    strokeWidth: 2,
                }}
                // Optional: Updates the Remotion timeline if you change duration in the sidebar
                calculateMetadata={({ props }) => {
                    return {
                        durationInFrames: props.totalFrames,
                    };
                }}
            />

            {/* --- AUDIO VISUALIZER --- */}
            <Composition
                id="AudioVisualizer-001"
                component={AudioVisualizerScene}
                fps={60}
                width={1920}
                height={1080}
                schema={AudioVisualizerSchema}
                defaultProps={{
                    audioFileName: "music003.mp3" as const,
                    baseGlow: 0,
                }}
                calculateMetadata={async ({ props }) => {
                    try {
                        const audioUrl = staticFile(`audios/${props.audioFileName || "music.mp3"}`);
                        const duration = await getAudioDurationInSeconds(audioUrl);
                        return {
                            durationInFrames: Math.floor(duration * 60),
                            props: { ...props }
                        };
                    } catch (e) {
                        return { durationInFrames: 300 };
                    }
                }}
            />
        </>
    );
};
