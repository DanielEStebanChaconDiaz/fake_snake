const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

const CELL_SIZE = 20;
const WINDOW_WIDTH = 1200;
const WINDOW_HEIGHT = 720;
const FPS = 60;
const DELAY = 1000 / FPS;
let score = 0;
let SNAKE_SPEED = 50; // Velocidad de la serpiente en milisegundos por celda

let snake = [[WINDOW_WIDTH / 2 / CELL_SIZE, WINDOW_HEIGHT / 2 / CELL_SIZE]];
let food = [
  Math.floor(Math.random() * (WINDOW_WIDTH / CELL_SIZE)),
  Math.floor(Math.random() * (WINDOW_HEIGHT / CELL_SIZE))
];
let direction = 'right';
let running = false;
let lastTimestamp = performance.now();
let lastMoveTimestamp = performance.now();

function initGame() {
  canvas.width = WINDOW_WIDTH;
  canvas.height = WINDOW_HEIGHT;
  document.getElementById('difficulty-menu').classList.remove('hidden');
  document.getElementById('game-over').classList.add('hidden');
  score = 0;
  updateScore(score);
}

function startGame() {
  document.getElementById('difficulty-menu').classList.add('hidden');
  document.getElementById('game-over').classList.add('hidden');
  running = true;
  requestAnimationFrame(updateGame);
}

function updateGame(timestamp) {
  if (!running) return;

  const elapsedTime = timestamp - lastTimestamp;
  if (elapsedTime >= DELAY) {
    lastTimestamp = timestamp;
    const elapsedMoveTime = timestamp - lastMoveTimestamp;
    if (elapsedMoveTime >= SNAKE_SPEED) {
      lastMoveTimestamp = timestamp;
      moveSnake();
      drawGame();
    }
  }

  requestAnimationFrame(updateGame);
}

function updateScore(newScore) {
  score = newScore;
  document.getElementById('score').textContent = `Puntuación: ${score}`;
  // Incrementa la velocidad de la serpiente cada 10 puntos
  if (score % 10 === 0) {
    SNAKE_SPEED = Math.max(SNAKE_SPEED - 10, 10); // Asegúrate de que la velocidad no sea negativa
  }

  // Aumenta la dificultad cada 50 puntos
  if (score % 50 === 0) {
    SNAKE_SPEED = Math.max(SNAKE_SPEED - 10, 10); // Incrementa la velocidad para que sea más difícil
  }
  
}

function moveSnake() {
  let newHead;
  switch (direction) {
    case 'up':
      newHead = [snake[0][0], snake[0][1] - 1];
      break;
    case 'down':
      newHead = [snake[0][0], snake[0][1] + 1];
      break;
    case 'left':
      newHead = [snake[0][0] - 1, snake[0][1]];
      break;
    case 'right':
      newHead = [snake[0][0] + 1, snake[0][1]];
      break;
  }

  if (
    newHead[0] < 0 ||
    newHead[0] >= WINDOW_WIDTH / CELL_SIZE ||
    newHead[1] < 0 ||
    newHead[1] >= WINDOW_HEIGHT / CELL_SIZE ||
    snake.some(segment => segment[0] === newHead[0] && segment[1] === newHead[1])
  ) {
    gameOver();
    return;
  }

  snake.unshift(newHead);
  if (newHead[0] === food[0] && newHead[1] === food[1]) {
    spawnFood();
    updateScore(score + 1);
  } else {
    snake.pop();
  }
}

function spawnFood() {
  food = [
    Math.floor(Math.random() * (WINDOW_WIDTH / CELL_SIZE)),
    Math.floor(Math.random() * (WINDOW_HEIGHT / CELL_SIZE))
  ];
}

function  drawGame() {
  ctx.clearRect(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT);

  // Dibujar la serpiente
  ctx.fillStyle = '#00ff00';
  snake.forEach(segment => {
    ctx.beginPath();
    ctx.arc(segment[0] * CELL_SIZE + CELL_SIZE / 2, segment[1] * CELL_SIZE + CELL_SIZE / 2, CELL_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();
  });

  // Dibujar la comida
  ctx.fillStyle = '#ff0000';
  ctx.beginPath();
  ctx.arc(food[0] * CELL_SIZE + CELL_SIZE / 2, food[1] * CELL_SIZE + CELL_SIZE / 2, CELL_SIZE / 2, 0, Math.PI * 2);
  ctx.fill();
}

function gameOver() {
  running = false;
  document.getElementById('game-over').classList.remove('hidden');
  document.getElementById('difficulty-menu').classList.add('hidden');
}

function setDifficulty(speed) {
  SNAKE_SPEED = speed;
  startGame();
}

document.getElementById('restart-button').addEventListener('click', () => {
  snake = [[WINDOW_WIDTH / 2 / CELL_SIZE, WINDOW_HEIGHT / 2 / CELL_SIZE]];
  direction = 'right';
  running = false;
  document.getElementById('game-over').classList.add('hidden');
  initGame();
});

document.addEventListener('keydown', e => {
  switch (e.key) {
    case 'ArrowUp':
      if (direction !== 'down') direction = 'up';
      break;
    case 'ArrowDown':
      if (direction !== 'up') direction = 'down';
      break;
    case 'ArrowLeft':
      if (direction !== 'right') direction = 'left';
      break;
    case 'ArrowRight':
      if (direction !== 'left') direction = 'right';
      break;
  }
});

document.querySelectorAll('.difficulty-button').forEach(button => {
  button.addEventListener('click', () => {
    const speed = parseInt(button.getAttribute('data-speed'));
    setDifficulty(speed);
  });
});

// Inicializar el juego al cargar la página
initGame();
