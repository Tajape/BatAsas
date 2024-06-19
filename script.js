let morcego, game, scoreDisplay, initialScreen, deathScreen, finalScore, recordDisplay, initialScreenRecord;
let backgroundMusic, jumpMusic, endMusic;
let morcegoY, gameInterval, pipeInterval, score, backgroundPositionX, gameOver, gameStarted, record;
let laserEnabled = false;
const gravity = 0.3;
const lift = -8;
let velocity = 0;
let inputBuffer = '';

document.addEventListener('DOMContentLoaded', () => {
    morcego = document.getElementById('morcego');
    game = document.getElementById('game');
    scoreDisplay = document.getElementById('score');
    initialScreen = document.getElementById('initial-screen');
    deathScreen = document.getElementById('death-screen');
    finalScore = document.getElementById('final-score');
    recordDisplay = document.getElementById('record');
    initialScreenRecord = document.getElementById('initial-record');

    backgroundMusic = document.getElementById('background-music');
    jumpMusic = document.getElementById('jump-music');
    endMusic = document.getElementById('end-music');

    backgroundMusic.volume = 0.9;

    morcegoY = window.innerHeight / 2;
    gameInterval;
    pipeInterval;
    score = 0;
    backgroundPositionX = 0;
    gameOver = false;
    gameStarted = false;

    record = localStorage.getItem('record') || 0;
    recordDisplay.textContent = "Recorde: " + record;
    initialScreenRecord.textContent = "Recorde: " + record;

    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            if (!gameStarted) {
                initialScreen.style.display = 'none';
                gameStarted = true;
                startGame();
            } else if (deathScreen.style.display === 'flex') {
                window.location.reload();
            } else {
                fly();
            }
        } else if (laserEnabled && e.code === 'KeyL') {
            shootLaser();
        } else {
            handleCodeInput(e.key);
        }
    });
});

function startGame() {
    gameInterval = setInterval(gameLoop, 20);
    pipeInterval = setInterval(createPipe, 2500);
    backgroundMusic.play();
}

function gameLoop() {
    if (gameOver) return;

    velocity += gravity;
    morcegoY += velocity;
    morcego.style.top = morcegoY + 'px';

    if (morcegoY > window.innerHeight || morcegoY < 0) endGame();

    let hitboxBuffer = 10;
    let pipes = document.querySelectorAll('.pipe');
    pipes.forEach(pipe => {
        let pipeRect = pipe.getBoundingClientRect();
        let morcegoRect = morcego.getBoundingClientRect();
        let buffer = 5;
        if (
            morcegoRect.right - buffer - hitboxBuffer > pipeRect.left &&
            morcegoRect.left + buffer + hitboxBuffer < pipeRect.right &&
            ((morcegoRect.bottom - buffer - hitboxBuffer > pipeRect.top && pipe.classList.contains('bottom')) ||
            (morcegoRect.top + buffer + hitboxBuffer < pipeRect.bottom && pipe.classList.contains('top')))
        ) {
            endGame();
        }

        if (!pipe.passed && morcegoRect.right - buffer > pipeRect.right) {
            pipe.passed = true;
            if (pipe.classList.contains('top')) {
                score++;
                scoreDisplay.textContent = score;
                scoreDisplay.classList.remove('deflate');
                scoreDisplay.classList.add('deflate');
            }
        }

        if (pipeRect.right < 0) {
            pipe.remove();
        }
    });

    scoreDisplay.onanimationend = () => {
        scoreDisplay.classList.remove('deflate');
    };

    backgroundPositionX -= 2;
    game.style.backgroundPositionX = backgroundPositionX + 'px';
}

function createPipe() {
    let pipeHeight = Math.floor(Math.random() * (window.innerHeight / 2)) + 50;
    const gap = 200;

    let topPipe = document.createElement('div');
    topPipe.classList.add('pipe', 'top');
    topPipe.style.height = pipeHeight + 'px';
    topPipe.style.left = '100%';
    topPipe.passed = false;
    game.appendChild(topPipe);

    let bottomPipe = document.createElement('div');
    bottomPipe.classList.add('pipe', 'bottom');
    bottomPipe.style.height = (window.innerHeight - pipeHeight - gap) + 'px';
    bottomPipe.style.left = '100%';
    bottomPipe.passed = false;
    game.appendChild(bottomPipe);

    setTimeout(() => {
        if (!gameOver) {
            topPipe.remove();
            bottomPipe.remove();
        }
    }, 4000);
}

function fly() {
    if (gameOver) return;
    velocity = lift;
    jumpMusic.play();
}

function endGame() {
    gameOver = true;
    clearInterval(gameInterval);
    clearInterval(pipeInterval);
    if (score > record) {
        record = score;
        localStorage.setItem('record', record);
        recordDisplay.textContent = "Recorde: " + record;
        initialScreenRecord.textContent = "Recorde: " + record;
    }
    finalScore.textContent = score;
    deathScreen.style.display = 'flex';
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
    endMusic.play();
    let pipes = document.querySelectorAll('.pipe');
    pipes.forEach(pipe => {
        pipe.classList.add('paused');
    });
}

function shootLaser() {
    const laser = document.getElementById('laser');
    laser.style.top = morcego.getBoundingClientRect().top + morcego.offsetHeight / 2 - laser.offsetHeight / 2 + 'px';
    laser.style.left = morcego.getBoundingClientRect().left + morcego.offsetWidth + 'px';
    laser.classList.add('active');

    // Verifica colisão com os obstáculos
    const laserMoveInterval = setInterval(() => {
        const laserRect = laser.getBoundingClientRect();
        const pipes = document.querySelectorAll('.pipe');
        pipes.forEach(pipe => {
            const pipeRect = pipe.getBoundingClientRect();
            if (
                laserRect.right > pipeRect.left &&
                laserRect.left < pipeRect.right &&
                laserRect.bottom > pipeRect.top &&
                laserRect.top < pipeRect.bottom
            ) {
                pipe.remove();
                laser.classList.remove('active');
                clearInterval(laserMoveInterval);
            }
        });

        if (laserRect.left > window.innerWidth) {
            laser.classList.remove('active');
            clearInterval(laserMoveInterval);
        }
    }, 20);

    // Remove a classe 'active' após a animação terminar
    laser.onanimationend = () => {
        laser.classList.remove('active');
    };
}

function handleCodeInput(key) {
    inputBuffer += key.toLowerCase();
    if (inputBuffer.includes('laser')) {
        enableLaser();
        inputBuffer = ''; // Limpa o buffer após ativar o laser
    }
}

function enableLaser() {
    laserEnabled = true;
    alert('Laser habilitado!');
}