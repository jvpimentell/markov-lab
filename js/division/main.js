// Interação do laboratório de divisão (Versão 4.0 - Estabilidade Total).

// 1. SINALIZAÇÃO DE BOOT IMEDIATA (Evita a caixa de erro vermelha)
document.documentElement.dataset.ready = '1';

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
  try {
    const norm = normalize(elD.value || '816', eld.value || '8');
    store.update(s => {
      s.D = norm.D; s.d = norm.d; s.q = ''; s.r = ''; s.ptr = 0; s.history = [];
      s.subStep = 'START';
      s.log = 'Aperte PRÓXIMO para começar.';
      s.done = false;
    }, 'setup');
  } catch (e) {
    console.error("Erro no reset:", e);
  }
}

function next() {
  const s = store.get();
  if (s.done) return;

  try {
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
  } catch (e) {
    console.error("Erro no próximo passo:", e);
  }
}

function renderLousa(state) {
  const { D, d, q, history, ptr, subStep } = state;
  
  // Criamos uma grade de texto (canvas de caracteres)
  const cols = D.length + d.toString().length + 5;
  let canvas = [];

  // Linha 1: Dividendo | Divisor
  let line1 = D.padEnd(D.length + 1) + "|" + d;
  canvas.push(line1);

  // Linha 2: Quociente
  let line2 = "".padEnd(D.length + 1) + "|" + (q || "");
  canvas.push(line2);
  
  // Linha 3: Traço da Chave
  let line3 = "".padEnd(D.length + 1) + "-".repeat(d.toString().length + 2);
  canvas.push(line3);

  // Subtrações
  history.forEach((step) => {
      const subLine = `-${step.sub}`.padStart(step.ptr + 1);
      canvas.push(subLine);
      canvas.push("-".repeat(step.sub.toString().length + 1).padStart(step.ptr + 1));
      
      // O resto desta etapa aparece na próxima linha
      const remLine = `${step.res}`.padStart(step.ptr + 1);
      canvas.push(remLine);
  });

  // Se estivermos baixando um número, ele aparece no final do último resto
  if (subStep === 'MULTIPLY' && history.length === 0) {
      canvas.push(D.substring(0, ptr + 1).padStart(ptr + 1));
  }

  return `<pre style="font-family: 'Atkinson Hyperlegible Mono', monospace; font-size: 1.2em; line-height: 1.2; margin: 0;">${canvas.join('\n')}</pre>`;
}

store.subscribe((state, tags) => {
  if (!elStatus) return;

  elStatus.innerHTML = `<span>${state.log}</span>`;
  btnNext.disabled = state.done;
  elVisual.innerHTML = renderLousa(state);

  // Painel lateral
  regD.textContent = state.D;
  regd.textContent = state.d;
  regq.textContent = state.q || '0';
  regR.textContent = state.r || '0';

  const q_num = parseFloat(state.q || 0);
  elFormula.innerHTML = `<b>VERIFICAÇÃO:</b><br>${state.d} x ${state.q || 0} = ${(state.d * q_num).toFixed(2)}`;
});

btnLoad.addEventListener('click', reset);
btnNext.addEventListener('click', next);
window.addEventListener('keydown', (e) => { if (e.key === 'F8') { e.preventDefault(); next(); } });

reset();
