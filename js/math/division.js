// Motor ajustado para explicações pedagógicas assertivas.

/**
 * Normaliza os valores para garantir que o divisor seja inteiro.
 */
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
 * Executa um passo do algoritmo da divisão com explicações assertivas.
 */
export function divisionStep(D_str, d_val, q_acc, r_val, ptr, subStep = 'START') {
  // 1. FIM DA CONTA
  if (ptr >= D_str.length) {
    if (r_val === '0' || r_val === '' || (q_acc.includes('.') && q_acc.split('.')[1].length >= 5)) {
      return { q: q_acc, r: r_val, ptr, done: true, D_str, stepData: null, log: "<b>Divisão finalizada.</b> O resto é zero ou atingimos o limite de precisão de 5 casas." };
    }
    if (!q_acc.includes('.')) q_acc = (q_acc === '' ? '0' : q_acc) + '.';
    D_str += '0';
  }

  let current_ptr = ptr;
  let prefix = (r_val === '0' ? '' : r_val);
  let current_num = parseInt(prefix + D_str[current_ptr], 10);

  // 2. BUSCA POR VALOR (Resolve o erro dos cliques repetitivos e explica o porquê)
  if (subStep === 'START' && current_num < d_val && current_ptr < D_str.length - 1) {
      while (current_num < d_val && current_ptr < D_str.length - 1) {
          if (q_acc !== '' && !q_acc.endsWith('.')) q_acc += '0';
          current_ptr++;
          current_num = parseInt(prefix + D_str.substring(ptr, current_ptr + 1), 10);
      }
      return { q: q_acc, r: r_val, ptr: current_ptr, done: false, D_str, nextSubStep: 'START', log: `Baixamos os algarismos até formar <b>${current_num}</b>, pois os valores anteriores eram menores que o divisor (<b>${d_val}</b>).` };
  }

  let next_q = q_acc;
  let next_r = r_val;
  let sub = 0;

  // 3. CICLO DE MICRO-PASSOS PEDAGÓGICOS
  if (subStep === 'START') {
     return { q: q_acc, r: r_val, ptr: current_ptr, done: false, D_str, nextSubStep: 'MULTIPLY', log: `Temos o valor <b>${current_num}</b>. Perguntamos: quantas vezes o <b>${d_val}</b> cabe dentro dele?` };
  }

  if (current_num >= d_val) {
    const q_digit = Math.floor(current_num / d_val);
    sub = q_digit * d_val;
    const remainder = current_num - sub;
    
    if (subStep === 'MULTIPLY') {
        const next_q = q_acc + q_digit;
        return { q: next_q, r: r_val, ptr: current_ptr, done: false, D_str, nextSubStep: 'SUBTRACT', log: `Cabe <b>${q_digit}</b> vezes. Colocamos o ${q_digit} no quociente e multiplicamos: <b>${q_digit} x ${d_val} = ${sub}</b>.` };
    }
    
    if (subStep === 'SUBTRACT') {
        return { q: q_acc, r: remainder.toString(), ptr: current_ptr + 1, done: false, D_str, nextSubStep: 'START', log: `Escrevemos o ${sub} embaixo do ${current_num} e subtraímos para ver o que sobra. O resto é <b>${remainder}</b>.`, stepData: { val: current_num, sub, res: remainder, digit: D_str[current_ptr], ptr: current_ptr } };
    }
  } else {
    // 4. CASOS DE "NÃO CABE" (Explicação assertiva do 0 no quociente)
    if (next_q === '' && current_ptr === D_str.length - 1) {
       const next_q = '0.';
       const next_D = D_str + '0'; 
       return { q: next_q, r: r_val, ptr: current_ptr, done: false, D_str: next_D, nextSubStep: 'START', log: `Como <b>${current_num}</b> é menor que <b>${d_val}</b> e não há mais números no dividendo, colocamos <b>0,</b> no quociente e iniciamos as casas decimais.` };
    }
    const next_q = q_acc + '0';
    return { q: next_q, r: current_num.toString(), ptr: current_ptr + 1, done: false, D_str, nextSubStep: 'START', log: `O valor <b>${current_num}</b> é menor que <b>${d_val}</b>. Por isso, registramos <b>0</b> no quociente antes de baixar o próximo algarismo.` };
  }

  return { q: q_acc, r: r_val, ptr: current_ptr + 1, done: false, D_str, nextSubStep: 'START' };
}
