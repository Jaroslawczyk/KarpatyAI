export default {
  derivatives: {
    title: 'Derivatives: how the output changes',
    lead: 'A derivative tells you how a function responds to a small change in its input. Learning starts by understanding how a parameter affects the result, then moving it in a useful direction.',
    technical:
      'The lecture begins with f(x) = 3x² − 4x + 5. Dividing f(x + h) − f(x) by h approximates the slope at x. With multiple inputs, change one input while keeping the others fixed: this gives a partial derivative. A gradient collects those partial derivatives. It describes a specific point, not the entire function at once.',
    concepts: ['Finite differences', 'Local slope', 'Partial derivatives'],
    symbols:
      'x is the input; f(x) is the function value; f′(x) is its derivative with respect to x. In the code, h is a small input increment.',
    why: 'Gradients indicate how to change loss without trying every possible value of every weight.',
    mistakes: [
      'Confusing a function value with its slope.',
      'Changing several inputs when checking one partial derivative.',
    ],
    details:
      'Finite differences help check understanding; they are not the training algorithm for a large network. Extremely small h can also hurt accuracy because of floating-point precision. Here we can differentiate symbolically; later micrograd will obtain derivatives through an operation graph.',
    summary:
      'A derivative is local sensitivity to an input. Training needs the sensitivities of loss to parameters.',
    codeNotes: [
      'f is the same parabola discussed in the lecture; this particular check at x = 2 is prepared for the textbook.',
      'The numerical slope approaches 6·2 − 4 = 8. Only the displayed result is rounded.',
    ],
    quiz: {
      prompt: 'What is the derivative of 3x² − 4x + 5 at x = 2?',
      explanation:
        'f′(x) = 6x − 4, so f′(2) = 8. The function value is 9, which answers a different question.',
    },
    practice: {
      goal: 'Compare numerical and analytical slopes at x = −1.',
      prepare: 'Python 3; no additional packages.',
      steps: [
        'Copy the example and set x to −1.',
        'Calculate 6*x − 4 separately.',
        'Try h = 0.1, 0.001, and 0.00001.',
      ],
      reason: 'Changing h shows the finite difference approaching the local slope.',
      result: 'The estimates approach −10.',
      check: 'With h = 0.00001, the error relative to −10 is below 0.001.',
      hint: 'Keep x fixed in f(x); only f(x + h) receives the shifted input.',
      solution: 'f′(−1) = 6·(−1) − 4 = −10. For this parabola, the finite difference is −10 + 3h.',
    },
  },
  graph: {
    title: 'Computation graphs and the chain rule',
    lead: 'A large expression can be split into small operations. To understand an early input’s effect on the result, work backwards through those operations.',
    technical:
      'Value stores a scalar, the operation’s parents, and the derivative of the final result with respect to that value. For L = (ab + c)d, first evaluate ab, then the sum, then the final product. Backpropagation begins with ∂L/∂L = 1. A product’s local derivative with respect to one input equals the other input; a sum’s local derivative is 1. The chain rule multiplies a local derivative by the incoming gradient.',
    concepts: ['Value', 'Computation graph', 'Chain rule'],
    symbols:
      'a, b, c, d are scalar inputs; L is the final value. ∂L/∂a and ∂L/∂c are partial derivatives of L with respect to the corresponding inputs.',
    why: 'Neural networks use these same operations. Understanding a small graph scales to graphs with millions of parameters.',
    mistakes: [
      'Using only the local derivative and forgetting the incoming gradient.',
      'Updating inputs before all gradients have been calculated.',
    ],
    details:
      'In the initial optimization preview, the lecturer increases L by moving along the gradient. Later, minimizing a loss requires the opposite direction. Calling an expression L does not by itself make it a training loss.',
    summary:
      'Forward computes values; backward propagates sensitivities from output to inputs through the chain rule.',
    codeNotes: [
      'e and f explicitly store intermediate graph nodes.',
      'da = b*d combines the local derivative of ab with the intermediate result’s influence on L.',
    ],
    quiz: {
      prompt: 'Restore the backward order for L = (ab + c)d.',
      options: ['The sum ab + c', 'The product ab', 'The final multiplication by d'],
      explanation: 'Start at L: final multiplication, then the sum, then ab.',
    },
    practice: {
      goal: 'Calculate the effect of c on L and check it by perturbing the input.',
      prepare: 'The code above and Python 3.',
      steps: [
        'Calculate L with the original inputs.',
        'Increase c by 0.001 and recompute L.',
        'Divide the change in L by 0.001 and compare with dc.',
      ],
      reason: 'This checks the path c → sum → L.',
      result: 'The derivative is −2: increasing c decreases L.',
      check: 'The numerical estimate differs from −2 by less than 0.000001.',
      hint: 'The entire sum is multiplied by d, so a change in c is scaled by d.',
      solution: 'L starts at −8 and becomes −8.002. The ratio (−8.002 + 8)/0.001 is −2.',
    },
  },
  backward: {
    title: 'Automating the backward pass',
    lead: 'Each operation knows its own local derivative. An automatic engine applies these rules in the correct order and adds contributions from every path.',
    technical:
      'A neuron sums weighted inputs and a bias, then applies tanh. The tanh derivative can be expressed using its output. A complete backward pass sorts the graph topologically and visits it in reverse. When a Value is used more than once, gradients must accumulate with +=. The lecture also decomposes tanh into exp and arithmetic and compares with PyTorch: operation boundaries may differ, but the derivative should agree.',
    concepts: ['tanh', 'Topological order', 'Gradient accumulation'],
    symbols:
      'x is the tanh input; a is the shared input of both branches in a + a; d/dx and d/da denote derivatives.',
    why: 'Tensor reuse is common. Losing a gradient contribution silently makes training incorrect.',
    mistakes: [
      'Assigning gradients with = instead of accumulating with += inside local backward rules.',
      'Visiting a shared node before all consumers have contributed their gradients.',
    ],
    details:
      'The final scalar’s initial gradient is 1. A visited set prevents repeated traversal of a shared subgraph, but does not remove the need to add contributions from different edges. PyTorch uses tensors and efficient kernels; the mathematical logic matches scalar micrograd.',
    summary:
      'Automatic differentiation combines local derivatives, a valid traversal order, and careful accumulation.',
    codeNotes: [
      'Both terms in b = a + a reference the same trainable scalar.',
      'The expected gradient 2 exposes overwriting: = would discard one contribution.',
    ],
    quiz: {
      prompt: 'An engine returns a.grad = 1 for b = a + a. Which repair is needed?',
      options: [
        'Replace the input with a*a',
        'Replace gradient assignment with accumulation +=',
        'Reduce the learning rate',
      ],
      explanation: 'Two paths each contribute 1. Both must add to the same a.grad.',
    },
    practice: {
      goal: 'Check accumulation for a*a + a.',
      prepare: 'Python 3 with PyTorch installed.',
      steps: [
        'Keep a = 3 and requires_grad=True.',
        'Change b to a*a + a.',
        'Call backward once and print a.grad.',
      ],
      reason: 'The shared node now participates in both a product and a sum.',
      result: 'The gradient is 7.',
      check: 'Compare with the analytical derivative 2a + 1 at a = 3.',
      hint: 'The product a*a has two paths from a, not one.',
      solution:
        'The product contributes a + a = 6; the separate term contributes 1. Thus a.grad = 7.',
    },
  },
  training: {
    title: 'From neurons to a training loop',
    lead: 'Training connects four actions: predict, measure error, compute gradients, and slightly change parameters. Repeating the cycle reduces error on the examples.',
    technical:
      'The lecture builds Neuron, Layer, and MLP, then trains on four examples with targets +1 and −1. The loss is the sum of squared errors. A parameters method gathers weights and biases. Each step requires a fresh forward pass, clearing old gradients, backward, and an update against the gradient. Architecture defines the expression; the loss defines what a good prediction means.',
    concepts: ['MLP', 'Loss function', 'Gradient descent'],
    symbols:
      'N is the number of examples; ŷᵢ is a prediction; yᵢ is its target; L is the sum of squared errors; θ denotes parameters; η is the learning rate; ∇θL is the loss gradient.',
    why: 'This cycle remains the foundation of subsequent models; networks, data, and losses change.',
    mistakes: [
      'Not clearing gradients between training steps.',
      'Assuming a larger step always converges faster.',
    ],
    details:
      'The educational engine stores individual numbers as Values. Modern libraries group operations into tensors for efficiency. The speed changes, but the training principle does not. A tiny dataset demonstrates optimization, not generalization to unseen data.',
    summary:
      'The network predicts, the loss sets the objective, backprop measures sensitivity, and the optimizer changes parameters.',
    codeNotes: [
      'A single parameter w replaces the MLP, making the whole loop verifiable without libraries.',
      'grad is recomputed each step; after 30 steps w approaches the target 3.',
    ],
    quiz: {
      prompt: 'Arrange one training step in the lecture’s order.',
      options: ['Backward', 'Forward and loss', 'Update parameters', 'Clear old gradients'],
      explanation:
        'After forward, clear previous gradients, run backward, then update parameters. Clearing before forward is also valid; this question follows the lecture’s loop.',
    },
    practice: {
      goal: 'Understand why the sign and size of an update matter.',
      prepare: 'Python 3 and the scalar example above.',
      steps: [
        'Run with lr = 0.1.',
        'Start over with lr = 1.1.',
        'Print the loss at each step and compare.',
      ],
      reason: 'Restarting ensures identical initial conditions.',
      result: 'At 0.1 the error shrinks; at 1.1 its magnitude grows while its sign alternates.',
      check: 'For this problem, the error is multiplied by 1 − 2·lr at each step.',
      hint: 'Write e = w − target and substitute the weight update.',
      solution:
        'e_next = (1 − 2lr)e. The multiplier is 0.8 for lr = 0.1 and −1.2 for lr = 1.1. In the second case the squared error increases.',
    },
  },
};
