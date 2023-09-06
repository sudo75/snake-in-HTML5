const container = document.querySelector('.container');
const board = document.querySelector('.board');
const modeElement = document.querySelector('.mode');
const resultElement = document.querySelector('.result');
const menuElement = document.querySelector('.menu');
const snakeElements = document.querySelectorAll('.snake');
const foodElements = document.querySelectorAll('.food');
const foodAudio = new Audio('sounds/food.mp3');
const lossAudio = new Audio('sounds/loss.mp3');
lossAudio.volume = 0.25;
const winAudio = new Audio('sounds/win.mp3');
const scoreID = document.getElementById('scoreDisplay');
const resultID = document.getElementById('result');
const hiScoreID = document.getElementById('hiScoreDisplay');
const pauseButton = document.getElementById('pause');
const resetButton = document.getElementById('reset');
const resetAllButton = document.getElementById('resetAll');
const options = document.querySelector('.options');
const optionButtons = document.querySelector('.optionButtons');
const cells = document.querySelectorAll('.cell');
const gameModeSelector = document.getElementById('gameModeSelector');

let gridSize = 40;
let gridQuantityColumns = 13;
let gridQuantityRows = 13;

let boardWidth = gridSize * gridQuantityColumns;
let boardHeight = gridSize * gridQuantityRows;
let gridArea = gridQuantityColumns * gridQuantityRows;

modeElement.style.width = `${boardWidth}px`;
resultElement.style.width = `${boardWidth}px`;
menuElement.style.width = `${boardWidth}px`;
scoreID.style.width = `${boardWidth / 4}px`;
resultID.style.width = `${boardWidth / 2}px`;
hiScoreID.style.width = `${boardWidth / 4}px`;
pauseButton.style.width = `${boardWidth / 3}px`;
resetButton.style.width = `${boardWidth / 3}px`;
resetAllButton.style.width = `${boardWidth / 3}px`;
options.style.width = `${boardWidth}px`;

const allOptionButtons = document.querySelectorAll('.optionButtons');
allOptionButtons.forEach(button => {
    button.style.width = `${boardWidth / 3}px`;
})

let initialSnakePosition = [{x: Math.floor(gridQuantityColumns / 2 - 1), y: Math.floor(gridQuantityRows / 2)}, {x: Math.floor(gridQuantityColumns / 2 - 2), y: Math.floor(gridQuantityRows / 2)}];
let initialFoodPosition = [{x: Math.floor(gridQuantityColumns * 0.75), y: Math.floor(gridQuantityRows / 2)}];

let snakePosition = [{x: 5, y: 6}, {x: 4, y: 6}];
let foodPosition = [{x: 6, y: 6}];
snakePosition = initialSnakePosition;
foodPosition = initialFoodPosition;
let direction = "right";
let previousSnakeDirection = direction;
let gameStarted = false;
let gameLoopInterval = 8;
let previousSnakeEnd = {x: 0, y: 0};

let score = 0;
let mode = {gamemode: 0, speed: 1, size: 1, food: 0};
let hiScore = [
    [[[0],[0],[0]], [[0],[0],[0]], [[0],[0],[0]]],
    [[[0],[0],[0]], [[0],[0],[0]], [[0],[0],[0]]],
    [[[0],[0],[0]], [[0],[0],[0]], [[0],[0],[0]]]
        ];
let foodEaten = null;

let result = "playing";
let paused = true;
let backgroundColourStandard = "164, 206, 170";
let backgroundColourLoss = "120, 120, 120";
let backgroundcolourWin = "215, 154, 76";

function speedSetting() {
    if (gameLoopInterval == 6) {
        gameLoopInterval = 12; //Every 12 ticks (240ms)
        mode.speed = 0;
        document.getElementById('speedSetting').innerText = "Speed: Slow";
    } else if (gameLoopInterval == 12) {
        gameLoopInterval = 8; //Every 8 ticks (160ms)
        mode.speed = 1;
        document.getElementById('speedSetting').innerText = "Speed: Normal";
    } else if (gameLoopInterval == 8) {
        gameLoopInterval = 6; //Every 6 ticks (120ms)
        mode.speed = 2;
        document.getElementById('speedSetting').innerText = "Speed: Fast";
    }
    clearInterval(intervalId_gameLoop);
    reset();
}

function boardSetting() {
    //Mode Changing
    if (mode.size == 0) {
        gridQuantityColumns = 12;
        gridQuantityRows = 12;
        mode.size = 1;
        document.getElementById('sizeSetting').innerText = "Size: Normal";
    } else if (mode.size == 1) {
        gridQuantityColumns = 20;
        gridQuantityRows = 20;
        mode.size = 2;
        document.getElementById('sizeSetting').innerText = "Size: Large";
    } else if (mode.size == 2) {
        gridQuantityColumns = 8;
        gridQuantityRows = 8;
        mode.size = 0;
        document.getElementById('sizeSetting').innerText = "Size: Small";
    }
    
    //Snake and food sizing
    initialSnakePosition = [{x: Math.floor(gridQuantityColumns / 2 - 1), y: Math.floor(gridQuantityRows / 2)}, {x: Math.floor(gridQuantityColumns / 2 - 2), y: Math.floor(gridQuantityRows / 2)}];
    initialFoodPosition = [{x: Math.floor(gridQuantityColumns * 0.75), y: Math.floor(gridQuantityRows / 2)}];
    
    snakePosition = initialSnakePosition;
    foodPosition = initialFoodPosition;
    console.log(snakePosition, foodPosition);
    
    setBoard(boardWidth, boardHeight);
    clearInterval(intervalId_gameLoop);
    reset();
}

function foodSetting() {
    //Mode Changing
    if (mode.food == 0) {
        mode.food = 1;
        document.getElementById('foodSetting').innerText = "Food: 3";
    } else if (mode.food == 1) {
        mode.food = 2;
        document.getElementById('foodSetting').innerText = "Food: 5";
    } else if (mode.food == 2) {
        mode.food = 0;
        document.getElementById('foodSetting').innerText = "Food: 1";
    }
    setBoard(boardWidth, boardHeight);
    clearInterval(intervalId_gameLoop);
    reset();
}

setup();
function setup() {
    setBoard(boardWidth, boardHeight);
}
function setBoard(size) {
    {//Error Checking
        if (gridQuantityColumns < 4 || gridQuantityRows < 4) {
            return;
        }
    }
    foodEaten = null;

    board.style.width = `${boardWidth}px`;
    board.style.height = `${boardHeight}px`;

    board.style.gridTemplateRows = `repeat(${gridQuantityRows}, 1fr)`;
    board.style.gridTemplateColumns = `repeat(${gridQuantityColumns}, 1fr)`;

    // Generate grid cells
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        cell.remove();
    });
    const food = document.querySelectorAll('.food');
    food.forEach(food => {
        food.remove();
    });
    const snake = document.querySelectorAll('.snake');
    snake.forEach(snake => {
        snake.remove();
    });
    for (let i = 0; i < gridQuantityRows * gridQuantityColumns; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        board.appendChild(cell);
    }
    displaySnake();
    initialFoodPosition = [{x: Math.floor(gridQuantityColumns * 0.75), y: Math.floor(gridQuantityRows / 2)}];
    if (mode.food >= 1) {
        initialFoodPosition.push({x: 1, y: 1}, {x: 1, y: gridQuantityRows - 2})
    }
    if (mode.food == 2) {
        initialFoodPosition.push({x: gridQuantityColumns - 2, y: 1}, {x: gridQuantityColumns - 2, y: gridQuantityRows - 2})
    }
    foodPosition = initialFoodPosition;
    displayFood();
}

function displaySnake() {
    const allCells = document.querySelectorAll('.cell');
    // Clear snake class from all cells
    allCells.forEach(cell => {
        cell.classList.remove('snake');
    });
    //Draw new snake
    snakePosition.forEach(position => {
        const cellIndex = position.x + position.y * gridQuantityColumns
        allCells[cellIndex].classList.add('snake');
    });
}

//Food
function randomFood() {
    generateFood();
    function generateFood() {

        let vacantSquares = [];

        for (let i = 0; i < gridQuantityColumns; i++) {
            for (let j = 0; j < gridQuantityRows; j++) {
                let isOccupiedBySnake = false;
                let isOccupiedByFood = false;

                // Check if the current position (i, j) is occupied by the snake
                for (let k = 0; k < snakePosition.length; k++) {
                    if (snakePosition[k].x === i && snakePosition[k].y === j) {
                        isOccupiedBySnake = true;
                        break; // No need to continue checking
                    }
                }

                // Check if the current position (i, j) is occupied by food
                for (let l = 0; l < foodPosition.length; l++) {
                    if (foodPosition[l].x === i && foodPosition[l].y === j) {
                        isOccupiedByFood = true;
                        break; // No need to continue checking
                    }
                }

                // If the position is not occupied by snake or food, add it to vacantSquares
                if (!isOccupiedBySnake && !isOccupiedByFood) {
                    vacantSquares.push({ x: i, y: j });
                }
            }
        }
        console.log(vacantSquares);
        if (vacantSquares.length == 0) {
            foodPosition.splice(foodEaten, 1);
            return;
        } else {
            foodPosition[foodEaten] = vacantSquares[Math.floor(Math.random() * vacantSquares.length)];
        }

    }
    displayFood();
    console.log(foodPosition);
}

function displayFood() {
    const allCells = document.querySelectorAll('.cell');
        allCells.forEach(cell => {
            cell.classList.remove('food');
        });
        foodPosition.forEach(position => {
            const cellIndex = position.x + position.y * gridQuantityColumns;
            allCells[cellIndex].classList.add('food');
        });
}

let gameTick = 0;
function gameLoop() {

    if (gameTick % gameLoopInterval === 0) {
        //Snake Positioning
        previousSnakeEnd.x = snakePosition[snakePosition.length - 1].x;
        previousSnakeEnd.y = snakePosition[snakePosition.length - 1].y;

        //Snake Direction
        if (direction == "right") {
            if (previousSnakeDirection == "left") {
                direction = "left";
                left();
            } else {
                right();
            }
        } else
        
        if (direction == "left") {
            if (previousSnakeDirection == "right") {
                direction = "right";
                right();
            } else {
                left();
            }
        } else

        if (direction == "up") {
            if (previousSnakeDirection == "down") {
                direction = "down";
                down();
            } else {
                up();
            }
        } else

        if (direction == "down") {
            if (previousSnakeDirection == "up") {
                direction = "up";
                up();
            } else {
                down();
            }
        }
        
        //Snake Eating
        for (i = 0; i < foodPosition.length; i++) {
            if (snakePosition[0].x == foodPosition[i].x && snakePosition[0].y == foodPosition[i].y) {
                snakePosition.push(previousSnakeEnd);
                score += 1;
                foodEaten = i;
                foodAudio.play();
                randomFood();
            }
        }

        //Movement functions
        function right() {
            snakePosition.unshift({x: snakePosition[0].x + 1, y: snakePosition[0].y});
            snakePosition.pop();
        }
        function left() {
            snakePosition.unshift({x: snakePosition[0].x - 1, y: snakePosition[0].y});
            snakePosition.pop();
        }
        function up() {
            snakePosition.unshift({x: snakePosition[0].x, y: snakePosition[0].y - 1});
            snakePosition.pop();
        }
        function down() {
            snakePosition.unshift({x: snakePosition[0].x, y: snakePosition[0].y + 1});
            snakePosition.pop();
        }

        //Snake collision
        for (let i = 1; i < snakePosition.length; i++) {
            if (
                snakePosition[0].x == snakePosition[i].x &&
                snakePosition[0].y == snakePosition[i].y
                ) {
                    result = "loss";
                }
        }

        //Wall collision
        if (
                snakePosition[0].x >= gridQuantityColumns ||
                snakePosition[0].x < 0||
                snakePosition[0].y >= gridQuantityRows ||
                snakePosition[0].y < 0
            ) {
                result = "loss";
        }

        //Win
        if (foodPosition.length == 0) {
            result = "win";
        }

        //Check loss
        if (result == "loss") {
            afterLoss();
            return;
        }

            document.getElementById('scoreDisplay').innerText = score;
            if (hiScore[mode.speed][mode.size][mode.food] < score) {
                hiScore[mode.speed][mode.size][mode.food] = score;
            }
            document.getElementById('hiScoreDisplay').innerText = hiScore[mode.speed][mode.size][mode.food];
            displaySnake();
            previousSnakeDirection = direction;

            //Check win
        if (result == "win") {
            afterWin();
            return;
        }
    }
    //Increment gameTick
    gameTick++;
}

{//Controls
function modeSetting() {
    if (mode.gamemode === 0) {
        mode.gamemode = 1;
        gameModeSelector.innerText = "Time Attack";
    } else if (mode.gamemode === 1) {
        mode.gamemode = 0;
        gameModeSelector.innerText = "Snake Classic";
    }

    setBoard(boardWidth, boardHeight);
    clearInterval(intervalId_gameLoop);
    reset();
}

function start() {
    pauseButton.innerText = "Pause";
    intervalId_gameLoop = setInterval(gameLoop, 20);
}

function afterWin() {
    clearInterval(intervalId_gameLoop);
    winAudio.play();
    document.getElementById('result1').innerText = "You Win";
    document.getElementById('result2').innerText = "Enter To Reset";
    board.style.backgroundColor = `rgb(${backgroundcolourWin})`;
}

function afterLoss() {
    clearInterval(intervalId_gameLoop);
    lossAudio.play();
    document.getElementById('result1').innerText = "You Lost";
    document.getElementById('result2').innerText = "Enter To Reset";
    board.style.backgroundColor = `rgb(${backgroundColourLoss})`;
}

function reset(size) {
    clearInterval(intervalId_gameLoop);
    board.style.backgroundColor = `rgb(${backgroundColourStandard})`;
    document.getElementById('result1').innerText = "Arrow Keys Or WASD";
    document.getElementById('result2').innerText = "";
    pauseButton.innerText = "Start";

    initialSnakePosition = [{x: Math.floor(gridQuantityColumns / 2 - 1), y: Math.floor(gridQuantityRows / 2)}, {x: Math.floor(gridQuantityColumns / 2 - 2), y: Math.floor(gridQuantityRows / 2)}];
    initialFoodPosition = [{x: Math.floor(gridQuantityColumns * 0.75), y: Math.floor(gridQuantityRows / 2)}];
    if (mode.food >= 1) {
        initialFoodPosition.push({x: 1, y: 1}, {x: 1, y: gridQuantityRows - 2})
    }
    if (mode.food == 2) {
        initialFoodPosition.push({x: gridQuantityColumns - 2, y: 1}, {x: gridQuantityColumns - 2, y: gridQuantityRows - 2})
    }    snakePosition = initialSnakePosition;
    foodPosition = initialFoodPosition;
    direction = "right";
    previousSnakeDirection = direction;
    gameStarted = false;
    paused = true;
    previousSnakeEnd = {x: 0, y: 0};;
    score = 0;
    hiScoreID.innerText = hiScore[mode.speed][mode.size][mode.food]
    document.getElementById('scoreDisplay').innerText = score;
    result = "playing";
    gameTick = 0;
    
        displaySnake();
        displayFood();
}

function resetAll() {
    if (!confirm("This will clear all hi-scores.  Do you want to continue?")) {
        return;
    } else {
        mode = {speed: 1, size: 0, food: 0};
        boardSetting();
        hiScore = [
            [[[0],[0],[0]], [[0],[0],[0]], [[0],[0],[0]]],
            [[[0],[0],[0]], [[0],[0],[0]], [[0],[0],[0]]],
            [[[0],[0],[0]], [[0],[0],[0]], [[0],[0],[0]]]
                ];
        hiScoreID.innerText = hiScore[mode.speed][mode.size][mode.food];
        document.getElementById('speedSetting').innerText = "Speed: Normal";
        document.getElementById('sizeSetting').innerText = "Size: Normal";
        document.getElementById('foodSetting').innerText = "Food: 1";
        reset();
    }
}


function pause() {
    if (!paused && result == "playing") {
        paused = true;
        pauseButton.innerText = "Resume";
        clearInterval(intervalId_gameLoop);
    } else if (!gameStarted && result == "playing") {
        direction = "right";
        gameStarted = true;
        paused = false;
        pauseButton.innerText = "Pause";
        start();
    } else if (result == "playing") {
        paused = false;
        pauseButton.innerText = "Pause";
        start();
    }

}

}

{//User Input

    board.addEventListener('click', function(event) {
        const x = event.clientX - board.getBoundingClientRect().left;
        const y = event.clientY - board.getBoundingClientRect().top;
        const boardWidth = board.offsetWidth;
        const boardHeight = board.offsetHeight;
        boardClick(x, y, boardWidth, boardHeight);
    });

    function boardClick(x, y, boardWidth, boardHeight) {
        let givenKey;
        //Top left
        if (x < boardWidth * 0.3 || y < boardHeight * 0.3) {
            if (x < y) {
                givenKey = "ArrowLeft";
            } else {
                givenKey = "ArrowUp";
            }
            console.log('click top left');
            keyHandler(event, givenKey);
        }
        //Bottom right
        if (x > boardWidth * 0.7 || y > boardHeight * 0.7) {
            if (x > y) {
                givenKey = "ArrowRight";
            } else {
                givenKey = "ArrowDown";
            }
            console.log('click bottom right');
            keyHandler(event, givenKey);
        }
    }

document.addEventListener('keydown', keyHandler);
function keyHandler(event, givenKey) {
    let key;
    let allowStart = false;
    if (givenKey !== undefined) {
        key = givenKey;
    } else {
        key = event.key;
    }

    if (key == 'ArrowUp' || key == 'w') {
        direction = "up";
        allowStart = true;
    }
    if (key == 'ArrowDown' || key == 's') {
        direction = "down";
        allowStart = true;
    }
    if (key == 'ArrowLeft' || key == 'a') {
        direction = "left";
    }
    if (key == 'ArrowRight' || key == 'd') {
        direction = "right";
        allowStart = true;
    }
    if (key == 'p') {
        pause();
    }

    if (key == 'Enter' && result == "loss") {
        reset();
    } else if (!gameStarted && allowStart) {
        gameStarted = true;
        paused = false;
        start();
    }
}
}