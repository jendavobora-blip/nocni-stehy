// Game state
let socket;
let myId;
let players = {};
let pillows = {};
let canvas;
let ctx;
let gameWidth;
let gameHeight;
let keys = {};
let myScore = 0;

// Initialize game
window.addEventListener('DOMContentLoaded', () => {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');

    const usernameInput = document.getElementById('usernameInput');
    const startButton = document.getElementById('startButton');

    startButton.addEventListener('click', startGame);
    usernameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            startGame();
        }
    });
});

function startGame() {
    const username = document.getElementById('usernameInput').value.trim();
    if (!username) {
        alert('Prosím zadej své jméno!');
        return;
    }

    document.getElementById('usernamePrompt').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'block';
    document.getElementById('playerName').textContent = username;

    initSocket(username);
    setupControls();
}

function initSocket(username) {
    socket = io();

    socket.on('init', (data) => {
        myId = data.id;
        players = data.players;
        gameWidth = data.gameWidth;
        gameHeight = data.gameHeight;

        // Set username
        socket.emit('setUsername', username);

        // Start game loop
        gameLoop();
    });

    socket.on('playerJoined', (player) => {
        players[player.id] = player;
        updatePlayersList();
    });

    socket.on('playerLeft', (playerId) => {
        delete players[playerId];
        updatePlayersList();
    });

    socket.on('playerMoved', (data) => {
        if (players[data.id]) {
            players[data.id].x = data.x;
            players[data.id].y = data.y;
        }
    });

    socket.on('playerUpdated', (player) => {
        if (players[player.id]) {
            players[player.id] = player;
            updatePlayersList();
        }
    });

    socket.on('pillowShot', (pillow) => {
        pillows[pillow.id] = pillow;
    });

    socket.on('pillowsUpdate', (updatedPillows) => {
        pillows = updatedPillows;
    });

    socket.on('pillowRemoved', (pillowId) => {
        delete pillows[pillowId];
    });

    socket.on('playerHit', (data) => {
        if (data.shooter === myId) {
            myScore = data.score;
            document.getElementById('playerScore').textContent = `Skóre: ${myScore}`;
        }
        
        // Visual feedback
        const targetPlayer = players[data.target];
        if (targetPlayer) {
            // Flash effect (handled in render)
            targetPlayer.hitTime = Date.now();
        }
    });
}

function setupControls() {
    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        keys[e.key.toLowerCase()] = true;
    });

    document.addEventListener('keyup', (e) => {
        keys[e.key.toLowerCase()] = false;
    });

    // Mouse controls for shooting
    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        if (players[myId]) {
            const player = players[myId];
            const playerCenterX = player.x + 20;
            const playerCenterY = player.y + 20;

            // Calculate direction
            const dx = mouseX - playerCenterX;
            const dy = mouseY - playerCenterY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 0) {
                const velocityX = dx / distance;
                const velocityY = dy / distance;

                socket.emit('shoot', { velocityX, velocityY });
            }
        }
    });
}

function gameLoop() {
    handleInput();
    render();
    requestAnimationFrame(gameLoop);
}

function handleInput() {
    if (!socket || !myId || !players[myId]) return;

    if (keys['w'] || keys['arrowup']) {
        socket.emit('move', 'up');
    }
    if (keys['s'] || keys['arrowdown']) {
        socket.emit('move', 'down');
    }
    if (keys['a'] || keys['arrowleft']) {
        socket.emit('move', 'left');
    }
    if (keys['d'] || keys['arrowright']) {
        socket.emit('move', 'right');
    }
}

function render() {
    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = '#2a2a3e';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    // Draw players
    for (const playerId in players) {
        const player = players[playerId];
        
        // Flash effect when hit
        const timeSinceHit = Date.now() - (player.hitTime || 0);
        const isFlashing = timeSinceHit < 200;
        
        ctx.fillStyle = isFlashing ? '#ffffff' : player.color;
        ctx.beginPath();
        ctx.arc(player.x + 20, player.y + 20, 20, 0, Math.PI * 2);
        ctx.fill();

        // Draw border for current player
        if (playerId === myId) {
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(player.x + 20, player.y + 20, 22, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Draw username
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(player.username, player.x + 20, player.y - 10);

        // Draw score
        if (player.score > 0) {
            ctx.fillStyle = '#FFD700';
            ctx.font = 'bold 10px Arial';
            ctx.fillText(`⭐${player.score}`, player.x + 20, player.y + 55);
        }
    }

    // Draw pillows
    for (const pillowId in pillows) {
        const pillow = pillows[pillowId];
        const shooter = players[pillow.shooterId];
        
        if (shooter) {
            ctx.fillStyle = shooter.color;
        } else {
            ctx.fillStyle = '#ffffff';
        }
        
        // Draw pillow as a soft square
        ctx.save();
        ctx.translate(pillow.x, pillow.y);
        ctx.rotate(Math.atan2(pillow.velocityY, pillow.velocityX));
        ctx.fillRect(-10, -10, 20, 20);
        
        // Add pillow texture
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(-8, -8, 6, 6);
        ctx.fillRect(2, 2, 6, 6);
        
        ctx.restore();
    }
}

function updatePlayersList() {
    const playersList = document.getElementById('playersList');
    playersList.innerHTML = '';

    // Sort players by score
    const sortedPlayers = Object.values(players).sort((a, b) => b.score - a.score);

    sortedPlayers.forEach(player => {
        const playerItem = document.createElement('div');
        playerItem.className = 'player-item';
        playerItem.style.borderLeftColor = player.color;
        
        const colorDot = document.createElement('div');
        colorDot.className = 'player-color';
        colorDot.style.backgroundColor = player.color;
        
        const playerInfo = document.createElement('span');
        playerInfo.textContent = `${player.username} - ${player.score} bodů`;
        
        if (player.id === myId) {
            playerInfo.textContent += ' (ty)';
            playerItem.style.fontWeight = 'bold';
        }
        
        playerItem.appendChild(colorDot);
        playerItem.appendChild(playerInfo);
        playersList.appendChild(playerItem);
    });
}
