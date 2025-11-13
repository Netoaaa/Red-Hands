let canvas = null;
let ctx = null;
let isAttacking = false;
let attackTimer = 0;
let randomDelay = Math.random() * 3000 + 1000; // Random 1-4s delay for IRL-like unpredictability/tension
let tensionLevel = 0; // Build-up for suspense (flashing/vibrating the "attention" state)
let player1Score = 0;
let player2Score = 0;
let roundOver = false;
let lastTime = 0; // For RAF timestamp deltas

// TON Placeholder: Simulate wallet connect and bet system
let tonWallet = null; // Will hook into TonConnect
let currentBet = 0.01; // In TON

function draw() {
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Visual tension: Slight vibration on attack build-up
    let offsetX = tensionLevel > 0.5 ? Math.sin(Date.now() / 100) * 2 : 0;
    let offsetY = tensionLevel > 0.5 ? Math.cos(Date.now() / 100) * 2 : 0;
    
    // Draw hands (top-down view, like app)
    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(150, 150, 30, 0, Math.PI * 2);
    ctx.fill(); // Player 1 hand
    ctx.fillStyle = 'blue';
    ctx.beginPath();
    ctx.arc(250, 150, 30, 0, Math.PI * 2);
    ctx.fill(); // Player 2 hand
    ctx.restore();
    
    if (isAttacking) {
        ctx.fillStyle = 'rgba(255, 0, 0, 0.5)'; // Tense overlay
        ctx.fillRect(0, 280, canvas.width, 20); // Bottom indicator
        ctx.font = '16px Arial';
        ctx.fillText('SLAP!', 180, 295);
    }
    
    if (roundOver) {
        ctx.font = '20px Arial';
        ctx.fillText(`Round Over! ${player1Score > player2Score ? 'P1' : 'P2'} Leads`, 100, 150);
    }
}

function gameLoop(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const delta = timestamp - lastTime;
    lastTime = timestamp;

    if (!roundOver) {
        attackTimer += delta;
        tensionLevel = Math.min(attackTimer / randomDelay, 1);

        if (attackTimer >= randomDelay) {
            isAttacking = true;
        }
    }
    draw();
    requestAnimationFrame(gameLoop);
}

// Controls (keyboard for simplicity; adapt to mobile taps)
function attachControls() {
    document.addEventListener('keydown', (e) => {
        if (roundOver) return;
        if (e.code === 'Space') { // P1 attacks
            if (isAttacking) {
                player1Score++; // Hit: Attacker scores
                settleBet(true);
                resetRound();
            } else {
                player1Score--; // Miss: Deduct from attacker
                settleBet(false);
                resetRound();
            }
        }
        if (e.code === 'Enter') { // P2 defends
            if (isAttacking) {
                player2Score++; // Successful defense/dodge
                settleBet(false); // Attacker loses
                resetRound();
            } else {
                player2Score--; // Premature defend penalty
                settleBet(true);
                resetRound();
            }
        }
    });
}

function resetRound() {
    isAttacking = false;
    attackTimer = 0;
    tensionLevel = 0;
    randomDelay = Math.random() * 3000 + 1000;
    roundOver = true;
    setTimeout(() => { roundOver = false; }, 2000); // Pause for next
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

        // tonWallet = new TonConnect(); // Full code: Create connector, connect wallet
        // On connect: Unlock real bets

        requestAnimationFrame(gameLoop);
    });
} else {
    console.warn('`document` is not available. This script is intended to run in a browser.');
}