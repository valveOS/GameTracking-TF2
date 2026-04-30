/**
 * Configuration module for TF2 Launcher
 * Minimal, efficient configuration loading
 */

export const config = {
  steam: {
    username: process.env.STEAM_USERNAME || '',
    password: process.env.STEAM_PASSWORD || '',
    sharedSecret: process.env.STEAM_SHARED_SECRET || '',
    accountName: process.env.STEAM_ACCOUNT_NAME || '',
  },
  
  tf2: {
    gameId: 440,
    launchParams: process.env.TF2_LAUNCH_PARAMS || '-console -nohltv',
    steamPath: process.env.STEAM_PATH || '/home/steam/steamapps/common/Team Fortress 2',
  },
  
  server: {
    host: process.env.SERVER_HOST || 'localhost',
    port: parseInt(process.env.SERVER_PORT || '27015'),
    timeout: parseInt(process.env.SERVER_TIMEOUT || '30000'),
  },
  
  resources: {
    // Optimize memory usage
    maxMemoryMB: parseInt(process.env.MAX_MEMORY || '256'),
    enableGC: true,
    gcInterval: 60000, // Run GC every 60 seconds
  },
  
  debug: process.env.DEBUG === 'true',
};

/**
 * Validate configuration
 */
export function validateConfig() {
  if (!config.steam.username || !config.steam.password) {
    throw new Error('Steam credentials not configured');
  }
  
  if (config.resources.maxMemoryMB < 128) {
    console.warn('Warning: Max memory set below 128MB, may cause issues');
  }
  
  return true;
}

export default config;
