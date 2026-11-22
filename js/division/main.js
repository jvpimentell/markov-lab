// Interação do laboratório de divisão (Versão 8.0 - Com Rascunho de Multiplicação).

document.documentElement.dataset.ready = '1';

import { store } from './state.js';
import { divisionStep, normalize } from '../math/division.js';
import { getMultiplicationSteps } from '../math/multiplication.js';

const elD = document.getElementById('dividendo');
const eld = document.getElementById('divisor');
const btnLoad = document.getElementById('btn-load');
const btnNext = document.getElementById('btn-next');
const elVisual = document.getElementById('visual');
const elStatus = document.getElementById('status');
const elFormula = document.getElementById('formula');
const elMulti = document.getElementById('multi-rascunho');

const regD = document.getElementById('reg-D');
const regd = document.getElementById('reg-d');
const regq = document.getElementById('reg-q');
const regR = document.getElementById('reg-R');

function reset() {
  const norm = normalize(elD.value || '816', eld.value || '8');
  store.update(s => {
    s.D = norm.D; s.d = norm.d; s.q = ''; s.r = ''; s.ptr = 0; s.history = [];
    s.subStep = 'START';
    s.multiDraft = null;
    s.log = 'Aperte PRÓXIMO para começar.';
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

        // GERA RASCUNHO SE ESTIVER NO PASSO DE MULTIPLICAÇÃO
        if (state.subStep === 'SUBTRACT') {
            const q_last = state.q[state.q.length - 1];
            if (q_last && q_last !== '.' && q_last !== '0') {
                state.multiDraft = getMultiplicationSteps(state.d, parseInt(q_last));
            }
        } else if (state.subStep === 'START') {
            state.multiDraft = null; 
        }
    }, 'step');
  } catch (e) {
      console.error(e);
  }
}

function renderTable(state) {
    const { D, d, q, history, ptr, subStep } = state;
    let html = `<table class="math-table">`;
    html += `<tr>`;
    D.split('').forEach((char, i) => {
        const isFocus = (i === ptr && (subStep === 'START' || subStep === 'CHECK'));
        html += `<td style="${isFocus ? 'color:var(--blue); font-weight:bold; border-bottom: 2px solid var(--blue);' : ''}">${char}</td>`;
    });
    html += `<td class="chave-v" rowspan="2"></td><td class="divisor-cell" colspan="15" style="border-bottom: 3px solid var(--ink); font-weight:bold;">${d}</td></tr>`;
    html += `<tr>${D.split('').map(() => '<td></td>').join('')}<td class="quotient-cell" colspan="15" style="color:var(--ok-ink); font-weight:bold; text-align:left; padding-left:12px;">${q || '&nbsp;'}</td></tr>`;

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

    if (history.length === 0 && subStep !== 'START' && subStep !== 'CHECK') {
        html += `<tr>`;
        const firstVal = D.substring(0, ptr + 1);
        for(let j=0; j<D.length; j++) {
            if (j <= ptr) html += `<td style="font-weight:bold; color:var(--blue);">${firstVal[j]}</td>`;
            else html += `<td></td>`;
        }
        html += `</tr>`;
    }
    html += `</table>`;
    return html;
}

function renderMulti(draft) {
    if (!draft) return '<div style="color:var(--ink-3); font-size:0.9em; font-style:italic; padding:20px;">O rascunho de multiplicação aparecerá aqui para ajudar no cálculo do quociente.</div>';
    let html = `<div style="font-family:var(--mono); font-size:1.5em; padding:20px; border:1px dashed var(--line); background:var(--stage); border-radius:8px;">`;
    html += `<div style="text-align:right; border-bottom:2px solid var(--ink); margin-bottom:5px; padding-bottom:5px;">`;
    html += `<div>${draft.a}</div>`;
    html += `<div>&times; ${draft.b}</div>`;
    html += `</div>`;
    draft.partials.forEach(p => {
        html += `<div style="text-align:right;">${p.val}${"&nbsp;".repeat(p.shift)}</div>`;
    });
    if (draft.partials.length > 1) {
        html += `<div style="text-align:right; border-top:2px solid var(--ink); font-weight:bold; margin-top:5px;">${draft.final}</div>`;
    }
    html += `</div>`;
    return html;
}

store.subscribe((state, tags) => {
  if (elStatus) elStatus.innerHTML = `<span>${state.log}</span>`;
  if (btnNext) btnNext.disabled = state.done;
  if (elVisual) elVisual.innerHTML = renderTable(state);
  if (elMulti) elMulti.innerHTML = renderMulti(state.multiDraft);

  if (regD) regD.textContent = state.D;
  if (regd) regd.textContent = state.d;
  if (regq) regq.textContent = state.q || '0';
  if (regR) regR.textContent = state.r || '0';

  const q_num = parseFloat(state.q || 0);
  if (elFormula) elFormula.innerHTML = `<b>VERIFICAÇÃO:</b><br>${state.d} x ${state.q || 0} = ${(state.d * q_num).toFixed(2)}`;
});

btnLoad.addEventListener('click', reset);
btnNext.addEventListener('click', next);
window.addEventListener('keydown', (e) => { if (e.key === 'F8') { e.preventDefault(); next(); } });
reset();
