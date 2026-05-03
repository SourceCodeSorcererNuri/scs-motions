import { Config } from "@remotion/cli/config";
import { enableTailwind } from '@remotion/tailwind-v4';
import webpack from 'webpack'; // Import webpack

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setExperimentalClientSideRenderingEnabled(true);

Config.overrideWebpackConfig((config) => {
    const withTailwind = enableTailwind(config);

    return {
        ...withTailwind,
        resolve: {
            ...withTailwind.resolve,
            fallback: {
                ...withTailwind.resolve?.fallback,
                fs: false,
                path: false,
                os: false,
                buffer: require.resolve('buffer/'), // Add this
            },
        },
        plugins: [
            ...(withTailwind.plugins || []),
            new webpack.ProvidePlugin({
                Buffer: ['buffer', 'Buffer'], // This injects Buffer globally
            }),
        ],
    };
});
