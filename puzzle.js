const pieceCount = 36;
const gridSize = 6;
const puzzle = document.querySelector("#puzzle");
const progress = document.querySelector("#progress");
const message = document.querySelector("#message");
const shuffleButton = document.querySelector("#shuffle-button");
const solutionButton = document.querySelector("#solution-button");

let arrangement = Array.from({ length: pieceCount }, (_, index) => index);
let selectedSlot = null;
let draggedSlot = null;

function shufflePieces() {
  do {
    for (let index = arrangement.length - 1; index > 0; index -= 1) {
      const otherIndex = Math.floor(Math.random() * (index + 1));
      [arrangement[index], arrangement[otherIndex]] = [
        arrangement[otherIndex],
        arrangement[index],
      ];
    }
  } while (arrangement.every((piece, index) => piece === index));

  selectedSlot = null;
  message.textContent = "";
  renderPuzzle();
}

function showSolution() {
  arrangement = Array.from({ length: pieceCount }, (_, index) => index);
  selectedSlot = null;
  renderPuzzle();
}

function placedPieces() {
  return arrangement.reduce(
    (total, piece, slot) => total + Number(piece === slot),
    0
  );
}

function updateStatus() {
  const placed = placedPieces();
  progress.textContent = `${placed} de ${pieceCount} piezas en su sitio`;

  if (placed === pieceCount) {
    puzzle.classList.add("is-complete");
    message.textContent = "¡Muy bien! Has completado el rompecabezas.";
  } else {
    puzzle.classList.remove("is-complete");
  }
}

function renderPuzzle() {
  const fragment = document.createDocumentFragment();

  arrangement.forEach((piece, slot) => {
    const row = Math.floor(piece / gridSize);
    const column = piece % gridSize;
    const button = document.createElement("button");
    button.className = "piece";
    button.type = "button";
    button.draggable = true;
    button.dataset.slot = String(slot);
    button.setAttribute(
      "aria-label",
      `Pieza ${piece + 1} de ${pieceCount}, posición ${slot + 1}`
    );
    button.style.backgroundPosition = `${column * 20}% ${row * 20}%`;

    if (slot === selectedSlot) {
      button.classList.add("is-selected");
    }

    fragment.append(button);
  });

  puzzle.replaceChildren(fragment);
  updateStatus();
}

function swapPieces(firstSlot, secondSlot) {
  if (firstSlot === secondSlot) {
    selectedSlot = null;
    renderPuzzle();
    return;
  }

  [arrangement[firstSlot], arrangement[secondSlot]] = [
    arrangement[secondSlot],
    arrangement[firstSlot],
  ];
  selectedSlot = null;
  renderPuzzle();
}

puzzle.addEventListener("click", (event) => {
  const piece = event.target.closest(".piece");
  if (!piece || puzzle.classList.contains("is-complete")) {
    return;
  }

  const slot = Number(piece.dataset.slot);
  if (selectedSlot === null) {
    selectedSlot = slot;
    renderPuzzle();
  } else {
    swapPieces(selectedSlot, slot);
  }
});

puzzle.addEventListener("dragstart", (event) => {
  const piece = event.target.closest(".piece");
  if (!piece || puzzle.classList.contains("is-complete")) {
    event.preventDefault();
    return;
  }

  draggedSlot = Number(piece.dataset.slot);
  piece.classList.add("is-dragging");
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", String(draggedSlot));
});

puzzle.addEventListener("dragover", (event) => {
  if (event.target.closest(".piece")) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }
});

puzzle.addEventListener("drop", (event) => {
  const target = event.target.closest(".piece");
  if (!target || draggedSlot === null || puzzle.classList.contains("is-complete")) {
    return;
  }

  event.preventDefault();
  const targetSlot = Number(target.dataset.slot);
  swapPieces(draggedSlot, targetSlot);
  draggedSlot = null;
});

puzzle.addEventListener("dragend", () => {
  draggedSlot = null;
  puzzle.querySelector(".is-dragging")?.classList.remove("is-dragging");
  puzzle.querySelector(".is-target")?.classList.remove("is-target");
});

puzzle.addEventListener("dragenter", (event) => {
  const target = event.target.closest(".piece");
  if (target) {
    target.classList.add("is-target");
  }
});

puzzle.addEventListener("dragleave", (event) => {
  event.target.closest(".piece")?.classList.remove("is-target");
});

shuffleButton.addEventListener("click", shufflePieces);
solutionButton.addEventListener("click", showSolution);

renderPuzzle();
shufflePieces();
shuffleButton.disabled = false;
