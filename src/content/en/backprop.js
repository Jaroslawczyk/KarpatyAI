export default {
  'tensor-gradients': {
    title: 'The chain rule for tensors',
    lead: 'Every number in a tensor has its own derivative. Matrix notation applies the same local rules to many values at once.',
    technical:
      'The lecture splits the MLP forward pass into atomic operations and manually differentiates intermediate tensors. For Y = XW + b, dX is dY multiplied by Wᵀ, and dW is Xᵀ multiplied by dY. The bias was repeated across the batch, so its contributions sum along that axis. The reverse of summation broadcasts a gradient; the reverse of broadcasting collects it.',
    concepts: ['Matrix derivatives', 'Undoing broadcasting', 'retain_grad'],
    symbols:
      'X has shape B×D; W is D×H; b is H; Y is B×H; dY means ∂L/∂Y, similarly for dX, dW, db; T denotes transpose; i indexes examples; B is batch size, D input features, and H output features.',
    why: 'Understanding shapes and accumulation helps debug derivatives without blindly trusting autograd.',
    mistakes: [
      'Not summing gradients along the broadcast axis of the bias.',
      'Checking dW’s shape without comparing its values.',
    ],
    details:
      'The walkthrough also covers log, exp, reciprocals, target indexing, the softmax stabilization maximum, tanh, and embedding lookup. Repeated embedding indices require accumulating into the same row. Compare manual values with autograd and maximum absolute error rather than always demanding bitwise identity.',
    summary: 'Backward must recover both derivative values and each input’s original shape.',
    codeNotes: [
      'dY specifies an incoming gradient of ones for two examples and three outputs.',
      'X.T @ dY accumulates examples’ contributions to the shared weight matrix.',
    ],
    quiz: {
      prompt: 'A bias b of shape (H,) is added to Y of shape (B,H). How do you recover db?',
      options: ['db = dY', 'db = dY.sum(0)', 'db = dY.sum(1)'],
      explanation: 'The bias was repeated across the batch axis, so backward sums that axis.',
    },
    practice: {
      goal: 'Verify a linear layer’s manual derivative.',
      prepare: 'Python 3 and PyTorch.',
      steps: [
        'Create W with shape (2,3) and b with shape (3,), both requiring gradients.',
        'Calculate Y = X@W + b and call Y.sum().backward().',
        'Compare W.grad and b.grad with the example’s dW and db.',
      ],
      reason: 'Summing all outputs produces the same all-ones dY as the manual calculation.',
      result: 'W.grad = [[4,4,4],[6,6,6]], b.grad = [2,2,2].',
      check: 'Both torch.allclose checks return True.',
      hint: 'Zero W and b work: these derivatives do not depend on their values here.',
      solution:
        'W = torch.zeros(2,3,requires_grad=True); b = torch.zeros(3,requires_grad=True). Then (X@W+b).sum().backward() reproduces the manual values.',
    },
  },
  bessel: {
    title: 'Variance and Bessel’s correction',
    lead: 'Similar variance formulas can use different divisors. A correct backward pass requires knowing exactly which formula the forward pass used.',
    technical:
      'This lecture’s manual BatchNorm divides summed squared centered values by n−1. The lecturer discusses the difference from dividing by n and library implementation conventions. The correction concerns estimating variance from a sample. The corresponding backward factor must match forward; changing only one divisor changes the result.',
    concepts: ['Variance', 'Bessel’s correction', 'Forward/backward consistency'],
    symbols:
      'xᵢ is one feature’s i-th value; n is the number of values; μ is their mean; v_c is variance with correction c; c=0 uses n, c=1 uses n−1; n must exceed c.',
    why: 'A small convention difference can explain systematic disagreement between a manual gradient and autograd.',
    mistakes: [
      'Using n in backward after n−1 in forward.',
      'Computing corrected variance for a single value without checking the divisor.',
    ],
    details:
      'After the correction discussion, the lecture continues through centering, the first weight matrix, and embeddings. Repeated context indices send several gradient contributions to the same embedding row. Educational examples should specify the variance convention explicitly.',
    summary: 'Fix the exact forward formula first, then derive and check its derivative.',
    codeNotes: [
      'For [1,3], the mean is 2 and squared deviations sum to 2.',
      'Dividing by 2 gives 1; dividing by 1 gives 2. unbiased explicitly chooses the convention.',
    ],
    quiz: {
      prompt: 'What is the variance of [1,3] using divisor n−1?',
      explanation: 'The mean is 2; ((1−2)² + (3−2)²)/(2−1) = 2.',
    },
    practice: {
      goal: 'Verify the relationship between two variance estimates.',
      prepare: 'Python 3 and PyTorch; x = [1,2,3].',
      steps: [
        'Find the mean and summed squared deviations.',
        'Calculate both variances with var.',
        'Check their ratio.',
      ],
      reason: 'Both estimates share the same numerator.',
      result: 'Variances are 2/3 and 1; their ratio is 3/2.',
      check: 'v₁ = v₀·n/(n−1).',
      hint: 'For n=3, the factor is 1.5.',
      solution: 'The mean is 2 and squared deviations sum to 2. v₀ = 2/3; v₁ = 2/2 = 1.',
    },
  },
  'crossentropy-grad': {
    title: 'A short cross-entropy backward pass',
    lead: 'The long chain of softmax and logarithms simplifies to one derivative: probability minus the indicator of the correct class.',
    technical:
      'After differentiating atomic operations, the lecture combines them analytically. For mean cross-entropy, the logit gradient is (p − one_hot(y))/B. The correct class receives a negative gradient when its probability is below 1; gradient descent raises its logit. Other classes receive positive gradients. Dividing by B corresponds specifically to averaging the losses.',
    concepts: ['Softmax derivative', 'p − y', 'Mean reduction'],
    symbols:
      'L is mean cross-entropy; zᵢⱼ is example i’s logit for class j; pᵢⱼ is its probability; yᵢ is the target class; 1[j=yᵢ] is a 0/1 indicator; B is example count.',
    why: 'The compact formula explains learning direction and checks the longer atomic backward pass.',
    mistakes: [
      'Forgetting division by B for a mean loss.',
      'Subtracting one from every class instead of only the target.',
    ],
    details:
      'Gradients in each row sum to zero, consistent with softmax invariance to a common shift. This is a useful check but does not prove the whole gradient correct. With reduction=sum, the B divisor is absent.',
    summary: 'For mean cross-entropy, dlogits = (probabilities − one_hot(target))/batch_size.',
    codeNotes: [
      'Zero logits produce a uniform three-class distribution.',
      'Subtract one only in the target class column, index 1.',
    ],
    quiz: {
      prompt:
        'For one example with three equally probable classes, what is the target logit’s gradient? Enter a decimal.',
      explanation: '1/3 − 1 = −2/3 ≈ −0.666667.',
    },
    practice: {
      goal: 'Compare the compact formula with autograd.',
      prepare: 'Python 3 and PyTorch; logits = [[0,1,−1]], target = [1].',
      steps: [
        'Enable requires_grad on logits.',
        'Compute F.cross_entropy and run backward.',
        'Independently calculate softmax minus one-hot and compare.',
      ],
      reason: 'This checks values, not just shapes.',
      result: 'Manual and automatic gradients agree within numerical precision.',
      check: 'torch.allclose(manual, logits.grad); the row sum is near zero.',
      hint: 'Use logits.detach().softmax(1) for the independent calculation.',
      solution:
        'manual = logits.detach().softmax(1); manual[0,1] -= 1. Since B=1, division does not change the values.',
    },
  },
  'batchnorm-grad': {
    title: 'BatchNorm backward and the whole network',
    lead: 'BatchNorm couples values within a batch. Its derivative includes corrections for shared mean and variance, beyond a local scaling factor.',
    technical:
      'The lecture’s third exercise compresses BatchNorm backward into a compact expression. The final exercise assembles manual gradients to train the MLP without loss.backward(). The formula here keeps c explicit for divisor n−c, allowing both variance conventions to be checked. Compare intermediate gradients with autograd before connecting the entire chain to localize discrepancies.',
    concepts: ['Coupled examples', 'Compact BatchNorm backward', 'Gradient checking'],
    symbols:
      'dxᵢ = ∂L/∂xᵢ; gᵢ = ∂L/∂yᵢ is the incoming gradient; ḡ is its mean; γ is BatchNorm scale; r is inverse standard deviation with ε; x̂ᵢ=(xᵢ−μ)r; v_c uses divisor n−c; n is batch size; j indexes the sum; c is 0 or 1.',
    why: 'Manual backprop builds skill in debugging tensor operations and new layers.',
    mistakes: [
      'Using independent-example derivatives and ignoring shared statistics.',
      'Treating one matching final loss as sufficient proof of correct gradients.',
    ],
    details:
      'Also, dγ = Σgᵢx̂ᵢ and dβ = Σgᵢ, computed feature by feature. The dx formula includes ε through r and does not assume normalized variance is exactly one. This lecture uses manual derivatives as an exercise; the author does not recommend replacing autograd in ordinary work.',
    summary:
      'Verify local derivatives, then the complete backward pass. Conventions and axes matter as much as algebra.',
    codeNotes: [
      'The example uses float64 and correction c = 1.',
      'γ = 1 and β = 0 keep the example short; the assertion compares manual dx with autograd.',
    ],
    quiz: {
      prompt: 'Where should you start when debugging a manual backward mismatch?',
      options: [
        'Compare intermediate gradients one node at a time',
        'Immediately enlarge the network',
        'Disable the checks and watch only the loss',
      ],
      explanation:
        'Local comparisons identify the first node where the manual rule disagrees with the reference.',
    },
    practice: {
      goal: 'Check the formula with the other variance convention.',
      prepare: 'Python 3, PyTorch, and the code above.',
      steps: [
        'Confirm that the original assertion passes.',
        'Change c to 0 and unbiased=True to unbiased=False together.',
        'Compare manual dx with autograd again.',
      ],
      reason: 'Both passes must use the same divisor.',
      result: 'The assertion still passes.',
      check: 'Print max(abs(dx − x.grad)); float64 error should be near floating-point precision.',
      hint: 'Changing only c in the manual expression is not enough.',
      solution:
        'With c=0 the correction denominator is n and forward uses v₀. A consistent change preserves gradient agreement.',
    },
  },
};
