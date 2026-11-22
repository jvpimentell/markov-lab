// Interação do laboratório de divisão (Padrão Ferretto - RECONSTRUIDO FINAL).
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

function reset() {
  const norm = normalize(elD.value || '816', eld.value || '8');
  store.update(s => {
    s.D = norm.D; s.d = norm.d; s.q = ''; s.r = ''; s.ptr = 0; s.history = [];
    s.subStep = 'START';
    s.log = norm.wasDecimal ? `Ferretto: Igualamos as casas decimais (➜ ${norm.D} / ${norm.d}).` : 'Aperte PRÓXIMO para começar.';
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
    
    if (result.done) {
        const storage = localStorage;
        try {
            const saved = JSON.parse(storage.getItem('divisionlab:v1') || '{"completed":[]}');
            if (!saved.completed.includes('tutorial')) {
                saved.completed.push('tutorial');
                storage.setItem('divisionlab:v1', JSON.stringify(saved));
            }
        } catch (e) {}
    }
  }, 'step');
}

function renderChave(state) {
  const { D, d, q, history, ptr, subStep } = state;
  let html = `<div class="metodo-chave">`;
  
  // Linha 1: Dividendo | Divisor (Bracket)
  html += `<div class="tower-line">`;
  html += `  <span class="t-dividend">${D}</span>`;
  html += `  <span class="t-divisor-box">${d}</span>`;
  html += `</div>`;
  
  // Linha 2: Espaço | Quociente
  let q_display = q || '&nbsp;';
  html += `<div class="tower-line">`;
  html += `  <span class="t-space"></span>`;
  html += `  <span class="t-quotient-box">${q_display}</span>`;
  html += `</div>`;

  // Histórico de Subtrações
  history.forEach((step, i) => {
    const subStr = step.sub.toString();
    const subPad = " ".repeat(Math.max(0, step.ptr - subStr.length + 1));
    
    html += `<div class="tower-line"><span class="t-sub">${subPad}- ${subStr}</span></div>`;
    html += `<div class="tower-line"><span class="t-bar-wrap"><span class="t-bar" style="min-width: ${subStr.length + 2}ch"></span></span></div>`;
    
    const isLast = (i === history.length - 1);
    const resStr = step.res.toString();
    const nextDigit = (isLast && ptr < D.length) ? D[ptr] : '';
    const resPad = " ".repeat(Math.max(0, step.ptr - resStr.length + 1));
    
    html += `<div class="tower-line"><span class="t-remainder">${resPad}${resStr}${nextDigit}</span></div>`;
  });

  html += `</div>`;
  return html;
}

store.subscribe((state, tags) => {
  regD.textContent = state.D;
  regd.textContent = state.d;
  regq.textContent = state.q || '0';
  regR.textContent = state.r || '0';

  elStatus.innerHTML = `<b>${state.log || 'Iniciado.'}</b>`;
  if (state.done) {
      elStatus.style.borderLeftColor = 'var(--ok)';
      elStatus.style.background = '#e3f6ec';
  } else {
      elStatus.style.borderLeftColor = 'var(--blue)';
      elStatus.style.background = '#f0f7ff';
  }

  btnNext.disabled = state.done;
  elVisual.innerHTML = renderChave(state);

  const q_num = parseFloat(state.q || 0);
  elFormula.innerHTML = `<b>VERIFICAÇÃO:</b><br>${state.d} &times; ${state.q || 0} = ${(state.d * q_num).toFixed(2)}`;
});

btnLoad.addEventListener('click', reset);
btnNext.addEventListener('click', next);
window.addEventListener('keydown', (e) => { if (e.key === 'F8') { e.preventDefault(); next(); } });

reset();
