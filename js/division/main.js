// Interação do laboratório de divisão.
import { store } from './state.js';
import { divisionStep } from '../math/division.js';

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
  const D = elD.value || '0';
  const d = parseInt(eld.value, 10);
  if (isNaN(d) || d === 0) {
    alert('O divisor não pode ser zero.');
    return;
  }

  store.update(s => {
    s.D = D;
    s.d = d;
    s.q = '';
    s.r = '';
    s.ptr = 0;
    s.log = 'Estado inicializado. Pressione F8 para processar o primeiro algarismo.';
    s.done = false;
  }, 'setup');
}

function next() {
  const s = store.get();
  if (s.done) return;

  const result = divisionStep(s.D, s.d, s.q, s.r, s.ptr);
  
  store.update(state => {
    state.q = result.q;
    state.r = result.r;
    state.ptr = result.ptr;
    state.log = result.log;
    state.done = result.done;
    
    if (result.done) {
        // Marca como concluído no progresso da trilha
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

store.subscribe((state, tags) => {
  // Atualiza UI
  regD.textContent = state.D;
  regd.textContent = state.d;
  regq.textContent = state.q || '0';
  regR.textContent = state.r || '0';
  regPtr.textContent = state.ptr;

  elStatus.innerHTML = state.log;
  btnNext.disabled = state.done;

  if (tags.has('setup')) {
    elVisual.innerHTML = `<span class="highlight-D">${state.D}</span> | <u>${state.d}</u>`;
  } else {
    elVisual.innerHTML = `
      <div style="color:var(--ink-3); font-size: 0.5em; margin-bottom: 10px;">${state.D} &divide; ${state.d}</div>
      <div>Q: <span class="highlight-q">${state.q || '0'}</span></div>
      <div style="font-size: 0.7em;">R: <span class="highlight-R">${state.r || '0'}</span></div>
    `;
  }

  const q_num = parseInt(state.q || 0, 10);
  const r_num = parseInt(state.r || 0, 10);
  const res = (state.d * q_num) + r_num;
  const match = res === parseInt(state.D, 10);

  elFormula.innerHTML = `
    <span class="highlight-D">${state.D}</span> = (${state.d} &times; <span class="highlight-q">${q_num}</span>) + <span class="highlight-R">${r_num}</span><br>
    <span style="color: ${match ? 'var(--ok)' : 'var(--pen)'}; font-size: 0.8em; font-weight: bold;">
    [Result: ${res}] ${match && state.done ? '✓ MATCH' : '...'}</span>
  `;
});

btnLoad.addEventListener('click', reset);
btnNext.addEventListener('click', next);

window.addEventListener('keydown', (e) => {
  if (e.key === 'F8') {
    e.preventDefault();
    next();
  }
});

// Init
reset();
