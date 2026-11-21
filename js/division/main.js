// Interação do laboratório de divisão.
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
  
  const { D, d } = normalize(rawD, rawd);
  
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
    s.log = (rawD !== D) ? `Normalizado: ${rawD}/${rawd} virou ${D}/${d}. Pressione F8.` : 'Estado inicializado. Pressione F8.';
    s.done = false;
  }, 'setup');
}

function next() {
  const s = store.get();
  if (s.done) return;

  const result = divisionStep(s.D, s.d, s.q, s.r, s.ptr);
  
  store.update(state => {
    state.D = result.D_str; // Atualiza caso tenha baixado zeros
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
      <div style="color:var(--ink-3); font-size: 0.5em; margin-bottom: 10px;">Divisão: ${state.d}</div>
      <div>Q: <span class="highlight-q">${state.q || '0'}</span></div>
      <div style="font-size: 0.7em;">R: <span class="highlight-R">${state.r || '0'}</span></div>
    `;
  }

  const q_num = parseFloat(state.q || 0);
  const r_num = parseInt(state.r || 0, 10);
  // Para a fórmula bater com decimais: (d * q) + (R / 10^precisão)
  // Simplificando: d * q + r_num * 10^-p
  const res = parseFloat((state.d * q_num).toFixed(10)) + (r_num / Math.pow(10, state.q.split('.')[1]?.length || 0));
  
  // No algoritmo manual com resto final, a prova real é D = d*q + R
  // Mas com decimais, o resto "muda de escala" a cada passo.
  // Mostramos o match final quando acaba.
  const targetD = parseFloat(state.D.split('.')[0] + (state.D.includes('.') ? '.' + state.D.split('.')[1] : ''));
  
  elFormula.innerHTML = `
    Projeção: ${state.d} &times; <span class="highlight-q">${state.q || 0}</span> = ${(state.d * q_num).toFixed(4)}<br>
    <span style="color: ${state.done ? 'var(--ok)' : 'var(--ink-3)'}; font-size: 0.8em; font-weight: bold;">
    ${state.done ? '✓ ALGORITMO FINALIZADO' : '... processando'}</span>
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
