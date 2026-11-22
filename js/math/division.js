// Motor da Divisão (Versão Robusta Ferretto).

export function normalize(D, d) {
  const D_str = D.toString();
  const d_str = d.toString();
  const D_dec = D_str.includes('.') ? D_str.split('.')[1].length : 0;
  const d_dec = d_str.includes('.') ? d_str.split('.')[1].length : 0;
  const max_dec = Math.max(D_dec, d_dec);
  const factor = Math.pow(10, max_dec);
  const D_num = Math.round(parseFloat(D) * factor);
  const d_num = Math.round(parseFloat(d) * factor);
  return { D: D_num.toString(), d: d_num, factor, wasDecimal: max_dec > 0 };
}

/**
 * Executa um passo do algoritmo da divisão.
 * Estados: START (Baixar/Analisar) -> CHECK (Decidir) -> MULTIPLY -> SUBTRACT
 */
export function divisionStep(D_str, d_val, q_acc, r_val, ptr, subStep = 'START') {
  // 1. FIM DA CONTA
  if (ptr >= D_str.length && (r_val === '0' || r_val === '')) {
      return { q: q_acc, r: '0', ptr, done: true, D_str, stepData: null, log: "Divisão finalizada." };
  }
  
  if (q_acc.includes('.') && q_acc.split('.')[1].length >= 5) {
      return { q: q_acc, r: r_val, ptr, done: true, D_str, log: "Fim (limite de 5 casas)." };
  }

  // Modo decimal
  if (ptr >= D_str.length && r_val !== '0') {
      if (!q_acc.includes('.')) q_acc = (q_acc === '' ? '0' : q_acc) + '.';
      D_str += '0';
  }

  const digit = D_str[ptr];
  const current_val_str = (r_val === '0' ? '' : r_val) + digit;
  const current_num = parseInt(current_val_str, 10);

  // START: Baixou o dígito
  if (subStep === 'START') {
      return { q: q_acc, r: r_val, ptr, done: false, D_str, nextSubStep: 'CHECK', log: `Baixamos o <b>${digit}</b>. Temos o valor <b>${current_num}</b>.` };
  }

  // CHECK: Decidir se divide ou põe zero
  if (subStep === 'CHECK') {
      if (current_num >= d_val) {
          return { q: q_acc, r: r_val, ptr, done: false, D_str, nextSubStep: 'MULTIPLY', log: `O ${d_val} cabe dentro de ${current_num}.` };
      } else {
          let next_q = q_acc;
          if (q_acc !== '' && !q_acc.endsWith('.')) {
              next_q += '0';
              return { q: next_q, r: current_val_str, ptr: ptr + 1, done: false, D_str, nextSubStep: 'START', log: `Não cabe. Põe <b>0</b> no quociente e baixa o próximo.` };
          }
          if (q_acc === '' && ptr === D_str.length - 1) {
              return { q: '0.', r: r_val, ptr: ptr, done: false, D_str: D_str + '0', nextSubStep: 'START', log: `Menor que o divisor. Iniciamos com <b>0,</b>.` };
          }
          return { q: q_acc, r: current_val_str, ptr: ptr + 1, done: false, D_str, nextSubStep: 'START', log: `Ainda menor que o divisor. Baixamos o próximo.` };
      }
  }

  // MULTIPLY: Define o próximo dígito do quociente
  if (subStep === 'MULTIPLY') {
      const q_digit = Math.floor(current_num / d_val);
      const sub = q_digit * d_val;
      return { q: q_acc + q_digit, r: r_val, ptr, done: false, D_str, nextSubStep: 'SUBTRACT', log: `Cabe <b>${q_digit}</b> vezes. Multiplicamos: ${q_digit} x ${d_val} = ${sub}.` };
  }

  // SUBTRACT: Gera o novo resto
  if (subStep === 'SUBTRACT') {
      const q_last = q_acc[q_acc.length - 1];
      const sub = parseInt(q_last) * d_val;
      const remainder = current_num - sub;
      return { q: q_acc, r: remainder.toString(), ptr: ptr + 1, done: false, D_str, nextSubStep: 'START', log: `Resto: <b>${remainder}</b>.`, stepData: { val: current_num, sub, res: remainder, digit, ptr } };
  }

  return { q: q_acc, r: r_val, ptr: ptr + 1, done: false, D_str, nextSubStep: 'START' };
}
