import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cettek.servistakip',
  appName: 'ÇetTek Servis',
  webDir: 'out',
  server: {
    url: 'http://localhost:3000',
    cleartext: true,
    errorPath: 'error.html',
    allowNavigation: [
      'localhost:3000'
    ]
  }
};

export default config;
