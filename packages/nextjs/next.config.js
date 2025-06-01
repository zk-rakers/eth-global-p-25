const webpack = require('webpack');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'mdx'],
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-Requested-With, Content-Type, Authorization',
          },
        ],
      },
    ];
  },
  // Add allowed development origins
  allowedDevOrigins: ['172.28.4.156'],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Add Node polyfill plugin
      config.plugins.push(new NodePolyfillPlugin());

      // Add fallbacks for Node.js core modules
      config.resolve.fallback = {
        ...(config.resolve.fallback || {}),
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        buffer: require.resolve('buffer/'),
        util: require.resolve('util/'),
        path: false,
        fs: false,
        os: false,
        http: false,
        https: false,
        zlib: false,
      };

      // Add polyfills
      config.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
          process: 'process/browser',
        })
      );

      // Handle node: protocol imports
      config.module = {
        ...config.module,
        rules: [
          ...config.module.rules,
          {
            test: /\.m?js/,
            resolve: {
              fullySpecified: false,
            },
          },
        ],
      };

      // Add aliases for node: protocol imports
      config.resolve.alias = {
        ...config.resolve.alias,
        'node:crypto': 'crypto-browserify',
        'node:stream': 'stream-browserify',
        'node:buffer': 'buffer',
        'node:util': 'util',
        'node:path': false,
        'node:fs': false,
        'node:os': false,
      };
    }

    return config;
  },
  output: 'export',
};

module.exports = nextConfig;
