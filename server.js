const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Game state
const players = {};
const pillows = {};
let pillowIdCounter = 0;

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const PLAYER_SIZE = 40;
const PILLOW_SIZE = 20;
const PILLOW_SPEED = 8;
const PLAYER_SPEED = 5;

// Handle socket connections
io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

  // Create new player
  players[socket.id] = {
    id: socket.id,
    x: Math.random() * (GAME_WIDTH - PLAYER_SIZE),
    y: Math.random() * (GAME_HEIGHT - PLAYER_SIZE),
    color: getRandomColor(),
    score: 0,
    username: `Player${Object.keys(players).length}`
  };

  // Send current game state to new player
  socket.emit('init', {
    id: socket.id,
    players: players,
    gameWidth: GAME_WIDTH,
    gameHeight: GAME_HEIGHT
  });

  // Notify all players about new player
  socket.broadcast.emit('playerJoined', players[socket.id]);

  // Handle player movement
  socket.on('move', (direction) => {
    const player = players[socket.id];
    if (!player) return;

    switch(direction) {
      case 'up':
        player.y = Math.max(0, player.y - PLAYER_SPEED);
        break;
      case 'down':
        player.y = Math.min(GAME_HEIGHT - PLAYER_SIZE, player.y + PLAYER_SPEED);
        break;
      case 'left':
        player.x = Math.max(0, player.x - PLAYER_SPEED);
        break;
      case 'right':
        player.x = Math.min(GAME_WIDTH - PLAYER_SIZE, player.x + PLAYER_SPEED);
        break;
    }

    io.emit('playerMoved', {
      id: socket.id,
      x: player.x,
      y: player.y
    });
  });

  // Handle pillow shooting
  socket.on('shoot', (data) => {
    const player = players[socket.id];
    if (!player) return;

    const pillowId = `pillow_${pillowIdCounter++}`;
    pillows[pillowId] = {
      id: pillowId,
      x: player.x + PLAYER_SIZE / 2,
      y: player.y + PLAYER_SIZE / 2,
      velocityX: data.velocityX,
      velocityY: data.velocityY,
      shooterId: socket.id
    };

    io.emit('pillowShot', pillows[pillowId]);
  });

  // Handle username change
  socket.on('setUsername', (username) => {
    if (players[socket.id]) {
      players[socket.id].username = username || players[socket.id].username;
      io.emit('playerUpdated', players[socket.id]);
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);
    delete players[socket.id];
    io.emit('playerLeft', socket.id);
  });
});

// Game loop for pillows
setInterval(() => {
  for (const pillowId in pillows) {
    const pillow = pillows[pillowId];
    pillow.x += pillow.velocityX * PILLOW_SPEED;
    pillow.y += pillow.velocityY * PILLOW_SPEED;

    // Check if pillow is out of bounds
    if (pillow.x < 0 || pillow.x > GAME_WIDTH || 
        pillow.y < 0 || pillow.y > GAME_HEIGHT) {
      delete pillows[pillowId];
      io.emit('pillowRemoved', pillowId);
      continue;
    }

    // Check collision with players
    for (const playerId in players) {
      if (playerId === pillow.shooterId) continue;
      
      const player = players[playerId];
      if (checkCollision(pillow, player)) {
        // Hit!
        if (players[pillow.shooterId]) {
          players[pillow.shooterId].score += 1;
          io.emit('playerHit', {
            shooter: pillow.shooterId,
            target: playerId,
            score: players[pillow.shooterId].score
          });
        }
        delete pillows[pillowId];
        io.emit('pillowRemoved', pillowId);
        break;
      }
    }
  }

  // Send updated pillow positions
  io.emit('pillowsUpdate', pillows);
}, 1000 / 30); // 30 FPS

function checkCollision(pillow, player) {
  return pillow.x >= player.x && 
         pillow.x <= player.x + PLAYER_SIZE &&
         pillow.y >= player.y && 
         pillow.y <= player.y + PLAYER_SIZE;
}

function getRandomColor() {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];
  return colors[Math.floor(Math.random() * colors.length)];
}

server.listen(PORT, () => {
  console.log(`🎮 Noční Stehy server running on port ${PORT}`);
});
