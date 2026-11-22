// Motor ajustado para explicações pedagógicas assertivas (FIXED SCOPING).

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

export function divisionStep(D_str, d_val, q_acc, r_val, ptr, subStep = 'START') {
  // 1. FIM DA CONTA
  if (ptr >= D_str.length) {
    if (r_val === '0' || r_val === '' || (q_acc.includes('.') && q_acc.split('.')[1].length >= 5)) {
      return { q: q_acc, r: r_val, ptr, done: true, D_str, stepData: null, log: "<b>Divisão finalizada.</b> O resto é zero ou atingimos o limite de precisão." };
    }
    if (!q_acc.includes('.')) q_acc = (q_acc === '' ? '0' : q_acc) + '.';
    D_str += '0';
  }

  let current_ptr = ptr;
  let prefix = (r_val === '0' ? '' : r_val);
  let current_num = parseInt(prefix + D_str[current_ptr], 10);

  // 2. BUSCA POR VALOR (Salto inteligente)
  if (subStep === 'START' && current_num < d_val && current_ptr < D_str.length - 1) {
      let temp_q = q_acc;
      while (current_num < d_val && current_ptr < D_str.length - 1) {
          if (temp_q !== '' && !temp_q.endsWith('.')) temp_q += '0';
          current_ptr++;
          current_num = parseInt(prefix + D_str.substring(ptr, current_ptr + 1), 10);
      }
      return { q: temp_q, r: r_val, ptr: current_ptr, done: false, D_str, nextSubStep: 'START', log: `Baixamos os algarismos até formar <b>${current_num}</b>, pois o valor anterior era menor que o divisor.` };
  }

  let next_q = q_acc;
  let next_r = r_val;
  let sub = 0;

  if (subStep === 'START') {
     return { q: q_acc, r: r_val, ptr: current_ptr, done: false, D_str, nextSubStep: 'MULTIPLY', log: `Temos o valor <b>${current_num}</b>. Quantas vezes o <b>${d_val}</b> cabe dentro dele?` };
  }

  if (current_num >= d_val) {
    const q_digit = Math.floor(current_num / d_val);
    sub = q_digit * d_val;
    const remainder = current_num - sub;
    
    if (subStep === 'MULTIPLY') {
        next_q = q_acc + q_digit;
        return { q: next_q, r: r_val, ptr: current_ptr, done: false, D_str, nextSubStep: 'SUBTRACT', log: `Cabe <b>${q_digit}</b> vezes. Multiplicamos: ${q_digit} x ${d_val} = ${sub}.` };
    }
    
    if (subStep === 'SUBTRACT') {
        next_r = remainder.toString();
        return { q: q_acc, r: next_r, ptr: current_ptr + 1, done: false, D_str, nextSubStep: 'START', log: `Subtraímos ${sub} de ${current_num}. O resto é <b>${remainder}</b>.`, stepData: { val: current_num, sub, res: remainder, digit: D_str[current_ptr], ptr: current_ptr } };
    }
  } else {
    // CASO ESPECIAL: MENOR
    if (next_q === '' && current_ptr === D_str.length - 1) {
       next_q = '0.';
       const next_D = D_str + '0'; 
       return { q: next_q, r: r_val, ptr: current_ptr, done: false, D_str: next_D, nextSubStep: 'START', log: `Como <b>${current_num}</b> é menor que o divisor, iniciamos com <b>0,</b>.` };
    }
    next_q = q_acc + '0';
    return { q: next_q, r: current_num.toString(), ptr: current_ptr + 1, done: false, D_str, nextSubStep: 'START', log: `Não cabe. Registramos <b>0</b> no quociente.` };
  }

  return { q: next_q, r: next_r, ptr: current_ptr + 1, done: false, D_str, nextSubStep: 'START' };
}
