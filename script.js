const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let basket = { x: canvas.width / 2 - 30, y: canvas.height - 40, width: 60, height: 20 };
let cats = [];
let score = 0;
let lives = 5;
let highScore = Number(localStorage.getItem("catHighScore")) || 0;
let gameRunning = false;
let fallSpeed = 2;
let spawnInterval;

let gamePaused = false;
let pauseOverlayAlpha = 0;

// Partículas
let particles = [];

// Criar partículas ao pegar gato
function createParticles(x, y) {
  for (let i = 0; i < 8; i++) {
    particles.push({
      x,
      y,
      radius: Math.random() * 4 + 2,
      color: `hsl(${Math.random() * 360}, 70%, 80%)`,
      speedX: (Math.random() - 0.5) * 3,
      speedY: (Math.random() - 1.5) * 3,
      life: 30 + Math.random() * 20,
    });
  }
}

// Atualiza e desenha partículas
function updateParticles() {
  for (let i = 0; i < particles.length; i++) {
    let p = particles[i];
    p.x += p.speedX;
    p.y += p.speedY;
    p.life--;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.fill();
    if (p.life <= 0) {
      particles.splice(i, 1);
      i--;
    }
  }
}

// Desenha cesta
function drawBasket() {
  ctx.fillStyle = "#a8c6ea";
  ctx.fillRect(basket.x, basket.y, basket.width, basket.height);
}

// Desenha gato
function drawCat(cat) {
  ctx.font = "24px Poppins";
  ctx.textAlign = "left";
  ctx.fillText("🐱", cat.x, cat.y);
}

// Atualiza gatos
function updateCats() {
  for (let i = 0; i < cats.length; i++) {
    cats[i].y += fallSpeed;

    // Pegou gato
    if (
      cats[i].y + 20 >= basket.y &&
      cats[i].x > basket.x &&
      cats[i].x < basket.x + basket.width
    ) {
      score++;
      createParticles(cats[i].x + 12, cats[i].y);
      cats.splice(i, 1);
      i--;
    }
    // Perdeu gato
    else if (cats[i].y > canvas.height) {
      cats.splice(i, 1);
      lives--;
      i--;
      if (lives <= 0) endGame();
    }
  }
}

// Spawn gato
function spawnCat() {
  let x = Math.random() * (canvas.width - 20);
  cats.push({ x, y: 0 });
}

// Atualiza score, vidas e recorde
function drawScore() {
  document.getElementById("score").innerText = score;
  document.getElementById("lives").innerText = lives;

  if (score > highScore) {
    highScore = score;
    localStorage.setItem("catHighScore", highScore);
  }
  document.getElementById("highScore").innerText = highScore;
}

// Loop principal
function gameLoop() {
  if (!gameRunning) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBasket();
  cats.forEach(drawCat);
  updateParticles();

  if (!gamePaused) {
    updateCats();
    drawScore();
    if (pauseOverlayAlpha > 0) pauseOverlayAlpha -= 0.05;
  } else {
    if (pauseOverlayAlpha < 0.6) pauseOverlayAlpha += 0.05;
    drawPauseOverlay(pauseOverlayAlpha);
  }

  requestAnimationFrame(gameLoop);
}

// Overlay de pausa
function drawPauseOverlay(alpha) {
  ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
  ctx.font = "32px Montserrat";
  ctx.textAlign = "center";
  ctx.fillText("⏸️ PAUSADO", canvas.width / 2, canvas.height / 2);
}

// Controles teclado
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && gameRunning) {
    togglePause();
  }
  if (!gameRunning || gamePaused) return;
  if (e.key === "ArrowLeft" && basket.x > 0) basket.x -= 20;
  if (e.key === "ArrowRight" && basket.x < canvas.width - basket.width) basket.x += 20;
});

// Controles mouse
canvas.addEventListener("mousemove", (e) => {
  if (!gameRunning || gamePaused) return;
  const rect = canvas.getBoundingClientRect();
  let mouseX = e.clientX - rect.left;
  basket.x = mouseX - basket.width / 2;
  if (basket.x < 0) basket.x = 0;
  if (basket.x > canvas.width - basket.width) basket.x = canvas.width - basket.width;
});

// Botões
document.getElementById("startBtn").addEventListener("click", startGame);
document.getElementById("resetBtn").addEventListener("click", resetGame);
document.getElementById("pauseBtn").addEventListener("click", togglePause);

// Pausar/despausar
function togglePause() {
  gamePaused = !gamePaused;
  document.getElementById("pauseBtn").innerText = gamePaused ? "CONTINUAR" : "PAUSAR";
}

// Funções do jogo
function startGame() {
  resetGame();
  gameRunning = true;
  spawnInterval = setInterval(spawnCat, 1500);
  gameLoop();
}

function resetGame() {
  clearInterval(spawnInterval);
  score = 0;
  lives = 5;
  cats = [];
  particles = [];
  basket.x = canvas.width / 2 - basket.width / 2;
  gamePaused = false;
  pauseOverlayAlpha = 0;
  drawScore();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBasket();
}

function endGame() {
  gameRunning = false;
  clearInterval(spawnInterval);

  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#6A1B9A";
  ctx.font = "32px Montserrat";
  ctx.textAlign = "center";
  ctx.fillText("😿 GAME OVER!", canvas.width / 2, canvas.height / 2 - 30);

  ctx.font = "20px Poppins";
  ctx.fillText(`Pontuação: ${score}`, canvas.width / 2, canvas.height / 2);

  ctx.fillStyle = "#FFCC80";
  ctx.fillRect(canvas.width / 2 - 60, canvas.height / 2 + 20, 120, 40);

  ctx.fillStyle = "#000";
  ctx.font = "18px Poppins";
  ctx.fillText("REINICIAR", canvas.width / 2, canvas.height / 2 + 48);

  canvas.addEventListener("click", clickRestart);
}

function clickRestart(e) {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  if (
    mouseX >= canvas.width / 2 - 60 &&
    mouseX <= canvas.width / 2 + 60 &&
    mouseY >= canvas.height / 2 + 20 &&
    mouseY <= canvas.height / 2 + 60
  ) {
    canvas.removeEventListener("click", clickRestart);
    startGame();
  }
}

// Inicia automaticamente
startGame();

// Atualiza o recorde
updateHighScore();

// Atualiza o recorde na tela
function updateHighScore() {
  if (score > highScore) {
    highScore = score;
    localStorage.setItem("catHighScore", highScore);
  }
  document.getElementById("highScore").innerText = highScore;
}

// Atualiza o score na tela
function drawScore() {
  document.getElementById("score").innerText = score;
  document.getElementById("lives").innerText = lives;
}