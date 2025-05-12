const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

// Game state
const TILE_SIZE = 32;
const MAP_COLS = 50;
const MAP_ROWS = 50;

// Sprite definitions
const tankSprite = { width: 64, height: 70 };
const turretSprite = { width: 64, height: 70 };

// Tank object
const tank = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    bodyWidth: 64,
    bodyHeight: 70,
    turretWidth: 64,
    turretHeight: 62,
    width: 64,  // Overall tank width for collision
    height: 70, // Overall tank height for collision
    turretAngle: 0,
    speed: 0,
    maxSpeed: 5,
    acceleration: 0.2,
    friction: 0.98,
    rotation: 0,
    velocityX: 0,
    velocityY: 0,
    rotationSpeed: 3,
    turretOffsetX: 0,
    turretOffsetY: 0,
    lastShotTime: 0,
    shotCooldown: 2000, // 2 seconds in milliseconds
    isReloading: false,
};

const keys = {};
const bullets = [];
const particles = [];
const map = {
    width: MAP_COLS * TILE_SIZE,
    height: MAP_ROWS * TILE_SIZE,
    offsetX: 0,
    offsetY: 0,
};

// Simple map data (can be expanded with different tile types)
const mapData = Array(MAP_ROWS).fill().map(() => Array(MAP_COLS).fill(0));

let mousePosition = { x: 0, y: 0 };

// Asset loading
const sprites = {
    tankBody: new Image(),
    tankTurret: new Image()
};

// Add to asset loading section
const audio = {
    tankShot: new Audio('assets/tank-shot.wav'),
    reload: new Audio('assets/reload.wav')
};

let assetsLoaded = 0;
const totalAssets = Object.keys(sprites).length;

// Load sprites
sprites.tankBody.src = 'assets/tank-body.png';
sprites.tankTurret.src = 'assets/tank-turret.png';

// Update onload handlers
Object.values(sprites).forEach(sprite => {
    sprite.onload = () => {
        assetsLoaded++;
        if (assetsLoaded === totalAssets) {
            gameLoop();
        }
    };
    sprite.onerror = (e) => {
        console.error('Failed to load sprite:', e.target.src);
    };
});

// Event listeners
document.addEventListener('keydown', (e) => keys[e.key] = true);
document.addEventListener('keyup', (e) => keys[e.key] = false);
canvas.addEventListener('mousedown', (e) => shoot(e.button));

// Update mouse position on mousemove
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mousePosition.x = e.clientX - rect.left;
    mousePosition.y = e.clientY - rect.top;
});

// Game loop
function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

// Helper function for sprite drawing with proper rotation
function drawRotatedSprite(image, dx, dy, rotation, scale = 1) {
    ctx.save();
    ctx.translate(dx, dy);
    ctx.rotate(rotation);
    ctx.drawImage(
        image,
        -image.width * scale / 2,
        -image.height * scale / 2,
        image.width * scale,
        image.height * scale
    );
    ctx.restore();
}

// Create particle system for muzzle flash
function createMuzzleFlash(x, y, angle) {
    for (let i = 0; i < 8; i++) {
        const spread = (Math.random() - 0.5) * 0.5;
        particles.push({
            x,
            y,
            angle: angle + spread,
            speed: Math.random() * 2 + 1,
            life: 1.0,
            color: `rgba(255, ${Math.random() * 100 + 155}, 0, 1)`
        });
    }
}

// Update game state
function update() {
    // Tank physics
    let accelerationX = 0;
    let accelerationY = 0;

    if (keys['w']) {
        accelerationX = Math.cos(tank.rotation * Math.PI / 180) * tank.acceleration;
        accelerationY = Math.sin(tank.rotation * Math.PI / 180) * tank.acceleration;
    }
    if (keys['s']) {
        accelerationX = -Math.cos(tank.rotation * Math.PI / 180) * tank.acceleration * 0.5;
        accelerationY = -Math.sin(tank.rotation * Math.PI / 180) * tank.acceleration * 0.5;
    }
    if (keys['a']) tank.rotation -= tank.rotationSpeed;
    if (keys['d']) tank.rotation += tank.rotationSpeed;

    // Apply physics
    tank.velocityX += accelerationX;
    tank.velocityY += accelerationY;
    
    // Apply friction
    tank.velocityX *= tank.friction;
    tank.velocityY *= tank.friction;

    // Limit speed
    const currentSpeed = Math.sqrt(tank.velocityX * tank.velocityX + tank.velocityY * tank.velocityY);
    if (currentSpeed > tank.maxSpeed) {
        const ratio = tank.maxSpeed / currentSpeed;
        tank.velocityX *= ratio;
        tank.velocityY *= ratio;
    }

    // Update position
    tank.x += tank.velocityX;
    tank.y += tank.velocityY;

    // Map boundaries
    tank.x = Math.max(tank.width/2, Math.min(map.width - tank.width/2, tank.x));
    tank.y = Math.max(tank.height/2, Math.min(map.height - tank.height/2, tank.y));

    // Update camera/map offset
    map.offsetX = Math.max(0, Math.min(tank.x - canvas.width/2, map.width - canvas.width));
    map.offsetY = Math.max(0, Math.min(tank.y - canvas.height/2, map.height - canvas.height));

    // Turret rotation - calculate angle between tank and mouse position
    const screenCenterX = canvas.width / 2;
    const screenCenterY = canvas.height / 2;
    
    // Adjust mouse position relative to tank's position
    const relativeMouseX = mousePosition.x - screenCenterX;
    const relativeMouseY = mousePosition.y - screenCenterY;
    
    // Calculate turret angle with 90-degree offset
    tank.turretAngle = Math.atan2(relativeMouseY, relativeMouseX) + Math.PI/2;

    // Update particles
    particles.forEach((particle, index) => {
        particle.x += Math.cos(particle.angle) * particle.speed;
        particle.y += Math.sin(particle.angle) * particle.speed;
        particle.life -= 0.1;
        if (particle.life <= 0) {
            particles.splice(index, 1);
        }
    });

    // Update bullets (unchanged - using original angle without offset)
    bullets.forEach((bullet, index) => {
        bullet.x += Math.cos(bullet.angle) * bullet.speed;
        bullet.y += Math.sin(bullet.angle) * bullet.speed;

        // Remove bullets out of bounds
        if (bullet.x < 0 || bullet.x > map.width || bullet.y < 0 || bullet.y > map.height) {
            bullets.splice(index, 1);
        }
    });
}

// Render game
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw tile map
    const startCol = Math.floor(map.offsetX / TILE_SIZE);
    const endCol = Math.ceil((map.offsetX + canvas.width) / TILE_SIZE);
    const startRow = Math.floor(map.offsetY / TILE_SIZE);
    const endRow = Math.ceil((map.offsetY + canvas.height) / TILE_SIZE);

    for (let row = startRow; row < endRow; row++) {
        for (let col = startCol; col < endCol; col++) {
            if (row >= 0 && row < MAP_ROWS && col >= 0 && col < MAP_COLS) {
                const x = col * TILE_SIZE - map.offsetX;
                const y = row * TILE_SIZE - map.offsetY;
                
                // Draw tile (you can add different tile types here)
                ctx.fillStyle = mapData[row][col] === 0 ? '#3a3a3a' : '#4a4a4a';
                ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                ctx.strokeStyle = '#2a2a2a';
                ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
            }
        }
    }

    // Calculate screen position
    const tankScreenX = tank.x - map.offsetX;
    const tankScreenY = tank.y - map.offsetY;

    // Draw tank body
    drawRotatedSprite(
        sprites.tankBody,
        tankScreenX,
        tankScreenY,
        (tank.rotation + 90) * Math.PI / 180,
        1.2
    );

    // Draw turret with 45-degree offset already included in turretAngle
    drawRotatedSprite(
        sprites.tankTurret,
        tankScreenX,
        tankScreenY,
        tank.turretAngle,
        1.2
    );

    // Draw bullets
    bullets.forEach(bullet => {
        ctx.fillStyle = bullet.type === 'AP' ? 'yellow' : 'red';
        ctx.beginPath();
        ctx.arc(bullet.x - map.offsetX, bullet.y - map.offsetY, 3, 0, Math.PI * 2);
        ctx.fill();
    });

    // Draw particles
    particles.forEach(particle => {
        ctx.fillStyle = particle.color.replace('1)', `${particle.life})`);
        ctx.beginPath();
        ctx.arc(
            particle.x - map.offsetX,
            particle.y - map.offsetY,
            4 * particle.life,
            0,
            Math.PI * 2
        );
        ctx.fill();
    });
}

// Shoot bullets
function shoot(button) {
    const currentTime = Date.now();
    if (currentTime - tank.lastShotTime < tank.shotCooldown) {
        return; // Still in cooldown
    }
    
    const type = button === 0 ? 'AP' : 'HE';
    const bulletOffset = 40;
    const spawnX = tank.x + Math.cos(tank.turretAngle - Math.PI/2) * bulletOffset;
    const spawnY = tank.y + Math.sin(tank.turretAngle - Math.PI/2) * bulletOffset;
    
    // Play shooting sound
    audio.tankShot.currentTime = 0;
    audio.tankShot.play();
    
    // Start reload sound after shot
    setTimeout(() => {
        audio.reload.currentTime = 0;
        audio.reload.play();
    }, 200); // Small delay after shooting
    
    // Create muzzle flash
    createMuzzleFlash(spawnX, spawnY, tank.turretAngle - Math.PI/2);
    
    bullets.push({
        x: spawnX,
        y: spawnY,
        angle: tank.turretAngle - Math.PI/2,
        speed: type === 'AP' ? 8 : 5,
        type,
    });

    tank.lastShotTime = currentTime;
    tank.isReloading = true;
    
    // Reset reloading state when cooldown is complete
    setTimeout(() => {
        tank.isReloading = false;
    }, tank.shotCooldown);
}
