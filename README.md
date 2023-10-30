# Multiplayer Card Game

This project is designed to provide a multiplayer card game experience with a Vue.js frontend and an Express.js backend.

**Prerequisites**: Ensure two terminals are open: one for the API server (`server/`) and another for the Vue UI (`ui/`).

## Setup

1. Clone the latest examples repository.
2. Transfer all files from `lecture11-card-game/` to your assignment directory. **Avoid** copying the `.git` directory.
3. Navigate to both `server/` and `ui/` directories and install dependencies.

## Features

### Animated Card Component

- A new Vue component, `AnimatedCard.vue`, replaces the `<pre>`-based rendering.
- It visually differentiates between the last played card and other player cards.
- Intuitive design indicates when a card is not legal to play.

### Game Enhancements

- Aces are now "wild", offering more flexibility in gameplay.
- Real-time updates on players nearing game end with 1 or fewer cards.
- Dynamic configuration allows adjusting the number of decks and rank limit without restarting the server.

### Configuration Route

- A dedicated route, `/config`, provides a form for game configurations.
- This UI is accessible-friendly and shows an overlay when waiting for server responses.

## Development Highlights

- Server logic to make aces "wild" ensures game consistency.
- Socket.io events manage game configurations in real-time.
- Configuration updates influence only new games, preserving the state of current games.

