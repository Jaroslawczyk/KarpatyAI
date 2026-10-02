import micrograd from './ru/micrograd.js';
import bigram from './ru/bigram.js';
import mlp from './ru/mlp.js';
import activations from './ru/activations.js';
import backprop from './ru/backprop.js';
import wavenet from './ru/wavenet.js';
import gpt from './ru/gpt.js';
import tokenizer from './ru/tokenizer.js';
export default {
  ...micrograd,
  ...bigram,
  ...mlp,
  ...activations,
  ...backprop,
  ...wavenet,
  ...gpt,
  ...tokenizer,
};
