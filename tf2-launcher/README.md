# 🎮 TF2 Launcher

> **Lightweight application for Steam login, TF2 launch, and Game Coordinator connection with minimal resource consumption**

## Features

✨ **Key Capabilities:**
- 🔐 Steam authentication with 2FA (TOTP) support
- 🎮 Cross-platform TF2 launcher (Windows, macOS, Linux)
- 🔗 Protobuf-based Game Coordinator connection
- 💾 Optimized memory usage (50-100MB)
- 📱 Console-based interface with real-time status
- 🛡️ Graceful error handling and recovery

## Requirements

- **Node.js**: 18.0.0+
- **Steam Account**: Valid Steam account with TF2 access
- **Team Fortress 2**: Installed and accessible
- **2FA Secret**: Steam Guard 2FA secret key (required for automated login)

## Installation

```bash
# Clone or download the repository
cd tf2-launcher

# Install dependencies
npm install

# Copy configuration template
cp .env.example .env

# Edit .env with your credentials
nano .env  # or use your preferred editor
```

## Configuration

Create `.env` file in the `tf2-launcher` directory:

```bash
# Steam Account Credentials
STEAM_USERNAME=your_steam_account
STEAM_PASSWORD=your_steam_password
STEAM_TOTP_SECRET=your_2fa_secret_from_authenticator

# TF2 Installation Path (adjust for your system)
# Windows:
TF2_GAME_DIR=C:\Program Files (x86)\Steam\steamapps\common\Team Fortress 2
# macOS:
# TF2_GAME_DIR=/Users/username/Library/Application Support/Steam/steamapps/common/Team Fortress 2
# Linux:
# TF2_GAME_DIR=~/.steam/steamapps/common/Team Fortress 2

# Game Coordinator Settings
GAME_COORDINATOR_TIMEOUT=5000
AUTO_GC_INTERVAL=60000

# Resource Optimization
MEMORY_LIMIT=128
GC_INTERVAL=60000
LOG_LEVEL=info
```

### Finding Your TOTP Secret

1. Go to **Steam Account Settings** → **Account Security**
2. Look for **2FA Authenticator Settings**
3. Generate a backup code or scan the QR code with an authenticator app
4. The secret key is usually shown as a base32 string

## Usage

### Run Application

```bash
npm start
```

### Development Mode (with auto-reload)

```bash
npm run dev
```

### With Node.js Garbage Collection

For better memory management:

```bash
node --expose-gc src/index.js
```

## Application Flow

```
┌─────────────────────────────────────┐
│  TF2 Launcher Application Started   │
└──────────────┬──────────────────────┘
               │
               ↓
    ┌──────────────────────┐
    │ Steam Authentication │
    │ (TOTP 2FA + Login)   │
    └──────────┬───────────┘
               │
               ↓ Success
    ┌──────────────────────┐
    │  Launch TF2 Process  │
    │ (Cross-platform)     │
    └──────────┬───────────┘
               │
               ↓ Success
    ┌──────────────────────┐
    │ GC Connection Ready  │
    │ (Protobuf Messages)  │
    └──────────┬───────────┘
               │
               ↓
    ┌──────────────────────┐
    │  Application Ready   │
    │  (Monitoring Mode)   │
    └──────────────────────┘
```

## Architecture

### Module Structure

```
src/
├── index.js                 # Main application orchestrator
├── config.js               # Configuration management & validation
├── auth/
│   └── steamAuth.js        # Steam login module
├── game/
│   └── tf2Launcher.js      # TF2 process manager
└── server/
    └── connection.js       # Game Coordinator via protobuf
```

### Key Classes

#### `SteamAuth`
Handles Steam authentication with 2FA support.

```javascript
const steamAuth = new SteamAuth(config);
await steamAuth.login();
const client = steamAuth.getClient();
steamAuth.logout();
```

#### `TF2Launcher`
Manages TF2 process on multiple platforms.

```javascript
const launcher = new TF2Launcher(config);
await launcher.launch();
const isRunning = launcher.isGameRunning();
await launcher.stop();
```

#### `GameCoordinatorConnection`
Connects to Game Coordinator via protobuf.

```javascript
const gc = new GameCoordinatorConnection(steamClient, config);
await gc.connect();
const playerInfo = await gc.getPlayerInfo();
await gc.disconnect();
```

## Resource Optimization

The application is optimized for minimal resource usage:

### Memory Management
- **Initial Memory**: ~50MB (Node.js + dependencies)
- **Running Memory**: ~80-100MB (with GC)
- **Periodic GC**: Every 60 seconds (configurable)

### Performance Features
- 🔄 Automatic garbage collection
- 📊 Real-time memory monitoring
- ⏱️ Connection timeout handling
- 🔌 Graceful shutdown

### Configuration

```javascript
// In config.js
resource: {
  memoryLimit: 128,        // MB
  gcInterval: 60000,       // ms
}
```

## Status Indicators

The application displays status with emoji indicators:

| Icon | Status |
|------|--------|
| ✅ | Success / Connected |
| ❌ | Error / Failed |
| 🔄 | In Progress |
| ⚠️ | Warning |
| 🔐 | Security / Authentication |
| 🔗 | Connection |
| 💾 | Memory / Storage |

## Troubleshooting

### "STEAM_USERNAME not set"
→ Configure `.env` file with your Steam account

### "Steam Guard required"
→ Set `STEAM_TOTP_SECRET` in `.env` with your authenticator secret

### "Failed to launch TF2"
→ Check `TF2_GAME_DIR` path exists and is correct for your OS

### "Game Coordinator timeout"
→ Increase `GAME_COORDINATOR_TIMEOUT` in `.env`

### "High memory usage"
→ Decrease `GC_INTERVAL` or enable with `node --expose-gc`

## Dependencies

- **steam-user** (^5.1.0) - Steam network protocol
- **steam-totp** (^2.2.0) - 2FA code generation
- **tf2** (^3.0.0) - Game Coordinator interaction
- **protobufjs** (^7.2.5) - Protocol buffer serialization

All modules are MIT licensed or similar open-source licenses.

## Platform Support

| Platform | Status | Notes |
|----------|--------|-------|
| Windows | ✅ | Fully supported |
| macOS | ✅ | Requires Steam app path adjustment |
| Linux | ✅ | Requires 32-bit Steam libs |

## Advanced Usage

### Custom Launch Arguments

Edit `.env`:
```bash
TF2_LAUNCH_ARGS=-game tf -h 1920x1080 -w 1080 -no_soundscape
```

### Monitoring Memory Usage

The application logs memory every 60 seconds:
```
💾 Memory: 85MB / 256MB
💾 Memory: 88MB / 256MB
```

### Programmatic Integration

```javascript
import { config, validateConfig } from './config.js';
import SteamAuth from './auth/steamAuth.js';

validateConfig();
const auth = new SteamAuth(config);
await auth.login();
// Use elsewhere in your code
```

## Contributing

Contributions welcome! This project uses:
- **node-steam-user** - Steam protocol implementation
- **Protobufs** - Updated protobuf definitions
- All your forked modules

## License

MIT

## Support

For issues related to:
- **Steam**: See [node-steam-user](https://github.com/valveOS/node-steam-user)
- **TF2**: See [node-tf2](https://github.com/valveOS/node-tf2)
- **Protobufs**: See [Protobufs](https://github.com/valveOS/Protobufs)
- **2FA**: See [steam-totp](https://github.com/valveOS/node-steam-totp)

## Disclaimer

This tool is for personal use only. Comply with Steam's Terms of Service. Use of automation tools may violate ToS in some cases.

---

**Made with ❤️ for the TF2 community**
