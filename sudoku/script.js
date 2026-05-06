const boardElement = document.getElementById("sudokuBoard");
const keypadElement = document.getElementById("keypad");
const difficultyElement = document.getElementById("difficulty");
const newPuzzleButton = document.getElementById("newPuzzle");
const checkSolutionButton = document.getElementById("checkSolution");
const resetPuzzleButton = document.getElementById("resetPuzzle");
const hintButton = document.getElementById("hintButton");
const mistakeCountElement = document.getElementById("mistakeCount");
const filledCountElement = document.getElementById("filledCount");
const messageElement = document.getElementById("message");

const difficultyBlanks = {
  easy: 36,
  medium: 46,
  hard: 56
};

let puzzle = [];
let solution = [];
let currentBoard = [];
let fixedCells = [];
let selectedCell = null;
let mistakes = 0;

function createEmptyBoard() {
  return Array.from({ length: 9 }, () => Array(9).fill(0));
}

function shuffle(values) {
  const copy = [...values];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function isValidPlacement(board, row, col, number) {
  for (let i = 0; i < 9; i += 1) {
    if (board[row][i] === number || board[i][col] === number) {
      return false;
    }
  }

  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r += 1) {
    for (let c = boxCol; c < boxCol + 3; c += 1) {
      if (board[r][c] === number) {
        return false;
      }
    }
  }

  return true;
}

function solveBoard(board) {
  for (let row = 0; row < 9; row += 1) {
    for (let col = 0; col < 9; col += 1) {
      if (board[row][col] === 0) {
        for (const number of shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])) {
          if (isValidPlacement(board, row, col, number)) {
            board[row][col] = number;
            if (solveBoard(board)) {
              return true;
            }
            board[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

function generateSolvedBoard() {
  const board = createEmptyBoard();
  solveBoard(board);
  return board;
}

function copyBoard(board) {
  return board.map((row) => [...row]);
}

function removeCells(board, blanks) {
  const puzzleBoard = copyBoard(board);
  const positions = shuffle(Array.from({ length: 81 }, (_, index) => index));

  for (let i = 0; i < blanks; i += 1) {
    const row = Math.floor(positions[i] / 9);
    const col = positions[i] % 9;
    puzzleBoard[row][col] = 0;
  }

  return puzzleBoard;
}

function generatePuzzle() {
  solution = generateSolvedBoard();
  puzzle = removeCells(solution, difficultyBlanks[difficultyElement.value]);
  currentBoard = copyBoard(puzzle);
  fixedCells = puzzle.map((row) => row.map((value) => value !== 0));
  selectedCell = null;
  mistakes = 0;
  setMessage("Choose a cell and enter a number.");
  renderBoard();
  updateStats();
}

function renderBoard() {
  boardElement.innerHTML = "";

  for (let row = 0; row < 9; row += 1) {
    for (let col = 0; col < 9; col += 1) {
      const cell = document.createElement("button");
      cell.className = "cell";
      cell.type = "button";
      cell.dataset.row = row;
      cell.dataset.col = col;
      cell.textContent = currentBoard[row][col] || "";
      cell.setAttribute("aria-label", `Row ${row + 1}, column ${col + 1}`);

      if (fixedCells[row][col]) {
        cell.classList.add("fixed");
      }
      if (col === 2 || col === 5) {
        cell.classList.add("block-right");
      }
      if (row === 2 || row === 5) {
        cell.classList.add("block-bottom");
      }

      cell.addEventListener("click", () => selectCell(row, col));
      boardElement.appendChild(cell);
    }
  }

  refreshHighlights();
}

function renderKeypad() {
  keypadElement.innerHTML = "";

  for (let number = 1; number <= 9; number += 1) {
    const button = document.createElement("button");
    button.className = "number-button";
    button.type = "button";
    button.textContent = number;
    button.addEventListener("click", () => placeNumber(number));
    keypadElement.appendChild(button);
  }
}

function selectCell(row, col) {
  selectedCell = { row, col };
  refreshHighlights();

  if (fixedCells[row][col]) {
    setMessage("This is a locked clue cell.");
  } else {
    setMessage("Pick a number from the keypad.");
  }
}

function refreshHighlights() {
  const cells = boardElement.querySelectorAll(".cell");
  cells.forEach((cell) => {
    const row = Number(cell.dataset.row);
    const col = Number(cell.dataset.col);
    const value = currentBoard[row][col];
    cell.classList.remove("selected", "highlight", "same-number", "error");

    if (!selectedCell) {
      return;
    }

    const isSelected = selectedCell.row === row && selectedCell.col === col;
    const inLine = selectedCell.row === row || selectedCell.col === col;
    const selectedValue = currentBoard[selectedCell.row][selectedCell.col];

    if (inLine) {
      cell.classList.add("highlight");
    }
    if (selectedValue && value === selectedValue) {
      cell.classList.add("same-number");
    }
    if (value && value !== solution[row][col] && !fixedCells[row][col]) {
      cell.classList.add("error");
    }
    if (isSelected) {
      cell.classList.add("selected");
    }
  });
}

function placeNumber(number) {
  if (!selectedCell) {
    setMessage("Select an empty cell first.", "bad");
    return;
  }

  const { row, col } = selectedCell;
  if (fixedCells[row][col]) {
    setMessage("Locked clue cells cannot be edited.", "bad");
    return;
  }

  currentBoard[row][col] = number;
  updateCell(row, col);

  if (number === solution[row][col]) {
    setMessage("Nice move. That number fits.", "good");
  } else {
    mistakes += 1;
    setMessage("That number conflicts with the solution.", "bad");
  }

  refreshHighlights();
  updateStats();
  detectWin();
}

function updateCell(row, col) {
  const index = row * 9 + col;
  const cell = boardElement.children[index];
  cell.textContent = currentBoard[row][col] || "";
}

function updateStats() {
  mistakeCountElement.textContent = mistakes;
  const filled = currentBoard.flat().filter(Boolean).length;
  filledCountElement.textContent = filled;
}

function setMessage(text, type = "") {
  messageElement.textContent = text;
  messageElement.className = `message ${type}`.trim();
}

function checkSolution() {
  let wrong = 0;
  let empty = 0;

  for (let row = 0; row < 9; row += 1) {
    for (let col = 0; col < 9; col += 1) {
      if (currentBoard[row][col] === 0) {
        empty += 1;
      } else if (currentBoard[row][col] !== solution[row][col]) {
        wrong += 1;
      }
    }
  }

  refreshHighlights();

  if (wrong === 0 && empty === 0) {
    setMessage("Puzzle complete. You solved the grid.", "good");
  } else if (wrong > 0) {
    setMessage(`${wrong} cell${wrong === 1 ? "" : "s"} need another look.`, "bad");
  } else {
    setMessage(`${empty} empty cell${empty === 1 ? "" : "s"} remaining.`, "good");
  }
}

function resetPuzzle() {
  currentBoard = copyBoard(puzzle);
  selectedCell = null;
  mistakes = 0;
  setMessage("Puzzle reset.");
  renderBoard();
  updateStats();
}

function giveHint() {
  const emptyCells = [];

  for (let row = 0; row < 9; row += 1) {
    for (let col = 0; col < 9; col += 1) {
      if (!fixedCells[row][col] && currentBoard[row][col] !== solution[row][col]) {
        emptyCells.push({ row, col });
      }
    }
  }

  if (emptyCells.length === 0) {
    setMessage("No hints left. The board is solved.", "good");
    return;
  }

  const hint = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  currentBoard[hint.row][hint.col] = solution[hint.row][hint.col];
  selectedCell = hint;
  updateCell(hint.row, hint.col);
  refreshHighlights();
  updateStats();

  const cell = boardElement.children[hint.row * 9 + hint.col];
  cell.classList.add("hint");
  setTimeout(() => cell.classList.remove("hint"), 950);
  setMessage("A correct number has been revealed.", "good");
  detectWin();
}

function detectWin() {
  for (let row = 0; row < 9; row += 1) {
    for (let col = 0; col < 9; col += 1) {
      if (currentBoard[row][col] !== solution[row][col]) {
        return false;
      }
    }
  }

  setMessage(`Victory. Solved with ${mistakes} mistake${mistakes === 1 ? "" : "s"}.`, "good");
  return true;
}

function handleKeyboard(event) {
  const number = Number(event.key);
  if (number >= 1 && number <= 9) {
    placeNumber(number);
  }
}

function handleBoardTilt(event) {
  const bounds = boardElement.getBoundingClientRect();
  const x = (event.clientX - bounds.left) / bounds.width - 0.5;
  const y = (event.clientY - bounds.top) / bounds.height - 0.5;
  const rotateX = 52 - y * 10;
  const rotateZ = -8 + x * 8;
  boardElement.style.transform = `rotateX(${rotateX}deg) rotateZ(${rotateZ}deg)`;
}

function resetBoardTilt() {
  boardElement.style.transform = "";
}

newPuzzleButton.addEventListener("click", generatePuzzle);
checkSolutionButton.addEventListener("click", checkSolution);
resetPuzzleButton.addEventListener("click", resetPuzzle);
hintButton.addEventListener("click", giveHint);
difficultyElement.addEventListener("change", generatePuzzle);
boardElement.addEventListener("mousemove", handleBoardTilt);
boardElement.addEventListener("mouseleave", resetBoardTilt);
document.addEventListener("keydown", handleKeyboard);

renderKeypad();
generatePuzzle();
