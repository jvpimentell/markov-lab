// Motor do algoritmo da divisão: funções puras para o "Assembly" da matemática.

/**
 * Normaliza os valores para garantir que o divisor seja inteiro.
 * Ex: 1.2 / 0.5 -> 12 / 5
 */
export function normalize(D, d) {
  let D_val = parseFloat(D);
  let d_val = parseFloat(d);
  
  if (isNaN(D_val) || isNaN(d_val) || d_val === 0) return { D: D.toString(), d: 0 };

  let d_str = d.toString();
  if (d_str.includes('.')) {
    const shift = d_str.split('.')[1].length;
    const factor = Math.pow(10, shift);
    // Usamos Number.toFixed para evitar sujeira de floating point binário
    D_val = parseFloat((D_val * factor).toFixed(10));
    d_val = parseFloat((d_val * factor).toFixed(10));
  }
  
  return { D: D_val.toString(), d: Math.round(d_val) };
}

/**
 * Executa um passo do algoritmo da divisão.
 * @param {string} D_str Dividendo como string.
 * @param {number} d_val Divisor inteiro.
 * @param {string} q_acc Quociente acumulado.
 * @param {string} r_val Resto atual.
 * @param {number} ptr Índice do próximo algarismo.
 * @returns {{ q: string, r: string, ptr: number, log: string, done: boolean, D_str: string }}
 */
export function divisionStep(D_str, d_val, q_acc, r_val, ptr) {
  // Se acabaram os algarismos originais e ainda há resto, entramos no modo decimal (baixando zeros)
  if (ptr >= D_str.length) {
    if (r_val === '0' || r_val === '' || q_acc.split('.')[1]?.length >= 5) {
      return { q: q_acc, r: r_val, ptr, log: 'Algoritmo finalizado (limite de precisão atingido).', done: true, D_str };
    }
    
    if (!q_acc.includes('.')) {
      q_acc = (q_acc === '' ? '0' : q_acc) + '.';
    }
    D_str += '0'; // Baixa um zero
  }

  const digit = D_str[ptr];
  
  // Ponto decimal no dividendo (ex: 12.5)
  if (digit === '.') {
    if (!q_acc.includes('.')) q_acc = (q_acc === '' ? '0' : q_acc) + '.';
    return divisionStep(D_str, d_val, q_acc, r_val, ptr + 1);
  }

  const prefix = (r_val === '0' ? '' : r_val);
  const current_str = prefix + digit;
  const current_num = parseInt(current_str, 10);

  let next_q = q_acc;
  let next_r = current_str;
  let log = `IP[${ptr}]: baixou '${digit}'. Registrador: ${current_num}.`;

  if (current_num >= d_val) {
    const q_digit = Math.floor(current_num / d_val);
    const sub = q_digit * d_val;
    const remainder = current_num - sub;
    next_q += q_digit;
    next_r = remainder.toString();
    log += ` Executou: ${current_num} / ${d_val} = ${q_digit}, sobra ${remainder}.`;
  } else {
    // Adiciona zero no quociente se já começamos a dividir
    if (next_q !== '' && !next_q.endsWith('.')) {
      next_q += '0';
      log += ` Menor que divisor: registrou '0' no quociente.`;
    } else if (next_q === '' && ptr === D_str.length - 1) {
       // Primeiro passo e já é menor
       next_q = '0';
       log += ` Menor que divisor: registrou '0'.`;
    } else {
      log += ` Menor que divisor: aguardando próximo algarismo.`;
    }
  }

  return { q: next_q, r: next_r, ptr: ptr + 1, log, done: false, D_str };
}
