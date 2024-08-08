const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

const CELL_SIZE = 20;
const WINDOW_WIDTH = 1200;
const WINDOW_HEIGHT = 720;
const FPS = 60;
const DELAY = 1000 / FPS;
let score = 1;
let SNAKE_SPEED = 50; // Velocidad de la serpiente en milisegundos por celda

let snake = [[WINDOW_WIDTH / 2 / CELL_SIZE, WINDOW_HEIGHT / 2 / CELL_SIZE]];
let food = [];
let direction = 'right';
let running = false;
let lastTimestamp = performance.now();
let lastMoveTimestamp = performance.now();

// Cargar la imagen de la hoja de sprites
const tileimage = new Image();
tileimage.src = './snake.png';
const appleImage = new Image();
appleImage.src = './snake.png'; // Asegúrate de que esta ruta sea correcta

function initGame() {
  canvas.width = WINDOW_WIDTH;
  canvas.height = WINDOW_HEIGHT;
  document.getElementById('difficulty-menu').classList.remove('hidden');
  document.getElementById('game-over').classList.add('hidden');
  score = 0;
  updateScore(score);

  // Set the initial snake length
  const initialSnakeLength = 2;
  snake = [];
  for (let i = 0; i < initialSnakeLength; i++) {
    snake.push([
      WINDOW_WIDTH / 2 / CELL_SIZE - i,
      WINDOW_HEIGHT / 2 / CELL_SIZE
    ]);
  }

  // Spawn the first food item
  spawnFood();
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

  // Verificación si la serpiente se mueve fuera de los límites del canvas
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

  // Si la nueva cabeza no colisiona, la añadimos al principio de la serpiente
  snake.unshift(newHead);

  // Verificar si la cabeza está en la posición de la comida
  if (newHead[0] === food[0] && newHead[1] === food[1]) {
      // Si come la comida, genera una nueva comida y aumenta la puntuación
      spawnFood();
      updateScore(score + 1);
  } else {
      // Si no, remueve el último segmento (movimiento normal)
      snake.pop();
  }
}

function updateScore(newScore) {
  score = newScore;
  document.getElementById('score').textContent = `Puntuación: ${score}`;
  
  // Incrementa la velocidad de la serpiente cada 10 puntos
  if (score % 10 === 0) {
      SNAKE_SPEED = Math.max(SNAKE_SPEED - 10, 10); // Asegúrate de que la velocidad no sea negativa o extremadamente baja
  }
}


function addApple() {
  let valid = false;
  while (!valid) {
      // Obtener una posición aleatoria dentro de los límites del canvas
      let ax = Math.floor(Math.random() * (WINDOW_WIDTH / CELL_SIZE));
      let ay = Math.floor(Math.random() * (WINDOW_HEIGHT / CELL_SIZE));

      // Asegurarse de que la nueva manzana no se superponga con la serpiente
      let overlap = false;
      for (let i = 0; i < snake.length; i++) {
          let sx = snake[i][0];
          let sy = snake[i][1];

          if (ax === sx && ay === sy) {
              overlap = true;
              break;
          }
      }

      // La celda debe estar vacía
      if (!overlap) {
          food = [ax, ay]; // Asignar la posición de la manzana
          valid = true;
      }
  }
}

function drawFood() {
  // Coordenadas de la comida (manzana) en el canvas
  var tilex = food[0] * CELL_SIZE;
  var tiley = food[1] * CELL_SIZE;

  // Coordenadas de la manzana en la hoja de sprites
  var tx = 0; // Columna en la hoja de sprites
  var ty = 3; // Fila en la hoja de sprites

  // Dibujar la manzana
  ctx.drawImage(tileimage, tx * 64, ty * 64, 64, 64, tilex, tiley, CELL_SIZE, CELL_SIZE);
}


function spawnFood() {
  addApple();
}

function drawGame() {
  ctx.clearRect(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT);

  // Dibujar la serpiente con la imagen predescargada
  drawSnake();

  // Dibujar la comida
  drawFood();
}

function drawSnake() {
  // Loop over every snake segment
  for (var i = 0; i < snake.length; i++) {
    var segx = snake[i][0];
    var segy = snake[i][1];
    var tilex = segx * CELL_SIZE;
    var tiley = segy * CELL_SIZE;

    // Sprite column and row that gets calculated
    var tx = 0;
    var ty = 0;

    if (i == 0) {
      // Head; Determine the correct image
      if (snake.length > 1) {
        var nseg = snake[i + 1]; // Next segment
        if (segy < nseg[1]) {
          // Up
          tx = 3; ty = 0;
        } else if (segx > nseg[0]) {
          // Right
          tx = 4; ty = 0;
        } else if (segy > nseg[1]) {
          // Down
          tx = 4; ty = 1;
        } else if (segx < nseg[0]) {
          // Left
          tx = 3; ty = 1;
        }
      }
    } else if (i == snake.length - 1) {
      // Tail; Determine the correct image
      var pseg = snake[i - 1]; // Prev segment
      if (pseg[1] < segy) {
        // Up
        tx = 3; ty = 2;
      } else if (pseg[0] > segx) {
        // Right
        tx = 4; ty = 2;
      } else if (pseg[1] > segy) {
        // Down
        tx = 4; ty = 3;
      } else if (pseg[0] < segx) {
        // Left
        tx = 3; ty = 3;
      }
    } else {
      // Body; Determine the correct image
      var pseg = snake[i - 1]; // Previous segment
      var nseg = snake[i + 1]; // Next segment
      if (pseg[0] < segx && nseg[0] > segx || nseg[0] < segx && pseg[0] > segx) {
        // Horizontal Left-Right
        tx = 1; ty = 0;
      } else if (pseg[0] < segx && nseg[1] > segy || nseg[0] < segx && pseg[1] > segy) {
        // Angle Left-Down
        tx = 2; ty = 0;
      } else if (pseg[1] < segy && nseg[1] > segy || nseg[1] < segy && pseg[1] > segy) {
        // Vertical Up-Down
        tx = 2; ty = 1;
      } else if (pseg[1] < segy && nseg[0] < segx || nseg[1] < segy && pseg[0] < segx) {
        // Angle Top-Left
        tx = 2; ty = 2;
      } else if (pseg[0] > segx && nseg[1] < segy || nseg[0] > segx && pseg[1] < segy) {
        // Angle Right-Up
        tx = 0; ty = 1;
      } else if (pseg[1] > segy && nseg[0] > segx || nseg[1] > segy && pseg[0] > segx) {
        // Angle Down-Right
        tx = 0; ty = 0;
      }
    }

    // Draw the image of the snake part
    ctx.drawImage(tileimage, tx * 64, ty * 64, 64, 64, tilex, tiley, CELL_SIZE, CELL_SIZE);
  }
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