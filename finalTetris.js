const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

context.scale(20, 20);
const arena = createMatrix(15, 15); 

//Deleting and collecting full row of blocks for points
function arenaSweep() {
    let rowCount = 1;
    outer: for (let y = arena.length -1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }

        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;

        player.score += rowCount * 10;
        rowCount *= 2;
    }
}

//Being abble to stack the blocks on top of each other
function collide(arena, player) {
    const m = player.matrix;
    const o = player.pos;
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 &&
               (arena[y + o.y] &&
                arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

//Where the blocks stop and end on the screen
function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

//All the tetris blocks 

function createPiece(type)
{
    if (type === 'I') {
        return [
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
        ];
    } else if (type === 'L') {
        return [
            [0, 2, 0],
            [0, 2, 0],
            [0, 2, 2],
        ];
    } else if (type === 'J') {
        return [
            [0, 3, 0],
            [0, 3, 0],
            [3, 3, 0],
        ];
    } else if (type === 'O') {
        return [
            [4, 4],
            [4, 4],
        ];
    } else if (type === 'Z') {
        return [
            [5, 5, 0],
            [0, 5, 5],
            [0, 0, 0],
        ];
    } else if (type === 'S') {
        return [
            [0, 6, 6],
            [6, 6, 0],
            [0, 0, 0],
        ];
    } else if (type === 'T') {
        return [
            [0, 7, 0],
            [7, 7, 7],
            [0, 0, 0],
        ];
    }
}

//Positioning the block with x and y coordinates   
function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = colors[value];
                context.fillRect(x + offset.x,
                                 y + offset.y,
                                 1, 1);
            }
        });
    });
}

function draw() {
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);

    drawMatrix(arena, {x: 0, y: 0});
    drawMatrix(player.matrix, player.pos);
}

//Copy the values of the player into the arena at the correct position  
function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

//To rotate the blocks
function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [
                matrix[x][y],
                matrix[y][x],
            ] = [
                matrix[y][x],
                matrix[x][y],
            ];
        }
    }

    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}

//To drop blocks and what happens after the block has been dropped
function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
        updateScore();
    }
    dropCounter = 0;
}

//To make sure that the blocks to do exit the screen
function playerMove(offset) {
    player.pos.x += offset;
    if (collide(arena, player)) {
        player.pos.x -= offset;
    }
}

//Drop the piece, get a new random piece, and they collide
function playerReset() {
    const pieces = 'TJLOSZI';
    player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) -
                   (player.matrix[0].length / 2 | 0);
    //if the blocks reach to the top of the screen, clear arena
    if (collide(arena, player)) {
        arena.forEach(row => row.fill(0));
        player.score = 0;
        updateScore();
    }
}

//Move the rotated block left and right and stay within the screen/wall
function playerRotate(dir) {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}


//Automatic drop, to drop the blocks every second 
let dropCounter = 0;
let dropInterval = 1000;

let lastTime = 0;
function update(time = 0) {
    const deltaTime = time - lastTime;
    if (document.getElementById('pause_resume').value == 'resume') { //conditioning to check the pause/resume flag
	   dropCounter += deltaTime;
	   if (dropCounter > dropInterval) {
          playerDrop();
       }
	   lastTime = time;
       draw();
       requestAnimationFrame(update);
    }
}

function updateScore() {
    document.getElementById('score').innerText = player.score;
}

//Keyboard controls
document.addEventListener('keydown', event => {
    if (event.keyCode === 37) {
        playerMove(-1); //move left
    } else if (event.keyCode === 39) {
        playerMove(1); //move right
    } else if (event.keyCode === 40) {
        playerDrop(); //drop, move down
    } else if (event.keyCode === 38) {
        playerRotate(-1); //rotate
    }
});

//Functionalities for the arrows on the GameBoy design 
function upArrow (){
    playerRotate(-1);
}

function downArrow (){
    playerDrop();
}

function leftArrow(){
    playerMove(-1);
}

function rightArrow (){
    playerMove(1);
}

const colors = [
    null,
    '#52c7eb',
    '#db720f',
    '#0e1ac2',
    '#f0df24',
    '#de1010',
    '#5de62c',
    '#9f3fe8',
];

const player = {
    pos: {x: 0, y: 0},
    matrix: null,
    score: 0,
};

function startGame() {
	document.getElementById('pause_resume').value = 'resume';
	playerReset();
	updateScore();
	update();
}

function pauseGame() {
    document.getElementById('pause_resume').value = 'pause';
}

function resumeGame() {
    document.getElementById('pause_resume').value = 'resume';
	updateScore();
	update();
}

function newGame() {
   location.reload();
}   
   
