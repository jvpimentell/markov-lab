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
  done: false,
  subStep: 'START',
  history: [] 
};

function derive(state, tags) {
  // Nada complexo para derivar aqui
}

export const store = createStore(initial, derive);
