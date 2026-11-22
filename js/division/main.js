// Interação do laboratório de divisão (Padrão Ferretto corrigido).
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
  const rawD = elD.value || '816';
  const rawd = eld.value || '8';
  
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
    s.log = norm.wasDecimal ? `Ferretto: Igualamos as casas (${rawD}/${rawd} ➜ ${norm.D}/${norm.d}).` : 'Iniciado.';
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

function renderTableGrid(state) {
    const D = state.D;
    const d = state.d;
    const history = state.history;

    let html = `<table class="math-grid">`;
    
    // Header: Dividendo | Divisor
    html += `<tr>`;
    D.split('').forEach((char, i) => html += `<td class="d-cell">${char}</td>`);
    html += `<td class="chave-v" rowspan="100"></td><td class="divisor-cell" colspan="10">${d}</td></tr>`;
    
    // Quociente row
    html += `<tr>${D.split('').map(() => '<td></td>').join('')}<td class="chave-h" colspan="10">${state.q}</td></tr>`;

    // Subtrações e Restos
    history.forEach((step, i) => {
        if (step.sub > 0) {
            // Linha da subtração
            html += `<tr>`;
            const subStr = step.sub.toString();
            const subOffset = step.ptr - subStr.length + 1;
            for(let j=0; j<D.length; j++) {
                if (j >= subOffset && j <= step.ptr) {
                    html += `<td class="sub-val">${j === subOffset ? '-' : ''}${subStr[j-subOffset]}</td>`;
                } else html += `<td></td>`;
            }
            html += `</tr>`;
            
            // Linha do traço
            html += `<tr>`;
            for(let j=0; j<D.length; j++) {
                if (j >= subOffset && j <= step.ptr) html += `<td class="sub-bar"></td>`;
                else html += `<td></td>`;
            }
            html += `</tr>`;

            // Linha do resto + próximo dígito baixado
            html += `<tr>`;
            const resStr = step.res.toString();
            const nextStep = history[i+1];
            const nextDigit = nextStep ? nextStep.digit : "";
            const resOffset = step.ptr - resStr.length + 1;
            
            for(let j=0; j<D.length; j++) {
                if (j >= resOffset && j <= step.ptr + (nextDigit ? 1 : 0)) {
                    let charIndex = j - resOffset;
                    let displayChar = (resStr + nextDigit)[charIndex];
                    html += `<td class="rem-val">${displayChar || ''}</td>`;
                } else html += `<td></td>`;
            }
            html += `</tr>`;
        }
    });

    html += `</table>`;
    return html;
}

store.subscribe((state, tags) => {
  regD.textContent = state.D;
  regd.textContent = state.d;
  regq.textContent = state.q || '0';
  regR.textContent = state.r || '0';
  regPtr.textContent = state.ptr;

  elStatus.innerHTML = state.done ? "Concluído." : (state.log || "Processando...");
  btnNext.disabled = state.done;

  if (tags.has('setup')) {
    elVisual.innerHTML = `<div class="paper-setup"><span class="highlight-D">${state.D}</span> <span class="chave">|</span> <u>${state.d}</u></div>`;
  } else {
    elVisual.innerHTML = renderTableGrid(state);
  }

  const q_num = parseFloat(state.q || 0);
  elFormula.innerHTML = `Prova Real: ${state.d} &times; ${state.q || 0} = ${(state.d * q_num).toFixed(2)}`;
});

btnLoad.addEventListener('click', reset);
btnNext.addEventListener('click', next);
window.addEventListener('keydown', (e) => { if (e.key === 'F8') { e.preventDefault(); next(); } });
reset();
