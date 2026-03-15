/**
 * ════════════════════════════════════════════════
 *  Cronómetro & Cuenta Atrás — script.js
 *  Lógica principal usando requestAnimationFrame
 *  para alta precisión y rendimiento.
 * ════════════════════════════════════════════════
 */

// ── Selectores DOM ──────────────────────────────

const $ = id => document.getElementById(id);

const elHH          = $('time-hh');
const elMM          = $('time-mm');
const elSS          = $('time-ss');
const elMS          = $('time-ms');
const elDisplay     = document.querySelector('.display-wrapper');

const btnStart      = $('btn-start');
const btnLap        = $('btn-lap');
const btnClear      = $('btn-clear');
const btnSet        = $('btn-set');

const modeButtons   = document.querySelectorAll('.mode-btn');
const countdownInput = $('countdown-input');
const lapsSection   = $('laps-section');
const lapList       = $('lap-list');

const inputHH       = $('input-hh');
const inputMM       = $('input-mm');
const inputSS       = $('input-ss');

// ── Estado de la aplicación ─────────────────────

const state = {
  mode: 'stopwatch',     // 'stopwatch' | 'countdown'
  running: false,
  startTime: 0,          // timestamp cuando inició el intervalo actual
  elapsed: 0,            // ms acumulados (cronómetro) o restantes (cuenta atrás)
  initialCountdown: 0,   // ms iniciales de la cuenta atrás
  lapTimes: [],          // [ { total, delta } ] para cronómetro
  lastLapTotal: 0,
  rafId: null,
};

// ── Utilidades de formato ────────────────────────

/**
 * Rellena con ceros un número hasta la longitud indicada.
 * @param {number} n
 * @param {number} len
 * @returns {string}
 */
const pad = (n, len = 2) => String(Math.floor(n)).padStart(len, '0');

/**
 * Convierte milisegundos a partes de tiempo.
 * @param {number} ms
 * @returns {{ hh: string, mm: string, ss: string, ms: string }}
 */
function msToParts(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  return {
    hh: pad(Math.floor(totalSeconds / 3600)),
    mm: pad(Math.floor((totalSeconds % 3600) / 60)),
    ss: pad(totalSeconds % 60),
    ms: pad(ms % 1000, 3),
  };
}

/**
 * Convierte horas, minutos y segundos a milisegundos.
 * @param {number} h @param {number} m @param {number} s
 * @returns {number}
 */
const toMs = (h, m, s) => (h * 3600 + m * 60 + s) * 1000;

// ── Render ───────────────────────────────────────

/**
 * Actualiza el display con el tiempo actual.
 * @param {number} ms
 */
function renderTime(ms) {
  const { hh, mm, ss, ms: msStr } = msToParts(ms);
  elHH.textContent = hh;
  elMM.textContent = mm;
  elSS.textContent = ss;
  elMS.textContent = msStr;
}

// ── Loop principal (requestAnimationFrame) ───────

/**
 * Bucle de animación: calcula el tiempo transcurrido
 * y actualiza la pantalla en cada frame.
 */
function tick() {
  const now = performance.now();
  const delta = now - state.startTime;

  if (state.mode === 'stopwatch') {
    // Cronómetro: sumar delta
    const current = state.elapsed + delta;
    renderTime(current);

  } else {
    // Cuenta atrás: restar delta
    const current = Math.max(0, state.elapsed - delta);
    renderTime(current);

    if (current === 0) {
      // Tiempo agotado
      onCountdownEnd();
      return;
    }
  }

  state.rafId = requestAnimationFrame(tick);
}

// ── Control del cronómetro ───────────────────────

/** Inicia o pausa según el estado actual. */
function toggleStart() {
  if (!state.running) {
    start();
  } else {
    pause();
  }
}

function start() {
  // En cuenta atrás, verificar que hay tiempo configurado
  if (state.mode === 'countdown' && state.elapsed === 0) return;

  state.running  = true;
  state.startTime = performance.now();
  state.rafId    = requestAnimationFrame(tick);

  // UI: botón pasa a "Pausar"
  btnStart.querySelector('.btn-icon').textContent  = '⏸';
  btnStart.querySelector('.btn-label').textContent = 'PAUSAR';
  elDisplay.classList.add('running');
  btnLap.disabled = (state.mode !== 'stopwatch');
}

function pause() {
  cancelAnimationFrame(state.rafId);

  // Actualizar elapsed con el tiempo transcurrido hasta ahora
  const delta = performance.now() - state.startTime;
  if (state.mode === 'stopwatch') {
    state.elapsed += delta;
  } else {
    state.elapsed = Math.max(0, state.elapsed - delta);
  }

  state.running = false;

  // UI: botón vuelve a "Iniciar"
  btnStart.querySelector('.btn-icon').textContent  = '▶';
  btnStart.querySelector('.btn-label').textContent = 'INICIAR';
  elDisplay.classList.remove('running');
  btnLap.disabled = true;
}

/** Limpia el estado y reinicia la pantalla. */
function clear() {
  cancelAnimationFrame(state.rafId);
  state.running    = false;
  state.elapsed    = (state.mode === 'countdown') ? state.initialCountdown : 0;
  state.lapTimes   = [];
  state.lastLapTotal = 0;

  renderTime(state.elapsed);

  btnStart.querySelector('.btn-icon').textContent  = '▶';
  btnStart.querySelector('.btn-label').textContent = 'INICIAR';
  elDisplay.classList.remove('running', 'done');
  btnLap.disabled = true;
  lapList.innerHTML = '';
}

/** Registra una vuelta en modo cronómetro. */
function lap() {
  if (!state.running || state.mode !== 'stopwatch') return;

  const delta    = performance.now() - state.startTime;
  const total    = state.elapsed + delta;
  const lapDelta = total - state.lastLapTotal;

  state.lapTimes.push({ total, delta: lapDelta });
  state.lastLapTotal = total;

  renderLap(state.lapTimes.length, total, lapDelta);
}

/**
 * Inserta un ítem de vuelta en la lista.
 * Compara con la vuelta anterior para mostrar delta relativo.
 * @param {number} num
 * @param {number} total   ms total
 * @param {number} delta   ms de esta vuelta
 */
function renderLap(num, total, delta) {
  const prevDelta = state.lapTimes.length > 1
    ? state.lapTimes[state.lapTimes.length - 2].delta
    : null;

  const { hh, mm, ss, ms } = msToParts(total);
  const { hh: dh, mm: dm, ss: ds } = msToParts(delta);

  let speedClass = '';
  let speedSign  = '';
  if (prevDelta !== null) {
    const diff = delta - prevDelta;
    if (diff < 0) { speedClass = 'faster'; speedSign = '▲'; }
    else          { speedClass = 'slower'; speedSign = '▼'; }
  }

  const li = document.createElement('li');
  li.className = 'lap-item';
  li.innerHTML = `
    <span class="lap-num">VUELTA ${pad(num)}</span>
    <span class="lap-time">${hh}:${mm}:${ss}<small>.${ms}</small></span>
    <span class="lap-delta ${speedClass}">${speedSign} ${dh}:${dm}:${ds}</span>
  `;

  // Insertar al inicio (más reciente arriba)
  lapList.insertBefore(li, lapList.firstChild);
}

// ── Cuenta atrás: fin ────────────────────────────

function onCountdownEnd() {
  renderTime(0);
  pause();
  elDisplay.classList.add('done');

  // Notificación sonora (si el navegador lo permite)
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [0, 150, 300].forEach(delay => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      osc.type = 'sine';
      gain.gain.setValueAtTime(.4, ctx.currentTime + delay / 1000);
      gain.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + delay / 1000 + .25);
      osc.start(ctx.currentTime + delay / 1000);
      osc.stop(ctx.currentTime + delay / 1000 + .25);
    });
  } catch (_) { /* AudioContext no disponible */ }
}

// ── Cambio de modo ───────────────────────────────

/**
 * Alterna entre cronómetro y cuenta atrás.
 * @param {'stopwatch'|'countdown'} mode
 */
function setMode(mode) {
  if (state.mode === mode) return;

  // Detener si está corriendo
  if (state.running) pause();

  state.mode = mode;
  state.lapTimes = [];
  state.lastLapTotal = 0;
  lapList.innerHTML = '';

  // Ajustar visibilidad de paneles
  const isCountdown = mode === 'countdown';
  countdownInput.classList.toggle('hidden', !isCountdown);
  lapsSection.style.display = isCountdown ? 'none' : '';
  btnLap.style.visibility   = isCountdown ? 'hidden' : 'visible';

  // Actualizar botones de modo
  modeButtons.forEach(btn => {
    const active = btn.dataset.mode === mode;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-selected', active);
  });

  // Reiniciar tiempo
  if (isCountdown) {
    applyCountdownInput();
  } else {
    state.elapsed = 0;
    renderTime(0);
  }
}

// ── Configurar cuenta atrás ──────────────────────

/** Lee los campos de entrada y establece el tiempo inicial. */
function applyCountdownInput() {
  const h = parseInt(inputHH.value, 10) || 0;
  const m = parseInt(inputMM.value, 10) || 0;
  const s = parseInt(inputSS.value, 10) || 0;

  // Normalizar: asegurarse de que los valores estén en rango
  const clamped = {
    h: Math.max(0, Math.min(99, h)),
    m: Math.max(0, Math.min(59, m)),
    s: Math.max(0, Math.min(59, s)),
  };

  inputHH.value = clamped.h;
  inputMM.value = clamped.m;
  inputSS.value = clamped.s;

  const ms = toMs(clamped.h, clamped.m, clamped.s);
  state.initialCountdown = ms;
  state.elapsed = ms;
  elDisplay.classList.remove('done');
  renderTime(ms);
}

// ── Validación de inputs de tiempo ──────────────

/** Valida y corrige el valor de un input al perder el foco. */
function validateTimeInput(input, max) {
  let val = parseInt(input.value, 10);
  if (isNaN(val) || val < 0) val = 0;
  if (val > max) val = max;
  input.value = val;
}

// ── Event Listeners ──────────────────────────────

btnStart.addEventListener('click', toggleStart);
btnLap.addEventListener('click', lap);
btnClear.addEventListener('click', clear);
btnSet.addEventListener('click', () => {
  if (state.running) pause();
  applyCountdownInput();
});

// Cambio de modo
modeButtons.forEach(btn => {
  btn.addEventListener('click', () => setMode(btn.dataset.mode));
});

// Validación de inputs de cuenta atrás
inputHH.addEventListener('blur', () => validateTimeInput(inputHH, 99));
inputMM.addEventListener('blur', () => validateTimeInput(inputMM, 59));
inputSS.addEventListener('blur', () => validateTimeInput(inputSS, 59));

// Aplicar con Enter en los inputs
[inputHH, inputMM, inputSS].forEach(input => {
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      input.blur();
      btnSet.click();
    }
  });
});

// Atajo de teclado: Espacio = start/pause, L = vuelta, R = clear
document.addEventListener('keydown', e => {
  if (['INPUT', 'BUTTON'].includes(e.target.tagName)) return;
  if (e.code === 'Space') { e.preventDefault(); toggleStart(); }
  if (e.code === 'KeyL')  lap();
  if (e.code === 'KeyR')  clear();
});

// ── Inicialización ───────────────────────────────

(function init() {
  renderTime(0);
  btnLap.disabled = true;
  lapsSection.style.display = '';
})();