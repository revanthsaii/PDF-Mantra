// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// pdf-lib ships both CJS (cjs/) and ESM (es/) builds. Metro picks the ESM
// build via the "module" field in package.json, but tslib's ESM re-exports
// break under Metro's require system. Excluding "module" from the resolution
// order forces Metro to use the CJS build, which works correctly.
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

module.exports = config;
