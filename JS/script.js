// ELEMENTOS
const backBtn = document.getElementById("backBtn");
const gameContainer = document.getElementById("gameContainer");
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// VARIÁVEIS DO JOGO
let scale = 1;
let basket = { x: 0, y: 0, width: 60, height: 20 };
let items = [];
let score = 0;
let lives = 5;
let highScore = Number(localStorage.getItem("catHighScore")) || 0;
let gameRunning = false;
let baseFallSpeed = 0.8;
let fallSpeed = baseFallSpeed;
let spawnRate = 1800;
let minSpawnRate = 400;
let spawnInterval;
let gamePaused = false;
let pauseOverlayAlpha = 0;
let particles = [];

// ====================== RESPONSIVIDADE ======================
function resizeCanvas() {
  const containerWidth = gameContainer.clientWidth;
  scale = containerWidth / 440; // Ajustado para largura do container
  canvas.width = 400 * scale;
  canvas.height = 600 * scale;

  basket.width = 60 * scale;
  basket.height = 20 * scale;
  basket.x = canvas.width / 2 - basket.width / 2;
  basket.y = canvas.height - basket.height - 20;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBasket();
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// ====================== BOTÃO VOLTAR ======================
backBtn.addEventListener("click", () => {
  window.location.href = "index.html";
});

// ====================== PARTÍCULAS ======================
function createParticles(x, y, type) {
  let colorBase = type === "cat" ? "hsl(330,70%,80%)" :
                  type === "fish" ? "hsl(200,70%,70%)" :
                  "hsl(0,80%,60%)";

  for (let i = 0; i < 10; i++) {
    particles.push({
      x, y,
      radius: Math.random() * 4 * scale + 2 * scale,
      color: colorBase,
      speedX: (Math.random() - 0.5) * 3 * scale,
      speedY: (Math.random() - 1.5) * 3 * scale,
      life: 30 + Math.random() * 20
    });
  }
}

function updateParticles() {
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    p.x += p.speedX;
    p.y += p.speedY;
    p.life--;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI*2);
    ctx.fillStyle = p.color;
    ctx.fill();
    if (p.life <= 0) { particles.splice(i,1); i--; }
  }
}

// ====================== CESTA ======================
function drawBasket() {
  ctx.fillStyle = "#a8c6ea";
  ctx.fillRect(basket.x, basket.y, basket.width, basket.height);
}

// ====================== ITENS ======================
function drawItem(item) {
  ctx.font = `${24*scale}px Poppins`;
  ctx.textAlign = "left";
  const emoji = item.type === "cat" ? "🐱" :
                item.type === "fish" ? "🐟" :
                "💣";
  ctx.fillText(emoji, item.x, item.y);
}

// ====================== SPAWN ALEATÓRIO ======================
function spawnItem() {
  const x = Math.random() * (canvas.width - 20*scale);
  const speed = fallSpeed + Math.random() * 0.8;
  const r = Math.random();
  const type = r < 0.25 ? "bomb" : r < 0.4 ? "fish" : "cat";
  items.push({ x, y: 0, speed, type });
}

// ====================== HUD ======================
function drawScore() {
  document.getElementById("score").innerText = score;
  document.getElementById("lives").innerText = lives;
  if(score > highScore) {
    highScore = score;
    localStorage.setItem("catHighScore", highScore);
  }
  document.getElementById("highScore").innerText = highScore;
}

// ====================== DIFICULDADE ======================
function updateDifficulty() {
  fallSpeed = baseFallSpeed + score*0.05;
  const newRate = Math.max(minSpawnRate, 1800 - score*15);
  if(newRate !== spawnRate) {
    clearInterval(spawnInterval);
    spawnInterval = setInterval(spawnItem, newRate);
    spawnRate = newRate;
  }
}

// ====================== ATUALIZA ITENS ======================
function updateItems() {
  const itemWidth = 20*scale;
  for(let i=0; i<items.length; i++) {
    items[i].y += items[i].speed * scale;

    if(items[i].y + 20*scale >= basket.y &&
       items[i].x + itemWidth > basket.x &&
       items[i].x < basket.x + basket.width) {

      if(items[i].type === "cat") { score++; createParticles(items[i].x + 12*scale, items[i].y, "cat"); }
      else if(items[i].type === "fish") { score+=2; createParticles(items[i].x + 12*scale, items[i].y, "fish"); }
      else { lives--; createParticles(items[i].x + 12*scale, items[i].y, "bomb"); if(lives<=0) endGame(); }

      items.splice(i,1); i--;
    }
    else if(items[i].y > canvas.height) {
      if(items[i].type === "cat") { lives--; if(lives<=0) endGame(); }
      items.splice(i,1); i--;
    }
  }
  if(score>0) updateDifficulty();
}

// ====================== LOOP PRINCIPAL ======================
function gameLoop() {
  if(!gameRunning) return;
  ctx.clearRect(0,0,canvas.width,canvas.height);
  drawBasket();
  items.forEach(drawItem);
  updateParticles();

  if(!gamePaused) {
    updateItems();
    drawScore();
    if(pauseOverlayAlpha>0) pauseOverlayAlpha-=0.05;
  } else {
    if(pauseOverlayAlpha<0.6) pauseOverlayAlpha+=0.05;
    drawPauseOverlay(pauseOverlayAlpha);
  }

  requestAnimationFrame(gameLoop);
}

// ====================== OVERLAY PAUSA ======================
function drawPauseOverlay(alpha) {
  ctx.fillStyle = `rgba(0,0,0,${alpha})`;
  ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle = `rgba(255,255,255,${alpha})`;
  ctx.font = `${32*scale}px Montserrat`;
  ctx.textAlign = "center";
  ctx.fillText("⏸️ PAUSADO", canvas.width/2, canvas.height/2);
}

// ====================== CONTROLES ======================
document.addEventListener("keydown", e => {
  if(e.key==="Escape" && gameRunning) togglePause();
  if(!gameRunning || gamePaused) return;
  if(e.key==="ArrowLeft" && basket.x>0) basket.x-=20*scale;
  if(e.key==="ArrowRight" && basket.x<canvas.width-basket.width) basket.x+=20*scale;
});

function moveBasket(clientX) {
  if(!gameRunning || gamePaused) return;
  const rect = canvas.getBoundingClientRect();
  let mouseX = (clientX - rect.left) * (canvas.width / rect.width);
  basket.x = mouseX - basket.width/2;
  if(basket.x<0) basket.x=0;
  if(basket.x>canvas.width-basket.width) basket.x=canvas.width-basket.width;
}

document.addEventListener("mousemove", e => moveBasket(e.clientX));
document.addEventListener("touchmove", e => { e.preventDefault(); moveBasket(e.touches[0].clientX); }, { passive:false });
document.addEventListener("click", e => moveBasket(e.clientX));
document.addEventListener("touchstart", e => moveBasket(e.touches[0].clientX));

// ====================== BOTÕES ======================
document.getElementById("startBtn").addEventListener("click", startGame);
document.getElementById("resetBtn").addEventListener("click", resetGame);
document.getElementById("pauseBtn").addEventListener("click", togglePause);

// ====================== FUNÇÕES PRINCIPAIS ======================
function togglePause() {
  gamePaused = !gamePaused;
  document.getElementById("pauseBtn").innerText = gamePaused ? "CONTINUAR" : "PAUSAR";
}

function startGame() {
  resetGame();
  gameRunning = true;
  spawnInterval = setInterval(spawnItem, spawnRate);
  gameLoop();
}

function resetGame() {
  clearInterval(spawnInterval);
  score=0;
  lives=5;
  items=[];
  particles=[];
  basket.x = canvas.width/2 - basket.width/2;
  gamePaused=false;
  pauseOverlayAlpha=0;
  fallSpeed=baseFallSpeed;
  spawnRate=1800;
  drawScore();
  ctx.clearRect(0,0,canvas.width,canvas.height);
  drawBasket();
  document.getElementById("pauseBtn").innerText="PAUSAR";
}

function endGame() {
  gameRunning=false;
  clearInterval(spawnInterval);
  ctx.fillStyle="rgba(255,255,255,0.9)";
  ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle="#6A1B9A";
  ctx.font=`${32*scale}px Montserrat`;
  ctx.textAlign="center";
  ctx.fillText("😿 GAME OVER!", canvas.width/2, canvas.height/2-30);
  ctx.font=`${20*scale}px Poppins`;
  ctx.fillText(`Pontuação: ${score}`, canvas.width/2, canvas.height/2);
  ctx.fillStyle="#FFCC80";
  ctx.fillRect(canvas.width/2-60*scale, canvas.height/2+20*scale, 120*scale, 40*scale);
  ctx.fillStyle="#000";
  ctx.font=`${18*scale}px Poppins`;
  ctx.fillText("REINICIAR", canvas.width/2, canvas.height/2+48*scale);

  canvas.removeEventListener("click", clickRestart);
  canvas.addEventListener("click", clickRestart);
}

function clickRestart(e) {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  if(mouseX>=canvas.width/2-60*scale && mouseX<=canvas.width/2+60*scale &&
     mouseY>=canvas.height/2+20*scale && mouseY<=canvas.height/2+60*scale) {
       canvas.removeEventListener("click", clickRestart);
       startGame();
  }
}
