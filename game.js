import {
    isValidLocation,
    generateGrid,
    generateRandomGrid,
    generateRandomSudoku,
    copyBoard
} from "./board.js";

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
    game.grid = generateGrid();
    game.solution = generateGrid();
    game.initialSetup = generateGrid();
    generateRandomGrid(game.solution);
    generateRandomSudoku(game.grid, game.solution, rounds, min_length);
    copyBoard(game.grid, game.initialSetup);
}

function countInitialize() {
    game.correct_count = 0;
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (game.initialSetup[i][j]) game.correct_count++;
        }
    }
    copyBoard(game.grid, game.initialSetup);
}

function boardInitialize() {
    game.initialSetup.forEach((row, i) => {
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

    let value = e.target.value;
    if (value === "") return;
    else if (value === "0") value = "";
    else value = value[value.length - 1];
    e.target.value = value;
    let pos = [...boxes].indexOf(e.target);
    inputChange(Number.parseInt(e.target.value), pos);
}

function boxClickEvent(e) {
    e.preventDefault();
    if (game.currentValue === "0") {
        e.target.value = "";
    } else if (game.currentValue) {
        e.target.value = game.currentValue;
    }
    let pos = [...boxes].indexOf(e.target);
    inputChange(Number.parseInt(e.target.value), pos);
}

function inputChange(value, pos) {
    let col = pos % 9;
    let row = (pos - col) / 9;
    correctCount(row, col, value);
    game.grid[row][col] = 0;
    game.grid[row][col] = value;
    conflictColoring();
    checkSolve();
}

function conflictColoring() {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (game.initialSetup[row][col]) continue;
            let value = game.grid[row][col];
            game.grid[row][col] = 0;
            if (!isValidLocation(game.grid, row, col, value)) {
                boxes[row * 9 + col].classList.add("conflict");
            } else {
                boxes[row * 9 + col].classList.remove("conflict");
            }
            game.grid[row][col] = value;
        }
    }
}

function inputButtonClickEvent(e) {
    e.preventDefault();
    let target = e.target;
    if (e.target.tagName === "I") target = e.target.parentElement;
    target.blur();
    if (target.classList.contains("input-button-active")) {
        game.currentValue = "";
    } else {
        game.currentValue = target.dataset.value;
    }
    inputButtons.forEach((button) => {
        if (button === target) return;
        button.classList.remove("input-button-active");
    });
    // if (e.target.tagName === "I") e.target.parentElement.classList.toggle("input-button-active");
    target.classList.toggle("input-button-active");
}

function unfocusable(e) {
    e.target.blur();
}

function startGame() {
    resetGame();
    addGameEventListeners();
    timerSet();
}

function newGame() {
    gameGridSetup();
    resetGame();
    resetGameEventListeners();
}

function resetGame() {
    clearInterval(timer.key);
    timer.timeRemaining = 0;
    game.currentValue = "";
    timerDisplay.innerText = timeConvert(Number.parseInt(boardControls.timer.value));
    resultDisplay.innerText = "";
    boardInitialize();
    countInitialize();
    removeExtraClasses();
}

function removeExtraClasses() {
    boxes.forEach((box) => {
        box.classList.remove("conflict");
    });
    inputButtons.forEach((button) => {
        button.classList.remove("input-button-active");
    });
}

function addGameEventListeners() {
    boxes.forEach((box, i) => {
        box.addEventListener("input", boxInputEvent);
        box.addEventListener("click", boxClickEvent);
        box.removeEventListener("focus", unfocusable);
    });
    inputButtons.forEach((button) => {
        button.addEventListener("click", inputButtonClickEvent);
        button.removeEventListener("focus", unfocusable);
    });
}

function resetGameEventListeners() {
    boxes.forEach((box, i) => {
        box.removeEventListener("input", boxInputEvent);
        box.removeEventListener("click", boxClickEvent);
        box.addEventListener("focus", unfocusable);
    });
    inputButtons.forEach((button) => {
        button.removeEventListener("click", inputButtonClickEvent);
        button.addEventListener("focus", unfocusable);
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
        resetGameEventListeners();
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
