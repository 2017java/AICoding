const Utils = {
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    randomChoice(array) {
        return array[Math.floor(Math.random() * array.length)];
    },

    getGridSize(canvasWidth, canvasHeight) {
        const cellSize = 20;
        return {
            cols: Math.floor(canvasWidth / cellSize),
            rows: Math.floor(canvasHeight / cellSize),
            cellSize: cellSize
        };
    },

    getCanvasSize() {
        const container = document.getElementById('game-container');
        const maxWidth = Math.min(container.clientWidth - 40, 460);
        const maxHeight = window.innerHeight - 280;
        
        const isMobile = window.innerWidth <= 768;
        const mobileOffset = isMobile ? 180 : 0;
        
        let size = Math.min(maxWidth, maxHeight - mobileOffset);
        size = Math.floor(size / 20) * 20;
        size = Math.max(size, 200);
        
        return size;
    },

    saveHighScore(score) {
        const currentHigh = this.getHighScore();
        if (score > currentHigh) {
            localStorage.setItem('snakeHighScore', score.toString());
            return true;
        }
        return false;
    },

    getHighScore() {
        return parseInt(localStorage.getItem('snakeHighScore')) || 0;
    },

    isMobile() {
        return window.innerWidth <= 768;
    },

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};
