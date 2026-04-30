/**
 * Game Coordinator Connection Module
 * Manages connection to TF2 Game Coordinator via protobuf
 */

import TF2 from 'tf2';
import { EventEmitter } from 'events';

export class GameCoordinatorConnection extends EventEmitter {
  constructor(steamClient, config) {
    super();
    this.steamClient = steamClient;
    this.config = config;
    this.tf2Client = null;
    this.connected = false;
  }

  /**
   * Connect to Game Coordinator
   */
  async connect() {
    return new Promise((resolve, reject) => {
      try {
        console.log('🔗 Initializing Game Coordinator...');
        
        this.tf2Client = new TF2(this.steamClient);
        
        // Handle connection
        this.tf2Client.on('connectedToGC', () => {
          this.connected = true;
          console.log('✅ Connected to Game Coordinator');
          this.emit('connected');
          resolve();
        });

        // Handle disconnect
        this.tf2Client.on('disconnectedFromGC', () => {
          this.connected = false;
          console.log('⚠️  Disconnected from Game Coordinator');
          this.emit('disconnected');
        });

        // Handle errors
        this.tf2Client.on('error', (err) => {
          console.error('❌ Game Coordinator error:', err.message);
          reject(err);
        });

        // Handle GC ready
        this.tf2Client.on('ready', () => {
          console.log('🎮 Game Coordinator ready');
          this.emit('ready');
        });

        // Connect with timeout
        const timeout = setTimeout(() => {
          reject(new Error(`Game Coordinator connection timeout after ${this.config.server.timeout}ms`));
        }, this.config.server.timeout);

        this.tf2Client.once('connectedToGC', () => {
          clearTimeout(timeout);
        });

      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Disconnect from Game Coordinator
   */
  disconnect() {
    if (this.tf2Client) {
      this.tf2Client.disconnect();
      this.connected = false;
      console.log('✓ Disconnected from Game Coordinator');
    }
  }

  /**
   * Check if connected to Game Coordinator
   */
  isConnected() {
    return this.connected;
  }

  /**
   * Get TF2 client instance
   */
  getClient() {
    if (!this.tf2Client) {
      throw new Error('Game Coordinator client not initialized');
    }
    return this.tf2Client;
  }

  /**
   * Send message to Game Coordinator
   */
  sendMessage(message) {
    if (!this.connected) {
      throw new Error('Not connected to Game Coordinator');
    }
    try {
      this.tf2Client.send(message);
      return true;
    } catch (err) {
      console.error('Error sending message to GC:', err.message);
      return false;
    }
  }
}

export default GameCoordinatorConnection;
