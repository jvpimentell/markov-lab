// Interação do laboratório de divisão (Versão 7.0 - Estabilidade e Visual Ferretto).

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
  const norm = normalize(elD.value || '816', eld.value || '8');
  store.update(s => {
    s.D = norm.D; s.d = norm.d; s.q = ''; s.r = ''; s.ptr = 0; s.history = [];
    s.subStep = 'START';
    s.log = 'Clique em PRÓXIMO para começar.';
    s.done = false;
  }, 'setup');
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
    console.error(e);
    alert("Erro na execução do passo. Verifique os valores.");
  }
}

function renderTable(state) {
    const { D, d, q, history, ptr, subStep } = state;
    let html = `<table class="math-table">`;
    
    // Header Row: Dividendo e Divisor
    html += `<tr>`;
    D.split('').forEach((char, i) => {
        const isFocus = (i === ptr && subStep === 'START');
        html += `<td style="${isFocus ? 'color:var(--blue); font-weight:bold; border-bottom: 2px solid var(--blue);' : ''}">${char}</td>`;
    });
    // A CHAVE (Vertical e Horizontal)
    html += `<td class="chave-v" rowspan="2"></td><td class="divisor-cell" colspan="15" style="border-bottom: 3px solid var(--ink); font-weight:bold;">${d}</td></tr>`;
    
    // Quociente Row (abaixo do divisor)
    html += `<tr>${D.split('').map(() => '<td></td>').join('')}<td class="quotient-cell" colspan="15" style="color:var(--ok-ink); font-weight:bold; text-align:left; padding-left:12px;">${q || '&nbsp;'}</td></tr>`;

    // Subtrações em cascata
    history.forEach((step, i) => {
        if (step.sub > 0) {
            html += `<tr>`;
            const subStr = step.sub.toString();
            const subOffset = step.ptr - subStr.length + 1;
            for(let j=0; j<D.length; j++) {
                if (j >= subOffset && j <= step.ptr) {
                    html += `<td class="sub-val" style="border-bottom: 2px solid var(--ink-3);">${j === subOffset ? '-' : ''}${subStr[j-subOffset]}</td>`;
                } else html += `<td></td>`;
            }
            html += `</tr>`;

            html += `<tr>`;
            const resStr = step.res.toString();
            const nextStep = history[i+1];
            const nextDigit = (i === history.length - 1 && ptr < D.length) ? D[ptr] : "";
            const resOffset = step.ptr - resStr.length + 1;
            
            for(let j=0; j<D.length; j++) {
                if (j >= resOffset && j <= step.ptr + (nextDigit ? 1 : 0)) {
                    let charIndex = j - resOffset;
                    let displayChar = (resStr + nextDigit)[charIndex];
                    const isDropped = (nextDigit && charIndex === (resStr + nextDigit).length - 1);
                    html += `<td style="${isDropped ? 'color:var(--blue); font-weight:bold;' : 'font-weight:bold;'}">${displayChar || ''}</td>`;
                } else html += `<td></td>`;
            }
            html += `</tr>`;
        }
    });

    if (history.length === 0 && subStep === 'MULTIPLY') {
        html += `<tr>`;
        const firstVal = D.substring(0, ptr + 1);
        for(let j=0; j<D.length; j++) {
            if (j <= ptr) html += `<td style="font-weight:bold; color:var(--blue); border-bottom: 2px solid var(--blue);">${firstVal[j]}</td>`;
            else html += `<td></td>`;
        }
        html += `</tr>`;
    }

    html += `</table>`;
    return html;
}

store.subscribe((state, tags) => {
  elStatus.innerHTML = `<span>${state.log}</span>`;
  btnNext.disabled = state.done;
  elVisual.innerHTML = renderTable(state);

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
