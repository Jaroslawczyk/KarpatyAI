export default {
  context: {
    title: 'From sequences to training pairs',
    lead: 'To see more than one character, a model receives a context window. Each example connects several previous characters to the next one.',
    technical:
      'The lecture moves to an MLP inspired by Bengio et al. 2003. A count table grows exponentially with context length, and similar contexts cannot share knowledge. A network instead uses shared parameters and character vectors. A context initialized with K dots shifts as each new character, including the final dot, becomes a target. X stores windows and Y stores their correct continuations.',
    concepts: ['Context window', 'Shared parameters', 'X and Y'],
    symbols:
      'xₜ is the character at position t; K is context length; X is an integer index matrix; N is the number of training pairs; ℕ denotes nonnegative integer indices here.',
    why: 'Pair construction defines what the network learns. An off-by-one error changes the prediction task.',
    mistakes: [
      'Including the target character in its own context.',
      'Forgetting to teach the model to end a name.',
    ],
    details:
      'Initial dots allow predictions before real history is available. The original paper modeled words; makemore applies the idea to characters. This does not imply that these embeddings already have all the properties of large word embeddings.',
    summary:
      'Each window contains only the past; its target is exactly the next character, including the sequence ending.',
    codeNotes: [
      'Indices 1, 2, 1, 0 encode a short educational name and its ending.',
      'The context shifts only after the current pair is recorded.',
    ],
    quiz: {
      prompt:
        'How many training pairs come from a three-character name, including prediction of its ending?',
      explanation: 'Three character predictions plus one ending prediction make 4.',
    },
    practice: {
      goal: 'Build windows of length 2 for [1, 2, 0].',
      prepare: 'Python 3 and initial context [0, 0].',
      steps: [
        'Initialize the context with two zeros.',
        'Iterate through [1, 2, 0].',
        'Record context and target before each shift.',
      ],
      reason: 'Check that no target appears in its own input.',
      result: '([0,0],1), ([0,1],2), ([1,2],0).',
      check: 'Exactly three pairs, each with a two-element context.',
      hint: 'Print first, then context = context[1:] + [token].',
      solution:
        'After the first pair the context is [0,1]; after the second it is [1,2]. The third pair teaches termination after 1,2.',
    },
  },
  embeddings: {
    title: 'Embeddings and the hidden layer',
    lead: 'An embedding is a trainable table of vectors. A character index selects a row, and the MLP combines the context vectors to make a prediction.',
    technical:
      'C contains one vector per character. Indexing C[X] transforms shape (B,K) into (B,K,D). Concatenate context vectors into (B,KD), apply a linear layer and tanh, then an output linear layer producing V logits. The lecture examines torch.Tensor storage and view: reshaping may reuse memory and must not mix examples.',
    concepts: ['Embedding lookup', 'Reshape / view', 'Hidden representation'],
    symbols:
      'C is a V×D table; X holds B×K indices; E has shape B×K×D; h denotes hidden activations; W₁, b₁ and W₂, b₂ are layer weights and biases; z has shape B×V. B is batch size, K context length, D embedding size, and V vocabulary size.',
    why: 'A shared vector table transfers statistics across contexts rather than storing a separate row for every combination.',
    mistakes: [
      'Treating an embedding as a fixed dictionary of meanings: its values are learned.',
      'Mixing the batch and context dimensions during reshaping.',
    ],
    details:
      'Two-dimensional embeddings are easy to plot. Nearby characters reflect similar roles in this specific name-prediction task. Increasing D adds capacity, but a two-dimensional plot no longer shows the whole vector. view needs a compatible memory layout; reshape may copy when necessary.',
    summary:
      'Indices select vectors; concatenated vectors pass through a nonlinear network to produce logits.',
    codeNotes: [
      'C is filled with explicit numbers to check shapes, not trained embeddings.',
      'Shape (2,3,2) becomes (2,6): two examples remain separate rows.',
    ],
    quiz: {
      prompt: 'What is the shape of C[X] when X is (4,3) and C is (27,2)?',
      options: ['(4,6)', '(4,3,2)', '(27,3,2)'],
      explanation:
        'The vector dimension is appended to the index shape: (4,3,2). Flattening to (4,6) is a separate operation.',
    },
    practice: {
      goal: 'Track actual values through lookup and reshape.',
      prepare: 'Python 3, PyTorch, and the code above.',
      steps: [
        'Print C and X.',
        'Print E[0].',
        'Compare flat[0] with concatenated C[0], C[1], C[2].',
      ],
      reason: 'A correct shape alone does not guarantee correct value placement.',
      result: 'The first flattened row is [0,1,2,3,4,5].',
      check: 'flat[0].tolist() == [0,1,2,3,4,5].',
      hint: 'arange(10).view(5,2) places two consecutive numbers in each row.',
      solution:
        'C[0] = [0,1], C[1] = [2,3], C[2] = [4,5]. Reshaping preserves their order within the first example.',
    },
  },
  optimization: {
    title: 'Stable cross-entropy and minibatches',
    lead: 'Training needs numerically stable operations and a suitable step size. A minibatch makes each iteration fast, although its gradient is noisy.',
    technical:
      'Instead of separate exp, normalization, and log operations, the lecture uses F.cross_entropy: a fused operation that is more efficient and stable. A minibatch samples a small part of the training pairs. Learning-rate trials reveal steps that barely change loss and steps that destabilize training. After choosing an initial rate, it can be reduced as optimization proceeds.',
    concepts: ['Cross-entropy', 'Minibatch', 'Learning rate'],
    symbols:
      'B is minibatch size; pᵢ,yᵢ is the probability of the correct class yᵢ for example i; θₜ is the parameter vector at step t; η is the learning rate; ∇L_B is the gradient of mean minibatch loss.',
    why: 'Even the right architecture can fail when calculations overflow or updates are poorly scaled.',
    mistakes: [
      'Passing softmax(logits) to F.cross_entropy instead of logits.',
      'Judging model quality only on one memorized batch.',
    ],
    details:
      'Overfitting one small batch is a useful optimization check, not a generalization test. A learning-rate sweep changes weights along the way, so it is a diagnostic guide. Reinitialize parameters and training state before a final training run.',
    summary:
      'Stable loss, random minibatches, and a sensible rate matter more than blindly adding iterations.',
    codeNotes: [
      'Large logits [1000,1001] test numerical stability.',
      'Cross-entropy accepts an integer target [1] and returns a finite scalar.',
    ],
    quiz: {
      prompt: 'Repair F.cross_entropy(logits.softmax(1), y).',
      options: [
        'F.cross_entropy(logits, y)',
        'F.cross_entropy(y, logits)',
        'F.cross_entropy(logits.exp(), y)',
      ],
      explanation: 'The function performs stable normalization internally and expects raw logits.',
    },
    practice: {
      goal: 'Check that shifting large logits does not change loss.',
      prepare: 'Python 3 and PyTorch.',
      steps: [
        'Run the example.',
        'Replace [1000,1001] with [0,1].',
        'Compare losses and gradients.',
      ],
      reason: 'Cross-entropy depends on relative logits, not their common offset.',
      result: 'Loss ≈ 0.313262; gradients ≈ [0.268941, −0.268941].',
      check: 'Compare within 0.00001.',
      hint: 'The correct second class has probability e/(1+e).',
      solution: '−ln(e/(1+e)) = ln(1+e⁻¹). Gradients equal p − one_hot(y) and sum to zero.',
    },
  },
  evaluation: {
    title: 'Train, validation, test',
    lead: 'Lower training loss does not automatically mean a better model. Testing on new names separates useful patterns from memorization.',
    technical:
      'The lecture shuffles names and splits them into train, validation, and test before constructing windows separately. Train supplies gradients, validation guides hyperparameter choices, and test measures the final model. Similar train and validation losses can suggest undertraining or limited capacity; a large gap calls for attention to overfitting. Larger hidden layers, embeddings, and contexts are evaluated on validation data.',
    concepts: ['Data splits', 'Overfitting', 'Hyperparameters'],
    symbols:
      'L_split is the mean loss on a chosen split; N_split is its example count; xᵢ is a context; yᵢ is a target; pθ(yᵢ|xᵢ) is target probability under parameters θ; i indexes examples.',
    why: 'Without held-out evaluation, memorizing training examples can look like progress in language modeling.',
    mistakes: [
      'Creating overlapping windows first, then randomly splitting them into train and test.',
      'Repeatedly selecting hyperparameters using the test set.',
    ],
    details:
      'The lecture splits by words, approximately 80/10/10. Related windows from one name stay together. Loss values depend on vocabulary, dataset, split, and implementation; they are not universal quality thresholds. Generated names complement numerical evaluation rather than replacing it.',
    summary:
      'Learn on train, choose configurations on validation, and evaluate the final result on test.',
    codeNotes: [
      'Ten invented names provide a tiny 8/1/1 split example.',
      'Set assertions check overlap in this unique-name demonstration dataset.',
    ],
    quiz: {
      prompt: 'Match each split to its role.',
      items: ['Train', 'Validation', 'Test'],
      options: ['Final evaluation', 'Weight updates', 'Hyperparameter selection'],
      explanation:
        'Train learns weights, validation selects configurations, and test measures final performance.',
    },
    practice: {
      goal: 'Verify splits before building windows.',
      prepare: 'Python 3 and the example above.',
      steps: [
        'Run the split.',
        'Check that val and test also have no intersection.',
        'Build contexts separately within each split.',
      ],
      reason: 'Neighboring windows from a name must not leak from training into evaluation.',
      result: '8, 1, and 1 names; each split’s windows come only from its names.',
      check: 'Check all three pairwise intersections and the total name count.',
      hint: 'Use set(val) & set(test).',
      solution:
        'assert not (set(val) & set(test)); assert len(train)+len(val)+len(test) == 10. In real data, also check duplicates before splitting.',
    },
  },
};
