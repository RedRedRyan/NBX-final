import type { NextConfig } from 'next';
import webpack from 'webpack';

const nextConfig: NextConfig = {
  // 1. Transpile the main SDKs
  transpilePackages: [
    '@hashgraph/asset-tokenization-sdk',
    '@hashgraph/sdk',
    '@hashgraph/hedera-wallet-connect',
    '@hashgraph/proto',
    '@hashgraph/cryptography'
    // REMOVED: asn1-ts and custodians-integration (we want to block them, not compile them)
  ],

  serverExternalPackages: [
    'pino',
    'pino-pretty',
    'winston',
    '@mattrglobal/node-bbs-signatures',
    'rdf-canonize-native'
  ],

  webpack: (config, { isServer }) => {
    if (!isServer) {
      // 2. Client-side Fallbacks
      config.resolve.fallback = {
        ...config.resolve.fallback,

        // Block the Node.js Custodial Integration from the browser bundle
        '@hashgraph/hedera-custodians-integration': false, // <--- THE FIX

        // Standard Node polyfills
        fs: false,
        net: false,
        tls: false,
        child_process: false,
        crypto: false,
        process: false,
        os: false,

        // Libraries to polyfill
        stream: require.resolve('stream-browserify'),
        buffer: require.resolve('buffer/'),
        path: require.resolve('path-browserify'),
        zlib: require.resolve('browserify-zlib'),

        // Stub native modules
        '@mattrglobal/node-bbs-signatures': false,
        'rdf-canonize-native': false,
        'winston': false,
      };

      // 3. Aliasing to handle "node:" prefix if it still slips through
      config.resolve.alias = {
        ...config.resolve.alias,
        'node:buffer': 'buffer',
        'node:stream': 'stream-browserify',
        'node:process': 'process/browser',
      };

      config.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
          process: 'process/browser',
        }),
        // Safety net: Strip "node:" prefix from any remaining imports
        new webpack.NormalModuleReplacementPlugin(/^node:/, (resource) => {
          resource.request = resource.request.replace(/^node:/, "");
        })
      );
    }
    return config;
  },
};

export default nextConfig;