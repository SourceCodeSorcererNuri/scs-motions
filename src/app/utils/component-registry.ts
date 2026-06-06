import { Intro001 } from '../../compositions/Intros/IntroSCS001/Intro01';
import { InstagramNotify, YouTubeNotify, TelegramNotify, LikeAndSubscribeReminder01, Banner, } from '../../components/Social';
import { SocialWatermark001 } from '../../components/Social/Reminders/SocialWatermark001/SocialWatermark001';
import { MatrixBackground001 } from '../../components/Backgrounds/MatrixBackground001/MatrixBackground001';
import { GamingIntro001 } from '../../compositions/Intros/IntroGaming001/IntroGaming001';
import { IntroShukrona001 } from '../../compositions/Intros/IntroShukrona001/IntroShukrona01';
import { PhoneNumberMotion001 } from '../../components/Social';
import { GlitchText } from '../../components/Typography/GlitchText001/GlitchText';
import { DrawFillText } from '../../components/Typography/DrawFillText001/DrawFillTExt001';
import { Border001, Border002, Border003, Border004, Border005, Border006, Border007, Border008, Border009 } from '../../components/Borders';
import { LightLeaksOverlay001, LightLeaksOverlay002, StarBurstOverlay001 } from '../../components/Overlays';
import { WrinkledPaper001 } from '../../components/Backgrounds/WrinkledPaper001/WrinkledPaper001';
import { CyberGrid001 } from '../../components/Backgrounds/CyberGrid001/CyberGrid001';
import { DustText001 } from '../../components/Typography/DustText001/DustText001';

// This map allows the Web Renderer to find the component by the JSON ID
export const ComponentRegistry: Record<string, React.FC<any>> = {
    Intro01SCS: Intro001,
    GamingIntro001: GamingIntro001,
    InstagramNotify: InstagramNotify,
    "ShukronaIntro01": IntroShukrona001,
    YoutubeNotify: YouTubeNotify,
    TelegramNotify: TelegramNotify,
    SocialWatermark001: SocialWatermark001,
    PhoneNumberMotion001: PhoneNumberMotion001,
    GlitchText: GlitchText,
    DrawFillText: DrawFillText,
    DustText001: DustText001,
    Banner: Banner,
    "Border-01": Border001,
    "Border-02": Border002,
    "Border-03": Border003,
    "Border-04": Border004,
    "Border-05": Border005,
    "Border-06": Border006,
    "Border-07": Border007,
    "Border-08": Border008,
    "Border-09": Border009,
    "LikeAndSubscribeReminder01": LikeAndSubscribeReminder01,
    "LightLeaksOverlay001": LightLeaksOverlay001,
    "LightLeaksOverlay002": LightLeaksOverlay002,
    "StarBurstOverlay001": StarBurstOverlay001,
    "WrinkledPaper001": WrinkledPaper001,
    "CyberGrid001": CyberGrid001,
    MatrixBackground001: MatrixBackground001,
};
