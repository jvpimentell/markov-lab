// Motor de Multiplicação passo a passo (Rascunho do Ferretto).

/**
 * Gera os passos de uma multiplicação para exibição visual.
 */
export function getMultiplicationSteps(a, b) {
  const sA = a.toString();
  const sB = b.toString();
  const steps = [];
  const partials = [];

  // Multiplicamos cada dígito de B pelo número A (de baixo para cima)
  for (let i = sB.length - 1; i >= 0; i--) {
    const bDigit = parseInt(sB[i]);
    const res = a * bDigit;
    const shift = sB.length - 1 - i;
    partials.push({ val: res, shift });
  }

  return { a, b, partials, final: a * b };
}
