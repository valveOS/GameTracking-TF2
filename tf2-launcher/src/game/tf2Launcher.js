/**
 * TF2 Game Launcher Module
 * Handles Team Fortress 2 startup with minimal resource usage
 */

import { spawn } from 'child_process';
import { EventEmitter } from 'events';
import * as os from 'os';

export class TF2Launcher extends EventEmitter {
  constructor(config) {
    super();
    this.config = config;
    this.gameProcess = null;
    this.isRunning = false;
  }
  
  /**
   * Launch TF2 game
   */
  async launch(steamID) {
    if (this.isRunning) {
      throw new Error('TF2 is already running');
    }
    
    return new Promise((resolve, reject) => {
      try {
        const platform = os.platform();
        let command = '';
        let args = [];
        
        if (platform === 'linux') {
          command = 'steam';
          args = [
            `steam://run/${this.config.tf2.gameId}`,
            `//launch/${this.config.tf2.gameId}`,
            this.config.tf2.launchParams,
          ];
        } else if (platform === 'win32') {
          command = 'steam.exe';
          args = [
            `-run ${this.config.tf2.gameId}`,
            this.config.tf2.launchParams,
          ];
        } else if (platform === 'darwin') {
          command = 'open';
          args = [
            '-a',
            'Steam',
            `steam://run/${this.config.tf2.gameId}//`,
            this.config.tf2.launchParams,
          ];
        }
        
        console.log(`🎮 Launching TF2 on ${platform}...`);
        console.log(`   Command: ${command} ${args.join(' ')}`);
        
        this.gameProcess = spawn(command, args, {
          detached: false,
          stdio: ['ignore', 'pipe', 'pipe'],
        });
        
        this.isRunning = true;
        this.gameProcess.pid && console.log(`✓ TF2 launched (PID: ${this.gameProcess.pid})`);
        
        // Emit launch event
        this.emit('launched', {
          pid: this.gameProcess.pid,
          platform: platform,
          timestamp: new Date(),
        });
        
        const timeout = setTimeout(() => {
          resolve({
            success: true,
            pid: this.gameProcess.pid,
          });
        }, 5000);
        
        this.gameProcess.once('error', (err) => {
          clearTimeout(timeout);
          this.isRunning = false;
          reject(err);
        });
        
        this.gameProcess.once('close', (code) => {
          clearTimeout(timeout);
          this.isRunning = false;
          console.log(`! TF2 closed with code ${code}`);
          this.emit('closed', { code });
        });
        
      } catch (err) {
        reject(err);
      }
    });
  }
  
  /**
   * Kill TF2 process
   */
  kill() {
    if (!this.gameProcess || !this.isRunning) {
      console.warn('TF2 is not running');
      return false;
    }
    
    try {
      this.gameProcess.kill();
      this.isRunning = false;
      console.log('✓ TF2 terminated');
      return true;
    } catch (err) {
      console.error('Error killing TF2:', err.message);
      return false;
    }
  }
  
  /**
   * Get launcher status
   */
  getStatus() {
    return {
      running: this.isRunning,
      pid: this.gameProcess?.pid || null,
      platform: os.platform(),
    };
  }
}

export default TF2Launcher;
