const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
const startScreen = document.getElementById("start-screen");
const gameOverScreen = document.getElementById("game-over");
const startButton = document.getElementById("start-button");
const restartButton = document.getElementById("restart-button");
const scoreDisplay = document.getElementById("score");
const healthDisplay = document.getElementById("health");
const finalScoreDisplay = document.getElementById("final-score");

let gameRunning = false;
let score = 0;
let playerHealth = 100;

const player = {
  x: canvas.width / 2 - 25,
  y: canvas.height - 100,
  width: 50,
  height: 70,
  speed: 8,
  color: "#0ff",
  shootCooldown: 0,
  shootDelay: 15,
};

let bullets = [];
let enemies = [];
let enemyBullets = [];
let particles = [];

const keys = {
  ArrowLeft: false,
  ArrowRight: false,
  Space: false,
};

window.addEventListener("keydown", (e) => {
  if (e.code in keys) {
    keys[e.code] = true;
    e.preventDefault();
  }
});

window.addEventListener("keyup", (e) => {
  if (e.code in keys) {
    keys[e.code] = false;
  }
});

startButton.addEventListener("click", startGame);
restartButton.addEventListener("click", startGame);

function startGame() {
  gameRunning = true;
  score = 0;
  playerHealth = 100;
  player.x = canvas.width / 2 - 25;
  bullets = [];
  enemies = [];
  enemyBullets = [];
  particles = [];

  startScreen.style.display = "none";
  gameOverScreen.style.display = "none";

  updateScore();
  updateHealth();

  gameLoop();
}

function gameLoop() {
  if (!gameRunning) return;

  clearCanvas();
  updatePlayer();
  updateBullets();
  updateEnemies();
  updateEnemyBullets();
  updateParticles();
  checkCollisions();
  spawnEnemies();

  requestAnimationFrame(gameLoop);
}

function clearCanvas() {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#fff";
  for (let i = 0; i < 100; i++) {
    const x = (Math.sin(i * 123.45) * canvas.width) / 2 + canvas.width / 2;
    const y = (Math.cos(i * 67.89) * canvas.height) / 2 + canvas.height / 2;
    const size = Math.random() * 2;
    ctx.fillRect(x, y, size, size);
  }
}

function updatePlayer() {
  if (keys.ArrowLeft && player.x > 0) {
    player.x -= player.speed;
  }
  if (keys.ArrowRight && player.x < canvas.width - player.width) {
    player.x += player.speed;
  }

  if (player.shootCooldown > 0) {
    player.shootCooldown--;
  }

  if (keys.Space && player.shootCooldown === 0) {
    shoot();
    player.shootCooldown = player.shootDelay;
  }

  ctx.fillStyle = player.color;
  ctx.beginPath();
  ctx.moveTo(player.x + player.width / 2, player.y);
  ctx.lineTo(player.x + player.width, player.y + player.height);
  ctx.lineTo(player.x, player.y + player.height);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#f0f";
  ctx.beginPath();
  ctx.ellipse(
    player.x + player.width / 2,
    player.y + player.height + 5,
    10,
    15,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
}

function shoot() {
  bullets.push({
    x: player.x + player.width / 2 - 2.5,
    y: player.y,
    width: 5,
    height: 15,
    speed: 10,
    color: "#0ff",
  });
}

function updateBullets() {
  for (let i = bullets.length - 1; i >= 0; i--) {
    const bullet = bullets[i];
    bullet.y -= bullet.speed;

    if (bullet.y + bullet.height < 0) {
      bullets.splice(i, 1);
      continue;
    }

    ctx.fillStyle = bullet.color;
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

    ctx.fillStyle = "rgba(0, 255, 255, 0.5)";
    ctx.fillRect(bullet.x, bullet.y + bullet.height, bullet.width, 10);
  }
}

function spawnEnemies() {
  if (Math.random() < 0.02) {
    const x = Math.random() * (canvas.width - 40);
    enemies.push({
      x: x,
      y: -40,
      width: 40,
      height: 40,
      speed: 2 + Math.random() * 2,
      color: "#f00",
      shootDelay: 60 + Math.floor(Math.random() * 60),
      shootTimer: 0,
    });
  }
}

function updateEnemies() {
  for (let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i];
    enemy.y += enemy.speed;

    if (enemy.y > canvas.height) {
      enemies.splice(i, 1);
      continue;
    }

    enemy.shootTimer++;
    if (enemy.shootTimer >= enemy.shootDelay) {
      enemyBullets.push({
        x: enemy.x + enemy.width / 2 - 2.5,
        y: enemy.y + enemy.height,
        width: 5,
        height: 15,
        speed: 5,
        color: "#f00",
      });
      enemy.shootTimer = 0;
    }

    ctx.fillStyle = enemy.color;
    ctx.beginPath();
    ctx.moveTo(enemy.x + enemy.width / 2, enemy.y + enemy.height);
    ctx.lineTo(enemy.x + enemy.width, enemy.y);
    ctx.lineTo(enemy.x, enemy.y);
    ctx.closePath();
    ctx.fill();
  }
}

function updateEnemyBullets() {
  for (let i = enemyBullets.length - 1; i >= 0; i--) {
    const bullet = enemyBullets[i];
    bullet.y += bullet.speed;

    if (bullet.y > canvas.height) {
      enemyBullets.splice(i, 1);
      continue;
    }

    ctx.fillStyle = bullet.color;
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

    ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
    ctx.fillRect(bullet.x, bullet.y - 10, bullet.width, 10);
  }
}

function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const particle = particles[i];
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.life--;

    if (particle.life <= 0) {
      particles.splice(i, 1);
      continue;
    }

    ctx.fillStyle = `rgba(${particle.color}, ${particle.life / 30})`;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function createExplosion(x, y, color) {
  for (let i = 0; i < 30; i++) {
    particles.push({
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * 5,
      vy: (Math.random() - 0.5) * 5,
      size: Math.random() * 3 + 1,
      color: color,
      life: 30,
    });
  }
}

function checkCollisions() {
  for (let i = bullets.length - 1; i >= 0; i--) {
    for (let j = enemies.length - 1; j >= 0; j--) {
      if (checkRectCollision(bullets[i], enemies[j])) {
        createExplosion(
          enemies[j].x + enemies[j].width / 2,
          enemies[j].y + enemies[j].height / 2,
          "255, 100, 0"
        );
        score += 100;
        updateScore();
        bullets.splice(i, 1);
        enemies.splice(j, 1);
        break;
      }
    }
  }

  for (let i = enemyBullets.length - 1; i >= 0; i--) {
    if (checkRectCollision(enemyBullets[i], player)) {
      createExplosion(player.x + player.width / 2, player.y, "0, 200, 255");
      playerHealth -= 10;
      updateHealth();
      enemyBullets.splice(i, 1);

      if (playerHealth <= 0) {
        gameOver();
      }
    }
  }

  for (let i = enemies.length - 1; i >= 0; i--) {
    if (checkRectCollision(enemies[i], player)) {
      createExplosion(player.x + player.width / 2, player.y, "0, 200, 255");
      createExplosion(
        enemies[i].x + enemies[i].width / 2,
        enemies[i].y + enemies[i].height / 2,
        "255, 100, 0"
      );
      playerHealth -= 20;
      updateHealth();
      enemies.splice(i, 1);

      if (playerHealth <= 0) {
        gameOver();
      }
    }
  }
}

function checkRectCollision(rect1, rect2) {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
}

function updateScore() {
  scoreDisplay.textContent = `Score: ${score}`;
}

function updateHealth() {
  healthDisplay.textContent = `Health: ${playerHealth}`;
}

function gameOver() {
  gameRunning = false;
  finalScoreDisplay.textContent = `Score: ${score}`;
  gameOverScreen.style.display = "flex";
}
