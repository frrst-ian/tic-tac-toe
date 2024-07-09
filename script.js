// The Gameboard represents the state of the board
function Gameboard() {
    const rows = 3;
    const columns = 3;
    let board = [];

    // Create a 2d array that will represent the state of the game board
    const initBoard = () => {
        for (let i = 0; i < rows; i++) {
            board[i] = [];
            for (let j = 0; j < columns; j++) {
                board[i].push(Cell());
            }
        }
    };

    //Initialize board
    initBoard();
    //Get the board
    const getBoard = () => board;

    //Adding token('X' and 'O')
    const addToken = (row, column, player) => {
        if (board[row][column].getValue() === "") {
            board[row][column].addToken(player);
            return true;
        }
        return false;
    };

    //Reset board
    const resetBoard = () => {
        initBoard();
    }

    //Print board
    const printBoard = () => {
        const boardWithCellValues = board.map(row => row.map((cell) => cell.getValue()));
        console.log(boardWithCellValues);
    }

    return { getBoard, resetBoard, addToken, printBoard };
}

//Create cell that can add the token and can get the value of the token
const Cell = () => {
    let value = "";

    const addToken = (player) => {
        value = player;
    };

    const getValue = () => value;

    return {
        addToken,
        getValue
    };
};

//Factory function for the player name and marker
const Player = (name, marker) => {
    return { name, marker };
};

//The state of the game, I used IIFE
const GameController = (() => {
    let currentPlayer;
    const players = [];
    let gameActive = true;
    let board;

    //All possible winning combinations
    const winningCombinations = [
        [[0, 0], [0, 1], [0, 2]], [[1, 0], [1, 1], [1, 2]], [[2, 0], [2, 1], [2, 2]], // Rows
        [[0, 0], [1, 0], [2, 0]], [[0, 1], [1, 1], [2, 1]], [[0, 2], [1, 2], [2, 2]], // Columns
        [[0, 0], [1, 1], [2, 2]], [[0, 2], [1, 1], [2, 0]] // Diagonals
    ];

    //Initial game state
    const Initialize = (player1Name, player2Name) => {
        board = Gameboard();
        const player1 = Player(player1Name, 'X');
        const player2 = Player(player2Name, 'O');

        players.push(player1, player2);
        currentPlayer = player1;

        board.printBoard();
        console.log(`${currentPlayer.name}'s turn`);
    };
    //To determine who's player turn it is
    const switchTurn = () => {
        currentPlayer = currentPlayer === players[0] ? players[1] : players[0];
    };

    //For checking wins
    const checkWin = () => {
        const boardState = board.getBoard();
        for (let combination of winningCombinations) {
            const [a, b, c] = combination;
            if (boardState[a[0]][a[1]].getValue() !== '' &&
                boardState[a[0]][a[1]].getValue() === boardState[b[0]][b[1]].getValue() &&
                boardState[a[0]][a[1]].getValue() === boardState[c[0]][c[1]].getValue()) {
                return boardState[a[0]][a[1]].getValue();
            }
        }
        if (boardState.every(row => row.every(cell => cell.getValue() !== ''))) {
            return 'draw';
        }
        return null;
    };

    const playTurn = (row, column) => {
        if (gameActive && board.addToken(row, column, currentPlayer.marker)) {
            board.printBoard();

            const winner = checkWin();
            if (winner) {
                gameActive = false;
                if (winner === 'draw') {
                    return 'Draw!';
                } else {
                    return `${currentPlayer.name} Wins!`;
                }
            } else {
                switchTurn();
                return `${currentPlayer.name}'s turn`;
            }
        }
        return null;
    };

    //Reset the game , also clears the board
    const resetGame = () => {
        board.resetBoard();
        currentPlayer = players[0];
        gameActive = true;
        board.printBoard();
        return `${currentPlayer.name}'s turn`;
    };

    return {
        newGame: (player1Name, player2Name) => {
            Initialize(player1Name, player2Name);
            return {
                playTurn,
                resetGame,
                getBoard: () => board.getBoard(),
                getCurrentPlayer: () => currentPlayer
            };
        }
    };
})();

//Control the content of the screen
function screenController() {
    const startScreen = document.getElementById('start-screen');
    const gameScreen = document.getElementById('game-screen');
    const startButton = document.getElementById('start-game');
    const player1Input = document.getElementById('player1-name');
    const player2Input = document.getElementById('player2-name');
    const winnerScreen = document.getElementById('winner-screen');
    const winnerMessage = document.getElementById('winner-message');
    const closeWinnerButton = document.getElementById('close-winner');
    const playerTurnDiv = document.querySelector('.turn');
    const boardDiv = document.querySelector('.board');

    winnerScreen.style.display = 'none';
    let game;
    startButton.addEventListener('click', () => {
        const player1Name = player1Input.value || 'Player 1';
        const player2Name = player2Input.value || 'Player 2';
        game = GameController.newGame(player1Name, player2Name);
        startScreen.style.display = 'none';
        gameScreen.style.display = 'block';
        winnerScreen.style.display = 'none';
        updateScreen();
    });

    const updateScreen = () => {
        console.log("Updating screen");
        boardDiv.innerHTML = ""; // Clear the board
        const board = game.getBoard();



        board.forEach((row, rowIndex) => {
            row.forEach((cell, columnIndex) => {
                const cellButton = document.createElement('button');
                cellButton.classList.add('cell');
                cellButton.dataset.row = rowIndex;
                cellButton.dataset.column = columnIndex;
                cellButton.textContent = cell.getValue();
                const cellValue = cell.getValue();
                console.log(`Cell created: ${rowIndex},${columnIndex}`);
                if (cellValue === 'X') {
                    cellButton.classList.add('x');
                } else if (cellValue === 'O') {
                    cellButton.classList.add('o');
                }
                boardDiv.appendChild(cellButton);
            });
        });

        const activePlayer = game.getCurrentPlayer();
        if (activePlayer) {
            playerTurnDiv.textContent = `${activePlayer.name}'s turn`;
        } else {
            playerTurnDiv.textContent = 'Game Over';
        }
    };
    
    const showWinnerScreen = (message) => {
        winnerMessage.textContent = message;
        winnerScreen.style.display = 'flex';  
    };

    boardDiv.addEventListener('click', (e) => {
        const selectedCell = e.target;
        if (selectedCell.classList.contains('cell')) {
            const row = parseInt(selectedCell.dataset.row);
            const column = parseInt(selectedCell.dataset.column);
            const result = game.playTurn(row, column);
            if (result) {
                if (result.includes('Wins') || result.includes('Draw')) {
                    showWinnerScreen(result);
                }
                playerTurnDiv.textContent = result;
                updateScreen();
            }
        }
    });
    const resetGameState = () => {
        const result = game.resetGame();
        playerTurnDiv.textContent = result;
        updateScreen();
    };

    closeWinnerButton.addEventListener('click', () => {
        winnerScreen.style.display = 'none';
        resetGameState();
    });
    closeWinnerButton.addEventListener('click', () => {
        winnerScreen.style.display = 'none';
        resetGameState();
    });

    const resetButton = document.querySelector('.reset-button');
    if (resetButton) {
        resetButton.addEventListener('click', resetGameState)
    }
}
screenController();

