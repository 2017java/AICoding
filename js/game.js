const DifficultySettings = {
    easy: {
        name: '简单',
        baseSpeed: 200,
        speedIncrease: 0.03
    },
    normal: {
        name: '普通',
        baseSpeed: 150,
        speedIncrease: 0.05
    },
    hard: {
        name: '困难',
        baseSpeed: 100,
        speedIncrease: 0.08
    }
};

class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.difficulty = 'normal';
        this.score = 0;
        this.level = 1;
        this.levelScore = 0;
        this.highScore = Utils.getHighScore();
        this.isRunning = false;
        this.isPaused = false;
        this.gameLoop = null;
        this.currentSpeed = 150;
        
        this.snake = null;
        this.food = null;
        this.grid = null;
        
        this.initUI();
        this.initCanvas();
        this.bindEvents();
        
        this.updateHighScoreDisplay();
    }

    initUI() {
        this.startScreen = document.getElementById('start-screen');
        this.gameScreen = document.getElementById('game-screen');
        this.pauseScreen = document.getElementById('pause-screen');
        this.endScreen = document.getElementById('end-screen');
        
        this.scoreDisplay = document.getElementById('current-score');
        this.levelDisplay = document.getElementById('current-level');
        this.progressFill = document.getElementById('progress-fill');
        this.progressText = document.getElementById('progress-text');
        
        this.finalScoreDisplay = document.getElementById('final-score');
        this.finalLevelDisplay = document.getElementById('final-level');
        this.newRecordDisplay = document.getElementById('new-record');
        this.levelUpNotification = document.getElementById('level-up-notification');
        this.newLevelDisplay = document.getElementById('new-level');
    }

    initCanvas() {
        const size = Utils.getCanvasSize();
        this.canvas.width = size;
        this.canvas.height = size;
        
        this.grid = Utils.getGridSize(this.canvas.width, this.canvas.height);
    }

    bindEvents() {
        document.getElementById('start-btn').addEventListener('click', () => this.startGame());
        document.getElementById('pause-btn').addEventListener('click', () => this.togglePause());
        document.getElementById('resume-btn').addEventListener('click', () => this.togglePause());
        document.getElementById('restart-from-pause-btn').addEventListener('click', () => this.restartGame());
        document.getElementById('menu-btn').addEventListener('click', () => this.returnToMenu());
        document.getElementById('restart-btn').addEventListener('click', () => this.restartGame());
        document.getElementById('back-menu-btn').addEventListener('click', () => this.returnToMenu());
        
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectDifficulty(e));
        });
        
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        
        document.querySelectorAll('.control-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleControlClick(e));
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.handleControlClick(e);
            });
        });
        
        window.addEventListener('resize', Utils.debounce(() => {
            if (this.isRunning && !this.isPaused) {
                this.togglePause();
            }
            this.initCanvas();
        }, 250));
    }

    selectDifficulty(e) {
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        e.target.classList.add('active');
        this.difficulty = e.target.dataset.difficulty;
    }

    handleKeyDown(e) {
        if (!this.isRunning || this.isPaused) {
            if (e.key === 'Escape' && this.isRunning) {
                this.togglePause();
            }
            return;
        }
        
        switch (e.key.toLowerCase()) {
            case 'w':
            case 'arrowup':
                this.snake.setDirection(Direction.UP);
                break;
            case 's':
            case 'arrowdown':
                this.snake.setDirection(Direction.DOWN);
                break;
            case 'a':
            case 'arrowleft':
                this.snake.setDirection(Direction.LEFT);
                break;
            case 'd':
            case 'arrowright':
                this.snake.setDirection(Direction.RIGHT);
                break;
            case 'escape':
            case 'p':
                this.togglePause();
                break;
        }
    }

    handleControlClick(e) {
        if (!this.isRunning || this.isPaused) return;
        
        const direction = e.target.dataset.direction;
        
        switch (direction) {
            case 'up':
                this.snake.setDirection(Direction.UP);
                break;
            case 'down':
                this.snake.setDirection(Direction.DOWN);
                break;
            case 'left':
                this.snake.setDirection(Direction.LEFT);
                break;
            case 'right':
                this.snake.setDirection(Direction.RIGHT);
                break;
        }
    }

    startGame() {
        this.score = 0;
        this.level = 1;
        this.levelScore = 0;
        this.currentSpeed = DifficultySettings[this.difficulty].baseSpeed;
        
        this.snake = new Snake(this.grid.cols, this.grid.rows, this.grid.cellSize);
        this.food = new Food(this.grid.cols, this.grid.rows, this.grid.cellSize);
        this.food.spawn(this.snake.body);
        
        this.showScreen('game');
        this.updateUI();
        
        this.isRunning = true;
        this.isPaused = false;
        this.runGameLoop();
    }

    runGameLoop() {
        if (this.gameLoop) {
            clearTimeout(this.gameLoop);
        }
        
        if (!this.isRunning || this.isPaused) return;
        
        this.update();
        this.render();
        
        this.gameLoop = setTimeout(() => this.runGameLoop(), this.currentSpeed);
    }

    update() {
        this.snake.move();
        this.food.update();
        
        if (this.snake.checkFoodCollision(this.food)) {
            const points = this.food.getScore();
            this.score += points;
            this.levelScore += points;
            this.snake.grow();
            this.food.spawn(this.snake.body);
            
            this.checkLevelUp();
            this.updateUI();
        }
        
        if (this.snake.checkCollision()) {
            this.gameOver();
        }
    }

    checkLevelUp() {
        const requiredScore = this.level * 50;
        
        if (this.levelScore >= requiredScore) {
            this.levelScore -= requiredScore;
            this.level++;
            
            const settings = DifficultySettings[this.difficulty];
            this.currentSpeed = Math.max(50, this.currentSpeed * (1 - settings.speedIncrease));
            
            this.showLevelUp();
        }
    }

    showLevelUp() {
        this.newLevelDisplay.textContent = this.level;
        this.levelUpNotification.classList.remove('hidden');
        
        setTimeout(() => {
            this.levelUpNotification.classList.add('hidden');
        }, 1000);
    }

    render() {
        this.ctx.fillStyle = '#0a0a1a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.drawGrid();
        this.food.draw(this.ctx);
        this.snake.draw(this.ctx);
    }

    drawGrid() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        this.ctx.lineWidth = 1;
        
        for (let x = 0; x <= this.canvas.width; x += this.grid.cellSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        for (let y = 0; y <= this.canvas.height; y += this.grid.cellSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }

    updateUI() {
        this.scoreDisplay.textContent = this.score;
        this.levelDisplay.textContent = this.level;
        
        const requiredScore = this.level * 50;
        const progress = Math.min(100, (this.levelScore / requiredScore) * 100);
        this.progressFill.style.width = `${progress}%`;
        this.progressText.textContent = `${this.levelScore} / ${requiredScore}`;
    }

    updateHighScoreDisplay() {
        document.getElementById('high-score').textContent = this.highScore;
    }

    togglePause() {
        if (!this.isRunning) return;
        
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            this.showScreen('pause');
        } else {
            this.hideOverlay();
            this.runGameLoop();
        }
    }

    gameOver() {
        this.isRunning = false;
        
        if (this.gameLoop) {
            clearTimeout(this.gameLoop);
        }
        
        const isNewRecord = Utils.saveHighScore(this.score);
        this.highScore = Utils.getHighScore();
        this.updateHighScoreDisplay();
        
        this.finalScoreDisplay.textContent = this.score;
        this.finalLevelDisplay.textContent = this.level;
        
        if (isNewRecord) {
            this.newRecordDisplay.classList.remove('hidden');
        } else {
            this.newRecordDisplay.classList.add('hidden');
        }
        
        this.showScreen('end');
    }

    restartGame() {
        this.hideOverlay();
        this.startGame();
    }

    returnToMenu() {
        this.isRunning = false;
        this.isPaused = false;
        
        if (this.gameLoop) {
            clearTimeout(this.gameLoop);
        }
        
        this.hideOverlay();
        this.showScreen('start');
    }

    showScreen(screen) {
        this.startScreen.classList.add('hidden');
        this.gameScreen.classList.add('hidden');
        this.pauseScreen.classList.add('hidden');
        this.endScreen.classList.add('hidden');
        
        switch (screen) {
            case 'start':
                this.startScreen.classList.remove('hidden');
                break;
            case 'game':
                this.gameScreen.classList.remove('hidden');
                break;
            case 'pause':
                this.gameScreen.classList.remove('hidden');
                this.pauseScreen.classList.remove('hidden');
                break;
            case 'end':
                this.gameScreen.classList.remove('hidden');
                this.endScreen.classList.remove('hidden');
                break;
        }
    }

    hideOverlay() {
        this.pauseScreen.classList.add('hidden');
        this.endScreen.classList.add('hidden');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Game();
});
