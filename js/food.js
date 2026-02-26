const FoodType = {
    RED_PACKET: {
        name: '红包',
        score: 10,
        probability: 0.50,
        color: '#ff4444',
        shape: 'square'
    },
    COIN: {
        name: '金币',
        score: 20,
        probability: 0.30,
        color: '#ffd700',
        shape: 'circle'
    },
    DIAMOND: {
        name: '钻石',
        score: 50,
        probability: 0.15,
        color: '#00bfff',
        shape: 'diamond'
    },
    CROWN: {
        name: '皇冠',
        score: 100,
        probability: 0.05,
        color: '#9932cc',
        shape: 'crown'
    }
};

class Food {
    constructor(gridCols, gridRows, cellSize) {
        this.gridCols = gridCols;
        this.gridRows = gridRows;
        this.cellSize = cellSize;
        this.x = 0;
        this.y = 0;
        this.type = null;
        this.animationOffset = 0;
    }

    spawn(snakeBody) {
        let validPosition = false;
        let attempts = 0;
        const maxAttempts = 100;

        while (!validPosition && attempts < maxAttempts) {
            this.x = Utils.randomInt(0, this.gridCols - 1);
            this.y = Utils.randomInt(0, this.gridRows - 1);
            
            validPosition = !snakeBody.some(segment => 
                segment.x === this.x && segment.y === this.y
            );
            attempts++;
        }

        this.type = this.getRandomType();
    }

    getRandomType() {
        const rand = Math.random();
        let cumulative = 0;
        
        for (const type of Object.values(FoodType)) {
            cumulative += type.probability;
            if (rand <= cumulative) {
                return type;
            }
        }
        
        return FoodType.RED_PACKET;
    }

    update() {
        this.animationOffset += 0.1;
    }

    draw(ctx) {
        const x = this.x * this.cellSize;
        const y = this.y * this.cellSize;
        const size = this.cellSize;
        const bounce = Math.sin(this.animationOffset) * 2;

        ctx.save();
        ctx.translate(x + size / 2, y + size / 2 + bounce);

        switch (this.type.shape) {
            case 'square':
                this.drawSquare(ctx, size);
                break;
            case 'circle':
                this.drawCircle(ctx, size);
                break;
            case 'diamond':
                this.drawDiamond(ctx, size);
                break;
            case 'crown':
                this.drawCrown(ctx, size);
                break;
        }

        ctx.restore();
    }

    drawSquare(ctx, size) {
        const s = size * 0.7;
        ctx.fillStyle = this.type.color;
        ctx.fillRect(-s / 2, -s / 2, s, s);
        
        ctx.fillStyle = '#ff6666';
        ctx.fillRect(-s / 2 + 2, -s / 2 + 2, s - 4, s / 3);
        
        ctx.fillStyle = '#ffcccc';
        ctx.font = `${size * 0.4}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('¥', 0, 0);
    }

    drawCircle(ctx, size) {
        const radius = size * 0.35;
        
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fillStyle = this.type.color;
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(-radius * 0.3, -radius * 0.3, radius * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fill();
        
        ctx.fillStyle = '#b8860b';
        ctx.font = `bold ${size * 0.35}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('$', 0, 2);
    }

    drawDiamond(ctx, size) {
        const s = size * 0.35;
        
        ctx.beginPath();
        ctx.moveTo(0, -s);
        ctx.lineTo(s, 0);
        ctx.lineTo(0, s);
        ctx.lineTo(-s, 0);
        ctx.closePath();
        
        const gradient = ctx.createLinearGradient(-s, -s, s, s);
        gradient.addColorStop(0, '#00ffff');
        gradient.addColorStop(0.5, this.type.color);
        gradient.addColorStop(1, '#0088ff');
        ctx.fillStyle = gradient;
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(0, -s * 0.5);
        ctx.lineTo(s * 0.3, 0);
        ctx.lineTo(0, s * 0.5);
        ctx.lineTo(-s * 0.3, 0);
        ctx.closePath();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fill();
    }

    drawCrown(ctx, size) {
        const s = size * 0.35;
        
        ctx.beginPath();
        ctx.moveTo(-s, s * 0.5);
        ctx.lineTo(-s, -s * 0.3);
        ctx.lineTo(-s * 0.5, 0);
        ctx.lineTo(0, -s * 0.8);
        ctx.lineTo(s * 0.5, 0);
        ctx.lineTo(s, -s * 0.3);
        ctx.lineTo(s, s * 0.5);
        ctx.closePath();
        
        const gradient = ctx.createLinearGradient(0, -s, 0, s);
        gradient.addColorStop(0, '#da70d6');
        gradient.addColorStop(0.5, this.type.color);
        gradient.addColorStop(1, '#4b0082');
        ctx.fillStyle = gradient;
        ctx.fill();
        
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(0, -s * 0.6, s * 0.15, 0, Math.PI * 2);
        ctx.fill();
    }

    getPosition() {
        return { x: this.x, y: this.y };
    }

    getScore() {
        return this.type.score;
    }
}
