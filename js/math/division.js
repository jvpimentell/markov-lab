// Motor ajustado para o padrão Ferretto: Normalização prévia e passos de subtração.

/**
 * Normaliza os valores para garantir que o divisor seja inteiro.
 * Regra do Ferretto: Igualar casas e tirar vírgula.
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

  return { 
    D: D_num.toString(), 
    d: d_num, 
    factor,
    wasDecimal: max_dec > 0 
  };
}

/**
 * Executa um passo do algoritmo da divisão.
 */
export function divisionStep(D_str, d_val, q_acc, r_val, ptr) {
  // Se acabaram os dígitos e ainda há resto, entra no modo decimal (baixa zero)
  if (ptr >= D_str.length) {
    if (r_val === '0' || r_val === '' || (q_acc.includes('.') && q_acc.split('.')[1].length >= 5)) {
      return { q: q_acc, r: r_val, ptr, done: true, D_str, stepData: null };
    }
    
    if (!q_acc.includes('.')) {
      q_acc = (q_acc === '' ? '0' : q_acc) + '.';
    }
    D_str += '0';
  }

  const digit = D_str[ptr];
  const prefix = (r_val === '0' ? '' : r_val);
  const current_str = prefix + digit;
  const current_num = parseInt(current_str, 10);

  let next_q = q_acc;
  let next_r = current_str;
  let sub = 0;

  if (current_num >= d_val) {
    const q_digit = Math.floor(current_num / d_val);
    sub = q_digit * d_val;
    const remainder = current_num - sub;
    next_q += q_digit;
    next_r = remainder.toString();
  } else {
    // Registra zero no quociente se já começamos a formar o resultado
    if (next_q !== '' && !next_q.endsWith('.')) {
      next_q += '0';
    } else if (next_q === '' && ptr === D_str.length - 1) {
       // Caso Ferretto: 1 / 5 -> "0," e ganha um 0
       next_q = '0.';
       D_str += '0'; 
    }
  }

  return { 
    q: next_q, 
    r: next_r, 
    ptr: ptr + 1, 
    done: false, 
    D_str,
    stepData: {
        val: current_num,
        sub: sub,
        res: parseInt(next_r),
        digit: digit,
        ptr: ptr
    }
  };
}
