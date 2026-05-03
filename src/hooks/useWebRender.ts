//src/hooks/useWebRender.ts
import { useState } from 'react';
import { startBrowserRender } from '../renderVideo';

export const useWebRender = () => {
    const [rendering, setRendering] = useState(false);
    const [progress, setProgress] = useState(0);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);

    const render = async (id: string, props: any) => {
        setRendering(true);
        setProgress(0);
        try {
            const url = await startBrowserRender(id, props, (p) => setProgress(p));
            setVideoUrl(url);
            return url;
        } catch (e) {
            console.error("Render failed:", e);
        } finally {
            setRendering(false);
        }
    };

    return { render, rendering, progress, videoUrl };
};
