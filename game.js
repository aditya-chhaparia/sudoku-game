import * as Board from "./board.js";

const selectOne = (selector) => {
    return document.querySelector(selector);
};

const selectMany = (selector) => {
    return document.querySelectorAll(selector);
};

const board = selectOne("#board");
const boxes = selectMany(".game-box");
const inputButtons = selectMany(".input-button");
const boardControls = selectOne("#board-controls").elements;
const timerDisplay = selectOne("#timer-display");
const resultDisplay = selectOne("#result-display");
const timer = {
    timeRemaining: 0
};
const game = {
    currentValue: "",
    correct_count: 0
};

const settings = {
    easy: {
        rounds: 3,
        min_length: 45
    },
    medium: {
        rounds: 7,
        min_length: 35
    },
    hard: {
        rounds: 20,
        min_length: 20
    }
};

function printBoard(grid) {
    grid.forEach((e) => {
        console.log(...e);
    });
}

function gameGridSetup() {
    let difficulty = boardControls.difficulty.value;
    let { rounds, min_length } = settings[difficulty];
    game.grid = Board.generateGrid();
    game.solution = Board.generateGrid();
    Board.generateRandomGrid(game.solution);
    Board.generateRandomSudoku(game.grid, game.solution, rounds, min_length);
    let arr = [];
    game.correct_count = 0;
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (game.grid[i][j]) game.correct_count++;
        }
    }
}

function boardInitialize() {
    game.grid.forEach((row, i) => {
        row.forEach((value, j) => {
            if (value !== 0) {
                boxes[i * 9 + j].value = value;
                boxes[i * 9 + j].setAttribute("disabled", true);
            } else {
                boxes[i * 9 + j].value = "";
                boxes[i * 9 + j].removeAttribute("disabled");
            }
        });
    });
}

function correctCount(row, col, newValue) {
    let oldCond = game.grid[row][col] === game.solution[row][col];
    let newCond = newValue === game.solution[row][col];
    if (oldCond && !newCond) {
        game.correct_count--;
    } else if (!oldCond && newCond) {
        game.correct_count++;
    }
}

function boxInputEvent(e) {
    e.preventDefault();
    let pos = [...boxes].indexOf(e.target);
    let col = pos % 9;
    let row = (pos - col) / 9;
    let value = e.target.value;
    if (value === "") return;
    else if (value === "0") value = "";
    else value = value[value.length - 1];
    e.target.value = value;
    correctCount(row, col, Number.parseInt(e.target.value));
    game.grid[row][col] = Number.parseInt(e.target.value);
    checkSolve();
}

function boxClickEvent(e) {
    e.preventDefault();
    let pos = [...boxes].indexOf(e.target);
    let col = pos % 9;
    let row = (pos - col) / 9;
    if (game.currentValue === "0") {
        e.target.value = "";
    } else if (game.currentValue) {
        e.target.value = game.currentValue;
    }
    correctCount(row, col, Number.parseInt(e.target.value));
    game.grid[row][col] = Number.parseInt(e.target.value);
    checkSolve();
}

function inputButtonClickEvent(e) {
    e.preventDefault();
    e.target.blur();
    if (e.target.classList.contains("input-button-active")) {
        game.currentValue = "";
    } else {
        game.currentValue = e.target.dataset.value;
    }
    inputButtons.forEach((button) => {
        if (button === e.target) return;
        button.classList.remove("input-button-active");
    });
    e.target.classList.toggle("input-button-active");
}

function startGame() {
    clearInterval(timer.key);
    boardInitialize(); //so that players do not edit board before they start timer
    boxes.forEach((box, i) => {
        box.addEventListener("input", boxInputEvent);
        box.addEventListener("click", boxClickEvent);
    });
    inputButtons.forEach((button) => {
        button.addEventListener("click", inputButtonClickEvent);
    });
    timerSet();
}

function newGame() {
    clearInterval(timer.key);
    gameGridSetup();
    boardInitialize();
    resetGameEventListeners();
}

function resetGameEventListeners() {
    boxes.forEach((box, i) => {
        box.removeEventListener("input", boxInputEvent);
        box.removeEventListener("click", boxClickEvent);
    });
    inputButtons.forEach((button) => {
        button.removeEventListener("click", inputButtonClickEvent);
    });
}

function displaySolution() {
    boxes.forEach((box, i) => {
        col = i % 9;
        row = (i - col) / 9;
        box.value = game.solution[row][col];
    });
}

function timeConvert(timeRemaining) {
    let min = String(Math.floor(timeRemaining / 60));
    if (min < 10) min = "0" + min;
    let sec = String(Math.floor(timeRemaining % 60));
    if (sec < 10) sec = "0" + sec;
    return `${min}:${sec}`;
}

function checkSolve() {
    if (game.correct_count === 81) {
        clearInterval(timer.key);
        resultDisplay.innerText = "You win.";
    }
}

function timerSet() {
    timer.timerEnd = Number.parseInt(boardControls.timer.value);
    timer.endDate = new Date(new Date().getTime() + timer.timerEnd * 1000);
    timer.key = setInterval(function () {
        let now = timer.endDate - new Date();
        let timeRemaining = Math.floor(now / 1000);
        timerDisplay.innerText = timeConvert(timeRemaining);
        if (timeRemaining <= 0) {
            clearInterval(timer.key);
            timerDisplay.innerText = timeConvert(Number.parseInt(boardControls.timer.value));
            resultDisplay.innerText = "Time is Up.";
            displaySolution();
        }
    }, 500);
}

function gameSetup() {
    boxes.forEach((box, i) => {
        if ((i + 1) % 27 <= 9 && (i + 1) % 27 > 0) {
            box.classList.add("top-box");
        }
        if (i % 27 < 27 && i % 27 >= 18) {
            box.classList.add("bottom-box");
        }
        if ((i + 1) % 3 === 0) {
            box.classList.add("right-box");
        }
        if ((i + 1) % 3 === 1) {
            box.classList.add("left-box");
        }
    });
    selectOne("#new-game").addEventListener("click", (e) => {
        e.preventDefault();
        newGame();
    });

    selectOne("#start-timer").addEventListener("click", (e) => {
        e.preventDefault();
        startGame();
    });
    newGame();
}

gameSetup();
