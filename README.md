# Red Hands: TON Web-Based Crypto Slapping Duel Game

## Project Overview
**Red Hands** is a web-based crypto game inspired by the classic IRL "Red Hands" or "Slapping Hands" game (popular worldwide as a reflex duel where players slap each other's palms before the other pulls away). The game adapts this into a PvP (player-vs-player) digital experience with blockchain bets, using TON for low-cost, fast transactions. Players duel via a top-down view interface, with tension built through unpredictable timing, penalties, and rewards. It aims to be "fun and addictive" rather than just a betting machine, with an economy fueled by rake (provision fees) that feeds free plays and NFT customization.

### Key Inspirations
- **IRL Origins**: Popular party game emphasizing thrill, timing, and social interaction. Adapted from Android apps like [Peaksel Games' 2-Player Red Hands](https://play.google.com/store/apps/details?id=com.redhands.twoplayergames&hl=en) (2-Player slapping simulator with leaderboards and local multiplayer).
- **Crypto Context**: Drawn from "dumb" web-based crypto games (e.g., staking/idle games that evolve from Ponzi-like structures to sustainable models with external value flows). Avoids pure Ponzi by using real PvP wagers and rake for rewards.
- **Why Sustainable?**: Solo/PvP duels create win/lose dynamics (like poker), with rake redistributed to fund free plays, pools, and community perks. No infinite inflation—flux is controlled.

### Core Gameplay Loop
1. **Setup**: Two players (or solo vs. AI bot) face off. Each deposits a wager (e.g., 0.01 TON per round).
2. **Duel Phases**:
   - **Build-Up**: Random delay (1-4 seconds) builds tension (visual indicators like hand vibrations or fade-ins simulate "mind reading" IRL).
   - **Attack/Defense**: Attacker "slaps" (virtual action); Defender "dodges" (withdraws hands) within the window.
   - **Outcome**: Hit = Penalty for defender (lose points or wager); Miss = Penalty for attacker; Successful dodge = Points for defender.
   - **Win Condition**: Best of 3-5 rounds. Winner takes ~90% of pot (e.g., 0.018 TON from 0.02 TON pot), rake (~10%) funds company/prize pools.
3. **Extensions**: NFTs customize hands (e.g., Simpsons-style 4-fingers, gloves). Multi-move mechanics (attack, dodge, feint, special slap) add depth.
4. **Feedback**: Immediate visuals (slap sounds/animations), score tracking, and post-round payouts via TON wallet.

### Economic Model
- **Wager System**: PvP pots create zero-sum games (like skill-based games, not pure gambling).
- **Rake Distribution**: 10% rake per pot.
  - 5% to company (treasury for dev/maintenance).
  - 5% to cagnotte (prize pool for free plays, lotteries, or boosted rounds).
- **Free Plays**: Funded by cagnotte to lower barriers (e.g., 1000 free duels for ~$60 at 0.01 TON ~$6 each).
- **NFT Utility**: Cosmetic/customization (no pay-to-win)—hands as collectibles minted on TON, tradeable.
- **Sustainability**: Attracts new players via virality (Telegram Mini Apps), retains via fun/social elements. Unlike pure idle games, this has skill/reward balance.
- **Launch Plan**: Start with sponsored cagnotte, viral Telegram bots, solo-mode testing, then multi-player.

### Tech Stack
- **Frontend**: HTML5/Canvas + JavaScript for web-based gameplay (mobile-responsive).
- **Blockchain**: TON (low fees ~$0.005-0.03/tx, fast confirmation). Use TonConnect SDK for wallet integration.
- **Deployment**: Free on GitHub Pages; scalable to TON Mini Apps for viral distribution.
- **Multiplayer**: WebSockets for real-time duels; back-end (e.g., Node.js) for matchmaking.
- **Assets**: Royalty-free SVG for hands/icons; generate NFTs via TON contracts.
- **Constraints**: No budget—built via open-source, no-code/Guerilla dev.

## Quick Start

Serve the folder and open `index.html` in a browser.

Using Python 3 built-in server:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

### Controls
- `Space` — Player 1 attacks
- `Enter` — Player 2 defends
- Connect wallet for real bets (currently simulated)

### Notes
- `game.js` is intended to run in a browser. If you open the file directly with a `file://` URL some browsers may restrict features; use a local server as above.
- The prototype is a simulation with placeholder TON bets. Full wallet integration coming soon.

## Prototype Files

Core files included in this repo:
- `index.html` — Main page with canvas and UI.
- `game.js` — Game loop, input handling, and bet simulation.
- `package.json` — Node dependencies (Playwright for demo capture).
- `.github/workflows/demo.yml` — GitHub Actions workflow to capture demo video on ubuntu-latest.
- `tools/demo.js` — Playwright script to automate demo capture.

## Next Steps/Roadmap
- **Phase 1**: Test proto locally/GitHub Pages; add wallet connection for real TON bets.
- **Phase 2**: Implement multi-move actions, NFT marketplace, and matchmaking.
- **Phase 3**: Deploy to TON Mini Apps for viral growth; integrate rake payouts.
- **Monetization**: Organic via fun retention; potential sponsors for initial cagnotte.
- **Challenges**: Addressing "dumb" stigma by focusing on skill/replayability.

## Resources
- [TON Docs](https://ton.org) for smart contracts.
- [TonConnect](https://tonconnect.tg) for wallet integration.
- [Mobile Inspiration](https://play.google.com/store/apps/details?id=com.redhands.twoplayergames&hl=en): Base mechanics adapted from this Android app.

---

This project encapsulates a full discussion—ideas, code, economics, and context. To use this repo as LLM context, run tools like [repomix](https://github.com/yamadashy/repomix) or [repo-to-llm](https://github.com/kickingkeys/repo-to-llm) to generate optimized summaries for LLM ingestion. 🍻
# Red-Hands