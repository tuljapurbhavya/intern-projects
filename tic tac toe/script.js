const boardElement = document.getElementById("board");
const statusElement = document.getElementById("status");
const restartButton = document.getElementById("restartBtn");
const scoreXElement = document.getElementById("scoreX");
const scoreOElement = document.getElementById("scoreO");
const scoreDrawElement = document.getElementById("scoreDraw");
const cells = Array.from(document.querySelectorAll(".cell"));

const winningLines = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

let board = Array(9).fill("");
let currentPlayer = "X";
let gameActive = true;
let scores = {
  X: 0,
  O: 0,
  draw: 0
};

function getWinner() {
  for (const line of winningLines) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { player: board[a], line };
    }
  }

  return null;
}

function updateStatus(text) {
  statusElement.textContent = text;
}

function updateScores() {
  scoreXElement.textContent = scores.X;
  scoreOElement.textContent = scores.O;
  scoreDrawElement.textContent = scores.draw;
}

function endGame(winner) {
  gameActive = false;
  cells.forEach((cell) => {
    cell.disabled = true;
  });

  if (winner) {
    winner.line.forEach((index) => cells[index].classList.add("win"));
    scores[winner.player] += 1;
    updateStatus(`Winner: ${winner.player}`);
  } else {
    scores.draw += 1;
    updateStatus("It's a draw");
  }

  updateScores();
}

function handleCellClick(event) {
  const cell = event.currentTarget;
  const index = Number(cell.dataset.index);

  if (!gameActive || board[index]) {
    return;
  }

  board[index] = currentPlayer;
  cell.textContent = currentPlayer;
  cell.classList.add(currentPlayer.toLowerCase());
  cell.disabled = true;

  const winner = getWinner();
  if (winner) {
    endGame(winner);
    return;
  }

  if (board.every(Boolean)) {
    endGame(null);
    return;
  }

  currentPlayer = currentPlayer === "X" ? "O" : "X";
  updateStatus(`Player ${currentPlayer}'s turn`);
}

function restartGame() {
  board = Array(9).fill("");
  currentPlayer = "X";
  gameActive = true;
  updateStatus("Player X's turn");

  cells.forEach((cell) => {
    cell.textContent = "";
    cell.disabled = false;
    cell.classList.remove("x", "o", "win");
  });
}

cells.forEach((cell) => {
  cell.addEventListener("click", handleCellClick);
});

restartButton.addEventListener("click", restartGame);
boardElement.addEventListener("mouseleave", () => boardElement.blur());
updateScores();
