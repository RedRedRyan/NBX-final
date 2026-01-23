import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
    reactCompiler: true,
    experimental: {
        turbopackFileSystemCacheForDev: true,
    },
    turbopack: {
        resolveAlias: {
            'winston': './lib/winston-mock.ts',
            'winston-daily-rotate-file': './lib/winston-mock.ts',
            'winston-transport': './lib/winston-mock.ts',
        },
    },
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                net: false,
                tls: false,
                crypto: false,
            };

            // Alias winston to mock file
            config.resolve.alias = {
                ...config.resolve.alias,
                'winston': path.resolve(process.cwd(), 'lib/winston-mock.ts'),
                'winston-daily-rotate-file': path.resolve(process.cwd(), 'lib/winston-mock.ts'),
                'winston-transport': path.resolve(process.cwd(), 'lib/winston-mock.ts'),
            };
        }
        return config;
    },

};

export default nextConfig;
