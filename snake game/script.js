const canvas = document.getElementById("gameCanvas");
const context = canvas.getContext("2d");
const scoreElement = document.getElementById("score");
const restartButton = document.getElementById("restartBtn");
const gameOverElement = document.getElementById("gameOver");
const directionButtons = document.querySelectorAll("[data-direction]");

const gridSize = 20;
const tileCount = canvas.width / gridSize;
const moveDelay = 115;

let snake;
let food;
let direction;
let nextDirection;
let score;
let gameOver;
let gameLoop;

function startGame() {
  snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 }
  ];
  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  score = 0;
  gameOver = false;
  scoreElement.textContent = score;
  gameOverElement.classList.add("hidden");
  placeFood();

  clearInterval(gameLoop);
  drawGame();
  gameLoop = setInterval(updateGame, moveDelay);
}

function placeFood() {
  do {
    food = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount)
    };
  } while (snake.some((segment) => segment.x === food.x && segment.y === food.y));
}

function setDirection(newDirection) {
  const directions = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 }
  };
  const requested = directions[newDirection];

  if (!requested) {
    return;
  }

  const isReverse = requested.x === -direction.x && requested.y === -direction.y;
  if (!isReverse) {
    nextDirection = requested;
  }
}

function updateGame() {
  if (gameOver) {
    return;
  }

  direction = nextDirection;
  const head = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y
  };

  if (hasCollision(head)) {
    endGame();
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score += 1;
    scoreElement.textContent = score;
    placeFood();
  } else {
    snake.pop();
  }

  drawGame();
}

function hasCollision(head) {
  const hitsWall = head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount;
  const hitsTail = snake.some((segment) => segment.x === head.x && segment.y === head.y);
  return hitsWall || hitsTail;
}

function drawRoundedTile(x, y, color, radius = 5) {
  const inset = 2;
  const size = gridSize - inset * 2;
  const left = x * gridSize + inset;
  const top = y * gridSize + inset;

  context.fillStyle = color;
  context.beginPath();
  context.roundRect(left, top, size, size, radius);
  context.fill();
}

function drawGrid() {
  context.fillStyle = "#ecfdf5";
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.strokeStyle = "#d8e3d0";
  context.lineWidth = 1;
  for (let position = 0; position <= canvas.width; position += gridSize) {
    context.beginPath();
    context.moveTo(position, 0);
    context.lineTo(position, canvas.height);
    context.stroke();

    context.beginPath();
    context.moveTo(0, position);
    context.lineTo(canvas.width, position);
    context.stroke();
  }
}

function drawGame() {
  drawGrid();
  drawRoundedTile(food.x, food.y, "#dc2626", 10);

  snake.forEach((segment, index) => {
    drawRoundedTile(segment.x, segment.y, index === 0 ? "#047857" : "#16a34a");
  });
}

function endGame() {
  gameOver = true;
  clearInterval(gameLoop);
  gameOverElement.classList.remove("hidden");
}

function handleKeydown(event) {
  const keyDirections = {
    ArrowUp: "up",
    ArrowDown: "down",
    ArrowLeft: "left",
    ArrowRight: "right"
  };

  if (keyDirections[event.key]) {
    event.preventDefault();
    setDirection(keyDirections[event.key]);
  }
}

document.addEventListener("keydown", handleKeydown);
restartButton.addEventListener("click", startGame);
directionButtons.forEach((button) => {
  button.addEventListener("click", () => setDirection(button.dataset.direction));
});

startGame();
