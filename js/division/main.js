// Interação do laboratório de divisão (Padrão Ferretto).
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
  const rawD = elD.value || '0';
  const rawd = eld.value || '1';
  
  const norm = normalize(rawD, rawd);
  
  if (isNaN(norm.d) || norm.d === 0) {
    alert('O divisor não pode ser zero.');
    return;
  }

  store.update(s => {
    s.D = norm.D;
    s.d = norm.d;
    s.q = '';
    s.r = '';
    s.ptr = 0;
    s.history = [];
    s.log = norm.wasDecimal ? `Ferretto: Igualamos as casas (${rawD}/${rawd} ➜ ${norm.D}/${norm.d}). Pressione F8.` : 'Iniciado. Pressione F8.';
    s.done = false;
  }, 'setup');
}

function next() {
  const s = store.get();
  if (s.done) return;

  const result = divisionStep(s.D, s.d, s.q, s.r, s.ptr);
  
  store.update(state => {
    state.D = result.D_str;
    state.q = result.q;
    state.r = result.r;
    state.ptr = result.ptr;
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
        } catch (e) { /* ignore */ }
    }
  }, 'step');
}

function renderChave(state) {
  const history = state.history;
  const D = state.D;
  const d = state.d;
  
  let html = `<div class="metodo-chave">`;
  
  // Linha 1: Dividendo | Divisor
  html += `<div class="tower-line"><span class="t-dividend">${D}</span><span class="t-divisor">| ${d}</span></div>`;
  
  // Linha 2: Quociente (embaixo do divisor)
  let q_display = state.q || '&nbsp;';
  html += `<div class="tower-line"><span class="t-space"></span><span class="t-quotient">| <span class="highlight-q">${q_display}</span></span></div>`;

  // Corpo das subtrações
  if (history.length > 0) {
    let currentPadding = 0;
    history.forEach((step, i) => {
        if (step.sub > 0) {
            const pad = " ".repeat(currentPadding);
            html += `<div class="tower-line"><span class="t-sub">${pad}- ${step.sub}</span></div>`;
            html += `<div class="tower-line"><span class="t-bar">${pad}-------</span></div>`;
            
            const nextStep = history[i+1];
            const remainderDisplay = step.res + (nextStep ? nextStep.digit : '');
            html += `<div class="tower-line"><span class="t-remainder">${pad}${remainderDisplay}</span></div>`;
            currentPadding++;
        } else if (step.digit) {
            // Se baixou número mas não subtraiu (registrou 0), aumenta padding
            currentPadding++;
        }
    });
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

  elStatus.innerHTML = state.done ? "Algoritmo Concluído." : (state.log || "Processando...");
  btnNext.disabled = state.done;

  if (tags.has('setup')) {
    elVisual.innerHTML = `<div class="paper-setup"><span class="highlight-D">${state.D}</span> <span class="chave">|</span> <u>${state.d}</u></div>`;
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
