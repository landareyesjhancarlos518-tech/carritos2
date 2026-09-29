/* =========================================================
   HOT WHEELS DAY SPECIAL EDITION - 30/09/26
   INTERACTIVE SCRIPT & SOUND ENGINE
   ========================================================= */

// Audio Engine using Web Audio API (No external sound files required!)
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.engineOsc = null;
    this.engineGain = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Engine Rev Sound (V8 Sawtooth + Filter Sweep)
  playRev(duration = 1.2, maxFreq = 380) {
    if (!this.enabled) return;
    this.init();

    const osc = this.ctx.createOscillator();
    const oscSub = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    oscSub.type = 'triangle';

    const now = this.ctx.currentTime;
    
    // Pitch envelope
    osc.frequency.setValueAtTime(65, now);
    osc.frequency.exponentialRampToValueAtTime(maxFreq, now + duration * 0.4);
    osc.frequency.exponentialRampToValueAtTime(70, now + duration);

    oscSub.frequency.setValueAtTime(32, now);
    oscSub.frequency.exponentialRampToValueAtTime(maxFreq / 2, now + duration * 0.4);
    oscSub.frequency.exponentialRampToValueAtTime(35, now + duration);

    // Lowpass filter for beefy engine grunt
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, now);
    filter.frequency.exponentialRampToValueAtTime(1600, now + duration * 0.4);
    filter.frequency.exponentialRampToValueAtTime(300, now + duration);

    // Gain envelope
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.35, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(filter);
    oscSub.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    oscSub.start(now);
    osc.stop(now + duration);
    oscSub.stop(now + duration);

    // Add turbo flutter at peak
    setTimeout(() => {
      this.playTurboFlutter();
    }, duration * 450);
  }

  // Turbo Blow-Off Flutter (Psssshh-tu-tu-tu)
  playTurboFlutter() {
    if (!this.enabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2500, now);
    filter.Q.value = 4;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.005, now + 0.45);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(now);
    noise.stop(now + 0.5);
  }

  // Blister packaging tear sound
  playTearSound() {
    if (!this.enabled) return;
    this.init();
    const now = this.ctx.currentTime;
    const duration = 0.6;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin(i / 15);
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1000, now);
    filter.frequency.linearRampToValueAtTime(3500, now + duration);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(now);
    noise.stop(now + duration);
  }

  // Victory fanfare
  playVictory() {
    if (!this.enabled) return;
    this.init();
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99]; // C chord arpeggio
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const now = this.ctx.currentTime;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.45);
      }, idx * 90);
    });
  }

  // Chime / Click
  playBeep(freq = 600, duration = 0.1) {
    if (!this.enabled) return;
    this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + duration);
  }
}

const sounds = new SoundEngine();

// =========================================================
// UI CONTROLS & SOUND TOGGLE
// =========================================================
const soundToggleBtn = document.getElementById('soundToggleBtn');
const quickRevBtn = document.getElementById('quickRevBtn');

soundToggleBtn.addEventListener('click', () => {
  sounds.enabled = !sounds.enabled;
  const label = soundToggleBtn.querySelector('.sound-label');
  const icon = soundToggleBtn.querySelector('.sound-icon');
  if (sounds.enabled) {
    label.textContent = 'Sonido V8: ON';
    icon.textContent = '🔊';
    soundToggleBtn.style.borderColor = 'var(--hw-orange)';
    sounds.playBeep(880, 0.15);
  } else {
    label.textContent = 'Sonido: MUTE';
    icon.textContent = '🔇';
    soundToggleBtn.style.borderColor = '#64748b';
  }
});

quickRevBtn.addEventListener('click', () => {
  sounds.playRev(1.4, 450);
  triggerConfettiSparks(quickRevBtn);
});

// =========================================================
// SPEEDOMETER / PEDAL INTERACTIVITY
// =========================================================
const gasPedalBtn = document.getElementById('gasPedalBtn');
const speedDisplay = document.getElementById('speedDisplay');
const gearDisplay = document.getElementById('gearDisplay');
const speedoNeedle = document.getElementById('speedoNeedle');

let currentSpeed = 0;
let isPedalPressed = false;
let pedalInterval = null;

function updateSpeedometer() {
  if (isPedalPressed) {
    currentSpeed = Math.min(360, currentSpeed + 8);
  } else {
    currentSpeed = Math.max(0, currentSpeed - 12);
  }

  speedDisplay.textContent = Math.floor(currentSpeed);

  // Needle angle from -90deg (0 km/h) to 90deg (360 km/h)
  const angle = -90 + (currentSpeed / 360) * 180;
  speedoNeedle.style.transform = `rotate(${angle}deg)`;

  // Dynamic Gear Display
  if (currentSpeed === 0) gearDisplay.textContent = 'P';
  else if (currentSpeed < 50) gearDisplay.textContent = '1';
  else if (currentSpeed < 100) gearDisplay.textContent = '2';
  else if (currentSpeed < 160) gearDisplay.textContent = '3';
  else if (currentSpeed < 230) gearDisplay.textContent = '4';
  else if (currentSpeed < 300) gearDisplay.textContent = '5';
  else gearDisplay.textContent = 'R (NITRO)';
}

function startPedal() {
  if (isPedalPressed) return;
  isPedalPressed = true;
  gasPedalBtn.classList.add('pedal-down');
  sounds.playRev(2.0, 520);
  
  if (!pedalInterval) {
    pedalInterval = setInterval(updateSpeedometer, 30);
  }
}

function stopPedal() {
  isPedalPressed = false;
  gasPedalBtn.classList.remove('pedal-down');
}

gasPedalBtn.addEventListener('mousedown', startPedal);
window.addEventListener('mouseup', stopPedal);
gasPedalBtn.addEventListener('touchstart', (e) => { e.preventDefault(); startPedal(); });
window.addEventListener('touchend', stopPedal);

// =========================================================
// SECTION 1: UNBOXING BLISTER INTERACTION
// =========================================================
const unboxingBlister = document.getElementById('unboxingBlister');
const bubbleCover = document.getElementById('bubbleCover');
const claimBonusBtn = document.getElementById('claimBonusBtn');

bubbleCover.addEventListener('click', () => {
  if (unboxingBlister.classList.contains('unboxed')) return;

  sounds.playTearSound();
  unboxingBlister.classList.add('unboxed');

  // Trigger massive confetti burst
  if (typeof confetti === 'function') {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.5 },
      colors: ['#ff5500', '#ffd700', '#ff1100', '#00f2fe', '#ffffff']
    });
  }

  setTimeout(() => {
    sounds.playVictory();
  }, 350);
});

claimBonusBtn.addEventListener('click', () => {
  sounds.playBeep(700, 0.15);
  alert('🎉 ¡Felicitaciones! Has canjeado el amor incondicional y todos los mimos del mundo.');
});

// =========================================================
// SECTION 2: GARAJE Y CUSTOM CARD
// =========================================================
const photoUpload = document.getElementById('photoUpload');
const customPhotoPreview = document.getElementById('customCarPhoto');
const customPlaceholder = document.getElementById('customPlaceholder');
const inputBoyfriendName = document.getElementById('inputBoyfriendName');
const inputCarPower = document.getElementById('inputCarPower');
const btnUpdateCard = document.getElementById('btnUpdateCard');
const displayCustomTitle = document.getElementById('displayCustomTitle');

photoUpload.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(evt) {
      customPhotoPreview.src = evt.target.result;
      customPhotoPreview.style.display = 'block';
      customPlaceholder.style.display = 'none';
      sounds.playBeep(800, 0.1);
    };
    reader.readAsDataURL(file);
  }
});

btnUpdateCard.addEventListener('click', () => {
  const name = inputBoyfriendName.value.trim() || 'Mi Campeón';
  const power = inputCarPower.value.trim() || 'El mejor novio';
  displayCustomTitle.textContent = name;
  sounds.playBeep(650, 0.2);

  // Sparkle feedback
  if (typeof confetti === 'function') {
    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.6 }
    });
  }
  btnUpdateCard.textContent = '¡Tarjeta Guardada! ✨';
  setTimeout(() => {
    btnUpdateCard.textContent = '¡Actualizar Tarjeta!';
  }, 2000);
});

// =========================================================
// SECTION 3: DRAG RACE MINI-GAME
// =========================================================
const canvas = document.getElementById('raceCanvas');
const ctx = canvas.getContext('2d');
const lightRed1 = document.getElementById('lightRed1');
const lightYellow1 = document.getElementById('lightYellow1');
const lightYellow2 = document.getElementById('lightYellow2');
const lightGreen = document.getElementById('lightGreen');

const startRaceBtn = document.getElementById('startRaceBtn');
const nitroBtn = document.getElementById('nitroBtn');
const finishBanner = document.getElementById('finishBanner');

const reactionTimeDisplay = document.getElementById('reactionTimeDisplay');
const quarterMileDisplay = document.getElementById('quarterMileDisplay');
const topSpeedDisplay = document.getElementById('topSpeedDisplay');

let gameState = 'idle'; // 'idle', 'staging', 'green', 'racing', 'finished', 'false_start'
let greenTimestamp = 0;
let carX = 40;
let carSpeed = 0;
let rivalX = 40;
let rivalSpeed = 0;
let raceAnimationId = null;

// Draw Initial Track
function drawRaceScene() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Asphalt
  ctx.fillStyle = '#181b24';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Lane Divider
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 4;
  ctx.setLineDash([20, 15]);
  ctx.beginPath();
  ctx.moveTo(0, canvas.height / 2);
  ctx.lineTo(canvas.width, canvas.height / 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Finish Line Checkered
  const finishX = canvas.width - 70;
  const squareSize = 10;
  for (let y = 0; y < canvas.height; y += squareSize) {
    for (let x = finishX; x < finishX + 20; x += squareSize) {
      ctx.fillStyle = ((x / squareSize + y / squareSize) % 2 === 0) ? '#ffffff' : '#000000';
      ctx.fillRect(x, y, squareSize, squareSize);
    }
  }

  // Draw Rival Car (Top Lane)
  drawCar(rivalX, 40, '#3b82f6', 'RIVAL');

  // Draw Player Hot Wheels Car (Bottom Lane)
  drawCar(carX, 130, '#ff5500', 'TU AUTO 🔥');
}

function drawCar(x, y, color, label) {
  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.beginPath();
  ctx.ellipse(x + 45, y + 55, 45, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Car Body
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x, y + 20, 85, 30, [10, 20, 5, 5]);
  ctx.fill();

  // Roof
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(x + 20, y + 8, 45, 18, [8, 12, 0, 0]);
  ctx.fill();

  // Flame accents on player car
  if (color === '#ff5500') {
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.moveTo(x + 30, y + 32);
    ctx.lineTo(x + 55, y + 26);
    ctx.lineTo(x + 42, y + 35);
    ctx.lineTo(x + 65, y + 35);
    ctx.lineTo(x + 25, y + 42);
    ctx.fill();
  }

  // Wheels
  ctx.fillStyle = '#111';
  ctx.beginPath();
  ctx.arc(x + 20, y + 48, 10, 0, Math.PI * 2);
  ctx.arc(x + 70, y + 48, 10, 0, Math.PI * 2);
  ctx.fill();

  // Rims
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.arc(x + 20, y + 48, 5, 0, Math.PI * 2);
  ctx.arc(x + 70, y + 48, 5, 0, Math.PI * 2);
  ctx.fill();

  // Label
  ctx.fillStyle = '#94a3b8';
  ctx.font = '10px "Chakra Petch", sans-serif';
  ctx.fillText(label, x + 15, y + 5);
}

function resetLights() {
  [lightRed1, lightYellow1, lightYellow2, lightGreen].forEach(l => l.classList.remove('active'));
}

function startStagingSequence() {
  if (gameState === 'staging' || gameState === 'racing') return;

  gameState = 'staging';
  resetLights();
  finishBanner.classList.remove('show');
  carX = 40;
  rivalX = 40;
  carSpeed = 0;
  rivalSpeed = 0;
  drawRaceScene();

  startRaceBtn.disabled = true;
  nitroBtn.disabled = false;
  reactionTimeDisplay.textContent = 'Esperando...';
  quarterMileDisplay.textContent = '-- s';
  topSpeedDisplay.textContent = '0 KM/H';

  // Light 1: Red
  lightRed1.classList.add('active');
  sounds.playBeep(440, 0.1);

  setTimeout(() => {
    if (gameState !== 'staging') return;
    lightYellow1.classList.add('active');
    sounds.playBeep(440, 0.1);
  }, 1000);

  setTimeout(() => {
    if (gameState !== 'staging') return;
    lightYellow2.classList.add('active');
    sounds.playBeep(440, 0.1);
  }, 2000);

  // Light Green: GO!
  const delayToGreen = 2800 + Math.random() * 800; // randomized reaction test!
  setTimeout(() => {
    if (gameState !== 'staging') return;
    resetLights();
    lightGreen.classList.add('active');
    sounds.playRev(1.5, 480);
    gameState = 'green';
    greenTimestamp = performance.now();
  }, delayToGreen);
}

function triggerNitro() {
  if (gameState === 'staging') {
    // False start!
    gameState = 'false_start';
    resetLights();
    lightRed1.classList.add('active');
    sounds.playBeep(220, 0.4);
    reactionTimeDisplay.textContent = '¡SALIDA EN FALSO!';
    startRaceBtn.disabled = false;
    nitroBtn.disabled = true;
    return;
  }

  if (gameState === 'green') {
    // Good start!
    gameState = 'racing';
    const reactionTime = ((performance.now() - greenTimestamp) / 1000).toFixed(3);
    reactionTimeDisplay.textContent = `${reactionTime} s ⚡`;
    nitroBtn.disabled = true;
    sounds.playRev(2.2, 580);

    runDragAnimation(parseFloat(reactionTime));
  }
}

function runDragAnimation(reactionTime) {
  const startTime = performance.now();
  const finishX = canvas.width - 90;

  function step(now) {
    const elapsed = (now - startTime) / 1000;

    // Player accelerates rapidly
    carSpeed += 0.85;
    carX += carSpeed;

    // Rival accelerates slightly slower
    rivalSpeed += 0.65;
    rivalX += rivalSpeed;

    drawRaceScene();

    // Check finish
    if (carX >= finishX) {
      gameState = 'finished';
      finishBanner.classList.add('show');
      sounds.playVictory();

      const totalTime = (elapsed + reactionTime).toFixed(2);
      quarterMileDisplay.textContent = `${totalTime} s 🏆`;
      topSpeedDisplay.textContent = '348 KM/H';

      startRaceBtn.disabled = false;

      if (typeof confetti === 'function') {
        confetti({
          particleCount: 150,
          spread: 90,
          origin: { y: 0.6 },
          colors: ['#ff5500', '#ffd700', '#ffffff', '#00f2fe']
        });
      }
      return;
    }

    raceAnimationId = requestAnimationFrame(step);
  }

  raceAnimationId = requestAnimationFrame(step);
}

startRaceBtn.addEventListener('click', startStagingSequence);
nitroBtn.addEventListener('click', triggerNitro);

// Spacebar controls nitro as well
window.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
    e.preventDefault();
    if (!nitroBtn.disabled) {
      triggerNitro();
    }
  }
});

drawRaceScene();

// =========================================================
// SECTION 4: CUPONES DE AMOR
// =========================================================
window.redeemCoupon = function(couponId, alertMsg) {
  const coupon = document.getElementById(couponId);
  if (!coupon || coupon.classList.contains('redeemed')) return;

  coupon.classList.add('redeemed');
  const btn = coupon.querySelector('.btn-redeem');
  btn.textContent = '¡CANJEADO! ✅';
  sounds.playVictory();

  if (typeof confetti === 'function') {
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.7 }
    });
  }

  setTimeout(() => {
    alert(alertMsg);
  }, 150);
};

// =========================================================
// SECTION 5: MODAL PERSONALIZAR CARTA
// =========================================================
const letterModal = document.getElementById('letterModal');
const btnEditLetter = document.getElementById('btnEditLetter');
const btnCloseLetterModal = document.getElementById('btnCloseLetterModal');
const btnSaveLetterModal = document.getElementById('btnSaveLetterModal');
const modalPartnerName = document.getElementById('modalPartnerName');
const modalMyName = document.getElementById('modalMyName');
const displayAuthorName = document.getElementById('displayAuthorName');

btnEditLetter.addEventListener('click', () => {
  letterModal.classList.add('active');
  sounds.playBeep(500, 0.1);
});

btnCloseLetterModal.addEventListener('click', () => {
  letterModal.classList.remove('active');
});

btnSaveLetterModal.addEventListener('click', () => {
  const myName = modalMyName.value.trim();
  if (myName) {
    displayAuthorName.textContent = myName + ' ❤️';
  }
  letterModal.classList.remove('active');
  sounds.playBeep(700, 0.15);

  if (typeof confetti === 'function') {
    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.8 }
    });
  }
});

// Helper for confetti sparks on buttons
function triggerConfettiSparks(el) {
  if (typeof confetti === 'function') {
    const rect = el.getBoundingClientRect();
    confetti({
      particleCount: 25,
      spread: 40,
      origin: {
        x: (rect.left + rect.width / 2) / window.innerWidth,
        y: (rect.top + rect.height / 2) / window.innerHeight
      },
      colors: ['#ff5500', '#ffd700', '#ff1100']
    });
  }
}
