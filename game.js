// game.js - Simultaneous reaction-based PvP (best-of-3)
let canvas = null;
let ctx = null;
let attackTimer = 0;
let randomDelay = Math.random() * 3000 + 1000;
let tensionLevel = 0;
let player1Score = 0;
let player2Score = 0;
let currentRound = 1;
const maxRounds = 3;
let roundOver = false;
let matchOver = false;
let promptOpen = false;
let promptTimer = 0;
const PROMPT_TIMEOUT = 2000;
let promptTime = 0;
let p1React = null;
let p2React = null;

const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

function draw() {
  if (!ctx || !canvas) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const offsetX = tensionLevel > 0.5 ? Math.sin(Date.now() / 100) * 2 : 0;
  const offsetY = tensionLevel > 0.5 ? Math.cos(Date.now() / 100) * 2 : 0;
  const left = { x: 120, y: 160 };
  const right = { x: 280, y: 160 };
  ctx.save();
  ctx.translate(offsetX, offsetY);
  ctx.fillStyle = 'red';
  ctx.beginPath();
  ctx.arc(left.x, left.y, 34, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'blue';
  ctx.beginPath();
  ctx.arc(right.x, right.y, 34, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  if (!promptOpen) {
    ctx.fillStyle = `rgba(0,0,0,${0.07 + 0.2 * tensionLevel})`;
    ctx.fillRect(0, canvas.height - 18, canvas.width, 18);
    ctx.font = '14px Arial';
    ctx.fillStyle = '#000';
    ctx.fillText('Get Ready...', 10, canvas.height - 2);
  }
}

let lastTime = 0;
function gameLoop(ts) {
  if (!lastTime) lastTime = ts;
  const delta = ts - lastTime;
  lastTime = ts;
  if (matchOver) {
    draw();
    return;
  }
  if (!roundOver && !promptOpen) {
    attackTimer += delta;
    tensionLevel = Math.min(attackTimer / randomDelay, 1);
    if (attackTimer >= randomDelay) {
      openPrompt();
    }
  } else if (promptOpen) {
    promptTimer += delta;
    if (p1React !== null && p2React !== null) decideByReaction();
    else if (promptTimer >= PROMPT_TIMEOUT) decideByReaction();
  }
  draw();
  requestAnimationFrame(gameLoop);
}

function openPrompt() {
  promptOpen = true;
  promptTimer = 0;
  promptTime = now();
  p1React = null;
  p2React = null;
  const left = document.getElementById('promptLeft');
  const right = document.getElementById('promptRight');
  if (left && right) {
    left.classList.add('show');
    right.classList.add('show');
  }
  const r1 = document.getElementById('p1react'); if (r1) r1.textContent = '—';
  const r2 = document.getElementById('p2react'); if (r2) r2.textContent = '—';
  const rr = document.getElementById('roundResult'); if (rr) rr.textContent = '';
}

function closePrompt() {
  promptOpen = false;
  const left = document.getElementById('promptLeft');
  const right = document.getElementById('promptRight');
  if (left && right) {
    left.classList.remove('show');
    right.classList.remove('show');
  }
}

function handlePlayerAction(player) {
  if (matchOver) return;
  if (!promptOpen) {
    const winner = (player === 1) ? 2 : 1;
    applyRoundResult(winner, 'premature press');
    return;
  }
  const reactionMs = Math.max(0, Math.round(now() - promptTime));
  if (player === 1) {
    if (p1React === null) {
      p1React = reactionMs;
      const r1 = document.getElementById('p1react'); if (r1) r1.textContent = p1React;
    }
  } else {
    if (p2React === null) {
      p2React = reactionMs;
      const r2 = document.getElementById('p2react'); if (r2) r2.textContent = p2React;
    }
  }
}

function decideByReaction() {
  if (!promptOpen && roundOver) return;
  closePrompt();
  roundOver = true;
  const a = (p1React === null) ? -1 : p1React;
  const b = (p2React === null) ? -1 : p2React;
  const r1 = document.getElementById('p1react'); if (r1) r1.textContent = a >= 0 ? a : '—';
  const r2 = document.getElementById('p2react'); if (r2) r2.textContent = b >= 0 ? b : '—';
  let winner = 0;
  let reason = '';
  if (a === -1 && b === -1) {
    reason = 'no reactions (tie)';
  } else if (a !== -1 && (b === -1)) {
    winner = 1; reason = 'fastest';
  } else if (b !== -1 && (a === -1)) {
    winner = 2; reason = 'fastest';
  } else {
    if (a === b) {
      reason = 'exact tie';
    } else {
      winner = (a < b) ? 1 : 2;
      reason = 'fastest';
    }
  }
  if (winner === 1) player1Score++;
  if (winner === 2) player2Score++;
  const rr = document.getElementById('roundResult');
  if (rr) {
    if (winner === 0) rr.textContent = `Round: tie (${reason})`;
    else rr.textContent = `Winner: ${winner === 1 ? 'P1' : 'P2'} — ${reason}`;
  }
  updateScoreboard();
  if (player1Score >= 2 || player2Score >= 2) {
    matchOver = true;
    const rr2 = document.getElementById('roundResult');
    if (rr2) rr2.textContent = `Match Winner: ${player1Score > player2Score ? 'P1' : 'P2'}`;
    return;
  }
  setTimeout(() => {
    currentRound++;
    roundOver = false;
    attackTimer = 0;
    tensionLevel = 0;
    randomDelay = Math.random() * 3000 + 1000;
    promptOpen = false;
    promptTimer = 0;
    p1React = null;
    p2React = null;
    updateScoreboard();
  }, 1200);
}

function updateScoreboard() {
  const p1 = document.getElementById('p1score'); if (p1) p1.textContent = player1Score;
  const p2 = document.getElementById('p2score'); if (p2) p2.textContent = player2Score;
  const rnum = document.getElementById('roundNum'); if (rnum) rnum.textContent = currentRound;
}

function attachControls() {
  document.addEventListener('keydown', (e) => {
    if (matchOver) return;
    if (e.code === 'Space') handlePlayerAction(1);
    if (e.code === 'Enter') handlePlayerAction(2);
  });
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    canvas = document.getElementById('gameCanvas');
    if (!canvas) {
      console.error('No canvas found.');
      return;
    }
    ctx = canvas.getContext('2d');
    attachControls();
    updateScoreboard();
    requestAnimationFrame(gameLoop);
  });
} else {
  console.warn('Browser environment required.');
}

function draw() {
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Visual tension: Slight vibration on attack build-up
    let offsetX = tensionLevel > 0.5 ? Math.sin(Date.now() / 100) * 2 : 0;
    let offsetY = tensionLevel > 0.5 ? Math.cos(Date.now() / 100) * 2 : 0;

    // Basic positions
    const p1 = { x: 150, y: 150 };
    const p2 = { x: 250, y: 150 };

    // retract visual: move defender's hand up when retracted
    const retractOffset = defenderRetracted ? -40 : 0;

    ctx.save();
    ctx.translate(offsetX, offsetY);
    // Player 1 hand
    ctx.fillStyle = 'red';
    const p1Y = attacker === 2 && defenderRetracted ? p1.y + retractOffset : p1.y;
    ctx.beginPath();
    ctx.arc(p1.x, p1Y, 30, 0, Math.PI * 2);
    ctx.fill();
    // Player 2 hand
    ctx.fillStyle = 'blue';
    const p2Y = attacker === 1 && defenderRetracted ? p2.y + retractOffset : p2.y;
    ctx.beginPath();
    ctx.arc(p2.x, p2Y, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    if (attackWindow) {
        ctx.fillStyle = 'rgba(255, 215, 0, 0.35)'; // alert
        ctx.fillRect(0, 280, canvas.width, 20);
        ctx.font = '16px Arial';
        ctx.fillStyle = '#000';
        ctx.fillText('ATTACK!', 170, 295);
    }

    if (roundOver) {
        ctx.font = '20px Arial';
        ctx.fillStyle = '#111';
        ctx.fillText('Round Over', 160, 150);
    }
}

function gameLoop(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const delta = timestamp - lastTime;
    lastTime = timestamp;
    if (matchOver) return; // stop when match finishes

    if (!roundOver) {
        if (!attackWindow) {
            attackTimer += delta;
            tensionLevel = Math.min(attackTimer / randomDelay, 1);
            if (attackTimer >= randomDelay) {
                // open attack window
                attackWindow = true;
                attackWindowTimer = 0;
                promptTime = performance.now();
                p1React = null;
                p2React = null;
                // clear reaction display
                if (typeof document !== 'undefined') {
                    const r1 = document.getElementById('p1react'); if (r1) r1.textContent = '—';
                    const r2 = document.getElementById('p2react'); if (r2) r2.textContent = '—';
                    const rr = document.getElementById('roundResult'); if (rr) rr.textContent = '';
                }
            }
        } else {
                // If prompt is open, wait for reactions or timeout
                attackWindowTimer += delta;
                if (attackWindowTimer >= PROMPT_TIMEOUT) {
                    // timeout: decide based on who reacted
                    decideByReaction();
                } else {
                    // if both reacted, decide immediately
                    if (p1React !== null && p2React !== null) decideByReaction();
                }
        }
    }
    draw();
    requestAnimationFrame(gameLoop);
}

// Controls (keyboard for simplicity; adapt to mobile taps)
function attachControls() {
    document.addEventListener('keydown', (e) => {
        if (matchOver) return;
        if (e.code === 'Space') handlePlayerAction(1);
        if (e.code === 'Enter') handlePlayerAction(2);
    });
}

function handlePlayerAction(player) {
    if (roundOver) return;
    // Reaction-based: both players press after prompt opens
    if (!attackWindow) {
        // premature press -> opponent wins round
        const winner = player === 1 ? 2 : 1;
        applyRoundResult(winner, 'premature-press');
        return;
    }
    // If prompt open, record reaction time if not already recorded
    const now = performance.now();
    const reaction = Math.max(0, Math.round(now - promptTime));
    if (player === 1) {
        if (p1React === null) p1React = reaction;
    } else {
        if (p2React === null) p2React = reaction;
    }
    // update DOM for reaction times
    updateReactionDisplay();
    // decision will be handled in gameLoop when both reacted or on timeout
}

function applyRoundResult(winner, reason) {
    roundOver = true;
    attackWindow = false;
    p1React = p1React === null ? -1 : p1React;
    p2React = p2React === null ? -1 : p2React;
    if (winner === 1) player1Score++;
    if (winner === 2) player2Score++;
    updateScoreboard();
    // show reaction results
    if (typeof document !== 'undefined') {
        const r1 = document.getElementById('p1react'); if (r1) r1.textContent = p1React >= 0 ? p1React : '—';
        const r2 = document.getElementById('p2react'); if (r2) r2.textContent = p2React >= 0 ? p2React : '—';
        const rr = document.getElementById('roundResult'); if (rr) rr.textContent = `Winner: ${winner === 1 ? 'P1' : 'P2'} (${reason})`;
    }
    // check match over
    if (player1Score >= 2 || player2Score >= 2) {
        matchOver = true;
        // show final state for a moment
        setTimeout(() => {}, 1500);
        return;
    }
    // next round after pause
    setTimeout(() => {
        currentRound++;
        attacker = currentRound % 2 === 1 ? 1 : 2;
        resetRound(false);
    }, 1200);
}

function resetRound(pause = true) {
    attackTimer = 0;
    tensionLevel = 0;
    randomDelay = Math.random() * 3000 + 1000;
    roundOver = pause;
    attackWindow = false;
    attackWindowTimer = 0;
    attackOccurred = false;
    defenderRetracted = false;
    updateScoreboard();
    if (pause) setTimeout(() => { roundOver = false; }, 1200);
}

function decideByReaction() {
    // Determine winner by fastest (lowest non-negative) reaction time
    // p1React or p2React may be null or -1
    const a = (p1React === null) ? -1 : p1React;
    const b = (p2React === null) ? -1 : p2React;
    // If both didn't react -> no score (tie)
    if ((a === -1 || a === null) && (b === -1 || b === null)) {
        // no one reacted -> no points, advance round
        if (typeof document !== 'undefined') {
            const rr = document.getElementById('roundResult'); if (rr) rr.textContent = 'No reactions — tie';
        }
        setTimeout(() => {
            currentRound++;
            attacker = currentRound % 2 === 1 ? 1 : 2;
            resetRound(false);
        }, 900);
        return;
    }
    // If only one reacted, they win
    if ((a !== -1 && a !== null) && (b === -1 || b === null)) {
        applyRoundResult(1, 'fastest'); return;
    }
    if ((b !== -1 && b !== null) && (a === -1 || a === null)) {
        applyRoundResult(2, 'fastest'); return;
    }
    // both reacted -> compare
    if (Math.abs(a - b) <= 1) {
        // too close -> tie
        if (typeof document !== 'undefined') {
            const rr = document.getElementById('roundResult'); if (rr) rr.textContent = 'Tie — too close';
        }
        setTimeout(() => {
            currentRound++;
            attacker = currentRound % 2 === 1 ? 1 : 2;
            resetRound(false);
        }, 900);
        return;
    }
    const winner = a < b ? 1 : 2;
    applyRoundResult(winner, 'fastest');
}

function settleBet(attackerWins) {
    if (!tonWallet) {
        console.log('No wallet connected—bet simulated.');
        return;
    }
    // Real impl: Use TonConnect to send/receive TON
    // E.g., winner gets 1.8 * bet, rake (0.2) into treasury/cagnotte
    console.log(`${attackerWins ? 'Attacker' : 'Defender'} wins bet of ${currentBet} TON!`);
}

// Init TON Connect (placeholder—add full SDK call)
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        // Init canvas/context after DOM ready
        canvas = document.getElementById('gameCanvas');
        if (!canvas) {
            console.error('No element with id "gameCanvas" found. Game not started.');
            return;
        }
        ctx = canvas.getContext('2d');

        // Attach controls and start loop
        attachControls();
        // init attacker based on round
        attacker = currentRound % 2 === 1 ? 1 : 2;
        updateScoreboard();

        // tonWallet = new TonConnect(); // Full code: Create connector, connect wallet
        // On connect: Unlock real bets

        requestAnimationFrame(gameLoop);
    });
} else {
    console.warn('`document` is not available. This script is intended to run in a browser.');
}

function updateScoreboard() {
    if (typeof document === 'undefined') return;
    const p1 = document.getElementById('p1score');
    const p2 = document.getElementById('p2score');
    const roundNum = document.getElementById('roundNum');
    const attackerEl = document.getElementById('attacker');
    if (p1) p1.textContent = player1Score;
    if (p2) p2.textContent = player2Score;
    if (roundNum) roundNum.textContent = currentRound;
    if (attackerEl) attackerEl.textContent = attacker === 1 ? 'P1' : 'P2';
}