// Interação do laboratório de divisão (Padrão Ferretto Micro-Passo).
import { store } from './state.js';
import { divisionStep, normalize } from '../math/division.js';

const elD = document.getElementById('dividendo');
const eld = document.getElementById('divisor');
const btnLoad = document.getElementById('btn-load');
const btnNext = document.getElementById('btn-next');
const elVisual = document.getElementById('visual');
const elStatus = document.getElementById('status');
const elFormula = document.getElementById('formula');

const regD = document.getElementById('reg-D');
const regd = document.getElementById('reg-d');
const regq = document.getElementById('reg-q');
const regR = document.getElementById('reg-R');
const regPtr = document.getElementById('reg-ptr');

function reset() {
  const norm = normalize(elD.value || '816', eld.value || '8');
  store.update(s => {
    s.D = norm.D; s.d = norm.d; s.q = ''; s.r = ''; s.ptr = 0; s.history = [];
    s.subStep = 'START';
    s.log = norm.wasDecimal ? `Ferretto: Igualamos as casas decimais.` : 'Iniciado.';
    s.done = false;
  }, 'setup');
}

function next() {
  const s = store.get();
  if (s.done) return;

  const result = divisionStep(s.D, s.d, s.q, s.r, s.ptr, s.subStep);
  
  store.update(state => {
    state.D = result.D_str;
    state.q = result.q;
    state.r = result.r;
    state.ptr = result.ptr;
    state.subStep = result.nextSubStep;
    state.done = result.done;
    state.log = result.log || '';
    if (result.stepData) state.history.push(result.stepData);
  }, 'step');
}

function renderChave(state) {
  const { D, d, q, history, subStep, ptr } = state;
  let html = `<div class="metodo-chave">`;
  
  // Header: Dividendo | Divisor
  html += `<div class="tower-line"><span class="t-dividend">${D}</span><span class="t-divisor-bracket">${d}</span></div>`;
  html += `<div class="tower-line"><span class="t-space"></span><span class="t-quotient">${q || '&nbsp;'}</span></div>`;

  // Histórico de subtrações
  history.forEach((step, i) => {
    const subStr = step.sub.toString();
    const subPadding = " ".repeat(Math.max(0, step.ptr - subStr.length + 1));
    html += `<div class="tower-line"><span class="t-sub">${subPadding}- ${subStr}</span></div>`;
    html += `<div class="tower-line"><span class="t-bar">${subPadding}${"-".repeat(subStr.length + 2)}</span></div>`;
    
    const resStr = step.res.toString();
    const resPadding = " ".repeat(Math.max(0, step.ptr - resStr.length + 1));
    // No papel, baixamos o próximo algarismo ao lado do resto
    const isLast = (i === history.length - 1);
    const nextDigit = (isLast && ptr < D.length) ? D[ptr] : '';
    html += `<div class="tower-line"><span class="t-remainder">${resPadding}${resStr}${nextDigit}</span></div>`;
  });

  // Se estivermos esperando o primeiro dígito ser baixado
  if (history.length === 0 && subStep === 'MULTIPLY') {
      const firstDigit = D[0];
      html += `<div class="tower-line"><span class="t-remainder">${" ".repeat(D.length-1)}${firstDigit}</span></div>`;
  }

  html += `</div>`;
  return html;
}

store.subscribe((state, tags) => {
  regD.textContent = state.D;
  regd.textContent = state.d;
  regq.textContent = state.q || '0';
  regR.textContent = state.r || '0';
  regPtr.textContent = state.ptr;

  elStatus.innerHTML = state.log;
  btnNext.disabled = state.done;

  if (tags.has('setup')) {
    elVisual.innerHTML = `<div class="metodo-chave">
      <div class="tower-line"><span class="t-dividend">${state.D}</span><span class="t-divisor-bracket">${state.d}</span></div>
      <div class="tower-line"><span class="t-space"></span><span class="t-quotient">&nbsp;</span></div>
    </div>`;
  } else {
    elVisual.innerHTML = renderChave(state);
  }

  const q_num = parseFloat(state.q || 0);
  elFormula.innerHTML = `Prova Real: ${state.d} &times; ${state.q || 0} = ${(state.d * q_num).toFixed(2)}`;
});

btnLoad.addEventListener('click', reset);
btnNext.addEventListener('click', next);
window.addEventListener('keydown', (e) => { if (e.key === 'F8') { e.preventDefault(); next(); } });
reset();
