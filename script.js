
const SIZE = 15;
const mazeElement = document.getElementById("maze");
const solveBtn = document.getElementById("solveBtn");
const newBtn = document.getElementById("newBtn");
const resetBtn = document.getElementById("resetBtn");

const start = 0;
const goal = SIZE * SIZE - 1;

let walls = new Set();
let timer = null;
let runId = 0;
let busy = false;

function neighbors(index) {
  const row = Math.floor(index / SIZE);
  const col = index % SIZE;
  const result = [];

  if (row > 0) result.push(index - SIZE);
  if (row < SIZE - 1) result.push(index + SIZE);
  if (col > 0) result.push(index - 1);
  if (col < SIZE - 1) result.push(index + 1);

  return result;
}

function generateMaze() {
  stopAnimation();
  walls = new Set();

  // Create random walls while keeping a guaranteed route open:
  // across the top row, then down the final column.
  for (let i = 0; i < SIZE * SIZE; i++) {
    if (i === start || i === goal) continue;

    const row = Math.floor(i / SIZE);
    const col = i % SIZE;
    const guaranteedRoute = row === 0 || col === SIZE - 1;

    if (!guaranteedRoute && Math.random() < 0.29) {
      walls.add(i);
    }
  }

  drawMaze();
  updateStats(0, 0, "Ready");
}

function drawMaze(visited = new Set(), path = new Set()) {
  mazeElement.replaceChildren();

  for (let i = 0; i < SIZE * SIZE; i++) {
    const cell = document.createElement("div");
    cell.className = "cell";

    if (walls.has(i)) cell.classList.add("wall");
    if (visited.has(i)) cell.classList.add("visited");
    if (path.has(i)) cell.classList.add("path");
    if (i === start) cell.className = "cell start";
    if (i === goal) cell.className = "cell goal";

    mazeElement.appendChild(cell);
  }
}

function findPath() {
  const queue = [start];
  let head = 0;
  const previous = new Map([[start, null]]);
  const visited = [];

  while (head < queue.length) {
    const current = queue[head++];
    visited.push(current);

    if (current === goal) break;

    for (const next of neighbors(current)) {
      if (walls.has(next) || previous.has(next)) continue;

      previous.set(next, current);
      queue.push(next);
    }
  }

  if (!previous.has(goal)) {
    return { visited, path: [] };
  }

  const path = [];
  let current = goal;

  while (current !== null) {
    path.unshift(current);
    current = previous.get(current);
  }

  return { visited, path };
}

function updateStats(visited, steps, status) {
  document.getElementById("visited").textContent = visited;
  document.getElementById("steps").textContent = steps;
  document.getElementById("status").textContent = status;
}

function stopAnimation() {
  runId++;
  if (timer !== null) clearTimeout(timer);
  timer = null;
  busy = false;
  solveBtn.disabled = false;
}

function solveMaze() {
  if (busy) return;

  stopAnimation();
  const thisRun = runId;
  busy = true;
  solveBtn.disabled = true;

  const result = findPath();
  const visitedCells = result.visited;
  const path = result.path;
  const visitedSet = new Set();
  let index = 0;

  updateStats(0, 0, "Searching");

  function animate() {
    if (thisRun !== runId) return;

    if (index < visitedCells.length) {
      visitedSet.add(visitedCells[index]);
      index++;
      drawMaze(visitedSet);
      updateStats(index, 0, "Searching");
      timer = setTimeout(animate, 25);
      return;
    }

    if (path.length === 0) {
      drawMaze(visitedSet);
      updateStats(visitedCells.length, 0, "No path");
      busy = false;
      solveBtn.disabled = false;
      timer = null;
      return;
    }

    const pathSet = new Set();
    let pathIndex = 0;

    function animatePath() {
      if (thisRun !== runId) return;

      if (pathIndex < path.length) {
        pathSet.add(path[pathIndex]);
        pathIndex++;
        drawMaze(visitedSet, pathSet);
        updateStats(visitedCells.length, pathIndex - 1, "Found!");
        timer = setTimeout(animatePath, 45);
        return;
      }

      busy = false;
      solveBtn.disabled = false;
      timer = null;
    }

    animatePath();
  }

  animate();
}

solveBtn.addEventListener("click", solveMaze);
newBtn.addEventListener("click", generateMaze);

resetBtn.addEventListener("click", () => {
  stopAnimation();
  drawMaze();
  updateStats(0, 0, "Ready");
});

generateMaze();
