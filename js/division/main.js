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
    s.history = [];
    s.log = (rawD !== D) ? `Normalizado: ${rawD}/${rawd} virou ${D}/${d}. Pressione F8.` : 'Estado inicializado. Pressione F8.';
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
    state.log = result.log;
    state.done = result.done;
    if (result.stepData) {
        state.history.push(result.stepData);
    }
    
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

function renderPaperTower(state) {
  const D = state.D;
  const d = state.d;
  const history = state.history;
  
  let html = `<div class="paper-tower">`;
  
  // Linha 1: Dividendo | Divisor
  html += `<div class="tower-line"><span class="t-dividend">${D}</span><span class="t-divisor">| ${d}</span></div>`;
  
  if (history.length > 0) {
    let q_display = state.q;
    const firstSub = history.find(h => h.sub > 0);
    const subVal = firstSub ? firstSub.sub : '0';
    
    // Alinhamento da primeira subtração
    const firstDigitIndex = D.search(/[1-9]/);
    const initialIndent = firstDigitIndex >= 0 ? firstDigitIndex : 0;
    const indentStr = " ".repeat(initialIndent);

    html += `<div class="tower-line"><span class="t-sub">${indentStr}- ${subVal}</span><span class="t-quotient">| <span class="highlight-q">${q_display}</span></span></div>`;
    html += `<div class="tower-line"><span class="t-bar">${indentStr}-------</span></div>`;
    
    let currentPadding = initialIndent;
    
    for (let i = 0; i < history.length; i++) {
        const step = history[i];
        const nextStep = history[i+1];
        
        if (nextStep) {
            // No papel, baixamos o próximo dígito ao lado do resto
            const pad = " ".repeat(currentPadding + 1);
            html += `<div class="tower-line"><span class="t-remainder">${pad}${step.res}${nextStep.digit}</span></div>`;
            
            if (nextStep.sub > 0) {
                html += `<div class="tower-line"><span class="t-sub">${pad}- ${nextStep.sub}</span></div>`;
                html += `<div class="tower-line"><span class="t-bar">${pad}----</span></div>`;
                // Ao subtrair, o resto da próxima etapa começa um pouco à direita se o quociente crescer
                // Mas no algoritmo padrão, mantemos o alinhamento da esquerda
                // Vou manter o currentPadding crescendo 1 a cada passo de dígito
                currentPadding++;
            } else {
                currentPadding++;
            }
        } else if (state.done) {
            const pad = " ".repeat(currentPadding + 1);
            html += `<div class="tower-line"><span class="t-remainder">${pad}${step.res}</span></div>`;
        }
    }
  }
  
  html += `</div>`;
  return html;
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
    elVisual.innerHTML = `<div class="paper-setup"><span class="highlight-D">${state.D}</span> <span class="chave">|</span> <u>${state.d}</u></div>`;
  } else {
    elVisual.innerHTML = renderPaperTower(state);
  }

  const q_num = parseFloat(state.q || 0);
  const r_num = parseInt(state.r || 0, 10);
  const res = parseFloat((state.d * q_num).toFixed(10)) + (r_num / Math.pow(10, state.q.split('.')[1]?.length || 0));
  
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
