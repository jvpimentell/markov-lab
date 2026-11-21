// Motor do algoritmo da divisão: funções puras para o "Assembly" da matemática.

/**
 * Executa um passo do algoritmo da divisão.
 * @param {string} D_str Dividendo como string para preservar algarismos.
 * @param {number} d_val Divisor.
 * @param {string} q_acc Quociente acumulado (string).
 * @param {string} r_val Resto atual (string).
 * @param {number} ptr Índice do próximo algarismo em D.
 * @returns {{ q: string, r: string, ptr: number, log: string, done: boolean }}
 */
export function divisionStep(D_str, d_val, q_acc, r_val, ptr) {
  if (ptr >= D_str.length) return { q: q_acc, r: r_val, ptr, log: 'Fim.', done: true };

  const digit = D_str[ptr];
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
    return { q: next_q, r: next_r, ptr: ptr + 1, log, done: (ptr + 1 >= D_str.length) };
  } else {
    // Se já temos quociente, registrar o 0 de "não coube"
    if (next_q.length > 0) {
      next_q += '0';
      log += ` Menor que divisor: registrou '0' no quociente.`;
    } else {
      log += ` Menor que divisor: aguardando próximo algarismo.`;
    }
    return { q: next_q, r: next_r, ptr: ptr + 1, log, done: (ptr + 1 >= D_str.length) };
  }
}
