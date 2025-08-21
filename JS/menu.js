const startBtn = document.getElementById("startGameBtn");
const instructionsBtn = document.getElementById("instructionsBtn");
const exitBtn = document.getElementById("exitBtn");

startBtn.addEventListener("click", () => {
  window.location.href = "game.html"; // seu arquivo do jogo
});

instructionsBtn.addEventListener("click", () => {
  window.location.href = "instrucoes.html"; // arquivo de instruções
});

exitBtn.addEventListener("click", () => {
  window.close(); // tenta fechar a aba
});
