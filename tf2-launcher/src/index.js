/**
 * TF2 Launcher - Main Application
 * Orchestrates Steam auth, TF2 launch, and Game Coordinator connection
 */

import 'dotenv/config';
import { config, validateConfig } from './config.js';
import SteamAuth from './auth/steamAuth.js';
import TF2Launcher from './game/tf2Launcher.js';
import GameCoordinatorConnection from './server/connection.js';

class TF2LauncherApp {
  constructor() {
    this.steamAuth = null;
    this.tf2Launcher = null;
    this.gcConnection = null;
    this.running = false;
  }

  /**
   * Initialize and start the application
   */
  async start() {
    try {
      console.log('╔════════════════════════════════════════╗');
      console.log('║     🎮 TF2 Launcher Application 🎮      ║');
      console.log('║   Minimal Resource Consumption Edition   ║');
      console.log('╚════════════════════════════════════════╝\n');

      // Validate configuration
      console.log('⚙️  Validating configuration...');
      validateConfig();
      console.log('✅ Configuration valid\n');

      // Step 1: Steam Authentication
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📋 Step 1: Steam Authentication');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      this.steamAuth = new SteamAuth(config);
      await this.steamAuth.login();

      // Step 2: Launch TF2
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📋 Step 2: Launch Team Fortress 2');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      this.tf2Launcher = new TF2Launcher(config);
      const launchResult = await this.tf2Launcher.launch();

      // Step 3: Connect to Game Coordinator
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📋 Step 3: Game Coordinator Connection');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      const steamClient = this.steamAuth.getClient();
      this.gcConnection = new GameCoordinatorConnection(steamClient, config);
      await this.gcConnection.connect();

      // Success - Start monitoring
      this.running = true;
      console.log('\n╔════════════════════════════════════════╗');
      console.log('║  🎉 Application Ready and Running 🎉   ║');
      console.log('╚════════════════════════════════════════╝\n');

      // Log system information
      this.logSystemInfo(launchResult);

      // Start monitoring
      this.startMonitoring();

    } catch (err) {
      console.error('\n❌ Application error:', err.message);
      console.error('   Stack:', err.stack);
      await this.cleanup();
      process.exit(1);
    }
  }

  /**
   * Log system and application information
   */
  logSystemInfo(launchResult) {
    const uptime = process.uptime().toFixed(2);
    const memUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);

    console.log('📊 System Information:');
    console.log(`   💾 Memory Usage: ${memUsage}MB`);
    console.log(`   ⏱️  Uptime: ${uptime}s`);
    console.log(`   🎮 TF2 Process ID: ${launchResult.pid}`);
    console.log(`   🔗 Game Coordinator: ${this.gcConnection.isConnected() ? '✅ Connected' : '❌ Disconnected'}\n`);
  }

  /**
   * Start monitoring application health
   */
  startMonitoring() {
    // Memory monitoring every 30 seconds
    this.monitoringInterval = setInterval(() => {
      const memUsage = process.memoryUsage();
      const heapUsed = (memUsage.heapUsed / 1024 / 1024).toFixed(2);
      const heapTotal = (memUsage.heapTotal / 1024 / 1024).toFixed(2);

      console.log(`💾 Memory: ${heapUsed}MB / ${heapTotal}MB`);

      // Check health
      if (!this.steamAuth.isAuthenticated()) {
        console.warn('⚠️  Warning: Steam authentication lost');
      }

      if (!this.gcConnection.isConnected()) {
        console.warn('⚠️  Warning: Game Coordinator disconnected');
      }

      // Garbage collection if enabled
      if (config.resources.enableGC && global.gc) {
        global.gc();
      }
    }, 30000);
  }

  /**
   * Cleanup and shutdown
   */
  async cleanup() {
    console.log('\n⏹️  Shutting down...');

    this.running = false;

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    try {
      // Disconnect from Game Coordinator
      if (this.gcConnection) {
        this.gcConnection.disconnect();
      }

      // Stop TF2
      if (this.tf2Launcher) {
        await this.tf2Launcher.stop();
      }

      // Logout from Steam
      if (this.steamAuth) {
        this.steamAuth.logout();
      }

      console.log('✅ Shutdown complete');
    } catch (err) {
      console.error('❌ Error during shutdown:', err.message);
    }
  }
}

// Main execution
const app = new TF2LauncherApp();

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n\n📋 Received SIGINT, cleaning up...');
  await app.cleanup();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n\n📋 Received SIGTERM, cleaning up...');
  await app.cleanup();
  process.exit(0);
});

// Unhandled error handler
process.on('uncaughtException', async (err) => {
  console.error('\n❌ Unhandled exception:', err);
  await app.cleanup();
  process.exit(1);
});

// Start the application
app.start().catch(async (err) => {
  console.error('❌ Fatal error:', err);
  await app.cleanup();
  process.exit(1);
});

export default TF2LauncherApp;
