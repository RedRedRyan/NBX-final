/** @type {import('next').NextConfig} */
const webpack = require('webpack');

const nextConfig = {
    transpilePackages: [
        '@hashgraph/asset-tokenization-sdk',
        '@hashgraph/sdk',
        '@hashgraph/hedera-wallet-connect',
        '@hashgraph/proto',
        '@hashgraph/cryptography'
    ],
    serverExternalPackages: [
        'pino',
        'pino-pretty',
        'winston',
        '@mattrglobal/node-bbs-signatures',
        'rdf-canonize-native'
    ],

    webpack: (config, { isServer }) => {
        // Explicitly disable minification to fix "Identifier 'n' has already been declared"
        config.optimization.minimize = false;

        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                net: false,
                tls: false,
                child_process: false,
                crypto: false,
                process: false,
                os: false,
                stream: require.resolve('stream-browserify'),
                buffer: require.resolve('buffer/'),
                path: require.resolve('path-browserify'),
                zlib: require.resolve('browserify-zlib'),
                '@hashgraph/hedera-custodians-integration': false,
                '@mattrglobal/node-bbs-signatures': false,
                'rdf-canonize-native': false,
                'winston': false,
            };
            config.resolve.alias = {
                ...config.resolve.alias,
                'node:buffer': 'buffer',
                'node:stream': 'stream-browserify',
                'node:process': 'process/browser',
            };
            config.plugins.push(
                // ProvidePlugin removed to avoid variable collisions.
                // We rely on runtime polyfills (lib/pollyfills.ts) and aliases.
                new webpack.NormalModuleReplacementPlugin(/^node:/, (resource) => {
                    resource.request = resource.request.replace(/^node:/, "");
                })
            );
        }
        return config;
    },
};

module.exports = nextConfig;
