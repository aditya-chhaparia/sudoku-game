export function isValidLocation(grid, row, col, num) {
    if (grid[row][col] !== 0) {
        return false;
    }
    for (let i = 0, j = col; i < 9; i++) {
        if (grid[i][j] === num) return false;
    }
    for (let i = row, j = 0; j < 9; j++) {
        if (grid[i][j] === num) return false;
    }
    for (let i = row - (row % 3); i < row - (row % 3) + 3; i++) {
        for (let j = col - (col % 3); j < col - (col % 3) + 3; j++) {
            if (grid[i][j] === num) return false;
        }
    }
    return true;
}

export function solveSudoku(grid, row, col) {
    if (col === 9) {
        col = 0;
        row++;
    }
    if (row === 9) return true;

    if (grid[row][col] !== 0) {
        return solveSudoku(grid, row, col + 1);
    }
    for (let i = 1; i <= 9; i++) {
        if (isValidLocation(grid, row, col, i)) {
            grid[row][col] = i;
            if (solveSudoku(grid, row, col + 1)) return true;
        }

        grid[row][col] = 0;
    }
    return false;
}

export function countSolutions(grid, row, col, count) {
    if (col === 9) {
        col = 0;
        row++;
    }
    if (row === 9) {
        return count + 1;
    }

    if (grid[row][col] !== 0) {
        return countSolutions(grid, row, col + 1, count);
    }
    for (let i = 1; i <= 9; i++) {
        if (isValidLocation(grid, row, col, i)) {
            grid[row][col] = i;
            count = countSolutions(grid, row, col, count);
        }

        grid[row][col] = 0;
    }
    return count;
}

export function generateGrid() {
    let grid = new Array(9);
    for (let i = 0; i < 9; i++) {
        grid[i] = new Array(9);
    }
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) grid[i][j] = 0;
    }
    return grid;
}

export function generateRandomGrid(grid) {
    function fillBox(row, col) {
        for (let i = row; i < row + 3; i++) {
            for (let j = col; j < col + 3; j++) {
                let num;
                do {
                    num = Math.floor(9 * Math.random() + 1);
                } while (!isValidLocation(grid, i, j, num));
                grid[i][j] = num;
            }
        }
    }
    for (let i = 0; i < 9; i += 3) {
        fillBox(i, i);
    }
    solveSudoku(grid, 0, 0);
}

export function copyBoard(a, b) {
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            b[i][j] = a[i][j];
        }
    }
}

export function generateRandomSudoku(grid, solution, rounds, min_length) {
    copyBoard(solution, grid);
    let arr = [];
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            arr.push(i * 9 + j);
        }
    }
    function shuffle(array) {
        var currentIndex = array.length,
            randomIndex;
        while (0 !== currentIndex) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }

        return array;
    }
    shuffle(arr);
    let len = arr.length;
    while (rounds > 0 && len > min_length) {
        let row, col;
        let pop_value = arr.pop();
        col = pop_value % 9;
        row = (pop_value - col) / 9;
        len -= 1;
        let removed_value = grid[row][col];
        grid[row][col] = 0;
        let count = countSolutions(grid, 0, 0, 0);
        if (count != 1) {
            grid[row][col] = removed_value;
            len += 1;
            rounds -= 1;
        }
    }
}
