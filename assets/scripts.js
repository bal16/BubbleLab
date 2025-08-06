// DOM Elements
const visualizer = document.getElementById("visualizer");
const generateBtn = document.getElementById("generateBtn");
const sortBtn = document.getElementById("sortBtn");
const playPauseBtn = document.getElementById("playPauseBtn");
const stopBtn = document.getElementById("stopBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const sizeSlider = document.getElementById("sizeSlider");
const speedSlider = document.getElementById("speedSlider");
const sizeValue = document.getElementById("sizeValue");
const speedValue = document.getElementById("speedValue");
const status = document.getElementById("status");
const historyLog = document.getElementById("historyLog");
const themeToggle = document.getElementById("themeToggle");
const playPauseText = document.getElementById("playPauseText");
const playIcon = document.getElementById("playIcon");
const pauseIcon = document.getElementById("pauseIcon");

// State
let array = [];
let sortHistory = [];
let currentStep = -1;
let isSorting = false;
let isPaused = false;

const PRIMARY_COLOR = "bar-primary";
const COMPARE_COLOR = "bar-compare";
const SWAP_COLOR = "bar-swap";
const SORTED_COLOR = "bar-sorted";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function generateArray() {
  if (isSorting) return;
  array = [];
  historyLog.innerHTML = ""; // Clear log
  const size = sizeSlider.value;
  for (let i = 0; i < size; i++) {
    array.push(Math.floor(Math.random() * 95) + 5);
  }
  drawBars(array);
  status.textContent = 'Array baru telah dibuat. Tekan "Mulai Urutkan".';
  sortBtn.disabled = false;
}

function drawBars(currentArray, indices = {}) {
  visualizer.innerHTML = "";
  for (let i = 0; i < currentArray.length; i++) {
    const bar = document.createElement("div");
    bar.style.height = `${currentArray[i]}%`;
    bar.classList.add("bar");

    if (indices.sorted && i >= indices.sorted) {
      bar.classList.add(SORTED_COLOR);
    } else if (
      indices.swap &&
      (i === indices.swap[0] || i === indices.swap[1])
    ) {
      bar.classList.add(SWAP_COLOR);
    } else if (
      indices.compare &&
      (i === indices.compare[0] || i === indices.compare[1])
    ) {
      bar.classList.add(COMPARE_COLOR);
    } else {
      bar.classList.add(PRIMARY_COLOR);
    }
    visualizer.appendChild(bar);
  }
}

function prepareSortHistory() {
  let tempArray = [...array];
  sortHistory = [];
  currentStep = -1;
  const n = tempArray.length;

  sortHistory.push({
    arrayState: [...tempArray],
    indices: {},
    statusText: "Array awal. Animasi dimulai...",
  });

  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - i - 1; j++) {
      sortHistory.push({
        arrayState: [...tempArray],
        indices: { compare: [j, j + 1], sorted: n - i },
        statusText: `Membandingkan ${tempArray[j]} dan ${tempArray[j + 1]}`,
      });

      if (tempArray[j] > tempArray[j + 1]) {
        swapped = true;
        sortHistory.push({
          arrayState: [...tempArray],
          indices: { swap: [j, j + 1], sorted: n - i },
          statusText: `Menukar ${tempArray[j]} dengan ${tempArray[j + 1]}`,
        });
        [tempArray[j], tempArray[j + 1]] = [tempArray[j + 1], tempArray[j]];
      }
    }
    sortHistory.push({
      arrayState: [...tempArray],
      indices: { sorted: n - i - 1 },
      statusText: `Iterasi ke-${i + 1} selesai.`,
    });
    if (!swapped) break;
  }
  sortHistory.push({
    arrayState: [...tempArray],
    indices: { sorted: 0 },
    statusText: "Pengurutan Selesai!",
  });
}

async function startSort() {
  if (isSorting) return;
  isSorting = true;
  isPaused = false;
  historyLog.innerHTML = ""; // Clear log on new sort
  toggleMainControls(false);

  prepareSortHistory();

  while (currentStep < sortHistory.length - 1 && isSorting) {
    if (!isPaused) {
      currentStep++;
      renderStep(currentStep);
      updateStepButtons();
      await sleep(speedSlider.value);
    } else {
      await sleep(100);
    }
  }

  if (isSorting) {
    finishSorting();
  }
}

function renderStep(stepIndex) {
  if (stepIndex < 0 || stepIndex >= sortHistory.length) return;
  const step = sortHistory[stepIndex];
  drawBars(step.arrayState, step.indices);
  status.textContent = step.statusText;
  updateHistoryLog(stepIndex);
}

function updateHistoryLog(toStep) {
  historyLog.innerHTML = ""; // Clear and rebuild log up to current step
  for (let i = 0; i <= toStep; i++) {
    const step = sortHistory[i];
    if (i > 0) {
      // Don't log the initial state text
      const logEntry = document.createElement("p");
      logEntry.textContent = `[${i}] ${step.statusText}`;
      historyLog.appendChild(logEntry);
    }
  }
  historyLog.scrollTop = historyLog.scrollHeight; // Auto-scroll
}

function handlePlayPause() {
  isPaused = !isPaused;
  playPauseText.textContent = isPaused ? "Play" : "Pause";
  playIcon.style.display = isPaused ? "block" : "none";
  pauseIcon.style.display = isPaused ? "none" : "block";

  nextBtn.disabled = !isPaused;
  prevBtn.disabled = !isPaused || currentStep <= 0;
  if (isPaused) {
    status.textContent = "Dijeda. Gunakan tombol navigasi atau Play.";
  } else {
    status.textContent = "Melanjutkan...";
  }
}

function handleNext() {
  if (isPaused && currentStep < sortHistory.length - 1) {
    currentStep++;
    renderStep(currentStep);
    updateStepButtons();
  }
}

function handlePrev() {
  if (isPaused && currentStep > 0) {
    currentStep--;
    renderStep(currentStep);
    updateStepButtons();
  }
}

function handleStop() {
  isSorting = false;
  isPaused = false;
  sortHistory = [];
  currentStep = -1;
  generateArray();
  toggleMainControls(true);
}

function finishSorting() {
  isSorting = false;
  isPaused = false;
  toggleMainControls(true);
}

function toggleMainControls(enabled) {
  generateBtn.disabled = !enabled;
  sortBtn.disabled = !enabled;
  sizeSlider.disabled = !enabled;
  playPauseBtn.disabled = enabled;
  stopBtn.disabled = enabled;
  nextBtn.disabled = true;
  prevBtn.disabled = true;
  if (enabled) {
    playPauseText.textContent = "Pause";
    playIcon.style.display = "none";
    pauseIcon.style.display = "block";
  }
}

function updateStepButtons() {
  if (isPaused) {
    prevBtn.disabled = currentStep <= 0;
    nextBtn.disabled = currentStep >= sortHistory.length - 1;
  }
}

// --- Dark Mode Logic ---
function setDarkMode(isDark) {
  if (isDark) {
    document.body.classList.add("dark-mode");
    localStorage.setItem("theme", "dark");
  } else {
    document.body.classList.remove("dark-mode");
    localStorage.setItem("theme", "light");
  }
}

themeToggle.addEventListener("change", (e) => {
  setDarkMode(e.target.checked);
});

function initializeTheme() {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    themeToggle.checked = savedTheme === "dark";
    setDarkMode(savedTheme === "dark");
  } else {
    const prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDarkMode(prefersDark);
  }
}

// Event Listeners
generateBtn.addEventListener("click", generateArray);
sortBtn.addEventListener("click", startSort);
playPauseBtn.addEventListener("click", handlePlayPause);
stopBtn.addEventListener("click", handleStop);
nextBtn.addEventListener("click", handleNext);
prevBtn.addEventListener("click", handlePrev);

sizeSlider.addEventListener("input", (e) => {
  sizeValue.textContent = e.target.value;
  if (!isSorting) generateArray();
});
speedSlider.addEventListener("input", (e) => {
  speedValue.textContent = e.target.value;
});

// Initial setup
window.onload = () => {
  initializeTheme();
  sizeValue.textContent = sizeSlider.value;
  speedValue.textContent = speedSlider.value;
  generateArray();
};
