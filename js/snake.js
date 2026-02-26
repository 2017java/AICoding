const Direction = {
    UP: { x: 0, y: -1 },
    DOWN: { x: 0, y: 1 },
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 }
};

class Snake {
    constructor(gridCols, gridRows, cellSize) {
        this.gridCols = gridCols;
        this.gridRows = gridRows;
        this.cellSize = cellSize;
        this.body = [];
        this.direction = Direction.RIGHT;
        this.nextDirection = Direction.RIGHT;
        this.growing = false;
        this.init();
    }

    init() {
        const startX = Math.floor(this.gridCols / 4);
        const startY = Math.floor(this.gridRows / 2);
        
        this.body = [
            { x: startX, y: startY },
            { x: startX - 1, y: startY },
            { x: startX - 2, y: startY }
        ];
        
        this.direction = Direction.RIGHT;
        this.nextDirection = Direction.RIGHT;
        this.growing = false;
    }

    setDirection(newDirection) {
        if (this.isOppositeDirection(newDirection)) {
            return;
        }
        this.nextDirection = newDirection;
    }

    isOppositeDirection(newDirection) {
        return (this.direction.x + newDirection.x === 0) && 
               (this.direction.y + newDirection.y === 0);
    }

    move() {
        this.direction = this.nextDirection;
        
        const head = this.body[0];
        const newHead = {
            x: head.x + this.direction.x,
            y: head.y + this.direction.y
        };
        
        this.body.unshift(newHead);
        
        if (!this.growing) {
            this.body.pop();
        } else {
            this.growing = false;
        }
    }

    grow() {
        this.growing = true;
    }

    checkWallCollision() {
        const head = this.body[0];
        return head.x < 0 || head.x >= this.gridCols || 
               head.y < 0 || head.y >= this.gridRows;
    }

    checkSelfCollision() {
        const head = this.body[0];
        for (let i = 1; i < this.body.length; i++) {
            if (head.x === this.body[i].x && head.y === this.body[i].y) {
                return true;
            }
        }
        return false;
    }

    checkCollision() {
        return this.checkWallCollision() || this.checkSelfCollision();
    }

    checkFoodCollision(food) {
        const head = this.body[0];
        const foodPos = food.getPosition();
        return head.x === foodPos.x && head.y === foodPos.y;
    }

    draw(ctx) {
        this.body.forEach((segment, index) => {
            const x = segment.x * this.cellSize;
            const y = segment.y * this.cellSize;
            const size = this.cellSize;
            
            const hue = 140 + (index * 2) % 60;
            const saturation = 70 - (index * 0.5);
            const lightness = index === 0 ? 55 : 45 - (index * 0.3);
            
            ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
            
            const padding = 1;
            const radius = 4;
            
            ctx.beginPath();
            ctx.roundRect(
                x + padding, 
                y + padding, 
                size - padding * 2, 
                size - padding * 2, 
                radius
            );
            ctx.fill();
            
            if (index === 0) {
                this.drawHead(ctx, x, y, size);
            }
            
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.lineWidth = 1;
            ctx.stroke();
        });
    }

    drawHead(ctx, x, y, size) {
        const eyeSize = size * 0.15;
        const eyeOffset = size * 0.25;
        
        ctx.fillStyle = '#fff';
        
        let eye1X, eye1Y, eye2X, eye2Y;
        
        if (this.direction === Direction.RIGHT) {
            eye1X = x + size * 0.7;
            eye1Y = y + eyeOffset;
            eye2X = x + size * 0.7;
            eye2Y = y + size - eyeOffset;
        } else if (this.direction === Direction.LEFT) {
            eye1X = x + size * 0.3;
            eye1Y = y + eyeOffset;
            eye2X = x + size * 0.3;
            eye2Y = y + size - eyeOffset;
        } else if (this.direction === Direction.UP) {
            eye1X = x + eyeOffset;
            eye1Y = y + size * 0.3;
            eye2X = x + size - eyeOffset;
            eye2Y = y + size * 0.3;
        } else {
            eye1X = x + eyeOffset;
            eye1Y = y + size * 0.7;
            eye2X = x + size - eyeOffset;
            eye2Y = y + size * 0.7;
        }
        
        ctx.beginPath();
        ctx.arc(eye1X, eye1Y, eyeSize, 0, Math.PI * 2);
        ctx.arc(eye2X, eye2Y, eyeSize, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(eye1X, eye1Y, eyeSize * 0.5, 0, Math.PI * 2);
        ctx.arc(eye2X, eye2Y, eyeSize * 0.5, 0, Math.PI * 2);
        ctx.fill();
    }

    getHead() {
        return this.body[0];
    }

    getLength() {
        return this.body.length;
    }
}
