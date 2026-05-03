import { renderMediaOnWeb } from '@remotion/web-renderer';
import { bundle } from '@remotion/bundler';

export const startBrowserRender = async (
    compositionId: string,
    inputProps: Record<string, any>,
    onProgress: (p: number) => void
) => {
    // 1. Point to your entry file (where RemotionRoot is)
    const entry = './src/index.ts';

    // 2. Start the render
    const { outputPath } = await renderMediaOnWeb({
        compositionId,
        inputProps,
        // Using h264/mp4 which is most compatible with WebCodecs
        container: 'mp4',
        videoCodec: 'h264',
        onProgress: ({ progress }) => {
            onProgress(progress);
        },
    });

    return outputPath; // This is a blob: URL
};
