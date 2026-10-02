export default {
  initialization: {
    title: 'What the initial loss tells you',
    lead: 'Before training, the model has no reason to be confident in a random answer. Initial loss can reveal oversized logits before a long training run.',
    technical:
      'For V equally probable classes, NLL is ln(V). The lecture’s 27-character vocabulary gives a reference near 3.30. An initial loss around 27 signals overly confident incorrect predictions. Reducing the final weight scale and bias makes initial probabilities more uniform. Do not set every network weight to zero: symmetric neurons would fail to learn distinct features.',
    concepts: ['Initial logits', 'Uniform baseline', 'Output scale'],
    symbols:
      'pⱼ is the probability of class j; V is the class count; L is one example’s NLL under uniform predictions; ln is the natural logarithm.',
    why: 'An initial check can save thousands of steps that would otherwise compensate for poor initialization.',
    mistakes: [
      'Treating ln(V) as good final performance for a trained model.',
      'Zeroing all weight matrices instead of tuning their scale.',
    ],
    details:
      'ln(V) applies specifically to uniform predictions; a random network need not match it exactly. Small nonzero output weights preserve gradient flow to earlier layers while reducing excessive confidence.',
    summary:
      'Initial loss and logits diagnose the setup; they are more than the first point on a curve.',
    codeNotes: [
      'The example calculates a theoretical reference without training.',
      '27 is the makemore vocabulary with a dot; another vocabulary changes the result.',
    ],
    quiz: {
      prompt: 'Calculate ln(27) to within 0.001.',
      explanation: 'With p = 1/27, −ln(p) ≈ 3.295837.',
    },
    practice: {
      goal: 'Compare uniform baselines for two vocabularies.',
      prepare: 'Python 3 and math.',
      steps: [
        'Calculate math.log(27).',
        'Change V to 65.',
        'Compare without ranking the quality of trained models.',
      ],
      reason: 'The class count changes the initial loss scale.',
      result: 'Approximately 3.2958 and 4.1744.',
      check: 'Both equal −log(1/V).',
      hint: 'More possible answers means less uniform probability for each.',
      solution:
        'ln(65) ≈ 4.174387. These baselines describe different tasks and cannot directly rank models.',
    },
  },
  saturation: {
    title: 'Tanh saturation and weight scale',
    lead: 'Large positive or negative tanh inputs produce outputs near +1 or −1. In these regions, small input changes barely affect the output and gradients weaken.',
    technical:
      'The tanh derivative is 1 − h², where h is its output. Gradients shrink when |h| approaches 1. The lecture inspects activation histograms and saturation maps, then scales weights by the input count. With independent inputs and weights of balanced variance, dividing by √fan_in helps control spread. Gain accounts for the nonlinearity; the examined tanh setup uses 5/3.',
    concepts: ['Saturation', 'Fan-in', 'Gain'],
    symbols:
      'a is a preactivation; h = tanh(a); h′ is the derivative with respect to a; Wᵢⱼ is a weight; n_in is the neuron’s input count; g is gain; N(0,g²/n_in) is a normal distribution with zero mean and the stated variance.',
    why: 'Output loss can look reasonable even when saturated activations prevent early layers from learning.',
    mistakes: [
      'Monitoring only loss instead of inspecting internal behavior.',
      'Treating gain 5/3 as universal for every activation and architecture.',
    ],
    details:
      'Variance arguments depend on assumptions about inputs and independence. Initialization formulas are starting points; histograms and statistics remain useful. Without nonlinearities, a sequence of linear layers collapses to one affine transformation and gains no nonlinear expressiveness.',
    summary: 'Control preactivation scale: large tanh inputs suppress local gradients.',
    codeNotes: [
      'The example displays outputs and local derivatives separately.',
      'At a = 3, the output approaches 1 while its derivative is below 0.01.',
    ],
    quiz: {
      prompt: 'What happens to the local derivative of tanh(a) as |a| becomes very large?',
      options: ['It approaches 1', 'It grows without bound', 'It approaches 0'],
      explanation: 'tanh(a) approaches ±1, so 1 − tanh²(a) approaches zero.',
    },
    practice: {
      goal: 'Check the symmetry of the tanh derivative.',
      prepare: 'Python 3 and math.',
      steps: [
        'Add −3 and −1 to the example inputs.',
        'Compare tanh(a) for opposite inputs.',
        'Compare 1 − tanh²(a).',
      ],
      reason: 'Activation sign and sensitivity magnitude are different properties.',
      result: 'Outputs have opposite signs; derivatives match.',
      check: 'At ±1 both derivatives are about 0.419974.',
      hint: 'Squaring removes the sign of tanh.',
      solution:
        'tanh is odd, but 1 − tanh²(a) is even: saturation in either tail suppresses gradients.',
    },
  },
  batchnorm: {
    title: 'BatchNorm: training and inference',
    lead: 'BatchNorm controls activation statistics within a batch, then lets the network learn a new scale and offset. Generation uses accumulated statistics.',
    technical:
      'During training, means and variances are computed across examples separately for each feature. Trainable γ and β restore flexibility after normalization. Running statistics update without gradients and are used for evaluation. BatchNorm couples examples within a batch: one example’s output depends on its neighbors. A linear bias immediately before centering becomes redundant.',
    concepts: ['Batch statistics', 'γ and β', 'Running statistics'],
    symbols:
      'x is an activation; μ_B is the batch mean; v_B its feature variance; ε > 0 stabilizes division; x̂ is normalized activation; γ is learned scale; β is learned offset; y is the output.',
    why: 'Normalization makes deep networks less dependent on painstaking initial scale selection.',
    mistakes: [
      'Using a single example’s statistics during generation instead of eval mode.',
      'Treating running mean and variance as gradient-trained parameters.',
    ],
    details:
      'The compact example below divides variance by B. The course’s manual implementation also discusses the B−1 correction, examined in the next module. Do not mix conventions. ε prevents division by zero; it also means normalized variance need not be exactly 1.',
    summary:
      'BatchNorm has trainable parameters and separate statistical state, used differently in train and eval.',
    codeNotes: [
      'mean and var reduce axis 0 while preserving one row for broadcasting.',
      'unbiased=False explicitly uses divisor B; this checks the mechanism rather than copying the whole lecture layer.',
    ],
    quiz: {
      prompt: 'Match each BatchNorm quantity to its role.',
      items: ['γ and β', 'Current batch mean', 'Running statistics'],
      options: ['Calculated from current examples', 'Used during eval', 'Learned by gradients'],
      explanation:
        'γ and β are parameters; current statistics depend on the batch; accumulated statistics are used for evaluation.',
    },
    practice: {
      goal: 'Verify feature-wise centering.',
      prepare: 'Python 3 and PyTorch.',
      steps: [
        'Run the example.',
        'Print xhat.mean(0).',
        'Add 100 to all inputs and repeat normalization.',
      ],
      reason: 'Centering should remove a common input offset.',
      result: 'Means are near zero; normalized values stay the same.',
      check: 'Use torch.allclose for outputs and compare means with a zero vector.',
      hint: 'The mean also increases by 100.',
      solution: '(x+100) − (μ+100) = x−μ. A common offset does not change variance.',
    },
  },
  diagnostics: {
    title: 'Inspect activations, gradients, and updates',
    lead: 'Loss measures overall performance without explaining each layer’s behavior. Activation, gradient, and update statistics help locate the cause.',
    technical:
      'The lecture’s second part organizes the network into layer classes. It plots tanh activation and gradient distributions, then weight and gradient statistics. Update:data matters beyond gradient:data because the actual update includes the learning rate. Taking a logarithm of standard-deviation ratios makes different orders of magnitude easier to compare.',
    concepts: ['Histograms', 'Update:data ratio', 'Layer statistics'],
    symbols:
      'W denotes layer weights; ΔW is an update; η is the learning rate; ∇_W L is the gradient; std means standard deviation; r is the base-10 logarithm of relative update scale.',
    why: 'One layer may barely move while another receives oversized updates, even if overall loss decreases.',
    mistakes: [
      'Ignoring learning rate when comparing gradients with weights.',
      'Treating one ratio as a universal criterion for healthy training.',
    ],
    details:
      'The ratio is undefined when std(W) is zero, requiring separate inspection. BatchNorm stabilizes activations but does not remove weight scale’s effect on relative updates. Intermediate PyTorch tensors require retain_grad() to inspect their gradients after backward.',
    summary: 'Inspect what actually changes in each layer, not just a single loss scalar.',
    codeNotes: [
      'For ordinary SGD, std(ΔW) = lr·std(grad).',
      'The example’s ratio is 0.005 and its log10 is approximately −2.301.',
    ],
    quiz: {
      prompt:
        'Given std(W)=0.2, std(grad)=0.01, lr=0.1, calculate log10(update:data) within 0.002.',
      explanation: 'log10(0.1·0.01/0.2) = log10(0.005) ≈ −2.30103.',
    },
    practice: {
      goal: 'See how learning rate affects the diagnostic ratio.',
      prepare: 'Python 3 and math.',
      steps: [
        'Calculate r in the example.',
        'Multiply lr by 10, keeping other statistics fixed.',
        'Compare logarithmic ratios.',
      ],
      reason: 'Diagnostics must account for the actual update.',
      result: 'r increases by exactly 1, to approximately −1.301.',
      check: 'r_new − r_old ≈ 1.',
      hint: 'log10(10a) = 1 + log10(a).',
      solution:
        'The new ratio is 0.05; log10(0.05) ≈ −1.30103. This is an arithmetic check, not advice to increase lr.',
    },
  },
};
