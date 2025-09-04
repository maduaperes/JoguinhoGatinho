const startBtn = document.getElementById("startGameBtn");
const instructionsBtn = document.getElementById("instructionsBtn");
const exitBtn = document.getElementById("exitBtn");

startBtn.addEventListener("click", () => {
  window.location.href = "jogo.html";
});

instructionsBtn.addEventListener("click", () => {
  window.location.href = "instrucoes.html";
});

exitBtn.addEventListener("click", () => {
  window.close();
});
