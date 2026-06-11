import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.stumbleclone.app',
  appName: 'StumbleClone',
  // Wrap the existing Vite build output — wrap, do not rewrite (see docs/MOBILE_BUILD_PLAN.md).
  webDir: 'dist',
};

export default config;
