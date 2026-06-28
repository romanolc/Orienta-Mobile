/**
 * orie.js — Animações e estados do mascote Orie
 * Estrutura modular, pronta para extensão
 */

// ================================================
// SELETORES DE ELEMENTOS
// ================================================
const mascot  = document.getElementById('orie-mascot');
const eyeL    = document.getElementById('eye-left');
const eyeR    = document.getElementById('eye-right');
const mouth   = document.getElementById('mouth');
const mouthPath = document.getElementById('mouth-smile');
const pot     = document.getElementById('pot');
const stem    = document.getElementById('stem');
const leafTop = document.getElementById('leaf-top');
const leafL   = document.getElementById('leaf-left');
const leafR   = document.getElementById('leaf-right');
const leafBL  = document.getElementById('leaf-bottom-left');
const leafBR  = document.getElementById('leaf-bottom-right');
const cheekL  = document.getElementById('cheek-left');
const cheekR  = document.getElementById('cheek-right');

// ================================================
// FORMAS DE BOCA POR ESTADO
// ================================================
const MOUTHS = {
  happy:       'M183,416 Q200,432 217,416',
  sad:         'M183,424 Q200,410 217,424',
  curious:     'M187,420 Q200,425 213,420',
  excited:     'M181,414 Q200,436 219,414',
  celebrating: 'M178,413 Q200,438 222,413',
  thinking:    'M186,421 Q198,420 214,418',
  sleeping:    'M188,420 Q200,423 212,420',
  confused:    'M185,422 Q200,415 215,422',
};

// ================================================
// ESTADO ATUAL
// ================================================
let currentState = 'happy';
let mouseFollowEnabled = true;
let floatInterval = null;

// ================================================
// DEFINIÇÕES DE ANIMAÇÃO CSS POR ESTADO
// ================================================
const STATE_CLASSES = [
  'state-happy', 'state-sad', 'state-curious', 'state-excited',
  'state-celebrating', 'state-thinking', 'state-sleeping', 'state-confused'
];

// ================================================
// UTILITÁRIOS
// ================================================
function lerp(a, b, t) { return a + (b - a) * t; }

function setMouthShape(shape) {
  if (mouthPath) mouthPath.setAttribute('d', shape);
}

function setEyeScale(sy) {
  [eyeL, eyeR].forEach(el => {
    el.style.transform = `scaleY(${sy})`;
  });
}

function setCheekOpacity(op) {
  cheekL.style.opacity = op;
  cheekR.style.opacity = op;
}

// ================================================
// APLICAR ESTADO
// ================================================
function setState(state) {
  currentState = state;

  // Botões
  document.querySelectorAll('.btn-expression').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.state === state);
  });

  // Remove classes antigas do mascot
  STATE_CLASSES.forEach(c => mascot.classList.remove(c));
  mascot.classList.add(`state-${state}`);

  // Atualiza a boca
  const mouthShape = MOUTHS[state] || MOUTHS.happy;
  animateMouth(mouthShape);

  // Ajusta bochechas e olhos por estado
  switch (state) {
    case 'happy':
      setCheekOpacity(0.32);
      resetEyeAnimation();
      mouseFollowEnabled = true;
      break;

    case 'sad':
      setCheekOpacity(0.0);
      setEyeScale(0.7);
      mouseFollowEnabled = false;
      break;

    case 'curious':
      setCheekOpacity(0.15);
      resetEyeAnimation();
      mouseFollowEnabled = true;
      break;

    case 'excited':
      setCheekOpacity(0.5);
      setEyeScale(1.2);
      mouseFollowEnabled = true;
      break;

    case 'celebrating':
      setCheekOpacity(0.55);
      resetEyeAnimation();
      mouseFollowEnabled = false;
      break;

    case 'thinking':
      setCheekOpacity(0.1);
      setEyeScale(0.9);
      mouseFollowEnabled = false;
      break;

    case 'sleeping':
      setCheekOpacity(0.4);
      setEyeScale(0.05);
      mouseFollowEnabled = false;
      showZzz();
      break;

    case 'confused':
      setCheekOpacity(0.2);
      setEyeScale(0.85);
      mouseFollowEnabled = false;
      break;
  }
}

// ================================================
// TRANSIÇÃO SUAVE DA BOCA
// ================================================
function animateMouth(targetD) {
  // Transição CSS suave via atributo d
  mouthPath.style.transition = 'd 0.3s ease';
  mouthPath.setAttribute('d', targetD);
}

// ================================================
// OLHOS — piscar suave via CSS
// ================================================
function resetEyeAnimation() {
  [eyeL, eyeR].forEach(el => {
    el.style.transform = '';
  });
}

// ================================================
// PISCAR MANUAL
// ================================================
function blink() {
  if (currentState === 'sleeping') return;
  [eyeL, eyeR].forEach(el => {
    el.style.transition = 'transform 0.06s ease';
    el.style.transform  = 'scaleY(0.08)';
  });
  setTimeout(() => {
    [eyeL, eyeR].forEach(el => {
      el.style.transform = 'scaleY(1)';
    });
  }, 130);
}

// Piscar automático aleatório
function scheduleNextBlink() {
  const delay = 2000 + Math.random() * 3500;
  setTimeout(() => {
    if (currentState !== 'sleeping') blink();
    scheduleNextBlink();
  }, delay);
}
scheduleNextBlink();

// ================================================
// FLUTUAR — aplicado ao wrapper
// ================================================
const wrapper = document.querySelector('.orie-wrapper');
if (wrapper) {
  wrapper.style.animation = 'float 3.5s ease-in-out infinite';
}

// ================================================
// SEGUIR O MOUSE (olhos + leve inclinação)
// ================================================
let targetRotX = 0, targetRotY = 0;
let currentRotX = 0, currentRotY = 0;
let rafId = null;

document.addEventListener('mousemove', (e) => {
  if (!mouseFollowEnabled) return;

  const rect = mascot.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top  + rect.height / 2;

  const dx = (e.clientX - cx) / window.innerWidth;
  const dy = (e.clientY - cy) / window.innerHeight;

  targetRotX = dy * -6;
  targetRotY = dx *  6;

  // Mover levemente os olhos
  const eyeOffX = dx * 2.5;
  const eyeOffY = dy * 2;
  [eyeL, eyeR].forEach(el => {
    el.style.transform = `translate(${eyeOffX}px, ${eyeOffY}px)`;
  });
});

// Suavizar rotação
function animateFollow() {
  currentRotX = lerp(currentRotX, targetRotX, 0.08);
  currentRotY = lerp(currentRotY, targetRotY, 0.08);
  mascot.style.transform = `perspective(600px) rotateX(${currentRotX}deg) rotateY(${currentRotY}deg)`;
  rafId = requestAnimationFrame(animateFollow);
}
animateFollow();

// Resetar ao sair
document.addEventListener('mouseleave', () => {
  targetRotX = 0;
  targetRotY = 0;
  [eyeL, eyeR].forEach(el => {
    el.style.transform = '';
  });
});

// ================================================
// ZZZ — ícone de dormir (cria dinamicamente)
// ================================================
let zzzEl = null;

function showZzz() {
  removeZzz();
  zzzEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  zzzEl.setAttribute('id', 'zzz-text');
  zzzEl.setAttribute('x', '260');
  zzzEl.setAttribute('y', '120');
  zzzEl.setAttribute('font-size', '28');
  zzzEl.setAttribute('fill', '#43B84A');
  zzzEl.setAttribute('font-family', 'system-ui, sans-serif');
  zzzEl.setAttribute('font-weight', '700');
  zzzEl.setAttribute('opacity', '0.75');
  zzzEl.textContent = 'z z z';
  zzzEl.style.animation = 'float 2s ease-in-out infinite';
  mascot.appendChild(zzzEl);
}

function removeZzz() {
  const old = document.getElementById('zzz-text');
  if (old) old.remove();
}

// Remove Zzz ao sair do estado sleeping
const origSetState = setState;
window.setState = function(state) {
  if (state !== 'sleeping') removeZzz();
  origSetState(state);
};

// ================================================
// TOQUE / CLICK — reação rápida
// ================================================
mascot.addEventListener('click', () => {
  if (currentState === 'sleeping') {
    setState('happy');
    return;
  }
  // Micro-bounce
  mascot.style.transition = 'transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)';
  mascot.style.transform  = 'scale(1.08)';
  setTimeout(() => {
    mascot.style.transform = '';
    setTimeout(() => {
      mascot.style.transition = '';
    }, 200);
  }, 150);
  blink();
});

// ================================================
// INICIALIZAÇÃO
// ================================================
setState('happy');
console.log('🌱 Orie carregado! Estados disponíveis: happy, sad, curious, excited, celebrating, thinking, sleeping, confused');
