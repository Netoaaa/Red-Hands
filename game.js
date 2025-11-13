// game.js - Simultaneous reaction-based PvP (best-of-3)
let canvas = null;
let ctx = null;
let attackTimer = 0;
let randomDelay = Math.random() * 3000 + 1000;
let tensionLevel = 0;
let player1Score = 0;
let player2Score = 0;
let currentRound = 1;
let roundOver = false;
let matchOver = false;
let promptOpen = false;
let promptTimer = 0;
const PROMPT_TIMEOUT = 2000;
let promptTime = 0;
let p1React = null;
let p2React = null;
let lastTime = 0;

function draw() {
  if (!ctx || !canvas) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Slight vibration during tension buildup
  const offsetX = tensionLevel > 0.5 ? Math.sin(Date.now() / 100) * 2 : 0;
  const offsetY = tensionLevel > 0.5 ? Math.cos(Date.now() / 100) * 2 : 0;

  const p1Pos = { x: 120, y: 160 };
  const p2Pos = { x: 280, y: 160 };

  ctx.save();
  ctx.translate(offsetX, offsetY);
  
  // Player 1 hand (red, left)
  ctx.fillStyle = 'red';
  ctx.beginPath();
  ctx.arc(p1Pos.x, p1Pos.y, 34, 0, Math.PI * 2);
  ctx.fill();
  
  // Player 2 hand (blue, right)
  ctx.fillStyle = 'blue';
  ctx.beginPath();
  ctx.arc(p2Pos.x, p2Pos.y, 34, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.restore();

  // Tension bar at bottom during buildup
  if (!promptOpen && tensionLevel > 0) {
    ctx.fillStyle = `rgba(255, 200, 0, ${0.3 + 0.2 * tensionLevel})`;
    ctx.fillRect(0, canvas.height - 12, canvas.width * tensionLevel, 12);
  }
}

function gameLoop(ts) {
  if (!lastTime) lastTime = ts;
  const delta = ts - lastTime;
  lastTime = ts;

  if (matchOver) {
    draw();
    return;
  }

  // Tension buildup phase
  if (!roundOver && !promptOpen) {
    attackTimer += delta;
    tensionLevel = Math.min(attackTimer / randomDelay, 1);
    if (attackTimer >= randomDelay) {
      openPrompt();
    }
  } 
  // Prompt active phase
  else if (promptOpen) {
    promptTimer += delta;
    // Both reacted or timeout
    if ((p1React !== null && p2React !== null) || promptTimer >= PROMPT_TIMEOUT) {
      decideByReaction();
    }
  }

  draw();
  requestAnimationFrame(gameLoop);
}

function openPrompt() {
  promptOpen = true;
  promptTimer = 0;
  promptTime = Date.now();
  p1React = null;
  p2React = null;
  
  // Show prompts in DOM
  const left = document.getElementById('promptLeft');
  const right = document.getElementById('promptRight');
  if (left) left.classList.add('show');
  if (right) right.classList.add('show');
  
  // Clear reaction displays
  const r1 = document.getElementById('p1react');
  const r2 = document.getElementById('p2react');
  if (r1) r1.textContent = '—';
  if (r2) r2.textContent = '—';
  
  const rr = document.getElementById('roundResult');
  if (rr) rr.textContent = '';
}

function closePrompt() {
  promptOpen = false;
  const left = document.getElementById('promptLeft');
  const right = document.getElementById('promptRight');
  if (left) left.classList.remove('show');
  if (right) right.classList.remove('show');
}

function handlePlayerAction(player) {
  if (matchOver) return;
  
  // Premature press (before prompt opens)
  if (!promptOpen) {
    const winner = player === 1 ? 2 : 1;
    player1Score += winner === 1 ? 1 : 0;
    player2Score += winner === 2 ? 1 : 0;
    checkMatchOver(winner, 'premature press');
    return;
  }
  
  // Record reaction time
  const reactionMs = Math.max(0, Math.round(Date.now() - promptTime));
  if (player === 1) {
    if (p1React === null) {
      p1React = reactionMs;
      const r1 = document.getElementById('p1react');
      if (r1) r1.textContent = p1React;
    }
  } else {
    if (p2React === null) {
      p2React = reactionMs;
      const r2 = document.getElementById('p2react');
      if (r2) r2.textContent = p2React;
    }
  }
}

function decideByReaction() {
  closePrompt();
  roundOver = true;
  
  // Treat null as -1 (no reaction)
  const a = p1React === null ? -1 : p1React;
  const b = p2React === null ? -1 : p2React;

  // Both missed
  if (a === -1 && b === -1) {
    updateReactionDisplay(a, b);
    scheduleNextRound('no reactions (tie)', 0);
    return;
  }
  
  // Only P1 reacted
  if (a !== -1 && b === -1) {
    player1Score++;
    updateReactionDisplay(a, b);
    checkMatchOver(1, 'fastest');
    return;
  }
  
  // Only P2 reacted
  if (a === -1 && b !== -1) {
    player2Score++;
    updateReactionDisplay(a, b);
    checkMatchOver(2, 'fastest');
    return;
  }
  
  // Both reacted: fastest wins
  if (Math.abs(a - b) <= 1) {
    // Tie within 1ms
    updateReactionDisplay(a, b);
    scheduleNextRound('exact tie', 0);
    return;
  }
  
  const winner = a < b ? 1 : 2;
  if (winner === 1) player1Score++;
  else player2Score++;
  
  updateReactionDisplay(a, b);
  checkMatchOver(winner, 'fastest');
}

function updateReactionDisplay(a, b) {
  const r1 = document.getElementById('p1react');
  const r2 = document.getElementById('p2react');
  if (r1) r1.textContent = a >= 0 ? a : '—';
  if (r2) r2.textContent = b >= 0 ? b : '—';
}

function checkMatchOver(winner, reason) {
  const rr = document.getElementById('roundResult');
  if (rr) rr.textContent = `Winner: P${winner} — ${reason}`;
  
  updateScoreboard();
  
  if (player1Score >= 2 || player2Score >= 2) {
    matchOver = true;
    if (rr) rr.textContent = `🎉 Match Winner: P${player1Score > player2Score ? 1 : 2}`;
    return;
  }
  
  scheduleNextRound(reason, 1200);
}

function scheduleNextRound(reason, delay) {
  updateScoreboard();
  setTimeout(() => {
    if (!matchOver) {
      currentRound++;
      attackTimer = 0;
      tensionLevel = 0;
      randomDelay = Math.random() * 3000 + 1000;
      promptOpen = false;
      promptTimer = 0;
      p1React = null;
      p2React = null;
      roundOver = false;
      updateScoreboard();
    }
  }, delay);
}

function updateScoreboard() {
  const p1 = document.getElementById('p1score');
  const p2 = document.getElementById('p2score');
  const rnum = document.getElementById('roundNum');
  
  if (p1) p1.textContent = player1Score;
  if (p2) p2.textContent = player2Score;
  if (rnum) rnum.textContent = currentRound;
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
      console.error('Canvas not found');
      return;
    }
    ctx = canvas.getContext('2d');
    attachControls();
    updateScoreboard();
    requestAnimationFrame(gameLoop);
  });
}