// Gameboard module
const Gameboard = (() => {
    const board = new Array(9).fill('');
    
    const getBoard = () => board;

    const markCell = (index, marker) => {
        if (board[index] === '') {
            board[index] = marker;
            return true;
        } else {
            return false;
        }
    };

    const resetBoard = () => {
        board.fill('');
    };

    return {
        getBoard,
        markCell,
        resetBoard
    };
})();

// Player factory function
const Player = (name, marker) => {
    return { name, marker };
};

// Game controller module
const Game = (() => {
    let currentPlayer;
    const players = [];
    let gameActive = true;

    const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6]             // Diagonals
    ];

    const initialize = () => {
        const player1 = Player('Player 1', 'X');
        const player2 = Player('Player 2', 'O');

        players.push(player1, player2);
        currentPlayer = player1;

        // Display initial game information
        renderBoard();
        setStatusMessage(`${currentPlayer.name}'s turn`);
    };

    const renderBoard = () => {
        const board = Gameboard.getBoard();
        const cells = document.querySelectorAll('.cell');
        cells.forEach((cell, index) => {
            cell.textContent = board[index];
            cell.addEventListener('click', () => {
                if (gameActive && cell.textContent === '') {
                    playTurn(index);
                }
            });
        });
    };

    const switchTurn = () => {
        currentPlayer = currentPlayer === players[0] ? players[1] : players[0];
        setStatusMessage(`${currentPlayer.name}'s turn`);
    };

    const setStatusMessage = (message) => {
        const statusMessage = document.getElementById('status-message');
        statusMessage.textContent = message;
    };

    const checkWin = () => {
        const board = Gameboard.getBoard();
        for (let i = 0; i < winningCombinations.length; i++) {
            const [a, b, c] = winningCombinations[i];
            if (board[a] !== '' && board[a] === board[b] && board[a] === board[c]) {
                return board[a]; // Return the marker of the winner
            }
        }
        if (board.every(cell => cell !== '')) {
            return 'draw'; // Return 'draw' if all cells are filled and no winner
        }
        return null; // Return null if there is no winner yet
    };

    const playTurn = (index) => {
        if (Gameboard.markCell(index, currentPlayer.marker)) {
            renderBoard();

            const winner = checkWin();
            if (winner) {
                if (winner === 'draw') {
                    setStatusMessage('Draw!');
                } else {
                    setStatusMessage(`${winner} wins!`);
                }
                gameActive = false;
            } else {
                switchTurn();
            }
        }
    };

    const resetGame = () => {
        Gameboard.resetBoard();
        currentPlayer = players[0];
        gameActive = true;
        renderBoard();
        setStatusMessage(`${currentPlayer.name}'s turn`);
    };

    const resetButton = document.getElementById('reset-button');
    resetButton.addEventListener('click', resetGame);

    return {
        initialize,
        playTurn,
        resetGame
    };
})();

// Initialize the game
Game.initialize();
