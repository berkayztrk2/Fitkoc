/**
 * FitKoç Landing Page - Interactive Strength Engine JS
 * Ported directly from FitKoç scientific formulas (Epley & Rippetoe Standards).
 */

const BENCHMARKS = {
  bench: {
    name: 'Bench Press',
    male: { beginner: 0.50, novice: 0.75, intermediate: 1.05, advanced: 1.40, elite: 1.75 },
    female: { beginner: 0.30, novice: 0.45, intermediate: 0.65, advanced: 0.90, elite: 1.15 },
  },
  squat: {
    name: 'Squat',
    male: { beginner: 0.75, novice: 1.05, intermediate: 1.40, advanced: 1.85, elite: 2.30 },
    female: { beginner: 0.45, novice: 0.65, intermediate: 0.90, advanced: 1.20, elite: 1.55 },
  },
  deadlift: {
    name: 'Deadlift',
    male: { beginner: 0.90, novice: 1.25, intermediate: 1.65, advanced: 2.15, elite: 2.65 },
    female: { beginner: 0.55, novice: 0.80, intermediate: 1.10, advanced: 1.45, elite: 1.85 },
  },
  ohp: {
    name: 'Military Press (OHP)',
    male: { beginner: 0.35, novice: 0.52, intermediate: 0.70, advanced: 0.92, elite: 1.15 },
    female: { beginner: 0.20, novice: 0.30, intermediate: 0.42, advanced: 0.58, elite: 0.75 },
  },
  latPulldown: {
    name: 'Lat Pulldown',
    male: { beginner: 0.50, novice: 0.72, intermediate: 0.95, advanced: 1.22, elite: 1.50 },
    female: { beginner: 0.30, novice: 0.45, intermediate: 0.62, advanced: 0.82, elite: 1.05 },
  },
  legPress: {
    name: 'Leg Press',
    male: { beginner: 1.40, novice: 1.95, intermediate: 2.65, advanced: 3.40, elite: 4.20 },
    female: { beginner: 0.90, novice: 1.30, intermediate: 1.75, advanced: 2.30, elite: 2.90 },
  },
  curl: {
    name: 'Bicep Curl',
    male: { beginner: 0.25, novice: 0.38, intermediate: 0.52, advanced: 0.70, elite: 0.90 },
    female: { beginner: 0.12, novice: 0.20, intermediate: 0.30, advanced: 0.42, elite: 0.55 },
  },
};

const ACTIVITY_FACTORS = {
  sedentary: 0.88,
  light: 0.95,
  moderate: 1.02,
  active: 1.12,
  athlete: 1.22,
};

// State
let currentGender = 'male';
let currentWeight = 75;
let currentHeight = 178;
let currentActivity = 'moderate';
let currentExercise = 'bench';

// DOM Elements
const weightSlider = document.getElementById('weightSlider');
const heightSlider = document.getElementById('heightSlider');
const weightDisplay = document.getElementById('weightDisplay');
const heightDisplay = document.getElementById('heightDisplay');
const activitySelect = document.getElementById('activitySelect');
const genderButtons = document.querySelectorAll('#genderSelector .pill-btn');
const exerciseChips = document.querySelectorAll('#exerciseChips .chip');

const calcOneRM = document.getElementById('calcOneRM');
const calcLevelName = document.getElementById('calcLevelName');
const calcStrengthWeight = document.getElementById('calcStrengthWeight');
const calcHypertrophyWeight = document.getElementById('calcHypertrophyWeight');
const calcEnduranceWeight = document.getElementById('calcEnduranceWeight');

const simResultBox = document.getElementById('simResultBox');
const simStatus = document.getElementById('simStatus');
const simMsg = document.getElementById('simMsg');
const simButtons = document.querySelectorAll('.sim-btn');

// Calculate Function
function recalculate() {
  const bench = BENCHMARKS[currentExercise] || BENCHMARKS.bench;
  const ratios = bench[currentGender];
  const actCoeff = ACTIVITY_FACTORS[currentActivity] || 1.0;

  // Height / leverage adjustment
  const idealH = currentGender === 'female' ? 165 : 178;
  const heightDelta = (currentHeight - idealH) / 100;
  const leverCoeff = Math.max(0.92, Math.min(1.08, 1.0 - heightDelta * 0.15));

  const totalCoeff = actCoeff * leverCoeff;

  // Estimated Novice/Intermediate 1RM
  const base1RM = currentWeight * ratios.novice * totalCoeff;
  const rounded1RM = Math.round(base1RM * 10) / 10;

  // Rep Weights
  const strengthW = Math.max(20, Math.round((rounded1RM / (1 + 5 / 30)) / 2.5) * 2.5);
  const hypertrophyW = Math.max(20, Math.round((rounded1RM / (1 + 10 / 30)) / 2.5) * 2.5);
  const enduranceW = Math.max(15, Math.round((rounded1RM / (1 + 15 / 30)) / 2.5) * 2.5);

  // Update UI
  calcOneRM.innerHTML = `${rounded1RM} <span class="unit-kg">kg</span>`;
  calcStrengthWeight.textContent = `${strengthW} kg`;
  calcHypertrophyWeight.textContent = `${hypertrophyW} kg`;
  calcEnduranceWeight.textContent = `${enduranceW} kg`;

  // Level Badge
  if (base1RM < currentWeight * ratios.novice * totalCoeff) {
    calcLevelName.textContent = 'Başlangıç Seviyesi';
  } else if (base1RM < currentWeight * ratios.intermediate * totalCoeff) {
    calcLevelName.textContent = 'Gelişen Seviye 🚀';
  } else {
    calcLevelName.textContent = 'Orta / İleri Seviye 🏆';
  }
}

// Event Listeners
if (weightSlider) {
  weightSlider.addEventListener('input', (e) => {
    currentWeight = Number(e.target.value);
    weightDisplay.textContent = currentWeight;
    recalculate();
  });
}

if (heightSlider) {
  heightSlider.addEventListener('input', (e) => {
    currentHeight = Number(e.target.value);
    heightDisplay.textContent = currentHeight;
    recalculate();
  });
}

if (activitySelect) {
  activitySelect.addEventListener('change', (e) => {
    currentActivity = e.target.value;
    recalculate();
  });
}

genderButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    genderButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentGender = btn.dataset.val;
    recalculate();
  });
});

exerciseChips.forEach(chip => {
  chip.addEventListener('click', () => {
    exerciseChips.forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    currentExercise = chip.dataset.ex;
    recalculate();
  });
});

// Simulator Scenarios
simButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const scenario = btn.dataset.scenario;
    const hypW = calcHypertrophyWeight.textContent;

    if (scenario === 'light') {
      simStatus.textContent = 'Güç Fazlası & Hafif Geldi 💪';
      simStatus.style.color = 'var(--primary)';
      simResultBox.style.background = 'rgba(0, 170, 255, 0.12)';
      simResultBox.style.borderColor = 'rgba(0, 170, 255, 0.3)';
      simMsg.textContent = `${hypW} ile 13 tekrar çıkardın! Tahmini 1RM gücün yükseldi. Bir sonraki sette doğrudan +5 kg artırarak devam etmelisin.`;
    } else if (scenario === 'perfect') {
      simStatus.textContent = 'Mükemmel Kalibre Edildi 🎯';
      simStatus.style.color = 'var(--green)';
      simResultBox.style.background = 'rgba(0, 230, 118, 0.12)';
      simResultBox.style.borderColor = 'rgba(0, 230, 118, 0.3)';
      simMsg.textContent = `Harika! ${hypW} ile tam 10 tekrar tamamlandı. Çalışma ağırlığın mükemmel kalibre. Bir sonraki seans için +2.5 kg artış planlandı.`;
    } else if (scenario === 'heavy') {
      simStatus.textContent = 'Biraz Ağır Geldi ⚠️';
      simStatus.style.color = 'var(--gold)';
      simResultBox.style.background = 'rgba(255, 176, 32, 0.12)';
      simResultBox.style.borderColor = 'rgba(255, 176, 32, 0.3)';
      simMsg.textContent = `${hypW} ile 6 tekrar tamamlandı. Hedeflenen 10 tekrar hipertrofi hacmine tam oturması için ağırlığı %10 düşürerek devam et.`;
    } else if (scenario === 'fail') {
      simStatus.textContent = 'Aşırı Ağır (Sakatlık Önleme Regreyonu) ⛔';
      simStatus.style.color = 'var(--red)';
      simResultBox.style.background = 'rgba(255, 59, 48, 0.12)';
      simResultBox.style.borderColor = 'rgba(255, 59, 48, 0.3)';
      simMsg.textContent = `Bu ağırlık mevcut kapasitenin üzerinde kaldı (2 tekrar). Formu bozmamak ve sakatlanmamak için ağırlığı hemen %25 düşürerek dene.`;
    }
  });
});

// Initial Run
recalculate();
