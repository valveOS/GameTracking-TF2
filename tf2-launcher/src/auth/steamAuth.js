/**
 * Steam Authentication Module
 * Handles Steam login with 2FA (TOTP) support
 */

import SteamUser from 'steam-user';
import SteamTotp from 'steam-totp';
import { EventEmitter } from 'events';

export class SteamAuth extends EventEmitter {
  constructor(config) {
    super();
    this.config = config;
    this.client = new SteamUser();
    this.authenticated = false;
  }

  /**
   * Perform Steam login
   */
  async login() {
    return new Promise((resolve, reject) => {
      try {
        const { username, password, sharedSecret } = this.config.steam;

        if (!username || !password) {
          throw new Error('Steam credentials not configured');
        }

        console.log(`🔐 Logging into Steam as ${username}...`);

        // Handle successful login
        this.client.on('loggedOn', () => {
          this.authenticated = true;
          console.log('✅ Successfully logged in to Steam');
          console.log(`   Account: ${this.client.accountInfo.name || username}`);
          this.emit('authenticated');
          resolve();
        });

        // Handle 2FA requirement
        this.client.on('steamGuard', (callback, lastCodeWrong) => {
          if (lastCodeWrong) {
            console.warn('⚠️  Previous 2FA code was incorrect');
          }

          let code;
          if (sharedSecret) {
            code = SteamTotp.generateAuthCode(sharedSecret);
            console.log('🔑 Generated 2FA code from shared secret');
          } else {
            throw new Error('Steam Guard required but STEAM_TOTP_SECRET not configured');
          }

          callback(code);
        });

        // Handle errors
        this.client.on('error', (err) => {
          this.authenticated = false;
          console.error('❌ Steam authentication error:', err.message);
          reject(err);
        });

        // Handle disconnection
        this.client.on('disconnected', (eresult) => {
          if (this.authenticated) {
            console.warn('⚠️  Disconnected from Steam');
            this.authenticated = false;
            this.emit('disconnected');
          }
        });

        // Perform login
        this.client.logOn({
          accountName: username,
          password: password,
          rememberPassword: true,
          machineName: 'TF2Launcher',
        });

        // Set login timeout
        const timeout = setTimeout(() => {
          reject(new Error('Steam login timeout'));
        }, 30000);

        this.client.once('loggedOn', () => {
          clearTimeout(timeout);
        });

      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Logout from Steam
   */
  logout() {
    if (this.client) {
      this.client.logOff();
      this.authenticated = false;
      console.log('✓ Logged off from Steam');
    }
  }

  /**
   * Get Steam client instance
   */
  getClient() {
    if (!this.authenticated) {
      throw new Error('Not authenticated with Steam');
    }
    return this.client;
  }

  /**
   * Check authentication status
   */
  isAuthenticated() {
    return this.authenticated;
  }

  /**
   * Get account information
   */
  getAccountInfo() {
    if (!this.authenticated) {
      throw new Error('Not authenticated');
    }
    return {
      username: this.config.steam.username,
      accountName: this.client.accountInfo?.name || 'Unknown',
      steamID: this.client.steamID?.toString() || 'Unknown',
    };
  }
}

export default SteamAuth;
