import { Composition, staticFile, Audio } from 'remotion';
import {
    TransitionSeries,
    linearTiming,
    springTiming,
} from '@remotion/transitions';

// Import the built-in transition presentations you want to use
import { fade } from '@remotion/transitions/fade';
import { slide } from '@remotion/transitions/slide';
import { wipe } from '@remotion/transitions/wipe';
// You can also import: flip, clockWipe, iris, etc.

import { FirstCut } from './cuts/FirstCut';
import { SecondCut } from './cuts/SecondCut';
import { ThirdCut } from './cuts/ThirdCut';
import { FinalCut } from './cuts/FinalCut';

const FPS = 60;
const CUT_DURATION = 6 * FPS;        // 5 seconds per cut
const TRANSITION_DURATION = 30;      // 0.5 seconds transition (adjust as needed)

export const SCSAd001: React.FC = () => {
    const bgm = staticFile('audios/nveravetyanmusic-unity-terminal-synthwave-cyberpunk-452165.mp3');

    return (
        <div style={{ flex: 1, backgroundColor: '#050505' }}>
            <Audio
                src={bgm}
                startFrom={5 * FPS}
                volume={0.8}
            />

            <TransitionSeries>
                {/* First Cut */}
                <TransitionSeries.Sequence durationInFrames={CUT_DURATION}>
                    <FirstCut />
                </TransitionSeries.Sequence>

                {/* Transition 1 → 2 */}
                <TransitionSeries.Transition
                    presentation={fade()}                    // Try slide(), wipe(), etc.
                    timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
                />

                {/* Second Cut */}
                <TransitionSeries.Sequence durationInFrames={CUT_DURATION}>
                    <SecondCut />
                </TransitionSeries.Sequence>

                {/* Transition 2 → 3 */}
                <TransitionSeries.Transition
                    presentation={slide({ direction: 'from-right' })} // customize direction
                    timing={springTiming({ durationInFrames: TRANSITION_DURATION })}
                />

                {/* Third Cut */}
                <TransitionSeries.Sequence durationInFrames={CUT_DURATION}>
                    <ThirdCut />
                </TransitionSeries.Sequence>

                {/* Transition 3 → Final */}
                <TransitionSeries.Transition
                    presentation={wipe({ direction: 'from-bottom' })}
                    timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
                />

                {/* Final Cut */}
                <TransitionSeries.Sequence durationInFrames={CUT_DURATION}>
                    <FinalCut />
                </TransitionSeries.Sequence>
            </TransitionSeries>
        </div>
    );
};
