export default {
  sequence: {
    title: 'Text, blocks, and next-token prediction',
    lead: 'GPT learns to continue a sequence. One text block contains many training tasks: predict the next token after each available prefix.',
    technical:
      'The lecture uses Tiny Shakespeare, initially with a character vocabulary. Text becomes integer indices and is split into train and validation. Batches contain fragments of length T; targets are shifted by one position. Logits have shape (B,T,V), and cross-entropy is computed after combining B and T. A bigram baseline checks data loading, loss, and generation before attention is introduced.',
    concepts: ['Token IDs', 'Shifted targets', 'B, T, C'],
    symbols:
      's is a token sequence; i_b is fragment b’s starting index; t is a zero-based within-fragment position; X holds inputs; Y holds targets; z denotes logits; B is batch size; T is block length; V is vocabulary size. C usually denotes hidden-vector size.',
    why: 'Targets and shapes are foundational. Attention cannot repair an incorrectly shifted dataset.',
    mistakes: [
      'Training to copy the current token instead of predicting the next.',
      'Allowing a position to use future tokens during training.',
    ],
    details:
      'Although all T positions train in parallel, each must use only its own prefix. The bigram baseline does not mix positions at all. The lecture moves to AdamW and averages evaluation loss across batches to reduce noise; this does not turn validation into training data.',
    summary: 'Inputs and targets differ by one token; causality must survive parallel training.',
    codeNotes: [
      'The short index sequence is created to make the target shift explicit.',
      'x[1:] == y[:-1] checks overlap, but is not a complete data-loader test.',
    ],
    quiz: {
      prompt: 'For input [4,1,7,2] from [4,1,7,2,9], which target is correct?',
      options: ['[1,7,2,9]', '[4,1,7,2]', '[9,2,7,1]'],
      explanation: 'Every target is the token immediately after its corresponding input position.',
    },
    practice: {
      goal: 'Enumerate the prediction tasks inside one block.',
      prepare: 'Python 3 and the example above.',
      steps: [
        'Loop t from 0 to T−1.',
        'Print x[:t+1] and y[t].',
        'Check that future x elements never enter the current prefix.',
      ],
      reason: 'This reveals training on prefixes of different lengths.',
      result: '[4]→1; [4,1]→7; [4,1,7]→2; [4,1,7,2]→9.',
      check: 'At step t, the prefix length is t+1.',
      hint: 'Python slices exclude the right endpoint.',
      solution:
        'for t in range(T): print(x[:t+1], y[t]). Attention masking will enforce the same information access within tensor computation.',
    },
  },
  attention: {
    title: 'Self-attention: a weighted exchange',
    lead: 'Attention lets each position choose which previous positions are useful. Instead of an equal average, weights depend on input content.',
    technical:
      'The lecture starts with averaging past context, expresses it as matrix multiplication, then uses masked softmax. Learned projections produce queries Q, keys K, and values V. QKᵀ measures compatibility, division by √d_k controls scale, a causal mask hides the future, and softmax normalizes rows. AV is the resulting weighted sum of values. Position embeddings supply position information; separate batch examples never communicate.',
    concepts: ['Query / key / value', 'Causal mask', 'Scaled dot-product'],
    symbols:
      'Q is T×d_k queries; K is T×d_k keys; V is T×d_v values (not vocabulary size here); T is sequence length; d_k is query/key size; d_v is value size; Mᵢⱼ=0 for j≤i and −∞ for j>i; A is T×T weights; O is T×d_v output. Softmax is row-wise; the batch dimension is omitted.',
    why: 'Learned weights select context by content instead of using fixed averages.',
    mistakes: [
      'Putting 0 rather than −∞ in masked scores before softmax.',
      'Dividing by √C when C differs from a single head’s d_k.',
    ],
    details:
      'Self-attention derives Q, K, and V from the same input. Cross-attention derives queries from one source and keys and values from another. An encoder can permit bidirectional communication; an autoregressive decoder hides the future. The diagonal remains visible: a position sees itself while predicting the next token.',
    summary:
      'Attention derives weights from data, the mask controls connections, and values carry content.',
    codeNotes: [
      'Zero allowed scores give uniform weights over the visible prefix.',
      'The masked upper triangle becomes zero after softmax. This demonstrates masking, not a complete trained attention head.',
    ],
    quiz: {
      prompt: 'How many positions can query index 2 access under a causal mask, including itself?',
      explanation: 'Indices 0, 1, and 2 are available: three positions.',
    },
    practice: {
      goal: 'Verify causality in every attention row.',
      prepare: 'Python 3, PyTorch, and the example above.',
      steps: ['Print weights.', 'Check row sums.', 'Verify that row 0 is [1,0,0,0].'],
      reason: 'The first position has only one allowed source.',
      result: 'Rows are [1,0,0,0], [1/2,1/2,0,0], [1/3,1/3,1/3,0], [1/4,…].',
      check: 'Every row sums to 1; all entries above the diagonal are zero.',
      hint: 'Use torch.allclose(weights.sum(-1), torch.ones(T)).',
      solution:
        'Softmax of allowed zeros gives equal probabilities; exp(−∞)=0 removes future positions.',
    },
  },
  transformer: {
    title: 'From attention heads to a Transformer block',
    lead: 'Attention heads exchange information between positions; a feedforward layer processes each position’s result. Residual connections and normalization help train a deep network.',
    technical:
      'Multi-head attention runs heads in parallel and concatenates their features. A nonlinear feedforward layer operates separately at each position. A residual adds a branch’s output to the original representation. The lecture applies LayerNorm before attention and feedforward: pre-norm. It normalizes features of one token rather than batch examples. Dropout regularizes training and is disabled in eval mode.',
    concepts: ['Multi-head attention', 'Residual', 'Pre-norm LayerNorm'],
    symbols:
      'x is a B×T×C block input; u is an intermediate representation; y is the same-shaped output; MHA is multi-head attention with output projection; LN is LayerNorm across C; FFN is feedforward; B is batch size, T positions, and C features.',
    why: 'Alternating communication and computation builds expressiveness, while the residual path helps gradients propagate.',
    mistakes: [
      'Confusing feature-wise LayerNorm with batch-wise BatchNorm.',
      'Adding residual branches with incompatible feature dimensions.',
    ],
    details:
      'Concatenating H heads of d features gives H·d channels; a projection returns the required C. The original Transformer illustration places normalization differently from the lecture’s pre-norm implementation. Do not translate the diagram into code without checking this distinction. FFN typically expands features and projects back to C.',
    summary:
      'A block combines attention, feedforward, residual paths, and normalization with consistent shapes.',
    codeNotes: [
      'The example shows only a pre-norm feedforward residual branch, without attention.',
      'Linear(8,32) expands features; Linear(32,8) restores the shape needed for addition to x.',
    ],
    quiz: {
      prompt: 'Match each component to its role.',
      items: ['Attention', 'Feedforward', 'Residual'],
      options: [
        'Process features at each position',
        'Add to the original representation',
        'Exchange information between positions',
      ],
      explanation:
        'Attention mixes positions; FFN processes each independently; residual preserves an additive path.',
    },
    practice: {
      goal: 'Check that FFN does not transfer information between positions.',
      prepare: 'Python 3, PyTorch, and the example above.',
      steps: [
        'Save y = x + ffn(ln(x)).',
        'Clone x and modify only position [0,0,:].',
        'Recompute and compare other positions.',
      ],
      reason: 'Unlike attention, these operations act separately along the final axis.',
      result: 'Other positions remain unchanged.',
      check:
        'torch.allclose(y[0,1:], changed_y[0,1:]) and the equivalent check for the second example return True.',
      hint: 'Use x.clone(), then change one element or vector.',
      solution:
        'LayerNorm(8) and Linear operate independently for each batch/time pair. There is no dropout in this example, so the comparison is deterministic.',
    },
  },
  generation: {
    title: 'GPT generation and the limits of pretraining',
    lead: 'A trained language model extends text one token at a time. Sequence completion and useful conversation involve different training stages.',
    technical:
      'The implemented network is a decoder-only Transformer: causal self-attention and feedforward, without a separate encoder or cross-attention. Generation takes the last block_size tokens, computes final-position logits, samples a token, and appends it. The lecture compares the implementation with nanoGPT and ends with a historical overview of pretraining, supervised fine-tuning, preference modeling, and RLHF. Those later stages are not implemented.',
    concepts: ['Decoder-only', 'Autoregression', 'Pretraining / fine-tuning'],
    symbols:
      'x₁:N is a sequence of N tokens; x_<t denotes tokens before t; P is a sequence or conditional probability; z_t denotes next-token logits; ∏ means product; ∼ means random sampling.',
    why: 'This separates the task actually trained from the behavior of a full conversational product.',
    mistakes: [
      'Expecting pretraining on one text file to create a chat assistant automatically.',
      'Forgetting to crop context to the model’s position-table capacity.',
    ],
    details:
      'In an encoder–decoder architecture, an encoder can read the complete source, and the decoder consults it through cross-attention. Continuing one text stream does not require that separate source. The ChatGPT discussion reflects the recording’s historical context and is not a claim about current products.',
    summary:
      'The educational GPT models next tokens; training conversational behavior remains outside the implementation.',
    codeNotes: [
      'Zero logits are a placeholder for the loop demonstration, not a trained GPT output.',
      'visible holds the last three tokens; a new token is appended to the full history.',
    ],
    quiz: {
      prompt: 'Restore one generation step.',
      options: [
        'Obtain final-position logits',
        'Append the token to history',
        'Crop the input context',
        'Sample from softmax',
      ],
      explanation: 'Limit context, compute final-position probabilities, sample, then append.',
    },
    practice: {
      goal: 'Check full-history and visible-context lengths.',
      prepare: 'Python 3 and PyTorch.',
      steps: [
        'Run the example.',
        'Crop again after appending the token.',
        'Compare full-history and visible-context lengths.',
      ],
      reason: 'The model window is limited, while full history can still be stored.',
      result: 'History has length 6; the newly cropped context has length 3.',
      check: 'context.shape[-1] == 6; context[:, -3:].shape[-1] == 3.',
      hint: 'Do not overwrite the full history with the cropped window.',
      solution: 'Full history is [0,1,2,3,4,new]. The next model input is [3,4,new].',
    },
  },
};
