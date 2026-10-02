export default {
  counts: {
    title: 'Bigrams: learning by counting',
    lead: 'A bigram model predicts the next character using only the previous one. It can learn without gradients: count the character pairs observed in names.',
    technical:
      'The makemore data is a list of names, one per line. Boundary markers are added at both ends. The lecture starts with separate markers, then replaces them with a single dot to obtain a 27-character vocabulary. In the count matrix N, rows represent previous characters and columns represent next characters. Normalizing each row turns counts into a conditional distribution.',
    concepts: ['Bigram', 'Count matrix', 'Boundary marker'],
    symbols:
      'Nᵢⱼ counts transitions from i to j; V is vocabulary size; k indexes the sum; P(j|i) is the probability of j following i. The formula assumes a nonzero row total.',
    why: 'Counts provide an interpretable baseline against which to compare neural networks.',
    mistakes: [
      'Forgetting transitions from the start marker and to the end marker.',
      'Normalizing the whole matrix by one sum rather than normalizing each row.',
    ],
    details:
      'One marker can indicate both boundaries: the generation procedure determines its role. This removes the unused row and column introduced by separate markers. The model still has no long history: the same last character always produces the same distribution.',
    summary:
      'Training a count-based bigram means collecting transitions and normalizing by previous character.',
    codeNotes: [
      'The example uses two invented names, not the lecture’s full dataset.',
      'zip(chars, chars[1:]) enumerates adjacent pairs including boundaries.',
    ],
    quiz: {
      prompt: 'How many a → n transitions occur in [ana, ann]?',
      explanation: 'Each name contains one a → n transition, for a total of 2.',
    },
    practice: {
      goal: 'Manually verify one row of the count matrix.',
      prepare: 'Python 3 and the built-in collections.Counter.',
      steps: [
        'Run the example.',
        'Print all pairs beginning with a.',
        'Divide their counts by that row’s total.',
      ],
      reason: 'This gives the next-character distribution specifically after a.',
      result: 'a → n has count 2 and a → dot has count 1; probabilities are 2/3 and 1/3.',
      check: 'These probabilities sum to 1.',
      hint: 'The final a in ana also has a next character: the dot.',
      solution:
        'The successors of a are n, dot, and n. Three transitions in total: N[a,n] = 2 and N[a,.] = 1.',
    },
  },
  sampling: {
    title: 'Sampling and broadcasting',
    lead: 'The model stores distributions, not finished names. Generation repeatedly samples the next character according to the probabilities in the current row.',
    technical:
      'Start at the dot index, sample the next index with multinomial, append its character, and continue until another dot. A seeded random generator makes experiments reproducible. For efficiency, normalize all rows in advance: sum(dim=1, keepdim=True) retains shape (V, 1), so every element is divided by its own row’s total.',
    concepts: ['Multinomial sampling', 'Seed', 'Broadcasting'],
    symbols:
      'xₜ is the character at step t; P(·|xₜ) is the next-character distribution; ∼ means sampling; i is the current character; j is the next; V is vocabulary size.',
    why: 'GPT retains the same autoregressive sampling procedure, while making the probability calculation more sophisticated.',
    mistakes: [
      'Always choosing the most probable character and calling it random sampling.',
      'Using a (V,) sum and accidentally dividing columns instead of rows.',
    ],
    details:
      'Broadcasting aligns dimensions from the right. Shapes (V, V) and (V, 1) support row normalization; a (V,) vector is repeated across rows. A mistake may run without an exception, which makes checking row sums essential.',
    summary:
      'Sample from dot to dot. Correct broadcasting preserves the meaning of conditional probabilities.',
    codeNotes: [
      'keepdim=True preserves a column dimension of size 1.',
      'The assertion checks every row sum; the seed controls random sampling.',
    ],
    quiz: {
      prompt: 'How should a square matrix N be normalized by row?',
      options: ['N / N.sum()', 'N / N.sum(1)', 'N / N.sum(1, keepdim=True)'],
      explanation: 'A (V, 1) sum divides each row by its own scalar total.',
    },
    practice: {
      goal: 'Check a distribution without trusting one random draw.',
      prepare: 'Python 3 and PyTorch.',
      steps: [
        'Compute probs from the example.',
        'Draw 10000 samples from probs[0] with replacement=True.',
        'Measure the fraction with index 1.',
      ],
      reason: 'Over many draws, empirical frequency should approach probability.',
      result: 'The fraction should be near 0.75, not necessarily exactly 0.75.',
      check:
        'Check that the difference is below 0.03; this is a useful diagnostic threshold, not a mathematical guarantee.',
      hint: 'Use (samples == 1).float().mean().',
      solution:
        'samples = torch.multinomial(probs[0], 10000, replacement=True, generator=g). The theoretical probability is 3/(1+3) = 0.75.',
    },
  },
  likelihood: {
    title: 'Measuring quality: NLL and smoothing',
    lead: 'A good model assigns high probability to observed data. The negative logarithm turns that idea into an error to minimize.',
    technical:
      'A sequence probability is a product of conditional transition probabilities. Taking logs turns products into sums; negation produces a loss to minimize. Dividing by the number of transitions gives mean NLL. A zero pair count means zero probability and infinite NLL. Adding a positive pseudocount α before normalization prevents zero probabilities.',
    concepts: ['Log likelihood', 'Mean NLL', 'Smoothing'],
    symbols:
      'L is mean NLL; N is the number of evaluated transitions; pₜ is the probability of observed transition t; ln is the natural logarithm; Nᵢⱼ is a count; α is a pseudocount; V is vocabulary size; k indexes characters.',
    why: 'NLL compares models numerically rather than relying on a few plausible-looking generated names.',
    mistakes: [
      'Comparing summed losses on datasets of different lengths.',
      'Treating an unseen pair as proven impossible.',
    ],
    details:
      'Stronger smoothing moves rows toward uniform distributions. It trades reduced confidence in rare observations for distortion of frequent ones. Weight regularization in the neural version also encourages more uniform probabilities, but this is a similarity of effects, not an exact equivalence of algorithms.',
    summary:
      'NLL decreases when observed transitions receive higher probability; smoothing protects against zeros.',
    codeNotes: [
      'math.log uses natural logarithms; loss is measured in nats.',
      'The probabilities 0.5 and 0.25 are a separate educational example.',
    ],
    quiz: {
      prompt: 'What is the NLL of one transition with probability 0.5? Round to 0.001.',
      explanation: '−ln(0.5) ≈ 0.693147.',
    },
    practice: {
      goal: 'See how a pseudocount rescues an unseen transition.',
      prepare: 'Python 3 and a count row [0, 3, 1].',
      steps: [
        'Normalize the original row.',
        'Add α = 1 to all three counts.',
        'Compute the first character’s NLL after smoothing.',
      ],
      reason: 'α must affect the numerator and every element summed in the denominator.',
      result: 'The distribution is [1/7, 4/7, 2/7]; the first character’s NLL is ln(7).',
      check: 'Probabilities sum to 1; NLL ≈ 1.94591 is finite.',
      hint: 'The new total is 4 + 3·1.',
      solution:
        'P = [1,4,2]/7. For the first character, −ln(1/7) = ln(7). At α = 0 its NLL is infinite.',
    },
  },
  'neural-bigram': {
    title: 'The same bigram, as a neural network',
    lead: 'Instead of counting transitions, we can train a weight matrix. The input is still one character, so the model remains a bigram.',
    technical:
      'Encode the index as a one-hot vector x, multiply by W, and obtain logits. Softmax converts logits to probabilities, cross-entropy scores the correct next characters, and backward gives weight gradients. Multiplying a one-hot vector by W exactly selects a row of W. The parameterization changes, but the context does not; expressiveness is still limited to one previous character.',
    concepts: ['One-hot', 'Logits', 'Softmax'],
    symbols:
      'x is a one-hot row of length V; W is a V×V matrix; z denotes logits; pⱼ is the probability of class j; m is the maximum logit; k indexes the sum; e is the base of natural logarithms.',
    why: 'The neural formulation lets us extend the architecture while keeping the loss and general training loop.',
    mistakes: [
      'Assuming a linear layer automatically uses more context.',
      'Treating a character’s integer index as a quantitative feature.',
    ],
    details:
      'The lecture discusses a squared-weight penalty: it pulls logits toward zero and softmax toward uniform probabilities. Subtracting the largest logit does not change softmax; numerical stability is explored in the next lecture. The formula already includes this shift to avoid overflow.',
    summary: 'One-hot + matrix + softmax defines a trainable table of conditional probabilities.',
    codeNotes: [
      'The assertion verifies exact equality between one_hot @ W and W[ids].',
      'softmax(dim=1) normalizes each example separately.',
    ],
    quiz: {
      prompt: 'What changes when moving from counts to one-hot + W?',
      options: [
        'How parameters are obtained; context remains one character',
        'The model remembers the entire name',
        'Softmax removes the need to train weights',
      ],
      explanation:
        'Training now uses gradients, but the input still contains only the previous character.',
    },
    practice: {
      goal: 'Verify that softmax is invariant to a common shift.',
      prepare: 'Python 3, PyTorch, and W from the example.',
      steps: [
        'Compute p = W.softmax(1).',
        'Compute q = (W + 100).softmax(1).',
        'Compare using torch.allclose.',
      ],
      reason: 'A common shift cancels between numerator and denominator.',
      result: 'The distributions agree within floating-point precision.',
      check: 'torch.allclose(p, q) returns True.',
      hint: 'Do not add different shifts to different classes.',
      solution: 'exp(zⱼ + c)/Σexp(zₖ + c) = exp(c)exp(zⱼ)/(exp(c)Σexp(zₖ)) = softmax(z)ⱼ.',
    },
  },
};
