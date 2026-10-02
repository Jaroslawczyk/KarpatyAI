import micrograd from './en/micrograd.js';
import bigram from './en/bigram.js';
import mlp from './en/mlp.js';
import activations from './en/activations.js';
import backprop from './en/backprop.js';
import wavenet from './en/wavenet.js';
import gpt from './en/gpt.js';
import tokenizer from './en/tokenizer.js';
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
