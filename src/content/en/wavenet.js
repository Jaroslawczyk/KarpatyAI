export default {
  modules: {
    title: 'Layers as reusable modules',
    lead: 'As a network grows, layers with a shared interface make it easier to compose. A container passes each layer’s result to the next and gathers parameters.',
    technical:
      'The lecture returns to the BatchNorm MLP and moves embedding and flattening into the layer list. Sequential organizes forward computation, while parameters are gathered recursively. Train/eval mode must reach nested layers too; otherwise BatchNorm keeps updating statistics during evaluation. This structure clarifies what torch.nn adds on top of torch.Tensor operations.',
    concepts: ['Module', 'Sequential', 'Layer state'],
    symbols:
      'f₁…f_m are successive layers; x is the input; f is the network; θ_k denotes layer k’s parameters; θ collects network parameters; m is layer count. Shared parameters must not be counted twice.',
    why: 'Consistent layers let you change architecture without rewriting the training loop.',
    mistakes: [
      'Gathering only top-level parameters and missing nested layers.',
      'Switching only part of a model to eval.',
    ],
    details:
      'A layer can have parameters, state buffers, or neither. Flattening changes shape; BatchNorm stores running statistics. The lecture also smooths a noisy loss plot by averaging adjacent values. That changes visualization, not the optimization steps.',
    summary:
      'Modularity includes forward computation, parameters, and operating mode, not just tidy syntax.',
    codeNotes: [
      'The example uses nn.Sequential; the lecture builds similar containers manually.',
      'Parameters: 6·8+8 in the first layer and 8·3+3 in the second, totaling 83.',
    ],
    quiz: {
      prompt: 'Restore the computation order of Linear(6,8), Tanh, Linear(8,3).',
      options: ['Second Linear: 8 → 3', 'First Linear: 6 → 8', 'Tanh'],
      explanation: 'First linear transformation, then nonlinearity, then output layer.',
    },
    practice: {
      goal: 'Verify automatic parameter collection.',
      prepare: 'Python 3 and PyTorch.',
      steps: [
        'Run the example.',
        'Print every parameter shape from model.parameters().',
        'Add their element counts manually.',
      ],
      reason: 'Check that the optimizer will see all weights and biases.',
      result: 'Shapes (8,6), (8,), (3,8), (3,); 83 elements.',
      check: 'The manual total matches sum(p.numel()…).',
      hint: 'nn.Linear stores weights as (out_features, in_features).',
      solution: '48+8+24+3 = 83. Tanh has no trainable parameters.',
    },
  },
  hierarchy: {
    title: 'Combine context two at a time',
    lead: 'A plain MLP mixes all context at once. A hierarchy combines neighboring pairs, then pairs of groups, progressively expanding the history available to each node.',
    technical:
      'The lecture extends context to eight characters. FlattenConsecutive(2) maps (B,T,C) to (B,T/2,2C) while preserving adjacency. A linear layer then processes the final dimension independently at every position. Repeated levels form an 8 → 4 → 2 → 1 tree. This is an educational WaveNet-inspired architecture, not a reproduction of all its gated, residual, and skip components.',
    concepts: ['Hierarchy', 'FlattenConsecutive', 'Receptive field'],
    symbols:
      'B is batch size; T is position count; C is features per position; R_ℓ counts original positions visible after ℓ pairwise levels; ℓ is the level. T must be divisible by 2 at each level here.',
    why: 'Depth builds representations of character groups progressively instead of spending all computation on one flat mixture.',
    mistakes: [
      'Combining different batch examples instead of neighboring positions.',
      'Calling the educational tree a complete WaveNet implementation.',
    ],
    details:
      'The lecturer first compares models with similar parameter counts. Increasing context length itself changes both quality and first-layer size. Later, causal dilated convolutions are discussed as a more efficient arrangement of repeated computations in this hierarchy, but are not fully implemented.',
    summary:
      'Pairwise merging expands context: after three levels, a node sees eight input positions.',
    codeNotes: [
      'arange reveals exact element order rather than only shapes.',
      'The first group joins positions 0 and 1 into [0,1,2,3].',
    ],
    quiz: {
      prompt: 'How many pairwise levels turn eight positions into one?',
      explanation: '8 → 4 → 2 → 1 takes three levels, with receptive field 2³ = 8.',
    },
    practice: {
      goal: 'Verify that grouping preserves all values.',
      prepare: 'Python 3 and PyTorch.',
      steps: [
        'Create x of shape (2,8,3) using arange.',
        'Reshape to grouped of shape (2,4,6).',
        'Restore the original shape and compare with x.',
      ],
      reason: 'Grouping must not lose values or mix examples.',
      result: 'The reverse reshape restores x.',
      check: 'torch.equal(grouped.reshape(2,8,3), x) == True.',
      hint: 'The element count is 2·8·3 = 2·4·6.',
      solution:
        'x = torch.arange(48).reshape(2,8,3); grouped = x.reshape(2,4,6). Element count and order are preserved.',
    },
  },
  'shape-debug': {
    title: 'A silent three-dimensional BatchNorm bug',
    lead: 'Code can run without exceptions while normalizing the wrong axes. Adding a time dimension requires revisiting the old two-dimensional BatchNorm.',
    technical:
      'The hierarchy contains tensors shaped (B,T,C). The earlier implementation reduced only axis 0, producing separate statistics for every position. The lecture’s intended normalization combines batch and positions while retaining channel-specific statistics: mean((0,1), keepdim=True). Variance uses the same axes. Retained singleton dimensions enable correct broadcasting.',
    concepts: ['Reduction axes', 'NLC and NCL', 'Silent shape errors'],
    symbols:
      'x_btc is channel c at position t of example b; B is batch size; T is position count; C is channel count; μ_c is a channel mean; μ has shape (1,1,C); ℝ denotes real numbers.',
    why: 'Incorrect statistics may only slightly hurt training and remain unnoticed for a long time.',
    mistakes: [
      'Treating a successful forward pass as proof of correct axes.',
      'Passing (B,T,C) to library BatchNorm1d without considering its expected channel order.',
    ],
    details:
      'The fix gives each channel B·T observations instead of separate groups of B. The measured loss improvement is small; the lecturer does not claim proven statistical significance. Layer conventions differ between NLC and NCL, so inspect shapes explicitly.',
    summary:
      'Whenever dimensionality changes, recheck the meaning of every axis and the shape of statistics.',
    codeNotes: [
      'Axes (0,1) are batch and positions, not channels.',
      'unbiased=False explicitly uses divisor B·T in this additional example.',
    ],
    quiz: {
      prompt: 'For x shaped (B,T,C), how do you obtain one mean per channel?',
      options: ['x.mean(2)', 'x.mean(0)', 'x.mean((0,1), keepdim=True)'],
      explanation: 'Reduce B and T; preserve C and singleton dimensions for broadcasting.',
    },
    practice: {
      goal: 'Compare the intended statistics with the old implementation.',
      prepare: 'Python 3, PyTorch, and the example above.',
      steps: [
        'Calculate old = x.mean(0, keepdim=True).',
        'Compare old.shape with mean.shape.',
        'Check y’s mean over (0,1).',
      ],
      reason: 'Distinguish position-specific statistics from one set per channel.',
      result: 'old is (1,3,4), mean is (1,1,4), and y has near-zero channel means.',
      check: 'torch.allclose(y.mean((0,1)), torch.zeros(4), atol=1e-6).',
      hint: 'keepdim preserves reduced dimensions; it does not choose the axes.',
      solution:
        'The old version retains three independent positions. The new version combines six observations for each channel.',
    },
  },
  experiments: {
    title: 'Compare architectures fairly',
    lead: 'One successful run does not explain why a model improved. You need comparable conditions, validation, and a record of changes.',
    technical:
      'At the end, the lecturer scales the model and crosses validation loss 2.0 on the chosen dataset. He emphasizes the lack of a systematic experimental harness: tuning has been exploratory. Further work needs train/validation curves, controlled hyperparameters, and convenient variant runs. Dilated causal convolutions are discussed as an efficient way to compute overlapping contexts in the tree.',
    concepts: ['Experiment log', 'Comparable baseline', 'Dilated causal convolution'],
    symbols:
      'L_i is loss at step i; m is the number of neighboring values per group; k is a zero-based group index; L̄_k is the group average. Original steps are numbered from 1 in this formula.',
    why: 'Without controlled conditions, an architecture can receive credit for another learning rate, model size, or random run.',
    mistakes: [
      'Promising every reader the same numerical quality as one lecture run.',
      'Treating a smoothed curve as new loss measurements.',
    ],
    details:
      'About 1.993 is one lecture experiment’s result, not a required exercise outcome. Full WaveNet, RNNs, LSTMs, and GRUs are identified as future directions rather than completed implementations. This textbook preserves that boundary.',
    summary: 'Architecture gains require controlled comparison; curves reveal training dynamics.',
    codeNotes: [
      'Averaging pairs reduces visual noise.',
      'The list length is divisible by m; handle a final partial group separately for arbitrary lists.',
    ],
    quiz: {
      prompt: 'Which is better evidence for a new architecture?',
      options: [
        'One attractive generated name',
        'Comparable validation evaluation',
        'Only lower training loss',
      ],
      explanation:
        'Comparable held-out evaluation separates generalization gains from memorization and changed conditions.',
    },
    practice: {
      goal: 'Check that averaging full equal-size groups preserves the global mean.',
      prepare: 'Python 3 and the example’s losses.',
      steps: [
        'Calculate smoothed.',
        'Compare the means of losses and smoothed.',
        'Set m to 3 and repeat.',
      ],
      reason: 'Equal-size groups contribute equal weight to the global mean.',
      result: 'Both global means equal 10/6.',
      check: 'The absolute difference is below 1e-10.',
      hint: 'The original values sum to 10.',
      solution: 'For m=2: [2,2,1] has mean 5/3. For m=3: [2,4/3] also has mean 5/3.',
    },
  },
};
