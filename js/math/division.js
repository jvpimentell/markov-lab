// Motor da Divisão (Versão v41.0 - Lógica Ferretto Pura Blindada).

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
  let next_D = D_str;
  let cq = q_acc;
  let cr = r_val === '' ? '0' : r_val;
  let cp = ptr;

  // 1. MODO DECIMAL: Expandir se necessário
  if (cp >= next_D.length && cr !== '0') {
      if (!cq.includes('.')) cq = (cq === '' ? '0' : cq) + '.';
      next_D += '0';
  }

  // 2. GESTÃO DE FIM
  if (cp >= next_D.length && (cr === '0' || cr === '')) {
      return { q: cq, r: '0', ptr: cp, done: true, D_str: next_D, log: "Divisão finalizada." };
  }
  
  if (cq.includes('.') && cq.split('.')[1].length >= 5) {
      return { q: cq, r: cr, ptr: cp, done: true, D_str: next_D, log: "Fim (limite)." };
  }

  const digit = next_D[cp];
  const cvs = (cr === '0' ? '' : cr) + digit;
  const cvn = parseInt(cvs, 10);

  // START
  if (subStep === 'START') {
      return { q: cq, r: cr, ptr: cp, done: false, D_str: next_D, nextSubStep: 'CHECK', log: `Baixou ${digit}. Temos ${cvn}.` };
  }

  // CHECK
  if (subStep === 'CHECK') {
      if (cvn >= d_val) {
          return { q: cq, r: cr, ptr: cp, done: false, D_str: next_D, nextSubStep: 'MULTIPLY', log: `O ${d_val} cabe em ${cvn}.` };
      } else {
          // NÃO CABE
          if (cq === '') {
              if (cp === next_D.length - 1) {
                  // Inicia decimal, mas PRESERVA o resto (cr vira cvs)
                  return { q: '0.', r: cvs, ptr: cp + 1, done: false, D_str: next_D, nextSubStep: 'START', log: `Menor. Põe 0,.` };
              }
              return { q: cq, r: cvs, ptr: cp + 1, done: false, D_str: next_D, nextSubStep: 'START', log: `Ainda menor.` };
          } else {
              // Já tem quociente: bota 0 e PRESERVA resto
              return { q: cq + '0', r: cvs, ptr: cp + 1, done: false, D_str: next_D, nextSubStep: 'START', log: `Põe 0.` };
          }
      }
  }

  // MULTIPLY
  if (subStep === 'MULTIPLY') {
      const qd = Math.floor(cvn / d_val);
      return { q: cq + qd, r: cr, ptr: cp, done: false, D_str: next_D, nextSubStep: 'SUBTRACT', log: `Cabe ${qd} vezes.` };
  }

  // SUBTRACT
  if (subStep === 'SUBTRACT') {
      const q_val_str = cq.replace('.', '');
      const q_last = q_val_str[q_val_str.length - 1];
      const sv = parseInt(q_last) * d_val;
      const rem = cvn - sv;
      return { q: cq, r: rem.toString(), ptr: cp + 1, done: false, D_str: next_D, nextSubStep: 'START', log: `Sobrou ${rem}.`, stepData: { val: cvn, sub: sv, res: rem, digit, ptr: cp } };
  }

  return { q: cq, r: cr, ptr: cp + 1, done: false, D_str: next_D, nextSubStep: 'START' };
}
