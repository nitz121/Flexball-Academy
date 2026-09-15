const levels = [
  { team: "Real Madrid", formation: "The Defensive Line", instruction: "Protect the bottom goal. Put the four defenders side by side, centred directly in front of the goal.", players: ["Iker Casillas", "Sergio Ramos", "Pepe", "Marcelo"], answer: { flexDirection: "row", justifyContent: "center", alignItems: "flex-end", flexWrap: "nowrap" } },
  { team: "Barcelona", formation: "The Midfield Spine", instruction: "Build a route through the centre. Stack the midfielders vertically and keep the whole group in the centre of the pitch.", players: ["Sergio Busquets", "Xavi", "Andrés Iniesta", "Pedri"], answer: { flexDirection: "column", justifyContent: "center", alignItems: "center", flexWrap: "nowrap" } },
  { team: "Bayern Munich", formation: "Wide Midfield", instruction: "Cover the full width at the halfway line. Keep one horizontal line, centred vertically, with equal space between every player.", players: ["Philipp Lahm", "Bastian Schweinsteiger", "Thomas Müller", "Franck Ribéry"], answer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", flexWrap: "nowrap" } },
  { team: "Liverpool", formation: "High Press", instruction: "Press near the opponent's top goal. Place the attackers side by side in the top-left corner of the pitch.", players: ["Mohamed Salah", "Sadio Mané", "Roberto Firmino"], answer: { flexDirection: "row", justifyContent: "flex-start", alignItems: "flex-start", flexWrap: "nowrap" } },
  { team: "Manchester City", formation: "Substitute Bench", instruction: "The substitutes are ready. Centre the group and allow players who do not fit on the first line to continue onto more lines.", players: ["Kevin De Bruyne", "David Silva", "Sergio Agüero", "Vincent Kompany", "Rodri", "Erling Haaland", "Bernardo Silva", "Rúben Dias", "Yaya Touré", "Ilkay Gündoğan", "Ederson", "John Stones", "Raheem Sterling", "Riyad Mahrez", "João Cancelo", "Kyle Walker", "Aymeric Laporte", "Phil Foden"], answer: { flexDirection: "row", justifyContent: "center", alignItems: "center", flexWrap: "wrap" } },
  { team: "Paris Saint-Germain", formation: "The Counter-Attack", instruction: "Break from our bottom goal towards the opponent's top goal. Create a central vertical column with equal space between every player.", players: ["Kylian Mbappé", "Neymar", "Lionel Messi", "Thiago Silva", "Marco Verratti"], answer: { flexDirection: "column", justifyContent: "space-evenly", alignItems: "center", flexWrap: "nowrap" } },
  { team: "Inter Milan", formation: "Left-Flank Build-Up", instruction: "Start the attack from the bottom-left side. Put the players in a vertical column along the left edge, beginning at our goal.", players: ["Javier Zanetti", "Wesley Sneijder", "Diego Milito", "Samuel Eto'o"], answer: { flexDirection: "column", justifyContent: "flex-end", alignItems: "flex-start", flexWrap: "nowrap" } },
  { team: "AC Milan", formation: "Late Runners", instruction: "Send midfield runners towards the top of the pitch. Use one row, spread them with space around each player, and keep the line at the opponent's end.", players: ["Paolo Maldini", "Andrea Pirlo", "Kaká", "Clarence Seedorf"], answer: { flexDirection: "row", justifyContent: "space-around", alignItems: "flex-start", flexWrap: "nowrap" } },
  { team: "Juventus", formation: "Goal-Front Attack", instruction: "Attack the opponent's goal from a wide front. Place a single row along the top of the pitch with equal space around every forward.", players: ["Gianluigi Buffon", "Alessandro Del Piero", "Pavel Nedvěd", "David Trezeguet"], answer: { flexDirection: "row", justifyContent: "space-evenly", alignItems: "flex-start", flexWrap: "nowrap" } },
  { team: "Arsenal", formation: "Flexible Final Drill", instruction: "Create a flexible attacking group in the top half. Keep the players spread with space around them, aligned at the opponent's end, and let the extra players wrap onto another line.", players: ["Thierry Henry", "Patrick Vieira", "Dennis Bergkamp", "Robert Pirès", "Cesc Fàbregas", "Robin van Persie", "Bukayo Saka", "Martin Ødegaard", "David Seaman", "Tony Adams", "Ashley Cole", "Freddie Ljungberg", "Sol Campbell", "Gilberto Silva"], answer: { flexDirection: "row", justifyContent: "space-around", alignItems: "flex-start", flexWrap: "wrap" } }
];

const teamColours = ["#ffffff", "#a50044", "#dc052d", "#c8102e", "#6cabdd", "#004170", "#0068a8", "#c4122e", "#111111", "#e30613"];

const storageKey = "flexball-progress-v1";
const field = document.querySelector("#field");
const controls = document.querySelector("#controls");
const feedback = document.querySelector("#feedback");
const checkButton = document.querySelector("#check-button");
const resetButton = document.querySelector("#reset-button");
const nextButton = document.querySelector("#next-button");
const introScreen = document.querySelector("#intro-screen");
const startButton = document.querySelector("#start-button");
const completionScreen = document.querySelector("#completion-screen");
const restartButton = document.querySelector("#restart-button");
const restartGameButton = document.querySelector("#restart-game-button");
const levelButtons = document.querySelector("#level-buttons");

function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (saved && Array.isArray(saved.attempts) && Array.isArray(saved.completed)) return saved;
  } catch (_) { /* Invalid saved data starts a fresh game. */ }
  return { currentLevel: 0, score: 0, attempts: Array(levels.length).fill(0), completed: Array(levels.length).fill(false), selections: {} };
}

let progress = loadProgress();
progress.currentLevel = Math.min(Math.max(progress.currentLevel || 0, 0), levels.length - 1);
progress.attempts = levels.map((_, index) => progress.attempts[index] || 0);
progress.completed = levels.map((_, index) => Boolean(progress.completed[index]));

function saveProgress() { localStorage.setItem(storageKey, JSON.stringify(progress)); }
function defaultValues() { return { flexDirection: "row", justifyContent: "flex-start", alignItems: "flex-start", flexWrap: "nowrap" }; }
function selectedValues() { return Object.fromEntries(new FormData(controls)); }
function applyLayout() { Object.assign(field.style, selectedValues()); }
function clearFeedback() { feedback.textContent = ""; feedback.className = "feedback"; nextButton.classList.add("hidden"); }
function highestUnlocked() { const next = progress.completed.findIndex(done => !done); return next === -1 ? levels.length - 1 : next; }

function renderLevelButtons() {
  const unlocked = highestUnlocked();
  levelButtons.innerHTML = levels.map((level, index) => {
    const classes = `level-button${progress.completed[index] ? " is-complete" : ""}${index === progress.currentLevel ? " is-current" : ""}`;
    return `<button class="${classes}" type="button" data-level="${index}" ${index > unlocked ? "disabled" : ""} aria-label="${level.team}, level ${index + 1}">${index + 1}</button>`;
  }).join("");
}

function renderLevel() {
  const level = levels[progress.currentLevel];
  document.querySelector("#level-label").textContent = `Level ${progress.currentLevel + 1} of ${levels.length}`;
  document.querySelector("#score-label").textContent = `Score: ${progress.score}`;
  document.querySelector("#progress-bar").style.width = `${((progress.currentLevel + 1) / levels.length) * 100}%`;
  document.querySelector("#level-title").textContent = level.team;
  document.querySelector("#team-name").textContent = `${level.formation} · Attempts: ${progress.attempts[progress.currentLevel]}`;
  document.querySelector("#instruction").textContent = level.instruction;
  field.style.setProperty("--team-color", teamColours[progress.currentLevel]);
  const markings = `<div class="halfway-line" aria-hidden="true"></div><div class="centre-circle" aria-hidden="true"></div><div class="penalty-area penalty-area--top" aria-hidden="true"></div><div class="penalty-area penalty-area--bottom" aria-hidden="true"></div><div class="goal goal--top" aria-hidden="true"></div><div class="goal goal--bottom" aria-hidden="true"></div>`;
  field.innerHTML = markings + level.players.map(name => `<span class="player" aria-label="${name}"><span class="player-name">${name}</span></span>`).join("");
  const values = progress.selections?.[progress.currentLevel] || defaultValues();
  for (const [name, value] of Object.entries(values)) controls.elements[name].value = value;
  clearFeedback();
  if (progress.completed[progress.currentLevel]) { feedback.textContent = "Completed — choose another unlocked level from the Training Ground."; feedback.className = "feedback success"; }
  applyLayout();
  renderLevelButtons();
  saveProgress();
}

controls.addEventListener("input", () => {
  progress.selections ??= {};
  progress.selections[progress.currentLevel] = selectedValues();
  clearFeedback(); applyLayout(); saveProgress();
});
resetButton.addEventListener("click", () => { progress.selections ??= {}; progress.selections[progress.currentLevel] = defaultValues(); renderLevel(); });
checkButton.addEventListener("click", () => {
  if (progress.completed[progress.currentLevel]) return;
  progress.attempts[progress.currentLevel] += 1;
  const correct = Object.entries(levels[progress.currentLevel].answer).every(([key, value]) => selectedValues()[key] === value);
  document.querySelector("#team-name").textContent = `${levels[progress.currentLevel].formation} · Attempts: ${progress.attempts[progress.currentLevel]}`;
  if (correct) {
    progress.completed[progress.currentLevel] = true;
    const points = Math.max(50, 150 - (progress.attempts[progress.currentLevel] - 1) * 20);
    progress.score += points;
    document.querySelector("#score-label").textContent = `Score: ${progress.score}`;
    feedback.textContent = `Great work! Formation correct. You earned ${points} points.`;
    feedback.className = "feedback success";
    if (progress.currentLevel < levels.length - 1) nextButton.classList.remove("hidden");
    else { document.querySelector("#final-score").textContent = `Final score: ${progress.score} · Total attempts: ${progress.attempts.reduce((sum, value) => sum + value, 0)}`; completionScreen.classList.remove("is-hidden"); restartButton.focus(); }
    renderLevelButtons();
  } else { feedback.textContent = "Not quite. Check the direction, alignment, spacing, and wrapping, then try again."; feedback.className = "feedback error"; }
  saveProgress();
});
nextButton.addEventListener("click", () => { progress.currentLevel += 1; renderLevel(); });
levelButtons.addEventListener("click", event => { const button = event.target.closest("[data-level]"); if (!button || button.disabled) return; progress.currentLevel = Number(button.dataset.level); renderLevel(); });
startButton.addEventListener("click", () => { introScreen.classList.add("is-hidden"); checkButton.focus(); });
function restartAcademy() {
  progress = { currentLevel: 0, score: 0, attempts: Array(levels.length).fill(0), completed: Array(levels.length).fill(false), selections: {} };
  completionScreen.classList.add("is-hidden");
  renderLevel();
  checkButton.focus();
}
restartButton.addEventListener("click", restartAcademy);
restartGameButton.addEventListener("click", restartAcademy);

renderLevel();
