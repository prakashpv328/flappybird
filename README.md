# Flappy Gird Game

The classic **Flappy Bird** game with a modern gameplay features,gameplay mechanics **powerups,themes,difficulty modes,coins,history,sound controls** and **mobile-friendly touch controls** (tap to jump + tap pause icon).

## Game Features

### Core GamePlay
- **4-Frame bird Sprite animation** for smooth animation
- **Moving background** for immersive gameplay
- **Difficulty change Option** for control game speed
- **Collision detection** with perfect accuracy
- **score tracking** with best score saved in local storage
- **pause/Resume System**
    - Desktop:`Space`
    - Mobile:tap the **pause icon(⏸️ / ▶️)**

### Themes
Choose between two beautiful themes:
- **Oasis Theme** - fertile landscape
- **Desert Theme** - desert landscape

### Difficulty Levels
- **Easy** - for beginners
- **Medium** - for intermidiate
- **Hard** - for experts

### Power ups
Collect special power-ups to gain advantange:
- **Shield** - Survive collision(5 seconds)
- **Slow Motion** - Half game speed(5 seconds)
- **Double Points** - 2x score multiplier (5 seconds)
- **Magnet** - Auto-attract nearby coins (5 seconds)

### Coins System
- Collect  coins during gameplay
- Earn **+3 points** per coin for Double Points **+6 points**
- Total coins store across game session
- Tracks:
    - **Coins this game**
    - **Total coins** across all sessions stored in **localStorage**

### History
- **Best Score tracting** with local storage
- **Total Coins collected** across all games
- **Game History** - Last 50 games with:
    - Date & time
    - Score & coins earned
    - Difficulty & theme used
- Options:
    - **Clear History**
    - **Reset All Data**

### Sound Controls
- Background music toggle+volume
- SFX toggle+volume
- Sound preferences are saved in **localStorage**

## Controls 
### Keyboard Controls
- key ->action
- `Space` -> Start game,pause-resume,restart
- `Enter` -> Start game,restart
- `↑ (Arrow Up)` -> jump/start game
- `W` -> jump

### Mobile/Touch
- **Start button** to begin
- **Tap anywhere on the game board** to jump
- **Tap the pause icon (⏸️ / ▶️)**
- Popups (Settings,History,Sound) are touch friendly

### Mouse Controls
- **Click Start Game button** - Begin playing
- **Setings button** - Open settings menu
- **History button** - view game history

## UI Menus
- **Settings**:theme + difficulty+data rest options
- **History**:view last 50 games
- **Sound**:music +sfx toggle and volume sliders

## Data Storage (localStorage keys)
- **flappyBirdHighScore**
- **flappyBirdHistory**
- **totalCoins**
- **flappyMusicEnabled**,**flappySfxEnabled**
- **flappyMusicVolume**,**FlappySfxVolume**

## Notes
- designed for both **desktop and mobiles**
- Mobile UI:full screen board scaling +responsive popups
- keep your devices in **best performance/High performance mode** for the best experiance.
