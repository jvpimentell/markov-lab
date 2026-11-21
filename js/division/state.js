// Estado do laboratório de divisão.
import { createStore } from '../platform/tinyStore.js';

export const DIV_KEY = 'divisionlab:v1';

const initial = {
  D: '816',
  d: 8,
  q: '',
  r: '',
  ptr: 0,
  log: 'Insira os valores e clique em CARREGAR.',
  done: false
};

function derive(state, tags) {
  // Nada complexo para derivar aqui, o motor faz a transição.
}

export const store = createStore(initial, derive);
